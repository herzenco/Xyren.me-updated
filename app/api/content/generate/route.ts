import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { buildContext, selectTopic, generateContent, reviewSEO } from '@/lib/content-engine/claude'
import { generateCoverImage } from '@/lib/content-engine/image-gen'
import { notifyDraftViaClickUp } from '@/lib/content-engine/clickup-notify'

// Allow long-running execution on Vercel
export const maxDuration = 300

function isAuthorized(request: NextRequest): boolean {
  // Vercel Cron sends this header automatically
  const isVercelCron = request.headers.get('x-vercel-cron') === '1'
  if (isVercelCron) return true

  // Manual trigger with secret
  const authHeader = request.headers.get('authorization')
  const cronSecret = process.env.CRON_SECRET
  if (cronSecret && authHeader === `Bearer ${cronSecret}`) return true

  // Allow in development without secret
  return process.env.NODE_ENV === 'development' && !process.env.CRON_SECRET
}

export async function POST(request: NextRequest) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const supabase = createAdminClient()
  const startTime = Date.now()

  console.log('[ContentEngine] Pipeline started')

  try {
    // 1. Build context from existing content + performance data
    console.log('[ContentEngine] Building context...')
    const context = await buildContext()

    // 2. Select topic
    console.log('[ContentEngine] Selecting topic...')
    const topic = await selectTopic(context)
    console.log(`[ContentEngine] Topic: "${topic.title}" (${topic.type}, ${topic.category})`)

    // 3. Generate content
    console.log('[ContentEngine] Generating content...')
    const rawContent = await generateContent(topic, context)

    // 4. SEO review
    console.log('[ContentEngine] Running SEO review...')
    const content = await reviewSEO(rawContent)
    console.log(`[ContentEngine] SEO score: ${content.seo_score}/100, Readability: ${content.readability_score}/100`)

    // 5. Generate cover image (non-fatal)
    let coverImageUrl: string | null = null
    try {
      console.log('[ContentEngine] Generating cover image...')
      coverImageUrl = await generateCoverImage(content.title, content.excerpt)
    } catch (imgError) {
      console.error('[ContentEngine] Cover image failed (continuing):', imgError)
    }

    // 6. Save draft to Supabase
    console.log('[ContentEngine] Saving draft...')
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const db = supabase as any
    const { data: draft, error: draftError } = await db
      .from('content_drafts')
      .insert({
        type: content.type,
        title: content.title,
        slug: content.slug,
        excerpt: content.excerpt,
        content: content.content,
        cover_image_url: coverImageUrl,
        tags: content.tags,
        category: content.category,
        status: 'pending',
        ai_model: 'claude-opus-4-6',
        topic_reasoning: content.topic_reasoning,
        seo_keywords: [content.focus_keyword, ...(content.secondary_keywords ?? [])],
        seo_title: content.seo_title,
        meta_description: content.meta_description,
        focus_keyword: content.focus_keyword,
        secondary_keywords: content.secondary_keywords,
        keyword_density: content.keyword_density,
        readability_score: content.readability_score,
        internal_links: content.internal_links,
        schema_markup: content.schema_markup,
        og_title: content.og_title,
        og_description: content.og_description,
        seo_score: content.seo_score,
        reading_time: content.reading_time,
      })
      .select()
      .single()

    if (draftError || !draft) {
      throw new Error(`Failed to save draft: ${draftError?.message ?? 'no data returned'}`)
    }

    console.log(`[ContentEngine] Draft saved: ${draft.id}`)

    // 7. Notify via ClickUp (non-fatal)
    try {
      console.log('[ContentEngine] Creating ClickUp task...')
      const clickupResult = await notifyDraftViaClickUp(draft as any)
      if (clickupResult.success) {
        console.log(`[ContentEngine] ClickUp task created: ${clickupResult.taskId}`)
      } else {
        console.error('[ContentEngine] ClickUp notification failed:', clickupResult.error)
      }
    } catch (clickupError) {
      console.error('[ContentEngine] ClickUp error (continuing):', clickupError)
    }

    const elapsed = ((Date.now() - startTime) / 1000).toFixed(1)
    console.log(`[ContentEngine] Pipeline complete in ${elapsed}s`)

    return NextResponse.json({
      success: true,
      draftId: draft.id,
      title: content.title,
      type: content.type,
      seoScore: content.seo_score,
      readabilityScore: content.readability_score,
      hasCoverImage: !!coverImageUrl,
      elapsedSeconds: parseFloat(elapsed),
    })

  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    console.error('[ContentEngine] Pipeline failed:', message)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
