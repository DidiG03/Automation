'use client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { useNodeConnections } from '@/providers/connections-provider'
import { useState } from 'react'
import { toast } from 'sonner'
import { sendEmail } from '@/app/(main)/(pages)/connections/_actions/email-connection'
import { saveEmailTemplate } from '@/app/(main)/(pages)/connections/_actions/save-email-template'
import { EmailConfigSchema } from '@/lib/types'
import { LoadingSpinner } from '@/components/loading-spinner'
import { ZodError } from 'zod'
import { useParams } from 'next/navigation'
import { EmailPreviewModal } from './email-preview-modal'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { loadEmailTemplate } from '@/app/(main)/(pages)/connections/_actions/load-email-template'
export const EmailConfig = () => {
  const params = useParams()
  const workflowId = params.editorId as string
  const { nodeConnection } = useNodeConnections()
  const { emailNode, setEmailNode } = nodeConnection
  const [templateName, setTemplateName] = useState('')
  const [isSending, setIsSending] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [selectedTemplate, setSelectedTemplate] = useState<string>('')

  const handleTemplateSelect = async (templateName: string) => {
    setSelectedTemplate(templateName)
    const response = await loadEmailTemplate(templateName, workflowId)
    
    if (response.success && response.template) {
      setEmailNode(prev => ({
        ...prev,
        to: response.template.to,
        subject: response.template.subject,
        body: response.template.body
      }))
    } else {
      toast.error('Failed to load template')
    }
  }

  const handleSaveTemplate = async () => {
    if (!templateName) {
      toast.error('Please enter a template name')
      return
    }

    try {
      setIsSaving(true)
      
      const response = await saveEmailTemplate({
        workflowId,
        name: templateName,
        to: emailNode.to,
        subject: emailNode.subject,
        body: emailNode.body,
      })

      if (response.success) {
        setEmailNode(prev => ({
          ...prev,
          savedTemplates: [...(prev.savedTemplates || []), templateName]
        }))
        toast.success('Template saved successfully')
        setTemplateName('')
      } else {
        toast.error(response.error || 'Failed to save template')
      }
    } catch (error) {
      toast.error('Failed to save template')
    } finally {
      setIsSaving(false)
    }
  }

  const handleTestEmail = async () => {
    try {
      // Validate email data
      const validatedData = EmailConfigSchema.parse({
        to: emailNode.to,
        subject: emailNode.subject,
        body: emailNode.body,
      })

      setIsSending(true)
      
      const response = await sendEmail({
        to: validatedData.to,
        subject: validatedData.subject,
        body: validatedData.body,
      })

      if (response.success) {
        toast.success('Test email sent successfully!')
      } else {
        toast.error(response.message || 'Failed to send test email')
      }
    } catch (error) {
      if (error instanceof ZodError) {
        // Zod validation errors
        error.errors.forEach((err: any) => {
          toast.error(`${err.path}: ${err.message}`)
        })
      } else {
        toast.error('Failed to send test email')
      }
    } finally {
      setIsSending(false)
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="space-y-4">
        <div className="space-y-2">
          <label className="text-sm font-medium">Email To</label>
          <Input
            placeholder="example@example.com"
            value={emailNode.to}
            onChange={(e) => setEmailNode(prev => ({ ...prev, to: e.target.value }))}
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium">Email Subject</label>
          <Input
            placeholder="Email subject"
          value={emailNode.subject}
            onChange={(e) => setEmailNode(prev => ({ ...prev, subject: e.target.value }))}
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium">Email Body</label>
          <Textarea
          placeholder="Email body"
          value={emailNode.body}
          onChange={(e) => setEmailNode(prev => ({ ...prev, body: e.target.value }))}
            className="min-h-[200px]"
          />
        </div>
      </div>
      <div className="flex gap-2">
        <Input
          value={templateName}
          onChange={(e) => setTemplateName(e.target.value)}
          placeholder="Template name"
        />
        <Button 
          onClick={handleSaveTemplate}
          variant="outline"
          disabled={isSaving}
        >
          {isSaving ? (
            <>
              <LoadingSpinner className="mr-2 h-4 w-4" />
              Saving...
            </>
          ) : (
            'Save Template'
          )}
        </Button>
      </div>

      <Button 
        onClick={handleTestEmail} 
        disabled={isSending}
        className="mt-4"
        variant="outline"
      >
        {isSending ? (
          <>
            <LoadingSpinner className="mr-2 h-4 w-4" />
            Sending...
          </>
        ) : (
          'Test Email'
        )}
      </Button>
    </div>
  )
}