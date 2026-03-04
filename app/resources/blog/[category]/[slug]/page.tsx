import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { ArrowLeft, Clock, Calendar } from 'lucide-react'
import { siteConfig } from '@/lib/config'

type Props = { params: Promise<{ category: string; slug: string }> }

// In production, fetch from Supabase
async function getPost(category: string, slug: string) {
  const posts: Record<string, Record<string, { title: string; excerpt: string; content: string; published_at: string; reading_time: number; author: string }>> = {
    seo: {
      '7-reasons-website-not-getting-calls': {
        title: '7 Reasons Your Service Business Website Isn\'t Getting Calls',
        excerpt: 'Most service business websites make the same mistakes. Here\'s what to fix first.',
        content: `
# 7 Reasons Your Service Business Website Isn't Getting Calls

Your website is live. You've told your customers about it. But the phone isn't ringing. Sound familiar?

Most service business websites share the same handful of problems. The good news: they're all fixable.

## 1. Your phone number is hard to find

On mobile, your phone number should be at the very top of every page — ideally as a tap-to-call button. If someone has to scroll to find it, you've already lost them.

## 2. Your site loads too slowly

Google penalizes slow sites in rankings, and visitors leave if a page takes more than 3 seconds to load. Image compression and proper hosting go a long way.

## 3. You're not ranking locally

If you're not showing up in Google Maps or the top 3 local results, most of your potential customers will never find you organically.

## 4. There's no clear call to action

Every page needs to tell visitors exactly what to do next: Call now, Book online, Get a free quote. Don't make them guess.

## 5. Your reviews aren't visible

93% of people read reviews before hiring a local service provider. If your 5-star reviews are buried on Google, put them front and center on your site.

## 6. You're not mobile-optimized

Over 70% of local searches happen on mobile. A site that looks broken on a phone is worse than no site.

## 7. Your content doesn't answer questions

Google rewards content that answers the questions your customers are actually searching for. Service pages that just list your offerings aren't enough.

---

*Ready to fix all of these at once? [Get a free quote →](/)*
        `.trim(),
        published_at: '2025-01-15',
        reading_time: 6,
        author: 'Xyren.me Team',
      },
    },
  }

  return posts[category]?.[slug] ?? null
}

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
