import { createAdminClient } from '@/lib/supabase/admin'

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

function detectIssues(statusCode: number, meta: ReturnType<typeof extractMeta>): string[] {
  const issues: string[] = []
  if (statusCode >= 400) issues.push(`HTTP ${statusCode} error`)
  if (!meta.title) {
    issues.push('Missing meta title')
  } else if (meta.title.length < 20) {
    issues.push(`Meta title too short (${meta.title.length} chars)`)
  } else if (meta.title.length > 70) {
    issues.push(`Meta title too long (${meta.title.length} chars)`)
  }
  if (!meta.description) {
    issues.push('Missing meta description')
  } else if (meta.description.length < 50) {
    issues.push(`Meta description too short (${meta.description.length} chars)`)
  } else if (meta.description.length > 160) {
    issues.push(`Meta description too long (${meta.description.length} chars)`)
  }
  if (!meta.canonical) issues.push('Missing canonical tag')
  if (!meta.ogImage) issues.push('Missing OG image')
  if (meta.robots?.toLowerCase().includes('noindex')) {
    issues.push('Page has noindex — will not be indexed by Google')
  }
  return issues
}

async function auditUrl(url: string) {
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
    return {
      page_url: url,
      status_code: res.status,
      meta_title: meta.title,
      meta_description: meta.description,
      canonical_url: meta.canonical,
      indexed: !meta.robots?.toLowerCase().includes('noindex') && res.status < 400,
      issues,
      last_checked_at: new Date().toISOString(),
    }
  } catch (err) {
    clearTimeout(timeout)
    return {
      page_url: url,
      status_code: 0,
      meta_title: null,
      meta_description: null,
      canonical_url: null,
      indexed: false,
      issues: [`Fetch error: ${err instanceof Error ? err.message : 'Unknown'}`],
      last_checked_at: new Date().toISOString(),
    }
  }
}

export async function runSeoAudit() {
  const supabase = createAdminClient()

  const urls: string[] = STATIC_ROUTES.map((r) => `${SITE_URL}${r}`)

  const { data: posts } = await (supabase.from('blog_posts') as any)
    .select('slug, category')
    .eq('is_published', true)
  for (const post of posts ?? []) {
    urls.push(`${SITE_URL}/resources/blog/${post.category}/${post.slug}`)
  }

  const { data: guides } = await (supabase.from('how_to_guides') as any)
    .select('slug')
    .eq('is_published', true)
  for (const guide of guides ?? []) {
    urls.push(`${SITE_URL}/resources/how-to/${guide.slug}`)
  }

  const MAX_URLS = 200
  const BATCH_SIZE = 5
  const urlsToAudit = urls.slice(0, MAX_URLS)
  const results = []
  for (let i = 0; i < urlsToAudit.length; i += BATCH_SIZE) {
    const batch = urlsToAudit.slice(i, i + BATCH_SIZE)
    const batchResults = await Promise.all(batch.map(url => auditUrl(url)))
    results.push(...batchResults)
  }

  await (supabase.from('seo_audit_log') as any).upsert(results, { onConflict: 'page_url' })

  return {
    audited: results.length,
    issues: results.filter((r) => r.issues.length > 0).length,
    errors: results.filter((r) => r.status_code >= 400 || r.status_code === 0).length,
  }
}
