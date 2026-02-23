'use client'

import { useEffect, useState } from 'react'
import { BarChart3, TrendingUp, Users, Share2, Send, Loader2, Calendar } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface KPI {
  label: string
  value: number
  icon: React.ReactNode
  trend?: number
}

interface TopSource {
  name: string
  count: number
  percentage: number
}

interface RecentEvent {
  id: string
  type: string
  description: string
  timestamp: string
  user?: string
}

interface AnalyticsDashboardProps {
  campaignId: string
}

export function AnalyticsDashboard({ campaignId }: AnalyticsDashboardProps) {
  const [period, setPeriod] = useState<'7d' | '30d' | '90d' | 'all'>('30d')
  const [loading, setLoading] = useState(true)
  const [data, setData] = useState<{
    kpis: Record<string, number>
    historicalData: Array<{ date: string; count: number }>
    topSources: TopSource[]
    recentEvents: RecentEvent[]
  } | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchAnalytics()
  }, [campaignId, period])

  const fetchAnalytics = async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await fetch(
        `/api/campaigns/${campaignId}/analytics?period=${period}`,
        {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' },
        }
      )

      if (!response.ok) {
        throw new Error('Failed to fetch analytics')
      }

      const result = await response.json()
      setData(result.data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  if (error) {
    return (
      <div className="p-6 bg-red-50 border border-red-200 rounded-lg">
        <p className="text-red-600 font-medium">Error loading analytics</p>
        <p className="text-red-500 text-sm mt-1">{error}</p>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12">
        <Loader2 className="w-8 h-8 text-violet-600 animate-spin" />
      </div>
    )
  }

  if (!data) {
    return (
      <div className="p-6 bg-amber-50 border border-amber-200 rounded-lg">
        <p className="text-amber-600 font-medium">No analytics data available</p>
      </div>
    )
  }

  const kpis: KPI[] = [
    {
      label: 'Total Lobbies',
      value: data.kpis.totalLobbies || 0,
      icon: <BarChart3 className="w-6 h-6" />,
      trend: data.kpis.lobbyTrend,
    },
    {
      label: 'Total Shares',
      value: data.kpis.totalShares || 0,
      icon: <Share2 className="w-6 h-6" />,
      trend: data.kpis.shareTrend,
    },
    {
      label: 'Brand Contacts',
      value: data.kpis.brandContacts || 0,
      icon: <Send className="w-6 h-6" />,
      trend: data.kpis.contactTrend,
    },
    {
      label: 'Growth Rate',
      value: data.kpis.growthRate || 0,
      icon: <TrendingUp className="w-6 h-6" />,
    },
  ]

  return (
    <div className="space-y-6">
      {/* Header with period selector */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Campaign Analytics</h2>
        <div className="flex gap-2">
          {(['7d', '30d', '90d', 'all'] as const).map((p) => (
            <Button
              key={p}
              variant={period === p ? 'primary' : 'outline'}
              size="sm"
              onClick={() => setPeriod(p)}
              className="flex items-center gap-1"
            >
              <Calendar className="w-4 h-4" />
              {p === '7d' ? '7 Days' : p === '30d' ? '30 Days' : p === '90d' ? '90 Days' : 'All Time'}
            </Button>
          ))}
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {kpis.map((kpi, index) => (
          <div
            key={index}
            className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-lg transition-shadow"
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">{kpi.label}</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{kpi.value.toLocaleString()}</p>
              </div>
              <div className="text-violet-600 opacity-75">{kpi.icon}</div>
            </div>

            {/* Mini sparkline (CSS-based) */}
            <div className="mt-4 h-12 bg-gradient-to-r from-violet-100 to-violet-50 rounded relative overflow-hidden">
              <svg
                className="w-full h-full"
                viewBox="0 0 100 40"
                preserveAspectRatio="none"
              >
                <polyline
                  points="0,30 25,15 50,20 75,8 100,12"
                  fill="none"
                  stroke="rgb(109, 40, 217)"
                  strokeWidth="2"
                />
              </svg>
            </div>

            {/* Trend indicator */}
            {kpi.trend !== undefined && kpi.trend !== null && (
              <div className="mt-3 flex items-center gap-1">
                <TrendingUp className={cn(
                  'w-4 h-4',
                  kpi.trend >= 0 ? 'text-green-600' : 'text-red-600'
                )} />
                <span className={cn(
                  'text-sm font-medium',
                  kpi.trend >= 0 ? 'text-green-600' : 'text-red-600'
                )}>
                  {kpi.trend >= 0 ? '+' : ''}{kpi.trend}%
                </span>
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Top Sources Table */}
        <div className="lg:col-span-2 bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Users className="w-5 h-5 text-violet-600" />
            Top Sources
          </h3>

          {data.topSources.length > 0 ? (
            <div className="space-y-2">
              {data.topSources.slice(0, 6).map((source, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">{source.name}</p>
                    <div className="w-32 h-2 bg-gray-200 rounded-full mt-2 overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-violet-500 to-violet-600 rounded-full"
                        style={{ width: `${source.percentage}%` }}
                      />
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-gray-900">{source.count}</p>
                    <p className="text-xs text-gray-500">{source.percentage}%</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-8">No source data available</p>
          )}
        </div>

        {/* Recent Activity Feed */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Share2 className="w-5 h-5 text-violet-600" />
            Recent Activity
          </h3>

          {data.recentEvents.length > 0 ? (
            <div className="space-y-3">
              {data.recentEvents.slice(0, 5).map((event) => (
                <div
                  key={event.id}
                  className="flex gap-3 pb-3 border-b border-gray-100 last:border-0 last:pb-0"
                >
                  <div className="w-2 h-2 rounded-full bg-violet-600 mt-2 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-900 font-medium truncate">
                      {event.user && `${event.user} - `}
                      {event.description}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">{formatTimeAgo(event.timestamp)}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-8">No recent activity</p>
          )}
        </div>
      </div>

      {/* Historical Chart Placeholder */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Growth Over Time</h3>
        <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg border border-gray-200">
          <div className="text-center">
            <BarChart3 className="w-12 h-12 text-gray-400 mx-auto mb-2" />
            <p className="text-gray-500">Historical data visualization</p>
            {data.historicalData.length > 0 && (
              <p className="text-xs text-gray-400 mt-2">
                {data.historicalData.length} data points
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

function formatTimeAgo(dateString: string): string {
  const date = new Date(dateString)
  const now = new Date()
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000)

  if (seconds < 60) return 'just now'
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`
  if (seconds < 2592000) return `${Math.floor(seconds / 86400)}d ago`
  return `${Math.floor(seconds / 2592000)}mo ago`
}
