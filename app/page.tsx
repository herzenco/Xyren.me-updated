import type { Metadata } from 'next'
import { Hero } from '@/components/sections/hero'
import { HowWeThink } from '@/components/sections/how-we-think'
import { Portfolio } from '@/components/sections/portfolio'
import { Tools } from '@/components/sections/tools'
import { Pricing } from '@/components/sections/pricing'
import { FAQ } from '@/components/sections/faq'
import { Contact } from '@/components/sections/contact'
import { siteConfig } from '@/lib/config'

export const metadata: Metadata = {
  title: `${siteConfig.name} — ${siteConfig.tagline}`,
  description: siteConfig.description,
  alternates: {
    canonical: siteConfig.url,
  },
}

export default function HomePage() {
  return (
    <>
      <Hero />
      <HowWeThink />
      <Portfolio />
      <Tools />
      <Pricing />
      <FAQ />
      <Contact />
    </>
  )
}
