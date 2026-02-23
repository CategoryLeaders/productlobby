'use client'

import React, { useState, useEffect, useCallback } from 'react'
import {
  Calendar,
  Edit3,
  User,
  ChevronDown,
  ChevronUp,
  Filter,
  Loader2,
  AlertCircle,
} from 'lucide-react'
import { cn, formatRelativeTime } from '@/lib/utils'
import { Button } from '@/components/ui/button'

interface ChangelogEntry {
  id: string
  timestamp: string
  userId: string
  userName: string
  userAvatar?: string
  changeType: string
  fieldName: string
  beforeValue: any
  afterValue: any
  description: string
}

interface CampaignChangelogProps {
  campaignId: string
}

const getChangeTypeBadgeColor = (changeType: string): string => {
  switch (changeType) {
    case 'TITLE_UPDATED':
      return 'bg-blue-100 text-blue-800'
    case 'DESCRIPTION_CHANGED':
      return 'bg-purple-100 text-purple-800'
    case 'IMAGE_ADDED':
      return 'bg-green-100 text-green-800'
    case 'IMAGE_REMOVED':
      return 'bg-red-100 text-red-800'
    case 'SETTINGS_MODIFIED':
      return 'bg-orange-100 text-orange-800'
    case 'STATUS_CHANGED':
      return 'bg-indigo-100 text-indigo-800'
    case 'PRICE_UPDATED':
      return 'bg-pink-100 text-pink-800'
    case 'METADATA_UPDATED':
      return 'bg-gray-100 text-gray-800'
    default:
      return 'bg-gray-100 text-gray-800'
  }
}

const getChangeTypeLabel = (changeType: string): string => {
  switch (changeType) {
    case 'TITLE_UPDATED':
      return 'Title Updated'
    case 'DESCRIPTION_CHANGED':
      return 'Description Changed'
    case 'IMAGE_ADDED':
      return 'Image Added'
    case 'IMAGE_REMOVED':
      return 'Image Removed'
    case 'SETTINGS_MODIFIED':
      return 'Settings Modified'
    case 'STATUS_CHANGED':
      return 'Status Changed'
    case 'PRICE_UPDATED':
      return 'Price Updated'
    case 'METADATA_UPDATED':
      return 'Metadata Updated'
    default:
      return changeType
  }
}

const getChangeTypeIcon = (changeType: string) => {
  switch (changeType) {
    case 'TITLE_UPDATED':
      return Edit3
    case 'DESCRIPTION_CHANGED':
      return Edit3
    case 'IMAGE_ADDED':
    case 'IMAGE_REMOVED':
      return Calendar
    case 'SETTINGS_MODIFIED':
      return Calendar
    case 'STATUS_CHANGED':
      return Calendar
    case 'PRICE_UPDATED':
      return Calendar
    default:
      return Calendar
  }
}

const formatValue = (value: any): string => {
  if (value === null || value === undefined) {
    return '(empty)'
  }
  if (typeof value === 'boolean') {
    return value ? 'Yes' : 'No'
  }
  if (typeof value === 'object') {
    return JSON.stringify(value, null, 2)
  }
  return String(value)
}

interface ChangelogEntryCardProps {
  entry: ChangelogEntry
}

const ChangelogEntryCard: React.FC<ChangelogEntryCardProps> = ({ entry }) => {
  const [isExpanded, setIsExpanded] = useState(false)
  const ChangeIcon = getChangeTypeIcon(entry.changeType)

  return (
    <div className="border rounded-lg p-4 mb-3 hover:border-gray-300 transition-colors bg-white">
      <div className="flex items-start gap-4">
        {/* Icon */}
        <div className="flex-shrink-0 mt-1">
          <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center">
            <ChangeIcon className="w-5 h-5 text-gray-600" />
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-grow min-w-0">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-2">
            <div className="flex items-center gap-2 flex-wrap">
              <span className={cn(
                'inline-block px-2.5 py-1 rounded-full text-xs font-medium',
                getChangeTypeBadgeColor(entry.changeType)
              )}>
                {getChangeTypeLabel(entry.changeType)}
              </span>
              <span className="text-sm text-gray-600">
                {entry.fieldName}
              </span>
            </div>
            <time className="text-sm text-gray-500 flex items-center gap-1 flex-shrink-0">
              <Calendar className="w-4 h-4" />
              {formatRelativeTime(entry.timestamp)}
            </time>
          </div>

          <div className="flex items-center gap-2 mb-2">
            <div className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center flex-shrink-0">
              <User className="w-4 h-4 text-gray-600" />
            </div>
            <span className="text-sm text-gray-700 font-medium">
              {entry.userName}
            </span>
          </div>

          <p className="text-sm text-gray-600 mb-2">
            {entry.description}
          </p>

          {/* Expandable Details */}
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-700 font-medium"
          >
            {isExpanded ? (
              <>
                <ChevronUp className="w-4 h-4" />
                Hide details
              </>
            ) : (
              <>
                <ChevronDown className="w-4 h-4" />
                Show details
              </>
            )}
          </button>

          {isExpanded && (
            <div className="mt-4 pt-4 border-t space-y-3">
              <div>
                <h4 className="text-xs font-semibold text-gray-700 uppercase tracking-wide mb-2">
                  Before
                </h4>
                <div className="bg-red-50 p-3 rounded text-sm font-mono text-red-900 break-words overflow-auto max-h-32">
                  {formatValue(entry.beforeValue)}
                </div>
              </div>
              <div>
                <h4 className="text-xs font-semibold text-gray-700 uppercase tracking-wide mb-2">
                  After
                </h4>
                <div className="bg-green-50 p-3 rounded text-sm font-mono text-green-900 break-words overflow-auto max-h-32">
                  {formatValue(entry.afterValue)}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export const CampaignChangelog: React.FC<CampaignChangelogProps> = ({ campaignId }) => {
  const [entries, setEntries] = useState<ChangelogEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [page, setPage] = useState(0)
  const [hasMore, setHasMore] = useState(false)
  const [totalCount, setTotalCount] = useState(0)

  // Filter states
  const [selectedChangeType, setSelectedChangeType] = useState<string>('all')
  const [startDate, setStartDate] = useState<string>('')
  const [endDate, setEndDate] = useState<string>('')

  const itemsPerPage = 10

  const fetchChangelog = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      const params = new URLSearchParams({
        page: String(page),
        limit: String(itemsPerPage),
      })

      if (selectedChangeType !== 'all') {
        params.append('changeType', selectedChangeType)
      }
      if (startDate) {
        params.append('startDate', startDate)
      }
      if (endDate) {
        params.append('endDate', endDate)
      }

      const response = await fetch(
        `/api/campaigns/${campaignId}/changelog?${params.toString()}`
      )

      if (!response.ok) {
        throw new Error('Failed to fetch changelog')
      }

      const data = await response.json()
      
      if (page === 0) {
        setEntries(data.entries)
      } else {
        setEntries((prev) => [...prev, ...data.entries])
      }
      
      setHasMore(data.hasMore)
      setTotalCount(data.total)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }, [campaignId, page, selectedChangeType, startDate, endDate])

  useEffect(() => {
    setPage(0)
    setEntries([])
  }, [selectedChangeType, startDate, endDate])

  useEffect(() => {
    fetchChangelog()
  }, [fetchChangelog])

  // Get unique change types from entries for filter dropdown
  const changeTypes = Array.from(
    new Set(entries.map((e) => e.changeType))
  )

  const handleLoadMore = () => {
    setPage((prev) => prev + 1)
  }

  return (
    <div className="w-full max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Campaign Changelog
        </h2>
        <p className="text-gray-600">
          View all changes made to this campaign
        </p>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg border border-gray-200 p-4 mb-6">
        <div className="flex items-center gap-2 mb-4">
          <Filter className="w-4 h-4 text-gray-600" />
          <span className="text-sm font-medium text-gray-700">Filters</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {/* Change Type Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Change Type
            </label>
            <select
              value={selectedChangeType}
              onChange={(e) => setSelectedChangeType(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Changes</option>
              {changeTypes.map((type) => (
                <option key={type} value={type}>
                  {getChangeTypeLabel(type)}
                </option>
              ))}
            </select>
          </div>

          {/* Start Date Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              From Date
            </label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* End Date Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              To Date
            </label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Clear Filters Button */}
        {(selectedChangeType !== 'all' || startDate || endDate) && (
          <div className="mt-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setSelectedChangeType('all')
                setStartDate('')
                setEndDate('')
              }}
              className="text-sm text-gray-600 hover:text-gray-900"
            >
              Clear all filters
            </Button>
          </div>
        )}
      </div>

      {/* Count Info */}
      {totalCount > 0 && (
        <div className="text-sm text-gray-600 mb-4">
          Showing {entries.length} of {totalCount} changes
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-200 rounded-lg mb-6">
          <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
          <p className="text-sm text-red-800">{error}</p>
        </div>
      )}

      {/* Loading State */}
      {loading && entries.length === 0 && (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-6 h-6 text-gray-400 animate-spin" />
          <span className="ml-2 text-gray-500">Loading changelog...</span>
        </div>
      )}

      {/* Empty State */}
      {!loading && entries.length === 0 && !error && (
        <div className="text-center py-12 px-4 bg-gray-50 rounded-lg border border-gray-200">
          <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-3" />
          <h3 className="text-lg font-medium text-gray-900 mb-1">
            No changes found
          </h3>
          <p className="text-gray-600">
            {selectedChangeType !== 'all' || startDate || endDate
              ? 'Try adjusting your filters to see more changes'
              : 'This campaign has no recorded changes yet'}
          </p>
        </div>
      )}

      {/* Timeline */}
      {entries.length > 0 && (
        <div className="space-y-2 mb-6">
          {entries.map((entry) => (
            <ChangelogEntryCard key={entry.id} entry={entry} />
          ))}
        </div>
      )}

      {/* Load More Button */}
      {hasMore && !loading && (
        <div className="flex justify-center mt-6">
          <Button
            onClick={handleLoadMore}
            variant="outline"
            className="px-6"
          >
            Load More Changes
          </Button>
        </div>
      )}

      {/* Loading More */}
      {loading && entries.length > 0 && (
        <div className="flex items-center justify-center py-6">
          <Loader2 className="w-5 h-5 text-gray-400 animate-spin" />
          <span className="ml-2 text-sm text-gray-500">Loading more...</span>
        </div>
      )}
    </div>
  )
}
