'use client'
import { ConditionConfig, ConditionOperator } from '@/lib/types'
import { createContext, useContext, useState } from 'react'

export type TriggerNode = {
  triggerType: string
  description: string
  triggerName: string
  required: boolean
  savedTemplates?: string[]
  loadedTrigger?: {
    triggerType: string
    description: string
    triggerName: string
    required: boolean
  }
}

export type DiscordNode = {
  webhookURL: string
  content: string
  webhookName: string
  guildName: string
  savedTemplates?: string[]
}

export type EmailNode = {
  to: string
  subject: string
  body: string
  savedTemplates?: string[]
  loadedTemplate?: {
    to: string
    subject: string
    body: string
  }
}

export type ConditionNode = {
  leftOperand: string
  operator: ConditionOperator
  rightOperand: string
}

export type ConnectionProviderProps = {
  discordNode: DiscordNode
  setDiscordNode: React.Dispatch<React.SetStateAction<DiscordNode>>
  googleNode: {}[]
  setGoogleNode: React.Dispatch<React.SetStateAction<any>>
  notionNode: {
    accessToken: string
    databaseId: string
    workspaceName: string
    content: string
    savedTemplates?: string[]
  }
  workflowTemplate: {
    discord?: string
    notion?: string
    slack?: string
  }
  triggerNode: TriggerNode
  setTriggerNode: React.Dispatch<React.SetStateAction<TriggerNode>>
  setNotionNode: React.Dispatch<React.SetStateAction<any>>
  conditionNode: ConditionConfig
  setConditionNode: React.Dispatch<React.SetStateAction<ConditionConfig>>
  slackNode: {
    appId: string
    authedUserId: string
    authedUserToken: string
    slackAccessToken: string
    botUserId: string
    teamId: string
    teamName: string
    content: string
    savedTemplates?: string[]
  }
  setSlackNode: React.Dispatch<React.SetStateAction<any>>
  setWorkFlowTemplate: React.Dispatch<
    React.SetStateAction<{
      discord?: string
      notion?: string
      slack?: string
    }>
  >
  isLoading: boolean
  setIsLoading: React.Dispatch<React.SetStateAction<boolean>>
  emailNode: EmailNode
  setEmailNode: React.Dispatch<React.SetStateAction<EmailNode>>
}

type ConnectionWithChildProps = {
  children: React.ReactNode
}

const InitialValues: ConnectionProviderProps = {
  discordNode: {
    webhookURL: '',
    content: '',
    webhookName: '',
    guildName: '',
    savedTemplates: [],
  },
  triggerNode: {
    triggerType: '',
    triggerName: '',
    description: '',
    required: false,
    loadedTrigger: undefined
  },
  googleNode: [],
  notionNode: {
    accessToken: '',
    databaseId: '',
    workspaceName: '',
    content: '',
    savedTemplates: [],
  },
  workflowTemplate: {
    discord: '',
    notion: '',
    slack: '',
  },
  emailNode: {
    to: '',
    subject: '',
    body: '',
    savedTemplates: [],
  },
  slackNode: {
    appId: '',
    authedUserId: '',
    authedUserToken: '',
    slackAccessToken: '',
    botUserId: '',
    teamId: '',
    teamName: '',
    content: '',
    savedTemplates: [],
  },
  isLoading: false,
  conditionNode: {
    leftOperand: '',
    operator: undefined,
    rightOperand: '',
  },
  setGoogleNode: () => undefined,
  setDiscordNode: () => undefined,
  setNotionNode: () => undefined,
  setSlackNode: () => undefined,
  setIsLoading: () => undefined,
  setWorkFlowTemplate: () => undefined,
  setTriggerNode: () => undefined,
  setEmailNode: () => undefined,
  setConditionNode: () => undefined,
}

const ConnectionsContext = createContext(InitialValues)
const { Provider } = ConnectionsContext

export const ConnectionsProvider = ({ children }: ConnectionWithChildProps) => {
  const [discordNode, setDiscordNode] = useState(InitialValues.discordNode)
  const [googleNode, setGoogleNode] = useState(InitialValues.googleNode)
  const [notionNode, setNotionNode] = useState(InitialValues.notionNode)
  const [slackNode, setSlackNode] = useState(InitialValues.slackNode)
  const [triggerNode, setTriggerNode] = useState(InitialValues.triggerNode)
  const [isLoading, setIsLoading] = useState(InitialValues.isLoading)
  const [emailNode, setEmailNode] = useState(InitialValues.emailNode)
  const [conditionNode, setConditionNode] = useState(InitialValues.conditionNode)
  const [workflowTemplate, setWorkFlowTemplate] = useState(
    InitialValues.workflowTemplate
  )
  const values = {
    discordNode,
    setDiscordNode,
    googleNode,
    setGoogleNode,
    notionNode,
    setNotionNode,
    slackNode,
    setSlackNode,
    isLoading,
    setIsLoading,
    triggerNode,
    setTriggerNode,
    workflowTemplate,
    setWorkFlowTemplate,
    emailNode,
    setEmailNode,
    conditionNode,
    setConditionNode,
  }

  return <Provider value={values}>{children}</Provider>
}

export const useNodeConnections = () => {
  const nodeConnection = useContext(ConnectionsContext)
  return { nodeConnection }
}