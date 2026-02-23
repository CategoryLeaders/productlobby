'use client'

import React from 'react'
import Link from 'next/link'
import { Avatar } from '@/components/ui/avatar'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { cn, formatRelativeTime } from '@/lib/utils'
import {
  Megaphone,
  Heart,
  MessageSquare,
  Users,
} from 'lucide-react'

interface FeedItemProps {
  type: 'campaign_created' | 'lobby' | 'comment'
  user: {
    id: string
    displayName: string
    handle: string | null
    avatar: string | null
  }
  campaign: {
    id: string
    title: string
    slug: string
    lobbyCount: number
  }
  data: {
    id: string
    title?: string
    content?: string
    status?: string
    category?: string
  }
  createdAt: string | Date
}

const getActionText = (type: string): string => {
  switch (type) {
    case 'campaign_created':
      return 'created a campaign'
    case 'lobby':
      return 'lobbied for'
    case 'comment':
      return 'commented on'
    default:
      return 'interacted with'
  }
}

const getActionIcon = (type: string) => {
  switch (type) {
    case 'campaign_created':
      return Megaphone
    case 'lobby':
      return Heart
    case 'comment':
      return MessageSquare
    default:
      return MessageSquare
  }
}

const getActionColor = (type: string): string => {
  switch (type) {
    case 'campaign_created':
      return 'text-violet-600'
    case 'lobby':
      return 'text-lime-600'
    case 'comment':
      return 'text-blue-600'
    default:
      return 'text-gray-600'
  }
}

const getCreatorInitials = (displayName: string, email?: string): string => {
  if (displayName) {
    return displayName
      .split(' ')
      .map((n) => n.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }
  return 'U'
}

export const FeedItem: React.FC<FeedItemProps> = ({
  type,
  user,
  campaign,
  data,
  createdAt,
}) => {
  const ActionIcon = getActionIcon(type)
  const actionColor = getActionColor(type)
  const actionText = getActionText(type)
  const initials = getCreatorInitials(user.displayName)
  const formattedTime = formatRelativeTime(createdAt)

  return (
    <Link href={`/campaigns/${campaign.slug}`}>
      <Card className="hover:shadow-card-hover transition-all cursor-pointer h-full">
        <CardContent className="py-4 px-5">
          {/* Header with user info */}
          <div className="flex items-start gap-3 mb-3">
            <Avatar
              src={user.avatar || undefined}
              initials={initials}
              size="sm"
              alt={user.displayName}
            />
            <div className="flex-1 min-w-0">
              <div className="flex items-baseline gap-2">
                <span className="font-semibold text-sm text-foreground truncate">
                  {user.displayName}
                </span>
                {user.handle && (
                  <span className="text-xs text-gray-500 truncate">
                    @{user.handle}
                  </span>
                )}
              </div>
              <p className="text-xs text-gray-500">{formattedTime}</p>
            </div>
          </div>

          {/* Action row */}
          <div className="flex items-center gap-2 mb-3 ml-11">
            <ActionIcon className={cn('w-4 h-4', actionColor)} />
            <span className="text-sm text-gray-700">{actionText}</span>
          </div>

          {/* Campaign card preview */}
          <div className="ml-11 p-3 bg-gray-50 rounded-lg border border-gray-200 hover:bg-gray-100 transition-colors">
            <h4 className="font-semibold text-sm line-clamp-2 mb-2 text-foreground">
              {campaign.title}
            </h4>

            {/* Campaign stats */}
            <div className="flex items-center gap-2 text-xs">
              <div className="flex items-center gap-1 text-gray-600">
                <Users className="w-3 h-3" />
                <span>{campaign.lobbyCount}</span>
              </div>
            </div>
          </div>

          {/* Comment preview (if applicable) */}
          {type === 'comment' && data.content && (
            <div className="ml-11 mt-3 p-3 bg-blue-50 rounded-lg border border-blue-100 text-xs text-gray-700 line-clamp-2">
              "{data.content}"
            </div>
          )}
        </CardContent>
      </Card>
    </Link>
  )
}

FeedItem.displayName = 'FeedItem'
