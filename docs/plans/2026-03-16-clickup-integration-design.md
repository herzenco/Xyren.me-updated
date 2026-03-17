# ClickUp Integration Design

**Date**: 2026-03-16
**Feature**: Contact form submissions → ClickUp Leads list
**Status**: Approved

## Overview

When a contact form is submitted, the submission is saved to Supabase and synced to ClickUp's "Leads" list in the Xyren space. If the sync fails, the submission is flagged for manual retry via the dashboard.

## Data Flow

```
Contact Form Submission
  ↓
POST /api/contact
  ├→ Validate & parse data
  ├→ Save to Supabase with status: 'new'
  ├→ Attempt ClickUp sync
  │  ├→ Success? Update status: 'synced' + store task_id
  │  └→ Failure? Update status: 'sync_pending' + store error_message
  └→ Return 200 (always succeeds for user)
```

## Database Schema

Add columns to `contact_submissions` table:
- `clickup_status` — 'pending' | 'synced' | 'sync_failed'
- `clickup_task_id` — UUID of ClickUp task (if synced)
- `clickup_error` — Error message if sync failed
- `synced_at` — Timestamp when synced
- `retry_count` — Number of retry attempts

## ClickUp Task Structure

Each contact becomes a task in the "Leads" list with:

**Title**: `[Contact] {business || name}`
**Description**:
```
Name: {name}
Email: {email}
Phone: {phone}
Business: {business}
Service: {service}

Message:
{message}
```

**Custom Fields** (map to ClickUp custom fields):
- Email: {email}
- Phone: {phone}
- Business: {business}
- Service: {service}

**List**: Leads (in Xyren space)

## Error Handling

Track failures with:
- Error type/message
- Timestamp
- Retry count

Scenarios handled:
- Invalid ClickUp API key
- List not found
- Rate limiting
- Network timeouts
- Invalid field mapping

## Retry Mechanism

**Manual retry**:
- Dashboard "Retry Sync" button for failed submissions
- Increments `retry_count`
- Attempts sync again, updates status based on result

**Future enhancement**: Auto-retry via cron job (not in scope)

## Environment Variables

Required in `.env.local`:
- `CLICKUP_API_KEY` — ClickUp API token (existing)
- `CLICKUP_TEAM_ID` — Xyren workspace team ID
- `CLICKUP_LEADS_LIST_ID` — The "Leads" list ID

## Implementation Phases

1. **Phase 1**: Create ClickUp utility + update contact API
2. **Phase 2**: Update database schema + add sync status columns
3. **Phase 3**: Add dashboard UI for failed submissions + retry button
4. **Phase 4**: Test end-to-end

## Success Criteria

- ✅ Contact submissions automatically sync to ClickUp Leads list
- ✅ Failed syncs are flagged and visible on dashboard
- ✅ Manual retry works from dashboard
- ✅ All contact data (name, email, phone, business, service, message) is captured
- ✅ Error messages help diagnose sync failures
