'use client'

import React, { useState } from 'react'
import { DashboardLayout } from '@/components/shared/dashboard-layout'
import { PageHeader } from '@/components/shared/page-header'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ChipSelector } from '@/components/ui/chip-selector'
import { Badge } from '@/components/ui/badge'

interface Campaign {
  id: string
  title: string
}

const campaigns: Campaign[] = [
  { id: '1', title: "Nike Women's Running Shoes in Extended Sizes" },
  { id: '2', title: 'Portable Air Purifier with HEPA Filter' },
  { id: '3', title: 'Dyson Silent Fan with App Control' },
]

const dailyData = [
  45, 52, 48, 61, 55, 68, 72, 65, 78, 85, 92, 88, 95, 102, 110, 115, 108, 120,
  125, 118, 130, 135, 142, 138, 145, 150, 155, 160, 158, 165,
]

export default function AnalyticsPage() {
  const [selectedCampaign, setSelectedCampaign] = useState(campaigns[0])

  const maxDaily = Math.max(...dailyData)
  const totalLobbies = dailyData.reduce((a, b) => a + b, 0)
  const thisWeekLobbies = dailyData.slice(-7).reduce((a, b) => a + b, 0)

  return (
    <DashboardLayout role="creator">
      <PageHeader title="Campaign Analytics" />

      {/* Campaign Selector */}
      <Card className="bg-white border-gray-200 mb-6">
        <CardContent className="pt-6">
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Select Campaign
          </label>
          <select
            value={selectedCampaign.id}
            onChange={(e) => {
              const campaign = campaigns.find((c) => c.id === e.target.value)
              if (campaign) setSelectedCampaign(campaign)
            }}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
          >
            {campaigns.map((c) => (
              <option key={c.id} value={c.id}>
                {c.title}
              </option>
            ))}
          </select>
        </CardContent>
      </Card>

      {/* Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-card">
          <h3 className="text-sm font-medium text-gray-600 mb-2">Total Lobbies</h3>
          <p className="text-3xl font-display font-bold text-foreground">2,847</p>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-card">
          <h3 className="text-sm font-medium text-gray-600 mb-2">This Week</h3>
          <p className="text-3xl font-display font-bold text-foreground">
            <span className="text-lime-600">+234</span>
          </p>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-card">
          <h3 className="text-sm font-medium text-gray-600 mb-2">Intensity Score</h3>
          <p className="text-3xl font-display font-bold text-foreground">82%</p>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-card">
          <h3 className="text-sm font-medium text-gray-600 mb-2">Shares</h3>
          <p className="text-3xl font-display font-bold text-foreground">1,432</p>
        </div>
      </div>

      {/* Main Analytics Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        {/* Lobby Growth Chart */}
        <div className="lg:col-span-2">
          <Card className="bg-white border-gray-200">
            <CardHeader>
              <CardTitle className="font-display">Lobby Growth (30 Days)</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64 flex items-flex-end justify-between gap-1">
                {dailyData.map((value, index) => (
                  <div
                    key={index}
                    className="flex-1 bg-violet-600 rounded-t-sm transition-all duration-300 hover:bg-violet-700 hover:shadow-elevated"
                    style={{
                      height: `${(value / maxDaily) * 100}%`,
                      minHeight: '4px',
                    }}
                    title={`Day ${index + 1}: ${value} lobbies`}
                  />
                ))}
              </div>
              <div className="mt-4 pt-4 border-t border-gray-200">
                <p className="text-sm text-gray-600">
                  Average daily growth:{' '}
                  <span className="font-semibold text-foreground">
                    {Math.round(totalLobbies / dailyData.length)}
                  </span>
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Intensity Distribution */}
        <div>
          <Card className="bg-white border-gray-200">
            <CardHeader>
              <CardTitle className="font-display text-base">Intensity Distribution</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Pie-like visual with CSS */}
                <div className="relative h-40 flex items-center justify-center">
                  <div className="text-center">
                    <div className="text-4xl font-display font-bold text-violet-600 mb-2">
                      82%
                    </div>
                    <p className="text-xs text-gray-500">Engagement</p>
                  </div>
                </div>

                {/* Legend */}
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-green-500 rounded-full" />
                    <span className="text-sm text-gray-600">
                      NEAT_IDEA <span className="font-semibold text-foreground">15%</span>
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-yellow-400 rounded-full" />
                    <span className="text-sm text-gray-600">
                      PROBABLY_BUY{' '}
                      <span className="font-semibold text-foreground">37%</span>
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-violet-600 rounded-full" />
                    <span className="text-sm text-gray-600">
                      TAKE_MY_MONEY{' '}
                      <span className="font-semibold text-foreground">48%</span>
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Preference Summary Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        {/* Top Sizes */}
        <div>
          <Card className="bg-white border-gray-200">
            <CardHeader>
              <CardTitle className="font-display text-base">Top Sizes</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {[
                { label: 'Size 8', votes: 487 },
                { label: 'Size 7.5', votes: 412 },
                { label: 'Size 9', votes: 398 },
                { label: 'Size 6.5', votes: 342 },
                { label: 'Size 10', votes: 298 },
              ].map((item, idx) => (
                <div key={idx}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium text-gray-700">{item.label}</span>
                    <span className="text-xs text-gray-600">{item.votes}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-violet-600 h-2 rounded-full"
                      style={{ width: `${(item.votes / 487) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Top Colors */}
        <div>
          <Card className="bg-white border-gray-200">
            <CardHeader>
              <CardTitle className="font-display text-base">Top Colors</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {[
                { label: 'Black', count: 634 },
                { label: 'White', count: 521 },
                { label: 'Navy Blue', count: 456 },
                { label: 'Gray', count: 398 },
                { label: 'Pink', count: 342 },
              ].map((item, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between px-3 py-2 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors"
                >
                  <span className="text-sm font-medium text-gray-700">{item.label}</span>
                  <Badge variant="outline" size="sm">
                    {item.count}
                  </Badge>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Price Range */}
        <div>
          <Card className="bg-white border-gray-200">
            <CardHeader>
              <CardTitle className="font-display text-base">Price Range</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {[
                { range: '£50 - £100', votes: 523 },
                { range: '£100 - £150', votes: 687 },
                { range: '£150 - £200', votes: 456 },
                { range: '£200+', votes: 181 },
              ].map((item, idx) => (
                <div key={idx}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium text-gray-700">{item.range}</span>
                    <span className="text-xs text-gray-600">{item.votes}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-lime-600 h-2 rounded-full"
                      style={{ width: `${(item.votes / 687) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Wishlist Themes */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <Card className="bg-white border-gray-200 lg:col-span-2">
          <CardHeader>
            <CardTitle className="font-display">Wishlist Themes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[
                { theme: 'Wider toe box', count: 234 },
                { theme: 'Arch support', count: 189 },
                { theme: 'Vegan materials', count: 156 },
              ].map((item, idx) => (
                <div
                  key={idx}
                  className="border border-gray-200 rounded-lg p-4 bg-gray-50 hover:bg-gray-100 transition-colors"
                >
                  <p className="font-medium text-foreground mb-1">{item.theme}</p>
                  <p className="text-2xl font-display font-bold text-violet-600">
                    {item.count}
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Traffic Sources */}
        <div>
          <Card className="bg-white border-gray-200">
            <CardHeader>
              <CardTitle className="font-display text-base">Traffic Sources</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {[
                { source: 'Direct', percent: 45 },
                { source: 'Social', percent: 30 },
                { source: 'Search', percent: 15 },
                { source: 'Referral', percent: 10 },
              ].map((item, idx) => (
                <div key={idx}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium text-gray-700">{item.source}</span>
                    <span className="text-xs font-semibold text-foreground">{item.percent}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-lime-600 h-2 rounded-full"
                      style={{ width: `${item.percent}%` }}
                    />
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Milestone Timeline */}
      <Card className="bg-white border-gray-200">
        <CardHeader>
          <CardTitle className="font-display">Milestone Timeline</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4 overflow-x-auto pb-4">
            {[
              { milestone: '100', completed: true },
              { milestone: '500', completed: true },
              { milestone: '1K', completed: true },
              { milestone: '5K', completed: false },
              { milestone: '10K', completed: false },
            ].map((item, idx) => (
              <div
                key={idx}
                className="flex flex-col items-center gap-2 flex-shrink-0"
              >
                <div
                  className={`w-12 h-12 rounded-full flex items-center justify-center font-display font-bold text-white ${
                    item.completed ? 'bg-green-600' : 'bg-gray-300'
                  }`}
                >
                  {item.completed ? '✓' : '◯'}
                </div>
                <p className="text-xs font-medium text-gray-600 text-center">{item.milestone}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </DashboardLayout>
  )
}
