'use client'

import React, { useState, useEffect } from 'react'
import { Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'

interface PledgeMeterProps {
  campaignId: string
  goalPledges?: number
  showLabel?: boolean
  variant?: 'thermometer' | 'bar'
  className?: string
}

export function PledgeMeter({
  campaignId,
  goalPledges = 100,
  showLabel = true,
  variant = 'thermometer',
  className,
}: PledgeMeterProps) {
  const [data, setData] = useState<{
    totalPledges: number
    estimatedDemandValue: number
    progress: number
  } | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchPledges = async () => {
      try {
        const response = await fetch(
          `/api/campaigns/${campaignId}/pledge?limit=1`
        )

        if (response.ok) {
          const result = await response.json()
          setData({
            totalPledges: result.data.totalPledges || 0,
            estimatedDemandValue: result.data.estimatedDemandValue || 0,
            progress: result.data.progress || 0,
          })
        }
      } catch (err) {
        console.error('Error fetching pledge data:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchPledges()
  }, [campaignId])

  if (loading) {
    return (
      <div className={cn('flex items-center justify-center h-32', className)}>
        <Loader2 className="w-5 h-5 text-violet-600 animate-spin" />
      </div>
    )
  }

  if (!data || data.totalPledges === 0) {
    return (
      <div className={cn('text-center py-4', className)}>
        <p className="text-sm text-gray-500">
          Be the first to pledge your support!
        </p>
      </div>
    )
  }

  const percentage = Math.min((data.totalPledges / goalPledges) * 100, 100)
  const isGoalReached = data.totalPledges >= goalPledges

  return (
    <div className={cn('space-y-3', className)}>
      {/* Label */}
      {showLabel && (
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-gray-900">Pledge Progress</h3>
          <span className="text-sm font-medium text-violet-600">
            {data.totalPledges} / {goalPledges}
          </span>
        </div>
      )}

      {/* Thermometer Style */}
      {variant === 'thermometer' && (
        <div className="space-y-2">
          {/* Thermometer Container */}
          <div className="relative w-12 h-48 mx-auto bg-gray-100 border-2 border-gray-300 rounded-full rounded-t-lg overflow-hidden">
            {/* Filled portion */}
            <div
              className={cn(
                'absolute bottom-0 left-0 right-0 w-full transition-all duration-500 ease-out',
                isGoalReached ? 'bg-lime-500' : 'bg-gradient-to-t from-violet-600 to-violet-400'
              )}
              style={{ height: `${percentage}%` }}
            />

            {/* Mercury ball at bottom */}
            <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-8 h-8 bg-violet-600 rounded-full border-2 border-gray-300" />
          </div>

          {/* Percentage Display */}
          <p className="text-center text-sm font-medium text-gray-700">
            {Math.round(percentage)}%
          </p>
        </div>
      )}

      {/* Bar Style */}
      {variant === 'bar' && (
        <div className="space-y-2">
          {/* Progress Bar */}
          <div className="w-full h-6 bg-gray-100 rounded-full overflow-hidden border border-gray-300">
            <div
              className={cn(
                'h-full transition-all duration-500 ease-out flex items-center justify-center text-xs font-bold text-white',
                isGoalReached ? 'bg-lime-500' : 'bg-gradient-to-r from-violet-600 to-violet-400'
              )}
              style={{ width: `${percentage}%` }}
            >
              {percentage > 10 && `${Math.round(percentage)}%`}
            </div>
          </div>

          {/* Stats */}
          <div className="flex items-center justify-between text-xs text-gray-600">
            <span>
              <strong className="text-gray-900">{data.totalPledges}</strong> pledges
            </span>
            <span>Goal: {goalPledges}</span>
          </div>
        </div>
      )}

      {/* Estimated Demand Value */}
      {data.estimatedDemandValue > 0 && (
        <div className="bg-violet-50 border border-violet-200 rounded-lg p-3 text-center">
          <p className="text-xs text-gray-600 mb-1">Estimated Demand Value</p>
          <p className="text-lg font-bold text-violet-600">
            £{data.estimatedDemandValue.toLocaleString()}
          </p>
        </div>
      )}

      {/* Goal Reached Message */}
      {isGoalReached && (
        <div className="bg-lime-50 border border-lime-200 rounded-lg p-3 text-center">
          <p className="text-sm font-medium text-lime-700">
            ✓ Goal reached! {data.totalPledges} people have pledged.
          </p>
        </div>
      )}
    </div>
  )
}
