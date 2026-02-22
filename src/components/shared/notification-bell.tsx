'use client'

import { useEffect, useState, useCallback, useRef } from 'react'
import Link from 'next/link'
import {
  Bell,
  Megaphone,
  BarChart3,
  MessageCircle,
  Heart,
  Building2,
  X,
} from 'lucide-react'
import { cn } from '@/lib/utils'

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
  campaign_update: <Megaphone className="w-4 h-4" />,
  poll: <BarChart3 className="w-4 h-4" />,
  comment: <MessageCircle className="w-4 h-4" />,
  milestone: <Heart className="w-4 h-4" />,
  brand_response: <Building2 className="w-4 h-4" />,
  general: <Bell className="w-4 h-4" />,
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

export const NotificationBell: React.FC = () => {
  const [unreadCount, setUnreadCount] = useState(0)
  const [loading, setLoading] = useState(false)
  const [isOpen, setIsOpen] = useState(false)
  const [notifications, setNotifications] = useState<Notification[]>([])
  const dropdownRef = useRef<HTMLDivElement>(null)
  const bellRef = useRef<HTMLButtonElement>(null)

  // Fetch unread count
  const fetchUnreadCount = useCallback(async () => {
    try {
      const response = await fetch('/api/user/notifications/unread-count', {
        credentials: 'include',
      })

      if (response.ok) {
        const data = await response.json()
        setUnreadCount(data.count)
      }
    } catch (error) {
      console.error('Failed to fetch unread count:', error)
    }
  }, [])

  // Fetch recent notifications when dropdown opens
  const fetchRecentNotifications = useCallback(async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/user/notifications/recent', {
        credentials: 'include',
      })

      if (response.ok) {
        const data = await response.json()
        setNotifications(data.notifications || [])
      }
    } catch (error) {
      console.error('Failed to fetch notifications:', error)
    } finally {
      setLoading(false)
    }
  }, [])

  // Initial load of unread count
  useEffect(() => {
    fetchUnreadCount()
  }, [fetchUnreadCount])

  // Poll for unread count every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      fetchUnreadCount()
    }, 30000) // 30 seconds

    return () => clearInterval(interval)
  }, [fetchUnreadCount])

  // Fetch notifications when dropdown opens
  useEffect(() => {
    if (isOpen) {
      fetchRecentNotifications()
    }
  }, [isOpen, fetchRecentNotifications])

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        bellRef.current &&
        !bellRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false)
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
      return () => document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen])

  // Mark notification as read when clicking
  const handleNotificationClick = async (
    notificationId: string,
    linkUrl?: string | null
  ) => {
    try {
      // Mark as read
      await fetch(`/api/user/notifications/${notificationId}`, {
        method: 'PATCH',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ read: true }),
      })

      // Update local state
      setNotifications((prev) =>
        prev.map((n) =>
          n.id === notificationId ? { ...n, read: true } : n
        )
      )

      setUnreadCount((prev) => Math.max(0, prev - 1))

      // Navigate if linkUrl provided
      if (linkUrl) {
        window.location.href = linkUrl
      }
    } catch (error) {
      console.error('Failed to mark notification as read:', error)
    }
  }

  // Mark all as read
  const handleMarkAllAsRead = async () => {
    try {
      await fetch('/api/user/notifications/mark-all-read', {
        method: 'POST',
        credentials: 'include',
      })

      setNotifications((prev) =>
        prev.map((n) => ({ ...n, read: true }))
      )
      setUnreadCount(0)
    } catch (error) {
      console.error('Failed to mark all as read:', error)
    }
  }

  // Dismiss single notification
  const handleDismiss = async (
    e: React.MouseEvent,
    notificationId: string
  ) => {
    e.stopPropagation()
    try {
      await fetch(`/api/user/notifications/${notificationId}`, {
        method: 'PATCH',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ read: true }),
      })

      setNotifications((prev) =>
        prev.filter((n) => n.id !== notificationId)
      )
      setUnreadCount((prev) => Math.max(0, prev - 1))
    } catch (error) {
      console.error('Failed to dismiss notification:', error)
    }
  }

  return (
    <div className="relative">
      {/* Bell button */}
      <button
        ref={bellRef}
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-gray-700 hover:text-violet-600 transition-colors duration-200 rounded-lg hover:bg-gray-100"
        title="Notifications"
        aria-label="Notifications"
      >
        <Bell className="w-5 h-5" />

        {/* Unread badge */}
        {unreadCount > 0 && (
          <span
            className={cn(
              'absolute top-1 right-1 flex items-center justify-center',
              'w-5 h-5 text-xs font-semibold rounded-full',
              'bg-red-500 text-white'
            )}
          >
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div
          ref={dropdownRef}
          className={cn(
            'absolute right-0 mt-2 w-96 bg-white rounded-lg shadow-xl',
            'border border-gray-200 z-50 overflow-hidden',
            'animate-in fade-in slide-in-from-top-1 duration-200'
          )}
        >
          {/* Header */}
          <div className="px-4 py-3 border-b border-gray-100 flex justify-between items-center">
            <h3 className="text-sm font-semibold text-gray-900">
              Notifications
            </h3>
            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllAsRead}
                className="text-xs text-violet-600 hover:text-violet-700 font-medium"
              >
                Mark all as read
              </button>
            )}
          </div>

          {/* Notifications list */}
          <div className="max-h-96 overflow-y-auto">
            {loading ? (
              <div className="px-4 py-8 text-center text-gray-500 text-sm">
                Loading notifications...
              </div>
            ) : notifications.length === 0 ? (
              <div className="px-4 py-8 text-center text-gray-500 text-sm">
                No notifications yet
              </div>
            ) : (
              <ul className="divide-y divide-gray-100">
                {notifications.map((notification) => (
                  <li
                    key={notification.id}
                    className={cn(
                      'px-4 py-3 hover:bg-gray-50 cursor-pointer transition-colors',
                      !notification.read && 'bg-blue-50'
                    )}
                    onClick={() =>
                      handleNotificationClick(
                        notification.id,
                        notification.linkUrl
                      )
                    }
                  >
                    <div className="flex gap-3">
                      {/* Icon */}
                      <div className="flex-shrink-0 text-violet-600 mt-0.5">
                        {notificationIcons[notification.type] ||
                          notificationIcons.general}
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <p
                          className={cn(
                            'text-sm line-clamp-1',
                            !notification.read
                              ? 'font-semibold text-gray-900'
                              : 'font-medium text-gray-800'
                          )}
                        >
                          {notification.title}
                        </p>
                        <p className="text-xs text-gray-600 line-clamp-1 mt-0.5">
                          {notification.message}
                        </p>
                        <p className="text-xs text-gray-400 mt-1">
                          {formatTimeAgo(notification.createdAt)}
                        </p>
                      </div>

                      {/* Dismiss button */}
                      <button
                        onClick={(e) => handleDismiss(e, notification.id)}
                        className="flex-shrink-0 text-gray-400 hover:text-gray-600 transition-colors"
                        aria-label="Dismiss"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Footer */}
          <div className="px-4 py-3 border-t border-gray-100 bg-gray-50">
            <Link
              href="/activity"
              className="text-sm text-violet-600 hover:text-violet-700 font-medium"
              onClick={() => setIsOpen(false)}
            >
              View all notifications
            </Link>
          </div>
        </div>
      )}
    </div>
  )
}
