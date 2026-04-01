import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { jwtVerify } from 'jose'

const secret = new TextEncoder().encode(process.env.AUTH_SECRET)

export async function proxy(request: NextRequest) {
  const pathname = request.nextUrl.pathname

  if (!pathname.startsWith('/dashboard')) {
    return NextResponse.next()
  }

  const token = request.cookies.get('session-token')?.value
  if (!token) {
    return NextResponse.redirect(new URL('/auth', request.url))
  }

  try {
    await jwtVerify(token, secret)
    return NextResponse.next()
  } catch {
    return NextResponse.redirect(new URL('/auth', request.url))
  }
}

export const config = {
  matcher: ['/dashboard/:path*'],
}
