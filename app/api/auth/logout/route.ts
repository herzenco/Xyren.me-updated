import { NextResponse } from 'next/server'

export async function POST() {
  // NextAuth's signout is handled via POST to /api/auth/signout
  // This route just redirects to it
  return NextResponse.redirect(
    new URL('/api/auth/signout', process.env.NEXTAUTH_URL || 'http://localhost:8000'),
    { status: 307 }
  )
}
