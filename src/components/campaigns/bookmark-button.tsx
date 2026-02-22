'use client'

import React, { useState, useEffect } from 'react'
import { Heart, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'

interface BookmarkButtonProps {
  campaignId: string
  onBookmarkChange?: (bookmarked: boolean) => void
  showLabel?: boolean
  variant?: 'icon' | 'button'
  size?: 'sm' | 'md' | 'lg'
}

export const BookmarkButton: React.FC<BookmarkButtonProps> = ({
  campaignId,
  onBookmarkChange,
  showLabel = false,
  variant = 'icon',
  size = 'md',
}) => {
  const [bookmarked, setBookmarked] = useState(false)
  const [loading, setLoading] = useState(false)
  const [mounted, setMounted] = useState(false)

  // Check initial bookmark status
  useEffect(() => {
    setMounted(true)
    const checkBookmarkStatus = async () => {
      try {
        const response = await fetch(
          `/api/campaigns/${campaignId}/bookmark-status`
        )
        if (response.ok) {
          const data = await response.json()
          setBookmarked(data.bookmarked)
        }
      } catch (error) {
        console.error('Error checking bookmark status:', error)
      }
    }

    checkBookmarkStatus()
  }, [campaignId])

  const handleBookmarkToggle = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()

    setLoading(true)
    try {
      const response = await fetch('/api/bookmarks', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ campaignId }),
      })

      if (response.ok) {
        const data = await response.json()
        setBookmarked(data.bookmarked)
        onBookmarkChange?.(data.bookmarked)
      } else if (response.status === 401) {
        // User not authenticated - redirect to login
        window.location.href = '/login'
      }
    } catch (error) {
      console.error('Error toggling bookmark:', error)
    } finally {
      setLoading(false)
    }
  }

  if (!mounted) {
    return null
  }

  const sizeClasses = {
    sm: 'w-6 h-6',
    md: 'w-8 h-8',
    lg: 'w-10 h-10',
  }

  const iconSizeMap = {
    sm: 16,
    md: 20,
    lg: 24,
  }

  if (variant === 'icon') {
    return (
      <button
        onClick={handleBookmarkToggle}
        disabled={loading}
        className={cn(
          'p-2 rounded-lg transition-all duration-200 hover:bg-violet-50',
          'disabled:opacity-50 disabled:cursor-not-allowed',
          'focus:outline-none focus:ring-2 focus:ring-violet-500 focus:ring-offset-2'
        )}
        aria-label={bookmarked ? 'Remove bookmark' : 'Add bookmark'}
      >
        {loading ? (
          <Loader2
            size={iconSizeMap[size]}
            className="animate-spin text-violet-600"
          />
        ) : (
          <Heart
            size={iconSizeMap[size]}
            className={cn(
              'transition-all duration-200',
              bookmarked
                ? 'fill-violet-600 text-violet-600'
                : 'text-gray-400 hover:text-violet-600'
            )}
          />
        )}
      </button>
    )
  }

  // Button variant with label
  return (
    <button
      onClick={handleBookmarkToggle}
      disabled={loading}
      className={cn(
        'flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-200',
        'font-medium text-sm',
        'disabled:opacity-50 disabled:cursor-not-allowed',
        'focus:outline-none focus:ring-2 focus:ring-offset-2',
        bookmarked
          ? 'bg-violet-100 text-violet-700 border border-violet-200 hover:bg-violet-200 focus:ring-violet-500'
          : 'bg-gray-100 text-gray-700 border border-gray-200 hover:bg-gray-200 focus:ring-gray-500'
      )}
    >
      {loading ? (
        <Loader2 size={18} className="animate-spin" />
      ) : (
        <Heart
          size={18}
          className={bookmarked ? 'fill-current' : ''}
        />
      )}
      {showLabel && (
        <span>{bookmarked ? 'Saved' : 'Save Campaign'}</span>
      )}
    </button>
  )
}
