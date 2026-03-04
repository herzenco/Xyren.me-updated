import type { Metadata } from 'next'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { CheckCircle, ArrowRight, Phone, Star, MapPin, Clock } from 'lucide-react'
import { siteConfig } from '@/lib/config'

export const metadata: Metadata = {
  title: 'Websites for Home Services Businesses',
  description:
    'Custom websites for plumbers, electricians, HVAC, landscapers, and other home service providers. Built for local SEO and phone call conversions.',
  alternates: {
    canonical: `${siteConfig.url}/use-cases/home-services`,
  },
}

const serviceTypes = [
  'Plumbing', 'Electrical', 'HVAC', 'Landscaping', 'Roofing',
  'Painting', 'Cleaning', 'Pest Control', 'Handyman', 'Flooring',
]

const features = [
  {
    icon: Phone,
    title: 'Click-to-Call Prominent',
    description: 'Your phone number is impossible to miss on mobile — the #1 source of leads for home services.',
  },
  {
    icon: MapPin,
    title: 'Local SEO Domination',
    description: 'Rank in the Google Maps pack and local search results for every service area you cover.',
  },
  {
    icon: Star,
    title: 'Reviews Front and Center',
    description: 'Automatically pull and display your Google Reviews to build trust before they call.',
  },
  {
    icon: Clock,
    title: 'Emergency Service Flags',
    description: 'Highlight 24/7 availability and emergency service offerings to capture urgent jobs.',
  },
]

export default function HomeServicesPage() {
  return (
    <div>
      {/* Hero */}
      <section className="bg-gradient-to-b from-background to-muted/30 py-20 md:py-28">
        <div className="container mx-auto px-4 text-center">
          <Badge variant="secondary" className="mb-6">Home Services</Badge>
          <h1 className="mx-auto max-w-4xl text-4xl font-extrabold tracking-tight sm:text-5xl md:text-6xl">
            More calls. More jobs.{' '}
            <span className="text-primary">Less chasing.</span>
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground">
            Your next customer is searching Google right now. Make sure your site shows up,
            loads fast, and convinces them to call you — not your competitor.
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
          <h2 className="text-center text-2xl font-bold mb-8">Trades &amp; home service industries we serve</h2>
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
              Built specifically for home service businesses
            </h2>
          </div>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            {features.map((feature) => {
              const Icon = feature.icon
              return (
                <Card key={feature.title}>
                  <CardContent className="p-6 flex gap-4">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                      <Icon className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold mb-1">{feature.title}</h3>
                      <p className="text-sm text-muted-foreground">{feature.description}</p>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 text-center">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold mb-4">Let&apos;s fill your schedule</h2>
          <p className="text-muted-foreground mb-8 max-w-xl mx-auto">
            We&apos;ll build you a site that ranks locally and converts visitors into booked jobs.
          </p>
          <Button asChild size="lg">
            <Link href="/#contact">Start Your Project</Link>
          </Button>
        </div>
      </section>
    </div>
  )
}
