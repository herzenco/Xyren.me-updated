-- Create updated_at trigger function
create or replace function handle_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

-- Blog posts table
create table if not exists blog_posts (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text not null unique,
  category text not null,
  excerpt text not null,
  content text not null,
  author text not null default 'Xyren.me Team',
  cover_image text,
  tags text[],
  reading_time integer,
  published_at timestamp with time zone,
  updated_at timestamp with time zone default now(),
  is_published boolean default false,
  created_at timestamp with time zone default now()
);

-- Create trigger for blog_posts updated_at
drop trigger if exists blog_posts_updated_at on blog_posts;
create trigger blog_posts_updated_at
  before update on blog_posts
  for each row
  execute function handle_updated_at();

-- Indexes for blog_posts
create index if not exists blog_posts_slug on blog_posts(slug);
create index if not exists blog_posts_category on blog_posts(category);
create index if not exists blog_posts_published_at on blog_posts(published_at);
create index if not exists blog_posts_is_published on blog_posts(is_published);

-- How-to guides table
create table if not exists how_to_guides (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text not null unique,
  difficulty text not null check (difficulty in ('beginner', 'intermediate', 'advanced')),
  excerpt text not null,
  content text not null,
  cover_image text,
  tags text[],
  reading_time integer,
  published_at timestamp with time zone,
  updated_at timestamp with time zone default now(),
  is_published boolean default false,
  created_at timestamp with time zone default now()
);

-- Create trigger for how_to_guides updated_at
drop trigger if exists how_to_guides_updated_at on how_to_guides;
create trigger how_to_guides_updated_at
  before update on how_to_guides
  for each row
  execute function handle_updated_at();

-- Indexes for how_to_guides
create index if not exists how_to_guides_slug on how_to_guides(slug);
create index if not exists how_to_guides_difficulty on how_to_guides(difficulty);
create index if not exists how_to_guides_published_at on how_to_guides(published_at);
create index if not exists how_to_guides_is_published on how_to_guides(is_published);

-- FAQ items table
create table if not exists faq_items (
  id uuid primary key default gen_random_uuid(),
  question text not null,
  answer text not null,
  category text not null,
  sort_order integer default 0,
  is_published boolean default true,
  updated_at timestamp with time zone default now(),
  created_at timestamp with time zone default now()
);

-- Create trigger for faq_items updated_at
drop trigger if exists faq_items_updated_at on faq_items;
create trigger faq_items_updated_at
  before update on faq_items
  for each row
  execute function handle_updated_at();

-- Indexes for faq_items
create index if not exists faq_items_category on faq_items(category);
create index if not exists faq_items_sort_order on faq_items(sort_order);
create index if not exists faq_items_is_published on faq_items(is_published);

-- Contact submissions table
create table if not exists contact_submissions (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null,
  phone text,
  business text,
  service text,
  message text not null,
  status text default 'new' check (status in ('new', 'reviewed', 'archived')),
  created_at timestamp with time zone default now()
);

-- Indexes for contact_submissions
create index if not exists contact_submissions_status on contact_submissions(status);
create index if not exists contact_submissions_created_at on contact_submissions(created_at);
create index if not exists contact_submissions_email on contact_submissions(email);

-- Row Level Security (RLS)

-- Enable RLS on all tables
alter table blog_posts enable row level security;
alter table how_to_guides enable row level security;
alter table faq_items enable row level security;
alter table contact_submissions enable row level security;

-- Blog posts policies
-- Public can SELECT only published posts
drop policy if exists "blog_posts_select_published" on blog_posts;
create policy "blog_posts_select_published" on blog_posts
  for select using (is_published = true);

-- Authenticated users can do everything
drop policy if exists "blog_posts_all_authenticated" on blog_posts;
create policy "blog_posts_all_authenticated" on blog_posts
  for all using (auth.role() = 'authenticated');

-- How-to guides policies
-- Public can SELECT only published guides
drop policy if exists "how_to_guides_select_published" on how_to_guides;
create policy "how_to_guides_select_published" on how_to_guides
  for select using (is_published = true);

-- Authenticated users can do everything
drop policy if exists "how_to_guides_all_authenticated" on how_to_guides;
create policy "how_to_guides_all_authenticated" on how_to_guides
  for all using (auth.role() = 'authenticated');

-- FAQ items policies
-- Public can SELECT only published items
drop policy if exists "faq_items_select_published" on faq_items;
create policy "faq_items_select_published" on faq_items
  for select using (is_published = true);

-- Authenticated users can do everything
drop policy if exists "faq_items_all_authenticated" on faq_items;
create policy "faq_items_all_authenticated" on faq_items
  for all using (auth.role() = 'authenticated');

-- Contact submissions policies
-- Anonymous users can INSERT
drop policy if exists "contact_submissions_insert_anon" on contact_submissions;
create policy "contact_submissions_insert_anon" on contact_submissions
  for insert with check (true);

-- Authenticated users can do everything
drop policy if exists "contact_submissions_all_authenticated" on contact_submissions;
create policy "contact_submissions_all_authenticated" on contact_submissions
  for all using (auth.role() = 'authenticated');

-- Auth users table (for NextAuth)
create table if not exists auth_users (
  id uuid primary key default gen_random_uuid(),
  email text not null unique,
  name text,
  image text,
  google_id text unique,
  last_login timestamp with time zone,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- Create trigger for auth_users updated_at
drop trigger if exists auth_users_updated_at on auth_users;
create trigger auth_users_updated_at
  before update on auth_users
  for each row
  execute function handle_updated_at();

-- Indexes for auth_users
create index if not exists auth_users_email on auth_users(email);
create index if not exists auth_users_google_id on auth_users(google_id);

-- Auth users policies
alter table auth_users enable row level security;

-- Users can only read their own profile
drop policy if exists "auth_users_select_own" on auth_users;
create policy "auth_users_select_own" on auth_users
  for select using (auth.uid()::text = id::text);

-- Authenticated users can update their own profile
drop policy if exists "auth_users_update_own" on auth_users;
create policy "auth_users_update_own" on auth_users
  for update using (auth.uid()::text = id::text);

-- Service role can do everything
drop policy if exists "auth_users_all_service_role" on auth_users;
create policy "auth_users_all_service_role" on auth_users
  for all using (auth.role() = 'service_role');
