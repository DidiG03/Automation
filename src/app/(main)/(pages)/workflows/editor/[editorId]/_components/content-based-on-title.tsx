import { AccordionContent } from '@/components/ui/accordion'
import { ConnectionProviderProps } from '@/providers/connections-provider'
import { EditorState } from '@/providers/editor-provider'
import { nodeMapper } from '@/lib/types'
import React, { useEffect } from 'react'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { onContentChange } from '@/lib/editor-utils'
import GoogleFileDetails from './google-file-details'
import GoogleDriveFiles from './google-drive-files'
import ActionButton from './action-button'
import axios from 'axios'
import { toast } from 'sonner'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'

export interface Option {
  value: string
  label: string
  disable?: boolean
  /** fixed option that can't be removed. */
  fixed?: boolean
  /** Group the options by providing key. */
  [key: string]: string | boolean | undefined
}

type Props = {
  nodeConnection: ConnectionProviderProps
  newState: EditorState
  file: any
  setFile: (file: any) => void
  selectedSlackChannels: Option[]
  setSelectedSlackChannels: (value: Option[]) => void
}

const ContentBasedOnTitle = ({
  nodeConnection,
  newState,
  file,
  setFile,
  selectedSlackChannels,
  setSelectedSlackChannels,
}: Props) => {
  const { selectedNode } = newState.editor
  const title = selectedNode.data.title

  useEffect(() => {
    const reqGoogle = async () => {
      const response: { data: { message: { files: any } } } = await axios.get(
        '/api/drive'
      )
      if (response) {
        console.log(response.data.message.files[0])
        toast.message("Fetched File")
        setFile(response.data.message.files[0])
      } else {
        toast.error('Something went wrong')
      }
    }
    reqGoogle()
  }, [])
  
  // @ts-ignore
  const nodeConnectionType: any = nodeConnection[nodeMapper[title]]
  if (!nodeConnectionType && title !== 'Trigger') return <p className="text-sm text-center text-muted-foreground">Not Available</p>

  const isConnected =
    title === 'Trigger' 
      ? true  // Always show Trigger content
      : title === 'Google Drive'
      ? !nodeConnection.isLoading
      : !!nodeConnectionType[
          `${
            title === 'Slack'
              ? 'slackAccessToken'
              : title === 'Discord'
              ? 'webhookURL'
              : title === 'Notion'
              ? 'accessToken'
              : ''
          }`
        ]

  if (!isConnected) return <p className="text-sm text-center text-muted-foreground">Not Available</p>

  const renderTriggerContent = () => {
    if (title !== 'Trigger') return null;

    return (
      <div className="flex flex-col gap-4">
        <div className="space-y-2">
          <p>Trigger Type</p>
          <Select 
            value={nodeConnection.triggerNode.triggerType}
            onValueChange={(value) => 
              nodeConnection.setTriggerNode(prev => ({...prev, triggerType: value}))
            }
          >
            <SelectTrigger>
              <SelectValue placeholder="Select trigger type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="manual">Manual Trigger</SelectItem>
              <SelectItem value="scheduled">Scheduled Trigger</SelectItem>
              <SelectItem value="webhook">Webhook Trigger</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <p>Description</p>
          <Input
            type="text"
            value={nodeConnection.triggerNode.description}
            onChange={(e) => 
              nodeConnection.setTriggerNode(prev => ({...prev, description: e.target.value}))
            }
            placeholder="Enter trigger description"
          />
        </div>

        <div className="flex items-center space-x-2">
          <Checkbox
            id="required"
            checked={nodeConnection.triggerNode.required}
            onCheckedChange={(checked) =>
              nodeConnection.setTriggerNode(prev => ({...prev, required: checked as boolean}))
            }
          />
          <label htmlFor="required">Required</label>
        </div>
      </div>
    )
  }

  return (
    <AccordionContent>
      <Card>
        {title === 'Discord' && (
          <CardHeader>
            <CardTitle>{nodeConnectionType.webhookName}</CardTitle>
            <CardDescription>{nodeConnectionType.guildName}</CardDescription>
          </CardHeader>
        )}
        <div className="flex flex-col gap-3 px-6 py-3 pb-20">
          {title === 'Trigger' ? (
            renderTriggerContent()
          ) : (
            <>
              <p>{title === 'Notion' ? 'Values to be stored' : 'Message'}</p>

              <Input
                type="text"
                value={nodeConnectionType.content}
                onChange={(event) => onContentChange(nodeConnection, title, event)}
              />

              {JSON.stringify(file) !== '{}' && title !== 'Google Drive' && (
                <Card className="w-full">
                  <CardContent className="px-2 py-3">
                    <div className="flex flex-col gap-4">
                      <CardDescription>Drive File</CardDescription>
                      <div className="flex flex-wrap gap-2">
                        <GoogleFileDetails
                          nodeConnection={nodeConnection}
                          title={title}
                          gFile={file}
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
              {title === 'Google Drive' && <GoogleDriveFiles />}
            </>
          )}
          <ActionButton
            currentService={title}
            nodeConnection={nodeConnection}
            channels={selectedSlackChannels}
            setChannels={setSelectedSlackChannels}
          />
        </div>
      </Card>
    </AccordionContent>
  )
}

export default ContentBasedOnTitle
