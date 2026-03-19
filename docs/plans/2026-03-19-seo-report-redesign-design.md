# SEO Report Redesign — Design

**Date:** 2026-03-19
**Status:** Approved

---

## Overview

Replace the current mirror-of-the-dashboard report page with a proper Claude-generated SEO audit document. The report is stored in Supabase and auto-generated on first load, with a manual "Regenerate" button for fresh analysis.

**Future:** Manus.ai integration noted as a future enhancement to enrich audit data.

---

## Database

New table: `seo_reports`

```sql
CREATE TABLE seo_reports (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  generated_at timestamptz DEFAULT now() NOT NULL,
  report_html text NOT NULL,
  stats_snapshot jsonb NOT NULL
);
```

`stats_snapshot` shape:
```ts
{
  total_pages: number
  pages_with_issues: number
  indexed: number
  not_indexed: number
  health_score: number   -- extracted from Claude output
  audit_date: string
}
```

---

## Report Page Behavior

Route: `app/dashboard/seo/report/page.tsx`

1. On load: fetch most recent row from `seo_reports` ordered by `generated_at` desc
2. If no row exists: render a `<ReportGenerator>` client component that auto-triggers generation on mount, showing a loading state
3. If row exists: render the stored `report_html` with a "Regenerate" button
4. `?print=1` query param: auto-triggers `window.print()` via `PrintTrigger`

---

## Generation

### Server action: `lib/actions/seo-report.ts`

Function: `generateSeoReport(): Promise<void>`

1. Auth check
2. Fetch all rows from `seo_audit_log` (url, status_code, issues, meta_title, meta_description, indexed, canonical_url, ai_suggestions)
3. Build Claude prompt with full audit data
4. Call `claude-opus-4-6` (higher quality for a document)
5. Claude returns structured HTML report (see format below)
6. Insert into `seo_reports` with stats snapshot
7. `revalidatePath('/dashboard/seo/report')`

### Client component: `components/dashboard/seo-report-generator.tsx`

- `'use client'`
- On mount: calls `generateSeoReport()` server action
- Shows a loading state: spinner + "Generating your SEO audit..." message
- On error: shows error with "Try Again" button
- On success: `router.refresh()` to render the stored report

---

## Claude Prompt

Send Claude:
- Full list of audited pages with their issues, meta data, status codes, indexed status
- Any existing `ai_suggestions` per page

Ask Claude to return a **complete HTML document fragment** (no `<html>`/`<body>` tags, just the inner content) with this structure:

### Report Sections

1. **Executive Summary**
   - 2–3 paragraph narrative of overall SEO health
   - Biggest risks and quick wins identified

2. **Overall Health Score**
   - 0–100 numeric score
   - Plain-English rating: Excellent (90+), Good (75–89), Needs Attention (50–74), Critical (<50)

3. **Critical Issues** (high impact, fix first)
   - Each issue: what it is, which pages are affected (listed), why it hurts rankings, exact fix steps
   - Ranked by: number of affected pages × severity weight

4. **Warnings** (medium priority)
   - Same format as critical, lower urgency

5. **Passing Checks**
   - Brief list of what's healthy across the site

6. **Recommended Next Steps**
   - Top 5 prioritized actions, numbered, with estimated impact

---

## Report Styling

The report page uses a dedicated light-mode layout — no dashboard chrome. Clean document format:

- White background forced (no dark mode)
- Max width: `max-w-3xl mx-auto`
- Clear typographic hierarchy: large section headings, body text, code-style URLs
- Severity colors: red for critical, amber for warnings, green for passing
- `@media print` already handles page breaks and margins
- Print button hidden on print

---

## Files to Create / Modify

| File | Action |
|------|--------|
| `seo_reports` Supabase table | Create — manual SQL migration |
| `lib/actions/seo-report.ts` | Create — server action for generation |
| `components/dashboard/seo-report-generator.tsx` | Create — auto-trigger client component |
| `app/dashboard/seo/report/page.tsx` | Replace — new report renderer |
| `components/dashboard/seo-report-print.tsx` | Keep as-is |

---

## Out of Scope
- Report history / comparison between runs
- Manus.ai integration (future)
- Email delivery of the report
