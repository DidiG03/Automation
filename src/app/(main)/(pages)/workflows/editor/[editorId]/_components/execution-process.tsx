'use client'
import { useEditor } from '@/providers/editor-provider'
import { ScrollArea } from '@/components/ui/scroll-area'
import { 
  CheckCircle2, 
  Circle, 
  Clock, 
  Mail, 
  PlayCircle, 
  XCircle 
} from 'lucide-react'
import { useEffect, useState } from 'react'

type ExecutionStep = {
  id: string
  nodeType: string
  status: 'pending' | 'running' | 'completed' | 'failed'
  message: string
  timestamp: Date
}

export const ExecutionProcess = () => {
  const { state } = useEditor()
  const [executionSteps, setExecutionSteps] = useState<ExecutionStep[]>([])

  // Mock execution steps - replace with real execution data
  useEffect(() => {
    const steps = state.editor.elements.map((node) => ({
      id: node.id,
      nodeType: node.type,
      status: 'pending' as const,
      message: `Waiting to execute ${node.type} node`,
      timestamp: new Date()
    }))
    setExecutionSteps(steps)
  }, [state.editor.elements])

  const getNodeIcon = (nodeType: string) => {
    switch (nodeType) {
      case 'Trigger':
        return <PlayCircle className="h-5 w-5" />
      case 'Email':
        return <Mail className="h-5 w-5" />
      // Add more node type icons as needed
      default:
        return <Circle className="h-5 w-5" />
    }
  }

  const getStatusIcon = (status: ExecutionStep['status']) => {
    switch (status) {
      case 'completed':
        return <CheckCircle2 className="h-4 w-4 text-green-500" />
      case 'running':
        return <Clock className="h-4 w-4 text-blue-500 animate-spin" />
      case 'failed':
        return <XCircle className="h-4 w-4 text-red-500" />
      default:
        return <Circle className="h-4 w-4 text-gray-400" />
    }
  }

  return (
    <div className="p-4 space-y-4">
      <h3 className="text-lg font-semibold">Execution Process</h3>
      <ScrollArea className="h-[300px] pr-4">
        <div className="space-y-4">
          {executionSteps.map((step, index) => (
            <div key={step.id} className="relative">
              {/* Connection Line */}
              {index < executionSteps.length - 1 && (
                <div className="absolute left-[17px] top-[28px] w-[2px] h-[calc(100%+16px)] bg-border" />
              )}
              
              {/* Step Card */}
              <div className="relative flex items-start space-x-3 rounded-lg border bg-card p-3 shadow-sm">
                {/* Node Type Icon */}
                <div className="flex-shrink-0">
                  {getNodeIcon(step.nodeType)}
                </div>

                {/* Content */}
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium">{step.nodeType}</p>
                    {getStatusIcon(step.status)}
                  </div>
                  <p className="mt-1 text-xs text-muted-foreground">{step.message}</p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {step.timestamp.toLocaleTimeString()}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>
    </div>
  )
} 