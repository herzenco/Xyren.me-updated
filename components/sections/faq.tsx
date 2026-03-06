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
    q: 'Can you integrate lead capture and booking?',
    a: 'Yes. Every site includes built-in lead capture forms. We also integrate with scheduling tools like Cal.com or Calendly. Your Growth and Enterprise plans include full booking setup.',
  },
  {
    q: 'What about ongoing support?',
    a: 'We offer optional monthly support packages for updates, content changes, and security patches. These are separate from the project fee and completely optional. You can manage updates yourself if you prefer.',
  },
]

export function FAQ() {
  return (
    <section id="faq" className="py-24 md:py-32 lg:py-40 bg-muted/50">
      <div className="mx-auto max-w-4xl px-6 md:px-8">
        <div className="mx-auto max-w-3xl text-center mb-20">
          <h2 className="text-4xl md:text-5xl font-bold tracking-tight mb-6">
            Questions? We've got <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">answers.</span>
          </h2>
          <p className="text-lg text-muted-foreground">
            Everything you need to know to get started.
          </p>
        </div>

        <Accordion type="single" collapsible className="space-y-3">
          {faqs.map((faq, i) => (
            <AccordionItem key={i} value={`item-${i}`} className="border border-border rounded-lg px-6 data-[state=open]:bg-muted/30">
              <AccordionTrigger className="text-left font-semibold text-lg hover:no-underline py-5">
                {faq.q}
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground pb-4 leading-relaxed text-base">
                {faq.a}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  )
}
