'use client'

import Link from 'next/link'
import { motion, type Variants } from 'framer-motion'
import { ArrowRight, Building2, Home } from 'lucide-react'

const industries = [
  {
    id: 'professional-services',
    title: 'Professional Services',
    description: 'Consulting firms, legal practices, accounting, and B2B service providers.',
    icon: Building2,
    href: '/use-cases/professional-services',
  },
  {
    id: 'home-services',
    title: 'Home Services',
    description: 'Plumbing, HVAC, electrical, cleaning, landscaping, and home improvement.',
    icon: Home,
    href: '/use-cases/home-services',
  },
]

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
      delayChildren: 0.1,
    },
  },
}

const cardVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: 'easeOut' },
  },
}

export function Portfolio() {
  return (
    <section id="portfolio" className="bg-background py-24 md:py-32 lg:py-40">
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
            Built for your <span className="text-gradient">industry.</span>
          </h2>
          <p className="text-lg md:text-xl text-muted-foreground leading-relaxed">
            Whether you're in professional services or home services, we've built proven solutions for your business.
          </p>
        </motion.div>

        {/* Industries grid */}
        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-10"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          {industries.map((industry) => {
            const Icon = industry.icon
            return (
              <motion.div key={industry.id} variants={cardVariants}>
                <Link href={industry.href}>
                  <motion.div
                    className="group h-full rounded-2xl border border-border/50 bg-card/50 backdrop-blur-sm p-10 md:p-12 transition-all duration-300 cursor-pointer hover:border-primary/40"
                    whileHover={{
                      y: -8,
                      boxShadow: '0 0 60px hsl(190 100% 50% / 0.15)',
                    }}
                  >
                    {/* Icon */}
                    <div className="mb-8">
                      <motion.div
                        className="inline-flex h-16 w-16 items-center justify-center rounded-xl bg-primary/10 group-hover:bg-primary/20 transition-colors duration-300"
                        whileHover={{ scale: 1.1 }}
                      >
                        <Icon className="h-8 w-8 text-primary" />
                      </motion.div>
                    </div>

                    {/* Content */}
                    <div className="mb-8 flex-1">
                      <h3 className="text-2xl font-bold mb-3 text-foreground group-hover:text-gradient transition-all duration-300">
                        {industry.title}
                      </h3>
                      <p className="text-muted-foreground leading-relaxed">
                        {industry.description}
                      </p>
                    </div>

                    {/* CTA */}
                    <motion.div
                      className="inline-flex items-center gap-2 text-sm font-semibold text-primary"
                      whileHover={{ gap: '0.75rem' }}
                    >
                      <span>Learn more</span>
                      <motion.div
                        whileHover={{ x: 4 }}
                        transition={{ duration: 0.2 }}
                      >
                        <ArrowRight className="h-4 w-4" />
                      </motion.div>
                    </motion.div>
                  </motion.div>
                </Link>
              </motion.div>
            )
          })}
        </motion.div>
      </div>
    </section>
  )
}
