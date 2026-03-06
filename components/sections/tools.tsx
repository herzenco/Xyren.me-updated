import { Card } from '@/components/ui/card'
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

export function Tools() {
  return (
    <section className="py-24 md:py-32 lg:py-40" style={{
      background: 'linear-gradient(135deg, #f0f4ff 0%, #f9f5ff 100%)'
    }}>
      <div className="mx-auto max-w-6xl px-6 md:px-8">
        {/* Section header */}
        <div className="mx-auto max-w-3xl text-center mb-20">
          <h2 className="text-4xl md:text-5xl font-bold mb-6 tracking-tight">
            Everything you need built in.
          </h2>
          <p className="text-lg md:text-xl text-muted-foreground leading-relaxed">
            No plugins. No third-party tools. No integrations. Just a complete system designed to help
            you capture leads and understand your customers.
          </p>
        </div>

        {/* Features grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
          {features.map((feature) => {
            const Icon = feature.icon
            return (
              <Card key={feature.title} className="p-8 md:p-10">
                <div className="mb-6">
                  <div className="inline-flex items-center justify-center h-12 w-12 rounded-lg bg-accent/10 mb-4">
                    <Icon className="h-6 w-6 text-accent" />
                  </div>
                </div>
                <h3 className="text-xl font-semibold mb-3 text-foreground">
                  {feature.title}
                </h3>
                <p className="text-muted-foreground leading-relaxed">
                  {feature.description}
                </p>
              </Card>
            )
          })}
        </div>

        {/* Bottom benefit statement */}
        <div className="mt-20 bg-background border border-border rounded-lg p-8 md:p-12 text-center">
          <p className="text-lg font-semibold text-foreground mb-2">
            Built on modern, production-grade technology.
          </p>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Next.js, TypeScript, Tailwind CSS, and Supabase. Not page builders or templates.
            Custom code optimized for speed and conversions.
          </p>
        </div>
      </div>
    </section>
  )
}
