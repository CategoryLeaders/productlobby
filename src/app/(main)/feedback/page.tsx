'use client'

import { useState } from 'react'
import { DashboardLayout } from '@/components/shared'
import { MessageSquare, Send, CheckCircle } from 'lucide-react'
import { cn } from '@/lib/utils'

type FeedbackType = 'bug' | 'feature_request' | 'general' | 'improvement'
type Urgency = 'low' | 'medium' | 'high'

interface FeedbackFormData {
  type: FeedbackType
  title: string
  description: string
  urgency: Urgency
  email: string
}

/**
 * Feedback submission page
 * Allows users to submit feedback, bug reports, and feature requests
 */
export default function FeedbackPage() {
  const [formData, setFormData] = useState<FeedbackFormData>({
    type: 'general',
    title: '',
    description: '',
    urgency: 'medium',
    email: '',
  })

  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const feedbackTypes: { value: FeedbackType; label: string; description: string }[] = [
    {
      value: 'bug',
      label: 'Bug Report',
      description: 'Report a bug or issue',
    },
    {
      value: 'feature_request',
      label: 'Feature Request',
      description: 'Suggest a new feature',
    },
    {
      value: 'improvement',
      label: 'Improvement',
      description: 'Suggest improvements',
    },
    {
      value: 'general',
      label: 'General Feedback',
      description: 'Other feedback',
    },
  ]

  const urgencyLevels: { value: Urgency; label: string; description: string }[] = [
    {
      value: 'low',
      label: 'Low',
      description: 'Can wait',
    },
    {
      value: 'medium',
      label: 'Medium',
      description: 'Should address',
    },
    {
      value: 'high',
      label: 'High',
      description: 'Critical',
    },
  ]

  const handleTypeSelect = (type: FeedbackType) => {
    setFormData({ ...formData, type })
  }

  const handleUrgencySelect = (urgency: Urgency) => {
    setFormData({ ...formData, urgency })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/feedback', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type: formData.type,
          title: formData.title,
          description: formData.description,
          urgency: formData.urgency,
          email: formData.email,
          url: typeof window !== 'undefined' ? window.location.href : undefined,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.error || 'Failed to submit feedback')
        return
      }

      setSubmitted(true)
      setFormData({
        type: 'general',
        title: '',
        description: '',
        urgency: 'medium',
        email: '',
      })

      // Auto-reset success state after 5 seconds
      setTimeout(() => {
        setSubmitted(false)
      }, 5000)
    } catch (err) {
      console.error('Error submitting feedback:', err)
      setError('An error occurred while submitting feedback')
    } finally {
      setLoading(false)
    }
  }

  if (submitted) {
    return (
      <DashboardLayout role="supporter">
        <div className="max-w-2xl mx-auto">
          <div className="text-center py-12 space-y-4">
            <div className="flex justify-center">
              <CheckCircle className="w-16 h-16 text-green-500" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900">Thank You!</h1>
            <p className="text-gray-600 text-lg">
              We've received your feedback and appreciate your input.
            </p>
            <p className="text-gray-500">
              Our team will review your submission and use it to improve ProductLobby.
            </p>
            <div className="pt-4">
              <button
                onClick={() => setSubmitted(false)}
                className="py-2 px-6 bg-violet-600 hover:bg-violet-700 text-white font-semibold rounded-lg transition-colors"
              >
                Submit More Feedback
              </button>
            </div>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout role="supporter">
      <div className="max-w-2xl mx-auto space-y-8">
        {/* Header */}
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <MessageSquare className="w-8 h-8 text-violet-600" />
            <h1 className="text-3xl font-bold text-gray-900">Send Feedback</h1>
          </div>
          <p className="text-gray-600">
            Help us improve ProductLobby. Share your thoughts, report bugs, or request
            features.
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-700 font-medium">{error}</p>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Feedback Type Selection */}
          <div className="space-y-3">
            <label className="block text-sm font-semibold text-gray-900">
              What type of feedback?
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {feedbackTypes.map(({ value, label, description }) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => handleTypeSelect(value)}
                  className={cn(
                    'p-4 rounded-lg border-2 transition-all text-left',
                    formData.type === value
                      ? 'border-violet-600 bg-violet-50'
                      : 'border-gray-200 hover:border-violet-300'
                  )}
                >
                  <div className="font-semibold text-gray-900">{label}</div>
                  <div className="text-sm text-gray-600">{description}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Title */}
          <div className="space-y-2">
            <label htmlFor="title" className="block text-sm font-semibold text-gray-900">
              Title
            </label>
            <input
              type="text"
              id="title"
              required
              placeholder="Brief summary of your feedback"
              value={formData.title}
              onChange={(e) =>
                setFormData({ ...formData, title: e.target.value })
              }
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500"
            />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <label
              htmlFor="description"
              className="block text-sm font-semibold text-gray-900"
            >
              Description
            </label>
            <textarea
              id="description"
              required
              placeholder="Provide detailed information about your feedback..."
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              rows={6}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500 resize-none"
            />
          </div>

          {/* Urgency Level */}
          <div className="space-y-3">
            <label className="block text-sm font-semibold text-gray-900">
              How urgent is this?
            </label>
            <div className="grid grid-cols-3 gap-3">
              {urgencyLevels.map(({ value, label, description }) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => handleUrgencySelect(value)}
                  className={cn(
                    'p-3 rounded-lg border-2 transition-all text-left',
                    formData.urgency === value
                      ? 'border-violet-600 bg-violet-50'
                      : 'border-gray-200 hover:border-violet-300'
                  )}
                >
                  <div className="font-semibold text-sm text-gray-900">{label}</div>
                  <div className="text-xs text-gray-600">{description}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Email (Optional) */}
          <div className="space-y-2">
            <label htmlFor="email" className="block text-sm font-semibold text-gray-900">
              Email (optional)
            </label>
            <input
              type="email"
              id="email"
              placeholder="For follow-ups on your feedback"
              value={formData.email}
              onChange={(e) =>
                setFormData({ ...formData, email: e.target.value })
              }
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500"
            />
          </div>

          {/* Submit Button */}
          <div className="flex gap-3 pt-4">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 py-3 px-4 bg-violet-600 hover:bg-violet-700 disabled:bg-gray-400 text-white font-semibold rounded-lg transition-colors flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <div className="animate-spin">
                    <Send className="w-4 h-4" />
                  </div>
                  Submitting...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  Submit Feedback
                </>
              )}
            </button>
          </div>
        </form>

        {/* Info Box */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 space-y-2">
          <p className="text-sm font-semibold text-blue-900">
            Privacy Note
          </p>
          <p className="text-sm text-blue-700">
            We respect your privacy. Your feedback may be used to improve ProductLobby,
            but we'll never share your personal information without consent.
          </p>
        </div>
      </div>
    </DashboardLayout>
  )
}
