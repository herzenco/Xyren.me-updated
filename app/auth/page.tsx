'use client'

import { Suspense, useState } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Loader2, Mail } from 'lucide-react'

function AuthContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const error = searchParams.get('error')
  const [isLoading, setIsLoading] = useState(false)

  async function handleGoogleSignIn() {
    setIsLoading(true)
    try {
      const result = await signIn('google', {
        redirect: false,
      })

      if (result?.error) {
        if (result.error === 'AccessDenied') {
          // This is shown when domain validation fails in the callback
          // The auth.ts file logs the email that wasn't allowed
        }
        return
      }

      if (result?.ok) {
        router.push('/dashboard')
        router.refresh()
      }
    } finally {
      setIsLoading(false)
    }
  }

  const errorMessages: Record<string, string> = {
    OAuthSignin: 'Error connecting to Google.',
    OAuthCallback: 'Error during Google authentication.',
    AccessDenied: 'Access denied. Your email domain is not authorized.',
    Callback: 'There was an error during sign in. Please try again.',
  }

  const displayError = error ? errorMessages[error] || 'An error occurred. Please try again.' : null

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12">
      <Card className="w-full max-w-sm">
        <CardHeader className="text-center pb-6">
          <h1 className="text-2xl font-bold">
            <span className="text-primary">Xyren</span>.me Admin
          </h1>
          <p className="text-sm text-muted-foreground mt-2">Sign in with your Herzen Co. email</p>
        </CardHeader>
        <CardContent className="space-y-4">
          {displayError && (
            <div className="bg-destructive/10 border border-destructive/30 rounded-lg p-3 text-sm text-destructive">
              {displayError}
            </div>
          )}

          <Button
            onClick={handleGoogleSignIn}
            disabled={isLoading}
            className="w-full h-10 gap-2 bg-white text-foreground hover:bg-gray-100 border border-border"
          >
            {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Mail className="h-4 w-4" />}
            {isLoading ? 'Signing in...' : 'Sign in with Google'}
          </Button>

          <p className="text-xs text-muted-foreground text-center mt-4">
            Only users with @herzenco.co or @xyren.me email addresses can access this dashboard.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}

export default function AuthPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
      <AuthContent />
    </Suspense>
  )
}
