'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Spinner,
} from '@/components/ui'
import { TrendingUp, Users, Target, Zap } from 'lucide-react'

interface AnalyticsData {
  totals: {
    totalUsers: number
    totalCampaigns: number
    totalLobbies: number
    totalPledges: number
    activeUsers: number
  }
  engagement: {
    avgCommentsPerCampaign: number
    avgLobbiesPerCampaign: number
    activeUserPercentage: number
  }
  charts: {
    signupsByDay: Array<{ date: string; count: number }>
    lobbiesByDay: Array<{ date: string; count: number }>
    campaignsByDay: Array<{ date: string; count: number }>
  }
  topCategories: Array<{ category: string; count: number }>
}

// Simple bar chart component using divs and CSS
function BarChart({
  data,
  title,
  height = 200,
}: {
  data: Array<{ date: string; count: number }>
  title: string
  height?: number
}) {
  const maxValue = Math.max(...data.map((d) => d.count), 1)
  const displayData = data.slice(-14) // Show last 14 days for readability

  return (
    <div className="w-full">
      <h3 className="text-sm font-semibold text-gray-900 mb-4">{title}</h3>
      <div className="flex items-end justify-between gap-1" style={{ height }}>
        {displayData.map((item, idx) => (
          <div key={idx} className="flex-1 flex flex-col items-center">
            <div className="w-full bg-violet-600 rounded-t"
              style={{
                height: `${(item.count / maxValue) * (height - 20)}px`,
                minHeight: item.count > 0 ? '2px' : '0px',
              }}
              title={`${item.date}: ${item.count}`}
            />
            <div className="text-xs text-gray-500 mt-2 truncate w-full text-center">
              {item.date.slice(-5)}
            </div>
          </div>
        ))}
      </div>
      <p className="text-xs text-gray-500 mt-2">Last 14 days</p>
    </div>
  )
}

// Horizontal bar chart for categories
function HorizontalBarChart({
  data,
  title,
}: {
  data: Array<{ category: string; count: number }>
  title: string
}) {
  const maxValue = Math.max(...data.map((d) => d.count), 1)
  const topCategories = data.slice(0, 8)

  return (
    <div className="w-full">
      <h3 className="text-sm font-semibold text-gray-900 mb-4">{title}</h3>
      <div className="space-y-3">
        {topCategories.map((item) => (
          <div key={item.category}>
            <div className="flex justify-between items-center mb-1">
              <span className="text-sm text-gray-700">{item.category}</span>
              <span className="text-sm font-medium text-gray-900">
                {item.count}
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-violet-600 h-2 rounded-full"
                style={{
                  width: `${(item.count / maxValue) * 100}%`,
                }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default function AnalyticsDashboard() {
  const router = useRouter()
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchAnalytics()
  }, [])

  const fetchAnalytics = async () => {
    try {
      const res = await fetch('/api/analytics/overview')
      if (res.status === 401 || res.status === 403) {
        router.push('/login')
        return
      }
      if (res.ok) {
        const data = await res.json()
        setAnalytics(data)
      }
    } catch (error) {
      console.error('Failed to fetch analytics:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Spinner />
      </div>
    )
  }

  if (!analytics) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-gray-500">Failed to load analytics</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Analytics</h1>
          <p className="text-gray-600 mt-2">
            Platform metrics and user engagement trends
          </p>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-sm font-medium text-gray-600">
                <Users className="w-4 h-4" />
                Total Users
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">
                {analytics.totals.totalUsers}
              </div>
              <p className="text-xs text-gray-500 mt-1">
                {analytics.totals.activeUsers} active (7d)
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-sm font-medium text-gray-600">
                <Target className="w-4 h-4" />
                Total Campaigns
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">
                {analytics.totals.totalCampaigns}
              </div>
              <p className="text-xs text-gray-500 mt-1">
                {analytics.totals.totalLobbies} lobbies created
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-sm font-medium text-gray-600">
                <TrendingUp className="w-4 h-4" />
                Conversion Rate
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">
                {analytics.totals.totalCampaigns > 0
                  ? (
                      (analytics.totals.totalLobbies /
                        analytics.totals.totalCampaigns) *
                      100
                    ).toFixed(1)
                  : '0'}
                %
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Lobbies per campaign
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-sm font-medium text-gray-600">
                <Zap className="w-4 h-4" />
                Active Users
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">
                {analytics.engagement.activeUserPercentage.toFixed(1)}%
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Of total user base
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <Card>
            <CardHeader>
              <CardTitle>Daily Signups</CardTitle>
              <CardDescription>
                New user registrations over the last 30 days
              </CardDescription>
            </CardHeader>
            <CardContent>
              <BarChart
                data={analytics.charts.signupsByDay}
                title="Signups"
                height={250}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Daily Lobbies Created</CardTitle>
              <CardDescription>
                Lobbies created over the last 30 days
              </CardDescription>
            </CardHeader>
            <CardContent>
              <BarChart
                data={analytics.charts.lobbiesByDay}
                title="Lobbies"
                height={250}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Daily Campaigns Created</CardTitle>
              <CardDescription>
                Campaigns created over the last 30 days
              </CardDescription>
            </CardHeader>
            <CardContent>
              <BarChart
                data={analytics.charts.campaignsByDay}
                title="Campaigns"
                height={250}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Top Categories</CardTitle>
              <CardDescription>
                Campaign distribution by category
              </CardDescription>
            </CardHeader>
            <CardContent>
              <HorizontalBarChart
                data={analytics.topCategories}
                title="Categories"
              />
            </CardContent>
          </Card>
        </div>

        {/* Engagement Metrics */}
        <Card>
          <CardHeader>
            <CardTitle>Engagement Metrics</CardTitle>
            <CardDescription>
              Average engagement per campaign
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="p-4 border rounded-lg">
                <p className="text-sm text-gray-600 mb-2">
                  Avg Comments per Campaign
                </p>
                <p className="text-3xl font-bold text-violet-600">
                  {analytics.engagement.avgCommentsPerCampaign.toFixed(2)}
                </p>
              </div>

              <div className="p-4 border rounded-lg">
                <p className="text-sm text-gray-600 mb-2">
                  Avg Lobbies per Campaign
                </p>
                <p className="text-3xl font-bold text-violet-600">
                  {analytics.engagement.avgLobbiesPerCampaign.toFixed(2)}
                </p>
              </div>

              <div className="p-4 border rounded-lg">
                <p className="text-sm text-gray-600 mb-2">Active Users %</p>
                <p className="text-3xl font-bold text-violet-600">
                  {analytics.engagement.activeUserPercentage.toFixed(1)}%
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
