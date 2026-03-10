'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { ArrowRight, MessageCircle, Loader2, CheckCircle2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { motion, AnimatePresence } from 'framer-motion'

const contactSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email'),
  message: z.string().min(10, 'Message must be at least 10 characters'),
})

type ContactFormData = z.infer<typeof contactSchema>

export function Contact() {
  const [isSuccess, setIsSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ContactFormData>({
    resolver: zodResolver(contactSchema),
  })

  async function onSubmit(data: ContactFormData) {
    setError(null)
    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        throw new Error('Something went wrong. Please try again.')
      }

      setIsSuccess(true)
      reset()
    } catch (err: any) {
      setError(err.message)
    }
  }

  return (
    <section id="contact" className="relative py-24 md:py-32 overflow-hidden">
      {/* Subtle glow behind heading */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="w-[600px] h-[400px] rounded-full bg-[radial-gradient(ellipse_at_center,_hsl(190_100%_50%/0.08)_0%,_transparent_70%)]" />
      </div>

      <div className="container relative mx-auto px-6">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
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
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-start">
            {/* Form Side */}
            <div className="bg-card/50 backdrop-blur-sm border border-border rounded-2xl p-8 shadow-xl">
              <AnimatePresence mode="wait">
                {isSuccess ? (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="text-center py-12"
                  >
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 text-primary mb-6">
                      <CheckCircle2 className="w-8 h-8" />
                    </div>
                    <h3 className="text-2xl font-bold mb-2">Message Sent!</h3>
                    <p className="text-muted-foreground mb-8">
                      We&apos;ve received your inquiry and will get back to you with your project plan within 24 hours.
                    </p>
                    <Button variant="outline" onClick={() => setIsSuccess(false)}>
                      Send another message
                    </Button>
                  </motion.div>
                ) : (
                  <motion.form
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onSubmit={handleSubmit(onSubmit)}
                    className="space-y-6"
                  >
                    <div className="space-y-2">
                      <Label htmlFor="name">Full Name</Label>
                      <Input
                        id="name"
                        placeholder="John Doe"
                        {...register('name')}
                        className={errors.name ? 'border-destructive' : ''}
                      />
                      {errors.name && (
                        <p className="text-xs text-destructive">{errors.name.message}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="email">Work Email</Label>
                      <Input
                        id="email"
                        type="email"
                        placeholder="john@company.com"
                        {...register('email')}
                        className={errors.email ? 'border-destructive' : ''}
                      />
                      {errors.email && (
                        <p className="text-xs text-destructive">{errors.email.message}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="message">How can we help?</Label>
                      <Textarea
                        id="message"
                        placeholder="Tell us about your project..."
                        rows={4}
                        {...register('message')}
                        className={errors.message ? 'border-destructive' : ''}
                      />
                      {errors.message && (
                        <p className="text-xs text-destructive">{errors.message.message}</p>
                      )}
                    </div>

                    {error && (
                      <p className="text-sm text-destructive bg-destructive/10 p-3 rounded-lg">
                        {error}
                      </p>
                    )}

                    <Button type="submit" className="w-full cta-glow text-lg py-6" disabled={isSubmitting}>
                      {isSubmitting ? (
                        <>
                          <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                          Sending...
                        </>
                      ) : (
                        <>
                          Start your project plan
                          <ArrowRight className="ml-2 h-5 w-5" aria-hidden="true" />
                        </>
                      )}
                    </Button>
                  </motion.form>
                )}
              </AnimatePresence>
            </div>

            {/* Info Side */}
            <div className="space-y-8 py-4">
              <div>
                <h3 className="text-xl font-bold mb-4">What happens next?</h3>
                <ul className="space-y-4">
                  {[
                    'Manual review of your current site and goals.',
                    'Creation of a custom conversion roadmap.',
                    'Fixed-price quote with clear timelines.',
                    'Zero-pressure consultation (optional).',
                  ].map((item, i) => (
                    <li key={i} className="flex items-start gap-3 text-muted-foreground">
                      <div className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                      <span className="text-sm">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="pt-8 border-t border-border">
                <p className="text-sm text-muted-foreground mb-4">
                  Or reach out directly via
                </p>
                <div className="flex flex-col gap-4">
                  <a
                    href="mailto:hello@xyren.me"
                    className="flex items-center gap-3 text-foreground hover:text-primary transition-colors font-medium"
                  >
                    <div className="w-10 h-10 rounded-full border border-border flex items-center justify-center">
                      <ArrowRight className="w-4 h-4 -rotate-45" />
                    </div>
                    hello@xyren.me
                  </a>
                  <a
                    href="https://wa.me/message"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 text-foreground hover:text-whatsapp transition-colors font-medium"
                  >
                    <div className="w-10 h-10 rounded-full border border-border flex items-center justify-center">
                      <MessageCircle className="w-4 h-4" />
                    </div>
                    WhatsApp Support
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
