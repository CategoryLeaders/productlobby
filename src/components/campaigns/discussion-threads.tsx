'use client'

import React, { useState, useEffect } from 'react'
import { MessageCircle, Send, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'

interface ThreadComment {
  id: string
  content: string
  userId: string
  user: {
    displayName: string
    handle: string | null
    avatar: string | null
  }
  createdAt: string
  updatedAt: string
  status: string
  replyCount: number
  lastActivity: string
}

interface DiscussionThreadsProps {
  campaignId: string
  currentUserId?: string
}

export const DiscussionThreads: React.FC<DiscussionThreadsProps> = ({
  campaignId,
  currentUserId,
}) => {
  const [threads, setThreads] = useState<ThreadComment[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [mounted, setMounted] = useState(false)
  const [formData, setFormData] = useState({ title: '', body: '' })
  const [error, setError] = useState<string | null>(null)

  // Load threads
  useEffect(() => {
    setMounted(true)
    const fetchThreads = async () => {
      try {
        const response = await fetch(
          `/api/campaigns/${campaignId}/threads`
        )
        if (response.ok) {
          const data = await response.json()
          setThreads(data.data)
        }
      } catch (err) {
        console.error('Error fetching threads:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchThreads()
  }, [campaignId])

  const handleSubmitThread = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!formData.title.trim() || !formData.body.trim()) {
      setError('Title and body are required')
      return
    }

    setSubmitting(true)

    try {
      const response = await fetch(
        `/api/campaigns/${campaignId}/threads`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(formData),
        }
      )

      if (response.ok) {
        const data = await response.json()
        setThreads([data.data, ...threads])
        setFormData({ title: '', body: '' })
        setShowForm(false)
      } else if (response.status === 401) {
        window.location.href = '/login'
      } else {
        const data = await response.json()
        setError(data.error || 'Failed to create thread')
      }
    } catch (err) {
      setError('An error occurred. Please try again.')
      console.error('Error creating thread:', err)
    } finally {
      setSubmitting(false)
    }
  }

  if (!mounted) {
    return null
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMs / 3600000)
    const diffDays = Math.floor(diffMs / 86400000)

    if (diffMins < 1) return 'just now'
    if (diffMins < 60) return `${diffMins}m ago`
    if (diffHours < 24) return `${diffHours}h ago`
    if (diffDays < 7) return `${diffDays}d ago`

    return date.toLocaleDateString()
  }

  const extractTitle = (content: string) => {
    const match = content.match(/^# (.+?)(?:\n|$)/)
    return match ? match[1] : 'Untitled'
  }

  const extractBody = (content: string) => {
    return content.replace(/^# .+?\n\n?/, '')
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <MessageCircle size={20} />
          Discussion ({threads.length})
        </h3>
        {currentUserId && (
          <button
            onClick={() => setShowForm(!showForm)}
            className={cn(
              'px-4 py-2 rounded-lg font-medium transition-all',
              'focus:outline-none focus:ring-2 focus:ring-offset-2',
              'text-sm',
              showForm
                ? 'bg-gray-200 text-gray-800'
                : 'bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500'
            )}
          >
            {showForm ? 'Cancel' : 'New Thread'}
          </button>
        )}
      </div>

      {/* New Thread Form */}
      {showForm && currentUserId && (
        <form
          onSubmit={handleSubmitThread}
          className="bg-gray-50 border border-gray-200 rounded-lg p-4 space-y-4"
        >
          <input
            type="text"
            placeholder="Thread title"
            value={formData.title}
            onChange={(e) =>
              setFormData({ ...formData, title: e.target.value })
            }
            maxLength={280}
            className={cn(
              'w-full px-3 py-2 border border-gray-300 rounded-lg',
              'focus:outline-none focus:ring-2 focus:ring-blue-500',
              'placeholder-gray-400'
            )}
            disabled={submitting}
          />

          <textarea
            placeholder="What would you like to discuss?"
            value={formData.body}
            onChange={(e) =>
              setFormData({ ...formData, body: e.target.value })
            }
            maxLength={5000}
            rows={4}
            className={cn(
              'w-full px-3 py-2 border border-gray-300 rounded-lg resize-none',
              'focus:outline-none focus:ring-2 focus:ring-blue-500',
              'placeholder-gray-400'
            )}
            disabled={submitting}
          />

          {error && (
            <p className="text-sm text-red-600">{error}</p>
          )}

          <button
            type="submit"
            disabled={submitting}
            className={cn(
              'flex items-center gap-2 px-4 py-2 rounded-lg font-medium',
              'transition-all duration-200',
              'focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500',
              'disabled:opacity-50 disabled:cursor-not-allowed',
              'bg-blue-600 text-white hover:bg-blue-700'
            )}
          >
            {submitting ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                <span>Posting...</span>
              </>
            ) : (
              <>
                <Send size={16} />
                <span>Post Thread</span>
              </>
            )}
          </button>
        </form>
      )}

      {/* Threads List */}
      <div className="space-y-3">
        {loading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="animate-spin text-gray-400" />
          </div>
        ) : threads.length === 0 ? (
          <div className="text-center py-8">
            <MessageCircle
              size={40}
              className="mx-auto text-gray-300 mb-3"
            />
            <p className="text-gray-600">No discussions yet</p>
            {currentUserId && (
              <p className="text-sm text-gray-500 mt-1">
                Be the first to start a discussion
              </p>
            )}
          </div>
        ) : (
          threads.map((thread) => (
            <div
              key={thread.id}
              className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
            >
              <div className="flex gap-3">
                {/* Avatar */}
                {thread.user.avatar && (
                  <img
                    src={thread.user.avatar}
                    alt={thread.user.displayName}
                    className="w-10 h-10 rounded-full object-cover"
                  />
                )}

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <h4 className="font-semibold text-gray-900 line-clamp-2">
                    {extractTitle(thread.content)}
                  </h4>

                  <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                    {extractBody(thread.content)}
                  </p>

                  {/* Footer */}
                  <div className="flex items-center gap-4 mt-3 text-xs text-gray-500">
                    <span>
                      by {thread.user.handle || thread.user.displayName}
                    </span>
                    <span>{formatDate(thread.createdAt)}</span>
                    <div className="flex items-center gap-1">
                      <MessageCircle size={14} />
                      <span>
                        {thread.replyCount}{' '}
                        {thread.replyCount === 1 ? 'reply' : 'replies'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
