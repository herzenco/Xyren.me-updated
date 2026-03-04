import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ArrowLeft, Clock } from 'lucide-react'
import { siteConfig } from '@/lib/config'

const validCategories = ['seo', 'marketing', 'design', 'business']

type Props = { params: Promise<{ category: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { category } = await params
  if (!validCategories.includes(category)) return {}

  const title = category.charAt(0).toUpperCase() + category.slice(1)
  return {
    title: `${title} Articles — Blog`,
    description: `Browse all ${title.toLowerCase()} articles for service business owners on Xyren.me.`,
    alternates: {
      canonical: `${siteConfig.url}/resources/blog/${category}`,
    },
  }
}

// Placeholder — replace with Supabase query by category
const placeholderPosts: Record<string, Array<{ title: string; slug: string; excerpt: string; published_at: string; reading_time: number }>> = {
  seo: [
    {
      title: '7 Reasons Your Service Business Website Isn\'t Getting Calls',
      slug: '7-reasons-website-not-getting-calls',
      excerpt: 'Most service business websites make the same mistakes. Here\'s what to fix first.',
      published_at: '2025-01-15',
      reading_time: 6,
    },
    {
      title: 'Local SEO in 2025: A Complete Guide for Tradespeople',
      slug: 'local-seo-guide-tradespeople-2025',
      excerpt: 'Everything you need to know about ranking in Google Maps and local search results.',
      published_at: '2025-01-10',
      reading_time: 12,
    },
  ],
  marketing: [
    {
      title: 'How to Get More 5-Star Google Reviews (Without Begging)',
      slug: 'get-more-google-reviews',
      excerpt: 'A simple system for consistently collecting reviews that actually convert new customers.',
      published_at: '2025-01-05',
      reading_time: 7,
    },
  ],
}

export default async function BlogCategoryPage({ params }: Props) {
  const { category } = await params

  if (!validCategories.includes(category)) notFound()

  const posts = placeholderPosts[category] ?? []
  const categoryTitle = category.charAt(0).toUpperCase() + category.slice(1)

  return (
    <div className="py-20 md:py-28">
      <div className="container mx-auto px-4">
        <div className="max-w-5xl mx-auto">
          <Link
            href="/resources/blog"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-8 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" /> All articles
          </Link>
          <h1 className="text-4xl font-extrabold tracking-tight mb-4">{categoryTitle}</h1>
          <p className="text-muted-foreground mb-12">{posts.length} article{posts.length !== 1 ? 's' : ''}</p>

          {posts.length === 0 ? (
            <p className="text-muted-foreground">No articles in this category yet. Check back soon.</p>
          ) : (
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              {posts.map((post) => (
                <Link
                  key={post.slug}
                  href={`/resources/blog/${category}/${post.slug}`}
                  className="group"
                >
                  <Card className="h-full hover:border-primary/50 hover:shadow-md transition-all">
                    <div className="aspect-video bg-gradient-to-br from-primary/20 to-primary/5" />
                    <CardContent className="p-5 space-y-3">
                      <Badge variant="secondary" className="text-xs capitalize">{category}</Badge>
                      <h2 className="font-bold leading-snug group-hover:text-primary transition-colors">
                        {post.title}
                      </h2>
                      <p className="text-sm text-muted-foreground">{post.excerpt}</p>
                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <span>{new Date(post.published_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />{post.reading_time} min read
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
