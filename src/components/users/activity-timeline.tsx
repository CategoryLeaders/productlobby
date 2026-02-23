'use client'

import { ReactNode } from 'react'
import Link from 'next/link'
import { Rocket, Gift, MessageCircle, UserPlus, ChevronRight } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { formatDistanceToNow } from 'date-fns'

export interface ActivityItem {
  id: string
  type: 'campaign_created' | 'lobby_given' | 'commented' | 'followed'
  campaignId: string
  campaignTitle: string
  campaignSlug: string
  timestamp: Date
  metadata?: Record<string, string>
}

interface ActivityTimelineProps {
  activities: ActivityItem[]
}

function getActivityIcon(type: ActivityItem['type']): ReactNode {
  const iconProps = 'w-5 h-5'
  const colorClass = 'text-violet-600'

  switch (type) {
    case 'campaign_created':
      return <Rocket className={`${iconProps} ${colorClass}`} />
    case 'lobby_given':
      return <Gift className={`${iconProps} text-lime-600`} />
    case 'commented':
      return <MessageCircle className={`${iconProps} ${colorClass}`} />
    case 'followed':
      return <UserPlus className={`${iconProps} text-lime-600`} />
    default:
      return null
  }
}

function getActivityLabel(type: ActivityItem['type']): string {
  switch (type) {
    case 'campaign_created':
      return 'Created campaign'
    case 'lobby_given':
      return 'Gave lobby support'
    case 'commented':
      return 'Left a comment'
    case 'followed':
      return 'Followed campaign'
    default:
      return 'Activity'
  }
}

function ActivityCard({ activity }: { activity: ActivityItem }) {
  const timeLabel = formatDistanceToNow(new Date(activity.timestamp), {
    addSuffix: true,
  })

  return (
    <Link href={`/campaigns/${activity.campaignSlug}`}>
      <Card
        variant="interactive"
        className="hover:border-violet-300 transition-colors"
      >
        <CardContent className="flex items-start gap-4 p-4">
          {/* Icon */}
          <div className="flex-shrink-0 mt-1">
            {getActivityIcon(activity.type)}
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <p className="font-medium text-gray-900 text-sm">
              {getActivityLabel(activity.type)}
            </p>
            <p className="text-sm text-gray-600 truncate mt-1">
              {activity.campaignTitle}
            </p>
            <p className="text-xs text-gray-500 mt-2">{timeLabel}</p>
          </div>

          {/* Arrow */}
          <div className="flex-shrink-0 text-gray-400 group-hover:text-violet-600 transition-colors">
            <ChevronRight className="w-5 h-5" />
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}

export function ActivityTimeline({ activities }: ActivityTimelineProps) {
  if (!activities || activities.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <p>No activity yet</p>
      </div>
    )
  }

  // Show max 10 items
  const displayedActivities = activities.slice(0, 10)
  const hasMore = activities.length > 10

  return (
    <div className="space-y-3">
      {displayedActivities.map((activity) => (
        <ActivityCard key={activity.id} activity={activity} />
      ))}

      {/* See more link */}
      {hasMore && (
        <div className="text-center pt-4">
          <Link
            href="#"
            className="text-violet-600 hover:text-violet-700 text-sm font-medium inline-flex items-center gap-1 transition-colors"
          >
            See more activity
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>
      )}
    </div>
  )
}
