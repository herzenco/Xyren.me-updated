const tools = [
  { name: 'Next.js', category: 'Framework' },
  { name: 'Tailwind CSS', category: 'Styling' },
  { name: 'Supabase', category: 'Backend' },
  { name: 'Vercel', category: 'Hosting' },
  { name: 'TypeScript', category: 'Language' },
  { name: 'Resend', category: 'Email' },
  { name: 'Cal.com', category: 'Booking' },
  { name: 'Cloudflare', category: 'CDN' },
]

export function Tools() {
  return (
    <section className="py-20 md:py-28">
      <div className="container mx-auto px-4">
        <div className="mx-auto max-w-2xl text-center mb-12">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
            Built with proven tools
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            We use production-grade technology — not page builders or templates.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          {tools.map((tool) => (
            <div
              key={tool.name}
              className="flex flex-col items-center gap-2 rounded-xl border bg-card p-6 text-center hover:border-primary/50 transition-colors"
            >
              <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <span className="text-lg font-bold text-primary">
                  {tool.name.charAt(0)}
                </span>
              </div>
              <p className="font-semibold text-sm">{tool.name}</p>
              <p className="text-xs text-muted-foreground">{tool.category}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
