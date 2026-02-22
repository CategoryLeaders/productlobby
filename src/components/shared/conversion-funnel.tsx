'use client'

import { useState, useEffect } from 'react'
import { ConversionFunnelResult } from '@/lib/conversion-analytics'

interface ConversionFunnelProps {
  campaignId: string
}

export function ConversionFunnel({ campaignId }: ConversionFunnelProps) {
  const [data, setData] = useState<ConversionFunnelResult | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchConversionData = async () => {
      try {
        setLoading(true)
        const response = await fetch(`/api/campaigns/${campaignId}/conversions`)

        if (!response.ok) {
          throw new Error('Failed to load conversion data')
        }

        const result = await response.json()
        setData(result.data)
        setError(null)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Something went wrong')
        setData(null)
      } finally {
        setLoading(false)
      }
    }

    fetchConversionData()
  }, [campaignId])

  if (loading) {
    return (
      <div className="space-y-6">
        {/* Header skeleton */}
        <div className="h-8 bg-gray-200 rounded w-48 animate-pulse" />

        {/* Funnel skeleton */}
        <div className="space-y-3">
          {[100, 75, 50, 25].map((width, i) => (
            <div
              key={i}
              className="h-12 bg-gray-200 rounded animate-pulse"
              style={{ width: `${width}%` }}
            />
          ))}
        </div>

        {/* Stats skeleton */}
        <div className="grid grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="p-4 bg-gray-100 rounded">
              <div className="h-4 bg-gray-200 rounded w-20 mb-2 animate-pulse" />
              <div className="h-6 bg-gray-200 rounded animate-pulse" />
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (error || !data) {
    return (
      <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
        <p className="font-semibold">Error loading conversion data</p>
        <p className="text-sm">{error || 'No data available'}</p>
      </div>
    )
  }

  const { funnel, rates, byIntensity, trends, benchmarks } = data
  const maxVisitors = Math.max(funnel.visitors, 1)

  // Calculate percentages for funnel widths
  const lobbyPercent = (funnel.lobbyists / maxVisitors) * 100
  const pledgePercent = (funnel.pledgers / maxVisitors) * 100
  const orderPercent = (funnel.orderers / maxVisitors) * 100

  // Determine performance color
  const getPerformanceColor = () => {
    switch (benchmarks.campaignPerformance) {
      case 'below':
        return 'bg-red-50 border-red-200'
      case 'average':
        return 'bg-yellow-50 border-yellow-200'
      case 'above':
        return 'bg-green-50 border-green-200'
      case 'exceptional':
        return 'bg-emerald-50 border-emerald-200'
    }
  }

  const getPerformanceBadgeColor = () => {
    switch (benchmarks.campaignPerformance) {
      case 'below':
        return 'bg-red-100 text-red-800'
      case 'average':
        return 'bg-yellow-100 text-yellow-800'
      case 'above':
        return 'bg-green-100 text-green-800'
      case 'exceptional':
        return 'bg-emerald-100 text-emerald-800'
    }
  }

  const performanceLabel = {
    below: 'Below Industry Average',
    average: 'Average Performance',
    above: 'Above Average',
    exceptional: 'Exceptional',
  }[benchmarks.campaignPerformance]

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="space-y-2">
        <h2 className="text-2xl font-bold text-gray-900">Conversion Analytics</h2>
        <p className="text-gray-600">
          Track how your campaign converts supporters into customers
        </p>
      </div>

      {/* Performance Badge */}
      <div className={`p-4 border rounded-lg ${getPerformanceColor()}`}>
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-semibold text-gray-900">Campaign Performance</h3>
            <p className="text-sm text-gray-600 mt-1">
              Your conversion rate of{' '}
              <span className="font-bold text-violet-600">
                {rates.overallConversion.toFixed(2)}%
              </span>{' '}
              is {performanceLabel.toLowerCase()} (Industry avg:{' '}
              {benchmarks.industryAvg.toFixed(1)}%)
            </p>
          </div>
          <span
            className={`px-3 py-1 rounded-full text-sm font-semibold ${getPerformanceBadgeColor()}`}
          >
            {performanceLabel}
          </span>
        </div>
      </div>

      {/* Conversion Funnel */}
      <div className="space-y-4">
        <h3 className="font-semibold text-gray-900">Conversion Funnel</h3>

        <div className="space-y-4">
          {/* Visitors */}
          <div>
            <div className="flex items-end justify-between mb-2">
              <span className="text-sm font-medium text-gray-700">Visitors</span>
              <span className="text-sm font-semibold text-gray-900">
                {funnel.visitors.toLocaleString()}
              </span>
            </div>
            <div className="h-12 bg-violet-600 rounded-lg flex items-center px-4">
              <span className="text-white font-semibold">
                {funnel.visitors > 0 ? '100%' : '0%'}
              </span>
            </div>
          </div>

          {/* Arrow */}
          <div className="flex justify-center">
            <svg
              className="w-4 h-4 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 14l-7 7m0 0l-7-7m7 7V3"
              />
            </svg>
          </div>

          {/* Lobbyists */}
          <div>
            <div className="flex items-end justify-between mb-2">
              <span className="text-sm font-medium text-gray-700">Lobbyists</span>
              <span className="text-sm font-semibold text-gray-900">
                {funnel.lobbyists.toLocaleString()} ({lobbyPercent.toFixed(1)}%)
              </span>
            </div>
            <div
              className="h-10 bg-gradient-to-r from-violet-500 to-violet-600 rounded-lg flex items-center px-4 transition-all"
              style={{ width: `${Math.max(lobbyPercent, 5)}%` }}
            >
              <span className="text-white text-xs font-semibold">
                {rates.visitToLobby.toFixed(1)}%
              </span>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              {rates.visitToLobby.toFixed(1)}% visitor to lobby conversion
            </p>
          </div>

          {/* Arrow */}
          <div className="flex justify-center">
            <svg
              className="w-4 h-4 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 14l-7 7m0 0l-7-7m7 7V3"
              />
            </svg>
          </div>

          {/* Pledgers */}
          <div>
            <div className="flex items-end justify-between mb-2">
              <span className="text-sm font-medium text-gray-700">Pledgers</span>
              <span className="text-sm font-semibold text-gray-900">
                {funnel.pledgers.toLocaleString()} ({pledgePercent.toFixed(1)}%)
              </span>
            </div>
            <div
              className="h-10 bg-gradient-to-r from-violet-400 to-violet-500 rounded-lg flex items-center px-4 transition-all"
              style={{ width: `${Math.max(pledgePercent, 5)}%` }}
            >
              <span className="text-white text-xs font-semibold">
                {rates.lobbyToPledge.toFixed(1)}%
              </span>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              {rates.lobbyToPledge.toFixed(1)}% lobby to pledge conversion
            </p>
          </div>

          {/* Arrow */}
          <div className="flex justify-center">
            <svg
              className="w-4 h-4 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 14l-7 7m0 0l-7-7m7 7V3"
              />
            </svg>
          </div>

          {/* Orders */}
          <div>
            <div className="flex items-end justify-between mb-2">
              <span className="text-sm font-medium text-gray-700">Orders</span>
              <span className="text-sm font-semibold text-gray-900">
                {funnel.orderers.toLocaleString()} ({orderPercent.toFixed(1)}%)
              </span>
            </div>
            <div
              className="h-10 bg-gradient-to-r from-lime-400 to-lime-500 rounded-lg flex items-center px-4 transition-all"
              style={{ width: `${Math.max(orderPercent, 5)}%` }}
            >
              <span className="text-gray-900 text-xs font-semibold">
                {rates.pledgeToOrder.toFixed(1)}%
              </span>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              {rates.pledgeToOrder.toFixed(1)}% pledge to order conversion
            </p>
          </div>
        </div>
      </div>

      {/* Conversion Rates Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
          <p className="text-xs font-medium text-gray-600 uppercase tracking-wide">
            Overall Conversion
          </p>
          <p className="text-2xl font-bold text-violet-600 mt-2">
            {rates.overallConversion.toFixed(2)}%
          </p>
          <p className="text-xs text-gray-500 mt-1">Visitor to Order</p>
        </div>

        <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
          <p className="text-xs font-medium text-gray-600 uppercase tracking-wide">
            Visit to Lobby
          </p>
          <p className="text-2xl font-bold text-violet-600 mt-2">
            {rates.visitToLobby.toFixed(1)}%
          </p>
          <p className="text-xs text-gray-500 mt-1">{funnel.lobbyists} of {funnel.visitors}</p>
        </div>

        <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
          <p className="text-xs font-medium text-gray-600 uppercase tracking-wide">
            Lobby to Pledge
          </p>
          <p className="text-2xl font-bold text-violet-600 mt-2">
            {rates.lobbyToPledge.toFixed(1)}%
          </p>
          <p className="text-xs text-gray-500 mt-1">{funnel.pledgers} of {funnel.lobbyists}</p>
        </div>

        <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
          <p className="text-xs font-medium text-gray-600 uppercase tracking-wide">
            Pledge to Order
          </p>
          <p className="text-2xl font-bold text-lime-500 mt-2">
            {rates.pledgeToOrder.toFixed(1)}%
          </p>
          <p className="text-xs text-gray-500 mt-1">{funnel.orderers} of {funnel.pledgers}</p>
        </div>
      </div>

      {/* By Intensity Breakdown */}
      <div className="space-y-4">
        <h3 className="font-semibold text-gray-900">Performance by Lobby Intensity</h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Neat Idea */}
          <div className="border border-gray-200 rounded-lg p-4">
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-medium text-gray-900">Neat Idea</h4>
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                {byIntensity.neatIdea.count}
              </span>
            </div>

            <div className="space-y-2">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs text-gray-600">Converted:</span>
                  <span className="text-xs font-semibold text-gray-900">
                    {byIntensity.neatIdea.converted} users
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-blue-500 h-2 rounded-full transition-all"
                    style={{
                      width: `${Math.min(byIntensity.neatIdea.rate, 100)}%`,
                    }}
                  />
                </div>
              </div>

              <p className="text-xl font-bold text-blue-600 mt-3">
                {byIntensity.neatIdea.rate.toFixed(1)}%
              </p>
              <p className="text-xs text-gray-500">Conversion rate</p>
            </div>
          </div>

          {/* Probably Buy */}
          <div className="border border-gray-200 rounded-lg p-4">
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-medium text-gray-900">Probably Buy</h4>
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-800">
                {byIntensity.probablyBuy.count}
              </span>
            </div>

            <div className="space-y-2">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs text-gray-600">Converted:</span>
                  <span className="text-xs font-semibold text-gray-900">
                    {byIntensity.probablyBuy.converted} users
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-amber-500 h-2 rounded-full transition-all"
                    style={{
                      width: `${Math.min(byIntensity.probablyBuy.rate, 100)}%`,
                    }}
                  />
                </div>
              </div>

              <p className="text-xl font-bold text-amber-600 mt-3">
                {byIntensity.probablyBuy.rate.toFixed(1)}%
              </p>
              <p className="text-xs text-gray-500">Conversion rate</p>
            </div>
          </div>

          {/* Take My Money */}
          <div className="border border-gray-200 rounded-lg p-4">
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-medium text-gray-900">Take My Money</h4>
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-lime-100 text-lime-800">
                {byIntensity.takeMyMoney.count}
              </span>
            </div>

            <div className="space-y-2">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs text-gray-600">Converted:</span>
                  <span className="text-xs font-semibold text-gray-900">
                    {byIntensity.takeMyMoney.converted} users
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-lime-500 h-2 rounded-full transition-all"
                    style={{
                      width: `${Math.min(byIntensity.takeMyMoney.rate, 100)}%`,
                    }}
                  />
                </div>
              </div>

              <p className="text-xl font-bold text-lime-600 mt-3">
                {byIntensity.takeMyMoney.rate.toFixed(1)}%
              </p>
              <p className="text-xs text-gray-500">Conversion rate</p>
            </div>
          </div>
        </div>
      </div>

      {/* 30-Day Trends */}
      {trends.length > 0 && (
        <div className="space-y-4">
          <h3 className="font-semibold text-gray-900">30-Day Trends</h3>

          <div className="border border-gray-200 rounded-lg p-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Lobbies and Pledges Chart */}
              <div>
                <p className="text-sm font-medium text-gray-700 mb-3">Daily Activity</p>
                <div className="flex items-flex-end gap-1 h-40">
                  {trends.map((trend, idx) => {
                    const maxValue = Math.max(
                      ...trends.map((t) => Math.max(t.lobbies, t.pledges))
                    )
                    const lobbyHeight = (trend.lobbies / (maxValue || 1)) * 100
                    const pledgeHeight = (trend.pledges / (maxValue || 1)) * 100

                    return (
                      <div
                        key={idx}
                        className="flex-1 flex items-flex-end justify-center gap-0.5"
                        title={`${trend.date}: ${trend.lobbies} lobbies, ${trend.pledges} pledges`}
                      >
                        <div
                          className="flex-1 bg-violet-300 rounded-t opacity-70 hover:opacity-100 transition-opacity"
                          style={{ height: `${Math.max(lobbyHeight, 5)}%` }}
                        />
                        <div
                          className="flex-1 bg-violet-600 rounded-t opacity-70 hover:opacity-100 transition-opacity"
                          style={{ height: `${Math.max(pledgeHeight, 5)}%` }}
                        />
                      </div>
                    )
                  })}
                </div>
                <div className="flex gap-4 mt-3">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-violet-300 rounded" />
                    <span className="text-xs text-gray-600">Lobbies</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-violet-600 rounded" />
                    <span className="text-xs text-gray-600">Pledges</span>
                  </div>
                </div>
              </div>

              {/* Orders Chart */}
              <div>
                <p className="text-sm font-medium text-gray-700 mb-3">Orders</p>
                <div className="flex items-flex-end gap-1 h-40">
                  {trends.map((trend, idx) => {
                    const maxValue = Math.max(...trends.map((t) => t.orders))
                    const orderHeight = (trend.orders / (maxValue || 1)) * 100

                    return (
                      <div
                        key={idx}
                        className="flex-1"
                        title={`${trend.date}: ${trend.orders} orders`}
                      >
                        <div
                          className="w-full bg-lime-500 rounded-t opacity-70 hover:opacity-100 transition-opacity"
                          style={{ height: `${Math.max(orderHeight, 5)}%` }}
                        />
                      </div>
                    )
                  })}
                </div>
                <div className="flex gap-2 mt-3">
                  <div className="w-3 h-3 bg-lime-500 rounded" />
                  <span className="text-xs text-gray-600">Orders</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Empty State */}
      {funnel.visitors === 0 && (
        <div className="p-8 bg-gray-50 rounded-lg text-center">
          <p className="text-gray-600">
            No visitor data yet. Share your campaign to start tracking conversions.
          </p>
        </div>
      )}
    </div>
  )
}
