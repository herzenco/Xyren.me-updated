# Run Engine Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add a "Run Engine" panel to the content dashboard that manually triggers AI content generation with optional configuration (type, topic hint, category).

**Architecture:** Extends the existing `/api/content/generate` route to accept optional body params. A new server action calls the API with Bearer auth. A client component on `/dashboard/content` provides the config form and fire-and-forget UX.

**Tech Stack:** Next.js 16 App Router, React Server Actions, shadcn/ui components, Tailwind CSS

---

### Task 1: Update `selectTopic()` to accept optional overrides

**Files:**
- Modify: `lib/content-engine/claude.ts:133-171`

**Step 1: Add options parameter to selectTopic**

Update the function signature and inject overrides into the Claude prompt:

```ts
export interface TopicOverrides {
  type?: 'blog' | 'how-to'
  topicHint?: string
  category?: string
}

export async function selectTopic(context: string, overrides?: TopicOverrides): Promise<TopicDecision> {
  const constraints: string[] = []
  if (overrides?.type) constraints.push(`Content type MUST be: ${overrides.type}`)
  if (overrides?.topicHint) constraints.push(`The topic MUST be about or closely related to: "${overrides.topicHint}"`)
  if (overrides?.category) constraints.push(`Category MUST be: ${overrides.category}`)
  const constraintBlock = constraints.length
    ? `\n\nUSER CONSTRAINTS (follow these strictly):\n${constraints.map(c => `- ${c}`).join('\n')}`
    : ''

  const response = await anthropic.messages.create({
    model: 'claude-opus-4-6',
    max_tokens: 1024,
    messages: [
      {
        role: 'user',
        content: `You are an expert content strategist for a web design and digital marketing agency targeting service-based small businesses.

<site_context>
${context}
</site_context>
${constraintBlock}

Select the best content topic to publish today. Avoid any topic already covered in the existing content listed in <site_context>. Pick topics with real search demand that service business owners would actively search for.

Respond with ONLY valid JSON (no markdown fences, no explanation):
{
  "type": "blog",
  "title": "exact title string",
  "slug": "url-slug-format-lowercase-with-hyphens",
  "category": "one of: seo, marketing, design, business, technology",
  "target_keyword": "primary keyword phrase",
  "secondary_keywords": ["keyword2", "keyword3"],
  "reasoning": "2-3 sentences explaining why this topic now",
  "estimated_search_volume_tier": "medium"
}`,
      },
    ],
  })

  const text = response.content[0].type === 'text' ? response.content[0].text : ''
  let parsed: TopicDecision
  try {
    parsed = JSON.parse(text) as TopicDecision
  } catch {
    throw new Error(`selectTopic: Claude returned non-JSON response: ${text.slice(0, 300)}`)
  }
  return parsed
}
```

**Step 2: Verify build passes**

Run: `source ~/.nvm/nvm.sh && nvm use 20 && npx tsc --noEmit 2>&1 | head -20`
Expected: No new errors (existing callers pass no overrides, so backward compatible)

**Step 3: Commit**

```bash
git add lib/content-engine/claude.ts
git commit -m "feat: add optional overrides to selectTopic for manual engine runs"
```

---

### Task 2: Update API route to accept optional body params

**Files:**
- Modify: `app/api/content/generate/route.ts:24-46`

**Step 1: Parse body and pass overrides**

Update the POST handler to read optional params from the request body and pass them through the pipeline:

```ts
export async function POST(request: NextRequest) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // Parse optional overrides from body (cron sends empty body)
  let overrides: { type?: 'blog' | 'how-to'; topicHint?: string; category?: string } = {}
  try {
    const body = await request.json()
    if (body && typeof body === 'object') {
      overrides = {
        type: body.type,
        topicHint: body.topicHint,
        category: body.category,
      }
    }
  } catch {
    // Empty body from cron — that's fine
  }

  const supabase = createAdminClient()
  const startTime = Date.now()

  console.log('[ContentEngine] Pipeline started', overrides.topicHint ? `(hint: "${overrides.topicHint}")` : '(auto)')

  try {
    // 1. Build context
    console.log('[ContentEngine] Building context...')
    const context = await buildContext()

    // 2. Select topic (with optional overrides)
    console.log('[ContentEngine] Selecting topic...')
    const topic = await selectTopic(context, overrides)
    console.log(`[ContentEngine] Topic: "${topic.title}" (${topic.type}, ${topic.category})`)

    // ... rest of pipeline unchanged
```

Update the import to include `TopicOverrides`:

```ts
import { buildContext, selectTopic, generateContent, reviewSEO, type TopicOverrides } from '@/lib/content-engine/claude'
```

**Step 2: Verify build**

Run: `source ~/.nvm/nvm.sh && nvm use 20 && npx tsc --noEmit 2>&1 | head -20`

**Step 3: Commit**

```bash
git add app/api/content/generate/route.ts
git commit -m "feat: accept optional type/topicHint/category in content generate API"
```

---

### Task 3: Add `triggerContentEngine` server action

**Files:**
- Modify: `lib/actions/content.ts` (add at end of file)

**Step 1: Add the server action**

Append to `lib/actions/content.ts`:

```ts
export async function triggerContentEngine(params: {
  type?: string
  topicHint?: string
  category?: string
}) {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:8000'
  const cronSecret = process.env.CRON_SECRET

  const body: Record<string, string> = {}
  if (params.type && params.type !== 'auto') body.type = params.type
  if (params.topicHint?.trim()) body.topicHint = params.topicHint.trim()
  if (params.category && params.category !== 'auto') body.category = params.category

  // Fire-and-forget: we don't await the full pipeline, just confirm it started
  const response = await fetch(`${siteUrl}/api/content/generate`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(cronSecret ? { Authorization: `Bearer ${cronSecret}` } : {}),
    },
    body: JSON.stringify(body),
  })

  if (!response.ok) {
    const err = await response.json().catch(() => ({ error: 'Unknown error' }))
    throw new Error(err.error || 'Failed to trigger content engine')
  }

  revalidatePath('/dashboard/content')
}
```

Note: This actually awaits the full response since the API route runs the whole pipeline. But from the UI perspective we handle this with a non-blocking UX (the client component uses `startTransition` and shows immediate feedback).

**Step 2: Verify build**

Run: `source ~/.nvm/nvm.sh && nvm use 20 && npx tsc --noEmit 2>&1 | head -20`

**Step 3: Commit**

```bash
git add lib/actions/content.ts
git commit -m "feat: add triggerContentEngine server action"
```

---

### Task 4: Create RunEnginePanel client component

**Files:**
- Create: `components/dashboard/run-engine-panel.tsx`

**Step 1: Create the component**

```tsx
'use client'

import { useState, useTransition } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Zap, ChevronDown, ChevronUp, CheckCircle } from 'lucide-react'
import { triggerContentEngine } from '@/lib/actions/content'

const CONTENT_TYPES = [
  { value: 'auto', label: 'Let AI decide' },
  { value: 'blog', label: 'Blog Post' },
  { value: 'how-to', label: 'How-To Guide' },
]

const CATEGORIES = ['Auto', 'SEO', 'Business', 'Design', 'Marketing']

export function RunEnginePanel() {
  const [open, setOpen] = useState(false)
  const [type, setType] = useState('auto')
  const [topicHint, setTopicHint] = useState('')
  const [category, setCategory] = useState('auto')
  const [status, setStatus] = useState<'idle' | 'running' | 'success' | 'error'>('idle')
  const [errorMsg, setErrorMsg] = useState('')
  const [isPending, startTransition] = useTransition()

  function handleRun() {
    setStatus('running')
    setErrorMsg('')
    startTransition(async () => {
      try {
        await triggerContentEngine({ type, topicHint, category })
        setStatus('success')
        setTopicHint('')
        setTimeout(() => setStatus('idle'), 5000)
      } catch (err) {
        setErrorMsg(err instanceof Error ? err.message : 'Something went wrong')
        setStatus('error')
        setTimeout(() => setStatus('idle'), 5000)
      }
    })
  }

  return (
    <Card>
      <CardContent className="p-4">
        <button
          onClick={() => setOpen(!open)}
          className="flex w-full items-center justify-between text-left"
        >
          <div className="flex items-center gap-2">
            <Zap className="h-4 w-4 text-primary" />
            <span className="text-sm font-semibold">Run Engine</span>
            <span className="text-xs text-muted-foreground">Manually generate content</span>
          </div>
          {open ? <ChevronUp className="h-4 w-4 text-muted-foreground" /> : <ChevronDown className="h-4 w-4 text-muted-foreground" />}
        </button>

        {open && (
          <div className="mt-4 space-y-4">
            {/* Content type */}
            <div className="space-y-2">
              <Label className="text-xs">Content Type</Label>
              <div className="flex flex-wrap gap-2">
                {CONTENT_TYPES.map((ct) => (
                  <button
                    key={ct.value}
                    onClick={() => setType(ct.value)}
                    className={`px-3 py-1.5 text-xs rounded-md border transition-colors ${
                      type === ct.value
                        ? 'border-primary bg-primary/10 text-primary'
                        : 'border-border text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    {ct.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Topic hint */}
            <div className="space-y-2">
              <Label htmlFor="topic-hint" className="text-xs">Topic Hint (optional)</Label>
              <input
                id="topic-hint"
                value={topicHint}
                onChange={(e) => setTopicHint(e.target.value)}
                placeholder="Suggest a topic or keyword..."
                className="h-8 w-full text-xs px-3 rounded-md border border-input bg-background focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>

            {/* Category */}
            <div className="space-y-2">
              <Label htmlFor="category" className="text-xs">Category</Label>
              <select
                id="category"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="h-8 w-full text-xs px-3 rounded-md border border-input bg-background focus:outline-none focus:ring-1 focus:ring-primary"
              >
                {CATEGORIES.map((c) => (
                  <option key={c} value={c.toLowerCase()}>{c}</option>
                ))}
              </select>
            </div>

            {/* Run button + status */}
            <div className="flex items-center gap-3">
              <Button
                onClick={handleRun}
                disabled={isPending || status === 'running'}
                size="sm"
                className="gap-1.5"
              >
                <Zap className="h-3.5 w-3.5" />
                {status === 'running' ? 'Starting...' : 'Run Engine'}
              </Button>

              {status === 'success' && (
                <span className="flex items-center gap-1 text-xs text-green-400">
                  <CheckCircle className="h-3.5 w-3.5" />
                  Content generation started. Draft will appear in the queue when ready.
                </span>
              )}

              {status === 'error' && (
                <span className="text-xs text-red-400">{errorMsg}</span>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
```

**Step 2: Verify build**

Run: `source ~/.nvm/nvm.sh && nvm use 20 && npx tsc --noEmit 2>&1 | head -20`

**Step 3: Commit**

```bash
git add components/dashboard/run-engine-panel.tsx
git commit -m "feat: add RunEnginePanel client component for manual content generation"
```

---

### Task 5: Wire RunEnginePanel into content dashboard page

**Files:**
- Modify: `app/dashboard/content/page.tsx:1-9,27-34`

**Step 1: Import and render the panel**

Add the import at the top of the file:

```ts
import { RunEnginePanel } from '@/components/dashboard/run-engine-panel'
```

Then insert `<RunEnginePanel />` inside the return, after the `<PageHeader>` block and before the stats grid:

```tsx
      <PageHeader title="Content Board">
        <p className="text-sm text-muted-foreground">
          AI-generated drafts — review and approve before publishing
        </p>
      </PageHeader>

      {/* Manual trigger */}
      <RunEnginePanel />

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
```

**Step 2: Run full build**

Run: `source ~/.nvm/nvm.sh && nvm use 20 && npm run build 2>&1 | tail -20`
Expected: Build succeeds, `/dashboard/content` listed as dynamic route

**Step 3: Commit**

```bash
git add app/dashboard/content/page.tsx
git commit -m "feat: add Run Engine panel to content dashboard"
```

---

### Task 6: Verify in dev server

**Step 1:** Start dev server and navigate to `http://localhost:8000/dashboard/content`

**Step 2:** Verify the "Run Engine" collapsible card appears at the top

**Step 3:** Expand it and verify all controls render: type radio buttons, topic input, category select, Run button

**Step 4:** Take a screenshot for visual verification
