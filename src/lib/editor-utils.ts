import { ConnectionProviderProps } from '@/providers/connections-provider'
import { EditorCanvasCardType, EditorNodeType } from './types'
import { EditorState } from '@/providers/editor-provider'
import { getDiscordConnectionUrl } from '@/app/(main)/(pages)/connections/_actions/discord-connection'
import {
  getNotionConnection,
  getNotionDatabase,
} from '@/app/(main)/(pages)/connections/_actions/notion-connection'
import {
  getSlackConnection,
  listBotChannels,
} from '@/app/(main)/(pages)/connections/_actions/slack-connection'
import { Option } from '@/components/ui/multiple-selector'
import { ConditionOperator } from '@/lib/types'

export const onDragStart = (
  event: any,
  nodeType: EditorCanvasCardType['type']
) => {
  event.dataTransfer.setData('application/reactflow', nodeType)
  event.dataTransfer.effectAllowed = 'move'
}

export const onSlackContent = (
  nodeConnection: ConnectionProviderProps,
  event: React.ChangeEvent<HTMLInputElement>
) => {
  nodeConnection.setSlackNode((prev: any) => ({
    ...prev,
    content: event.target.value,
  }))
}

export const onDiscordContent = (
  nodeConnection: ConnectionProviderProps,
  event: React.ChangeEvent<HTMLInputElement>
) => {
  nodeConnection.setDiscordNode((prev: any) => ({
    ...prev,
    content: event.target.value,
  }))
}

export const onContentChange = (
  nodeConnection: ConnectionProviderProps,
  nodeType: string,
  event: React.ChangeEvent<HTMLInputElement>
) => {
  if (nodeType === 'Slack') {
    onSlackContent(nodeConnection, event)
  } else if (nodeType === 'Discord') {
    onDiscordContent(nodeConnection, event)
  } else if (nodeType === 'Notion') {
    onNotionContent(nodeConnection, event)
  }
}

export const onAddTemplateSlack = (
  nodeConnection: ConnectionProviderProps,
  template: string
) => {
  nodeConnection.setSlackNode((prev: any) => ({
    ...prev,
    content: `${prev.content} ${template}`,
  }))
}

export const onAddTemplateDiscord = (
  nodeConnection: ConnectionProviderProps,
  template: string
) => {
  nodeConnection.setDiscordNode((prev: any) => ({
    ...prev,
    content: `${prev.content} ${template}`,
  }))
}

export const onAddTemplate = (
  nodeConnection: ConnectionProviderProps,
  title: string,
  template: string
) => {
  if (title === 'Slack') {
    onAddTemplateSlack(nodeConnection, template)
  } else if (title === 'Discord') {
    onAddTemplateDiscord(nodeConnection, template)
  } else if (title === 'Trigger') {
    nodeConnection.setTriggerNode((prev: any) => ({
      ...prev,
      description: template,
      triggerType: 'manual',
      loadedTrigger: {
        triggerType: 'manual',
        description: template,
        triggerName: `Trigger ${template.slice(0, 15)}...`,
        required: prev.required
      }
    }))
  } else if (title === 'Email') {
    nodeConnection.setEmailNode((prev: any) => ({
      ...prev,
      loadedTemplate: prev.savedTemplates?.find((t: string) => t === template)
    }))
  }
}

export const onConnections = async (
  nodeConnection: ConnectionProviderProps,
  editorState: EditorState,
  googleFile: any
) => {
  if (editorState.editor.selectedNode.data.title == 'Discord') {
    const connection = await getDiscordConnectionUrl()
    if (connection) {
      nodeConnection.setDiscordNode({
        webhookURL: connection.url,
        content: '',
        webhookName: connection.name,
        guildName: connection.guildName,
      })
    }
  }
  if (editorState.editor.selectedNode.data.title == 'Notion') {
    const connection = await getNotionConnection()
    if (connection) {
      nodeConnection.setNotionNode({
        accessToken: connection.accessToken,
        databaseId: connection.databaseId,
        workspaceName: connection.workspaceName,
        content: {
          name: googleFile.name,
          kind: googleFile.kind,
          type: googleFile.mimeType,
        },
      })

      if (nodeConnection.notionNode.databaseId !== '') {
        const response = await getNotionDatabase(
          nodeConnection.notionNode.databaseId,
          nodeConnection.notionNode.accessToken
        )
      }
    }
  }
  if (editorState.editor.selectedNode.data.title == 'Slack') {
    const connection = await getSlackConnection()
    if (connection) {
      nodeConnection.setSlackNode({
        appId: connection.appId,
        authedUserId: connection.authedUserId,
        authedUserToken: connection.authedUserToken,
        slackAccessToken: connection.slackAccessToken,
        botUserId: connection.botUserId,
        teamId: connection.teamId,
        teamName: connection.teamName,
        userId: connection.userId,
        content: '',
      })
    }
  }

  try {
    const response = await fetch('/api/workflows');
    const workflows = await response.json();
    await loadTemplatesFromWorkflow(nodeConnection, workflows);
  } catch (error) {
    console.error('Failed to load templates:', error);
  }
}

export const fetchBotSlackChannels = async (
  token: string,
  setSlackChannels: (slackChannels: Option[]) => void
) => {
  await listBotChannels(token)?.then((channels) => setSlackChannels(channels))
}

export const onNotionContent = (
  nodeConnection: ConnectionProviderProps,
  event: React.ChangeEvent<HTMLInputElement>
) => {
  nodeConnection.setNotionNode((prev: any) => ({
    ...prev,
    content: event.target.value,
  }))
}

export const loadTemplatesFromWorkflow = async (
  nodeConnection: ConnectionProviderProps,
  workflows: any[]
) => {
  const discordTemplates = workflows
    .filter(w => w.discordTemplate)
    .map(w => w.discordTemplate)
    .filter((template): template is string => !!template);

  const notionTemplates = workflows
    .filter(w => w.notionTemplate)
    .map(w => w.notionTemplate)
    .filter((template): template is string => !!template);

  const slackTemplates = workflows
    .filter(w => w.slackTemplate)
    .map(w => w.slackTemplate)
    .filter((template): template is string => !!template);

  // First, fetch the workflow triggers
  try {
    const response = await fetch('/api/triggers');
    const workflowTriggers = await response.json();
    
    // Map the triggers to just their description strings for rendering
    const triggerTemplates = workflowTriggers
      .filter((trigger: any) => trigger.type === 'manual')
      .map((trigger: any) => trigger.description);

    nodeConnection.setTriggerNode((prev: any) => ({
      ...prev,
      savedTemplates: triggerTemplates
    }));
  } catch (error) {
    console.error('Failed to load trigger templates:', error);
  }

  // Existing template setters
  nodeConnection.setDiscordNode((prev: any) => ({
    ...prev,
    savedTemplates: discordTemplates
  }));

  nodeConnection.setNotionNode((prev: any) => ({
    ...prev,
    savedTemplates: notionTemplates
  }));

  nodeConnection.setSlackNode((prev: any) => ({
    ...prev,
    savedTemplates: slackTemplates
  }));

  // Add email templates loading
  try {
    const response = await fetch('/api/email-templates');
    const emailTemplates = await response.json();
    
    const templates = emailTemplates.map((template: any) => template.name);

    nodeConnection.setEmailNode((prev: any) => ({
      ...prev,
      savedTemplates: templates
    }));
  } catch (error) {
    console.error('Failed to load email templates:', error);
  }
}

export const evaluateCondition = (condition: {
  leftOperand: string,
  operator: ConditionOperator | undefined,
  rightOperand: string
}) => {
  const { leftOperand, operator, rightOperand } = condition

  if (!operator) return false

  switch (operator) {
    case 'equals':
      return leftOperand === rightOperand
    case 'not_equals':
      return leftOperand !== rightOperand
    case 'greater_than':
      return Number(leftOperand) > Number(rightOperand)
    case 'less_than':
      return Number(leftOperand) < Number(rightOperand)
    case 'contains':
      return leftOperand.includes(rightOperand)
    default:
      return false
  }
}

export const getNextNodes = (
  currentNodeId: string,
  edges: { source: string; target: string }[]
) => {
  return edges
    .filter(edge => edge.source === currentNodeId)
    .map(edge => edge.target)
}

export const processWorkflowNodes = async (
  nodes: EditorNodeType[],
  edges: { source: string; target: string }[],
  startNodeId: string,
  nodeConnection: ConnectionProviderProps
) => {
  let currentNodeId = startNodeId
  
  while (currentNodeId) {
    const currentNode = nodes.find(node => node.id === currentNodeId)
    if (!currentNode) break

    if (currentNode.type === 'Condition') {
      const conditionResult = evaluateCondition(nodeConnection.conditionNode)
      if (!conditionResult) {
        break // Stop if condition is false
      }
    }

    // Get next node
    const nextNodes = getNextNodes(currentNodeId, edges)
    currentNodeId = nextNodes[0] // Assume linear flow for now
  }
}
