'use client'

import React, { useEffect, useState } from 'react'
import { Loader2, MessageSquare, ThumbsUp, Bell, FileText, ChevronDown } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Avatar } from '@/components/ui/avatar'
import { cn } from '@/lib/utils'

interface EventLogItem {
  id: string
  type: 'lobby' | 'comment' | 'status_change' | 'brand_response'
  title: string
  description: string
  timestamp: string
  user?: {
    id: string
    displayName: string
    avatar?: string
  }
}

interface EventLogResponse {
  success: boolean
  data: EventLogItem[]
  pagination: {
    page: number
    limit: number
    total: number
    hasMore: boolean
  }
}

interface EventLogProps {
  campaignId: string
  className?: string
  initialLimit?: number
}

const getEventIcon = (
  type: 'lobby' | 'comment' | 'status_change' | 'brand_response'
) => {
  switch (type) {
    case 'lobby':
      return <ThumbsUp className="w-5 h-5" />
    case 'comment':
      return <MessageSquare className="w-5 h-5" />
    case 'brand_response':
      return <Bell className="w-5 h-5" />
    case 'status_change':
      return <FileText className="w-5 h-5" />
    default:
      return <FileText className="w-5 h-5" />
  }
}

const getEventColor = (
  type: 'lobby' | 'comment' | 'status_change' | 'brand_response'
): string => {
  switch (type) {
    case 'lobby':
      return 'bg-green-100 text-green-700'
    case 'comment':
      return 'bg-blue-100 text-blue-700'
    case 'brand_response':
      return 'bg-purple-100 text-purple-700'
    case 'status_change':
      return 'bg-amber-100 text-amber-700'
    default:
      return 'bg-gray-100 text-gray-700'
  }
}

const formatDate = (dateString: string): string => {
  const date = new Date(dateString)
  const now = new Date()
  const diff = now.getTime() - date.getTime()

  // Less than a minute
  if (diff < 60000) {
    return 'just now'
  }

  // Less than an hour
  if (diff < 3600000) {
    const minutes = Math.floor(diff / 60000)
    return `${minutes}m ago`
  }

  // Less than a day
  if (diff < 86400000) {
    const hours = Math.floor(diff / 3600000)
    return `${hours}h ago`
  }

  // Less than a week
  if (diff < 604800000) {
    const days = Math.floor(diff / 86400000)
    return `${days}d ago`
  }

  // Format as date
  return date.toLocaleDateString('en-GB', {
    month: 'short',
    day: 'numeric',
    year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
  })
}

const getInitials = (displayName: string, email?: string): string => {
  if (displayName) {
    return displayName
      .split(' ')
      .map(n => n.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }
  return 'U'
}

export const EventLog: React.FC<EventLogProps> = ({
  campaignId,
  className,
  initialLimit = 20
}) => {
  const [events, setEvents] = useState<EventLogItem[]>([])
  const [loading, setLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalCount, setTotalCount] = useState(0)
  const [hasMore, setHasMore] = useState(false)

  const fetchEvents = async (page: number) => {
    try {
      const isFirstLoad = page === 1
      if (isFirstLoad) {
        setLoading(true)
      } else {
        setLoadingMore(true)
      }

      const response = await fetch(
        `/api/campaigns/${campaignId}/event-log?page=${page}&limit=${initialLimit}`
      )

      if (!response.ok) {
        throw new Error('Failed to fetch event log')
      }

      const result: EventLogResponse = await response.json()
      if (result.success) {
        if (isFirstLoad) {
          setEvents(result.data)
        } else {
          setEvents(prev => [...prev, ...result.data])
        }
        setTotalCount(result.pagination.total)
        setHasMore(result.pagination.hasMore)
        setCurrentPage(page)
      } else {
        setError('Failed to load events')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      if (page === 1) {
        setLoading(false)
      } else {
        setLoadingMore(false)
      }
    }
  }

  useEffect(() => {
    fetchEvents(1)
  }, [campaignId])

  const handleLoadMore = () => {
    fetchEvents(currentPage + 1)
  }

  if (loading) {
    return (
      <div className={cn('flex items-center justify-center p-8', className)}>
        <Loader2 className="w-5 h-5 text-violet-600 animate-spin" />
      </div>
    )
  }

  if (error) {
    return (
      <div className={cn('p-4 rounded-lg border border-red-200 bg-red-50', className)}>
        <p className="text-red-600 text-sm">{error}</p>
      </div>
    )
  }

  if (events.length === 0) {
    return (
      <div className={cn('p-8 rounded-lg border border-gray-200 bg-gray-50 text-center', className)}>
        <FileText className="w-8 h-8 text-gray-400 mx-auto mb-2" />
        <p className="text-gray-600">No events yet</p>
      </div>
    )
  }

  return (
    <div className={className}>
      <div className="space-y-0">
        {events.map((event, index) => (
          <div key={event.id} className="relative">
            {/* Timeline line */}
            {index < events.length - 1 && (
              <div className="absolute left-7 top-14 w-0.5 h-12 bg-gray-200" />
            )}

            {/* Event */}
            <div className="flex gap-4 pb-8">
              {/* Icon */}
              <div className="flex-shrink-0">
                <div
                  className={cn(
                    'w-14 h-14 rounded-full flex items-center justify-center',
                    getEventColor(event.type)
                  )}
                >
                  {getEventIcon(event.type)}
                </div>
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0 pt-1">
                <div className="flex items-baseline gap-2 flex-wrap">
                  <h4 className="font-semibold text-gray-900">{event.title}</h4>
                  <span className="text-xs text-gray-500">
                    {formatDate(event.timestamp)}
                  </span>
                </div>

                <p className="text-sm text-gray-600 mt-1 break-words">
                  {event.description}
                </p>

                {event.user && (
                  <div className="flex items-center gap-2 mt-3">
                    <Avatar className="w-6 h-6">
                      {event.user.avatar && (
                        <img
                          src={event.user.avatar}
                          alt={event.user.displayName}
                        />
                      )}
                      <div className="w-full h-full bg-violet-200 flex items-center justify-center text-xs font-medium text-violet-700">
                        {getInitials(event.user.displayName)}
                      </div>
                    </Avatar>
                    <span className="text-xs text-gray-600">
                      {event.user.displayName}
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
        <div className="flex justify-center pt-4">
          <Button
            variant="outline"
            onClick={handleLoadMore}
            disabled={loadingMore}
            className="gap-2"
          >
            {loadingMore ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Loading...
              </>
            ) : (
              <>
                <ChevronDown className="w-4 h-4" />
                Load More ({totalCount - events.length} remaining)
              </>
            )}
          </Button>
        </div>
      )}

      {/* End message */}
      {!hasMore && events.length > 0 && (
        <div className="flex justify-center pt-4">
          <p className="text-xs text-gray-500">
            Showing all {totalCount} event{totalCount !== 1 ? 's' : ''}
          </p>
        </div>
      )}
    </div>
  )
}
