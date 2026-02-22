'use client'

import React, { createContext, useContext, useState, useCallback, useEffect } from 'react'

export interface WizardFormData {
  title: string
  tagline: string
  category: string
  description: string
  problem: string
  inspiration: string
  minPrice: number
  maxPrice: number
  willPay: number
  images: string[]
  videoUrl: string
}

export interface ValidationErrors {
  [key: string]: string
}

interface WizardContextType {
  currentStep: number
  setCurrentStep: (step: number) => void
  formData: WizardFormData
  setFormData: (data: Partial<WizardFormData>) => void
  validationErrors: ValidationErrors
  setValidationErrors: (errors: ValidationErrors) => void
  saveDraft: () => Promise<void>
  loadDraft: () => Promise<void>
  clearDraft: () => void
  isSaving: boolean
}

const WizardContext = createContext<WizardContextType | undefined>(undefined)

const DRAFT_KEY = 'campaign_wizard_draft'
const DRAFT_TIMESTAMP_KEY = 'campaign_wizard_draft_timestamp'

const defaultFormData: WizardFormData = {
  title: '',
  tagline: '',
  category: '',
  description: '',
  problem: '',
  inspiration: '',
  minPrice: 20,
  maxPrice: 100,
  willPay: 0,
  images: [],
  videoUrl: '',
}

export function WizardProvider({ children }: { children: React.ReactNode }) {
  const [currentStep, setCurrentStep] = useState(1)
  const [formData, setFormDataState] = useState<WizardFormData>(defaultFormData)
  const [validationErrors, setValidationErrors] = useState<ValidationErrors>({})
  const [isSaving, setIsSaving] = useState(false)

  const setFormData = useCallback((data: Partial<WizardFormData>) => {
    setFormDataState((prev) => ({ ...prev, ...data }))
  }, [])

  const saveDraft = useCallback(async () => {
    setIsSaving(true)
    try {
      const draftData = {
        ...formData,
        savedAt: new Date().toISOString(),
      }
      localStorage.setItem(DRAFT_KEY, JSON.stringify(draftData))
      localStorage.setItem(DRAFT_TIMESTAMP_KEY, new Date().toISOString())

      await fetch('/api/campaigns/draft', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(draftData),
      }).catch(() => {
        // Silently fail server-side save, local storage is enough
      })
    } catch (error) {
      console.error('Failed to save draft:', error)
    } finally {
      setIsSaving(false)
    }
  }, [formData])

  const loadDraft = useCallback(async () => {
    try {
      // Try loading from localStorage first
      const storedDraft = localStorage.getItem(DRAFT_KEY)
      if (storedDraft) {
        const draft = JSON.parse(storedDraft)
        setFormDataState(draft)
        return
      }

      // Try loading from server
      const response = await fetch('/api/campaigns/draft', {
        method: 'GET',
      })

      if (response.ok) {
        const data = await response.json()
        if (data.data) {
          setFormDataState(data.data)
        }
      }
    } catch (error) {
      console.error('Failed to load draft:', error)
    }
  }, [])

  const clearDraft = useCallback(() => {
    localStorage.removeItem(DRAFT_KEY)
    localStorage.removeItem(DRAFT_TIMESTAMP_KEY)
    setFormDataState(defaultFormData)
    setCurrentStep(1)
  }, [])

  // Auto-save every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      saveDraft()
    }, 30000)

    return () => clearInterval(interval)
  }, [saveDraft])

  // Load draft on mount
  useEffect(() => {
    loadDraft()
  }, [loadDraft])

  const value: WizardContextType = {
    currentStep,
    setCurrentStep,
    formData,
    setFormData,
    validationErrors,
    setValidationErrors,
    saveDraft,
    loadDraft,
    clearDraft,
    isSaving,
  }

  return <WizardContext.Provider value={value}>{children}</WizardContext.Provider>
}

export function useWizard() {
  const context = useContext(WizardContext)
  if (context === undefined) {
    throw new Error('useWizard must be used within a WizardProvider')
  }
  return context
}
