import Link from 'next/link'
import { ArrowRight, MessageCircle } from 'lucide-react'

export function Contact() {
  return (
    <section id="contact" className="relative py-24 md:py-32 overflow-hidden">
      {/* Subtle glow behind heading */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="w-[600px] h-[400px] rounded-full bg-[radial-gradient(ellipse_at_center,_hsl(190_100%_50%/0.08)_0%,_transparent_70%)]" />
      </div>

      <div className="container relative mx-auto px-6 text-center">
        <h2 className="text-5xl font-bold tracking-[-0.03em] sm:text-6xl md:text-[64px] leading-[1.1]">
          Get your{' '}
          <span className="text-gradient">
            free
            <br />
            project plan
          </span>
        </h2>

        <p className="mx-auto mt-6 max-w-lg text-lg text-muted-foreground leading-relaxed">
          Answer a few quick questions. We&apos;ll review and send back a clear
          plan. No sales pitch.
        </p>

        <div className="mt-10">
          <Link
            href="mailto:hello@xyren.me"
            className="cta-glow inline-flex items-center justify-center gap-2 rounded-lg px-8 py-3.5 text-lg font-semibold transition-all"
          >
            Start your project plan
            <ArrowRight className="h-5 w-5" />
          </Link>
        </div>

        <p className="mt-4 text-sm text-muted-foreground">
          Takes about 60 seconds.
        </p>

        <div className="mt-10 flex items-center justify-center gap-2 text-sm text-muted-foreground">
          <span>Or reach out directly via</span>
          <a
            href="https://wa.me/message"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-primary hover:text-primary/80 transition-colors"
          >
            <MessageCircle className="h-4 w-4" />
            WhatsApp
          </a>
        </div>
      </div>
    </section>
  )
}
