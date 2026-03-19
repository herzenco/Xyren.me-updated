# SEO AI Analysis + PDF Export — Design

**Date:** 2026-03-19
**Status:** Approved

---

## Overview

Two features added to the existing SEO audit dashboard (`/dashboard/seo`):

1. **Per-page AI analysis** — on-demand Claude analysis of each page's SEO issues, returning specific suggested copy and a prioritised fix list
2. **PDF export** — print-optimised report at `/dashboard/seo/report` covering stats, AI suggestions, and the full pages table

---

## Feature 1: Per-Page AI Analysis

### User Flow
1. User sees a page card under "Pages with Issues"
2. Each card has an **"Analyze with AI"** button
3. Clicking triggers a server action → calls Claude with the page's audit data
4. Claude returns structured suggestions (see schema below)
5. Result is saved to `seo_audit_log.ai_suggestions` (jsonb)
6. Suggestions render inline on the card — title/description rewrites + fix list with priority badges
7. If suggestions already exist, they display immediately (no re-run)

### Claude Prompt Input
```
URL, meta_title, meta_description, issues[]
```

### Claude Response Schema
```ts
{
  suggested_title: string        // 50–70 char rewrite
  suggested_description: string  // 120–160 char rewrite
  fixes: {
    issue: string                // mirrors the issue string from audit
    fix: string                  // specific actionable instruction
    priority: 'high' | 'medium' | 'low'
  }[]
}
```

### Storage
- New column: `ai_suggestions jsonb` on `seo_audit_log`
- Populated by server action `lib/actions/seo-ai.ts` → `analyzePageSeo(pageId)`
- Cleared/reset when a new audit runs (audit upsert overwrites the row)

### Components
- `lib/actions/seo-ai.ts` — server action calling Anthropic SDK
- `components/dashboard/seo-suggestions.tsx` — client component rendering suggestions + "Analyze" button
- Updated `app/dashboard/seo/page.tsx` — import and render `SeoSuggestions` per page card

---

## Feature 2: PDF Export

### User Flow
1. User clicks **"Export PDF"** in the SEO dashboard header
2. Opens `/dashboard/seo/report` in a new tab
3. Page auto-triggers `window.print()`
4. Browser print dialog opens — user saves as PDF

### Report Contents (in order)
1. Header — Xyren.me logo, "SEO Audit Report", date generated
2. Summary stats — Total Pages, With Issues, Indexed, Not Indexed
3. Pages with Issues — each page's URL, status code, issues list, and AI suggestions (if available)
4. Full pages table — all pages with status, indexed, canonical, issue count

### Implementation
- New route: `app/dashboard/seo/report/page.tsx` — server component, same Supabase query as main dashboard
- New component: `components/dashboard/seo-report-print.tsx` — client component that calls `window.print()` on mount
- CSS: `@media print` rules in the component to hide nav/buttons, set font sizes, page breaks
- No new npm dependencies

---

## Database Change

```sql
ALTER TABLE seo_audit_log ADD COLUMN IF NOT EXISTS ai_suggestions jsonb;
```

Run manually in Supabase SQL editor before deploying.

---

## Files to Create / Modify

| File | Action |
|------|--------|
| `lib/actions/seo-ai.ts` | Create — server action for Claude analysis |
| `components/dashboard/seo-suggestions.tsx` | Create — suggestions UI + Analyze button |
| `components/dashboard/seo-report-print.tsx` | Create — print trigger client component |
| `app/dashboard/seo/report/page.tsx` | Create — print-optimised report page |
| `app/dashboard/seo/page.tsx` | Modify — add Export PDF button, render SeoSuggestions |

---

## Out of Scope
- Bulk "Analyze All" button (can add later)
- Scheduled AI analysis on every audit run
- Custom PDF styling beyond `@media print`
