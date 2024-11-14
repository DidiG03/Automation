'use client'

import { TriggerNode } from "@/providers/connections-provider"
import axios from "axios"
import { toast } from "sonner"

export const createWorkflowTrigger = async (
  workflowId: string,
  triggerData: TriggerNode
) => {
  try {
    const response = await axios.post('/api/triggers', {
      workflowId,
      type: triggerData.triggerType,
      description: triggerData.description,
      runImmediately: triggerData.required
    })

    if (response.status === 200) {
      toast.success('Trigger saved successfully')
      return response.data
    }
  } catch (error: any) {
    toast.error(error.response?.data?.message || 'Failed to save trigger')
    return null
  }
} 