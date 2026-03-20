-- Create seo_reports table for storing AI-generated SEO audit reports
create table if not exists seo_reports (
  id uuid primary key default gen_random_uuid(),
  generated_at timestamptz not null default now(),
  report_html text not null,
  stats_snapshot jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

-- Enable RLS
alter table seo_reports enable row level security;

-- Allow authenticated users to read and insert reports
create policy "Authenticated users full access to seo_reports"
  on seo_reports for all to authenticated using (true) with check (true);

-- Add ai_suggestions column to seo_audit_log (used by SEO dashboard)
alter table seo_audit_log
  add column if not exists ai_suggestions jsonb;
