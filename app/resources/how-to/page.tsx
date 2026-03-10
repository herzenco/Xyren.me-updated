import type { Metadata } from 'next'
import Link from 'next/link'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Clock, ArrowRight } from 'lucide-react'
import { siteConfig } from '@/lib/config'
import { createClient } from '@/lib/supabase/server'

export const metadata: Metadata = {
  title: 'How-To Guides — Website & Marketing for Service Professionals',
  description:
    'Step-by-step guides to help service business owners improve their website, SEO, and online lead generation.',
  alternates: {
    canonical: `${siteConfig.url}/resources/how-to`,
  },
}

async function getGuides() {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('guides')
    .select('*')
    .order('published_at', { ascending: false })

  if (error) {
    console.error('Error fetching guides:', error)
    return []
  }

  return data
}

const difficultyColors = {
  beginner: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
  intermediate: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
  advanced: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
}

export default async function HowToPage() {
  const guides = await getGuides()

  return (
    <div className="py-20 md:py-28">
      <div className="container mx-auto px-4">
        <div className="mx-auto max-w-2xl text-center mb-16">
          <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl">How-To Guides</h1>
          <p className="mt-4 text-lg text-muted-foreground">
            Actionable, step-by-step guides for service business owners who want to grow online.
          </p>
        </div>

        {guides.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">No guides found. Check back soon!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 max-w-5xl mx-auto">
            {guides.map((guide) => (
              <Link key={guide.slug} href={`/resources/how-to/${guide.slug}`} className="group">
                <Card className="h-full hover:border-primary/50 hover:shadow-md transition-all">
                  <CardContent className="p-6 space-y-3">
                    <div className="flex items-center gap-2">
                      <span
                        className={`text-xs font-medium px-2.5 py-1 rounded-full capitalize ${difficultyColors[guide.difficulty as keyof typeof difficultyColors]
                          }`}
                      >
                        {guide.difficulty}
                      </span>
                      <span className="text-xs text-muted-foreground flex items-center gap-1">
                        <Clock className="h-3 w-3" /> {guide.reading_time} min
                      </span>
                    </div>
                    <h2 className="font-bold leading-snug group-hover:text-primary transition-colors">
                      {guide.title}
                    </h2>
                    <p className="text-sm text-muted-foreground line-clamp-2">{guide.excerpt}</p>
                    <span className="inline-flex items-center gap-1 text-sm font-medium text-primary group-hover:gap-2 transition-all">
                      Read guide <ArrowRight className="h-4 w-4" />
                    </span>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
