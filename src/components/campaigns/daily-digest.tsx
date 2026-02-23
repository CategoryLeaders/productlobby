'use client'

import React, { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import {
  CalendarDays,
  ThumbsUp,
  MessageSquare,
  Share2,
  ChevronLeft,
  ChevronRight,
  Loader2,
  TrendingUp,
  TrendingDown,
} from 'lucide-react'

interface DigestData {
  date: string
  newLobbies: number
  newComments: number
  newShares: number
  topComment: {
    content: string
    author: string
    likes: number
  } | null
  mostActiveSupporter: {
    name: string
    contributions: number
  } | null
  comparison: {
    lobbiesChange: number
    lobbiesPercent: number
    commentsChange: number
    commentsPercent: number
    sharesChange: number
    sharesPercent: number
  }
}

interface DailyDigestProps {
  campaignId: string
}

export function DailyDigest({ campaignId }: DailyDigestProps) {
  const [currentDate, setCurrentDate] = useState<Date>(new Date())
  const [digestData, setDigestData] = useState<DigestData | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Fetch digest data whenever date changes
  useEffect(() => {
    fetchDigest()
  }, [currentDate])

  const fetchDigest = async () => {
    try {
      setLoading(true)
      setError(null)

      const dateStr = currentDate.toISOString().split('T')[0]
      const response = await fetch(
        `/api/campaigns/${campaignId}/digest?date=${dateStr}`
      )

      if (!response.ok) {
        throw new Error('Failed to fetch digest')
      }

      const data = await response.json()
      setDigestData(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  const handlePrevDay = () => {
    const newDate = new Date(currentDate)
    newDate.setDate(newDate.getDate() - 1)
    setCurrentDate(newDate)
  }

  const handleNextDay = () => {
    const newDate = new Date(currentDate)
    newDate.setDate(newDate.getDate() + 1)
    setCurrentDate(newDate)
  }

  const handleToday = () => {
    setCurrentDate(new Date())
  }

  const isToday =
    currentDate.toDateString() === new Date().toDateString()
  const isFuture = currentDate > new Date()

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    })
  }

  const formatDateShort = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    })
  }

  const renderTrendIndicator = (change: number, percent: number) => {
    if (change === 0) {
      return (
        <span className="text-xs text-gray-500">No change</span>
      )
    }

    const isPositive = change > 0
    return (
      <div className="flex items-center gap-1">
        {isPositive ? (
          <TrendingUp className="h-4 w-4 text-green-600" />
        ) : (
          <TrendingDown className="h-4 w-4 text-red-600" />
        )}
        <span className={cn(
          'text-xs font-medium',
          isPositive ? 'text-green-600' : 'text-red-600'
        )}>
          {isPositive ? '+' : ''}{percent.toFixed(1)}%
        </span>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Date Navigation */}
      <div className="flex items-center justify-between bg-white rounded-lg border border-gray-200 p-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={handlePrevDay}
          disabled={loading}
          className="h-8 w-8 p-0"
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>

        <div className="flex items-center gap-2">
          <CalendarDays className="h-4 w-4 text-gray-600" />
          <span className="font-medium text-gray-900">
            {formatDate(currentDate)}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleToday}
            disabled={isToday || loading}
            className="text-xs"
          >
            Today
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleNextDay}
            disabled={isFuture || loading}
            className="h-8 w-8 p-0"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="flex justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin text-violet-600" />
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-sm text-red-800">Error: {error}</p>
        </div>
      )}

      {/* Summary Cards */}
      {digestData && !loading && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* New Lobbies Card */}
            <div className="bg-white rounded-lg border border-gray-200 p-5">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs font-medium text-gray-600 uppercase">
                    New Lobbies
                  </p>
                  <p className="text-3xl font-bold text-gray-900 mt-2">
                    {digestData.newLobbies}
                  </p>
                </div>
                <ThumbsUp className="h-6 w-6 text-blue-600" />
              </div>
              <div className="mt-3 pt-3 border-t border-gray-100">
                {renderTrendIndicator(
                  digestData.comparison.lobbiesChange,
                  digestData.comparison.lobbiesPercent
                )}
              </div>
            </div>

            {/* New Comments Card */}
            <div className="bg-white rounded-lg border border-gray-200 p-5">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs font-medium text-gray-600 uppercase">
                    New Comments
                  </p>
                  <p className="text-3xl font-bold text-gray-900 mt-2">
                    {digestData.newComments}
                  </p>
                </div>
                <MessageSquare className="h-6 w-6 text-purple-600" />
              </div>
              <div className="mt-3 pt-3 border-t border-gray-100">
                {renderTrendIndicator(
                  digestData.comparison.commentsChange,
                  digestData.comparison.commentsPercent
                )}
              </div>
            </div>

            {/* New Shares Card */}
            <div className="bg-white rounded-lg border border-gray-200 p-5">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs font-medium text-gray-600 uppercase">
                    New Shares
                  </p>
                  <p className="text-3xl font-bold text-gray-900 mt-2">
                    {digestData.newShares}
                  </p>
                </div>
                <Share2 className="h-6 w-6 text-green-600" />
              </div>
              <div className="mt-3 pt-3 border-t border-gray-100">
                {renderTrendIndicator(
                  digestData.comparison.sharesChange,
                  digestData.comparison.sharesPercent
                )}
              </div>
            </div>
          </div>

          {/* Highlights Section */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Top Comment */}
            <div className="bg-white rounded-lg border border-gray-200 p-5">
              <h3 className="font-semibold text-gray-900 mb-3">Top Comment</h3>
              {digestData.topComment ? (
                <div className="space-y-3">
                  <p className="text-sm text-gray-700 line-clamp-3">
                    {digestData.topComment.content}
                  </p>
                  <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                    <span className="text-xs font-medium text-gray-600">
                      By {digestData.topComment.author}
                    </span>
                    <div className="flex items-center gap-1">
                      <ThumbsUp className="h-4 w-4 text-gray-400" />
                      <span className="text-xs font-medium text-gray-600">
                        {digestData.topComment.likes}
                      </span>
                    </div>
                  </div>
                </div>
              ) : (
                <p className="text-sm text-gray-500 italic">
                  No comments yet
                </p>
              )}
            </div>

            {/* Most Active Supporter */}
            <div className="bg-white rounded-lg border border-gray-200 p-5">
              <h3 className="font-semibold text-gray-900 mb-3">
                Most Active Supporter
              </h3>
              {digestData.mostActiveSupporter ? (
                <div className="space-y-3">
                  <p className="text-lg font-bold text-gray-900">
                    {digestData.mostActiveSupporter.name}
                  </p>
                  <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                    <span className="text-xs font-medium text-gray-600">
                      Contributions
                    </span>
                    <span className="text-sm font-bold text-violet-600">
                      {digestData.mostActiveSupporter.contributions}
                    </span>
                  </div>
                </div>
              ) : (
                <p className="text-sm text-gray-500 italic">
                  No activity yet
                </p>
              )}
            </div>
          </div>

          {/* Date Info */}
          <div className="text-xs text-gray-500 text-center">
            Showing activity for {formatDateShort(currentDate)}
          </div>
        </>
      )}
    </div>
  )
}
