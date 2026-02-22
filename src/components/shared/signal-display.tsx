'use client'

import React, { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Spinner } from '@/components/ui/spinner'
import { SignalGauge } from './signal-gauge'
import { LobbyBreakdownBar } from './lobby-breakdown-bar'
import { formatCurrency, formatNumber } from '@/lib/utils'
import { ArrowUp, ArrowDown, ArrowRight } from 'lucide-react'

interface SignalDisplayProps {
  campaignId: string
  compact?: boolean
}

interface SignalScoreResponse {
  campaignId: string
  campaignTitle: string
  score: number
  tier: 'low' | 'medium' | 'high' | 'very_high'
  thresholds: {
    TRENDING: number
    NOTIFY_BRAND: number
    HIGH_SIGNAL: number
    SUGGEST_OFFER: number
  }
  projection: {
    projectedCustomers: number
    projectedRevenue: number
    medianPrice: number
    p90Price: number
    conversionRates: {
      NEAT_IDEA: number
      PROBABLY_BUY: number
      TAKE_MY_MONEY: number
    }
  }
  lobbies: {
    neatIdea: number
    probablyBuy: number
    takeMyMoney: number
    total: number
    conviction: number
  }
  pledges: {
    support: number
    intent: number
    intentVerified: number
  }
  momentum: {
    value: number
    last7Days: number
    prev7Days: number
    trend: 'growing' | 'declining' | 'stable'
  }
  completeness: number
  demandValue: number
  actionSuggestion: string
  updatedAt: string
}

const getTierBadge = (tier: string): { label: string; variant: string } => {
  switch (tier) {
    case 'very_high':
      return { label: 'Strong Demand', variant: 'success' }
    case 'high':
      return { label: 'High Signal', variant: 'success' }
    case 'medium':
      return { label: 'Trending', variant: 'warning' }
    case 'low':
      return { label: 'Early Stage', variant: 'default' }
    default:
      return { label: 'Unknown', variant: 'outline' }
  }
}

const getMomentumIcon = (trend: string) => {
  switch (trend) {
    case 'growing':
      return <ArrowUp className="w-4 h-4 text-green-600" />
    case 'declining':
      return <ArrowDown className="w-4 h-4 text-red-600" />
    case 'stable':
      return <ArrowRight className="w-4 h-4 text-gray-500" />
    default:
      return null
  }
}

const getMomentumLabel = (trend: string) => {
  switch (trend) {
    case 'growing':
      return 'Growing'
    case 'declining':
      return 'Declining'
    case 'stable':
      return 'Stable'
    default:
      return 'Unknown'
  }
}

export const SignalDisplay: React.FC<SignalDisplayProps> = ({ campaignId, compact = false }) => {
  const [data, setData] = useState<SignalScoreResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchSignalScore = async () => {
      try {
        setLoading(true)
        setError(null)

        const response = await fetch(`/api/campaigns/${campaignId}/signal-score`)

        if (!response.ok) {
          throw new Error('Failed to fetch signal score')
        }

        const result: SignalScoreResponse = await response.json()
        setData(result)
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Unknown error'
        setError(message)
        console.error('Error fetching signal score:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchSignalScore()
  }, [campaignId])

  // Compact mode - single row display
  if (compact) {
    if (loading) {
      return (
        <div className="flex items-center justify-center p-4">
          <Spinner size="sm" />
        </div>
      )
    }

    if (error || !data) {
      return (
        <div className="text-xs text-gray-500">
          {error ? 'Signal unavailable' : 'No data'}
        </div>
      )
    }

    const tierInfo = getTierBadge(data.tier)

    return (
      <div className="flex items-center gap-3">
        <div className="text-center">
          <div className="text-xl font-bold text-violet-600">{data.score}</div>
          <div className="text-xs text-gray-500">Signal</div>
        </div>
        <Badge variant={tierInfo.variant as any}>{tierInfo.label}</Badge>
        <div className="text-xs text-gray-600">
          <strong>{data.lobbies.total}</strong> lobbies
        </div>
      </div>
    )
  }

  // Full mode - detailed display
  if (loading) {
    return (
      <Card>
        <CardContent className="p-12 flex items-center justify-center">
          <Spinner />
        </CardContent>
      </Card>
    )
  }

  if (error || !data) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center text-gray-600">
            {error ? `Error: ${error}` : 'No signal data available'}
          </div>
        </CardContent>
      </Card>
    )
  }

  const tierInfo = getTierBadge(data.tier)

  return (
    <Card variant="default" className="border-gray-200">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="text-xl mb-2">Crowd Demand Signal</CardTitle>
            <p className="text-sm text-gray-600">Wisdom of the crowd — real-time market signal</p>
          </div>
          <Badge variant={tierInfo.variant as any} className="text-base px-3 py-1">
            {tierInfo.label}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-8">
        {/* Signal Score Gauge */}
        <div>
          <h3 className="text-sm font-semibold text-gray-900 mb-4">Signal Score</h3>
          <div className="flex justify-center">
            <SignalGauge score={data.score} size="md" />
          </div>
        </div>

        {/* Lobby Intensity Breakdown */}
        <div>
          <h3 className="text-sm font-semibold text-gray-900 mb-3">Lobby Conviction Breakdown</h3>
          <LobbyBreakdownBar
            neatIdea={data.lobbies.neatIdea}
            probablyBuy={data.lobbies.probablyBuy}
            takeMyMoney={data.lobbies.takeMyMoney}
            showLabels={true}
          />
          <p className="text-xs text-gray-600 mt-3">
            Average conviction strength: <strong>{data.lobbies.conviction.toFixed(1)}/5</strong>
          </p>
        </div>

        {/* Price Ceiling Distribution */}
        <div>
          <h3 className="text-sm font-semibold text-gray-900 mb-3">Price Ceiling Distribution</h3>
          <div className="bg-gray-50 rounded-lg p-4 space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-700">Median Price</span>
              <span className="font-semibold text-gray-900">
                {data.projection.medianPrice > 0
                  ? formatCurrency(data.projection.medianPrice, 'GBP')
                  : 'Not set'}
              </span>
            </div>
            <div className="h-px bg-gray-200" />
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-700">P90 Price (top 10%)</span>
              <span className="font-semibold text-gray-900">
                {data.projection.p90Price > 0
                  ? formatCurrency(data.projection.p90Price, 'GBP')
                  : 'Not set'}
              </span>
            </div>

            {data.projection.medianPrice > 0 && (
              <div className="mt-4 pt-3 border-t border-gray-200">
                <p className="text-sm text-gray-700">
                  <strong>People would pay up to {formatCurrency(data.projection.p90Price, 'GBP')}</strong>
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Momentum Indicator */}
        <div>
          <h3 className="text-sm font-semibold text-gray-900 mb-3">Momentum</h3>
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-center gap-3 mb-3">
              {getMomentumIcon(data.momentum.trend)}
              <span className="font-medium text-gray-900">{getMomentumLabel(data.momentum.trend)}</span>
            </div>
            <p className="text-sm text-gray-700">
              <strong>{data.momentum.last7Days}</strong> new intent pledges this week
            </p>
            <p className="text-xs text-gray-600 mt-1">
              Previous week: <strong>{data.momentum.prev7Days}</strong>
            </p>
          </div>
        </div>

        {/* Projected Revenue Box (for brands) */}
        {data.projection.projectedRevenue > 0 && (
          <div className="bg-lime-50 border border-lime-200 rounded-lg p-4">
            <h3 className="text-sm font-semibold text-lime-900 mb-2">Revenue Projection</h3>
            <p className="text-sm text-lime-800">
              If built, estimated{' '}
              <strong>{formatNumber(data.projection.projectedCustomers)}</strong> customers at{' '}
              <strong>~{formatCurrency(data.projection.medianPrice, 'GBP')}</strong> median = <strong className="text-base">{formatCurrency(data.projection.projectedRevenue, 'GBP')}</strong> projected revenue
            </p>
          </div>
        )}

        {/* Action Suggestion */}
        <div className="bg-violet-50 border border-violet-200 rounded-lg p-4">
          <p className="text-sm text-violet-900">
            <strong>Next Step:</strong> {data.actionSuggestion}
          </p>
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-200">
          <div>
            <p className="text-xs text-gray-600 mb-1">Total Lobbies</p>
            <p className="text-lg font-bold text-gray-900">{data.lobbies.total}</p>
          </div>
          <div>
            <p className="text-xs text-gray-600 mb-1">Intent Pledges</p>
            <p className="text-lg font-bold text-gray-900">{data.pledges.intent}</p>
          </div>
          <div>
            <p className="text-xs text-gray-600 mb-1">Completeness</p>
            <p className="text-lg font-bold text-gray-900">{data.completeness}%</p>
          </div>
          <div>
            <p className="text-xs text-gray-600 mb-1">Demand Value</p>
            <p className="text-lg font-bold text-gray-900">
              {formatCurrency(data.demandValue, 'GBP')}
            </p>
          </div>
        </div>

        {/* Updated timestamp */}
        <div className="text-center pt-4 border-t border-gray-200">
          <p className="text-xs text-gray-500">
            Updated {new Date(data.updatedAt).toLocaleTimeString('en-GB', {
              hour: '2-digit',
              minute: '2-digit',
            })}
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
