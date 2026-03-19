import { Calendar, MessageSquare, Users, BarChart3 } from 'lucide-react'

const tools = [
  {
    icon: Calendar,
    name: 'Scheduling',
    description: 'Calendar sync and booking automation built in. No third-party plugins required.',
  },
  {
    icon: MessageSquare,
    name: 'AI Chat',
    description: 'Answer FAQs, qualify leads, and route inquiries 24/7 with trained AI assistants.',
  },
  {
    icon: Users,
    name: 'Lead CRM',
    description: 'Track every inquiry, follow-up reminder, and conversion path in one clean dashboard.',
  },
  {
    icon: BarChart3,
    name: 'Analytics',
    description: "See which pages convert, where traffic comes from, and what's actually working.",
  },
]

export function Tools() {
  return (
    <section className="py-24 md:py-32">
      <div className="container mx-auto px-6">
        <div className="mx-auto max-w-3xl text-center mb-16">
          <h2 className="text-4xl font-bold tracking-[-0.03em] sm:text-5xl md:text-[56px] leading-[1.1]">
            Built-in tools to{' '}
            <span className="text-gradient">automate your workflow</span>
          </h2>
          <p className="mt-5 text-lg text-muted-foreground leading-relaxed">
            Everything is configured during your build — no waiting weeks for setup.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4 max-w-5xl mx-auto">
          {tools.map((tool) => {
            const Icon = tool.icon
            return (
              <div key={tool.name} className="rounded-2xl border border-border bg-card p-6">
                <div className="icon-container">
                  <Icon className="h-5 w-5" aria-hidden="true" />
                </div>
                <h3 className="mt-5 text-lg font-semibold">{tool.name}</h3>
                <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{tool.description}</p>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
