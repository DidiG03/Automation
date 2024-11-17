'use server'

import { db } from '@/lib/db'
import { auth } from '@clerk/nextjs'

type SaveEmailTemplateParams = {
  workflowId: string
  name: string
  to: string
  subject: string
  body: string
}

export async function saveEmailTemplate({
  workflowId,
  name,
  to,
  subject,
  body,
}: SaveEmailTemplateParams) {
  try {
    const { userId } = auth()
    if (!userId) {
      throw new Error('Unauthorized')
    }

    const template = await db.emailTemplate.create({
      data: {
        name,
        to,
        subject,
        body,
        workflowId,
      },
    })

    return {
      success: true,
      template,
    }
  } catch (error) {
    console.error('Error saving email template:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to save template',
    }
  }
} 