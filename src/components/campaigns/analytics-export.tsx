'use client'

import { useEffect, useState } from 'react'
import {
  TrendingUp,
  TrendingDown,
  Users,
  Eye,
  Clock,
  Download,
  FileText,
  Smartphone,
  Monitor,
  Tablet,
  RefreshCw,
  Calendar,
  ArrowUpRight,
  ArrowDownRight,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface AnalyticsData {
  period: '7d' | '30d' | '90d' | 'all'
  totalViews: number
  uniqueVisitors: number
  conversionRate: number
  avgTimeOnPage: number
  lastUpdated: string
  dailyActivity: Array<{ date: string; views: number }>
  topReferrals: Array<{ source: string; count: number; percentage: number }>
  deviceBreakdown: {
    desktop: number
    mobile: number
    tablet: number
  }
  comparison: {
    viewsChange: number
    visitorsChange: number
    conversionChange: number
    timeChange: number
  }
}

interface AnalyticsExportProps {
  campaignId: string
}

export function AnalyticsExport({ campaignId }: AnalyticsExportProps) {
  const [period, setPeriod] = useState<'7d' | '30d' | '90d' | 'all'>('30d')
  const [loading, setLoading] = useState(true)
  const [exporting, setExporting] = useState(false)
  const [data, setData] = useState<AnalyticsData | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchAnalytics()
  }, [campaignId, period])

  const fetchAnalytics = async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await fetch(`/api/campaigns/${campaignId}/analytics-export?period=${period}`)
      
      if (!response.ok) {
        throw new Error('Failed to fetch analytics')
      }
      
      const result = await response.json()
      if (result.success) {
        setData(result.data)
      } else {
        setError(result.error || 'Failed to load analytics')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  const exportAsCSV = async () => {
    if (!data) return
    
    try {
      setExporting(true)
      
      // Create CSV content
      const csvHeaders = ['Metric', 'Value', 'Change']
      const csvRows = [
        ['Total Views', data.totalViews, `${data.comparison.viewsChange > 0 ? '+' : ''}${data.comparison.viewsChange}%`],
        ['Unique Visitors', data.uniqueVisitors, `${data.comparison.visitorsChange > 0 ? '+' : ''}${data.comparison.visitorsChange}%`],
        ['Conversion Rate', `${data.conversionRate.toFixed(2)}%`, `${data.comparison.conversionChange > 0 ? '+' : ''}${data.comparison.conversionChange}%`],
        ['Avg Time on Page', `${data.avgTimeOnPage.toFixed(1)}s`, `${data.comparison.timeChange > 0 ? '+' : ''}${data.comparison.timeChange}%`],
        [''],
        ['Daily Activity'],
        ...data.dailyActivity.map(day => [day.date, day.views]),
        [''],
        ['Top Referral Sources'],
        ...data.topReferrals.map(ref => [ref.source, ref.count, `${ref.percentage.toFixed(1)}%`]),
        [''],
        ['Device Breakdown'],
        ['Desktop', data.deviceBreakdown.desktop],
        ['Mobile', data.deviceBreakdown.mobile],
        ['Tablet', data.deviceBreakdown.tablet],
      ]
      
      const csv = [
        csvHeaders,
        ...csvRows,
      ]
        .map(row => row.map(cell => `"${cell}"`).join(','))
        .join('\n')
      
      // Download CSV
      const blob = new Blob([csv], { type: 'text/csv' })
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `campaign-analytics-${period}.csv`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      window.URL.revokeObjectURL(url)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to export CSV')
    } finally {
      setExporting(false)
    }
  }

  const exportAsPDF = async () => {
    if (!data) return
    
    try {
      setExporting(true)
      
      // Create simple PDF-like HTML that can be printed
      const html = `
        <html>
          <head>
            <title>Campaign Analytics Report</title>
            <style>
              body { font-family: Arial, sans-serif; margin: 20px; color: #333; }
              h1 { color: #6d28d9; border-bottom: 2px solid #6d28d9; padding-bottom: 10px; }
              h2 { color: #6d28d9; margin-top: 20px; }
              table { width: 100%; border-collapse: collapse; margin: 10px 0; }
              th, td { border: 1px solid #ddd; padding: 10px; text-align: left; }
              th { background-color: #f3e8ff; color: #6d28d9; }
              .metric-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 20px; margin: 20px 0; }
              .metric-card { border: 1px solid #ddd; padding: 15px; border-radius: 8px; }
              .metric-value { font-size: 24px; font-weight: bold; color: #6d28d9; }
              .metric-label { font-size: 12px; color: #666; margin-top: 5px; }
            </style>
          </head>
          <body>
            <h1>Campaign Analytics Report</h1>
            <p>Generated: ${new Date(data.lastUpdated).toLocaleString()}</p>
            <p>Period: ${period === 'all' ? 'All Time' : period === '7d' ? 'Last 7 Days' : period === '30d' ? 'Last 30 Days' : 'Last 90 Days'}</p>
            
            <h2>Key Metrics</h2>
            <div class="metric-grid">
              <div class="metric-card">
                <div class="metric-value">${data.totalViews.toLocaleString()}</div>
                <div class="metric-label">Total Views (${data.comparison.viewsChange > 0 ? '+' : ''}${data.comparison.viewsChange}%)</div>
              </div>
              <div class="metric-card">
                <div class="metric-value">${data.uniqueVisitors.toLocaleString()}</div>
                <div class="metric-label">Unique Visitors (${data.comparison.visitorsChange > 0 ? '+' : ''}${data.comparison.visitorsChange}%)</div>
              </div>
              <div class="metric-card">
                <div class="metric-value">${data.conversionRate.toFixed(2)}%</div>
                <div class="metric-label">Conversion Rate (${data.comparison.conversionChange > 0 ? '+' : ''}${data.comparison.conversionChange}%)</div>
              </div>
              <div class="metric-card">
                <div class="metric-value">${data.avgTimeOnPage.toFixed(1)}s</div>
                <div class="metric-label">Avg Time on Page (${data.comparison.timeChange > 0 ? '+' : ''}${data.comparison.timeChange}%)</div>
              </div>
            </div>
            
            <h2>Device Breakdown</h2>
            <table>
              <tr>
                <th>Device Type</th>
                <th>Count</th>
                <th>Percentage</th>
              </tr>
              <tr>
                <td>Desktop</td>
                <td>${data.deviceBreakdown.desktop}</td>
                <td>${((data.deviceBreakdown.desktop / data.uniqueVisitors) * 100).toFixed(1)}%</td>
              </tr>
              <tr>
                <td>Mobile</td>
                <td>${data.deviceBreakdown.mobile}</td>
                <td>${((data.deviceBreakdown.mobile / data.uniqueVisitors) * 100).toFixed(1)}%</td>
              </tr>
              <tr>
                <td>Tablet</td>
                <td>${data.deviceBreakdown.tablet}</td>
                <td>${((data.deviceBreakdown.tablet / data.uniqueVisitors) * 100).toFixed(1)}%</td>
              </tr>
            </table>
            
            <h2>Top Referral Sources</h2>
            <table>
              <tr>
                <th>Source</th>
                <th>Visits</th>
                <th>Percentage</th>
              </tr>
              ${data.topReferrals.map(ref => `<tr><td>${ref.source}</td><td>${ref.count}</td><td>${ref.percentage.toFixed(1)}%</td></tr>`).join('')}
            </table>
          </body>
        </html>
      `
      
      const blob = new Blob([html], { type: 'text/html' })
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `campaign-analytics-${period}.html`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      window.URL.revokeObjectURL(url)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to export PDF')
    } finally {
      setExporting(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <RefreshCw className="mx-auto mb-4 h-8 w-8 animate-spin text-violet-600" />
          <p className="text-gray-600">Loading analytics...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 p-4">
        <p className="text-sm text-red-800">{error}</p>
        <Button onClick={fetchAnalytics} variant="secondary" size="sm" className="mt-2">
          Try Again
        </Button>
      </div>
    )
  }

  if (!data) {
    return <div className="text-center py-12 text-gray-600">No analytics data available</div>
  }

  return (
    <div className="space-y-8">
      {/* Header with period selector and export buttons */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div className="space-y-1">
          <h2 className="text-2xl font-bold text-gray-900">Campaign Analytics</h2>
          <p className="text-sm text-gray-600">Last updated: {new Date(data.lastUpdated).toLocaleString()}</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={exportAsCSV} disabled={exporting} variant="outline" size="sm">
            <Download className="mr-2 h-4 w-4" />
            CSV
          </Button>
          <Button onClick={exportAsPDF} disabled={exporting} variant="outline" size="sm">
            <FileText className="mr-2 h-4 w-4" />
            PDF
          </Button>
        </div>
      </div>

      {/* Period selector */}
      <div className="flex gap-2">
        {(['7d', '30d', '90d', 'all'] as const).map(p => (
          <button
            key={p}
            onClick={() => setPeriod(p)}
            className={cn(
              'rounded-lg px-4 py-2 text-sm font-medium transition-colors',
              period === p
                ? 'bg-violet-600 text-white'
                : 'border border-gray-300 text-gray-700 hover:bg-gray-50'
            )}
          >
            {p === '7d' ? 'Last 7 Days' : p === '30d' ? 'Last 30 Days' : p === '90d' ? 'Last 90 Days' : 'All Time'}
          </button>
        ))}
      </div>

      {/* Overview cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <AnalyticsCard
          label="Total Views"
          value={data.totalViews.toLocaleString()}
          change={data.comparison.viewsChange}
          icon={<Eye className="h-5 w-5" />}
        />
        <AnalyticsCard
          label="Unique Visitors"
          value={data.uniqueVisitors.toLocaleString()}
          change={data.comparison.visitorsChange}
          icon={<Users className="h-5 w-5" />}
        />
        <AnalyticsCard
          label="Conversion Rate"
          value={`${data.conversionRate.toFixed(2)}%`}
          change={data.comparison.conversionChange}
          icon={<TrendingUp className="h-5 w-5" />}
        />
        <AnalyticsCard
          label="Avg Time on Page"
          value={`${data.avgTimeOnPage.toFixed(1)}s`}
          change={data.comparison.timeChange}
          icon={<Clock className="h-5 w-5" />}
        />
      </div>

      {/* Daily activity chart */}
      <div className="rounded-lg border border-gray-200 bg-white p-6">
        <h3 className="mb-4 text-lg font-semibold text-gray-900">Daily Activity</h3>
        <div className="space-y-4">
          {data.dailyActivity.length > 0 ? (
            <div className="flex items-end gap-1 h-64">
              {data.dailyActivity.map((day, idx) => {
                const maxViews = Math.max(...data.dailyActivity.map(d => d.views))
                const height = maxViews > 0 ? (day.views / maxViews) * 100 : 0
                return (
                  <div
                    key={idx}
                    className="flex-1 flex flex-col items-center gap-2 group"
                    title={`${day.date}: ${day.views} views`}
                  >
                    <div
                      className="w-full bg-gradient-to-t from-violet-600 to-violet-400 rounded-t-md transition-all hover:from-violet-700 hover:to-violet-500 cursor-pointer"
                      style={{ height: `${height}%`, minHeight: height > 0 ? '4px' : '0' }}
                    />
                    <span className="text-xs text-gray-600 hidden group-hover:block">{day.views}</span>
                  </div>
                )
              })}
            </div>
          ) : (
            <p className="text-center text-gray-500 py-8">No activity data available</p>
          )}
        </div>
      </div>

      {/* Device breakdown */}
      <div className="rounded-lg border border-gray-200 bg-white p-6">
        <h3 className="mb-6 text-lg font-semibold text-gray-900">Device Breakdown</h3>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
          <DeviceBreakdownCard
            label="Desktop"
            percentage={((data.deviceBreakdown.desktop / data.uniqueVisitors) * 100).toFixed(1)}
            count={data.deviceBreakdown.desktop}
            icon={<Monitor className="h-5 w-5" />}
            color="bg-blue-100 text-blue-700"
          />
          <DeviceBreakdownCard
            label="Mobile"
            percentage={((data.deviceBreakdown.mobile / data.uniqueVisitors) * 100).toFixed(1)}
            count={data.deviceBreakdown.mobile}
            icon={<Smartphone className="h-5 w-5" />}
            color="bg-green-100 text-green-700"
          />
          <DeviceBreakdownCard
            label="Tablet"
            percentage={((data.deviceBreakdown.tablet / data.uniqueVisitors) * 100).toFixed(1)}
            count={data.deviceBreakdown.tablet}
            icon={<Tablet className="h-5 w-5" />}
            color="bg-purple-100 text-purple-700"
          />
        </div>
      </div>

      {/* Top referral sources */}
      <div className="rounded-lg border border-gray-200 bg-white p-6">
        <h3 className="mb-4 text-lg font-semibold text-gray-900">Top Referral Sources</h3>
        {data.topReferrals.length > 0 ? (
          <div className="space-y-3">
            {data.topReferrals.map((referral, idx) => (
              <div key={idx} className="flex items-center justify-between border-b border-gray-100 pb-3 last:border-b-0">
                <div className="flex-1">
                  <p className="font-medium text-gray-900">{referral.source}</p>
                  <p className="text-sm text-gray-600">{referral.count.toLocaleString()} visits</p>
                </div>
                <div className="text-right">
                  <div className="inline-flex items-center gap-1 rounded-full bg-violet-100 px-3 py-1">
                    <span className="text-sm font-semibold text-violet-700">{referral.percentage.toFixed(1)}%</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-center text-gray-500 py-8">No referral data available</p>
        )}
      </div>
    </div>
  )
}

interface AnalyticsCardProps {
  label: string
  value: string
  change: number
  icon: React.ReactNode
}

function AnalyticsCard({ label, value, change, icon }: AnalyticsCardProps) {
  const isPositive = change >= 0

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-4">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm text-gray-600">{label}</p>
          <p className="mt-2 text-2xl font-bold text-gray-900">{value}</p>
          <div className="mt-2 flex items-center gap-1">
            {isPositive ? (
              <ArrowUpRight className="h-4 w-4 text-green-600" />
            ) : (
              <ArrowDownRight className="h-4 w-4 text-red-600" />
            )}
            <span className={cn('text-sm font-medium', isPositive ? 'text-green-600' : 'text-red-600')}>
              {isPositive ? '+' : ''}{change}% vs previous period
            </span>
          </div>
        </div>
        <div className="rounded-lg bg-violet-50 p-3 text-violet-600">{icon}</div>
      </div>
    </div>
  )
}

interface DeviceBreakdownCardProps {
  label: string
  percentage: string
  count: number
  icon: React.ReactNode
  color: string
}

function DeviceBreakdownCard({ label, percentage, count, icon, color }: DeviceBreakdownCardProps) {
  return (
    <div className="rounded-lg border border-gray-200 bg-white p-4">
      <div className="flex items-center gap-3">
        <div className={cn('rounded-lg p-3', color)}>{icon}</div>
        <div className="flex-1">
          <p className="text-sm text-gray-600">{label}</p>
          <p className="text-2xl font-bold text-gray-900">{percentage}%</p>
          <p className="text-xs text-gray-500">{count.toLocaleString()} visitors</p>
        </div>
      </div>
      <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-gray-200">
        <div
          className={cn('h-full bg-gradient-to-r', color.includes('blue') ? 'from-blue-400 to-blue-600' : color.includes('green') ? 'from-green-400 to-green-600' : 'from-purple-400 to-purple-600')}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  )
}
