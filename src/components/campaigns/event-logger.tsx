'use client'

import React, { useEffect, useState, useCallback } from 'react'
import {
  Loader2,
  ChevronDown,
  ChevronUp,
  Download,
  Search,
  Calendar,
  Filter,
  Eye,
  EyeOff,
  CheckCircle,
  Gift,
  Share2,
  MessageSquare,
  MessageCircle,
  Zap,
  Users,
  TrendingUp,
  Clock
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface EventRecord {
  id: string
  eventType: string
  timestamp: string
  user: {
    id: string
    displayName: string
    email: string
    avatar?: string
  }
  points: number
  metadata?: Record<string, any>
  ipHint?: string
}

interface EventLogResponse {
  success: boolean
  data: EventRecord[]
  pagination: {
    page: number
    limit: number
    total: number
    hasMore: boolean
  }
  eventCounts?: Record<string, number>
}

interface EventLoggerProps {
  campaignId: string
  className?: string
}

const EVENT_TYPES = {
  PREFERENCE_SUBMITTED: {
    label: 'Preference Submitted',
    icon: CheckCircle,
    color: 'bg-blue-100 text-blue-700',
    description: 'User submitted preferences'
  },
  WISHLIST_SUBMITTED: {
    label: 'Wishlist Submitted',
    icon: Gift,
    color: 'bg-purple-100 text-purple-700',
    description: 'User added to wishlist'
  },
  REFERRAL_SIGNUP: {
    label: 'Referral Signup',
    icon: Users,
    color: 'bg-green-100 text-green-700',
    description: 'New signup via referral'
  },
  COMMENT_ENGAGEMENT: {
    label: 'Comment',
    icon: MessageSquare,
    color: 'bg-cyan-100 text-cyan-700',
    description: 'User commented'
  },
  SOCIAL_SHARE: {
    label: 'Social Share',
    icon: Share2,
    color: 'bg-orange-100 text-orange-700',
    description: 'Content shared on social media'
  },
  BRAND_OUTREACH: {
    label: 'Brand Outreach',
    icon: MessageCircle,
    color: 'bg-pink-100 text-pink-700',
    description: 'Brand engagement'
  }
}

const formatDate = (dateString: string): string => {
  const date = new Date(dateString)
  const now = new Date()
  const diff = now.getTime() - date.getTime()

  if (diff < 60000) return 'just now'
  if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`
  if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`
  if (diff < 604800000) return `${Math.floor(diff / 86400000)}d ago`

  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined,
    hour: '2-digit',
    minute: '2-digit'
  })
}

const formatFullDate = (dateString: string): string => {
  return new Date(dateString).toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  })
}

const getInitials = (displayName: string): string => {
  return displayName
    .split(' ')
    .map(n => n.charAt(0))
    .join('')
    .toUpperCase()
    .slice(0, 2) || 'U'
}

export const EventLogger: React.FC<EventLoggerProps> = ({
  campaignId,
  className
}) => {
  const [events, setEvents] = useState<EventRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalCount, setTotalCount] = useState(0)
  const [hasMore, setHasMore] = useState(false)
  const [expandedRowId, setExpandedRowId] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedEventType, setSelectedEventType] = useState<string | null>(null)
  const [dateRangeStart, setDateRangeStart] = useState<string>('')
  const [dateRangeEnd, setDateRangeEnd] = useState<string>('')
  const [eventCounts, setEventCounts] = useState<Record<string, number>>({})
  const [showFilters, setShowFilters] = useState(false)
  const [showDetails, setShowDetails] = useState<Set<string>>(new Set())

  const fetchEvents = useCallback(async (page: number) => {
    try {
      const isFirstLoad = page === 1
      if (isFirstLoad) {
        setLoading(true)
      } else {
        setLoadingMore(true)
      }

      const params = new URLSearchParams({
        page: page.toString(),
        limit: '20'
      })

      if (searchQuery) params.append('search', searchQuery)
      if (selectedEventType) params.append('eventType', selectedEventType)
      if (dateRangeStart) params.append('startDate', dateRangeStart)
      if (dateRangeEnd) params.append('endDate', dateRangeEnd)

      const response = await fetch(
        `/api/campaigns/${campaignId}/event-log?${params.toString()}`
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
        if (result.eventCounts) {
          setEventCounts(result.eventCounts)
        }
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
  }, [campaignId, searchQuery, selectedEventType, dateRangeStart, dateRangeEnd])

  useEffect(() => {
    fetchEvents(1)
  }, [searchQuery, selectedEventType, dateRangeStart, dateRangeEnd])

  const handleLoadMore = () => {
    fetchEvents(currentPage + 1)
  }

  const toggleRowDetails = (eventId: string) => {
    setShowDetails(prev => {
      const next = new Set(prev)
      if (next.has(eventId)) {
        next.delete(eventId)
      } else {
        next.add(eventId)
      }
      return next
    })
  }

  const handleExportLog = () => {
    try {
      const csvContent = [
        ['Timestamp', 'Event Type', 'User', 'Email', 'Points', 'Metadata'].join(','),
        ...events.map(event =>
          [
            formatFullDate(event.timestamp),
            event.eventType,
            event.user.displayName,
            event.user.email,
            event.points,
            event.metadata ? JSON.stringify(event.metadata) : ''
          ]
            .map(field => `"${field}"`)
            .join(',')
        )
      ].join('\n')

      const blob = new Blob([csvContent], { type: 'text/csv' })
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `campaign-events-${campaignId}-${new Date().toISOString().split('T')[0]}.csv`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
    } catch (err) {
      console.error('Export failed:', err)
    }
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

  return (
    <div className={cn('space-y-4', className)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">Campaign Events</h2>
          <p className="text-sm text-gray-600 mt-1">
            {totalCount} total event{totalCount !== 1 ? 's' : ''} logged
          </p>
        </div>
        <Button
          onClick={handleExportLog}
          variant="outline"
          size="sm"
          className="gap-2"
        >
          <Download className="w-4 h-4" />
          Export Log
        </Button>
      </div>

      {/* Event Summary Cards */}
      {Object.entries(eventCounts).length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2">
          {Object.entries(eventCounts).map(([eventType, count]) => {
            const eventConfig = EVENT_TYPES[eventType as keyof typeof EVENT_TYPES]
            const IconComponent = eventConfig?.icon || TrendingUp
            return (
              <div
                key={eventType}
                className="rounded-lg border border-gray-200 bg-white p-3"
              >
                <div className={cn('w-8 h-8 rounded-lg flex items-center justify-center mb-2', eventConfig?.color)}>
                  <IconComponent className="w-4 h-4" />
                </div>
                <div className="text-sm font-medium text-gray-900">{count}</div>
                <div className="text-xs text-gray-600 truncate">
                  {eventConfig?.label || eventType}
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Filters */}
      <div className="border-b border-gray-200">
        <button
          onClick={() => setShowFilters(!showFilters)}
          className="w-full flex items-center justify-between py-3 px-0 text-left"
        >
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-gray-600" />
            <span className="text-sm font-medium text-gray-700">Filters & Search</span>
          </div>
          {showFilters ? (
            <ChevronUp className="w-4 h-4 text-gray-600" />
          ) : (
            <ChevronDown className="w-4 h-4 text-gray-600" />
          )}
        </button>

        {showFilters && (
          <div className="pb-4 space-y-3">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search by user name or email..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500"
              />
            </div>

            {/* Event Type Filter */}
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-2">
                Event Type
              </label>
              <select
                value={selectedEventType || ''}
                onChange={e => setSelectedEventType(e.target.value || null)}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500 bg-white"
              >
                <option value="">All Events</option>
                {Object.entries(EVENT_TYPES).map(([key, config]) => (
                  <option key={key} value={key}>
                    {config.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Date Range */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-2">
                  From
                </label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                  <input
                    type="date"
                    value={dateRangeStart}
                    onChange={e => setDateRangeStart(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-2">
                  To
                </label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                  <input
                    type="date"
                    value={dateRangeEnd}
                    onChange={e => setDateRangeEnd(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500"
                  />
                </div>
              </div>
            </div>

            {/* Clear Filters */}
            {(searchQuery || selectedEventType || dateRangeStart || dateRangeEnd) && (
              <Button
                onClick={() => {
                  setSearchQuery('')
                  setSelectedEventType(null)
                  setDateRangeStart('')
                  setDateRangeEnd('')
                }}
                variant="ghost"
                size="sm"
                className="w-full"
              >
                Clear Filters
              </Button>
            )}
          </div>
        )}
      </div>

      {/* Events Table */}
      {events.length === 0 ? (
        <div className="text-center py-12">
          <Clock className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-600">No events found</p>
          <p className="text-sm text-gray-500 mt-1">
            Try adjusting your filters or search criteria
          </p>
        </div>
      ) : (
        <div className="overflow-hidden border border-gray-200 rounded-lg">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-4 py-3 text-left font-semibold text-gray-900">
                    Time
                  </th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-900">
                    Event Type
                  </th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-900">
                    User
                  </th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-900">
                    Points
                  </th>
                  <th className="px-4 py-3 text-right font-semibold text-gray-900 w-10">
                    Details
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {events.map((event) => {
                  const eventConfig = EVENT_TYPES[event.eventType as keyof typeof EVENT_TYPES]
                  const IconComponent = eventConfig?.icon || TrendingUp
                  const isExpanded = showDetails.has(event.id)

                  return (
                    <React.Fragment key={event.id}>
                      <tr className="hover:bg-gray-50 transition-colors">
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <Clock className="w-4 h-4 text-gray-400" />
                            <div>
                              <div className="text-gray-900 font-medium">
                                {formatDate(event.timestamp)}
                              </div>
                              <div className="text-xs text-gray-500">
                                {formatFullDate(event.timestamp)}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <div className={cn('w-6 h-6 rounded-lg flex items-center justify-center', eventConfig?.color)}>
                              <IconComponent className="w-3.5 h-3.5" />
                            </div>
                            <div>
                              <div className="text-gray-900 font-medium">
                                {eventConfig?.label || event.eventType}
                              </div>
                              <div className="text-xs text-gray-500">
                                {eventConfig?.description}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-full bg-violet-100 flex items-center justify-center text-xs font-medium text-violet-700">
                              {getInitials(event.user.displayName)}
                            </div>
                            <div>
                              <div className="text-gray-900 font-medium">
                                {event.user.displayName}
                              </div>
                              <div className="text-xs text-gray-500 truncate max-w-xs">
                                {event.user.email}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-yellow-50 text-yellow-700">
                            <Zap className="w-3.5 h-3.5" />
                            <span className="font-semibold">{event.points}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-right">
                          <button
                            onClick={() => toggleRowDetails(event.id)}
                            className="p-1 rounded-lg hover:bg-gray-200 transition-colors"
                            title="Toggle details"
                          >
                            {isExpanded ? (
                              <EyeOff className="w-4 h-4 text-gray-600" />
                            ) : (
                              <Eye className="w-4 h-4 text-gray-600" />
                            )}
                          </button>
                        </td>
                      </tr>

                      {/* Expanded Details Row */}
                      {isExpanded && (
                        <tr className="bg-gray-50 border-t-2 border-gray-200">
                          <td colSpan={5} className="px-4 py-4">
                            <div className="space-y-3">
                              <div>
                                <h4 className="text-xs font-semibold text-gray-700 uppercase tracking-wide mb-2">
                                  Event Details
                                </h4>
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                  <div className="bg-white rounded-lg p-3 border border-gray-200">
                                    <div className="text-xs text-gray-600 mb-1">Event ID</div>
                                    <div className="text-xs font-mono text-gray-900 truncate">
                                      {event.id}
                                    </div>
                                  </div>
                                  <div className="bg-white rounded-lg p-3 border border-gray-200">
                                    <div className="text-xs text-gray-600 mb-1">User ID</div>
                                    <div className="text-xs font-mono text-gray-900 truncate">
                                      {event.user.id}
                                    </div>
                                  </div>
                                  <div className="bg-white rounded-lg p-3 border border-gray-200">
                                    <div className="text-xs text-gray-600 mb-1">Points Awarded</div>
                                    <div className="text-xs font-semibold text-gray-900">
                                      +{event.points}
                                    </div>
                                  </div>
                                  <div className="bg-white rounded-lg p-3 border border-gray-200">
                                    <div className="text-xs text-gray-600 mb-1">Timestamp</div>
                                    <div className="text-xs font-mono text-gray-900">
                                      {new Date(event.timestamp).toISOString()}
                                    </div>
                                  </div>
                                </div>
                              </div>

                              {event.metadata && Object.keys(event.metadata).length > 0 && (
                                <div>
                                  <h4 className="text-xs font-semibold text-gray-700 uppercase tracking-wide mb-2">
                                    Metadata
                                  </h4>
                                  <div className="bg-white rounded-lg p-3 border border-gray-200 overflow-auto max-h-40">
                                    <pre className="text-xs text-gray-600 font-mono">
                                      {JSON.stringify(event.metadata, null, 2)}
                                    </pre>
                                  </div>
                                </div>
                              )}

                              {event.ipHint && (
                                <div>
                                  <h4 className="text-xs font-semibold text-gray-700 uppercase tracking-wide mb-2">
                                    IP Information
                                  </h4>
                                  <div className="bg-white rounded-lg p-3 border border-gray-200">
                                    <div className="text-xs text-gray-600">
                                      IP: <span className="font-mono text-gray-900">{event.ipHint}</span>
                                    </div>
                                  </div>
                                </div>
                              )}
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Pagination */}
      {events.length > 0 && (
        <div className="flex items-center justify-between pt-4 border-t border-gray-200">
          <div className="text-sm text-gray-600">
            Showing {events.length} of {totalCount} event{totalCount !== 1 ? 's' : ''}
          </div>

          {hasMore && (
            <Button
              onClick={handleLoadMore}
              disabled={loadingMore}
              variant="outline"
              size="sm"
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
                  Load More
                </>
              )}
            </Button>
          )}

          {!hasMore && events.length > 0 && (
            <div className="text-xs text-gray-500">
              End of log
            </div>
          )}
        </div>
      )}
    </div>
  )
}
