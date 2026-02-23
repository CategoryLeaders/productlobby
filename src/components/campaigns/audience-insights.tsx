'use client'

import React, { useEffect, useState } from 'react'
import {
  Users,
  BarChart3,
  PieChart,
  Loader2,
  TrendingUp,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface ContributionTypeBreakdown {
  lobbies: number
  comments: number
  shares: number
  referrals: number
  other: number
}

interface AudienceInsightsData {
  totalUniqueContributors: number
  eventTypeBreakdown: Record<string, number>
  activityByDayOfWeek: Record<string, number>
  averageEngagementScore: number
  topReferralSources: Array<{ source: string; count: number }>
}

interface AudienceInsightsProps {
  campaignId: string
}

const mapEventTypesToContributionTypes = (
  eventTypeBreakdown: Record<string, number>
): ContributionTypeBreakdown => {
  return {
    lobbies: eventTypeBreakdown['PREFERENCE_SUBMITTED'] || 0,
    comments: eventTypeBreakdown['COMMENT_ENGAGEMENT'] || 0,
    shares: eventTypeBreakdown['SOCIAL_SHARE'] || 0,
    referrals: eventTypeBreakdown['REFERRAL_SIGNUP'] || 0,
    other:
      (eventTypeBreakdown['WISHLIST_SUBMITTED'] || 0) +
      (eventTypeBreakdown['BRAND_OUTREACH'] || 0),
  }
}

export const AudienceInsights: React.FC<AudienceInsightsProps> = ({
  campaignId,
}) => {
  const [data, setData] = useState<AudienceInsightsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchInsights = async () => {
      try {
        setLoading(true)
        setError(null)

        const response = await fetch(
          `/api/campaigns/${campaignId}/audience-insights`
        )

        if (!response.ok) {
          throw new Error('Failed to fetch audience insights')
        }

        const insightsData = await response.json()
        setData(insightsData)
      } catch (err) {
        setError(
          err instanceof Error ? err.message : 'An error occurred'
        )
        console.error('Error fetching audience insights:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchInsights()
  }, [campaignId])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64 bg-white rounded-lg border border-gray-200">
        <Loader2 className="w-8 h-8 text-violet-600 animate-spin" />
      </div>
    )
  }

  if (error || !data) {
    return (
      <div className="bg-white rounded-lg border border-red-200 p-6 text-center">
        <p className="text-red-600 font-medium">
          {error || 'Failed to load audience insights'}
        </p>
      </div>
    )
  }

  const contributionTypes = mapEventTypesToContributionTypes(
    data.eventTypeBreakdown
  )
  const totalContributions = Object.values(contributionTypes).reduce(
    (sum, val) => sum + val,
    0
  )

  // Calculate percentages for pie chart
  const contributionPercentages = {
    lobbies:
      totalContributions > 0
        ? Math.round((contributionTypes.lobbies / totalContributions) * 100)
        : 0,
    comments:
      totalContributions > 0
        ? Math.round((contributionTypes.comments / totalContributions) * 100)
        : 0,
    shares:
      totalContributions > 0
        ? Math.round((contributionTypes.shares / totalContributions) * 100)
        : 0,
    referrals:
      totalContributions > 0
        ? Math.round((contributionTypes.referrals / totalContributions) * 100)
        : 0,
    other:
      totalContributions > 0
        ? Math.round((contributionTypes.other / totalContributions) * 100)
        : 0,
  }

  // Find max activity for bar chart scaling
  const maxActivity = Math.max(
    ...Object.values(data.activityByDayOfWeek),
    1
  )

  const dayOrder = [
    'Monday',
    'Tuesday',
    'Wednesday',
    'Thursday',
    'Friday',
    'Saturday',
    'Sunday',
  ]
  const activityByDay = dayOrder.map(day => ({
    day,
    activity: data.activityByDayOfWeek[day] || 0,
  }))

  return (
    <div className="space-y-6">
      {/* Top Insights Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Total Supporters Card */}
        <div className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-lg transition-shadow">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-600 mb-1">
                Total Supporters
              </p>
              <p className="text-3xl font-bold text-violet-600">
                {data.totalUniqueContributors}
              </p>
              <p className="text-xs text-gray-500 mt-2">
                Unique contributors
              </p>
            </div>
            <div className="bg-violet-50 rounded-lg p-3">
              <Users className="w-6 h-6 text-violet-600" />
            </div>
          </div>
        </div>

        {/* Average Engagement Card */}
        <div className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-lg transition-shadow">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-600 mb-1">
                Avg Engagement
              </p>
              <p className="text-3xl font-bold text-lime-600">
                {data.averageEngagementScore}
              </p>
              <p className="text-xs text-gray-500 mt-2">Points per supporter</p>
            </div>
            <div className="bg-lime-50 rounded-lg p-3">
              <TrendingUp className="w-6 h-6 text-lime-600" />
            </div>
          </div>
        </div>

        {/* Total Contributions Card */}
        <div className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-lg transition-shadow">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-600 mb-1">
                Total Actions
              </p>
              <p className="text-3xl font-bold text-violet-600">
                {totalContributions}
              </p>
              <p className="text-xs text-gray-500 mt-2">Campaign actions</p>
            </div>
            <div className="bg-violet-50 rounded-lg p-3">
              <BarChart3 className="w-6 h-6 text-violet-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Activity by Day of Week */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <div className="flex items-center gap-2 mb-6">
          <BarChart3 className="w-5 h-5 text-violet-600" />
          <h3 className="font-semibold text-gray-900">Activity by Day</h3>
        </div>

        <div className="space-y-4">
          {activityByDay.map(({ day, activity }) => {
            const percentage = (activity / maxActivity) * 100
            return (
              <div key={day}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-medium text-gray-700">
                    {day}
                  </span>
                  <span className="text-sm font-semibold text-gray-900">
                    {activity}
                  </span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
                  <div
                    className={cn(
                      'h-full transition-all duration-300',
                      activity > 0 ? 'bg-violet-500' : 'bg-gray-200'
                    )}
                    style={{ width: `${percentage}%` }}
                  />
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Contribution Types Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pie Chart */}
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <div className="flex items-center gap-2 mb-6">
            <PieChart className="w-5 h-5 text-violet-600" />
            <h3 className="font-semibold text-gray-900">
              Contribution Types
            </h3>
          </div>

          {totalContributions === 0 ? (
            <div className="flex items-center justify-center h-48 text-gray-500">
              No contribution data available
            </div>
          ) : (
            <div className="space-y-4">
              {[
                {
                  label: 'Lobbies',
                  value: contributionTypes.lobbies,
                  percentage: contributionPercentages.lobbies,
                  color: 'bg-violet-600',
                },
                {
                  label: 'Comments',
                  value: contributionTypes.comments,
                  percentage: contributionPercentages.comments,
                  color: 'bg-lime-600',
                },
                {
                  label: 'Shares',
                  value: contributionTypes.shares,
                  percentage: contributionPercentages.shares,
                  color: 'bg-blue-600',
                },
                {
                  label: 'Referrals',
                  value: contributionTypes.referrals,
                  percentage: contributionPercentages.referrals,
                  color: 'bg-orange-600',
                },
                {
                  label: 'Other',
                  value: contributionTypes.other,
                  percentage: contributionPercentages.other,
                  color: 'bg-gray-400',
                },
              ]
                .filter(item => item.value > 0)
                .map(item => (
                  <div key={item.label}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium text-gray-700">
                        {item.label}
                      </span>
                      <span className="text-sm font-semibold text-gray-900">
                        {item.value} ({item.percentage}%)
                      </span>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-2.5">
                      <div
                        className={cn('h-full rounded-full transition-all duration-300', item.color)}
                        style={{ width: `${item.percentage}%` }}
                      />
                    </div>
                  </div>
                ))}
            </div>
          )}
        </div>

        {/* Top Referral Sources */}
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <div className="flex items-center gap-2 mb-6">
            <TrendingUp className="w-5 h-5 text-violet-600" />
            <h3 className="font-semibold text-gray-900">Top Referral Sources</h3>
          </div>

          {data.topReferralSources.length === 0 ? (
            <div className="flex items-center justify-center h-48 text-gray-500">
              No referral data available
            </div>
          ) : (
            <div className="space-y-3">
              {data.topReferralSources.map((source, index) => {
                const isTopSource = index === 0
                const percentage =
                  (source.count /
                    Math.max(
                      ...data.topReferralSources.map(s => s.count),
                      1
                    )) *
                  100
                return (
                  <div
                    key={source.source}
                    className={cn(
                      'p-3 rounded-lg border transition-all',
                      isTopSource
                        ? 'bg-lime-50 border-lime-200'
                        : 'bg-gray-50 border-gray-200'
                    )}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-medium text-gray-900">
                        {source.source}
                      </span>
                      <span
                        className={cn(
                          'text-sm font-semibold',
                          isTopSource ? 'text-lime-600' : 'text-gray-600'
                        )}
                      >
                        {source.count}
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-1.5">
                      <div
                        className={cn(
                          'h-full rounded-full transition-all duration-300',
                          isTopSource ? 'bg-lime-500' : 'bg-violet-500'
                        )}
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>

      {/* Export Button */}
      <div className="flex justify-end">
        <Button
          onClick={() => {
            const dataStr = JSON.stringify(data, null, 2)
            const dataBlob = new Blob([dataStr], { type: 'application/json' })
            const url = URL.createObjectURL(dataBlob)
            const link = document.createElement('a')
            link.href = url
            link.download = `audience-insights-${campaignId}.json`
            document.body.appendChild(link)
            link.click()
            document.body.removeChild(link)
            URL.revokeObjectURL(url)
          }}
          variant="outline"
          size="sm"
          className="text-violet-600 border-violet-200 hover:bg-violet-50"
        >
          Export Data
        </Button>
      </div>
    </div>
  )
}
