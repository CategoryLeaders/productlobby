'use client'

import { useEffect, useState, useCallback } from 'react'
import Link from 'next/link'
import { DashboardLayout } from '@/components/shared'
import { cn } from '@/lib/utils'
import {
  Bell,
  Megaphone,
  BarChart3,
  MessageCircle,
  Heart,
  Building2,
  HelpCircle,
  UserPlus,
  Check,
  CheckCheck,
  ChevronLeft,
} from 'lucide-react'

interface Notification {
  id: string
  type: string
  title: string
  message: string
  linkUrl?: string | null
  read: boolean
  createdAt: string
}

const notificationIcons: Record<string, React.ReactNode> = {
  campaign_update: <Megaphone className="w-5 h-5" />,
  poll: <BarChart3 className="w-5 h-5" />,
  comment: <MessageCircle className="w-5 h-5" />,
  milestone: <Heart className="w-5 h-5" />,
  brand_response: <Building2 className="w-5 h-5" />,
  new_lobby: <Heart className="w-5 h-5" />,
  new_comment: <MessageCircle className="w-5 h-5" />,
  question_answered: <HelpCircle className="w-5 h-5" />,
  new_follower: <UserPlus className="w-5 h-5" />,
  general: <Bell className="w-5 h-5" />,
}

function formatTimeAgo(dateString: string): string {
  const date = new Date(dateString)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMs / 3600000)
  const diffDays = Math.floor(diffMs / 86400000)

  if (diffMins < 1) return 'just now'
  if (diffMins < 60) return `${diffMins}m ago`
  if (diffHours < 24) return `${diffHours}h ago`
  if (diffDays < 7) return `${diffDays}d ago`

  return date.toLocaleDateString()
}

function getDateGroupLabel(dateString: string): string {
  const date = new Date(dateString)
  const now = new Date()
  
  // Check if today
  if (
    date.toDateString() === now.toDateString()
  ) {
    return 'Today'
  }

  // Check if yesterday
  const yesterday = new Date(now.getTime() - 86400000)
  if (
    date.toDateString() === yesterday.toDateString()
  ) {
    return 'Yesterday'
  }

  return 'Earlier'
}

function groupNotificationsByDate(
  notifications: Notification[]
): Record<string, Notification[]> {
  const grouped: Record<string, Notification[]> = {
    Today: [],
    Yesterday: [],
    Earlier: [],
  }

  notifications.forEach((notification) => {
    const group = getDateGroupLabel(notification.createdAt)
    if (group in grouped) {
      grouped[group].push(notification)
    }
  })

  return grouped
}

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'unread'>('all')
  const [unreadCount, setUnreadCount] = useState(0)

  // Fetch all notifications with pagination
  const fetchNotifications = useCallback(async () => {
    try {
      setLoading(true)
      const response = await fetch(
        `/api/user/notifications?page=1&limit=50&filter=${filter}`,
        { credentials: 'include' }
      )

      if (response.ok) {
        const data = await response.json()
        setNotifications(data.notifications || [])
        setUnreadCount(data.unreadCount || 0)
      }
    } catch (error) {
      console.error('Failed to fetch notifications:', error)
    } finally {
      setLoading(false)
    }
  }, [filter])

  // Initial load
  useEffect(() => {
    fetchNotifications()
  }, [fetchNotifications])

  // Mark notification as read
  const handleMarkAsRead = async (notificationId: string) => {
    try {
      const response = await fetch(
        `/api/user/notifications/${notificationId}`,
        {
          method: 'PATCH',
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ read: true }),
        }
      )

      if (response.ok) {
        setNotifications((prev) =>
          prev.map((n) =>
            n.id === notificationId ? { ...n, read: true } : n
          )
        )
        setUnreadCount((prev) => Math.max(0, prev - 1))
      }
    } catch (error) {
      console.error('Failed to mark as read:', error)
    }
  }

  // Mark all as read
  const handleMarkAllAsRead = async () => {
    try {
      const response = await fetch(
        '/api/user/notifications/mark-all-read',
        {
          method: 'POST',
          credentials: 'include',
        }
      )

      if (response.ok) {
        setNotifications((prev) =>
          prev.map((n) => ({ ...n, read: true }))
        )
        setUnreadCount(0)
      }
    } catch (error) {
      console.error('Failed to mark all as read:', error)
    }
  }

  // Filter notifications
  const filteredNotifications =
    filter === 'unread'
      ? notifications.filter((n) => !n.read)
      : notifications

  // Group by date
  const groupedNotifications = groupNotificationsByDate(filteredNotifications)

  return (
    <DashboardLayout role="supporter">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="text-gray-600 hover:text-gray-900 transition-colors"
            >
              <ChevronLeft className="w-5 h-5" />
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Notifications
              </h1>
              <p className="text-sm text-gray-600">
                {unreadCount > 0
                  ? `${unreadCount} unread notification${unreadCount !== 1 ? 's' : ''}`
                  : 'All caught up!'}
              </p>
            </div>
          </div>

          {/* Mark all as read button */}
          {unreadCount > 0 && (
            <button
              onClick={handleMarkAllAsRead}
              className={cn(
                'inline-flex items-center gap-2 px-4 py-2 rounded-lg font-medium',
                'transition-colors duration-200',
                'text-violet-600 hover:bg-violet-50 active:bg-violet-100'
              )}
            >
              <CheckCheck className="w-4 h-4" />
              Mark all as read
            </button>
          )}
        </div>

        {/* Filter tabs */}
        <div className="flex gap-2 border-b border-gray-200">
          <button
            onClick={() => setFilter('all')}
            className={cn(
              'px-4 py-3 font-medium text-sm transition-colors duration-200',
              'border-b-2',
              filter === 'all'
                ? 'text-violet-600 border-violet-600'
                : 'text-gray-600 border-transparent hover:text-gray-900'
            )}
          >
            All
          </button>
          <button
            onClick={() => setFilter('unread')}
            className={cn(
              'px-4 py-3 font-medium text-sm transition-colors duration-200',
              'border-b-2',
              filter === 'unread'
                ? 'text-violet-600 border-violet-600'
                : 'text-gray-600 border-transparent hover:text-gray-900'
            )}
          >
            Unread {unreadCount > 0 && `(${unreadCount})`}
          </button>
        </div>

        {/* Notifications list */}
        {loading ? (
          <div className="py-12 text-center">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-gray-100 mb-4">
              <Bell className="w-6 h-6 text-gray-400 animate-pulse" />
            </div>
            <p className="text-gray-600">Loading notifications...</p>
          </div>
        ) : filteredNotifications.length === 0 ? (
          <div className="py-12 text-center">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-gray-100 mb-4">
              <Bell className="w-6 h-6 text-gray-400" />
            </div>
            <p className="text-gray-600">
              {filter === 'unread'
                ? 'No unread notifications'
                : 'No notifications yet'}
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {Object.entries(groupedNotifications).map(([group, items]) =>
              items.length > 0 ? (
                <div key={group}>
                  {/* Date group header */}
                  <h3 className="text-sm font-semibold text-gray-600 mb-3 px-4">
                    {group}
                  </h3>

                  {/* Notifications in this group */}
                  <div className="space-y-2">
                    {items.map((notification) => (
                      <div
                        key={notification.id}
                        className={cn(
                          'px-4 py-4 rounded-lg transition-colors duration-200 border',
                          !notification.read
                            ? 'bg-blue-50 border-blue-100 hover:bg-blue-100'
                            : 'bg-white border-gray-200 hover:bg-gray-50'
                        )}
                      >
                        <div className="flex gap-4">
                          {/* Icon */}
                          <div
                            className={cn(
                              'flex-shrink-0 w-10 h-10 rounded-lg flex items-center justify-center',
                              !notification.read
                                ? 'bg-blue-100 text-violet-600'
                                : 'bg-gray-100 text-gray-600'
                            )}
                          >
                            {notificationIcons[notification.type] ||
                              notificationIcons.general}
                          </div>

                          {/* Content */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-3">
                              <div>
                                <p
                                  className={cn(
                                    'text-sm line-clamp-2',
                                    !notification.read
                                      ? 'font-semibold text-gray-900'
                                      : 'font-medium text-gray-800'
                                  )}
                                >
                                  {notification.title}
                                </p>
                                <p className="text-xs text-gray-600 line-clamp-2 mt-1">
                                  {notification.message}
                                </p>
                                <p className="text-xs text-gray-400 mt-2">
                                  {formatTimeAgo(notification.createdAt)}
                                </p>
                              </div>

                              {/* Status indicator */}
                              {!notification.read && (
                                <div className="flex-shrink-0 w-2 h-2 rounded-full bg-violet-600 mt-1" />
                              )}
                            </div>

                            {/* Action buttons */}
                            <div className="flex items-center gap-3 mt-3">
                              {!notification.read && (
                                <button
                                  onClick={() => handleMarkAsRead(notification.id)}
                                  className={cn(
                                    'inline-flex items-center gap-1 px-3 py-1.5 rounded text-xs font-medium',
                                    'transition-colors duration-200',
                                    'text-violet-600 hover:bg-violet-100'
                                  )}
                                >
                                  <Check className="w-3 h-3" />
                                  Mark as read
                                </button>
                              )}

                              {notification.linkUrl && (
                                <Link
                                  href={notification.linkUrl}
                                  className={cn(
                                    'inline-flex items-center text-xs font-medium',
                                    'text-violet-600 hover:text-violet-700',
                                    'transition-colors duration-200'
                                  )}
                                >
                                  View →
                                </Link>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : null
            )}
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}
