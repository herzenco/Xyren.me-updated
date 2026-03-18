'use server'

import { createAdminClient } from '@/lib/supabase/admin'
import { revalidatePath } from 'next/cache'
import { reviseContent } from '@/lib/content-engine/claude'

export async function approveDraft(draftId: string) {
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
}

export async function rejectDraft(draftId: string) {
  const supabase = createAdminClient()
  await (supabase as any)
    .from('content_drafts')
    .update({ status: 'rejected' })
    .eq('id', draftId)
  revalidatePath('/dashboard/content')
}

export async function requestDraftChanges(draftId: string, changes: string) {
  if (!changes.trim()) return

  const supabase = createAdminClient()

  const { data: draft } = await (supabase as any)
    .from('content_drafts')
    .select('id, title, content, revision_count')
    .eq('id', draftId)
    .single()

  if (!draft) throw new Error('Draft not found')

  const revisedContent = await reviseContent(
    { content: draft.content ?? '', title: draft.title },
    changes
  )

  await (supabase as any)
    .from('content_drafts')
    .update({
      content: revisedContent,
      status: 'pending',
      requested_changes: changes,
      revision_count: (draft.revision_count ?? 0) + 1,
    })
    .eq('id', draftId)

  revalidatePath('/dashboard/content')
}
