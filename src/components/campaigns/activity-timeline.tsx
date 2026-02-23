'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { formatRelativeTime } from '@/lib/utils'
import { Avatar } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface TimelineUser {
  id: string
  displayName: string
  avatar?: string
}

interface TimelineEvent {
  id: string
  type: string
  description: string
  user?: TimelineUser
  createdAt: string
  metadata?: Record<string, any>
}

interface ActivityTimelineProps {
  campaignId: string
}

// Icon mapping for event types
const getIconForType = (type: string) => {
  switch (type) {
    case 'campaign_created':
      return (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
        </svg>
      )
    case 'lobby_created':
      return (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm3.5-9c.83 0 1.5-.67 1.5-1.5S16.33 8 15.5 8 14 8.67 14 9.5s.67 1.5 1.5 1.5zm-7 0c.83 0 1.5-.67 1.5-1.5S9.33 8 8.5 8 7 8.67 7 9.5 7.67 11 8.5 11z" />
        </svg>
      )
    case 'comment_created':
      return (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
          <path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z" />
        </svg>
      )
    case 'campaign_shared':
      return (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
          <path d="M18 16.08c-.76 0-1.44.3-1.96.77L8.91 12.7c.05-.23.09-.46.09-.7s-.04-.47-.09-.7l7.05-4.15c.52.47 1.2.77 1.96.77 1.66 0 3-1.34 3-3s-1.34-3-3-3-3 1.34-3 3c0 .24.04.47.09.7L8.91 9.3C8.39 8.83 7.71 8.53 7 8.53 5.34 8.53 4 9.87 4 11.53s1.34 3 3 3c.76 0 1.44-.3 1.96-.77l7.05 4.15c-.05.23-.09.46-.09.7 0 1.66 1.34 3 3 3s3-1.34 3-3-1.34-3-3-3z" />
        </svg>
      )
    case 'campaign_updated':
      return (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
          <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z" />
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
const getTypeColor = (type: string) => {
  switch (type) {
    case 'campaign_created':
      return 'bg-violet-600' // Violet for campaign creation
    case 'lobby_created':
      return 'bg-lime-500' // Lime for lobbies (interest)
    case 'comment_created':
      return 'bg-blue-500' // Blue for comments
    case 'campaign_shared':
      return 'bg-orange-500' // Orange for shares
    case 'campaign_updated':
      return 'bg-violet-500' // Violet for updates
    default:
      return 'bg-gray-400' // Gray default
  }
}

// Get label for type
const getTypeLabel = (type: string) => {
  switch (type) {
    case 'campaign_created':
      return 'Campaign Created'
    case 'lobby_created':
      return 'Interest Added'
    case 'comment_created':
      return 'Comment'
    case 'campaign_shared':
      return 'Campaign Shared'
    case 'campaign_updated':
      return 'Campaign Update'
    default:
      return 'Activity'
  }
}

const TimelineSkeleton = () => (
  <div className="space-y-6">
    {[1, 2, 3].map((i) => (
      <div key={i} className="flex gap-4">
        <div className="flex flex-col items-center flex-shrink-0">
          <div className="w-10 h-10 rounded-full bg-gray-200 animate-pulse"></div>
          {i < 3 && <div className="w-1 h-20 bg-gray-200 mt-2 animate-pulse"></div>}
        </div>
        <div className="flex-1 pt-1">
          <div className="h-4 bg-gray-200 rounded w-48 mb-2 animate-pulse"></div>
          <div className="h-3 bg-gray-100 rounded w-32 animate-pulse"></div>
        </div>
      </div>
    ))}
  </div>
)

export function ActivityTimeline({ campaignId }: ActivityTimelineProps) {
  const [events, setEvents] = useState<TimelineEvent[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [hasMore, setHasMore] = useState(false)
  const [nextCursor, setNextCursor] = useState<string | null>(null)
  const [isLoadingMore, setIsLoadingMore] = useState(false)

  const fetchEvents = useCallback(
    async (cursor?: string | null) => {
      try {
        const url = new URL(`/api/campaigns/${campaignId}/timeline`, window.location.origin)
        url.searchParams.set('limit', '20')
        if (cursor) {
          url.searchParams.set('cursor', cursor)
        }

        const response = await fetch(url.toString())

        if (!response.ok) {
          setError('Failed to load timeline')
          return
        }

        const data = await response.json()

        if (cursor) {
          // Append to existing events
          setEvents((prev) => [...prev, ...data.events])
        } else {
          // Initial load
          setEvents(data.events)
        }

        setHasMore(data.hasMore)
        setNextCursor(data.nextCursor)
      } catch (err) {
        console.error('Error fetching timeline:', err)
        setError('Failed to load timeline')
      } finally {
        if (cursor) {
          setIsLoadingMore(false)
        } else {
          setLoading(false)
        }
      }
    },
    [campaignId]
  )

  useEffect(() => {
    fetchEvents()
  }, [fetchEvents])

  const handleLoadMore = () => {
    if (nextCursor && !isLoadingMore) {
      setIsLoadingMore(true)
      fetchEvents(nextCursor)
    }
  }

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

  if (events.length === 0) {
    return (
      <div className="text-center py-12 bg-gray-50 rounded-lg border border-gray-200">
        <div className="text-4xl mb-3">📅</div>
        <h3 className="font-semibold text-lg text-foreground mb-2">
          No activity yet
        </h3>
        <p className="text-gray-600">
          Activity will appear here as supporters engage with your campaign.
        </p>
      </div>
    )
  }

  return (
    <div className="relative">
      {/* Timeline container */}
      <div className="space-y-6">
        {events.map((event, index) => (
          <div key={event.id} className="flex gap-4">
            {/* Timeline column */}
            <div className="flex flex-col items-center flex-shrink-0">
              {/* Dot */}
              <div
                className={cn(
                  'w-10 h-10 rounded-full flex items-center justify-center text-white shadow-md transition-transform hover:scale-110',
                  getTypeColor(event.type)
                )}
              >
                {getIconForType(event.type)}
              </div>

              {/* Line connecting to next item */}
              {index < events.length - 1 && (
                <div className="w-1 h-20 bg-gray-200 mt-2"></div>
              )}
            </div>

            {/* Content column */}
            <div className="flex-1 pt-1 pb-6">
              {/* Card */}
              <div className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                {/* Header with user info and timestamp */}
                <div className="flex items-start justify-between mb-3 gap-4">
                  <div className="flex-1 min-w-0">
                    {event.user && (
                      <div className="flex items-center gap-2 mb-1">
                        <Avatar
                          src={event.user.avatar}
                          alt={event.user.displayName}
                          initials={event.user.displayName
                            .split(' ')
                            .map((n) => n.charAt(0))
                            .join('')
                            .toUpperCase()
                            .slice(0, 2)}
                          size="xs"
                        />
                        <span className="text-sm font-medium text-foreground truncate">
                          {event.user.displayName}
                        </span>
                      </div>
                    )}
                    <p className="text-xs text-gray-500">
                      {formatRelativeTime(event.createdAt)}
                    </p>
                  </div>

                  {/* Type badge */}
                  <span className="flex-shrink-0 inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700 whitespace-nowrap">
                    {getTypeLabel(event.type)}
                  </span>
                </div>

                {/* Description */}
                <p className="text-sm text-gray-700 leading-relaxed break-words">
                  {event.description}
                </p>

                {/* Metadata display for specific types */}
                {event.type === 'lobby_created' && event.metadata?.intensity && (
                  <div className="mt-2 inline-block">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium bg-lime-100 text-lime-800">
                      {event.metadata.intensity.replace(/_/g, ' ')}
                    </span>
                  </div>
                )}

                {event.type === 'campaign_shared' && event.metadata?.platform && (
                  <div className="mt-2 inline-block">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium bg-orange-100 text-orange-800">
                      {event.metadata.platform}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Load more button */}
      {hasMore && (
        <div className="mt-8 flex justify-center">
          <Button
            onClick={handleLoadMore}
            variant="outline"
            disabled={isLoadingMore}
            className="px-6"
          >
            {isLoadingMore ? (
              <>
                <svg
                  className="animate-spin -ml-1 mr-2 h-4 w-4"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                Loading more...
              </>
            ) : (
              'Load more activity'
            )}
          </Button>
        </div>
      )}
    </div>
  )
}
