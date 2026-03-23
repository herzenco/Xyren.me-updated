-- Create blog_categories table for dynamic, AI-generated categories with SEO metadata
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

-- Indexes
create index if not exists blog_categories_slug_idx on blog_categories(slug);
create index if not exists blog_categories_post_count_idx on blog_categories(post_count) where post_count > 0;
