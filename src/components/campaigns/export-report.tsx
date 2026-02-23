'use client'

import { useState } from 'react'
import { FileDown, BarChart3, Loader2, Download } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useToast } from '@/components/ui/toast'
import { cn } from '@/lib/utils'

interface ExportReportProps {
  campaignId: string
  campaignTitle: string
  className?: string
}

interface CampaignReport {
  overview: {
    title: string
    description: string
    createdAt: string
    updatedAt: string
    status: string
  }
  keyMetrics: {
    lobbyCount: number
    commentCount: number
    eventTypeBreakdown: Record<string, number>
    totalEvents: number
  }
  timeline: {
    createdDate: string
    lastUpdateDate: string
    daysSinceCreation: number
  }
  topContributors: Array<{
    name: string
    handle: string
    contributionCount: number
  }>
}

export function ExportReport({
  campaignId,
  campaignTitle,
  className,
}: ExportReportProps) {
  const [loading, setLoading] = useState(false)
  const [report, setReport] = useState<CampaignReport | null>(null)
  const [showPreview, setShowPreview] = useState(false)
  const { addToast } = useToast()

  const handleGenerateReport = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/campaigns/${campaignId}/export`)

      if (!response.ok) {
        throw new Error('Failed to generate report')
      }

      const data = await response.json()
      setReport(data)
      setShowPreview(true)
      addToast('Report generated successfully', 'success')
    } catch (error) {
      console.error('Report generation error:', error)
      addToast('Failed to generate report', 'error')
    } finally {
      setLoading(false)
    }
  }

  const handleDownloadJSON = () => {
    if (!report) return

    try {
      const dataStr = JSON.stringify(report, null, 2)
      const blob = new Blob([dataStr], { type: 'application/json' })
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', `campaign-report-${campaignTitle.replace(/\s+/g, '-').toLowerCase()}.json`)
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)
      addToast('Report downloaded as JSON', 'success')
    } catch (error) {
      console.error('Download error:', error)
      addToast('Failed to download report', 'error')
    }
  }

  return (
    <div className={cn('space-y-4', className)}>
      {!showPreview ? (
        <div className="space-y-4 rounded-lg border border-violet-200 bg-gradient-to-br from-violet-50 to-lime-50 p-6">
          <div className="flex items-start gap-4">
            <div className="rounded-lg bg-violet-100 p-3">
              <BarChart3 className="h-6 w-6 text-violet-600" />
            </div>
            <div className="flex-1 space-y-2">
              <h3 className="font-semibold text-gray-900">Campaign Report Generator</h3>
              <p className="text-sm text-gray-600">
                Generate a comprehensive summary of your campaign data including lobbies, comments, events, and top contributors.
              </p>
            </div>
          </div>

          <div className="space-y-3 rounded-lg bg-white p-4">
            <div className="space-y-2">
              <p className="text-sm font-medium text-gray-700">Campaign Summary Stats</p>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="rounded-lg bg-gradient-to-br from-violet-50 to-violet-100 p-3 text-center">
                  <p className="text-xs text-gray-600">Title</p>
                  <p className="truncate font-semibold text-violet-900">{campaignTitle}</p>
                </div>
                <div className="rounded-lg bg-gradient-to-br from-lime-50 to-lime-100 p-3 text-center">
                  <p className="text-xs text-gray-600">Status</p>
                  <p className="font-semibold text-lime-900">Ready</p>
                </div>
              </div>
            </div>
          </div>

          <Button
            onClick={handleGenerateReport}
            disabled={loading}
            className="w-full gap-2 bg-gradient-to-r from-violet-600 to-lime-600 hover:from-violet-700 hover:to-lime-700"
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <FileDown className="h-4 w-4" />
                Generate Report
              </>
            )}
          </Button>
        </div>
      ) : report ? (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">Report Preview</h3>
            <button
              onClick={() => setShowPreview(false)}
              className="text-sm text-gray-600 hover:text-gray-900"
            >
              Back
            </button>
          </div>

          <div className="space-y-4 rounded-lg border border-gray-200 bg-white p-6">
            {/* Overview Section */}
            <div className="space-y-3 border-b border-gray-200 pb-4">
              <h4 className="flex items-center gap-2 font-semibold text-violet-900">
                <span className="h-2 w-2 rounded-full bg-violet-600"></span>
                Overview
              </h4>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <p className="text-gray-600">Campaign</p>
                  <p className="font-medium text-gray-900">{report.overview.title}</p>
                </div>
                <div>
                  <p className="text-gray-600">Status</p>
                  <p className="font-medium text-gray-900">{report.overview.status}</p>
                </div>
              </div>
            </div>

            {/* Key Metrics Section */}
            <div className="space-y-3 border-b border-gray-200 pb-4">
              <h4 className="flex items-center gap-2 font-semibold text-lime-900">
                <span className="h-2 w-2 rounded-full bg-lime-600"></span>
                Key Metrics
              </h4>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="rounded-lg bg-violet-50 p-3">
                  <p className="text-gray-600">Lobbies</p>
                  <p className="text-2xl font-bold text-violet-600">{report.keyMetrics.lobbyCount}</p>
                </div>
                <div className="rounded-lg bg-lime-50 p-3">
                  <p className="text-gray-600">Comments</p>
                  <p className="text-2xl font-bold text-lime-600">{report.keyMetrics.commentCount}</p>
                </div>
                <div className="rounded-lg bg-purple-50 p-3">
                  <p className="text-gray-600">Total Events</p>
                  <p className="text-2xl font-bold text-purple-600">{report.keyMetrics.totalEvents}</p>
                </div>
                <div className="rounded-lg bg-pink-50 p-3">
                  <p className="text-gray-600">Event Types</p>
                  <p className="text-2xl font-bold text-pink-600">{Object.keys(report.keyMetrics.eventTypeBreakdown).length}</p>
                </div>
              </div>
            </div>

            {/* Timeline Section */}
            <div className="space-y-3 border-b border-gray-200 pb-4">
              <h4 className="flex items-center gap-2 font-semibold text-violet-900">
                <span className="h-2 w-2 rounded-full bg-violet-600"></span>
                Timeline
              </h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Created</span>
                  <span className="font-medium text-gray-900">{report.timeline.createdDate}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Last Updated</span>
                  <span className="font-medium text-gray-900">{report.timeline.lastUpdateDate}</span>
                </div>
                <div className="flex justify-between rounded-lg bg-gradient-to-r from-violet-50 to-lime-50 p-2">
                  <span className="text-gray-600">Active Days</span>
                  <span className="font-bold text-violet-900">{report.timeline.daysSinceCreation}</span>
                </div>
              </div>
            </div>

            {/* Top Contributors Section */}
            <div className="space-y-3">
              <h4 className="flex items-center gap-2 font-semibold text-lime-900">
                <span className="h-2 w-2 rounded-full bg-lime-600"></span>
                Top Contributors
              </h4>
              <div className="space-y-2">
                {report.topContributors.length > 0 ? (
                  report.topContributors.slice(0, 5).map((contributor, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between rounded-lg bg-gradient-to-r from-gray-50 to-gray-100 p-3 text-sm"
                    >
                      <div>
                        <p className="font-medium text-gray-900">{contributor.name}</p>
                        <p className="text-xs text-gray-600">@{contributor.handle}</p>
                      </div>
                      <span className="rounded-full bg-violet-100 px-3 py-1 font-semibold text-violet-700">
                        {contributor.contributionCount}
                      </span>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-gray-600">No contributors yet</p>
                )}
              </div>
            </div>
          </div>

          <div className="flex gap-3">
            <Button
              onClick={handleDownloadJSON}
              className="flex-1 gap-2 bg-gradient-to-r from-violet-600 to-lime-600 hover:from-violet-700 hover:to-lime-700"
            >
              <Download className="h-4 w-4" />
              Download as JSON
            </Button>
            <Button
              onClick={() => setShowPreview(false)}
              variant="outline"
              className="flex-1"
            >
              Back
            </Button>
          </div>
        </div>
      ) : null}
    </div>
  )
}
