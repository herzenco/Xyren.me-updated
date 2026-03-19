import type { Metadata } from 'next'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import { siteConfig } from '@/lib/config'
import { createClient } from '@/lib/supabase/server'

const faqUrl = `${siteConfig.url}/resources/faq`

export const metadata: Metadata = {
  title: 'FAQ — Frequently Asked Questions',
  description:
    'Answers to the most common questions about building a website with Xyren.me. Pricing, timelines, process, and more.',
  alternates: { canonical: faqUrl },
  openGraph: {
    title: 'FAQ — Frequently Asked Questions',
    description: 'Answers to the most common questions about building a website with Xyren.me.',
    type: 'website',
    url: faqUrl,
    images: [{ url: `${siteConfig.url}/og?title=Frequently+Asked+Questions`, width: 1200, height: 630 }],
  },
}

async function getFaqs() {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('faq_items')
    .select('id, question, answer, category, sort_order')
    .eq('is_published', true)
    .order('sort_order', { ascending: true })

  if (error) {
    console.error('Error fetching FAQs:', error)
    return []
  }

  return data ?? []
}

export default async function FAQPage() {
  const faqs = await getFaqs()

  // Group by category
  const categoryMap: Record<string, typeof faqs> = {}
  for (const item of faqs) {
    if (!categoryMap[item.category]) categoryMap[item.category] = []
    categoryMap[item.category].push(item)
  }
  const faqCategories = Object.entries(categoryMap).map(([category, items]) => ({ category, items }))

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((item) => ({
      '@type': 'Question',
      name: item.question,
      acceptedAnswer: { '@type': 'Answer', text: item.answer },
    })),
  }

  if (faqCategories.length === 0) {
    return (
      <div className="py-20 md:py-28 text-center">
        <h1 className="text-4xl font-extrabold mb-4">FAQ</h1>
        <p className="text-muted-foreground">No FAQs found. Check back soon!</p>
      </div>
    )
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <div className="py-20 md:py-28">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-3xl">
            <div className="text-center mb-16">
              <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl">FAQ</h1>
              <p className="mt-4 text-lg text-muted-foreground">
                Everything you want to know before we get started.
              </p>
            </div>

            <div className="space-y-10">
              {faqCategories.map((section) => (
                <div key={section.category}>
                  <h2 className="text-xl font-bold mb-4">{section.category}</h2>
                  <Accordion type="single" collapsible className="space-y-2">
                    {section.items.map((item, i) => (
                      <AccordionItem
                        key={item.id ?? i}
                        value={`${section.category}-${i}`}
                        className="border rounded-lg px-4"
                      >
                        <AccordionTrigger className="text-left font-medium hover:no-underline py-4">
                          {item.question}
                        </AccordionTrigger>
                        <AccordionContent className="text-muted-foreground pb-4 leading-relaxed">
                          {item.answer}
                        </AccordionContent>
                      </AccordionItem>
                    ))}
                  </Accordion>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
