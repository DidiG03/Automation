import { NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs'
import { db } from '@/lib/db'

export async function GET() {
  try {
    const { userId } = auth()
    
    if (!userId) {
      return new NextResponse('Unauthorized', { status: 401 })
    }

    const workflowTriggers = await db.workflowTrigger.findMany({
      where: {
        userId: userId,
      },
      select: {
        id: true,
        type: true,
        triggerName: true,
        description: true,
        runImmediately: true,
        workflowId: true,
      },
    })

    return NextResponse.json(workflowTriggers)
  } catch (error) {
    console.error('[WORKFLOW_TRIGGERS_GET]', error)
    return new NextResponse('Internal Error', { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const { userId } = auth()
    if (!userId) {
      return new NextResponse('Unauthorized', { status: 401 })
    }

    const { workflowId, type, description, runImmediately, triggerName } = await req.json()

    if (!workflowId || !type || !description) {
      return new NextResponse('Missing required fields', { status: 400 })
    }

    // Check if a trigger of this type already exists for this workflow
    const existingTrigger = await db.workflowTrigger.findUnique({
      where: {
        workflowId_type: {
          workflowId,
          type
        }
      }
    })

    if (existingTrigger) {
      // Update existing trigger
      const updatedTrigger = await db.workflowTrigger.update({
        where: {
          id: existingTrigger.id
        },
        data: {
          triggerName,
          description,
          runImmediately
        }
      })
      return NextResponse.json(updatedTrigger)
    }

    // Create new trigger
    const trigger = await db.workflowTrigger.create({
      data: {
        workflowId,
        type,
        triggerName,
        description,
        runImmediately,
        userId
      }
    })

    return NextResponse.json(trigger)
  } catch (error) {
    console.error('[TRIGGERS_POST]', error)
    return new NextResponse('Internal Error', { status: 500 })
  }
} 