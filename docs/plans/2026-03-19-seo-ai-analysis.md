# SEO AI Analysis + PDF Export Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add per-page Claude-powered SEO fix suggestions and a print-to-PDF report to the SEO audit dashboard.

**Architecture:** A server action calls Claude with each page's audit data and saves structured suggestions to a new `ai_suggestions` jsonb column on `seo_audit_log`. A client component renders the suggestions inline on each page card with an "Analyze" button. A separate print-optimised route at `/dashboard/seo/report` auto-triggers `window.print()`.

**Tech Stack:** Next.js 16 App Router, `@anthropic-ai/sdk`, Supabase (admin client), Tailwind CSS, `@media print` CSS

---

### Task 1: Add `ai_suggestions` column to Supabase

**Files:**
- No code files — manual SQL step

**Step 1: Run migration in Supabase SQL editor**

Go to your Supabase project → SQL Editor → New query. Run:

```sql
ALTER TABLE seo_audit_log ADD COLUMN IF NOT EXISTS ai_suggestions jsonb;
```

**Step 2: Verify**

Run:
```sql
SELECT column_name, data_type FROM information_schema.columns
WHERE table_name = 'seo_audit_log' AND column_name = 'ai_suggestions';
```
Expected: one row returned with `data_type = jsonb`

---

### Task 2: Create the SEO AI server action

**Files:**
- Create: `lib/actions/seo-ai.ts`

**Step 1: Create the file**

```ts
'use server'

import Anthropic from '@anthropic-ai/sdk'
import { createAdminClient } from '@/lib/supabase/admin'
import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

export interface SeoSuggestion {
  suggested_title: string
  suggested_description: string
  fixes: {
    issue: string
    fix: string
    priority: 'high' | 'medium' | 'low'
  }[]
}

export async function analyzePageSeo(pageId: string): Promise<void> {
  // Auth check
  const authClient = await createClient()
  const { data: { user } } = await authClient.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  const supabase = createAdminClient()

  // Fetch the page row
  const { data: page, error } = await (supabase as any)
    .from('seo_audit_log')
    .select('id, page_url, meta_title, meta_description, issues')
    .eq('id', pageId)
    .single()

  if (error || !page) throw new Error('Page not found')

  // Call Claude
  const response = await anthropic.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 1024,
    messages: [
      {
        role: 'user',
        content: `You are an SEO expert. Analyze this page and return specific, actionable fixes.

URL: ${page.page_url}
Current meta title: ${page.meta_title ?? 'MISSING'}
Current meta description: ${page.meta_description ?? 'MISSING'}
Issues detected: ${(page.issues as string[]).join(', ')}

Return ONLY valid JSON (no markdown fences):
{
  "suggested_title": "rewritten meta title, 50-70 chars, includes primary keyword",
  "suggested_description": "rewritten meta description, 120-155 chars, compelling and includes keyword",
  "fixes": [
    {
      "issue": "exact issue string from the issues list above",
      "fix": "specific instruction for fixing this issue — what to change and how",
      "priority": "high"
    }
  ]
}

Priority rules: HTTP errors and noindex = high. Missing title/description = high. Too short/long = medium. Missing canonical or OG = medium.`,
      },
    ],
  })

  const text = response.content[0].type === 'text' ? response.content[0].text : ''
  let suggestions: SeoSuggestion
  try {
    suggestions = JSON.parse(text) as SeoSuggestion
  } catch {
    throw new Error(`Claude returned non-JSON: ${text.slice(0, 200)}`)
  }

  // Save to Supabase
  await (supabase as any)
    .from('seo_audit_log')
    .update({ ai_suggestions: suggestions })
    .eq('id', pageId)

  revalidatePath('/dashboard/seo')
}
```

**Step 2: Verify TypeScript compiles**

```bash
source ~/.nvm/nvm.sh && nvm use 20 && npx tsc --noEmit 2>&1 | grep -v "node_modules\|\.next"
```
Expected: no errors from `lib/actions/seo-ai.ts`

**Step 3: Commit**

```bash
git add lib/actions/seo-ai.ts
git commit -m "feat: add analyzePageSeo server action using Claude"
```

---

### Task 3: Create the SeoSuggestions client component

**Files:**
- Create: `components/dashboard/seo-suggestions.tsx`

**Step 1: Create the file**

```tsx
'use client'

import { useState, useTransition } from 'react'
import { analyzePageSeo, SeoSuggestion } from '@/lib/actions/seo-ai'
import { Button } from '@/components/ui/button'
import { Sparkles, Loader2, ChevronDown, ChevronUp } from 'lucide-react'

const priorityStyles = {
  high: 'bg-red-500/10 text-red-400 border border-red-500/20',
  medium: 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20',
  low: 'bg-blue-500/10 text-blue-400 border border-blue-500/20',
}

interface Props {
  pageId: string
  initialSuggestions: SeoSuggestion | null
}

export function SeoSuggestions({ pageId, initialSuggestions }: Props) {
  const [suggestions, setSuggestions] = useState<SeoSuggestion | null>(initialSuggestions)
  const [expanded, setExpanded] = useState(!!initialSuggestions)
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)

  function handleAnalyze() {
    setError(null)
    startTransition(async () => {
      try {
        await analyzePageSeo(pageId)
        // After revalidation, we need to refetch — for now re-trigger causes server rerender
        // which updates initialSuggestions on next render. Force a page refresh instead:
        window.location.reload()
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Analysis failed')
      }
    })
  }

  if (!suggestions) {
    return (
      <div className="mt-3 flex items-center gap-2">
        <Button
          size="sm"
          variant="outline"
          className="h-7 text-xs gap-1.5 border-violet-500/30 text-violet-400 hover:bg-violet-500/10"
          onClick={handleAnalyze}
          disabled={isPending}
        >
          {isPending ? (
            <Loader2 className="h-3 w-3 animate-spin" />
          ) : (
            <Sparkles className="h-3 w-3" />
          )}
          {isPending ? 'Analyzing...' : 'Analyze with AI'}
        </Button>
        {error && <p className="text-xs text-red-400">{error}</p>}
      </div>
    )
  }

  return (
    <div className="mt-3 border-t border-border pt-3">
      <button
        className="flex items-center gap-1.5 text-xs font-semibold text-violet-400 hover:text-violet-300 transition-colors mb-2"
        onClick={() => setExpanded((e) => !e)}
      >
        <Sparkles className="h-3 w-3" />
        AI Suggestions
        {expanded ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
      </button>

      {expanded && (
        <div className="space-y-3">
          {/* Suggested copy */}
          <div className="space-y-2">
            <div className="rounded-md bg-secondary/50 p-2">
              <p className="text-xs text-muted-foreground mb-0.5">Suggested title</p>
              <p className="text-xs font-medium text-foreground">{suggestions.suggested_title}</p>
            </div>
            <div className="rounded-md bg-secondary/50 p-2">
              <p className="text-xs text-muted-foreground mb-0.5">Suggested description</p>
              <p className="text-xs text-foreground">{suggestions.suggested_description}</p>
            </div>
          </div>

          {/* Fix list */}
          <div className="space-y-1.5">
            {suggestions.fixes.map((fix, i) => (
              <div key={i} className="rounded-md border border-border p-2">
                <div className="flex items-center gap-2 mb-1">
                  <span className={`text-xs px-1.5 py-0.5 rounded font-medium ${priorityStyles[fix.priority]}`}>
                    {fix.priority}
                  </span>
                  <span className="text-xs text-muted-foreground truncate">{fix.issue}</span>
                </div>
                <p className="text-xs text-foreground">{fix.fix}</p>
              </div>
            ))}
          </div>

          {/* Re-analyze */}
          <Button
            size="sm"
            variant="ghost"
            className="h-6 text-xs text-muted-foreground gap-1"
            onClick={handleAnalyze}
            disabled={isPending}
          >
            {isPending ? <Loader2 className="h-3 w-3 animate-spin" /> : <Sparkles className="h-3 w-3" />}
            Re-analyze
          </Button>
        </div>
      )}
    </div>
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
git add components/dashboard/seo-suggestions.tsx
git commit -m "feat: add SeoSuggestions client component"
```

---

### Task 4: Create the print-trigger client component

**Files:**
- Create: `components/dashboard/seo-report-print.tsx`

**Step 1: Create the file**

```tsx
'use client'

import { useEffect } from 'react'

export function PrintTrigger() {
  useEffect(() => {
    // Small delay to let styles render
    const t = setTimeout(() => window.print(), 500)
    return () => clearTimeout(t)
  }, [])

  return null
}
```

**Step 2: Commit**

```bash
git add components/dashboard/seo-report-print.tsx
git commit -m "feat: add PrintTrigger component for PDF export"
```

---

### Task 5: Create the print report page

**Files:**
- Create: `app/dashboard/seo/report/page.tsx`

**Step 1: Create the file**

```tsx
import { createClient } from '@/lib/supabase/server'
import { PrintTrigger } from '@/components/dashboard/seo-report-print'
import { CheckCircle, XCircle, AlertTriangle } from 'lucide-react'
import type { SeoSuggestion } from '@/lib/actions/seo-ai'

type AuditRow = {
  id: string
  page_url: string
  status_code: number
  indexed: boolean
  canonical_url: string | null
  meta_title: string | null
  meta_description: string | null
  issues: string[]
  last_checked_at: string
  ai_suggestions: SeoSuggestion | null
}

export default async function SeoReportPage() {
  const supabase = await createClient()
  const { data: rows } = await (supabase as any)
    .from('seo_audit_log')
    .select('*')
    .order('last_checked_at', { ascending: false })

  const pages: AuditRow[] = rows ?? []
  const total = pages.length
  const withIssues = pages.filter((p) => p.issues?.length > 0).length
  const indexed = pages.filter((p) => p.indexed).length
  const notIndexed = pages.filter((p) => !p.indexed && p.status_code > 0).length
  const generatedAt = new Date().toLocaleDateString('en-US', {
    month: 'long', day: 'numeric', year: 'numeric',
  })
  const pagesWithIssues = pages
    .filter((p) => p.issues?.length > 0)
    .sort((a, b) => b.issues.length - a.issues.length)

  return (
    <>
      <PrintTrigger />
      <div className="print-report max-w-4xl mx-auto p-8 font-sans text-foreground">
        {/* Header */}
        <div className="flex items-start justify-between mb-8 pb-6 border-b border-border">
          <div>
            <h1 className="text-2xl font-bold mb-1">SEO Audit Report</h1>
            <p className="text-sm text-muted-foreground">Xyren.me · Generated {generatedAt}</p>
          </div>
          <button
            onClick={() => window.print()}
            className="print:hidden px-4 py-2 text-sm border border-border rounded-lg hover:bg-secondary transition-colors"
          >
            Print / Save PDF
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-4 gap-4 mb-8">
          {[
            { label: 'Total Pages', value: total },
            { label: 'With Issues', value: withIssues },
            { label: 'Indexed', value: indexed },
            { label: 'Not Indexed', value: notIndexed },
          ].map(({ label, value }) => (
            <div key={label} className="border border-border rounded-lg p-4 text-center">
              <p className="text-3xl font-bold">{value}</p>
              <p className="text-xs text-muted-foreground mt-1">{label}</p>
            </div>
          ))}
        </div>

        {/* Pages with issues + AI suggestions */}
        {pagesWithIssues.length > 0 && (
          <div className="mb-8">
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-yellow-500" />
              Pages Requiring Attention ({pagesWithIssues.length})
            </h2>
            <div className="space-y-4">
              {pagesWithIssues.map((page) => (
                <div key={page.id} className="border border-border rounded-lg p-4 break-inside-avoid">
                  <div className="flex items-start justify-between gap-4 mb-2">
                    <p className="text-sm font-medium text-primary break-all">{page.page_url}</p>
                    <span className="text-xs px-2 py-0.5 rounded bg-secondary text-muted-foreground flex-shrink-0">
                      {page.status_code}
                    </span>
                  </div>

                  {/* Issues */}
                  <ul className="space-y-1 mb-3">
                    {page.issues.map((issue, i) => (
                      <li key={i} className="text-xs text-yellow-500 flex items-center gap-1.5">
                        <AlertTriangle className="h-3 w-3 flex-shrink-0" />
                        {issue}
                      </li>
                    ))}
                  </ul>

                  {/* AI suggestions if available */}
                  {page.ai_suggestions && (
                    <div className="border-t border-border pt-3 mt-2 space-y-2">
                      <p className="text-xs font-semibold text-violet-400">AI Recommendations</p>
                      <div className="bg-secondary/50 rounded p-2">
                        <p className="text-xs text-muted-foreground">Suggested title</p>
                        <p className="text-xs font-medium">{page.ai_suggestions.suggested_title}</p>
                      </div>
                      <div className="bg-secondary/50 rounded p-2">
                        <p className="text-xs text-muted-foreground">Suggested description</p>
                        <p className="text-xs">{page.ai_suggestions.suggested_description}</p>
                      </div>
                      {page.ai_suggestions.fixes.map((fix, i) => (
                        <div key={i} className="flex gap-2 text-xs">
                          <span className={`flex-shrink-0 px-1.5 py-0.5 rounded font-medium ${
                            fix.priority === 'high' ? 'bg-red-500/10 text-red-400' :
                            fix.priority === 'medium' ? 'bg-yellow-500/10 text-yellow-400' :
                            'bg-blue-500/10 text-blue-400'
                          }`}>
                            {fix.priority}
                          </span>
                          <span>{fix.fix}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Full pages table */}
        <div>
          <h2 className="text-lg font-semibold mb-4">All Pages ({total})</h2>
          <table className="w-full text-xs border-collapse">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left py-2 pr-4 font-medium text-muted-foreground">URL</th>
                <th className="text-center py-2 px-2 font-medium text-muted-foreground">Status</th>
                <th className="text-center py-2 px-2 font-medium text-muted-foreground">Indexed</th>
                <th className="text-center py-2 px-2 font-medium text-muted-foreground">Issues</th>
                <th className="text-center py-2 pl-2 font-medium text-muted-foreground">Canonical</th>
              </tr>
            </thead>
            <tbody>
              {pages.map((page) => (
                <tr key={page.id} className="border-b border-border/50">
                  <td className="py-2 pr-4">
                    <p className="truncate max-w-xs">{page.page_url.replace(/^https?:\/\/[^/]+/, '') || '/'}</p>
                    {page.meta_title && (
                      <p className="text-muted-foreground truncate max-w-xs">{page.meta_title}</p>
                    )}
                  </td>
                  <td className="py-2 px-2 text-center">{page.status_code || 'ERR'}</td>
                  <td className="py-2 px-2 text-center">
                    {page.indexed
                      ? <CheckCircle className="h-3 w-3 text-green-500 mx-auto" />
                      : <XCircle className="h-3 w-3 text-red-500 mx-auto" />
                    }
                  </td>
                  <td className="py-2 px-2 text-center">{page.issues?.length ?? 0}</td>
                  <td className="py-2 pl-2 text-center">
                    {page.canonical_url
                      ? <CheckCircle className="h-3 w-3 text-green-500 mx-auto" />
                      : <XCircle className="h-3 w-3 text-red-500 mx-auto" />
                    }
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <style>{`
          @media print {
            @page { margin: 1.5cm; }
            .print\\:hidden { display: none !important; }
            .break-inside-avoid { break-inside: avoid; }
            body { background: white !important; color: black !important; }
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

**Step 3: Commit**

```bash
git add app/dashboard/seo/report/page.tsx
git commit -m "feat: add print-optimised SEO report page at /dashboard/seo/report"
```

---

### Task 6: Update the main SEO dashboard

**Files:**
- Modify: `app/dashboard/seo/page.tsx`

**Step 1: Add imports at the top of the file**

Add after the existing imports:
```tsx
import { SeoSuggestions } from '@/components/dashboard/seo-suggestions'
import type { SeoSuggestion } from '@/lib/actions/seo-ai'
import { FileDown } from 'lucide-react'
import Link from 'next/link'
```

**Step 2: Update the `AuditRow` type**

Add `ai_suggestions` field:
```tsx
type AuditRow = {
  id: string
  page_url: string
  status_code: number
  indexed: boolean
  canonical_url: string | null
  meta_title: string | null
  meta_description: string | null
  issues: string[]
  last_checked_at: string
  ai_suggestions: SeoSuggestion | null
}
```

**Step 3: Add "Export PDF" button next to "Run Audit Now"**

Replace the `<div className="flex items-center gap-3">` block inside `<PageHeader>`:
```tsx
<div className="flex items-center gap-3">
  {lastChecked && (
    <p className="text-sm text-muted-foreground">Last run: {lastChecked}</p>
  )}
  <Link href="/dashboard/seo/report" target="_blank">
    <Button size="sm" variant="outline" className="gap-2">
      <FileDown className="h-4 w-4" />
      Export PDF
    </Button>
  </Link>
  <form action={triggerSeoAudit}>
    <Button type="submit" size="sm" variant="outline" className="gap-2">
      <RefreshCw className="h-4 w-4" />
      Run Audit Now
    </Button>
  </form>
</div>
```

**Step 4: Add `<SeoSuggestions>` inside each page-with-issues card**

Inside the `pagesWithIssues.map()` block, after the `<ul>` of issues, add:
```tsx
<SeoSuggestions
  pageId={page.id}
  initialSuggestions={page.ai_suggestions ?? null}
/>
```

**Step 5: Verify TypeScript**

```bash
npx tsc --noEmit 2>&1 | grep -v "node_modules\|\.next"
```
Expected: no errors

**Step 6: Verify in browser**

1. Go to `http://localhost:8000/dashboard/seo`
2. Confirm "Export PDF" button appears in the header
3. If there are pages with issues, confirm "Analyze with AI" button appears on each card
4. Click "Analyze with AI" on one card — spinner shows, page reloads, suggestions appear
5. Click "Export PDF" — new tab opens at `/dashboard/seo/report`, print dialog triggers

**Step 7: Commit**

```bash
git add app/dashboard/seo/page.tsx
git commit -m "feat: integrate AI suggestions and PDF export into SEO dashboard"
```

---

## Done

All 6 tasks complete. The SEO dashboard now has:
- Per-page "Analyze with AI" button → Claude-generated suggested title, description, and prioritised fix list
- Suggestions persist in Supabase so they're free to view after first analysis
- "Export PDF" → opens print-optimised report with all data including AI suggestions
