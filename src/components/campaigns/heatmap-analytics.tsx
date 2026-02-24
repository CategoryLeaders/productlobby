'use client'

import { useEffect, useState } from 'react'
import { Flame, TrendingUp, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'

interface HeatmapSection {
  name: string
  clicks: number
  views: number
  engagementRate: number
  avgTimeSpent: number
}

interface PeakHour {
  hour: number
  activity: number
}

interface PeakDay {
  day: string
  activity: number
}

interface HeatmapData {
  sections: HeatmapSection[]
  peakHours: PeakHour[]
  peakDays: PeakDay[]
}

interface HeatmapAnalyticsProps {
  campaignId: string
}

export function HeatmapAnalytics({ campaignId }: HeatmapAnalyticsProps) {
  const [loading, setLoading] = useState(true)
  const [data, setData] = useState<HeatmapData | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchHeatmapData()
  }, [campaignId])

  const fetchHeatmapData = async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await fetch(`/api/campaigns/${campaignId}/heatmap-analytics`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      })

      if (!response.ok) {
        throw new Error('Failed to fetch heatmap data')
      }

      const result = await response.json()
      if (result.success) {
        setData(result.data)
      } else {
        setError(result.error || 'Failed to load heatmap data')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  const getActivityColor = (activity: number, max: number) => {
    const intensity = activity / max
    if (intensity >= 0.8) return 'bg-violet-600'
    if (intensity >= 0.6) return 'bg-violet-500'
    if (intensity >= 0.4) return 'bg-violet-400'
    if (intensity >= 0.2) return 'bg-violet-300'
    return 'bg-gray-200'
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="animate-spin text-violet-600" size={32} />
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-800">
        {error}
      </div>
    )
  }

  if (!data) {
    return (
      <div className="text-center py-12 text-gray-500">
        No heatmap data available
      </div>
    )
  }

  const maxActivityHours = Math.max(...data.peakHours.map(h => h.activity), 1)
  const maxActivityDays = Math.max(...data.peakDays.map(d => d.activity), 1)
  const maxEngagement = Math.max(...data.sections.map(s => s.engagementRate), 1)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-2">
        <Flame className="text-violet-600" size={28} />
        <h2 className="text-2xl font-bold text-gray-900">Engagement Heatmap</h2>
      </div>

      {/* Section Engagement Table */}
      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
        <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
          <h3 className="font-semibold text-gray-900">Section Engagement</h3>
        </div>
        <div className="divide-y">
          {data.sections.map((section) => (
            <div key={section.name} className="px-6 py-4">
              <div className="flex items-center justify-between mb-2">
                <span className="font-medium text-gray-900">{section.name}</span>
                <span className="text-sm text-gray-600">
                  {section.clicks} clicks · {section.views} views
                </span>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex-1 bg-gray-100 rounded-full h-2 overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-violet-400 to-violet-600 transition-all"
                    style={{
                      width: `${(section.engagementRate / maxEngagement) * 100}%`,
                    }}
                  />
                </div>
                <span className="text-sm font-semibold text-gray-700 w-12 text-right">
                  {section.engagementRate.toFixed(1)}%
                </span>
              </div>
              <div className="text-xs text-gray-500 mt-1">
                Avg time spent: {section.avgTimeSpent}m
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Hourly Activity Heatmap */}
      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
        <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
          <h3 className="font-semibold text-gray-900">Hourly Activity Heatmap (24h)</h3>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-24 gap-1">
            {data.peakHours.map((hour) => (
              <div
                key={`hour-${hour.hour}`}
                className={cn(
                  'aspect-square rounded transition-colors',
                  getActivityColor(hour.activity, maxActivityHours)
                )}
                title={`Hour ${hour.hour}: ${hour.activity} interactions`}
              />
            ))}
          </div>
          <div className="flex justify-between items-center mt-4 text-xs text-gray-600">
            <span>00:00</span>
            <span>12:00</span>
            <span>23:00</span>
          </div>
        </div>
      </div>

      {/* Daily Activity Heatmap */}
      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
        <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
          <h3 className="font-semibold text-gray-900">Peak Days Activity</h3>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-7 gap-2">
            {data.peakDays.map((day) => (
              <div key={`day-${day.day}`} className="text-center">
                <div
                  className={cn(
                    'aspect-square rounded-lg mb-2 transition-colors',
                    getActivityColor(day.activity, maxActivityDays)
                  )}
                  title={`${day.day}: ${day.activity} interactions`}
                />
                <p className="text-xs font-medium text-gray-700">{day.day.slice(0, 3)}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Peak Time Indicators */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-gradient-to-br from-violet-50 to-violet-100 rounded-lg p-4 border border-violet-200">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="text-violet-600" size={18} />
            <span className="text-sm font-semibold text-violet-900">Peak Hour</span>
          </div>
          <p className="text-2xl font-bold text-violet-700">
            {data.peakHours.length > 0
              ? `${data.peakHours.reduce((a, b) => a.activity > b.activity ? a : b).hour}:00`
              : 'N/A'}
          </p>
        </div>

        <div className="bg-gradient-to-br from-violet-50 to-violet-100 rounded-lg p-4 border border-violet-200">
          <div className="flex items-center gap-2 mb-2">
            <Flame className="text-violet-600" size={18} />
            <span className="text-sm font-semibold text-violet-900">Peak Day</span>
          </div>
          <p className="text-2xl font-bold text-violet-700">
            {data.peakDays.length > 0
              ? data.peakDays.reduce((a, b) => a.activity > b.activity ? a : b).day
              : 'N/A'}
          </p>
        </div>

        <div className="bg-gradient-to-br from-violet-50 to-violet-100 rounded-lg p-4 border border-violet-200">
          <div className="flex items-center gap-2 mb-2">
            <Flame className="text-violet-600" size={18} />
            <span className="text-sm font-semibold text-violet-900">Max Engagement</span>
          </div>
          <p className="text-2xl font-bold text-violet-700">
            {maxEngagement.toFixed(1)}%
          </p>
        </div>
      </div>
    </div>
  )
}
