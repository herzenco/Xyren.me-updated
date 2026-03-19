alter table content_drafts
add column if not exists clickup_task_id text;

create index if not exists content_drafts_clickup_task_id
  on content_drafts(clickup_task_id)
  where clickup_task_id is not null;
