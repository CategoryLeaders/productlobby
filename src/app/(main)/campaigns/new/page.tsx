'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Loader2, ChevronLeft, ChevronRight } from 'lucide-react'
import Link from 'next/link'
import { WizardProvider, useWizard } from '@/components/shared/campaign-wizard/wizard-context'
import { ProgressBar } from '@/components/shared/campaign-wizard/progress-bar'
import { StepIdea } from '@/components/shared/campaign-wizard/step-idea'
import { StepDetail } from '@/components/shared/campaign-wizard/step-detail'
import { StepVisuals } from '@/components/shared/campaign-wizard/step-visuals'
import { StepPitch } from '@/components/shared/campaign-wizard/step-pitch'
import { StepSuccess } from '@/components/shared/campaign-wizard/step-success'
import { StepReview } from '@/components/shared/campaign-wizard/step-review'

const STEPS = ['The Idea', 'The Detail', 'Visuals', 'The Pitch', 'Success', 'Review']
const TOTAL_STEPS = STEPS.length

function WizardContent() {
  const router = useRouter()
  const { currentStep, setCurrentStep, formData, setValidationErrors, saveDraft, clearDraft } =
    useWizard()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [needsAuth, setNeedsAuth] = useState(false)

  const validateStep = (step: number): boolean => {
    const errors: Record<string, string> = {}

    switch (step) {
      case 1:
        if (formData.title.length < 10) errors.title = 'Title must be at least 10 characters'
        if (!formData.category) errors.category = 'Please select a category'
        if (formData.tagline.length < 10) errors.tagline = 'One-liner must be at least 10 characters'
        if (formData.problemStatement.length < 20) errors.problemStatement = 'Problem statement must be at least 20 characters'
        break
      case 2:
        if (formData.description.length < 100)
          errors.description = 'Description must be at least 100 characters'
        if (formData.suggestedPrice <= 0) errors.suggestedPrice = 'Please enter how much you would pay'
        break
      case 3:
        // Visuals are optional
        break
      case 4:
        if (formData.originStory.length < 30) errors.originStory = 'Origin story must be at least 30 characters'
        if (formData.whyItMatters.length < 20) errors.whyItMatters = 'Please explain why this matters (at least 20 characters)'
        break
      case 5:
        if (formData.successCriteria.length < 50) errors.successCriteria = 'Success criteria must be at least 50 characters'
        break
      case 6:
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
          description: formData.description,
          category: formData.category,
          pitchSummary: formData.tagline,
          problemSolved: formData.problemStatement,
          originStory: formData.originStory,
          inspiration: formData.whyItMatters,
          targetBrand: formData.targetBrand || undefined,
          priceRangeMin: formData.priceRangeMin,
          priceRangeMax: formData.priceRangeMax,
          suggestedPrice: formData.suggestedPrice,
          milestones: { successCriteria: formData.successCriteria },
          mediaUrls: formData.images.length > 0 ? formData.images : undefined,
          videoUrl: formData.videoUrl || undefined,
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
        return <StepIdea />
      case 2:
        return <StepDetail />
      case 3:
        return <StepVisuals />
      case 4:
        return <StepPitch />
      case 5:
        return <StepSuccess />
      case 6:
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
