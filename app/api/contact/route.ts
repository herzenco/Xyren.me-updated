import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
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

    // Store in Supabase
    const supabase = createAdminClient()
    const { error } = await (supabase.from('contact_submissions') as any).insert({
      name: data.name,
      email: data.email,
      phone: data.phone || null,
      business: data.business || null,
      service: data.service || null,
      message: data.message,
      status: 'new',
    })

    if (error) {
      console.error('Database error:', error)
      return NextResponse.json({ error: 'Failed to save submission' }, { status: 500 })
    }

    return NextResponse.json({ success: true, message: 'Thank you! We\'ll get back to you soon.' })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid form data', details: error.issues }, { status: 400 })
    }
    console.error('Contact form error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
