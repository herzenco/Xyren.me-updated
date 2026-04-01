'use client'

import { useRouter } from 'next/navigation'
import { useCallback } from 'react'

export function SignOutButton({ className }: { className?: string }) {
  const router = useRouter()

  const handleSignOut = useCallback(async () => {
    await fetch('/api/auth/logout', { method: 'POST' })
    router.push('/auth')
    router.refresh()
  }, [router])

  return (
    <button type="button" onClick={handleSignOut} className={className}>
      Sign Out
    </button>
  )
}
