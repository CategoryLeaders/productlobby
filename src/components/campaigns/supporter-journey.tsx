'use client'

import React, { useState, useEffect } from 'react'
import { Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'

interface FunnelStep {
  name: string
  count: number
  conversionRate: number
}

interface JourneyData {
  funnel: FunnelStep[]
}

interface SupporterJourneyProps {
  campaignId: string
}

export function SupporterJourney({ campaignId }: SupporterJourneyProps) {
  const [data, setData] = useState<JourneyData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchJourney = async () => {
      try {
        setLoading(true)
        const response = await fetch(
          `/api/campaigns/${campaignId}/journey`,
          {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' },
          }
        )

        if (!response.ok) {
          throw new Error('Failed to fetch journey data')
        }

        const result = await response.json()
        setData(result.data)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error')
      } finally {
        setLoading(false)
      }
    }

    fetchJourney()
  }, [campaignId])

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12 bg-gradient-to-b from-violet-50 to-white rounded-lg border border-violet-200">
        <div className="text-center space-y-3">
          <Loader2 className="w-8 h-8 animate-spin text-violet-600 mx-auto" />
          <p className="text-gray-600 text-sm">Loading journey data...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-6 bg-red-50 border border-red-200 rounded-lg">
        <p className="text-red-600 font-medium">Error: {error}</p>
      </div>
    )
  }

  if (!data || !data.funnel || data.funnel.length === 0) {
    return (
      <div className="p-6 bg-gray-50 border border-gray-200 rounded-lg">
        <p className="text-gray-600">No journey data available yet</p>
      </div>
    )
  }

  // Find the max count for scaling
  const maxCount = Math.max(...data.funnel.map((s) => s.count), 1)

  return (
    <div className="bg-white rounded-lg border border-violet-200 p-8 space-y-8">
      {/* Header */}
      <div className="space-y-2">
        <h2 className="text-2xl font-bold text-gray-900">Supporter Journey</h2>
        <p className="text-gray-600">
          Visualize how supporters move through each stage of engagement
        </p>
      </div>

      {/* Funnel Visualization */}
      <div className="space-y-6">
        {data.funnel.map((step, idx) => {
          // Calculate width percentage (narrowing funnel effect)
          const widthPercent =
            100 * (1 - (idx / (data.funnel.length - 1 || 1)) * 0.7)

          return (
            <div key={idx} className="space-y-2">
              {/* Step Label and Metrics */}
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <h3 className="text-sm font-bold text-gray-900">
                    {step.name}
                  </h3>
                </div>
                <div className="flex items-center gap-4 ml-4">
                  <div className="text-right">
                    <p className="text-2xl font-bold text-violet-600">
                      {step.count.toLocaleString()}
                    </p>
                    <p className="text-xs text-gray-500">
                      {step.conversionRate.toFixed(1)}% conversion
                    </p>
                  </div>
                </div>
              </div>

              {/* Funnel Bar */}
              <div className="flex justify-center">
                <div
                  className={cn(
                    'h-16 rounded-lg transition-all duration-300 relative overflow-hidden shadow-sm',
                    'bg-gradient-to-r from-violet-600 to-lime-500',
                    idx === 0 && 'border-2 border-violet-600'
                  )}
                  style={{
                    width: `${widthPercent}%`,
                    maxWidth: '100%',
                  }}
                >
                  {/* Shimmer effect */}
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-20 animate-pulse"></div>
                </div>
              </div>

              {/* Drop-off Indicator */}
              {idx < data.funnel.length - 1 && (
                <div className="flex justify-center">
                  <div className="text-center space-y-1">
                    <div className="text-2xl text-red-500 font-bold">↓</div>
                    <p className="text-xs text-red-600 font-medium">
                      {(
                        ((data.funnel[idx].count -
                          data.funnel[idx + 1].count) /
                          data.funnel[idx].count) *
                        100
                      ).toFixed(1)}
                      % drop-off
                    </p>
                  </div>
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* Summary Stats */}
      <div className="bg-gradient-to-r from-violet-50 to-lime-50 rounded-lg border border-violet-200 p-6 grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="space-y-1">
          <p className="text-sm text-gray-600">Total Visitors</p>
          <p className="text-3xl font-bold text-violet-600">
            {data.funnel[0]?.count.toLocaleString() || 0}
          </p>
        </div>
        <div className="space-y-1">
          <p className="text-sm text-gray-600">End Stage Supporters</p>
          <p className="text-3xl font-bold text-lime-600">
            {data.funnel[data.funnel.length - 1]?.count.toLocaleString() || 0}
          </p>
        </div>
        <div className="space-y-1">
          <p className="text-sm text-gray-600">Overall Conversion</p>
          <p className="text-3xl font-bold text-amber-600">
            {data.funnel.length > 0
              ? (
                  (data.funnel[data.funnel.length - 1]?.count /
                    data.funnel[0]?.count) *
                  100
                ).toFixed(1)
              : '0'}
            %
          </p>
        </div>
      </div>

      {/* Journey Stage Description */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 space-y-4">
        <h3 className="text-sm font-bold text-blue-900">Understanding the Journey</h3>
        <div className="text-xs text-blue-800 space-y-2">
          <p>
            <span className="font-semibold">Page View:</span> Initial campaign
            exposure
          </p>
          <p>
            <span className="font-semibold">Interest:</span> Active engagement
            with content
          </p>
          <p>
            <span className="font-semibold">Lobby:</span> Expressed support or
            shared campaign
          </p>
          <p>
            <span className="font-semibold">Share:</span> Social sharing or
            referral
          </p>
          <p>
            <span className="font-semibold">Pledge:</span> Committed support or
            purchase intent
          </p>
          <p>
            <span className="font-semibold">Advocate:</span> Ongoing promotion
            and engagement
          </p>
        </div>
      </div>
    </div>
  )
}
