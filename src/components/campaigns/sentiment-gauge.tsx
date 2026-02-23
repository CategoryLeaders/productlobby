'use client'

import React, { useState, useEffect } from 'react'
import { cn } from '@/lib/utils'

interface SentimentData {
  positive: number
  neutral: number
  negative: number
  overall: 'positive' | 'neutral' | 'negative'
  score: number
  trend: {
    week: number[]
  }
}

interface SentimentGaugeProps {
  campaignId: string
  className?: string
}

export const SentimentGauge: React.FC<SentimentGaugeProps> = ({
  campaignId,
  className,
}) => {
  const [sentiment, setSentiment] = useState<SentimentData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchSentiment = async () => {
      try {
        setIsLoading(true)
        const response = await fetch(`/api/campaigns/${campaignId}/sentiment`)

        if (!response.ok) {
          throw new Error('Failed to fetch sentiment data')
        }

        const json = await response.json()
        setSentiment(json.data)
        setError(null)
      } catch (err) {
        console.error('Error fetching sentiment:', err)
        setError('Failed to load sentiment data')
      } finally {
        setIsLoading(false)
      }
    }

    fetchSentiment()
  }, [campaignId])

  const getGaugeColor = (overall: string): string => {
    switch (overall) {
      case 'positive':
        return '#22c55e' // green
      case 'negative':
        return '#ef4444' // red
      default:
        return '#eab308' // yellow
    }
  }

  const getSentimentLabel = (overall: string): string => {
    switch (overall) {
      case 'positive':
        return 'Positive'
      case 'negative':
        return 'Negative'
      default:
        return 'Neutral'
    }
  }

  if (isLoading) {
    return (
      <div className={cn('bg-white border border-gray-200 rounded-lg p-6', className)}>
        <div className="h-64 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-violet-600 mx-auto mb-4"></div>
            <p className="text-gray-600 text-sm">Loading sentiment data...</p>
          </div>
        </div>
      </div>
    )
  }

  if (error || !sentiment) {
    return (
      <div className={cn('bg-white border border-gray-200 rounded-lg p-6', className)}>
        <div className="h-64 flex items-center justify-center">
          <div className="text-center">
            <p className="text-red-600 text-sm">{error || 'No sentiment data available'}</p>
          </div>
        </div>
      </div>
    )
  }

  const gaugeColor = getGaugeColor(sentiment.overall)
  const sentimentLabel = getSentimentLabel(sentiment.overall)

  // Normalize score to 0-100 for gauge visualization (score is -100 to 100)
  const normalizedScore = Math.round(((sentiment.score + 100) / 200) * 100)

  return (
    <div className={cn('bg-white border border-gray-200 rounded-lg p-6', className)}>
      {/* Header */}
      <div className="mb-6">
        <h3 className="font-display font-semibold text-lg text-foreground">
          Community Sentiment
        </h3>
        <p className="text-sm text-gray-600 mt-1">
          Based on comment analysis
        </p>
      </div>

      {/* Main Gauge - Donut Chart */}
      <div className="flex flex-col items-center mb-8">
        <div className="relative w-48 h-48">
          <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
            {/* Background circle */}
            <circle
              cx="50"
              cy="50"
              r="40"
              fill="none"
              stroke="#e5e7eb"
              strokeWidth="8"
            />

            {/* Positive arc */}
            {sentiment.positive > 0 && (
              <circle
                cx="50"
                cy="50"
                r="40"
                fill="none"
                stroke="#22c55e"
                strokeWidth="8"
                strokeDasharray={`${(sentiment.positive / 100) * 251.2} 251.2`}
                strokeLinecap="round"
              />
            )}

            {/* Neutral arc */}
            {sentiment.neutral > 0 && (
              <circle
                cx="50"
                cy="50"
                r="40"
                fill="none"
                stroke="#eab308"
                strokeWidth="8"
                strokeDasharray={`${(sentiment.neutral / 100) * 251.2} 251.2`}
                strokeDashoffset={-((sentiment.positive / 100) * 251.2)}
                strokeLinecap="round"
              />
            )}

            {/* Negative arc */}
            {sentiment.negative > 0 && (
              <circle
                cx="50"
                cy="50"
                r="40"
                fill="none"
                stroke="#ef4444"
                strokeWidth="8"
                strokeDasharray={`${(sentiment.negative / 100) * 251.2} 251.2`}
                strokeDashoffset={-((sentiment.positive / 100) * 251.2 + (sentiment.neutral / 100) * 251.2)}
                strokeLinecap="round"
              />
            )}
          </svg>

          {/* Center content */}
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <div className="text-center">
              <div className="text-4xl font-bold text-foreground">
                {sentiment.score}
              </div>
              <div className="text-xs text-gray-500 mt-1">Score</div>
            </div>
          </div>
        </div>

        {/* Overall Sentiment Badge */}
        <div className="mt-6 text-center">
          <span
            className="inline-block px-4 py-2 rounded-full font-medium text-white text-sm"
            style={{ backgroundColor: gaugeColor }}
          >
            {sentimentLabel}
          </span>
        </div>
      </div>

      {/* Sentiment Breakdown */}
      <div className="space-y-3 mb-6">
        {/* Positive */}
        <div>
          <div className="flex items-center justify-between mb-1">
            <span className="text-sm font-medium text-gray-700 flex items-center">
              <span className="w-3 h-3 rounded-full bg-green-500 mr-2"></span>
              Positive
            </span>
            <span className="text-sm font-semibold text-gray-900">
              {sentiment.positive}%
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-green-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${sentiment.positive}%` }}
            ></div>
          </div>
        </div>

        {/* Neutral */}
        <div>
          <div className="flex items-center justify-between mb-1">
            <span className="text-sm font-medium text-gray-700 flex items-center">
              <span className="w-3 h-3 rounded-full bg-yellow-400 mr-2"></span>
              Neutral
            </span>
            <span className="text-sm font-semibold text-gray-900">
              {sentiment.neutral}%
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-yellow-400 h-2 rounded-full transition-all duration-300"
              style={{ width: `${sentiment.neutral}%` }}
            ></div>
          </div>
        </div>

        {/* Negative */}
        <div>
          <div className="flex items-center justify-between mb-1">
            <span className="text-sm font-medium text-gray-700 flex items-center">
              <span className="w-3 h-3 rounded-full bg-red-500 mr-2"></span>
              Negative
            </span>
            <span className="text-sm font-semibold text-gray-900">
              {sentiment.negative}%
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-red-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${sentiment.negative}%` }}
            ></div>
          </div>
        </div>
      </div>

      {/* Weekly Trend */}
      <div className="bg-gray-50 rounded-lg p-4">
        <h4 className="text-sm font-medium text-gray-900 mb-3">
          7-Day Trend
        </h4>
        <div className="flex items-end justify-between gap-2 h-24">
          {sentiment.trend.week.map((value, idx) => (
            <div
              key={idx}
              className="flex-1 bg-violet-200 rounded-t hover:bg-violet-300 transition-colors"
              style={{
                height: `${Math.max((value / 100) * 100, 4)}%`,
              }}
              title={`${value}% positive`}
            ></div>
          ))}
        </div>
        <div className="text-xs text-gray-500 text-center mt-2">
          Last 7 days
        </div>
      </div>
    </div>
  )
}
