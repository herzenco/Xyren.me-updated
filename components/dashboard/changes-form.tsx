'use client'

import { useRef, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { requestDraftChanges } from '@/lib/actions/content'

export function ChangesForm({ draftId }: { draftId: string }) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const formRef = useRef<HTMLFormElement>(null)

  function handleSubmit(formData: FormData) {
    const changes = formData.get('changes') as string
    if (!changes?.trim()) return
    startTransition(async () => {
      await requestDraftChanges(draftId, changes)
      formRef.current?.reset()
      router.refresh()
    })
  }

  return (
    <form ref={formRef} action={handleSubmit} className="flex gap-1.5 flex-1">
      <input
        name="changes"
        placeholder="Request changes..."
        disabled={isPending}
        className="h-7 text-xs px-2 rounded-md border border-input bg-background flex-1 min-w-0 focus:outline-none focus:ring-1 focus:ring-primary disabled:opacity-50"
      />
      <Button type="submit" size="sm" variant="outline" className="h-7 text-xs flex-shrink-0" disabled={isPending}>
        {isPending ? 'Revising...' : 'Revise'}
      </Button>
    </form>
  )
}
