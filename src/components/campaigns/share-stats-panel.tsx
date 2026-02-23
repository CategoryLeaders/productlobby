'use client'

import React, { useEffect, useState } from 'react'
import { Share2, TrendingUp, Users } from 'lucide-react'
import { cn } from '@/lib/utils'

interface PlatformBreakdown {
  platform: string
  shareCount: number
  clicks: number
  recentSharers: Array<{
    userId: string
    displayName: string
    avatar: string | null
    handle: string | null
    timestamp: Date
  }>
}

interface ShareTimeline {
  date: string
  shares: number
}

interface TopSharer {
  userId: string
  displayName: string
  avatar: string | null
  handle: string | null
  shareCount: number
}

interface ShareStatsPanelProps {
  campaignId: string
  className?: string
}

const getPlatformIcon = (platform: string) => {
  const platformLower = platform.toLowerCase()
  if (platformLower.includes('twitter')) return '𝕏'
  if (platformLower.includes('facebook')) return 'f'
  if (platformLower.includes('linkedin')) return 'in'
  if (platformLower.includes('whatsapp')) return '💬'
  if (platformLower.includes('email')) return '✉'
  return '↗'
}

const getPlatformColor = (platform: string) => {
  const platformLower = platform.toLowerCase()
  if (platformLower.includes('twitter')) return 'text-black'
  if (platformLower.includes('facebook')) return 'text-blue-600'
  if (platformLower.includes('linkedin')) return 'text-blue-700'
  if (platformLower.includes('whatsapp')) return 'text-green-600'
  if (platformLower.includes('email')) return 'text-gray-600'
  return 'text-violet-600'
}

export const ShareStatsPanel: React.FC<ShareStatsPanelProps> = ({
  campaignId,
  className
}) => {
  const [platformBreakdown, setPlatformBreakdown] = useState<PlatformBreakdown[]>([])
  const [sharesTimeline, setSharesTimeline] = useState<ShareTimeline[]>([])
  const [topSharers, setTopSharers] = useState<TopSharer[]>([])
  const [totalShares, setTotalShares] = useState(0)
  const [totalReach, setTotalReach] = useState(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchShareStats = async () => {
      try {
        const response = await fetch(`/api/campaigns/${campaignId}/share-stats`)
        if (response.ok) {
          const result = await response.json()
          if (result.success) {
            const { data } = result
            setPlatformBreakdown(data.platformBreakdown || [])
            setSharesTimeline(data.sharesTimeline || [])
            setTopSharers(data.topSharers || [])
            setTotalShares(data.totalShares || 0)
            setTotalReach(data.totalReachEstimate || 0)
          }
        }
      } catch (error) {
        console.error('Failed to fetch share stats:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchShareStats()
  }, [campaignId])

  if (loading) {
    return (
      <div className={cn('space-y-4', className)}>
        <div className="animate-pulse space-y-4">
          <div className="h-40 bg-gray-200 rounded-lg" />
          <div className="h-32 bg-gray-200 rounded-lg" />
        </div>
      </div>
    )
  }

  // Get max shares for scaling
  const maxShares = Math.max(...sharesTimeline.map(s => s.shares), 1)
  const maxPlatformShares = Math.max(...platformBreakdown.map(p => p.shareCount), 1)

  return (
    <div className={cn('space-y-6', className)}>
      {/* Summary cards */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-gradient-to-br from-violet-50 to-violet-100 border border-violet-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-600 uppercase tracking-wide font-semibold">
                Total Shares
              </p>
              <p className="text-2xl font-bold text-violet-900 mt-1">
                {totalShares}
              </p>
            </div>
            <Share2 size={32} className="text-violet-500 opacity-20" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-lime-50 to-lime-100 border border-lime-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-600 uppercase tracking-wide font-semibold">
                Est. Reach
              </p>
              <p className="text-2xl font-bold text-lime-900 mt-1">
                {(totalReach / 1000).toFixed(1)}K
              </p>
            </div>
            <TrendingUp size={32} className="text-lime-500 opacity-20" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-600 uppercase tracking-wide font-semibold">
                Top Platform
              </p>
              <p className="text-2xl font-bold text-blue-900 mt-1">
                {platformBreakdown[0]?.platform || 'N/A'}
              </p>
            </div>
            <Users size={32} className="text-blue-500 opacity-20" />
          </div>
        </div>
      </div>

      {/* Platform Breakdown */}
      {platformBreakdown.length > 0 && (
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <h3 className="text-sm font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Share2 size={16} />
            Platform Breakdown
          </h3>

          <div className="space-y-4">
            {platformBreakdown.map((platform) => (
              <div key={platform.platform} className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className={cn(
                      'w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center font-semibold text-sm',
                      getPlatformColor(platform.platform)
                    )}>
                      {getPlatformIcon(platform.platform)}
                    </span>
                    <span className="text-sm font-medium text-gray-700">
                      {platform.platform}
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-semibold text-gray-900">
                      {platform.shareCount}
                    </span>
                    <span className="text-xs text-gray-500">
                      {platform.clicks} clicks
                    </span>
                  </div>
                </div>

                {/* Bar visualization */}
                <div className="relative h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-violet-500 to-violet-600 transition-all duration-500"
                    style={{
                      width: `${(platform.shareCount / maxPlatformShares) * 100}%`
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Shares Over Time Chart */}
      {sharesTimeline.length > 0 && (
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <h3 className="text-sm font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <TrendingUp size={16} />
            Shares Last 7 Days
          </h3>

          <div className="space-y-3">
            <div className="flex items-end justify-between h-32 gap-1">
              {sharesTimeline.map((day, idx) => (
                <div
                  key={idx}
                  className="flex-1 flex flex-col items-center justify-end"
                  title={`${day.date}: ${day.shares} shares`}
                >
                  <div className="relative w-full flex items-end justify-center h-24">
                    <div
                      className="w-full bg-gradient-to-t from-lime-500 to-lime-400 rounded-t opacity-80 hover:opacity-100 transition-opacity cursor-pointer"
                      style={{
                        height: `${(day.shares / maxShares) * 100}%`
                      }}
                    />
                  </div>
                  <p className="text-xs text-gray-500 mt-2 text-center">
                    {new Date(day.date).toLocaleDateString('en-GB', {
                      month: 'short',
                      day: 'numeric'
                    })}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Top Sharers */}
      {topSharers.length > 0 && (
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <h3 className="text-sm font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Users size={16} />
            Top Sharers
          </h3>

          <div className="space-y-3">
            {topSharers.map((sharer, idx) => (
              <div
                key={sharer.userId}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="relative">
                    {sharer.avatar ? (
                      <img
                        src={sharer.avatar}
                        alt={sharer.displayName}
                        className="w-10 h-10 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-violet-400 to-violet-600 flex items-center justify-center text-white font-semibold text-sm">
                        {sharer.displayName[0]?.toUpperCase()}
                      </div>
                    )}
                    <div className="absolute -top-1 -right-1 bg-lime-500 text-white rounded-full px-2 py-0.5 text-xs font-semibold">
                      {idx + 1}
                    </div>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-900">
                      {sharer.displayName}
                    </p>
                    {sharer.handle && (
                      <p className="text-xs text-gray-500">
                        @{sharer.handle}
                      </p>
                    )}
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-violet-600">
                    {sharer.shareCount}
                  </p>
                  <p className="text-xs text-gray-500">
                    {sharer.shareCount === 1 ? 'share' : 'shares'}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Empty state */}
      {totalShares === 0 && (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-8 text-center">
          <Share2 size={32} className="mx-auto text-gray-300 mb-3" />
          <p className="text-sm text-gray-600">
            No shares yet. Encourage people to share this campaign!
          </p>
        </div>
      )}
    </div>
  )
}
