'use client'

import { useEffect, useState, useCallback } from 'react'
import Link from 'next/link'
import { Bell } from 'lucide-react'
import { cn } from '@/lib/utils'

export const NotificationBell: React.FC = () => {
  const [unreadCount, setUnreadCount] = useState(0)
  const [loading, setLoading] = useState(false)

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
    } finally {
      setLoading(false)
    }
  }, [])

  // Initial load
  useEffect(() => {
    setLoading(true)
    fetchUnreadCount()
  }, [fetchUnreadCount])

  // Poll for unread count every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      fetchUnreadCount()
    }, 30000) // 30 seconds

    return () => clearInterval(interval)
  }, [fetchUnreadCount])

  return (
    <Link
      href="/activity"
      className="relative p-2 text-gray-700 hover:text-violet-600 transition-colors duration-200 rounded-lg hover:bg-gray-100"
      title="Activity and Notifications"
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

      {/* Red dot for unread (when count is only known to exist) */}
      {unreadCount === 0 && !loading && (
        <span className="absolute top-1 right-1 w-2 h-2 bg-gray-300 rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
      )}
    </Link>
  )
}
