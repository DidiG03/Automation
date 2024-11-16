import { db } from '@/lib/db'
import { auth } from '@clerk/nextjs'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const { userId } = auth()
    
    if (!userId) {
      return new NextResponse('Unauthorized', { status: 401 })
    }

    const workflows = await db.workflows.findMany({
      where: {
        userId: userId,
      },
      select: {
        discordTemplate: true,
        notionTemplate: true,
        slackTemplate: true,
      }
    })

    return NextResponse.json(workflows)
  } catch (error) {
    console.error('[WORKFLOWS_GET]', error)
    return new NextResponse('Internal Error', { status: 500 })
  }
} 