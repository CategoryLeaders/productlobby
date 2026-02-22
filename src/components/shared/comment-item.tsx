'use client'

import React, { useState } from 'react'
import { Avatar } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { formatRelativeTime } from '@/lib/utils'
import { cn } from '@/lib/utils'

export interface CommentUser {
  id: string
  displayName: string
  avatar?: string
  handle?: string
}

export interface CommentData {
  id: string
  content: string
  createdAt: Date | string
  updatedAt: Date | string
  user: CommentUser
  replyCount: number
  status: string
  replies?: CommentData[]
}

export interface CommentItemProps {
  comment: CommentData
  currentUserId?: string
  campaignCreatorId?: string
  isReply?: boolean
  onReply?: (parentId: string) => void
  onEdit?: (commentId: string, content: string) => void
  onDelete?: (commentId: string) => void
  onToggleReplies?: (commentId: string) => void
  isLoadingReplies?: boolean
  showReplies?: boolean
}

export const CommentItem = React.forwardRef<HTMLDivElement, CommentItemProps>(
  ({
    comment,
    currentUserId,
    campaignCreatorId,
    isReply = false,
    onReply,
    onEdit,
    onDelete,
    onToggleReplies,
    isLoadingReplies = false,
    showReplies = false,
    ...props
  }, ref) => {
    const [isEditing, setIsEditing] = useState(false)
    const [editedContent, setEditedContent] = useState(comment.content)
    const [isReplying, setIsReplying] = useState(false)
    const [replyContent, setReplyContent] = useState('')

    const isOwner = currentUserId === comment.user.id
    const canEdit = isOwner
    const canDelete = isOwner || currentUserId === campaignCreatorId

    const handleEdit = async () => {
      if (editedContent.trim() === comment.content) {
        setIsEditing(false)
        return
      }
      await onEdit?.(comment.id, editedContent)
      setIsEditing(false)
    }

    const handleReply = async () => {
      if (replyContent.trim()) {
        await onReply?.(comment.id)
        setReplyContent('')
        setIsReplying(false)
      }
    }

    const userInitials = comment.user.displayName
      .split(' ')
      .map(n => n.charAt(0))
      .join('')
      .slice(0, 2)

    const createdDate = new Date(comment.createdAt)
    const updatedDate = new Date(comment.updatedAt)
    const isEdited = createdDate.getTime() !== updatedDate.getTime()

    return (
      <div
        ref={ref}
        className={cn('flex gap-3', isReply && 'ml-6')}
        {...props}
      >
        <Avatar
          src={comment.user.avatar}
          alt={comment.user.displayName}
          initials={userInitials}
          size="sm"
        />

        <div className="flex-1 min-w-0">
          {/* Header */}
          <div className="flex items-center gap-2 mb-1">
            <span className="font-medium text-sm text-gray-900">
              {comment.user.displayName}
            </span>
            {comment.user.handle && (
              <span className="text-xs text-gray-500">
                @{comment.user.handle}
              </span>
            )}
            <span className="text-xs text-gray-500">
              {formatRelativeTime(comment.createdAt)}
            </span>
            {isEdited && (
              <span className="text-xs text-gray-400 italic">
                (edited)
              </span>
            )}
          </div>

          {/* Content */}
          {isEditing ? (
            <div className="space-y-2">
              <Textarea
                value={editedContent}
                onChange={(e) => setEditedContent(e.target.value)}
                placeholder="Edit your comment..."
                className="min-h-20"
              />
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="primary"
                  onClick={handleEdit}
                >
                  Save
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => {
                    setIsEditing(false)
                    setEditedContent(comment.content)
                  }}
                >
                  Cancel
                </Button>
              </div>
            </div>
          ) : (
            <p className="text-sm text-gray-700 whitespace-pre-wrap break-words">
              {comment.content}
            </p>
          )}

          {/* Actions */}
          <div className="flex gap-3 mt-2">
            {!isReply && (
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setIsReplying(!isReplying)}
              >
                Reply
              </Button>
            )}
            {canEdit && !isEditing && (
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setIsEditing(true)}
              >
                Edit
              </Button>
            )}
            {canDelete && !isEditing && (
              <Button
                size="sm"
                variant="ghost"
                className="text-red-600 hover:text-red-700"
                onClick={() => onDelete?.(comment.id)}
              >
                Delete
              </Button>
            )}

            {/* Reply count for top-level comments */}
            {!isReply && comment.replyCount > 0 && (
              <Button
                size="sm"
                variant="ghost"
                onClick={() => onToggleReplies?.(comment.id)}
              >
                {isLoadingReplies ? 'Loading...' : `${comment.replyCount} ${comment.replyCount === 1 ? 'reply' : 'replies'}`}
              </Button>
            )}
          </div>

          {/* Reply input */}
          {isReplying && (
            <div className="mt-3 space-y-2">
              <Textarea
                value={replyContent}
                onChange={(e) => setReplyContent(e.target.value)}
                placeholder="Write a reply..."
                className="min-h-20"
              />
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="primary"
                  onClick={handleReply}
                  disabled={!replyContent.trim()}
                >
                  Reply
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => {
                    setIsReplying(false)
                    setReplyContent('')
                  }}
                >
                  Cancel
                </Button>
              </div>
            </div>
          )}

          {/* Nested replies */}
          {!isReply && showReplies && comment.replies && comment.replies.length > 0 && (
            <div className="mt-4 space-y-3 border-l-2 border-gray-200 pl-3">
              {comment.replies.map((reply) => (
                <CommentItem
                  key={reply.id}
                  comment={reply}
                  currentUserId={currentUserId}
                  campaignCreatorId={campaignCreatorId}
                  isReply={true}
                  onEdit={onEdit}
                  onDelete={onDelete}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    )
  }
)

CommentItem.displayName = 'CommentItem'
