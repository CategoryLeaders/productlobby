'use client'

import React, { useEffect, useState } from 'react'
import { cn } from '@/lib/utils'

interface PricingBracket {
  bracket: string
  count: number
  percentage: number
}

interface SuggestedPricePoints {
  economy: number
  standard: number
  premium: number
}

interface IntensityPricing {
  neatIdea: { avg: number; count: number }
  probablyBuy: { avg: number; count: number }
  takeMyMoney: { avg: number; count: number }
}

interface DemandPoint {
  price: number
  estimatedBuyers: number
}

interface PricingAnalysisData {
  totalResponses: number
  averagePrice: number
  medianPrice: number
  modePrice: number
  priceRange: { min: number; max: number }
  distribution: PricingBracket[]
  suggestedPricePoints: SuggestedPricePoints
  byIntensity: IntensityPricing
  demandCurve: DemandPoint[]
  optimalPrice: number
  maxRevenue: number
}

interface PricingInsightsProps {
  campaignId: string
}

export function PricingInsights({ campaignId }: PricingInsightsProps) {
  const [data, setData] = useState<PricingAnalysisData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchPricingData = async () => {
      try {
        const response = await fetch(`/api/campaigns/${campaignId}/pricing`)
        if (!response.ok) {
          throw new Error('Failed to fetch pricing data')
        }
        const result = await response.json()
        setData(result)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred')
      } finally {
        setLoading(false)
      }
    }

    fetchPricingData()
  }, [campaignId])

  if (loading) {
    return <PricingInsightsSkeleton />
  }

  if (error) {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 p-6">
        <p className="text-red-800">Error loading pricing insights: {error}</p>
      </div>
    )
  }

  if (!data || data.totalResponses === 0) {
    return <PricingInsightsEmpty />
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="border-b border-gray-200 pb-6">
        <h2 className="mb-2 text-2xl font-bold text-gray-900">
          Pricing Expectations & Willingness-to-Pay
        </h2>
        <p className="text-gray-600">
          Analysis based on {data.totalResponses} price ceiling responses
        </p>
      </div>

      {/* Price Range Bar */}
      <PriceRangeBar data={data} />

      {/* Key Metrics Grid */}
      <div className="grid gap-4 md:grid-cols-4">
        <MetricCard
          label="Average Price"
          value={`£${data.averagePrice.toFixed(2)}`}
          color="violet"
        />
        <MetricCard
          label="Median Price"
          value={`£${data.medianPrice.toFixed(2)}`}
          color="violet"
        />
        <MetricCard
          label="Mode Price"
          value={`£${data.modePrice.toFixed(2)}`}
          color="lime"
        />
        <MetricCard
          label="Optimal Price"
          value={`£${data.optimalPrice.toFixed(2)}`}
          color="lime"
        />
      </div>

      {/* Distribution Histogram */}
      <DistributionHistogram distribution={data.distribution} />

      {/* Suggested Price Points */}
      <SuggestedPricePoints points={data.suggestedPricePoints} />

      {/* By Intensity Breakdown */}
      <IntensityBreakdown byIntensity={data.byIntensity} />

      {/* Demand Curve */}
      <DemandCurve demandCurve={data.demandCurve} />

      {/* Optimal Price Highlight */}
      <OptimalPriceHighlight
        optimalPrice={data.optimalPrice}
        maxRevenue={data.maxRevenue}
        totalResponses={data.totalResponses}
      />
    </div>
  )
}

function PriceRangeBar({ data }: { data: PricingAnalysisData }) {
  const min = data.priceRange.min
  const max = data.priceRange.max
  const avg = data.averagePrice
  const median = data.medianPrice

  // Calculate percentages for positioning
  const range = max - min || 1
  const avgPercent = ((avg - min) / range) * 100
  const medianPercent = ((median - min) / range) * 100

  return (
    <div className="rounded-lg bg-white p-6 shadow-sm">
      <h3 className="mb-4 text-sm font-semibold text-gray-900">Price Range</h3>

      <div className="space-y-2">
        <div className="relative h-12 rounded-lg bg-gray-100 px-2">
          {/* Range background */}
          <div
            className="absolute top-0 bottom-0 bg-gradient-to-r from-violet-200 to-lime-200 rounded-lg"
            style={{
              left: '4px',
              right: '4px',
            }}
          />

          {/* Average marker */}
          <div
            className="absolute top-1/2 h-6 w-1 -translate-y-1/2 bg-violet-600"
            style={{ left: `${avgPercent}%` }}
          />

          {/* Median marker */}
          <div
            className="absolute top-1/2 h-6 w-1 -translate-y-1/2 bg-lime-500"
            style={{ left: `${medianPercent}%` }}
          />
        </div>

        <div className="flex justify-between text-xs text-gray-600">
          <span>£{min.toFixed(2)}</span>
          <span>£{max.toFixed(2)}</span>
        </div>

        <div className="flex gap-4 text-xs">
          <div className="flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-violet-600" />
            <span>Average: £{avg.toFixed(2)}</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-lime-500" />
            <span>Median: £{median.toFixed(2)}</span>
          </div>
        </div>
      </div>
    </div>
  )
}

function DistributionHistogram({
  distribution,
}: {
  distribution: PricingBracket[]
}) {
  const maxCount = Math.max(...distribution.map((d) => d.count))

  return (
    <div className="rounded-lg bg-white p-6 shadow-sm">
      <h3 className="mb-4 text-sm font-semibold text-gray-900">
        Price Distribution
      </h3>

      <div className="space-y-3">
        {distribution.map((bracket, idx) => (
          <div key={idx} className="flex items-center gap-4">
            <div className="w-16 text-xs font-medium text-gray-700">
              {bracket.bracket}
            </div>

            <div className="flex-1">
              <div className="relative h-6 rounded bg-gray-100">
                {bracket.count > 0 && (
                  <div
                    className="absolute inset-y-0 left-0 rounded bg-gradient-to-r from-violet-500 to-lime-500"
                    style={{
                      width: `${(bracket.count / maxCount) * 100}%`,
                    }}
                  />
                )}
                {bracket.count > 0 && (
                  <span className="absolute inset-0 flex items-center justify-end pr-2 text-xs font-medium text-white">
                    {bracket.count}
                  </span>
                )}
              </div>
            </div>

            <div className="w-12 text-right text-xs text-gray-600">
              {bracket.percentage}%
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function SuggestedPricePoints({
  points,
}: {
  points: SuggestedPricePoints
}) {
  const pricePoints = [
    {
      label: 'Economy',
      description: 'Budget-conscious option',
      price: points.economy,
      color: 'violet',
      icon: '💰',
    },
    {
      label: 'Standard',
      description: 'Most common preference',
      price: points.standard,
      color: 'lime',
      icon: '⭐',
    },
    {
      label: 'Premium',
      description: 'High-value segment',
      price: points.premium,
      color: 'violet',
      icon: '✨',
    },
  ]

  return (
    <div className="rounded-lg bg-white p-6 shadow-sm">
      <h3 className="mb-4 text-sm font-semibold text-gray-900">
        Suggested Price Points
      </h3>

      <div className="grid gap-4 md:grid-cols-3">
        {pricePoints.map((point, idx) => (
          <div
            key={idx}
            className={cn(
              'rounded-lg p-4 border-2',
              point.color === 'violet'
                ? 'border-violet-200 bg-violet-50'
                : 'border-lime-200 bg-lime-50'
            )}
          >
            <div className="mb-2 flex items-center gap-2">
              <span className="text-2xl">{point.icon}</span>
              <div>
                <p className="text-sm font-semibold text-gray-900">
                  {point.label}
                </p>
                <p className="text-xs text-gray-600">{point.description}</p>
              </div>
            </div>
            <p
              className={cn(
                'text-2xl font-bold',
                point.color === 'violet' ? 'text-violet-600' : 'text-lime-500'
              )}
            >
              £{point.price.toFixed(2)}
            </p>
          </div>
        ))}
      </div>
    </div>
  )
}

function IntensityBreakdown({
  byIntensity,
}: {
  byIntensity: IntensityPricing
}) {
  const intensities = [
    {
      label: 'Neat Idea',
      key: 'neatIdea' as const,
      emoji: '💡',
      color: 'gray',
    },
    {
      label: 'Probably Buy',
      key: 'probablyBuy' as const,
      emoji: '🛒',
      color: 'lime',
    },
    {
      label: 'Take My Money',
      key: 'takeMyMoney' as const,
      emoji: '🚀',
      color: 'violet',
    },
  ]

  return (
    <div className="rounded-lg bg-white p-6 shadow-sm">
      <h3 className="mb-4 text-sm font-semibold text-gray-900">
        Willingness-to-Pay by Interest Level
      </h3>

      <div className="grid gap-4 md:grid-cols-3">
        {intensities.map((intensity) => {
          const data = byIntensity[intensity.key]
          return (
            <div
              key={intensity.key}
              className={cn(
                'rounded-lg p-4 border',
                intensity.color === 'violet'
                  ? 'border-violet-200 bg-violet-50'
                  : intensity.color === 'lime'
                    ? 'border-lime-200 bg-lime-50'
                    : 'border-gray-200 bg-gray-50'
              )}
            >
              <div className="mb-3 flex items-center gap-2">
                <span className="text-2xl">{intensity.emoji}</span>
                <p className="text-sm font-semibold text-gray-900">
                  {intensity.label}
                </p>
              </div>

              <p
                className={cn(
                  'text-2xl font-bold mb-1',
                  intensity.color === 'violet'
                    ? 'text-violet-600'
                    : intensity.color === 'lime'
                      ? 'text-lime-500'
                      : 'text-gray-700'
                )}
              >
                £{data.avg.toFixed(2)}
              </p>

              <p className="text-xs text-gray-600">
                {data.count} response{data.count !== 1 ? 's' : ''}
              </p>
            </div>
          )
        })}
      </div>
    </div>
  )
}

function DemandCurve({ demandCurve }: { demandCurve: DemandPoint[] }) {
  if (demandCurve.length === 0) {
    return null
  }

  const maxBuyers = Math.max(...demandCurve.map((d) => d.estimatedBuyers))
  const maxPrice = Math.max(...demandCurve.map((d) => d.price))

  // Create SVG path for the demand curve
  const points = demandCurve.map((d, idx) => {
    const x = (d.price / maxPrice) * 100
    const y = 100 - (d.estimatedBuyers / maxBuyers) * 100
    return `${x},${y}`
  })

  return (
    <div className="rounded-lg bg-white p-6 shadow-sm">
      <h3 className="mb-4 text-sm font-semibold text-gray-900">
        Demand Curve
      </h3>

      <div className="relative h-64 w-full rounded-lg bg-gradient-to-br from-gray-50 to-gray-100 p-4">
        <svg
          className="h-full w-full"
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
        >
          {/* Grid lines */}
          <line x1="0" y1="0" x2="0" y2="100" stroke="#e5e7eb" strokeWidth="0.5" />
          <line x1="0" y1="100" x2="100" y2="100" stroke="#e5e7eb" strokeWidth="0.5" />

          {/* Demand curve */}
          <polyline
            points={points.join(' ')}
            fill="none"
            stroke="url(#demandGradient)"
            strokeWidth="1.5"
          />

          {/* Gradient */}
          <defs>
            <linearGradient
              id="demandGradient"
              x1="0%"
              y1="0%"
              x2="100%"
              y2="0%"
            >
              <stop offset="0%" stopColor="#7c3aed" />
              <stop offset="100%" stopColor="#84cc16" />
            </linearGradient>
          </defs>

          {/* Data points */}
          {demandCurve.map((d, idx) => {
            const x = (d.price / maxPrice) * 100
            const y = 100 - (d.estimatedBuyers / maxBuyers) * 100
            return (
              <circle
                key={idx}
                cx={x}
                cy={y}
                r="1.5"
                fill="#7c3aed"
                opacity="0.6"
              />
            )
          })}
        </svg>

        {/* Axis labels */}
        <div className="absolute bottom-0 left-0 right-0 flex justify-between px-4 pb-1 text-xs text-gray-600">
          <span>£0</span>
          <span>£{maxPrice.toFixed(0)}</span>
        </div>
        <div className="absolute left-0 top-0 bottom-0 flex flex-col justify-between pl-1 text-xs text-gray-600">
          <span>{maxBuyers}</span>
          <span>0</span>
        </div>
      </div>

      <div className="mt-3 text-xs text-gray-600">
        <p>X-axis: Price (£) | Y-axis: Estimated Buyers</p>
      </div>
    </div>
  )
}

function OptimalPriceHighlight({
  optimalPrice,
  maxRevenue,
  totalResponses,
}: {
  optimalPrice: number
  maxRevenue: number
  totalResponses: number
}) {
  const estimatedBuyers = Math.round(maxRevenue / (optimalPrice || 1))

  return (
    <div className="rounded-lg border-2 border-violet-300 bg-gradient-to-br from-violet-50 to-violet-100 p-6">
      <div className="mb-4 flex items-center gap-2">
        <span className="text-2xl">🎯</span>
        <h3 className="text-sm font-semibold text-violet-900">
          Revenue-Maximizing Price
        </h3>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <div>
          <p className="text-xs text-violet-700">Optimal Price Point</p>
          <p className="text-3xl font-bold text-violet-600">
            £{optimalPrice.toFixed(2)}
          </p>
        </div>

        <div>
          <p className="text-xs text-violet-700">Estimated Revenue</p>
          <p className="text-3xl font-bold text-violet-600">
            £{maxRevenue.toFixed(2)}
          </p>
        </div>

        <div>
          <p className="text-xs text-violet-700">Expected Buyers at This Price</p>
          <p className="text-3xl font-bold text-violet-600">
            {estimatedBuyers}
          </p>
          <p className="text-xs text-violet-600 mt-1">
            (~{Math.round((estimatedBuyers / totalResponses) * 100)}% of respondents)
          </p>
        </div>
      </div>

      <p className="mt-4 text-sm text-violet-700">
        This price point maximizes revenue based on current willingness-to-pay
        data. At this price, approximately {estimatedBuyers} supporters are likely
        to purchase.
      </p>
    </div>
  )
}

function MetricCard({
  label,
  value,
  color,
}: {
  label: string
  value: string
  color: 'violet' | 'lime'
}) {
  return (
    <div
      className={cn(
        'rounded-lg p-4 border',
        color === 'violet'
          ? 'border-violet-200 bg-violet-50'
          : 'border-lime-200 bg-lime-50'
      )}
    >
      <p className="text-xs text-gray-600 mb-1">{label}</p>
      <p
        className={cn(
          'text-2xl font-bold',
          color === 'violet' ? 'text-violet-600' : 'text-lime-500'
        )}
      >
        {value}
      </p>
    </div>
  )
}

function PricingInsightsSkeleton() {
  return (
    <div className="space-y-8">
      <div className="h-10 w-64 animate-pulse rounded-lg bg-gray-200" />

      <div className="rounded-lg bg-white p-6 shadow-sm">
        <div className="h-40 animate-pulse rounded-lg bg-gray-200" />
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        {Array.from({ length: 4 }).map((_, idx) => (
          <div
            key={idx}
            className="h-24 animate-pulse rounded-lg bg-gray-200"
          />
        ))}
      </div>

      <div className="h-64 animate-pulse rounded-lg bg-gray-200" />
    </div>
  )
}

function PricingInsightsEmpty() {
  return (
    <div className="rounded-lg border border-gray-200 bg-gray-50 p-8 text-center">
      <div className="mb-3 text-3xl">📊</div>
      <h3 className="mb-2 text-sm font-semibold text-gray-900">
        No Pricing Data Yet
      </h3>
      <p className="text-sm text-gray-600">
        When supporters make pledge intents with price ceilings, pricing insights
        will appear here.
      </p>
    </div>
  )
}
