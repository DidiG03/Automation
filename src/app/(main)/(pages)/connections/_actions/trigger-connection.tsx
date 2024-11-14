import { TriggerNode } from "@/providers/connections-provider"

interface TriggerParams {
  type: string
  workflowId: string
  triggerConfig: TriggerNode
}

interface TriggerResponse {
  success: boolean
  message?: string
}

export async function executeTrigger(params: TriggerParams): Promise<TriggerResponse> {
  try {
    const response = await fetch('/api/workflow/trigger', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(params),
    })

    if (!response.ok) {
      throw new Error('Failed to execute trigger')
    }

    return await response.json()
  } catch (error) {
    console.error('Trigger execution failed:', error)
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Failed to execute trigger',
    }
  }
}
