import { Target, Zap, TrendingUp, Shield } from 'lucide-react'

const pillars = [
  {
    icon: Target,
    title: 'Built for Conversions',
    description:
      'Every element of your site is designed with one goal: turning visitors into booked appointments and paying customers.',
  },
  {
    icon: Zap,
    title: 'Fast by Default',
    description:
      'We use modern technology to ensure your site loads instantly. Speed is an SEO ranking factor — and impatient visitors leave.',
  },
  {
    icon: TrendingUp,
    title: 'SEO From Day One',
    description:
      'Proper metadata, structured data, and content strategy baked in from the start so you rank without extra effort.',
  },
  {
    icon: Shield,
    title: 'No Lock-In',
    description:
      'You own everything. Code, content, domain. We build and hand it over — no recurring fees for things you already own.',
  },
]

export function HowWeThink() {
  return (
    <section className="py-20 md:py-28">
      <div className="container mx-auto px-4">
        <div className="mx-auto max-w-2xl text-center mb-16">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
            How we think about your website
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            Most agency sites look good but don&apos;t convert. We fix that.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {pillars.map((pillar) => {
            const Icon = pillar.icon
            return (
              <div key={pillar.title} className="flex flex-col gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                  <Icon className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-lg font-semibold">{pillar.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {pillar.description}
                </p>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
