import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { createAdminClient } from '@/lib/supabase/admin'
import { clickupService } from '@/lib/clickup'
import { sendContactConfirmation, sendContactNotification } from '@/lib/email'

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
    }).select()

    if (insertError || !insertedData?.[0]) {
      console.error('Database error:', insertError)
      return NextResponse.json({ error: 'Failed to save submission' }, { status: 500 })
    }

    const submission = insertedData[0]

    // Attempt ClickUp sync
    try {
      const syncResult = await syncToClickUp(submission)

      if (syncResult.success) {
        // Update with successful sync (only if still pending - prevents race condition)
        await (supabase.from('contact_submissions') as any)
          .update({
            clickup_status: 'synced',
            clickup_task_id: syncResult.taskId,
            synced_at: new Date().toISOString(),
          })
          .eq('id', submission.id)
          .eq('clickup_status', 'pending')
      } else {
        // Mark as failed sync (only if still pending)
        await (supabase.from('contact_submissions') as any)
          .update({
            clickup_status: 'sync_failed',
            clickup_error: syncResult.error,
          })
          .eq('id', submission.id)
          .eq('clickup_status', 'pending')
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
        .eq('clickup_status', 'pending')
    }

    // Fire-and-forget email notifications (don't fail the request if email fails)
    try {
      await Promise.all([
        sendContactConfirmation(data.email, data.name),
        sendContactNotification({
          name: data.name,
          email: data.email,
          phone: data.phone,
          business: data.business,
          service: data.service,
          message: data.message,
        }),
      ])
    } catch (emailError) {
      console.error('Email notification error:', emailError)
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
