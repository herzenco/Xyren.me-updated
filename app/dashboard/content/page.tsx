import { createClient } from '@/lib/supabase/server'
import { PageHeader } from '@/components/dashboard/page-header'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { CheckCircle, XCircle, Clock, FileText, TrendingUp, RefreshCw, Eye } from 'lucide-react'
import { approveDraft, rejectDraft, requestDraftChanges } from '@/lib/actions/content'
import { RunEnginePanel } from '@/components/dashboard/run-engine-panel'
import Image from 'next/image'
import Link from 'next/link'

export default async function ContentDashboardPage() {
  const supabase = await createClient()
  const { data: drafts } = await (supabase as any)
    .from('content_drafts')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(50)

  const all = drafts ?? []
  const pending = all.filter((d: any) => ['pending', 'changes_requested'].includes(d.status))
  const published = all.filter((d: any) => d.status === 'published')
  const rejected = all.filter((d: any) => d.status === 'rejected')
  const avgSeo = all.length
    ? Math.round(all.reduce((a: number, d: any) => a + (d.seo_score ?? 0), 0) / all.length)
    : 0

  return (
    <div className="space-y-6 p-6">
      <PageHeader title="Content Board">
        <p className="text-sm text-muted-foreground">
          AI-generated drafts — review and approve before publishing
        </p>
      </PageHeader>

      {/* Manual trigger */}
      <RunEnginePanel />

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {[
          { label: 'Pending Review', value: pending.length, icon: Clock, color: 'text-yellow-500' },
          { label: 'Published', value: published.length, icon: CheckCircle, color: 'text-green-500' },
          { label: 'Total Drafts', value: all.length, icon: FileText, color: 'text-primary' },
          { label: 'Avg SEO Score', value: avgSeo, icon: TrendingUp, color: 'text-violet-400' },
        ].map(({ label, value, icon: Icon, color }) => (
          <Card key={label}>
            <CardContent className="flex items-center gap-3 pt-4 pb-4">
              <Icon className={`h-5 w-5 ${color}`} />
              <div>
                <p className="text-2xl font-bold">{value}</p>
                <p className="text-xs text-muted-foreground">{label}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Separator />

      {/* Pending queue */}
      <div className="space-y-4">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
          Pending Review ({pending.length})
        </h2>

        {pending.length === 0 && (
          <div className="rounded-xl border border-dashed p-10 text-center text-muted-foreground text-sm">
            No drafts pending. The content engine runs daily at 8:00 AM EST.
          </div>
        )}

        {pending.map((draft: any) => (
          <DraftCard key={draft.id} draft={draft} />
        ))}
      </div>

      {/* Published */}
      {published.length > 0 && (
        <>
          <Separator />
          <div className="space-y-3">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
              Published ({published.length})
            </h2>
            {published.slice(0, 10).map((draft: any) => (
              <DraftCard key={draft.id} draft={draft} compact />
            ))}
          </div>
        </>
      )}

      {/* Rejected */}
      {rejected.length > 0 && (
        <>
          <Separator />
          <div className="space-y-3">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
              Rejected ({rejected.length})
            </h2>
            {rejected.slice(0, 5).map((draft: any) => (
              <DraftCard key={draft.id} draft={draft} compact />
            ))}
          </div>
        </>
      )}
    </div>
  )
}

const statusStyles: Record<string, string> = {
  pending: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
  changes_requested: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  approved: 'bg-green-500/10 text-green-400 border-green-500/20',
  published: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  rejected: 'bg-red-500/10 text-red-400 border-red-500/20',
}

function SeoScoreBadge({ score }: { score: number | null }) {
  if (score === null) return <span className="text-muted-foreground text-sm">—</span>
  const color = score >= 80 ? 'text-green-400' : score >= 60 ? 'text-yellow-400' : 'text-red-400'
  return (
    <div className="text-right">
      <div className={`text-2xl font-extrabold ${color}`}>{score}</div>
      <div className="text-xs text-muted-foreground">SEO</div>
    </div>
  )
}

function DraftCard({ draft, compact = false }: { draft: any; compact?: boolean }) {
  const isPending = ['pending', 'changes_requested'].includes(draft.status)

  return (
    <Card className="overflow-hidden">
      <CardContent className="p-0">
        <div className="flex gap-4 p-4">
          {/* Cover image */}
          {draft.cover_image_url && !compact && (
            <div className="relative h-20 w-32 flex-shrink-0 overflow-hidden rounded-md">
              <Image src={draft.cover_image_url} alt={draft.title} fill className="object-cover" />
            </div>
          )}

          <div className="flex-1 min-w-0">
            {/* Header row */}
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-1.5 mb-1">
                  <Badge variant="outline" className="text-xs capitalize">{draft.type}</Badge>
                  {draft.category && (
                    <Badge variant="outline" className="text-xs capitalize">{draft.category}</Badge>
                  )}
                  <span className={`text-xs px-2 py-0.5 rounded border ${statusStyles[draft.status] ?? ''}`}>
                    {draft.status.replace('_', ' ')}
                  </span>
                  {draft.revision_count > 0 && (
                    <span className="text-xs text-muted-foreground flex items-center gap-0.5">
                      <RefreshCw className="h-2.5 w-2.5" /> {draft.revision_count}
                    </span>
                  )}
                </div>
                <Link href={`/dashboard/content/${draft.id}`} className="hover:text-primary transition-colors">
                  <h3 className="font-semibold text-sm leading-snug truncate">{draft.title}</h3>
                </Link>
                {!compact && draft.excerpt && (
                  <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{draft.excerpt}</p>
                )}
              </div>
              <SeoScoreBadge score={draft.seo_score} />
            </div>

            {/* Topic reasoning */}
            {!compact && draft.topic_reasoning && (
              <p className="text-xs text-muted-foreground mt-2 italic line-clamp-1">
                &ldquo;{draft.topic_reasoning}&rdquo;
              </p>
            )}

            {/* Actions */}
            <div className="flex flex-wrap items-center gap-2 mt-3">
              <Link href={`/dashboard/content/${draft.id}`}>
                <Button size="sm" variant="outline" className="h-7 text-xs gap-1">
                  <Eye className="h-3 w-3" /> View &amp; Edit
                </Button>
              </Link>

              {isPending && (
                <>
                  <form action={approveDraft.bind(null, draft.id)}>
                    <Button type="submit" size="sm" className="h-7 text-xs gap-1 bg-green-600 hover:bg-green-700 text-white">
                      <CheckCircle className="h-3 w-3" /> Approve &amp; Publish
                    </Button>
                  </form>

                  <form action={rejectDraft.bind(null, draft.id)}>
                    <Button type="submit" size="sm" variant="outline" className="h-7 text-xs gap-1 border-red-500/30 text-red-400 hover:bg-red-500/10">
                      <XCircle className="h-3 w-3" /> Reject
                    </Button>
                  </form>

                  <ChangesForm draftId={draft.id} />
                </>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

function ChangesForm({ draftId }: { draftId: string }) {
  async function handleSubmit(formData: FormData) {
    'use server'
    const changes = formData.get('changes') as string
    if (changes?.trim()) await requestDraftChanges(draftId, changes)
  }

  return (
    <form action={handleSubmit} className="flex gap-1.5 flex-1">
      <input
        name="changes"
        placeholder="Request changes..."
        className="h-7 text-xs px-2 rounded-md border border-input bg-background flex-1 min-w-0 focus:outline-none focus:ring-1 focus:ring-primary"
      />
      <Button type="submit" size="sm" variant="outline" className="h-7 text-xs flex-shrink-0">
        Revise
      </Button>
    </form>
  )
}
