# Xyren.me Content Engine & Website Completion — Design

**Date:** 2026-03-17
**Status:** Approved
**Scope:** Website bug fixes + completion, AI content engine, SEO optimization layer, approval workflow

---

## Overview

Build an intelligent, autonomous content engine on top of the existing Xyren.me Next.js + Supabase stack. The engine generates one piece of content per day (blog post or how-to guide), generates a cover image via Nano Banana (Google Gemini image model), delivers a preview email, and waits for approval before publishing. The AI tracks performance over time and evolves toward producing more of what performs best. An SEO audit layer ensures all pages index correctly and content is optimized before publication.

---

## Architecture Decision: Cron-Triggered Serverless

All pipeline logic lives in Next.js API routes triggered by Vercel Cron. No separate infrastructure. Uses `waitUntil` for long-running tasks to avoid the 60s timeout limit. Existing stack: Next.js 16, Supabase, Resend, Framer Motion, shadcn/ui.

---

## Section 1 — Database Schema

### New Tables

#### `content_drafts`
Holds all AI-generated content before publication.

```sql
id uuid primary key
type text -- 'blog' | 'how-to'
title text
slug text unique
excerpt text
content text -- MDX string
cover_image_url text
tags text[]
category text
status text -- 'pending' | 'changes_requested' | 'approved' | 'published' | 'rejected'
ai_model text
topic_reasoning text -- why Claude chose this topic
seo_keywords text[]

-- SEO fields
seo_title text
meta_description text
focus_keyword text
secondary_keywords text[]
keyword_density numeric
readability_score numeric
internal_links text[]
external_links text[]
schema_markup jsonb -- JSON-LD
og_title text
og_description text
seo_score integer -- 0-100

-- Approval workflow
email_sent_at timestamptz
approved_at timestamptz
published_at timestamptz
requested_changes text -- feedback from user
revision_count integer default 0

reading_time integer -- minutes
created_at timestamptz default now()
updated_at timestamptz default now()
```

#### `content_performance`
Tracks analytics per published post to inform AI topic selection.

```sql
id uuid primary key
post_id uuid
post_type text -- 'blog' | 'how-to'
views integer
avg_time_on_page numeric -- seconds
bounce_rate numeric -- 0-1
social_shares integer
recorded_at timestamptz default now()
```

#### `content_settings`
Single-row config table, managed from dashboard.

```sql
id uuid primary key
daily_schedule_time text -- e.g. '08:00'
auto_publish_after_approval boolean default false
target_keywords text[]
excluded_topics text[]
site_niche_context text -- context fed to Claude for topic selection
updated_at timestamptz default now()
```

#### `seo_audit_log`
Weekly crawl results per page.

```sql
id uuid primary key
page_url text
status_code integer
indexed boolean
canonical_url text
meta_title text
meta_description text
issues text[]
last_checked_at timestamptz default now()
```

### Existing Tables (unchanged)
`blog_posts` and `how_to_guides` remain the source of truth for published content. Approved drafts are copied here on publish.

---

## Section 2 — Content Generation Pipeline

### Daily Flow

```
Vercel Cron (daily at configured time)
  → POST /api/content/generate
      1. Query content_performance + existing posts → build context object
      2. Claude Pass 1 — Topic Selection
         Input: existing titles, performance scores, niche context, current date
         Output: { type, title, target_keyword, reasoning, estimated_search_volume_tier }
      3. Claude Pass 2 — Content Generation
         Write full MDX post with internal links to existing published content
         Include headings, meta description, OG tags, JSON-LD schema
      4. Claude Pass 3 — SEO Review
         Score content (target: 80+/100)
         Check: keyword density, H1→H2→H3 structure, internal links,
                meta description length, readability
         Apply fixes before proceeding
      5. Nano Banana — Cover Image Generation
         Prompt derived from title + excerpt + brand tone
         Upload to Supabase Storage
      6. Save draft to content_drafts (status: pending)
      7. Resend — Send preview email to hello@xyren.me
```

### Topic Intelligence Prompt Context
Claude receives:
- All existing post titles and their performance scores
- Current `site_niche_context` from content_settings
- Current date + day of week
- List of excluded topics
- Target keywords list
- Directive: avoid repetition, target underserved queries, balance blog vs how-to

### SEO Pass
Separate Claude prompt that reviews the generated content and returns:
- `seo_score` (0–100)
- Specific issues and fixes
- Final keyword density, readability score
- Suggested internal links from existing published content

Fixes are applied programmatically before the draft is saved.

---

## Section 3 — Email & Approval Workflow

### Outbound Email (Resend)

Email sent to `hello@xyren.me` contains:
- Rendered HTML preview of full content
- Cover image
- SEO scorecard: score, focus keyword, meta description, readability grade
- **Approve & Publish** button (links to dashboard with token)
- Reply-to address: `approve+<draft-id>@xyren.me`
- Instructions: "Reply with changes, or reply 'approve' to publish"

### Inbound Reply Parsing (Resend Inbound Webhooks)

```
Your email reply
  → Resend parses → POST /api/content/email-reply
      → Extract draft ID from reply-to address token
      → If body contains approval signal ("approve", "approved", "lgtm", "publish")
          → status: approved → publish draft → copy to blog_posts / how_to_guides
      → Otherwise
          → Extract feedback text
          → status: changes_requested
          → Claude applies changes (new revision)
          → Send revised preview email
          → revision_count++
          → Loop until approved or rejected
```

### Dashboard Approval (Parallel Path)

New route: `/dashboard/content`

| View | Description |
|------|-------------|
| Pending | AI-generated drafts awaiting review |
| Changes Requested | Drafts being revised |
| Approved | Ready to publish |
| Published | Live content |
| Rejected | Archived rejected drafts |

Each draft card shows:
- Title, type, cover image thumbnail
- SEO score badge
- Topic reasoning (why Claude chose this)
- Full preview modal
- Actions: Approve / Request Changes / Reject

"Request Changes" opens a text input → same Claude revision loop as email reply.

### On Publish
1. Draft content copied to `blog_posts` or `how_to_guides`
2. `content_drafts.status` → `published`
3. `content_drafts.published_at` → now
4. `sitemap.ts` picks up new post automatically (dynamic routes)
5. Optional: Google Search Console URL inspection ping via API

---

## Section 4 — SEO Audit & Indexing Layer

### Weekly Site Audit (Vercel Cron)

```
Vercel Cron (weekly, Monday 06:00)
  → POST /api/seo/audit
      1. Load all routes from sitemap
      2. Fetch each page → check status code, canonical, meta title/description
      3. Google Search Console API → indexing status per URL
      4. Detect issues:
         - Missing or duplicate meta titles/descriptions
         - Missing canonical tags
         - Noindex tags on public pages
         - Broken internal links
         - Missing OG images
      5. Save to seo_audit_log
      6. Send weekly SEO health report email
```

### Immediate Codebase SEO Fixes

- Fix `blog_posts` table name bug (`posts` → `blog_posts`) in `/resources/blog/page.tsx`
- Add `generateMetadata()` to all dynamic routes (blog, how-to, FAQ)
- Add JSON-LD schema to homepage, blog posts, how-to guides, FAQ page
- Fix/add canonical tags across all routes
- Create `public/og-image.png` (1200×630)
- Verify `robots.txt` and `sitemap.ts` cover all routes
- Submit sitemap to Google Search Console

### Dashboard SEO Page

New route: `/dashboard/seo`

Sections:
- **Index Coverage** — pie chart: indexed / not indexed / excluded
- **Crawl Issues** — table of pages with problems + recommended fixes
- **Top Keywords** — from GSC API: impressions, clicks, average position
- **Click-Through Rates** — by page, last 28 days

---

## Section 5 — Website Completion

### Bug Fixes
- Fix `blog_posts` table name mismatch
- Add `public/og-image.png`

### MDX Rendering
- Install `next-mdx-remote`
- Build `<ArticleLayout>` component: table of contents, reading time, author, share buttons
- Render all blog and how-to content as MDX

### Email Notifications (Resend — already installed)
- Contact form: confirmation email to sender
- Contact form: internal notification to `hello@xyren.me`

### Dashboard Completions
- `/dashboard/content` — content queue (new, described above)
- `/dashboard/seo` — SEO audit results + GSC data (new, described above)
- Analytics dashboard wired to real GA4 data
- User management: list users, revoke access

### Content Seeding
- 3–5 seed blog posts covering core Xyren.me topics
- 2–3 seed how-to guides
- Purpose: give AI context + prevent empty site at launch

### Performance
- Audit all images → `next/image` with proper `width`/`height`/`priority`
- Ensure all routes export `generateMetadata()`

---

## Implementation Phases

### Phase 1 — Foundation (Website Fixes + Schema)
1. Fix blog table bug
2. Create OG image
3. Add MDX rendering + ArticleLayout
4. Wire up Resend for contact form
5. Run Supabase migrations for new tables
6. Seed initial content

### Phase 2 — Content Engine Core
1. Build `/api/content/generate` pipeline
2. Integrate Claude API (topic selection + content + SEO review passes)
3. Integrate Nano Banana for image generation
4. Set up Vercel Cron
5. Build `/dashboard/content` queue UI

### Phase 3 — Approval Workflow
1. Build outbound preview email template
2. Set up Resend inbound webhook
3. Build `/api/content/email-reply` handler
4. Wire dashboard approve/reject/changes actions

### Phase 4 — SEO Layer
1. Fix all static SEO issues (meta, canonical, JSON-LD)
2. Build `/api/seo/audit` weekly cron
3. Google Search Console API integration
4. Build `/dashboard/seo` page

### Phase 5 — Intelligence & Analytics
1. Wire GA4 data to analytics dashboard
2. Build `content_performance` data ingestion
3. Feed performance data back into Claude topic selection
4. Configure `content_settings` UI in dashboard

---

## Key Dependencies to Add

```
@google/generative-ai       — Nano Banana (Gemini image generation)
next-mdx-remote             — MDX rendering in Next.js App Router
@googleapis/google-auth-library — Google Search Console API auth
googleapis                  — GSC + GA4 APIs
```

Resend is already installed. Claude API via `@anthropic-ai/sdk` (already used or to add).

---

## Environment Variables Required

```
ANTHROPIC_API_KEY           — Claude content generation
GOOGLE_GEMINI_API_KEY       — Nano Banana image generation
GOOGLE_GSC_CLIENT_EMAIL     — Search Console service account
GOOGLE_GSC_PRIVATE_KEY      — Search Console service account
GOOGLE_GA4_PROPERTY_ID      — Analytics
RESEND_API_KEY              — Email send + inbound
RESEND_INBOUND_SECRET       — Webhook verification
CLICKUP_API_KEY             — Already documented
CLICKUP_TEAM_ID             — ClickUp
CLICKUP_LEADS_LIST_ID       — ClickUp
```
