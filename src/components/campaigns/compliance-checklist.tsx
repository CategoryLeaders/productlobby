'use client'

import { useEffect, useState } from 'react'
import { Check, X, AlertCircle, Loader2, Lightbulb } from 'lucide-react'
import { cn } from '@/lib/utils'

interface ComplianceRule {
  id: string
  name: string
  description: string
  passed: boolean
  suggestion?: string
}

interface ComplianceCheckResponse {
  campaignId: string
  campaignTitle: string
  overallCompliance: boolean
  complianceScore: number
  rules: ComplianceRule[]
  timestamp: string
}

interface ComplianceChecklistProps {
  campaignId: string
  campaignSlug?: string
}

export function ComplianceChecklist({
  campaignId,
  campaignSlug,
}: ComplianceChecklistProps) {
  const [compliance, setCompliance] = useState<ComplianceCheckResponse | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchCompliance() {
      try {
        setIsLoading(true)
        setError(null)

        // Use slug if provided, otherwise use ID
        const lookupId = campaignSlug || campaignId
        const response = await fetch(`/api/campaigns/${lookupId}/compliance`)

        if (!response.ok) {
          throw new Error('Failed to fetch compliance check')
        }

        const data = await response.json()
        setCompliance(data)
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Unknown error'
        setError(message)
      } finally {
        setIsLoading(false)
      }
    }

    if (campaignId || campaignSlug) {
      fetchCompliance()
    }
  }, [campaignId, campaignSlug])

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-center justify-center gap-3">
          <Loader2 className="w-5 h-5 text-violet-600 animate-spin" />
          <span className="text-gray-600">Checking campaign compliance...</span>
        </div>
      </div>
    )
  }

  if (error || !compliance) {
    return (
      <div className="bg-white rounded-lg border border-red-200 p-6">
        <div className="flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="font-semibold text-red-900">Compliance Check Error</h3>
            <p className="text-sm text-red-700 mt-1">
              {error || 'Unable to load compliance information'}
            </p>
          </div>
        </div>
      </div>
    )
  }

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600'
    if (score >= 60) return 'text-yellow-600'
    return 'text-red-600'
  }

  const getScoreBgColor = (score: number) => {
    if (score >= 80) return 'bg-green-50 border-green-200'
    if (score >= 60) return 'bg-yellow-50 border-yellow-200'
    return 'bg-red-50 border-red-200'
  }

  const getCriticalRules = () => compliance.rules.slice(0, 4)
  const getRecommendedRules = () => compliance.rules.slice(4)

  return (
    <div className="space-y-6">
      {/* Overall Score Card */}
      <div
        className={cn(
          'rounded-lg border-2 p-6',
          getScoreBgColor(compliance.complianceScore)
        )}
      >
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">
              Campaign Compliance Check
            </h3>
            <p className="text-sm text-gray-600 mt-1">
              Review your campaign to ensure it meets platform guidelines
            </p>
          </div>

          <div className="text-center">
            <div
              className={cn(
                'text-4xl font-bold',
                getScoreColor(compliance.complianceScore)
              )}
            >
              {compliance.complianceScore}%
            </div>
            <div className="text-sm text-gray-600 mt-1">
              {compliance.rules.filter((r) => r.passed).length} of{' '}
              {compliance.rules.length} rules
            </div>
          </div>
        </div>
      </div>

      {/* Compliance Status Badge */}
      <div className="flex items-center gap-2">
        {compliance.overallCompliance ? (
          <div className="flex items-center gap-2 text-green-700 bg-green-50 px-4 py-2 rounded-lg">
            <Check className="w-5 h-5" />
            <span className="font-medium">Ready to Publish</span>
          </div>
        ) : (
          <div className="flex items-center gap-2 text-amber-700 bg-amber-50 px-4 py-2 rounded-lg">
            <AlertCircle className="w-5 h-5" />
            <span className="font-medium">Needs Improvement</span>
          </div>
        )}
      </div>

      {/* Critical Rules Section */}
      <div>
        <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
          <span className="text-red-600">Required</span>
        </h4>

        <div className="space-y-3">
          {getCriticalRules().map((rule) => (
            <div
              key={rule.id}
              className="bg-white rounded-lg border border-gray-200 p-4 hover:border-gray-300 transition-colors"
            >
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 mt-0.5">
                  {rule.passed ? (
                    <div className="flex items-center justify-center w-6 h-6 rounded-full bg-green-100">
                      <Check className="w-4 h-4 text-green-600" />
                    </div>
                  ) : (
                    <div className="flex items-center justify-center w-6 h-6 rounded-full bg-red-100">
                      <X className="w-4 h-4 text-red-600" />
                    </div>
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <h5 className="font-medium text-gray-900">{rule.name}</h5>
                  <p className="text-sm text-gray-600 mt-0.5">
                    {rule.description}
                  </p>

                  {rule.suggestion && (
                    <div className="flex items-start gap-2 mt-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
                      <Lightbulb className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
                      <p className="text-sm text-blue-900">{rule.suggestion}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Recommended Rules Section */}
      {getRecommendedRules().length > 0 && (
        <div>
          <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
            <span className="text-amber-600">Recommended</span>
          </h4>

          <div className="space-y-3">
            {getRecommendedRules().map((rule) => (
              <div
                key={rule.id}
                className="bg-white rounded-lg border border-gray-200 p-4 hover:border-gray-300 transition-colors"
              >
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 mt-0.5">
                    {rule.passed ? (
                      <div className="flex items-center justify-center w-6 h-6 rounded-full bg-green-100">
                        <Check className="w-4 h-4 text-green-600" />
                      </div>
                    ) : (
                      <div className="flex items-center justify-center w-6 h-6 rounded-full bg-gray-200">
                        <AlertCircle className="w-4 h-4 text-gray-600" />
                      </div>
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <h5 className="font-medium text-gray-900">{rule.name}</h5>
                    <p className="text-sm text-gray-600 mt-0.5">
                      {rule.description}
                    </p>

                    {rule.suggestion && (
                      <div className="flex items-start gap-2 mt-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
                        <Lightbulb className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
                        <p className="text-sm text-blue-900">{rule.suggestion}</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Footer Info */}
      <div className="text-xs text-gray-500 text-center">
        Last checked: {new Date(compliance.timestamp).toLocaleString()}
      </div>
    </div>
  )
}
