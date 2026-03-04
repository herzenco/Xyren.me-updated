import type { Metadata } from 'next'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { CheckCircle, ArrowRight } from 'lucide-react'
import { siteConfig } from '@/lib/config'

export const metadata: Metadata = {
  title: 'Websites for Professional Services',
  description:
    'Custom websites for lawyers, accountants, consultants, and other professional service providers. Built to establish authority and generate qualified leads.',
  alternates: {
    canonical: `${siteConfig.url}/use-cases/professional-services`,
  },
}

const serviceTypes = [
  'Law Firms & Attorneys',
  'Accountants & CPAs',
  'Business Consultants',
  'Financial Advisors',
  'HR & Recruiting Firms',
  'Marketing Agencies',
  'Insurance Brokers',
  'Real Estate Agents',
]

const features = [
  {
    title: 'Authority-Building Content',
    description: 'Showcase your expertise with case studies, testimonials, and thought leadership content.',
  },
  {
    title: 'Consultation Booking',
    description: 'Let prospects book discovery calls directly from your website without back-and-forth emails.',
  },
  {
    title: 'Lead Qualification Forms',
    description: 'Filter out poor-fit prospects before they ever reach your calendar.',
  },
  {
    title: 'Service Page SEO',
    description: 'Rank for high-intent search terms your ideal clients are searching for right now.',
  },
]

export default function ProfessionalServicesPage() {
  return (
    <div>
      {/* Hero */}
      <section className="bg-gradient-to-b from-background to-muted/30 py-20 md:py-28">
        <div className="container mx-auto px-4 text-center">
          <Badge variant="secondary" className="mb-6">Professional Services</Badge>
          <h1 className="mx-auto max-w-4xl text-4xl font-extrabold tracking-tight sm:text-5xl md:text-6xl">
            A website that positions you as the{' '}
            <span className="text-primary">obvious expert</span>
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground">
            Lawyers, consultants, accountants — your clients Google you before they hire you.
            Make sure what they find builds trust and drives them to book.
          </p>
          <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild size="lg">
              <Link href="/#contact">Get a Free Quote <ArrowRight className="ml-2 h-4 w-4" /></Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link href="/#portfolio">See Examples</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Service types */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-center text-2xl font-bold mb-8">Who we build for</h2>
          <div className="flex flex-wrap gap-3 justify-center">
            {serviceTypes.map((type) => (
              <Badge key={type} variant="outline" className="text-sm px-4 py-2">
                {type}
              </Badge>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-2xl text-center mb-12">
            <h2 className="text-3xl font-bold tracking-tight">
              What your website will do for you
            </h2>
          </div>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            {features.map((feature) => (
              <Card key={feature.title}>
                <CardContent className="p-6 flex gap-4">
                  <CheckCircle className="h-6 w-6 text-primary shrink-0 mt-0.5" />
                  <div>
                    <h3 className="font-semibold mb-1">{feature.title}</h3>
                    <p className="text-sm text-muted-foreground">{feature.description}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 text-center">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold mb-4">Ready to get more clients?</h2>
          <p className="text-muted-foreground mb-8 max-w-xl mx-auto">
            Let&apos;s build a website that works as hard as you do.
          </p>
          <Button asChild size="lg">
            <Link href="/#contact">Start Your Project</Link>
          </Button>
        </div>
      </section>
    </div>
  )
}
