import { ConditionConfig } from '@/lib/types'

export const saveConditionTemplate = async ({
  workflowId,
  name,
  condition
}: {
  workflowId: string
  name: string
  condition: ConditionConfig
}) => {
  try {
    const response = await fetch('/api/conditions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        workflowId,
        name,
        condition
      }),
    })

    if (!response.ok) {
      const error = await response.text()
      throw new Error(error)
    }

    const data = await response.json()
    return {
      success: true,
      templateName: data.templateName,
      template: data.template
    }
  } catch (error) {
    console.error('Failed to save condition template:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to save condition template'
    }
  }
}

export const loadConditionTemplates = async (workflowId: string) => {
  try {
    const response = await fetch(`/api/conditions?workflowId=${workflowId}`)
    
    if (!response.ok) {
      throw new Error('Failed to load condition templates')
    }

    const templates = await response.json()
    return templates

  } catch (error) {
    console.error('Failed to load condition templates:', error)
    throw error
  }
} 