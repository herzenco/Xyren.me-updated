import { Card } from '@/components/ui/card'
import { TrendingUp } from 'lucide-react'

const caseStudies = [
  {
    industry: 'Home Services',
    leads: 340,
    qualified: 87,
    growth: '+340%',
    description: 'Plumbing & HVAC businesses',
  },
  {
    industry: 'Professional Services',
    leads: 215,
    qualified: 92,
    growth: '+220%',
    description: 'Consulting & Legal',
  },
  {
    industry: 'Trades & Contractors',
    leads: 180,
    qualified: 89,
    growth: '+185%',
    description: 'Electrical & Construction',
  },
]

export function Portfolio() {
  return (
    <section id="portfolio" className="py-24 md:py-32 lg:py-40">
      <div className="mx-auto max-w-6xl px-6 md:px-8">
        {/* Section header */}
        <div className="mx-auto max-w-3xl text-center mb-20">
          <h2 className="text-4xl md:text-5xl font-bold mb-6 tracking-tight">
            Proven results.
          </h2>
          <p className="text-lg md:text-xl text-muted-foreground leading-relaxed">
            Our customers are seeing real results with their Xyren sites. Here's what the data shows.
          </p>
        </div>

        {/* Case studies grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8 mb-16">
          {caseStudies.map((study) => (
            <Card key={study.industry} className="p-8 md:p-10 flex flex-col">
              <div className="mb-8">
                <p className="text-sm font-semibold text-accent uppercase tracking-wide mb-2">
                  {study.industry}
                </p>
                <p className="text-muted-foreground text-sm">{study.description}</p>
              </div>

              <div className="flex-1 space-y-6">
                {/* Leads metric */}
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Leads Captured</p>
                  <div className="flex items-baseline gap-2">
                    <span className="text-4xl font-bold text-foreground">{study.leads}</span>
                    <span className="text-sm text-muted-foreground">leads</span>
                  </div>
                </div>

                {/* Qualified metric */}
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Qualified</p>
                  <div className="flex items-baseline gap-2">
                    <span className="text-3xl font-bold text-accent">{study.qualified}%</span>
                    <span className="text-sm text-muted-foreground">scored high</span>
                  </div>
                </div>

                {/* Growth metric */}
                <div className="pt-4 border-t border-border">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5 text-accent flex-shrink-0" />
                    <span className="text-lg font-semibold text-foreground">{study.growth}</span>
                    <span className="text-sm text-muted-foreground">vs. average</span>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>

        {/* Bottom note */}
        <div className="bg-muted/30 rounded-lg p-8 md:p-10 text-center">
          <p className="text-muted-foreground max-w-2xl mx-auto">
            These are anonymized aggregate metrics from our customers' actual sites.
            No customer data is shared publicly. Detailed reports available upon request.
          </p>
        </div>
      </div>
    </section>
  )
}
