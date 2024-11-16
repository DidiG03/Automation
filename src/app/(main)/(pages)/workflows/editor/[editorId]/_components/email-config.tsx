'use client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { useNodeConnections } from '@/providers/connections-provider'
import { useState } from 'react'
import { toast } from 'sonner'
import { sendEmail } from '@/app/(main)/(pages)/connections/_actions/email-connection'
import { EmailConfigSchema } from '@/lib/types'
import { LoadingSpinner } from '@/components/loading-spinner'
import { ZodError } from 'zod'

export const EmailConfig = () => {
  const { nodeConnection } = useNodeConnections()
  const { emailNode, setEmailNode } = nodeConnection
  const [templateName, setTemplateName] = useState('')
  const [isSending, setIsSending] = useState(false)

  const handleSaveTemplate = () => {
    if (!templateName) {
      toast.error('Please enter a template name')
      return
    }

    const newTemplate = {
      to: emailNode.to,
      subject: emailNode.subject,
      body: emailNode.body,
    }

    setEmailNode(prev => ({
      ...prev,
      savedTemplates: [...(prev.savedTemplates || []), templateName]
    }))

    toast.success('Template saved successfully')
    setTemplateName('')
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
    <div className="flex flex-col gap-4 p-4">
      <div className="space-y-2">
        <label className="text-sm font-medium">To:</label>
        <Input
          type="email"
          value={emailNode.to}
          onChange={(e) => setEmailNode(prev => ({ ...prev, to: e.target.value }))}
          placeholder="recipient@example.com"
        />
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium">Subject:</label>
        <Input
          value={emailNode.subject}
          onChange={(e) => setEmailNode(prev => ({ ...prev, subject: e.target.value }))}
          placeholder="Email subject"
        />
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium">Body:</label>
        <Textarea
          value={emailNode.body}
          onChange={(e) => setEmailNode(prev => ({ ...prev, body: e.target.value }))}
          placeholder="Email content..."
          rows={5}
        />
      </div>

      <div className="flex gap-2">
        <Input
          value={templateName}
          onChange={(e) => setTemplateName(e.target.value)}
          placeholder="Template name"
        />
        <Button onClick={handleSaveTemplate}>Save Template</Button>
      </div>

      <Button 
        onClick={handleTestEmail} 
        disabled={isSending}
        className="mt-4"
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