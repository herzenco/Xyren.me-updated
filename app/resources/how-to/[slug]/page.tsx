import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { cache } from 'react'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { ArrowLeft, Clock } from 'lucide-react'
import { siteConfig } from '@/lib/config'
import { MDXContent } from '@/components/mdx-content'
import { createClient } from '@/lib/supabase/server'

type Props = { params: Promise<{ slug: string }> }

const getGuide = cache(async (slug: string) => {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('how_to_guides')
    .select('*')
    .eq('slug', slug)
    .eq('is_published', true)
    .single()

  if (error) {
    if (error.code !== 'PGRST116') console.error('Error fetching guide:', error)
    return null
  }

  return data
})

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const guide = await getGuide(slug)
  if (!guide) return {}

  const url = `${siteConfig.url}/resources/how-to/${slug}`
  const image = guide.cover_image ?? `${siteConfig.url}${siteConfig.ogImage}`

  return {
    title: guide.title,
    description: guide.excerpt,
    alternates: { canonical: url },
    openGraph: {
      title: guide.title,
      description: guide.excerpt ?? undefined,
      type: 'article',
      url,
      publishedTime: guide.published_at ?? undefined,
      images: [{ url: image, width: 1200, height: 630, alt: guide.title }],
    },
  }
}

export default async function HowToGuidePage({ params }: Props) {
  const { slug } = await params
  const guide = await getGuide(slug)

  if (!guide) notFound()

  const guideUrl = `${siteConfig.url}/resources/how-to/${slug}`
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'HowTo',
    name: guide.title,
    description: guide.excerpt,
    url: guideUrl,
    image: guide.cover_image ?? `${siteConfig.url}${siteConfig.ogImage}`,
    estimatedCost: { '@type': 'MonetaryAmount', currency: 'USD', value: '0' },
    totalTime: guide.reading_time ? `PT${guide.reading_time}M` : undefined,
    publisher: {
      '@type': 'Organization',
      name: siteConfig.name,
      url: siteConfig.url,
    },
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <div className="py-20 md:py-28">
        <div className="container mx-auto px-4">
          <article className="mx-auto max-w-2xl">
            <Link
              href="/resources/how-to"
              className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-8 transition-colors"
            >
              <ArrowLeft className="h-4 w-4" /> All guides
            </Link>

            <div className="flex items-center gap-3 mb-4">
              <Badge variant="secondary" className="capitalize">{guide.difficulty}</Badge>
              <span className="text-sm text-muted-foreground flex items-center gap-1">
                <Clock className="h-4 w-4" /> {guide.reading_time} min read
              </span>
            </div>

            <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl leading-tight mb-8">
              {guide.title}
            </h1>

            <Separator className="mb-8" />

            <MDXContent source={guide.content ?? ''} />

            <Separator className="my-12" />

            <div className="rounded-xl bg-primary/5 border border-primary/20 p-6 text-center">
              <h2 className="text-xl font-bold mb-2">Want this done for you?</h2>
              <p className="text-muted-foreground mb-4 text-sm">
                Every website we build includes proper local SEO setup from day one.
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
    </>
  )
}
