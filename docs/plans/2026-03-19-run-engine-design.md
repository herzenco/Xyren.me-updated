# Run Engine — Manual Content Generation Trigger

**Date:** 2026-03-19
**Status:** Approved

## Overview

Add a "Run Engine" panel to `/dashboard/content` that lets the user manually trigger content generation with optional configuration, instead of waiting for the daily Vercel Cron.

## UI

Collapsible card at the top of `/dashboard/content`, above the pending queue:

- **Content type**: Radio group — "Let AI decide" (default), "Blog Post", "How-To Guide"
- **Topic hint**: Optional text input — placeholder "Suggest a topic or keyword"
- **Category**: Select dropdown — "Auto" (default), SEO, Business, Design, Marketing
- **"Run Engine" button**: Cyan primary style with Play/Zap icon
- **Behavior**: Fire-and-forget. Button disables briefly, toast confirms "Content generation started. Draft will appear in the queue when ready." No spinner or progress tracking.

## Backend

Extend existing `/api/content/generate` POST route to accept optional body params:

```ts
{ type?: 'blog' | 'how-to', topicHint?: string, category?: string }
```

These are passed to `selectTopic()` and `generateContent()` so the AI respects user preferences. Cron calls (no body) continue unchanged — AI decides everything.

## Data Flow

```
RunEnginePanel (client component)
  → Server action: triggerContentEngine({ type, topicHint, category })
    → fetch('/api/content/generate', { body, Authorization: Bearer CRON_SECRET })
    → Returns immediately to UI (fire-and-forget)
    → API runs full 7-step pipeline (up to 5 min)
    → Draft saved to content_drafts with status 'pending'
    → User refreshes /dashboard/content to see draft
```

## Changes Required

1. **`lib/content-engine/claude.ts`** — Update `selectTopic()` and `generateContent()` to accept optional `topicHint`, `type`, `category` params
2. **`app/api/content/generate/route.ts`** — Parse optional body params, pass to pipeline
3. **`lib/actions/content.ts`** — Add `triggerContentEngine()` server action
4. **`components/dashboard/run-engine-panel.tsx`** — New client component with form + toast
5. **`app/dashboard/content/page.tsx`** — Import and render RunEnginePanel at top

No new tables, no new API routes, no polling/WebSocket.
