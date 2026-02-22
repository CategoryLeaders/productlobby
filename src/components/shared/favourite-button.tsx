'use client'

import React, { useState, useEffect } from 'react'
import { Heart } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'
import { cn } from '@/lib/utils'

export interface FavouriteButtonProps {
  campaignId: string
  initialFavourited?: boolean
  initialCount?: number
}

export const FavouriteButton: React.FC<FavouriteButtonProps> = ({
  campaignId,
  initialFavourited = false,
  initialCount = 0,
}) => {
  const router = useRouter()
  const { user, isLoading: authLoading } = useAuth()
  const [favourited, setFavourited] = useState(initialFavourited)
  const [count, setCount] = useState(initialCount)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Load initial state on mount or when campaignId changes
  useEffect(() => {
    const loadFavouriteState = async () => {
      try {
        const res = await fetch(
          `/api/campaigns/${campaignId}/favourite`
        )
        if (res.ok) {
          const data = await res.json()
          setFavourited(data.data.favourited)
          setCount(data.data.count)
        }
      } catch (err) {
        console.error('Failed to load favourite state:', err)
      }
    }

    loadFavouriteState()
  }, [campaignId])

  const handleToggleFavourite = async (e: React.MouseEvent) => {
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
    const previousFavourited = favourited
    const previousCount = count
    setFavourited(!favourited)
    setCount(favourited ? count - 1 : count + 1)

    try {
      const res = await fetch(
        `/api/campaigns/${campaignId}/favourite`,
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
        throw new Error('Failed to toggle favourite')
      }

      const data = await res.json()
      setFavourited(data.data.favourited)
      setCount(data.data.count)
    } catch (err) {
      // Revert optimistic update on error
      setFavourited(previousFavourited)
      setCount(previousCount)
      const errorMessage = err instanceof Error ? err.message : 'Something went wrong'
      setError(errorMessage)
      console.error('Toggle favourite error:', err)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <button
      onClick={handleToggleFavourite}
      disabled={isLoading || authLoading}
      className={cn(
        'flex items-center gap-2 px-3 py-2 rounded-lg transition-all duration-200',
        'hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed',
        favourited
          ? 'text-red-500 bg-red-50'
          : 'text-gray-600 hover:text-red-500'
      )}
      title={favourited ? 'Remove from favourites' : 'Add to favourites'}
    >
      <Heart
        size={20}
        className={cn(
          'transition-transform duration-200',
          favourited ? 'fill-current' : '',
          isLoading && 'animate-pulse'
        )}
      />
      <span className="text-sm font-medium">{count}</span>
      {error && (
        <div className="text-xs text-red-500 mt-1">{error}</div>
      )}
    </button>
  )
}
