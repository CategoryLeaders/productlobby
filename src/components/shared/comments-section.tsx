'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Spinner } from '@/components/ui/spinner'
import { Avatar } from '@/components/ui/avatar'
import { CommentItem, type CommentData } from './comment-item'
import { cn } from '@/lib/utils'
import { useRouter } from 'next/navigation'

interface CommentsSectionProps {
  campaignId: string
  campaignCreatorId?: string
  currentUser?: {
    id: string
    displayName: string
    avatar?: string
    handle?: string
  }
}

export const CommentsSection: React.FC<CommentsSectionProps> = ({
  campaignId,
  campaignCreatorId,
  currentUser,
}) => {
  const router = useRouter()
  const [comments, setComments] = useState<CommentData[]>([])
  const [totalComments, setTotalComments] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [newCommentContent, setNewCommentContent] = useState('')
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [expandedReplies, setExpandedReplies] = useState<Set<string>>(new Set())
  const [loadingReplies, setLoadingReplies] = useState<Set<string>>(new Set())

  const limit = 10

  // Fetch comments
  const fetchComments = useCallback(async (pageNum: number = 1) => {
    try {
      setIsLoading(true)
      setError(null)
      const response = await fetch(
        `/api/campaigns/${campaignId}/comments?page=${pageNum}&limit=${limit}&sort=newest`
      )

      if (!response.ok) {
        throw new Error('Failed to fetch comments')
      }

      const data = await response.json()
      setComments(data.comments)
      setTotalComments(data.total)
      setPage(pageNum)
      setHasMore(pageNum < data.pages)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
      console.error('Error fetching comments:', err)
    } finally {
      setIsLoading(false)
    }
  }, [campaignId, limit])

  // Load initial comments
  useEffect(() => {
    fetchComments(1)
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
      setTotalComments(totalComments + 1)
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
      setTotalComments(Math.max(0, totalComments - 1))
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
    <div className="w-full space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-gray-900">
          Comments ({totalComments})
        </h2>
      </div>

      {/* New comment form */}
      {currentUser ? (
        <div className="flex gap-3">
          <Avatar
            src={currentUser.avatar}
            alt={currentUser.displayName}
            initials={userInitials}
            size="default"
          />
          <div className="flex-1 space-y-2">
            <Textarea
              value={newCommentContent}
              onChange={(e) => {
                setNewCommentContent(e.target.value)
                setError(null)
              }}
              placeholder="Share your thoughts..."
              className="min-h-20 resize-none"
            />
            <div className="flex items-center justify-between">
              <div className="text-xs text-gray-500">
                {newCommentContent.length}/2000
              </div>
              <Button
                variant="primary"
                onClick={handleSubmitComment}
                disabled={!newCommentContent.trim() || isSubmitting}
                className={cn(
                  'bg-violet-600 hover:bg-violet-700 text-white',
                  !newCommentContent.trim() && 'opacity-50 cursor-not-allowed'
                )}
              >
                {isSubmitting ? <Spinner className="mr-2 h-4 w-4" /> : null}
                Post Comment
              </Button>
            </div>
          </div>
        </div>
      ) : (
        <div className="p-4 bg-violet-50 border border-violet-200 rounded-lg text-center">
          <p className="text-sm text-gray-700 mb-2">
            Sign in to share your thoughts and participate in the discussion.
          </p>
          <Button
            variant="primary"
            onClick={() => router.push('/auth/login')}
          >
            Sign In to Comment
          </Button>
        </div>
      )}

      {/* Error message */}
      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      {/* Comments list */}
      {isLoading ? (
        <div className="flex justify-center py-8">
          <Spinner />
        </div>
      ) : comments.length === 0 ? (
        <div className="py-8 text-center">
          <p className="text-gray-500">No comments yet. Be the first to share!</p>
        </div>
      ) : (
        <div className="space-y-4">
          {comments.map((comment) => (
            <div key={comment.id} className="border-b border-gray-200 pb-4 last:border-b-0">
              <CommentItem
                comment={{
                  ...comment,
                  replies: expandedReplies.has(comment.id) ? comment.replies : undefined,
                }}
                currentUserId={currentUser?.id}
                campaignCreatorId={campaignCreatorId}
                onEdit={handleEditComment}
                onDelete={handleDeleteComment}
                onReply={(parentId) => {
                  // Handle reply through modal or inline
                  // For now, this would need additional UI
                }}
                onToggleReplies={handleToggleReplies}
                isLoadingReplies={loadingReplies.has(comment.id)}
                showReplies={expandedReplies.has(comment.id)}
              />
            </div>
          ))}

          {/* Load more button */}
          {hasMore && (
            <div className="pt-4 text-center">
              <Button
                variant="outline"
                onClick={() => fetchComments(page + 1)}
              >
                Load More Comments
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

// To integrate: import CommentsSection and add <CommentsSection campaignId={campaign.id} /> to the campaign detail page
