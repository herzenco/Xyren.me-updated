'use client'

import { motion, type Variants } from 'framer-motion'
import { Target, BarChart3, Zap, Lock, Settings, AlertCircle } from 'lucide-react'

const features = [
  {
    icon: Target,
    title: 'AI Lead Scoring',
    description: 'Automatically qualify leads based on fit and intent. Know which leads matter most.',
  },
  {
    icon: BarChart3,
    title: 'Real-Time Analytics',
    description: 'Track conversion funnels, visitor behavior, and lead quality metrics in real-time.',
  },
  {
    icon: Zap,
    title: 'Built-In Forms',
    description: 'Lead capture forms that just work. No third-party tools, no integrations needed.',
  },
  {
    icon: Lock,
    title: 'Mobile-First Design',
    description: 'Sites that work perfectly on every device. Mobile visitors convert just as well.',
  },
  {
    icon: Settings,
    title: 'SEO Optimized',
    description: 'Structured data, meta tags, and sitemaps. Ranking in search engines from day one.',
  },
  {
    icon: AlertCircle,
    title: 'Lead Notifications',
    description: 'Get notified instantly when new leads come in. Never miss an opportunity.',
  },
]

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.1,
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

export function Tools() {
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
            Everything you need <span className="text-gradient">built in.</span>
          </h2>
          <p className="text-lg md:text-xl text-muted-foreground leading-relaxed">
            No plugins. No third-party tools. No integrations. Just a complete system designed to help you capture leads and understand your customers.
          </p>
        </motion.div>

        {/* Features grid */}
        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          {features.map((feature) => {
            const Icon = feature.icon
            return (
              <motion.div
                key={feature.title}
                variants={itemVariants}
                whileHover={{
                  y: -4,
                  borderColor: 'hsl(190 100% 50% / 0.3)',
                }}
              >
                <div className="h-full rounded-lg border border-border/50 bg-card/50 backdrop-blur-sm p-8 md:p-10 transition-all duration-300 hover:shadow-[0_0_40px_hsl(190_100%_50%_/_0.1)]">
                  <div className="mb-6">
                    <motion.div
                      className="inline-flex items-center justify-center h-12 w-12 rounded-lg bg-primary/10 mb-4"
                      whileHover={{ scale: 1.1, rotate: 5 }}
                      transition={{ duration: 0.2 }}
                    >
                      <Icon className="h-6 w-6 text-primary" aria-hidden="true" />
                    </motion.div>
                  </div>
                  <h3 className="text-xl font-semibold mb-3 text-foreground">
                    {feature.title}
                  </h3>
                  <p className="text-muted-foreground leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              </motion.div>
            )
          })}
        </motion.div>

        {/* Bottom benefit statement */}
        <motion.div
          className="mt-20 bg-card/30 border border-border/50 rounded-lg p-8 md:p-12 text-center"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          <p className="text-lg font-semibold text-foreground mb-2">
            Built on modern, production-grade technology.
          </p>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Next.js, TypeScript, Tailwind CSS, and Supabase. Not page builders or templates. Custom code optimized for speed and conversions.
          </p>
        </motion.div>
      </div>
    </section>
  )
}
