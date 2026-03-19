# ClickUp Integration Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Automatically sync contact form submissions to ClickUp's Leads list with error tracking and manual retry capability.

**Architecture:** Create a ClickUp service utility that the contact API handler uses to sync submissions. Track sync status in Supabase. Expose retry functionality on the dashboard.

**Tech Stack:** Next.js API routes, Supabase, ClickUp API, TypeScript

---

## Task 1: Create ClickUp Service Utility

**Files:**
- Create: `lib/clickup.ts`

**Description:** Create a reusable service to interact with ClickUp API for creating tasks in the Leads list.

**Step 1: Write the ClickUp service with TypeScript types**

```typescript
// lib/clickup.ts

interface ClickUpTask {
  name: string
  description: string
  custom_fields?: Array<{
    id: string
    value: string | number
  }>
}

interface ClickUpResponse {
  id: string
  custom_id: string
  name: string
}

export class ClickUpService {
  private apiKey: string
  private teamId: string
  private listId: string
  private baseUrl = 'https://api.clickup.com/api/v2'

  constructor() {
    this.apiKey = process.env.CLICKUP_API_KEY || ''
    this.teamId = process.env.CLICKUP_TEAM_ID || ''
    this.listId = process.env.CLICKUP_LEADS_LIST_ID || ''

    if (!this.apiKey || !this.teamId || !this.listId) {
      throw new Error('Missing ClickUp configuration in environment variables')
    }
  }

  async createTask(taskData: ClickUpTask): Promise<{ success: boolean; taskId?: string; error?: string }> {
    try {
      const response = await fetch(`${this.baseUrl}/list/${this.listId}/task`, {
        method: 'POST',
        headers: {
          'Authorization': this.apiKey,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(taskData),
      })

      if (!response.ok) {
        const errorData = await response.json()
        console.error('ClickUp API error:', errorData)
        throw new Error(`ClickUp API error: ${response.status}`)
      }

      const data: ClickUpResponse = await response.json()
      return { success: true, taskId: data.id }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'
      console.error('ClickUp sync failed:', errorMessage)
      return { success: false, error: errorMessage }
    }
  }
}

export const clickupService = new ClickUpService()
```

**Step 2: Verify file created**

Run: `cat lib/clickup.ts | head -20`
Expected: File shows ClickUpService class definition

**Step 3: Commit**

```bash
git add lib/clickup.ts
git commit -m "feat: create ClickUp service utility for API integration"
```

---

## Task 2: Create Supabase Migration for Contact Submissions Schema

**Files:**
- Create: `supabase/migrations/<timestamp>_add_clickup_sync_columns.sql`

**Description:** Add columns to track ClickUp sync status on contact submissions.

**Step 1: Create migration file**

Get current timestamp: `date +%s` (e.g., `20260316000000`)

Create file: `supabase/migrations/20260316000000_add_clickup_sync_columns.sql`

```sql
-- Add ClickUp sync tracking columns to contact_submissions
ALTER TABLE contact_submissions
ADD COLUMN clickup_status VARCHAR(20) DEFAULT 'pending' CHECK (clickup_status IN ('pending', 'synced', 'sync_failed')),
ADD COLUMN clickup_task_id VARCHAR(255),
ADD COLUMN clickup_error TEXT,
ADD COLUMN synced_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN retry_count INTEGER DEFAULT 0;

-- Create index for filtering by sync status
CREATE INDEX idx_contact_submissions_clickup_status ON contact_submissions(clickup_status);
```

**Step 2: Verify migration file created**

Run: `cat supabase/migrations/20260316000000_add_clickup_sync_columns.sql`
Expected: File shows SQL ALTER TABLE statements

**Step 3: Commit**

```bash
git add supabase/migrations/20260316000000_add_clickup_sync_columns.sql
git commit -m "database: add ClickUp sync columns to contact_submissions"
```

---

## Task 3: Update Contact API Handler to Include ClickUp Sync

**Files:**
- Modify: `app/api/contact/route.ts`

**Description:** Update the contact form API to attempt ClickUp sync after saving to Supabase.

**Step 1: Read current file and update imports**

Current file: `app/api/contact/route.ts`

Replace the entire file with:

```typescript
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { createAdminClient } from '@/lib/supabase/admin'
import { clickupService } from '@/lib/clickup'

const contactSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  phone: z.string().optional(),
  business: z.string().optional(),
  service: z.string().optional(),
  message: z.string().min(10),
})

async function syncToClickUp(submission: {
  id: string
  name: string
  email: string
  phone: string | null
  business: string | null
  service: string | null
  message: string
}) {
  const taskDescription = `Name: ${submission.name}
Email: ${submission.email}
Phone: ${submission.phone || 'Not provided'}
Business: ${submission.business || 'Not provided'}
Service: ${submission.service || 'Not provided'}

Message:
${submission.message}`

  const result = await clickupService.createTask({
    name: `[Contact] ${submission.business || submission.name}`,
    description: taskDescription,
  })

  return result
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const data = contactSchema.parse(body)

    // Store in Supabase
    const supabase = createAdminClient()
    const { data: insertedData, error: insertError } = await (supabase.from('contact_submissions') as any).insert({
      name: data.name,
      email: data.email,
      phone: data.phone || null,
      business: data.business || null,
      service: data.service || null,
      message: data.message,
      clickup_status: 'pending',
      retry_count: 0,
    }).select()

    if (insertError || !insertedData?.[0]) {
      console.error('Database error:', insertError)
      return NextResponse.json({ error: 'Failed to save submission' }, { status: 500 })
    }

    const submission = insertedData[0]

    // Attempt ClickUp sync (don't await, but log result)
    try {
      const syncResult = await syncToClickUp(submission)

      if (syncResult.success) {
        // Update with successful sync
        await (supabase.from('contact_submissions') as any)
          .update({
            clickup_status: 'synced',
            clickup_task_id: syncResult.taskId,
            synced_at: new Date().toISOString(),
          })
          .eq('id', submission.id)
      } else {
        // Mark as failed sync
        await (supabase.from('contact_submissions') as any)
          .update({
            clickup_status: 'sync_failed',
            clickup_error: syncResult.error,
          })
          .eq('id', submission.id)
      }
    } catch (syncError) {
      console.error('ClickUp sync error:', syncError)
      // Mark as failed but don't fail the whole request
      await (supabase.from('contact_submissions') as any)
        .update({
          clickup_status: 'sync_failed',
          clickup_error: syncError instanceof Error ? syncError.message : 'Unknown error',
        })
        .eq('id', submission.id)
    }

    return NextResponse.json({ success: true, message: 'Thank you! We\'ll get back to you soon.' })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid form data', details: error.issues }, { status: 400 })
    }
    console.error('Contact form error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
```

**Step 2: Verify file updated**

Run: `grep -n "syncToClickUp" app/api/contact/route.ts`
Expected: Shows the syncToClickUp function is defined

**Step 3: Commit**

```bash
git add app/api/contact/route.ts
git commit -m "feat: add ClickUp sync to contact form handler with error tracking"
```

---

## Task 4: Add Dashboard Submission Detail View with Retry

**Files:**
- Modify: `app/dashboard/submissions/[id]/page.tsx` (if exists, else create)
- Create: `lib/actions/submissions.ts` (update with retry action)

**Description:** Add UI to show sync status and retry button on submission detail page.

**Step 1: Check if submission detail page exists**

Run: `ls -la app/dashboard/submissions/`
Expected: Should show `[id]` directory with `page.tsx`

**Step 2: Update submission detail page**

File: `app/dashboard/submissions/[id]/page.tsx`

Add this component structure (check what's there first, then update):

```typescript
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { retryClickUpSync } from '@/lib/actions/submissions'

export default function SubmissionDetail({ params }: { params: { id: string } }) {
  const router = useRouter()
  const [isRetrying, setIsRetrying] = useState(false)
  const [submission, setSubmission] = useState<any>(null)

  // Fetch submission on mount (use async/await pattern or useEffect)

  const handleRetry = async () => {
    setIsRetrying(true)
    try {
      const result = await retryClickUpSync(params.id)
      if (result.success) {
        // Refresh submission data
        router.refresh()
      }
    } finally {
      setIsRetrying(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Existing submission details */}

      {/* ClickUp Sync Status */}
      <div className="border rounded-lg p-4">
        <h3 className="font-semibold mb-3">ClickUp Sync Status</h3>

        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Status:</span>
            <Badge variant={
              submission?.clickup_status === 'synced' ? 'default' :
              submission?.clickup_status === 'sync_failed' ? 'destructive' :
              'secondary'
            }>
              {submission?.clickup_status || 'unknown'}
            </Badge>
          </div>

          {submission?.clickup_task_id && (
            <div className="text-sm">
              <span className="text-muted-foreground">Task ID:</span> {submission.clickup_task_id}
            </div>
          )}

          {submission?.clickup_error && (
            <div className="text-sm bg-red-50 p-2 rounded border border-red-200">
              <span className="text-destructive">Error:</span> {submission.clickup_error}
            </div>
          )}

          {submission?.synced_at && (
            <div className="text-sm text-muted-foreground">
              Synced: {new Date(submission.synced_at).toLocaleString()}
            </div>
          )}

          {submission?.retry_count > 0 && (
            <div className="text-sm text-muted-foreground">
              Retry attempts: {submission.retry_count}
            </div>
          )}
        </div>

        {submission?.clickup_status === 'sync_failed' && (
          <Button
            onClick={handleRetry}
            disabled={isRetrying}
            className="mt-4"
          >
            {isRetrying ? 'Retrying...' : 'Retry ClickUp Sync'}
          </Button>
        )}
      </div>
    </div>
  )
}
```

**Step 3: Create retry server action**

File: `lib/actions/submissions.ts`

Add or update with:

```typescript
'use server'

import { createAdminClient } from '@/lib/supabase/admin'
import { clickupService } from '@/lib/clickup'

export async function retryClickUpSync(submissionId: string) {
  try {
    const supabase = createAdminClient()

    // Fetch the submission
    const { data: submissions, error: fetchError } = await (supabase.from('contact_submissions') as any)
      .select('*')
      .eq('id', submissionId)
      .single()

    if (fetchError || !submissions) {
      return { success: false, error: 'Submission not found' }
    }

    // Attempt ClickUp sync
    const taskDescription = `Name: ${submissions.name}
Email: ${submissions.email}
Phone: ${submissions.phone || 'Not provided'}
Business: ${submissions.business || 'Not provided'}
Service: ${submissions.service || 'Not provided'}

Message:
${submissions.message}`

    const syncResult = await clickupService.createTask({
      name: `[Contact] ${submissions.business || submissions.name}`,
      description: taskDescription,
    })

    if (syncResult.success) {
      // Update with successful sync
      const { error: updateError } = await (supabase.from('contact_submissions') as any)
        .update({
          clickup_status: 'synced',
          clickup_task_id: syncResult.taskId,
          synced_at: new Date().toISOString(),
          retry_count: (submissions.retry_count || 0) + 1,
        })
        .eq('id', submissionId)

      if (updateError) throw updateError
      return { success: true }
    } else {
      // Update with failed sync
      const { error: updateError } = await (supabase.from('contact_submissions') as any)
        .update({
          clickup_status: 'sync_failed',
          clickup_error: syncResult.error,
          retry_count: (submissions.retry_count || 0) + 1,
        })
        .eq('id', submissionId)

      if (updateError) throw updateError
      return { success: false, error: syncResult.error }
    }
  } catch (error) {
    console.error('Retry sync error:', error)
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
  }
}
```

**Step 4: Commit**

```bash
git add app/dashboard/submissions/[id]/page.tsx lib/actions/submissions.ts
git commit -m "feat: add ClickUp sync status display and retry button on submission detail"
```

---

## Task 5: Test ClickUp Integration End-to-End

**Files:**
- Test: Manual testing via the app

**Description:** Verify the integration works by submitting a contact form and checking ClickUp.

**Step 1: Ensure environment variables are set**

Check `.env.local`:
```
CLICKUP_API_KEY=<your-api-key>
CLICKUP_TEAM_ID=<your-team-id>
CLICKUP_LEADS_LIST_ID=<your-list-id>
```

**Step 2: Run dev server**

```bash
source ~/.nvm/nvm.sh && nvm use 20
npm run dev
```

**Step 3: Test contact form submission**

1. Visit `http://localhost:8000` in browser
2. Scroll to contact form
3. Fill out form with test data
4. Submit
5. Should see success message

**Step 4: Check Supabase**

Run: `npm run supabase` or check via Supabase dashboard
- Open `contact_submissions` table
- Verify new row exists
- Check `clickup_status` is either 'synced' or 'sync_failed'

**Step 5: Verify ClickUp**

1. Visit ClickUp app
2. Navigate to Xyren space → Leads list
3. Should see new task with format: `[Contact] {business or name}`
4. Task description should contain all form fields

**Step 6: Test retry on failed sync**

1. Go to dashboard submissions
2. Click on a failed submission
3. View ClickUp Sync Status section
4. Click "Retry ClickUp Sync" button
5. Verify status updates

**Step 7: Commit test notes**

```bash
git add -A
git commit -m "test: verify ClickUp integration end-to-end"
```

---

## Task 6: Add Environment Variable Documentation

**Files:**
- Modify: `.env.example` or README

**Description:** Document required ClickUp environment variables for team.

**Step 1: Update .env.example**

Add to `.env.example`:

```
# ClickUp Configuration
CLICKUP_API_KEY=<your-clickup-api-key>
CLICKUP_TEAM_ID=<your-xyren-workspace-team-id>
CLICKUP_LEADS_LIST_ID=<your-leads-list-id>
```

**Step 2: Commit**

```bash
git add .env.example
git commit -m "docs: add ClickUp environment variable documentation"
```

---

## Summary Checklist

- [ ] Task 1: ClickUp service utility created
- [ ] Task 2: Supabase migration file created
- [ ] Task 3: Contact API handler updated with sync
- [ ] Task 4: Dashboard detail view with retry added
- [ ] Task 5: End-to-end testing completed
- [ ] Task 6: Environment variables documented

**Total estimated time:** 30-45 minutes
**Commits:** 6 logical commits
