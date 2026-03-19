import type { Metadata } from 'next'
import { siteConfig } from '@/lib/config'

export const metadata: Metadata = {
  title: 'Careers',
  description:
    'Career opportunities at Xyren by Herzen Co. We are a small team building websites for service professionals.',
  alternates: { canonical: `${siteConfig.url}/careers` },
}

export default function CareersPage() {
  return (
    <div className="py-20 md:py-28">
      <div className="container mx-auto px-6">
        <div className="mx-auto max-w-2xl">
          <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl text-gradient inline-block mb-6">
            Careers
          </h1>
          <p className="text-lg text-muted-foreground leading-relaxed mb-8">
            Xyren is a small, focused team. We&apos;re not currently hiring,
            but we&apos;re always open to hearing from talented people.
          </p>

          <div className="rounded-xl border border-border bg-card p-6">
            <p className="text-sm text-muted-foreground">
              Think you&apos;d be a great fit? Drop us a line at{' '}
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
