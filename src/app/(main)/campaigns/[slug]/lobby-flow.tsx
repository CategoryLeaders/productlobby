'use client'

import React, { useState } from 'react'
import { ChevronRight } from 'lucide-react'
import {
  Modal,
  ModalContent,
  ModalClose,
  ModalHeader,
  ModalTitle,
  ModalBody,
  ModalFooter,
} from '@/components/ui/modal'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'
import { ChipSelector, type ChipOption } from '@/components/ui/chip-selector'
import { cn } from '@/lib/utils'

interface LobbyFlowProps {
  isOpen: boolean
  onClose: () => void
  campaignTitle: string
  campaignId: string
}

type IntensityLevel = 'low' | 'medium' | 'high' | null

type SubmitState = 'idle' | 'submitting' | 'success' | 'error' | 'duplicate' | 'auth_required'

const INTENSITY_MAP: Record<string, string> = {
  low: 'NEAT_IDEA',
  medium: 'PROBABLY_BUY',
  high: 'TAKE_MY_MONEY',
}

interface Preferences {
  size: string[]
  colours: string[]
  priceRange: string[]
  width: string[]
}

const INTENSITY_OPTIONS = [
  {
    id: 'low',
    level: 'low',
    title: 'Yeah — neat idea, I could be interested',
    emoji: '💡',
    description: 'This sounds like a good product, but I\'m not sure I\'d buy it',
    bgColor: 'bg-green-50',
    borderColor: 'border-green-500',
    dotColor: 'bg-green-500',
  },
  {
    id: 'medium',
    level: 'medium',
    title: 'I\'d probably buy this',
    emoji: '🛍️',
    description: 'I\'d seriously consider buying this if it became available',
    bgColor: 'bg-yellow-50',
    borderColor: 'border-yellow-400',
    dotColor: 'bg-yellow-400',
  },
  {
    id: 'high',
    level: 'high',
    title: 'Shut up and take my money!',
    emoji: '🔥',
    description: 'I absolutely want this and would buy it immediately',
    bgColor: 'bg-violet-50',
    borderColor: 'border-violet-500',
    dotColor: 'bg-violet-600',
  },
]

const SIZE_OPTIONS: ChipOption[] = [
  { id: '6', label: 'UK 6' },
  { id: '7', label: 'UK 7' },
  { id: '8', label: 'UK 8' },
  { id: '9', label: 'UK 9' },
  { id: '10', label: 'UK 10' },
  { id: '11', label: 'UK 11' },
  { id: '12', label: 'UK 12' },
]

const COLOUR_OPTIONS: ChipOption[] = [
  { id: 'black', label: 'Black' },
  { id: 'white', label: 'White' },
  { id: 'red', label: 'Red' },
  { id: 'blue', label: 'Blue' },
  { id: 'pink', label: 'Pink' },
  { id: 'green', label: 'Green' },
  { id: 'purple', label: 'Purple' },
  { id: 'other', label: 'Other' },
]

const PRICE_OPTIONS: ChipOption[] = [
  { id: 'under50', label: 'Under £50' },
  { id: '50-80', label: '£50-80' },
  { id: '80-120', label: '£80-120' },
  { id: '120-150', label: '£120-150' },
  { id: '150+', label: '£150+' },
]

const WIDTH_OPTIONS: ChipOption[] = [
  { id: 'standard', label: 'Standard' },
  { id: 'wide', label: 'Wide' },
  { id: 'extra-wide', label: 'Extra Wide' },
]

export function LobbyFlow({
  isOpen,
  onClose,
  campaignTitle,
  campaignId,
}: LobbyFlowProps) {
  const [currentStep, setCurrentStep] = useState(1)
  const [intensity, setIntensity] = useState<IntensityLevel>(null)
  const [preferences, setPreferences] = useState<Preferences>({
    size: [],
    colours: [],
    priceRange: [],
    width: [],
  })
  const [wishlistText, setWishlistText] = useState('')
  const [reasonText, setReasonText] = useState('')
  const [email, setEmail] = useState('')
  const [submitState, setSubmitState] = useState<SubmitState>('idle')
  const [errorMessage, setErrorMessage] = useState('')

  const handleReset = () => {
    setCurrentStep(1)
    setIntensity(null)
    setPreferences({ size: [], colours: [], priceRange: [], width: [] })
    setWishlistText('')
    setReasonText('')
    setEmail('')
    setSubmitState('idle')
    setErrorMessage('')
  }

  const handleClose = () => {
    handleReset()
    onClose()
  }

  const handleNext = () => {
    setCurrentStep((prev) => Math.min(prev + 1, 5))
  }

  const handlePrevious = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 1))
  }

  const handleSave = async () => {
    if (!intensity) return

    setSubmitState('submitting')
    setErrorMessage('')

    try {
      const response = await fetch(`/api/campaigns/${campaignId}/lobby`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          intensity: INTENSITY_MAP[intensity],
          wishlist: wishlistText.trim() || undefined,
          reason: reasonText.trim() || undefined,
        }),
      })

      if (response.status === 401) {
        setSubmitState('auth_required')
        return
      }

      if (response.status === 409) {
        setSubmitState('duplicate')
        return
      }

      if (!response.ok) {
        const data = await response.json().catch(() => ({}))
        throw new Error(data.error || 'Failed to save your lobby')
      }

      setSubmitState('success')
      // Auto-close after success
      setTimeout(() => {
        handleClose()
        // Refresh the page to show updated stats
        window.location.reload()
      }, 2000)
    } catch (err: any) {
      setSubmitState('error')
      setErrorMessage(err.message || 'Something went wrong. Please try again.')
    }
  }

  const getIntensityLabel = (level: IntensityLevel) => {
    if (!level) return ''
    const option = INTENSITY_OPTIONS.find((o) => o.level === level)
    return option?.title || ''
  }

  const getIntensityEmoji = (level: IntensityLevel) => {
    if (!level) return ''
    const option = INTENSITY_OPTIONS.find((o) => o.level === level)
    return option?.emoji || ''
  }

  return (
    <Modal open={isOpen} onOpenChange={handleClose}>
      <ModalContent className="max-w-2xl">
        <ModalClose />

        {/* Progress Indicator */}
        <div className="px-6 pt-6">
          <div className="flex justify-center gap-2">
            {[1, 2, 3, 4, 5].map((step) => (
              <button
                key={step}
                onClick={() => currentStep >= step && setCurrentStep(step)}
                className={cn(
                  'w-3 h-3 rounded-full transition-all duration-200',
                  currentStep === step
                    ? 'bg-violet-600 w-8'
                    : currentStep > step
                      ? 'bg-lime-500'
                      : 'bg-gray-300'
                )}
              />
            ))}
          </div>
        </div>

        {/* Step 1: Intensity Level */}
        {currentStep === 1 && (
          <>
            <ModalHeader>
              <ModalTitle className="text-2xl">How much do you want this?</ModalTitle>
            </ModalHeader>
            <ModalBody>
              <p className="text-gray-600 mb-6">
                Your answer helps us understand how passionate your community is.
              </p>
              <div className="space-y-3">
                {INTENSITY_OPTIONS.map((option) => (
                  <button
                    key={option.id}
                    onClick={() => setIntensity(option.level as IntensityLevel)}
                    className={cn(
                      'w-full p-4 rounded-lg border-2 transition-all duration-200 text-left',
                      intensity === option.level
                        ? `${option.bgColor} ${option.borderColor} border-2 shadow-md`
                        : `${option.bgColor} border-gray-200 hover:border-gray-300`
                    )}
                  >
                    <div className="flex items-start gap-3">
                      <span className="text-2xl">{option.emoji}</span>
                      <div className="flex-1">
                        <p className="font-medium text-foreground">{option.title}</p>
                        <p className="text-sm text-gray-600">{option.description}</p>
                      </div>
                      <div
                        className={cn(
                          'w-5 h-5 rounded-full border-2 flex-shrink-0 mt-1',
                          intensity === option.level
                            ? `${option.borderColor} ${option.dotColor}`
                            : 'border-gray-300'
                        )}
                      >
                        {intensity === option.level && (
                          <div className="w-full h-full flex items-center justify-center">
                            <div className="w-2 h-2 bg-white rounded-full"></div>
                          </div>
                        )}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </ModalBody>
            <ModalFooter>
              <Button
                variant="ghost"
                onClick={handleClose}
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                onClick={handleNext}
                disabled={!intensity}
              >
                Continue
              </Button>
            </ModalFooter>
          </>
        )}

        {/* Step 2: Preferences */}
        {currentStep === 2 && (
          <>
            <ModalHeader>
              <ModalTitle className="text-2xl">Help shape this product</ModalTitle>
              <p className="text-sm text-gray-600 mt-2">
                Your preferences help Nike build exactly what you want
              </p>
            </ModalHeader>
            <ModalBody className="max-h-96 overflow-y-auto">
              <div className="space-y-6">
                {/* Size */}
                <div>
                  <label className="block text-sm font-medium text-foreground mb-3">
                    Shoe Size
                  </label>
                  <ChipSelector
                    options={SIZE_OPTIONS}
                    selected={preferences.size.map((s) => s)}
                    onChange={(selected) =>
                      setPreferences({ ...preferences, size: selected.map((s) => String(s)) })
                    }
                    multiple={true}
                  />
                </div>

                {/* Colours */}
                <div>
                  <label className="block text-sm font-medium text-foreground mb-3">
                    Preferred Colours
                  </label>
                  <ChipSelector
                    options={COLOUR_OPTIONS}
                    selected={preferences.colours.map((c) => c)}
                    onChange={(selected) =>
                      setPreferences({ ...preferences, colours: selected.map((c) => String(c)) })
                    }
                    multiple={true}
                  />
                </div>

                {/* Price Range */}
                <div>
                  <label className="block text-sm font-medium text-foreground mb-3">
                    Price Range
                  </label>
                  <ChipSelector
                    options={PRICE_OPTIONS}
                    selected={preferences.priceRange.map((p) => p)}
                    onChange={(selected) =>
                      setPreferences({ ...preferences, priceRange: selected.map((p) => String(p)) })
                    }
                    multiple={true}
                  />
                </div>

                {/* Width */}
                <div>
                  <label className="block text-sm font-medium text-foreground mb-3">
                    Width Preference
                  </label>
                  <ChipSelector
                    options={WIDTH_OPTIONS}
                    selected={preferences.width.map((w) => w)}
                    onChange={(selected) =>
                      setPreferences({ ...preferences, width: selected.map((w) => String(w)) })
                    }
                    multiple={false}
                  />
                </div>

                <p className="text-xs text-gray-600 border-t border-gray-200 pt-4">
                  2,847 people have shared their preferences
                </p>
              </div>
            </ModalBody>
            <ModalFooter>
              <Button variant="ghost" onClick={handlePrevious}>
                Back
              </Button>
              <div className="flex-1"></div>
              <button
                onClick={handleNext}
                className="text-violet-600 hover:text-violet-700 text-sm font-medium"
              >
                Skip
              </button>
              <Button variant="primary" onClick={handleNext}>
                Continue
              </Button>
            </ModalFooter>
          </>
        )}

        {/* Step 3: Wishlist */}
        {currentStep === 3 && (
          <>
            <ModalHeader>
              <ModalTitle className="text-2xl">This would be cooler if...</ModalTitle>
              <p className="text-sm text-gray-600 mt-2">
                Share your ideas to help shape the final product
              </p>
            </ModalHeader>
            <ModalBody>
              <div className="space-y-4">
                <div>
                  <Textarea
                    placeholder="e.g., came in a vegan leather option, had better arch support, was available in half sizes..."
                    value={wishlistText}
                    onChange={(e) => setWishlistText(e.target.value)}
                    className="min-h-32"
                  />
                  <div className="flex justify-between items-center mt-2">
                    <p className="text-xs text-gray-600">Popular ideas: wider toe box, arch support options, vegan materials</p>
                    <span className="text-xs text-gray-600">
                      {wishlistText.length}/500
                    </span>
                  </div>
                </div>
              </div>
            </ModalBody>
            <ModalFooter>
              <Button variant="ghost" onClick={handlePrevious}>
                Back
              </Button>
              <div className="flex-1"></div>
              <button
                onClick={handleNext}
                className="text-violet-600 hover:text-violet-700 text-sm font-medium"
              >
                Skip
              </button>
              <Button variant="primary" onClick={handleNext}>
                Continue
              </Button>
            </ModalFooter>
          </>
        )}

        {/* Step 4: Why this product matters (Reason) */}
        {currentStep === 4 && (
          <>
            <ModalHeader>
              <ModalTitle className="text-2xl">Why do you want this product?</ModalTitle>
              <p className="text-sm text-gray-600 mt-2">
                Share why this product matters to you (optional)
              </p>
            </ModalHeader>
            <ModalBody>
              <div className="space-y-4">
                <div>
                  <Textarea
                    placeholder="e.g., It would solve my daily problem with..., I've been looking for this because..., My friends would love this because..."
                    value={reasonText}
                    onChange={(e) => setReasonText(e.target.value)}
                    className="min-h-32"
                  />
                  <div className="flex justify-between items-center mt-2">
                    <p className="text-xs text-gray-600">Your reason helps the brand understand customer motivations</p>
                    <span className="text-xs text-gray-600">
                      {reasonText.length}/280
                    </span>
                  </div>
                </div>
              </div>
            </ModalBody>
            <ModalFooter>
              <Button variant="ghost" onClick={handlePrevious}>
                Back
              </Button>
              <div className="flex-1"></div>
              <button
                onClick={handleNext}
                className="text-violet-600 hover:text-violet-700 text-sm font-medium"
              >
                Skip
              </button>
              <Button variant="primary" onClick={handleNext}>
                Continue
              </Button>
            </ModalFooter>
          </>
        )}

        {/* Step 5: Save & Sign Up */}
        {currentStep === 5 && (
          <>
            <ModalHeader>
              <ModalTitle className="text-2xl">
                {submitState === 'success'
                  ? 'Lobby saved!'
                  : submitState === 'duplicate'
                    ? 'Already lobbied'
                    : submitState === 'auth_required'
                      ? 'Sign in to lobby'
                      : 'Save your lobby & preferences'}
              </ModalTitle>
              {submitState === 'idle' && (
                <p className="text-sm text-gray-600 mt-2">
                  We'll notify you when the brand responds to this campaign
                </p>
              )}
            </ModalHeader>
            <ModalBody className="space-y-6">
              {/* Success State */}
              {submitState === 'success' && (
                <div className="text-center py-8">
                  <div className="text-6xl mb-4">🎉</div>
                  <p className="text-lg font-medium text-foreground mb-2">Your lobby has been saved!</p>
                  <p className="text-sm text-gray-600">Thanks for supporting this campaign. We'll keep you updated.</p>
                </div>
              )}

              {/* Duplicate State */}
              {submitState === 'duplicate' && (
                <div className="text-center py-8">
                  <div className="text-6xl mb-4">✋</div>
                  <p className="text-lg font-medium text-foreground mb-2">You've already lobbied this campaign</p>
                  <p className="text-sm text-gray-600">Your support is already counted. Share the campaign to rally more people!</p>
                </div>
              )}

              {/* Auth Required State */}
              {submitState === 'auth_required' && (
                <div className="text-center py-8">
                  <div className="text-6xl mb-4">🔐</div>
                  <p className="text-lg font-medium text-foreground mb-2">You need to sign in first</p>
                  <p className="text-sm text-gray-600 mb-6">Create an account or sign in to save your lobby.</p>
                  <a href="/login">
                    <Button variant="primary" size="lg">
                      Sign in / Sign up
                    </Button>
                  </a>
                </div>
              )}

              {/* Error State */}
              {submitState === 'error' && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-center">
                  <p className="text-sm text-red-700 font-medium">{errorMessage}</p>
                  <Button
                    variant="secondary"
                    size="sm"
                    className="mt-3"
                    onClick={() => setSubmitState('idle')}
                  >
                    Try again
                  </Button>
                </div>
              )}

              {/* Normal idle/submitting state */}
              {(submitState === 'idle' || submitState === 'submitting') && (
                <>
                  {/* Summary */}
                  <div className="bg-violet-50 border border-violet-200 rounded-lg p-4 space-y-4">
                    <h4 className="font-medium text-foreground text-sm">What you're saving</h4>

                    {/* Intensity */}
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{getIntensityEmoji(intensity)}</span>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-foreground">
                          {getIntensityLabel(intensity)}
                        </p>
                      </div>
                    </div>

                    {/* Preferences Count */}
                    {(preferences.size.length > 0 ||
                      preferences.colours.length > 0 ||
                      preferences.priceRange.length > 0 ||
                      preferences.width.length > 0) && (
                        <div className="text-sm text-gray-600">
                          <p className="font-medium text-foreground mb-1">Preferences</p>
                          <p className="text-xs">
                            {preferences.size.length} size
                            {preferences.colours.length > 0 && ` · ${preferences.colours.length} colours`}
                            {preferences.priceRange.length > 0 && ` · Price range`}
                            {preferences.width.length > 0 && ` · ${preferences.width.length} width`}
                          </p>
                        </div>
                      )}

                    {/* Wishlist Preview */}
                    {wishlistText.trim() && (
                      <div className="text-sm text-gray-600">
                        <p className="font-medium text-foreground mb-1">Wishlist</p>
                        <p className="text-xs line-clamp-2 italic">"{wishlistText}"</p>
                      </div>
                    )}

                    {/* Reason Preview */}
                    {reasonText.trim() && (
                      <div className="text-sm text-gray-600">
                        <p className="font-medium text-foreground mb-1">Why this product matters</p>
                        <p className="text-xs line-clamp-2 italic">"{reasonText}"</p>
                      </div>
                    )}
                  </div>

                  {/* Privacy Note */}
                  <div className="bg-gray-50 rounded-lg p-3 space-y-2">
                    <p className="text-xs text-gray-600">
                      <span className="font-medium">Your lobby counts</span> once you verify your email. We'll send a quick confirmation.
                    </p>
                    <p className="text-xs text-gray-600">
                      <span className="font-medium">Your preferences are anonymised.</span> Brands see aggregated data only.
                    </p>
                  </div>
                </>
              )}
            </ModalBody>
            <ModalFooter>
              {(submitState === 'idle' || submitState === 'submitting') && (
                <>
                  <Button variant="ghost" onClick={handlePrevious} disabled={submitState === 'submitting'}>
                    Back
                  </Button>
                  <Button
                    variant="primary"
                    onClick={handleSave}
                    disabled={submitState === 'submitting'}
                  >
                    {submitState === 'submitting' ? 'Saving...' : 'Save My Lobby'}
                  </Button>
                </>
              )}
              {(submitState === 'success' || submitState === 'duplicate') && (
                <Button variant="primary" onClick={handleClose}>
                  Close
                </Button>
              )}
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  )
}
