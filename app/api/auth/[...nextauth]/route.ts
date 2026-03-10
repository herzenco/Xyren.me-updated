import NextAuth from 'next-auth'
import Google from 'next-auth/providers/google'
import { createAdminClient } from '@/lib/supabase/admin'

const ALLOWED_DOMAINS = ['herzenco.co', 'xyren.me']

const handler = NextAuth({
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      allowDangerousEmailAccountLinking: true,
    }),
  ],
  callbacks: {
    async signIn({ user }: any) {
      // Only allow specific domains
      if (!user?.email) {
        console.log('signIn callback: no email provided')
        return false
      }

      const emailDomain = user.email.split('@')[1]
      console.log(`signIn callback: email=${user.email}, domain=${emailDomain}, allowed=${ALLOWED_DOMAINS}`)

      if (!ALLOWED_DOMAINS.includes(emailDomain)) {
        console.error(`❌ Access denied: ${user.email} not in allowed domains (${emailDomain})`)
        return false
      }

      console.log(`✅ Domain validation passed for ${user.email}`)

      // Store/update user in Supabase
      const supabase = createAdminClient()

      try {
        const { data: existingUser } = await (supabase.from('auth_users') as any)
          .select('id')
          .eq('email', user.email)
          .single()

        if (!existingUser) {
          // Create new user
          const { error } = await (supabase.from('auth_users') as any).insert({
            email: user.email,
            name: user.name,
            image: user.image,
            google_id: user.id,
          })

          if (error) {
            console.error('Error creating user:', error)
            return false
          }
        } else {
          // Update existing user
          await (supabase.from('auth_users') as any)
            .update({
              name: user.name,
              image: user.image,
              google_id: user.id,
              last_login: new Date().toISOString(),
            })
            .eq('email', user.email)
        }
      } catch (error) {
        console.error('Error in signIn callback:', error)
        return false
      }

      return true
    },

    async jwt({ token, user }: any) {
      if (user) {
        token.id = user.id
        token.email = user.email
      }
      return token
    },

    async session({ session, token }: any) {
      if (session.user) {
        session.user.id = token.id as string
        session.user.email = token.email as string
      }
      return session
    },
  },
  pages: {
    signIn: '/auth',
    error: '/auth',
  },
  session: {
    strategy: 'jwt' as const,
  },
})

export { handler as GET, handler as POST }
