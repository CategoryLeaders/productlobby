'use client'

import { useState } from 'react'
import { AlertCircle, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogTrigger,
} from '@/components/ui/dialog'
import { cn } from '@/lib/utils'

type ReportReason = 'spam' | 'inappropriate' | 'misleading' | 'duplicate' | 'other'

interface ReportDialogProps {
  campaignId: string
  campaignTitle: string
  onReportSuccess?: () => void
}

const REPORT_REASONS: Array<{ value: ReportReason; label: string; description: string }> = [
  {
    value: 'spam',
    label: 'Spam',
    description: 'Repetitive or promotional content',
  },
  {
    value: 'inappropriate',
    label: 'Inappropriate content',
    description: 'Offensive, abusive, or harmful content',
  },
  {
    value: 'misleading',
    label: 'Misleading information',
    description: 'False, deceptive, or misleading claims',
  },
  {
    value: 'duplicate',
    label: 'Duplicate campaign',
    description: 'Campaign already exists on platform',
  },
  {
    value: 'other',
    label: 'Other',
    description: 'Something else (please specify)',
  },
]

export function ReportDialog({ campaignId, campaignTitle, onReportSuccess }: ReportDialogProps) {
  const [open, setOpen] = useState(false)
  const [selectedReason, setSelectedReason] = useState<ReportReason | null>(null)
  const [details, setDetails] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!selectedReason) {
      setError('Please select a reason')
      return
    }

    setLoading(true)

    try {
      const response = await fetch(`/api/campaigns/${campaignId}/report`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          reason: selectedReason,
          details: details.trim() || null,
        }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to submit report')
      }

      setSuccess(true)
      setSelectedReason(null)
      setDetails('')

      // Close dialog after success
      setTimeout(() => {
        setOpen(false)
        setSuccess(false)
        onReportSuccess?.()
      }, 2000)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm" className="text-red-600 hover:text-red-700 hover:bg-red-50">
          <AlertCircle className="h-4 w-4 mr-1" />
          Report
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Report Campaign</DialogTitle>
          <DialogDescription>
            Help us keep the platform safe. Report inappropriate content or violations.
          </DialogDescription>
        </DialogHeader>

        {success ? (
          <div className="flex flex-col items-center justify-center py-8">
            <div className="h-12 w-12 rounded-full bg-lime-100 flex items-center justify-center mb-4">
              <svg
                className="h-6 w-6 text-lime-600"
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path d="M5 13l4 4L19 7"></path>
              </svg>
            </div>
            <h3 className="font-semibold text-gray-900 mb-1">Thank you</h3>
            <p className="text-sm text-gray-600 text-center">
              Your report has been submitted. Our team will review it shortly.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2">
                <AlertCircle className="h-4 w-4 text-red-600 mt-0.5 flex-shrink-0" />
                <p className="text-sm text-red-700">{error}</p>
              </div>
            )}

            <div className="space-y-3">
              <label className="text-sm font-medium text-gray-900">
                Reason for report
              </label>
              <div className="space-y-2">
                {REPORT_REASONS.map((reason) => (
                  <label
                    key={reason.value}
                    className={cn(
                      'flex items-start p-3 border rounded-lg cursor-pointer transition-colors',
                      selectedReason === reason.value
                        ? 'border-violet-500 bg-violet-50'
                        : 'border-gray-200 hover:border-gray-300'
                    )}
                  >
                    <input
                      type="radio"
                      name="reason"
                      value={reason.value}
                      checked={selectedReason === reason.value}
                      onChange={(e) => setSelectedReason(e.target.value as ReportReason)}
                      className="mt-0.5 accent-violet-600"
                    />
                    <div className="ml-3 flex-1">
                      <p className="text-sm font-medium text-gray-900">{reason.label}</p>
                      <p className="text-xs text-gray-500">{reason.description}</p>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            {selectedReason === 'other' && (
              <div className="space-y-2">
                <label htmlFor="details" className="text-sm font-medium text-gray-900">
                  Please explain (required)
                </label>
                <textarea
                  id="details"
                  value={details}
                  onChange={(e) => setDetails(e.target.value)}
                  placeholder="Tell us what's wrong with this campaign..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-transparent resize-none"
                  rows={3}
                  required
                />
              </div>
            )}

            {selectedReason && selectedReason !== 'other' && (
              <div className="space-y-2">
                <label htmlFor="details" className="text-sm font-medium text-gray-900">
                  Additional details (optional)
                </label>
                <textarea
                  id="details"
                  value={details}
                  onChange={(e) => setDetails(e.target.value)}
                  placeholder="Add any additional information..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-transparent resize-none"
                  rows={2}
                />
              </div>
            )}

            <DialogFooter className="flex gap-2">
              <Button
                type="button"
                variant="ghost"
                onClick={() => setOpen(false)}
                disabled={loading}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="destructive"
                loading={loading}
                disabled={!selectedReason}
              >
                Submit Report
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  )
}
