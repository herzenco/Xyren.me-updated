import { NextRequest, NextResponse } from 'next/server'
import { runSeoAudit } from '@/lib/seo-audit'

export const maxDuration = 300

export async function GET(request: NextRequest) {
  return handleAudit(request)
}

export async function POST(request: NextRequest) {
  return handleAudit(request)
}

async function handleAudit(request: NextRequest) {
  const cronSecret = process.env.CRON_SECRET
  const authHeader = request.headers.get('authorization')

  const isAuthorized =
    cronSecret && authHeader === `Bearer ${cronSecret}`

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
