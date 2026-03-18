import { createClient } from '@/lib/supabase/server'
import { PageHeader } from '@/components/dashboard/page-header'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { CheckCircle, XCircle, AlertTriangle, Globe, RefreshCw } from 'lucide-react'
import { triggerSeoAudit } from '@/lib/actions/seo'

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
}

function StatusBadge({ code }: { code: number }) {
  if (code === 0) return <Badge variant="destructive">Timeout</Badge>
  if (code >= 400) return <Badge variant="destructive">{code}</Badge>
  if (code >= 300) return <Badge variant="secondary">{code}</Badge>
  return <Badge className="bg-green-500/20 text-green-400 border-green-500/30">{code}</Badge>
}

function IssueBadge({ count }: { count: number }) {
  if (count === 0) return <CheckCircle className="h-4 w-4 text-green-500" />
  if (count <= 2) return (
    <span className="flex items-center gap-1 text-yellow-500 text-sm">
      <AlertTriangle className="h-4 w-4" /> {count}
    </span>
  )
  return (
    <span className="flex items-center gap-1 text-red-500 text-sm">
      <XCircle className="h-4 w-4" /> {count}
    </span>
  )
}

export default async function SeoDashboardPage() {
  const supabase = await createClient()
  const { data: rows } = await (supabase as any)
    .from('seo_audit_log')
    .select('*')
    .order('last_checked_at', { ascending: false })

  const pages: AuditRow[] = rows ?? []
  const total = pages.length
  const withIssues = pages.filter((p) => p.issues?.length > 0).length
  const indexed = pages.filter((p) => p.indexed).length
  const notIndexed = pages.filter((p) => !p.indexed && p.status_code > 0).length
  const lastChecked = pages[0]?.last_checked_at
    ? new Date(pages[0].last_checked_at).toLocaleDateString('en-US', {
        month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit',
      })
    : null

  const pagesWithIssues = pages
    .filter((p) => p.issues?.length > 0)
    .sort((a, b) => b.issues.length - a.issues.length)

  return (
    <div className="space-y-6 p-6">
      <PageHeader title="SEO Audit">
        <div className="flex items-center gap-3">
          {lastChecked && (
            <p className="text-sm text-muted-foreground">Last run: {lastChecked}</p>
          )}
          <form action={triggerSeoAudit}>
            <Button type="submit" size="sm" variant="outline" className="gap-2">
              <RefreshCw className="h-4 w-4" />
              Run Audit Now
            </Button>
          </form>
        </div>
      </PageHeader>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {[
          { label: 'Total Pages', value: total, icon: Globe, color: 'text-primary' },
          { label: 'With Issues', value: withIssues, icon: AlertTriangle, color: 'text-yellow-500' },
          { label: 'Indexed', value: indexed, icon: CheckCircle, color: 'text-green-500' },
          { label: 'Not Indexed', value: notIndexed, icon: XCircle, color: 'text-red-500' },
        ].map(({ label, value, icon: Icon, color }) => (
          <Card key={label}>
            <CardContent className="p-4 flex items-center gap-3">
              <Icon className={`h-8 w-8 ${color}`} />
              <div>
                <p className="text-2xl font-bold">{value}</p>
                <p className="text-xs text-muted-foreground">{label}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {total === 0 ? (
        <Card>
          <CardContent className="py-16 text-center">
            <Globe className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground mb-4">No audit data yet. Run your first audit to see results.</p>
            <form action={triggerSeoAudit}>
              <Button type="submit" className="gap-2">
                <RefreshCw className="h-4 w-4" />
                Run First Audit
              </Button>
            </form>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Pages with issues */}
          {pagesWithIssues.length > 0 && (
            <div className="space-y-3">
              <h2 className="text-lg font-semibold flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-yellow-500" />
                Pages with Issues ({pagesWithIssues.length})
              </h2>
              <div className="space-y-2">
                {pagesWithIssues.map((page) => (
                  <Card key={page.id} className="border-yellow-500/20">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between gap-4 mb-2">
                        <a
                          href={page.page_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm font-medium text-primary hover:underline truncate max-w-xl"
                        >
                          {page.page_url}
                        </a>
                        <StatusBadge code={page.status_code} />
                      </div>
                      <ul className="mt-2 space-y-1">
                        {page.issues.map((issue, i) => (
                          <li key={i} className="text-xs text-yellow-500 flex items-center gap-1.5">
                            <AlertTriangle className="h-3 w-3 flex-shrink-0" />
                            {issue}
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* All pages table */}
          <div className="space-y-3">
            <h2 className="text-lg font-semibold">All Pages ({total})</h2>
            <Card>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b bg-secondary/30">
                      <th className="text-left px-4 py-3 font-medium text-muted-foreground">URL</th>
                      <th className="text-center px-4 py-3 font-medium text-muted-foreground">Status</th>
                      <th className="text-center px-4 py-3 font-medium text-muted-foreground">Indexed</th>
                      <th className="text-center px-4 py-3 font-medium text-muted-foreground">Issues</th>
                      <th className="text-left px-4 py-3 font-medium text-muted-foreground">Canonical</th>
                    </tr>
                  </thead>
                  <tbody>
                    {pages.map((page) => (
                      <tr key={page.id} className="border-b last:border-0 hover:bg-secondary/20">
                        <td className="px-4 py-3">
                          <a
                            href={page.page_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-primary hover:underline text-xs truncate block max-w-xs"
                          >
                            {page.page_url.replace(/^https?:\/\/[^/]+/, '')}
                          </a>
                          {page.meta_title && (
                            <p className="text-xs text-muted-foreground truncate max-w-xs mt-0.5">
                              {page.meta_title}
                            </p>
                          )}
                        </td>
                        <td className="px-4 py-3 text-center">
                          <StatusBadge code={page.status_code} />
                        </td>
                        <td className="px-4 py-3 text-center">
                          {page.indexed
                            ? <CheckCircle className="h-4 w-4 text-green-500 mx-auto" />
                            : <XCircle className="h-4 w-4 text-red-500 mx-auto" />
                          }
                        </td>
                        <td className="px-4 py-3 text-center">
                          <IssueBadge count={page.issues?.length ?? 0} />
                        </td>
                        <td className="px-4 py-3">
                          {page.canonical_url
                            ? <CheckCircle className="h-4 w-4 text-green-500" />
                            : <XCircle className="h-4 w-4 text-red-500" />
                          }
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          </div>
        </>
      )}
    </div>
  )
}
