import NextAuth from 'next-auth'

// This is a placeholder config that gets overridden in the route handler
// We export signOut for use in client components
export const { signOut } = NextAuth({
  providers: [],
  pages: {
    signIn: '/auth',
    error: '/auth',
  },
  session: {
    strategy: 'jwt',
  },
})
