'use server'

import { db } from '@/lib/db'
import { auth } from '@clerk/nextjs'

export async function loadEmailTemplate(name: string, workflowId: string) {
  try {
    const { userId } = auth()
    if (!userId) {
      throw new Error('Unauthorized')
    }

    const template = await db.emailTemplate.findFirst({
      where: {
        name,
        workflowId,
        workflow: {
          userId
        }
      }
    })

    if (!template) {
      throw new Error('Template not found')
    }

    return {
      success: true,
      template
    }
  } catch (error) {
    console.error('Error loading email template:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to load template'
    }
  }
} 