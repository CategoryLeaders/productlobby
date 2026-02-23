'use client'

import React, { useState, useEffect } from 'react'
import { Clock } from 'lucide-react'
import { cn } from '@/lib/utils'

interface DeadlineCountdownProps {
  deadline: string
  campaignTitle: string
}

interface TimeRemaining {
  days: number
  hours: number
  minutes: number
  seconds: number
  isExpired: boolean
}

export function DeadlineCountdown({
  deadline,
  campaignTitle,
}: DeadlineCountdownProps) {
  const [timeRemaining, setTimeRemaining] = useState<TimeRemaining | null>(null)

  useEffect(() => {
    const calculateTimeRemaining = (): TimeRemaining => {
      const now = new Date()
      const deadlineDate = new Date(deadline)
      const diffMs = deadlineDate.getTime() - now.getTime()

      if (diffMs <= 0) {
        return {
          days: 0,
          hours: 0,
          minutes: 0,
          seconds: 0,
          isExpired: true,
        }
      }

      const days = Math.floor(diffMs / (1000 * 60 * 60 * 24))
      const hours = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
      const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60))
      const seconds = Math.floor((diffMs % (1000 * 60)) / 1000)

      return {
        days,
        hours,
        minutes,
        seconds,
        isExpired: false,
      }
    }

    setTimeRemaining(calculateTimeRemaining())

    const interval = setInterval(() => {
      setTimeRemaining(calculateTimeRemaining())
    }, 1000)

    return () => clearInterval(interval)
  }, [deadline])

  if (!timeRemaining) {
    return null
  }

  if (timeRemaining.isExpired) {
    return (
      <div className="w-full bg-gradient-to-r from-red-50 to-red-100 border border-red-200 rounded-lg p-6 text-center">
        <div className="flex items-center justify-center gap-2 mb-2">
          <Clock className="w-5 h-5 text-red-600" />
          <h3 className="text-lg font-semibold text-red-700">Campaign Expired</h3>
        </div>
        <p className="text-sm text-red-600">
          The deadline for {campaignTitle} has passed
        </p>
      </div>
    )
  }

  const isUrgent = timeRemaining.days === 0 && timeRemaining.hours < 24
  const isCritical = timeRemaining.days === 0 && timeRemaining.hours < 6

  return (
    <div
      className={cn(
        'w-full rounded-lg p-6 border transition-all duration-300',
        isCritical
          ? 'bg-gradient-to-r from-red-50 to-orange-50 border-red-300'
          : isUrgent
            ? 'bg-gradient-to-r from-amber-50 to-orange-50 border-amber-300'
            : 'bg-gradient-to-r from-violet-50 to-purple-50 border-violet-200'
      )}
    >
      <div className="flex items-center gap-3 mb-4">
        <div
          className={cn(
            'p-2 rounded-full',
            isCritical
              ? 'bg-red-200'
              : isUrgent
                ? 'bg-amber-200'
                : 'bg-violet-200'
          )}
        >
          <Clock
            className={cn(
              'w-5 h-5',
              isCritical
                ? 'text-red-600'
                : isUrgent
                  ? 'text-amber-600'
                  : 'text-violet-600'
            )}
          />
        </div>
        <div>
          <h3
            className={cn(
              'text-lg font-semibold',
              isCritical
                ? 'text-red-700'
                : isUrgent
                  ? 'text-amber-700'
                  : 'text-violet-700'
            )}
          >
            Campaign Deadline
          </h3>
          <p
            className={cn(
              'text-sm',
              isCritical
                ? 'text-red-600'
                : isUrgent
                  ? 'text-amber-600'
                  : 'text-violet-600'
            )}
          >
            {campaignTitle}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-2 sm:gap-3">
        {/* Days Flip Card */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="p-2 sm:p-3">
            <div
              className={cn(
                'text-2xl sm:text-3xl font-bold text-center font-mono transition-all duration-300',
                isCritical
                  ? 'text-red-600'
                  : isUrgent
                    ? 'text-amber-600'
                    : 'text-violet-600'
              )}
            >
              {String(timeRemaining.days).padStart(2, '0')}
            </div>
            <div className="text-xs sm:text-sm text-gray-600 text-center font-medium mt-1">
              {timeRemaining.days === 1 ? 'Day' : 'Days'}
            </div>
          </div>
        </div>

        {/* Hours Flip Card */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="p-2 sm:p-3">
            <div
              className={cn(
                'text-2xl sm:text-3xl font-bold text-center font-mono transition-all duration-300',
                isCritical
                  ? 'text-red-600'
                  : isUrgent
                    ? 'text-amber-600'
                    : 'text-violet-600'
              )}
            >
              {String(timeRemaining.hours).padStart(2, '0')}
            </div>
            <div className="text-xs sm:text-sm text-gray-600 text-center font-medium mt-1">
              Hours
            </div>
          </div>
        </div>

        {/* Minutes Flip Card */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="p-2 sm:p-3">
            <div
              className={cn(
                'text-2xl sm:text-3xl font-bold text-center font-mono transition-all duration-300',
                isCritical
                  ? 'text-red-600'
                  : isUrgent
                    ? 'text-amber-600'
                    : 'text-violet-600'
              )}
            >
              {String(timeRemaining.minutes).padStart(2, '0')}
            </div>
            <div className="text-xs sm:text-sm text-gray-600 text-center font-medium mt-1">
              Minutes
            </div>
          </div>
        </div>

        {/* Seconds Flip Card */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="p-2 sm:p-3">
            <div
              className={cn(
                'text-2xl sm:text-3xl font-bold text-center font-mono transition-all duration-300',
                isCritical
                  ? 'text-red-600'
                  : isUrgent
                    ? 'text-amber-600'
                    : 'text-violet-600'
              )}
            >
              {String(timeRemaining.seconds).padStart(2, '0')}
            </div>
            <div className="text-xs sm:text-sm text-gray-600 text-center font-medium mt-1">
              Seconds
            </div>
          </div>
        </div>
      </div>

      {isCritical && (
        <div className="mt-4 p-3 bg-red-100 border border-red-200 rounded text-red-700 text-sm font-medium text-center">
          Deadline is approaching! Take action now.
        </div>
      )}
    </div>
  )
}
