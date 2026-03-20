'use server'

import { anthropic } from '@/lib/anthropic'
import { createAdminClient } from '@/lib/supabase/admin'
import { getServerSession } from 'next-auth'
import { revalidatePath } from 'next/cache'

async function requireAuth() {
  const session = await getServerSession()
  if (!session?.user) throw new Error('Unauthorized')
  return session.user
}

export interface SeoSuggestion {
  suggested_title: string
  suggested_description: string
  fixes: {
    issue: string
    fix: string
    priority: 'high' | 'medium' | 'low'
  }[]
}

export async function analyzePageSeo(pageId: string): Promise<void> {
  await requireAuth()
  const supabase = createAdminClient()

  const { data: page, error } = await (supabase as any)
    .from('seo_audit_log')
    .select('id, page_url, meta_title, meta_description, issues')
    .eq('id', pageId)
    .single()

  if (error || !page) throw new Error('Page not found')

  const response = await anthropic.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 2048,
    messages: [
      {
        role: 'user',
        content: `You are an SEO expert. Analyze this page and return specific, actionable fixes.

URL: ${page.page_url}
Current meta title: ${page.meta_title ?? 'MISSING'}
Current meta description: ${page.meta_description ?? 'MISSING'}
Issues detected: ${Array.isArray(page.issues) ? page.issues.join(', ') : String(page.issues ?? 'none')}

Return ONLY valid JSON (no markdown fences):
{
  "suggested_title": "rewritten meta title, 50-70 chars, includes primary keyword",
  "suggested_description": "rewritten meta description, 120-155 chars, compelling and includes keyword",
  "fixes": [
    {
      "issue": "exact issue string from the issues list above",
      "fix": "specific instruction for fixing this issue — what to change and how",
      "priority": "high"
    }
  ]
}

Priority rules: HTTP errors and noindex = high. Missing title/description = high. Too short/long = medium. Missing canonical or OG = medium.`,
      },
    ],
  })

  const text = response.content[0].type === 'text' ? response.content[0].text : ''
  let suggestions: SeoSuggestion
  try {
    suggestions = JSON.parse(text) as SeoSuggestion
  } catch {
    throw new Error(`Claude returned non-JSON: ${text.slice(0, 200)}`)
  }

  // Basic shape validation
  if (
    typeof suggestions.suggested_title !== 'string' ||
    typeof suggestions.suggested_description !== 'string' ||
    !Array.isArray(suggestions.fixes)
  ) {
    throw new Error('Claude returned unexpected response shape')
  }

  const { error: updateError } = await (supabase as any)
    .from('seo_audit_log')
    .update({ ai_suggestions: suggestions })
    .eq('id', pageId)
  if (updateError) throw new Error(`Failed to save suggestions: ${updateError.message}`)

  revalidatePath('/dashboard/seo')
}
