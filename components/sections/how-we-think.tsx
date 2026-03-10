'use client'

import { Zap, Target, Clock } from 'lucide-react'
import { motion } from 'framer-motion'
import { useInView } from 'react-intersection-observer'
import { floatUp, floatDown, floatLeft, floatRight, containerVariants } from '@/lib/animations'

const pillars = [
  {
    icon: Zap,
    title: 'Automation first',
    description: "Websites shouldn't rely on human availability.",
  },
  {
    icon: Target,
    title: 'Conversion over decoration',
    description: 'Design exists to drive action.',
  },
  {
    icon: Clock,
    title: 'Built to run without babysitting',
    description: 'Sites should work 24/7.',
  },
]

export function HowWeThink() {
  const { ref, inView } = useInView({
    threshold: 0.1,
    triggerOnce: true,
  })

  // Define animation variants for each card
  const cardAnimations = [floatUp, floatDown, floatLeft, floatRight]

  return (
    <section className="py-24 md:py-32" ref={ref}>
      <div className="container mx-auto px-6">
        {/* Heading */}
        <div className="mx-auto max-w-4xl text-center mb-6">
          <h2 className="text-4xl font-bold tracking-[-0.03em] sm:text-5xl md:text-[56px] leading-[1.1]">
            Most websites look fine.{' '}
            <span className="text-gradient">
              They just don&apos;t do anything.
            </span>
          </h2>
        </div>

        <p className="mx-auto max-w-2xl text-center text-lg text-muted-foreground leading-relaxed mb-20">
          They collect form submissions, send you an email, and hope you follow
          up in time. Meanwhile, leads go cold. We build sites that work
          differently.
        </p>

        {/* Pillars */}
        <motion.div
          className="grid grid-cols-1 gap-12 sm:grid-cols-3 max-w-4xl mx-auto"
          variants={containerVariants}
          initial="hidden"
          animate={inView ? 'visible' : 'hidden'}
        >
          {pillars.map((pillar, index) => {
            const Icon = pillar.icon
            const animationVariant = cardAnimations[index % cardAnimations.length]
            return (
              <motion.div
                key={pillar.title}
                className="flex flex-col items-center text-center gap-4"
                variants={animationVariant}
                initial="hidden"
                animate={inView ? 'visible' : 'hidden'}
              >
                <div className="icon-container">
                  <Icon className="h-6 w-6" />
                </div>
                <h3 className="text-lg font-semibold">{pillar.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {pillar.description}
                </p>
              </motion.div>
            )
          })}
        </motion.div>

        {/* Bottom text */}
        <p className="mx-auto mt-16 max-w-xl text-center text-sm text-muted-foreground">
          This approach works best for service businesses that depend on leads
          and bookings.
        </p>
      </div>
    </section>
  )
}
