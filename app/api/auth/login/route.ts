import { NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { createAdminClient } from '@/lib/supabase/admin'
import { createSessionToken, SESSION_COOKIE } from '@/auth'

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json()

    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password are required' }, { status: 400 })
    }

    const supabase = createAdminClient()

    // TODO: Replace `as any` with Supabase generated types (supabase gen types typescript)
    const { data: user, error } = await (supabase.from('auth_users') as any)
      .select('id, email, name, password_hash')
      .eq('email', email.toLowerCase().trim())
      .single()

    if (error || !user) {
      return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 })
    }

    if (!user.password_hash) {
      return NextResponse.json({ error: 'Account not set up. Contact admin.' }, { status: 401 })
    }

    const valid = await bcrypt.compare(password, user.password_hash)
    if (!valid) {
      return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 })
    }

    // Update last login
    await (supabase.from('auth_users') as any)
      .update({ last_login: new Date().toISOString() })
      .eq('id', user.id)

    const token = await createSessionToken({ id: user.id, email: user.email, name: user.name })

    const response = NextResponse.json({ success: true })
    response.cookies.set(SESSION_COOKIE, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 7, // 7 days
    })

    return response
  } catch (error) {
    console.error('Login error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
