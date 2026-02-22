'use client'

import React, { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Spinner } from '@/components/ui/spinner'
import { formatCurrency, formatNumber } from '@/lib/utils'
import {
  TrendingDown,
  TrendingUp,
  BarChart3,
  DollarSign,
  Users,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react'

interface BusinessCaseCardProps {
  campaignId: string
}

interface BusinessCaseResponse {
  campaignId: string
  campaignTitle: string
  campaignSlug: string
  campaignStatus: string

  marketSizing: {
    totalDemandSignals: number
    weightedDemand: number
    lobbyBreakdown: {
      neatIdea: number
      probablyBuy: number
      takeMyMoney: number
      total: number
    }
    pledgeBreakdown: {
      support: number
      intent: number
      total: number
    }
  }

  revenueProjections: {
    conservative: {
      scenario: string
      description: string
      customers: number
      revenue: number
      profitMargin: number
    }
    moderate: {
      scenario: string
      description: string
      customers: number
      revenue: number
      profitMargin: number
    }
    optimistic: {
      scenario: string
      description: string
      customers: number
      revenue: number
      profitMargin: number
    }
  }

  pricingInsights: {
    avgPriceCeiling: number
    medianPriceCeiling: number
    priceRange: { min: number; max: number }
    suggestedPricePoint: number
    suggestedPriceReasoning: string
  }

  conversionMetrics: {
    rates: {
      neatIdea: number
      probablyBuy: number
      takeMyMoney: number
    }
    estimatedCustomers: number
    totalDemandSignals: number
    conversionRate: string
  }

  dataQuality: {
    confidenceLevel: 'low' | 'medium' | 'high' | 'very_high'
    confidenceScore: number
    dataSufficiency: string
    priceCeilingDataPoints: number
    totalSignals: number
  }

  breakEvenAnalysis: {
    unitsSoldToBreakEven: number
    revenueNeeded: number
    estimatedTimeframe: string
  }

  insights: {
    hasStrongSignals: boolean
    hasPricingData: boolean
    hasHighConfidence: boolean
    recommendedAction: string
  }

  timestamp: string
}

export const BusinessCaseCard: React.FC<BusinessCaseCardProps> = ({ campaignId }) => {
  const [data, setData] = useState<BusinessCaseResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchBusinessCase = async () => {
      try {
        setLoading(true)
        setError(null)

        const response = await fetch(`/api/campaigns/${campaignId}/business-case`)

        if (!response.ok) {
          throw new Error('Failed to fetch business case')
        }

        const result: BusinessCaseResponse = await response.json()
        setData(result)
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Unknown error'
        setError(message)
        console.error('Error fetching business case:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchBusinessCase()
  }, [campaignId])

  if (loading) {
    return (
      <Card className="border-gray-200">
        <CardContent className="p-12 flex items-center justify-center">
          <Spinner />
        </CardContent>
      </Card>
    )
  }

  if (error || !data) {
    return (
      <Card className="border-gray-200">
        <CardContent className="p-6">
          <div className="text-center text-gray-600">
            {error ? `Error: ${error}` : 'No business case data available'}
          </div>
        </CardContent>
      </Card>
    )
  }

  const getConfidenceBadgeColor = (level: string) => {
    switch (level) {
      case 'very_high':
        return 'bg-green-100 text-green-800'
      case 'high':
        return 'bg-blue-100 text-blue-800'
      case 'medium':
        return 'bg-yellow-100 text-yellow-800'
      case 'low':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getConfidenceIcon = (level: string) => {
    switch (level) {
      case 'very_high':
      case 'high':
        return <CheckCircle2 className="w-4 h-4 text-green-600" />
      case 'medium':
        return <BarChart3 className="w-4 h-4 text-yellow-600" />
      case 'low':
        return <AlertCircle className="w-4 h-4 text-red-600" />
      default:
        return null
    }
  }

  return (
    <div className="space-y-6">
      {/* Main Header Card */}
      <Card className="border-violet-200 bg-gradient-to-r from-violet-50 to-transparent">
        <CardHeader>
          <div className="flex items-start justify-between">
            <div>
              <CardTitle className="text-2xl mb-2">Business Case Analysis</CardTitle>
              <p className="text-sm text-gray-600">
                Revenue projections if a brand builds this product
              </p>
            </div>
            <div className={`px-3 py-1 rounded-full flex items-center gap-2 ${getConfidenceBadgeColor(data.dataQuality.confidenceLevel)}`}>
              {getConfidenceIcon(data.dataQuality.confidenceLevel)}
              <span className="text-sm font-medium capitalize">
                {data.dataQuality.confidenceLevel.replace('_', ' ')}
              </span>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Market Sizing Overview */}
          <div>
            <h3 className="text-sm font-semibold text-gray-900 mb-4">Market Sizing</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white rounded-lg p-4 border border-violet-100">
                <div className="text-xs text-gray-600 mb-1">Total Demand Signals</div>
                <div className="text-2xl font-bold text-violet-600">
                  {formatNumber(data.marketSizing.totalDemandSignals)}
                </div>
                <div className="text-xs text-gray-500 mt-2">
                  {data.marketSizing.lobbyBreakdown.total} lobbies +{' '}
                  {data.marketSizing.pledgeBreakdown.total} pledges
                </div>
              </div>

              <div className="bg-white rounded-lg p-4 border border-lime-100">
                <div className="text-xs text-gray-600 mb-1">Weighted Demand</div>
                <div className="text-2xl font-bold text-lime-600">
                  {formatNumber(data.marketSizing.weightedDemand)}
                </div>
                <div className="text-xs text-gray-500 mt-2">
                  Intensity-adjusted (Take My Money = 5x)
                </div>
              </div>
            </div>
          </div>

          {/* Lobby Breakdown */}
          <div>
            <h3 className="text-sm font-semibold text-gray-900 mb-3">Lobby Conviction Breakdown</h3>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-gray-400" />
                  <span className="text-sm">Neat Idea</span>
                </div>
                <span className="text-sm font-semibold">{data.marketSizing.lobbyBreakdown.neatIdea}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-yellow-400" />
                  <span className="text-sm">Probably Buy</span>
                </div>
                <span className="text-sm font-semibold">
                  {data.marketSizing.lobbyBreakdown.probablyBuy}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-lime-500" />
                  <span className="text-sm">Take My Money</span>
                </div>
                <span className="text-sm font-semibold">
                  {data.marketSizing.lobbyBreakdown.takeMyMoney}
                </span>
              </div>
            </div>

            {/* Conversion Funnel */}
            <div className="mt-4 p-4 bg-gray-50 rounded-lg">
              <div className="text-xs text-gray-600 mb-3 font-semibold">Conversion Funnel (Moderate Scenario)</div>
              <div className="space-y-2">
                <div className="flex items-center gap-3">
                  <div className="w-full h-6 bg-gradient-to-r from-gray-400 to-transparent rounded relative overflow-hidden">
                    <div className="absolute inset-0 flex items-center px-2">
                      <span className="text-xs font-semibold text-white">
                        {data.marketSizing.lobbyBreakdown.total} demand signals
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-3/5 h-6 bg-gradient-to-r from-lime-400 to-transparent rounded relative overflow-hidden">
                    <div className="absolute inset-0 flex items-center px-2">
                      <span className="text-xs font-semibold text-white">
                        {data.conversionMetrics.estimatedCustomers} estimated customers ({data.conversionMetrics.conversionRate})
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Revenue Projections */}
      <Card className="border-gray-200">
        <CardHeader>
          <CardTitle className="text-lg">Revenue Projections</CardTitle>
        </CardHeader>

        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Conservative */}
            <div className="bg-gradient-to-br from-gray-50 to-gray-50 rounded-lg p-4 border border-gray-200">
              <div className="flex items-center gap-2 mb-3">
                <TrendingDown className="w-5 h-5 text-gray-600" />
                <h4 className="font-semibold text-gray-900">Conservative</h4>
              </div>
              <p className="text-xs text-gray-600 mb-4">
                {data.revenueProjections.conservative.description}
              </p>
              <div className="space-y-2">
                <div>
                  <div className="text-xs text-gray-600">Customers</div>
                  <div className="text-xl font-bold text-gray-900">
                    {formatNumber(data.revenueProjections.conservative.customers)}
                  </div>
                </div>
                <div>
                  <div className="text-xs text-gray-600">Revenue</div>
                  <div className="text-xl font-bold text-gray-900">
                    {formatCurrency(data.revenueProjections.conservative.revenue)}
                  </div>
                </div>
                <div className="pt-2 border-t border-gray-300">
                  <Badge variant="outline">
                    {data.revenueProjections.conservative.profitMargin}% margin
                  </Badge>
                </div>
              </div>
            </div>

            {/* Moderate */}
            <div className="bg-gradient-to-br from-violet-50 to-violet-50 rounded-lg p-4 border border-violet-200 ring-2 ring-violet-100">
              <div className="flex items-center gap-2 mb-3">
                <BarChart3 className="w-5 h-5 text-violet-600" />
                <h4 className="font-semibold text-violet-900">Moderate (Expected)</h4>
              </div>
              <p className="text-xs text-violet-700 mb-4">
                {data.revenueProjections.moderate.description}
              </p>
              <div className="space-y-2">
                <div>
                  <div className="text-xs text-violet-700">Customers</div>
                  <div className="text-2xl font-bold text-violet-900">
                    {formatNumber(data.revenueProjections.moderate.customers)}
                  </div>
                </div>
                <div>
                  <div className="text-xs text-violet-700">Revenue</div>
                  <div className="text-2xl font-bold text-violet-900">
                    {formatCurrency(data.revenueProjections.moderate.revenue)}
                  </div>
                </div>
                <div className="pt-2 border-t border-violet-300">
                  <Badge className="bg-violet-600 hover:bg-violet-700">
                    {data.revenueProjections.moderate.profitMargin}% margin
                  </Badge>
                </div>
              </div>
            </div>

            {/* Optimistic */}
            <div className="bg-gradient-to-br from-lime-50 to-lime-50 rounded-lg p-4 border border-lime-200">
              <div className="flex items-center gap-2 mb-3">
                <TrendingUp className="w-5 h-5 text-lime-600" />
                <h4 className="font-semibold text-lime-900">Optimistic</h4>
              </div>
              <p className="text-xs text-lime-700 mb-4">
                {data.revenueProjections.optimistic.description}
              </p>
              <div className="space-y-2">
                <div>
                  <div className="text-xs text-lime-700">Customers</div>
                  <div className="text-xl font-bold text-lime-900">
                    {formatNumber(data.revenueProjections.optimistic.customers)}
                  </div>
                </div>
                <div>
                  <div className="text-xs text-lime-700">Revenue</div>
                  <div className="text-xl font-bold text-lime-900">
                    {formatCurrency(data.revenueProjections.optimistic.revenue)}
                  </div>
                </div>
                <div className="pt-2 border-t border-lime-300">
                  <Badge variant="outline">
                    {data.revenueProjections.optimistic.profitMargin}% margin
                  </Badge>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Pricing Insights */}
      <Card className="border-gray-200">
        <CardHeader>
          <CardTitle className="text-lg">Pricing Insights</CardTitle>
        </CardHeader>

        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="text-xs text-gray-600 mb-1">Average Price Ceiling</div>
              <div className="text-2xl font-bold text-gray-900">
                {formatCurrency(data.pricingInsights.avgPriceCeiling)}
              </div>
            </div>

            <div className="bg-gray-50 rounded-lg p-4">
              <div className="text-xs text-gray-600 mb-1">Median Price Ceiling</div>
              <div className="text-2xl font-bold text-gray-900">
                {formatCurrency(data.pricingInsights.medianPriceCeiling)}
              </div>
            </div>

            <div className="bg-violet-50 rounded-lg p-4 border border-violet-100 md:col-span-2">
              <div className="text-xs text-violet-700 mb-2 font-semibold">Suggested Price Point</div>
              <div className="text-3xl font-bold text-violet-900 mb-2">
                {formatCurrency(data.pricingInsights.suggestedPricePoint)}
              </div>
              <p className="text-xs text-violet-700">
                {data.pricingInsights.suggestedPriceReasoning}
              </p>
            </div>
          </div>

          <div className="p-4 bg-gray-50 rounded-lg">
            <div className="text-xs text-gray-600 mb-2">Price Range</div>
            <div className="flex items-center justify-between">
              <span className="font-semibold text-gray-900">
                {formatCurrency(data.pricingInsights.priceRange.min)}
              </span>
              <span className="text-xs text-gray-600">
                {data.dataQuality.priceCeilingDataPoints} price data points
              </span>
              <span className="font-semibold text-gray-900">
                {formatCurrency(data.pricingInsights.priceRange.max)}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Confidence Meter & Data Quality */}
      <Card className="border-gray-200">
        <CardHeader>
          <CardTitle className="text-lg">Data Quality & Confidence</CardTitle>
        </CardHeader>

        <CardContent className="space-y-6">
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-semibold text-gray-900">Confidence Score</span>
              <span className="text-2xl font-bold text-violet-600">
                {data.dataQuality.confidenceScore}/100
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
              <div
                className="bg-gradient-to-r from-violet-500 to-violet-600 h-full transition-all"
                style={{ width: `${data.dataQuality.confidenceScore}%` }}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="bg-gray-50 rounded-lg p-4">
              <Users className="w-5 h-5 text-gray-600 mb-2" />
              <div className="text-xs text-gray-600 mb-1">Total Signals</div>
              <div className="text-lg font-bold text-gray-900">
                {data.dataQuality.totalSignals}
              </div>
            </div>

            <div className="bg-gray-50 rounded-lg p-4">
              <DollarSign className="w-5 h-5 text-gray-600 mb-2" />
              <div className="text-xs text-gray-600 mb-1">Price Data Points</div>
              <div className="text-lg font-bold text-gray-900">
                {data.dataQuality.priceCeilingDataPoints}
              </div>
            </div>
          </div>

          <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm text-blue-900">
              <strong>Data Sufficiency:</strong> {data.dataQuality.dataSufficiency}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Break-Even Analysis */}
      <Card className="border-gray-200">
        <CardHeader>
          <CardTitle className="text-lg">Break-Even Analysis</CardTitle>
        </CardHeader>

        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="text-xs text-gray-600 mb-1">Units to Break Even</div>
              <div className="text-2xl font-bold text-gray-900">
                {formatNumber(data.breakEvenAnalysis.unitsSoldToBreakEven)}
              </div>
            </div>

            <div className="bg-gray-50 rounded-lg p-4">
              <div className="text-xs text-gray-600 mb-1">Revenue Needed</div>
              <div className="text-2xl font-bold text-gray-900">
                {formatCurrency(data.breakEvenAnalysis.revenueNeeded)}
              </div>
            </div>

            <div className="bg-lime-50 rounded-lg p-4 border border-lime-200">
              <div className="text-xs text-lime-700 mb-1">Estimated Timeframe</div>
              <div className="text-2xl font-bold text-lime-900">
                {data.breakEvenAnalysis.estimatedTimeframe}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Recommendation */}
      <Card className="border-violet-200 bg-violet-50">
        <CardContent className="pt-6">
          <div className="flex gap-4">
            {data.insights.hasHighConfidence ? (
              <CheckCircle2 className="w-6 h-6 text-green-600 flex-shrink-0 mt-0.5" />
            ) : (
              <AlertCircle className="w-6 h-6 text-yellow-600 flex-shrink-0 mt-0.5" />
            )}
            <div>
              <p className="font-semibold text-violet-900 mb-2">Recommended Action</p>
              <p className="text-sm text-violet-800 mb-4">{data.insights.recommendedAction}</p>
              {!data.insights.hasHighConfidence && (
                <Button
                  variant="outline"
                  className="border-violet-600 text-violet-600 hover:bg-violet-100"
                  size="sm"
                >
                  Run a Survey to Collect More Data
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Generate PDF Report (Placeholder) */}
      <div className="flex justify-end gap-3">
        <Button variant="outline">Cancel</Button>
        <Button className="bg-violet-600 hover:bg-violet-700">
          Generate PDF Report
        </Button>
      </div>
    </div>
  )
}
