import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { ExternalLink } from 'lucide-react'
import Link from 'next/link'

const projects = [
  {
    title: 'Sunrise Plumbing Co.',
    category: 'Home Services',
    description: 'Lead-generating site with online booking and Google Reviews integration.',
    tags: ['Plumbing', 'Booking', 'Local SEO'],
    href: '#',
    result: '+340% more leads in 90 days',
  },
  {
    title: 'Hartwell Law Group',
    category: 'Professional Services',
    description: 'Authority-building website for a boutique law firm with case study content.',
    tags: ['Legal', 'Content', 'SEO'],
    href: '#',
    result: 'Ranked #1 for 12 local keywords',
  },
  {
    title: 'Peak Performance Physio',
    category: 'Healthcare',
    description: 'Patient-focused site with intake forms, scheduling, and patient education.',
    tags: ['Healthcare', 'Booking', 'Forms'],
    href: '#',
    result: '2× appointment bookings',
  },
]

export function Portfolio() {
  return (
    <section id="portfolio" className="py-20 md:py-28 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="mx-auto max-w-2xl text-center mb-16">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
            Work that gets results
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            Real sites, real service businesses, real outcomes.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          {projects.map((project) => (
            <Card key={project.title} className="group overflow-hidden hover:shadow-lg transition-shadow">
              <div className="aspect-video bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
                <span className="text-4xl font-bold text-primary/30">
                  {project.title.charAt(0)}
                </span>
              </div>
              <CardContent className="p-6 space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <Badge variant="secondary" className="mb-2 text-xs">
                      {project.category}
                    </Badge>
                    <h3 className="font-semibold">{project.title}</h3>
                  </div>
                  <Link
                    href={project.href}
                    className="opacity-0 group-hover:opacity-100 transition-opacity"
                    aria-label={`View ${project.title}`}
                  >
                    <ExternalLink className="h-4 w-4 text-muted-foreground" />
                  </Link>
                </div>
                <p className="text-sm text-muted-foreground">{project.description}</p>
                <div className="flex flex-wrap gap-1">
                  {project.tags.map((tag) => (
                    <Badge key={tag} variant="outline" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                </div>
                <p className="text-sm font-medium text-primary">{project.result}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}
