'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { z } from 'zod'
import { createAdminClient } from '@/lib/supabase/admin'
import { requireAuth } from '@/lib/auth-helpers'
import type { Database } from '@/types/database.types'

type HowToGuideInsert = Database['public']['Tables']['how_to_guides']['Insert']

const howToSchema = z.object({
  title: z.string().min(1, 'Title is required').max(255),
  slug: z.string().regex(/^[a-z0-9-]+$/, 'Slug must be lowercase alphanumeric with hyphens'),
  difficulty: z.enum(['beginner', 'intermediate', 'advanced']),
  excerpt: z.string().min(1, 'Excerpt is required').max(500),
  content: z.string().min(1, 'Content is required'),
  reading_time: z.coerce.number().int().positive().optional(),
  tags: z.string().optional().transform((val) => val?.split(',').map((t) => t.trim()).filter(Boolean) || []),
  is_published: z.coerce.boolean().optional().default(false),
})

export async function createHowToGuide(formData: FormData) {
  try {
    await requireAuth()
    const supabase = createAdminClient()

    const data = Object.fromEntries(formData)
    const validated = howToSchema.parse(data)

    const insertData: HowToGuideInsert = {
      title: validated.title,
      slug: validated.slug,
      difficulty: validated.difficulty,
      excerpt: validated.excerpt,
      content: validated.content,
      reading_time: validated.reading_time || undefined,
      tags: validated.tags || undefined,
      is_published: validated.is_published,
      published_at: validated.is_published ? new Date().toISOString() : null,
    }

    const { error } = await (supabase.from('how_to_guides') as any).insert(insertData)

    if (error) throw error

    revalidatePath('/dashboard/how-to')
    revalidatePath('/resources/how-to', 'layout')
    redirect('/dashboard/how-to')
  } catch (err) {
    const message = err instanceof z.ZodError
      ? err.issues.map((i) => i.message).join(', ')
      : err instanceof Error
        ? err.message
        : 'Failed to create guide'
    throw new Error(message)
  }
}

export async function updateHowToGuide(id: string, formData: FormData) {
  try {
    await requireAuth()
    const supabase = createAdminClient()

    const data = Object.fromEntries(formData)
    const validated = howToSchema.parse(data)

    // Read current state to avoid overwriting published_at on already-published guides
    const { data: existing } = await (supabase.from('how_to_guides') as any)
      .select('is_published, published_at')
      .eq('id', id)
      .single()

    const isNewlyPublished = validated.is_published && !existing?.is_published
    const publishedAt = isNewlyPublished
      ? new Date().toISOString()
      : validated.is_published
        ? existing?.published_at
        : null

    const updateData: HowToGuideInsert = {
      title: validated.title,
      slug: validated.slug,
      difficulty: validated.difficulty,
      excerpt: validated.excerpt,
      content: validated.content,
      reading_time: validated.reading_time || undefined,
      tags: validated.tags || undefined,
      is_published: validated.is_published,
      published_at: publishedAt,
    }

    const { error } = await (supabase.from('how_to_guides') as any)
      .update(updateData)
      .eq('id', id)

    if (error) throw error

    revalidatePath('/dashboard/how-to')
    revalidatePath('/resources/how-to', 'layout')
    redirect('/dashboard/how-to')
  } catch (err) {
    const message = err instanceof z.ZodError
      ? err.issues.map((i) => i.message).join(', ')
      : err instanceof Error
        ? err.message
        : 'Failed to update guide'
    throw new Error(message)
  }
}

export async function deleteHowToGuide(id: string) {
  try {
    await requireAuth()
    const supabase = createAdminClient()

    const { error } = await (supabase.from('how_to_guides') as any).delete().eq('id', id)

    if (error) throw error

    revalidatePath('/dashboard/how-to')
    revalidatePath('/resources/how-to', 'layout')
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Failed to delete guide'
    throw new Error(message)
  }
}

export async function toggleHowToPublished(id: string, currentStatus: boolean) {
  try {
    await requireAuth()
    const supabase = createAdminClient()

    const { data: guide } = await (supabase.from('how_to_guides') as any)
      .select('is_published')
      .eq('id', id)
      .single()

    const newStatus = !guide.is_published

    const { error } = await (supabase
      .from('how_to_guides') as any)
      .update({
        is_published: newStatus,
        published_at: newStatus ? new Date().toISOString() : null,
      })
      .eq('id', id)

    if (error) throw error

    revalidatePath('/dashboard/how-to')
    revalidatePath('/resources/how-to', 'layout')
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Failed to toggle publish status'
    throw new Error(message)
  }
}
