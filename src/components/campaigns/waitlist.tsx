'use client'

import React, { useState, useEffect } from 'react'
import { Users, Loader2, Check } from 'lucide-react'
import { cn } from '@/lib/utils'

interface WaitlistProps {
  campaignId: string
  onStatusChange?: (joined: boolean, position?: number) => void
}

export const Waitlist: React.FC<WaitlistProps> = ({
  campaignId,
  onStatusChange,
}) => {
  const [isJoined, setIsJoined] = useState(false)
  const [userPosition, setUserPosition] = useState<number | null>(null)
  const [totalCount, setTotalCount] = useState(0)
  const [loading, setLoading] = useState(false)
  const [mounted, setMounted] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Load initial waitlist status
  useEffect(() => {
    setMounted(true)
    const fetchWaitlistStatus = async () => {
      try {
        const response = await fetch(
          `/api/campaigns/${campaignId}/waitlist`
        )
        if (response.ok) {
          const data = await response.json()
          setIsJoined(data.data.isJoined)
          setUserPosition(data.data.userPosition)
          setTotalCount(data.data.totalCount)
        }
      } catch (err) {
        console.error('Error fetching waitlist status:', err)
      }
    }

    fetchWaitlistStatus()
  }, [campaignId])

  const handleJoinWaitlist = async () => {
    setLoading(true)
    setError(null)

    try {
      const response = await fetch(
        `/api/campaigns/${campaignId}/waitlist`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
        }
      )

      if (response.ok) {
        const data = await response.json()
        setIsJoined(true)
        setUserPosition(data.data.position)
        setTotalCount(data.data.totalCount)
        onStatusChange?.(true, data.data.position)
      } else if (response.status === 401) {
        window.location.href = '/login'
      } else {
        const data = await response.json()
        setError(data.error || 'Failed to join waitlist')
      }
    } catch (err) {
      setError('An error occurred. Please try again.')
      console.error('Error joining waitlist:', err)
    } finally {
      setLoading(false)
    }
  }

  if (!mounted) {
    return null
  }

  return (
    <div className="flex flex-col gap-3">
      {/* Join Waitlist Button */}
      {!isJoined ? (
        <button
          onClick={handleJoinWaitlist}
          disabled={loading}
          className={cn(
            'flex items-center justify-center gap-2 px-4 py-3 rounded-lg font-medium',
            'transition-all duration-200',
            'focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500',
            'disabled:opacity-50 disabled:cursor-not-allowed',
            'bg-blue-600 text-white hover:bg-blue-700'
          )}
        >
          {loading ? (
            <>
              <Loader2 size={18} className="animate-spin" />
              <span>Joining Waitlist...</span>
            </>
          ) : (
            <>
              <Users size={18} />
              <span>Join Waitlist</span>
            </>
          )}
        </button>
      ) : (
        <div
          className={cn(
            'flex items-center gap-2 px-4 py-3 rounded-lg font-medium',
            'bg-green-50 text-green-700 border border-green-200'
          )}
        >
          <Check size={18} />
          <span>You're on the waitlist</span>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <p className="text-sm text-red-600">{error}</p>
      )}

      {/* Waitlist Stats */}
      <div className="flex items-center gap-4 text-sm">
        {isJoined && userPosition !== null && (
          <div className="flex items-center gap-1">
            <span className="text-gray-600">Your position:</span>
            <span className="font-semibold text-gray-900">#{userPosition}</span>
          </div>
        )}
        <div className="flex items-center gap-1">
          <Users size={16} className="text-gray-400" />
          <span className="text-gray-600">
            {totalCount} {totalCount === 1 ? 'person' : 'people'} waiting
          </span>
        </div>
      </div>
    </div>
  )
}
