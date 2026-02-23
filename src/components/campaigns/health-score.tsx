'use client'

import React, { useEffect, useState } from 'react'
import { Activity, Heart, TrendingUp, Clock, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'

interface HealthMetrics {
  engagement: number
  growth: number
  completion: number
  freshness: number
}

interface HealthScoreData {
  score: number
  metrics: HealthMetrics
}

interface HealthScoreProps {
  campaignId: string
}

function getScoreColor(score: number): string {
  if (score >= 80) return '#10B981' // green
  if (score >= 50) return '#F59E0B' // yellow
  return '#EF4444' // red
}

function getScoreBgColor(score: number): string {
  if (score >= 80) return 'bg-green-50 border-green-200'
  if (score >= 50) return 'bg-yellow-50 border-yellow-200'
  return 'bg-red-50 border-red-200'
}

function getScoreTextColor(score: number): string {
  if (score >= 80) return 'text-green-700'
  if (score >= 50) return 'text-yellow-700'
  return 'text-red-700'
}

function CircularHealthRing({ score, size = 140 }: { score: number; size?: number }) {
  const [animatedScore, setAnimatedScore] = useState(0)
  const strokeWidth = 10
  const radius = (size - strokeWidth) / 2
  const circumference = 2 * Math.PI * radius
  const offset = circumference - (animatedScore / 100) * circumference
  const color = getScoreColor(animatedScore)

  useEffect(() => {
    let frame: number
    const duration = 1200
    const start = performance.now()

    const animate = (now: number) => {
      const elapsed = now - start
      const progress = Math.min(elapsed / duration, 1)
      // Ease out cubic
      const eased = 1 - Math.pow(1 - progress, 3)
      setAnimatedScore(Math.round(score * eased))
      if (progress < 1) {
        frame = requestAnimationFrame(animate)
      }
    }

    frame = requestAnimationFrame(animate)
    return () => cancelAnimationFrame(frame)
  }, [score])

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        {/* Background circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="#E5E7EB"
          strokeWidth={strokeWidth}
        />
        {/* Progress circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          style={{
            transition: 'stroke-dashoffset 0.35s ease, stroke 0.35s ease',
          }}
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="text-center">
          <div className={cn('text-3xl font-bold', getScoreTextColor(animatedScore))}>
            {animatedScore}
          </div>
          <div className="text-xs text-gray-500 mt-1">Health Score</div>
        </div>
      </div>
    </div>
  )
}

function MetricBar({ label, value, icon: Icon }: { label: string; value: number; icon: React.ReactNode }) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="text-gray-600">{Icon}</div>
          <span className="text-sm font-medium text-gray-700">{label}</span>
        </div>
        <span className="text-sm font-semibold text-gray-900">{value}</span>
      </div>
      <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-green-400 to-green-600 rounded-full transition-all duration-500"
          style={{ width: `${value}%` }}
        />
      </div>
    </div>
  )
}

export const HealthScore: React.FC<HealthScoreProps> = ({ campaignId }) => {
  const [data, setData] = useState<HealthScoreData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [expandedMetric, setExpandedMetric] = useState<string | null>(null)

  useEffect(() => {
    const fetchHealthScore = async () => {
      try {
        setLoading(true)
        const response = await fetch(`/api/campaigns/${campaignId}/health`)
        if (!response.ok) throw new Error('Failed to fetch health score')
        const result = await response.json()
        setData(result)
        setError(null)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred')
        setData(null)
      } finally {
        setLoading(false)
      }
    }

    fetchHealthScore()
  }, [campaignId])

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
      </div>
    )
  }

  if (error || !data) {
    return (
      <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
        <p className="text-sm text-red-700">{error || 'Failed to load health score'}</p>
      </div>
    )
  }

  const getHealthStatus = (score: number): string => {
    if (score >= 80) return 'Excellent'
    if (score >= 50) return 'Fair'
    return 'Needs Improvement'
  }

  const getStatusDescription = (score: number): string => {
    if (score >= 80)
      return 'Your campaign is performing exceptionally well across all metrics.'
    if (score >= 50) return 'Your campaign is performing adequately. Some areas could be improved.'
    return 'Your campaign needs attention in several areas. Consider making updates.'
  }

  return (
    <div className={cn('p-6 rounded-lg border', getScoreBgColor(data.score))}>
      {/* Header */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-900">Campaign Health Score</h3>
        <p className="text-sm text-gray-600 mt-1">{getStatusDescription(data.score)}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Score Ring */}
        <div className="flex flex-col items-center justify-center">
          <CircularHealthRing score={data.score} size={140} />
          <div className={cn('mt-4 text-center text-sm font-medium', getScoreTextColor(data.score))}>
            {getHealthStatus(data.score)}
          </div>
          <p className="text-xs text-gray-500 mt-2 max-w-xs text-center">
            Based on engagement, growth, content completion, and freshness metrics
          </p>
        </div>

        {/* Metrics Breakdown */}
        <div className="space-y-4">
          <MetricBar
            label="Engagement Rate"
            value={data.metrics.engagement}
            icon={<Heart className="w-4 h-4" />}
          />
          <MetricBar
            label="Growth Momentum"
            value={data.metrics.growth}
            icon={<TrendingUp className="w-4 h-4" />}
          />
          <MetricBar
            label="Content Completion"
            value={data.metrics.completion}
            icon={<Activity className="w-4 h-4" />}
          />
          <MetricBar
            label="Content Freshness"
            value={data.metrics.freshness}
            icon={<Clock className="w-4 h-4" />}
          />
        </div>
      </div>

      {/* Tooltips Section */}
      <div className="mt-6 pt-6 border-t border-gray-200">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
          <div className="p-3 bg-white/50 rounded border border-gray-200">
            <div className="font-medium text-gray-900">Engagement Rate</div>
            <div className="text-gray-600 mt-1">
              Percentage of supporters who interact with your campaign content
            </div>
          </div>
          <div className="p-3 bg-white/50 rounded border border-gray-200">
            <div className="font-medium text-gray-900">Growth Momentum</div>
            <div className="text-gray-600 mt-1">How quickly your supporter base is expanding</div>
          </div>
          <div className="p-3 bg-white/50 rounded border border-gray-200">
            <div className="font-medium text-gray-900">Content Completion</div>
            <div className="text-gray-600 mt-1">Percentage of campaign details filled out</div>
          </div>
          <div className="p-3 bg-white/50 rounded border border-gray-200">
            <div className="font-medium text-gray-900">Content Freshness</div>
            <div className="text-gray-600 mt-1">Recency of updates and new information</div>
          </div>
        </div>
      </div>
    </div>
  )
}
