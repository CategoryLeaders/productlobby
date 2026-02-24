'use client'

import React, { useState, useEffect } from 'react'
import {
  MessageSquare,
  CheckCircle,
  Clock,
  Loader2,
  Send,
  Trash2,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface BrandResponse {
  id: string
  campaignId: string
  status: 'unread' | 'read' | 'responded' | 'declined'
  templateUsed?: string
  responseText?: string
  createdAt: string
  updatedAt: string
}

interface ResponseStats {
  totalMentions: number
  responseRate: number
  avgResponseTime: string
}

interface BrandResponseCentreProps {
  campaignId: string
  isBrandOwner: boolean
}

const QUICK_REPLY_TEMPLATES = [
  {
    id: 'acknowledged',
    label: 'Acknowledged',
    text: 'Thank you for your input. We have noted your feedback.',
  },
  {
    id: 'review',
    label: 'Under Review',
    text: 'Your suggestion is under review by our team. We appreciate your interest.',
  },
  {
    id: 'planning',
    label: 'Planning Response',
    text: 'We are currently planning our response. More details coming soon.',
  },
  {
    id: 'official',
    label: 'Official Response',
    text: 'This is our official response to your campaign. Thank you for your advocacy.',
  },
]

export function BrandResponseCentre({
  campaignId,
  isBrandOwner,
}: BrandResponseCentreProps) {
  const [responses, setResponses] = useState<BrandResponse[]>([])
  const [stats, setStats] = useState<ResponseStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedResponse, setSelectedResponse] = useState<string | null>(null)
  const [replyText, setReplyText] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    fetchResponses()
  }, [campaignId])

  const fetchResponses = async () => {
    try {
      setLoading(true)
      const response = await fetch(
        `/api/campaigns/${campaignId}/brand-responses`,
        {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' },
        }
      )

      if (!response.ok) {
        throw new Error('Failed to fetch responses')
      }

      const data = await response.json()
      setResponses(data.data.responses || [])
      setStats(data.data.stats)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setLoading(false)
    }
  }

  const handleQuickReply = async (templateId: string) => {
    const template = QUICK_REPLY_TEMPLATES.find((t) => t.id === templateId)
    if (!template || !selectedResponse) return

    try {
      setIsSubmitting(true)
      const response = await fetch(
        `/api/campaigns/${campaignId}/brand-responses`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            responseId: selectedResponse,
            responseText: template.text,
            templateUsed: templateId,
          }),
        }
      )

      if (!response.ok) {
        throw new Error('Failed to submit response')
      }

      setSelectedResponse(null)
      setReplyText('')
      await fetchResponses()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to submit response')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleCustomReply = async () => {
    if (!selectedResponse || !replyText.trim()) return

    try {
      setIsSubmitting(true)
      const response = await fetch(
        `/api/campaigns/${campaignId}/brand-responses`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            responseId: selectedResponse,
            responseText: replyText,
          }),
        }
      )

      if (!response.ok) {
        throw new Error('Failed to submit response')
      }

      setSelectedResponse(null)
      setReplyText('')
      await fetchResponses()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to submit response')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDelete = async (responseId: string) => {
    if (!confirm('Are you sure you want to delete this response?')) return

    try {
      const response = await fetch(
        `/api/campaigns/${campaignId}/brand-responses`,
        {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ responseId }),
        }
      )

      if (!response.ok) {
        throw new Error('Failed to delete response')
      }

      await fetchResponses()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete response')
    }
  }

  if (!isBrandOwner) {
    return (
      <div className="p-8 bg-blue-50 border border-blue-200 rounded-lg">
        <p className="text-blue-700 font-medium">
          Only brand owners can access the Response Centre
        </p>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12 bg-gradient-to-b from-violet-50 to-white rounded-lg border border-violet-200">
        <div className="text-center space-y-3">
          <Loader2 className="w-8 h-8 animate-spin text-violet-600 mx-auto" />
          <p className="text-gray-600 text-sm">Loading response centre...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg border border-violet-200 p-8 space-y-8">
      {/* Header */}
      <div className="space-y-2">
        <h2 className="text-2xl font-bold text-gray-900">Brand Response Centre</h2>
        <p className="text-gray-600">
          Manage campaign responses and maintain engagement
        </p>
      </div>

      {/* Stats */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-gradient-to-br from-violet-50 to-violet-100 rounded-lg border border-violet-200 p-5 space-y-2">
            <p className="text-sm font-medium text-violet-700">Total Mentions</p>
            <p className="text-3xl font-bold text-violet-600">
              {stats.totalMentions}
            </p>
          </div>
          <div className="bg-gradient-to-br from-lime-50 to-lime-100 rounded-lg border border-lime-200 p-5 space-y-2">
            <p className="text-sm font-medium text-lime-700">Response Rate</p>
            <p className="text-3xl font-bold text-lime-600">
              {stats.responseRate.toFixed(1)}%
            </p>
          </div>
          <div className="bg-gradient-to-br from-amber-50 to-amber-100 rounded-lg border border-amber-200 p-5 space-y-2">
            <p className="text-sm font-medium text-amber-700">Avg Response Time</p>
            <p className="text-2xl font-bold text-amber-600">
              {stats.avgResponseTime}
            </p>
          </div>
        </div>
      )}

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-600 text-sm">{error}</p>
        </div>
      )}

      {/* Inbox */}
      <div className="space-y-4">
        <h3 className="text-lg font-bold text-gray-900">Responses Inbox</h3>

        {responses.length === 0 ? (
          <div className="p-8 bg-gray-50 border border-gray-200 rounded-lg text-center">
            <MessageSquare className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-600">No responses yet</p>
          </div>
        ) : (
          <div className="space-y-3">
            {responses.map((response) => (
              <div
                key={response.id}
                className={cn(
                  'p-5 border rounded-lg cursor-pointer transition-all',
                  selectedResponse === response.id
                    ? 'bg-violet-50 border-violet-300'
                    : 'bg-white border-gray-200 hover:border-violet-300'
                )}
                onClick={() => setSelectedResponse(response.id)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center gap-2">
                      <MessageSquare className="w-4 h-4 text-violet-600" />
                      <span className="font-medium text-gray-900">
                        Campaign Response
                      </span>
                      <span
                        className={cn(
                          'px-2 py-1 text-xs font-medium rounded-full',
                          response.status === 'unread' &&
                            'bg-blue-100 text-blue-700',
                          response.status === 'read' &&
                            'bg-gray-100 text-gray-700',
                          response.status === 'responded' &&
                            'bg-lime-100 text-lime-700',
                          response.status === 'declined' &&
                            'bg-red-100 text-red-700'
                        )}
                      >
                        {response.status}
                      </span>
                    </div>
                    {response.responseText && (
                      <p className="text-sm text-gray-600">
                        {response.responseText}
                      </p>
                    )}
                    <p className="text-xs text-gray-500">
                      {new Date(response.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  {response.status !== 'responded' && (
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={(e) => {
                        e.stopPropagation()
                        handleDelete(response.id)
                      }}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Reply Panel */}
      {selectedResponse && (
        <div className="bg-gradient-to-r from-violet-50 to-white border border-violet-200 rounded-lg p-6 space-y-4">
          <h3 className="text-lg font-bold text-gray-900">Send Response</h3>

          {/* Quick Reply Templates */}
          <div className="space-y-2">
            <p className="text-sm font-medium text-gray-700">Quick Reply Templates</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {QUICK_REPLY_TEMPLATES.map((template) => (
                <Button
                  key={template.id}
                  variant="outline"
                  size="sm"
                  onClick={() => handleQuickReply(template.id)}
                  disabled={isSubmitting}
                  className="justify-start"
                >
                  {template.label}
                </Button>
              ))}
            </div>
          </div>

          {/* Custom Reply */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">
              Custom Response
            </label>
            <textarea
              value={replyText}
              onChange={(e) => setReplyText(e.target.value)}
              placeholder="Write a custom response..."
              className="w-full p-3 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-violet-600 focus:border-transparent"
              rows={4}
            />
            <Button
              onClick={handleCustomReply}
              disabled={!replyText.trim() || isSubmitting}
              className="w-full"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  Sending...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4 mr-2" />
                  Send Response
                </>
              )}
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
