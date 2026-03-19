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
    if (Array.isArray(p.issues) && p.issues.length > 0) {
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

1. Executive Summary — 2–3 paragraphs of narrative: overall health assessment, the most impactful problems, and the biggest quick wins. Be specific about pages and issues, not generic.

2. Critical Issues — issues that most damage search rankings, ranked by impact (most pages affected × severity). For each: a clear heading naming the issue, a list of affected page paths, a brief explanation of why it hurts SEO, and numbered fix steps.

3. Warnings — medium-priority issues (same format). If none, say so briefly.

4. Passing Checks — a brief list of what is working well across the site.

5. Recommended Next Steps — numbered list of the top 5 actions to take, in priority order, with an estimated impact label (High / Medium / Low).

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
