'use client'

import React, { useState, useEffect, useCallback } from 'react'
import {
  Share2,
  Twitter,
  Linkedin,
  Facebook,
  Mail,
  Link2,
  TrendingUp,
  Users,
  Loader2,
  Copy,
  Check,
  BarChart3,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface PlatformStats {
  platform: string
  count: number
  percentage: number
  icon: React.ReactNode
}

interface TopSharer {
  userId: string
  userName: string
  avatar?: string
  shareCount: number
  platform?: string
}

interface RecentShare {
  id: string
  userId: string
  userName: string
  platform: string
  timestamp: string
  avatar?: string
}

interface GrowthTrend {
  period: string
  shares: number
  growth: number
}

interface ShareTrackerData {
  totalShares: number
  totalReach: number
  sharesByPlatform: Record<string, number>
  topSharers: TopSharer[]
  recentShares: RecentShare[]
  growthTrend: GrowthTrend[]
}

interface ShareTrackerProps {
  campaignId: string
  campaignUrl?: string
  className?: string
}

const getPlatformIcon = (platform: string) => {
  const lower = platform.toLowerCase()
  switch (lower) {
    case 'twitter':
      return <Twitter size={20} className="text-black" />
    case 'linkedin':
      return <Linkedin size={20} className="text-blue-700" />
    case 'facebook':
      return <Facebook size={20} className="text-blue-600" />
    case 'email':
      return <Mail size={20} className="text-gray-600" />
    case 'direct':
      return <Link2 size={20} className="text-purple-600" />
    default:
      return <Share2 size={20} className="text-gray-500" />
  }
}

const getPlatformColor = (platform: string) => {
  const lower = platform.toLowerCase()
  switch (lower) {
    case 'twitter':
      return 'bg-black/5 border-black/20'
    case 'linkedin':
      return 'bg-blue-700/5 border-blue-700/20'
    case 'facebook':
      return 'bg-blue-600/5 border-blue-600/20'
    case 'email':
      return 'bg-gray-600/5 border-gray-600/20'
    case 'direct':
      return 'bg-purple-600/5 border-purple-600/20'
    default:
      return 'bg-gray-500/5 border-gray-500/20'
  }
}

export const ShareTracker: React.FC<ShareTrackerProps> = ({
  campaignId,
  campaignUrl,
  className,
}) => {
  const [data, setData] = useState<ShareTrackerData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [copied, setCopied] = useState(false)
  const [isSharing, setIsSharing] = useState(false)

  const baseUrl =
    campaignUrl || (typeof window !== 'undefined' ? window.location.href : '')

  // Fetch share tracking data
  const fetchShareData = useCallback(async () => {
    try {
      setIsLoading(true)
      const response = await fetch(
        `/api/campaigns/${campaignId}/share-tracking`
      )
      if (response.ok) {
        const result = await response.json()
        if (result.success) {
          setData(result.data)
        }
      }
    } catch (error) {
      console.error('Failed to fetch share data:', error)
    } finally {
      setIsLoading(false)
    }
  }, [campaignId])

  useEffect(() => {
    fetchShareData()
    // Refresh data every 30 seconds
    const interval = setInterval(fetchShareData, 30000)
    return () => clearInterval(interval)
  }, [fetchShareData])

  const handleShare = async (platform: string) => {
    setIsSharing(true)
    try {
      const response = await fetch(
        `/api/campaigns/${campaignId}/share-tracking`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ platform }),
        }
      )
      if (response.ok) {
        await fetchShareData()
      }
    } catch (error) {
      console.error('Failed to log share:', error)
    } finally {
      setIsSharing(false)
    }
  }

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(baseUrl)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
      // Log copy as a share event
      await handleShare('Direct')
    } catch (error) {
      console.error('Failed to copy link:', error)
    }
  }

  const shareOnPlatform = async (
    platform: string,
    url: string,
    text: string
  ) => {
    try {
      if (navigator.share) {
        await navigator.share({ title: text, url })
      } else {
        window.open(url, '_blank', 'width=600,height=400')
      }
      await handleShare(platform)
    } catch (error) {
      console.error(`Failed to share on ${platform}:`, error)
    }
  }

  if (isLoading) {
    return (
      <div className={cn('space-y-6', className)}>
        <div className="animate-pulse space-y-4">
          <div className="grid grid-cols-3 gap-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-24 bg-gray-200 rounded-lg" />
            ))}
          </div>
          <div className="h-40 bg-gray-200 rounded-lg" />
          <div className="h-32 bg-gray-200 rounded-lg" />
        </div>
      </div>
    )
  }

  if (!data) {
    return (
      <div className={cn('p-8 text-center', className)}>
        <p className="text-gray-500">Unable to load share data</p>
      </div>
    )
  }

  const platformStats: PlatformStats[] = [
    {
      platform: 'Twitter',
      count: data.sharesByPlatform['Twitter'] || 0,
      percentage: data.totalShares
        ? Math.round(((data.sharesByPlatform['Twitter'] || 0) / data.totalShares) * 100)
        : 0,
      icon: getPlatformIcon('Twitter'),
    },
    {
      platform: 'LinkedIn',
      count: data.sharesByPlatform['LinkedIn'] || 0,
      percentage: data.totalShares
        ? Math.round(((data.sharesByPlatform['LinkedIn'] || 0) / data.totalShares) * 100)
        : 0,
      icon: getPlatformIcon('LinkedIn'),
    },
    {
      platform: 'Facebook',
      count: data.sharesByPlatform['Facebook'] || 0,
      percentage: data.totalShares
        ? Math.round(((data.sharesByPlatform['Facebook'] || 0) / data.totalShares) * 100)
        : 0,
      icon: getPlatformIcon('Facebook'),
    },
    {
      platform: 'Email',
      count: data.sharesByPlatform['Email'] || 0,
      percentage: data.totalShares
        ? Math.round(((data.sharesByPlatform['Email'] || 0) / data.totalShares) * 100)
        : 0,
      icon: getPlatformIcon('Email'),
    },
    {
      platform: 'Direct',
      count: data.sharesByPlatform['Direct'] || 0,
      percentage: data.totalShares
        ? Math.round(((data.sharesByPlatform['Direct'] || 0) / data.totalShares) * 100)
        : 0,
      icon: getPlatformIcon('Direct'),
    },
  ].filter((p) => p.count > 0)

  const maxCount = Math.max(...platformStats.map((p) => p.count), 1)

  return (
    <div className={cn('space-y-6', className)}>
      {/* Summary Stats */}
      <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
        <div className="rounded-lg border border-violet-200 bg-gradient-to-br from-violet-50 to-violet-100 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-gray-600">
                Total Shares
              </p>
              <p className="mt-1 text-3xl font-bold text-violet-900">
                {data.totalShares}
              </p>
            </div>
            <Share2 size={32} className="text-violet-500 opacity-20" />
          </div>
        </div>

        <div className="rounded-lg border border-green-200 bg-gradient-to-br from-green-50 to-green-100 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-gray-600">
                Est. Reach
              </p>
              <p className="mt-1 text-3xl font-bold text-green-900">
                {data.totalReach > 999
                  ? `${(data.totalReach / 1000).toFixed(1)}K`
                  : data.totalReach}
              </p>
            </div>
            <TrendingUp size={32} className="text-green-500 opacity-20" />
          </div>
        </div>

        <div className="rounded-lg border border-blue-200 bg-gradient-to-br from-blue-50 to-blue-100 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-gray-600">
                Top Sharers
              </p>
              <p className="mt-1 text-3xl font-bold text-blue-900">
                {data.topSharers.length}
              </p>
            </div>
            <Users size={32} className="text-blue-500 opacity-20" />
          </div>
        </div>
      </div>

      {/* Platform Stats Bar Chart */}
      <div className="rounded-lg border border-gray-200 bg-white p-6">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900">
            Shares by Platform
          </h3>
          <BarChart3 size={20} className="text-gray-400" />
        </div>

        <div className="space-y-4">
          {platformStats.length > 0 ? (
            platformStats.map((stat) => (
              <div key={stat.platform} className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {stat.icon}
                    <span className="font-medium text-gray-700">
                      {stat.platform}
                    </span>
                  </div>
                  <span className="text-sm font-semibold text-gray-900">
                    {stat.count} ({stat.percentage}%)
                  </span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-gray-200">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-violet-500 to-blue-500 transition-all duration-500"
                    style={{
                      width: `${(stat.count / maxCount) * 100}%`,
                    }}
                  />
                </div>
              </div>
            ))
          ) : (
            <p className="py-8 text-center text-gray-500">
              No shares yet. Share this campaign to get started!
            </p>
          )}
        </div>
      </div>

      {/* Quick Share Buttons */}
      <div className="rounded-lg border border-gray-200 bg-white p-6">
        <h3 className="mb-4 text-lg font-semibold text-gray-900">
          Share This Campaign
        </h3>
        <div className="grid grid-cols-2 gap-3 md:grid-cols-5">
          <Button
            variant="secondary"
            size="sm"
            onClick={() =>
              shareOnPlatform(
                'Twitter',
                `https://twitter.com/intent/tweet?text=${encodeURIComponent(
                  `Check out this campaign: ${baseUrl}`
                )}`,
                'Share on Twitter'
              )
            }
            disabled={isSharing}
            className="flex items-center gap-2"
          >
            <Twitter size={16} />
            <span className="hidden sm:inline">Twitter</span>
          </Button>

          <Button
            variant="secondary"
            size="sm"
            onClick={() =>
              shareOnPlatform(
                'LinkedIn',
                `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(
                  baseUrl
                )}`,
                'Share on LinkedIn'
              )
            }
            disabled={isSharing}
            className="flex items-center gap-2"
          >
            <Linkedin size={16} />
            <span className="hidden sm:inline">LinkedIn</span>
          </Button>

          <Button
            variant="secondary"
            size="sm"
            onClick={() =>
              shareOnPlatform(
                'Facebook',
                `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(
                  baseUrl
                )}`,
                'Share on Facebook'
              )
            }
            disabled={isSharing}
            className="flex items-center gap-2"
          >
            <Facebook size={16} />
            <span className="hidden sm:inline">Facebook</span>
          </Button>

          <Button
            variant="secondary"
            size="sm"
            onClick={() =>
              shareOnPlatform(
                'Email',
                `mailto:?subject=Check%20out%20this%20campaign&body=${encodeURIComponent(
                  baseUrl
                )}`,
                'Share via Email'
              )
            }
            disabled={isSharing}
            className="flex items-center gap-2"
          >
            <Mail size={16} />
            <span className="hidden sm:inline">Email</span>
          </Button>

          <Button
            variant="secondary"
            size="sm"
            onClick={handleCopyLink}
            disabled={isSharing}
            className="flex items-center gap-2"
          >
            {copied ? (
              <>
                <Check size={16} />
                <span className="hidden sm:inline">Copied!</span>
              </>
            ) : (
              <>
                <Copy size={16} />
                <span className="hidden sm:inline">Copy</span>
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Share Growth Trend */}
      {data.growthTrend && data.growthTrend.length > 0 && (
        <div className="rounded-lg border border-gray-200 bg-white p-6">
          <h3 className="mb-4 text-lg font-semibold text-gray-900">
            Share Growth Trend
          </h3>
          <div className="space-y-3">
            {data.growthTrend.map((trend, idx) => {
              const isPositive = trend.growth >= 0
              return (
                <div
                  key={idx}
                  className="flex items-center justify-between border-b border-gray-100 pb-3 last:border-0"
                >
                  <span className="text-sm font-medium text-gray-700">
                    {trend.period}
                  </span>
                  <div className="flex items-center gap-3">
                    <span className="font-semibold text-gray-900">
                      {trend.shares} shares
                    </span>
                    <span
                      className={cn(
                        'flex items-center gap-1 text-sm font-semibold',
                        isPositive ? 'text-green-600' : 'text-red-600'
                      )}
                    >
                      <TrendingUp size={14} />
                      {isPositive ? '+' : ''}{trend.growth}%
                    </span>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Top Sharers Leaderboard */}
      {data.topSharers && data.topSharers.length > 0 && (
        <div className="rounded-lg border border-gray-200 bg-white p-6">
          <h3 className="mb-4 text-lg font-semibold text-gray-900">
            Top Sharers
          </h3>
          <div className="space-y-3">
            {data.topSharers.slice(0, 5).map((sharer, idx) => (
              <div
                key={sharer.userId}
                className="flex items-center justify-between rounded-lg bg-gray-50 p-3"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-violet-500 font-bold text-white">
                    {idx + 1}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-900">
                      {sharer.userName}
                    </p>
                    {sharer.platform && (
                      <p className="text-xs text-gray-500">{sharer.platform}</p>
                    )}
                  </div>
                </div>
                <span className="rounded-full bg-violet-100 px-3 py-1 text-sm font-semibold text-violet-900">
                  {sharer.shareCount} shares
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recent Shares Timeline */}
      {data.recentShares && data.recentShares.length > 0 && (
        <div className="rounded-lg border border-gray-200 bg-white p-6">
          <h3 className="mb-4 text-lg font-semibold text-gray-900">
            Recent Shares
          </h3>
          <div className="space-y-3">
            {data.recentShares.slice(0, 10).map((share) => (
              <div
                key={share.id}
                className="flex items-center justify-between border-b border-gray-100 pb-3 last:border-0"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-200">
                    {getPlatformIcon(share.platform)}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-900">
                      {share.userName}
                    </p>
                    <p className="text-xs text-gray-500">
                      shared on {share.platform}
                    </p>
                  </div>
                </div>
                <p className="text-xs text-gray-500">
                  {new Date(share.timestamp).toLocaleDateString()} at{' '}
                  {new Date(share.timestamp).toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
