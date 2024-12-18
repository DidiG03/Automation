import { ConnectionProviderProps } from '@/providers/connections-provider'
import { z } from 'zod'

export const EditUserProfileSchema = z.object({
  email: z.string().email('Required'),
  name: z.string().min(1, 'Required'),
})

export const WorkflowFormSchema = z.object({
  name: z.string().min(1, 'Required'),
  description: z.string().min(1, 'Required'),
})

export type ConnectionTypes = 'Google Drive' | 'Notion' | 'Slack' | 'Discord' | 'Trigger' | 'Email'

export type Connection = {
  title: ConnectionTypes
  description: string
  image: string
  connectionKey: keyof ConnectionProviderProps
  accessTokenKey?: string
  alwaysTrue?: boolean
  slackSpecial?: boolean
}

export type EditorCanvasTypes =
  | 'Email'
  | 'Condition'
  | 'AI'
  | 'Slack'
  | 'Google Drive'
  | 'Notion'
  | 'Custom Webhook'
  | 'Google Calendar'
  | 'Trigger'
  | 'Action'
  | 'Wait'

export type ManualTriggerConfig = {
  type: string
  description?: string
  required?: boolean
}

export type TriggerConfig = ManualTriggerConfig

export type EditorCanvasCardType = {
  title: string
  description: string
  completed: boolean
  current: boolean
  metadata: {
    triggerType?: 'manual'
    description?: string
    required?: boolean
  }
  type: EditorCanvasTypes
}

export type EditorNodeType = {
  id: string
  type: EditorCanvasCardType['type']
  position: {
    x: number
    y: number
  }
  data: EditorCanvasCardType
}

export type EditorNode = EditorNodeType

export type EditorActions =
  | {
      type: 'LOAD_DATA'
      payload: {
        elements: EditorNode[]
        edges: {
          id: string
          source: string
          target: string
        }[]
      }
    }
  | {
      type: 'UPDATE_NODE'
      payload: {
        elements: EditorNode[]
      }
    }
  | { type: 'REDO' }
  | { type: 'UNDO' }
  | {
      type: 'SELECTED_ELEMENT'
      payload: {
        element: EditorNode
      }
    }
  | {
      type: 'UPDATE_EDGES'
      payload: {
        edges: {
          id: string
          source: string
          target: string
        }[]
      }
    }

export const nodeMapper: Record<string, string> = {
  Notion: 'notionNode',
  Slack: 'slackNode',
  Discord: 'discordNode',
  Trigger: 'triggerNode',
  'Google Drive': 'googleNode',
  Email: 'emailNode',
}

export const EmailConfigSchema = z.object({
  to: z.string().email('Valid email required'),
  subject: z.string().min(1, 'Subject is required'),
  body: z.string().min(1, 'Body is required'),
})

export type ConditionOperator = 'equals' | 'not_equals' | 'greater_than' | 'less_than' | 'contains'

export type ConditionConfig = {
  leftOperand: string
  operator: ConditionOperator | undefined
  rightOperand: string
  savedTemplates?: string[]
  condition?: {
    type: string
    value: any
    operator: ConditionOperator
  }
  templateName?: string
}

export type ConditionTemplate = {
  id: string
  name: string
  condition: {
    type: string
    value: any
    operator: ConditionOperator
  }
  workflowId: string
  createdAt: Date
  updatedAt: Date
}