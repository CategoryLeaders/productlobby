'use client'

import { DemandReport } from '@/lib/demand-report'
import { useRef } from 'react'

interface DemandReportPreviewProps {
  report: DemandReport
  campaignSlug: string
}

export default function DemandReportPreview({ report, campaignSlug }: DemandReportPreviewProps) {
  const signalColor =
    report.signalScore >= 80
      ? 'text-lime-500'
      : report.signalScore >= 55
        ? 'text-violet-600'
        : 'text-red-500'

  const signalBgColor =
    report.signalScore >= 80
      ? 'bg-lime-50 border-lime-200'
      : report.signalScore >= 55
        ? 'bg-violet-50 border-violet-200'
        : 'bg-red-50 border-red-200'

  const signalTier =
    report.signalScore >= 80
      ? 'Exceptional'
      : report.signalScore >= 55
        ? 'Strong'
        : report.signalScore >= 35
          ? 'Moderate'
          : 'Emerging'

  const trendColor =
    report.growth.trend === 'accelerating'
      ? 'text-lime-600'
      : report.growth.trend === 'growing'
        ? 'text-lime-500'
        : report.growth.trend === 'flat'
          ? 'text-gray-500'
          : 'text-red-500'

  const downloadHtmlReport = () => {
    const { formatReportAsHtml } = require('@/lib/demand-report')
    const html = formatReportAsHtml(report)
    const blob = new Blob([html], { type: 'text/html' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `demand-report-${report.campaignId}.html`
    a.click()
    URL.revokeObjectURL(url)
  }

  const downloadMarkdownReport = () => {
    const { formatReportAsMarkdown } = require('@/lib/demand-report')
    const markdown = formatReportAsMarkdown(report)
    const blob = new Blob([markdown], { type: 'text/markdown' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `demand-report-${report.campaignId}.md`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="w-full max-w-3xl mx-auto">
      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-violet-600 to-violet-700 px-8 py-12 text-white">
          <div className="text-sm font-semibold uppercase tracking-wide opacity-90">
            ProductLobby Demand Report
          </div>
          <h1 className="text-3xl font-bold mt-2 mb-2">{report.campaignTitle}</h1>
          <p className="text-violet-100">
            Market validation & opportunity analysis
          </p>
        </div>

        {/* Content */}
        <div className="p-8">
          {/* Campaign Overview */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-sm text-gray-600 uppercase tracking-wide font-semibold">
                  {report.category}
                </p>
                <h2 className="text-xl font-semibold text-gray-900 mt-1">
                  Campaign Overview
                </h2>
              </div>
              <div className="text-right">
                <div className="text-3xl font-bold text-gray-900">
                  {report.signalBreakdown.total}
                </div>
                <p className="text-sm text-gray-600">supporters</p>
              </div>
            </div>
            <p className="text-gray-700">{report.campaignDescription}</p>
          </div>

          {/* Signal Score */}
          <div className={`rounded-lg border-2 p-6 mb-8 ${signalBgColor}`}>
            <div className="text-center">
              <p className="text-sm font-semibold text-gray-600 uppercase tracking-wide">
                Signal Strength Score
              </p>
              <div className={`text-5xl font-bold mt-3 mb-2 ${signalColor}`}>
                {report.signalScore.toFixed(1)}
              </div>
              <p className="text-gray-700 font-medium">
                {signalTier} market demand
              </p>

              {/* Breakdown Bar */}
              {report.signalBreakdown.total > 0 && (
                <div className="mt-4">
                  <div className="flex gap-1 h-6 rounded overflow-hidden bg-gray-200">
                    <div
                      className="bg-blue-400"
                      style={{
                        width: `${(report.signalBreakdown.neatIdea / report.signalBreakdown.total) * 100}%`,
                      }}
                      title={`Neat Idea: ${report.signalBreakdown.neatIdea}`}
                    />
                    <div
                      className="bg-violet-500"
                      style={{
                        width: `${(report.signalBreakdown.probablyBuy / report.signalBreakdown.total) * 100}%`,
                      }}
                      title={`Probably Buy: ${report.signalBreakdown.probablyBuy}`}
                    />
                    <div
                      className="bg-lime-500"
                      style={{
                        width: `${(report.signalBreakdown.takeMyMoney / report.signalBreakdown.total) * 100}%`,
                      }}
                      title={`Take My Money: ${report.signalBreakdown.takeMyMoney}`}
                    />
                  </div>
                  <div className="flex gap-4 mt-3 text-xs font-medium text-gray-700">
                    <div>
                      <span className="inline-block w-3 h-3 bg-blue-400 rounded mr-1" />
                      Neat Idea: {report.signalBreakdown.neatIdea}
                    </div>
                    <div>
                      <span className="inline-block w-3 h-3 bg-violet-500 rounded mr-1" />
                      Probably Buy: {report.signalBreakdown.probablyBuy}
                    </div>
                    <div>
                      <span className="inline-block w-3 h-3 bg-lime-500 rounded mr-1" />
                      Take My Money: {report.signalBreakdown.takeMyMoney}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Key Metrics Grid */}
          <div className="grid grid-cols-2 gap-4 mb-8">
            <MetricCard
              label="Projected Customers"
              value={report.marketSize.projectedCustomers}
              format="number"
            />
            <MetricCard
              label="Projected Revenue"
              value={report.marketSize.projectedRevenue}
              format="currency"
            />
            <MetricCard
              label="Median Price Point"
              value={report.marketSize.medianPrice}
              format="price"
            />
            <MetricCard
              label="90th Percentile Price"
              value={report.marketSize.p90Price}
              format="price"
            />
            <MetricCard
              label="Last 7 Days Growth"
              value={report.growth.lobbiesLast7Days}
              format="number"
            />
            <MetricCard
              label="Growth Rate"
              value={report.growth.growthRate}
              format="percentage"
              color={report.growth.growthRate > 0 ? 'lime' : 'red'}
            />
          </div>

          {/* Growth Trend */}
          <div className="bg-gray-50 rounded-lg p-6 mb-8 border border-gray-200">
            <h3 className="font-semibold text-gray-900 mb-4">Growth Trend Analysis</h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-gray-700">Last 30 Days:</span>
                <span className="font-semibold text-gray-900">
                  {report.growth.lobbiesLast30Days} supporters
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-700">Current Trend:</span>
                <span className={`font-semibold capitalize ${trendColor}`}>
                  {report.growth.trend}
                </span>
              </div>
              <div className="pt-2 border-t border-gray-200 mt-4">
                <p className="text-sm text-gray-600">
                  Campaign momentum is{' '}
                  {report.growth.trend === 'accelerating'
                    ? 'exceptional – high growth trajectory'
                    : report.growth.trend === 'growing'
                      ? 'positive – steady increase in interest'
                      : report.growth.trend === 'flat'
                        ? 'stable – consistent level of support'
                        : 'declining – decreasing new supporters'}
                </p>
              </div>
            </div>
          </div>

          {/* Competitive Landscape */}
          {report.competitorAnalysis.count > 0 && (
            <div className="bg-gray-50 rounded-lg p-6 mb-8 border border-gray-200">
              <h3 className="font-semibold text-gray-900 mb-4">
                Competitive Landscape
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-gray-700">Competitors Analyzed:</span>
                  <span className="font-semibold text-gray-900">
                    {report.competitorAnalysis.count}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-700">Average Price:</span>
                  <span className="font-semibold text-gray-900">
                    £{report.competitorAnalysis.averagePrice.toFixed(2)}
                  </span>
                </div>
              </div>

              {report.competitorAnalysis.commonThemes.length > 0 && (
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <p className="text-sm font-semibold text-gray-700 mb-3">
                    Common gaps in competitors:
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {report.competitorAnalysis.commonThemes.map((theme) => (
                      <span
                        key={theme}
                        className="inline-block bg-white px-3 py-1 rounded-full text-sm text-gray-700 border border-gray-300"
                      >
                        {theme}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Top Comments */}
          {report.topComments.length > 0 && (
            <div className="mb-8">
              <h3 className="font-semibold text-gray-900 mb-4">Supporter Feedback</h3>
              <div className="space-y-3">
                {report.topComments.slice(0, 3).map((comment, idx) => (
                  <div
                    key={idx}
                    className="bg-gray-50 rounded-lg p-4 border-l-4 border-violet-500"
                  >
                    <p className="font-semibold text-gray-900 text-sm mb-1">
                      {comment.user}
                    </p>
                    <p className="text-gray-700 text-sm leading-relaxed">
                      {comment.content}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Recommendations */}
          <div className="bg-green-50 rounded-lg p-6 mb-8 border border-green-200">
            <h3 className="font-semibold text-green-900 mb-4">Strategic Recommendations</h3>
            <ul className="space-y-3">
              {report.recommendations.map((rec, idx) => (
                <li key={idx} className="flex gap-3">
                  <span className="text-green-600 font-bold mt-0.5">✓</span>
                  <span className="text-green-900 text-sm leading-relaxed">{rec}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-4 justify-center pt-8 border-t border-gray-200">
            <a
              href={`/campaigns/${campaignSlug}`}
              className="inline-flex items-center gap-2 px-6 py-3 bg-violet-600 text-white font-semibold rounded-lg hover:bg-violet-700 transition"
            >
              View Campaign
            </a>
            <button
              onClick={downloadHtmlReport}
              className="inline-flex items-center gap-2 px-6 py-3 bg-gray-200 text-gray-900 font-semibold rounded-lg hover:bg-gray-300 transition"
            >
              Download HTML
            </button>
            <button
              onClick={downloadMarkdownReport}
              className="inline-flex items-center gap-2 px-6 py-3 bg-gray-200 text-gray-900 font-semibold rounded-lg hover:bg-gray-300 transition"
            >
              Download Markdown
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-gray-100 px-8 py-6 text-center border-t border-gray-200">
          <p className="text-sm text-gray-600">
            ProductLobby • Consumer-Driven Product Development
          </p>
          <p className="text-xs text-gray-500 mt-2">
            Generated on {new Date().toLocaleDateString()}
          </p>
        </div>
      </div>
    </div>
  )
}

interface MetricCardProps {
  label: string
  value: number
  format: 'number' | 'currency' | 'price' | 'percentage'
  color?: 'default' | 'lime' | 'red'
}

function MetricCard({ label, value, format, color = 'default' }: MetricCardProps) {
  let formattedValue: string

  switch (format) {
    case 'number':
      formattedValue = value.toLocaleString()
      break
    case 'currency':
      formattedValue = `£${(value / 1000).toFixed(1)}k`
      break
    case 'price':
      formattedValue = `£${value.toFixed(2)}`
      break
    case 'percentage':
      formattedValue = `${value > 0 ? '+' : ''}${value.toFixed(1)}%`
      break
  }

  const colorClass = {
    default: 'text-violet-600',
    lime: 'text-lime-600',
    red: 'text-red-600',
  }[color]

  return (
    <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
      <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-2">
        {label}
      </p>
      <p className={`text-2xl font-bold ${colorClass}`}>{formattedValue}</p>
    </div>
  )
}
