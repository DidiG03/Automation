import { NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs'
import { db } from '@/lib/db'

export async function POST(req: Request) {
  try {
    const { userId } = auth()
    if (!userId) {
      return new NextResponse('Unauthorized', { status: 401 })
    }

    const { workflowId, type, description, runImmediately } = await req.json()

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