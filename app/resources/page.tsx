import type { Metadata } from 'next'
import Link from 'next/link'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { BookOpen, Lightbulb, HelpCircle, ArrowRight } from 'lucide-react'
import { siteConfig } from '@/lib/config'
import { seoMetadata } from '@/lib/seo'

export const metadata: Metadata = {
  title: seoMetadata.resources.title,
  description: seoMetadata.resources.description,
  alternates: {
    canonical: `${siteConfig.url}/resources`,
  },
  openGraph: {
    title: seoMetadata.resources.title,
    description: seoMetadata.resources.description,
    images: [seoMetadata.resources.image],
  },
  twitter: {
    title: seoMetadata.resources.title,
    description: seoMetadata.resources.description,
    images: [seoMetadata.resources.image],
  },
}

const hubs = [
  {
    icon: BookOpen,
    title: 'Blog',
    description: 'Industry insights, website tips, and marketing advice for service professionals.',
    href: '/resources/blog',
    badge: 'Articles',
  },
  {
    icon: Lightbulb,
    title: 'How-To Guides',
    description: 'Step-by-step guides for improving your online presence and getting more leads.',
    href: '/resources/how-to',
    badge: 'Guides',
  },
  {
    icon: HelpCircle,
    title: 'FAQ',
    description: 'Common questions about building a website with Xyren.me answered in full.',
    href: '/resources/faq',
    badge: 'Q&A',
  },
]

export default function ResourcesPage() {
  return (
    <div className="py-20 md:py-28">
      <div className="container mx-auto px-4">
        <div className="mx-auto max-w-2xl text-center mb-16">
          <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl">Resources</h1>
          <p className="mt-4 text-lg text-muted-foreground">
            Free guides and articles to help your service business grow online.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-3 max-w-4xl mx-auto">
          {hubs.map((hub) => {
            const Icon = hub.icon
            return (
              <Link key={hub.href} href={hub.href} className="group">
                <Card className="h-full hover:border-primary/50 hover:shadow-md transition-all">
                  <CardHeader className="pb-2">
                    <div className="flex items-start justify-between">
                      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 mb-3">
                        <Icon className="h-6 w-6 text-primary" />
                      </div>
                      <Badge variant="secondary">{hub.badge}</Badge>
                    </div>
                    <h2 className="text-xl font-bold">{hub.title}</h2>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground mb-4">{hub.description}</p>
                    <span className="inline-flex items-center gap-1 text-sm font-medium text-primary group-hover:gap-2 transition-all">
                      Browse {hub.title} <ArrowRight className="h-4 w-4" />
                    </span>
                  </CardContent>
                </Card>
              </Link>
            )
          })}
        </div>
      </div>
    </div>
  )
}
