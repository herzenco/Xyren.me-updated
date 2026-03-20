'use client'

import { useState, useTransition } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Pencil, Save, X, CheckCircle } from 'lucide-react'
import { updateDraft } from '@/lib/actions/content'

export function DraftContentEditor({
  draftId,
  initialContent,
  initialTitle,
  initialExcerpt,
  editable,
}: {
  draftId: string
  initialContent: string
  initialTitle: string
  initialExcerpt: string
  editable: boolean
}) {
  const [editing, setEditing] = useState(false)
  const [title, setTitle] = useState(initialTitle)
  const [excerpt, setExcerpt] = useState(initialExcerpt)
  const [content, setContent] = useState(initialContent)
  const [status, setStatus] = useState<'idle' | 'saving' | 'saved'>('idle')
  const [isPending, startTransition] = useTransition()

  function handleSave() {
    setStatus('saving')
    startTransition(async () => {
      try {
        await updateDraft(draftId, { title, content, excerpt })
        setStatus('saved')
        setEditing(false)
        setTimeout(() => setStatus('idle'), 3000)
      } catch {
        setStatus('idle')
      }
    })
  }

  function handleCancel() {
    setTitle(initialTitle)
    setExcerpt(initialExcerpt)
    setContent(initialContent)
    setEditing(false)
  }

  return (
    <Card>
      <CardContent className="p-4 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Content</h3>
          <div className="flex items-center gap-2">
            {status === 'saved' && (
              <span className="flex items-center gap-1 text-xs text-green-400">
                <CheckCircle className="h-3 w-3" /> Saved
              </span>
            )}
            {editable && !editing && (
              <Button variant="outline" size="sm" className="h-7 text-xs gap-1" onClick={() => setEditing(true)}>
                <Pencil className="h-3 w-3" /> Edit
              </Button>
            )}
            {editing && (
              <>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-7 text-xs gap-1"
                  onClick={handleCancel}
                  disabled={isPending}
                >
                  <X className="h-3 w-3" /> Cancel
                </Button>
                <Button
                  size="sm"
                  className="h-7 text-xs gap-1"
                  onClick={handleSave}
                  disabled={isPending}
                >
                  <Save className="h-3 w-3" /> {isPending ? 'Saving...' : 'Save'}
                </Button>
              </>
            )}
          </div>
        </div>

        {editing ? (
          <div className="space-y-3">
            <div className="space-y-1">
              <label className="text-xs text-muted-foreground">Title</label>
              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="h-8 w-full text-sm px-3 rounded-md border border-input bg-background font-semibold focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs text-muted-foreground">Excerpt</label>
              <input
                value={excerpt}
                onChange={(e) => setExcerpt(e.target.value)}
                className="h-8 w-full text-xs px-3 rounded-md border border-input bg-background focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs text-muted-foreground">MDX Content</label>
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                rows={30}
                className="w-full text-xs px-3 py-2 rounded-md border border-input bg-background font-mono leading-relaxed resize-y focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>
          </div>
        ) : (
          <div className="prose prose-invert prose-sm max-w-none">
            {initialExcerpt && (
              <p className="text-sm text-muted-foreground italic border-l-2 border-primary/30 pl-3 mb-4">
                {initialExcerpt}
              </p>
            )}
            <div className="whitespace-pre-wrap text-sm leading-relaxed">{initialContent}</div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
