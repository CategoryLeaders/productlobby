'use client'

import { useState } from 'react'
import Link from 'next/link'
import { DashboardLayout, PageHeader } from '@/components/shared'
import { Card, CardContent, Badge, Button, Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui'
import {
  CheckCircle,
  MessageSquare,
  TrendingUp,
  Gift,
  Star,
  Bell,
  Zap,
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface Notification {
  id: string
  type: 'campaign_update' | 'brand_response' | 'milestone' | 'referral' | 'lobby'
  title: string
  message: string
  timestamp: string
  isRead: boolean
  link?: string
}

const getNotificationIcon = (type: string) => {
  switch (type) {
    case 'brand_response':
      return { icon: CheckCircle, color: 'text-green-600', bg: 'bg-green-50' }
    case 'campaign_update':
      return { icon: MessageSquare, color: 'text-violet-600', bg: 'bg-violet-50' }
    case 'milestone':
      return { icon: TrendingUp, color: 'text-lime-600', bg: 'bg-lime-50' }
    case 'referral':
      return { icon: Zap, color: 'text-yellow-600', bg: 'bg-yellow-50' }
    case 'lobby':
      return { icon: Star, color: 'text-blue-600', bg: 'bg-blue-50' }
    default:
      return { icon: Bell, color: 'text-gray-600', bg: 'bg-gray-50' }
  }
}

const formatTime = (timestamp: string) => {
  const date = new Date(timestamp)
  const now = new Date()
  const diff = now.getTime() - date.getTime()
  const hours = Math.floor(diff / (1000 * 60 * 60))
  const days = Math.floor(diff / (1000 * 60 * 60 * 24))

  if (hours < 1) return 'Just now'
  if (hours < 24) return `${hours}h ago`
  if (days < 7) return `${days}d ago`
  if (days < 30) {
    const weeks = Math.floor(days / 7)
    return `${weeks}w ago`
  }

  return date.toLocaleDateString()
}

const DEMO_NOTIFICATIONS: Notification[] = [
  {
    id: '1',
    type: 'brand_response',
    title: 'Nike responded to a campaign you lobbied for!',
    message: 'The Nike Extended Sizes campaign received an official response from the brand.',
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    isRead: false,
    link: '/campaigns/nike-extended',
  },
  {
    id: '2',
    type: 'milestone',
    title: 'Campaign milestone reached!',
    message: 'Campaign "Extended Sizes" hit 2,500 lobbies. Great momentum!',
    timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    isRead: false,
    link: '/campaigns/nike-extended',
  },
  {
    id: '3',
    type: 'campaign_update',
    title: 'Sarah posted an update on Extended Sizes',
    message: 'The campaign creator shared a new update about progress with Nike.',
    timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    isRead: true,
    link: '/campaigns/nike-extended',
  },
  {
    id: '4',
    type: 'referral',
    title: 'Your referral link was used!',
    message: '+10 contribution points awarded. Keep sharing to earn more!',
    timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    isRead: true,
    link: '/score',
  },
  {
    id: '5',
    type: 'lobby',
    title: 'You were marked as a Hero on a campaign',
    message: 'Your engagement on "Sustainable Coffee Pods" earned you hero status. Congratulations!',
    timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    isRead: true,
    link: '/campaigns/sustainable-coffee',
  },
  {
    id: '6',
    type: 'brand_response',
    title: 'Apple viewed your contribution',
    message: 'Apple brand team checked out your comment on the AirPods case campaign.',
    timestamp: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    isRead: true,
    link: '/campaigns/apple-airpods',
  },
  {
    id: '7',
    type: 'campaign_update',
    title: 'New milestone: 1,000 lobbies!',
    message: 'The "Dog Walking GPS Tracker" campaign reached 1,000 supporters.',
    timestamp: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString(),
    isRead: true,
    link: '/campaigns/dog-tracker',
  },
  {
    id: '8',
    type: 'milestone',
    title: 'Your contribution score increased',
    message: 'You earned 25 points from your recent campaign engagement.',
    timestamp: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    isRead: true,
    link: '/score',
  },
  {
    id: '9',
    type: 'referral',
    title: '5 new sign-ups from your link',
    message: '+50 contribution points awarded for bringing in quality users.',
    timestamp: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString(),
    isRead: true,
    link: '/score',
  },
  {
    id: '10',
    type: 'campaign_update',
    title: 'Campaign shipped: Sustainable Coffee Pods',
    message: 'Great news! The product you lobbied for is now available for purchase.',
    timestamp: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
    isRead: true,
    link: '/campaigns/sustainable-coffee',
  },
]

function NotificationItem({ notification }: { notification: Notification }) {
  const { icon: IconComponent, color, bg } = getNotificationIcon(notification.type)

  return (
    <Link href={notification.link || '#'}>
      <Card className="hover:shadow-card-hover transition-all cursor-pointer">
        <CardContent className="py-4 px-6">
          <div className="flex items-start gap-4">
            <div className={cn('p-3 rounded-lg flex-shrink-0', bg)}>
              <IconComponent className={cn('w-5 h-5', color)} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h4 className="font-semibold text-foreground text-sm">{notification.title}</h4>
                  <p className="text-sm text-gray-600 mt-1">{notification.message}</p>
                  <p className="text-xs text-gray-500 mt-2">{formatTime(notification.timestamp)}</p>
                </div>
                {!notification.isRead && (
                  <div className="w-2 h-2 rounded-full bg-violet-500 flex-shrink-0 mt-2" />
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}

export default function NotificationsPage() {
  const [activeTab, setActiveTab] = useState('all')

  const filteredNotifications = DEMO_NOTIFICATIONS.filter(notif => {
    switch (activeTab) {
      case 'unread':
        return !notif.isRead
      case 'campaign_updates':
        return notif.type === 'campaign_update'
      case 'brand_responses':
        return notif.type === 'brand_response'
      case 'milestones':
        return notif.type === 'milestone'
      default:
        return true
    }
  })

  const unreadCount = DEMO_NOTIFICATIONS.filter(n => !n.isRead).length

  return (
    <DashboardLayout role="supporter">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold font-display text-foreground">Notifications</h1>
            {unreadCount > 0 && (
              <p className="text-gray-600 mt-1">You have {unreadCount} unread notification{unreadCount !== 1 ? 's' : ''}</p>
            )}
          </div>
          {unreadCount > 0 && (
            <Button variant="secondary" size="sm">
              Mark all read
            </Button>
          )}
        </div>

        {/* Filter Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="unread">
              Unread
              {unreadCount > 0 && (
                <Badge variant="default" size="sm" className="ml-2">
                  {unreadCount}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="campaign_updates">Campaign Updates</TabsTrigger>
            <TabsTrigger value="brand_responses">Brand Responses</TabsTrigger>
            <TabsTrigger value="milestones">Milestones</TabsTrigger>
          </TabsList>

          <TabsContent value={activeTab} className="mt-6 space-y-3">
            {filteredNotifications.length > 0 ? (
              filteredNotifications.map(notification => (
                <NotificationItem
                  key={notification.id}
                  notification={notification}
                />
              ))
            ) : (
              <Card>
                <CardContent className="py-12 text-center">
                  <Bell className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-600">No notifications in this category</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  )
}
