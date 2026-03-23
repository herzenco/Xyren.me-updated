# Dynamic Blog Categories Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Replace hardcoded blog categories with a fully dynamic, AI-generated category system backed by a `blog_categories` table with SEO metadata.

**Architecture:** New `blog_categories` table stores slug, display name, and AI-generated SEO fields (seo_title, meta_description, intro). The content engine fetches existing categories and passes them to Claude, which either reuses one or creates a new category with full SEO metadata. Category pages query both tables. Post count is denormalized and maintained on publish/unpublish/delete.

**Tech Stack:** Supabase (Postgres), Next.js 16 App Router, Claude API, TypeScript

**Design doc:** `docs/plans/2026-03-23-dynamic-blog-categories-design.md`

---

### Task 1: Database Migration

**Files:**
- Create: `supabase/migrations/20260323000000_blog_categories.sql`

**Step 1: Write the migration**

```sql
-- Create blog_categories table
create table if not exists blog_categories (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  name text not null,
  seo_title text,
  meta_description text,
  intro text,
  post_count integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- RLS
alter table blog_categories enable row level security;

-- Public read for category pages (no auth needed)
create policy "Public read access to blog_categories"
  on blog_categories for select using (true);

-- Authenticated write for dashboard/engine
create policy "Authenticated write access to blog_categories"
  on blog_categories for all to authenticated using (true) with check (true);

-- Seed from existing blog_posts
insert into blog_categories (slug, name, post_count)
select
  lower(trim(category)),
  initcap(trim(category)),
  count(*)
from blog_posts
where is_published = true and category is not null and trim(category) != ''
group by lower(trim(category))
on conflict (slug) do update set post_count = excluded.post_count;

-- Index for fast lookups
create index if not exists blog_categories_slug_idx on blog_categories(slug);
create index if not exists blog_categories_post_count_idx on blog_categories(post_count) where post_count > 0;
```

**Step 2: Commit**

```bash
git add supabase/migrations/20260323000000_blog_categories.sql
git commit -m "feat: add blog_categories table migration with seed from existing posts"
```

---

### Task 2: Category Server Actions

**Files:**
- Create: `lib/actions/categories.ts`

**Step 1: Write the server actions**

```typescript
'use server'

import { createAdminClient } from '@/lib/supabase/admin'
import { getServerSession } from 'next-auth'
import { revalidatePath } from 'next/cache'

async function requireAuth() {
  const session = await getServerSession()
  if (!session?.user) throw new Error('Unauthorized')
  return session.user
}

export async function getCategories() {
  const supabase = createAdminClient()
  const { data, error } = await (supabase as any)
    .from('blog_categories')
    .select('*')
    .order('post_count', { ascending: false })

  if (error) throw new Error(`Failed to fetch categories: ${error.message}`)
  return data ?? []
}

export async function getCategoriesWithPosts() {
  const supabase = createAdminClient()
  const { data, error } = await (supabase as any)
    .from('blog_categories')
    .select('*')
    .gt('post_count', 0)
    .order('post_count', { ascending: false })

  if (error) throw new Error(`Failed to fetch categories: ${error.message}`)
  return data ?? []
}

export async function getCategoryBySlug(slug: string) {
  const supabase = createAdminClient()
  const { data, error } = await (supabase as any)
    .from('blog_categories')
    .select('*')
    .eq('slug', slug)
    .single()

  if (error && error.code !== 'PGRST116') {
    throw new Error(`Failed to fetch category: ${error.message}`)
  }
  return data ?? null
}

export async function upsertCategory(category: {
  slug: string
  name: string
  seo_title?: string
  meta_description?: string
  intro?: string
}) {
  const supabase = createAdminClient()
  const { error } = await (supabase as any)
    .from('blog_categories')
    .upsert(
      {
        slug: category.slug,
        name: category.name,
        seo_title: category.seo_title ?? null,
        meta_description: category.meta_description ?? null,
        intro: category.intro ?? null,
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'slug' }
    )

  if (error) throw new Error(`Failed to upsert category: ${error.message}`)
}

export async function updateCategory(slug: string, updates: {
  name?: string
  seo_title?: string
  meta_description?: string
  intro?: string
}) {
  await requireAuth()
  const supabase = createAdminClient()

  const fields: Record<string, unknown> = { updated_at: new Date().toISOString() }
  if (updates.name !== undefined) fields.name = updates.name
  if (updates.seo_title !== undefined) fields.seo_title = updates.seo_title
  if (updates.meta_description !== undefined) fields.meta_description = updates.meta_description
  if (updates.intro !== undefined) fields.intro = updates.intro

  const { error } = await (supabase as any)
    .from('blog_categories')
    .update(fields)
    .eq('slug', slug)

  if (error) throw new Error(`Failed to update category: ${error.message}`)

  revalidatePath('/dashboard/categories')
  revalidatePath(`/resources/blog/${slug}`)
}

export async function incrementCategoryCount(slug: string) {
  const supabase = createAdminClient()
  const { error } = await (supabase as any).rpc('increment_category_count', { category_slug: slug })
  // Fallback if RPC doesn't exist: manual update
  if (error) {
    await (supabase as any)
      .from('blog_categories')
      .update({ post_count: (supabase as any).raw('post_count + 1') })
      .eq('slug', slug)
  }
}

export async function decrementCategoryCount(slug: string) {
  const supabase = createAdminClient()
  await (supabase as any)
    .from('blog_categories')
    .update({ post_count: (supabase as any).raw('GREATEST(post_count - 1, 0)') })
    .eq('slug', slug)
}
```

Note: The increment/decrement functions use raw SQL via RPC or manual update. We'll use simple read-then-write in the actual implementation since Supabase JS doesn't support `raw()`. The actual approach will be:

```typescript
export async function adjustCategoryCount(slug: string, delta: number) {
  const supabase = createAdminClient()
  // Read current count
  const { data } = await (supabase as any)
    .from('blog_categories')
    .select('post_count')
    .eq('slug', slug)
    .single()
  if (!data) return
  const newCount = Math.max(0, (data.post_count ?? 0) + delta)
  await (supabase as any)
    .from('blog_categories')
    .update({ post_count: newCount, updated_at: new Date().toISOString() })
    .eq('slug', slug)
}
```

**Step 2: Commit**

```bash
git add lib/actions/categories.ts
git commit -m "feat: add category server actions (CRUD, upsert, count adjustment)"
```

---

### Task 3: Update Content Engine — Dynamic Categories in Claude Prompt

**Files:**
- Modify: `lib/content-engine/claude.ts` (selectTopic function, ~line 144-191)

**Step 1: Update TopicDecision interface**

Add new fields after the existing ones:

```typescript
export interface TopicDecision {
  type: 'blog' | 'how-to'
  title: string
  slug: string
  category: string           // slug: "local-seo"
  category_name: string      // display: "Local SEO"
  is_new_category: boolean
  // Only present when is_new_category is true:
  category_seo_title?: string
  category_meta_description?: string
  category_intro?: string
  target_keyword: string
  secondary_keywords: string[]
  reasoning: string
  estimated_search_volume_tier: 'high' | 'medium' | 'low'
}
```

**Step 2: Update selectTopic to fetch and pass existing categories**

In `selectTopic()`, before the API call, add:

```typescript
// Fetch existing categories
const supabase = createContentClient()
const { data: existingCategories } = await supabase
  .from('blog_categories')
  .select('slug, name')
  .order('post_count', { ascending: false })

const categoryList = (existingCategories ?? [])
  .map((c: any) => `${c.slug} ("${c.name}")`)
  .join(', ')

const categoryInstruction = categoryList
  ? `EXISTING CATEGORIES: ${categoryList}\nPrefer an existing category if the topic fits. Only create a new category if the topic genuinely doesn't fit any existing one.`
  : `No categories exist yet. Create a new category for this topic.`
```

**Step 3: Update the Claude prompt JSON schema**

Replace the current `"category"` line in the prompt with:

```
"category": "hyphenated-slug-format (e.g. local-seo, web-design, content-strategy)",
"category_name": "Display Name (e.g. Local SEO, Web Design)",
"is_new_category": false,
"category_seo_title": "only if is_new_category=true — SEO title for the category page, 50-60 chars",
"category_meta_description": "only if is_new_category=true — meta description, 120-155 chars",
"category_intro": "only if is_new_category=true — 2-3 sentence intro paragraph for the category landing page",
```

And inject `${categoryInstruction}` into the prompt before the JSON schema.

**Step 4: Commit**

```bash
git add lib/content-engine/claude.ts
git commit -m "feat: content engine fetches existing categories, Claude creates new ones dynamically"
```

---

### Task 4: Update Content Generation Pipeline — Upsert Category on Draft Save

**Files:**
- Modify: `app/api/content/generate/route.ts` (~line 77-134)

**Step 1: After draft is saved (after line ~116), upsert category**

Add import at top:
```typescript
import { upsertCategory } from '@/lib/actions/categories'
```

After the draft is saved successfully and before the ClickUp step, add:

```typescript
// 6b. Upsert category if new
if (topic.is_new_category) {
  try {
    await upsertCategory({
      slug: topic.category,
      name: topic.category_name,
      seo_title: topic.category_seo_title,
      meta_description: topic.category_meta_description,
      intro: topic.category_intro,
    })
    console.log(`[ContentEngine] New category created: ${topic.category}`)
  } catch (catError) {
    console.error('[ContentEngine] Category upsert failed (continuing):', catError)
  }
}
```

**Step 2: Commit**

```bash
git add app/api/content/generate/route.ts
git commit -m "feat: upsert new categories when content engine creates them"
```

---

### Task 5: Update Publish/Unpublish/Delete — Maintain post_count

**Files:**
- Modify: `lib/actions/content.ts` (approveDraft, ~line 44-102)
- Modify: `lib/actions/blog.ts` (toggleBlogPublished, deleteBlogPost)

**Step 1: In content.ts approveDraft, after successful blog insert, increment count**

Add import:
```typescript
import { adjustCategoryCount } from '@/lib/actions/categories'
```

After the blog_posts insert succeeds (after line ~73), add:
```typescript
// Increment category post count
if (draft.category) {
  await adjustCategoryCount(draft.category, 1).catch(console.error)
}
```

Also add revalidation for the category page:
```typescript
if (draft.category) {
  revalidatePath(`/resources/blog/${draft.category}`)
}
```

**Step 2: In blog.ts toggleBlogPublished, adjust count**

Add import:
```typescript
import { adjustCategoryCount } from '@/lib/actions/categories'
```

Before the update query, fetch the post's category:
```typescript
const { data: post } = await (supabase.from('blog_posts') as any)
  .select('category')
  .eq('id', id)
  .single()
```

After the update succeeds:
```typescript
if (post?.category) {
  // Publishing: +1, Unpublishing: -1
  await adjustCategoryCount(post.category, currentStatus ? -1 : 1).catch(console.error)
  revalidatePath(`/resources/blog/${post.category}`)
}
```

**Step 3: In blog.ts deleteBlogPost, decrement count**

Before the delete query, fetch the post:
```typescript
const { data: post } = await (supabase.from('blog_posts') as any)
  .select('category, is_published')
  .eq('id', id)
  .single()
```

After the delete succeeds:
```typescript
if (post?.category && post.is_published) {
  await adjustCategoryCount(post.category, -1).catch(console.error)
  revalidatePath(`/resources/blog/${post.category}`)
}
```

**Step 4: Commit**

```bash
git add lib/actions/content.ts lib/actions/blog.ts
git commit -m "feat: maintain category post_count on publish, unpublish, and delete"
```

---

### Task 6: Rewrite Category Page with Real Data + SEO

**Files:**
- Rewrite: `app/resources/blog/[category]/page.tsx`

**Step 1: Replace entire file**

The new page:
1. Queries `blog_categories` by slug for SEO metadata + intro
2. Queries `blog_posts` filtered by category
3. Returns 404 if category doesn't exist
4. Generates `<title>`, `<meta description>` from category SEO fields
5. Adds JSON-LD `CollectionPage` schema
6. Shows intro paragraph at top, then post grid

Key query pattern:
```typescript
import { createAdminClient } from '@/lib/supabase/admin'

const supabase = createAdminClient()

// Get category metadata
const { data: category } = await (supabase as any)
  .from('blog_categories')
  .select('*')
  .eq('slug', categorySlug)
  .single()

if (!category) notFound()

// Get published posts in this category
const { data: posts } = await (supabase as any)
  .from('blog_posts')
  .select('*')
  .eq('category', categorySlug)
  .eq('is_published', true)
  .order('published_at', { ascending: false })
```

Metadata function uses `category.seo_title` and `category.meta_description` with fallbacks to generated versions.

**Step 2: Commit**

```bash
git add app/resources/blog/\[category\]/page.tsx
git commit -m "feat: category page queries real data with SEO metadata and JSON-LD"
```

---

### Task 7: Update Blog Listing — Dynamic Category Badges

**Files:**
- Modify: `app/resources/blog/page.tsx`

**Step 1: Replace hardcoded categories with DB query**

Remove:
```typescript
const allCategories = ['SEO', 'Marketing', 'Design', 'Business']
const visibleCategories = ['All', ...allCategories.filter((c) => postCategories.has(c.toLowerCase()))]
```

Replace with:
```typescript
import { getCategoriesWithPosts } from '@/lib/actions/categories'

const categories = await getCategoriesWithPosts()
```

Update the badge rendering to use `categories` array:
```tsx
{categories.length > 0 && (
  <div className="flex flex-wrap gap-2 justify-center mb-12">
    <Link href="/resources/blog">
      <Badge variant="default" className="cursor-pointer px-4 py-1.5 text-sm">All</Badge>
    </Link>
    {categories.map((cat: any) => (
      <Link key={cat.slug} href={`/resources/blog/${cat.slug}`}>
        <Badge variant="outline" className="cursor-pointer px-4 py-1.5 text-sm">
          {cat.name}
        </Badge>
      </Link>
    ))}
  </div>
)}
```

Also switch from `createClient` to `createAdminClient` for the posts query (consistent with other dashboard fixes).

**Step 2: Commit**

```bash
git add app/resources/blog/page.tsx
git commit -m "feat: blog listing uses dynamic category badges from blog_categories table"
```

---

### Task 8: Add Category URLs to Sitemap

**Files:**
- Modify: `app/sitemap.ts`

**Step 1: Add category routes**

After the blog post routes query, add:

```typescript
// Category pages
const { data: categories } = await (supabase as any)
  .from('blog_categories')
  .select('slug, updated_at')
  .gt('post_count', 0)

const categoryRoutes: MetadataRoute.Sitemap = (categories ?? []).map((cat: any) => ({
  url: `${baseUrl}/resources/blog/${cat.slug}`,
  lastModified: cat.updated_at ? new Date(cat.updated_at) : new Date(),
  changeFrequency: 'weekly' as const,
  priority: 0.75,
}))
```

Add `...categoryRoutes` to the return array.

Also switch `createClient` to `createAdminClient` since this runs server-side.

**Step 2: Commit**

```bash
git add app/sitemap.ts
git commit -m "feat: add dynamic category URLs to sitemap"
```

---

### Task 9: Dashboard Categories Page

**Files:**
- Create: `app/dashboard/categories/page.tsx`
- Modify: `components/dashboard/sidebar-nav.tsx` (add nav entry)

**Step 1: Create categories dashboard page**

A server component that:
1. Lists all categories with name, slug, post_count, seo_title
2. Each row has an "Edit" link
3. Shows a card grid or table

**Step 2: Create category edit functionality**

Either inline editing (like draft editor) or a simple form. For MVP, use inline editing with a client component `CategoryEditor` that calls `updateCategory` server action.

**Step 3: Add to sidebar nav**

In `components/dashboard/sidebar-nav.tsx`, add to the Content group:
```typescript
{ label: 'Categories', href: '/dashboard/categories', icon: Tag },
```

Import `Tag` from lucide-react.

Add `/dashboard/categories` to the Content group's `basePaths` array.

**Step 4: Commit**

```bash
git add app/dashboard/categories/page.tsx components/dashboard/sidebar-nav.tsx
git commit -m "feat: add dashboard categories page with inline editing"
```

---

### Task 10: Build Verification & Cleanup

**Step 1: Run build**
```bash
source ~/.nvm/nvm.sh && nvm use 20 && npm run build
```
Expected: Clean build, no type errors.

**Step 2: Run lint**
```bash
npm run lint
```
Expected: No new lint errors introduced.

**Step 3: Verify all category-related pages compile**
Check the build output includes:
- `ƒ /resources/blog/[category]`
- `ƒ /resources/blog`
- `ƒ /dashboard/categories`
- `ƒ /sitemap.xml`

**Step 4: Final commit if any cleanup needed**

```bash
git commit -m "fix: address build/lint issues from dynamic categories implementation"
```

**Step 5: Merge to main and push**

```bash
git checkout main && git merge DEVELOPMENT && git push origin main
git checkout DEVELOPMENT && git push origin DEVELOPMENT
```

---

## Post-Deploy Steps (Manual)

1. **Run the migration** on Supabase SQL editor — copy contents of `supabase/migrations/20260323000000_blog_categories.sql`
2. **Verify seeding** — check that `blog_categories` has rows matching your existing blog post categories
3. **Run the content engine** — generate a new post and verify it either reuses an existing category or creates a new one with SEO metadata
4. **Check category page** — visit `/resources/blog/{slug}` and verify real posts appear with SEO metadata
5. **Edit a category** — go to `/dashboard/categories`, edit SEO metadata, verify it updates on the public page
