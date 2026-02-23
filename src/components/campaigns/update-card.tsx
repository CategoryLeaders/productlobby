'use client'

import React, { useState } from 'react'
import { Avatar } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Heart, MessageCircle, Trash2, MoreVertical } from 'lucide-react'
import { cn } from '@/lib/utils'

interface UpdateCardProps {
  update: {
    id: string
    title: string
    content: string
    createdAt: string
    isPinned: boolean
    creator: {
      id: string
      displayName: string
      avatar?: string
      handle?: string
    }
    media: Array<{
      id: string
      url: string
      altText?: string
    }>
    reactions: Array<{
      id: string
      userId: string
      type: string
    }>
    comments: Array<{
      id: string
      content: string
      createdAt: string
      user: {
        id: string
        displayName: string
        avatar?: string
      }
    }>
    _count?: {
      comments: number
    }
  }
  campaignId: string
  isCreator: boolean
  onDelete: (updateId: string) => void
  getRelativeTime: (dateString: string) => string
}

export const UpdateCard: React.FC<UpdateCardProps> = ({
  update,
  campaignId,
  isCreator,
  onDelete,
  getRelativeTime,
}) => {
  const [showMenu, setShowMenu] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  const handleDelete = async () => {
    setIsDeleting(true)
    await onDelete(update.id)
    setIsDeleting(false)
    setShowMenu(false)
  }

  const commentCount = update._count?.comments || update.comments.length || 0
  const reactionCount = update.reactions.length

  return (
    <article className="bg-white border border-gray-200 rounded-lg overflow-hidden hover:border-gray-300 transition-colors">
      {/* Header */}
      <div className="flex items-start justify-between p-6 pb-4">
        <div className="flex items-start gap-4 flex-1">
          <Avatar className="w-10 h-10 flex-shrink-0">
            {update.creator.avatar ? (
              <img
                src={update.creator.avatar}
                alt={update.creator.displayName}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-violet-400 to-violet-600 flex items-center justify-center text-white text-sm font-semibold">
                {update.creator.displayName.charAt(0).toUpperCase()}
              </div>
            )}
          </Avatar>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h3 className="font-semibold text-gray-900">
                {update.creator.displayName}
              </h3>
              {update.creator.handle && (
                <span className="text-sm text-gray-500">
                  @{update.creator.handle}
                </span>
              )}
              {update.isPinned && (
                <span className="px-2 py-1 text-xs font-medium bg-amber-100 text-amber-800 rounded">
                  Pinned
                </span>
              )}
            </div>
            <p className="text-sm text-gray-500">
              {getRelativeTime(update.createdAt)}
            </p>
          </div>
        </div>

        {isCreator && (
          <div className="relative">
            <button
              onClick={() => setShowMenu(!showMenu)}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <MoreVertical className="w-4 h-4 text-gray-500" />
            </button>

            {showMenu && (
              <div className="absolute right-0 top-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-10 min-w-48">
                <button
                  onClick={handleDelete}
                  disabled={isDeleting}
                  className="w-full px-4 py-2 text-left text-red-600 hover:bg-red-50 flex items-center gap-2 transition-colors disabled:opacity-50"
                >
                  <Trash2 className="w-4 h-4" />
                  Delete Update
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Title */}
      <div className="px-6 pb-3">
        <h2 className="text-lg font-semibold text-gray-900">{update.title}</h2>
      </div>

      {/* Content */}
      <div className="px-6 pb-4">
        <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
          {update.content}
        </p>
      </div>

      {/* Media */}
      {update.media && update.media.length > 0 && (
        <div className="px-6 pb-4">
          <div className="grid grid-cols-1 gap-3">
            {update.media.map((media) => (
              <img
                key={media.id}
                src={media.url}
                alt={media.altText || 'Update media'}
                className="max-w-full h-auto rounded-lg border border-gray-200"
              />
            ))}
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="px-6 py-4 border-t border-gray-100 flex items-center gap-6 text-sm text-gray-500">
        <button className="flex items-center gap-2 hover:text-red-500 transition-colors">
          <Heart className="w-4 h-4" />
          <span>{reactionCount}</span>
        </button>

        <button className="flex items-center gap-2 hover:text-blue-500 transition-colors">
          <MessageCircle className="w-4 h-4" />
          <span>{commentCount}</span>
        </button>
      </div>

      {/* Recent Comments Preview */}
      {update.comments && update.comments.length > 0 && (
        <div className="px-6 pb-4 border-t border-gray-100 space-y-3">
          {update.comments.slice(0, 2).map((comment) => (
            <div key={comment.id} className="flex gap-3">
              <Avatar className="w-8 h-8 flex-shrink-0">
                {comment.user.avatar ? (
                  <img
                    src={comment.user.avatar}
                    alt={comment.user.displayName}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-gray-200 flex items-center justify-center text-gray-700 text-xs font-semibold">
                    {comment.user.displayName.charAt(0).toUpperCase()}
                  </div>
                )}
              </Avatar>

              <div className="flex-1 min-w-0">
                <p className="text-sm">
                  <span className="font-semibold text-gray-900">
                    {comment.user.displayName}
                  </span>{' '}
                  <span className="text-gray-700">{comment.content}</span>
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  {getRelativeTime(comment.createdAt)}
                </p>
              </div>
            </div>
          ))}

          {commentCount > 2 && (
            <button className="text-sm text-violet-600 hover:text-violet-700 font-medium">
              View all {commentCount} comments
            </button>
          )}
        </div>
      )}
    </article>
  )
}

export default UpdateCard
