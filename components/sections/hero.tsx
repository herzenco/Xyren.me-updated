'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { ArrowRight, Zap } from 'lucide-react'

const features = [
  'AI-powered lead scoring',
  'Real-time analytics',
  'SEO-optimized',
  'Mobile-first design',
]

export function Hero() {
  return (
    <section className="relative overflow-hidden py-24 md:py-32 lg:py-40 bg-background">
      <div className="mx-auto max-w-5xl px-6 md:px-8 text-center">
        {/* Small badge */}
        <div className="inline-block mb-8">
          <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-muted border border-border text-sm font-medium text-foreground">
            <Zap className="h-4 w-4 text-blue-600" />
            Powerful tools for small teams
          </span>
        </div>

        {/* Hero headline - core value prop */}
        <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold leading-tight tracking-tight mb-8">
          Compete with bigger companies.
        </h1>

        {/* Subheading */}
        <p className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto mb-12 leading-relaxed">
          Xyren builds websites for small businesses with powerful, built-in lead capture and AI analytics. Everything you need at prices you can afford.
        </p>

        {/* CTAs */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
          <Button asChild size="lg" className="px-8">
            <Link href="/#contact">
              Get Started <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
          <Button asChild variant="outline" size="lg" className="px-8">
            <Link href="#portfolio">See Our Work</Link>
          </Button>
        </div>

        {/* Feature highlights */}
        <div className="flex flex-wrap items-center justify-center gap-6 md:gap-8">
          {features.map((feature) => (
            <div key={feature} className="flex items-center gap-2 text-sm font-medium text-foreground">
              <div className="w-1.5 h-1.5 rounded-full bg-accent" />
              {feature}
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
