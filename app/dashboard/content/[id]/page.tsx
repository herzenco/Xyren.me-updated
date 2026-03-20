import { createAdminClient } from '@/lib/supabase/admin'
import { notFound } from 'next/navigation'
import { PageHeader } from '@/components/dashboard/page-header'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'
import { DraftContentEditor } from '@/components/dashboard/draft-content-editor'
import { DraftActions } from '@/components/dashboard/draft-actions'

const statusStyles: Record<string, string> = {
  pending: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
  changes_requested: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  approved: 'bg-green-500/10 text-green-400 border-green-500/20',
  published: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  rejected: 'bg-red-500/10 text-red-400 border-red-500/20',
}

export default async function DraftDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = createAdminClient()

  const { data: draft } = await (supabase as any)
    .from('content_drafts')
    .select('*')
    .eq('id', id)
    .single()

  if (!draft) notFound()

  const isPending = ['pending', 'changes_requested'].includes(draft.status)

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center gap-3">
        <Link
          href="/dashboard/content"
          className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Back to Content Board
        </Link>
      </div>

      <PageHeader title={draft.title}>
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="outline" className="text-xs capitalize">{draft.type}</Badge>
          {draft.category && (
            <Badge variant="outline" className="text-xs capitalize">{draft.category}</Badge>
          )}
          <span className={`text-xs px-2 py-0.5 rounded border ${statusStyles[draft.status] ?? ''}`}>
            {draft.status.replace('_', ' ')}
          </span>
        </div>
      </PageHeader>

      <div className="grid gap-6 lg:grid-cols-[1fr_300px]">
        {/* Main content area */}
        <div className="space-y-4">
          {draft.cover_image_url && (
            <div className="relative h-48 w-full overflow-hidden rounded-lg">
              <Image src={draft.cover_image_url} alt={draft.title} fill className="object-cover" />
            </div>
          )}

          <DraftContentEditor
            draftId={draft.id}
            initialContent={draft.content ?? ''}
            initialTitle={draft.title}
            initialExcerpt={draft.excerpt ?? ''}
            editable={isPending}
          />

          {/* Actions */}
          {isPending && (
            <DraftActions draftId={draft.id} />
          )}
        </div>

        {/* Sidebar metadata */}
        <div className="space-y-4">
          {/* SEO Score */}
          <Card>
            <CardContent className="p-4 space-y-3">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">SEO</h3>
              <div className="flex items-center gap-4">
                <div>
                  <div className={`text-3xl font-extrabold ${
                    (draft.seo_score ?? 0) >= 80 ? 'text-green-400' : (draft.seo_score ?? 0) >= 60 ? 'text-yellow-400' : 'text-red-400'
                  }`}>{draft.seo_score ?? '—'}</div>
                  <div className="text-xs text-muted-foreground">SEO Score</div>
                </div>
                <div>
                  <div className={`text-3xl font-extrabold ${
                    (draft.readability_score ?? 0) >= 80 ? 'text-green-400' : (draft.readability_score ?? 0) >= 60 ? 'text-yellow-400' : 'text-red-400'
                  }`}>{draft.readability_score ?? '—'}</div>
                  <div className="text-xs text-muted-foreground">Readability</div>
                </div>
              </div>
              {draft.focus_keyword && (
                <div className="text-xs">
                  <span className="text-muted-foreground">Focus keyword:</span>{' '}
                  <span className="text-foreground">{draft.focus_keyword}</span>
                  {draft.keyword_density != null && (
                    <span className="text-muted-foreground"> ({draft.keyword_density}%)</span>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Meta */}
          <Card>
            <CardContent className="p-4 space-y-3">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Meta</h3>
              {draft.seo_title && (
                <div className="text-xs">
                  <span className="text-muted-foreground">SEO Title:</span>
                  <p className="text-foreground mt-0.5">{draft.seo_title}</p>
                </div>
              )}
              {draft.meta_description && (
                <div className="text-xs">
                  <span className="text-muted-foreground">Meta Description:</span>
                  <p className="text-foreground mt-0.5">{draft.meta_description}</p>
                </div>
              )}
              {draft.og_title && (
                <div className="text-xs">
                  <span className="text-muted-foreground">OG Title:</span>
                  <p className="text-foreground mt-0.5">{draft.og_title}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Details */}
          <Card>
            <CardContent className="p-4 space-y-3">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Details</h3>
              <div className="space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Slug</span>
                  <span className="text-foreground font-mono">{draft.slug}</span>
                </div>
                <Separator />
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Reading time</span>
                  <span className="text-foreground">{draft.reading_time ?? '—'} min</span>
                </div>
                <Separator />
                <div className="flex justify-between">
                  <span className="text-muted-foreground">AI Model</span>
                  <span className="text-foreground">{draft.ai_model ?? '—'}</span>
                </div>
                <Separator />
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Revisions</span>
                  <span className="text-foreground">{draft.revision_count ?? 0}</span>
                </div>
                {draft.created_at && (
                  <>
                    <Separator />
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Created</span>
                      <span className="text-foreground">{new Date(draft.created_at).toLocaleDateString()}</span>
                    </div>
                  </>
                )}
              </div>
              {draft.tags && draft.tags.length > 0 && (
                <div className="flex flex-wrap gap-1 pt-1">
                  {draft.tags.map((tag: string) => (
                    <Badge key={tag} variant="outline" className="text-[10px]">{tag}</Badge>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Topic reasoning */}
          {draft.topic_reasoning && (
            <Card>
              <CardContent className="p-4 space-y-2">
                <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">AI Reasoning</h3>
                <p className="text-xs text-muted-foreground italic">{draft.topic_reasoning}</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
