import type { Metadata } from 'next'
import { siteConfig } from '@/lib/config'

export const metadata: Metadata = {
  title: 'About',
  description:
    'Xyren by Herzen Co. — productized web design for service professionals. Learn about who we are and what we do.',
  alternates: { canonical: `${siteConfig.url}/about` },
}

export default function AboutPage() {
  return (
    <div className="py-20 md:py-28">
      <div className="container mx-auto px-6">
        <div className="mx-auto max-w-2xl">
          <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl text-gradient inline-block mb-6">
            About Xyren
          </h1>
          <p className="text-lg text-muted-foreground leading-relaxed mb-8">
            Xyren is a productized web design studio by{' '}
            <span className="text-foreground font-medium">Herzen Co.</span> We
            build fast, conversion-focused websites for service professionals —
            from HVAC techs and plumbers to attorneys and consultants.
          </p>

          <h2 className="text-2xl font-bold mb-4">What We Do</h2>
          <p className="text-muted-foreground leading-relaxed mb-8">
            We handle everything: design, development, SEO, hosting, and
            ongoing maintenance. Every site ships with built-in lead capture,
            AI-powered chat, automated scheduling, and analytics — so your
            website works as hard as you do.
          </p>

          <h2 className="text-2xl font-bold mb-4">Why We Exist</h2>
          <p className="text-muted-foreground leading-relaxed mb-8">
            Most service professionals don&apos;t have time to manage a website
            project. We created Xyren to eliminate that friction — fixed
            pricing, fast turnarounds, and zero technical knowledge required.
            You focus on your craft; we make sure your online presence brings
            in the right clients.
          </p>

          <div className="rounded-xl border border-border bg-card p-6">
            <p className="text-sm text-muted-foreground">
              Have questions or want to learn more? Reach us at{' '}
              <a
                href="mailto:hello@xyren.me"
                className="text-primary hover:text-primary/80 transition-colors"
              >
                hello@xyren.me
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
