'use client'

import React, { useState, useEffect } from 'react'
import { cn } from '@/lib/utils'

interface ActivityData {
  date: string
  count: number
  level: 0 | 1 | 2 | 3 | 4
}

interface HeatmapWeek {
  week: number
  days: ActivityData[]
}

interface HeatmapStats {
  totalContributions: number
  maxDayContributions: number
  currentStreak: number
  longestStreak: number
}

interface ActivityHeatmapProps {
  className?: string
}

export const ActivityHeatmap: React.FC<ActivityHeatmapProps> = ({ className }) => {
  const [weeks, setWeeks] = useState<HeatmapWeek[]>([])
  const [stats, setStats] = useState<HeatmapStats | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [hoveredDate, setHoveredDate] = useState<string | null>(null)
  const [tooltip, setTooltip] = useState<{
    x: number
    y: number
    date: string
    count: number
  } | null>(null)

  useEffect(() => {
    const fetchHeatmap = async () => {
      try {
        setIsLoading(true)
        const response = await fetch('/api/user/activity-heatmap')

        if (!response.ok) {
          throw new Error('Failed to fetch activity heatmap')
        }

        const json = await response.json()
        setWeeks(json.data.weeks)
        setStats(json.data.stats)
        setError(null)
      } catch (err) {
        console.error('Error fetching heatmap:', err)
        setError('Failed to load activity heatmap')
      } finally {
        setIsLoading(false)
      }
    }

    fetchHeatmap()
  }, [])

  const getActivityColor = (level: number): string => {
    switch (level) {
      case 0:
        return '#f3f4f6' // gray
      case 1:
        return '#c7f0d8' // light green
      case 2:
        return '#84cc16' // lime (accent)
      case 3:
        return '#84cc16' // lime
      case 4:
        return '#7c3aed' // violet (primary)
      default:
        return '#f3f4f6'
    }
  }

  const dayLabels = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
  const monthLabels = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

  const getMonthLabels = (): Array<{ month: string; weekIndex: number }> => {
    const labels: Array<{ month: string; weekIndex: number }> = []
    let lastMonth = -1

    for (let i = 0; i < weeks.length; i++) {
      if (weeks[i].days.length > 0) {
        const dateStr = weeks[i].days[0].date
        const date = new Date(dateStr + 'T00:00:00Z')
        const month = date.getUTCMonth()

        if (month !== lastMonth) {
          labels.push({
            month: monthLabels[month],
            weekIndex: i,
          })
          lastMonth = month
        }
      }
    }

    return labels
  }

  const handleMouseEnter = (day: ActivityData, e: React.MouseEvent) => {
    setHoveredDate(day.date)
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect()
    setTooltip({
      x: rect.left,
      y: rect.top - 10,
      date: day.date,
      count: day.count,
    })
  }

  const handleMouseLeave = () => {
    setHoveredDate(null)
    setTooltip(null)
  }

  if (isLoading) {
    return (
      <div className={cn('bg-white border border-gray-200 rounded-lg p-6', className)}>
        <div className="h-40 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-violet-600 mx-auto mb-4"></div>
            <p className="text-gray-600 text-sm">Loading activity heatmap...</p>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className={cn('bg-white border border-gray-200 rounded-lg p-6', className)}>
        <div className="h-40 flex items-center justify-center">
          <p className="text-red-600 text-sm">{error}</p>
        </div>
      </div>
    )
  }

  const monthLabels_ = getMonthLabels()

  return (
    <div className={cn('bg-white border border-gray-200 rounded-lg p-6', className)}>
      {/* Header */}
      <div className="mb-6">
        <h3 className="font-display font-semibold text-lg text-foreground">
          Activity Heatmap
        </h3>
        <p className="text-sm text-gray-600 mt-1">
          Your contributions over the last year
        </p>
      </div>

      {/* Heatmap Grid */}
      <div className="overflow-x-auto mb-8 pb-4">
        <div className="inline-block">
          {/* Month labels */}
          <div className="flex mb-2 ml-8">
            {monthLabels_.map((label, idx) => (
              <div
                key={idx}
                style={{ marginLeft: `${label.weekIndex * 14}px` }}
                className="text-xs font-medium text-gray-500 w-14"
              >
                {label.month}
              </div>
            ))}
          </div>

          {/* Day labels + Heatmap */}
          <div className="flex gap-1">
            {/* Day labels (left side) */}
            <div className="flex flex-col gap-1 mr-2">
              {dayLabels.map((day, idx) => (
                <div
                  key={idx}
                  className={cn(
                    'text-xs font-medium text-gray-500 w-8 h-8 flex items-center',
                    idx % 2 === 1 ? 'justify-center' : 'invisible'
                  )}
                >
                  {idx % 2 === 1 && day}
                </div>
              ))}
            </div>

            {/* Heatmap grid */}
            <div className="flex gap-1">
              {weeks.map((week) => (
                <div key={week.week} className="flex flex-col gap-1">
                  {week.days.map((day, dayIdx) => (
                    <div
                      key={`${week.week}-${dayIdx}`}
                      className="relative group"
                      onMouseEnter={(e) => handleMouseEnter(day, e)}
                      onMouseLeave={handleMouseLeave}
                    >
                      <div
                        className="w-8 h-8 rounded-md border border-gray-200 transition-all duration-200 hover:ring-2 hover:ring-offset-0 hover:ring-violet-400 cursor-pointer"
                        style={{
                          backgroundColor: getActivityColor(day.level),
                        }}
                        title={`${day.count} contribution${day.count !== 1 ? 's' : ''} on ${day.date}`}
                      ></div>

                      {/* Tooltip */}
                      {hoveredDate === day.date && tooltip && (
                        <div
                          className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 bg-gray-900 text-white text-xs rounded-md py-2 px-3 whitespace-nowrap z-50 pointer-events-none"
                          style={{
                            animation: 'fadeIn 0.2s ease-in-out',
                          }}
                        >
                          <div className="font-semibold">
                            {day.count} contribution{day.count !== 1 ? 's' : ''}
                          </div>
                          <div className="text-gray-300">
                            {formatDate(day.date)}
                          </div>
                          <div
                            className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-gray-900"
                          ></div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Legend */}
      <div className="flex items-center justify-center gap-4 mb-8 pb-4 border-t border-gray-200 pt-4">
        <span className="text-xs text-gray-600">Less</span>
        <div className="flex gap-1">
          <div
            className="w-4 h-4 rounded-sm border border-gray-200"
            style={{ backgroundColor: getActivityColor(0) }}
          ></div>
          <div
            className="w-4 h-4 rounded-sm border border-gray-200"
            style={{ backgroundColor: getActivityColor(1) }}
          ></div>
          <div
            className="w-4 h-4 rounded-sm border border-gray-200"
            style={{ backgroundColor: getActivityColor(2) }}
          ></div>
          <div
            className="w-4 h-4 rounded-sm border border-gray-200"
            style={{ backgroundColor: getActivityColor(3) }}
          ></div>
          <div
            className="w-4 h-4 rounded-sm border border-gray-200"
            style={{ backgroundColor: getActivityColor(4) }}
          ></div>
        </div>
        <span className="text-xs text-gray-600">More</span>
      </div>

      {/* Stats Grid */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="text-2xl font-bold text-foreground">
              {stats.totalContributions}
            </div>
            <div className="text-xs text-gray-600 mt-1">Total Contributions</div>
          </div>

          <div className="bg-gray-50 rounded-lg p-4">
            <div className="text-2xl font-bold text-foreground">
              {stats.currentStreak}
            </div>
            <div className="text-xs text-gray-600 mt-1">Current Streak</div>
          </div>

          <div className="bg-gray-50 rounded-lg p-4">
            <div className="text-2xl font-bold text-foreground">
              {stats.longestStreak}
            </div>
            <div className="text-xs text-gray-600 mt-1">Longest Streak</div>
          </div>

          <div className="bg-gray-50 rounded-lg p-4">
            <div className="text-2xl font-bold text-foreground">
              {stats.maxDayContributions}
            </div>
            <div className="text-xs text-gray-600 mt-1">Max in a Day</div>
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translate(-50%, -10px);
          }
          to {
            opacity: 1;
            transform: translate(-50%, 0);
          }
        }
      `}</style>
    </div>
  )
}

function formatDate(dateStr: string): string {
  const date = new Date(dateStr + 'T00:00:00Z')
  const options: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    timeZone: 'UTC',
  }
  return date.toLocaleDateString('en-US', options)
}
