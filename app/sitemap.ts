import { MetadataRoute } from 'next'
import { siteConfig } from '@/lib/config'
import { createClient } from '@/lib/supabase/server'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = siteConfig.url

  const staticRoutes: MetadataRoute.Sitemap = [
    '',
    '/use-cases/professional-services',
    '/use-cases/home-services',
    '/resources',
    '/resources/blog',
    '/resources/how-to',
    '/resources/faq',
  ].map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: 'monthly',
    priority: route === '' ? 1 : 0.8,
  }))

  const supabase = await createClient()

  const [postsResult, categoriesResult, guidesResult] = await Promise.all([
    (supabase as any).from('blog_posts').select('slug, category, updated_at').eq('is_published', true).order('published_at', { ascending: false }),
    (supabase as any).from('blog_categories').select('slug, updated_at').gt('post_count', 0),
    (supabase as any).from('how_to_guides').select('slug, updated_at').eq('is_published', true).order('published_at', { ascending: false }),
  ])

  const posts = postsResult.data ?? []
  const categories = categoriesResult.data ?? []
  const guides = guidesResult.data ?? []

  const blogRoutes: MetadataRoute.Sitemap = posts.map((post: any) => ({
    url: `${baseUrl}/resources/blog/${post.category}/${post.slug}`,
    lastModified: post.updated_at ? new Date(post.updated_at) : new Date(),
    changeFrequency: 'weekly',
    priority: 0.7,
  }))

  const categoryRoutes: MetadataRoute.Sitemap = categories.map((cat: any) => ({
    url: `${baseUrl}/resources/blog/${cat.slug}`,
    lastModified: cat.updated_at ? new Date(cat.updated_at) : new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.75,
  }))

  const guideRoutes: MetadataRoute.Sitemap = guides.map((guide: any) => ({
    url: `${baseUrl}/resources/how-to/${guide.slug}`,
    lastModified: guide.updated_at ? new Date(guide.updated_at) : new Date(),
    changeFrequency: 'weekly',
    priority: 0.7,
  }))

  return [...staticRoutes, ...categoryRoutes, ...blogRoutes, ...guideRoutes]
}
