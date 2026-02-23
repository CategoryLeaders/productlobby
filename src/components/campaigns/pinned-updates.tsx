'use client'

import React, { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Input } from '@/components/ui/input'
import { Loader2, AlertCircle, Pin, PinOff } from 'lucide-react'
import { cn, formatRelativeTime } from '@/lib/utils'
import { useAuth } from '@/hooks/useAuth'

interface PinnedUpdate {
  id: string
  title: string
  content: string
  createdAt: string
}

interface PinnedUpdatesProps {
  campaignId: string
  isCreator?: boolean
  className?: string
}

const MAX_PINNED = 3

export function PinnedUpdates({
  campaignId,
  isCreator = false,
  className,
}: PinnedUpdatesProps) {
  const { user } = useAuth()
  const [pinnedUpdates, setPinnedUpdates] = useState<PinnedUpdate[]>([])
  const [loading, setLoading] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Form state
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [showForm, setShowForm] = useState(false)

  // Load pinned updates on mount
  useEffect(() => {
    fetchPinnedUpdates()
  }, [campaignId])

  const fetchPinnedUpdates = async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await fetch(
        `/api/campaigns/${campaignId}/pinned-updates`
      )

      if (!response.ok) {
        throw new Error('Failed to fetch pinned updates')
      }

      const data = await response.json()
      setPinnedUpdates(data.data || [])
    } catch (err) {
      console.error('Error fetching pinned updates:', err)
      setError('Failed to load pinned updates')
    } finally {
      setLoading(false)
    }
  }

  const handleAddPinnedUpdate = async () => {
    if (!title.trim() || !content.trim()) {
      setError('Please enter both title and content')
      return
    }

    try {
      setSubmitting(true)
      setError(null)
      const response = await fetch(
        `/api/campaigns/${campaignId}/pinned-updates`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ title, content }),
        }
      )

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to pin update')
      }

      // Reset form and refresh list
      setTitle('')
      setContent('')
      setShowForm(false)
      await fetchPinnedUpdates()
    } catch (err) {
      console.error('Error adding pinned update:', err)
      setError(
        err instanceof Error ? err.message : 'Failed to pin update'
      )
    } finally {
      setSubmitting(false)
    }
  }

  const handleUnpin = async (eventId: string) => {
    if (!confirm('Are you sure you want to unpin this update?')) {
      return
    }

    try {
      setError(null)
      const response = await fetch(
        `/api/campaigns/${campaignId}/pinned-updates?eventId=${eventId}`,
        {
          method: 'DELETE',
        }
      )

      if (!response.ok) {
        throw new Error('Failed to unpin update')
      }

      await fetchPinnedUpdates()
    } catch (err) {
      console.error('Error unpinning update:', err)
      setError('Failed to unpin update')
    }
  }

  return (
    <div className={cn('space-y-4', className)}>
      {error && (
        <div className="flex gap-2 items-start p-3 bg-red-50 border border-red-200 rounded-lg">
          <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-red-800">{error}</p>
        </div>
      )}

      {/* Pinned Updates Section */}
      {pinnedUpdates.length > 0 && (
        <div className="space-y-3">
          <h3 className="font-semibold text-lg text-gray-900">
            Pinned Updates
          </h3>
          {pinnedUpdates.map((update) => (
            <div
              key={update.id}
              className="border-l-4 border-amber-400 bg-amber-50 p-4 rounded-lg space-y-2"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <Pin className="h-4 w-4 text-amber-600" />
                    <h4 className="font-semibold text-gray-900">
                      {update.title}
                    </h4>
                  </div>
                  <p className="text-sm text-gray-700 mt-1">
                    {update.content}
                  </p>
                  <p className="text-xs text-gray-500 mt-2">
                    {formatRelativeTime(update.createdAt)}
                  </p>
                </div>
                {isCreator && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleUnpin(update.id)}
                    className="text-amber-600 hover:text-amber-700 hover:bg-amber-100"
                  >
                    <PinOff className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Pinned Update Form */}
      {isCreator && (
        <div className="space-y-3">
          {!showForm ? (
            <Button
              onClick={() => setShowForm(true)}
              disabled={pinnedUpdates.length >= MAX_PINNED}
              className="w-full"
            >
              <Pin className="h-4 w-4 mr-2" />
              Pin Important Update
            </Button>
          ) : (
            <div className="border border-gray-200 rounded-lg p-4 space-y-3 bg-gray-50">
              <h4 className="font-semibold text-gray-900">
                Pin Important Update
              </h4>

              {pinnedUpdates.length >= MAX_PINNED && (
                <div className="flex gap-2 items-start p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <AlertCircle className="h-5 w-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-yellow-800">
                    Maximum {MAX_PINNED} pinned updates allowed
                  </p>
                </div>
              )}

              <Input
                placeholder="Update title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                disabled={submitting}
                className="bg-white"
              />

              <Textarea
                placeholder="Update content"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                disabled={submitting}
                rows={3}
                className="bg-white"
              />

              <div className="flex gap-2 justify-end">
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowForm(false)
                    setTitle('')
                    setContent('')
                  }}
                  disabled={submitting}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleAddPinnedUpdate}
                  disabled={submitting}
                >
                  {submitting && (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  )}
                  Pin Update
                </Button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="flex items-center justify-center py-8">
          <Loader2 className="h-5 w-5 animate-spin text-gray-400" />
        </div>
      )}

      {/* Empty State */}
      {!loading && pinnedUpdates.length === 0 && !showForm && (
        <div className="text-center py-8 text-gray-500">
          <Pin className="h-6 w-6 mx-auto mb-2 opacity-50" />
          <p className="text-sm">
            {isCreator
              ? 'No pinned updates yet. Pin important updates to keep supporters informed.'
              : 'No pinned updates for this campaign.'}
          </p>
        </div>
      )}
    </div>
  )
}
