'use client'

import { useState, useTransition } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Zap, ChevronDown, ChevronUp, CheckCircle } from 'lucide-react'
import { triggerContentEngine } from '@/lib/actions/content'

const CONTENT_TYPES = [
  { value: 'auto', label: 'Let AI decide' },
  { value: 'blog', label: 'Blog Post' },
  { value: 'how-to', label: 'How-To Guide' },
]

const CATEGORIES = ['Auto', 'SEO', 'Business', 'Design', 'Marketing']

export function RunEnginePanel() {
  const [open, setOpen] = useState(false)
  const [type, setType] = useState('auto')
  const [topicHint, setTopicHint] = useState('')
  const [category, setCategory] = useState('auto')
  const [status, setStatus] = useState<'idle' | 'running' | 'success' | 'error'>('idle')
  const [errorMsg, setErrorMsg] = useState('')
  const [isPending, startTransition] = useTransition()

  function handleRun() {
    setStatus('running')
    setErrorMsg('')
    startTransition(async () => {
      try {
        await triggerContentEngine({ type, topicHint, category })
        setStatus('success')
        setTopicHint('')
        setTimeout(() => setStatus('idle'), 5000)
      } catch (err) {
        setErrorMsg(err instanceof Error ? err.message : 'Something went wrong')
        setStatus('error')
        setTimeout(() => setStatus('idle'), 5000)
      }
    })
  }

  return (
    <Card>
      <CardContent className="p-4">
        <button
          onClick={() => setOpen(!open)}
          className="flex w-full items-center justify-between text-left"
        >
          <div className="flex items-center gap-2">
            <Zap className="h-4 w-4 text-primary" />
            <span className="text-sm font-semibold">Run Engine</span>
            <span className="text-xs text-muted-foreground">Manually generate content</span>
          </div>
          {open ? <ChevronUp className="h-4 w-4 text-muted-foreground" /> : <ChevronDown className="h-4 w-4 text-muted-foreground" />}
        </button>

        {open && (
          <div className="mt-4 space-y-4">
            {/* Content type */}
            <div className="space-y-2">
              <Label className="text-xs">Content Type</Label>
              <div className="flex flex-wrap gap-2">
                {CONTENT_TYPES.map((ct) => (
                  <button
                    key={ct.value}
                    onClick={() => setType(ct.value)}
                    className={`px-3 py-1.5 text-xs rounded-md border transition-colors ${
                      type === ct.value
                        ? 'border-primary bg-primary/10 text-primary'
                        : 'border-border text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    {ct.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Topic hint */}
            <div className="space-y-2">
              <Label htmlFor="topic-hint" className="text-xs">Topic Hint (optional)</Label>
              <input
                id="topic-hint"
                value={topicHint}
                onChange={(e) => setTopicHint(e.target.value)}
                placeholder="Suggest a topic or keyword..."
                className="h-8 w-full text-xs px-3 rounded-md border border-input bg-background focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>

            {/* Category */}
            <div className="space-y-2">
              <Label htmlFor="category" className="text-xs">Category</Label>
              <select
                id="category"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="h-8 w-full text-xs px-3 rounded-md border border-input bg-background focus:outline-none focus:ring-1 focus:ring-primary"
              >
                {CATEGORIES.map((c) => (
                  <option key={c} value={c.toLowerCase()}>{c}</option>
                ))}
              </select>
            </div>

            {/* Run button + status */}
            <div className="flex items-center gap-3">
              <Button
                onClick={handleRun}
                disabled={isPending || status === 'running'}
                size="sm"
                className="gap-1.5"
              >
                <Zap className="h-3.5 w-3.5" />
                {status === 'running' ? 'Starting...' : 'Run Engine'}
              </Button>

              {status === 'success' && (
                <span className="flex items-center gap-1 text-xs text-green-400">
                  <CheckCircle className="h-3.5 w-3.5" />
                  Content generation started. Draft will appear in the queue when ready.
                </span>
              )}

              {status === 'error' && (
                <span className="text-xs text-red-400">{errorMsg}</span>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
