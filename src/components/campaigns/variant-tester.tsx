'use client'

import React, { useState, useEffect } from 'react'
import { BarChart3, Plus, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'

interface Variant {
  id: string
  description: string
  order: number
  isPrimary?: boolean
  createdAt: string
  metrics: {
    views: number
    engagement: number
    conversionRate: string
  }
}

interface VariantTesterProps {
  campaignId: string
  isCreator?: boolean
  onVariantChange?: (variantId: string) => void
}

export const VariantTester: React.FC<VariantTesterProps> = ({
  campaignId,
  isCreator = false,
  onVariantChange,
}) => {
  const [variants, setVariants] = useState<Variant[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedVariantId, setSelectedVariantId] = useState<string | null>(null)
  const [showCreator, setShowCreator] = useState(false)
  const [newDescription, setNewDescription] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)

  // Fetch variants
  useEffect(() => {
    const fetchVariants = async () => {
      try {
        setLoading(true)
        const response = await fetch(
          `/api/campaigns/${campaignId}/variants`
        )
        if (response.ok) {
          const data = await response.json()
          setVariants(data.data || [])
          // Select random variant for user view
          if (data.data && data.data.length > 0) {
            const randomIndex = Math.floor(Math.random() * data.data.length)
            setSelectedVariantId(data.data[randomIndex].id)
          }
          setError(null)
        } else {
          setError('Failed to load variants')
        }
      } catch (err) {
        console.error('Error fetching variants:', err)
        setError('Error loading variants')
      } finally {
        setLoading(false)
      }
    }

    fetchVariants()
  }, [campaignId])

  const handleVariantSelect = (variantId: string) => {
    setSelectedVariantId(variantId)
    onVariantChange?.(variantId)
  }

  const handleCreateVariant = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitError(null)

    if (!newDescription.trim()) {
      setSubmitError('Description is required')
      return
    }

    setIsSubmitting(true)
    try {
      const response = await fetch(
        `/api/campaigns/${campaignId}/variants`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ description: newDescription }),
        }
      )

      if (response.ok) {
        const data = await response.json()
        setVariants([data.data, ...variants])
        setNewDescription('')
        setShowCreator(false)
      } else if (response.status === 401) {
        window.location.href = '/login'
      } else {
        const errorData = await response.json()
        setSubmitError(errorData.error || 'Failed to create variant')
      }
    } catch (err) {
      console.error('Error creating variant:', err)
      setSubmitError('Error creating variant')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-pulse text-gray-400">Loading variants...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
        {error}
      </div>
    )
  }

  const currentVariant = variants.find((v) => v.id === selectedVariantId)

  return (
    <div className="space-y-6">
      {/* Current variant display */}
      <div className="p-6 bg-gradient-to-r from-violet-50 to-lime-50 rounded-lg border border-violet-100">
        <div className="flex items-start justify-between gap-4 mb-3">
          <h3 className="font-semibold text-gray-800">Current Description</h3>
          {currentVariant?.isPrimary ? (
            <span className="px-2 py-1 text-xs font-medium bg-violet-100 text-violet-700 rounded">
              Primary
            </span>
          ) : (
            <span className="px-2 py-1 text-xs font-medium bg-lime-100 text-lime-700 rounded">
              Variant {currentVariant?.order}
            </span>
          )}
        </div>
        <p className="text-gray-700 leading-relaxed">
          {currentVariant?.description}
        </p>
      </div>

      {/* Creator view with metrics */}
      {isCreator && variants.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-gray-800 font-semibold">
            <BarChart3 size={20} />
            Performance Comparison
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {variants.map((variant) => (
              <div
                key={variant.id}
                className={cn(
                  'p-4 rounded-lg border-2 transition-all duration-200 cursor-pointer',
                  selectedVariantId === variant.id
                    ? 'border-violet-500 bg-violet-50'
                    : 'border-gray-200 hover:border-gray-300 bg-white'
                )}
                onClick={() => handleVariantSelect(variant.id)}
              >
                <div className="flex items-start justify-between gap-2 mb-3">
                  <span className="text-sm font-medium text-gray-600">
                    {variant.isPrimary ? 'Primary' : `Variant ${variant.order}`}
                  </span>
                  {selectedVariantId === variant.id && (
                    <span className="text-xs font-semibold text-violet-600">
                      SELECTED
                    </span>
                  )}
                </div>

                <p className="text-xs text-gray-700 line-clamp-2 mb-3">
                  {variant.description}
                </p>

                <div className="space-y-2 text-xs">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Views:</span>
                    <span className="font-semibold text-gray-800">
                      {variant.metrics.views}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Engagement:</span>
                    <span className="font-semibold text-gray-800">
                      {variant.metrics.engagement}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Conversion:</span>
                    <span className="font-semibold text-lime-600">
                      {variant.metrics.conversionRate}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Create new variant */}
          {variants.length < 4 && (
            <div className="space-y-3">
              {!showCreator ? (
                <button
                  onClick={() => setShowCreator(true)}
                  className={cn(
                    'w-full flex items-center justify-center gap-2 px-4 py-3 rounded-lg',
                    'font-medium text-sm transition-all duration-200',
                    'bg-lime-50 text-lime-700 border border-lime-200 hover:bg-lime-100 focus:ring-2 focus:ring-lime-500 focus:ring-offset-2'
                  )}
                >
                  <Plus size={18} />
                  Add New Variant
                </button>
              ) : (
                <form onSubmit={handleCreateVariant} className="space-y-3 p-4 bg-white rounded-lg border border-lime-200">
                  <textarea
                    value={newDescription}
                    onChange={(e) => setNewDescription(e.target.value)}
                    placeholder="Enter alternative campaign description..."
                    maxLength={500}
                    className={cn(
                      'w-full px-3 py-2 rounded-lg border',
                      'text-sm placeholder-gray-400 resize-none',
                      'focus:outline-none focus:ring-2 focus:ring-lime-500 focus:ring-offset-2',
                      'border-gray-300 hover:border-gray-400'
                    )}
                    rows={4}
                  />
                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    <span>{newDescription.length}/500</span>
                  </div>
                  {submitError && (
                    <div className="text-xs text-red-600">{submitError}</div>
                  )}
                  <div className="flex gap-2">
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className={cn(
                        'flex-1 px-3 py-2 rounded-lg font-medium text-sm',
                        'transition-all duration-200',
                        'focus:outline-none focus:ring-2 focus:ring-offset-2',
                        isSubmitting
                          ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                          : 'bg-lime-600 text-white hover:bg-lime-700 focus:ring-lime-500'
                      )}
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 size={16} className="inline animate-spin mr-1" />
                          Creating...
                        </>
                      ) : (
                        'Create Variant'
                      )}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setShowCreator(false)
                        setNewDescription('')
                        setSubmitError(null)
                      }}
                      className={cn(
                        'px-3 py-2 rounded-lg font-medium text-sm',
                        'bg-gray-200 text-gray-700 hover:bg-gray-300',
                        'transition-all duration-200'
                      )}
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              )}
            </div>
          )}
        </div>
      )}

      {/* User view only - show selected variant info */}
      {!isCreator && variants.length > 1 && (
        <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-sm text-blue-800">
            You're viewing variant {variants.findIndex((v) => v.id === selectedVariantId) + 1} of {variants.length}. Help us improve by sharing your feedback!
          </p>
        </div>
      )}
    </div>
  )
}
