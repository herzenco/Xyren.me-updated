import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { isGa4Configured, getTopPages } from '@/lib/ga4'

export const maxDuration = 120

export async function POST(request: NextRequest) {
  const cronSecret = process.env.CRON_SECRET
  const authHeader = request.headers.get('authorization')

  const isAuthorized =
    cronSecret && authHeader === `Bearer ${cronSecret}`

  if (!isAuthorized) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  if (!isGa4Configured()) {
    return NextResponse.json({ skipped: true, reason: 'GA4 not configured' })
  }

  const supabase = createAdminClient()

  // Fetch top 50 pages from GA4 (last 30 days)
  const topPages = await getTopPages(30, 50)
  if (!topPages || topPages.length === 0) {
    return NextResponse.json({ synced: 0, reason: 'No GA4 data' })
  }

  // Load all published posts and guides to build a path → id map
  const { data: posts } = await (supabase.from('blog_posts') as any)
    .select('id, slug, category')
    .eq('is_published', true)

  const { data: guides } = await (supabase.from('how_to_guides') as any)
    .select('id, slug')
    .eq('is_published', true)

  // Build lookup: pagePath → { id, type }
  const pathMap = new Map<string, { id: string; type: 'blog' | 'how-to' }>()

  for (const post of posts ?? []) {
    pathMap.set(`/resources/blog/${post.category}/${post.slug}`, { id: post.id, type: 'blog' })
  }
  for (const guide of guides ?? []) {
    pathMap.set(`/resources/how-to/${guide.slug}`, { id: guide.id, type: 'how-to' })
  }

  // Match GA4 page paths to content IDs
  const rows = []
  for (const page of topPages) {
    const match = pathMap.get(page.page)
    if (!match) continue
    rows.push({
      post_id: match.id,
      post_type: match.type,
      views: page.views,
      avg_time_on_page: 0, // GA4 free tier doesn't expose avg_time per path easily
      bounce_rate: 0,
      social_shares: 0,
      recorded_at: new Date().toISOString(),
    })
  }

  if (rows.length === 0) {
    return NextResponse.json({ synced: 0, reason: 'No matching content found in GA4 data' })
  }

  // Insert new performance snapshots (not upsert — we want historical records)
  const { error } = await (supabase.from('content_performance') as any).insert(rows)

  if (error) {
    console.error('Performance sync insert error:', error)
    return NextResponse.json({ error: 'Insert failed' }, { status: 500 })
  }

  return NextResponse.json({ success: true, synced: rows.length })
}
