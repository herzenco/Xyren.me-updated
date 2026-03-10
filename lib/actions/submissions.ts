'use server'

import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'
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
