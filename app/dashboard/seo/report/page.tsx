import { createAdminClient } from '@/lib/supabase/admin'
import { PrintTrigger, PrintButton } from '@/components/dashboard/seo-report-print'
import { ReportGenerator } from '@/components/dashboard/seo-report-generator'

type StatsSnapshot = {
  total_pages: number
  pages_with_issues: number
  indexed: number
  not_indexed: number
  health_score: number
  audit_date: string
}

type SeoReport = {
  id: string
  generated_at: string
  report_html: string
  stats_snapshot: StatsSnapshot
}

export default async function SeoReportPage({
  searchParams,
}: {
  searchParams: Promise<{ print?: string }>
}) {
  const supabase = createAdminClient()
  const { data, error: queryError } = await (supabase as any)
    .from('seo_reports')
    .select('id, generated_at, report_html, stats_snapshot')
    .order('generated_at', { ascending: false })
    .limit(1)
    .single()

  // PGRST116 = no rows found, 42P01 = table doesn't exist — treat both as null
  const benignCodes = ['PGRST116', '42P01']
  if (queryError && !benignCodes.includes(queryError.code)) {
    throw new Error(`Failed to load SEO report: ${queryError.message}`)
  }

  const report = data as SeoReport | null
  const params = await searchParams
  const autoPrint = params.print === '1'

  // No report exists — auto-generate
  if (!report) {
    return (
      <div className="min-h-screen bg-white text-gray-900">
        <ReportGenerator autoGenerate />
      </div>
    )
  }

  const generatedAt = new Date(report.generated_at).toLocaleString('en-US', {
    month: 'long', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit',
  })

  const score = report.stats_snapshot.health_score
  const scoreColor = score >= 90 ? '#16a34a' : score >= 75 ? '#2563eb' : score >= 50 ? '#d97706' : '#dc2626'
  const scoreLabel = score >= 90 ? 'Excellent' : score >= 75 ? 'Good' : score >= 50 ? 'Needs Attention' : 'Critical'

  return (
    <>
      {autoPrint && <PrintTrigger />}
      <div className="seo-report min-h-screen bg-white text-gray-900">

        {/* Page header — hidden on print */}
        <div className="print:hidden bg-gray-50 border-b border-gray-200 px-8 py-4 flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-500">SEO Audit Report · Generated {generatedAt}</p>
          </div>
          <div className="flex items-center gap-3">
            <ReportGenerator />
            <PrintButton />
          </div>
        </div>

        <div className="max-w-3xl mx-auto px-8 py-10">

          {/* Cover */}
          <div className="mb-10 pb-8 border-b border-gray-200">
            <p className="text-sm font-semibold uppercase tracking-widest text-gray-400 mb-2">SEO Audit Report</p>
            <h1 className="text-4xl font-bold text-gray-900 mb-1">Xyren.me</h1>
            <p className="text-gray-500">{generatedAt}</p>

            {/* Health score */}
            <div className="mt-6 inline-flex items-center gap-4 border border-gray-200 rounded-xl px-6 py-4">
              <div>
                <p className="text-5xl font-extrabold" style={{ color: scoreColor }}>{score}</p>
                <p className="text-xs text-gray-400 mt-0.5">out of 100</p>
              </div>
              <div>
                <p className="text-lg font-semibold text-gray-900">{scoreLabel}</p>
                <p className="text-sm text-gray-500">Overall SEO Health</p>
              </div>
            </div>
          </div>

          {/* Claude-generated report content */}
          <div
            className="report-content"
            dangerouslySetInnerHTML={{ __html: report.report_html }}
          />

        </div>

        <style>{`
          /* Report typography */
          .report-content { font-size: 0.9rem; line-height: 1.7; color: #1f2937; }
          .report-content h2.report-section-heading {
            font-size: 1.25rem; font-weight: 700; color: #111827;
            margin: 2.5rem 0 1rem; padding-bottom: 0.5rem;
            border-bottom: 2px solid #e5e7eb;
          }
          .report-content h3.report-issue-heading {
            font-size: 1rem; font-weight: 600; color: #1f2937;
            margin: 1.5rem 0 0.5rem;
          }
          .report-content p { margin: 0.75rem 0; }
          .report-content ul.report-page-list {
            list-style: none; padding: 0; margin: 0.5rem 0;
            display: flex; flex-wrap: wrap; gap: 0.375rem;
          }
          .report-content ul.report-page-list li {
            font-family: monospace; font-size: 0.75rem;
            background: #f3f4f6; border: 1px solid #e5e7eb;
            border-radius: 4px; padding: 0.125rem 0.5rem; color: #374151;
          }
          .report-content ol.report-fix-steps {
            padding-left: 1.5rem; margin: 0.5rem 0;
          }
          .report-content ol.report-fix-steps li { margin: 0.375rem 0; }
          .report-content .report-badge-critical {
            display: inline-block; font-size: 0.7rem; font-weight: 700;
            text-transform: uppercase; letter-spacing: 0.05em;
            background: #fee2e2; color: #b91c1c;
            border: 1px solid #fecaca; border-radius: 4px;
            padding: 0.125rem 0.5rem; margin-right: 0.5rem;
          }
          .report-content .report-badge-warning {
            display: inline-block; font-size: 0.7rem; font-weight: 700;
            text-transform: uppercase; letter-spacing: 0.05em;
            background: #fef3c7; color: #b45309;
            border: 1px solid #fde68a; border-radius: 4px;
            padding: 0.125rem 0.5rem; margin-right: 0.5rem;
          }
          .report-content .report-badge-pass {
            display: inline-block; font-size: 0.7rem; font-weight: 700;
            text-transform: uppercase; letter-spacing: 0.05em;
            background: #dcfce7; color: #15803d;
            border: 1px solid #bbf7d0; border-radius: 4px;
            padding: 0.125rem 0.5rem; margin-right: 0.5rem;
          }

          /* Print */
          @media print {
            @page { margin: 2cm; }
            .print\\:hidden { display: none !important; }
            .seo-report { background: white !important; }
            h2.report-section-heading { break-before: auto; }
            ul.report-page-list { break-inside: avoid; }
          }
        `}</style>
      </div>
    </>
  )
}
