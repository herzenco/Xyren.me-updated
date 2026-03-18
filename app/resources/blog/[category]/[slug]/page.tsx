import type { Metadata } from 'next'
import { cache } from 'react'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { ArrowLeft, Clock, Calendar } from 'lucide-react'
import { siteConfig } from '@/lib/config'
import { createClient } from '@/lib/supabase/server'

type Props = { params: Promise<{ category: string; slug: string }> }

const getPost = cache(async (category: string, slug: string) => {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('blog_posts')
    .select('*')
    .eq('slug', slug)
    .eq('category', category)
    .eq('is_published', true)
    .single()

  if (error) {
    if (error.code !== 'PGRST116') console.error('Error fetching blog post:', error)
    return null
  }
  return data
})

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { category, slug } = await params
  const post = await getPost(category, slug)
  if (!post) return {}

  return {
    title: post.title,
    description: post.excerpt,
    alternates: {
      canonical: `${siteConfig.url}/resources/blog/${category}/${slug}`,
    },
    openGraph: {
      title: post.title,
      description: post.excerpt,
      type: 'article',
      publishedTime: post.published_at,
    },
  }
}

export default async function BlogPostPage({ params }: Props) {
  const { category, slug } = await params
  const post = await getPost(category, slug)

  if (!post) notFound()

  return (
    <div className="py-20 md:py-28">
      <div className="container mx-auto px-4">
        <article className="mx-auto max-w-2xl">
          <Link
            href={`/resources/blog/${category}`}
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-8 transition-colors capitalize"
          >
            <ArrowLeft className="h-4 w-4" /> {category} articles
          </Link>

          <Badge variant="secondary" className="mb-4 capitalize">{category}</Badge>

          <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl leading-tight mb-6">
            {post.title}
          </h1>

          <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground mb-8">
            <span className="flex items-center gap-1.5">
              <Calendar className="h-4 w-4" />
              {new Date(post.published_at).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
            </span>
            <span className="flex items-center gap-1.5">
              <Clock className="h-4 w-4" />
              {post.reading_time} min read
            </span>
            <span>By {post.author}</span>
          </div>

          <Separator className="mb-8" />

          {/* Content — replace with MDX renderer for rich content */}
          <div className="prose prose-neutral dark:prose-invert max-w-none">
            <pre className="whitespace-pre-wrap font-sans text-base leading-relaxed">{post.content}</pre>
          </div>

          <Separator className="my-12" />

          <div className="rounded-xl bg-primary/5 border border-primary/20 p-6 text-center">
            <h2 className="text-xl font-bold mb-2">Ready to fix your website?</h2>
            <p className="text-muted-foreground mb-4 text-sm">
              We build fast, SEO-optimized websites for service professionals in 5–10 days.
            </p>
            <Link
              href="/#contact"
              className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-6 py-2.5 rounded-md text-sm font-medium hover:bg-primary/90 transition-colors"
            >
              Get a Free Quote
            </Link>
          </div>
        </article>
      </div>
    </div>
  )
}
