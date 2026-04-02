# ClickUp Content Workflow — Full Content + Auto-Publish via Webhook

**Date:** 2026-03-19
**Status:** Approved

## Problem

Content drafts created by the AI engine show only a summary in ClickUp. Reviewing requires jumping to the dashboard. Publishing requires manually clicking "Approve" in the dashboard after reviewing in ClickUp.

## Solution

Two changes:

### 1. Full content in ClickUp task description

Include the complete MDX content in the ClickUp task description so the entire post can be read and reviewed without leaving ClickUp. Store `clickup_task_id` on the `content_drafts` row for bidirectional linking.

**Changes:**
- Migration: add `clickup_task_id text` column to `content_drafts`
- `clickup-notify.ts`: include full `draft.content` in the task description
- `route.ts` (generate pipeline): after ClickUp task creation, save `clickup_task_id` back to the draft row

### 2. Auto-publish when ClickUp task moves to "Approved"

A webhook endpoint receives `taskStatusUpdated` events from ClickUp. When the new status is "approved", it looks up the draft by `clickup_task_id` and runs the existing `approveDraft()` publish logic.

**Data flow:**
```
ClickUp task moved to "Approved"
  -> ClickUp webhook POST /api/webhooks/clickup
  -> Verify webhook signature (CLICKUP_WEBHOOK_SECRET)
  -> Extract task_id from payload
  -> Look up content_drafts where clickup_task_id = task_id
  -> Run publish logic (copy to blog_posts/how_to_guides, mark published)
  -> Return 200
```

**New files:**
- `app/api/webhooks/clickup/route.ts` — webhook handler
- `scripts/setup-clickup-webhook.ts` — one-time script to register webhook via ClickUp API

**New env vars:**
- `CLICKUP_WEBHOOK_SECRET` — for verifying webhook signatures

**Safety:**
- Only publishes when new status is "approved" (case-insensitive)
- Ignores all other status changes
- Idempotent: already-published drafts are skipped
- Webhook signature verification prevents spoofing

**Webhook registration:**
- Done via ClickUp API (not UI, which requires higher-tier plan)
- One-time setup script using existing `CLICKUP_API_KEY`
- Listens for `taskStatusUpdated` on the Content list
- Endpoint: `https://xyren.me/api/webhooks/clickup`

## No changes to

- Database schema beyond the one new column
- Existing dashboard approve/reject/revise flows (still work independently)
- Cron-based content generation (unchanged)
