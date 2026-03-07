'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { ArrowRight } from 'lucide-react'

export function Hero() {
  return (
    <section className="relative min-h-screen w-full overflow-hidden flex items-center justify-center bg-gradient-hero">
      {/* Background gradient glow */}
      <div className="absolute inset-0 bg-gradient-glow" />

      {/* Cyan orb */}
      <motion.div
        className="absolute top-1/3 left-1/2 -translate-x-1/2 w-96 h-96 rounded-full bg-primary/5 blur-3xl"
        animate={{
          y: [0, 20, 0],
          opacity: [0.3, 0.5, 0.3],
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />

      {/* Bottom gradient fade */}
      <div className="absolute bottom-0 left-0 right-0 h-40 bg-gradient-to-t from-background to-transparent" />

      {/* Content */}
      <div className="relative z-10 mx-auto max-w-5xl px-6 md:px-8 text-center">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, ease: 'easeOut' }}
        >
          <h1 className="text-5xl md:text-6xl lg:text-7xl font-extrabold leading-tight tracking-tight mb-8">
            Websites that capture{' '}
            <span className="text-gradient">leads and book</span>
            <br />
            <span className="text-gradient">appointments</span>
          </h1>

          <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto mb-12 leading-relaxed">
            Get a fast, SEO-optimized website built for your service business in 5–10 days. No more chasing leads — let your website do the work.
          </p>
        </motion.div>

        {/* CTAs */}
        <motion.div
          className="flex flex-col sm:flex-row items-center justify-center gap-4"
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.3, ease: 'easeOut' }}
        >
          <Button asChild size="xl" variant="hero">
            <Link href="/#contact">
              Get a website that works
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </Button>
          <Button asChild size="xl" variant="hero-outline">
            <Link href="#portfolio">See what we've built</Link>
          </Button>
        </motion.div>
      </div>
    </section>
  )
}
