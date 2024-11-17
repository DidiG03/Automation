import { EditorCanvasCardType } from '@/lib/types'
import { useEditor } from '@/providers/editor-provider'
import React, { useMemo } from 'react'
import { Position, useNodeId } from 'reactflow'
import EditorCanvasIconHelper from './editor-canvas-card-icon-hepler'
import CustomHandle from './custom-handle'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Book, PlayIcon } from 'lucide-react'
import { useNodeConnections } from '@/providers/connections-provider'
import { executeTrigger } from '@/app/(main)/(pages)/connections/_actions/trigger-connection'
import { toast } from 'sonner'
import { usePathname } from 'next/navigation'

import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import clsx from 'clsx'
import { TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { Tooltip } from '@/components/ui/tooltip'
import { TooltipProvider } from '@/components/ui/tooltip'

type Props = {}

const EditorCanvasCardSingle = ({ data }: { data: EditorCanvasCardType }) => {
  const { dispatch, state } = useEditor()
  const { nodeConnection } = useNodeConnections()
  const pathname = usePathname()
  const nodeId = useNodeId()
  const logo = useMemo(() => {
    return <EditorCanvasIconHelper type={data.type} />
  }, [data])

  const renderTriggerButton = () => {
    if (data.type !== 'Trigger' || !nodeConnection.triggerNode.loadedTrigger) return null;

    const triggerConfig = {
      triggerType: nodeConnection.triggerNode.loadedTrigger.triggerType,
      description: nodeConnection.triggerNode.loadedTrigger.description,
      triggerName: nodeConnection.triggerNode.loadedTrigger.triggerName,
      required: nodeConnection.triggerNode.loadedTrigger.required
    };

    return (
      <Button 
        size="sm"
        variant="ghost"
        className="absolute bottom-1 right-1"
        onClick={async (e) => {
          e.preventDefault()
          e.stopPropagation()
          try {
            const response = await executeTrigger({
              type: triggerConfig.triggerType,
              workflowId: pathname.split('/').pop()!,
              triggerConfig
            })
            if (response.success) {
              toast.success(response.message || 'Trigger executed successfully')
            } else {
              toast.error(response.message || 'Failed to execute trigger')
            }
          } catch (error) {
            toast.error('Failed to execute trigger')
          }
        }}
      >
        <TooltipProvider>
          <Tooltip delayDuration={0}>
            <TooltipTrigger>
              <PlayIcon className="h-3 w-3" />
            </TooltipTrigger>
            <TooltipContent>  
              <p className='text-xs font-light'>Execute Trigger</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </Button>
    )
  }

  const renderCardDescription = () => {
    if (data.type === 'Trigger' && nodeConnection.triggerNode.loadedTrigger) {
      return (
        <>
          <p className="text-xs text-muted-foreground/50">
            <b className="text-muted-foreground/80">Trigger Name: </b>
            {nodeConnection.triggerNode.savedTemplates}
          </p>
          <p className="text-xs text-muted-foreground/50">
            <b className="text-muted-foreground/80">Trigger Description: </b>
            {nodeConnection.triggerNode.loadedTrigger?.description}
          </p>
          <p className="text-xs text-muted-foreground/50">
            <b className="text-muted-foreground/80">ID: </b>
            {nodeId}
          </p>
        </>
      )
    }

    if (data.type === 'Email' && nodeConnection.emailNode) {
      return (
        <>
          <p className="text-xs text-muted-foreground/50">
            <b className="text-muted-foreground/80">To: </b>
            {nodeConnection.emailNode.to}
          </p>
          <p className="text-xs text-muted-foreground/50">
            <b className="text-muted-foreground/80">Preset: </b>
            {nodeConnection.emailNode.savedTemplates}
          </p>
          <p className="text-xs text-muted-foreground/50">
            <b className="text-muted-foreground/80">ID: </b>
            {nodeId}
          </p>
        </>
      )
    }
    return (
      <p className="text-xs text-muted-foreground/50">
        <b className="text-muted-foreground/80">ID: </b>
        {nodeId}
      </p>
    )
  }

  return (
    <>
      {data.type !== 'Trigger' && data.type !== 'Google Drive' && (
        <CustomHandle
          type="target"
          position={Position.Top}
          style={{ zIndex: 100 }}
        />
      )}
      <Card
        onClick={(e) => {
          e.stopPropagation()
          const val = state.editor.elements.find((n) => n.id === nodeId)
          if (val)
            dispatch({
              type: 'SELECTED_ELEMENT',
              payload: {
                element: val,
              },
            })
        }}
        className="relative max-w-[400px] dark:border-muted-foreground/70"
      >
        <CardHeader className="flex flex-row items-center gap-4">
          <div>{logo}</div>
          <div>
            <CardDescription className='p-3'>
              {renderCardDescription()}
            </CardDescription>
          </div>
        </CardHeader>
        <Badge
          variant="secondary"
          className="absolute right-2 top-2"
        >
          {data.type}
        </Badge>
        <div
          className={clsx('absolute left-3 top-4 h-2 w-2 rounded-full', {
            'bg-green-500': Math.random() < 0.6,
            'bg-orange-500': Math.random() >= 0.6 && Math.random() < 0.8,
            'bg-red-500': Math.random() >= 0.8,
          })}
        />
        {renderTriggerButton()}
      </Card>
      <CustomHandle
        type="source"
        position={Position.Bottom}
        id="a"
      />
    </>
  )
}

export default EditorCanvasCardSingle
