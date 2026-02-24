'use client'

import { useEffect, useState } from 'react'
import { Loader2, BarChart3, TrendingUp, Award, Target, ArrowUp, ArrowDown } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface Competitor {
  name: string
  category: string
  supporters: number
  engagement: number
  sentiment: number
  trend: 'up' | 'down' | 'stable'
}

interface MetricComparison {
  metricName: string
  campaignValue: number
  categoryAverage: number
  delta: number
}

interface BenchmarkData {
  campaignRank: number
  totalInCategory: number
  competitors: Competitor[]
  metrics: MetricComparison[]
}

interface CompetitorBenchmarkingProps {
  campaignId: string
}

export function CompetitorBenchmarking({ campaignId }: CompetitorBenchmarkingProps) {
  const [loading, setLoading] = useState(true)
  const [data, setData] = useState<BenchmarkData | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchBenchmarkData()
  }, [campaignId])

  const fetchBenchmarkData = async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await fetch(`/api/campaigns/${campaignId}/competitor-benchmarking`)
      if (!response.ok) throw new Error('Failed to fetch benchmark data')
      const result = await response.json()
      setData(result.data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-violet-500" />
      </div>
    )
  }

  if (error || !data) {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-red-700">
        {error || 'Failed to load benchmark data'}
      </div>
    )
  }

  const getDeltaColor = (delta: number) => {
    if (delta > 0) return 'text-lime-600'
    if (delta < 0) return 'text-red-600'
    return 'text-gray-600'
  }

  const getDeltaIcon = (delta: number) => {
    if (delta > 0) return <ArrowUp className="w-4 h-4" />
    if (delta < 0) return <ArrowDown className="w-4 h-4" />
    return null
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <BarChart3 className="w-6 h-6 text-violet-500" />
            Competitor Benchmarking
          </h2>
          <p className="text-sm text-gray-600 mt-1">How your campaign compares to competitors</p>
        </div>
        <Button
          onClick={fetchBenchmarkData}
          variant="outline"
          size="sm"
          className="text-violet-600 border-violet-200 hover:bg-violet-50"
        >
          Refresh
        </Button>
      </div>

      {/* Campaign Rank Badge */}
      <div className="rounded-lg border border-violet-200 bg-gradient-to-br from-violet-50 to-lime-50 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
              <Award className="w-5 h-5 text-violet-600" />
              Your Campaign Rank
            </h3>
            <p className="text-sm text-gray-600">In {data.totalInCategory} campaigns in your category</p>
          </div>
          <div className="text-right">
            <div className="text-5xl font-bold text-violet-600">#{data.campaignRank}</div>
            <div className="text-sm text-gray-600 mt-1">Top {Math.round((data.campaignRank / data.totalInCategory) * 100)}%</div>
          </div>
        </div>
      </div>

      {/* Metrics Comparison Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {data.metrics.map((metric) => (
          <div
            key={metric.metricName}
            className="rounded-lg border border-gray-200 bg-white p-4 hover:shadow-lg transition-shadow"
          >
            <div className="text-sm font-medium text-gray-600 mb-3">{metric.metricName}</div>
            <div className="flex items-baseline gap-2 mb-3">
              <div className="text-2xl font-bold text-gray-900">{metric.campaignValue.toFixed(1)}%</div>
              <div className={cn('flex items-center gap-1 text-sm font-semibold', getDeltaColor(metric.delta))}>
                {getDeltaIcon(metric.delta)}
                <span>{Math.abs(metric.delta).toFixed(1)}%</span>
              </div>
            </div>
            <div className="bg-gray-100 rounded-full h-2 mb-2">
              <div
                className="bg-gradient-to-r from-violet-500 to-lime-500 h-2 rounded-full"
                style={{ width: `${Math.min(metric.campaignValue, 100)}%` }}
              />
            </div>
            <div className="text-xs text-gray-500">Category avg: {metric.categoryAverage.toFixed(1)}%</div>
          </div>
        ))}
      </div>

      {/* Competitors Comparison Table */}
      <div className="rounded-lg border border-gray-200 bg-white overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Competitor</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Supporters</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Engagement</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Sentiment</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Trend</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {data.competitors.map((competitor) => (
                <tr key={competitor.name} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4">
                    <div>
                      <div className="font-medium text-gray-900">{competitor.name}</div>
                      <div className="text-xs text-gray-500">{competitor.category}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm font-medium text-gray-900">{competitor.supporters.toLocaleString()}</td>
                  <td className="px-6 py-4 text-sm font-medium text-gray-900">{competitor.engagement.toFixed(1)}%</td>
                  <td className="px-6 py-4 text-sm font-medium text-gray-900">{competitor.sentiment.toFixed(1)}%</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      {competitor.trend === 'up' && (
                        <div className="flex items-center gap-1 text-lime-600">
                          <ArrowUp className="w-4 h-4" />
                          <span className="text-xs font-medium">Growing</span>
                        </div>
                      )}
                      {competitor.trend === 'down' && (
                        <div className="flex items-center gap-1 text-red-600">
                          <ArrowDown className="w-4 h-4" />
                          <span className="text-xs font-medium">Declining</span>
                        </div>
                      )}
                      {competitor.trend === 'stable' && (
                        <span className="text-xs font-medium text-gray-600">Stable</span>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
