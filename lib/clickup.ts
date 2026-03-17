// lib/clickup.ts

interface ClickUpTask {
  name: string
  description: string
  custom_fields?: Array<{
    id: string
    value: string | number
  }>
}

interface ClickUpResponse {
  id: string
  custom_id: string
  name: string
}

export class ClickUpService {
  private baseUrl = 'https://api.clickup.com/api/v2'

  private getConfig() {
    const apiKey = process.env.CLICKUP_API_KEY
    const teamId = process.env.CLICKUP_TEAM_ID
    const listId = process.env.CLICKUP_LEADS_LIST_ID

    if (!apiKey || !teamId || !listId) {
      throw new Error('Missing ClickUp configuration: CLICKUP_API_KEY, CLICKUP_TEAM_ID, and CLICKUP_LEADS_LIST_ID required')
    }

    return { apiKey, teamId, listId }
  }

  async createTask(taskData: ClickUpTask): Promise<{ success: boolean; taskId?: string; error?: string }> {
    try {
      const { apiKey, listId } = this.getConfig()

      // Create abort controller for timeout
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 30000)

      try {
        const response = await fetch(`${this.baseUrl}/list/${listId}/task`, {
          method: 'POST',
          headers: {
            'Authorization': apiKey,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(taskData),
          signal: controller.signal,
        })

        clearTimeout(timeoutId)

        if (!response.ok) {
          let errorDetails = ''
          try {
            const errorData = await response.json()
            errorDetails = JSON.stringify(errorData)
          } catch {
            // If JSON parsing fails, try to get text
            try {
              errorDetails = await response.text()
            } catch {
              errorDetails = 'Unable to parse error response'
            }
          }

          console.error('ClickUp API error:', { status: response.status, details: errorDetails })
          throw new Error(`ClickUp API error: ${response.status} - ${errorDetails.slice(0, 200)}`)
        }

        const data: ClickUpResponse = await response.json()
        return { success: true, taskId: data.id }
      } finally {
        clearTimeout(timeoutId)
      }
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        const message = 'ClickUp request timeout (30s)'
        console.error(message)
        return { success: false, error: message }
      }

      const errorMessage = error instanceof Error ? error.message : 'Unknown error'
      console.error('ClickUp sync failed:', errorMessage)
      return { success: false, error: errorMessage }
    }
  }
}

export const clickupService = new ClickUpService()
