'use client'

import Link from 'next/link'
import { Check, ArrowRight } from 'lucide-react'
import { motion } from 'framer-motion'
import { useInView } from 'framer-motion'
import { useRef } from 'react'
import { cn } from '@/lib/utils'
import { floatUp, containerVariants } from '@/lib/animations'

const plans = [
  {
    tier: 'FOUNDATION',
    name: 'Core System',
    description: 'A reliable website system that runs without babysitting.',
    price: '$150',
    features: [
      'Secure hosting and uptime monitoring',
      'Ongoing maintenance and updates',
      'Conversion-focused site structure',
      'Contact forms and basic scheduling',
    ],
    popular: false,
  },
  {
    tier: 'AUTOMATION',
    name: 'Active System',
    description:
      'A system that captures leads and books meetings automatically.',
    price: '$300',
    features: [
      'Everything in Core',
      'AI chat for lead capture and qualification',
      'Automated responses (no manual follow-up)',
      'Scheduling and CRM integration',
    ],
    popular: true,
  },
  {
    tier: 'PERFORMANCE',
    name: 'Optimized System',
    description:
      'A performance-focused system for businesses that want visibility and refinement over time.',
    price: '$450',
    features: [
      'Everything in Active',
      'Ongoing performance monitoring',
      'Periodic system optimization',
      'Priority support',
    ],
    popular: false,
  },
]

export function Pricing() {
  const sectionRef = useRef(null)
  const isInView = useInView(sectionRef, { once: true, margin: '-100px' })

  return (
    <section ref={sectionRef} id="pricing" className="py-24 md:py-32">
      <div className="container mx-auto px-6">
        {/* Heading */}
        <div className="mx-auto max-w-3xl text-center mb-6">
          <h2 className="text-4xl font-bold tracking-[-0.03em] sm:text-5xl md:text-[56px] leading-[1.1]">
            Three levels of{' '}
            <span className="text-gradient">system maturity</span>
          </h2>
        </div>

        <p className="mx-auto max-w-xl text-center text-lg text-muted-foreground leading-relaxed mb-10">
          More capability. More automation. More leverage.
        </p>

        {/* Setup badge */}
        <div className="mx-auto mb-14 w-fit rounded-xl border border-border bg-card px-8 py-4 text-center">
          <p className="text-lg font-semibold">$2,000 one-time setup</p>
          <p className="text-sm text-muted-foreground mt-1">
            Strategy, design, build, configuration, and launch.
          </p>
        </div>

        {/* Cards */}
        <motion.div
          className="grid grid-cols-1 gap-6 md:grid-cols-3 items-start max-w-5xl mx-auto"
          variants={containerVariants}
          initial="hidden"
          animate={isInView ? 'visible' : 'hidden'}
        >
          {plans.map((plan) => (
            <motion.div
              key={plan.name}
              className={cn(
                'relative rounded-2xl border bg-card flex flex-col',
                plan.popular ? 'border-primary shadow-glow' : 'border-border'
              )}
              variants={floatUp}
            >
              {/* Most Popular badge */}
              {plan.popular && (
                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
                  <span className="rounded-full border border-primary bg-background px-4 py-1 text-xs font-semibold text-primary">
                    Most Popular
                  </span>
                </div>
              )}

              {/* Header */}
              <div className="p-6 pb-0">
                <p
                  className={cn(
                    'text-xs font-semibold uppercase tracking-widest mb-3',
                    plan.popular ? 'text-primary' : 'text-muted-foreground'
                  )}
                >
                  {plan.tier}
                </p>
                <h3 className="text-xl font-bold">{plan.name}</h3>
                <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
                  {plan.description}
                </p>
                <div className="mt-5">
                  <span className="text-4xl font-bold">{plan.price}</span>
                  <span className="text-sm text-muted-foreground ml-1">
                    /month
                  </span>
                </div>
              </div>

              {/* Features */}
              <div className="p-6 flex-1">
                <ul className="space-y-3">
                  {plan.features.map((feature) => (
                    <li
                      key={feature}
                      className="flex items-start gap-3 text-sm"
                    >
                      <Check
                        className={cn(
                          'h-4 w-4 shrink-0 mt-0.5',
                          plan.popular
                            ? 'text-primary'
                            : 'text-muted-foreground'
                        )}
                        aria-hidden="true"
                      />
                      <span className="text-foreground/80">{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Footer */}
              <div className="p-6 pt-0 space-y-3">
                <Link
                  href="/#contact"
                  className={cn(
                    'flex items-center justify-center gap-2 w-full h-11 rounded-lg text-sm font-semibold transition-all',
                    plan.popular
                      ? 'cta-glow'
                      : 'border border-border text-foreground/80 hover:border-foreground/30 hover:text-foreground'
                  )}
                >
                  Get started
                  <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </Link>
                <Link
                  href="/#contact"
                  className="block text-center text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  Learn more
                </Link>
              </div>
            </motion.div>
          ))}
        </motion.div>

        <p className="text-center text-sm text-muted-foreground mt-10">
          No long-term contracts. Cancel anytime.
        </p>
      </div>
    </section>
  )
}
