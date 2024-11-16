import { TriggerNode } from "@/providers/connections-provider"

interface TriggerParams {
  type: string
  workflowId: string
  triggerConfig: {
    triggerType: string
    description: string
    triggerName: string
    required: boolean
  }
}

interface TriggerResponse {
  success: boolean
  message?: string
}

export async function executeTrigger(params: TriggerParams): Promise<TriggerResponse> {
  try {
    const response = await fetch('/api/triggers/execute', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(params),
    })

    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.message || 'Failed to execute trigger')
    }

    return {
      success: true,
      message: data.message
    }
  } catch (error) {
    console.error('Trigger execution failed:', error)
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Failed to execute trigger',
    }
  }
}
