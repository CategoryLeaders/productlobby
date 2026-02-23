'use client'

import React, { useEffect, useState, useCallback } from 'react'
import { Users, Zap, X, ChevronLeft, ChevronRight, Eye } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'

interface Notification {
  id: string
  type: 'support' | 'vote' | 'activity'
  message: string
  displayName: string
  timestamp: Date
  avatar?: string | null
}

interface RecentSupporter {
  id: string
  displayName: string
  avatar: string | null
}

interface SocialProofData {
  last24hCount: number
  recentSupporters: RecentSupporter[]
  totalSupporters: number
  recentActivities: Notification[]
  viewersNow: number
}

interface SocialProofWidgetProps {
  campaignId: string
  className?: string
  position?: 'bottom-left' | 'bottom-right'
}

const ActivityMessages = {
  PREFERENCE_SUBMITTED: (name: string) => `${name} submitted their preferences`,
  WISHLIST_SUBMITTED: (name: string) => `${name} added items to wishlist`,
  REFERRAL_SIGNUP: (name: string) => `${name} referred someone`,
  COMMENT_ENGAGEMENT: (name: string) => `${name} joined the discussion`,
  SOCIAL_SHARE: (name: string) => `${name} shared this campaign`,
  BRAND_OUTREACH: (name: string) => `${name} contacted the brand`,
}

/**
 * Campaign Social Proof Widget Component
 * Shows real-time social proof notifications with auto-rotating notifications
 * Features:
 * - Floating notification popup (configurable position)
 * - Auto-rotates through notifications every 5 seconds
 * - Dismiss button and show/hide toggle
 * - Notification queue (max 10)
 * - Total supporters count badge
 * - "X people viewing now" indicator
 * - Slide-in animation from left
 */
export const SocialProofWidget: React.FC<SocialProofWidgetProps> = ({
  campaignId,
  className,
  position = 'bottom-left',
}) => {
  const [data, setData] = useState<SocialProofData | null>(null)
  const [loading, setLoading] = useState(true)
  const [animatedIndices, setAnimatedIndices] = useState<Set<number>>(
    new Set()
  )
  const [isVisible, setIsVisible] = useState(true)
  const [currentNotificationIndex, setCurrentNotificationIndex] = useState(0)
  const [dismissedNotifications, setDismissedNotifications] = useState<
    Set<string>
  >(new Set())

  // Fetch social proof data
  const fetchSocialProof = useCallback(async () => {
    try {
      const response = await fetch(
        `/api/campaigns/${campaignId}/social-proof`
      )
      if (response.ok) {
        const socialProofData: SocialProofData = await response.json()
        setData(socialProofData)

        // Animate avatars sequentially
        if (socialProofData.recentSupporters.length > 0) {
          socialProofData.recentSupporters.forEach((_, index) => {
            setTimeout(() => {
              setAnimatedIndices((prev) => {
                const newSet = new Set(prev)
                newSet.add(index)
                return newSet
              })
            }, index * 100)
          })
        }
      }
    } catch (error) {
      console.error('Failed to fetch social proof:', error)
    } finally {
      setLoading(false)
    }
  }, [campaignId])

  // Initial data load
  useEffect(() => {
    fetchSocialProof()
    // Refresh every 10 seconds for real-time updates
    const interval = setInterval(fetchSocialProof, 10000)
    return () => clearInterval(interval)
  }, [fetchSocialProof])

  // Auto-rotate notifications every 5 seconds
  useEffect(() => {
    if (!data?.recentActivities || data.recentActivities.length === 0) return

    const availableNotifications = data.recentActivities.filter(
      (notif) => !dismissedNotifications.has(notif.id)
    )

    if (availableNotifications.length === 0) return

    const timer = setInterval(() => {
      setCurrentNotificationIndex((prev) => {
        const nextIndex = (prev + 1) % availableNotifications.length
        return nextIndex
      })
    }, 5000)

    return () => clearInterval(timer)
  }, [data?.recentActivities, dismissedNotifications])

  const handleDismissNotification = (notificationId: string) => {
    setDismissedNotifications((prev) => {
      const newSet = new Set(prev)
      newSet.add(notificationId)
      return newSet
    })
  }

  const handleNavigateNotification = (direction: 'prev' | 'next') => {
    if (!data?.recentActivities) return

    const availableNotifications = data.recentActivities.filter(
      (notif) => !dismissedNotifications.has(notif.id)
    )

    if (availableNotifications.length === 0) return

    setCurrentNotificationIndex((prev) => {
      if (direction === 'next') {
        return (prev + 1) % availableNotifications.length
      } else {
        return (prev - 1 + availableNotifications.length) % availableNotifications.length
      }
    })
  }

  if (loading) {
    return (
      <div
        className={cn(
          'fixed z-40 p-4 w-96 max-w-[calc(100vw-2rem)]',
          position === 'bottom-left' ? 'bottom-4 left-4' : 'bottom-4 right-4'
        )}
      >
        <div
          className={cn(
            'bg-white border border-gray-200 rounded-lg p-4 shadow-lg',
            className
          )}
        >
          <div className="animate-pulse space-y-3">
            <div className="h-4 bg-gray-200 rounded w-32" />
            <div className="flex gap-2">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="w-8 h-8 bg-gray-200 rounded-full" />
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!data) {
    return null
  }

  const availableNotifications = data.recentActivities.filter(
    (notif) => !dismissedNotifications.has(notif.id)
  )

  const currentNotification =
    availableNotifications.length > 0
      ? availableNotifications[currentNotificationIndex % availableNotifications.length]
      : null

  // Return compact view when hidden
  if (!isVisible) {
    return (
      <div
        className={cn(
          'fixed z-40 p-4',
          position === 'bottom-left' ? 'bottom-4 left-4' : 'bottom-4 right-4'
        )}
      >
        <Button
          variant="outline"
          size="sm"
          onClick={() => setIsVisible(true)}
          className="gap-2"
        >
          <Zap className="w-4 h-4" />
          <span className="text-xs font-semibold text-violet-600">
            {data.totalSupporters}
          </span>
        </Button>
      </div>
    )
  }

  return (
    <div
      className={cn(
        'fixed z-40 p-4 w-96 max-w-[calc(100vw-2rem)] animate-in slide-in-from-left duration-500',
        position === 'bottom-left' ? 'bottom-4 left-4' : 'bottom-4 right-4'
      )}
    >
      <div
        className={cn(
          'bg-gradient-to-br from-white to-gray-50 border border-gray-200 rounded-lg p-4 shadow-lg backdrop-blur-sm',
          className
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Zap className="w-4 h-4 text-yellow-500" />
            <p className="text-sm font-semibold text-gray-900">
              Social Proof
            </p>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsVisible(false)}
            className="h-6 w-6 p-0"
            title="Hide widget"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>

        {/* Viewing now indicator */}
        <div className="mb-3 flex items-center gap-2 px-2 py-1.5 bg-blue-50 border border-blue-200 rounded text-xs text-blue-700">
          <Eye className="w-3 h-3" />
          <span>{data.viewersNow} viewing now</span>
        </div>

        {/* Real-time notifications carousel */}
        {currentNotification && (
          <div className="mb-4 p-3 bg-violet-50 border border-violet-200 rounded-lg animate-in fade-in duration-300">
            <div className="flex items-start gap-3">
              {currentNotification.avatar ? (
                <img
                  src={currentNotification.avatar}
                  alt={currentNotification.displayName}
                  className="w-8 h-8 rounded-full flex-shrink-0 object-cover"
                />
              ) : (
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-violet-400 to-violet-600 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                  {currentNotification.displayName[0]?.toUpperCase()}
                </div>
              )}
              <div className="flex-1 min-w-0">
                <p className="text-sm text-gray-800 break-words">
                  {currentNotification.message}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  {formatRelativeTime(currentNotification.timestamp)}
                </p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() =>
                  handleDismissNotification(currentNotification.id)
                }
                className="h-5 w-5 p-0 flex-shrink-0"
              >
                <X className="w-3 h-3" />
              </Button>
            </div>

            {/* Navigation controls */}
            {availableNotifications.length > 1 && (
              <div className="flex items-center justify-between mt-3 pt-3 border-t border-violet-200">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleNavigateNotification('prev')}
                  className="h-6 w-6 p-0"
                >
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                <p className="text-xs text-gray-600">
                  {currentNotificationIndex + 1} of{' '}
                  {availableNotifications.length}
                </p>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleNavigateNotification('next')}
                  className="h-6 w-6 p-0"
                >
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            )}
          </div>
        )}

        {/* Main stat: people lobbied in last 24h */}
        <div className="mb-4 bg-yellow-50 border border-yellow-200 rounded-lg p-3">
          <p className="text-xs text-gray-600 mb-1">Last 24 hours</p>
          <div className="flex items-baseline gap-2">
            <p className="text-2xl font-bold text-yellow-600">
              {data.last24hCount}
            </p>
            <p className="text-sm text-gray-700">
              {data.last24hCount === 1 ? 'person' : 'people'} lobbied
            </p>
          </div>
        </div>

        {/* Recent supporters with avatars */}
        <div className="mb-4">
          <p className="text-xs text-gray-600 mb-2">Recent supporters</p>
          {data.recentSupporters.length > 0 ? (
            <div className="flex items-center -space-x-2 overflow-hidden">
              {data.recentSupporters.map((supporter, index) => (
                <div
                  key={supporter.id}
                  className={cn(
                    'relative w-8 h-8 rounded-full border-2 border-white bg-gradient-to-br from-violet-400 to-violet-600 flex items-center justify-center text-white text-xs font-bold overflow-hidden transition-all duration-500 flex-shrink-0',
                    animatedIndices.has(index)
                      ? 'scale-100 opacity-100'
                      : 'scale-0 opacity-0'
                  )}
                  title={supporter.displayName}
                >
                  {supporter.avatar ? (
                    <img
                      src={supporter.avatar}
                      alt={supporter.displayName}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span>{supporter.displayName[0]?.toUpperCase()}</span>
                  )}
                </div>
              ))}

              {data.totalSupporters > data.recentSupporters.length && (
                <div
                  className="relative w-8 h-8 rounded-full border-2 border-white bg-gray-300 flex items-center justify-center text-gray-700 text-xs font-bold flex-shrink-0"
                  title={`+${data.totalSupporters - data.recentSupporters.length} more`}
                >
                  +{data.totalSupporters - data.recentSupporters.length}
                </div>
              )}
            </div>
          ) : (
            <p className="text-sm text-gray-500">No supporters yet</p>
          )}
        </div>

        {/* Total supporters count */}
        <div className="pt-3 border-t border-gray-200">
          <div className="flex items-center gap-2 text-xs text-gray-600">
            <Users className="w-3 h-3" />
            <span>
              {data.totalSupporters} total{' '}
              {data.totalSupporters === 1 ? 'supporter' : 'supporters'}
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}

// Utility function for relative time formatting
function formatRelativeTime(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date
  const now = new Date()
  const diffInSeconds = Math.floor((now.getTime() - d.getTime()) / 1000)

  if (diffInSeconds < 60) return 'just now'
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`
  return 'earlier'
}
