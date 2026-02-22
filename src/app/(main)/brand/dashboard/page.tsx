'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { DashboardLayout, PageHeader } from '@/components/shared'
import { Card, CardContent, CardHeader, CardTitle, Button, Badge } from '@/components/ui'
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'
import { TrendingUp, Users, Target, Zap, Download, MessageSquare, ArrowRight, Loader2 } from 'lucide-react'
import { cn, formatNumber } from '@/lib/utils'

interface DashboardData {
  totalCampaignsClaimed: number
  totalSignalScore: number
  estimatedMarketSize: number
  engagementRate: number
  topCampaigns: Array<{
    campaignId: string
    title: string
    slug: string
    signalScore: number
    lobbyCount: number
    commentCount: number
  }>
  demandTrend: Array<{
    date: string
    value: number
  }>
  lobbyDistribution: Array<{
    campaignTitle: string
    high: number
    medium: number
    low: number
  }>
}

const COLORS = {
  high: '#7C3AED',
  medium: '#FBBF24',
  low: '#34D399',
}

const BrandDashboardPage: React.FC = () => {
  const [data, setData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      setLoading(true)
      const res = await fetch('/api/brand/dashboard')
      if (!res.ok) throw new Error('Failed to load dashboard data')
      const json = await res.json()
      setData(json.data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <DashboardLayout role="brand">
        <div className="flex items-center justify-center h-96">
          <Loader2 className="w-8 h-8 animate-spin text-violet-600" />
        </div>
      </DashboardLayout>
    )
  }

  if (error || !data) {
    return (
      <DashboardLayout role="brand">
        <div className="text-center py-12">
          <p className="text-red-600">{error || 'Failed to load dashboard'}</p>
          <Button onClick={fetchDashboardData} variant="primary" className="mt-4">
            Try Again
          </Button>
        </div>
      </DashboardLayout>
    )
  }

  const lobbyDistributionData = data.lobbyDistribution.map((item) => {
    const total = item.high + item.medium + item.low
    return {
      name: item.campaignTitle,
      high: item.high,
      medium: item.medium,
      low: item.low,
      total,
    }
  })

  return (
    <DashboardLayout role="brand">
      <div className="space-y-8">
        {/* Header */}
        <PageHeader
          title="Brand Dashboard"
          description="Premium analytics and engagement tools for your campaigns"
        />

        {/* Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card hover>
            <CardContent className="pt-6">
              <div className="flex items-start justify-between mb-3">
                <TrendingUp className="w-5 h-5 text-violet-600" />
                <Badge variant="lime" size="sm">
                  Up
                </Badge>
              </div>
              <p className="text-sm text-gray-600 mb-1">Campaigns Claimed</p>
              <p className="font-display font-bold text-3xl text-foreground">
                {data.totalCampaignsClaimed}
              </p>
            </CardContent>
          </Card>

          <Card hover>
            <CardContent className="pt-6">
              <div className="flex items-start justify-between mb-3">
                <Zap className="w-5 h-5 text-violet-600" />
              </div>
              <p className="text-sm text-gray-600 mb-1">Total Signal Score</p>
              <p className="font-display font-bold text-3xl text-foreground">
                {formatNumber(data.totalSignalScore)}
              </p>
            </CardContent>
          </Card>

          <Card hover>
            <CardContent className="pt-6">
              <div className="flex items-start justify-between mb-3">
                <Target className="w-5 h-5 text-violet-600" />
              </div>
              <p className="text-sm text-gray-600 mb-1">Estimated Market Size</p>
              <p className="font-display font-bold text-3xl text-foreground">
                ${formatNumber(data.estimatedMarketSize)}
              </p>
            </CardContent>
          </Card>

          <Card hover>
            <CardContent className="pt-6">
              <div className="flex items-start justify-between mb-3">
                <Users className="w-5 h-5 text-violet-600" />
              </div>
              <p className="text-sm text-gray-600 mb-1">Engagement Rate</p>
              <p className="font-display font-bold text-3xl text-foreground">
                {data.engagementRate.toFixed(1)}%
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Demand Trend Chart */}
          <Card>
            <CardHeader>
              <CardTitle>Demand Trend (Last 30 Days)</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={data.demandTrend}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip />
                  <Line
                    type="monotone"
                    dataKey="value"
                    stroke="#7C3AED"
                    strokeWidth={2}
                    dot={false}
                    name="Lobbies"
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Lobby Intensity Distribution */}
          <Card>
            <CardHeader>
              <CardTitle>Lobby Intensity Distribution</CardTitle>
            </CardHeader>
            <CardContent>
              {lobbyDistributionData.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={lobbyDistributionData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis
                      dataKey="name"
                      tick={{ fontSize: 12 }}
                      angle={-45}
                      textAnchor="end"
                      height={100}
                    />
                    <YAxis tick={{ fontSize: 12 }} />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="high" stackId="a" fill={COLORS.high} name="High" />
                    <Bar dataKey="medium" stackId="a" fill={COLORS.medium} name="Medium" />
                    <Bar dataKey="low" stackId="a" fill={COLORS.low} name="Low" />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-72 flex items-center justify-center text-gray-500">
                  No lobby data available
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Top Campaigns */}
        <div className="grid grid-cols-1 gap-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Top Campaigns by Signal</CardTitle>
                <Link href="/brand/dashboard/campaigns">
                  <Button variant="ghost" size="sm">
                    View All <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </Link>
              </div>
            </CardHeader>
            <CardContent>
              {data.topCampaigns.length > 0 ? (
                <div className="space-y-3">
                  {data.topCampaigns.map((campaign, index) => (
                    <Link
                      key={campaign.campaignId}
                      href={`/campaigns/${campaign.slug}`}
                    >
                      <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer">
                        <div className="flex-1">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-violet-100 flex items-center justify-center text-violet-700 font-bold text-sm">
                              {index + 1}
                            </div>
                            <div>
                              <p className="font-semibold text-foreground">
                                {campaign.title}
                              </p>
                              <p className="text-sm text-gray-600">
                                {campaign.lobbyCount.toLocaleString()} lobbies
                              </p>
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-display font-bold text-lg text-violet-600">
                            {campaign.signalScore}
                          </p>
                          <p className="text-xs text-gray-600">Signal Score</p>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              ) : (
                <div className="py-8 text-center text-gray-500">
                  No campaigns yet
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <div className="w-12 h-12 rounded-lg bg-violet-100 flex items-center justify-center mx-auto mb-3">
                  <MessageSquare className="w-6 h-6 text-violet-600" />
                </div>
                <h3 className="font-semibold text-foreground mb-2">Respond to Campaigns</h3>
                <p className="text-sm text-gray-600 mb-4">
                  Review and respond to campaigns targeting your brand
                </p>
                <Link href="/brand/dashboard/campaigns">
                  <Button variant="primary" size="sm" className="w-full">
                    View Campaigns
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <div className="w-12 h-12 rounded-lg bg-violet-100 flex items-center justify-center mx-auto mb-3">
                  <TrendingUp className="w-6 h-6 text-violet-600" />
                </div>
                <h3 className="font-semibold text-foreground mb-2">View Reports</h3>
                <p className="text-sm text-gray-600 mb-4">
                  Access detailed demand and engagement reports
                </p>
                <Link href="/brand/dashboard/reports">
                  <Button variant="primary" size="sm" className="w-full">
                    View Reports
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <div className="w-12 h-12 rounded-lg bg-violet-100 flex items-center justify-center mx-auto mb-3">
                  <Download className="w-6 h-6 text-violet-600" />
                </div>
                <h3 className="font-semibold text-foreground mb-2">Export Data</h3>
                <p className="text-sm text-gray-600 mb-4">
                  Download your campaign data and reports
                </p>
                <Link href="/brand/dashboard/reports">
                  <Button variant="primary" size="sm" className="w-full">
                    Export Now
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  )
}

export default BrandDashboardPage
