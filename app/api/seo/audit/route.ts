import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'

export const maxDuration = 300

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://xyren.me'

const STATIC_ROUTES = [
  '/',
  '/use-cases/professional-services',
  '/use-cases/home-services',
  '/resources',
  '/resources/blog',
  '/resources/how-to',
  '/resources/faq',
]

function extractMeta(html: string) {
  // Order matters: try attribute-order variants for each tag
  const title =
    html.match(/<title[^>]*>([^<]*)<\/title>/i)?.[1]?.trim() ?? null

  const description =
    html.match(/<meta[^>]+name=["']description["'][^>]+content=["']([^"']*)["'][^>]*\/?>/i)?.[1] ??
    html.match(/<meta[^>]+content=["']([^"']*)["'][^>]+name=["']description["'][^>]*\/?>/i)?.[1] ??
    null

  const canonical =
    html.match(/<link[^>]+rel=["']canonical["'][^>]+href=["']([^"']*)["'][^>]*\/?>/i)?.[1] ??
    html.match(/<link[^>]+href=["']([^"']*)["'][^>]+rel=["']canonical["'][^>]*\/?>/i)?.[1] ??
    null

  const ogImage =
    html.match(/<meta[^>]+property=["']og:image["'][^>]+content=["']([^"']*)["'][^>]*\/?>/i)?.[1] ??
    html.match(/<meta[^>]+content=["']([^"']*)["'][^>]+property=["']og:image["'][^>]*\/?>/i)?.[1] ??
    null

  const robots =
    html.match(/<meta[^>]+name=["']robots["'][^>]+content=["']([^"']*)["'][^>]*\/?>/i)?.[1] ??
    html.match(/<meta[^>]+content=["']([^"']*)["'][^>]+name=["']robots["'][^>]*\/?>/i)?.[1] ??
    null

  return { title, description, canonical, ogImage, robots }
}

function detectIssues(
  statusCode: number,
  meta: ReturnType<typeof extractMeta>
): string[] {
  const issues: string[] = []

  if (statusCode >= 400) issues.push(`HTTP ${statusCode} error`)
  if (!meta.title) {
    issues.push('Missing meta title')
  } else if (meta.title.length < 20) {
    issues.push(`Meta title too short (${meta.title.length} chars, min 20)`)
  } else if (meta.title.length > 70) {
    issues.push(`Meta title too long (${meta.title.length} chars, max 70)`)
  }
  if (!meta.description) {
    issues.push('Missing meta description')
  } else if (meta.description.length < 50) {
    issues.push(`Meta description too short (${meta.description.length} chars, min 50)`)
  } else if (meta.description.length > 160) {
    issues.push(`Meta description too long (${meta.description.length} chars, max 160)`)
  }
  if (!meta.canonical) issues.push('Missing canonical tag')
  if (!meta.ogImage) issues.push('Missing OG image')
  if (meta.robots?.toLowerCase().includes('noindex')) {
    issues.push('Page has noindex directive — will not be indexed by Google')
  }

  return issues
}

async function auditUrl(url: string): Promise<{
  page_url: string
  status_code: number
  meta_title: string | null
  meta_description: string | null
  canonical_url: string | null
  indexed: boolean
  issues: string[]
}> {
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), 15_000)

  try {
    const res = await fetch(url, {
      signal: controller.signal,
      headers: { 'User-Agent': 'Xyren-SEO-Audit/1.0' },
    })
    clearTimeout(timeout)

    const html = await res.text()
    const meta = extractMeta(html)
    const issues = detectIssues(res.status, meta)
    const indexed = !meta.robots?.toLowerCase().includes('noindex') && res.status < 400

    return {
      page_url: url,
      status_code: res.status,
      meta_title: meta.title,
      meta_description: meta.description,
      canonical_url: meta.canonical,
      indexed,
      issues,
    }
  } catch (err) {
    clearTimeout(timeout)
    const message = err instanceof Error ? err.message : 'Fetch failed'
    return {
      page_url: url,
      status_code: 0,
      meta_title: null,
      meta_description: null,
      canonical_url: null,
      indexed: false,
      issues: [`Fetch error: ${message}`],
    }
  }
}

export async function POST(request: NextRequest) {
  // Auth: Vercel Cron header or Bearer token
  const cronHeader = request.headers.get('x-vercel-cron')
  const authHeader = request.headers.get('authorization')
  const cronSecret = process.env.CRON_SECRET

  const isAuthorized =
    cronHeader === '1' ||
    (cronSecret && authHeader === `Bearer ${cronSecret}`)

  if (!isAuthorized) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const supabase = createAdminClient()

  // Collect all URLs to audit
  const urls: string[] = STATIC_ROUTES.map((r) => `${SITE_URL}${r}`)

  // Add published blog posts
  const { data: posts } = await (supabase.from('blog_posts') as any)
    .select('slug, category')
    .eq('is_published', true)

  if (posts) {
    for (const post of posts) {
      urls.push(`${SITE_URL}/resources/blog/${post.category}/${post.slug}`)
    }
  }

  // Add published how-to guides
  const { data: guides } = await (supabase.from('how_to_guides') as any)
    .select('slug')
    .eq('is_published', true)

  if (guides) {
    for (const guide of guides) {
      urls.push(`${SITE_URL}/resources/how-to/${guide.slug}`)
    }
  }

  // Audit all URLs (sequential to avoid hammering the server)
  const results = []
  for (const url of urls) {
    const result = await auditUrl(url)
    results.push(result)
  }

  // Upsert into seo_audit_log
  const { error: upsertError } = await (supabase.from('seo_audit_log') as any)
    .upsert(
      results.map((r) => ({ ...r, last_checked_at: new Date().toISOString() })),
      { onConflict: 'page_url' }
    )

  if (upsertError) {
    console.error('SEO audit upsert error:', upsertError)
    return NextResponse.json({ error: 'Failed to save audit results' }, { status: 500 })
  }

  const issueCount = results.filter((r) => r.issues.length > 0).length
  const errorCount = results.filter((r) => r.status_code >= 400 || r.status_code === 0).length

  return NextResponse.json({
    success: true,
    audited: results.length,
    issues: issueCount,
    errors: errorCount,
    summary: results.map((r) => ({
      url: r.page_url,
      status: r.status_code,
      issues: r.issues,
    })),
  })
}
