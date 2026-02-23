'use client'

import React, { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface ReactionEmojisProps {
  campaignId: string
  onReactionChange?: (type: string, action: 'added' | 'removed') => void
}

interface ReactionCounts {
  fire: number
  heart: number
  thumbsup: number
  rocket: number
  eyes: number
  party: number
}

interface UserReactions {
  [key: string]: boolean
}

const REACTION_EMOJIS = {
  fire: '🔥',
  heart: '❤️',
  thumbsup: '👍',
  rocket: '🚀',
  eyes: '👀',
  party: '🎉',
} as const

type ReactionType = keyof typeof REACTION_EMOJIS

export function ReactionEmojis({
  campaignId,
  onReactionChange,
}: ReactionEmojisProps) {
  const [counts, setCounts] = useState<ReactionCounts>({
    fire: 0,
    heart: 0,
    thumbsup: 0,
    rocket: 0,
    eyes: 0,
    party: 0,
  })
  const [userReactions, setUserReactions] = useState<UserReactions>({})
  const [loading, setLoading] = useState(false)
  const [initialLoaded, setInitialLoaded] = useState(false)

  // Load initial reaction counts and user reactions
  useEffect(() => {
    const loadReactions = async () => {
      try {
        const response = await fetch(
          `/api/campaigns/${campaignId}/reactions`
        )
        if (response.ok) {
          const data = await response.json()
          setCounts(data.counts)
          setUserReactions(data.userReactions || {})
        }
      } catch (error) {
        console.error('Error loading reactions:', error)
      } finally {
        setInitialLoaded(true)
      }
    }

    loadReactions()
  }, [campaignId])

  const handleReaction = async (type: ReactionType) => {
    if (loading) return

    setLoading(true)
    try {
      const response = await fetch(
        `/api/campaigns/${campaignId}/reactions`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ type }),
        }
      )

      if (response.ok) {
        const data = await response.json()
        setCounts(data.counts)
        setUserReactions(data.userReactions || {})

        // Notify parent component
        if (onReactionChange) {
          const action = data.userReactions[type] ? 'added' : 'removed'
          onReactionChange(type, action)
        }
      } else if (response.status === 401) {
        // User is not authenticated, could redirect to login
        console.error('Please log in to add reactions')
      }
    } catch (error) {
      console.error('Error updating reaction:', error)
    } finally {
      setLoading(false)
    }
  }

  if (!initialLoaded) {
    return (
      <div className="flex gap-1">
        {Object.entries(REACTION_EMOJIS).map(([type]) => (
          <div
            key={type}
            className="h-8 w-12 animate-pulse rounded-lg bg-gray-200"
          />
        ))}
      </div>
    )
  }

  return (
    <div className="flex flex-wrap gap-1">
      {(Object.entries(REACTION_EMOJIS) as Array<[ReactionType, string]>).map(
        ([type, emoji]) => {
          const count = counts[type]
          const hasUserReacted = userReactions[type]

          return (
            <Button
              key={type}
              variant="ghost"
              size="sm"
              onClick={() => handleReaction(type)}
              disabled={loading}
              className={cn(
                'h-8 px-2 text-sm font-medium transition-all',
                'hover:bg-gray-100',
                hasUserReacted && 'bg-violet-100 hover:bg-violet-200'
              )}
              title={type}
            >
              <span className="mr-1 text-base">{emoji}</span>
              {count > 0 && <span className="text-xs text-gray-600">{count}</span>}
            </Button>
          )
        }
      )}
    </div>
  )
}
