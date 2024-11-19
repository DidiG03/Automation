'use client'
import { EditorCanvasTypes, EditorNodeType, ConditionOperator } from '@/lib/types'
import { useNodeConnections } from '@/providers/connections-provider'
import { useEditor } from '@/providers/editor-provider'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import React, { useEffect, useState } from 'react'
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
import { TrashIcon, UploadIcon } from 'lucide-react'
import { usePathname } from 'next/navigation'
import { TooltipProvider } from '@/components/ui/tooltip'
import { TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { Tooltip } from '@/components/ui/tooltip'
import { EmailPreviewModal } from './email-preview-modal'
import { loadEmailTemplate } from '@/app/(main)/(pages)/connections/_actions/load-email-template'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { toast } from 'sonner'
import { ExecutionProcess } from './execution-process'

type Props = {
  nodes: EditorNodeType[]
}

const EditorCanvasSidebar = ({ nodes }: Props) => {
  const pathname = usePathname()
  const { state } = useEditor()
  const { nodeConnection } = useNodeConnections()
  const { googleFile, setSlackChannels } = useFuzzieStore()
  const [selectedTemplate, setSelectedTemplate] = useState<string>('')
  const workflowId = pathname.split('/').pop()!

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

  const handleTemplateSelect = async (templateName: string) => {
    setSelectedTemplate(templateName)
    const response = await loadEmailTemplate(templateName, workflowId)
    
    if (response.success && response.template) {
      nodeConnection.setEmailNode(prev => ({
        ...prev,
        to: response.template.to,
        subject: response.template.subject,
        body: response.template.body
      }))
    } else {
      toast.error('Failed to load template')
    }
  }

  const renderSavedTemplates = () => {
    const nodeType = state.editor.selectedNode.data.title
    const connectionKey = nodeMapper[nodeType] as keyof typeof nodeConnection
    
    if (!connectionKey || !nodeConnection[connectionKey]) return null

    const templates = nodeConnection[connectionKey].savedTemplates
    
    if (!templates?.length) {
      return <div className="px-4 py-2 text-sm text-muted-foreground">No saved templates</div>
    }

    if (nodeType === 'Email') {
      return (
        <div className="space-y-4 px-4">
          <div className="space-y-2">
            <div className="flex gap-2">
              <Select
                value={selectedTemplate}
                onValueChange={handleTemplateSelect}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select template" />
                </SelectTrigger>
                <SelectContent>
                  <ScrollArea className="h-[200px]">
                    {templates.map((template: any) => (
                      <SelectItem key={template} value={template}>
                        {template}
                      </SelectItem>
                    ))}
                  </ScrollArea>
                </SelectContent>
              </Select>
              {selectedTemplate && (
                <EmailPreviewModal
                  template={{
                    to: nodeConnection.emailNode.to,
                    subject: nodeConnection.emailNode.subject,
                    body: nodeConnection.emailNode.body
                  }}
                />
              )}
            </div>
          </div>
        </div>
      )
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

  const renderConditionSettings = () => {
    const nodeType = state.editor.selectedNode.data.title
    if (nodeType !== 'Condition') return null

    const operators: ConditionOperator[] = ['equals', 'not_equals', 'greater_than', 'less_than', 'contains']

    return (
      <div className="space-y-4 px-4">
        <div className="space-y-2">
          <label className="text-sm font-medium">Left Operand</label>
          <Input
            placeholder="Enter left operand"
            value={nodeConnection.conditionNode.leftOperand}
            onChange={(e) => nodeConnection.setConditionNode(prev => ({
              ...prev,
              leftOperand: e.target.value
            }))}
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Operator</label>
          <Select
            value={nodeConnection.conditionNode.operator || ''}
            onValueChange={(value: ConditionOperator) => 
              nodeConnection.setConditionNode(prev => ({
                ...prev,
                operator: value
              }))
            }
          >
            <SelectTrigger>
              <SelectValue placeholder="Select operator" />
            </SelectTrigger>
            <SelectContent>
              {operators.map((op) => (
                <SelectItem key={op} value={op}>
                  {op.replace('_', ' ')}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Right Operand</label>
          <Input
            placeholder="Enter right operand"
            value={nodeConnection.conditionNode.rightOperand}
            onChange={(e) => nodeConnection.setConditionNode(prev => ({
              ...prev,
              rightOperand: e.target.value
            }))}
          />
        </div>
      </div>
    )
  }

  return (
    <aside className="h-full">
      <Tabs defaultValue="nodes">
        <TabsList className="w-full">
          <TabsTrigger value="nodes">Nodes</TabsTrigger>
          <TabsTrigger value="execution">Execution</TabsTrigger>
        </TabsList>
        <TabsContent value="nodes">
          <Accordion
            type="single"
            collapsible
            className="w-full"
          >
            <AccordionItem
              value="account"
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
              value="action"
              className="px-2"
            >
              <AccordionTrigger className="!no-underline">
                Action
              </AccordionTrigger>
              <AccordionContent>
                {state.editor.selectedNode.data.title === 'Condition' ? (
                  renderConditionSettings()
                ) : (
                  <RenderOutputAccordion
                    state={state}
                    nodeConnection={nodeConnection}
                  />
                )}
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="saved" className='px-2'>
              <AccordionTrigger className='!no-underline'>
                Saved
              </AccordionTrigger>
              <AccordionContent>
                {renderSavedTemplates()}
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </TabsContent>
        <TabsContent value="execution">
          <ExecutionProcess />
        </TabsContent>
      </Tabs>
    </aside>
  )
}

export default EditorCanvasSidebar
