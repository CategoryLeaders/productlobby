'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Loader2, ChevronLeft, ChevronRight } from 'lucide-react'
import Link from 'next/link'
import { WizardProvider, useWizard } from '@/components/shared/campaign-wizard/wizard-context'
import { ProgressBar } from '@/components/shared/campaign-wizard/progress-bar'
import { StepBasics } from '@/components/shared/campaign-wizard/step-basics'
import { StepStory } from '@/components/shared/campaign-wizard/step-story'
import { StepPricing } from '@/components/shared/campaign-wizard/step-pricing'
import { StepVisuals } from '@/components/shared/campaign-wizard/step-visuals'
import { StepReview } from '@/components/shared/campaign-wizard/step-review'

const STEPS = ['The Basics', 'Tell the Story', 'Set Expectations', 'Add Visuals', 'Review & Launch']
const TOTAL_STEPS = STEPS.length

interface ValidationRules {
  [key: number]: () => boolean
}

function WizardContent() {
  const router = useRouter()
  const { currentStep, setCurrentStep, formData, setValidationErrors, validationErrors, saveDraft, clearDraft } =
    useWizard()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [needsAuth, setNeedsAuth] = useState(false)

  const validateStep = (step: number): boolean => {
    const errors: Record<string, string> = {}

    switch (step) {
      case 1:
        if (formData.title.length < 10) errors.title = 'Title must be at least 10 characters'
        if (formData.tagline.length < 10) errors.tagline = 'Tagline must be at least 10 characters'
        if (!formData.category) errors.category = 'Please select a category'
        break
      case 2:
        if (formData.description.length < 100)
          errors.description = 'Description must be at least 100 characters'
        if (!formData.problem) errors.problem = 'Please describe the problem'
        if (!formData.inspiration) errors.inspiration = 'Please share your inspiration'
        break
      case 3:
        if (formData.willPay === 0) errors.willPay = 'Please enter how much you would pay'
        break
      case 4:
        // Visuals are optional, but if provided they should be valid
        break
      case 5:
        // Review step - no validation needed
        break
    }

    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors)
      return false
    }

    setValidationErrors({})
    return true
  }

  const handleNext = () => {
    if (validateStep(currentStep)) {
      saveDraft()
      setCurrentStep(currentStep + 1)
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }

  const handlePrevious = () => {
    setCurrentStep(currentStep - 1)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleLaunch = async () => {
    setLoading(true)
    setError('')

    try {
      const response = await fetch('/api/campaigns', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: formData.title,
          tagline: formData.tagline,
          category: formData.category,
          description: formData.description,
          problem: formData.problem,
          inspiration: formData.inspiration,
          minPrice: formData.minPrice,
          maxPrice: formData.maxPrice,
          willPay: formData.willPay,
          mediaUrls: formData.images,
          videoUrl: formData.videoUrl,
          template: 'VARIANT',
          currency: 'GBP',
        }),
      })

      if (response.status === 401) {
        setNeedsAuth(true)
        setLoading(false)
        return
      }

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to create campaign')
      }

      const data = await response.json()
      clearDraft()
      router.push(`/campaigns/${data.data.slug || data.data.id}`)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return <StepBasics />
      case 2:
        return <StepStory />
      case 3:
        return <StepPricing />
      case 4:
        return <StepVisuals />
      case 5:
        return <StepReview onEdit={setCurrentStep} />
      default:
        return null
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <ProgressBar currentStep={currentStep} totalSteps={TOTAL_STEPS} stepLabels={STEPS} />

      <header className="bg-white border-b">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <Link href="/campaigns" className="inline-flex items-center text-gray-600 hover:text-gray-900 transition">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Campaigns
          </Link>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-2xl shadow-sm border p-8 md:p-12">
          {needsAuth && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6 text-center">
              <p className="text-sm font-medium text-yellow-800 mb-2">You need to sign in to create a campaign</p>
              <a href="/login" className="text-sm text-violet-600 hover:text-violet-700 font-medium underline">
                Sign in or create an account
              </a>
            </div>
          )}

          <div className="animate-fade-in">
            {renderStep()}
          </div>

          {error && (
            <div className="mt-8 bg-red-50 border border-red-200 rounded-lg p-4 text-red-700 text-sm">
              {error}
            </div>
          )}

          <div className="mt-8 flex items-center justify-between border-t pt-8">
            <button
              type="button"
              onClick={handlePrevious}
              disabled={currentStep === 1}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-lg border border-gray-200 text-gray-900 font-semibold hover:bg-gray-50 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronLeft className="w-4 h-4" />
              Previous
            </button>

            {currentStep < TOTAL_STEPS ? (
              <button
                type="button"
                onClick={handleNext}
                className="inline-flex items-center gap-2 px-8 py-3 rounded-lg bg-violet-600 text-white font-semibold hover:bg-violet-700 transition"
              >
                Next
                <ChevronRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                type="button"
                onClick={handleLaunch}
                disabled={loading}
                className="inline-flex items-center gap-2 px-8 py-3 rounded-lg bg-lime-500 text-white font-semibold hover:bg-lime-600 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Launching...
                  </>
                ) : (
                  <>
                    Launch Campaign
                    <ChevronRight className="w-4 h-4" />
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}

export default function NewCampaignPage() {
  return (
    <WizardProvider>
      <WizardContent />
    </WizardProvider>
  )
}
