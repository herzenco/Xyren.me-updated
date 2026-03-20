/**
 * One-time script to register a ClickUp webhook for task status updates.
 *
 * Usage:
 *   npx tsx scripts/setup-clickup-webhook.ts
 *
 * Required env vars (from .env.local):
 *   CLICKUP_API_KEY
 *   CLICKUP_TEAM_ID
 *   CLICKUP_CONTENT_LIST_ID
 *   NEXT_PUBLIC_SITE_URL (production URL, e.g. https://xyren.me)
 */

import { config } from 'dotenv'
config({ path: '.env.local' })

async function main() {
  const apiKey = process.env.CLICKUP_API_KEY
  const teamId = process.env.CLICKUP_TEAM_ID
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL

  if (!apiKey || !teamId || !siteUrl) {
    console.error('Missing required env vars: CLICKUP_API_KEY, CLICKUP_TEAM_ID, NEXT_PUBLIC_SITE_URL')
    process.exit(1)
  }

  const endpoint = `${siteUrl}/api/webhooks/clickup`

  console.log(`Registering ClickUp webhook...`)
  console.log(`  Team: ${teamId}`)
  console.log(`  Endpoint: ${endpoint}`)
  console.log(`  Events: taskStatusUpdated`)

  const response = await fetch(`https://api.clickup.com/api/v2/team/${teamId}/webhook`, {
    method: 'POST',
    headers: {
      Authorization: apiKey,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      endpoint,
      events: ['taskStatusUpdated'],
    }),
  })

  if (!response.ok) {
    const text = await response.text()
    console.error(`ClickUp API error ${response.status}: ${text}`)
    process.exit(1)
  }

  const data = await response.json()
  console.log(`\nWebhook created successfully!`)
  console.log(`  Webhook ID: ${data.id}`)
  console.log(`  Secret: ${data.webhook?.secret ?? 'N/A'}`)
  console.log(`\nAdd this to your .env.local:`)
  console.log(`  CLICKUP_WEBHOOK_SECRET=${data.webhook?.secret ?? '<check ClickUp response>'}`)
}

main()
