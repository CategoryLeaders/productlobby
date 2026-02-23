'use client'

import { useState, useEffect } from 'react'
import { Pin, PinOff, Send } from 'lucide-react'
import { formatRelativeTime } from '@/lib/utils'
import { cn } from '@/lib/utils'

interface Creator {
  id: string
  displayName: string
  handle: string | null
  avatar: string | null
}

interface Announcement {
  id: string
  title: string
  message: string
  creator: Creator
  isPinned: boolean
  createdAt: string
  updatedAt: string
}

interface AnnouncementBoardProps {
  campaignId: string
  isCreator?: boolean
}

interface AnnouncementsData {
  announcements: Announcement[]
  total: number
}

export function AnnouncementBoard({ campaignId, isCreator = false }: AnnouncementBoardProps) {
  const [announcements, setAnnouncements] = useState<Announcement[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [posting, setPosting] = useState(false)
  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState({
    title: '',
    message: '',
    pinned: false,
  })

  useEffect(() => {
    fetchAnnouncements()
  }, [campaignId])

  const fetchAnnouncements = async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await fetch(`/api/campaigns/${campaignId}/announcements`)
      if (!response.ok) {
        throw new Error('Failed to fetch announcements')
      }
      const result: AnnouncementsData = await response.json()
      setAnnouncements(result.announcements)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.title.trim() || !formData.message.trim()) {
      setError('Title and message are required')
      return
    }

    try {
      setPosting(true)
      setError(null)
      const response = await fetch(`/api/campaigns/${campaignId}/announcements`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: formData.title,
          message: formData.message,
          pinned: formData.pinned,
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to post announcement')
      }

      const result = await response.json()
      setAnnouncements((prev) => [result.announcement, ...prev])
      setFormData({ title: '', message: '', pinned: false })
      setShowForm(false)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setPosting(false)
    }
  }

  if (loading) {
    return (
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <p className="text-sm text-gray-500">Loading announcements...</p>
      </div>
    )
  }

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-foreground">Announcements</h3>
          <p className="text-sm text-gray-600 mt-1">{announcements.length} announcement(s)</p>
        </div>
        {isCreator && (
          <button
            onClick={() => setShowForm(!showForm)}
            className={cn(
              'px-3 py-2 rounded-lg flex items-center gap-2 text-sm font-medium transition-colors',
              showForm
                ? 'bg-gray-100 text-gray-700'
                : 'bg-violet-100 text-violet-700 hover:bg-violet-200'
            )}
          >
            <Send size={16} />
            {showForm ? 'Cancel' : 'New Announcement'}
          </button>
        )}
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      {/* New Announcement Form */}
      {isCreator && showForm && (
        <form onSubmit={handleSubmit} className="border border-gray-200 rounded-lg p-4 space-y-4">
          <input
            type="text"
            placeholder="Announcement title"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
            maxLength={100}
          />

          <textarea
            placeholder="Announcement message"
            value={formData.message}
            onChange={(e) => setFormData({ ...formData, message: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
            rows={4}
            maxLength={1000}
          />

          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={formData.pinned}
              onChange={(e) => setFormData({ ...formData, pinned: e.target.checked })}
              className="rounded"
            />
            <span className="text-sm text-gray-700">Pin announcement</span>
          </label>

          <button
            type="submit"
            disabled={posting}
            className={cn(
              'w-full px-4 py-2 rounded-lg font-medium text-sm transition-colors',
              posting
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                : 'bg-violet-600 text-white hover:bg-violet-700'
            )}
          >
            {posting ? 'Posting...' : 'Post Announcement'}
          </button>
        </form>
      )}

      {/* Announcements List */}
      {announcements.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-sm text-gray-500">No announcements yet</p>
        </div>
      ) : (
        <div className="space-y-4">
          {announcements.map((announcement) => (
            <div
              key={announcement.id}
              className={cn(
                'border rounded-lg p-4 transition-colors',
                announcement.isPinned
                  ? 'bg-amber-50 border-amber-200'
                  : 'bg-gray-50 border-gray-200 hover:bg-gray-100'
              )}
            >
              {/* Header */}
              <div className="flex items-start justify-between gap-4 mb-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h4 className="font-semibold text-foreground">{announcement.title}</h4>
                    {announcement.isPinned && (
                      <Pin size={16} className="text-amber-600 flex-shrink-0" />
                    )}
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    {formatRelativeTime(announcement.createdAt)}
                  </p>
                </div>
              </div>

              {/* Message */}
              <p className="text-sm text-gray-700 mb-3 whitespace-pre-wrap">
                {announcement.message}
              </p>

              {/* Creator Info */}
              <div className="flex items-center gap-2 pt-3 border-t border-gray-200">
                {announcement.creator.avatar && (
                  <img
                    src={announcement.creator.avatar}
                    alt={announcement.creator.displayName}
                    className="w-6 h-6 rounded-full"
                  />
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-gray-900">
                    {announcement.creator.displayName}
                  </p>
                  {announcement.creator.handle && (
                    <p className="text-xs text-gray-500">@{announcement.creator.handle}</p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
