'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { CheckCircle, Loader2 } from 'lucide-react'

const contactSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email address'),
  phone: z.string().optional(),
  business: z.string().optional(),
  service: z.string().optional(),
  message: z.string().min(10, 'Message must be at least 10 characters'),
})

type ContactFormData = z.infer<typeof contactSchema>

export function Contact() {
  const [submitted, setSubmitted] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<ContactFormData>({
    resolver: zodResolver(contactSchema),
  })

  async function onSubmit(data: ContactFormData) {
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      if (!res.ok) throw new Error('Submission failed')
      setSubmitted(true)
      reset()
    } catch {
      alert('Something went wrong. Please email us directly at hello@xyren.me')
    }
  }

  return (
    <section id="contact" className="py-24 md:py-32 lg:py-40 bg-background">
      <div className="mx-auto max-w-4xl px-6 md:px-8">
        <div className="mx-auto max-w-2xl text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold tracking-tight mb-6">
            Ready to <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">get started?</span>
          </h2>
          <p className="text-lg md:text-xl text-muted-foreground">
            Tell us about your business and we&apos;ll get back to you within one business day.
          </p>
        </div>

          {submitted ? (
            <div className="flex flex-col items-center gap-4 py-16 text-center">
              <div style={{ background: 'linear-gradient(135deg, #0066ff 0%, #6366f1 100%)', padding: '2rem', borderRadius: '9999px' }}>
                <CheckCircle className="h-12 w-12 text-white" />
              </div>
              <h3 className="text-2xl font-bold">Message received!</h3>
              <p className="text-muted-foreground text-lg">
                We&apos;ll be in touch within one business day to discuss your project.
              </p>
              <Button variant="outline" onClick={() => setSubmitted(false)}>
                Send another message
              </Button>
            </div>
          ) : (
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <Label htmlFor="name">Full Name *</Label>
                  <Input
                    id="name"
                    placeholder="Jane Smith"
                    {...register('name')}
                    aria-invalid={!!errors.name}
                  />
                  {errors.name && (
                    <p className="text-xs text-destructive">{errors.name.message}</p>
                  )}
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="email">Email Address *</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="jane@example.com"
                    {...register('email')}
                    aria-invalid={!!errors.email}
                  />
                  {errors.email && (
                    <p className="text-xs text-destructive">{errors.email.message}</p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input id="phone" type="tel" placeholder="+1 (555) 000-0000" {...register('phone')} />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="business">Business Name</Label>
                  <Input id="business" placeholder="Acme Services LLC" {...register('business')} />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="service">Which package interests you?</Label>
                <select
                  id="service"
                  {...register('service')}
                  className="flex min-h-[44px] w-full rounded-md border border-border bg-background px-3 py-2 text-base transition-colors focus-visible:outline-none focus-visible:border-blue-600 focus-visible:ring-2 focus-visible:ring-blue-600/20"
                >
                  <option value="">Not sure yet</option>
                  <option value="starter">Starter — $2,500</option>
                  <option value="growth">Growth — $4,500</option>
                  <option value="enterprise">Enterprise — $7,500</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="message">Tell us about your business *</Label>
                <Textarea
                  id="message"
                  placeholder="What do you do, who are your customers, and what do you want your website to achieve?"
                  rows={4}
                  {...register('message')}
                  aria-invalid={!!errors.message}
                />
                {errors.message && (
                  <p className="text-xs text-destructive">{errors.message.message}</p>
                )}
              </div>

              <Button type="submit" size="lg" className="w-full" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Sending...
                  </>
                ) : (
                  'Send Message'
                )}
              </Button>
            </form>
          )}
        </div>
      </div>
    </section>
  )
}
