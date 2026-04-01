-- Add password_hash column for email/password authentication
alter table auth_users add column if not exists password_hash text;
