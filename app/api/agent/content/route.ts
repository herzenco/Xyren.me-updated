import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { adjustCategoryCount } from '@/lib/actions/categories'

export const maxDuration = 60

function isAuthorized(request: NextRequest): boolean {
  const token = process.env.LUPE_API_TOKEN
  if (!token) return false
  const authHeader = request.headers.get('authorization')
  return authHeader === `Bearer ${token}`
}

function json(data: unknown, status = 200) {
  return NextResponse.json(data, { status })
}

export async function POST(request: NextRequest) {
  if (!isAuthorized(request)) {
    return json({ ok: false, error: 'Unauthorized' }, 401)
  }

  let body: { action?: string; id?: string }
  try {
    body = await request.json()
  } catch {
    return json({ ok: false, error: 'Invalid JSON body' }, 400)
  }

  const { action, id } = body

  if (!action || !['list', 'approve', 'reject', 'get'].includes(action)) {
    return json({ ok: false, error: 'Invalid action. Must be list, approve, reject, or get.' }, 400)
  }

  const supabase = createAdminClient()
  const db = supabase as any

  try {
    if (action === 'list') {
      const { data, error } = await db
        .from('content_drafts')
        .select('id, title, slug, type, category, status, excerpt, content, seo_score, created_at')
        .in('status', ['pending', 'changes_requested'])
        .order('created_at', { ascending: false })

      if (error) throw new Error(error.message)
      return json({ ok: true, data: data ?? [] })
    }

    if (!id) {
      return json({ ok: false, error: 'Missing required field: id' }, 400)
    }

    if (action === 'get') {
      const { data: draft, error } = await db
        .from('content_drafts')
        .select('*')
        .eq('id', id)
        .single()

      if (error || !draft) {
        return json({ ok: false, error: 'Draft not found' }, 404)
      }
      return json({ ok: true, data: draft })
    }

    if (action === 'approve') {
      const { data: draft, error } = await db
        .from('content_drafts')
        .select('*')
        .eq('id', id)
        .single()

      if (error || !draft) {
        return json({ ok: false, error: 'Draft not found' }, 404)
      }
      if (draft.status === 'published') {
        return json({ ok: false, error: 'Already published' }, 400)
      }

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

      await db
        .from('content_drafts')
        .update({
          status: 'published',
          published_at: new Date().toISOString(),
          approved_at: new Date().toISOString(),
        })
        .eq('id', id)

      return json({ ok: true, data: { id, status: 'published' } })
    }

    if (action === 'reject') {
      const { data: draft, error } = await db
        .from('content_drafts')
        .select('id, status')
        .eq('id', id)
        .single()

      if (error || !draft) {
        return json({ ok: false, error: 'Draft not found' }, 404)
      }

      await db
        .from('content_drafts')
        .update({ status: 'rejected' })
        .eq('id', id)

      return json({ ok: true, data: { id, status: 'rejected' } })
    }
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    console.error('[AgentContentAPI]', message)
    return json({ ok: false, error: message }, 500)
  }
}
