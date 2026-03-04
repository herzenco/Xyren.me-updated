import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { ArrowLeft, Clock } from 'lucide-react'
import { siteConfig } from '@/lib/config'

type Props = { params: Promise<{ slug: string }> }

// In production, fetch from Supabase
async function getGuide(slug: string) {
  const guides: Record<string, { title: string; excerpt: string; content: string; reading_time: number; difficulty: string }> = {
    'setup-google-business-profile': {
      title: 'How to Set Up Google Business Profile for Your Service Business',
      excerpt: 'A complete walkthrough for creating and optimising your Google Business Profile to appear in local search results.',
      difficulty: 'beginner',
      reading_time: 8,
      content: `
## Why Google Business Profile Matters

Your Google Business Profile (GBP) is what appears in Google Maps and the local search pack. For service businesses, it's often the first thing a potential customer sees.

## Step 1: Create or Claim Your Profile

Go to business.google.com and sign in with your Google account. Search for your business name. If it exists, claim it. If not, create a new one.

## Step 2: Fill in Every Field

Don't skip anything:
- Business name (exactly as it appears on your signage)
- Category (be specific — "Plumber" beats "Contractor")
- Address or service area
- Phone number (use a local number if possible)
- Website URL
- Hours of operation

## Step 3: Add Photos

Profiles with photos get 42% more requests for directions and 35% more website clicks. Add:
- Your logo
- Cover photo
- Photos of completed work
- Team photos

## Step 4: Get Your First Reviews

Ask your last 5 customers to leave a review. Send them a direct link from your GBP dashboard under "Get more reviews."

## Step 5: Post Regularly

Google rewards active profiles. Post updates, offers, or new work photos at least once a week.

---

*Want us to set this up for you as part of your new website? [Get in touch →](/)*
      `.trim(),
    },
  }

  return guides[slug] ?? null
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const guide = await getGuide(slug)
  if (!guide) return {}

  return {
    title: guide.title,
    description: guide.excerpt,
    alternates: {
      canonical: `${siteConfig.url}/resources/how-to/${slug}`,
    },
  }
}

export default async function HowToGuidePage({ params }: Props) {
  const { slug } = await params
  const guide = await getGuide(slug)

  if (!guide) notFound()

  return (
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

          <div className="prose prose-neutral dark:prose-invert max-w-none">
            <pre className="whitespace-pre-wrap font-sans text-base leading-relaxed">{guide.content}</pre>
          </div>

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
  )
}
