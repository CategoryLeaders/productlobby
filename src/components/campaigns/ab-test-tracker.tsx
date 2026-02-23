'use client'

import React, { useState, useEffect } from 'react'
import { FlaskConical, BarChart3, Trophy, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface Variant {
  name: string
  views: number
  conversions: number
  conversionRate: number
}

interface ABTestData {
  variantA: Variant
  variantB: Variant
  winner?: 'A' | 'B' | null
  confidence: number
}

interface ABTestTrackerProps {
  campaignId: string
  isCreator?: boolean
}

export const ABTestTracker: React.FC<ABTestTrackerProps> = ({
  campaignId,
  isCreator = false,
}) => {
  const [data, setData] = useState<ABTestData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchABTestData = async () => {
      try {
        setLoading(true)
        const response = await fetch(`/api/campaigns/${campaignId}/ab-tests`)
        if (response.ok) {
          const result = await response.json()
          setData(result.data)
          setError(null)
        } else {
          setError('Failed to load A/B test data')
        }
      } catch (err) {
        console.error('Error fetching A/B test data:', err)
        setError('Error loading A/B test data')
      } finally {
        setLoading(false)
      }
    }

    fetchABTestData()
  }, [campaignId])

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="w-6 h-6 text-violet-600 animate-spin" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <p className="text-red-800">{error}</p>
      </div>
    )
  }

  if (!data) {
    return (
      <div className="bg-slate-50 border border-slate-200 rounded-lg p-8 text-center">
        <p className="text-slate-600">No A/B test data available</p>
      </div>
    )
  }

  const maxViews = Math.max(data.variantA.views, data.variantB.views) || 1
  const maxConversions = Math.max(data.variantA.conversions, data.variantB.conversions) || 1

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <FlaskConical className="w-6 h-6 text-violet-600" />
        <h3 className="text-lg font-semibold text-slate-900">A/B Test Tracker</h3>
      </div>

      {/* Variants Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Variant A */}
        <div className={cn(
          'border rounded-lg p-6 space-y-4',
          data.winner === 'A' ? 'border-lime-300 bg-lime-50' : 'border-slate-200 bg-white'
        )}>
          <div className="flex items-center justify-between">
            <h4 className="font-semibold text-slate-900">Variant A</h4>
            {data.winner === 'A' && (
              <span className="flex items-center gap-1 bg-lime-600 text-white text-xs font-semibold px-2 py-1 rounded-full">
                <Trophy className="w-3 h-3" />
                Winner
              </span>
            )}
          </div>

          {/* Views Bar */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-600">Views</span>
              <span className="font-semibold text-slate-900">{data.variantA.views}</span>
            </div>
            <div className="w-full bg-slate-200 rounded-full h-2">
              <div
                className="bg-violet-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${(data.variantA.views / maxViews) * 100}%` }}
              />
            </div>
          </div>

          {/* Conversions Bar */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-600">Conversions</span>
              <span className="font-semibold text-slate-900">{data.variantA.conversions}</span>
            </div>
            <div className="w-full bg-slate-200 rounded-full h-2">
              <div
                className="bg-violet-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${(data.variantA.conversions / maxConversions) * 100}%` }}
              />
            </div>
          </div>

          {/* Conversion Rate */}
          <div className="bg-violet-100 rounded-lg p-3 border border-violet-200">
            <p className="text-xs text-violet-600 mb-1">Conversion Rate</p>
            <p className="text-2xl font-bold text-violet-900">
              {data.variantA.conversionRate.toFixed(2)}%
            </p>
          </div>
        </div>

        {/* Variant B */}
        <div className={cn(
          'border rounded-lg p-6 space-y-4',
          data.winner === 'B' ? 'border-lime-300 bg-lime-50' : 'border-slate-200 bg-white'
        )}>
          <div className="flex items-center justify-between">
            <h4 className="font-semibold text-slate-900">Variant B</h4>
            {data.winner === 'B' && (
              <span className="flex items-center gap-1 bg-lime-600 text-white text-xs font-semibold px-2 py-1 rounded-full">
                <Trophy className="w-3 h-3" />
                Winner
              </span>
            )}
          </div>

          {/* Views Bar */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-600">Views</span>
              <span className="font-semibold text-slate-900">{data.variantB.views}</span>
            </div>
            <div className="w-full bg-slate-200 rounded-full h-2">
              <div
                className="bg-violet-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${(data.variantB.views / maxViews) * 100}%` }}
              />
            </div>
          </div>

          {/* Conversions Bar */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-600">Conversions</span>
              <span className="font-semibold text-slate-900">{data.variantB.conversions}</span>
            </div>
            <div className="w-full bg-slate-200 rounded-full h-2">
              <div
                className="bg-violet-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${(data.variantB.conversions / maxConversions) * 100}%` }}
              />
            </div>
          </div>

          {/* Conversion Rate */}
          <div className="bg-violet-100 rounded-lg p-3 border border-violet-200">
            <p className="text-xs text-violet-600 mb-1">Conversion Rate</p>
            <p className="text-2xl font-bold text-violet-900">
              {data.variantB.conversionRate.toFixed(2)}%
            </p>
          </div>
        </div>
      </div>

      {/* Comparison Section */}
      <div className="bg-slate-50 border border-slate-200 rounded-lg p-6 space-y-4">
        <div className="flex items-center gap-2">
          <BarChart3 className="w-5 h-5 text-violet-600" />
          <h4 className="font-semibold text-slate-900">Comparison</h4>
        </div>

        {/* Confidence Level */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm text-slate-600">Statistical Confidence</span>
            <span className="font-bold text-slate-900">{data.confidence}%</span>
          </div>
          <div className="w-full bg-slate-200 rounded-full h-3">
            <div
              className={cn(
                'h-3 rounded-full transition-all duration-300',
                data.confidence >= 95
                  ? 'bg-lime-600'
                  : data.confidence >= 75
                    ? 'bg-violet-600'
                    : 'bg-amber-500'
              )}
              style={{ width: `${Math.min(data.confidence, 100)}%` }}
            />
          </div>
          <p className="text-xs text-slate-500 mt-2">
            {data.confidence >= 95
              ? 'Strong confidence in winner'
              : data.confidence >= 75
                ? 'Moderate confidence in winner'
                : 'Low confidence - continue testing'}
          </p>
        </div>

        {/* Winner Badge */}
        {data.winner ? (
          <div className={cn(
            'rounded-lg p-4 flex items-center gap-3',
            data.winner === 'A'
              ? 'bg-lime-100 border border-lime-300'
              : 'bg-lime-100 border border-lime-300'
          )}>
            <Trophy className="w-5 h-5 text-lime-700" />
            <div>
              <p className="font-semibold text-lime-900">
                Variant {data.winner} is the Winner
              </p>
              <p className="text-sm text-lime-800">
                {data.winner === 'A' 
                  ? `${((data.variantA.conversionRate - data.variantB.conversionRate) / data.variantB.conversionRate * 100).toFixed(1)}% higher conversion rate`
                  : `${((data.variantB.conversionRate - data.variantA.conversionRate) / data.variantA.conversionRate * 100).toFixed(1)}% higher conversion rate`
                }
              </p>
            </div>
          </div>
        ) : (
          <div className="bg-amber-50 rounded-lg p-4 border border-amber-300">
            <p className="text-sm text-amber-900">
              No clear winner yet. Continue testing to gather more data.
            </p>
          </div>
        )}
      </div>

      {/* Creator Controls */}
      {isCreator && (
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            className="text-violet-600 border-violet-300 hover:bg-violet-50"
          >
            Reset Test
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="text-violet-600 border-violet-300 hover:bg-violet-50"
          >
            View Details
          </Button>
        </div>
      )}
    </div>
  )
}
