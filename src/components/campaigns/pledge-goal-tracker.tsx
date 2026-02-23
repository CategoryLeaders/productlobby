'use client'

import React, { useEffect, useState } from 'react'
import { Target, Trophy, Loader2, TrendingUp } from 'lucide-react'
import { cn } from '@/lib/utils'
import { formatNumber } from '@/lib/utils'
import { Button } from '@/components/ui/button'

interface PledgeGoalTrackerProps {
  campaignId: string
  className?: string
}

interface GoalData {
  lobbyCount: number
  goal: number
  percentage: number
}

const ConfettiCelebration: React.FC = () => {
  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden">
      {Array.from({ length: 30 }).map((_, i) => (
        <div
          key={i}
          className={cn(
            'absolute w-3 h-3 rounded-full animate-bounce',
            i % 3 === 0 ? 'bg-violet-400' : i % 3 === 1 ? 'bg-lime-400' : 'bg-violet-300'
          )}
          style={{
            left: `${Math.random() * 100}%`,
            top: '-10px',
            animation: `confetti-fall ${2 + Math.random() * 1.5}s linear forwards`,
            animationDelay: `${i * 0.05}s`,
          }}
        />
      ))}
      <style>{`
        @keyframes confetti-fall {
          to {
            transform: translateY(100vh) rotate(720deg);
            opacity: 0;
          }
        }
      `}</style>
    </div>
  )
}

export function PledgeGoalTracker({ campaignId, className }: PledgeGoalTrackerProps) {
  const [data, setData] = useState<GoalData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showCelebration, setShowCelebration] = useState(false)
  const [previousPercentage, setPreviousPercentage] = useState(0)

  useEffect(() => {
    const fetchGoalData = async () => {
      try {
        setLoading(true)
        const response = await fetch(`/api/campaigns/${campaignId}/goal`)

        if (!response.ok) {
          throw new Error('Failed to fetch goal data')
        }

        const result = await response.json()
        setData(result.data)

        // Trigger celebration if goal just reached
        if (previousPercentage < 100 && result.data.percentage >= 100) {
          setShowCelebration(true)
          setTimeout(() => setShowCelebration(false), 3000)
        }
        setPreviousPercentage(result.data.percentage)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error')
      } finally {
        setLoading(false)
      }
    }

    fetchGoalData()
    const interval = setInterval(fetchGoalData, 30000) // Refresh every 30 seconds

    return () => clearInterval(interval)
  }, [campaignId, previousPercentage])

  if (loading) {
    return (
      <div className={cn('flex items-center justify-center p-6', className)}>
        <Loader2 className="w-5 h-5 animate-spin text-violet-500" />
      </div>
    )
  }

  if (error || !data) {
    return (
      <div className={cn('text-center p-6 text-sm text-red-600', className)}>
        {error || 'Failed to load goal data'}
      </div>
    )
  }

  const isGoalReached = data.percentage >= 100
  const clampedPercentage = Math.min(data.percentage, 100)

  return (
    <div className={cn('w-full', className)}>
      {showCelebration && <ConfettiCelebration />}

      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {isGoalReached ? (
              <Trophy className="w-5 h-5 text-lime-500" />
            ) : (
              <Target className="w-5 h-5 text-violet-500" />
            )}
            <h3 className="font-semibold text-gray-900 dark:text-white">
              {isGoalReached ? 'Goal Reached!' : 'Campaign Goal'}
            </h3>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-violet-600 dark:text-violet-400">
              {clampedPercentage}%
            </div>
          </div>
        </div>

        {/* Progress Bar with Milestones */}
        <div className="space-y-2">
          <div className="relative h-8 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
            {/* Main progress fill */}
            <div
              className={cn(
                'h-full rounded-full transition-all duration-500 flex items-center justify-end pr-2',
                isGoalReached
                  ? 'bg-gradient-to-r from-lime-400 to-lime-500'
                  : 'bg-gradient-to-r from-violet-400 to-violet-500'
              )}
              style={{ width: `${clampedPercentage}%` }}
            >
              {clampedPercentage > 10 && (
                <TrendingUp className="w-4 h-4 text-white" />
              )}
            </div>

            {/* Milestone markers */}
            <div className="absolute inset-0 flex">
              {[25, 50, 75, 100].map((milestone) => (
                <div
                  key={milestone}
                  className="absolute top-0 bottom-0 flex items-center justify-center"
                  style={{ left: `${milestone}%` }}
                >
                  <div className="relative flex flex-col items-center">
                    <div
                      className={cn(
                        'w-0.5 h-full',
                        milestone <= clampedPercentage
                          ? 'bg-white'
                          : 'bg-gray-400 dark:bg-gray-500'
                      )}
                    />
                    <span
                      className={cn(
                        'text-xs font-semibold absolute -bottom-5 -translate-x-1/2',
                        milestone <= clampedPercentage
                          ? 'text-violet-600 dark:text-violet-400'
                          : 'text-gray-500 dark:text-gray-400'
                      )}
                    >
                      {milestone}%
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
          {/* Milestone labels spacing */}
          <div className="h-6" />
        </div>

        {/* Count Display */}
        <div className="flex items-center justify-between bg-gray-50 dark:bg-gray-800/50 rounded-lg p-4">
          <div className="flex-1">
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Current Supporters</p>
            <p className="text-lg font-bold text-gray-900 dark:text-white">
              {formatNumber(data.lobbyCount)}
            </p>
          </div>

          <div className="text-center">
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Goal</p>
            <p className="text-lg font-bold text-gray-900 dark:text-white">
              {formatNumber(data.goal)}
            </p>
          </div>

          <div className="flex-1 text-right">
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Remaining</p>
            <p className={cn(
              'text-lg font-bold',
              isGoalReached
                ? 'text-lime-600 dark:text-lime-400'
                : 'text-violet-600 dark:text-violet-400'
            )}>
              {formatNumber(Math.max(0, data.goal - data.lobbyCount))}
            </p>
          </div>
        </div>

        {/* Goal Status Message */}
        <div className={cn(
          'rounded-lg p-4 text-sm font-medium text-center',
          isGoalReached
            ? 'bg-lime-50 dark:bg-lime-900/20 text-lime-700 dark:text-lime-300'
            : 'bg-violet-50 dark:bg-violet-900/20 text-violet-700 dark:text-violet-300'
        )}>
          {isGoalReached ? (
            <div className="flex items-center justify-center gap-2">
              <Trophy className="w-4 h-4" />
              <span>Congratulations! You've reached your support goal!</span>
            </div>
          ) : (
            <div className="flex items-center justify-center gap-2">
              <Target className="w-4 h-4" />
              <span>
                {formatNumber(data.goal - data.lobbyCount)} more supporters needed to reach your goal
              </span>
            </div>
          )}
        </div>

        {/* Share Button */}
        <Button
          variant="outline"
          className="w-full gap-2"
          disabled={loading}
        >
          <TrendingUp className="w-4 h-4" />
          Share Your Progress
        </Button>
      </div>
    </div>
  )
}
