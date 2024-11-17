'use client'

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Eye } from "lucide-react"
import { TooltipProvider, Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip"

interface EmailPreviewModalProps {
  template: {
    to: string
    subject: string
    body: string
  }
}

export const EmailPreviewModal = ({ template }: EmailPreviewModalProps) => {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm">
          <TooltipProvider>
            <Tooltip delayDuration={0}>
              <TooltipTrigger>
                <Eye className="h-3 w-3" />
              </TooltipTrigger>
              <TooltipContent>
                <p className='text-xs font-light'>Preview Template</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[625px]">
        <DialogHeader>
          <DialogTitle>Email Preview</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <h3 className="font-semibold">To:</h3>
            <p className="text-sm">{template.to}</p>
          </div>
          <div className="space-y-2">
            <h3 className="font-semibold">Subject:</h3>
            <p className="text-sm">{template.subject}</p>
          </div>
          <div className="space-y-2">
            <h3 className="font-semibold">Body:</h3>
            <div className="bg-muted p-4 rounded-md">
              <p className="text-sm whitespace-pre-wrap">{template.body}</p>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
} 