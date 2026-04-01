import { NextResponse } from 'next/server'
import { SESSION_COOKIE } from '@/auth'

export async function POST() {
  const response = NextResponse.redirect(new URL('/auth', process.env.AUTH_URL ?? 'http://localhost:8000'))
  response.cookies.set(SESSION_COOKIE, '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 0,
  })
  return response
}
