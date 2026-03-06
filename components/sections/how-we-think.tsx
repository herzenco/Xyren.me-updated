import { Target, BarChart3, Zap, Lock } from 'lucide-react'
import { Card } from '@/components/ui/card'

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

export function HowWeThink() {
  return (
    <section className="bg-muted/30 py-24 md:py-32 lg:py-40">
      <div className="mx-auto max-w-6xl px-6 md:px-8">
        {/* Section header */}
        <div className="mx-auto max-w-3xl text-center mb-20">
          <h2 className="text-4xl md:text-5xl font-bold mb-6 tracking-tight">
            Built differently.
          </h2>
          <p className="text-lg md:text-xl text-muted-foreground leading-relaxed">
            Most web agencies build nice-looking sites that don't convert. We focus on results —
            powerful lead tracking, AI scoring, and real-time analytics built in from day one.
          </p>
        </div>

        {/* Values grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
          {values.map((value) => {
            const Icon = value.icon
            return (
              <Card key={value.title} className="p-8 md:p-10">
                <div className="flex items-start gap-6">
                  <div className="flex-shrink-0">
                    <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-accent/10">
                      <Icon className="h-6 w-6 text-accent" />
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
              </Card>
            )
          })}
        </div>
      </div>
    </section>
  )
}
