import type { Metadata } from 'next'
import Link from 'next/link'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ArrowRight, Clock } from 'lucide-react'
import { siteConfig } from '@/lib/config'
import { seoMetadata } from '@/lib/seo'

export const metadata: Metadata = {
  title: seoMetadata.blog.title,
  description: seoMetadata.blog.description,
  alternates: {
    canonical: `${siteConfig.url}/resources/blog`,
  },
  openGraph: {
    title: seoMetadata.blog.title,
    description: seoMetadata.blog.description,
    images: [seoMetadata.blog.image],
  },
  twitter: {
    title: seoMetadata.blog.title,
    description: seoMetadata.blog.description,
    images: [seoMetadata.blog.image],
  },
}

// Placeholder posts — replace with Supabase fetch
const placeholderPosts = [
  {
    title: '7 Reasons Your Service Business Website Isn\'t Getting Calls',
    slug: '7-reasons-website-not-getting-calls',
    category: 'seo',
    excerpt: 'Most service business websites make the same mistakes. Here\'s what to fix first.',
    published_at: '2025-01-15',
    reading_time: 6,
  },
  {
    title: 'Local SEO in 2025: A Complete Guide for Tradespeople',
    slug: 'local-seo-guide-tradespeople-2025',
    category: 'seo',
    excerpt: 'Everything you need to know about ranking in Google Maps and local search results.',
    published_at: '2025-01-10',
    reading_time: 12,
  },
  {
    title: 'How to Get More 5-Star Google Reviews (Without Begging)',
    slug: 'get-more-google-reviews',
    category: 'marketing',
    excerpt: 'A simple system for consistently collecting reviews that actually convert new customers.',
    published_at: '2025-01-05',
    reading_time: 7,
  },
  {
    title: 'Website Design Trends for Service Businesses in 2025',
    slug: 'website-design-trends-2025',
    category: 'design',
    excerpt: 'Modern design elements that build trust and encourage clients to get in touch.',
    published_at: '2024-12-28',
    reading_time: 8,
  },
  {
    title: 'The Complete Business Guide to Online Reputation Management',
    slug: 'online-reputation-management-guide',
    category: 'business',
    excerpt: 'Monitor, manage, and improve how your business appears online — and why it matters.',
    published_at: '2024-12-20',
    reading_time: 10,
  },
]

const categories = ['All', 'SEO', 'Marketing', 'Design', 'Business']

export default function BlogPage() {
  return (
    <div className="py-20 md:py-28">
      <div className="container mx-auto px-4">
        <div className="mx-auto max-w-2xl text-center mb-12">
          <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl">Blog</h1>
          <p className="mt-4 text-lg text-muted-foreground">
            Practical advice for service business owners who want more from their website.
          </p>
        </div>

        {/* Category filter */}
        <div className="flex flex-wrap gap-2 justify-center mb-12">
          {categories.map((cat) => (
            <Link
              key={cat}
              href={cat === 'All' ? '/resources/blog' : `/resources/blog/${cat.toLowerCase()}`}
            >
              <Badge
                variant={cat === 'All' ? 'default' : 'outline'}
                className="cursor-pointer px-4 py-1.5 text-sm"
              >
                {cat}
              </Badge>
            </Link>
          ))}
        </div>

        {/* Posts grid */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 max-w-5xl mx-auto">
          {placeholderPosts.map((post) => (
            <Link
              key={post.slug}
              href={`/resources/blog/${post.category}/${post.slug}`}
              className="group"
            >
              <Card className="h-full hover:border-primary/50 hover:shadow-md transition-all">
                <div className="aspect-video bg-gradient-to-br from-primary/20 to-primary/5" />
                <CardContent className="p-5 space-y-3">
                  <Badge variant="secondary" className="text-xs capitalize">
                    {post.category}
                  </Badge>
                  <h2 className="font-bold leading-snug group-hover:text-primary transition-colors">
                    {post.title}
                  </h2>
                  <p className="text-sm text-muted-foreground line-clamp-2">{post.excerpt}</p>
                  <div className="flex items-center justify-between text-xs text-muted-foreground pt-1">
                    <span>{new Date(post.published_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {post.reading_time} min read
                    </span>
                  </div>
                  <span className="inline-flex items-center gap-1 text-xs font-medium text-primary group-hover:gap-2 transition-all">
                    Read more <ArrowRight className="h-3 w-3" />
                  </span>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}
