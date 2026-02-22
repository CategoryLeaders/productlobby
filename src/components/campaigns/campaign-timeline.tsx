'use client'

import React, { useState, useEffect } from 'react'
import { formatDate } from '@/lib/utils'
import { Avatar } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface TimelineUpdate {
  id: string
  title: string
  content: string
  updateType?: string
  createdAt: string
  creatorName: string
  creatorAvatar?: string
  images?: Array<{
    id: string
    url: string
    altText?: string
  }>
}

interface CampaignTimelineProps {
  campaignId: string
  isCreator?: boolean
}

// Icon mapping for update types
const getIconForType = (type?: string) => {
  switch (type?.toUpperCase()) {
    case 'MILESTONE':
      return (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm3.5-9c.83 0 1.5-.67 1.5-1.5S16.33 8 15.5 8 14 8.67 14 9.5s.67 1.5 1.5 1.5zm-7 0c.83 0 1.5-.67 1.5-1.5S9.33 8 8.5 8 7 8.67 7 9.5 7.67 11 8.5 11zm3.5 6.5c2.33 0 4.31-1.46 5.11-3.5H6.89c.8 2.04 2.78 3.5 5.11 3.5z" />
        </svg>
      )
    case 'ANNOUNCEMENT':
      return (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
          <path d="M10 8H8v4h2V8zm0-5H8c-1.1 0-2 .9-2 2v4h2V5h2V3zm4 11h-2v4h2v-4zm4-4h-2v8h2v-8zm-2-5h-2v4h2V3zM3 21h18v-2H3v2z" />
        </svg>
      )
    default:
      return (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-5-9h10v2H7z" />
        </svg>
      )
  }
}

// Get color for timeline dot based on type
const getTypeColor = (type?: string) => {
  switch (type?.toUpperCase()) {
    case 'MILESTONE':
      return 'bg-lime-500' // Green for milestones
    case 'ANNOUNCEMENT':
      return 'bg-violet-600' // Violet for announcements
    default:
      return 'bg-blue-500' // Blue for updates
  }
}

// Get label for type
const getTypeLabel = (type?: string) => {
  return type?.toUpperCase() || 'UPDATE'
}

const TimelineSkeleton = () => (
  <div className="space-y-6">
    {[1, 2, 3].map((i) => (
      <div key={i} className="flex gap-6">
        <div className="flex flex-col items-center">
          <div className="w-12 h-12 rounded-full bg-gray-200 animate-pulse"></div>
          {i < 3 && <div className="w-1 h-20 bg-gray-200 mt-2 animate-pulse"></div>}
        </div>
        <div className="flex-1 pt-2">
          <div className="h-4 bg-gray-200 rounded w-32 mb-3 animate-pulse"></div>
          <div className="space-y-2">
            <div className="h-3 bg-gray-100 rounded animate-pulse"></div>
            <div className="h-3 bg-gray-100 rounded w-5/6 animate-pulse"></div>
          </div>
        </div>
      </div>
    ))}
  </div>
)

export function CampaignTimeline({ campaignId, isCreator }: CampaignTimelineProps) {
  const [updates, setUpdates] = useState<TimelineUpdate[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchUpdates = async () => {
      try {
        setLoading(true)
        const response = await fetch(
          `/api/campaigns/${campaignId}/updates?limit=100&page=1`
        )

        if (!response.ok) {
          setError('Failed to load timeline')
          return
        }

        const data = await response.json()
        if (data.success) {
          // Map the API response to our timeline format
          const formattedUpdates = data.data.map((update: any) => ({
            id: update.id,
            title: update.title,
            content: update.content,
            updateType: update.updateType || 'UPDATE',
            createdAt: update.createdAt,
            creatorName: update.creatorName,
            creatorAvatar: update.creatorAvatar,
            images: update.images,
          }))
          setUpdates(formattedUpdates)
        }
      } catch (err) {
        console.error('Error fetching timeline:', err)
        setError('Failed to load timeline')
      } finally {
        setLoading(false)
      }
    }

    fetchUpdates()
  }, [campaignId])

  if (loading) {
    return <TimelineSkeleton />
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-red-600">{error}</p>
      </div>
    )
  }

  if (updates.length === 0) {
    return (
      <div className="text-center py-12 bg-gray-50 rounded-lg border border-gray-200">
        <div className="text-4xl mb-3">📝</div>
        <h3 className="font-semibold text-lg text-foreground mb-2">No updates yet</h3>
        <p className="text-gray-600 mb-6">
          No campaign updates have been posted yet. Check back soon!
        </p>
        {isCreator && (
          <p className="text-sm text-gray-500">
            You can share updates with your supporters using the form above.
          </p>
        )}
      </div>
    )
  }

  return (
    <div className="relative">
      {/* Timeline container */}
      <div className="space-y-6">
        {updates.map((update, index) => (
          <div key={update.id} className="flex gap-6">
            {/* Timeline column */}
            <div className="flex flex-col items-center flex-shrink-0">
              {/* Dot */}
              <div
                className={cn(
                  'w-12 h-12 rounded-full flex items-center justify-center text-white shadow-md transition-transform hover:scale-110',
                  getTypeColor(update.updateType)
                )}
              >
                {getIconForType(update.updateType)}
              </div>

              {/* Line connecting to next item */}
              {index < updates.length - 1 && (
                <div className="w-1 h-24 bg-gray-200 mt-2"></div>
              )}
            </div>

            {/* Content column */}
            <div className="flex-1 pt-1 pb-6">
              {/* Card */}
              <div className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <Avatar
                      src={update.creatorAvatar}
                      alt={update.creatorName}
                      initials={update.creatorName
                        .split(' ')
                        .map((n) => n.charAt(0))
                        .join('')
                        .toUpperCase()
                        .slice(0, 2)}
                      size="sm"
                    />
                    <div className="min-w-0">
                      <p className="font-medium text-foreground truncate">
                        {update.creatorName}
                      </p>
                      <p className="text-xs text-gray-500">
                        {formatDate(update.createdAt)}
                      </p>
                    </div>
                  </div>
                  {/* Type badge */}
                  <span className="ml-4 flex-shrink-0 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-700">
                    {getTypeLabel(update.updateType)}
                  </span>
                </div>

                {/* Title */}
                <h3 className="font-bold text-lg text-foreground mb-3">
                  {update.title}
                </h3>

                {/* Content */}
                <p className="text-gray-700 leading-relaxed whitespace-pre-wrap mb-4">
                  {update.content}
                </p>

                {/* Images if any */}
                {update.images && update.images.length > 0 && (
                  <div className="mt-4 -mx-6 px-6">
                    {update.images.length === 1 ? (
                      <img
                        src={update.images[0].url}
                        alt={update.images[0].altText || 'Update image'}
                        className="rounded-lg max-h-96 object-cover w-full"
                      />
                    ) : (
                      <div className="grid grid-cols-2 gap-2">
                        {update.images.slice(0, 4).map((img) => (
                          <img
                            key={img.id}
                            src={img.url}
                            alt={img.altText || 'Update image'}
                            className="rounded-lg object-cover w-full aspect-square"
                          />
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
