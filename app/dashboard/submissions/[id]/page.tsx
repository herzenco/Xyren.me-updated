import { createAdminClient } from '@/lib/supabase/admin'
import { notFound } from 'next/navigation'
import { PageHeader } from '@/components/dashboard/page-header'
import { updateSubmissionStatus, retryClickUpSync } from '@/lib/actions/submissions'
import { Card } from '@/components/ui/card'
import { SubmissionSyncStatus } from '@/components/dashboard/submission-sync-status'

export default async function SubmissionDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = createAdminClient()

  const { data: submission } = await (supabase
    .from('contact_submissions') as any)
    .select('*')
    .eq('id', id)
    .single()

  if (!submission) {
    notFound()
  }

  return (
    <>
      <PageHeader title="Contact Submission" />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card className="p-6">
            <h3 className="font-semibold mb-4">Message</h3>
            <p className="text-muted-foreground whitespace-pre-wrap">{submission.message}</p>
          </Card>

          <div className="grid grid-cols-2 gap-6">
            <Card className="p-6">
              <h3 className="text-sm font-semibold text-muted-foreground mb-2">
                Name
              </h3>
              <p className="text-foreground">{submission.name}</p>
            </Card>

            <Card className="p-6">
              <h3 className="text-sm font-semibold text-muted-foreground mb-2">
                Email
              </h3>
              <p className="text-foreground">
                <a href={`mailto:${submission.email}`} className="text-cyan-300 hover:underline">
                  {submission.email}
                </a>
              </p>
            </Card>

            <Card className="p-6">
              <h3 className="text-sm font-semibold text-muted-foreground mb-2">
                Phone
              </h3>
              <p className="text-foreground">{submission.phone || '—'}</p>
            </Card>

            <Card className="p-6">
              <h3 className="text-sm font-semibold text-muted-foreground mb-2">
                Business
              </h3>
              <p className="text-foreground">{submission.business || '—'}</p>
            </Card>

            <Card className="p-6">
              <h3 className="text-sm font-semibold text-muted-foreground mb-2">
                Service
              </h3>
              <p className="text-foreground">{submission.service || '—'}</p>
            </Card>

            <Card className="p-6">
              <h3 className="text-sm font-semibold text-muted-foreground mb-2">
                Submitted
              </h3>
              <p className="text-foreground">
                {new Date(submission.created_at).toLocaleString()}
              </p>
            </Card>
          </div>
        </div>

        <div className="space-y-6">
          <SubmissionSyncStatus
            submission={submission}
            onRetry={retryClickUpSync}
          />

          <Card className="p-6">
            <h3 className="font-semibold mb-4">Update Status</h3>
            <form
              action={async (formData) => {
                'use server'
                await updateSubmissionStatus(id, formData)
              }}
              className="space-y-3"
            >
              {(['new', 'reviewed', 'archived'] as const).map((status) => (
                <label key={status} className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="radio"
                    name="status"
                    value={status}
                    defaultChecked={submission.status === status}
                    className="w-4 h-4"
                  />
                  <span className="capitalize text-sm">{status}</span>
                </label>
              ))}
              <button
                type="submit"
                className="w-full px-3 py-2 mt-4 bg-cyan-500/20 text-cyan-300 rounded font-semibold hover:bg-cyan-500/30 transition-colors"
              >
                Save Status
              </button>
            </form>
          </Card>
        </div>
      </div>
    </>
  )
}
