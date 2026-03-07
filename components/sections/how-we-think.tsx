'use client'

import { Target, BarChart3, Zap, Lock } from 'lucide-react'
import { motion, type Variants } from 'framer-motion'

const values = [
  {
    icon: Target,
    title: 'Built for Results',
    description:
      'Every design decision is driven by one goal: converting visitors into leads and customers.',
  },
  {
    icon: BarChart3,
    title: 'Data-Driven',
    description:
      'Track every visitor, score every lead, and understand what actually works with built-in analytics.',
  },
  {
    icon: Zap,
    title: 'Powerful & Simple',
    description:
      'Enterprise features at a price that makes sense for growing businesses. No complexity, no bloat.',
  },
  {
    icon: Lock,
    title: 'You Own It All',
    description:
      'Your code, your data, your domain. We hand you the keys — no vendor lock-in, no recurring fees.',
  },
]

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2,
    },
  },
}

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: 'easeOut' },
  },
}

export function HowWeThink() {
  return (
    <section className="bg-background py-24 md:py-32 lg:py-40">
      <div className="mx-auto max-w-6xl px-6 md:px-8">
        {/* Section header */}
        <motion.div
          className="mx-auto max-w-3xl text-center mb-20"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-4xl md:text-5xl font-bold mb-6 tracking-tight">
            Most websites look fine.{' '}
            <span className="text-gradient">They just don't do anything.</span>
          </h2>
          <p className="text-lg md:text-xl text-muted-foreground leading-relaxed">
            We focus on results — powerful lead tracking, AI scoring, and real-time analytics built in from day one.
          </p>
        </motion.div>

        {/* Values grid */}
        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          {values.map((value) => {
            const Icon = value.icon
            return (
              <motion.div
                key={value.title}
                variants={itemVariants}
                whileHover={{ y: -4, borderColor: 'hsl(190 100% 50% / 0.4)' }}
                className="p-8 md:p-10 rounded-lg border border-border/50 bg-card/50 backdrop-blur-sm transition-all duration-300"
              >
                <div className="flex items-start gap-6">
                  <div className="flex-shrink-0">
                    <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                      <Icon className="h-6 w-6 text-primary" />
                    </div>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold mb-2 text-foreground">
                      {value.title}
                    </h3>
                    <p className="text-muted-foreground leading-relaxed">
                      {value.description}
                    </p>
                  </div>
                </div>
              </motion.div>
            )
          })}
        </motion.div>
      </div>
    </section>
  )
}
