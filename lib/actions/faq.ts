'use server'

import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import { createAdminClient } from '@/lib/supabase/admin'
import { getServerSession } from 'next-auth'
import type { Database } from '@/types/database.types'

async function requireAuth() {
  const session = await getServerSession()
  if (!session?.user) throw new Error('Unauthorized')
  return session.user
}

type FaqItemInsert = Database['public']['Tables']['faq_items']['Insert']

const faqSchema = z.object({
  question: z.string().min(1, 'Question is required').max(500),
  answer: z.string().min(1, 'Answer is required'),
  category: z.string().min(1, 'Category is required'),
  sort_order: z.coerce.number().int().nonnegative().optional().default(0),
  is_published: z.coerce.boolean().optional().default(true),
})

export async function createFaqItem(formData: FormData) {
  try {
    await requireAuth()
    const supabase = createAdminClient()

    const data = Object.fromEntries(formData)
    const validated = faqSchema.parse(data)

    const insertData: FaqItemInsert = {
      question: validated.question,
      answer: validated.answer,
      category: validated.category,
      sort_order: validated.sort_order,
      is_published: validated.is_published,
    }

    const { error } = await (supabase.from('faq_items') as any).insert(insertData)

    if (error) throw error

    revalidatePath('/dashboard/faq')
    revalidatePath('/resources/faq', 'layout')
  } catch (err) {
    const message = err instanceof z.ZodError
      ? err.issues.map((i) => i.message).join(', ')
      : err instanceof Error
        ? err.message
        : 'Failed to create FAQ item'
    throw new Error(message)
  }
}

export async function updateFaqItem(id: string, formData: FormData) {
  try {
    await requireAuth()
    const supabase = createAdminClient()

    const data = Object.fromEntries(formData)
    const validated = faqSchema.parse(data)

    const updateData: FaqItemInsert = {
      question: validated.question,
      answer: validated.answer,
      category: validated.category,
      sort_order: validated.sort_order,
      is_published: validated.is_published,
    }

    const { error } = await (supabase
      .from('faq_items') as any)
      .update(updateData)
      .eq('id', id)

    if (error) throw error

    revalidatePath('/dashboard/faq')
    revalidatePath('/resources/faq', 'layout')
  } catch (err) {
    const message = err instanceof z.ZodError
      ? err.issues.map((i) => i.message).join(', ')
      : err instanceof Error
        ? err.message
        : 'Failed to update FAQ item'
    throw new Error(message)
  }
}

export async function deleteFaqItem(id: string) {
  try {
    await requireAuth()
    const supabase = createAdminClient()

    const { error } = await (supabase.from('faq_items') as any).delete().eq('id', id)

    if (error) throw error

    revalidatePath('/dashboard/faq')
    revalidatePath('/resources/faq', 'layout')
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Failed to delete FAQ item'
    throw new Error(message)
  }
}

export async function toggleFaqPublished(id: string, currentStatus: boolean) {
  try {
    await requireAuth()
    const supabase = createAdminClient()

    const { error } = await (supabase
      .from('faq_items') as any)
      .update({
        is_published: !currentStatus,
      })
      .eq('id', id)

    if (error) throw error

    revalidatePath('/dashboard/faq')
    revalidatePath('/resources/faq', 'layout')
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Failed to toggle publish status'
    throw new Error(message)
  }
}
