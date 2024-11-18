import { db } from '@/lib/db'
import { EmailConfigSchema } from './types'
import { sendEmail } from '@/app/(main)/(pages)/connections/_actions/email-connection'
import { useExecutionStore } from '@/store/execution-store'

type NodeExecutionContext = {
  workflowId: string
  userId: string
  nodes: any[]
  edges: any[]
  currentNodeId: string
}

export class WorkflowExecutor {
  private getNextNodes(context: NodeExecutionContext): string[] {
    console.log('\n[getNextNodes] Finding next nodes for:', context.currentNodeId)
    const nextNodes = context.edges
      .filter(edge => edge.source === context.currentNodeId)
      .map(edge => edge.target)
    console.log('[getNextNodes] Found next nodes:', nextNodes)
    return nextNodes
  }

  private async executeNodeByType(node: any, context: NodeExecutionContext) {
    switch (node.type) {
      case 'Email':
        return this.executeEmailNode(node, context)
      case 'Trigger':
        return this.executeTriggerNode(node, context)
      // Add other node types here
      default:
        throw new Error(`Unsupported node type: ${node.type}`)
    }
  }

  private async executeTriggerNode(node: any, context: NodeExecutionContext) {
    console.log('\n[executeTriggerNode] Starting trigger node execution:', node)
    try {
      // Trigger nodes typically just start the workflow
      return true
    } catch (error) {
      console.error('[executeTriggerNode] Error:', error)
      throw error
    }
  }

  private async executeEmailNode(node: any, context: NodeExecutionContext) {
    console.log('\n[executeEmailNode] Starting email node execution:', node)
    try {
      // Fetch email template from database
      const emailTemplate = await db.emailTemplate.findFirst({
        where: {
          workflowId: context.workflowId,
          name: node.data.templateName
        }
      })

      if (!emailTemplate) {
        throw new Error('Email template not found')
      }

      console.log('[executeEmailNode] Found email template:', emailTemplate)

      // Get email configuration from template
      const emailConfig = {
        to: emailTemplate.to,
        subject: emailTemplate.subject,
        body: emailTemplate.body
      }
      console.log('[executeEmailNode] Email config:', emailConfig)

      // Validate email data
      const validatedData = EmailConfigSchema.parse(emailConfig)
      console.log('[executeEmailNode] Validated email data:', validatedData)

      // Send email
      console.log('[executeEmailNode] Attempting to send email...')
      const response = await sendEmail({
        to: validatedData.to,
        subject: validatedData.subject,
        body: validatedData.body,
      })
      console.log('[executeEmailNode] Email send response:', response)

      if (!response.success) {
        throw new Error(response.message || 'Failed to send email')
      }

      return true
    } catch (error) {
      console.error('[executeEmailNode] Error:', error)
      throw error
    }
  }

  private async executeNode(node: any, context: NodeExecutionContext) {
    const executionStore = useExecutionStore.getState()
    
    try {
      // Add step when starting execution
      executionStore.addStep({
        id: node.id,
        nodeType: node.type,
        status: 'running',
        message: `Executing ${node.type} node`,
        timestamp: new Date()
      })

      // Execute the node
      const result = await this.executeNodeByType(node, context)

      // Update step on success
      executionStore.updateStep(node.id, {
        status: 'completed',
        message: `Successfully executed ${node.type} node`,
        timestamp: new Date()
      })

      return result
    } catch (error) {
      // Update step on failure
      executionStore.updateStep(node.id, {
        status: 'failed',
        message: error.message || `Failed to execute ${node.type} node`,
        timestamp: new Date()
      })
      throw error
    }
  }

  public async execute(workflowId: string, userId: string, nodes: any[], edges: any[], triggerId: string) {
    console.log('\n[execute] Starting workflow execution:', {
      workflowId,
      userId,
      triggerId,
      totalNodes: nodes.length,
      totalEdges: edges.length
    })

    const executionStore = useExecutionStore.getState()
    executionStore.clearSteps() // Clear previous execution steps

    try {
      // Find trigger node
      console.log('[execute] Looking for trigger node:', triggerId)
      const triggerNode = nodes.find(node => node.id === triggerId)
      if (!triggerNode) {
        console.error('[execute] Trigger node not found')
        throw new Error('Trigger node not found')
      }
      console.log('[execute] Found trigger node:', triggerNode)

      const context: NodeExecutionContext = {
        workflowId,
        userId,
        nodes,
        edges,
        currentNodeId: triggerNode.id
      }

      // Start execution from trigger
      console.log('[execute] Getting nodes connected to trigger')
      let currentNodes = this.getNextNodes(context)
      let executionLevel = 1

      while (currentNodes.length > 0) {
        console.log(`\n[execute] Executing level ${executionLevel} nodes:`, currentNodes)
        const nextNodes: string[] = []

        // Execute all current level nodes
        for (const nodeId of currentNodes) {
          console.log(`\n[execute] Processing node: ${nodeId}`)
          const node = nodes.find(n => n.id === nodeId)
          
          if (!node) {
            console.log(`[execute] Node ${nodeId} not found, skipping`)
            continue
          }

          // Execute the node
          console.log('[execute] Executing node:', node)
          await this.executeNode(node, {
            ...context,
            currentNodeId: nodeId
          })

          // Get next nodes
          console.log('[execute] Finding subsequent nodes')
          const subsequent = this.getNextNodes({
            ...context,
            currentNodeId: nodeId
          })
          console.log('[execute] Found subsequent nodes:', subsequent)
          nextNodes.push(...subsequent)
        }

        currentNodes = nextNodes
        executionLevel++
        console.log(`[execute] Moving to level ${executionLevel} with nodes:`, nextNodes)
      }

      console.log('[execute] Workflow execution completed successfully')
      return true
    } catch (error) {
      console.error('[execute] Workflow execution failed:', error)
      throw error
    }
  }
} 