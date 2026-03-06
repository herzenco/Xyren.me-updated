import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
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

export function Pricing() {
  return (
    <section id="pricing" className="py-24 md:py-32 lg:py-40">
      <div className="mx-auto max-w-6xl px-6 md:px-8">
        {/* Section header */}
        <div className="mx-auto max-w-3xl text-center mb-20">
          <h2 className="text-4xl md:text-5xl font-bold mb-6 tracking-tight">
            <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">Simple pricing.</span>
          </h2>
          <p className="text-lg md:text-xl text-muted-foreground leading-relaxed">
            <span className="text-blue-600 font-semibold">One-time project fee.</span> <span className="text-purple-600 font-semibold">No monthly retainers.</span> No hidden costs. You own everything.
          </p>
        </div>

        {/* Pricing cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8 mb-16">
          {plans.map((plan) => (
            <Card
              key={plan.name}
              className={`relative p-8 md:p-10 flex flex-col ${
                plan.featured ? 'ring-2 ring-accent md:scale-105' : ''
              }`}
            >
              {plan.featured && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                  <span className="inline-block bg-accent text-white px-4 py-1 rounded-full text-sm font-semibold">
                    Most Popular
                  </span>
                </div>
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
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-3">
                      <Check className="h-5 w-5 text-accent flex-shrink-0 mt-0.5" />
                      <span className="text-foreground">{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* CTA Button */}
              <Button
                asChild
                size="lg"
                variant={plan.featured ? 'default' : 'outline'}
                className="w-full"
              >
                <Link href="/#contact">Get Started</Link>
              </Button>
            </Card>
          ))}
        </div>

        {/* Bottom CTA */}
        <div className="text-center">
          <p className="text-muted-foreground">
            Need a custom package?{' '}
            <Link href="/#contact" className="text-accent font-semibold hover:underline">
              Let's talk
            </Link>
          </p>
        </div>
      </div>
    </section>
  )
}
