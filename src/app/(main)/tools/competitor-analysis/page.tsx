'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { DashboardLayout } from '@/components/shared/dashboard-layout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'
import {
  AlertCircle,
  TrendingUp,
  MessageCircle,
  Zap,
  BarChart3,
  ArrowUp,
  ArrowDown,
} from 'lucide-react'
import { cn, formatNumber } from '@/lib/utils'

interface CampaignData {
  id: string
  slug: string
  title: string
  status: string
  createdAt: string
  lobbyCount: number
  commentCount: number
  signalScore: number | null
  sentiment?: string
}

interface Metrics {
  lobbyCount: number
  commentCount: number
  signalScore: number
  sentiment: string
  growthRate: number
}

export default function CompetitorAnalysisPage() {
  const [input, setInput] = useState('')
  const [campaigns, setCampaigns] = useState<CampaignData[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleAnalyze = async () => {
    try {
      setError(null)
      setLoading(true)

      // Parse input - can be comma-separated or newline-separated
      const ids = input
        .split(/[,\n]/)
        .map((id) => id.trim())
        .filter((id) => id.length > 0)

      if (ids.length === 0) {
        setError('Please enter at least one campaign slug')
        return
      }

      if (ids.length > 3) {
        setError('Maximum 3 campaigns can be analyzed at once')
        return
      }

      const response = await fetch(`/api/campaigns/compare?ids=${ids.join(',')}`)

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to fetch campaigns')
      }

      const data = await response.json()
      setCampaigns(data.campaigns)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
      setCampaigns([])
    } finally {
      setLoading(false)
    }
  }

  // Calculate radar plot points for visualization
  const calculateRadarPoints = (campaigns: CampaignData[]) => {
    if (campaigns.length === 0) return {}

    const metrics = ['lobbyCount', 'commentCount', 'signalScore', 'sentiment', 'growthRate']
    const maxValues: Record<string, number> = {
      lobbyCount: Math.max(...campaigns.map((c) => c.lobbyCount)) || 1,
      commentCount: Math.max(...campaigns.map((c) => c.commentCount)) || 1,
      signalScore: Math.max(...campaigns.map((c) => c.signalScore || 0)) || 1,
      sentiment: 100,
      growthRate:
        Math.max(
          ...campaigns.map((c) => {
            const created = new Date(c.createdAt).getTime()
            const now = Date.now()
            return (c.lobbyCount / ((now - created) / (1000 * 60 * 60 * 24))) || 0
          })
        ) || 1,
    }

    return campaigns.reduce(
      (acc, campaign) => {
        const growthRate = (c: CampaignData) => {
          const created = new Date(c.createdAt).getTime()
          const now = Date.now()
          const days = (now - created) / (1000 * 60 * 60 * 24)
          return days > 0 ? c.lobbyCount / days : 0
        }

        acc[campaign.slug] = {
          lobbyCount: (campaign.lobbyCount / maxValues.lobbyCount) * 100,
          commentCount: (campaign.commentCount / maxValues.commentCount) * 100,
          signalScore: ((campaign.signalScore || 0) / maxValues.signalScore) * 100,
          sentiment: 75,
          growthRate: (growthRate(campaign) / maxValues.growthRate) * 100,
        }
        return acc
      },
      {} as Record<string, Record<string, number>>
    )
  }

  const radarData = calculateRadarPoints(campaigns)

  // Generate SVG radar chart
  const generateRadarSVG = (campaignSlug: string, color: string) => {
    if (!radarData[campaignSlug]) return null

    const data = radarData[campaignSlug]
    const metrics = ['lobbyCount', 'commentCount', 'signalScore', 'sentiment', 'growthRate']
    const points = metrics.length

    // Calculate polygon points
    const centerX = 150
    const centerY = 150
    const radius = 120

    const polygonPoints = metrics
      .map((metric, index) => {
        const angle = (index / points) * Math.PI * 2 - Math.PI / 2
        const value = data[metric] || 0
        const distance = (value / 100) * radius
        const x = centerX + distance * Math.cos(angle)
        const y = centerY + distance * Math.sin(angle)
        return `${x},${y}`
      })
      .join(' ')

    return (
      <svg viewBox="0 0 300 300" className="w-full h-auto max-w-xs">
        <defs>
          <filter id={`shadow-${campaignSlug}`}>
            <feDropShadow dx="0" dy="2" stdDeviation="3" floodOpacity="0.3" />
          </filter>
        </defs>

        {/* Grid circles */}
        {[1, 2, 3, 4, 5].map((i) => (
          <circle
            key={`grid-${i}`}
            cx={centerX}
            cy={centerY}
            r={(radius / 5) * i}
            fill="none"
            stroke="currentColor"
            strokeWidth="0.5"
            opacity="0.2"
          />
        ))}

        {/* Axes */}
        {metrics.map((_, index) => {
          const angle = (index / points) * Math.PI * 2 - Math.PI / 2
          const x = centerX + radius * Math.cos(angle)
          const y = centerY + radius * Math.sin(angle)
          return (
            <line
              key={`axis-${index}`}
              x1={centerX}
              y1={centerY}
              x2={x}
              y2={y}
              stroke="currentColor"
              strokeWidth="0.5"
              opacity="0.2"
            />
          )
        })}

        {/* Data polygon */}
        <polygon
          points={polygonPoints}
          fill={color}
          fillOpacity="0.3"
          stroke={color}
          strokeWidth="2"
          filter={`url(#shadow-${campaignSlug})`}
        />

        {/* Data points */}
        {metrics.map((metric, index) => {
          const angle = (index / points) * Math.PI * 2 - Math.PI / 2
          const value = data[metric] || 0
          const distance = (value / 100) * radius
          const x = centerX + distance * Math.cos(angle)
          const y = centerY + distance * Math.sin(angle)
          return (
            <circle
              key={`point-${index}`}
              cx={x}
              cy={y}
              r="3"
              fill={color}
              stroke="white"
              strokeWidth="1"
            />
          )
        })}

        {/* Labels */}
        {metrics.map((metric, index) => {
          const angle = (index / points) * Math.PI * 2 - Math.PI / 2
          const labelDistance = radius + 25
          const x = centerX + labelDistance * Math.cos(angle)
          const y = centerY + labelDistance * Math.sin(angle)
          const metricLabel = metric === 'lobbyCount' ? 'Lobbies' :
                              metric === 'commentCount' ? 'Comments' :
                              metric === 'signalScore' ? 'Signal' :
                              metric === 'sentiment' ? 'Sentiment' : 'Growth'
          return (
            <text
              key={`label-${index}`}
              x={x}
              y={y}
              textAnchor="middle"
              dominantBaseline="middle"
              fontSize="11"
              fill="currentColor"
              opacity="0.7"
            >
              {metricLabel}
            </text>
          )
        })}
      </svg>
    )
  }

  const colors = ['#3b82f6', '#ef4444', '#10b981']

  return (
    <DashboardLayout role="creator">
      <div className="space-y-8">
        {/* Header */}
        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">Competitor Analysis</h1>
          <p className="text-muted-foreground">
            Compare your campaign metrics against competitors to identify strengths and opportunities.
          </p>
        </div>

        {/* Input Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5" />
              Enter Campaign Slugs
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">
                Campaign Slugs (2-3 campaigns, comma or newline separated)
              </label>
              <Textarea
                placeholder="my-campaign&#10;competitor-1&#10;competitor-2"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                className="font-mono text-sm"
                rows={4}
              />
            </div>

            <div className="flex gap-2">
              <Button onClick={handleAnalyze} disabled={loading} className="flex-1">
                {loading ? 'Analyzing...' : 'Analyze Campaigns'}
              </Button>
              {campaigns.length > 0 && (
                <Button
                  variant="outline"
                  onClick={() => {
                    setInput('')
                    setCampaigns([])
                  }}
                >
                  Clear
                </Button>
              )}
            </div>

            {error && (
              <div className="p-3 bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 rounded-lg flex gap-2">
                <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-red-700 dark:text-red-200">{error}</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Results */}
        {campaigns.length > 0 && (
          <div className="space-y-6">
            {/* Radar Charts */}
            <Card>
              <CardHeader>
                <CardTitle>Campaign Metrics Comparison</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {campaigns.map((campaign, idx) => (
                    <div key={campaign.id} className="flex flex-col items-center gap-4">
                      <div className="text-center">
                        <h3 className="font-semibold">{campaign.title}</h3>
                        <p className="text-sm text-muted-foreground">{campaign.slug}</p>
                      </div>
                      <div className="text-blue-600 dark:text-blue-400">
                        {generateRadarSVG(campaign.slug, colors[idx])}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Detailed Metrics */}
            <Card>
              <CardHeader>
                <CardTitle>Detailed Metrics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-gray-200 dark:border-gray-700">
                        <th className="text-left py-3 px-4 font-semibold">Metric</th>
                        {campaigns.map((c) => (
                          <th
                            key={c.id}
                            className="text-left py-3 px-4 font-semibold text-center"
                          >
                            <div>{c.title}</div>
                            <div className="text-xs font-normal text-muted-foreground">
                              {c.slug}
                            </div>
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="border-b border-gray-100 dark:border-gray-800">
                        <td className="py-3 px-4 font-medium flex items-center gap-2">
                          <TrendingUp className="w-4 h-4 text-blue-600" />
                          Lobbies
                        </td>
                        {campaigns.map((c) => (
                          <td key={c.id} className="py-3 px-4 text-center">
                            <span className="font-semibold">{formatNumber(c.lobbyCount)}</span>
                          </td>
                        ))}
                      </tr>
                      <tr className="border-b border-gray-100 dark:border-gray-800">
                        <td className="py-3 px-4 font-medium flex items-center gap-2">
                          <MessageCircle className="w-4 h-4 text-green-600" />
                          Comments
                        </td>
                        {campaigns.map((c) => (
                          <td key={c.id} className="py-3 px-4 text-center">
                            <span className="font-semibold">{formatNumber(c.commentCount)}</span>
                          </td>
                        ))}
                      </tr>
                      <tr className="border-b border-gray-100 dark:border-gray-800">
                        <td className="py-3 px-4 font-medium flex items-center gap-2">
                          <Zap className="w-4 h-4 text-amber-600" />
                          Signal Score
                        </td>
                        {campaigns.map((c) => (
                          <td key={c.id} className="py-3 px-4 text-center">
                            <span className="font-semibold">
                              {(c.signalScore || 0).toFixed(1)}
                            </span>
                          </td>
                        ))}
                      </tr>
                      <tr className="border-b border-gray-100 dark:border-gray-800">
                        <td className="py-3 px-4 font-medium">Status</td>
                        {campaigns.map((c) => (
                          <td key={c.id} className="py-3 px-4 text-center">
                            <Badge variant="outline">{c.status}</Badge>
                          </td>
                        ))}
                      </tr>
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>

            {/* Campaign Links */}
            <Card>
              <CardHeader>
                <CardTitle>View Full Campaigns</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {campaigns.map((campaign) => (
                    <Link
                      key={campaign.id}
                      href={`/campaigns/${campaign.slug}`}
                      className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors"
                    >
                      <h3 className="font-semibold line-clamp-2">{campaign.title}</h3>
                      <p className="text-xs text-muted-foreground mt-1">{campaign.slug}</p>
                      <div className="flex items-center gap-4 mt-3 text-xs">
                        <span className="text-muted-foreground">
                          {formatNumber(campaign.lobbyCount)} lobbies
                        </span>
                        <span className="text-muted-foreground">
                          {formatNumber(campaign.commentCount)} comments
                        </span>
                      </div>
                    </Link>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}
