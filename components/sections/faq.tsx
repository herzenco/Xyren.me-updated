'use client'

import { motion, type Variants } from 'framer-motion'
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

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.1,
    },
  },
}

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5 },
  },
}

export function FAQ() {
  return (
    <section id="faq" className="bg-background py-24 md:py-32 lg:py-40">
      <div className="mx-auto max-w-4xl px-6 md:px-8">
        <motion.div
          className="mx-auto max-w-3xl text-center mb-20"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-4xl md:text-5xl font-bold tracking-tight mb-6">
            Questions? We've got <span className="text-gradient">answers.</span>
          </h2>
          <p className="text-lg text-muted-foreground">
            Everything you need to know to get started.
          </p>
        </motion.div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="space-y-3"
        >
          <Accordion type="single" collapsible className="space-y-3">
            {faqs.map((faq, i) => (
              <motion.div key={i} variants={itemVariants}>
                <AccordionItem
                  value={`item-${i}`}
                  className="border border-border/50 rounded-xl px-6 bg-card/50 backdrop-blur-sm data-[state=open]:border-primary/30 data-[state=open]:bg-card/80 transition-all duration-200"
                >
                  <AccordionTrigger className="text-left font-semibold text-lg hover:no-underline py-5 hover:text-primary transition-colors">
                    {faq.q}
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground pb-4 leading-relaxed text-base">
                    {faq.a}
                  </AccordionContent>
                </AccordionItem>
              </motion.div>
            ))}
          </Accordion>
        </motion.div>
      </div>
    </section>
  )
}
