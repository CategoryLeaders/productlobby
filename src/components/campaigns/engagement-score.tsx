'use client'

import React, { useEffect, useState } from 'react'
import { Activity, Users, TrendingUp, Award, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface TopSupporter {
  id: string
  name: string
  handle: string
  avatar: string | null
  engagementScore: number
  lastActive: string | null
  activityTypes: string[]
}

interface EngagementDistribution {
  highEngagement: {
    count: number
    percentage: number
  }
  moderateEngagement: {
    count: number
    percentage: number
  }
  lowEngagement: {
    count: number
    percentage: number
  }
}

interface EngagementScoreData {
  distribution: EngagementDistribution
  topSupporters: TopSupporter[]
  averageEngagementScore: number
  platformAverageScore: number
  totalSupporters: number
}

interface EngagementScoreProps {
  campaignId: string
  className?: string
}

export const EngagementScore: React.FC<EngagementScoreProps> = ({
  campaignId,
  className
}) => {
  const [data, setData] = useState<EngagementScoreData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchEngagementScore = async () => {
      try {
        setLoading(true)
        setError(null)
        const response = await fetch(
          `/api/campaigns/${campaignId}/engagement-score`
        )

        if (!response.ok) {
          throw new Error('Failed to fetch engagement score data')
        }

        const result = await response.json()
        if (result.success) {
          setData(result.data)
        } else {
          throw new Error(result.error || 'Unknown error')
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred')
      } finally {
        setLoading(false)
      }
    }

    fetchEngagementScore()
  }, [campaignId])

  if (loading) {
    return (
      <div className={cn('flex items-center justify-center p-8', className)}>
        <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
      </div>
    )
  }

  if (error || !data) {
    return (
      <div className={cn('rounded-lg border border-red-200 bg-red-50 p-4', className)}>
        <p className="text-sm text-red-700">
          {error || 'Failed to load engagement score data'}
        </p>
      </div>
    )
  }

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Never'
    const date = new Date(dateString)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

    if (diffDays === 0) return 'Today'
    if (diffDays === 1) return 'Yesterday'
    if (diffDays < 7) return `${diffDays} days ago`
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`
    return `${Math.floor(diffDays / 30)} months ago`
  }

  const isAbovePlatformAverage =
    data.averageEngagementScore > data.platformAverageScore

  return (
    <div className={cn('space-y-8', className)}>
      {/* Header Section */}
      <div className="rounded-lg bg-gradient-to-r from-blue-50 to-indigo-50 p-6 border border-blue-200">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <Activity className="h-6 w-6 text-blue-600" />
              Campaign Engagement Score
            </h2>
            <p className="mt-2 text-sm text-gray-600">
              Track supporter engagement across your campaign
            </p>
          </div>
          <div className="text-right">
            <div className="text-4xl font-bold text-blue-600">
              {data.averageEngagementScore.toFixed(1)}
            </div>
            <p className="text-sm text-gray-600">Average Score</p>
          </div>
        </div>
      </div>

      {/* Distribution Chart Section */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
          <TrendingUp className="h-5 w-5 text-indigo-600" />
          Engagement Distribution
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Donut Chart */}
          <div className="md:col-span-1 flex items-center justify-center">
            <div className="relative w-48 h-48">
              <svg
                viewBox="0 0 100 100"
                className="w-full h-full transform -rotate-90"
              >
                {/* High Engagement */}
                <circle
                  cx="50"
                  cy="50"
                  r="40"
                  fill="none"
                  stroke="#059669"
                  strokeWidth="12"
                  strokeDasharray={`${
                    (data.distribution.highEngagement.percentage / 100) * 251.2
                  } 251.2`}
                  strokeLinecap="round"
                />
                {/* Moderate Engagement */}
                <circle
                  cx="50"
                  cy="50"
                  r="40"
                  fill="none"
                  stroke="#f59e0b"
                  strokeWidth="12"
                  strokeDasharray={`${
                    (data.distribution.moderateEngagement.percentage / 100) * 251.2
                  } 251.2`}
                  strokeDashoffset={`${
                    -((data.distribution.highEngagement.percentage / 100) * 251.2)
                  }`}
                  strokeLinecap="round"
                />
                {/* Low Engagement */}
                <circle
                  cx="50"
                  cy="50"
                  r="40"
                  fill="none"
                  stroke="#ef4444"
                  strokeWidth="12"
                  strokeDasharray={`${
                    (data.distribution.lowEngagement.percentage / 100) * 251.2
                  } 251.2`}
                  strokeDashoffset={`${
                    -(
                      ((data.distribution.highEngagement.percentage +
                        data.distribution.moderateEngagement.percentage) /
                        100) *
                      251.2
                    )
                  }`}
                  strokeLinecap="round"
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-900">
                    {data.totalSupporters}
                  </div>
                  <div className="text-xs text-gray-600">Supporters</div>
                </div>
              </div>
            </div>
          </div>

          {/* Legend */}
          <div className="md:col-span-2 space-y-3">
            <div className="flex items-start gap-3 p-3 rounded-lg bg-gray-50">
              <div className="w-4 h-4 rounded-full bg-green-600 mt-1 flex-shrink-0" />
              <div className="flex-1">
                <p className="font-semibold text-gray-900 text-sm">
                  Highly Engaged
                </p>
                <p className="text-xs text-gray-600 mt-0.5">
                  {data.distribution.highEngagement.count} supporters (
                  {data.distribution.highEngagement.percentage}%)
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 rounded-lg bg-gray-50">
              <div className="w-4 h-4 rounded-full bg-amber-500 mt-1 flex-shrink-0" />
              <div className="flex-1">
                <p className="font-semibold text-gray-900 text-sm">
                  Moderately Engaged
                </p>
                <p className="text-xs text-gray-600 mt-0.5">
                  {data.distribution.moderateEngagement.count} supporters (
                  {data.distribution.moderateEngagement.percentage}%)
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 rounded-lg bg-gray-50">
              <div className="w-4 h-4 rounded-full bg-red-500 mt-1 flex-shrink-0" />
              <div className="flex-1">
                <p className="font-semibold text-gray-900 text-sm">
                  Low Engagement
                </p>
                <p className="text-xs text-gray-600 mt-0.5">
                  {data.distribution.lowEngagement.count} supporters (
                  {data.distribution.lowEngagement.percentage}%)
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Score Comparison Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="rounded-lg border border-gray-200 bg-white p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">
                Your Campaign Average
              </p>
              <p className="mt-2 text-3xl font-bold text-blue-600">
                {data.averageEngagementScore.toFixed(1)}
              </p>
            </div>
            <div
              className={cn(
                'p-3 rounded-lg',
                isAbovePlatformAverage ? 'bg-green-100' : 'bg-amber-100'
              )}
            >
              <Award
                className={cn(
                  'h-6 w-6',
                  isAbovePlatformAverage ? 'text-green-600' : 'text-amber-600'
                )}
              />
            </div>
          </div>
        </div>

        <div className="rounded-lg border border-gray-200 bg-white p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">
                Platform Average
              </p>
              <p className="mt-2 text-3xl font-bold text-gray-600">
                {data.platformAverageScore.toFixed(1)}
              </p>
            </div>
            <div
              className={cn(
                'p-3 rounded-lg',
                isAbovePlatformAverage ? 'bg-green-100' : 'bg-amber-100'
              )}
            >
              <TrendingUp
                className={cn(
                  'h-6 w-6',
                  isAbovePlatformAverage ? 'text-green-600' : 'text-amber-600'
                )}
              />
            </div>
          </div>
        </div>
      </div>

      {isAbovePlatformAverage && (
        <div className="rounded-lg border border-green-200 bg-green-50 p-4">
          <p className="text-sm text-green-800">
            <span className="font-semibold">Great job!</span> Your campaign has{' '}
            <span className="font-semibold">
              {(
                data.averageEngagementScore - data.platformAverageScore
              ).toFixed(1)}
            </span>{' '}
            higher engagement score than the platform average.
          </p>
        </div>
      )}

      {!isAbovePlatformAverage && (
        <div className="rounded-lg border border-amber-200 bg-amber-50 p-4">
          <p className="text-sm text-amber-800">
            <span className="font-semibold">Opportunity to grow:</span> Consider
            creating more polls, updates, or engagement activities to boost
            supporter involvement.
          </p>
        </div>
      )}

      {/* Top Supporters Section */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
          <Users className="h-5 w-5 text-indigo-600" />
          Top Engaged Supporters
        </h3>

        {data.topSupporters.length === 0 ? (
          <div className="rounded-lg border border-gray-200 bg-gray-50 p-6 text-center">
            <p className="text-sm text-gray-600">
              No engagement data available yet
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {data.topSupporters.map((supporter, index) => (
              <div
                key={supporter.id}
                className="rounded-lg border border-gray-200 bg-white p-4 hover:border-blue-300 hover:shadow-sm transition-all"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3 flex-1">
                    <div className="relative">
                      {supporter.avatar ? (
                        <img
                          src={supporter.avatar}
                          alt={supporter.name}
                          className="h-10 w-10 rounded-full object-cover"
                        />
                      ) : (
                        <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-400 to-indigo-600 flex items-center justify-center text-white font-semibold text-xs">
                          {supporter.name.charAt(0).toUpperCase()}
                        </div>
                      )}
                      <div className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-yellow-400 flex items-center justify-center">
                        <span className="text-xs font-bold">{index + 1}</span>
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-gray-900 truncate">
                        {supporter.name}
                      </p>
                      <p className="text-xs text-gray-600 truncate">
                        @{supporter.handle}
                      </p>
                      <div className="mt-2 flex flex-wrap gap-1">
                        {supporter.activityTypes.map(activity => (
                          <span
                            key={activity}
                            className="inline-block px-2 py-1 text-xs font-medium bg-indigo-100 text-indigo-700 rounded"
                          >
                            {activity}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                  <div className="ml-4 text-right flex-shrink-0">
                    <div className="text-xl font-bold text-blue-600">
                      {supporter.engagementScore.toFixed(1)}
                    </div>
                    <p className="text-xs text-gray-600 mt-1">
                      {formatDate(supporter.lastActive)}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Footer Section */}
      <div className="flex justify-end gap-2 pt-4 border-t border-gray-200">
        <Button
          variant="outline"
          onClick={() => window.location.reload()}
          className="gap-2"
        >
          <Activity className="h-4 w-4" />
          Refresh
        </Button>
      </div>
    </div>
  )
}
