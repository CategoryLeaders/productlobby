'use client'

import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  BarChart3,
  TrendingUp,
  MessageSquare,
  Zap,
} from 'lucide-react'
import { DashboardLayout } from '@/components/shared/dashboard-layout'
import { PageHeader } from '@/components/shared/page-header'
import { Spinner } from '@/components/ui/spinner'
import { StatCard } from '@/components/analytics/stat-card'
import { CampaignTable, CampaignRow } from '@/components/analytics/campaign-table'
import { IntensityChart } from '@/components/analytics/intensity-chart'
import { WeeklyGrowth, WeeklyDataPoint } from '@/components/analytics/weekly-growth'
import { TopSupporters, Supporter } from '@/components/analytics/top-supporters'

interface AnalyticsData {
  overview: {
    totalCampaigns: number
    totalLobbies: number
    totalComments: number
    totalViews: number
    avgLobbiesPerCampaign: number
    conversionRate: number
  }
  campaignPerformance: CampaignRow[]
  intensityBreakdown: {
    neatIdea: number
    probablyBuy: number
    takeMyMoney: number
  }
  weeklyGrowth: WeeklyDataPoint[]
  topSupporters: Supporter[]
}

export default function CreatorAnalyticsDashboard() {
  const router = useRouter()
  const [data, setData] = useState<AnalyticsData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        setIsLoading(true)
        const response = await fetch('/api/creator/analytics')

        if (response.status === 401) {
          router.push('/auth/login')
          return
        }

        if (!response.ok) {
          throw new Error('Failed to fetch analytics')
        }

        const analyticsData = await response.json()
        setData(analyticsData)
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'An error occurred'
        setError(errorMessage)
        console.error('Analytics fetch error:', err)
      } finally {
        setIsLoading(false)
      }
    }

    fetchAnalytics()
  }, [router])

  if (isLoading) {
    return (
      <DashboardLayout role="creator">
        <div className="flex items-center justify-center min-h-screen">
          <Spinner className="w-8 h-8" />
        </div>
      </DashboardLayout>
    )
  }

  if (error) {
    return (
      <DashboardLayout role="creator">
        <div className="rounded-lg bg-rose-50 border border-rose-200 p-6">
          <h3 className="font-semibold text-rose-900 mb-2">Error Loading Analytics</h3>
          <p className="text-rose-700">{error}</p>
        </div>
      </DashboardLayout>
    )
  }

  if (!data) {
    return (
      <DashboardLayout role="creator">
        <div className="rounded-lg bg-gray-50 border border-gray-200 p-6">
          <p className="text-gray-600">No data available</p>
        </div>
      </DashboardLayout>
    )
  }

  const { overview, campaignPerformance, intensityBreakdown, weeklyGrowth, topSupporters } = data

  return (
    <DashboardLayout role="creator">
      {/* Page Header */}
      <PageHeader
        title="Creator Analytics"
        subtitle="Track your campaign performance and audience engagement"
      />

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard
          title="Total Lobbies"
          value={overview.totalLobbies}
          icon={<TrendingUp size={24} />}
          color="violet"
        />
        <StatCard
          title="Total Campaigns"
          value={overview.totalCampaigns}
          icon={<BarChart3 size={24} />}
          color="emerald"
        />
        <StatCard
          title="Avg Lobbies/Campaign"
          value={Math.round(overview.avgLobbiesPerCampaign * 10) / 10}
          icon={<Zap size={24} />}
          color="blue"
        />
        <StatCard
          title="Comments"
          value={overview.totalComments}
          icon={<MessageSquare size={24} />}
          color="amber"
        />
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Campaign Performance Table - spans 2 columns */}
        <div className="lg:col-span-3">
          <h2 className="text-xl font-bold text-foreground mb-4">Campaign Performance</h2>
          <CampaignTable
            campaigns={campaignPerformance}
            isLoading={false}
          />
        </div>

        {/* Intensity Chart */}
        <div className="lg:col-span-1">
          <IntensityChart
            neatIdea={intensityBreakdown.neatIdea}
            probablyBuy={intensityBreakdown.probablyBuy}
            takeMyMoney={intensityBreakdown.takeMyMoney}
          />
        </div>

        {/* Weekly Growth */}
        <div className="lg:col-span-2">
          <WeeklyGrowth data={weeklyGrowth} />
        </div>
      </div>

      {/* Top Supporters */}
      <div className="mb-8">
        <TopSupporters supporters={topSupporters} />
      </div>
    </DashboardLayout>
  )
}
