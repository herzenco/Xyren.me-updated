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
