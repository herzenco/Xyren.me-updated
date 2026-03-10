import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { Resend } from 'resend'
import { createAdminClient } from '@/lib/supabase/admin'

const contactSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  phone: z.string().optional(),
  business: z.string().optional(),
  service: z.string().optional(),
  message: z.string().min(10),
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const data = contactSchema.parse(body)

    // Save to Supabase
    const supabase = createAdminClient()
    const { error: dbError } = await (supabase.from('contact_submissions') as any).insert({
      name: data.name,
      email: data.email,
      phone: data.phone || null,
      business: data.business || null,
      service: data.service || null,
      message: data.message,
      status: 'new',
    })

    if (dbError) {
      console.error('Error saving to Supabase:', dbError)
      // Don't block the response if Supabase fails
    }

    // Send email via Resend
    const resend = new Resend(process.env.RESEND_API_KEY)
    const contactEmail = process.env.CONTACT_EMAIL || 'hello@xyren.me'

    try {
      await resend.emails.send({
        from: 'Contact Form <noreply@xyren.me>',
        to: contactEmail,
        subject: `New enquiry from ${data.name}`,
        html: `
          <h2>New Contact Form Submission</h2>
          <p><strong>Name:</strong> ${data.name}</p>
          <p><strong>Email:</strong> ${data.email}</p>
          ${data.phone ? `<p><strong>Phone:</strong> ${data.phone}</p>` : ''}
          ${data.business ? `<p><strong>Business:</strong> ${data.business}</p>` : ''}
          ${data.service ? `<p><strong>Service:</strong> ${data.service}</p>` : ''}
          <p><strong>Message:</strong></p>
          <p>${data.message.replace(/\n/g, '<br>')}</p>
        `,
      })
    } catch (emailError) {
      console.error('Error sending email via Resend:', emailError)
      return NextResponse.json({ error: 'Failed to send email' }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid form data', details: error.issues }, { status: 400 })
    }
    console.error('Contact form error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
