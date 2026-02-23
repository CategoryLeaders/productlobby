'use client'

import React, { useState, useEffect } from 'react'
import {
  Eye,
  EyeOff,
  X,
  Search,
  ArrowUpDown,
  Bell,
  BellOff,
  AlertCircle,
  Loader2,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

// ============================================================================
// TYPES
// ============================================================================

interface WatchedCampaign {
  id: string
  title: string
  slug: string
  category: string
  description: string
  status: string
  supporterCount: number
  lastActivity: string
  watchedAt: string
  notificationPreference: 'all' | 'milestones' | 'none'
}

type SortOption = 'recently_added' | 'most_active' | 'alphabetical'
type NotificationPreference = 'all' | 'milestones' | 'none'

// ============================================================================
// COMPONENT
// ============================================================================

export interface CampaignWatchlistProps {
  className?: string
}

export const CampaignWatchlist: React.FC<CampaignWatchlistProps> = ({ className }) => {
  const [campaigns, setCampaigns] = useState<WatchedCampaign[]>([])
  const [filteredCampaigns, setFilteredCampaigns] = useState<WatchedCampaign[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [sortBy, setSortBy] = useState<SortOption>('recently_added')
  const [mounted, setMounted] = useState(false)
  const [updatingCampaignId, setUpdatingCampaignId] = useState<string | null>(null)
  const [expandedPreferences, setExpandedPreferences] = useState<Set<string>>(new Set())

  // Load watchlist on mount
  useEffect(() => {
    setMounted(true)
    loadWatchlist()
  }, [])

  // Filter and sort campaigns when dependencies change
  useEffect(() => {
    let result = [...campaigns]

    // Filter by search term
    if (searchTerm) {
      result = result.filter(
        (campaign) =>
          campaign.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          campaign.category.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    // Sort
    if (sortBy === 'most_active') {
      result.sort(
        (a, b) => new Date(b.lastActivity).getTime() - new Date(a.lastActivity).getTime()
      )
    } else if (sortBy === 'alphabetical') {
      result.sort((a, b) => a.title.localeCompare(b.title))
    } else {
      // recently_added
      result.sort((a, b) => new Date(b.watchedAt).getTime() - new Date(a.watchedAt).getTime())
    }

    setFilteredCampaigns(result)
  }, [campaigns, searchTerm, sortBy])

  const loadWatchlist = async () => {
    setLoading(true)
    setError(null)

    try {
      const res = await fetch('/api/users/watchlist')

      if (!res.ok) {
        if (res.status === 401) {
          setError('Please log in to view your watchlist')
          return
        }
        throw new Error('Failed to load watchlist')
      }

      const data = await res.json()
      setCampaigns(data.data.campaigns || [])
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Something went wrong'
      setError(errorMessage)
      console.error('Load watchlist error:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleRemoveFromWatchlist = async (campaignId: string) => {
    setUpdatingCampaignId(campaignId)

    try {
      const res = await fetch('/api/users/watchlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          campaignId,
          action: 'remove',
        }),
      })

      if (!res.ok) {
        throw new Error('Failed to remove from watchlist')
      }

      // Optimistically remove from UI
      setCampaigns((prev) => prev.filter((c) => c.id !== campaignId))
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Something went wrong'
      setError(errorMessage)
      console.error('Remove from watchlist error:', err)
    } finally {
      setUpdatingCampaignId(null)
    }
  }

  const handleUpdateNotificationPreference = async (
    campaignId: string,
    preference: NotificationPreference
  ) => {
    setUpdatingCampaignId(campaignId)

    try {
      const res = await fetch('/api/users/watchlist', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          campaignId,
          notificationPreference: preference,
        }),
      })

      if (!res.ok) {
        throw new Error('Failed to update notification preference')
      }

      // Update campaigns state
      setCampaigns((prev) =>
        prev.map((c) =>
          c.id === campaignId ? { ...c, notificationPreference: preference } : c
        )
      )

      // Close the preferences dropdown
      setExpandedPreferences((prev) => {
        const newSet = new Set(prev)
        newSet.delete(campaignId)
        return newSet
      })
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Something went wrong'
      setError(errorMessage)
      console.error('Update notification preference error:', err)
    } finally {
      setUpdatingCampaignId(null)
    }
  }

  const togglePreferencesDropdown = (campaignId: string) => {
    setExpandedPreferences((prev) => {
      const newSet = new Set(prev)
      if (newSet.has(campaignId)) {
        newSet.delete(campaignId)
      } else {
        newSet.add(campaignId)
      }
      return newSet
    })
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000)

    if (diffInSeconds < 60) return 'just now'
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`
    if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d ago`

    return date.toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    })
  }

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      SUSTAINABILITY: 'bg-green-100 text-green-800',
      SOCIAL_JUSTICE: 'bg-purple-100 text-purple-800',
      HEALTH: 'bg-blue-100 text-blue-800',
      EDUCATION: 'bg-yellow-100 text-yellow-800',
      ENVIRONMENT: 'bg-emerald-100 text-emerald-800',
      TECHNOLOGY: 'bg-indigo-100 text-indigo-800',
      COMMUNITY: 'bg-rose-100 text-rose-800',
      POLICY: 'bg-orange-100 text-orange-800',
    }
    return colors[category] || 'bg-gray-100 text-gray-800'
  }

  const getNotificationIcon = (preference: NotificationPreference) => {
    switch (preference) {
      case 'all':
        return <Bell className="w-4 h-4" />
      case 'milestones':
        return <AlertCircle className="w-4 h-4" />
      case 'none':
        return <BellOff className="w-4 h-4" />
    }
  }

  if (!mounted) {
    return null
  }

  if (loading) {
    return (
      <div className={cn('flex items-center justify-center py-12', className)}>
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 text-violet-600 animate-spin" />
          <p className="text-gray-600">Loading your watchlist...</p>
        </div>
      </div>
    )
  }

  return (
    <div className={cn('w-full', className)}>
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold text-gray-900">Campaign Watchlist</h2>
          <div className="flex items-center gap-2 px-3 py-1 bg-violet-100 rounded-full">
            <Eye className="w-4 h-4 text-violet-600" />
            <span className="text-sm font-medium text-violet-900">{campaigns.length}</span>
          </div>
        </div>

        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg flex items-gap-2">
            <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-red-800">{error}</p>
          </div>
        )}
      </div>

      {/* Controls */}
      <div className="flex flex-col gap-4 mb-6 md:flex-row md:items-center">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search campaigns..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-violet-600 focus:border-transparent outline-none"
          />
        </div>

        {/* Sort */}
        <div className="flex items-center gap-2">
          <ArrowUpDown className="w-4 h-4 text-gray-600" />
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as SortOption)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-violet-600 focus:border-transparent outline-none text-sm"
          >
            <option value="recently_added">Recently Added</option>
            <option value="most_active">Most Active</option>
            <option value="alphabetical">Alphabetical</option>
          </select>
        </div>
      </div>

      {/* Empty State */}
      {campaigns.length === 0 ? (
        <div className="text-center py-12">
          <Eye className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Start Watching Campaigns</h3>
          <p className="text-gray-600">
            Add campaigns to your watchlist to follow their progress and stay updated
          </p>
        </div>
      ) : (
        <>
          {/* Campaigns Grid */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filteredCampaigns.map((campaign) => (
              <div
                key={campaign.id}
                className="bg-white border border-gray-200 rounded-lg hover:border-violet-300 hover:shadow-md transition-all overflow-hidden"
              >
                {/* Campaign Card Header */}
                <div className="p-4 pb-3 border-b border-gray-100">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-gray-900 truncate text-sm">
                        {campaign.title}
                      </h3>
                      <span
                        className={cn(
                          'inline-block text-xs font-medium px-2 py-1 rounded mt-2',
                          getCategoryColor(campaign.category)
                        )}
                      >
                        {campaign.category}
                      </span>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRemoveFromWatchlist(campaign.id)}
                      disabled={updatingCampaignId === campaign.id}
                      className="text-gray-400 hover:text-red-600 p-1 h-auto"
                      title="Remove from watchlist"
                    >
                      {updatingCampaignId === campaign.id ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <X className="w-4 h-4" />
                      )}
                    </Button>
                  </div>
                </div>

                {/* Campaign Card Body */}
                <div className="p-4">
                  {/* Description */}
                  <p className="text-xs text-gray-600 line-clamp-2 mb-3">
                    {campaign.description}
                  </p>

                  {/* Stats */}
                  <div className="flex items-center justify-between text-xs text-gray-500 mb-4 pb-3 border-b border-gray-100">
                    <div className="flex items-center gap-1">
                      <span className="font-medium">{campaign.supporterCount}</span>
                      <span>supporters</span>
                    </div>
                    <span>Last active: {formatDate(campaign.lastActivity)}</span>
                  </div>

                  {/* Notification Preferences */}
                  <div className="relative">
                    <button
                      onClick={() => togglePreferencesDropdown(campaign.id)}
                      disabled={updatingCampaignId === campaign.id}
                      className="w-full flex items-center justify-between px-3 py-2 text-xs font-medium text-gray-700 bg-gray-50 border border-gray-200 rounded hover:bg-gray-100 transition-colors disabled:opacity-50"
                    >
                      <span className="flex items-center gap-2">
                        {getNotificationIcon(campaign.notificationPreference)}
                        <span>
                          {campaign.notificationPreference === 'all' && 'All activity'}
                          {campaign.notificationPreference === 'milestones' && 'Milestones only'}
                          {campaign.notificationPreference === 'none' && 'No notifications'}
                        </span>
                      </span>
                      <ArrowUpDown className="w-3 h-3 text-gray-400" />
                    </button>

                    {/* Dropdown Menu */}
                    {expandedPreferences.has(campaign.id) && (
                      <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded shadow-lg z-10">
                        <button
                          onClick={() => handleUpdateNotificationPreference(campaign.id, 'all')}
                          disabled={updatingCampaignId === campaign.id}
                          className={cn(
                            'w-full text-left px-3 py-2 text-xs hover:bg-gray-50 flex items-center gap-2 transition-colors disabled:opacity-50',
                            campaign.notificationPreference === 'all'
                              ? 'bg-violet-50 text-violet-700 font-medium'
                              : 'text-gray-700'
                          )}
                        >
                          <Bell className="w-3 h-3" />
                          All activity
                        </button>
                        <button
                          onClick={() =>
                            handleUpdateNotificationPreference(campaign.id, 'milestones')
                          }
                          disabled={updatingCampaignId === campaign.id}
                          className={cn(
                            'w-full text-left px-3 py-2 text-xs hover:bg-gray-50 flex items-center gap-2 border-t border-gray-100 transition-colors disabled:opacity-50',
                            campaign.notificationPreference === 'milestones'
                              ? 'bg-violet-50 text-violet-700 font-medium'
                              : 'text-gray-700'
                          )}
                        >
                          <AlertCircle className="w-3 h-3" />
                          Milestones only
                        </button>
                        <button
                          onClick={() => handleUpdateNotificationPreference(campaign.id, 'none')}
                          disabled={updatingCampaignId === campaign.id}
                          className={cn(
                            'w-full text-left px-3 py-2 text-xs hover:bg-gray-50 flex items-center gap-2 border-t border-gray-100 transition-colors disabled:opacity-50',
                            campaign.notificationPreference === 'none'
                              ? 'bg-violet-50 text-violet-700 font-medium'
                              : 'text-gray-700'
                          )}
                        >
                          <BellOff className="w-3 h-3" />
                          No notifications
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Watched Date */}
                  <p className="text-xs text-gray-500 mt-3 pt-3 border-t border-gray-100">
                    Added {formatDate(campaign.watchedAt)}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* No Results */}
          {filteredCampaigns.length === 0 && campaigns.length > 0 && (
            <div className="text-center py-8">
              <EyeOff className="w-8 h-8 text-gray-300 mx-auto mb-2" />
              <p className="text-gray-600 text-sm">No campaigns match your search</p>
            </div>
          )}
        </>
      )}
    </div>
  )
}

export default CampaignWatchlist
