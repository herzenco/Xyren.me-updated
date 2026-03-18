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

  // Published blog posts
  const { data: posts } = await supabase
    .from('blog_posts')
    .select('slug, category, updated_at')
    .eq('is_published', true)
    .order('published_at', { ascending: false })

  const blogRoutes: MetadataRoute.Sitemap = (posts ?? []).map((post) => ({
    url: `${baseUrl}/resources/blog/${post.category}/${post.slug}`,
    lastModified: post.updated_at ? new Date(post.updated_at) : new Date(),
    changeFrequency: 'weekly',
    priority: 0.7,
  }))

  // Published how-to guides
  const { data: guides } = await supabase
    .from('how_to_guides')
    .select('slug, updated_at')
    .eq('is_published', true)
    .order('published_at', { ascending: false })

  const guideRoutes: MetadataRoute.Sitemap = (guides ?? []).map((guide) => ({
    url: `${baseUrl}/resources/how-to/${guide.slug}`,
    lastModified: guide.updated_at ? new Date(guide.updated_at) : new Date(),
    changeFrequency: 'weekly',
    priority: 0.7,
  }))

  return [...staticRoutes, ...blogRoutes, ...guideRoutes]
}
