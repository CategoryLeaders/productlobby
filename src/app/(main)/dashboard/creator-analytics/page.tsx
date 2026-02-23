'use client'

import React, { useEffect, useState } from 'react'
import { DashboardLayout } from '@/components/shared/dashboard-layout'
import { PageHeader } from '@/components/shared/page-header'
import { Spinner } from '@/components/ui/spinner'
import { TrendingUp, MessageSquare, Users, Eye } from 'lucide-react'
import Link from 'next/link'

interface CampaignPerformance {
  id: string
  title: string
  slug: string
  lobbyCount: number
  commentCount: number
  status: string
  signalScore: number
}

interface AnalyticsData {
  totalLobbies: number
  totalComments: number
  totalFollowers: number
  estimatedViews: number
  engagementRate: number
  topCampaigns: CampaignPerformance[]
  growthData: Array<{
    date: string
    lobbies: number
    comments: number
  }>
}

export default function CreatorAnalyticsPage() {
  const [data, setData] = useState<AnalyticsData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        setIsLoading(true)
        const response = await fetch('/api/creators/analytics')
        if (!response.ok) {
          throw new Error('Failed to fetch analytics')
        }
        const analytics = await response.json()
        setData(analytics)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred')
      } finally {
        setIsLoading(false)
      }
    }

    fetchAnalytics()
  }, [])

  if (isLoading) {
    return (
      <DashboardLayout role="creator">
        <div className="flex items-center justify-center h-96">
          <Spinner />
        </div>
      </DashboardLayout>
    )
  }

  if (error) {
    return (
      <DashboardLayout role="creator">
        <div className="space-y-6">
          <PageHeader
            title="Campaign Analytics"
            description="Track the performance of your campaigns"
          />
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
            Error loading analytics: {error}
          </div>
        </div>
      </DashboardLayout>
    )
  }

  if (!data) {
    return (
      <DashboardLayout role="creator">
        <div className="flex items-center justify-center h-96">
          <p className="text-gray-500">No data available</p>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout role="creator">
      <div className="space-y-8">
        <PageHeader
          title="Campaign Analytics"
          description="Track the performance of your campaigns and understand your audience"
        />

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Total Views */}
          <div className="bg-white rounded-lg border border-gray-200 p-6 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-600">Total Views</span>
              <Eye className="w-5 h-5 text-blue-500" />
            </div>
            <div className="text-3xl font-bold text-gray-900">
              {data.estimatedViews.toLocaleString()}
            </div>
            <p className="text-xs text-gray-500">Estimated based on engagement</p>
          </div>

          {/* Engagement Rate */}
          <div className="bg-white rounded-lg border border-gray-200 p-6 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-600">Engagement Rate</span>
              <TrendingUp className="w-5 h-5 text-green-500" />
            </div>
            <div className="text-3xl font-bold text-gray-900">
              {data.engagementRate.toFixed(1)}%
            </div>
            <p className="text-xs text-gray-500">Views to lobbies</p>
          </div>

          {/* Total Lobbies */}
          <div className="bg-white rounded-lg border border-gray-200 p-6 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-600">Total Lobbies</span>
              <Users className="w-5 h-5 text-purple-500" />
            </div>
            <div className="text-3xl font-bold text-gray-900">
              {data.totalLobbies.toLocaleString()}
            </div>
            <p className="text-xs text-gray-500">Across all campaigns</p>
          </div>

          {/* Total Comments */}
          <div className="bg-white rounded-lg border border-gray-200 p-6 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-600">Total Comments</span>
              <MessageSquare className="w-5 h-5 text-orange-500" />
            </div>
            <div className="text-3xl font-bold text-gray-900">
              {data.totalComments.toLocaleString()}
            </div>
            <p className="text-xs text-gray-500">Community engagement</p>
          </div>
        </div>

        {/* Growth Over Time Chart (CSS-based) */}
        <div className="bg-white rounded-lg border border-gray-200 p-6 space-y-4">
          <h2 className="text-lg font-semibold text-gray-900">Growth Over Time</h2>

          {data.growthData && data.growthData.length > 0 ? (
            <div className="space-y-4">
              <div className="flex items-end gap-2 h-48">
                {data.growthData.map((point, idx) => {
                  const maxValue = Math.max(
                    ...data.growthData.map(p => Math.max(p.lobbies, p.comments))
                  )
                  const lobbyHeight = (point.lobbies / maxValue) * 100
                  const commentHeight = (point.comments / maxValue) * 100

                  return (
                    <div key={idx} className="flex-1 space-y-1">
                      <div className="flex gap-1 h-full items-end">
                        <div
                          className="flex-1 bg-blue-400 rounded-t opacity-80"
                          style={{ height: `${lobbyHeight}%` }}
                          title={`Lobbies: ${point.lobbies}`}
                        />
                        <div
                          className="flex-1 bg-purple-400 rounded-t opacity-80"
                          style={{ height: `${commentHeight}%` }}
                          title={`Comments: ${point.comments}`}
                        />
                      </div>
                      <span className="text-xs text-gray-600 text-center block">
                        {new Date(point.date).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                        })}
                      </span>
                    </div>
                  )
                })}
              </div>
              <div className="flex gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-blue-400 rounded" />
                  <span className="text-gray-600">Lobbies</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-purple-400 rounded" />
                  <span className="text-gray-600">Comments</span>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              No growth data available yet
            </div>
          )}
        </div>

        {/* Top Performing Campaigns */}
        <div className="bg-white rounded-lg border border-gray-200 p-6 space-y-4">
          <h2 className="text-lg font-semibold text-gray-900">Top Performing Campaigns</h2>

          {data.topCampaigns && data.topCampaigns.length > 0 ? (
            <div className="space-y-3">
              {data.topCampaigns.map((campaign, idx) => (
                <Link
                  key={campaign.id}
                  href={`/campaigns/${campaign.slug}`}
                  className="block p-4 border border-gray-200 rounded-lg hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-sm font-semibold text-gray-500">#{idx + 1}</span>
                        <h3 className="text-sm font-medium text-gray-900 truncate">
                          {campaign.title}
                        </h3>
                      </div>
                      <p className="text-xs text-gray-500">
                        {campaign.lobbyCount} lobbies • {campaign.commentCount} comments
                      </p>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-bold text-gray-900">
                        {campaign.signalScore}
                      </div>
                      <p className="text-xs text-gray-500">Signal Score</p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              No campaigns yet. Create your first campaign to see analytics.
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  )
}
