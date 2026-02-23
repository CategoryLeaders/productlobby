'use client'

import React, { useState, useEffect } from 'react'
import { cn } from '@/lib/utils'
import { Heart, Send, AlertCircle, CheckCircle } from 'lucide-react'

interface ImpactStory {
  id: string
  userId: string
  authorName: string
  authorEmail: string
  title: string
  story: string
  impact: string
  createdAt: string
}

interface ImpactStoriesProps {
  campaignId: string
}

export function ImpactStories({ campaignId }: ImpactStoriesProps) {
  const [stories, setStories] = useState<ImpactStory[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [submitSuccess, setSubmitSuccess] = useState(false)
  const [formData, setFormData] = useState({
    title: '',
    story: '',
    impact: '',
  })

  // Fetch stories
  useEffect(() => {
    const fetchStories = async () => {
      try {
        setIsLoading(true)
        const response = await fetch(`/api/campaigns/${campaignId}/impact-stories`)
        if (!response.ok) {
          throw new Error('Failed to fetch impact stories')
        }
        const data = await response.json()
        if (data.success) {
          setStories(data.data.stories)
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred')
      } finally {
        setIsLoading(false)
      }
    }

    fetchStories()
  }, [campaignId])

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitError(null)
    setSubmitSuccess(false)

    // Validate fields
    if (!formData.title.trim() || !formData.story.trim() || !formData.impact.trim()) {
      setSubmitError('All fields are required')
      return
    }

    try {
      setIsSubmitting(true)
      const response = await fetch(`/api/campaigns/${campaignId}/impact-stories`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      const data = await response.json()

      if (!response.ok) {
        setSubmitError(data.error || 'Failed to submit impact story')
        return
      }

      setSubmitSuccess(true)
      setStories(data.data.stories.concat(stories))
      setFormData({ title: '', story: '', impact: '' })
      setShowForm(false)

      // Clear success message after 3 seconds
      setTimeout(() => setSubmitSuccess(false), 3000)
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="rounded-lg border border-slate-200 bg-white p-6">
      <div className="mb-6 flex items-center gap-3">
        <Heart className="h-6 w-6 text-red-600" />
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Impact Stories</h2>
          <p className="text-sm text-slate-600">
            {stories.length} stor{stories.length !== 1 ? 'ies' : 'y'} shared
          </p>
        </div>
      </div>

      {/* Submission Form */}
      {!showForm && (
        <button
          onClick={() => setShowForm(true)}
          className="mb-6 rounded-lg border border-blue-300 bg-blue-50 px-4 py-2 font-medium text-blue-600 transition-colors hover:bg-blue-100"
        >
          Share Your Impact Story
        </button>
      )}

      {showForm && (
        <div className="mb-6 rounded-lg border border-slate-200 bg-slate-50 p-4">
          <h3 className="mb-4 font-semibold text-slate-900">Submit Your Story</h3>

          {submitSuccess && (
            <div className="mb-4 rounded-lg bg-green-50 p-3 text-sm text-green-700">
              <div className="flex gap-2">
                <CheckCircle className="h-4 w-4 flex-shrink-0" />
                <span>Thank you for sharing your impact story!</span>
              </div>
            </div>
          )}

          {submitError && (
            <div className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-700">
              <div className="flex gap-2">
                <AlertCircle className="h-4 w-4 flex-shrink-0" />
                <span>{submitError}</span>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">
                Story Title
              </label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                placeholder="Give your story a title"
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-900 placeholder-slate-400"
                disabled={isSubmitting}
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">
                Your Story
              </label>
              <textarea
                name="story"
                value={formData.story}
                onChange={handleInputChange}
                placeholder="Tell us your story and how you got involved with this campaign"
                rows={4}
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-900 placeholder-slate-400"
                disabled={isSubmitting}
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">
                How Did This Campaign Impact You?
              </label>
              <textarea
                name="impact"
                value={formData.impact}
                onChange={handleInputChange}
                placeholder="Describe the impact this campaign has had on you or your business"
                rows={3}
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-900 placeholder-slate-400"
                disabled={isSubmitting}
              />
            </div>

            <div className="flex gap-3">
              <button
                type="submit"
                disabled={isSubmitting}
                className={cn(
                  'flex items-center gap-2 rounded-lg px-4 py-2 font-medium transition-colors',
                  isSubmitting
                    ? 'bg-slate-300 text-slate-500 cursor-not-allowed'
                    : 'bg-red-600 text-white hover:bg-red-700'
                )}
              >
                <Send className="h-4 w-4" />
                {isSubmitting ? 'Submitting...' : 'Submit Story'}
              </button>
              <button
                type="button"
                onClick={() => setShowForm(false)}
                disabled={isSubmitting}
                className="rounded-lg border border-slate-300 px-4 py-2 font-medium text-slate-700 transition-colors hover:bg-slate-100"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Stories Display */}
      {isLoading ? (
        <div className="text-slate-500">Loading stories...</div>
      ) : error ? (
        <div className="text-red-600">{error}</div>
      ) : stories.length === 0 ? (
        <div className="rounded-lg border border-slate-200 bg-slate-50 p-8 text-center">
          <p className="text-slate-600">
            No impact stories yet. Be the first to share how this campaign has impacted you!
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {stories.map((story) => (
            <div key={story.id} className="rounded-lg border border-slate-200 p-4">
              <div className="mb-3 flex items-start justify-between">
                <div>
                  <h3 className="font-bold text-slate-900">{story.title}</h3>
                  <p className="text-xs text-slate-500">
                    by {story.authorName} on{' '}
                    {new Date(story.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>

              <div className="mb-3 space-y-2">
                <div>
                  <p className="text-xs font-semibold text-slate-700">Story</p>
                  <p className="text-sm text-slate-600">{story.story}</p>
                </div>
                <div>
                  <p className="text-xs font-semibold text-slate-700">Impact</p>
                  <p className="text-sm text-slate-600">{story.impact}</p>
                </div>
              </div>

              <div className="flex gap-2 text-xs text-slate-500">
                <Heart className="h-4 w-4" />
                <span>This story was shared on the campaign</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
