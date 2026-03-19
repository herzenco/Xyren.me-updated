'use server'

import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { clickupService } from '@/lib/clickup'
import type { Database } from '@/types/database.types'

type SubmissionUpdate = Database['public']['Tables']['contact_submissions']['Update']

const statusSchema = z.object({
  status: z.enum(['new', 'reviewed', 'archived']),
})

export async function updateSubmissionStatus(
  id: string,
  formData: FormData
) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      throw new Error('Unauthorized')
    }

    const data = Object.fromEntries(formData)
    const validated = statusSchema.parse(data)

    const updateData: SubmissionUpdate = {
      status: validated.status,
    }

    const { error } = await (supabase
      .from('contact_submissions') as any)
      .update(updateData)
      .eq('id', id)

    if (error) throw error

    revalidatePath('/dashboard/submissions')
  } catch (err) {
    const message = err instanceof z.ZodError
      ? err.issues.map((i) => i.message).join(', ')
      : err instanceof Error
        ? err.message
        : 'Failed to update submission status'
    throw new Error(message)
  }
}

export async function retryClickUpSync(submissionId: string) {
  try {
    // Auth check
    const userClient = await createClient()
    const { data: { user }, error: authError } = await userClient.auth.getUser()
    if (authError || !user) {
      return { success: false, error: 'Unauthorized' }
    }

    const supabase = createAdminClient()

    // Fetch the submission
    const { data: submission, error: fetchError } = await (supabase
      .from('contact_submissions') as any)
      .select('*')
      .eq('id', submissionId)
      .single()

    if (fetchError || !submission) {
      return { success: false, error: 'Submission not found' }
    }

    // Attempt ClickUp sync
    const taskDescription = `Name: ${submission.name}
Email: ${submission.email}
Phone: ${submission.phone || 'Not provided'}
Business: ${submission.business || 'Not provided'}
Service: ${submission.service || 'Not provided'}

Message:
${submission.message}`

    const syncResult = await clickupService.createTask({
      name: `[Contact] ${submission.business || submission.name}`,
      description: taskDescription,
    })

    if (syncResult.success) {
      // Update with successful sync
      const { error: updateError } = await (supabase
        .from('contact_submissions') as any)
        .update({
          clickup_status: 'synced',
          clickup_task_id: syncResult.taskId,
          synced_at: new Date().toISOString(),
        })
        .eq('id', submissionId)
        .eq('clickup_status', 'sync_failed')

      if (updateError) throw updateError
      revalidatePath(`/dashboard/submissions/${submissionId}`)
      return { success: true }
    } else {
      // Persist error state
      await (supabase
        .from('contact_submissions') as any)
        .update({
          clickup_status: 'sync_failed',
          clickup_error: syncResult.error,
        })
        .eq('id', submissionId)

      return { success: false, error: syncResult.error }
    }
  } catch (error) {
    console.error('Retry sync error:', error)
    const errorMsg = error instanceof Error ? error.message : 'Unknown error'

    // Persist error to database
    try {
      const supabase = createAdminClient()
      await (supabase
        .from('contact_submissions') as any)
        .update({
          clickup_status: 'sync_failed',
          clickup_error: errorMsg,
        })
        .eq('id', submissionId)
    } catch {}

    return { success: false, error: errorMsg }
  }
}
