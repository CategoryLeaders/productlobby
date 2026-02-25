'use client'

import React, { createContext, useContext, useState, useCallback, useEffect } from 'react'

export interface WizardFormData {
  // Step 1: The Idea
  title: string
  tagline: string
  category: string
  problemStatement: string
  // Step 2: The Detail
  description: string
  targetBrand: string
  priceRangeMin: number
  priceRangeMax: number
  suggestedPrice: number
  // Step 3: Visual Evidence
  images: string[]
  videoUrl: string
  // Step 4: The Pitch
  originStory: string
  whyItMatters: string
  // Step 5: Success Criteria
  successCriteria: string
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
  problemStatement: '',
  description: '',
  targetBrand: '',
  priceRangeMin: 20,
  priceRangeMax: 100,
  suggestedPrice: 0,
  images: [],
  videoUrl: '',
  originStory: '',
  whyItMatters: '',
  successCriteria: '',
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
        currentStep,
        savedAt: new Date().toISOString(),
      }
      localStorage.setItem(DRAFT_KEY, JSON.stringify(draftData))
      localStorage.setItem(DRAFT_TIMESTAMP_KEY, new Date().toISOString())
    } catch (error) {
      console.error('Failed to save draft:', error)
    } finally {
      setIsSaving(false)
    }
  }, [formData, currentStep])

  const loadDraft = useCallback(async () => {
    try {
      const storedDraft = localStorage.getItem(DRAFT_KEY)
      if (storedDraft) {
        const draft = JSON.parse(storedDraft)
        const { currentStep: savedStep, savedAt, ...data } = draft
        // Merge with defaults so new fields get default values
        setFormDataState({ ...defaultFormData, ...data })
        if (savedStep && savedStep >= 1 && savedStep <= 6) {
          setCurrentStep(savedStep)
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
