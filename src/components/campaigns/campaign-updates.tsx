'use client'

import React, { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Input } from '@/components/ui/input'
import { Loader2, Plus } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useAuth } from '@/hooks/useAuth'
import { UpdateCard } from './update-card'

interface Update {
  id: string
  title: string
  content: string
  createdAt: string
  isPinned: boolean
  creator: {
    id: string
    displayName: string
    avatar?: string
    handle?: string
  }
  media: Array<{
    id: string
    url: string
    altText?: string
  }>
  reactions: Array<{
    id: string
    userId: string
    type: string
  }>
  comments: Array<{
    id: string
    content: string
    createdAt: string
    user: {
      id: string
      displayName: string
      avatar?: string
    }
  }>
  _count?: {
    comments: number
  }
}

interface CampaignUpdatesProps {
  campaignId: string
  campaignCreatorId: string
  className?: string
}

const getRelativeTime = (dateString: string) => {
  const date = new Date(dateString)
  const now = new Date()
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000)

  if (seconds < 60) return 'just now'
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`
  if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`

  return date.toLocaleDateString()
}

export const CampaignUpdates: React.FC<CampaignUpdatesProps> = ({
  campaignId,
  campaignCreatorId,
  className,
}) => {
  const { user } = useAuth()
  const [updates, setUpdates] = useState<Update[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    title: '',
    content: '',
  })

  useEffect(() => {
    fetchUpdates()
  }, [campaignId])

  const fetchUpdates = async () => {
    try {
      setIsLoading(true)
      const response = await fetch(`/api/campaigns/${campaignId}/updates`)
      const result = await response.json()

      if (result.success) {
        setUpdates(result.data || [])
      }
    } catch (error) {
      console.error('Error fetching updates:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.title.trim() || !formData.content.trim()) {
      alert('Please fill in all fields')
      return
    }

    try {
      setIsSubmitting(true)
      const response = await fetch(`/api/campaigns/${campaignId}/updates`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      const result = await response.json()

      if (result.success) {
        setFormData({ title: '', content: '' })
        setShowForm(false)
        await fetchUpdates()
      } else {
        alert(result.error || 'Failed to post update')
      }
    } catch (error) {
      console.error('Error submitting update:', error)
      alert('Failed to post update')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDeleteUpdate = async (updateId: string) => {
    if (!confirm('Are you sure you want to delete this update?')) {
      return
    }

    try {
      const response = await fetch(
        `/api/campaigns/${campaignId}/updates/${updateId}`,
        {
          method: 'DELETE',
        }
      )

      const result = await response.json()

      if (result.success) {
        await fetchUpdates()
      } else {
        alert(result.error || 'Failed to delete update')
      }
    } catch (error) {
      console.error('Error deleting update:', error)
      alert('Failed to delete update')
    }
  }

  const isCreator = user?.id === campaignCreatorId

  return (
    <div className={cn('space-y-6', className)}>
      {/* Create Update Form */}
      {isCreator && (
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          {!showForm ? (
            <button
              onClick={() => setShowForm(true)}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 text-violet-600 border border-violet-200 rounded-lg hover:bg-violet-50 transition-colors"
            >
              <Plus className="w-4 h-4" />
              Post an Update
            </button>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Input
                  placeholder="Update title..."
                  value={formData.title}
                  onChange={(e) =>
                    setFormData({ ...formData, title: e.target.value })
                  }
                  className="border-gray-200"
                  disabled={isSubmitting}
                />
              </div>

              <div>
                <Textarea
                  placeholder="Share your update with supporters..."
                  value={formData.content}
                  onChange={(e) =>
                    setFormData({ ...formData, content: e.target.value })
                  }
                  rows={5}
                  className="border-gray-200"
                  disabled={isSubmitting}
                />
              </div>

              <div className="flex gap-3 justify-end">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowForm(false)}
                  disabled={isSubmitting}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="bg-violet-600 hover:bg-violet-700 text-white"
                >
                  {isSubmitting && (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  )}
                  Post Update
                </Button>
              </div>
            </form>
          )}
        </div>
      )}

      {/* Updates Feed */}
      <div className="space-y-4">
        {isLoading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="w-8 h-8 animate-spin text-violet-600" />
          </div>
        ) : updates.length === 0 ? (
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-8 text-center">
            <p className="text-gray-600">No updates yet</p>
            {isCreator && (
              <p className="text-sm text-gray-500 mt-2">
                Be the first to share an update with your supporters!
              </p>
            )}
          </div>
        ) : (
          updates.map((update) => (
            <UpdateCard
              key={update.id}
              update={update}
              campaignId={campaignId}
              isCreator={isCreator}
              onDelete={handleDeleteUpdate}
              getRelativeTime={getRelativeTime}
            />
          ))
        )}
      </div>
    </div>
  )
}

export default CampaignUpdates
