# SEO Report Redesign Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Replace the current dashboard-mirror report page with a Claude-generated professional SEO audit document that auto-generates on first load, stores in Supabase, and is exportable as PDF.

**Architecture:** A new `seo_reports` table stores generated reports. On page load, the server checks for an existing report — if none, a `ReportGenerator` client component auto-calls the `generateSeoReport` server action which sends full audit data to Claude and saves the HTML report. The report page renders the stored HTML with a Regenerate button.

**Tech Stack:** Next.js 16 App Router, `@anthropic-ai/sdk` (claude-opus-4-6), Supabase admin client, Tailwind CSS, `@media print`

---

### Task 1: Create `seo_reports` table in Supabase

**Files:**
- No code files — manual SQL step

**Step 1: Run in Supabase SQL Editor**

```sql
CREATE TABLE IF NOT EXISTS seo_reports (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  generated_at timestamptz DEFAULT now() NOT NULL,
  report_html text NOT NULL,
  stats_snapshot jsonb NOT NULL
);
```

**Step 2: Verify**

```sql
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'seo_reports';
```

Expected: rows for `id`, `generated_at`, `report_html`, `stats_snapshot`

---

### Task 2: Create `lib/actions/seo-report.ts`

**Files:**
- Create: `lib/actions/seo-report.ts`

**Step 1: Create the file**

```ts
'use server'

import { anthropic } from '@/lib/anthropic'
import { createAdminClient } from '@/lib/supabase/admin'
import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

type AuditRow = {
  page_url: string
  status_code: number
  indexed: boolean
  canonical_url: string | null
  meta_title: string | null
  meta_description: string | null
  issues: string[]
  ai_suggestions: {
    suggested_title: string
    suggested_description: string
    fixes: { issue: string; fix: string; priority: string }[]
  } | null
}

function buildAuditSummary(pages: AuditRow[]) {
  const total = pages.length
  const withIssues = pages.filter((p) => p.issues?.length > 0).length
  const indexed = pages.filter((p) => p.indexed).length
  const notIndexed = pages.filter((p) => !p.indexed).length
  const totalIssues = pages.reduce((sum, p) => sum + (p.issues?.length ?? 0), 0)
  const healthScore = Math.max(0, Math.round(100 - (totalIssues / Math.max(total, 1)) * 20))
  return { total, withIssues, indexed, notIndexed, totalIssues, healthScore }
}

function buildPrompt(pages: AuditRow[]): string {
  const summary = buildAuditSummary(pages)

  const pageData = pages.map((p) => {
    const path = p.page_url.replace(/^https?:\/\/[^/]+/, '') || '/'
    const lines = [
      `URL: ${path}`,
      `Status: ${p.status_code || 'ERR'} | Indexed: ${p.indexed ? 'yes' : 'no'} | Canonical: ${p.canonical_url ? 'yes' : 'no'}`,
      `Title: ${p.meta_title ?? 'MISSING'}`,
      `Description: ${p.meta_description ?? 'MISSING'}`,
    ]
    if (p.issues?.length) {
      lines.push(`Issues: ${p.issues.join(' | ')}`)
    } else {
      lines.push('Issues: none')
    }
    if (p.ai_suggestions) {
      lines.push(`AI suggested title: ${p.ai_suggestions.suggested_title}`)
      lines.push(`AI suggested description: ${p.ai_suggestions.suggested_description}`)
    }
    return lines.join('\n')
  }).join('\n\n')

  return `You are a senior SEO consultant producing a professional audit report for a client website (Xyren.me — a web design and digital marketing agency for small businesses).

AUDIT DATA:
Total pages audited: ${summary.total}
Pages with issues: ${summary.withIssues}
Indexed: ${summary.indexed} | Not indexed: ${summary.notIndexed}
Total issues found: ${summary.totalIssues}

PAGE-BY-PAGE DATA:
${pageData}

Write a complete SEO audit report as an HTML fragment (no <html>, <head>, or <body> tags — just the inner content). Use inline Tailwind-compatible class names where helpful, but rely primarily on semantic HTML.

The report must include these sections in order:

1. A summary bar showing: Health Score (${summary.healthScore}/100), Pages Audited (${summary.total}), Issues Found (${summary.totalIssues}), Pages Not Indexed (${summary.notIndexed})

2. Executive Summary — 2–3 paragraphs of narrative: overall health assessment, the most impactful problems, and the biggest quick wins. Be specific about pages and issues, not generic.

3. Critical Issues — issues that most damage search rankings, ranked by impact (most pages affected × severity). For each: a clear heading naming the issue, a list of affected page paths, a brief explanation of why it hurts SEO, and numbered fix steps.

4. Warnings — medium-priority issues (same format). If none, say so briefly.

5. Passing Checks — a brief list of what is working well across the site.

6. Recommended Next Steps — numbered list of the top 5 actions to take, in priority order, with an estimated impact label (High / Medium / Low).

Use this HTML structure for sections:
- Section heading: <h2 class="report-section-heading">
- Issue heading: <h3 class="report-issue-heading">
- Affected pages list: <ul class="report-page-list">
- Fix steps: <ol class="report-fix-steps">
- Critical badge: <span class="report-badge-critical">Critical</span>
- Warning badge: <span class="report-badge-warning">Warning</span>
- Passing badge: <span class="report-badge-pass">Pass</span>

Return ONLY the HTML fragment. No markdown fences, no explanation outside the HTML.`
}

export async function generateSeoReport(): Promise<void> {
  const authClient = await createClient()
  const { data: { user } } = await authClient.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  const supabase = createAdminClient()

  const { data: rows, error: fetchError } = await (supabase as any)
    .from('seo_audit_log')
    .select('page_url, status_code, indexed, canonical_url, meta_title, meta_description, issues, ai_suggestions')

  if (fetchError) throw new Error(`Failed to fetch audit data: ${fetchError.message}`)

  const pages: AuditRow[] = rows ?? []

  if (pages.length === 0) {
    throw new Error('No audit data found. Run an SEO audit first.')
  }

  const prompt = buildPrompt(pages)

  const response = await anthropic.messages.create({
    model: 'claude-opus-4-6',
    max_tokens: 4096,
    system: 'You are a senior SEO consultant. You write clear, professional audit reports in HTML. Return only the HTML fragment requested — no explanations, no markdown fences.',
    messages: [{ role: 'user', content: prompt }],
  })

  const reportHtml = response.content[0].type === 'text' ? response.content[0].text : ''
  if (!reportHtml.trim()) throw new Error('Claude returned an empty report')

  const summary = buildAuditSummary(pages)

  const { error: insertError } = await (supabase as any)
    .from('seo_reports')
    .insert({
      report_html: reportHtml,
      stats_snapshot: {
        total_pages: summary.total,
        pages_with_issues: summary.withIssues,
        indexed: summary.indexed,
        not_indexed: summary.notIndexed,
        health_score: summary.healthScore,
        audit_date: new Date().toISOString(),
      },
    })

  if (insertError) throw new Error(`Failed to save report: ${insertError.message}`)

  revalidatePath('/dashboard/seo/report')
}
```

**Step 2: Verify TypeScript**

```bash
source ~/.nvm/nvm.sh && nvm use 20 && npx tsc --noEmit 2>&1 | grep -v "node_modules\|\.next"
```

Expected: no errors from `lib/actions/seo-report.ts`

**Step 3: Commit**

```bash
git add lib/actions/seo-report.ts
git commit -m "feat: add generateSeoReport server action"
```

---

### Task 3: Create `components/dashboard/seo-report-generator.tsx`

**Files:**
- Create: `components/dashboard/seo-report-generator.tsx`

**Step 1: Create the file**

```tsx
'use client'

import { useEffect, useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { generateSeoReport } from '@/lib/actions/seo-report'
import { Loader2, RefreshCw, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface Props {
  autoGenerate?: boolean
}

export function ReportGenerator({ autoGenerate = false }: Props) {
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()
  const router = useRouter()

  function generate() {
    setError(null)
    startTransition(async () => {
      try {
        await generateSeoReport()
        router.refresh()
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Generation failed')
      }
    })
  }

  useEffect(() => {
    if (autoGenerate) generate()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  if (isPending) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
        <Loader2 className="h-10 w-10 animate-spin text-cyan-400" />
        <p className="text-lg font-medium">Generating your SEO audit report...</p>
        <p className="text-sm text-muted-foreground">Claude is analyzing your site data. This takes about 30 seconds.</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
        <AlertCircle className="h-10 w-10 text-red-400" />
        <p className="text-lg font-medium">Report generation failed</p>
        <p className="text-sm text-muted-foreground max-w-sm text-center">{error}</p>
        <Button onClick={generate} variant="outline" className="gap-2">
          <RefreshCw className="h-4 w-4" />
          Try Again
        </Button>
      </div>
    )
  }

  // Shown as the Regenerate button when a report already exists
  return (
    <Button onClick={generate} size="sm" variant="outline" className="gap-2 print:hidden">
      <RefreshCw className="h-4 w-4" />
      Regenerate Report
    </Button>
  )
}
```

**Step 2: Verify TypeScript**

```bash
npx tsc --noEmit 2>&1 | grep -v "node_modules\|\.next"
```

Expected: no errors

**Step 3: Commit**

```bash
git add components/dashboard/seo-report-generator.tsx
git commit -m "feat: add ReportGenerator client component"
```

---

### Task 4: Replace `app/dashboard/seo/report/page.tsx`

**Files:**
- Modify: `app/dashboard/seo/report/page.tsx` (full replacement)

**Step 1: Replace the entire file**

```tsx
import { createClient } from '@/lib/supabase/server'
import { PrintTrigger, PrintButton } from '@/components/dashboard/seo-report-print'
import { ReportGenerator } from '@/components/dashboard/seo-report-generator'

type StatsSnapshot = {
  total_pages: number
  pages_with_issues: number
  indexed: number
  not_indexed: number
  health_score: number
  audit_date: string
}

type SeoReport = {
  id: string
  generated_at: string
  report_html: string
  stats_snapshot: StatsSnapshot
}

export default async function SeoReportPage({
  searchParams,
}: {
  searchParams: Promise<{ print?: string }>
}) {
  const supabase = await createClient()
  const { data } = await (supabase as any)
    .from('seo_reports')
    .select('id, generated_at, report_html, stats_snapshot')
    .order('generated_at', { ascending: false })
    .limit(1)
    .single()

  const report = data as SeoReport | null
  const params = await searchParams
  const autoPrint = params.print === '1'

  // No report exists — auto-generate
  if (!report) {
    return (
      <div className="min-h-screen bg-white text-gray-900">
        <ReportGenerator autoGenerate />
      </div>
    )
  }

  const generatedAt = new Date(report.generated_at).toLocaleDateString('en-US', {
    month: 'long', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit',
  })

  const score = report.stats_snapshot.health_score
  const scoreColor = score >= 90 ? '#16a34a' : score >= 75 ? '#2563eb' : score >= 50 ? '#d97706' : '#dc2626'
  const scoreLabel = score >= 90 ? 'Excellent' : score >= 75 ? 'Good' : score >= 50 ? 'Needs Attention' : 'Critical'

  return (
    <>
      {autoPrint && <PrintTrigger />}
      <div className="seo-report min-h-screen bg-white text-gray-900">

        {/* Page header — hidden on print */}
        <div className="print:hidden bg-gray-50 border-b border-gray-200 px-8 py-4 flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-500">SEO Audit Report · Generated {generatedAt}</p>
          </div>
          <div className="flex items-center gap-3">
            <ReportGenerator />
            <PrintButton />
          </div>
        </div>

        <div className="max-w-3xl mx-auto px-8 py-10">

          {/* Cover */}
          <div className="mb-10 pb-8 border-b border-gray-200">
            <p className="text-sm font-semibold uppercase tracking-widest text-gray-400 mb-2">SEO Audit Report</p>
            <h1 className="text-4xl font-bold text-gray-900 mb-1">Xyren.me</h1>
            <p className="text-gray-500">{generatedAt}</p>

            {/* Health score */}
            <div className="mt-6 inline-flex items-center gap-4 border border-gray-200 rounded-xl px-6 py-4">
              <div>
                <p className="text-5xl font-extrabold" style={{ color: scoreColor }}>{score}</p>
                <p className="text-xs text-gray-400 mt-0.5">out of 100</p>
              </div>
              <div>
                <p className="text-lg font-semibold text-gray-900">{scoreLabel}</p>
                <p className="text-sm text-gray-500">Overall SEO Health</p>
              </div>
            </div>
          </div>

          {/* Claude-generated report content */}
          <div
            className="report-content"
            dangerouslySetInnerHTML={{ __html: report.report_html }}
          />

        </div>

        <style>{`
          /* Report typography */
          .report-content { font-size: 0.9rem; line-height: 1.7; color: #1f2937; }
          .report-content h2.report-section-heading {
            font-size: 1.25rem; font-weight: 700; color: #111827;
            margin: 2.5rem 0 1rem; padding-bottom: 0.5rem;
            border-bottom: 2px solid #e5e7eb;
          }
          .report-content h3.report-issue-heading {
            font-size: 1rem; font-weight: 600; color: #1f2937;
            margin: 1.5rem 0 0.5rem;
          }
          .report-content p { margin: 0.75rem 0; }
          .report-content ul.report-page-list {
            list-style: none; padding: 0; margin: 0.5rem 0;
            display: flex; flex-wrap: wrap; gap: 0.375rem;
          }
          .report-content ul.report-page-list li {
            font-family: monospace; font-size: 0.75rem;
            background: #f3f4f6; border: 1px solid #e5e7eb;
            border-radius: 4px; padding: 0.125rem 0.5rem; color: #374151;
          }
          .report-content ol.report-fix-steps {
            padding-left: 1.5rem; margin: 0.5rem 0;
          }
          .report-content ol.report-fix-steps li { margin: 0.375rem 0; }
          .report-content .report-badge-critical {
            display: inline-block; font-size: 0.7rem; font-weight: 700;
            text-transform: uppercase; letter-spacing: 0.05em;
            background: #fee2e2; color: #b91c1c;
            border: 1px solid #fecaca; border-radius: 4px;
            padding: 0.125rem 0.5rem; margin-right: 0.5rem;
          }
          .report-content .report-badge-warning {
            display: inline-block; font-size: 0.7rem; font-weight: 700;
            text-transform: uppercase; letter-spacing: 0.05em;
            background: #fef3c7; color: #b45309;
            border: 1px solid #fde68a; border-radius: 4px;
            padding: 0.125rem 0.5rem; margin-right: 0.5rem;
          }
          .report-content .report-badge-pass {
            display: inline-block; font-size: 0.7rem; font-weight: 700;
            text-transform: uppercase; letter-spacing: 0.05em;
            background: #dcfce7; color: #15803d;
            border: 1px solid #bbf7d0; border-radius: 4px;
            padding: 0.125rem 0.5rem; margin-right: 0.5rem;
          }

          /* Print */
          @media print {
            @page { margin: 2cm; }
            .print\\:hidden { display: none !important; }
            .seo-report { background: white !important; }
            h2.report-section-heading { break-before: auto; }
            ul.report-page-list { break-inside: avoid; }
          }
        `}</style>
      </div>
    </>
  )
}
```

**Step 2: Verify TypeScript**

```bash
npx tsc --noEmit 2>&1 | grep -v "node_modules\|\.next"
```

Expected: no errors

**Step 3: Verify in browser**

1. Go to `http://localhost:8000/dashboard/seo/report`
2. If no report exists: loading spinner appears, generation starts automatically
3. After ~30s: page refreshes and shows the full report with cover, health score, and Claude-generated content
4. "Regenerate Report" and "Print / Save PDF" buttons visible in header
5. Go to `http://localhost:8000/dashboard/seo/report?print=1` — print dialog triggers

**Step 4: Commit**

```bash
git add app/dashboard/seo/report/page.tsx
git commit -m "feat: replace SEO report page with Claude-generated audit document"
```
