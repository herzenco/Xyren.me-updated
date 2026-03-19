interface ContentDraft {
  id: string
  title: string
  type: string
  category: string | null
  excerpt: string | null
  seo_score: number | null
  readability_score: number | null
  focus_keyword: string | null
  meta_description: string | null
  topic_reasoning: string | null
  cover_image_url: string | null
  reading_time: number | null
  tags: string[] | null
}

export async function notifyDraftViaClickUp(draft: ContentDraft): Promise<{ success: boolean; taskId?: string; error?: string }> {
  const apiKey = process.env.CLICKUP_API_KEY
  const listId = process.env.CLICKUP_CONTENT_LIST_ID
  const assigneeId = process.env.CLICKUP_ASSIGNEE_ID

  if (!apiKey || !listId) {
    console.error('[ClickUp] Missing CLICKUP_API_KEY or CLICKUP_CONTENT_LIST_ID')
    return { success: false, error: 'Missing ClickUp configuration' }
  }

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://xyren.me'
  const dashboardUrl = `${siteUrl}/dashboard/content`

  const seoEmoji = (draft.seo_score ?? 0) >= 80 ? '🟢' : (draft.seo_score ?? 0) >= 60 ? '🟡' : '🔴'

  const description = `## New AI-Generated ${draft.type === 'how-to' ? 'How-To Guide' : 'Blog Post'}

**Title:** ${draft.title}
**Type:** ${draft.type} | **Category:** ${draft.category ?? '—'} | **Reading time:** ${draft.reading_time ?? '—'} min

---

### Excerpt
${draft.excerpt ?? '—'}

---

### SEO Scorecard
${seoEmoji} **SEO Score:** ${draft.seo_score ?? '—'}/100
📖 **Readability:** ${draft.readability_score ?? '—'}/100
🔑 **Focus Keyword:** ${draft.focus_keyword ?? '—'}
📝 **Meta Description:** ${draft.meta_description ?? '—'}

---

### Why This Topic
${draft.topic_reasoning ?? '—'}

---

### Cover Image
${draft.cover_image_url ? `![Cover](${draft.cover_image_url})` : 'No cover image generated'}

### Tags
${(draft.tags ?? []).join(', ') || '—'}

---

**[→ Review & Approve in Dashboard](${dashboardUrl})**
`

  try {
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 30000)

    try {
      const body: Record<string, unknown> = {
        name: `[Draft] ${draft.title}`,
        description,
        status: 'to do',
        priority: 2, // High
        tags: ['ai-content', draft.type],
      }

      if (assigneeId) {
        body.assignees = [parseInt(assigneeId, 10)]
      }

      const response = await fetch(`https://api.clickup.com/api/v2/list/${listId}/task`, {
        method: 'POST',
        headers: {
          Authorization: apiKey,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
        signal: controller.signal,
      })

      clearTimeout(timeoutId)

      if (!response.ok) {
        const errorText = await response.text().catch(() => 'unknown error')
        throw new Error(`ClickUp API error ${response.status}: ${errorText.slice(0, 200)}`)
      }

      const data = await response.json()
      console.log(`[ClickUp] Content draft task created: ${data.id}`)
      return { success: true, taskId: data.id }
    } finally {
      clearTimeout(timeoutId)
    }
  } catch (error) {
    if (error instanceof Error && error.name === 'AbortError') {
      return { success: false, error: 'ClickUp request timeout' }
    }
    const message = error instanceof Error ? error.message : 'Unknown error'
    console.error('[ClickUp] Failed to create content draft task:', message)
    return { success: false, error: message }
  }
}
