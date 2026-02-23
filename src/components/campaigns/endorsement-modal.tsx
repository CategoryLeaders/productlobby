'use client'

import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Loader2, X } from 'lucide-react'

interface EndorsementModalProps {
  onSubmit: (data: {
    title: string
    organization: string
    reason: string
  }) => Promise<void>
  onClose: () => void
  campaignId: string
}

export const EndorsementModal: React.FC<EndorsementModalProps> = ({
  onSubmit,
  onClose,
  campaignId,
}) => {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    title: '',
    organization: '',
    reason: '',
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.title.trim() || !formData.organization.trim()) {
      alert('Please fill in title and organization')
      return
    }

    try {
      setIsSubmitting(true)
      await onSubmit(formData)
    } catch (error) {
      console.error('Error submitting endorsement:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-900">
            Endorse This Campaign
          </h2>
          <button
            onClick={onClose}
            disabled={isSubmitting}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-gray-900 mb-2">
              Your Professional Title <span className="text-red-500">*</span>
            </label>
            <Input
              placeholder="e.g., Head of Product, CEO, Designer"
              value={formData.title}
              onChange={(e) =>
                setFormData({ ...formData, title: e.target.value })
              }
              disabled={isSubmitting}
              className="border-gray-300"
            />
            <p className="mt-1 text-xs text-gray-500">
              Your role or title at your organization
            </p>
          </div>

          {/* Organization */}
          <div>
            <label className="block text-sm font-medium text-gray-900 mb-2">
              Organization <span className="text-red-500">*</span>
            </label>
            <Input
              placeholder="e.g., Acme Inc., Startup XYZ"
              value={formData.organization}
              onChange={(e) =>
                setFormData({ ...formData, organization: e.target.value })
              }
              disabled={isSubmitting}
              className="border-gray-300"
            />
            <p className="mt-1 text-xs text-gray-500">
              The company or organization where you work
            </p>
          </div>

          {/* Reason (Optional) */}
          <div>
            <label className="block text-sm font-medium text-gray-900 mb-2">
              Why do you endorse this? <span className="text-gray-400">(Optional)</span>
            </label>
            <Textarea
              placeholder="Share why you believe in this campaign..."
              value={formData.reason}
              onChange={(e) =>
                setFormData({ ...formData, reason: e.target.value })
              }
              rows={4}
              disabled={isSubmitting}
              className="border-gray-300"
              maxLength={280}
            />
            <p className="mt-1 text-xs text-gray-500">
              {formData.reason.length} / 280 characters
            </p>
          </div>

          {/* Info Box */}
          <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm text-blue-900">
              Your endorsement will be displayed publicly on this campaign page with
              your name, title, and organization. This helps build credibility and trust.
            </p>
          </div>

          {/* Actions */}
          <div className="flex gap-3 justify-end pt-4 border-t border-gray-200">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting || !formData.title.trim() || !formData.organization.trim()}
              className="bg-violet-600 hover:bg-violet-700 text-white"
            >
              {isSubmitting && (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              )}
              Submit Endorsement
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default EndorsementModal
