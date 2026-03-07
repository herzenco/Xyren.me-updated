import { MetadataRoute } from 'next'
import { siteConfig } from '@/lib/config'

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = siteConfig.url

  const staticRoutes = [
    { path: '', priority: 1.0, frequency: 'weekly' as const },
    { path: '/use-cases/professional-services', priority: 0.8, frequency: 'monthly' as const },
    { path: '/use-cases/home-services', priority: 0.8, frequency: 'monthly' as const },
    { path: '/resources', priority: 0.8, frequency: 'monthly' as const },
    { path: '/resources/blog', priority: 0.8, frequency: 'weekly' as const },
    { path: '/resources/how-to', priority: 0.8, frequency: 'monthly' as const },
    { path: '/resources/faq', priority: 0.8, frequency: 'monthly' as const },
  ].map((route) => ({
    url: `${baseUrl}${route.path}`,
    lastModified: new Date(),
    changeFrequency: route.frequency,
    priority: route.priority,
  }))

  return staticRoutes
}
