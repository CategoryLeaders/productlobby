'use client'

import React, { useState } from 'react'
import { Target, Calendar, Users, Loader2, CheckCircle } from 'lucide-react'
import { formatDistanceToNow, isPast } from 'date-fns'
import { cn } from '@/lib/utils'

interface ChallengeCardProps {
  id: string
  title: string
  description: string
  target: number
  deadline: string
  currentProgress?: number
  onJoinChallenge?: (challengeId: string) => void | Promise<void>
  isJoined?: boolean
}

export const ChallengeCard: React.FC<ChallengeCardProps> = ({
  id,
  title,
  description,
  target,
  deadline,
  currentProgress = 0,
  onJoinChallenge,
  isJoined = false,
}) => {
  const [isLoading, setIsLoading] = useState(false)
  const [hasJoined, setHasJoined] = useState(isJoined)

  const deadlineDate = new Date(deadline)
  const isExpired = isPast(deadlineDate)
  const progressPercentage = Math.min((currentProgress / target) * 100, 100)
  const timeRemaining = formatDistanceToNow(deadlineDate, { addSuffix: true })

  const handleJoinChallenge = async () => {
    try {
      setIsLoading(true)

      if (onJoinChallenge) {
        await onJoinChallenge(id)
      }

      setHasJoined(true)
    } catch (error) {
      console.error('Failed to join challenge:', error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div
      className={cn(
        'rounded-lg border p-5 transition-all',
        isExpired
          ? 'border-slate-200 bg-slate-50'
          : 'border-violet-200 bg-white hover:border-violet-300 hover:shadow-md'
      )}
    >
      {/* Header */}
      <div className="mb-4 flex items-start justify-between gap-3">
        <div className="flex-1">
          <div className="mb-1 flex items-center gap-2">
            <Target className={cn('h-5 w-5', isExpired ? 'text-slate-400' : 'text-violet-600')} />
            <h3 className={cn('font-semibold', isExpired ? 'text-slate-600' : 'text-slate-900')}>
              {title}
            </h3>
          </div>
          <p className="text-sm text-slate-600">{description}</p>
        </div>
        {hasJoined && (
          <div className="rounded-lg bg-lime-50 px-3 py-1">
            <span className="flex items-center gap-1 text-xs font-medium text-lime-700">
              <CheckCircle className="h-3 w-3" />
              Joined
            </span>
          </div>
        )}
      </div>

      {/* Progress Bar */}
      <div className="mb-4">
        <div className="mb-2 flex items-center justify-between">
          <span className="text-xs font-medium text-slate-600">Progress</span>
          <span className={cn('text-xs font-bold', progressPercentage === 100 ? 'text-lime-600' : 'text-violet-600')}>
            {currentProgress} / {target}
          </span>
        </div>
        <div className="h-2 w-full overflow-hidden rounded-full bg-slate-200">
          <div
            className={cn(
              'h-full transition-all duration-300',
              progressPercentage === 100 ? 'bg-lime-500' : 'bg-violet-500'
            )}
            style={{ width: `${progressPercentage}%` }}
          />
        </div>
      </div>

      {/* Meta Information */}
      <div className="mb-4 flex flex-wrap gap-4">
        <div className="flex items-center gap-2 text-sm">
          <Calendar className={cn('h-4 w-4', isExpired ? 'text-slate-400' : 'text-slate-500')} />
          <span className="text-slate-600">
            {isExpired ? 'Ended' : 'Ends'} {timeRemaining}
          </span>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <Users className={cn('h-4 w-4', isExpired ? 'text-slate-400' : 'text-slate-500')} />
          <span className="text-slate-600">{target} goal</span>
        </div>
      </div>

      {/* Action Button */}
      {!isExpired && !hasJoined && (
        <button
          onClick={handleJoinChallenge}
          disabled={isLoading}
          className={cn(
            'w-full rounded-lg px-4 py-2 font-medium text-white transition-colors',
            'bg-violet-600 hover:bg-violet-700',
            'disabled:opacity-50 disabled:cursor-not-allowed'
          )}
        >
          {isLoading ? (
            <span className="flex items-center justify-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin" />
              Joining...
            </span>
          ) : (
            'Join Challenge'
          )}
        </button>
      )}

      {isExpired && (
        <div className="rounded-lg bg-slate-100 px-4 py-2 text-center text-sm font-medium text-slate-600">
          Challenge Ended
        </div>
      )}

      {hasJoined && !isExpired && (
        <div className="rounded-lg bg-lime-50 px-4 py-2 text-center text-sm font-medium text-lime-700">
          You are participating in this challenge
        </div>
      )}
    </div>
  )
}
