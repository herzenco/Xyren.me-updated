import { Zap, Target, Clock } from 'lucide-react'

const pillars = [
  {
    icon: Zap,
    title: 'Automation first',
    description: "Websites shouldn't rely on human availability.",
  },
  {
    icon: Target,
    title: 'Conversion over decoration',
    description: 'Design exists to drive action.',
  },
  {
    icon: Clock,
    title: 'Built to run without babysitting',
    description: 'Sites should work 24/7.',
  },
]

export function HowWeThink() {
  return (
    <section className="py-24 md:py-32">
      <div className="container mx-auto px-6">
        <div className="mx-auto max-w-4xl text-center mb-6">
          <h2 className="text-4xl font-bold tracking-[-0.03em] sm:text-5xl md:text-[56px] leading-[1.1]">
            Most websites look fine.{' '}
            <span className="text-gradient">
              They just don&apos;t do anything.
            </span>
          </h2>
        </div>

        <p className="mx-auto max-w-2xl text-center text-lg text-muted-foreground leading-relaxed mb-20">
          They collect form submissions, send you an email, and hope you follow
          up in time. Meanwhile, leads go cold. We build sites that work
          differently.
        </p>

        <div className="grid grid-cols-1 gap-12 sm:grid-cols-3 max-w-4xl mx-auto">
          {pillars.map((pillar) => {
            const Icon = pillar.icon
            return (
              <div key={pillar.title} className="flex flex-col items-center text-center gap-4">
                <div className="icon-container">
                  <Icon className="h-6 w-6" />
                </div>
                <h3 className="text-lg font-semibold">{pillar.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {pillar.description}
                </p>
              </div>
            )
          })}
        </div>

        <p className="mx-auto mt-16 max-w-xl text-center text-sm text-muted-foreground">
          This approach works best for service businesses that depend on leads
          and bookings.
        </p>
      </div>
    </section>
  )
}
