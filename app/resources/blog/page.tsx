import type { Metadata } from 'next'
import Link from 'next/link'
import { Badge } from '@/components/ui/badge'
import { ArrowRight, Clock } from 'lucide-react'
import { siteConfig } from '@/lib/config'
import { createClient } from '@/lib/supabase/server'

export const metadata: Metadata = {
  title: 'Blog — Website & Marketing Tips for Service Professionals',
  description:
    'Articles on local SEO, lead generation, website design, and online marketing for service-based businesses.',
  alternates: {
    canonical: `${siteConfig.url}/resources/blog`,
  },
}

type BlogPost = {
  slug: string
  title: string
  category: string
  excerpt: string
  reading_time: number | null
  published_at: string | null
  cover_image: string | null
  tags: string[] | null
}


export default async function BlogPage() {
  const supabase = await createClient()
  const [postsResult, categoriesResult] = await Promise.all([
    (supabase as any).from('blog_posts').select('slug, title, category, excerpt, reading_time, published_at, cover_image, tags').eq('is_published', true).order('published_at', { ascending: false }),
    (supabase as any).from('blog_categories').select('slug, name').gt('post_count', 0).order('post_count', { ascending: false }),
  ])
  const posts = (postsResult.data ?? []) as BlogPost[]
  const categories = categoriesResult.data ?? []

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
        {(categories ?? []).length > 0 && (
        <div className="flex flex-wrap gap-2 justify-center mb-12">
          <Link href="/resources/blog">
            <Badge variant="default" className="cursor-pointer px-4 py-1.5 text-sm">All</Badge>
          </Link>
          {(categories ?? []).map((cat: any) => (
            <Link key={cat.slug} href={`/resources/blog/${cat.slug}`}>
              <Badge variant="outline" className="cursor-pointer px-4 py-1.5 text-sm">
                {cat.name}
              </Badge>
            </Link>
          ))}
        </div>
        )}

        {/* Posts grid */}
        {posts.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">No blog posts found. Check back soon!</p>
          </div>
        ) : (
          <div className="max-w-3xl mx-auto divide-y divide-border">
            {posts.map((post) => (
              <Link
                key={post.slug}
                href={`/resources/blog/${post.category}/${post.slug}`}
                className="group block py-6 first:pt-0"
              >
                <div className="flex items-center gap-3 text-xs text-muted-foreground mb-2">
                  <Badge variant="secondary" className="text-xs capitalize">
                    {post.category}
                  </Badge>
                  <span>
                    {new Date(post.published_at ?? Date.now()).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                    })}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {post.reading_time} min
                  </span>
                </div>
                <h2 className="text-lg font-bold leading-snug group-hover:text-primary transition-colors">
                  {post.title}
                </h2>
                <p className="mt-1.5 text-sm text-muted-foreground line-clamp-2">{post.excerpt}</p>
                <span className="inline-flex items-center gap-1 mt-2 text-xs font-medium text-primary group-hover:gap-2 transition-all">
                  Read more <ArrowRight className="h-3 w-3" />
                </span>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
