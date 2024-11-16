'use client'
import { EditorCanvasTypes, EditorNodeType } from '@/lib/types'
import { useNodeConnections } from '@/providers/connections-provider'
import { useEditor } from '@/providers/editor-provider'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import React, { useEffect } from 'react'
import { Separator } from '@/components/ui/separator'
import { CONNECTIONS, EditorCanvasDefaultCardTypes } from '@/lib/constant'
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  fetchBotSlackChannels,
  onAddTemplate,
  onConnections,
  onDragStart,
} from '@/lib/editor-utils'
import EditorCanvasIconHelper from './editor-canvas-card-icon-hepler'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import RenderConnectionAccordion from './render-connection-accordion'
import RenderOutputAccordion from './render-output-accordian'
import { useFuzzieStore } from '@/store'
import { nodeMapper } from '@/lib/types'
import { TrashIcon, PlayIcon, UploadIcon } from 'lucide-react'
import { usePathname } from 'next/navigation'
import { TooltipProvider } from '@/components/ui/tooltip'
import { TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { Tooltip } from '@/components/ui/tooltip'

type Props = {
  nodes: EditorNodeType[]
}

const EditorCanvasSidebar = ({ nodes }: Props) => {
  const pathname = usePathname()
  const { state } = useEditor()
  const { nodeConnection } = useNodeConnections()
  const { googleFile, setSlackChannels } = useFuzzieStore()
  useEffect(() => {
    if (state) {
      onConnections(nodeConnection, state, googleFile)
    }
  }, [state])

  useEffect(() => {
    if (nodeConnection.slackNode.slackAccessToken) {
      fetchBotSlackChannels(
        nodeConnection.slackNode.slackAccessToken,
        setSlackChannels
      )
    }
  }, [nodeConnection])

  const renderSavedTemplates = () => {
    const nodeType = state.editor.selectedNode.data.title
    const connectionKey = nodeMapper[nodeType] as keyof typeof nodeConnection
    
    if (!connectionKey || !nodeConnection[connectionKey]) return null

    const templates = nodeConnection[connectionKey].savedTemplates
    
    if (!templates?.length) {
      return <div className="px-4 py-2 text-sm text-muted-foreground">No saved templates</div>
    }

    return templates.map((template: string, index: number) => (
      <div 
        key={index}
        className="flex border border-neutral-800 items-center justify-between px-4 py-2 rounded-md cursor-pointer"
      >
        <span className="text-sm truncate">{template}</span>
        <div className='flex items-center gap-2'>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onAddTemplate(nodeConnection, nodeType, template)}
          >
            <TooltipProvider>
              <Tooltip delayDuration={0}>
                <TooltipTrigger>
                  <UploadIcon className="h-3 w-3" />
                </TooltipTrigger>
                <TooltipContent>
                  <p className='text-xs font-light'>Load Preset</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </Button>
          <Button
            variant="ghost"
            size="sm"
          >
            <TooltipProvider>
              <Tooltip delayDuration={0}>
                <TooltipTrigger>
                  <TrashIcon className="h-3 w-3" />
                </TooltipTrigger>
                <TooltipContent>
                  <p className='text-xs font-light'>Delete Preset</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </Button>
        </div>
      </div>
    ))
  }

  return (
    <aside>
      <Tabs
        defaultValue="actions"
        className="h-screen overflow-scroll pb-24"
      >
        <TabsList className="bg-transparent">
          <TabsTrigger value="actions">Actions</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>
        <Separator />
        <TabsContent
          value="actions"
          className="flex flex-col gap-4 p-4"
        >
          {Object.entries(EditorCanvasDefaultCardTypes)
            .filter(
              ([_, cardType]) =>
                (!nodes.length && cardType.type === 'Trigger') ||
                (nodes.length && cardType.type === 'Action')
            )
            .map(([cardKey, cardValue]) => (
              <Card
                key={cardKey}
                draggable
                className="w-full cursor-grab border-black bg-neutral-100 dark:border-neutral-700 dark:bg-neutral-900"
                onDragStart={(event) =>
                  onDragStart(event, cardKey as EditorCanvasTypes)
                }
              >
                <CardHeader className="flex flex-row items-center gap-4 p-4">
                  <EditorCanvasIconHelper type={cardKey as EditorCanvasTypes} />
                  <div className="flex-1">
                    <CardTitle className="text-md">
                      {cardKey}
                      <CardDescription>{cardValue.description}</CardDescription>
                    </CardTitle>
                  </div>
                </CardHeader>
              </Card>
            ))}
        </TabsContent>
        <TabsContent
          value="settings"
          className="-mt-6"
        >
          <div className="px-2 py-4 text-center text-xl font-bold">
            {state.editor.selectedNode.data.title}
          </div>

          <Accordion type="multiple">
            <AccordionItem
              value="Options"
              className="border-y-[1px] px-2"
            >
              <AccordionTrigger className="!no-underline">
                Account
              </AccordionTrigger>
              <AccordionContent>
                {CONNECTIONS.map((connection) => (
                  <RenderConnectionAccordion
                    key={connection.title}
                    state={state}
                    connection={connection}
                  />
                ))}
              </AccordionContent>
            </AccordionItem>
            <AccordionItem
              value="Expected Output"
              className="px-2"
            >
              <AccordionTrigger className="!no-underline">
                Action
              </AccordionTrigger>
              <RenderOutputAccordion
                state={state}
                nodeConnection={nodeConnection}
              />
            </AccordionItem>
            <AccordionItem value="saved" className='px-2'>
              <AccordionTrigger className='!no-underline'>Saved</AccordionTrigger>
              <AccordionContent>
                {renderSavedTemplates()}
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </TabsContent>
      </Tabs>
    </aside>
  )
}

export default EditorCanvasSidebar
