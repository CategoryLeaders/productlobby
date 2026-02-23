'use client'

import React, { useState, useEffect } from 'react'
import { ThumbsUp, ThumbsDown } from 'lucide-react'
import { cn } from '@/lib/utils'

interface CommentReactionsProps {
  commentId: string
  onReactionChange?: (type: string | null) => void
}

export function CommentReactions({
  commentId,
  onReactionChange,
}: CommentReactionsProps) {
  const [likes, setLikes] = useState(0)
  const [dislikes, setDislikes] = useState(0)
  const [userReaction, setUserReaction] = useState<'like' | 'dislike' | null>(
    null
  )
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
          setLikes(data.likes)
          setDislikes(data.dislikes)
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

  const handleReaction = async (type: 'like' | 'dislike') => {
    setLoading(true)
    try {
      const response = await fetch(
        `/api/comments/${commentId}/reactions`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ type }),
        }
      )

      if (response.ok) {
        const data = await response.json()

        // Update counts based on new state
        if (data.reacted) {
          if (type === 'like') {
            setLikes((prev) => (userReaction === 'like' ? prev : prev + 1))
            if (userReaction === 'dislike') {
              setDislikes((prev) => prev - 1)
            }
          } else {
            setDislikes((prev) => (userReaction === 'dislike' ? prev : prev + 1))
            if (userReaction === 'like') {
              setLikes((prev) => prev - 1)
            }
          }
          setUserReaction(type)
        } else {
          // Reaction was removed
          if (type === 'like') {
            setLikes((prev) => Math.max(0, prev - 1))
          } else {
            setDislikes((prev) => Math.max(0, prev - 1))
          }
          setUserReaction(null)
        }

        onReactionChange?.(data.reacted ? type : null)
      } else if (response.status === 401) {
        // Handle authentication required
        console.error('Authentication required to react')
      }
    } catch (error) {
      console.error('Error toggling reaction:', error)
    } finally {
      setLoading(false)
    }
  }

  if (!initialLoaded) {
    return <div className="h-8 w-32 bg-gray-200 rounded animate-pulse" />
  }

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={() => handleReaction('like')}
        disabled={loading}
        className={cn(
          'flex items-center gap-1 px-2 py-1 rounded-md transition-all duration-200',
          'hover:bg-gray-100 active:scale-95',
          userReaction === 'like'
            ? 'bg-violet-100 text-violet-600'
            : 'text-gray-600 hover:text-gray-900'
        )}
        title="Like this comment"
      >
        <ThumbsUp className="w-4 h-4" />
        {likes > 0 && <span className="text-xs font-medium">{likes}</span>}
      </button>

      <button
        onClick={() => handleReaction('dislike')}
        disabled={loading}
        className={cn(
          'flex items-center gap-1 px-2 py-1 rounded-md transition-all duration-200',
          'hover:bg-gray-100 active:scale-95',
          userReaction === 'dislike'
            ? 'bg-red-100 text-red-600'
            : 'text-gray-600 hover:text-gray-900'
        )}
        title="Dislike this comment"
      >
        <ThumbsDown className="w-4 h-4" />
        {dislikes > 0 && <span className="text-xs font-medium">{dislikes}</span>}
      </button>
    </div>
  )
}
