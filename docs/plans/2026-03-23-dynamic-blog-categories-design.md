# Dynamic Blog Categories Design

**Date:** 2026-03-23
**Status:** Approved

## Problem

Blog categories are hardcoded in two places (`seo`, `marketing`, `design`, `business`), the category page uses placeholder data instead of real posts, and the content engine can generate categories that don't match the hardcoded list. Categories need to be fully dynamic — Claude creates them as needed, each category page is an SEO landing page, and the user can edit category metadata in the dashboard.

## Design Decisions

- **Fully dynamic categories** — no hardcoded list. Claude picks from existing categories when they fit, creates new ones when the topic warrants it.
- **AI-generated category SEO metadata** with manual override in the dashboard.
- **Multi-word hyphenated slugs** (e.g. `local-seo`, `web-design`, `content-strategy`).

## Database

### New table: `blog_categories`

| Column | Type | Notes |
|--------|------|-------|
| id | uuid | PK, auto |
| slug | text | Unique. e.g. `local-seo` |
| name | text | Display name. e.g. `Local SEO` |
| seo_title | text | Meta title for category page |
| meta_description | text | Meta description |
| intro | text | 1-2 paragraph intro shown at top of category page |
| post_count | integer | Denormalized, default 0. Updated on publish/unpublish. |
| created_at | timestamptz | Auto |
| updated_at | timestamptz | Auto |

### Existing tables

- `blog_posts.category` — stays as `text`, now stores slug (soft FK to `blog_categories.slug`)
- `content_drafts.category` — same, stores slug

### Migration strategy

1. Create `blog_categories` table
2. Seed from existing `blog_posts`: for each `SELECT DISTINCT category`, insert a row with slug = category, name = title-cased category
3. SEO metadata for seeded categories backfilled via dashboard or manual edit (not in migration)

## Content Engine Flow

### In `selectTopic()`

1. Fetch all existing categories from `blog_categories` (slug + name)
2. Pass to Claude prompt:
   ```
   Existing categories: local-seo, web-design, content-strategy, business
   If one fits, use it. If the topic truly doesn't fit any existing category,
   create a new one with a hyphenated slug, display name, SEO title,
   meta description, and a 2-sentence intro paragraph.
   ```
3. Claude returns `TopicDecision` with:
   - `category_slug` (string)
   - `category_name` (string)
   - `is_new_category` (boolean)
   - If new: `category_seo_title`, `category_meta_description`, `category_intro`

### After draft is saved

- If `is_new_category` is true, insert into `blog_categories` with `post_count: 0`
- If existing category, do nothing to the categories table

## Category Pages

### `/resources/blog/[category]`

1. Query `blog_categories` by slug — get SEO metadata + intro
2. Query `blog_posts` by category slug, `is_published = true`, ordered by `published_at desc`
3. If category doesn't exist in table → 404
4. If category exists but 0 published posts → show empty state with intro paragraph
5. Render `<title>` from `seo_title`, `<meta description>` from `meta_description`
6. Add JSON-LD `CollectionPage` schema
7. Show intro paragraph at top, then post grid

### `/resources/blog` (listing page)

1. Remove hardcoded category arrays
2. Query `blog_categories` where `post_count > 0` for filter badges
3. Category badges link to `/resources/blog/{slug}`

## Post Count Maintenance

- **Increment** when a post is published: `approveDraft()`, `toggleBlogPublished(true)`
- **Decrement** when unpublished or deleted: `toggleBlogPublished(false)`, `deleteBlogPost()`
- Query: `UPDATE blog_categories SET post_count = post_count + 1 WHERE slug = $1`

## Sitemap

- `app/sitemap.ts` — add dynamic category URLs from `blog_categories` where `post_count > 0`

## Dashboard

- New `/dashboard/categories` page
- List all categories with name, slug, post_count, seo_title
- Click to edit: name, seo_title, meta_description, intro
- No delete — categories with 0 posts are hidden from public site automatically

## Files to Change

| File | Change |
|------|--------|
| New migration | Create `blog_categories` table + seed from existing posts |
| `lib/content-engine/claude.ts` | Fetch existing categories, update prompt, parse new category fields |
| `lib/actions/content.ts` | Upsert category on draft creation, update post_count on publish |
| `lib/actions/blog.ts` | Update post_count on toggle/delete |
| `app/resources/blog/[category]/page.tsx` | Replace placeholders with real Supabase queries + category SEO |
| `app/resources/blog/page.tsx` | Dynamic category badges from `blog_categories` |
| `app/sitemap.ts` | Add category URLs |
| `app/dashboard/categories/page.tsx` | New dashboard page |
| `lib/actions/categories.ts` | New server actions for category CRUD |
