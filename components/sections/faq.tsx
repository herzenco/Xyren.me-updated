import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'

const faqs = [
  {
    q: 'How long does it take?',
    a: 'Most projects launch in 5–10 business days from the time we receive your content and approve the design direction. Larger projects may take up to 2 weeks.',
  },
  {
    q: "What's included in maintenance?",
    a: 'Ongoing hosting, uptime monitoring, security updates, content changes, and technical support. Active and Optimized plans include additional automation management.',
  },
  {
    q: 'Can I customize the tools?',
    a: "Absolutely. Every tool — from the AI chat to the scheduling system — is configured to match your business workflow. We'll set it up during the build phase.",
  },
  {
    q: 'Do I need technical knowledge?',
    a: "No. We handle everything technical. You'll get a simple dashboard to manage content and view leads. No coding or technical skills required.",
  },
  {
    q: 'Can I cancel anytime?',
    a: 'Yes. There are no long-term contracts. You can cancel your monthly plan at any time. The one-time setup fee is non-refundable.',
  },
]

export function FAQ() {
  return (
    <section id="faq" className="py-24 md:py-32">
      <div className="container mx-auto px-6">
        <div className="mx-auto max-w-3xl">
          <div className="text-center mb-14">
            <h2 className="text-4xl font-bold tracking-[-0.03em] sm:text-5xl text-gradient inline-block">
              FAQ
            </h2>
          </div>

          <Accordion type="single" collapsible className="space-y-4">
            {faqs.map((faq, i) => (
              <AccordionItem
                key={i}
                value={`item-${i}`}
                className="rounded-xl border border-border bg-card px-6 py-0 [&[data-state=open]]:shadow-glow transition-shadow"
              >
                <AccordionTrigger className="text-left font-medium text-sm hover:no-underline py-5">
                  {faq.q}
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground pb-5 text-sm leading-relaxed">
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
