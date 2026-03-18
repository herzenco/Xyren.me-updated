import Anthropic from '@anthropic-ai/sdk'
import { createClient } from '@supabase/supabase-js'

// Use an untyped client so content-engine tables don't require generated types yet
function createContentClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  )
}

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

export interface TopicDecision {
  type: 'blog' | 'how-to'
  title: string
  slug: string
  category: string
  target_keyword: string
  secondary_keywords: string[]
  reasoning: string
  estimated_search_volume_tier: 'high' | 'medium' | 'low'
}

export interface GeneratedContent {
  title: string
  slug: string
  type: 'blog' | 'how-to'
  category: string
  excerpt: string
  content: string
  tags: string[]
  reading_time: number
  seo_title: string
  meta_description: string
  focus_keyword: string
  secondary_keywords: string[]
  og_title: string
  og_description: string
  schema_markup: Record<string, unknown>
  internal_links: string[]
  seo_score: number
  topic_reasoning: string
  keyword_density: number
  readability_score: number
}

interface BlogPostRow {
  title: string
  slug: string
  category: string
  tags: string[] | null
  published_at: string | null
}

interface HowToGuideRow {
  title: string
  slug: string
  difficulty: string
  tags: string[] | null
  published_at: string | null
}

interface ContentSettingsRow {
  site_niche_context: string | null
  target_keywords: string[] | null
  excluded_topics: string[] | null
}

interface ContentPerformanceRow {
  post_id: string
  post_type: string
  views: number
  avg_time_on_page: number | null
}

export async function buildContext(): Promise<string> {
  const supabase = createContentClient()

  const [postsResult, guidesResult, settingsResult, performanceResult] = await Promise.all([
    supabase
      .from('blog_posts')
      .select('title, slug, category, tags, published_at')
      .eq('is_published', true)
      .order('published_at', { ascending: false })
      .limit(50),
    supabase
      .from('how_to_guides')
      .select('title, slug, difficulty, tags, published_at')
      .eq('is_published', true)
      .order('published_at', { ascending: false })
      .limit(20),
    supabase.from('content_settings').select('*').single(),
    supabase
      .from('content_performance')
      .select('post_id, post_type, views, avg_time_on_page')
      .order('views', { ascending: false })
      .limit(10),
  ])

  const posts = (postsResult.data ?? []) as BlogPostRow[]
  const guides = (guidesResult.data ?? []) as HowToGuideRow[]
  const settings = settingsResult.data as ContentSettingsRow | null
  const topPerformers = (performanceResult.data ?? []) as ContentPerformanceRow[]

  return `
SITE CONTEXT: ${settings?.site_niche_context ?? 'Xyren.me builds fast, modern websites and handles digital marketing for service-based small businesses.'}

EXISTING BLOG POSTS (${posts.length} total):
${posts.map((p) => `- "${p.title}" [${p.category}] [${(p.tags ?? []).join(', ')}]`).join('\n') || 'None yet'}

EXISTING HOW-TO GUIDES (${guides.length} total):
${guides.map((g) => `- "${g.title}" [${g.difficulty}]`).join('\n') || 'None yet'}

TOP PERFORMING CONTENT (by views):
${
  topPerformers
    .map(
      (p) =>
        `- post_id: ${p.post_id} (${p.post_type}) — ${p.views} views, ${Math.round(p.avg_time_on_page ?? 0)}s avg time`
    )
    .join('\n') || 'No performance data yet — use a balanced content mix.'
}

TARGET KEYWORDS TO PRIORITIZE: ${(settings?.target_keywords ?? []).join(', ') || 'local SEO, service business website, small business digital marketing'}

EXCLUDED TOPICS: ${(settings?.excluded_topics ?? []).join(', ') || 'none'}

TODAY'S DATE: ${new Date().toISOString().split('T')[0]}
DAY OF WEEK: ${new Date().toLocaleDateString('en-US', { weekday: 'long' })}
`.trim()
}

export async function selectTopic(context: string): Promise<TopicDecision> {
  const response = await anthropic.messages.create({
    model: 'claude-opus-4-6',
    max_tokens: 1024,
    messages: [
      {
        role: 'user',
        content: `You are an expert content strategist for a web design and digital marketing agency targeting service-based small businesses.

${context}

Select the best content topic to publish today. Avoid any topic already covered in the existing content listed above. Pick topics with real search demand that service business owners would actively search for.

Respond with ONLY valid JSON (no markdown fences, no explanation):
{
  "type": "blog",
  "title": "exact title string",
  "slug": "url-slug-format-lowercase-with-hyphens",
  "category": "one of: seo, marketing, design, business, technology",
  "target_keyword": "primary keyword phrase",
  "secondary_keywords": ["keyword2", "keyword3"],
  "reasoning": "2-3 sentences explaining why this topic now",
  "estimated_search_volume_tier": "medium"
}`,
      },
    ],
  })

  const text = response.content[0].type === 'text' ? response.content[0].text : ''
  return JSON.parse(text) as TopicDecision
}

export async function generateContent(
  topic: TopicDecision,
  context: string
): Promise<GeneratedContent> {
  const existingTitles = context
    .split('EXISTING BLOG POSTS')[1]
    ?.split('EXISTING HOW-TO')[0]
    ?.trim() ?? ''

  const response = await anthropic.messages.create({
    model: 'claude-opus-4-6',
    max_tokens: 4096,
    messages: [
      {
        role: 'user',
        content: `You are an expert content writer for a web design and digital marketing agency targeting service-based small businesses (plumbers, electricians, cleaners, landscapers, etc.).

Write a complete ${topic.type === 'how-to' ? 'how-to guide' : 'blog post'} for:
Title: ${topic.title}
Target keyword: ${topic.target_keyword}
Secondary keywords: ${topic.secondary_keywords.join(', ')}

REQUIREMENTS:
- Write in MDX format using # for H1, ## for H2, ### for H3, **bold**, *italic*, lists, etc.
- Blog posts: 800–1200 words. How-to guides: 1000–1500 words.
- Include the target keyword naturally in the first paragraph, at least 2 H2 headings, and the conclusion
- Add internal links where relevant using markdown: [anchor text](/resources/blog/category/slug)
- Known existing content for internal linking:
${existingTitles}
- End with a clear CTA linking to /#contact or /#pricing
- Write for a non-technical small business owner — clear, practical, actionable

Respond with ONLY valid JSON (no markdown fences):
{
  "title": "${topic.title}",
  "slug": "${topic.slug}",
  "type": "${topic.type}",
  "category": "${topic.category}",
  "excerpt": "2 sentence summary, max 160 chars total",
  "content": "full MDX content as a single string",
  "tags": ["tag1", "tag2", "tag3"],
  "reading_time": 6,
  "seo_title": "SEO title under 60 chars",
  "meta_description": "meta description under 155 chars",
  "focus_keyword": "${topic.target_keyword}",
  "secondary_keywords": ${JSON.stringify(topic.secondary_keywords)},
  "og_title": "OG title",
  "og_description": "OG description under 200 chars",
  "schema_markup": { "@context": "https://schema.org", "@type": "Article", "headline": "${topic.title}" },
  "internal_links": [],
  "topic_reasoning": "${topic.reasoning}"
}`,
      },
    ],
  })

  const text = response.content[0].type === 'text' ? response.content[0].text : ''
  const parsed = JSON.parse(text) as GeneratedContent

  // Calculate reading time from word count
  const wordCount = parsed.content.split(/\s+/).length
  parsed.reading_time = Math.max(1, Math.ceil(wordCount / 200))

  // Calculate keyword density
  const keywordCount = (
    parsed.content.toLowerCase().match(new RegExp(topic.target_keyword.toLowerCase(), 'g')) ?? []
  ).length
  parsed.keyword_density =
    Math.round((keywordCount / Math.max(wordCount, 1)) * 1000) / 10

  return parsed
}

export async function reviewSEO(
  content: GeneratedContent
): Promise<GeneratedContent & { seo_score: number; readability_score: number }> {
  const response = await anthropic.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 512,
    messages: [
      {
        role: 'user',
        content: `You are an SEO expert. Review this content and return a JSON score.

Title: ${content.title}
Focus keyword: ${content.focus_keyword}
Meta description (${content.meta_description.length} chars): ${content.meta_description}
Word count: ~${content.content.split(/\s+/).length}
Keyword density: ${content.keyword_density}%
Content preview (first 400 chars): ${content.content.substring(0, 400)}

Score each of these five factors 0–20 and return a total (0–100):
1. Keyword presence and density (target: 1–2%)
2. Meta description quality and length (target: 120–155 chars)
3. Title SEO quality (target: under 60 chars, includes keyword)
4. Content structure (H1 → H2 → H3 hierarchy, intro paragraph)
5. Readability for non-technical audience

Respond with ONLY valid JSON:
{"seo_score": 85, "readability_score": 78}`,
      },
    ],
  })

  const text = response.content[0].type === 'text' ? response.content[0].text : '{}'
  const review = JSON.parse(text)

  return {
    ...content,
    seo_score: review.seo_score ?? 70,
    readability_score: review.readability_score ?? 70,
  }
}

export async function reviseContent(
  draft: { content: string; title: string },
  requestedChanges: string
): Promise<string> {
  const response = await anthropic.messages.create({
    model: 'claude-opus-4-6',
    max_tokens: 4096,
    messages: [
      {
        role: 'user',
        content: `You are a content editor. Apply the requested changes to this blog post and return the revised content.

TITLE: ${draft.title}

CURRENT CONTENT:
${draft.content}

REQUESTED CHANGES:
${requestedChanges}

Return ONLY the revised MDX content string. No JSON wrapper. No explanation.`,
      },
    ],
  })

  return response.content[0].type === 'text' ? response.content[0].text : draft.content
}
