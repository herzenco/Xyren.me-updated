import { SignJWT, jwtVerify } from 'jose'
import { cookies } from 'next/headers'

const SESSION_COOKIE = 'session-token'
const secret = new TextEncoder().encode(process.env.AUTH_SECRET)

export async function createSessionToken(user: { id: string; email: string; name?: string }) {
  return new SignJWT({ id: user.id, email: user.email, name: user.name })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(secret)
}

export async function verifySessionToken(token: string) {
  try {
    const { payload } = await jwtVerify(token, secret)
    return payload as { id: string; email: string; name?: string }
  } catch {
    return null
  }
}

export async function auth() {
  const cookieStore = await cookies()
  const token = cookieStore.get(SESSION_COOKIE)?.value
  if (!token) return null

  const user = await verifySessionToken(token)
  if (!user) return null

  return { user }
}

export { SESSION_COOKIE }
