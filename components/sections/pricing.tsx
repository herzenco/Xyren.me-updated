'use client'

import Link from 'next/link'
import { motion, type Variants } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Check } from 'lucide-react'

const plans = [
  {
    name: 'Starter',
    price: 2500,
    description: 'Perfect for getting online with lead capture.',
    features: [
      'Up to 10 pages',
      'Lead capture form',
      'Mobile responsive',
      'SEO optimized',
      'Email support',
      '5-day build',
    ],
    featured: false,
  },
  {
    name: 'Growth',
    price: 4500,
    description: 'Everything you need to compete with bigger companies.',
    features: [
      'Unlimited pages',
      'AI lead scoring',
      'Advanced analytics',
      'Booking integration',
      'Blog & content',
      'Phone support',
      '7-day build',
    ],
    featured: true,
  },
  {
    name: 'Enterprise',
    price: 7500,
    description: 'Custom solutions for serious growth.',
    features: [
      'Everything in Growth',
      'Custom integrations',
      'Advanced automation',
      'Dedicated support',
      'Performance tuning',
      'Priority updates',
      'Custom timeline',
    ],
    featured: false,
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

const cardVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: 'easeOut' },
  },
}

export function Pricing() {
  return (
    <section id="pricing" className="bg-background py-24 md:py-32 lg:py-40">
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
            <span className="text-gradient">Simple pricing.</span>
          </h2>
          <p className="text-lg md:text-xl text-muted-foreground leading-relaxed">
            One-time project fee. No monthly retainers. No hidden costs. You own everything.
          </p>
        </motion.div>

        {/* Pricing cards */}
        <motion.div
          className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8 mb-16"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          {plans.map((plan) => (
            <motion.div
              key={plan.name}
              variants={cardVariants}
              whileHover={plan.featured ? { y: -8 } : { y: -4 }}
            >
              <div
                className={`relative h-full p-8 md:p-10 rounded-lg border flex flex-col transition-all duration-300 ${
                  plan.featured
                    ? 'border-primary/50 bg-gradient-to-b from-primary/10 to-background shadow-[0_0_40px_hsl(190_100%_50%_/_0.2)]'
                    : 'border-border/50 bg-card/50 backdrop-blur-sm'
                }`}
              >
                {plan.featured && (
                  <motion.div
                    className="absolute -top-3 left-1/2 -translate-x-1/2"
                    initial={{ scale: 0.8, opacity: 0 }}
                    whileInView={{ scale: 1, opacity: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.2 }}
                  >
                    <span className="inline-block bg-primary text-primary-foreground px-4 py-1 rounded-full text-sm font-semibold">
                      Most Popular
                    </span>
                  </motion.div>
                )}

                <div className="mb-8">
                  <h3 className="text-2xl font-bold mb-2">{plan.name}</h3>
                  <p className="text-muted-foreground text-sm">{plan.description}</p>
                </div>

                {/* Price */}
                <div className="mb-8">
                  <div className="flex items-baseline gap-1">
                    <span className="text-5xl font-bold text-foreground">${plan.price.toLocaleString()}</span>
                    <span className="text-muted-foreground">one-time</span>
                  </div>
                </div>

                {/* Features */}
                <div className="flex-1 mb-8">
                  <ul className="space-y-4">
                    {plan.features.map((feature, idx) => (
                      <motion.li
                        key={feature}
                        className="flex items-start gap-3"
                        initial={{ opacity: 0, x: -10 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: idx * 0.05 }}
                      >
                        <Check
                          className={`h-5 w-5 flex-shrink-0 mt-0.5 ${
                            plan.featured ? 'text-primary' : 'text-muted-foreground'
                          }`}
                        />
                        <span className="text-foreground">{feature}</span>
                      </motion.li>
                    ))}
                  </ul>
                </div>

                {/* CTA Button */}
                <Button
                  asChild
                  size="lg"
                  variant={plan.featured ? 'hero' : 'outline'}
                  className="w-full"
                >
                  <Link href="/#contact">Get Started</Link>
                </Button>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Bottom CTA */}
        <motion.div
          className="text-center"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.4 }}
        >
          <p className="text-muted-foreground">
            Need a custom package?{' '}
            <Link href="/#contact" className="text-primary font-semibold hover:underline">
              Let's talk
            </Link>
          </p>
        </motion.div>
      </div>
    </section>
  )
}
