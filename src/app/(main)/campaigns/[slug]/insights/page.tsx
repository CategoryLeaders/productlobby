'use client'

import React, { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { DashboardLayout } from '@/components/shared'
import { DemandScoreGauge } from '@/components/campaigns/demand-score-gauge'
import { DemandBreakdown } from '@/components/campaigns/demand-breakdown'
import { Spinner } from '@/components/ui/spinner'
import { AlertCircle, TrendingUp, MessageSquare, Users, Heart } from 'lucide-react'

interface DemandSignalResponse {
  success: boolean
  data: {
    campaignId: string
    campaignTitle: string
    totalLobbies: number
    lobbiesLastSevenDays: number
    lobbiesPreviousSevenDays: number
    growthRate: number
    commentCount: number
    uniqueContributorCount: number
    brandResponseStatus: string
    demandScore: number
    componentScores: {
      lobbies: number
      growth: number
      comments: number
      contributors: number
    }
    breakdown: {
      lobbies: number
      growth: number
      comments: number
      contributors: number
    }
  }
}

export default function CampaignInsightsPage() {
  const params = useParams()
  const slug = params?.slug as string
  const [data, setData] = useState<DemandSignalResponse | null>(null)
  const [campaignId, setCampaignId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // First, resolve slug to campaign ID
  useEffect(() => {
    const resolveCampaignId = async () => {
      try {
        if (!slug) return
        
        // Query campaign by slug directly from Prisma endpoint or use campaign listing
        const res = await fetch(`/api/campaigns/${slug}`)
        if (!res.ok) {
          throw new Error('Campaign not found')
        }
        
        const json = await res.json()
        setCampaignId(json.data?.id || null)
      } catch (err) {
        console.error('Failed to resolve campaign:', err)
        setError('Campaign not found')
        setLoading(false)
      }
    }

    if (slug) {
      resolveCampaignId()
    }
  }, [slug])

  // Once we have campaign ID, fetch demand signal data
  useEffect(() => {
    const fetchDemandSignal = async () => {
      if (!campaignId) return
      
      try {
        setLoading(true)
        const res = await fetch(`/api/campaigns/${campaignId}/demand-signal`)
        
        if (!res.ok) {
          if (res.status === 401) {
            throw new Error('You are not authorized to view this campaign insights')
          } else if (res.status === 403) {
            throw new Error('You do not have access to this campaign insights')
          } else if (res.status === 404) {
            throw new Error('Campaign not found')
          }
          throw new Error('Failed to fetch demand signal')
        }

        const json = await res.json()
        setData(json)
        setError(null)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load insights')
        setData(null)
      } finally {
        setLoading(false)
      }
    }

    if (campaignId) {
      fetchDemandSignal()
    }
  }, [campaignId])

  return (
    <DashboardLayout role="creator">
      <div className="space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Campaign Insights</h1>
          {data?.data.campaignTitle && (
            <p className="text-lg text-gray-600 mt-2">{data.data.campaignTitle}</p>
          )}
        </div>

        {/* Loading state */}
        {loading && (
          <div className="flex justify-center py-12">
            <Spinner />
          </div>
        )}

        {/* Error state */}
        {error && !loading && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
            <AlertCircle className="text-red-600 mt-0.5 flex-shrink-0" size={20} />
            <div>
              <h3 className="font-semibold text-red-900">Unable to load insights</h3>
              <p className="text-red-800 text-sm mt-1">{error}</p>
            </div>
          </div>
        )}

        {/* Content */}
        {!loading && data?.success && data.data && (
          <>
            {/* Demand Score Hero Section */}
            <div className="bg-gradient-to-br from-violet-50 to-indigo-50 border border-violet-200 rounded-xl p-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-8 text-center">
                Demand Signal Score
              </h2>
              <div className="flex justify-center">
                <DemandScoreGauge score={data.data.demandScore} size="lg" />
              </div>
            </div>

            {/* Key Metrics Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Total Lobbies */}
              <div className="bg-white border border-gray-200 rounded-lg p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-medium text-gray-600">Total Lobbies</h3>
                  <Heart className="text-violet-600" size={20} />
                </div>
                <p className="text-3xl font-bold text-gray-900">
                  {data.data.totalLobbies}
                </p>
                <p className="text-xs text-gray-500 mt-2">
                  Community support for your campaign
                </p>
              </div>

              {/* Growth Rate */}
              <div className="bg-white border border-gray-200 rounded-lg p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-medium text-gray-600">Growth Rate</h3>
                  <TrendingUp className="text-blue-600" size={20} />
                </div>
                <p className="text-3xl font-bold text-gray-900">
                  {data.data.growthRate > 0 ? '+' : ''}
                  {data.data.growthRate.toFixed(1)}%
                </p>
                <p className="text-xs text-gray-500 mt-2">
                  Last 7 days vs previous 7 days
                </p>
              </div>

              {/* Comments */}
              <div className="bg-white border border-gray-200 rounded-lg p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-medium text-gray-600">Comments</h3>
                  <MessageSquare className="text-emerald-600" size={20} />
                </div>
                <p className="text-3xl font-bold text-gray-900">
                  {data.data.commentCount}
                </p>
                <p className="text-xs text-gray-500 mt-2">
                  Engagement and feedback
                </p>
              </div>

              {/* Contributors */}
              <div className="bg-white border border-gray-200 rounded-lg p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-medium text-gray-600">Contributors</h3>
                  <Users className="text-orange-600" size={20} />
                </div>
                <p className="text-3xl font-bold text-gray-900">
                  {data.data.uniqueContributorCount}
                </p>
                <p className="text-xs text-gray-500 mt-2">
                  Unique users engaged
                </p>
              </div>
            </div>

            {/* Demand Breakdown Section */}
            <div className="bg-white border border-gray-200 rounded-lg p-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">
                Demand Score Breakdown
              </h2>
              <DemandBreakdown
                breakdown={data.data.breakdown}
                componentScores={data.data.componentScores}
              />
            </div>

            {/* Growth Trend Section */}
            <div className="bg-white border border-gray-200 rounded-lg p-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">
                Growth Trend
              </h2>

              <div className="space-y-4">
                {/* Last 7 days bar */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-700">
                      Last 7 days
                    </span>
                    <span className="text-sm font-semibold text-gray-900">
                      {data.data.lobbiesLastSevenDays} lobbies
                    </span>
                  </div>
                  <div className="h-8 bg-gray-100 rounded-lg overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-violet-500 to-violet-600 transition-all duration-500 flex items-center justify-end pr-3"
                      style={{
                        width: `${
                          data.data.totalLobbies > 0
                            ? (data.data.lobbiesLastSevenDays /
                              Math.max(data.data.totalLobbies, data.data.lobbiesLastSevenDays, data.data.lobbiesPreviousSevenDays)) *
                              100
                            : 0
                        }%`,
                      }}
                    >
                      {data.data.lobbiesLastSevenDays > 0 && (
                        <span className="text-xs font-bold text-white">
                          {data.data.lobbiesLastSevenDays}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Previous 7 days bar */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-700">
                      Previous 7 days
                    </span>
                    <span className="text-sm font-semibold text-gray-900">
                      {data.data.lobbiesPreviousSevenDays} lobbies
                    </span>
                  </div>
                  <div className="h-8 bg-gray-100 rounded-lg overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-blue-500 to-blue-600 transition-all duration-500 flex items-center justify-end pr-3"
                      style={{
                        width: `${
                          data.data.totalLobbies > 0
                            ? (data.data.lobbiesPreviousSevenDays /
                              Math.max(data.data.totalLobbies, data.data.lobbiesLastSevenDays, data.data.lobbiesPreviousSevenDays)) *
                              100
                            : 0
                        }%`,
                      }}
                    >
                      {data.data.lobbiesPreviousSevenDays > 0 && (
                        <span className="text-xs font-bold text-white">
                          {data.data.lobbiesPreviousSevenDays}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Growth indicator */}
                <div className="mt-6 p-4 bg-violet-50 border border-violet-200 rounded-lg">
                  <div className="flex items-center gap-2">
                    <TrendingUp
                      className={
                        data.data.growthRate > 0
                          ? 'text-green-600'
                          : data.data.growthRate < 0
                            ? 'text-red-600'
                            : 'text-gray-600'
                      }
                      size={20}
                    />
                    <div>
                      <p className="text-sm font-semibold text-gray-900">
                        {data.data.growthRate > 0
                          ? 'Momentum Building'
                          : data.data.growthRate < 0
                            ? 'Momentum Slowing'
                            : 'Steady Progress'}
                      </p>
                      <p className="text-sm text-gray-600">
                        {data.data.growthRate > 0
                          ? `Your campaign is growing ${data.data.growthRate.toFixed(1)}% week-over-week`
                          : data.data.growthRate < 0
                            ? `Your campaign has slowed ${Math.abs(data.data.growthRate).toFixed(1)}% week-over-week`
                            : 'Your campaign has stable growth'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Brand Response Status */}
            {data.data.brandResponseStatus !== 'NONE' && (
              <div className="bg-white border border-gray-200 rounded-lg p-6">
                <h3 className="text-sm font-semibold text-gray-900 mb-2">
                  Brand Response
                </h3>
                <p className="text-sm text-gray-600">
                  Status: <span className="font-semibold text-gray-900 capitalize">
                    {data.data.brandResponseStatus}
                  </span>
                </p>
              </div>
            )}
          </>
        )}
      </div>
    </DashboardLayout>
  )
}
