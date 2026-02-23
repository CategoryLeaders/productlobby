'use client'

import React, { useState, useEffect } from 'react'
import { Eye, TrendingUp, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface ViewCounts {
  total: number
  today: number
  thisWeek: number
}

interface VisitorCounterProps {
  campaignId: string
  className?: string
  compact?: boolean
}

// Animated number component
function AnimatedNumber({ value }: { value: number }) {
  const [displayValue, setDisplayValue] = useState(0)

  useEffect(() => {
    if (value === 0) {
      setDisplayValue(0)
      return
    }

    const increment = Math.ceil(value / 20)
    let current = 0
    const timer = setInterval(() => {
      current += increment
      if (current >= value) {
        setDisplayValue(value)
        clearInterval(timer)
      } else {
        setDisplayValue(current)
      }
    }, 30)

    return () => clearInterval(timer)
  }, [value])

  return <span className="font-bold text-violet-600">{displayValue.toLocaleString()}</span>
}

export function VisitorCounter({
  campaignId,
  className,
  compact = true,
}: VisitorCounterProps) {
  const [views, setViews] = useState<ViewCounts>({
    total: 0,
    today: 0,
    thisWeek: 0,
  })
  const [isLoading, setIsLoading] = useState(true)
  const [hasRecorded, setHasRecorded] = useState(false)

  // Record view on mount
  useEffect(() => {
    const recordView = async () => {
      try {
        await fetch(`/api/campaigns/${campaignId}/views`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
        })
        setHasRecorded(true)
      } catch (error) {
        console.error('Error recording view:', error)
      }
    }

    recordView()
  }, [campaignId])

  // Fetch view counts
  useEffect(() => {
    const fetchViews = async () => {
      setIsLoading(true)
      try {
        const response = await fetch(`/api/campaigns/${campaignId}/views`, {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' },
        })
        if (response.ok) {
          const data = await response.json()
          setViews({
            total: data.total || 0,
            today: data.today || 0,
            thisWeek: data.thisWeek || 0,
          })
        }
      } catch (error) {
        console.error('Error fetching views:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchViews()
    const interval = setInterval(fetchViews, 30000) // Refresh every 30 seconds

    return () => clearInterval(interval)
  }, [campaignId])

  if (isLoading) {
    return (
      <div className={cn('flex items-center gap-2', className)}>
        <Loader2 className="h-4 w-4 animate-spin text-violet-500" />
        <span className="text-sm text-gray-500">Loading...</span>
      </div>
    )
  }

  if (compact) {
    return (
      <div
        className={cn(
          'flex flex-col gap-3 rounded-lg border border-violet-200 bg-gradient-to-br from-violet-50 to-lime-50 p-3',
          className
        )}
      >
        {/* Live indicator */}
        <div className="flex items-center gap-2">
          <div className="relative">
            <Eye className="h-4 w-4 text-violet-600" />
            <div className="absolute right-0 top-0 h-2 w-2 animate-pulse rounded-full bg-lime-500" />
          </div>
          <span className="text-xs font-semibold text-gray-600">Live Views</span>
        </div>

        {/* Total views */}
        <div className="flex items-center justify-between">
          <span className="text-xs text-gray-600">Total</span>
          <AnimatedNumber value={views.total} />
        </div>

        {/* Views today */}
        <div className="flex items-center justify-between border-t border-violet-100 pt-2">
          <span className="text-xs text-gray-600">Today</span>
          <span className="font-semibold text-lime-600">{views.today}</span>
        </div>

        {/* Views this week */}
        <div className="flex items-center justify-between">
          <span className="text-xs text-gray-600">This Week</span>
          <div className="flex items-center gap-1">
            <TrendingUp className="h-3 w-3 text-lime-600" />
            <span className="font-semibold text-lime-600">{views.thisWeek}</span>
          </div>
        </div>
      </div>
    )
  }

  // Expanded view
  return (
    <div
      className={cn(
        'rounded-lg border border-violet-200 bg-gradient-to-br from-violet-50 to-lime-50 p-6',
        className
      )}
    >
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="relative">
              <Eye className="h-5 w-5 text-violet-600" />
              <div className="absolute right-0 top-0 h-2 w-2 animate-pulse rounded-full bg-lime-500" />
            </div>
            <h3 className="font-semibold text-gray-900">Live Visitor Counter</h3>
          </div>
          <span className="text-xs font-medium text-lime-600">Live</span>
        </div>

        {/* Stats grid */}
        <div className="grid grid-cols-3 gap-4">
          <div className="rounded-lg bg-white p-4">
            <p className="text-xs font-medium text-gray-600">Total Views</p>
            <p className="mt-2 text-2xl font-bold">
              <AnimatedNumber value={views.total} />
            </p>
          </div>

          <div className="rounded-lg bg-white p-4">
            <p className="text-xs font-medium text-gray-600">Today</p>
            <p className="mt-2 text-2xl font-bold text-lime-600">{views.today}</p>
          </div>

          <div className="rounded-lg bg-white p-4">
            <p className="flex items-center gap-1 text-xs font-medium text-gray-600">
              <TrendingUp className="h-3 w-3" />
              This Week
            </p>
            <p className="mt-2 text-2xl font-bold text-lime-600">{views.thisWeek}</p>
          </div>
        </div>

        {/* Footer */}
        <Button
          variant="outline"
          size="sm"
          className="w-full border-violet-200 text-violet-600 hover:bg-violet-50"
          onClick={() => {
            const el = document.querySelector(`[data-campaign-id="${campaignId}"]`)
            if (el) {
              el.scrollIntoView({ behavior: 'smooth' })
            }
          }}
        >
          Share this campaign
        </Button>
      </div>
    </div>
  )
}
