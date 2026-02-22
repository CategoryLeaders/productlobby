'use client'

import React, { useState, useEffect } from 'react'
import { Heart, Flame, ShoppingCart } from 'lucide-react'
import { Avatar } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { cn } from '@/lib/utils'

interface LobbyReason {
  id: string
  reason: string
  intensity: string
  createdAt: string
  user: {
    id: string
    displayName: string
    avatar?: string
  }
}

interface LobbyReasonsDisplayProps {
  campaignId: string
}

const getIntensityBadge = (intensity: string) => {
  switch (intensity) {
    case 'NEAT_IDEA':
      return {
        label: 'Neat Idea',
        color: 'bg-green-100 text-green-800',
        icon: Heart,
      }
    case 'PROBABLY_BUY':
      return {
        label: "I'd Probably Buy",
        color: 'bg-yellow-100 text-yellow-800',
        icon: ShoppingCart,
      }
    case 'TAKE_MY_MONEY':
      return {
        label: 'Take My Money!',
        color: 'bg-violet-100 text-violet-800',
        icon: Flame,
      }
    default:
      return {
        label: 'Supporter',
        color: 'bg-gray-100 text-gray-800',
        icon: Heart,
      }
  }
}

const formatTimeAgo = (dateString: string) => {
  const date = new Date(dateString)
  const now = new Date()
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000)

  if (seconds < 60) return 'Just now'
  const minutes = Math.floor(seconds / 60)
  if (minutes < 60) return `${minutes}m ago`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  if (days < 7) return `${days}d ago`
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

export function LobbyReasonsDisplay({ campaignId }: LobbyReasonsDisplayProps) {
  const [reasons, setReasons] = useState<LobbyReason[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchReasons = async () => {
      try {
        setLoading(true)
        setError(null)
        const response = await fetch(`/api/campaigns/${campaignId}/lobby-reasons`)

        if (!response.ok) {
          throw new Error('Failed to fetch lobby reasons')
        }

        const data = await response.json()
        setReasons(data.reasons || [])
      } catch (err) {
        console.error('Error fetching lobby reasons:', err)
        setError('Failed to load supporter reasons')
      } finally {
        setLoading(false)
      }
    }

    fetchReasons()
  }, [campaignId])

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">What supporters are saying</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="animate-pulse">
                <div className="h-20 bg-gray-100 rounded-lg"></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  if (reasons.length === 0) {
    return null
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">What supporters are saying</CardTitle>
        <p className="text-sm text-gray-600 mt-2">
          {reasons.length} {reasons.length === 1 ? 'supporter' : 'supporters'} shared why this product matters to them
        </p>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {reasons.map((item) => {
            const badge = getIntensityBadge(item.intensity)
            const IconComponent = badge.icon
            const initials = item.user.displayName
              .split(' ')
              .map((n) => n.charAt(0))
              .join('')
              .toUpperCase()
              .slice(0, 2)

            return (
              <div
                key={item.id}
                className="bg-gray-50 border border-gray-200 rounded-lg p-4 hover:shadow-card-hover transition-shadow"
              >
                <div className="flex gap-3">
                  {/* User Avatar */}
                  <Avatar
                    src={item.user.avatar}
                    alt={item.user.displayName}
                    initials={initials}
                    size="sm"
                  />

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div>
                        <p className="font-medium text-sm text-foreground">
                          {item.user.displayName}
                        </p>
                        <p className="text-xs text-gray-600">
                          {formatTimeAgo(item.createdAt)}
                        </p>
                      </div>
                    </div>

                    {/* Reason Text */}
                    <p className="text-sm text-gray-700 mb-3 break-words">
                      {item.reason}
                    </p>

                    {/* Intensity Badge */}
                    <div className="flex items-center gap-2">
                      <Badge
                        variant="default"
                        size="sm"
                        className={cn('flex items-center gap-1', badge.color)}
                      >
                        <IconComponent className="w-3 h-3" />
                        <span>{badge.label}</span>
                      </Badge>
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        {reasons.length === 50 && (
          <div className="mt-6 text-center text-sm text-gray-600">
            <p>Showing 50 most recent reasons</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
