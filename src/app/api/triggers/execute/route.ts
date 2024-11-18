import { db } from '@/lib/db'
import { auth } from '@clerk/nextjs'
import { NextResponse } from 'next/server'
import { WorkflowExecutor } from '@/lib/workflow-executor'

export async function POST(req: Request) {
  console.log('\n[TRIGGER_EXECUTE] Starting trigger execution')
  
  try {
    const { userId } = auth()
    if (!userId) {
      console.log('[TRIGGER_EXECUTE] No userId found')
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 }
      )
    }
    console.log('[TRIGGER_EXECUTE] Authenticated userId:', userId)

    const body = await req.json()
    console.log('[TRIGGER_EXECUTE] Request body:', body)
    const { type, workflowId, triggerConfig } = body

    console.log('[TRIGGER_EXECUTE] Fetching trigger from database')
    // Verify the trigger exists and belongs to this workflow
    const trigger = await db.workflowTrigger.findFirst({
      where: {
        workflowId: workflowId,
        type: type,
        userId: userId,
      },
      select: {
        id: true,
        type: true,
        description: true,
        runImmediately: true,
        workflowId: true,
        workflow: {
          select: {
            id: true,
            name: true,
            description: true,
            nodes: true,
            edges: true,
            discordTemplate: true,
            notionTemplate: true,
            slackTemplate: true
          }
        }
      }
    })
    console.log('[TRIGGER_EXECUTE] Database trigger result:', trigger)

    if (!trigger) {
      console.log('[TRIGGER_EXECUTE] Trigger not found')
      return NextResponse.json(
        { success: false, message: 'Trigger not found' },
        { status: 404 }
      )
    }

    // Parse nodes and edges from the workflow
    console.log('[TRIGGER_EXECUTE] Parsing workflow nodes and edges')
    const nodes = JSON.parse(trigger.workflow.nodes || '[]')
    const edges = JSON.parse(trigger.workflow.edges || '[]')
    console.log('[TRIGGER_EXECUTE] Parsed nodes:', nodes)
    console.log('[TRIGGER_EXECUTE] Parsed edges:', edges)

    // Find trigger node in the workflow
    console.log('[TRIGGER_EXECUTE] Looking for trigger node')
    const triggerNode = nodes.find((node: any) => node.type === 'Trigger')
    if (!triggerNode) {
      console.log('[TRIGGER_EXECUTE] Trigger node not found in workflow')
      return NextResponse.json(
        { success: false, message: 'Trigger node not found in workflow' },
        { status: 404 }
      )
    }
    console.log('[TRIGGER_EXECUTE] Found trigger node:', triggerNode)

    // Execute the workflow
    console.log('[TRIGGER_EXECUTE] Starting workflow execution')
    const executor = new WorkflowExecutor()
    await executor.execute(workflowId, userId, nodes, edges, triggerNode.id)
    
    console.log('[TRIGGER_EXECUTE] Workflow executed successfully')
    return NextResponse.json({
      success: true,
      message: `Workflow "${trigger.workflow.name}" executed successfully`
    })

  } catch (error) {
    console.error('[TRIGGER_EXECUTE] Error:', error)
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    )
  }
} 