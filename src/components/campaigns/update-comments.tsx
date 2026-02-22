'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Avatar } from '@/components/ui/avatar'
import { CommentItem, type CommentData } from '../shared/comment-item'
import { formatRelativeTime, cn } from '@/lib/utils'
import { useRouter } from 'next/navigation'

interface UpdateCommentsProps {
  campaignId: string
  updateId: string
  campaignCreatorId?: string
  currentUser?: {
    id: string
    displayName: string
    avatar?: string
    handle?: string
  }
}

export const UpdateComments: React.FC<UpdateCommentsProps> = ({
  campaignId,
  updateId,
  campaignCreatorId,
  currentUser,
}) => {
  const router = useRouter()
  const [comments, setComments] = useState<CommentData[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [newCommentContent, setNewCommentContent] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [expandedReplies, setExpandedReplies] = useState<Set<string>>(new Set())

  // Fetch comments for this specific update
  const fetchComments = useCallback(async () => {
    try {
      setIsLoading(true)
      setError(null)
      const response = await fetch(
        `/api/campaigns/${campaignId}/comments?updateId=${updateId}`
      )

      if (!response.ok) {
        throw new Error('Failed to fetch comments')
      }

      const data = await response.json()
      setComments(data.comments || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
      console.error('Error fetching comments:', err)
    } finally {
      setIsLoading(false)
    }
  }, [campaignId, updateId])

  // Load initial comments
  useEffect(() => {
    fetchComments()
  }, [fetchComments])

  // Submit new comment
  const handleSubmitComment = async () => {
    if (!currentUser) {
      router.push('/auth/login')
      return
    }

    if (!newCommentContent.trim()) {
      setError('Comment cannot be empty')
      return
    }

    try {
      setIsSubmitting(true)
      setError(null)

      const response = await fetch(`/api/campaigns/${campaignId}/comments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          content: newCommentContent,
          updateId,
        }),
      })

      if (response.status === 429) {
        setError('You have reached the comment limit. Please try again later.')
        return
      }

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to post comment')
      }

      const newComment = await response.json()

      // Optimistic UI update
      setComments([
        {
          ...newComment,
          replies: [],
          replyCount: 0,
        },
        ...comments,
      ])
      setNewCommentContent('')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to post comment')
      console.error('Error posting comment:', err)
    } finally {
      setIsSubmitting(false)
    }
  }

  // Edit comment
  const handleEditComment = async (commentId: string, content: string) => {
    try {
      const response = await fetch(
        `/api/campaigns/${campaignId}/comments/${commentId}`,
        {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ content }),
        }
      )

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to edit comment')
      }

      const updatedComment = await response.json()

      // Update in comments list
      setComments(comments.map(c => c.id === commentId ? { ...c, ...updatedComment } : c))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to edit comment')
      console.error('Error editing comment:', err)
    }
  }

  // Delete comment
  const handleDeleteComment = async (commentId: string) => {
    if (!confirm('Are you sure you want to delete this comment?')) {
      return
    }

    try {
      const response = await fetch(
        `/api/campaigns/${campaignId}/comments/${commentId}`,
        {
          method: 'DELETE',
        }
      )

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to delete comment')
      }

      // Remove from comments list
      setComments(comments.filter(c => c.id !== commentId))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete comment')
      console.error('Error deleting comment:', err)
    }
  }

  // Reply to comment
  const handleReplyComment = async (parentId: string, content: string) => {
    if (!currentUser) {
      router.push('/auth/login')
      return
    }

    try {
      const response = await fetch(`/api/campaigns/${campaignId}/comments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          content,
          parentId,
          updateId,
        }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to post reply')
      }

      const newReply = await response.json()

      // Update comments with new reply
      setComments(comments.map(c => {
        if (c.id === parentId) {
          return {
            ...c,
            replies: [...(c.replies || []), { ...newReply, replies: [], replyCount: 0 }],
            replyCount: c.replyCount + 1,
          }
        }
        return c
      }))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to post reply')
      console.error('Error posting reply:', err)
    }
  }

  // Toggle replies visibility
  const handleToggleReplies = (commentId: string) => {
    setExpandedReplies(prev => {
      const newSet = new Set(prev)
      if (newSet.has(commentId)) {
        newSet.delete(commentId)
      } else {
        newSet.add(commentId)
      }
      return newSet
    })
  }

  const userInitials = currentUser?.displayName
    .split(' ')
    .map(n => n.charAt(0))
    .join('')
    .slice(0, 2)

  return (
    <div className="space-y-3 py-3 border-t border-gray-100">
      {/* New comment form */}
      {currentUser ? (
        <div className="flex gap-3">
          <Avatar
            src={currentUser.avatar}
            alt={currentUser.displayName}
            initials={userInitials}
            size="sm"
          />
          <div className="flex-1 space-y-2">
            <Textarea
              value={newCommentContent}
              onChange={(e) => {
                setNewCommentContent(e.target.value)
                setError(null)
              }}
              placeholder="Share your thoughts..."
              className="min-h-16 resize-none text-sm"
            />
            <div className="flex items-center justify-between">
              <div className="text-xs text-gray-500">
                {newCommentContent.length}/2000
              </div>
              <Button
                size="sm"
                variant="primary"
                onClick={handleSubmitComment}
                disabled={!newCommentContent.trim() || isSubmitting}
                className={cn(
                  'bg-violet-600 hover:bg-violet-700 text-white text-xs',
                  !newCommentContent.trim() && 'opacity-50 cursor-not-allowed'
                )}
              >
                {isSubmitting ? 'Posting...' : 'Post'}
              </Button>
            </div>
          </div>
        </div>
      ) : (
        <div className="p-3 bg-violet-50 border border-violet-200 rounded-lg text-center text-sm">
          <p className="text-gray-700 mb-2">
            Sign in to share your thoughts.
          </p>
          <Button
            size="sm"
            variant="primary"
            onClick={() => router.push('/auth/login')}
          >
            Sign In
          </Button>
        </div>
      )}

      {/* Error message */}
      {error && (
        <div className="p-2 bg-red-50 border border-red-200 rounded text-xs text-red-700">
          {error}
        </div>
      )}

      {/* Comments list */}
      {isLoading ? (
        <div className="text-center py-4 text-sm text-gray-500">
          Loading comments...
        </div>
      ) : comments.length === 0 ? (
        <div className="py-2 text-center text-sm text-gray-500">
          No comments yet
        </div>
      ) : (
        <div className="space-y-3">
          {comments.map((comment) => (
            <div key={comment.id} className="pb-2 last:pb-0">
              <CommentItem
                comment={{
                  ...comment,
                  replies: expandedReplies.has(comment.id) ? comment.replies : undefined,
                }}
                currentUserId={currentUser?.id}
                campaignCreatorId={campaignCreatorId}
                onEdit={handleEditComment}
                onDelete={handleDeleteComment}
                onReply={(parentId, content) => {
                  handleReplyComment(parentId, content)
                }}
                onToggleReplies={handleToggleReplies}
                showReplies={expandedReplies.has(comment.id)}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
