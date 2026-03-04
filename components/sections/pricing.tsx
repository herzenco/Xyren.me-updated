import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { CheckCircle } from 'lucide-react'

const plans = [
  {
    name: 'Starter',
    price: '$1,500',
    description: 'Perfect for getting online fast with a professional presence.',
    features: [
      'Up to 5 pages',
      'Mobile-responsive design',
      'Contact form',
      'Basic SEO setup',
      'Google Analytics',
      '2 rounds of revisions',
      '5-day turnaround',
    ],
    cta: 'Get Started',
    popular: false,
  },
  {
    name: 'Growth',
    price: '$2,800',
    description: 'The complete package for businesses serious about lead generation.',
    features: [
      'Up to 10 pages',
      'Online appointment booking',
      'Lead capture forms',
      'Full SEO optimization',
      'Blog setup (5 posts)',
      'Google Reviews integration',
      'Chat widget',
      '3 rounds of revisions',
      '7-day turnaround',
    ],
    cta: 'Get Started',
    popular: true,
  },
  {
    name: 'Authority',
    price: '$5,000',
    description: 'For established businesses that want to dominate their local market.',
    features: [
      'Unlimited pages',
      'Custom booking system',
      'Advanced lead funnels',
      'Full content strategy',
      'Blog setup (15 posts)',
      'Schema markup',
      'Performance optimization',
      'Admin dashboard',
      'Unlimited revisions',
      '10-day turnaround',
    ],
    cta: 'Get Started',
    popular: false,
  },
]

export function Pricing() {
  return (
    <section id="pricing" className="py-20 md:py-28 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="mx-auto max-w-2xl text-center mb-16">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
            Simple, transparent pricing
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            One-time project fee. No hidden costs. No recurring agency retainers.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-3 items-start">
          {plans.map((plan) => (
            <Card
              key={plan.name}
              className={`relative ${plan.popular ? 'border-primary shadow-lg scale-[1.02]' : ''}`}
            >
              {plan.popular && (
                <Badge className="absolute -top-3 left-1/2 -translate-x-1/2">
                  Most Popular
                </Badge>
              )}
              <CardHeader className="pb-4 pt-8">
                <h3 className="text-xl font-bold">{plan.name}</h3>
                <div className="mt-2">
                  <span className="text-4xl font-extrabold">{plan.price}</span>
                  <span className="text-muted-foreground ml-1">one-time</span>
                </div>
                <p className="text-sm text-muted-foreground mt-2">{plan.description}</p>
              </CardHeader>
              <CardContent className="space-y-4">
                <ul className="space-y-2">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-2 text-sm">
                      <CheckCircle className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                      {feature}
                    </li>
                  ))}
                </ul>
                <Button
                  asChild
                  className="w-full"
                  variant={plan.popular ? 'default' : 'outline'}
                >
                  <Link href="/#contact">{plan.cta}</Link>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        <p className="text-center text-sm text-muted-foreground mt-8">
          Not sure which plan fits? <Link href="/#contact" className="text-primary hover:underline">Book a free 15-min call</Link> and we&apos;ll help you decide.
        </p>
      </div>
    </section>
  )
}
