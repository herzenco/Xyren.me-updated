'use client'

import { useEffect, useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { generateSeoReport } from '@/lib/actions/seo-report'
import { Loader2, RefreshCw, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface Props {
  autoGenerate?: boolean
}

export function ReportGenerator({ autoGenerate = false }: Props) {
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()
  const router = useRouter()

  function generate() {
    setError(null)
    startTransition(async () => {
      try {
        await generateSeoReport()
        router.refresh()
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Generation failed')
      }
    })
  }

  useEffect(() => {
    if (autoGenerate) generate()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  if (isPending) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
        <Loader2 className="h-10 w-10 animate-spin text-cyan-400" />
        <p className="text-lg font-medium">Generating your SEO audit report...</p>
        <p className="text-sm text-muted-foreground">Claude is analyzing your site data. This takes about 30 seconds.</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
        <AlertCircle className="h-10 w-10 text-red-400" />
        <p className="text-lg font-medium">Report generation failed</p>
        <p className="text-sm text-muted-foreground max-w-sm text-center">{error}</p>
        <Button onClick={generate} variant="outline" className="gap-2">
          <RefreshCw className="h-4 w-4" />
          Try Again
        </Button>
      </div>
    )
  }

  // Shown as the Regenerate button when a report already exists
  return (
    <Button onClick={generate} size="sm" variant="outline" className="gap-2 print:hidden">
      <RefreshCw className="h-4 w-4" />
      Regenerate Report
    </Button>
  )
}
