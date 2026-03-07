import type { Metadata } from 'next'
import { Hero } from '@/components/sections/hero'
import { HowWeThink } from '@/components/sections/how-we-think'
import { Portfolio } from '@/components/sections/portfolio'
import { Tools } from '@/components/sections/tools'
import { Pricing } from '@/components/sections/pricing'
import { FAQ } from '@/components/sections/faq'
import { Contact } from '@/components/sections/contact'
import { siteConfig } from '@/lib/config'
import { seoMetadata } from '@/lib/seo'

export const metadata: Metadata = {
  title: seoMetadata.home.title,
  description: seoMetadata.home.description,
  alternates: {
    canonical: siteConfig.url,
  },
  openGraph: {
    title: seoMetadata.home.title,
    description: seoMetadata.home.description,
    images: [seoMetadata.home.image],
  },
  twitter: {
    title: seoMetadata.home.title,
    description: seoMetadata.home.description,
    images: [seoMetadata.home.image],
  },
}

export default function HomePage() {
  return (
    <main id="main-content" className="lg:snap-y lg:snap-mandatory">
      <section className="lg:snap-start" id="hero">
        <Hero />
      </section>
      <section className="lg:snap-start" id="how-we-think">
        <HowWeThink />
      </section>
      <section className="lg:snap-start" id="portfolio">
        <Portfolio />
      </section>
      <section className="lg:snap-start" id="tools">
        <Tools />
      </section>
      <section className="lg:snap-start" id="pricing">
        <Pricing />
      </section>
      <section className="lg:snap-start" id="faq">
        <FAQ />
      </section>
      <section className="lg:snap-start" id="contact">
        <Contact />
      </section>
    </main>
  )
}
