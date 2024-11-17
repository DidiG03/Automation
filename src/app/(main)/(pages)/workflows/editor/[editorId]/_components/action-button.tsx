import React, { useCallback } from 'react'
import { Option } from './content-based-on-title'
import { ConnectionProviderProps } from '@/providers/connections-provider'
import { usePathname } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { postContentToWebHook } from '@/app/(main)/(pages)/connections/_actions/discord-connection'
import { onCreateNodeTemplate } from '../../../_actions/workflow-connections'
import { toast } from 'sonner'
import { onCreateNewPageInDatabase } from '@/app/(main)/(pages)/connections/_actions/notion-connection'
import { postMessageToSlack } from '@/app/(main)/(pages)/connections/_actions/slack-connection'
import { createWorkflowTrigger } from '../../_actions/trigger-actions'
import { saveEmailTemplate } from '@/app/(main)/(pages)/connections/_actions/save-email-template'

type Props = {
  currentService: string
  nodeConnection: ConnectionProviderProps
  channels?: Option[]
  setChannels?: (value: Option[]) => void
}

const ActionButton = ({
  currentService,
  nodeConnection,
  channels,
  setChannels,
}: Props) => {
  const pathname = usePathname()
  const workflowId = pathname.split('/').pop()!

  const onSendDiscordMessage = useCallback(async () => {
    const response = await postContentToWebHook(
      nodeConnection.discordNode.content,
      nodeConnection.discordNode.webhookURL
    )

    if (response.message == 'success') {
      nodeConnection.setDiscordNode((prev: any) => ({
        ...prev,
        content: '',
      }))
    }
  }, [nodeConnection.discordNode])

  const onStoreNotionContent = useCallback(async () => {
    console.log(
      nodeConnection.notionNode.databaseId,
      nodeConnection.notionNode.accessToken,
      nodeConnection.notionNode.content
    )
    const response = await onCreateNewPageInDatabase(
      nodeConnection.notionNode.databaseId,
      nodeConnection.notionNode.accessToken,
      nodeConnection.notionNode.content
    )
    if (response) {
      nodeConnection.setNotionNode((prev: any) => ({
        ...prev,
        content: '',
      }))
    }
  }, [nodeConnection.notionNode])

  const onStoreSlackContent = useCallback(async () => {
    const response = await postMessageToSlack(
      nodeConnection.slackNode.slackAccessToken,
      channels!,
      nodeConnection.slackNode.content
    )
    if (response.message == 'Success') {
      toast.success('Message sent successfully')
      nodeConnection.setSlackNode((prev: any) => ({
        ...prev,
        content: '',
      }))
      setChannels!([])
    } else {
      toast.error(response.message)
    }
  }, [nodeConnection.slackNode, channels])

  const onCreateLocalNodeTempate = useCallback(async () => {
    if (currentService === 'Discord') {
      const response = await onCreateNodeTemplate(
        nodeConnection.discordNode.content,
        currentService,
        pathname.split('/').pop()!
      )

      if (response) {
        toast.message(response)
      }
    }
    if (currentService === 'Slack') {
      const response = await onCreateNodeTemplate(
        nodeConnection.slackNode.content,
        currentService,
        pathname.split('/').pop()!,
        channels,
        nodeConnection.slackNode.slackAccessToken
      )

      if (response) {
        toast.message(response)
      }
    }

    if (currentService === 'Notion') {
      const response = await onCreateNodeTemplate(
        JSON.stringify(nodeConnection.notionNode.content),
        currentService,
        pathname.split('/').pop()!,
        [],
        nodeConnection.notionNode.accessToken,
        nodeConnection.notionNode.databaseId
      )

      if (response) {
        toast.message(response)
      }
    }
  }, [nodeConnection, channels])

  const onSaveTriggerTemplate = useCallback(async () => {
    if (!nodeConnection.triggerNode.triggerType || !nodeConnection.triggerNode.description) {
      toast.error('Please fill in all required fields')
      return
    }

    const response = await createWorkflowTrigger(
      workflowId,
      nodeConnection.triggerNode
    )

    if (response) {
      nodeConnection.setTriggerNode(prev => ({
        triggerType: '',
        triggerName: '',
        description: '',
        required: false,
        loadedTrigger: prev.loadedTrigger,
        savedTemplates: prev.savedTemplates
      }))
      toast.success('Trigger saved')
    }
  }, [nodeConnection.triggerNode, workflowId])

  const onSaveAndLoadTrigger = useCallback(async () => {
    if (!nodeConnection.triggerNode.triggerType || !nodeConnection.triggerNode.description) {
      toast.error('Please fill in all required fields')
      return
    }

    const response = await createWorkflowTrigger(
      workflowId,
      nodeConnection.triggerNode
    )

    if (response) {
      nodeConnection.setTriggerNode(prev => ({
        ...prev,
        loadedTrigger: {
          triggerType: prev.triggerType,
          triggerName: prev.triggerName,
          description: prev.description,
          required: prev.required
        },
        savedTemplates: prev.savedTemplates ? [...prev.savedTemplates, prev.description] : [prev.description]
      }))
      
      toast.success('Trigger saved and loaded')
    }
  }, [nodeConnection.triggerNode, workflowId])

  const onSaveEmailTemplate = useCallback(async () => {
    if (!nodeConnection.emailNode.to || !nodeConnection.emailNode.subject || !nodeConnection.emailNode.body) {
      toast.error('Please fill in all required fields')
      return
    }

    const response = await saveEmailTemplate({
      workflowId,
      name: nodeConnection.emailNode.subject,
      to: nodeConnection.emailNode.to,
      subject: nodeConnection.emailNode.subject,
      body: nodeConnection.emailNode.body,
    })

    if (response.success) {
      nodeConnection.setEmailNode(prev => ({
        ...prev,
        savedTemplates: prev.savedTemplates 
          ? [...prev.savedTemplates, nodeConnection.emailNode.subject]
          : [nodeConnection.emailNode.subject]
      }))
      toast.success('Email template saved')
    } else {
      toast.error(response.error || 'Failed to save template')
    }
  }, [nodeConnection.emailNode, workflowId])

  const onSaveAndLoadEmailTemplate = useCallback(async () => {
    if (!nodeConnection.emailNode.to || !nodeConnection.emailNode.subject || !nodeConnection.emailNode.body) {
      toast.error('Please fill in all required fields')
      return
    }

    const response = await saveEmailTemplate({
      workflowId,
      name: nodeConnection.emailNode.subject,
      to: nodeConnection.emailNode.to,
      subject: nodeConnection.emailNode.subject,
      body: nodeConnection.emailNode.body,
    })

    if (response.success) {
      nodeConnection.setEmailNode(prev => ({
        ...prev,
        loadedTemplate: {
          to: prev.to,
          subject: prev.subject,
          body: prev.body,
        },
        savedTemplates: prev.savedTemplates 
          ? [...prev.savedTemplates, prev.subject]
          : [prev.subject]
      }))
      toast.success('Email template saved and loaded')
    } else {
      toast.error(response.error || 'Failed to save template')
    }
  }, [nodeConnection.emailNode, workflowId])

  const renderActionButton = () => {
    switch (currentService) {
      case 'Discord':
        return (
          <>
            <Button
              variant="outline"
              onClick={onSendDiscordMessage}
            >
              Test Message
            </Button>
            <Button
              onClick={onCreateLocalNodeTempate}
              variant="outline"
            >
              Save Template
            </Button>
          </>
        )

      case 'Notion':
        return (
          <>
            <Button
              variant="outline"
              onClick={onStoreNotionContent}
            >
              Test
            </Button>
            <Button
              onClick={onCreateLocalNodeTempate}
              variant="outline"
            >
              Save Template
            </Button>
          </>
        )

      case 'Slack':
        return (
          <>
            <Button
              variant="outline"
              onClick={onStoreSlackContent}
            >
              Send Message
            </Button>
            <Button
              onClick={onCreateLocalNodeTempate}
              variant="outline"
            >
              Save Template
            </Button>
          </>
        )

      case 'Trigger':
        return (
          <>
            <Button
              onClick={onSaveTriggerTemplate}
              variant="outline"
            >
              Save Trigger
            </Button>
            <Button 
              onClick={onSaveAndLoadTrigger}
              variant="outline"
            >
              Save & Load Trigger
            </Button>
          </>
        )
      default:
        return null
    }
  }
  return renderActionButton()
}

export default ActionButton