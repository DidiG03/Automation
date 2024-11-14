import { NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs'
import { db } from '@/lib/db'

export async function POST(req: Request) {
  try {
    const { userId } = auth()
    if (!userId) {
      return new NextResponse('Unauthorized', { status: 401 })
    }

    const body = await req.json()
    console.log('[WORKFLOW_TRIGGER_BODY]', body)
    // Validate workflowId
    const workflow = await db.workflows.findUnique({
      where: { id: body.workflowId },
    })

    if (!workflow) {
      return NextResponse.json({
        success: false,
        message: 'Workflow not found',
      })
    }

    switch (body.triggerConfig.triggerType) {
      case 'manual':
        // For manual triggers, we just need to store the configuration
        await db.workflowTrigger.upsert({
          where: {
            workflowId_type: {
              workflowId: body.workflowId,
              type: body.triggerConfig.triggerType,
            },
          },
          update: {
            updatedAt: new Date(),
          },
          create: {
            workflowId: body.workflowId,
            type: body.triggerConfig.triggerType,
            description: body.triggerConfig.description,
            runImmediately: body.triggerConfig.runImmediately,
            userId,
          },
        })

        return NextResponse.json({
          success: true,
          message: 'Manual trigger configured successfully',
        })
      default:
        return NextResponse.json({
          success: false,
          message: 'Invalid trigger type',
        })
    }
  } catch (error) {
    console.error('[WORKFLOW_TRIGGER]', error)
    return new NextResponse('Internal Error', { status: 500 })
  }
} 