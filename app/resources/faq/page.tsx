import type { Metadata } from 'next'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import { siteConfig } from '@/lib/config'
import { seoMetadata } from '@/lib/seo'
import { createClient } from '@/lib/supabase/server'

export const metadata: Metadata = {
  title: seoMetadata.faq.title,
  description: seoMetadata.faq.description,
  alternates: {
    canonical: `${siteConfig.url}/resources/faq`,
  },
  openGraph: {
    title: seoMetadata.faq.title,
    description: seoMetadata.faq.description,
    images: [seoMetadata.faq.image],
  },
  twitter: {
    title: seoMetadata.faq.title,
    description: seoMetadata.faq.description,
    images: [seoMetadata.faq.image],
  },
}

export default async function FAQPage() {
  const supabase = await createClient()

  // Fetch published FAQs from Supabase
  const { data: faqs, error } = await (supabase.from('faq_items') as any)
    .select('*')
    .eq('is_published', true)
    .order('sort_order', { ascending: true })

  // Group FAQs by category
  const groupedFaqs = (faqs || []).reduce((acc: any, item: any) => {
    const existing = acc.find((group: any) => group.category === item.category)
    if (existing) {
      existing.items.push({ q: item.question, a: item.answer })
    } else {
      acc.push({ category: item.category, items: [{ q: item.question, a: item.answer }] })
    }
    return acc
  }, [])

  const faqCategories = groupedFaqs.length > 0 ? groupedFaqs : []
  return (
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
            {faqCategories.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground">No FAQs available yet. Check back soon!</p>
              </div>
            ) : (
              faqCategories.map((section: any) => (
                <div key={section.category}>
                  <h2 className="text-xl font-bold mb-4">{section.category}</h2>
                  <Accordion type="single" collapsible className="space-y-2">
                    {section.items.map((item: any, i: number) => (
                      <AccordionItem
                        key={i}
                        value={`${section.category}-${i}`}
                        className="border rounded-lg px-4"
                      >
                        <AccordionTrigger className="text-left font-medium hover:no-underline py-4">
                          {item.q}
                        </AccordionTrigger>
                        <AccordionContent className="text-muted-foreground pb-4 leading-relaxed">
                          {item.a}
                        </AccordionContent>
                      </AccordionItem>
                    ))}
                  </Accordion>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
