import { auth } from '@clerk/nextjs'
import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function POST(req: Request) {
  try {
    const { userId } = auth()
    if (!userId) {
      return new NextResponse('Unauthorized', { status: 401 })
    }

    const body = await req.json()
    const { workflowId, name, condition } = body

    if (!workflowId || !name || !condition) {
      return new NextResponse('Missing required fields', { status: 400 })
    }

    // Get the current workflow
    const workflow = await db.workflows.findUnique({
      where: { id: workflowId }
    })

    if (!workflow) {
      return new NextResponse('Workflow not found', { status: 404 })
    }

    // Get existing templates or initialize empty array
    const existingTemplates = workflow.conditionTemplates 
      ? (workflow.conditionTemplates as any[])
      : []

    // Check for duplicate names
    if (existingTemplates.some((template: any) => template.name === name)) {
      return new NextResponse('Template name already exists', { status: 400 })
    }

    // Add new template
    const newTemplate = {
      name,
      leftOperand: condition.leftOperand,
      operator: condition.operator,
      rightOperand: condition.rightOperand,
      createdAt: new Date().toISOString()
    }

    // Update workflow with new template
    const updatedWorkflow = await db.workflows.update({
      where: { id: workflowId },
      data: {
        conditionTemplates: [
          ...existingTemplates,
          newTemplate
        ]
      }
    })

    return NextResponse.json({
      success: true,
      templateName: name,
      template: newTemplate
    })

  } catch (error) {
    console.error('[CONDITIONS_POST]', error)
    return new NextResponse(`Internal Error: ${error instanceof Error ? error.message : 'Unknown error'}`, { status: 500 })
  }
}

export async function GET(req: Request) {
  try {
    const { userId } = auth()
    if (!userId) {
      return new NextResponse('Unauthorized', { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const workflowId = searchParams.get('workflowId')

    if (!workflowId) {
      return new NextResponse('Workflow ID required', { status: 400 })
    }

    // Get the workflow and its condition templates
    const workflow = await db.workflows.findUnique({
      where: { id: workflowId }
    })

    if (!workflow) {
      return new NextResponse('Workflow not found', { status: 404 })
    }

    const templates = workflow.conditionTemplates || []

    return NextResponse.json(templates)

  } catch (error) {
    console.error('[CONDITIONS_GET]', error)
    return new NextResponse('Internal Error', { status: 500 })
  }
} 