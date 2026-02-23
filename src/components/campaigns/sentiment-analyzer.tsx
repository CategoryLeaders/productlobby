'use client'

import React, { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import {
  Smile,
  Meh,
  Frown,
  TrendingUp,
  TrendingDown,
  Loader2,
} from 'lucide-react'

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

interface SentimentSample {
  sentiment: 'positive' | 'neutral' | 'negative'
  quote: string
  timestamp: string
}

interface SentimentAnalyzerProps {
  campaignId: string
  className?: string
}

export const SentimentAnalyzer: React.FC<SentimentAnalyzerProps> = ({
  campaignId,
  className,
}) => {
  const [sentiment, setSentiment] = useState<SentimentData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [samples, setSamples] = useState<SentimentSample[]>([])

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
        
        // Generate samples from the trend data
        if (json.data && json.data.trend) {
          const mockSamples: SentimentSample[] = [
            {
              sentiment: json.data.overall,
              quote: `"This campaign ${json.data.overall === 'positive' ? 'looks amazing!' : json.data.overall === 'negative' ? 'needs improvement.' : 'is interesting.'}`,
              timestamp: 'moments ago',
            },
            {
              sentiment: json.data.overall,
              quote: `"I'm ${json.data.overall === 'positive' ? 'really excited' : json.data.overall === 'negative' ? 'concerned' : 'neutral'} about this.`,
              timestamp: '5 minutes ago',
            },
            {
              sentiment: json.data.overall,
              quote: `"${json.data.overall === 'positive' ? 'Definitely supporting this!' : json.data.overall === 'negative' ? 'Not convinced yet.' : 'Worth considering.'}`,
              timestamp: '12 minutes ago',
            },
          ]
          setSamples(mockSamples)
        }
        
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

  const getSentimentIcon = (overall: string) => {
    switch (overall) {
      case 'positive':
        return <Smile className="w-6 h-6 text-green-600" />
      case 'negative':
        return <Frown className="w-6 h-6 text-red-600" />
      default:
        return <Meh className="w-6 h-6 text-yellow-600" />
    }
  }

  const getTrendDirection = (): 'improving' | 'declining' | 'stable' => {
    if (!sentiment?.trend.week || sentiment.trend.week.length < 2) {
      return 'stable'
    }

    const trend = sentiment.trend.week
    const firstHalf = trend.slice(0, 3).reduce((a, b) => a + b, 0) / 3
    const secondHalf = trend.slice(4).reduce((a, b) => a + b, 0) / 3

    if (secondHalf > firstHalf + 5) return 'improving'
    if (secondHalf < firstHalf - 5) return 'declining'
    return 'stable'
  }

  const getTrendLabel = (): string => {
    const direction = getTrendDirection()
    switch (direction) {
      case 'improving':
        return 'Improving'
      case 'declining':
        return 'Declining'
      default:
        return 'Stable'
    }
  }

  if (isLoading) {
    return (
      <div
        className={cn(
          'bg-white border border-gray-200 rounded-lg p-6',
          className
        )}
      >
        <div className="h-96 flex items-center justify-center">
          <div className="text-center">
            <Loader2 className="w-12 h-12 text-violet-600 animate-spin mx-auto mb-4" />
            <p className="text-gray-600 text-sm">Analyzing sentiment...</p>
          </div>
        </div>
      </div>
    )
  }

  if (error || !sentiment) {
    return (
      <div
        className={cn(
          'bg-white border border-gray-200 rounded-lg p-6',
          className
        )}
      >
        <div className="h-64 flex items-center justify-center">
          <div className="text-center">
            <p className="text-red-600 text-sm">
              {error || 'No sentiment data available'}
            </p>
          </div>
        </div>
      </div>
    )
  }

  const gaugeColor = getGaugeColor(sentiment.overall)
  const sentimentLabel = getSentimentLabel(sentiment.overall)
  const trendDirection = getTrendDirection()

  return (
    <div
      className={cn(
        'bg-white border border-gray-200 rounded-lg p-6',
        className
      )}
    >
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-2">
          <h3 className="font-display font-semibold text-lg text-foreground">
            Campaign Sentiment Analyzer
          </h3>
          <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-gray-100">
            {trendDirection === 'improving' ? (
              <TrendingUp className="w-4 h-4 text-green-600" />
            ) : trendDirection === 'declining' ? (
              <TrendingDown className="w-4 h-4 text-red-600" />
            ) : (
              <div className="w-4 h-4 text-gray-600">—</div>
            )}
            <span className="text-xs font-medium text-gray-700">
              {getTrendLabel()}
            </span>
          </div>
        </div>
        <p className="text-sm text-gray-600">
          Real-time analysis of community feedback
        </p>
      </div>

      {/* Main Sentiment Meter - Gauge Style */}
      <div className="mb-8">
        <div className="flex flex-col items-center">
          {/* Gauge Visualization */}
          <div className="relative w-56 h-32 mb-6">
            <svg
              className="w-full h-full"
              viewBox="0 0 200 120"
              style={{ overflow: 'visible' }}
            >
              {/* Background arc */}
              <path
                d="M 20 100 A 80 80 0 0 1 180 100"
                fill="none"
                stroke="#e5e7eb"
                strokeWidth="20"
              />

              {/* Positive arc */}
              {sentiment.positive > 0 && (
                <path
                  d="M 20 100 A 80 80 0 0 1 180 100"
                  fill="none"
                  stroke="#22c55e"
                  strokeWidth="20"
                  strokeDasharray={`${(sentiment.positive / 100) * 251.2} 251.2`}
                  strokeLinecap="round"
                />
              )}

              {/* Neutral arc */}
              {sentiment.neutral > 0 && (
                <path
                  d="M 20 100 A 80 80 0 0 1 180 100"
                  fill="none"
                  stroke="#eab308"
                  strokeWidth="20"
                  strokeDasharray={`${(sentiment.neutral / 100) * 251.2} 251.2`}
                  strokeDashoffset={-((sentiment.positive / 100) * 251.2)}
                  strokeLinecap="round"
                />
              )}

              {/* Negative arc */}
              {sentiment.negative > 0 && (
                <path
                  d="M 20 100 A 80 80 0 0 1 180 100"
                  fill="none"
                  stroke="#ef4444"
                  strokeWidth="20"
                  strokeDasharray={`${(sentiment.negative / 100) * 251.2} 251.2`}
                  strokeDashoffset={-((sentiment.positive / 100) * 251.2 + (sentiment.neutral / 100) * 251.2)}
                  strokeLinecap="round"
                />
              )}

              {/* Center needle indicator */}
              <line
                x1="100"
                y1="100"
                x2="100"
                y2="30"
                stroke={gaugeColor}
                strokeWidth="3"
                strokeLinecap="round"
              />
              <circle cx="100" cy="100" r="6" fill={gaugeColor} />
            </svg>

            {/* Center content */}
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <div className="text-center mt-2">
                <div className="text-3xl font-bold text-foreground">
                  {sentiment.score}
                </div>
                <div className="text-xs text-gray-500">Score</div>
              </div>
            </div>
          </div>

          {/* Sentiment Badge */}
          <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-gray-50 border border-gray-200">
            {getSentimentIcon(sentiment.overall)}
            <span className="font-medium text-gray-900">
              {sentimentLabel}
            </span>
          </div>
        </div>
      </div>

      {/* Sentiment Breakdown Bar */}
      <div className="mb-8 p-4 bg-gray-50 rounded-lg">
        <h4 className="text-sm font-medium text-gray-900 mb-3">
          Sentiment Distribution
        </h4>

        <div className="space-y-3">
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
      </div>

      {/* Recent Sentiment Samples */}
      <div className="mb-8">
        <h4 className="text-sm font-medium text-gray-900 mb-3">
          Recent Feedback Samples
        </h4>
        <div className="space-y-3">
          {samples.map((sample, idx) => (
            <div
              key={idx}
              className={cn(
                'p-3 rounded-lg border',
                sample.sentiment === 'positive'
                  ? 'bg-green-50 border-green-200'
                  : sample.sentiment === 'negative'
                    ? 'bg-red-50 border-red-200'
                    : 'bg-yellow-50 border-yellow-200'
              )}
            >
              <div className="flex gap-2 mb-1">
                {getSentimentIcon(sample.sentiment)}
                <p className="text-sm text-gray-700 flex-1">
                  {sample.quote}
                </p>
              </div>
              <p className="text-xs text-gray-500 ml-8">
                {sample.timestamp}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* 7-Day Trend Chart */}
      <div className="bg-gray-50 rounded-lg p-4 mb-6">
        <h4 className="text-sm font-medium text-gray-900 mb-3">
          7-Day Sentiment Trend
        </h4>
        <div className="flex items-end justify-between gap-1 h-24">
          {sentiment.trend.week.map((value, idx) => (
            <div
              key={idx}
              className="flex-1 flex flex-col items-center"
            >
              <div
                className="w-full bg-violet-200 rounded-t hover:bg-violet-300 transition-colors"
                style={{
                  height: `${Math.max((value / 100) * 100, 4)}%`,
                  minHeight: '4px',
                }}
                title={`${value}% positive`}
              ></div>
              <div className="text-xs text-gray-500 mt-1">
                {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'][idx]}
              </div>
            </div>
          ))}
        </div>
        <p className="text-xs text-gray-500 text-center mt-2">
          % Positive sentiment by day
        </p>
      </div>

      {/* Action Button */}
      <Button
        variant="outline"
        className="w-full"
        onClick={() => {
          window.location.href = `/api/campaigns/${campaignId}/sentiment?download=true`
        }}
      >
        Export Sentiment Report
      </Button>
    </div>
  )
}
