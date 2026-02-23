'use client'

import React, { useState, useEffect } from 'react'
import { Cloud, AlertCircle, Loader } from 'lucide-react'
import { cn } from '@/lib/utils'

interface WeatherMetrics {
  lobbiesGrowth: number
  commentsVelocity: number
  sentimentScore: number
  signalScore: number
}

interface WeatherReportData {
  emoji: string
  condition: string
  description: string
  temperature: number
  windSpeed: number
  sunshineLevel: number
  pressure: number
  forecast: string
  metrics: WeatherMetrics
}

interface WeatherReportProps {
  campaignId: string
  compact?: boolean
}

const getTemperatureColor = (temp: number): string => {
  if (temp >= 90) return 'from-red-600 to-orange-500'
  if (temp >= 80) return 'from-orange-600 to-yellow-500'
  if (temp >= 70) return 'from-yellow-600 to-green-500'
  if (temp >= 60) return 'from-blue-600 to-cyan-500'
  if (temp >= 50) return 'from-blue-700 to-slate-500'
  if (temp >= 40) return 'from-slate-600 to-blue-400'
  return 'from-blue-900 to-cyan-300'
}

const getGrowthBadgeColor = (growth: number): string => {
  if (growth >= 50) return 'bg-emerald-100 text-emerald-800 border-emerald-300'
  if (growth >= 20) return 'bg-green-100 text-green-800 border-green-300'
  if (growth >= 0) return 'bg-blue-100 text-blue-800 border-blue-300'
  if (growth >= -20) return 'bg-amber-100 text-amber-800 border-amber-300'
  return 'bg-red-100 text-red-800 border-red-300'
}

const getGrowthLabel = (growth: number): string => {
  if (growth >= 50) return 'Booming'
  if (growth >= 20) return 'Growing'
  if (growth >= 0) return 'Stable'
  if (growth >= -20) return 'Slowing'
  return 'Declining'
}

const getEngagementBadgeColor = (wind: number): string => {
  if (wind >= 20) return 'bg-purple-100 text-purple-800 border-purple-300'
  if (wind >= 10) return 'bg-blue-100 text-blue-800 border-blue-300'
  if (wind >= 5) return 'bg-cyan-100 text-cyan-800 border-cyan-300'
  return 'bg-slate-100 text-slate-800 border-slate-300'
}

const getEngagementLabel = (wind: number): string => {
  if (wind >= 20) return 'Storming'
  if (wind >= 10) return 'Breezy'
  if (wind >= 5) return 'Mild'
  return 'Calm'
}

export const WeatherReport: React.FC<WeatherReportProps> = ({
  campaignId,
  compact = false,
}) => {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [report, setReport] = useState<WeatherReportData | null>(null)

  useEffect(() => {
    const fetchWeather = async () => {
      try {
        setLoading(true)
        const response = await fetch(`/api/campaigns/${campaignId}/weather`)

        if (!response.ok) {
          throw new Error('Failed to fetch weather report')
        }

        const data = await response.json()
        setReport(data)
        setError(null)
      } catch (err) {
        const message = err instanceof Error ? err.message : 'An error occurred'
        setError(message)
      } finally {
        setLoading(false)
      }
    }

    fetchWeather()
  }, [campaignId])

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader className="w-5 h-5 animate-spin text-blue-600 mr-2" />
        <p className="text-gray-500 text-sm">Loading campaign weather...</p>
      </div>
    )
  }

  if (error || !report) {
    return (
      <div className="p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
        <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
        <p className="text-sm text-red-700">{error || 'Could not load weather report'}</p>
      </div>
    )
  }

  if (compact) {
    // Compact view
    return (
      <div
        className={cn(
          'rounded-lg p-4 bg-gradient-to-br',
          getTemperatureColor(report.temperature)
        )}
      >
        <div className="text-white space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-3xl">{report.emoji}</span>
              <div>
                <p className="text-lg font-bold">{report.condition}</p>
                <p className="text-sm opacity-90">{report.temperature}°F</p>
              </div>
            </div>
          </div>
          <p className="text-xs opacity-80">{report.description}</p>
        </div>
      </div>
    )
  }

  // Full view
  return (
    <div className="space-y-4">
      {/* Main Weather Card */}
      <div
        className={cn(
          'rounded-lg p-6 bg-gradient-to-br text-white shadow-lg',
          getTemperatureColor(report.temperature)
        )}
      >
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <span className="text-5xl">{report.emoji}</span>
            <div>
              <p className="text-2xl font-bold">{report.condition}</p>
              <p className="text-lg opacity-90">{report.temperature}°F</p>
            </div>
          </div>
          <Cloud className="w-8 h-8 opacity-50" />
        </div>

        <p className="text-sm opacity-90 border-t border-white/20 pt-3">
          {report.description}
        </p>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-2 gap-3">
        {/* Growth */}
        <div className={cn(
          'rounded-lg p-3 border',
          getGrowthBadgeColor(report.metrics.lobbiesGrowth)
        )}>
          <p className="text-xs font-semibold uppercase opacity-75 mb-1">Temperature</p>
          <p className="text-lg font-bold">{report.metrics.lobbiesGrowth > 0 ? '+' : ''}{report.metrics.lobbiesGrowth}%</p>
          <p className="text-xs mt-1 opacity-75">{getGrowthLabel(report.metrics.lobbiesGrowth)}</p>
        </div>

        {/* Engagement */}
        <div className={cn(
          'rounded-lg p-3 border',
          getEngagementBadgeColor(report.windSpeed)
        )}>
          <p className="text-xs font-semibold uppercase opacity-75 mb-1">Wind Speed</p>
          <p className="text-lg font-bold">{report.windSpeed.toFixed(1)} mph</p>
          <p className="text-xs mt-1 opacity-75">{getEngagementLabel(report.windSpeed)}</p>
        </div>

        {/* Sentiment */}
        <div className="rounded-lg p-3 border bg-yellow-50 text-yellow-800 border-yellow-300">
          <p className="text-xs font-semibold uppercase opacity-75 mb-1">Sunshine</p>
          <p className="text-lg font-bold">{report.sunshineLevel}%</p>
          <p className="text-xs mt-1 opacity-75">Sentiment</p>
        </div>

        {/* Signal Score */}
        <div className="rounded-lg p-3 border bg-purple-50 text-purple-800 border-purple-300">
          <p className="text-xs font-semibold uppercase opacity-75 mb-1">Pressure</p>
          <p className="text-lg font-bold">{report.pressure} mb</p>
          <p className="text-xs mt-1 opacity-75">Signal: {report.metrics.signalScore}</p>
        </div>
      </div>

      {/* Forecast */}
      <div className="rounded-lg bg-blue-50 border border-blue-200 p-4">
        <h4 className="font-semibold text-blue-900 mb-2 text-sm">Campaign Forecast</h4>
        <p className="text-sm text-blue-800">{report.forecast}</p>
      </div>

      {/* Detailed Metrics */}
      <div className="rounded-lg bg-gray-50 border border-gray-200 p-4 space-y-3">
        <h4 className="font-semibold text-gray-900 text-sm">Detailed Metrics</h4>

        <div className="space-y-2 text-sm">
          <div className="flex items-center justify-between">
            <span className="text-gray-600">Lobbies Growth (7d)</span>
            <span className="font-semibold text-gray-900">
              {report.metrics.lobbiesGrowth > 0 ? '+' : ''}{report.metrics.lobbiesGrowth}%
            </span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-gray-600">Comments This Week</span>
            <span className="font-semibold text-gray-900">{report.metrics.commentsVelocity}</span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-gray-600">Community Sentiment</span>
            <span className="font-semibold text-gray-900">{report.metrics.sentimentScore}%</span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-gray-600">Campaign Signal Score</span>
            <span className="font-semibold text-gray-900">{report.metrics.signalScore}/100</span>
          </div>
        </div>
      </div>

      {/* Info Box */}
      <div className="rounded-lg bg-amber-50 border border-amber-200 p-3">
        <p className="text-xs text-amber-800">
          <strong>How we calculate weather:</strong> Temperature = lobbies growth, Wind = engagement velocity, Sunshine = community sentiment, Pressure = signal score. Check back weekly for trends!
        </p>
      </div>
    </div>
  )
}
