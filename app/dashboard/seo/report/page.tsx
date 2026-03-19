import { createClient } from '@/lib/supabase/server'
import { PrintTrigger, PrintButton } from '@/components/dashboard/seo-report-print'
import { CheckCircle, XCircle, AlertTriangle } from 'lucide-react'
import type { SeoSuggestion } from '@/lib/actions/seo-ai'

type AuditRow = {
  id: string
  page_url: string
  status_code: number
  indexed: boolean
  canonical_url: string | null
  meta_title: string | null
  meta_description: string | null
  issues: string[]
  last_checked_at: string
  ai_suggestions: SeoSuggestion | null
}

export default async function SeoReportPage({
  searchParams,
}: {
  searchParams: Promise<{ print?: string }>
}) {
  const supabase = await createClient()
  const { data: rows } = await (supabase as any)
    .from('seo_audit_log')
    .select('*')
    .order('last_checked_at', { ascending: false })

  const pages: AuditRow[] = rows ?? []
  const total = pages.length
  const withIssues = pages.filter((p) => p.issues?.length > 0).length
  const indexed = pages.filter((p) => p.indexed).length
  const notIndexed = pages.filter((p) => !p.indexed).length
  const generatedAt = new Date().toLocaleDateString('en-US', {
    month: 'long', day: 'numeric', year: 'numeric',
  })
  const pagesWithIssues = pages
    .filter((p) => p.issues?.length > 0)
    .sort((a, b) => b.issues.length - a.issues.length)

  const params = await searchParams
  const autoPrint = params.print === '1'

  return (
    <>
      {autoPrint && <PrintTrigger />}
      <div className="max-w-4xl mx-auto p-8 font-sans text-foreground">
        {/* Header */}
        <div className="flex items-start justify-between mb-8 pb-6 border-b border-border">
          <div>
            <h1 className="text-2xl font-bold mb-1">SEO Audit Report</h1>
            <p className="text-sm text-muted-foreground">Xyren.me · Generated {generatedAt}</p>
          </div>
          <PrintButton />
        </div>

        {/* Stats */}
        <div className="grid grid-cols-4 gap-4 mb-8">
          {[
            { label: 'Total Pages', value: total },
            { label: 'With Issues', value: withIssues },
            { label: 'Indexed', value: indexed },
            { label: 'Not Indexed', value: notIndexed },
          ].map(({ label, value }) => (
            <div key={label} className="border border-border rounded-lg p-4 text-center">
              <p className="text-3xl font-bold">{value}</p>
              <p className="text-xs text-muted-foreground mt-1">{label}</p>
            </div>
          ))}
        </div>

        {/* Pages with issues + AI suggestions */}
        {pagesWithIssues.length > 0 && (
          <div className="mb-8">
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-yellow-500" />
              Pages Requiring Attention ({pagesWithIssues.length})
            </h2>
            <div className="space-y-4">
              {pagesWithIssues.map((page) => (
                <div key={page.id} className="border border-border rounded-lg p-4 break-inside-avoid">
                  <div className="flex items-start justify-between gap-4 mb-2">
                    <p className="text-sm font-medium text-primary break-all">{page.page_url}</p>
                    <span className="text-xs px-2 py-0.5 rounded bg-secondary text-muted-foreground flex-shrink-0">
                      {page.status_code}
                    </span>
                  </div>
                  <ul className="space-y-1 mb-3">
                    {page.issues.map((issue, i) => (
                      <li key={i} className="text-xs text-yellow-500 flex items-center gap-1.5">
                        <AlertTriangle className="h-3 w-3 flex-shrink-0" />
                        {issue}
                      </li>
                    ))}
                  </ul>
                  {page.ai_suggestions && (
                    <div className="border-t border-border pt-3 mt-2 space-y-2">
                      <p className="text-xs font-semibold text-violet-400">AI Recommendations</p>
                      <div className="bg-secondary/50 rounded p-2">
                        <p className="text-xs text-muted-foreground">Suggested title</p>
                        <p className="text-xs font-medium">{page.ai_suggestions.suggested_title}</p>
                      </div>
                      <div className="bg-secondary/50 rounded p-2">
                        <p className="text-xs text-muted-foreground">Suggested description</p>
                        <p className="text-xs">{page.ai_suggestions.suggested_description}</p>
                      </div>
                      {page.ai_suggestions.fixes.map((fix, i) => (
                        <div key={i} className="flex gap-2 text-xs">
                          <span className={`flex-shrink-0 px-1.5 py-0.5 rounded font-medium ${
                            fix.priority === 'high' ? 'bg-red-500/10 text-red-400' :
                            fix.priority === 'medium' ? 'bg-yellow-500/10 text-yellow-400' :
                            'bg-blue-500/10 text-blue-400'
                          }`}>
                            {fix.priority}
                          </span>
                          <span>{fix.fix}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Full pages table */}
        <div>
          <h2 className="text-lg font-semibold mb-4">All Pages ({total})</h2>
          <table className="w-full text-xs border-collapse">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left py-2 pr-4 font-medium text-muted-foreground">URL</th>
                <th className="text-center py-2 px-2 font-medium text-muted-foreground">Status</th>
                <th className="text-center py-2 px-2 font-medium text-muted-foreground">Indexed</th>
                <th className="text-center py-2 px-2 font-medium text-muted-foreground">Issues</th>
                <th className="text-center py-2 pl-2 font-medium text-muted-foreground">Canonical</th>
              </tr>
            </thead>
            <tbody>
              {pages.map((page) => (
                <tr key={page.id} className="border-b border-border/50">
                  <td className="py-2 pr-4">
                    <p className="truncate max-w-xs">{page.page_url.replace(/^https?:\/\/[^/]+/, '') || '/'}</p>
                    {page.meta_title && (
                      <p className="text-muted-foreground truncate max-w-xs">{page.meta_title}</p>
                    )}
                  </td>
                  <td className="py-2 px-2 text-center">{page.status_code || 'ERR'}</td>
                  <td className="py-2 px-2 text-center">
                    {page.indexed
                      ? <CheckCircle className="h-3 w-3 text-green-500 mx-auto" />
                      : <XCircle className="h-3 w-3 text-red-500 mx-auto" />
                    }
                  </td>
                  <td className="py-2 px-2 text-center">{page.issues?.length ?? 0}</td>
                  <td className="py-2 pl-2 text-center">
                    {page.canonical_url
                      ? <CheckCircle className="h-3 w-3 text-green-500 mx-auto" />
                      : <XCircle className="h-3 w-3 text-red-500 mx-auto" />
                    }
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <style>{`
          @media print {
            @page { margin: 1.5cm; }
            .print\\:hidden { display: none !important; }
            .break-inside-avoid { break-inside: avoid; }
            body { background: white !important; color: black !important; }
          }
        `}</style>
      </div>
    </>
  )
}
