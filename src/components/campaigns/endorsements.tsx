'use client'

import React, { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Quote, Star, Loader2, User } from 'lucide-react'
import { cn } from '@/lib/utils'
import { formatRelativeTime } from '@/lib/utils'

interface Endorser {
  id: string
  displayName: string
  avatar?: string
  handle?: string
}

interface Endorsement {
  id: string
  userId: string
  user: Endorser
  title: string
  organization: string
  quote: string
  createdAt: string | Date
}

interface EndorsementsProps {
  campaignId: string
  className?: string
  isAuthenticated?: boolean
  currentUserId?: string
}

export const Endorsements: React.FC<EndorsementsProps> = ({
  campaignId,
  className,
  isAuthenticated = false,
  currentUserId,
}) => {
  const [endorsements, setEndorsements] = useState<Endorsement[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showForm, setShowForm] = useState(false)
  const [hasEndorsed, setHasEndorsed] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    title: '',
    organization: '',
    quote: '',
  })
  const [error, setError] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)

  useEffect(() => {
    fetchEndorsements()
  }, [campaignId])

  const fetchEndorsements = async () => {
    try {
      setIsLoading(true)
      setError(null)
      const response = await fetch(`/api/campaigns/${campaignId}/endorsements`)
      const result = await response.json()

      if (result.success) {
        const endorsementsList = result.data || []
        setEndorsements(endorsementsList)
        if (currentUserId) {
          setHasEndorsed(endorsementsList.some((e: Endorsement) => e.userId === currentUserId))
        }
      } else {
        setError(result.error || 'Failed to load endorsements')
      }
    } catch (err) {
      console.error('Error fetching endorsements:', err)
      setError('Failed to load endorsements')
    } finally {
      setIsLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setSuccessMessage(null)

    // Validate form
    if (!formData.name.trim()) {
      setError('Name is required')
      return
    }
    if (!formData.title.trim()) {
      setError('Title is required')
      return
    }
    if (!formData.organization.trim()) {
      setError('Organization is required')
      return
    }
    if (!formData.quote.trim()) {
      setError('Quote is required')
      return
    }

    try {
      setIsSubmitting(true)
      const response = await fetch(`/api/campaigns/${campaignId}/endorsements`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.name,
          title: formData.title,
          organization: formData.organization,
          quote: formData.quote,
        }),
      })

      const result = await response.json()

      if (result.success) {
        setSuccessMessage('Endorsement submitted successfully!')
        setFormData({ name: '', title: '', organization: '', quote: '' })
        setShowForm(false)
        await fetchEndorsements()
      } else {
        setError(result.error || 'Failed to submit endorsement')
      }
    } catch (err) {
      console.error('Error submitting endorsement:', err)
      setError('Failed to submit endorsement. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className={cn('space-y-8', className)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Star className="w-6 h-6 text-violet-600 fill-violet-600" />
            Campaign Endorsements
          </h2>
          <p className="mt-2 text-gray-600">
            {endorsements.length} professional endorsement{endorsements.length !== 1 ? 's' : ''} from notable supporters
          </p>
        </div>

        {isAuthenticated && !hasEndorsed && !showForm && (
          <Button
            onClick={() => setShowForm(true)}
            className="bg-violet-600 hover:bg-violet-700 text-white"
          >
            Add Your Endorsement
          </Button>
        )}
      </div>

      {/* Success Message */}
      {successMessage && (
        <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
          <p className="text-sm text-green-800">{successMessage}</p>
        </div>
      )}

      {/* Submit Form */}
      {showForm && isAuthenticated && (
        <div className="bg-gradient-to-br from-violet-50 to-lime-50 border border-violet-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Quote className="w-5 h-5 text-violet-600" />
            Share Your Endorsement
          </h3>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Name */}
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-1">
                Your Name <span className="text-red-500">*</span>
              </label>
              <Input
                placeholder="Full name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                disabled={isSubmitting}
                className="border-gray-300"
              />
            </div>

            {/* Title */}
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-1">
                Professional Title <span className="text-red-500">*</span>
              </label>
              <Input
                placeholder="e.g., VP of Product, CEO, Designer"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                disabled={isSubmitting}
                className="border-gray-300"
              />
            </div>

            {/* Organization */}
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-1">
                Organization <span className="text-red-500">*</span>
              </label>
              <Input
                placeholder="e.g., Acme Corp, Startup Labs"
                value={formData.organization}
                onChange={(e) => setFormData({ ...formData, organization: e.target.value })}
                disabled={isSubmitting}
                className="border-gray-300"
              />
            </div>

            {/* Quote */}
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-1">
                Your Endorsement Quote <span className="text-red-500">*</span>
              </label>
              <Textarea
                placeholder="Why do you endorse this campaign?"
                value={formData.quote}
                onChange={(e) => setFormData({ ...formData, quote: e.target.value })}
                rows={4}
                disabled={isSubmitting}
                className="border-gray-300"
                maxLength={280}
              />
              <p className="mt-1 text-xs text-gray-500">
                {formData.quote.length} / 280 characters
              </p>
            </div>

            {/* Error */}
            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded text-sm text-red-800">
                {error}
              </div>
            )}

            {/* Info */}
            <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-xs text-blue-900">
                Your endorsement will appear publicly with your verified name and title,
                helping build credibility for this campaign.
              </p>
            </div>

            {/* Actions */}
            <div className="flex gap-3 justify-end pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setShowForm(false)
                  setError(null)
                  setFormData({ name: '', title: '', organization: '', quote: '' })
                }}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting || !formData.name.trim() || !formData.title.trim() || !formData.organization.trim() || !formData.quote.trim()}
                className="bg-lime-600 hover:bg-lime-700 text-white"
              >
                {isSubmitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                Submit Endorsement
              </Button>
            </div>
          </form>
        </div>
      )}

      {/* Auth Required Message */}
      {!isAuthenticated && showForm && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 text-center">
          <p className="text-sm text-amber-900">
            Please sign in to submit an endorsement
          </p>
        </div>
      )}

      {/* Loading State */}
      {isLoading && (
        <div className="flex justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-violet-600" />
        </div>
      )}

      {/* Empty State */}
      {!isLoading && endorsements.length === 0 && (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-8 text-center">
          <User className="w-10 h-10 text-gray-400 mx-auto mb-3" />
          <p className="text-gray-700 font-medium">No endorsements yet</p>
          <p className="text-sm text-gray-600 mt-1">
            Be the first to endorse this campaign and showcase your support
          </p>
          {isAuthenticated && !showForm && (
            <Button
              onClick={() => setShowForm(true)}
              className="mt-4 bg-violet-600 hover:bg-violet-700 text-white"
            >
              Add First Endorsement
            </Button>
          )}
        </div>
      )}

      {/* Endorsement Cards Grid */}
      {!isLoading && endorsements.length > 0 && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-1">
          {endorsements.map((endorsement) => (
            <EndorsementCard key={endorsement.id} endorsement={endorsement} />
          ))}
        </div>
      )}
    </div>
  )
}

interface EndorsementCardProps {
  endorsement: Endorsement
}

const EndorsementCard: React.FC<EndorsementCardProps> = ({ endorsement }) => {
  const createdDate = typeof endorsement.createdAt === 'string'
    ? endorsement.createdAt
    : endorsement.createdAt.toISOString()

  return (
    <div className="bg-white border border-violet-200 rounded-lg p-6 hover:shadow-lg transition-shadow">
      {/* Quote Section */}
      <div className="flex gap-3 mb-4">
        <Quote className="w-5 h-5 text-violet-600 flex-shrink-0 mt-1" />
        <blockquote className="flex-1">
          <p className="text-gray-800 italic">"{endorsement.quote}"</p>
        </blockquote>
      </div>

      {/* Divider */}
      <div className="h-px bg-gradient-to-r from-violet-200 via-lime-200 to-transparent my-4" />

      {/* Endorser Info */}
      <div className="flex items-start gap-3">
        {/* Avatar */}
        <div className="flex-shrink-0">
          {endorsement.user.avatar ? (
            <img
              src={endorsement.user.avatar}
              alt={endorsement.user.displayName}
              className="w-12 h-12 rounded-full object-cover border border-violet-200"
            />
          ) : (
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-violet-400 to-lime-400 flex items-center justify-center text-white font-semibold text-sm border border-violet-200">
              {endorsement.user.displayName.charAt(0).toUpperCase()}
            </div>
          )}
        </div>

        {/* Name, Title, Org */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h4 className="font-semibold text-gray-900">
              {endorsement.user.displayName}
            </h4>
            <Star className="w-4 h-4 text-amber-500 fill-amber-500 flex-shrink-0" />
          </div>
          <p className="text-sm text-gray-600 mt-1">
            {endorsement.title}
            {endorsement.organization && (
              <span className="text-gray-400"> • {endorsement.organization}</span>
            )}
          </p>
          {endorsement.user.handle && (
            <p className="text-xs text-gray-500 mt-1">@{endorsement.user.handle}</p>
          )}
        </div>
      </div>

      {/* Timestamp */}
      <p className="text-xs text-gray-500 mt-4 pt-4 border-t border-gray-100">
        Endorsed {formatRelativeTime(createdDate)}
      </p>
    </div>
  )
}

export default Endorsements
