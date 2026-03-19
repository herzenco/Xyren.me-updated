# Xyren.me Content Engine & Website Completion — Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Fix the existing site, build an AI content engine that generates daily blog posts and how-to guides with cover images, delivers them via email for approval, and publishes approved content to the live site.

**Architecture:** Cron-triggered Next.js API routes on Vercel call Claude API for content generation and Google Gemini (Nano Banana) for images. Content drafts live in Supabase, approval via email reply (Resend inbound) or dashboard UI. A weekly SEO audit cron checks all pages and reports to `/dashboard/seo`.

**Tech Stack:** Next.js 16 App Router, TypeScript, Supabase SSR, Resend, `@anthropic-ai/sdk`, `@google/generative-ai`, `next-mdx-remote`, `googleapis`, shadcn/ui, Tailwind CSS v4

---

## Environment Variables Needed

Before starting, ensure `.env.local` has:
```
# Existing
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...
NEXT_PUBLIC_SITE_URL=http://localhost:3000
CONTACT_EMAIL=hello@xyren.me
CLICKUP_API_KEY=...
CLICKUP_TEAM_ID=...
CLICKUP_LEADS_LIST_ID=...
RESEND_API_KEY=...

# New — add before Phase 2
ANTHROPIC_API_KEY=...
GOOGLE_GEMINI_API_KEY=...
RESEND_INBOUND_SECRET=...

# New — add before Phase 4
GOOGLE_GSC_CLIENT_EMAIL=...
GOOGLE_GSC_PRIVATE_KEY=...
GOOGLE_GA4_PROPERTY_ID=...
```

---

## Phase 1 — Foundation (Website Fixes + Schema)

### Task 1: Fix blog table name bug and wire blog listing to Supabase

**Files:**
- Modify: `app/resources/blog/page.tsx:21`
- Modify: `app/resources/blog/[category]/[slug]/page.tsx:12-65`

**Step 1: Fix the table name in blog listing**

In `app/resources/blog/page.tsx`, change line 21:
```typescript
// BEFORE
.from('posts')
// AFTER
.from('blog_posts')
```

Also add `.eq('is_published', true)` filter:
```typescript
async function getPosts() {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('blog_posts')
    .select('*')
    .eq('is_published', true)
    .order('published_at', { ascending: false })

  if (error) {
    console.error('Error fetching blog posts:', error)
    return []
  }

  return data ?? []
}
```

**Step 2: Replace hardcoded data in blog post detail page**

Replace the entire `getPost` function in `app/resources/blog/[category]/[slug]/page.tsx`:
```typescript
import { createClient } from '@/lib/supabase/server'

async function getPost(category: string, slug: string) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('blog_posts')
    .select('*')
    .eq('slug', slug)
    .eq('category', category)
    .eq('is_published', true)
    .single()

  if (error || !data) return null
  return data
}
```

**Step 3: Verify**

Run: `source ~/.nvm/nvm.sh && nvm use 20 && npm run dev`

Navigate to `http://localhost:8000/resources/blog` — should show "No blog posts found" (empty DB is correct, no error).

**Step 4: Commit**
```bash
git add app/resources/blog/page.tsx app/resources/blog/[category]/[slug]/page.tsx
git commit -m "fix: wire blog listing and detail to blog_posts table"
```

---

### Task 2: Install new dependencies

**Step 1: Install packages**
```bash
source ~/.nvm/nvm.sh && nvm use 20
npm install next-mdx-remote @anthropic-ai/sdk @google/generative-ai googleapis
```

**Step 2: Verify install**
```bash
npm run build
```
Expected: build succeeds with no errors.

**Step 3: Commit**
```bash
git add package.json package-lock.json
git commit -m "chore: add next-mdx-remote, anthropic, gemini, googleapis deps"
```

---

### Task 3: Add MDX rendering to blog post and how-to pages

**Files:**
- Create: `components/mdx-content.tsx`
- Modify: `app/resources/blog/[category]/[slug]/page.tsx`
- Modify: `app/resources/how-to/[slug]/page.tsx`

**Step 1: Create MDX renderer component**

Create `components/mdx-content.tsx`:
```typescript
import { MDXRemote } from 'next-mdx-remote/rsc'

interface Props {
  source: string
}

export function MDXContent({ source }: Props) {
  return (
    <div className="prose prose-neutral dark:prose-invert max-w-none
      prose-headings:font-extrabold prose-headings:tracking-tight
      prose-h1:text-3xl prose-h2:text-2xl prose-h3:text-xl
      prose-a:text-primary prose-a:no-underline hover:prose-a:underline
      prose-code:bg-muted prose-code:px-1 prose-code:py-0.5 prose-code:rounded prose-code:text-sm
      prose-pre:bg-muted prose-pre:border prose-pre:border-border
      prose-img:rounded-xl prose-img:shadow-md">
      <MDXRemote source={source} />
    </div>
  )
}
```

**Step 2: Replace `<pre>` with MDXContent in blog post page**

In `app/resources/blog/[category]/[slug]/page.tsx`, replace:
```typescript
// REMOVE this import and block:
<div className="prose prose-neutral dark:prose-invert max-w-none">
  <pre className="whitespace-pre-wrap font-sans text-base leading-relaxed">{post.content}</pre>
</div>

// ADD:
import { MDXContent } from '@/components/mdx-content'
// ...
<MDXContent source={post.content} />
```

**Step 3: Install Tailwind typography plugin**
```bash
npm install @tailwindcss/typography
```

Add to `tailwind.config.ts` (or equivalent config):
```typescript
plugins: [require('@tailwindcss/typography')]
```

**Step 4: Verify**

Run build and open a blog post URL. Content should render with proper headings, not as `<pre>`.

**Step 5: Commit**
```bash
git add components/mdx-content.tsx app/resources/blog/[category]/[slug]/page.tsx
git commit -m "feat: add MDX rendering for blog and how-to content"
```

---

### Task 4: Wire Resend for contact form email notifications

**Files:**
- Modify: `app/api/contact/route.ts`
- Create: `lib/email.ts`

**Step 1: Create email utility**

Create `lib/email.ts`:
```typescript
import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

export async function sendContactConfirmation(to: string, name: string) {
  await resend.emails.send({
    from: 'Xyren.me <hello@xyren.me>',
    to,
    subject: "We received your message — we'll be in touch soon",
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Hi ${name},</h2>
        <p>Thanks for reaching out! We've received your message and will get back to you within 1 business day.</p>
        <p>In the meantime, feel free to explore our <a href="https://xyren.me/resources/blog">blog</a> for tips on growing your service business online.</p>
        <br/>
        <p>— The Xyren.me Team</p>
      </div>
    `,
  })
}

export async function sendContactNotification(submission: {
  name: string
  email: string
  phone?: string | null
  business?: string | null
  service?: string | null
  message: string
}) {
  const contact = process.env.CONTACT_EMAIL ?? 'hello@xyren.me'
  await resend.emails.send({
    from: 'Xyren.me <hello@xyren.me>',
    to: contact,
    subject: `New contact from ${submission.business || submission.name}`,
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>New Contact Submission</h2>
        <table style="width:100%; border-collapse: collapse;">
          <tr><td><strong>Name</strong></td><td>${submission.name}</td></tr>
          <tr><td><strong>Email</strong></td><td>${submission.email}</td></tr>
          <tr><td><strong>Phone</strong></td><td>${submission.phone || '—'}</td></tr>
          <tr><td><strong>Business</strong></td><td>${submission.business || '—'}</td></tr>
          <tr><td><strong>Service</strong></td><td>${submission.service || '—'}</td></tr>
        </table>
        <h3>Message</h3>
        <p>${submission.message}</p>
      </div>
    `,
  })
}
```

**Step 2: Call email helpers from contact route**

In `app/api/contact/route.ts`, after the submission is saved and before returning success:
```typescript
import { sendContactConfirmation, sendContactNotification } from '@/lib/email'

// After the ClickUp sync block, before the return:
try {
  await Promise.all([
    sendContactConfirmation(data.email, data.name),
    sendContactNotification({
      name: data.name,
      email: data.email,
      phone: data.phone,
      business: data.business,
      service: data.service,
      message: data.message,
    }),
  ])
} catch (emailError) {
  console.error('Email notification error:', emailError)
  // Don't fail the request if email fails
}
```

**Step 3: Verify**

Submit the contact form locally. Check console — no email errors (Resend will work in prod with a real API key; locally it may log a warning).

**Step 4: Commit**
```bash
git add lib/email.ts app/api/contact/route.ts
git commit -m "feat: add Resend email notifications for contact form submissions"
```

---

### Task 5: Create Supabase migrations for content engine tables

**Files:**
- Create: `supabase/migrations/20260317000000_content_engine.sql`

**Step 1: Write migration**

Create `supabase/migrations/20260317000000_content_engine.sql`:
```sql
-- content_drafts: AI-generated content awaiting approval
create table if not exists content_drafts (
  id uuid primary key default gen_random_uuid(),
  type text not null check (type in ('blog', 'how-to')),
  title text not null,
  slug text unique,
  excerpt text,
  content text,
  cover_image_url text,
  tags text[],
  category text,
  status text not null default 'pending'
    check (status in ('pending', 'changes_requested', 'approved', 'published', 'rejected')),
  ai_model text,
  topic_reasoning text,
  seo_keywords text[],
  -- SEO fields
  seo_title text,
  meta_description text,
  focus_keyword text,
  secondary_keywords text[],
  keyword_density numeric,
  readability_score numeric,
  internal_links text[],
  external_links text[],
  schema_markup jsonb,
  og_title text,
  og_description text,
  seo_score integer,
  -- Approval workflow
  email_sent_at timestamptz,
  approved_at timestamptz,
  published_at timestamptz,
  requested_changes text,
  revision_count integer default 0,
  reading_time integer,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create trigger content_drafts_updated_at
  before update on content_drafts
  for each row execute function handle_updated_at();

create index if not exists content_drafts_status on content_drafts(status);
create index if not exists content_drafts_type on content_drafts(type);
create index if not exists content_drafts_created_at on content_drafts(created_at);

-- content_performance: analytics per published post
create table if not exists content_performance (
  id uuid primary key default gen_random_uuid(),
  post_id uuid,
  post_type text not null check (post_type in ('blog', 'how-to')),
  views integer default 0,
  avg_time_on_page numeric default 0,
  bounce_rate numeric default 0,
  social_shares integer default 0,
  recorded_at timestamptz default now()
);

create index if not exists content_performance_post_id on content_performance(post_id);

-- content_settings: single-row config
create table if not exists content_settings (
  id uuid primary key default gen_random_uuid(),
  daily_schedule_time text default '08:00',
  auto_publish_after_approval boolean default false,
  target_keywords text[] default array[]::text[],
  excluded_topics text[] default array[]::text[],
  site_niche_context text default 'Xyren.me builds fast, modern websites and handles digital marketing for service-based small businesses (plumbers, electricians, cleaners, landscapers, etc.) in under 2 weeks.',
  updated_at timestamptz default now()
);

-- Seed default settings row
insert into content_settings (id) values (gen_random_uuid())
  on conflict do nothing;

-- seo_audit_log: weekly crawl results
create table if not exists seo_audit_log (
  id uuid primary key default gen_random_uuid(),
  page_url text not null,
  status_code integer,
  indexed boolean,
  canonical_url text,
  meta_title text,
  meta_description text,
  issues text[],
  last_checked_at timestamptz default now()
);

create index if not exists seo_audit_log_url on seo_audit_log(page_url);
create index if not exists seo_audit_log_checked_at on seo_audit_log(last_checked_at);

-- RLS: authenticated users can read/write all content tables
alter table content_drafts enable row level security;
alter table content_performance enable row level security;
alter table content_settings enable row level security;
alter table seo_audit_log enable row level security;

create policy "Authenticated users full access to content_drafts"
  on content_drafts for all to authenticated using (true) with check (true);

create policy "Authenticated users full access to content_performance"
  on content_performance for all to authenticated using (true) with check (true);

create policy "Authenticated users full access to content_settings"
  on content_settings for all to authenticated using (true) with check (true);

create policy "Authenticated users full access to seo_audit_log"
  on seo_audit_log for all to authenticated using (true) with check (true);
```

**Step 2: Run migration**

In Supabase dashboard → SQL editor, paste and run the migration. Or via CLI:
```bash
npx supabase db push
```

**Step 3: Update database types**

Add the new types to `types/database.types.ts` — add these table definitions after the existing ones in the `Tables` object:

```typescript
content_drafts: {
  Row: {
    id: string
    type: 'blog' | 'how-to'
    title: string
    slug: string | null
    excerpt: string | null
    content: string | null
    cover_image_url: string | null
    tags: string[] | null
    category: string | null
    status: 'pending' | 'changes_requested' | 'approved' | 'published' | 'rejected'
    ai_model: string | null
    topic_reasoning: string | null
    seo_keywords: string[] | null
    seo_title: string | null
    meta_description: string | null
    focus_keyword: string | null
    secondary_keywords: string[] | null
    keyword_density: number | null
    readability_score: number | null
    internal_links: string[] | null
    external_links: string[] | null
    schema_markup: Record<string, unknown> | null
    og_title: string | null
    og_description: string | null
    seo_score: number | null
    email_sent_at: string | null
    approved_at: string | null
    published_at: string | null
    requested_changes: string | null
    revision_count: number
    reading_time: number | null
    created_at: string
    updated_at: string
  }
  Insert: {
    id?: string
    type: 'blog' | 'how-to'
    title: string
    slug?: string | null
    excerpt?: string | null
    content?: string | null
    cover_image_url?: string | null
    tags?: string[] | null
    category?: string | null
    status?: 'pending' | 'changes_requested' | 'approved' | 'published' | 'rejected'
    ai_model?: string | null
    topic_reasoning?: string | null
    seo_keywords?: string[] | null
    seo_title?: string | null
    meta_description?: string | null
    focus_keyword?: string | null
    secondary_keywords?: string[] | null
    keyword_density?: number | null
    readability_score?: number | null
    internal_links?: string[] | null
    external_links?: string[] | null
    schema_markup?: Record<string, unknown> | null
    og_title?: string | null
    og_description?: string | null
    seo_score?: number | null
    email_sent_at?: string | null
    approved_at?: string | null
    published_at?: string | null
    requested_changes?: string | null
    revision_count?: number
    reading_time?: number | null
    created_at?: string
    updated_at?: string
  }
  Update: Partial<Omit<content_drafts['Insert'], 'id'>>
}
content_settings: {
  Row: {
    id: string
    daily_schedule_time: string
    auto_publish_after_approval: boolean
    target_keywords: string[]
    excluded_topics: string[]
    site_niche_context: string
    updated_at: string
  }
  Insert: {
    id?: string
    daily_schedule_time?: string
    auto_publish_after_approval?: boolean
    target_keywords?: string[]
    excluded_topics?: string[]
    site_niche_context?: string
    updated_at?: string
  }
  Update: Partial<content_settings['Insert']>
}
```

**Step 4: Commit**
```bash
git add supabase/migrations/20260317000000_content_engine.sql types/database.types.ts
git commit -m "feat: add content engine database schema and types"
```

---

### Task 6: Create Supabase Storage bucket for content images

**Step 1: Create bucket via Supabase dashboard**

Go to Supabase → Storage → New bucket:
- Name: `content-images`
- Public: Yes (images need to be publicly accessible)

**Step 2: Create storage helper**

Create `lib/storage.ts`:
```typescript
import { createAdminClient } from '@/lib/supabase/admin'

export async function uploadContentImage(
  imageBuffer: Buffer,
  filename: string,
  contentType = 'image/png'
): Promise<string> {
  const supabase = createAdminClient()
  const path = `covers/${Date.now()}-${filename}`

  const { error } = await supabase.storage
    .from('content-images')
    .upload(path, imageBuffer, { contentType, upsert: false })

  if (error) throw new Error(`Storage upload failed: ${error.message}`)

  const { data } = supabase.storage.from('content-images').getPublicUrl(path)
  return data.publicUrl
}
```

**Step 3: Commit**
```bash
git add lib/storage.ts
git commit -m "feat: add Supabase Storage helper for content images"
```

---

### Task 7: Seed initial blog content

**Files:**
- Create: `scripts/seed-content.ts`

**Step 1: Create seed script**

Create `scripts/seed-content.ts`:
```typescript
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

const blogPosts = [
  {
    title: '7 Reasons Your Service Business Website Isn\'t Getting Calls',
    slug: '7-reasons-website-not-getting-calls',
    category: 'seo',
    excerpt: 'Most service business websites make the same mistakes. Here\'s what to fix first.',
    content: `# 7 Reasons Your Service Business Website Isn't Getting Calls\n\nYour website is live. But the phone isn't ringing...\n\n## 1. Your phone number is hard to find\n\nOn mobile, your number should be at the very top — as a tap-to-call button.\n\n## 2. Your site loads too slowly\n\nGoogle penalizes slow sites. Image compression goes a long way.\n\n## 3. You're not ranking locally\n\nIf you're not in the top 3 local results, most customers won't find you.\n\n## 4. No clear call to action\n\nEvery page needs to tell visitors exactly what to do next.\n\n## 5. Your reviews aren't visible\n\n93% of people read reviews before hiring. Put them front and center.\n\n## 6. Not mobile-optimized\n\nOver 70% of local searches happen on mobile.\n\n## 7. Content doesn't answer questions\n\nGoogle rewards content that answers what your customers are searching for.\n\n---\n\n*Ready to fix all of these? [Get a free quote →](/)*`,
    author: 'Xyren.me Team',
    tags: ['SEO', 'websites', 'service business'],
    reading_time: 6,
    is_published: true,
    published_at: new Date('2026-01-15').toISOString(),
  },
  {
    title: 'How Much Should a Small Business Website Cost in 2026?',
    slug: 'small-business-website-cost-2026',
    category: 'business',
    excerpt: 'The real breakdown of what you\'ll pay — and what you\'ll get — at every price point.',
    content: `# How Much Should a Small Business Website Cost in 2026?\n\nPricing varies wildly — from $500 to $50,000. Here's what you actually need.\n\n## DIY Builders ($10–$30/month)\n\nWix, Squarespace, and GoDaddy are fine for very basic presence. But they're slow, hard to customize, and terrible for SEO.\n\n## Freelancers ($1,000–$5,000)\n\nA good freelancer can build you something solid. The risk: availability, quality, and ongoing support.\n\n## Agencies ($5,000–$50,000+)\n\nFull-service agencies handle strategy, design, and development. Worth it for complex projects.\n\n## Modern Bundled Services ($200–$500/month)\n\nServices like Xyren.me build you a fast, professional website and handle all the marketing — for a predictable monthly fee.\n\n## What You Actually Need\n\nFor most service businesses: speed, mobile-optimization, local SEO, and a clear path to contact you. You don't need to spend $20k to get that.\n\n---\n\n*See our pricing → [xyren.me/#pricing](/)*`,
    author: 'Xyren.me Team',
    tags: ['pricing', 'websites', 'business'],
    reading_time: 5,
    is_published: true,
    published_at: new Date('2026-02-01').toISOString(),
  },
  {
    title: 'Local SEO in 2026: What Actually Moves the Needle for Service Businesses',
    slug: 'local-seo-2026-service-businesses',
    category: 'seo',
    excerpt: 'Stop chasing algorithm updates. These fundamentals work — and they\'re what Google cares about.',
    content: `# Local SEO in 2026: What Actually Moves the Needle\n\nMost local SEO advice is noise. Here's what genuinely works.\n\n## Google Business Profile is Non-Negotiable\n\nClaim and fully complete your profile. Add photos weekly. Respond to every review.\n\n## Consistent NAP Everywhere\n\nName, Address, Phone — must be identical on your website, GBP, Yelp, and every directory.\n\n## Reviews Drive Rankings\n\nAim for 20+ Google reviews. Ask every happy customer. Make it easy with a direct review link.\n\n## Location Pages Work\n\nIf you serve multiple towns, create a dedicated page for each one. Write real content — not just 'We serve Springfield.'\n\n## Page Speed Matters More Than Ever\n\nCore Web Vitals are a ranking factor. A slow site is an invisible site.\n\n## Schema Markup Helps\n\nLocalBusiness JSON-LD schema helps Google understand your business type, hours, and service area.\n\n---\n\n*Let us handle your local SEO → [Get started](/)*`,
    author: 'Xyren.me Team',
    tags: ['local SEO', 'Google Business Profile', 'rankings'],
    reading_time: 7,
    is_published: true,
    published_at: new Date('2026-02-20').toISOString(),
  },
]

const howToGuides = [
  {
    title: 'How to Set Up Your Google Business Profile in 15 Minutes',
    slug: 'set-up-google-business-profile',
    difficulty: 'beginner' as const,
    excerpt: 'Step-by-step: claim your listing, fill it out correctly, and start ranking in Google Maps.',
    content: `# How to Set Up Your Google Business Profile in 15 Minutes\n\nGoogle Business Profile is the single most important thing a local service business can do online — and it's free.\n\n## Step 1: Go to business.google.com\n\nClick "Manage now" and sign in with a Google account you'll use for your business.\n\n## Step 2: Enter your business name\n\nSearch for your business first. If it already exists (Google sometimes creates listings automatically), claim it. Otherwise, create a new one.\n\n## Step 3: Choose your business category\n\nBe specific. Not just "Contractor" — use "General Contractor" or "Plumber" or "House Cleaning Service."\n\n## Step 4: Add your service area\n\nIf you go to customers (plumber, electrician, cleaner), choose "I deliver goods and services to my customers" and add your service area cities.\n\n## Step 5: Add your phone number and website\n\nMake sure these exactly match what's on your website.\n\n## Step 6: Verify your listing\n\nGoogle will mail a postcard with a PIN (5–7 days). Enter it to verify.\n\n## Step 7: Complete your profile\n\n- Add business hours\n- Upload 10+ photos (exterior, interior, team, work examples)\n- Write a keyword-rich description\n- Add your services with descriptions and prices\n\n## Next Steps\n\nAsk your first 5 customers to leave a Google review. Respond to every review, positive or negative.`,
    tags: ['Google Business Profile', 'local SEO', 'beginner'],
    reading_time: 8,
    is_published: true,
    published_at: new Date('2026-01-20').toISOString(),
  },
  {
    title: 'How to Get Your First 10 Google Reviews',
    slug: 'get-first-10-google-reviews',
    difficulty: 'beginner' as const,
    excerpt: 'The exact process to go from zero reviews to 10 in your first month — without being spammy.',
    content: `# How to Get Your First 10 Google Reviews\n\nReviews are the fastest way to build trust with new customers. Here's the exact process.\n\n## Why 10 Reviews Matters\n\nStudies show that businesses with 10+ reviews see dramatically higher click-through rates. It's the threshold where customers start trusting you.\n\n## Step 1: Create a direct review link\n\nIn Google Business Profile → Home → Get more reviews → copy the link. Shorten it with bit.ly.\n\n## Step 2: Ask immediately after great work\n\nThe best time to ask is right when you finish a job and the customer is happy. "I'm so glad everything worked out — if you have 30 seconds, a Google review would mean the world to us."\n\n## Step 3: Send a follow-up text\n\n"Hi [Name], it was great working with you today! Here's a direct link to leave us a Google review if you have a moment: [link]"\n\n## Step 4: Add it to your email signature\n\n"Happy with our service? Leave us a Google review: [link]"\n\n## Step 5: Put it on your invoice\n\nAdd a QR code that links directly to your review page on every invoice or receipt.\n\n## What NOT to Do\n\n- Don't offer incentives for reviews (against Google's policy)\n- Don't ask for reviews in bulk from customers who haven't used you recently\n- Don't ask customers to use devices at your location\n\n## Responding to Reviews\n\nRespond to every review within 24 hours. For positive ones: thank them and mention a specific detail. For negative ones: apologize, take responsibility, and offer to make it right offline.`,
    tags: ['reviews', 'Google', 'reputation'],
    reading_time: 6,
    is_published: true,
    published_at: new Date('2026-02-10').toISOString(),
  },
]

async function seed() {
  console.log('Seeding blog posts...')
  for (const post of blogPosts) {
    const { error } = await supabase.from('blog_posts').upsert(post, { onConflict: 'slug' })
    if (error) console.error(`Failed to seed ${post.slug}:`, error)
    else console.log(`✓ ${post.title}`)
  }

  console.log('\nSeeding how-to guides...')
  for (const guide of howToGuides) {
    const { error } = await supabase.from('how_to_guides').upsert(guide, { onConflict: 'slug' })
    if (error) console.error(`Failed to seed ${guide.slug}:`, error)
    else console.log(`✓ ${guide.title}`)
  }

  console.log('\nDone!')
}

seed().catch(console.error)
```

**Step 2: Run the seed script**
```bash
source ~/.nvm/nvm.sh && nvm use 20
npx tsx scripts/seed-content.ts
```

Expected output:
```
Seeding blog posts...
✓ 7 Reasons Your Service Business Website Isn't Getting Calls
✓ How Much Should a Small Business Website Cost in 2026?
✓ Local SEO in 2026: What Actually Moves the Needle...
Seeding how-to guides...
✓ How to Set Up Your Google Business Profile...
✓ How to Get Your First 10 Google Reviews
Done!
```

**Step 3: Verify in browser**

Navigate to `http://localhost:8000/resources/blog` — should show 3 posts.

**Step 4: Commit**
```bash
git add scripts/seed-content.ts
git commit -m "feat: add content seed script with 3 blog posts and 2 how-to guides"
```

---

## Phase 2 — Content Engine Core

### Task 8: Build Claude content generation service

**Files:**
- Create: `lib/content-engine/claude.ts`

**Step 1: Create the Claude service**

Create `lib/content-engine/claude.ts`:
```typescript
import Anthropic from '@anthropic-ai/sdk'
import { createAdminClient } from '@/lib/supabase/admin'

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

export interface TopicDecision {
  type: 'blog' | 'how-to'
  title: string
  slug: string
  category: string
  target_keyword: string
  secondary_keywords: string[]
  reasoning: string
  estimated_search_volume_tier: 'high' | 'medium' | 'low'
}

export interface GeneratedContent {
  title: string
  slug: string
  type: 'blog' | 'how-to'
  category: string
  excerpt: string
  content: string // MDX
  tags: string[]
  reading_time: number
  seo_title: string
  meta_description: string
  focus_keyword: string
  secondary_keywords: string[]
  og_title: string
  og_description: string
  schema_markup: Record<string, unknown>
  internal_links: string[]
  seo_score: number
  topic_reasoning: string
  keyword_density: number
  readability_score: number
}

async function buildContext(): Promise<string> {
  const supabase = createAdminClient()

  const [postsResult, guidesResult, settingsResult, performanceResult] = await Promise.all([
    supabase.from('blog_posts').select('title, slug, category, tags, published_at').eq('is_published', true).order('published_at', { ascending: false }).limit(50),
    supabase.from('how_to_guides').select('title, slug, difficulty, tags, published_at').eq('is_published', true).order('published_at', { ascending: false }).limit(20),
    supabase.from('content_settings').select('*').single(),
    supabase.from('content_performance').select('post_id, post_type, views, avg_time_on_page').order('views', { ascending: false }).limit(10),
  ])

  const posts = postsResult.data ?? []
  const guides = guidesResult.data ?? []
  const settings = settingsResult.data
  const topPerformers = performanceResult.data ?? []

  return `
SITE CONTEXT: ${settings?.site_niche_context ?? 'Xyren.me builds websites and handles digital marketing for service-based small businesses.'}

EXISTING BLOG POSTS (${posts.length} total):
${posts.map(p => `- "${p.title}" [${p.category}] [${(p.tags ?? []).join(', ')}]`).join('\n')}

EXISTING HOW-TO GUIDES (${guides.length} total):
${guides.map(g => `- "${g.title}" [${g.difficulty}]`).join('\n')}

TOP PERFORMING CONTENT (by views):
${topPerformers.map(p => `- post_id: ${p.post_id} (${p.post_type}) — ${p.views} views, ${Math.round(p.avg_time_on_page)}s avg time`).join('\n') || 'No performance data yet — use balanced content mix.'}

TARGET KEYWORDS TO PRIORITIZE: ${(settings?.target_keywords ?? []).join(', ') || 'local SEO, service business website, small business digital marketing'}

EXCLUDED TOPICS: ${(settings?.excluded_topics ?? []).join(', ') || 'none'}

TODAY'S DATE: ${new Date().toISOString().split('T')[0]}
DAY OF WEEK: ${new Date().toLocaleDateString('en-US', { weekday: 'long' })}
`
}

export async function selectTopic(context: string): Promise<TopicDecision> {
  const response = await anthropic.messages.create({
    model: 'claude-opus-4-6',
    max_tokens: 1024,
    messages: [{
      role: 'user',
      content: `You are an expert content strategist for a web design and digital marketing agency targeting service-based small businesses.

${context}

Select the best content topic to publish today. Avoid any topic already covered in existing content. Pick topics with real search demand that service business owners would search for.

Respond with ONLY valid JSON (no markdown, no explanation):
{
  "type": "blog" or "how-to",
  "title": "exact title string",
  "slug": "url-slug-format",
  "category": "one of: seo, marketing, design, business, technology",
  "target_keyword": "primary keyword phrase",
  "secondary_keywords": ["keyword2", "keyword3"],
  "reasoning": "2-3 sentences explaining why this topic now",
  "estimated_search_volume_tier": "high" or "medium" or "low"
}`
    }]
  })

  const text = response.content[0].type === 'text' ? response.content[0].text : ''
  return JSON.parse(text) as TopicDecision
}

export async function generateContent(topic: TopicDecision, context: string): Promise<GeneratedContent> {
  const isHowTo = topic.type === 'how-to'

  const response = await anthropic.messages.create({
    model: 'claude-opus-4-6',
    max_tokens: 4096,
    messages: [{
      role: 'user',
      content: `You are an expert content writer for a web design and digital marketing agency targeting service-based small businesses (plumbers, electricians, cleaners, landscapers, etc.).

Write a complete ${isHowTo ? 'how-to guide' : 'blog post'} for:
Title: ${topic.title}
Target keyword: ${topic.target_keyword}
Secondary keywords: ${topic.secondary_keywords.join(', ')}

REQUIREMENTS:
- Write in MDX format (use # for H1, ## for H2, ### for H3, **bold**, *italic*, etc.)
- 800-1200 words for blog posts, 1000-1500 words for how-to guides
- Include the target keyword naturally in the first paragraph, at least 2 H2s, and the conclusion
- Add internal links where relevant using markdown: [anchor text](/resources/blog/category/slug)
- Known internal content: ${context.split('EXISTING BLOG POSTS')[1]?.split('EXISTING HOW-TO')[0]?.trim() ?? ''}
- End with a clear CTA linking to /#contact or /#pricing
- Write for a non-technical audience — clear, practical, actionable

Respond with ONLY valid JSON (no markdown wrapper):
{
  "title": "${topic.title}",
  "slug": "${topic.slug}",
  "type": "${topic.type}",
  "category": "${topic.category}",
  "excerpt": "2 sentence summary, max 160 chars",
  "content": "full MDX content string with escaped newlines as \\n",
  "tags": ["tag1", "tag2", "tag3"],
  "reading_time": 6,
  "seo_title": "SEO title under 60 chars",
  "meta_description": "meta description under 155 chars",
  "focus_keyword": "${topic.target_keyword}",
  "secondary_keywords": ${JSON.stringify(topic.secondary_keywords)},
  "og_title": "OG title",
  "og_description": "OG description under 200 chars",
  "schema_markup": { "@context": "https://schema.org", "@type": "Article", "headline": "${topic.title}" },
  "internal_links": ["/resources/blog/seo/example-slug"],
  "topic_reasoning": "${topic.reasoning}"
}`
    }]
  })

  const text = response.content[0].type === 'text' ? response.content[0].text : ''
  const parsed = JSON.parse(text)

  // Calculate reading time and keyword density
  const wordCount = parsed.content.split(/\s+/).length
  parsed.reading_time = Math.max(1, Math.ceil(wordCount / 200))

  const keywordCount = (parsed.content.toLowerCase().match(new RegExp(topic.target_keyword.toLowerCase(), 'g')) ?? []).length
  parsed.keyword_density = Math.round((keywordCount / wordCount) * 1000) / 10

  return parsed as GeneratedContent
}

export async function reviewSEO(content: GeneratedContent): Promise<GeneratedContent & { seo_score: number; readability_score: number }> {
  const response = await anthropic.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 1024,
    messages: [{
      role: 'user',
      content: `You are an SEO expert. Review this content and return a JSON score report.

Title: ${content.title}
Focus keyword: ${content.focus_keyword}
Meta description: ${content.meta_description} (${content.meta_description.length} chars)
Word count: ${content.content.split(/\s+/).length}
Keyword density: ${content.keyword_density}%

Content preview (first 500 chars): ${content.content.substring(0, 500)}

Score each factor 0-20, return total 0-100 seo_score and 0-100 readability_score.

Respond with ONLY valid JSON:
{
  "seo_score": 85,
  "readability_score": 78,
  "issues": ["issue1", "issue2"]
}`
    }]
  })

  const text = response.content[0].type === 'text' ? response.content[0].text : '{}'
  const review = JSON.parse(text)

  return {
    ...content,
    seo_score: review.seo_score ?? 70,
    readability_score: review.readability_score ?? 70,
  }
}

export async function reviseContent(draft: { content: string; title: string }, requestedChanges: string): Promise<string> {
  const response = await anthropic.messages.create({
    model: 'claude-opus-4-6',
    max_tokens: 4096,
    messages: [{
      role: 'user',
      content: `You are a content editor. Apply the requested changes to this blog post.

TITLE: ${draft.title}

CURRENT CONTENT:
${draft.content}

REQUESTED CHANGES:
${requestedChanges}

Return ONLY the revised MDX content string, no JSON wrapper, no explanation.`
    }]
  })

  return response.content[0].type === 'text' ? response.content[0].text : draft.content
}
```

**Step 2: Verify TypeScript compiles**
```bash
source ~/.nvm/nvm.sh && nvm use 20 && npx tsc --noEmit
```
Expected: no errors.

**Step 3: Commit**
```bash
git add lib/content-engine/claude.ts
git commit -m "feat: add Claude content generation service (topic selection, writing, SEO review)"
```

---

### Task 9: Build Nano Banana (Gemini) image generation service

**Files:**
- Create: `lib/content-engine/image-gen.ts`

**Step 1: Create image generation service**

Create `lib/content-engine/image-gen.ts`:
```typescript
import { GoogleGenAI } from '@google/generative-ai'
import { uploadContentImage } from '@/lib/storage'

const genAI = new GoogleGenAI({ apiKey: process.env.GOOGLE_GEMINI_API_KEY! })

export async function generateCoverImage(title: string, excerpt: string): Promise<string> {
  const prompt = `Professional blog cover image for an article titled "${title}".
Abstract, modern, clean design. Dark navy blue background with cyan and violet accents.
No text. Suitable for a web design agency blog. Minimalist, geometric, professional.
Context: ${excerpt.substring(0, 100)}`

  const response = await genAI.models.generateContent({
    model: 'gemini-2.0-flash-preview-image-generation',
    contents: prompt,
    config: {
      responseModalities: ['TEXT', 'IMAGE'],
    },
  })

  const parts = response.candidates?.[0]?.content?.parts ?? []
  const imagePart = parts.find((p: any) => p.inlineData?.mimeType?.startsWith('image/'))

  if (!imagePart?.inlineData) {
    throw new Error('Nano Banana returned no image data')
  }

  const imageBuffer = Buffer.from(imagePart.inlineData.data, 'base64')
  const filename = `${Date.now()}-cover.png`
  const publicUrl = await uploadContentImage(imageBuffer, filename, imagePart.inlineData.mimeType)

  return publicUrl
}
```

**Step 2: TypeScript check**
```bash
npx tsc --noEmit
```

**Step 3: Commit**
```bash
git add lib/content-engine/image-gen.ts
git commit -m "feat: add Nano Banana (Gemini) cover image generation service"
```

---

### Task 10: Build the main content generation API route

**Files:**
- Create: `app/api/content/generate/route.ts`

**Step 1: Create the pipeline route**

Create `app/api/content/generate/route.ts`:
```typescript
import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { buildContext, selectTopic, generateContent, reviewSEO } from '@/lib/content-engine/claude'
import { generateCoverImage } from '@/lib/content-engine/image-gen'
import { sendDraftPreviewEmail } from '@/lib/email'

// Vercel: allow long-running execution
export const maxDuration = 300

// Protect this route — only callable by cron or with secret
function isAuthorized(request: NextRequest): boolean {
  const authHeader = request.headers.get('authorization')
  const cronSecret = process.env.CRON_SECRET
  if (!cronSecret) return process.env.NODE_ENV === 'development'
  return authHeader === `Bearer ${cronSecret}`
}

export async function POST(request: NextRequest) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const supabase = createAdminClient()

  try {
    // 1. Build context from existing content + performance data
    console.log('[ContentEngine] Building context...')
    const context = await buildContext()

    // 2. Claude Pass 1: Select topic
    console.log('[ContentEngine] Selecting topic...')
    const topic = await selectTopic(context)
    console.log(`[ContentEngine] Topic selected: ${topic.title}`)

    // 3. Claude Pass 2: Generate content
    console.log('[ContentEngine] Generating content...')
    const rawContent = await generateContent(topic, context)

    // 4. Claude Pass 3: SEO review
    console.log('[ContentEngine] Running SEO review...')
    const content = await reviewSEO(rawContent)
    console.log(`[ContentEngine] SEO score: ${content.seo_score}/100`)

    // 5. Generate cover image
    let coverImageUrl: string | null = null
    try {
      console.log('[ContentEngine] Generating cover image...')
      coverImageUrl = await generateCoverImage(content.title, content.excerpt)
      console.log('[ContentEngine] Cover image generated:', coverImageUrl)
    } catch (imgError) {
      console.error('[ContentEngine] Image generation failed (continuing without image):', imgError)
    }

    // 6. Save draft to Supabase
    const { data: draft, error: draftError } = await supabase
      .from('content_drafts')
      .insert({
        type: content.type,
        title: content.title,
        slug: content.slug,
        excerpt: content.excerpt,
        content: content.content,
        cover_image_url: coverImageUrl,
        tags: content.tags,
        category: content.category,
        status: 'pending',
        ai_model: 'claude-opus-4-6',
        topic_reasoning: content.topic_reasoning,
        seo_keywords: [content.focus_keyword, ...content.secondary_keywords],
        seo_title: content.seo_title,
        meta_description: content.meta_description,
        focus_keyword: content.focus_keyword,
        secondary_keywords: content.secondary_keywords,
        keyword_density: content.keyword_density,
        readability_score: content.readability_score,
        internal_links: content.internal_links,
        schema_markup: content.schema_markup,
        og_title: content.og_title,
        og_description: content.og_description,
        seo_score: content.seo_score,
        reading_time: content.reading_time,
      })
      .select()
      .single()

    if (draftError || !draft) {
      throw new Error(`Failed to save draft: ${draftError?.message}`)
    }

    // 7. Send preview email
    try {
      await sendDraftPreviewEmail(draft)
      await supabase
        .from('content_drafts')
        .update({ email_sent_at: new Date().toISOString() })
        .eq('id', draft.id)
    } catch (emailError) {
      console.error('[ContentEngine] Email send failed:', emailError)
    }

    console.log(`[ContentEngine] Done! Draft ID: ${draft.id}`)
    return NextResponse.json({ success: true, draftId: draft.id, title: content.title, seoScore: content.seo_score })

  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    console.error('[ContentEngine] Pipeline failed:', message)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
```

**Step 2: Add CRON_SECRET to `.env.local`**
```
CRON_SECRET=your-random-secret-here-generate-with-openssl-rand-hex-32
```

**Step 3: TypeScript check**
```bash
npx tsc --noEmit
```

**Step 4: Commit**
```bash
git add app/api/content/generate/route.ts
git commit -m "feat: add /api/content/generate pipeline route"
```

---

### Task 11: Configure Vercel Cron

**Files:**
- Create: `vercel.json`

**Step 1: Create vercel.json**

Create `vercel.json` at project root:
```json
{
  "crons": [
    {
      "path": "/api/content/generate",
      "schedule": "0 8 * * *"
    },
    {
      "path": "/api/seo/audit",
      "schedule": "0 6 * * 1"
    }
  ]
}
```

Note: Vercel Cron calls the route with a `Authorization: Bearer <CRON_SECRET>` header automatically when you set `CRON_SECRET` in Vercel environment variables.

Actually, Vercel Cron does NOT automatically add auth headers. We need to use `x-vercel-signature` or just the `CRON_SECRET` env var. Update the auth check in the generate route:

In `app/api/content/generate/route.ts`, update `isAuthorized`:
```typescript
function isAuthorized(request: NextRequest): boolean {
  // Vercel Cron sets this header automatically
  const isVercelCron = request.headers.get('x-vercel-cron') === '1'
  if (isVercelCron) return true

  // Manual trigger with secret
  const authHeader = request.headers.get('authorization')
  const cronSecret = process.env.CRON_SECRET
  if (cronSecret && authHeader === `Bearer ${cronSecret}`) return true

  return process.env.NODE_ENV === 'development'
}
```

**Step 2: Test manual trigger in development**
```bash
curl -X POST http://localhost:8000/api/content/generate \
  -H "Authorization: Bearer $(grep CRON_SECRET .env.local | cut -d= -f2)"
```

Expected: `{"success":true,"draftId":"...","title":"...","seoScore":...}`

**Step 3: Commit**
```bash
git add vercel.json app/api/content/generate/route.ts
git commit -m "feat: configure Vercel Cron for daily content generation and weekly SEO audit"
```

---

## Phase 3 — Approval Workflow

### Task 12: Build draft preview email template

**Files:**
- Modify: `lib/email.ts`

**Step 1: Add `sendDraftPreviewEmail` to `lib/email.ts`**

Add this function to `lib/email.ts`:
```typescript
export async function sendDraftPreviewEmail(draft: {
  id: string
  title: string
  type: string
  excerpt: string | null
  content: string | null
  cover_image_url: string | null
  seo_score: number | null
  focus_keyword: string | null
  meta_description: string | null
  readability_score: number | null
  topic_reasoning: string | null
  category: string | null
}) {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://xyren.me'
  const approveUrl = `${siteUrl}/dashboard/content?approve=${draft.id}`
  const replyTo = `approve+${draft.id}@xyren.me`

  const seoColor = (draft.seo_score ?? 0) >= 80 ? '#22c55e' : (draft.seo_score ?? 0) >= 60 ? '#f59e0b' : '#ef4444'

  await resend.emails.send({
    from: 'Xyren Content Engine <content@xyren.me>',
    to: process.env.CONTACT_EMAIL ?? 'hello@xyren.me',
    replyTo,
    subject: `[Draft Ready] ${draft.title}`,
    html: `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width"></head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; max-width: 680px; margin: 0 auto; padding: 20px; background: #f8fafc; color: #1e293b;">

  <div style="background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">

    ${draft.cover_image_url ? `<img src="${draft.cover_image_url}" alt="Cover image" style="width: 100%; height: 240px; object-fit: cover;">` : '<div style="width: 100%; height: 120px; background: linear-gradient(135deg, #0ea5e9, #8b5cf6);"></div>'}

    <div style="padding: 32px;">
      <div style="display: flex; gap: 8px; margin-bottom: 16px;">
        <span style="background: #f1f5f9; padding: 4px 10px; border-radius: 20px; font-size: 12px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em;">${draft.type}</span>
        <span style="background: #f1f5f9; padding: 4px 10px; border-radius: 20px; font-size: 12px;">${draft.category ?? ''}</span>
      </div>

      <h1 style="margin: 0 0 12px; font-size: 24px; font-weight: 800; line-height: 1.3; color: #0f172a;">${draft.title}</h1>
      <p style="margin: 0 0 24px; color: #64748b; line-height: 1.6;">${draft.excerpt ?? ''}</p>

      <!-- SEO Scorecard -->
      <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 16px; margin-bottom: 24px;">
        <h3 style="margin: 0 0 12px; font-size: 13px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em; color: #64748b;">SEO Scorecard</h3>
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px;">
          <div>
            <div style="font-size: 32px; font-weight: 800; color: ${seoColor};">${draft.seo_score ?? '—'}<span style="font-size: 16px; color: #94a3b8;">/100</span></div>
            <div style="font-size: 12px; color: #64748b;">SEO Score</div>
          </div>
          <div>
            <div style="font-size: 32px; font-weight: 800; color: #0ea5e9;">${draft.readability_score ?? '—'}<span style="font-size: 16px; color: #94a3b8;">/100</span></div>
            <div style="font-size: 12px; color: #64748b;">Readability</div>
          </div>
        </div>
        <div style="margin-top: 12px; padding-top: 12px; border-top: 1px solid #e2e8f0;">
          <div style="font-size: 12px; color: #64748b; margin-bottom: 4px;">Focus keyword</div>
          <div style="font-size: 14px; font-weight: 600;">${draft.focus_keyword ?? '—'}</div>
        </div>
        <div style="margin-top: 8px;">
          <div style="font-size: 12px; color: #64748b; margin-bottom: 4px;">Meta description</div>
          <div style="font-size: 13px;">${draft.meta_description ?? '—'}</div>
        </div>
      </div>

      <div style="background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 8px; padding: 12px; margin-bottom: 24px;">
        <strong style="font-size: 12px; color: #15803d;">Why this topic:</strong>
        <p style="margin: 4px 0 0; font-size: 13px; color: #166534;">${draft.topic_reasoning ?? ''}</p>
      </div>

      <!-- CTA Buttons -->
      <div style="display: flex; gap: 12px; margin-bottom: 24px;">
        <a href="${approveUrl}" style="flex: 1; text-align: center; background: #0ea5e9; color: white; padding: 14px 24px; border-radius: 8px; text-decoration: none; font-weight: 700; font-size: 15px;">
          ✓ Approve & Publish
        </a>
        <a href="${siteUrl}/dashboard/content" style="flex: 1; text-align: center; background: #f1f5f9; color: #334155; padding: 14px 24px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 15px;">
          View in Dashboard
        </a>
      </div>

      <div style="background: #fefce8; border: 1px solid #fde68a; border-radius: 8px; padding: 12px; font-size: 13px; color: #92400e;">
        <strong>To request changes:</strong> Reply to this email with your feedback. The AI will revise and send you an updated draft.<br>
        <strong>To approve by email:</strong> Reply with "approve" or "lgtm" and the post will be published automatically.
      </div>
    </div>
  </div>

  <p style="text-align: center; font-size: 11px; color: #94a3b8; margin-top: 16px;">
    Xyren.me Content Engine • Reply-to: ${replyTo}
  </p>
</body>
</html>`,
  })
}
```

**Step 2: TypeScript check**
```bash
npx tsc --noEmit
```

**Step 3: Commit**
```bash
git add lib/email.ts
git commit -m "feat: add draft preview email template with SEO scorecard and approval CTAs"
```

---

### Task 13: Build `/dashboard/content` draft queue UI

**Files:**
- Create: `app/dashboard/content/page.tsx`
- Create: `lib/actions/content.ts`

**Step 1: Create server actions for content drafts**

Create `lib/actions/content.ts`:
```typescript
'use server'

import { createAdminClient } from '@/lib/supabase/admin'
import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { reviseContent } from '@/lib/content-engine/claude'
import { sendDraftPreviewEmail } from '@/lib/email'

export async function approveDraft(draftId: string) {
  const supabase = createAdminClient()

  // Get draft
  const { data: draft, error } = await supabase
    .from('content_drafts')
    .select('*')
    .eq('id', draftId)
    .single()

  if (error || !draft) throw new Error('Draft not found')

  // Copy to blog_posts or how_to_guides
  if (draft.type === 'blog') {
    await supabase.from('blog_posts').insert({
      title: draft.title!,
      slug: draft.slug!,
      category: draft.category!,
      excerpt: draft.excerpt!,
      content: draft.content!,
      cover_image: draft.cover_image_url,
      tags: draft.tags,
      reading_time: draft.reading_time,
      is_published: true,
      published_at: new Date().toISOString(),
      author: 'Xyren.me Team',
    })
  } else {
    await supabase.from('how_to_guides').insert({
      title: draft.title!,
      slug: draft.slug!,
      difficulty: 'beginner',
      excerpt: draft.excerpt!,
      content: draft.content!,
      cover_image: draft.cover_image_url,
      tags: draft.tags,
      reading_time: draft.reading_time,
      is_published: true,
      published_at: new Date().toISOString(),
    })
  }

  // Update draft status
  await supabase
    .from('content_drafts')
    .update({ status: 'published', published_at: new Date().toISOString(), approved_at: new Date().toISOString() })
    .eq('id', draftId)

  revalidatePath('/dashboard/content')
  revalidatePath('/resources/blog')
  revalidatePath('/resources/how-to')
}

export async function rejectDraft(draftId: string) {
  const supabase = createAdminClient()
  await supabase.from('content_drafts').update({ status: 'rejected' }).eq('id', draftId)
  revalidatePath('/dashboard/content')
}

export async function requestChanges(draftId: string, changes: string) {
  const supabase = createAdminClient()

  const { data: draft } = await supabase
    .from('content_drafts')
    .select('*')
    .eq('id', draftId)
    .single()

  if (!draft) throw new Error('Draft not found')

  // Apply changes with Claude
  const revisedContent = await reviseContent(
    { content: draft.content ?? '', title: draft.title },
    changes
  )

  const { data: updatedDraft } = await supabase
    .from('content_drafts')
    .update({
      content: revisedContent,
      status: 'pending',
      requested_changes: changes,
      revision_count: (draft.revision_count ?? 0) + 1,
    })
    .eq('id', draftId)
    .select()
    .single()

  // Send revised email
  if (updatedDraft) {
    await sendDraftPreviewEmail(updatedDraft)
    await supabase
      .from('content_drafts')
      .update({ email_sent_at: new Date().toISOString() })
      .eq('id', draftId)
  }

  revalidatePath('/dashboard/content')
}
```

**Step 2: Create the content dashboard page**

Create `app/dashboard/content/page.tsx`:
```typescript
import { createClient } from '@/lib/supabase/server'
import { PageHeader } from '@/components/dashboard/page-header'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { Clock, TrendingUp, FileText, CheckCircle, XCircle } from 'lucide-react'
import { approveDraft, rejectDraft, requestChanges } from '@/lib/actions/content'
import Image from 'next/image'

const statusColors: Record<string, string> = {
  pending: 'bg-yellow-100 text-yellow-800',
  changes_requested: 'bg-blue-100 text-blue-800',
  approved: 'bg-green-100 text-green-800',
  published: 'bg-gray-100 text-gray-700',
  rejected: 'bg-red-100 text-red-800',
}

export default async function ContentDashboardPage() {
  const supabase = await createClient()
  const { data: drafts } = await (supabase.from('content_drafts') as any)
    .select('*')
    .order('created_at', { ascending: false })
    .limit(50)

  const pending = (drafts ?? []).filter((d: any) => d.status === 'pending' || d.status === 'changes_requested')
  const done = (drafts ?? []).filter((d: any) => d.status === 'published' || d.status === 'rejected' || d.status === 'approved')

  return (
    <div className="space-y-6 p-6">
      <PageHeader
        title="Content Queue"
        description="AI-generated drafts awaiting your review"
      />

      <div className="grid grid-cols-4 gap-4">
        {[
          { label: 'Pending Review', value: pending.length, icon: Clock },
          { label: 'Published', value: done.filter((d: any) => d.status === 'published').length, icon: CheckCircle },
          { label: 'Total Drafts', value: (drafts ?? []).length, icon: FileText },
          { label: 'Avg SEO Score', value: Math.round((drafts ?? []).reduce((a: number, d: any) => a + (d.seo_score ?? 0), 0) / Math.max((drafts ?? []).length, 1)), icon: TrendingUp },
        ].map(({ label, value, icon: Icon }) => (
          <Card key={label}>
            <CardContent className="flex items-center gap-3 pt-4">
              <Icon className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-2xl font-bold">{value}</p>
                <p className="text-xs text-muted-foreground">{label}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Separator />

      <div className="space-y-4">
        <h2 className="text-lg font-semibold">Pending Review ({pending.length})</h2>
        {pending.length === 0 && (
          <p className="text-muted-foreground text-sm">No drafts pending review. The content engine runs daily at 8:00 AM.</p>
        )}
        {pending.map((draft: any) => (
          <DraftCard key={draft.id} draft={draft} />
        ))}
      </div>

      {done.length > 0 && (
        <>
          <Separator />
          <div className="space-y-4">
            <h2 className="text-lg font-semibold">Recent ({done.length})</h2>
            {done.slice(0, 10).map((draft: any) => (
              <DraftCard key={draft.id} draft={draft} compact />
            ))}
          </div>
        </>
      )}
    </div>
  )
}

function DraftCard({ draft, compact = false }: { draft: any; compact?: boolean }) {
  const seoColor = (draft.seo_score ?? 0) >= 80 ? 'text-green-600' : (draft.seo_score ?? 0) >= 60 ? 'text-yellow-600' : 'text-red-600'

  return (
    <Card>
      <CardContent className={compact ? 'pt-4' : 'p-6'}>
        <div className="flex gap-4">
          {draft.cover_image_url && !compact && (
            <div className="relative h-24 w-40 flex-shrink-0 rounded-md overflow-hidden">
              <Image src={draft.cover_image_url} alt={draft.title} fill className="object-cover" />
            </div>
          )}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <Badge variant="outline" className="text-xs capitalize">{draft.type}</Badge>
                  <Badge variant="outline" className="text-xs capitalize">{draft.category}</Badge>
                  <span className={`text-xs font-bold px-2 py-0.5 rounded ${statusColors[draft.status] ?? ''}`}>
                    {draft.status.replace('_', ' ')}
                  </span>
                </div>
                <h3 className="font-bold text-sm leading-snug">{draft.title}</h3>
                {!compact && <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{draft.excerpt}</p>}
              </div>
              <div className="text-right flex-shrink-0">
                <div className={`text-2xl font-extrabold ${seoColor}`}>{draft.seo_score ?? '—'}</div>
                <div className="text-xs text-muted-foreground">SEO score</div>
              </div>
            </div>

            {!compact && draft.topic_reasoning && (
              <p className="text-xs text-muted-foreground mt-2 italic">"{draft.topic_reasoning}"</p>
            )}

            {(draft.status === 'pending' || draft.status === 'changes_requested') && (
              <div className="flex items-center gap-2 mt-3">
                <form action={approveDraft.bind(null, draft.id)}>
                  <Button type="submit" size="sm" className="h-7 text-xs bg-green-600 hover:bg-green-700">
                    <CheckCircle className="h-3 w-3 mr-1" /> Approve & Publish
                  </Button>
                </form>
                <form action={rejectDraft.bind(null, draft.id)}>
                  <Button type="submit" size="sm" variant="outline" className="h-7 text-xs text-red-600 border-red-200 hover:bg-red-50">
                    <XCircle className="h-3 w-3 mr-1" /> Reject
                  </Button>
                </form>
                <ChangesForm draftId={draft.id} />
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

function ChangesForm({ draftId }: { draftId: string }) {
  return (
    <form action={async (formData: FormData) => {
      'use server'
      const changes = formData.get('changes') as string
      if (changes?.trim()) await requestChanges(draftId, changes)
    }} className="flex gap-2">
      <input
        name="changes"
        placeholder="Request changes..."
        className="h-7 text-xs px-2 rounded border border-input bg-background flex-1 min-w-32"
      />
      <Button type="submit" size="sm" variant="outline" className="h-7 text-xs">Send</Button>
    </form>
  )
}
```

**Step 3: Add content to dashboard sidebar**

In `components/dashboard/sidebar-nav.tsx`, add:
```typescript
{ href: '/dashboard/content', label: 'Content', icon: FileText }
```

**Step 4: Verify**
```bash
npm run build
```
Expected: builds clean.

**Step 5: Commit**
```bash
git add app/dashboard/content/page.tsx lib/actions/content.ts components/dashboard/sidebar-nav.tsx
git commit -m "feat: add content dashboard queue with approve/reject/revision actions"
```

---

### Task 14: Build inbound email reply handler

**Files:**
- Create: `app/api/content/email-reply/route.ts`

**Step 1: Create the inbound email webhook**

Create `app/api/content/email-reply/route.ts`:
```typescript
import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { approveDraft, requestChanges } from '@/lib/actions/content'

const APPROVAL_SIGNALS = ['approve', 'approved', 'lgtm', 'publish', 'yes', 'looks good', 'ship it']

function isApproval(body: string): boolean {
  const lower = body.toLowerCase().trim()
  return APPROVAL_SIGNALS.some(signal => lower.includes(signal))
}

function extractDraftId(to: string): string | null {
  // Matches approve+<uuid>@xyren.me
  const match = to.match(/approve\+([a-f0-9-]{36})@/i)
  return match?.[1] ?? null
}

function stripEmailQuotes(text: string): string {
  // Remove quoted reply text (lines starting with >)
  return text
    .split('\n')
    .filter(line => !line.trim().startsWith('>'))
    .join('\n')
    .trim()
}

export async function POST(request: NextRequest) {
  // Verify webhook secret
  const secret = request.headers.get('x-resend-signature') ?? request.headers.get('x-webhook-secret')
  if (process.env.RESEND_INBOUND_SECRET && secret !== process.env.RESEND_INBOUND_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const payload = await request.json()

  // Resend inbound email payload shape
  const to: string = payload.to ?? payload.envelope?.to ?? ''
  const textBody: string = payload.text ?? payload.plain_text ?? ''
  const cleanBody = stripEmailQuotes(textBody)

  const draftId = extractDraftId(to)
  if (!draftId) {
    return NextResponse.json({ error: 'Could not extract draft ID from reply-to address' }, { status: 400 })
  }

  // Verify draft exists
  const supabase = createAdminClient()
  const { data: draft } = await supabase
    .from('content_drafts')
    .select('id, status, title')
    .eq('id', draftId)
    .single()

  if (!draft) {
    return NextResponse.json({ error: 'Draft not found' }, { status: 404 })
  }

  if (draft.status === 'published' || draft.status === 'rejected') {
    return NextResponse.json({ message: 'Draft already processed' })
  }

  if (isApproval(cleanBody)) {
    await approveDraft(draftId)
    return NextResponse.json({ success: true, action: 'approved', draftId })
  } else if (cleanBody.length > 5) {
    await requestChanges(draftId, cleanBody)
    return NextResponse.json({ success: true, action: 'changes_requested', draftId })
  }

  return NextResponse.json({ message: 'No action taken — body too short or unrecognized' })
}
```

**Step 2: Register Resend inbound webhook**

In Resend dashboard → Domains → your domain → Inbound:
- Set inbound email address pattern: `approve+*@xyren.me`
- Webhook URL: `https://xyren.me/api/content/email-reply`
- Copy the signing secret → set as `RESEND_INBOUND_SECRET` in env

**Step 3: Commit**
```bash
git add app/api/content/email-reply/route.ts
git commit -m "feat: add inbound email reply handler for draft approval workflow"
```

---

## Phase 4 — SEO Layer

### Task 15: Fix generateMetadata across all dynamic routes

**Files:**
- Modify: `app/resources/how-to/[slug]/page.tsx`
- Modify: `app/resources/faq/page.tsx`
- Modify: `app/use-cases/professional-services/page.tsx`
- Modify: `app/use-cases/home-services/page.tsx`

**Step 1: Check current metadata in how-to slug page**

Read `app/resources/how-to/[slug]/page.tsx` — if `generateMetadata` is missing or incomplete, add:
```typescript
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const guide = await getGuide(slug)
  if (!guide) return {}

  return {
    title: `${guide.title} — Xyren.me`,
    description: guide.excerpt,
    alternates: { canonical: `${siteConfig.url}/resources/how-to/${slug}` },
    openGraph: {
      title: guide.title,
      description: guide.excerpt,
      type: 'article',
      publishedTime: guide.published_at ?? undefined,
      images: guide.cover_image ? [{ url: guide.cover_image }] : undefined,
    },
  }
}
```

Repeat for FAQ, use-case pages with appropriate static metadata.

**Step 2: Add JSON-LD to blog posts**

In `app/resources/blog/[category]/[slug]/page.tsx`, add after `<head>`:
```typescript
import { JsonLd } from '@/components/json-ld'

// In the JSX, add inside the article:
<JsonLd
  data={{
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: post.title,
    description: post.excerpt,
    datePublished: post.published_at,
    dateModified: post.updated_at,
    author: { '@type': 'Organization', name: 'Xyren.me' },
    publisher: { '@type': 'Organization', name: 'Xyren.me', url: siteConfig.url },
    image: post.cover_image ?? undefined,
    url: `${siteConfig.url}/resources/blog/${post.category}/${post.slug}`,
  }}
/>
```

**Step 3: Verify sitemap includes all routes**

Read `app/sitemap.ts` and verify it includes `/resources/blog`, `/resources/how-to`, `/resources/faq`, `/use-cases/*`. If not, fetch blog posts and how-to guides from Supabase and include their dynamic URLs.

**Step 4: Verify robots.txt**

Read `app/robots.ts` or `public/robots.txt`. Ensure it allows all public routes and blocks `/dashboard` and `/api`.

**Step 5: Commit**
```bash
git add app/resources/ app/use-cases/ app/sitemap.ts app/robots.ts
git commit -m "fix: add generateMetadata and JSON-LD to all dynamic routes, fix sitemap"
```

---

### Task 16: Create OG image

**Files:**
- Create: `public/og-image.png`

**Step 1: Generate OG image**

Option A — Create a simple 1200×630 branded image using any design tool (Figma, Canva) with:
- Dark navy background (#0a0f1e)
- "Xyren.me" in white/cyan text
- Tagline: "Websites & Marketing for Service Businesses"
- Save as `public/og-image.png`

Option B — Use Next.js OG image generation. Create `app/og/route.tsx`:
```typescript
import { ImageResponse } from 'next/og'

export const runtime = 'edge'

export async function GET() {
  return new ImageResponse(
    (
      <div style={{
        width: '100%', height: '100%',
        background: 'linear-gradient(135deg, #0a0f1e 0%, #0f1a2e 100%)',
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        fontFamily: 'sans-serif',
      }}>
        <div style={{ fontSize: 72, fontWeight: 900, color: '#00d4ff', letterSpacing: '-2px' }}>
          Xyren.me
        </div>
        <div style={{ fontSize: 28, color: '#94a3b8', marginTop: 16 }}>
          Websites & Marketing for Service Businesses
        </div>
      </div>
    ),
    { width: 1200, height: 630 }
  )
}
```

Update `lib/config.ts` to point `ogImage` to `/og` route.

**Step 2: Commit**
```bash
git add public/og-image.png  # or app/og/route.tsx
git commit -m "feat: add OG image for social sharing"
```

---

### Task 17: Build `/api/seo/audit` weekly cron

**Files:**
- Create: `app/api/seo/audit/route.ts`

**Step 1: Create SEO audit route**

Create `app/api/seo/audit/route.ts`:
```typescript
import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { Resend } from 'resend'

export const maxDuration = 300

const resend = new Resend(process.env.RESEND_API_KEY)

const STATIC_ROUTES = [
  '/',
  '/resources/blog',
  '/resources/how-to',
  '/resources/faq',
  '/use-cases/professional-services',
  '/use-cases/home-services',
]

function isAuthorized(request: NextRequest): boolean {
  const isVercelCron = request.headers.get('x-vercel-cron') === '1'
  if (isVercelCron) return true
  const authHeader = request.headers.get('authorization')
  return process.env.NODE_ENV === 'development' || authHeader === `Bearer ${process.env.CRON_SECRET}`
}

interface AuditResult {
  page_url: string
  status_code: number
  indexed: boolean
  canonical_url: string | null
  meta_title: string | null
  meta_description: string | null
  issues: string[]
}

async function auditPage(url: string): Promise<AuditResult> {
  const issues: string[] = []
  let statusCode = 0
  let metaTitle: string | null = null
  let metaDescription: string | null = null
  let canonicalUrl: string | null = null

  try {
    const response = await fetch(url, { method: 'GET' })
    statusCode = response.status

    if (statusCode !== 200) {
      issues.push(`Non-200 status: ${statusCode}`)
    }

    const html = await response.text()

    const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i)
    metaTitle = titleMatch?.[1]?.trim() ?? null
    if (!metaTitle) issues.push('Missing <title> tag')
    else if (metaTitle.length > 60) issues.push(`Title too long: ${metaTitle.length} chars (max 60)`)

    const descMatch = html.match(/<meta[^>]+name="description"[^>]+content="([^"]+)"/i)
    metaDescription = descMatch?.[1]?.trim() ?? null
    if (!metaDescription) issues.push('Missing meta description')
    else if (metaDescription.length > 160) issues.push(`Meta description too long: ${metaDescription.length} chars`)

    const canonicalMatch = html.match(/<link[^>]+rel="canonical"[^>]+href="([^"]+)"/i)
    canonicalUrl = canonicalMatch?.[1]?.trim() ?? null
    if (!canonicalUrl) issues.push('Missing canonical tag')

    const hasNoindex = /content="[^"]*noindex[^"]*"/i.test(html)
    if (hasNoindex) issues.push('Page has noindex tag')

  } catch (err) {
    statusCode = 0
    issues.push(`Fetch failed: ${err instanceof Error ? err.message : 'unknown error'}`)
  }

  return {
    page_url: url,
    status_code: statusCode,
    indexed: statusCode === 200 && !issues.some(i => i.includes('noindex')),
    canonical_url: canonicalUrl,
    meta_title: metaTitle,
    meta_description: metaDescription,
    issues,
  }
}

export async function POST(request: NextRequest) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const supabase = createAdminClient()
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://xyren.me'

  // Get dynamic routes from DB
  const [blogsResult, guidesResult] = await Promise.all([
    supabase.from('blog_posts').select('slug, category').eq('is_published', true),
    supabase.from('how_to_guides').select('slug').eq('is_published', true),
  ])

  const allRoutes = [
    ...STATIC_ROUTES,
    ...(blogsResult.data ?? []).map(p => `/resources/blog/${p.category}/${p.slug}`),
    ...(guidesResult.data ?? []).map(g => `/resources/how-to/${g.slug}`),
  ]

  const results: AuditResult[] = []
  for (const route of allRoutes) {
    const result = await auditPage(`${siteUrl}${route}`)
    results.push(result)
  }

  // Save to DB (upsert by URL)
  await supabase.from('seo_audit_log').upsert(
    results.map(r => ({ ...r, last_checked_at: new Date().toISOString() })),
    { onConflict: 'page_url' }
  )

  const issueCount = results.filter(r => r.issues.length > 0).length
  const totalIssues = results.reduce((a, r) => a + r.issues.length, 0)

  // Send weekly report email
  await resend.emails.send({
    from: 'Xyren.me SEO <content@xyren.me>',
    to: process.env.CONTACT_EMAIL ?? 'hello@xyren.me',
    subject: `Weekly SEO Report — ${issueCount} pages with issues`,
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h2>Weekly SEO Audit Report</h2>
        <p>Scanned <strong>${results.length} pages</strong> — found <strong>${totalIssues} issues</strong> across <strong>${issueCount} pages</strong>.</p>
        <h3>Pages with Issues</h3>
        ${results.filter(r => r.issues.length > 0).map(r => `
          <div style="border: 1px solid #e2e8f0; border-radius: 8px; padding: 12px; margin-bottom: 8px;">
            <strong>${r.page_url}</strong> — Status: ${r.status_code}
            <ul>${r.issues.map(i => `<li>${i}</li>`).join('')}</ul>
          </div>
        `).join('')}
        <p><a href="${siteUrl}/dashboard/seo">View full report in dashboard →</a></p>
      </div>
    `,
  })

  return NextResponse.json({ success: true, pagesScanned: results.length, issuesFound: totalIssues })
}
```

**Step 2: Commit**
```bash
git add app/api/seo/audit/route.ts
git commit -m "feat: add weekly SEO audit cron with email report"
```

---

### Task 18: Build `/dashboard/seo` page

**Files:**
- Create: `app/dashboard/seo/page.tsx`

**Step 1: Create the SEO dashboard page**

Create `app/dashboard/seo/page.tsx`:
```typescript
import { createClient } from '@/lib/supabase/server'
import { PageHeader } from '@/components/dashboard/page-header'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { AlertCircle, CheckCircle, ExternalLink } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default async function SEODashboardPage() {
  const supabase = await createClient()

  const { data: auditLogs } = await (supabase.from('seo_audit_log') as any)
    .select('*')
    .order('last_checked_at', { ascending: false })
    .limit(100)

  const logs = auditLogs ?? []
  const withIssues = logs.filter((l: any) => l.issues?.length > 0)
  const indexed = logs.filter((l: any) => l.indexed)

  return (
    <div className="space-y-6 p-6">
      <PageHeader
        title="SEO Dashboard"
        description="Weekly site audit results and indexing status"
      />

      <div className="grid grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-4">
            <p className="text-2xl font-bold">{logs.length}</p>
            <p className="text-xs text-muted-foreground">Pages Scanned</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <p className="text-2xl font-bold text-green-600">{indexed.length}</p>
            <p className="text-xs text-muted-foreground">Indexed</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <p className="text-2xl font-bold text-red-500">{withIssues.length}</p>
            <p className="text-xs text-muted-foreground">Pages with Issues</p>
          </CardContent>
        </Card>
      </div>

      {logs.length === 0 && (
        <div className="text-center py-12 text-muted-foreground">
          <p>No audit data yet. The SEO audit runs every Monday at 6:00 AM.</p>
          <form action="/api/seo/audit" method="POST" className="mt-4">
            <Button type="submit" variant="outline">Run Audit Now</Button>
          </form>
        </div>
      )}

      {withIssues.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <AlertCircle className="h-4 w-4 text-red-500" /> Pages Needing Attention
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {withIssues.map((log: any) => (
                <div key={log.id} className="flex items-start justify-between gap-4 p-3 rounded-lg border">
                  <div className="min-w-0">
                    <p className="text-sm font-medium truncate">{log.page_url}</p>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {(log.issues ?? []).map((issue: string, i: number) => (
                        <Badge key={i} variant="outline" className="text-xs text-red-600 border-red-200">{issue}</Badge>
                      ))}
                    </div>
                  </div>
                  <a href={log.page_url} target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="h-4 w-4 text-muted-foreground mt-0.5" />
                  </a>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <CheckCircle className="h-4 w-4 text-green-500" /> All Pages
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {logs.map((log: any) => (
              <div key={log.id} className="flex items-center justify-between text-sm py-1.5 border-b last:border-0">
                <span className="text-muted-foreground truncate max-w-xs">{log.page_url}</span>
                <div className="flex items-center gap-3 flex-shrink-0">
                  <Badge variant={log.status_code === 200 ? 'outline' : 'destructive'} className="text-xs">
                    {log.status_code}
                  </Badge>
                  {log.indexed
                    ? <CheckCircle className="h-3.5 w-3.5 text-green-500" />
                    : <AlertCircle className="h-3.5 w-3.5 text-red-400" />
                  }
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
```

**Step 2: Add SEO link to dashboard sidebar**

In `components/dashboard/sidebar-nav.tsx`, add:
```typescript
{ href: '/dashboard/seo', label: 'SEO', icon: Search }
```

**Step 3: Commit**
```bash
git add app/dashboard/seo/page.tsx components/dashboard/sidebar-nav.tsx
git commit -m "feat: add /dashboard/seo page showing audit results and indexing status"
```

---

## Phase 5 — Intelligence & Analytics

### Task 19: Wire GA4 data to analytics dashboard

**Files:**
- Modify: `app/dashboard/analytics/page.tsx`

**Step 1: Check current analytics page**

Read `app/dashboard/analytics/page.tsx` to see what's already there.

**Step 2: Create GA4 service**

Create `lib/analytics.ts`:
```typescript
import { BetaAnalyticsDataClient } from '@google-analytics/data'

const analyticsClient = new BetaAnalyticsDataClient({
  credentials: {
    client_email: process.env.GOOGLE_GSC_CLIENT_EMAIL,
    private_key: process.env.GOOGLE_GSC_PRIVATE_KEY?.replace(/\\n/g, '\n'),
  },
})

const propertyId = process.env.GOOGLE_GA4_PROPERTY_ID!

export async function getTopPages(days = 28) {
  const [response] = await analyticsClient.runReport({
    property: `properties/${propertyId}`,
    dateRanges: [{ startDate: `${days}daysAgo`, endDate: 'today' }],
    dimensions: [{ name: 'pagePath' }],
    metrics: [
      { name: 'screenPageViews' },
      { name: 'averageSessionDuration' },
      { name: 'bounceRate' },
    ],
    orderBys: [{ metric: { metricName: 'screenPageViews' }, desc: true }],
    limit: 20,
  })

  return (response.rows ?? []).map(row => ({
    path: row.dimensionValues?.[0]?.value ?? '',
    views: parseInt(row.metricValues?.[0]?.value ?? '0'),
    avgDuration: parseFloat(row.metricValues?.[1]?.value ?? '0'),
    bounceRate: parseFloat(row.metricValues?.[2]?.value ?? '0'),
  }))
}

export async function getSiteStats(days = 28) {
  const [response] = await analyticsClient.runReport({
    property: `properties/${propertyId}`,
    dateRanges: [{ startDate: `${days}daysAgo`, endDate: 'today' }],
    metrics: [
      { name: 'totalUsers' },
      { name: 'screenPageViews' },
      { name: 'sessions' },
      { name: 'bounceRate' },
    ],
  })

  const row = response.rows?.[0]
  return {
    users: parseInt(row?.metricValues?.[0]?.value ?? '0'),
    pageViews: parseInt(row?.metricValues?.[1]?.value ?? '0'),
    sessions: parseInt(row?.metricValues?.[2]?.value ?? '0'),
    bounceRate: parseFloat(row?.metricValues?.[3]?.value ?? '0'),
  }
}
```

**Step 3: Update analytics dashboard**

Update `app/dashboard/analytics/page.tsx` to call `getSiteStats()` and `getTopPages()` and display the results in a clean table. Wrap in try/catch so it shows a "Connect GA4" message if credentials aren't configured yet.

**Step 4: Commit**
```bash
git add lib/analytics.ts app/dashboard/analytics/page.tsx
git commit -m "feat: wire GA4 data to analytics dashboard"
```

---

### Task 20: Feed performance data back into content engine

**Files:**
- Create: `app/api/content/sync-performance/route.ts`

**Step 1: Create performance sync route**

Create `app/api/content/sync-performance/route.ts`:
```typescript
import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { getTopPages } from '@/lib/analytics'

export const maxDuration = 60

export async function POST(request: NextRequest) {
  const isVercelCron = request.headers.get('x-vercel-cron') === '1'
  const authHeader = request.headers.get('authorization')
  if (!isVercelCron && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const supabase = createAdminClient()

  try {
    const topPages = await getTopPages(28)

    // Match GA4 paths to published posts
    const [blogsResult, guidesResult] = await Promise.all([
      supabase.from('blog_posts').select('id, slug, category'),
      supabase.from('how_to_guides').select('id, slug'),
    ])

    const blogMap = new Map(
      (blogsResult.data ?? []).map(p => [`/resources/blog/${p.category}/${p.slug}`, { id: p.id, type: 'blog' }])
    )
    const guideMap = new Map(
      (guidesResult.data ?? []).map(g => [`/resources/how-to/${g.slug}`, { id: g.id, type: 'how-to' }])
    )

    for (const page of topPages) {
      const blog = blogMap.get(page.path)
      const guide = guideMap.get(page.path)
      const match = blog ?? guide
      if (!match) continue

      await supabase.from('content_performance').upsert({
        post_id: match.id,
        post_type: match.type,
        views: page.views,
        avg_time_on_page: page.avgDuration,
        bounce_rate: page.bounceRate,
        recorded_at: new Date().toISOString(),
      }, { onConflict: 'post_id' })
    }

    return NextResponse.json({ success: true, pagesProcessed: topPages.length })
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Unknown error' }, { status: 500 })
  }
}
```

**Step 2: Add to vercel.json cron schedule**

In `vercel.json`, add:
```json
{
  "path": "/api/content/sync-performance",
  "schedule": "0 5 * * *"
}
```

This runs daily at 5 AM, before content generation at 8 AM, so Claude always has fresh performance data.

**Step 3: Commit**
```bash
git add app/api/content/sync-performance/route.ts vercel.json
git commit -m "feat: add daily GA4 performance sync to feed content engine intelligence"
```

---

## Final Checklist Before Launch

- [ ] All env vars set in Vercel dashboard (ANTHROPIC_API_KEY, GOOGLE_GEMINI_API_KEY, RESEND_API_KEY, RESEND_INBOUND_SECRET, CRON_SECRET)
- [ ] Supabase migrations applied to production
- [ ] Supabase Storage bucket `content-images` created (public)
- [ ] Resend domain verified for `xyren.me`
- [ ] Resend inbound routing configured for `approve+*@xyren.me`
- [ ] Google Cloud service account created with GA4 + GSC read access
- [ ] Vercel project deployed with latest DEVELOPMENT branch changes
- [ ] Manual test: `curl -X POST https://xyren.me/api/content/generate -H "Authorization: Bearer <CRON_SECRET>"`
- [ ] Verify draft appears in `/dashboard/content`
- [ ] Verify preview email received at `hello@xyren.me`
- [ ] Verify reply "approve" publishes the post
- [ ] Verify post appears at `/resources/blog/...`
- [ ] Run manual SEO audit: `curl -X POST https://xyren.me/api/seo/audit -H "Authorization: Bearer <CRON_SECRET>"`
- [ ] Verify audit report appears in `/dashboard/seo`
