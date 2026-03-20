'use client'

import { useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { CheckCircle, XCircle } from 'lucide-react'
import { approveDraft, rejectDraft, requestDraftChanges } from '@/lib/actions/content'

export function DraftActions({ draftId }: { draftId: string }) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()

  function handleApprove() {
    startTransition(async () => {
      await approveDraft(draftId)
      router.push('/dashboard/content')
    })
  }

  function handleReject() {
    startTransition(async () => {
      await rejectDraft(draftId)
      router.push('/dashboard/content')
    })
  }

  function handleRevise(formData: FormData) {
    const changes = formData.get('changes') as string
    if (!changes?.trim()) return
    startTransition(async () => {
      await requestDraftChanges(draftId, changes)
      router.refresh()
    })
  }

  return (
    <Card>
      <CardContent className="p-4 space-y-3">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Actions</h3>
        <div className="flex flex-wrap items-center gap-2">
          <Button
            onClick={handleApprove}
            disabled={isPending}
            size="sm"
            className="gap-1 bg-green-600 hover:bg-green-700 text-white"
          >
            <CheckCircle className="h-3.5 w-3.5" />
            {isPending ? 'Processing...' : 'Approve & Publish'}
          </Button>
          <Button
            onClick={handleReject}
            disabled={isPending}
            size="sm"
            variant="outline"
            className="gap-1 border-red-500/30 text-red-400 hover:bg-red-500/10"
          >
            <XCircle className="h-3.5 w-3.5" /> Reject
          </Button>
        </div>
        <form action={handleRevise} className="flex gap-2">
          <input
            name="changes"
            placeholder="Request AI changes..."
            className="h-8 text-xs px-3 rounded-md border border-input bg-background flex-1 min-w-0 focus:outline-none focus:ring-1 focus:ring-primary"
          />
          <Button type="submit" size="sm" variant="outline" className="h-8 text-xs" disabled={isPending}>
            Revise
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
