'use client'

import React, { useState, useEffect } from 'react'
import { Download, FileText, Users, Loader2, Settings } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface SupportersExportProps {
  campaignId: string
  creatorId?: string
  currentUserId?: string
}

export const SupportersExport: React.FC<SupportersExportProps> = ({
  campaignId,
  creatorId,
  currentUserId,
}) => {
  const [isOpen, setIsOpen] = useState(false)
  const [includeEmails, setIncludeEmails] = useState(false)
  const [startDate, setStartDate] = useState<string>('')
  const [endDate, setEndDate] = useState<string>('')
  const [estimatedCount, setEstimatedCount] = useState<number | null>(null)
  const [loading, setLoading] = useState(false)
  const [exporting, setExporting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [mounted, setMounted] = useState(false)

  // Check if user is the creator
  const isCreator = currentUserId && creatorId && currentUserId === creatorId

  useEffect(() => {
    setMounted(true)
  }, [])

  // Fetch estimated count when filters change
  useEffect(() => {
    if (!isOpen || !isCreator) return

    const fetchEstimatedCount = async () => {
      setLoading(true)
      try {
        const params = new URLSearchParams({
          estimate: 'true',
          ...(startDate && { startDate }),
          ...(endDate && { endDate }),
        })
        const response = await fetch(
          `/api/campaigns/${campaignId}/supporters-export?${params}`
        )
        if (response.ok) {
          const data = await response.json()
          setEstimatedCount(data.estimatedCount || 0)
        }
      } catch (err) {
        console.error('Error fetching estimated count:', err)
      } finally {
        setLoading(false)
      }
    }

    const timer = setTimeout(fetchEstimatedCount, 300)
    return () => clearTimeout(timer)
  }, [campaignId, isCreator, isOpen, includeEmails, startDate, endDate])

  const handleExport = async () => {
    if (!isCreator) {
      setError('Only campaign creator can export supporters')
      return
    }

    setExporting(true)
    setError(null)

    try {
      const params = new URLSearchParams({
        format: 'csv',
        ...(includeEmails && { includeEmails: 'true' }),
        ...(startDate && { startDate }),
        ...(endDate && { endDate }),
      })

      const response = await fetch(
        `/api/campaigns/${campaignId}/supporters-export?${params}`
      )

      if (!response.ok) {
        if (response.status === 401) {
          setError('Authentication required. Please log in.')
          return
        }
        if (response.status === 403) {
          setError('You do not have permission to export this campaign\'s data.')
          return
        }
        throw new Error('Failed to export data')
      }

      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `campaign-${campaignId}-supporters.csv`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)

      setIsOpen(false)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to export data')
      console.error('Error exporting data:', err)
    } finally {
      setExporting(false)
    }
  }

  if (!mounted || !isCreator) {
    return null
  }

  return (
    <div className="flex flex-col gap-3">
      {/* Export Button */}
      <Button
        onClick={() => setIsOpen(!isOpen)}
        variant="outline"
        size="sm"
        className="w-full gap-2"
      >
        <Download size={16} />
        <span>Export Supporters</span>
      </Button>

      {/* Export Configuration Panel */}
      {isOpen && (
        <div
          className={cn(
            'rounded-lg border border-gray-200 bg-white p-4',
            'shadow-sm space-y-4'
          )}
        >
          {/* Header */}
          <div className="flex items-center gap-2">
            <Settings size={18} className="text-gray-600" />
            <h3 className="font-semibold text-gray-900">Export Configuration</h3>
          </div>

          {/* Include Emails Toggle */}
          <div className="flex items-center justify-between">
            <label htmlFor="include-emails" className="text-sm font-medium text-gray-700">
              Include Email Addresses
            </label>
            <input
              id="include-emails"
              type="checkbox"
              checked={includeEmails}
              onChange={(e) => setIncludeEmails(e.target.checked)}
              className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
          </div>

          {/* Date Range Filter */}
          <div className="space-y-3">
            <p className="text-sm font-medium text-gray-700">Date Range (Optional)</p>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label htmlFor="start-date" className="block text-xs text-gray-600 mb-1">
                  Start Date
                </label>
                <input
                  id="start-date"
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className={cn(
                    'w-full px-3 py-2 text-sm border rounded-md',
                    'focus:outline-none focus:ring-2 focus:ring-blue-500',
                    'border-gray-300'
                  )}
                />
              </div>
              <div>
                <label htmlFor="end-date" className="block text-xs text-gray-600 mb-1">
                  End Date
                </label>
                <input
                  id="end-date"
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className={cn(
                    'w-full px-3 py-2 text-sm border rounded-md',
                    'focus:outline-none focus:ring-2 focus:ring-blue-500',
                    'border-gray-300'
                  )}
                />
              </div>
            </div>
          </div>

          {/* Estimated Count */}
          {estimatedCount !== null && (
            <div
              className={cn(
                'flex items-center gap-2 px-3 py-2 rounded-md',
                'bg-blue-50 border border-blue-200'
              )}
            >
              <Users size={16} className="text-blue-600" />
              <span className="text-sm text-blue-900">
                {loading ? (
                  <>
                    <Loader2 size={14} className="inline animate-spin mr-1" />
                    Counting records...
                  </>
                ) : (
                  <>
                    <strong>{estimatedCount.toLocaleString()}</strong> supporter{estimatedCount !== 1 ? 's' : ''} will be exported
                  </>
                )}
              </span>
            </div>
          )}

          {/* Format Information */}
          <div className="flex items-start gap-2 px-3 py-2 rounded-md bg-gray-50">
            <FileText size={16} className="text-gray-600 mt-0.5 flex-shrink-0" />
            <div className="text-xs text-gray-600">
              <p className="font-medium text-gray-700 mb-1">Exported Columns:</p>
              <ul className="space-y-0.5">
                <li>Name</li>
                <li>Handle</li>
                <li>Joined Date</li>
                <li>Lobby Count</li>
                <li>Share Count</li>
                {includeEmails && <li>Email Address</li>}
              </ul>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <p className="text-sm text-red-600 bg-red-50 rounded px-3 py-2">{error}</p>
          )}

          {/* Export Button */}
          <Button
            onClick={handleExport}
            disabled={exporting || loading}
            className="w-full gap-2 bg-blue-600 hover:bg-blue-700 text-white"
          >
            {exporting ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                <span>Exporting...</span>
              </>
            ) : (
              <>
                <Download size={16} />
                <span>Download CSV</span>
              </>
            )}
          </Button>
        </div>
      )}
    </div>
  )
}
