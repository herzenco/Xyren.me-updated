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
  private apiKey: string
  private teamId: string
  private listId: string
  private baseUrl = 'https://api.clickup.com/api/v2'

  constructor() {
    this.apiKey = process.env.CLICKUP_API_KEY || ''
    this.teamId = process.env.CLICKUP_TEAM_ID || ''
    this.listId = process.env.CLICKUP_LEADS_LIST_ID || ''

    if (!this.apiKey || !this.teamId || !this.listId) {
      throw new Error('Missing ClickUp configuration in environment variables')
    }
  }

  async createTask(taskData: ClickUpTask): Promise<{ success: boolean; taskId?: string; error?: string }> {
    try {
      const response = await fetch(`${this.baseUrl}/list/${this.listId}/task`, {
        method: 'POST',
        headers: {
          'Authorization': this.apiKey,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(taskData),
      })

      if (!response.ok) {
        const errorData = await response.json()
        console.error('ClickUp API error:', errorData)
        throw new Error(`ClickUp API error: ${response.status}`)
      }

      const data: ClickUpResponse = await response.json()
      return { success: true, taskId: data.id }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'
      console.error('ClickUp sync failed:', errorMessage)
      return { success: false, error: errorMessage }
    }
  }
}

export const clickupService = new ClickUpService()
