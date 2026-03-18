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

-- Reuse the handle_updated_at() function that already exists from the initial migration
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
  page_url text not null unique,
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
