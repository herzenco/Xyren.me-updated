import type { Metadata } from 'next'
import Link from 'next/link'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ArrowRight, Clock } from 'lucide-react'
import { siteConfig } from '@/lib/config'
import { seoMetadata } from '@/lib/seo'
import { createClient } from '@/lib/supabase/server'

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

export default async function BlogPage() {
  const supabase = await createClient()

  // Fetch published posts from Supabase
  const { data: posts, error } = await (supabase.from('blog_posts') as any)
    .select('*')
    .eq('is_published', true)
    .order('published_at', { ascending: false })

  const displayPosts = posts || []
  const uniqueCategories: string[] = Array.from(
    new Set(
      displayPosts.map((p: any) => {
        const cat = p.category as string
        return cat.charAt(0).toUpperCase() + cat.slice(1)
      })
    )
  ) as string[]
  const categories: string[] = ['All', ...uniqueCategories]
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
          {displayPosts.length === 0 ? (
            <div className="col-span-full text-center py-12">
              <p className="text-muted-foreground">No posts published yet. Check back soon!</p>
            </div>
          ) : (
            displayPosts.map((post: any) => (
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
                        <Clock className="h-3 w-3" aria-hidden="true" />
                        {post.reading_time} min read
                      </span>
                    </div>
                    <span className="inline-flex items-center gap-1 text-xs font-medium text-primary group-hover:gap-2 transition-all">
                      Read more <ArrowRight className="h-3 w-3" aria-hidden="true" />
                    </span>
                  </CardContent>
                </Card>
              </Link>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
