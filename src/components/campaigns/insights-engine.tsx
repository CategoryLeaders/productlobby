'use client'

import { useEffect, useState } from 'react'
import {
  TrendingUp,
  TrendingDown,
  Zap,
  MessageCircle,
  Clock,
  RefreshCw,
  Filter,
  ChevronRight,
  AlertCircle,
  CheckCircle2,
  Loader2,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

export type InsightType = 'growth' | 'engagement' | 'content' | 'timing'
export type ImpactLevel = 'high' | 'medium' | 'low'
export type TrendDirection = 'up' | 'down' | 'neutral'

export interface InsightRecommendation {
  id: string
  title: string
  action: string
  potential_impact: string
  difficulty: 'easy' | 'medium' | 'hard'
}

export interface Insight {
  id: string
  type: InsightType
  title: string
  description: string
  impact_level: ImpactLevel
  trend_direction: TrendDirection
  trend_value?: number
  recommendations: InsightRecommendation[]
  timestamp: string
}

interface InsightsEngineProps {
  campaignId: string
  onApplyRecommendation?: (recommendation: InsightRecommendation) => void
}

const INSIGHT_TYPE_LABELS: Record<InsightType, string> = {
  growth: 'Growth',
  engagement: 'Engagement',
  content: 'Content',
  timing: 'Timing',
}

const IMPACT_COLORS: Record<ImpactLevel, string> = {
  high: 'bg-red-100 text-red-700 border-red-300',
  medium: 'bg-orange-100 text-orange-700 border-orange-300',
  low: 'bg-green-100 text-green-700 border-green-300',
}

const IMPACT_BG: Record<ImpactLevel, string> = {
  high: 'bg-red-50',
  medium: 'bg-orange-50',
  low: 'bg-green-50',
}

export function InsightsEngine({ campaignId, onApplyRecommendation }: InsightsEngineProps) {
  const [insights, setInsights] = useState<Insight[]>([])
  const [healthScore, setHealthScore] = useState(0)
  const [lastAnalyzed, setLastAnalyzed] = useState<Date | null>(null)
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [selectedFilters, setSelectedFilters] = useState<InsightType[]>([])
  const [error, setError] = useState<string | null>(null)

  // Load insights on mount
  useEffect(() => {
    loadInsights()
  }, [campaignId])

  const loadInsights = async () => {
    setLoading(true)
    setError(null)
    try {
      const response = await fetch(`/api/campaigns/${campaignId}/insights`)
      if (!response.ok) {
        throw new Error('Failed to load insights')
      }
      const data = await response.json()
      setInsights(data.insights || [])
      setHealthScore(data.health_score || 0)
      setLastAnalyzed(data.last_analyzed ? new Date(data.last_analyzed) : null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load insights')
      console.error('Error loading insights:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleRefresh = async () => {
    setRefreshing(true)
    try {
      await loadInsights()
    } finally {
      setRefreshing(false)
    }
  }

  const toggleFilter = (type: InsightType) => {
    setSelectedFilters((prev) =>
      prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type]
    )
  }

  const filteredInsights =
    selectedFilters.length === 0
      ? insights
      : insights.filter((insight) => selectedFilters.includes(insight.type))

  const TrendIcon = ({ direction }: { direction: TrendDirection }) => {
    if (direction === 'up') {
      return <TrendingUp className="h-4 w-4 text-green-600" />
    }
    if (direction === 'down') {
      return <TrendingDown className="h-4 w-4 text-red-600" />
    }
    return <AlertCircle className="h-4 w-4 text-slate-400" />
  }

  const getHealthScoreColor = (score: number) => {
    if (score >= 75) return 'text-green-600'
    if (score >= 50) return 'text-orange-600'
    return 'text-red-600'
  }

  const getHealthScoreBg = (score: number) => {
    if (score >= 75) return 'bg-green-100'
    if (score >= 50) return 'bg-orange-100'
    return 'bg-red-100'
  }

  return (
    <div className="space-y-6">
      {/* Header with Health Score and Refresh */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <div className={cn('rounded-lg p-4', getHealthScoreBg(healthScore))}>
            <div className="flex flex-col items-center">
              <span className="text-xs font-semibold uppercase text-slate-600">
                Campaign Health
              </span>
              <span className={cn('text-3xl font-bold', getHealthScoreColor(healthScore))}>
                {healthScore}
              </span>
            </div>
          </div>
          {lastAnalyzed && (
            <div className="flex flex-col text-sm">
              <span className="text-slate-600">Last analyzed</span>
              <span className="font-medium text-slate-900">
                {lastAnalyzed.toLocaleDateString('en-GB', {
                  month: 'short',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </span>
            </div>
          )}
        </div>
        <Button
          onClick={handleRefresh}
          disabled={refreshing}
          variant="outline"
          size="default"
          className="gap-2"
        >
          <RefreshCw className={cn('h-4 w-4', refreshing && 'animate-spin')} />
          {refreshing ? 'Refreshing...' : 'Refresh Insights'}
        </Button>
      </div>

      {/* Category Filter */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-slate-600" />
          <span className="text-sm font-medium text-slate-700">Filter by Category</span>
        </div>
        <div className="flex flex-wrap gap-2">
          {(Object.keys(INSIGHT_TYPE_LABELS) as InsightType[]).map((type) => (
            <button
              key={type}
              onClick={() => toggleFilter(type)}
              className={cn(
                'rounded-full px-3 py-1.5 text-sm font-medium transition-colors',
                selectedFilters.includes(type)
                  ? 'bg-violet-600 text-white'
                  : 'bg-slate-200 text-slate-700 hover:bg-slate-300'
              )}
            >
              {INSIGHT_TYPE_LABELS[type]}
            </button>
          ))}
        </div>
      </div>

      {/* Error State */}
      {error && (
        <div className="rounded-lg border border-red-300 bg-red-50 p-4 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-violet-600" />
        </div>
      )}

      {/* Empty State */}
      {!loading && filteredInsights.length === 0 && !error && (
        <div className="rounded-lg border-2 border-dashed border-slate-300 p-8 text-center">
          <Zap className="mx-auto h-8 w-8 text-slate-400" />
          <p className="mt-2 text-sm text-slate-600">
            {selectedFilters.length > 0
              ? 'No insights found in selected categories'
              : 'No insights available yet. Check back after more campaign activity.'}
          </p>
        </div>
      )}

      {/* Insights Grid */}
      <div className="space-y-4">
        {filteredInsights.map((insight) => (
          <div
            key={insight.id}
            className={cn(
              'rounded-lg border border-slate-200 p-5 transition-shadow hover:shadow-md',
              IMPACT_BG[insight.impact_level]
            )}
          >
            {/* Header */}
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <div className="mb-2 flex items-center gap-3">
                  <span
                    className={cn(
                      'rounded-full px-2.5 py-1 text-xs font-semibold',
                      IMPACT_COLORS[insight.impact_level]
                    )}
                  >
                    {insight.impact_level === 'high'
                      ? 'High Impact'
                      : insight.impact_level === 'medium'
                        ? 'Medium Impact'
                        : 'Low Impact'}
                  </span>
                  <span className="text-xs font-medium uppercase text-slate-600">
                    {INSIGHT_TYPE_LABELS[insight.type]}
                  </span>
                </div>
                <h3 className="text-base font-semibold text-slate-900">{insight.title}</h3>
              </div>
              <div className="flex items-center gap-1">
                <TrendIcon direction={insight.trend_direction} />
                {insight.trend_value !== undefined && (
                  <span
                    className={cn(
                      'text-sm font-medium',
                      insight.trend_direction === 'up'
                        ? 'text-green-600'
                        : insight.trend_direction === 'down'
                          ? 'text-red-600'
                          : 'text-slate-500'
                    )}
                  >
                    {insight.trend_value > 0 ? '+' : ''}{insight.trend_value}%
                  </span>
                )}
              </div>
            </div>

            {/* Description */}
            <p className="mt-3 text-sm text-slate-700">{insight.description}</p>

            {/* Recommendations */}
            {insight.recommendations && insight.recommendations.length > 0 && (
              <div className="mt-4 space-y-2">
                <p className="text-xs font-semibold uppercase text-slate-600">Recommendations</p>
                {insight.recommendations.map((rec) => (
                  <div
                    key={rec.id}
                    className="rounded bg-white p-3 text-sm transition-colors hover:bg-slate-50"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1">
                        <p className="font-medium text-slate-900">{rec.title}</p>
                        <p className="mt-1 text-xs text-slate-600">{rec.action}</p>
                        <div className="mt-2 flex items-center gap-2">
                          <span
                            className={cn(
                              'rounded px-2 py-0.5 text-xs font-medium',
                              rec.difficulty === 'easy'
                                ? 'bg-green-100 text-green-700'
                                : rec.difficulty === 'medium'
                                  ? 'bg-amber-100 text-amber-700'
                                  : 'bg-red-100 text-red-700'
                            )}
                          >
                            {rec.difficulty === 'easy'
                              ? 'Easy'
                              : rec.difficulty === 'medium'
                                ? 'Medium'
                                : 'Hard'}
                          </span>
                          <span className="text-xs text-slate-600">
                            Potential: {rec.potential_impact}
                          </span>
                        </div>
                      </div>
                      <Button
                        onClick={() => onApplyRecommendation?.(rec)}
                        variant="secondary"
                        size="sm"
                        className="mt-1 shrink-0 gap-1"
                      >
                        <CheckCircle2 className="h-4 w-4" />
                        <span className="hidden sm:inline">Apply</span>
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
