'use client'

import React, { useEffect, useState } from 'react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Star, User, Award, Loader2 } from 'lucide-react'

export interface SupporterSpotlightData {
  id: string
  userId: string
  user: {
    id: string
    displayName: string
    handle: string | null
    avatar: string | null
  }
  contributionStats: {
    lobbiesCount: number
    sharesCount: number
    daysActive: number
  }
  metadata: {
    inspirationalMessage: string
  }
}

export interface SupporterSpotlightProps {
  campaignId: string
  className?: string
}

export function SupporterSpotlight({
  campaignId,
  className,
}: SupporterSpotlightProps) {
  const [supporter, setSupporter] = useState<SupporterSpotlightData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchSpotlight = async () => {
      try {
        setLoading(true)
        setError(null)
        const response = await fetch(
          `/api/campaigns/${campaignId}/spotlight`
        )
        if (!response.ok) {
          throw new Error('Failed to fetch featured supporter')
        }
        const data = await response.json()
        setSupporter(data)
      } catch (err) {
        console.error('Error fetching spotlight:', err)
        setError(
          err instanceof Error ? err.message : 'Failed to load supporter'
        )
      } finally {
        setLoading(false)
      }
    }

    fetchSpotlight()
  }, [campaignId])

  if (loading) {
    return (
      <div
        className={cn(
          'flex items-center justify-center rounded-lg border border-gray-200 bg-white p-8',
          className
        )}
      >
        <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
      </div>
    )
  }

  if (error || !supporter) {
    return null
  }

  return (
    <div
      className={cn(
        'rounded-lg border border-purple-200 bg-gradient-to-br from-purple-50 to-blue-50 p-6 shadow-sm',
        className
      )}
    >
      {/* Featured Label */}
      <div className="mb-4 flex items-center gap-2">
        <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
        <span className="text-sm font-semibold text-purple-700">
          Featured Supporter
        </span>
      </div>

      {/* Supporter Card */}
      <div className="flex flex-col items-center gap-4 text-center">
        {/* Avatar */}
        {supporter.user.avatar ? (
          <img
            src={supporter.user.avatar}
            alt={supporter.user.displayName}
            className="h-20 w-20 rounded-full border-4 border-white shadow-md"
          />
        ) : (
          <div className="flex h-20 w-20 items-center justify-center rounded-full border-4 border-white bg-gray-200 shadow-md">
            <User className="h-10 w-10 text-gray-600" />
          </div>
        )}

        {/* Name and Handle */}
        <div>
          <h3 className="text-lg font-bold text-gray-900">
            {supporter.user.displayName}
          </h3>
          {supporter.user.handle && (
            <p className="text-sm text-gray-600">@{supporter.user.handle}</p>
          )}
        </div>

        {/* Contribution Stats */}
        <div className="grid w-full gap-3 rounded-md bg-white/70 p-4 backdrop-blur">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 text-sm font-medium text-gray-700">
              <Award className="h-4 w-4 text-blue-600" />
              Lobbies Count
            </div>
            <span className="font-bold text-gray-900">
              {supporter.contributionStats.lobbiesCount}
            </span>
          </div>
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 text-sm font-medium text-gray-700">
              <Star className="h-4 w-4 text-green-600" />
              Shares Count
            </div>
            <span className="font-bold text-gray-900">
              {supporter.contributionStats.sharesCount}
            </span>
          </div>
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 text-sm font-medium text-gray-700">
              <Award className="h-4 w-4 text-amber-600" />
              Days Active
            </div>
            <span className="font-bold text-gray-900">
              {supporter.contributionStats.daysActive}
            </span>
          </div>
        </div>

        {/* Inspirational Quote */}
        <div className="rounded-lg border-l-4 border-purple-500 bg-white/50 p-4">
          <p className="italic text-gray-800">
            "{supporter.metadata.inspirationalMessage}"
          </p>
        </div>

        {/* Profile Link Button */}
        <Button
          variant="outline"
          className="w-full gap-2"
          onClick={() => {
            // Navigate to supporter profile or campaign page
            window.location.href = `/users/${supporter.user.handle || supporter.user.id}`
          }}
        >
          <User className="h-4 w-4" />
          View Profile
        </Button>
      </div>

      {/* Daily Refresh Note */}
      <p className="mt-4 text-center text-xs text-gray-500">
        Featured supporter refreshes daily
      </p>
    </div>
  )
}
