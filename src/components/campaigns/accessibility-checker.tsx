'use client'

import React, { useState, useEffect } from 'react'
import {
  Loader2,
  Eye,
  CheckCircle,
  AlertTriangle,
  XCircle,
  Info,
  Shield,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface AccessibilityIssue {
  id: string
  type: 'error' | 'warning' | 'info'
  category: 'color_contrast' | 'alt_text' | 'heading_structure' | 'link_text' | 'form_labels' | 'keyboard_nav'
  description: string
  element: string
  suggestion: string
  wcagLevel: 'A' | 'AA' | 'AAA'
}

interface AccessibilityReport {
  score: number
  totalIssues: number
  errors: number
  warnings: number
  info: number
  issues: AccessibilityIssue[]
  lastChecked: string
}

interface AccessibilityCheckerProps {
  campaignId: string
}

const categoryLabels: Record<AccessibilityIssue['category'], string> = {
  color_contrast: 'Color Contrast',
  alt_text: 'Alt Text',
  heading_structure: 'Heading Structure',
  link_text: 'Link Text',
  form_labels: 'Form Labels',
  keyboard_nav: 'Keyboard Navigation',
}

const typeIcons = {
  error: <XCircle className="w-5 h-5 text-red-500" />,
  warning: <AlertTriangle className="w-5 h-5 text-amber-500" />,
  info: <Info className="w-5 h-5 text-blue-500" />,
}

const getScoreColor = (score: number): string => {
  if (score > 80) return 'text-green-500'
  if (score >= 50) return 'text-amber-500'
  return 'text-red-500'
}

const getScoreBgColor = (score: number): string => {
  if (score > 80) return 'border-green-500 bg-green-50'
  if (score >= 50) return 'border-amber-500 bg-amber-50'
  return 'border-red-500 bg-red-50'
}

export const AccessibilityChecker: React.FC<AccessibilityCheckerProps> = ({
  campaignId,
}) => {
  const [report, setReport] = useState<AccessibilityReport | null>(null)
  const [loading, setLoading] = useState(true)
  const [checking, setChecking] = useState(false)
  const [filter, setFilter] = useState<'all' | 'error' | 'warning' | 'info'>('all')
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchReport()
  }, [campaignId])

  const fetchReport = async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await fetch(`/api/campaigns/${campaignId}/accessibility`)
      if (!response.ok) throw new Error('Failed to fetch accessibility report')
      const data = await response.json()
      setReport(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  const runCheck = async () => {
    try {
      setChecking(true)
      setError(null)
      const response = await fetch(`/api/campaigns/${campaignId}/accessibility`, {
        method: 'POST',
      })
      if (!response.ok) throw new Error('Failed to run accessibility check')
      const data = await response.json()
      setReport(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setChecking(false)
    }
  }

  const filteredIssues = report?.issues.filter((issue) => {
    if (filter === 'all') return true
    return issue.type === filter
  }) ?? []

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 text-violet-500 animate-spin" />
      </div>
    )
  }

  if (!report) {
    return (
      <div className="text-center py-12">
        <p className="text-red-500 mb-4">{error || 'Failed to load accessibility report'}</p>
        <Button onClick={fetchReport} variant="outline">
          Retry
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Shield className="w-6 h-6 text-violet-600" />
          <h2 className="text-2xl font-bold text-gray-900">Accessibility Checker</h2>
        </div>
        <Button
          onClick={runCheck}
          disabled={checking}
          className="bg-gradient-to-r from-violet-600 to-lime-600 hover:from-violet-700 hover:to-lime-700"
        >
          {checking && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
          Run Check
        </Button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
          {error}
        </div>
      )}

      {/* Score Card */}
      <div className={cn(
        'rounded-lg border-2 p-8 text-center',
        getScoreBgColor(report.score)
      )}>
        <div className="flex items-center justify-center mb-4">
          <div className={cn(
            'relative w-32 h-32 flex items-center justify-center rounded-full border-8',
            getScoreBgColor(report.score)
          )}>
            <div className={cn('text-5xl font-bold', getScoreColor(report.score))}>
              {report.score}
            </div>
          </div>
        </div>
        <p className="text-gray-600 text-sm mt-4">
          Last checked: {new Date(report.lastChecked).toLocaleString()}
        </p>
      </div>

      {/* Issue Summary */}
      <div className="grid grid-cols-3 gap-4">
        <div className="rounded-lg border border-gray-200 p-4 text-center">
          <XCircle className="w-8 h-8 text-red-500 mx-auto mb-2" />
          <p className="text-3xl font-bold text-gray-900">{report.errors}</p>
          <p className="text-sm text-gray-600">Errors</p>
        </div>
        <div className="rounded-lg border border-gray-200 p-4 text-center">
          <AlertTriangle className="w-8 h-8 text-amber-500 mx-auto mb-2" />
          <p className="text-3xl font-bold text-gray-900">{report.warnings}</p>
          <p className="text-sm text-gray-600">Warnings</p>
        </div>
        <div className="rounded-lg border border-gray-200 p-4 text-center">
          <Info className="w-8 h-8 text-blue-500 mx-auto mb-2" />
          <p className="text-3xl font-bold text-gray-900">{report.info}</p>
          <p className="text-sm text-gray-600">Info</p>
        </div>
      </div>

      {/* Filter */}
      <div className="flex gap-2">
        {(['all', 'error', 'warning', 'info'] as const).map((type) => (
          <Button
            key={type}
            variant={filter === type ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilter(type)}
            className={filter === type ? 'bg-gradient-to-r from-violet-600 to-lime-600 hover:from-violet-700 hover:to-lime-700' : ''}
          >
            {type === 'all' ? 'All Issues' : type.charAt(0).toUpperCase() + type.slice(1)}
          </Button>
        ))}
      </div>

      {/* Issues List */}
      <div className="space-y-3">
        {filteredIssues.length === 0 ? (
          <div className="text-center py-8">
            <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-2" />
            <p className="text-gray-600">
              {filter === 'all'
                ? 'No accessibility issues found!'
                : `No ${filter} issues found!`}
            </p>
          </div>
        ) : (
          filteredIssues.map((issue) => (
            <div
              key={issue.id}
              className="rounded-lg border border-gray-200 p-4 hover:border-violet-400 transition-colors"
            >
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 mt-1">{typeIcons[issue.type]}</div>
                <div className="flex-grow">
                  <div className="flex items-center gap-2 mb-2">
                    <h4 className="font-semibold text-gray-900">{issue.description}</h4>
                    <span className="inline-block bg-violet-100 text-violet-700 text-xs font-medium px-2.5 py-0.5 rounded-full">
                      {categoryLabels[issue.category]}
                    </span>
                    <span className="inline-block bg-lime-100 text-lime-700 text-xs font-medium px-2.5 py-0.5 rounded-full">
                      WCAG {issue.wcagLevel}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 mb-2">
                    <span className="font-medium">Element:</span> {issue.element}
                  </p>
                  <p className="text-sm text-gray-700 bg-gray-50 rounded p-2">
                    <span className="font-medium">Suggestion:</span> {issue.suggestion}
                  </p>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
