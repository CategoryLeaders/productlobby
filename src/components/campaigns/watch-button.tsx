'use client'

import React, { useState, useEffect } from 'react'
import { Eye, EyeOff } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'
import { cn } from '@/lib/utils'

export interface WatchButtonProps {
  campaignId: string
  initialWatching?: boolean
  initialCount?: number
}

export const WatchButton: React.FC<WatchButtonProps> = ({
  campaignId,
  initialWatching = false,
  initialCount = 0,
}) => {
  const router = useRouter()
  const { user, isLoading: authLoading } = useAuth()
  const [watching, setWatching] = useState(initialWatching)
  const [count, setCount] = useState(initialCount)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Load initial state on mount or when campaignId changes
  useEffect(() => {
    const loadWatchState = async () => {
      try {
        const res = await fetch(
          `/api/campaigns/${campaignId}/watch`
        )
        if (res.ok) {
          const data = await res.json()
          setWatching(data.data.watching)
          setCount(data.data.count)
        }
      } catch (err) {
        console.error('Failed to load watch state:', err)
      }
    }

    loadWatchState()
  }, [campaignId])

  const handleToggleWatch = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()

    // If not authenticated, redirect to login
    if (!user && !authLoading) {
      router.push('/login')
      return
    }

    if (isLoading || authLoading) return

    setIsLoading(true)
    setError(null)

    // Optimistic update
    const previousWatching = watching
    const previousCount = count
    setWatching(!watching)
    setCount(watching ? count - 1 : count + 1)

    try {
      const res = await fetch(
        `/api/campaigns/${campaignId}/watch`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
        }
      )

      if (!res.ok) {
        if (res.status === 401) {
          // Session expired, redirect to login
          router.push('/login')
          return
        }
        throw new Error('Failed to toggle watch')
      }

      const data = await res.json()
      setWatching(data.data.watching)
      setCount(data.data.count)
    } catch (err) {
      // Revert optimistic update on error
      setWatching(previousWatching)
      setCount(previousCount)
      const errorMessage = err instanceof Error ? err.message : 'Something went wrong'
      setError(errorMessage)
      console.error('Toggle watch error:', err)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <button
      onClick={handleToggleWatch}
      disabled={isLoading || authLoading}
      className={cn(
        'flex items-center gap-2 px-3 py-2 rounded-lg transition-all duration-200',
        'hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed',
        watching
          ? 'text-violet-600 bg-violet-50'
          : 'text-gray-600 hover:text-violet-600'
      )}
      title={watching ? 'Stop watching' : 'Watch campaign'}
    >
      {watching ? (
        <Eye
          size={20}
          className={cn(
            'transition-transform duration-200',
            isLoading && 'animate-pulse'
          )}
        />
      ) : (
        <EyeOff
          size={20}
          className={cn(
            'transition-transform duration-200',
            isLoading && 'animate-pulse'
          )}
        />
      )}
      <span className="text-sm font-medium">{count}</span>
      {error && (
        <div className="text-xs text-red-500 mt-1">{error}</div>
      )}
    </button>
  )
}
