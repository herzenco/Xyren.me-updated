'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { ArrowRight, Loader2, CheckCircle2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'

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

      const json = await response.json()

      if (!response.ok) {
        throw new Error(json.error || 'Something went wrong. Please try again.')
      }

      setIsSuccess(true)
      reset()
    } catch (err: any) {
      setError(err.message || 'Something went wrong. Please try again.')
    }
  }

  return (
    <section id="contact" className="relative py-24 md:py-32 overflow-hidden">
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
              Answer a few quick questions. We&apos;ll review and send back a clear plan. No sales pitch.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-start">
            {/* Form Side */}
            <div className="bg-card/50 backdrop-blur-sm border border-border rounded-2xl p-8 shadow-xl">
              {isSuccess ? (
                <div className="text-center py-12">
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
                </div>
              ) : (
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
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
                </form>
              )}
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
                <p className="text-sm text-muted-foreground mb-4">Or reach out directly via</p>
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
                    href="https://wa.me/17865893484"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 font-medium transition-colors"
                    style={{ color: '#25D366' }}
                  >
                    <div
                      className="w-10 h-10 rounded-full flex items-center justify-center"
                      style={{ backgroundColor: '#25D366' }}
                    >
                      <svg viewBox="0 0 24 24" className="w-5 h-5 fill-white" xmlns="http://www.w3.org/2000/svg">
                        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                      </svg>
                    </div>
                    WhatsApp Us
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
