'use client'

import React, { useState, useEffect } from 'react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'

interface ReactionCounts {
  thumbsup: number
  heart: number
  laugh: number
  surprised: number
  sad: number
}

interface CommentReactionsProps {
  commentId: string
  onReactionChange?: (reaction: string | null) => void
}

const EMOJI_REACTIONS = [
  { id: 'thumbsup', emoji: '👍', label: 'Thumbs up' },
  { id: 'heart', emoji: '❤️', label: 'Heart' },
  { id: 'laugh', emoji: '😂', label: 'Laugh' },
  { id: 'surprised', emoji: '😮', label: 'Surprised' },
  { id: 'sad', emoji: '😢', label: 'Sad' },
]

export function CommentReactions({
  commentId,
  onReactionChange,
}: CommentReactionsProps) {
  const [reactions, setReactions] = useState<ReactionCounts>({
    thumbsup: 0,
    heart: 0,
    laugh: 0,
    surprised: 0,
    sad: 0,
  })
  const [userReaction, setUserReaction] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [initialLoaded, setInitialLoaded] = useState(false)

  // Load initial reaction counts
  useEffect(() => {
    const loadReactions = async () => {
      try {
        const response = await fetch(
          `/api/comments/${commentId}/reactions`
        )
        if (response.ok) {
          const data = await response.json()
          setReactions(data.reactions)
          setUserReaction(data.userReaction)
        }
      } catch (error) {
        console.error('Error loading reactions:', error)
      } finally {
        setInitialLoaded(true)
      }
    }

    loadReactions()
  }, [commentId])

  const handleReaction = async (reactionId: string) => {
    setLoading(true)
    try {
      const response = await fetch(
        `/api/comments/${commentId}/reactions`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ reaction: reactionId }),
        }
      )

      if (response.ok) {
        const data = await response.json()

        setReactions(data.reactions)
        setUserReaction(data.userReaction)
        onReactionChange?.(data.userReaction)
      } else if (response.status === 401) {
        console.error('Authentication required to react')
      }
    } catch (error) {
      console.error('Error toggling reaction:', error)
    } finally {
      setLoading(false)
    }
  }

  if (!initialLoaded) {
    return <div className="h-6 w-40 bg-gray-200 rounded animate-pulse" />
  }

  return (
    <div className="flex items-center gap-1">
      {EMOJI_REACTIONS.map(({ id, emoji, label }) => {
        const count = reactions[id as keyof ReactionCounts]
        const isUserReaction = userReaction === id
        
        return (
          <Button
            key={id}
            onClick={() => handleReaction(id)}
            disabled={loading}
            variant="ghost"
            size="sm"
            className={cn(
              'h-6 px-2 py-0 text-xs transition-all duration-200',
              'hover:bg-gray-100 active:scale-95',
              isUserReaction
                ? 'bg-violet-100 text-violet-700'
                : 'text-gray-600 hover:text-gray-900'
            )}
            title={label}
          >
            <span className="mr-1">{emoji}</span>
            {count > 0 && <span className="text-xs font-medium">{count}</span>}
          </Button>
        )
      })}
    </div>
  )
}
