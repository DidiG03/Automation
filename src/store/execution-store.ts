import { create } from 'zustand'

export type ExecutionStep = {
  id: string
  nodeType: string
  status: 'pending' | 'running' | 'completed' | 'failed'
  message: string
  timestamp: Date
}

type ExecutionStore = {
  steps: ExecutionStep[]
  addStep: (step: ExecutionStep) => void
  updateStep: (id: string, updates: Partial<ExecutionStep>) => void
  clearSteps: () => void
}

export const useExecutionStore = create<ExecutionStore>((set) => ({
  steps: [],
  addStep: (step) => set((state) => ({ steps: [...state.steps, step] })),
  updateStep: (id, updates) =>
    set((state) => ({
      steps: state.steps.map((step) =>
        step.id === id ? { ...step, ...updates } : step
      ),
    })),
  clearSteps: () => set({ steps: [] }),
})) 