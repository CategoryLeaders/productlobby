'use client'

import React, { useState, useEffect } from 'react'
import { CheckCircle2, AlertCircle, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'

interface AccessibilityCheck {
  name: string
  passed: boolean
  score: number
  maxScore: number
  recommendation?: string
}

interface AccessibilityScoreData {
  score: number
  level: 'excellent' | 'good' | 'fair' | 'poor'
  checks: AccessibilityCheck[]
  summary: {
    passedChecks: number
    totalChecks: number
    improvements: string[]
  }
}

interface AccessibilityScoreProps {
  campaignId: string
}

function getScoreColor(score: number): string {
  if (score >= 80) return 'from-emerald-400 to-emerald-600'
  if (score >= 60) return 'from-blue-400 to-blue-600'
  if (score >= 40) return 'from-amber-400 to-amber-600'
  return 'from-red-400 to-red-600'
}

function getLevelColor(level: string): string {
  switch (level) {
    case 'excellent':
      return 'text-emerald-700 bg-emerald-50 border-emerald-200'
    case 'good':
      return 'text-blue-700 bg-blue-50 border-blue-200'
    case 'fair':
      return 'text-amber-700 bg-amber-50 border-amber-200'
    case 'poor':
      return 'text-red-700 bg-red-50 border-red-200'
    default:
      return 'text-gray-700 bg-gray-50 border-gray-200'
  }
}

export function AccessibilityScore({ campaignId }: AccessibilityScoreProps) {
  const [scoreData, setScoreData] = useState<AccessibilityScoreData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchScore = async () => {
      try {
        setIsLoading(true)
        const response = await fetch(
          `/api/campaigns/${campaignId}/accessibility-score`
        )
        if (!response.ok) throw new Error('Failed to fetch accessibility score')
        const data = await response.json()
        setScoreData(data.data)
      } catch (err) {
        console.error('Error fetching accessibility score:', err)
        setError('Failed to load accessibility score')
      } finally {
        setIsLoading(false)
      }
    }

    fetchScore()
  }, [campaignId])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-6 h-6 text-violet-600 animate-spin" />
      </div>
    )
  }

  if (error || !scoreData) {
    return (
      <div className="p-4 rounded-lg bg-red-50 border border-red-200">
        <p className="text-sm text-red-700">
          {error || 'Failed to load accessibility score'}
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Score Gauge */}
      <div className="flex items-center gap-8">
        <div className="flex-shrink-0">
          <div className="relative w-32 h-32">
            <svg
              className="w-full h-full transform -rotate-90"
              viewBox="0 0 120 120"
            >
              {/* Background circle */}
              <circle
                cx="60"
                cy="60"
                r="54"
                fill="none"
                stroke="#e5e7eb"
                strokeWidth="8"
              />
              {/* Score circle */}
              <circle
                cx="60"
                cy="60"
                r="54"
                fill="none"
                stroke={scoreData.score >= 80 ? '#10b981' :
                        scoreData.score >= 60 ? '#3b82f6' :
                        scoreData.score >= 40 ? '#f59e0b' : '#ef4444'}
                strokeWidth="8"
                strokeDasharray={`${(scoreData.score / 100) * 339.29} 339.29`}
                strokeLinecap="round"
                className="transition-all duration-500"
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <p className="text-4xl font-bold text-gray-900">
                  {scoreData.score}
                </p>
                <p className="text-xs text-gray-500 uppercase tracking-wide">
                  Score
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Score Summary */}
        <div className="flex-1 space-y-4">
          <div className={cn(
            'px-4 py-3 rounded-lg border',
            getLevelColor(scoreData.level)
          )}>
            <p className="font-semibold capitalize">
              {scoreData.level} Accessibility
            </p>
            <p className="text-sm mt-1">
              {scoreData.summary.passedChecks}/{scoreData.summary.totalChecks} checks passed
            </p>
          </div>

          {scoreData.summary.improvements.length > 0 && (
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
              <p className="text-sm font-medium text-amber-900 mb-2">
                Suggested Improvements:
              </p>
              <ul className="text-sm text-amber-800 space-y-1">
                {scoreData.summary.improvements.map((improvement, idx) => (
                  <li key={idx} className="flex gap-2">
                    <span>•</span>
                    <span>{improvement}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>

      {/* Detailed Checks */}
      <div className="space-y-3">
        <h3 className="font-semibold text-gray-900">Accessibility Checklist</h3>
        {scoreData.checks.map((check, idx) => (
          <div
            key={idx}
            className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-sm transition-shadow"
          >
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 mt-1">
                {check.passed ? (
                  <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                ) : (
                  <AlertCircle className="w-5 h-5 text-amber-600" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-4 mb-2">
                  <p className="font-medium text-gray-900">{check.name}</p>
                  <span className="text-sm font-semibold text-gray-700">
                    {check.score}/{check.maxScore}
                  </span>
                </div>

                {/* Score bar */}
                <div className="w-full bg-gray-200 rounded-full h-2 mb-3">
                  <div
                    className={cn(
                      'h-full rounded-full transition-all',
                      check.score >= 80 ? 'bg-emerald-600' :
                      check.score >= 60 ? 'bg-blue-600' :
                      check.score >= 40 ? 'bg-amber-600' : 'bg-red-600'
                    )}
                    style={{ width: `${check.score}%` }}
                  />
                </div>

                {check.recommendation && (
                  <p className="text-sm text-gray-600">
                    {check.recommendation}
                  </p>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Info Box */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <p className="text-sm text-blue-800">
          <span className="font-semibold">💡 Tip:</span> Improving your
          accessibility score helps reach more supporters and ensures your campaign is
          inclusive and easy to understand for everyone.
        </p>
      </div>
    </div>
  )
}
