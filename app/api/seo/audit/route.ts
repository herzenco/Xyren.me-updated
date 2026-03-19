import { NextRequest, NextResponse } from 'next/server'
import { runSeoAudit } from '@/lib/seo-audit'

export const maxDuration = 300

export async function POST(request: NextRequest) {
  const cronHeader = request.headers.get('x-vercel-cron')
  const authHeader = request.headers.get('authorization')
  const cronSecret = process.env.CRON_SECRET

  const isAuthorized =
    cronHeader === '1' ||
    (cronSecret && authHeader === `Bearer ${cronSecret}`)

  if (!isAuthorized) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const result = await runSeoAudit()
    return NextResponse.json({ success: true, ...result })
  } catch (err) {
    console.error('SEO audit error:', err)
    return NextResponse.json({ error: 'Audit failed' }, { status: 500 })
  }
}
