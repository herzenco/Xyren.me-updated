# ClickUp Content Workflow Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Include full content in ClickUp tasks and auto-publish drafts when moved to "Approved" in ClickUp via webhook.

**Architecture:** Add `clickup_task_id` column to `content_drafts`, embed full MDX in ClickUp task descriptions, save task ID back to draft row. New webhook endpoint at `/api/webhooks/clickup` receives `taskStatusUpdated` events and triggers the existing publish pipeline. One-time setup script registers the webhook via ClickUp API.

**Tech Stack:** Next.js 16 App Router, Supabase, ClickUp API v2, HMAC signature verification

---

### Task 1: Add `clickup_task_id` column to `content_drafts`

**Files:**
- Create: `supabase/migrations/20260319000000_add_clickup_task_id.sql`

**Step 1: Write the migration**

```sql
alter table content_drafts
add column if not exists clickup_task_id text;

create index if not exists content_drafts_clickup_task_id
  on content_drafts(clickup_task_id)
  where clickup_task_id is not null;
```

**Step 2: Run the migration**

Run: `source ~/.nvm/nvm.sh && nvm use 20 && npx supabase db push`
If using remote Supabase, run the SQL directly in the Supabase SQL editor instead.

**Step 3: Commit**

```bash
git add supabase/migrations/20260319000000_add_clickup_task_id.sql
git commit -m "feat: add clickup_task_id column to content_drafts"
```

---

### Task 2: Include full content in ClickUp task description and return task ID

**Files:**
- Modify: `lib/content-engine/clickup-notify.ts:1-15,32-66`

**Step 1: Add `content` to the ContentDraft interface**

Add `content: string | null` to the `ContentDraft` interface at the top of the file:

```ts
interface ContentDraft {
  id: string
  title: string
  type: string
  category: string | null
  excerpt: string | null
  content: string | null
  seo_score: number | null
  readability_score: number | null
  focus_keyword: string | null
  meta_description: string | null
  topic_reasoning: string | null
  cover_image_url: string | null
  reading_time: number | null
  tags: string[] | null
}
```

**Step 2: Add full content to the description template**

After the existing `### Tags` section and before the dashboard link, add:

```
---

### Full Content

${draft.content ?? 'No content generated'}
```

**Step 3: Verify build**

Run: `source ~/.nvm/nvm.sh && nvm use 20 && npx tsc --noEmit 2>&1 | head -20`
Expected: No new errors

**Step 4: Commit**

```bash
git add lib/content-engine/clickup-notify.ts
git commit -m "feat: include full MDX content in ClickUp task description"
```

---

### Task 3: Save ClickUp task ID back to draft row after creation

**Files:**
- Modify: `app/api/content/generate/route.ts:103-114`

**Step 1: Update the ClickUp notification block to save task ID**

Replace the existing ClickUp notification block (step 7) with:

```ts
    // 7. Notify via ClickUp and save task ID (non-fatal)
    try {
      console.log('[ContentEngine] Creating ClickUp task...')
      const clickupResult = await notifyDraftViaClickUp(draft as any)
      if (clickupResult.success && clickupResult.taskId) {
        console.log(`[ContentEngine] ClickUp task created: ${clickupResult.taskId}`)
        // Save ClickUp task ID back to draft
        await (supabase as any)
          .from('content_drafts')
          .update({ clickup_task_id: clickupResult.taskId })
          .eq('id', draft.id)
      } else {
        console.error('[ContentEngine] ClickUp notification failed:', clickupResult.error)
      }
    } catch (clickupError) {
      console.error('[ContentEngine] ClickUp error (continuing):', clickupError)
    }
```

**Step 2: Verify build**

Run: `source ~/.nvm/nvm.sh && nvm use 20 && npx tsc --noEmit 2>&1 | head -20`
Expected: No new errors

**Step 3: Commit**

```bash
git add app/api/content/generate/route.ts
git commit -m "feat: save ClickUp task ID to content_drafts after creation"
```

---

### Task 4: Create webhook endpoint for ClickUp status changes

**Files:**
- Create: `app/api/webhooks/clickup/route.ts`

**Step 1: Create the webhook handler**

```ts
import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import crypto from 'crypto'

function verifySignature(body: string, signature: string | null, secret: string): boolean {
  if (!signature) return false
  const hmac = crypto.createHmac('sha256', secret)
  hmac.update(body)
  const expected = hmac.digest('hex')
  return crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expected))
}

export async function POST(request: NextRequest) {
  const rawBody = await request.text()
  const signature = request.headers.get('x-signature')
  const webhookSecret = process.env.CLICKUP_WEBHOOK_SECRET

  // Verify signature if secret is configured
  if (webhookSecret && !verifySignature(rawBody, signature, webhookSecret)) {
    console.error('[ClickUp Webhook] Invalid signature')
    return NextResponse.json({ error: 'Invalid signature' }, { status: 401 })
  }

  let payload: any
  try {
    payload = JSON.parse(rawBody)
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  // ClickUp sends a verification request when creating webhooks
  if (payload.event === 'taskStatusUpdated' || payload.event === undefined) {
    // Handle the actual status update
  } else {
    return NextResponse.json({ ok: true })
  }

  const taskId = payload.task_id
  const newStatus = payload.history_items?.[0]?.after?.status?.toLowerCase()

  if (!taskId || newStatus !== 'approved') {
    // Not an approval event — ignore
    return NextResponse.json({ ok: true })
  }

  console.log(`[ClickUp Webhook] Task ${taskId} moved to "approved"`)

  const supabase = createAdminClient()

  // Look up draft by ClickUp task ID
  const { data: draft, error } = await (supabase as any)
    .from('content_drafts')
    .select('*')
    .eq('clickup_task_id', taskId)
    .single()

  if (error || !draft) {
    console.error(`[ClickUp Webhook] No draft found for task ${taskId}`)
    return NextResponse.json({ error: 'Draft not found' }, { status: 404 })
  }

  if (draft.status === 'published') {
    console.log(`[ClickUp Webhook] Draft ${draft.id} already published, skipping`)
    return NextResponse.json({ ok: true, message: 'Already published' })
  }

  // Publish: copy to the appropriate table
  try {
    if (draft.type === 'blog') {
      const { error: insertError } = await supabase.from('blog_posts').insert({
        title: draft.title,
        slug: draft.slug,
        category: draft.category ?? 'general',
        excerpt: draft.excerpt ?? '',
        content: draft.content ?? '',
        cover_image: draft.cover_image_url,
        tags: draft.tags,
        reading_time: draft.reading_time,
        is_published: true,
        published_at: new Date().toISOString(),
        author: 'Xyren.me Team',
      } as any)
      if (insertError) throw new Error(`Failed to publish blog post: ${insertError.message}`)
    } else {
      const { error: insertError } = await supabase.from('how_to_guides').insert({
        title: draft.title,
        slug: draft.slug,
        difficulty: 'beginner' as const,
        excerpt: draft.excerpt ?? '',
        content: draft.content ?? '',
        cover_image: draft.cover_image_url,
        tags: draft.tags,
        reading_time: draft.reading_time,
        is_published: true,
        published_at: new Date().toISOString(),
      } as any)
      if (insertError) throw new Error(`Failed to publish guide: ${insertError.message}`)
    }

    // Mark draft as published
    await (supabase as any)
      .from('content_drafts')
      .update({
        status: 'published',
        published_at: new Date().toISOString(),
        approved_at: new Date().toISOString(),
      })
      .eq('id', draft.id)

    console.log(`[ClickUp Webhook] Draft ${draft.id} published successfully`)
    return NextResponse.json({ ok: true, draftId: draft.id, published: true })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    console.error(`[ClickUp Webhook] Publish failed:`, message)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
```

**Step 2: Verify build**

Run: `source ~/.nvm/nvm.sh && nvm use 20 && npx tsc --noEmit 2>&1 | head -20`
Expected: No new errors

**Step 3: Commit**

```bash
git add app/api/webhooks/clickup/route.ts
git commit -m "feat: add ClickUp webhook endpoint for auto-publish on approval"
```

---

### Task 5: Create webhook registration script

**Files:**
- Create: `scripts/setup-clickup-webhook.ts`

**Step 1: Write the setup script**

```ts
/**
 * One-time script to register a ClickUp webhook for task status updates.
 *
 * Usage:
 *   npx tsx scripts/setup-clickup-webhook.ts
 *
 * Required env vars (from .env.local):
 *   CLICKUP_API_KEY
 *   CLICKUP_TEAM_ID
 *   CLICKUP_CONTENT_LIST_ID
 *   NEXT_PUBLIC_SITE_URL (production URL, e.g. https://xyren.me)
 */

import 'dotenv/config'

async function main() {
  const apiKey = process.env.CLICKUP_API_KEY
  const teamId = process.env.CLICKUP_TEAM_ID
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL

  if (!apiKey || !teamId || !siteUrl) {
    console.error('Missing required env vars: CLICKUP_API_KEY, CLICKUP_TEAM_ID, NEXT_PUBLIC_SITE_URL')
    process.exit(1)
  }

  const endpoint = `${siteUrl}/api/webhooks/clickup`

  console.log(`Registering ClickUp webhook...`)
  console.log(`  Team: ${teamId}`)
  console.log(`  Endpoint: ${endpoint}`)
  console.log(`  Events: taskStatusUpdated`)

  const response = await fetch(`https://api.clickup.com/api/v2/team/${teamId}/webhook`, {
    method: 'POST',
    headers: {
      Authorization: apiKey,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      endpoint,
      events: ['taskStatusUpdated'],
    }),
  })

  if (!response.ok) {
    const text = await response.text()
    console.error(`ClickUp API error ${response.status}: ${text}`)
    process.exit(1)
  }

  const data = await response.json()
  console.log(`\nWebhook created successfully!`)
  console.log(`  Webhook ID: ${data.id}`)
  console.log(`  Secret: ${data.webhook?.secret ?? 'N/A'}`)
  console.log(`\nAdd this to your .env.local:`)
  console.log(`  CLICKUP_WEBHOOK_SECRET=${data.webhook?.secret ?? '<check ClickUp response>'}`)
}

main()
```

**Step 2: Verify it parses**

Run: `source ~/.nvm/nvm.sh && nvm use 20 && npx tsc --noEmit --esModuleInterop scripts/setup-clickup-webhook.ts 2>&1 | head -10`
(This may show errors due to standalone file — that's okay, it runs with tsx directly)

**Step 3: Commit**

```bash
git add scripts/setup-clickup-webhook.ts
git commit -m "feat: add one-time ClickUp webhook registration script"
```

---

### Task 6: Run full build and verify

**Step 1: Run full build**

Run: `source ~/.nvm/nvm.sh && nvm use 20 && npm run build 2>&1 | tail -30`
Expected: Build succeeds, `/api/webhooks/clickup` listed as a dynamic route

**Step 2: Run the migration**

Apply the new column via the Supabase SQL editor:

```sql
alter table content_drafts add column if not exists clickup_task_id text;
create index if not exists content_drafts_clickup_task_id on content_drafts(clickup_task_id) where clickup_task_id is not null;
```

**Step 3: Deploy and register webhook**

After deploying to Vercel:

```bash
source ~/.nvm/nvm.sh && nvm use 20 && npx tsx scripts/setup-clickup-webhook.ts
```

Copy the returned secret into `CLICKUP_WEBHOOK_SECRET` env var on Vercel.

**Step 4: Test end-to-end**

1. Run the content engine to generate a draft
2. Verify the ClickUp task has the full content in the description
3. Verify `clickup_task_id` is saved on the draft row in Supabase
4. Move the ClickUp task to "Approved"
5. Verify the blog post appears as published on the site
