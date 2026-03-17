'use client'

import { useState } from 'react'
import { Card } from '@/components/ui/card'

interface SubmissionSyncStatusProps {
  submission: {
    id: string
    clickup_status?: string | null
    clickup_task_id?: string | null
    clickup_error?: string | null
    synced_at?: string | null
  }
  onRetry: (submissionId: string) => Promise<{ success: boolean; error?: string }>
}

export function SubmissionSyncStatus({ submission, onRetry }: SubmissionSyncStatusProps) {
  const [isRetrying, setIsRetrying] = useState(false)
  const [retryError, setRetryError] = useState<string | null>(null)
  const [retrySuccess, setRetrySuccess] = useState(false)

  const handleRetry = async () => {
    setIsRetrying(true)
    setRetryError(null)
    setRetrySuccess(false)

    try {
      const result = await onRetry(submission.id)
      if (result.success) {
        setRetrySuccess(true)
        setTimeout(() => setRetrySuccess(false), 3000)
      } else {
        setRetryError(result.error || 'Unknown error')
      }
    } catch (error) {
      setRetryError(error instanceof Error ? error.message : 'Unknown error')
    } finally {
      setIsRetrying(false)
    }
  }

  const status = submission.clickup_status || 'pending'
  const isFailed = status === 'sync_failed'
  const isSynced = status === 'synced'
  const isPending = status === 'pending'

  return (
    <Card className="p-6">
      <h3 className="font-semibold mb-4">ClickUp Sync Status</h3>

      <div className="space-y-4">
        {/* Status Badge */}
        <div className="flex items-center gap-3">
          <div
            className={`px-3 py-1 rounded-full text-sm font-semibold ${
              isSynced
                ? 'bg-emerald-500/20 text-emerald-300'
                : isFailed
                  ? 'bg-red-500/20 text-red-300'
                  : 'bg-amber-500/20 text-amber-300'
            }`}
          >
            {isSynced ? 'Synced' : isFailed ? 'Failed' : 'Pending'}
          </div>
        </div>

        {/* Task ID - shown if synced */}
        {isSynced && submission.clickup_task_id && (
          <div>
            <p className="text-sm text-muted-foreground mb-1">Task ID</p>
            <p className="text-sm font-mono text-cyan-300">{submission.clickup_task_id}</p>
          </div>
        )}

        {/* Synced At - shown if synced */}
        {isSynced && submission.synced_at && (
          <div>
            <p className="text-sm text-muted-foreground mb-1">Synced At</p>
            <p className="text-sm">
              {new Date(submission.synced_at).toLocaleString()}
            </p>
          </div>
        )}

        {/* Error Message - shown if failed */}
        {isFailed && submission.clickup_error && (
          <div>
            <p className="text-sm text-muted-foreground mb-1">Error</p>
            <p className="text-sm text-red-400 break-words">{submission.clickup_error}</p>
          </div>
        )}

        {/* Retry status messages */}
        {retrySuccess && (
          <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded text-sm text-emerald-300">
            Successfully synced to ClickUp!
          </div>
        )}

        {retryError && (
          <div className="p-3 bg-red-500/10 border border-red-500/20 rounded text-sm text-red-300">
            {retryError}
          </div>
        )}

        {/* Retry Button - shown if failed or pending */}
        {(isFailed || isPending) && (
          <button
            onClick={handleRetry}
            disabled={isRetrying}
            className="w-full px-3 py-2 bg-cyan-500/20 text-cyan-300 rounded font-semibold hover:bg-cyan-500/30 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isRetrying ? 'Retrying...' : 'Retry Sync'}
          </button>
        )}
      </div>
    </Card>
  )
}
