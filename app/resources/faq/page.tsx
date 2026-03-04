import type { Metadata } from 'next'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import { siteConfig } from '@/lib/config'

export const metadata: Metadata = {
  title: 'FAQ — Frequently Asked Questions',
  description:
    'Answers to the most common questions about building a website with Xyren.me. Pricing, timelines, process, and more.',
  alternates: {
    canonical: `${siteConfig.url}/resources/faq`,
  },
}

const faqCategories = [
  {
    category: 'Process',
    items: [
      {
        q: 'What does the process look like from start to finish?',
        a: 'After you fill out our contact form, we schedule a 15-minute discovery call. From there, you\'ll receive a project brief and scope document. Once approved, we\'ll request your content (logo, photos, copy) and begin building. You\'ll receive a staging link to review within 5–7 days, and after 2 rounds of revisions, we launch.',
      },
      {
        q: 'What do I need to provide?',
        a: 'Your logo, any photos of your work or team (or we can source stock images), a description of your services, your contact details, and any specific requirements. We\'ll guide you through everything with a simple checklist.',
      },
    ],
  },
  {
    category: 'Pricing',
    items: [
      {
        q: 'Are there any ongoing fees?',
        a: 'The project fee is a one-time payment. You\'ll have ongoing costs for hosting (typically $20–$30/month with Vercel or similar) and your domain (about $15/year). We offer optional monthly support packages but these are not required.',
      },
      {
        q: 'Do you offer payment plans?',
        a: 'Yes. We typically split projects into 50% upfront and 50% on launch. For larger projects, we can discuss a 3-part payment schedule.',
      },
    ],
  },
  {
    category: 'Technical',
    items: [
      {
        q: 'Who hosts the website?',
        a: 'We build on Next.js and deploy to Vercel by default — it\'s the fastest, most reliable platform for Next.js. You\'ll have your own Vercel account and full access to the deployment.',
      },
      {
        q: 'Can I update the website myself after launch?',
        a: 'Yes. For content like blog posts and FAQs, we set up a simple admin panel. For design changes, you\'d need a developer — or you can hire us for ongoing support.',
      },
    ],
  },
]

export default function FAQPage() {
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
            {faqCategories.map((section) => (
              <div key={section.category}>
                <h2 className="text-xl font-bold mb-4">{section.category}</h2>
                <Accordion type="single" collapsible className="space-y-2">
                  {section.items.map((item, i) => (
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
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
