'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { analyzePageSeo } from '@/lib/actions/seo-ai'
import type { SeoSuggestion } from '@/lib/actions/seo-ai'
import { Button } from '@/components/ui/button'
import { Sparkles, Loader2, ChevronDown, ChevronUp } from 'lucide-react'

const priorityStyles = {
  high: 'bg-red-500/10 text-red-400 border border-red-500/20',
  medium: 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20',
  low: 'bg-blue-500/10 text-blue-400 border border-blue-500/20',
}

interface Props {
  pageId: string
  initialSuggestions: SeoSuggestion | null
}

export function SeoSuggestions({ pageId, initialSuggestions }: Props) {
  const router = useRouter()
  const [expanded, setExpanded] = useState(!!initialSuggestions)
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)

  function handleAnalyze() {
    setError(null)
    startTransition(async () => {
      try {
        await analyzePageSeo(pageId)
        router.refresh()
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Analysis failed')
      }
    })
  }

  if (!initialSuggestions) {
    return (
      <div className="mt-3 flex items-center gap-2">
        <Button
          size="sm"
          variant="outline"
          className="h-7 text-xs gap-1.5 border-violet-500/30 text-violet-400 hover:bg-violet-500/10"
          onClick={handleAnalyze}
          disabled={isPending}
        >
          {isPending ? (
            <Loader2 className="h-3 w-3 animate-spin" />
          ) : (
            <Sparkles className="h-3 w-3" />
          )}
          {isPending ? 'Analyzing...' : 'Analyze with AI'}
        </Button>
        {error && <p className="text-xs text-red-400">{error}</p>}
      </div>
    )
  }

  return (
    <div className="mt-3 border-t border-border pt-3">
      <button
        className="flex items-center gap-1.5 text-xs font-semibold text-violet-400 hover:text-violet-300 transition-colors mb-2"
        onClick={() => setExpanded((e) => !e)}
      >
        <Sparkles className="h-3 w-3" />
        AI Suggestions
        {expanded ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
      </button>

      {expanded && (
        <div className="space-y-3">
          <div className="space-y-2">
            <div className="rounded-md bg-secondary/50 p-2">
              <p className="text-xs text-muted-foreground mb-0.5">Suggested title</p>
              <p className="text-xs font-medium text-foreground">{initialSuggestions.suggested_title}</p>
            </div>
            <div className="rounded-md bg-secondary/50 p-2">
              <p className="text-xs text-muted-foreground mb-0.5">Suggested description</p>
              <p className="text-xs text-foreground">{initialSuggestions.suggested_description}</p>
            </div>
          </div>

          <div className="space-y-1.5">
            {initialSuggestions.fixes.map((fix, i) => (
              <div key={i} className="rounded-md border border-border p-2">
                <div className="flex items-center gap-2 mb-1">
                  <span className={`text-xs px-1.5 py-0.5 rounded font-medium ${priorityStyles[fix.priority]}`}>
                    {fix.priority}
                  </span>
                  <span className="text-xs text-muted-foreground truncate">{fix.issue}</span>
                </div>
                <p className="text-xs text-foreground">{fix.fix}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      <Button
        size="sm"
        variant="ghost"
        className="h-6 text-xs text-muted-foreground gap-1 mt-2"
        onClick={handleAnalyze}
        disabled={isPending}
      >
        {isPending ? <Loader2 className="h-3 w-3 animate-spin" /> : <Sparkles className="h-3 w-3" />}
        Re-analyze
      </Button>
      {error && <p className="text-xs text-red-400 mt-1">{error}</p>}
    </div>
  )
}
