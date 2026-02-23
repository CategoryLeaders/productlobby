'use client'

import React, { useEffect, useState } from 'react'
import { TrendingUp } from 'lucide-react'
import { cn } from '@/lib/utils'

interface FundingData {
  totalFunding: number
  goalAmount: number
  percentage: number
  contributorsCount: number
}

interface FundingTrackerProps {
  campaignId: string
  className?: string
  animated?: boolean
}

/**
 * Campaign Funding Tracker Component
 * Displays a thermometer-style progress bar showing campaign funding progress
 * Shows current funding amount, goal, and number of contributors
 * Features animated fill on mount
 */
export const FundingTracker: React.FC<FundingTrackerProps> = ({
  campaignId,
  className,
  animated = true,
}) => {
  const [fundingData, setFundingData] = useState<FundingData | null>(null)
  const [loading, setLoading] = useState(true)
  const [displayPercentage, setDisplayPercentage] = useState(0)

  useEffect(() => {
    const fetchFunding = async () => {
      try {
        const response = await fetch(
          `/api/campaigns/${campaignId}/funding`
        )
        if (response.ok) {
          const data: FundingData = await response.json()
          setFundingData(data)

          // Animate the fill from 0 to actual percentage
          if (animated) {
            setDisplayPercentage(0)
            // Small delay to trigger animation
            const timer = setTimeout(() => {
              setDisplayPercentage(data.percentage)
            }, 50)
            return () => clearTimeout(timer)
          } else {
            setDisplayPercentage(data.percentage)
          }
        }
      } catch (error) {
        console.error('Failed to fetch funding data:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchFunding()
  }, [campaignId, animated])

  if (loading) {
    return (
      <div
        className={cn(
          'w-full p-6 bg-white border border-gray-200 rounded-lg',
          className
        )}
      >
        <div className="animate-pulse space-y-4">
          <div className="h-4 bg-gray-200 rounded w-24" />
          <div className="h-32 bg-gray-200 rounded" />
          <div className="h-4 bg-gray-200 rounded w-32" />
        </div>
      </div>
    )
  }

  if (!fundingData) {
    return null
  }

  return (
    <div
      className={cn(
        'w-full p-6 bg-white border border-gray-200 rounded-lg',
        className
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-violet-600" />
          <h3 className="font-semibold text-gray-900">Campaign Funding</h3>
        </div>
        <div className="text-right">
          <p className="text-2xl font-bold text-violet-600">
            {fundingData.percentage}%
          </p>
          <p className="text-xs text-gray-500">Complete</p>
        </div>
      </div>

      {/* Thermometer-style progress bar */}
      <div className="relative mb-6 h-64 bg-gray-100 rounded-full overflow-hidden border-2 border-gray-300 mx-auto w-16">
        {/* Filled portion */}
        <div
          className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-violet-600 to-violet-400 transition-all duration-1000 ease-out"
          style={{ height: `${displayPercentage}%` }}
        />

        {/* Percentage marker at top */}
        <div className="absolute top-2 left-1/2 transform -translate-x-1/2 text-xs font-bold text-gray-700 bg-white px-2 py-1 rounded">
          {fundingData.percentage}%
        </div>
      </div>

      {/* Stats section */}
      <div className="space-y-4">
        {/* Funding stats */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-violet-50 p-3 rounded-lg">
            <p className="text-xs text-gray-600 mb-1">Current Funding</p>
            <p className="text-lg font-bold text-violet-600">
              {fundingData.totalFunding}
            </p>
            <p className="text-xs text-gray-500">points</p>
          </div>
          <div className="bg-gray-50 p-3 rounded-lg">
            <p className="text-xs text-gray-600 mb-1">Goal</p>
            <p className="text-lg font-bold text-gray-900">
              {fundingData.goalAmount}
            </p>
            <p className="text-xs text-gray-500">points</p>
          </div>
        </div>

        {/* Contributors */}
        <div className="bg-gradient-to-r from-violet-50 to-indigo-50 p-4 rounded-lg border border-violet-200">
          <p className="text-sm font-semibold text-gray-900 mb-1">
            Contributors
          </p>
          <div className="flex items-baseline gap-2">
            <p className="text-2xl font-bold text-violet-600">
              {fundingData.contributorsCount}
            </p>
            <p className="text-sm text-gray-600">
              {fundingData.contributorsCount === 1 ? 'person' : 'people'} supporting
            </p>
          </div>
        </div>

        {/* Progress message */}
        <div className="text-center pt-2">
          <p className="text-sm text-gray-600">
            {fundingData.percentage === 100
              ? '🎉 Goal reached!'
              : fundingData.percentage >= 75
                ? 'Almost there!'
                : fundingData.percentage >= 50
                  ? 'Making progress'
                  : 'Just getting started'}
          </p>
        </div>
      </div>
    </div>
  )
}
