import { PageHeader } from '@/components/dashboard/page-header'
import {
  getCoreMetrics,
  getVisitorTrends,
  getTopPages,
  getTrafficSource,
  getDeviceBreakdown,
  getGeographicData,
  isGa4Configured,
} from '@/lib/ga4'
import { Users, Eye, TrendingUp, BarChart3, Globe, Smartphone } from 'lucide-react'

export const revalidate = 3600 // Revalidate every hour

interface DateRangeOption {
  label: string
  days: number
}

const dateRanges: DateRangeOption[] = [
  { label: 'Last 7 days', days: 7 },
  { label: 'Last 30 days', days: 30 },
  { label: 'Last 90 days', days: 90 },
]

interface PageProps {
  searchParams: Promise<{ range?: string }>
}

export default async function AnalyticsPage({ searchParams }: PageProps) {
  if (!isGa4Configured()) {
    return (
      <>
        <PageHeader title="Analytics" />
        <div className="mt-12 rounded-xl border border-dashed border-border p-12 text-center">
          <BarChart3 className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <h2 className="text-xl font-semibold mb-2">GA4 not configured</h2>
          <p className="text-muted-foreground text-sm max-w-sm mx-auto mb-4">
            Add the following environment variables to connect Google Analytics 4:
          </p>
          <pre className="inline-block text-left bg-secondary rounded-lg px-6 py-4 text-xs text-muted-foreground">
{`NEXT_PUBLIC_GA4_PROPERTY_ID=
GA4_CLIENT_EMAIL=
GA4_PRIVATE_KEY=
GA4_PROJECT_ID=          # optional`}
          </pre>
        </div>
      </>
    )
  }

  const params = await searchParams
  const rangeParam = params.range || '7'
  const selectedRange = parseInt(rangeParam)

  // Fetch all GA4 data in parallel
  const [metrics, trends, topPages, trafficSource, deviceBreakdown, geographic] = await Promise.all([
    getCoreMetrics(selectedRange),
    getVisitorTrends(selectedRange),
    getTopPages(selectedRange, 10),
    getTrafficSource(selectedRange),
    getDeviceBreakdown(selectedRange),
    getGeographicData(selectedRange, 10),
  ])

  return (
    <>
      <PageHeader title="Analytics" />

      {/* Date Range Selector */}
      <div className="mb-8 flex gap-2">
        {dateRanges.map((range) => (
          <a
            key={range.days}
            href={`/dashboard/analytics?range=${range.days}`}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              selectedRange === range.days
                ? 'bg-cyan-500/20 text-cyan-300'
                : 'bg-secondary text-muted-foreground hover:text-foreground'
            }`}
          >
            {range.label}
          </a>
        ))}
      </div>

      {/* Core Metrics */}
      {metrics && (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-5 mb-8">
          <div className="glass rounded-lg border border-border bg-gradient-to-br from-blue-500/10 to-blue-500/5 p-6">
            <div className="flex items-start justify-between mb-2">
              <p className="text-sm font-medium text-muted-foreground">Visitors</p>
              <Users className="h-5 w-5 text-blue-400" />
            </div>
            <p className="text-3xl font-bold text-foreground">{metrics.users}</p>
            <p className="text-xs text-muted-foreground mt-1">Active users</p>
          </div>

          <div className="glass rounded-lg border border-border bg-gradient-to-br from-cyan-500/10 to-cyan-500/5 p-6">
            <div className="flex items-start justify-between mb-2">
              <p className="text-sm font-medium text-muted-foreground">Sessions</p>
              <TrendingUp className="h-5 w-5 text-cyan-400" />
            </div>
            <p className="text-3xl font-bold text-foreground">{metrics.sessions}</p>
            <p className="text-xs text-muted-foreground mt-1">Total sessions</p>
          </div>

          <div className="glass rounded-lg border border-border bg-gradient-to-br from-violet-500/10 to-violet-500/5 p-6">
            <div className="flex items-start justify-between mb-2">
              <p className="text-sm font-medium text-muted-foreground">Page Views</p>
              <Eye className="h-5 w-5 text-violet-400" />
            </div>
            <p className="text-3xl font-bold text-foreground">{metrics.pageViews}</p>
            <p className="text-xs text-muted-foreground mt-1">Total views</p>
          </div>

          <div className="glass rounded-lg border border-border bg-gradient-to-br from-amber-500/10 to-amber-500/5 p-6">
            <div className="flex items-start justify-between mb-2">
              <p className="text-sm font-medium text-muted-foreground">Bounce Rate</p>
              <BarChart3 className="h-5 w-5 text-amber-400" />
            </div>
            <p className="text-3xl font-bold text-foreground">{metrics.bounceRate}%</p>
            <p className="text-xs text-muted-foreground mt-1">Bounce percentage</p>
          </div>

          <div className="glass rounded-lg border border-border bg-gradient-to-br from-emerald-500/10 to-emerald-500/5 p-6">
            <div className="flex items-start justify-between mb-2">
              <p className="text-sm font-medium text-muted-foreground">Avg. Duration</p>
              <Smartphone className="h-5 w-5 text-emerald-400" />
            </div>
            <p className="text-3xl font-bold text-foreground">{metrics.avgSessionDuration}s</p>
            <p className="text-xs text-muted-foreground mt-1">Per session</p>
          </div>
        </div>
      )}

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Top Pages */}
        <div className="rounded-lg border border-border bg-card p-6">
          <h3 className="font-semibold mb-4 flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-cyan-400" />
            Top Pages
          </h3>
          <div className="space-y-3">
            {topPages && topPages.length > 0 ? (
              topPages.map((page, i) => (
                <div key={i} className="flex items-center justify-between">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm truncate text-foreground font-medium">{page.page}</p>
                    <p className="text-xs text-muted-foreground">{page.users} users</p>
                  </div>
                  <p className="text-sm font-semibold text-cyan-300 ml-4">{page.views}</p>
                </div>
              ))
            ) : (
              <p className="text-sm text-muted-foreground">No data available</p>
            )}
          </div>
        </div>

        {/* Traffic Source */}
        <div className="rounded-lg border border-border bg-card p-6">
          <h3 className="font-semibold mb-4 flex items-center gap-2">
            <Globe className="h-5 w-5 text-violet-400" />
            Traffic Source
          </h3>
          <div className="space-y-3">
            {trafficSource && trafficSource.length > 0 ? (
              trafficSource.map((source, i) => (
                <div key={i} className="flex items-center justify-between">
                  <div className="flex-1">
                    <p className="text-sm text-foreground font-medium capitalize">{source.source}</p>
                    <p className="text-xs text-muted-foreground">{source.sessions} sessions</p>
                  </div>
                  <p className="text-sm font-semibold text-violet-300 ml-4">{source.users}</p>
                </div>
              ))
            ) : (
              <p className="text-sm text-muted-foreground">No data available</p>
            )}
          </div>
        </div>

        {/* Device Breakdown */}
        <div className="rounded-lg border border-border bg-card p-6">
          <h3 className="font-semibold mb-4 flex items-center gap-2">
            <Smartphone className="h-5 w-5 text-emerald-400" />
            Device Breakdown
          </h3>
          <div className="space-y-3">
            {deviceBreakdown && deviceBreakdown.length > 0 ? (
              deviceBreakdown.map((device, i) => {
                const total = deviceBreakdown.reduce((sum, d) => sum + d.users, 0)
                const percentage = ((device.users / total) * 100).toFixed(1)
                return (
                  <div key={i}>
                    <div className="flex justify-between mb-1">
                      <p className="text-sm text-foreground font-medium capitalize">{device.device}</p>
                      <p className="text-sm text-emerald-300 font-semibold">{percentage}%</p>
                    </div>
                    <div className="w-full bg-secondary rounded-full h-2">
                      <div
                        className="bg-gradient-to-r from-emerald-500 to-emerald-600 h-2 rounded-full"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                )
              })
            ) : (
              <p className="text-sm text-muted-foreground">No data available</p>
            )}
          </div>
        </div>

        {/* Geographic Data */}
        <div className="rounded-lg border border-border bg-card p-6">
          <h3 className="font-semibold mb-4 flex items-center gap-2">
            <Globe className="h-5 w-5 text-blue-400" />
            Top Countries
          </h3>
          <div className="space-y-2">
            {geographic && geographic.length > 0 ? (
              geographic.slice(0, 8).map((country, i) => (
                <div key={i} className="flex items-center justify-between text-sm">
                  <p className="text-foreground">{country.country}</p>
                  <p className="text-blue-300 font-semibold">{country.users}</p>
                </div>
              ))
            ) : (
              <p className="text-sm text-muted-foreground">No data available</p>
            )}
          </div>
        </div>
      </div>

      {/* Recent Trends */}
      {trends && trends.length > 0 && (
        <div className="rounded-lg border border-border bg-card p-6">
          <h3 className="font-semibold mb-4">Visitor Trends</h3>
          <div className="space-y-2">
            <div className="flex justify-between text-xs text-muted-foreground mb-4">
              <span>Date</span>
              <span>Users</span>
              <span>Sessions</span>
            </div>
            {trends.map((day, i) => (
              <div key={i} className="flex justify-between items-center text-sm py-2 border-b border-border last:border-b-0">
                <span className="text-muted-foreground">{day.date}</span>
                <span className="text-cyan-300 font-medium">{day.users}</span>
                <span className="text-violet-300 font-medium">{day.sessions}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </>
  )
}
