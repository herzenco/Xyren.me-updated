'use client'

import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { motion } from 'framer-motion'
import { useInView } from 'react-intersection-observer'
import { floatUp, floatDown, floatRotate } from '@/lib/animations'

export function Hero() {
  const { ref, inView } = useInView({ threshold: 0.1, triggerOnce: true })

  return (
    <section ref={ref} className="relative py-32 md:py-44 overflow-hidden">
      {/* Cyan ambient glow */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="w-[800px] h-[500px] rounded-full bg-[radial-gradient(ellipse_at_center,_hsl(190_100%_50%/0.12)_0%,_transparent_70%)]" />
      </div>

      <div className="container relative mx-auto px-6 text-center">
        <motion.h1
          variants={floatUp}
          initial="hidden"
          animate={inView ? 'visible' : 'hidden'}
          className="mx-auto max-w-4xl text-5xl font-bold tracking-[-0.03em] sm:text-6xl md:text-[72px] leading-[1.05]"
        >
          Websites designed to{' '}
          <br className="hidden sm:block" />
          <span className="text-gradient">turn visitors into clients.</span>
        </motion.h1>

        <motion.p
          variants={floatDown}
          initial="hidden"
          animate={inView ? 'visible' : 'hidden'}
          className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground md:text-xl leading-relaxed"
        >
          We build conversion-focused websites for service professionals. Leads
          captured, appointments booked. Launched in 5–10 days.
        </motion.p>

        <div className="mt-12">
          <motion.div
            variants={floatRotate}
            initial="hidden"
            animate={inView ? 'visible' : 'hidden'}
          >
            <Link
              href="/#contact"
              className="cta-glow inline-flex items-center justify-center gap-2 rounded-lg px-8 py-3.5 text-lg font-semibold transition-all"
            >
              Get a website that works
              <ArrowRight className="h-5 w-5" aria-hidden="true" />
            </Link>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
