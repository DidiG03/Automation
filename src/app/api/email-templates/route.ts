import { db } from '@/lib/db'
import { auth } from '@clerk/nextjs'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const { userId } = auth()
    
    if (!userId) {
      return new NextResponse('Unauthorized', { status: 401 })
    }

    const emailTemplates = await db.emailTemplate.findMany({
      where: {
        workflow: {
          userId: userId
        }
      },
      select: {
        id: true,
        name: true,
        to: true,
        subject: true,
        body: true,
      }
    })

    return NextResponse.json(emailTemplates)
  } catch (error) {
    console.error('[EMAIL_TEMPLATES_GET]', error)
    return new NextResponse('Internal Error', { status: 500 })
  }
} 