import { type NextRequest } from 'next/server'
import { getServerSession } from 'next-auth'
import { NextResponse } from 'next/server'

export async function proxy(request: NextRequest) {
  const session = await getServerSession()

  // Protect /dashboard routes
  if (!session && request.nextUrl.pathname.startsWith('/dashboard')) {
    const url = request.nextUrl.clone()
    url.pathname = '/auth'
    return NextResponse.redirect(url)
  }

  // Redirect logged-in users away from /auth
  if (session && request.nextUrl.pathname === '/auth') {
    const url = request.nextUrl.clone()
    url.pathname = '/dashboard'
    return NextResponse.redirect(url)
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
