import { ArrowRight, Wrench, Building2 } from 'lucide-react'
import Link from 'next/link'

const useCases = [
  {
    icon: Wrench,
    title: 'Home Services',
    tagline: 'For service businesses that turn inbound demand into booked jobs.',
    description:
      'Capture local demand when urgency is high. Convert visitors into estimate requests and service calls with clear paths that match how people search for on-site help.',
    href: '/use-cases/home-services',
  },
  {
    icon: Building2,
    title: 'Professional Services',
    tagline: 'For expertise-driven businesses that convert trust into booked consultations.',
    description:
      'Establish credibility and guide higher-consideration decisions. Qualify leads and book appointments with clear next steps that reflect the weight of your expertise.',
    href: '/use-cases/professional-services',
  },
]

export function Portfolio() {
  return (
    <section id="portfolio" className="py-24 md:py-32">
      <div className="container mx-auto px-6">
        <div className="mx-auto max-w-4xl text-center mb-6">
          <h2 className="text-4xl font-bold tracking-[-0.03em] sm:text-5xl md:text-[56px] leading-[1.1]">
            Two Service Models.{' '}
            <span className="text-gradient">Built to Fit Your Business.</span>
          </h2>
        </div>

        <p className="mx-auto max-w-2xl text-center text-lg text-muted-foreground leading-relaxed mb-16">
          We design conversion-focused websites that feel custom because
          they&apos;re built around how your business actually operates.
        </p>

        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 max-w-5xl mx-auto">
          {useCases.map((useCase) => {
            const Icon = useCase.icon
            return (
              <div
                key={useCase.title}
                className="rounded-2xl border border-border bg-card p-8 flex flex-col justify-between hover:border-primary/40 transition-colors"
              >
                <div>
                  <div className="icon-container mb-6">
                    <Icon className="h-5 w-5" aria-hidden="true" />
                  </div>
                  <h3 className="text-xl font-bold mb-2">{useCase.title}</h3>
                  <p className="text-sm text-foreground/80 mb-4">{useCase.tagline}</p>
                  <p className="text-sm text-muted-foreground leading-relaxed">{useCase.description}</p>
                </div>
                <div className="mt-8">
                  <Link
                    href={useCase.href}
                    className="cta-glow inline-flex items-center gap-2 rounded-lg px-5 py-2.5 text-sm font-semibold"
                  >
                    Learn More
                    <ArrowRight className="h-4 w-4" aria-hidden="true" />
                  </Link>
                </div>
              </div>
            )
          })}
        </div>

        <p className="mx-auto mt-12 max-w-xl text-center text-sm text-muted-foreground">
          One proven system. Adapted to how your business sells.
        </p>
      </div>
    </section>
  )
}
