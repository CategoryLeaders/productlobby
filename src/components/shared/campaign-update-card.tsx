'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { cn } from '@/lib/utils'
import {
  ThumbsUp,
  Heart,
  Smile,
  MessageCircle,
  Share2,
  MoreVertical,
} from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'

export type UpdateType =
  | 'ANNOUNCEMENT'
  | 'PROGRESS_UPDATE'
  | 'LAUNCH_DATE'
  | 'PROTOTYPE'
  | 'BEHIND_SCENES'
  | 'THANK_YOU'

interface UpdateImage {
  id: string
  url: string
  altText?: string
}

export interface CampaignUpdateCardProps {
  id: string
  campaignId: string
  brandName: string
  brandLogo?: string
  brandVerified?: boolean
  title: string
  content: string
  updateType: UpdateType
  images?: UpdateImage[]
  createdAt: Date
  likeCount?: number
  commentCount?: number
  userReaction?: 'thumbsUp' | 'heart' | 'celebrate'
  onReact?: (reaction: 'thumbsUp' | 'heart' | 'celebrate') => Promise<void>
  onShare?: () => Promise<void>
  className?: string
}

const UPDATE_TYPE_CONFIG: Record<
  UpdateType,
  { label: string; color: string; bgColor: string }
> = {
  ANNOUNCEMENT: {
    label: 'Announcement',
    color: 'text-violet-700',
    bgColor: 'bg-violet-100',
  },
  PROGRESS_UPDATE: {
    label: 'Progress Update',
    color: 'text-lime-700',
    bgColor: 'bg-lime-100',
  },
  LAUNCH_DATE: {
    label: 'Launch Date',
    color: 'text-blue-700',
    bgColor: 'bg-blue-100',
  },
  PROTOTYPE: {
    label: 'Prototype',
    color: 'text-orange-700',
    bgColor: 'bg-orange-100',
  },
  BEHIND_SCENES: {
    label: 'Behind the Scenes',
    color: 'text-pink-700',
    bgColor: 'bg-pink-100',
  },
  THANK_YOU: {
    label: 'Thank You',
    color: 'text-rose-700',
    bgColor: 'bg-rose-100',
  },
}

export const CampaignUpdateCard = React.forwardRef<
  HTMLDivElement,
  CampaignUpdateCardProps
>(
  (
    {
      id,
      campaignId,
      brandName,
      brandLogo,
      brandVerified = false,
      title,
      content,
      updateType,
      images = [],
      createdAt,
      likeCount = 0,
      commentCount = 0,
      userReaction,
      onReact,
      onShare,
      className,
    },
    ref
  ) => {
    const [loading, setLoading] = useState(false)
    const [currentReaction, setCurrentReaction] = useState(userReaction)
    const typeConfig = UPDATE_TYPE_CONFIG[updateType]

    const handleReact = async (
      reaction: 'thumbsUp' | 'heart' | 'celebrate'
    ) => {
      if (!onReact || loading) return

      try {
        setLoading(true)
        if (currentReaction === reaction) {
          setCurrentReaction(undefined)
        } else {
          setCurrentReaction(reaction)
        }
        await onReact(reaction)
      } finally {
        setLoading(false)
      }
    }

    const handleShare = async () => {
      if (!onShare || loading) return

      try {
        setLoading(true)
        await onShare()
      } finally {
        setLoading(false)
      }
    }

    return (
      <div
        ref={ref}
        className={cn(
          'bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow duration-200',
          className
        )}
      >
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            {brandLogo && (
              <div className="relative w-10 h-10 flex-shrink-0 rounded-full bg-gray-100 overflow-hidden">
                <Image
                  src={brandLogo}
                  alt={brandName}
                  fill
                  className="object-cover"
                />
              </div>
            )}
            <div>
              <div className="flex items-center gap-2">
                <p className="font-semibold text-foreground text-sm">
                  {brandName}
                </p>
                {brandVerified && (
                  <span
                    className="inline-flex items-center justify-center w-4 h-4 bg-violet-600 rounded-full text-white text-xs"
                    title="Verified Brand"
                  >
                    ✓
                  </span>
                )}
              </div>
              <p className="text-xs text-gray-500">
                {formatDistanceToNow(new Date(createdAt), { addSuffix: true })}
              </p>
            </div>
          </div>

          <button
            className="p-1.5 text-gray-400 hover:bg-gray-100 rounded-lg transition-colors duration-200"
            aria-label="More options"
          >
            <MoreVertical className="w-5 h-5" />
          </button>
        </div>

        <div className="mb-4">
          <div className="flex items-center gap-2 mb-2">
            <span
              className={cn(
                'inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold',
                typeConfig.bgColor,
                typeConfig.color
              )}
            >
              {typeConfig.label}
            </span>
          </div>
          <h3 className="text-lg font-semibold text-foreground mb-2">
            {title}
          </h3>
          <p className="text-gray-700 text-sm leading-relaxed whitespace-pre-wrap">
            {content}
          </p>
        </div>

        {images.length > 0 && (
          <div
            className={cn('mb-4', {
              'grid grid-cols-2 gap-3': images.length === 2,
              'grid grid-cols-3 gap-3': images.length === 3,
              'grid gap-3': images.length > 3,
            })}
          >
            {images.slice(0, 4).map((image) => (
              <div
                key={image.id}
                className="relative w-full aspect-video rounded-lg overflow-hidden bg-gray-100"
              >
                <Image
                  src={image.url}
                  alt={image.altText || 'Update image'}
                  fill
                  className="object-cover"
                />
              </div>
            ))}
            {images.length > 4 && (
              <div className="relative w-full aspect-video rounded-lg overflow-hidden bg-gray-200 flex items-center justify-center">
                <span className="text-gray-600 font-semibold">
                  +{images.length - 4} more
                </span>
              </div>
            )}
          </div>
        )}

        <div className="flex items-center gap-4 pt-4 border-t border-gray-100">
          <button
            onClick={() => handleReact('thumbsUp')}
            disabled={loading}
            className={cn(
              'flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors duration-200',
              currentReaction === 'thumbsUp'
                ? 'bg-violet-100 text-violet-700 hover:bg-violet-200'
                : 'text-gray-600 hover:bg-gray-100'
            )}
          >
            <ThumbsUp className="w-4 h-4" />
            {likeCount > 0 && <span>{likeCount}</span>}
          </button>

          <button
            onClick={() => handleReact('heart')}
            disabled={loading}
            className={cn(
              'flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors duration-200',
              currentReaction === 'heart'
                ? 'bg-red-100 text-red-700 hover:bg-red-200'
                : 'text-gray-600 hover:bg-gray-100'
            )}
          >
            <Heart className="w-4 h-4" />
          </button>

          <button
            onClick={() => handleReact('celebrate')}
            disabled={loading}
            className={cn(
              'flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors duration-200',
              currentReaction === 'celebrate'
                ? 'bg-lime-100 text-lime-700 hover:bg-lime-200'
                : 'text-gray-600 hover:bg-gray-100'
            )}
          >
            <Smile className="w-4 h-4" />
          </button>

          <Link
            href={`/campaigns/${campaignId}/updates#comments-${id}`}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-100 transition-colors duration-200 ml-auto"
          >
            <MessageCircle className="w-4 h-4" />
            {commentCount > 0 && <span>{commentCount}</span>}
          </Link>

          <button
            onClick={handleShare}
            disabled={loading}
            className="p-1.5 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors duration-200"
            title="Share update"
          >
            <Share2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    )
  }
)

CampaignUpdateCard.displayName = 'CampaignUpdateCard'
