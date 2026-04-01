'use server'

import { createAdminClient } from '@/lib/supabase/admin'
import { requireAuth } from '@/lib/auth-helpers'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import { reviseContent } from '@/lib/content-engine/claude'
import { adjustCategoryCount } from '@/lib/actions/categories'

const updateDraftSchema = z.object({
  title: z.string().max(255).optional(),
  content: z.string().max(100000).optional(),
  excerpt: z.string().max(1000).optional(),
})

const changesSchema = z.string().min(1).max(2000)

export async function triggerContentEngine(params: {
  type?: string
  topicHint?: string
  category?: string
}) {
  await requireAuth()
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:8000'
  const cronSecret = process.env.CRON_SECRET

  const body: Record<string, string> = {}
  if (params.type && params.type !== 'auto') body.type = params.type
  if (params.topicHint?.trim()) body.topicHint = params.topicHint.trim()
  if (params.category && params.category !== 'auto') body.category = params.category

  const response = await fetch(`${siteUrl}/api/content/generate`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(cronSecret ? { Authorization: `Bearer ${cronSecret}` } : {}),
    },
    body: JSON.stringify(body),
  })

  if (!response.ok) {
    const err = await response.json().catch(() => ({ error: 'Unknown error' }))
    throw new Error(err.error || 'Failed to trigger content engine')
  }

  revalidatePath('/dashboard/content')
}

export async function approveDraft(draftId: string) {
  await requireAuth()

  const supabase = createAdminClient()

  const { data: draft, error } = await (supabase as any)
    .from('content_drafts')
    .select('*')
    .eq('id', draftId)
    .single()

  if (error || !draft) throw new Error('Draft not found')
  if (draft.status === 'published') throw new Error('Already published')

  // Copy to the appropriate published table
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

    // Increment category post count
    if (draft.category) {
      await adjustCategoryCount(draft.category, 1).catch(console.error)
    }
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

  await (supabase as any)
    .from('content_drafts')
    .update({
      status: 'published',
      published_at: new Date().toISOString(),
      approved_at: new Date().toISOString(),
    })
    .eq('id', draftId)

  revalidatePath('/dashboard/content')
  revalidatePath('/resources/blog')
  revalidatePath('/resources/how-to')
  if (draft.type === 'blog' && draft.category) {
    revalidatePath(`/resources/blog/${draft.category}`)
  }
}

export async function rejectDraft(draftId: string) {
  await requireAuth()

  const supabase = createAdminClient()
  await (supabase as any)
    .from('content_drafts')
    .update({ status: 'rejected' })
    .eq('id', draftId)
  revalidatePath('/dashboard/content')
}

export async function updateDraft(draftId: string, updates: {
  title?: string
  content?: string
  excerpt?: string
}) {
  await requireAuth()

  const validated = updateDraftSchema.parse(updates)

  const supabase = createAdminClient()

  const fields: Record<string, unknown> = {}
  if (validated.title !== undefined) fields.title = validated.title
  if (validated.content !== undefined) fields.content = validated.content
  if (validated.excerpt !== undefined) fields.excerpt = validated.excerpt

  if (Object.keys(fields).length === 0) return

  const { error } = await (supabase as any)
    .from('content_drafts')
    .update(fields)
    .eq('id', draftId)

  if (error) throw new Error(`Failed to update draft: ${error.message}`)

  revalidatePath('/dashboard/content')
  revalidatePath(`/dashboard/content/${draftId}`)
}

export async function requestDraftChanges(draftId: string, changes: string) {
  await requireAuth()

  const validatedChanges = changesSchema.parse(changes)

  const supabase = createAdminClient()

  const { data: draft } = await (supabase as any)
    .from('content_drafts')
    .select('id, title, content, revision_count')
    .eq('id', draftId)
    .single()

  if (!draft) throw new Error('Draft not found')

  const revisedContent = await reviseContent(
    { content: draft.content ?? '', title: draft.title },
    validatedChanges
  )

  await (supabase as any)
    .from('content_drafts')
    .update({
      content: revisedContent,
      status: 'pending',
      requested_changes: validatedChanges,
      revision_count: (draft.revision_count ?? 0) + 1,
    })
    .eq('id', draftId)

  revalidatePath('/dashboard/content')
}
