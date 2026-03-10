'use client'

import { Calendar, MessageSquare, Users, BarChart3 } from 'lucide-react'
import { motion, useInView } from 'framer-motion'
import { useRef } from 'react'
import {
  floatUp,
  floatDown,
  floatLeft,
  floatRight,
  floatRotate,
  containerVariants,
} from '@/lib/animations'

const tools = [
  {
    icon: Calendar,
    name: 'Scheduling',
    description:
      'Calendar sync and booking automation built in. No third-party plugins required.',
    iconAnimation: floatUp,
    descAnimation: floatDown,
  },
  {
    icon: MessageSquare,
    name: 'AI Chat',
    description:
      'Answer FAQs, qualify leads, and route inquiries 24/7 with trained AI assistants.',
    iconAnimation: floatRotate,
    descAnimation: floatRight,
  },
  {
    icon: Users,
    name: 'Lead CRM',
    description:
      'Track every inquiry, follow-up reminder, and conversion path in one clean dashboard.',
    iconAnimation: floatDown,
    descAnimation: floatUp,
  },
  {
    icon: BarChart3,
    name: 'Analytics',
    description:
      "See which pages convert, where traffic comes from, and what's actually working.",
    iconAnimation: floatLeft,
    descAnimation: floatRight,
  },
]

export function Tools() {
  const sectionRef = useRef(null)
  const isInView = useInView(sectionRef, { once: true, margin: '-100px' })

  return (
    <section ref={sectionRef} className="py-24 md:py-32">
      <div className="container mx-auto px-6">
        <div className="mx-auto max-w-3xl text-center mb-16">
          <h2 className="text-4xl font-bold tracking-[-0.03em] sm:text-5xl md:text-[56px] leading-[1.1]">
            Built-in tools to{' '}
            <span className="text-gradient">automate your workflow</span>
          </h2>
          <p className="mt-5 text-lg text-muted-foreground leading-relaxed">
            Everything is configured during your build — no waiting weeks for
            setup.
          </p>
        </div>

        <motion.div
          ref={sectionRef}
          className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4 max-w-5xl mx-auto"
          variants={containerVariants}
          initial="hidden"
          animate={isInView ? 'visible' : 'hidden'}
        >
          {tools.map((tool) => {
            const Icon = tool.icon
            return (
              <motion.div
                key={tool.name}
                className="rounded-2xl border border-border bg-card p-6"
                variants={floatUp}
              >
                <motion.div
                  className="icon-container"
                  variants={tool.iconAnimation}
                  initial="hidden"
                  animate={isInView ? 'visible' : 'hidden'}
                >
                  <Icon className="h-5 w-5" aria-hidden="true" />
                </motion.div>
                <h3 className="mt-5 text-lg font-semibold">{tool.name}</h3>
                <motion.p
                  className="mt-2 text-sm text-muted-foreground leading-relaxed"
                  variants={tool.descAnimation}
                  initial="hidden"
                  animate={isInView ? 'visible' : 'hidden'}
                >
                  {tool.description}
                </motion.p>
              </motion.div>
            )
          })}
        </motion.div>
      </div>
    </section>
  )
}
