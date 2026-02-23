'use client'

import React, { useState, useEffect } from 'react'
import { Eye, ThumbsUp, Share2, Send, Loader2, TrendingDown } from 'lucide-react'
import { cn } from '@/lib/utils'

interface FunnelStage {
  name: string
  count: number
  conversionRate: number // percentage from previous stage
  icon: string
}

interface FunnelData {
  stages: FunnelStage[]
}

interface ConversionFunnelProps {
  campaignId: string
  className?: string
  compact?: boolean
}

// Gradient color progression: violet to lime
const STAGE_COLORS = [
  { bg: 'bg-violet-500/20', border: 'border-violet-500', text: 'text-violet-700', gradient: 'from-violet-500 to-indigo-500' },
  { bg: 'bg-indigo-500/20', border: 'border-indigo-500', text: 'text-indigo-700', gradient: 'from-indigo-500 to-blue-500' },
  { bg: 'bg-blue-500/20', border: 'border-blue-500', text: 'text-blue-700', gradient: 'from-blue-500 to-emerald-500' },
  { bg: 'bg-lime-500/20', border: 'border-lime-500', text: 'text-lime-700', gradient: 'from-emerald-500 to-lime-500' }
]

// Icon map for rendering based on string names from API
const ICON_MAP: { [key: string]: React.ReactNode } = {
  Eye: <Eye className="h-4 w-4 text-violet-600" />,
  ThumbsUp: <ThumbsUp className="h-4 w-4 text-indigo-600" />,
  Share2: <Share2 className="h-4 w-4 text-blue-600" />,
  Send: <Send className="h-4 w-4 text-lime-600" />
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

  return <span>{displayValue.toLocaleString()}</span>
}

export function ConversionFunnel({
  campaignId,
  className,
  compact = false
}: ConversionFunnelProps) {
  const [funnelData, setFunnelData] = useState<FunnelData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchFunnelData = async () => {
      setIsLoading(true)
      setError(null)
      try {
        const response = await fetch(`/api/campaigns/${campaignId}/funnel`)
        if (!response.ok) {
          throw new Error('Failed to fetch funnel data')
        }
        const data = await response.json()
        setFunnelData(data.data)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred')
        console.error('Funnel data fetch error:', err)
      } finally {
        setIsLoading(false)
      }
    }

    fetchFunnelData()
  }, [campaignId])

  if (isLoading) {
    return (
      <div className={cn('flex items-center justify-center p-8', className)}>
        <Loader2 className="h-6 w-6 animate-spin text-violet-500" />
        <span className="ml-2 text-gray-600">Loading funnel data...</span>
      </div>
    )
  }

  if (error || !funnelData) {
    return (
      <div className={cn('rounded-lg border border-red-200 bg-red-50 p-4', className)}>
        <p className="text-sm text-red-700">{error || 'Failed to load funnel data'}</p>
      </div>
    )
  }

  const maxCount = Math.max(...funnelData.stages.map(s => s.count), 1)

  return (
    <div className={cn('space-y-6 rounded-lg border border-gray-200 bg-white p-6', className)}>
      <div className="space-y-2">
        <h3 className="text-lg font-semibold text-gray-900">Conversion Funnel</h3>
        <p className="text-sm text-gray-600">Track how visitors progress through your campaign</p>
      </div>

      {!compact && (
        <div className="grid grid-cols-4 gap-2 text-center">
          {funnelData.stages.map((stage, idx) => (
            <div key={idx} className="text-xs font-medium text-gray-600">
              {stage.name}
            </div>
          ))}
        </div>
      )}

      <div className="space-y-4">
        {funnelData.stages.map((stage, idx) => {
          const widthPercent = (stage.count / maxCount) * 100
          const stageColor = STAGE_COLORS[idx]
          const icon = ICON_MAP[stage.icon] || <Eye className="h-4 w-4" />

          return (
            <div key={idx} className="space-y-2">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2 min-w-fit">
                  <div className="flex h-8 w-8 items-center justify-center rounded bg-gray-100">
                    {icon}
                  </div>
                  <span className="text-sm font-medium text-gray-700">{stage.name}</span>
                </div>

                <div className="flex items-center gap-4 whitespace-nowrap">
                  <div className="text-right">
                    <div className="text-base font-bold text-gray-900">
                      <AnimatedNumber value={stage.count} />
                    </div>
                    {idx > 0 && (
                      <div className="flex items-center justify-end gap-1 text-xs text-gray-600">
                        <TrendingDown className="h-3 w-3" />
                        <span>{stage.conversionRate.toFixed(1)}%</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Funnel bar */}
              <div className="flex justify-center">
                <div
                  className={cn(
                    'h-8 rounded-lg border transition-all duration-500',
                    stageColor.border,
                    `bg-gradient-to-r ${stageColor.gradient}`
                  )}
                  style={{
                    width: `${widthPercent}%`,
                    maxWidth: '100%'
                  }}
                >
                  {widthPercent > 40 && (
                    <div className="flex h-full items-center justify-center">
                      <span className="text-xs font-semibold text-white drop-shadow">
                        {widthPercent.toFixed(0)}%
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Connecting arrow for all but last */}
              {idx < funnelData.stages.length - 1 && (
                <div className="flex justify-center py-1">
                  <div className="text-gray-400">
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                    </svg>
                  </div>
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* Summary stats */}
      <div className="border-t border-gray-200 pt-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="rounded-lg bg-gray-50 p-3">
            <p className="text-xs text-gray-600">Total Reach</p>
            <p className="text-lg font-bold text-gray-900">
              <AnimatedNumber value={funnelData.stages[0]?.count || 0} />
            </p>
          </div>
          <div className="rounded-lg bg-gray-50 p-3">
            <p className="text-xs text-gray-600">Final Conversion</p>
            <p className="text-lg font-bold text-gray-900">
              {funnelData.stages.length > 0
                ? (
                    (funnelData.stages[funnelData.stages.length - 1]?.count || 0) /
                    (funnelData.stages[0]?.count || 1) *
                    100
                  ).toFixed(1)
                : '0'}
              %
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
