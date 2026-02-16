'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { DashboardLayout } from '@/components/shared/dashboard-layout'
import { PageHeader } from '@/components/shared/page-header'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { X } from 'lucide-react'
import { cn } from '@/lib/utils'

interface Campaign {
  id: string
  slug: string
  title: string
  lobbyCount: number
  status: 'Live' | 'Draft' | 'Paused'
  completeness: number
  intensityBreakdown: {
    green: number
    yellow: number
    purple: number
  }
}

const campaigns: Campaign[] = [
  {
    id: '1',
    slug: 'nike-womens-running-shoes-extended-sizes',
    title: "Nike Women's Running Shoes in Extended Sizes",
    lobbyCount: 2847,
    status: 'Live',
    completeness: 85,
    intensityBreakdown: { green: 35, yellow: 40, purple: 25 },
  },
  {
    id: '2',
    slug: 'portable-air-purifier-hepa-filter',
    title: 'Portable Air Purifier with HEPA Filter',
    lobbyCount: 312,
    status: 'Live',
    completeness: 62,
    intensityBreakdown: { green: 20, yellow: 45, purple: 35 },
  },
  {
    id: '3',
    slug: 'dyson-silent-fan-app-control',
    title: 'Dyson Silent Fan with App Control',
    lobbyCount: 88,
    status: 'Draft',
    completeness: 45,
    intensityBreakdown: { green: 15, yellow: 50, purple: 35 },
  },
]

const getStatusColor = (status: string) => {
  switch (status) {
    case 'Live':
      return 'lime'
    case 'Draft':
      return 'gray'
    case 'Paused':
      return 'yellow'
    default:
      return 'default'
  }
}

export default function CreatorDashboard() {
  const [showTip, setShowTip] = useState(true)

  const totalLobbies = campaigns.reduce((sum, c) => sum + c.lobbyCount, 0)

  return (
    <DashboardLayout role="creator">
      <PageHeader
        title="Creator Dashboard"
        actions={
          <Link href="/dashboard/campaigns/new">
            <Button variant="primary" size="lg">
              Create New Campaign
            </Button>
          </Link>
        }
      />

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {/* Total Lobbies */}
        <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-card">
          <div className="flex items-start justify-between mb-2">
            <h3 className="text-sm font-medium text-gray-600">Total Lobbies</h3>
            <Badge variant="lime" size="sm">
              +12%
            </Badge>
          </div>
          <p className="text-3xl font-display font-bold text-foreground">
            {totalLobbies.toLocaleString()}
          </p>
        </div>

        {/* Active Campaigns */}
        <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-card">
          <h3 className="text-sm font-medium text-gray-600 mb-2">Active Campaigns</h3>
          <p className="text-3xl font-display font-bold text-foreground">
            {campaigns.filter(c => c.status === 'Live').length}
          </p>
        </div>

        {/* Avg Completeness */}
        <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-card">
          <h3 className="text-sm font-medium text-gray-600 mb-2">Avg Completeness</h3>
          <p className="text-3xl font-display font-bold text-foreground">
            {Math.round(campaigns.reduce((sum, c) => sum + c.completeness, 0) / campaigns.length)}%
          </p>
        </div>

        {/* Revenue Earned */}
        <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-card">
          <h3 className="text-sm font-medium text-gray-600 mb-2">Revenue Earned</h3>
          <p className="text-3xl font-display font-bold text-foreground">£142.50</p>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* My Campaigns Section */}
        <div className="lg:col-span-2">
          <Card className="bg-white border-gray-200">
            <CardHeader>
              <CardTitle className="font-display">My Campaigns</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {campaigns.map((campaign) => (
                  <div
                    key={campaign.id}
                    className="border border-gray-200 rounded-lg p-4 hover:shadow-card-hover transition-shadow duration-200"
                  >
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-3">
                      <div className="flex-1">
                        <Link
                          href={`/campaigns/${campaign.slug}`}
                          className="font-display font-semibold text-foreground hover:text-violet-600 transition-colors duration-200"
                        >
                          {campaign.title}
                        </Link>
                      </div>
                      <Badge variant={getStatusColor(campaign.status)} size="sm">
                        {campaign.status}
                      </Badge>
                    </div>

                    {/* Lobby Count & Intensity Bar */}
                    <div className="mb-3">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-gray-600">
                          {campaign.lobbyCount.toLocaleString()} lobbies
                        </span>
                        <span className="text-sm text-gray-600">
                          {campaign.completeness}% complete
                        </span>
                      </div>

                      {/* Intensity Mini-Bar */}
                      <div className="flex h-2 rounded-full overflow-hidden bg-gray-200">
                        <div
                          className="bg-green-500"
                          style={{
                            width: `${campaign.intensityBreakdown.green}%`,
                          }}
                        />
                        <div
                          className="bg-yellow-400"
                          style={{
                            width: `${campaign.intensityBreakdown.yellow}%`,
                          }}
                        />
                        <div
                          className="bg-violet-600"
                          style={{
                            width: `${campaign.intensityBreakdown.purple}%`,
                          }}
                        />
                      </div>
                    </div>

                    {/* Completeness Progress */}
                    <Progress value={campaign.completeness} className="mb-3" />

                    {/* Actions */}
                    <div className="flex items-center gap-3">
                      <Link href={`/dashboard/campaigns/${campaign.id}/edit`}>
                        <Button variant="outline" size="sm">
                          Edit
                        </Button>
                      </Link>
                      <Link href={`/dashboard/analytics?campaign=${campaign.id}`}>
                        <Button variant="outline" size="sm">
                          View Analytics
                        </Button>
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          {/* Tips Card */}
          {showTip && (
            <Card className="bg-white border-gray-200">
              <CardHeader className="pb-3 flex flex-row items-start justify-between space-y-0">
                <CardTitle className="font-display text-base">Tips</CardTitle>
                <button
                  onClick={() => setShowTip(false)}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <X size={18} />
                </button>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600 leading-relaxed">
                  Add images to <strong>"Portable Air Purifier"</strong> to boost
                  engagement by <strong>3x</strong>
                </p>
              </CardContent>
            </Card>
          )}

          {/* Quick Links */}
          <Card className="bg-white border-gray-200">
            <CardHeader>
              <CardTitle className="font-display text-base">Quick Links</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Link href="/dashboard/analytics">
                <Button variant="outline" size="sm" className="w-full justify-start">
                  View All Analytics
                </Button>
              </Link>
              <Link href="/dashboard/revenue">
                <Button variant="outline" size="sm" className="w-full justify-start">
                  Revenue Dashboard
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  )
}
