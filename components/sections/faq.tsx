import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'

const faqs = [
  {
    q: 'How long does it take to build my website?',
    a: 'Most projects are completed in 5–10 business days from the time we receive your content and approve the design direction. Larger projects with more pages or custom functionality may take up to 2 weeks.',
  },
  {
    q: 'Do I own the website once it\'s built?',
    a: 'Absolutely. You own 100% of the code, content, and domain. We hand everything over at the end of the project with no recurring fees or lock-in.',
  },
  {
    q: 'What do I need to provide?',
    a: 'Your logo, any photos you have (or we can source them), your services list, pricing (if you share it), and a short description of your business. We\'ll handle the rest.',
  },
  {
    q: 'Will my website show up on Google?',
    a: 'Yes. Every site we build is SEO-optimized from day one — proper metadata, structured data, fast load times, and mobile-friendliness. We also submit your sitemap to Google Search Console.',
  },
  {
    q: 'Can you integrate online booking?',
    a: 'Yes. We integrate with popular scheduling tools like Cal.com, Calendly, or Acuity. Your Growth and Authority plans include booking setup.',
  },
  {
    q: 'Do you offer ongoing support or maintenance?',
    a: 'We offer optional monthly support packages for updates, content changes, and security patches. These are separate from the project fee and completely optional.',
  },
]

export function FAQ() {
  return (
    <section id="faq" className="py-20 md:py-28">
      <div className="container mx-auto px-4">
        <div className="mx-auto max-w-3xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
              Frequently asked questions
            </h2>
            <p className="mt-4 text-lg text-muted-foreground">
              Everything you need to know before we get started.
            </p>
          </div>

          <Accordion type="single" collapsible className="space-y-2">
            {faqs.map((faq, i) => (
              <AccordionItem key={i} value={`item-${i}`} className="border rounded-lg px-4">
                <AccordionTrigger className="text-left font-medium hover:no-underline py-4">
                  {faq.q}
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground pb-4 leading-relaxed">
                  {faq.a}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </div>
    </section>
  )
}
