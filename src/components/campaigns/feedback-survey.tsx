'use client'

import React, { useState, useEffect } from 'react'
import { cn } from '@/lib/utils'
import { Star, Send } from 'lucide-react'

interface FeedbackSurveyProps {
  campaignId: string
}

type Category = 'Quality' | 'Value' | 'Experience' | 'Communication'

interface SurveyResponse {
  rating: number
  category: Category
  comment: string
}

interface SurveyData {
  averageRating: number
  responseCount: number
  responses: Array<{
    rating: number
    category: Category
    comment: string
    createdAt: string
  }>
}

const CATEGORIES: Category[] = ['Quality', 'Value', 'Experience', 'Communication']

export function FeedbackSurvey({ campaignId }: FeedbackSurveyProps) {
  const [rating, setRating] = useState<number>(0)
  const [hoverRating, setHoverRating] = useState<number>(0)
  const [category, setCategory] = useState<Category>('Quality')
  const [comment, setComment] = useState<string>('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [surveyData, setSurveyData] = useState<SurveyData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Fetch survey data on mount
  useEffect(() => {
    const fetchSurveyData = async () => {
      try {
        setIsLoading(true)
        const response = await fetch(`/api/campaigns/${campaignId}/feedback-survey`)
        if (!response.ok) {
          throw new Error('Failed to fetch survey data')
        }
        const data = await response.json()
        setSurveyData(data)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred')
      } finally {
        setIsLoading(false)
      }
    }

    fetchSurveyData()
  }, [campaignId])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (rating === 0) {
      alert('Please select a rating')
      return
    }

    try {
      setIsSubmitting(true)
      const response = await fetch(`/api/campaigns/${campaignId}/feedback-survey`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          rating,
          category,
          comment,
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to submit feedback')
      }

      // Reset form
      setRating(0)
      setComment('')
      setCategory('Quality')
      setSubmitted(true)

      // Refresh survey data
      const dataResponse = await fetch(`/api/campaigns/${campaignId}/feedback-survey`)
      if (dataResponse.ok) {
        const updatedData = await dataResponse.json()
        setSurveyData(updatedData)
      }

      // Hide success message after 3 seconds
      setTimeout(() => setSubmitted(false), 3000)
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to submit feedback')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-6 space-y-4">
        <div className="h-6 bg-gray-200 rounded animate-pulse" />
        <div className="space-y-2">
          <div className="h-4 bg-gray-200 rounded animate-pulse" />
          <div className="h-4 bg-gray-200 rounded animate-pulse w-3/4" />
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6 space-y-6">
      {/* Header with Rating Summary */}
      <div className="space-y-2">
        <h3 className="text-lg font-semibold text-gray-900">Campaign Feedback</h3>
        {surveyData && surveyData.responseCount > 0 && (
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={cn(
                    'w-4 h-4',
                    i < Math.round(surveyData.averageRating)
                      ? 'fill-yellow-400 text-yellow-400'
                      : 'text-gray-300'
                  )}
                />
              ))}
            </div>
            <span className="text-sm text-gray-600">
              {surveyData.averageRating.toFixed(1)} out of 5 ({surveyData.responseCount} responses)
            </span>
          </div>
        )}
        {surveyData && surveyData.responseCount === 0 && (
          <p className="text-sm text-gray-500">No feedback yet. Be the first to share!</p>
        )}
      </div>

      {/* Feedback Form */}
      <form onSubmit={handleSubmit} className="space-y-4 border-t border-gray-200 pt-6">
        {/* Star Rating */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">How would you rate this campaign?</label>
          <div className="flex gap-2">
            {[1, 2, 3, 4, 5].map(star => (
              <button
                key={star}
                type="button"
                onClick={() => setRating(star)}
                onMouseEnter={() => setHoverRating(star)}
                onMouseLeave={() => setHoverRating(0)}
                className="focus:outline-none transition-transform hover:scale-110"
              >
                <Star
                  className={cn(
                    'w-8 h-8 transition-colors',
                    (hoverRating || rating) >= star
                      ? 'fill-yellow-400 text-yellow-400'
                      : 'text-gray-300'
                  )}
                />
              </button>
            ))}
          </div>
        </div>

        {/* Category Select */}
        <div className="space-y-2">
          <label htmlFor="category" className="text-sm font-medium text-gray-700">
            Feedback Category
          </label>
          <select
            id="category"
            value={category}
            onChange={e => setCategory(e.target.value as Category)}
            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            {CATEGORIES.map(cat => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>

        {/* Comment Area */}
        <div className="space-y-2">
          <label htmlFor="comment" className="text-sm font-medium text-gray-700">
            Additional Comments (Optional)
          </label>
          <textarea
            id="comment"
            value={comment}
            onChange={e => setComment(e.target.value)}
            placeholder="Share your thoughts about this campaign..."
            rows={3}
            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
          />
        </div>

        {/* Submit Button and Success Message */}
        <div className="space-y-2">
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full flex items-center justify-center gap-2 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-300 text-white font-medium py-2 rounded-lg transition-colors"
          >
            <Send className="w-4 h-4" />
            {isSubmitting ? 'Submitting...' : 'Submit Feedback'}
          </button>

          {submitted && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-3 text-sm text-green-700">
              Thank you for your feedback!
            </div>
          )}

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-700">
              {error}
            </div>
          )}
        </div>
      </form>

      {/* Recent Feedback Summary */}
      {surveyData && surveyData.responses.length > 0 && (
        <div className="space-y-3 border-t border-gray-200 pt-6">
          <h4 className="text-sm font-medium text-gray-900">Recent Feedback</h4>
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {surveyData.responses.slice(0, 5).map((response, idx) => (
              <div
                key={idx}
                className="p-3 bg-gray-50 rounded-lg space-y-1"
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={cn(
                          'w-3 h-3',
                          i < response.rating
                            ? 'fill-yellow-400 text-yellow-400'
                            : 'text-gray-300'
                        )}
                      />
                    ))}
                  </div>
                  <span className="text-xs font-medium text-gray-600 bg-gray-200 px-2 py-1 rounded">
                    {response.category}
                  </span>
                </div>
                {response.comment && (
                  <p className="text-xs text-gray-700">{response.comment}</p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
