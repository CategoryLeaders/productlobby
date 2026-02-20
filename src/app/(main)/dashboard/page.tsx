'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { DashboardLayout } from '@/components/shared/dashboard-layout'
import { PageHeader } from '@/components/shared/page-header'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { X, Loader2 } from 'lucide-react'
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
  const [campaigns, setCampaigns] = useState<Campaign[]>([])
  const [loading, setLoading] = useState(true)
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null)
  const [showTip, setShowTip] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        // First check if user is authenticated
        const authResponse = await fetch('/api/auth/me')

        if (!authResponse.ok) {
          setIsAuthenticated(false)
          setLoading(false)
          return
        }

        setIsAuthenticated(true)

        // Fetch campaigns
        const campaignsResponse = await fetch('/api/campaigns?status=LIVE')
        if (campaignsResponse.ok) {
          const data = await campaignsResponse.json()
          // Transform API response to match Campaign interface
          const transformedCampaigns: Campaign[] = data.map((campaign: any) => ({
            id: campaign.id,
            slug: campaign.slug,
            title: campaign.title,
            lobbyCount: campaign.lobbyCount || 0,
            status: campaign.status || 'Draft',
            completeness: campaign.completeness || 0,
            intensityBreakdown: campaign.intensityBreakdown || {
              green: 33,
              yellow: 33,
              purple: 34,
            },
          }))
          setCampaigns(transformedCampaigns)
        }
      } catch (error) {
        console.error('Error fetching data:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  if (isAuthenticated === false) {
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
        <div className="flex items-center justify-center min-h-[400px]">
          <Card className="bg-white border-gray-200 max-w-md">
            <CardContent className="p-8 text-center">
              <p className="text-lg text-gray-600 mb-6">
                Sign in to see your dashboard
              </p>
              <Link href="/login">
                <Button variant="primary" size="lg">
                  Sign In
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </DashboardLayout>
    )
  }

  if (loading) {
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
        <div className="flex items-center justify-center min-h-[400px]">
          <Loader2 className="w-8 h-8 animate-spin text-violet-600" />
        </div>
      </DashboardLayout>
    )
  }

  const totalLobbies = campaigns.reduce((sum, c) => sum + c.lobbyCount, 0)
  const activeCampaigns = campaigns.filter(c => c.status === 'Live').length
  const avgCompleteness = campaigns.length > 0
    ? Math.round(campaigns.reduce((sum, c) => sum + c.completeness, 0) / campaigns.length)
    : 0

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
            {activeCampaigns}
          </p>
        </div>

        {/* Avg Completeness */}
        <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-card">
          <h3 className="text-sm font-medium text-gray-600 mb-2">Avg Completeness</h3>
          <p className="text-3xl font-display font-bold text-foreground">
            {avgCompleteness}%
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
              {campaigns.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-gray-500 mb-4">No campaigns yet</p>
                  <Link href="/dashboard/campaigns/new">
                    <Button variant="primary">Create Your First Campaign</Button>
                  </Link>
                </div>
              ) : (
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
              )}
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
                  Add images to your campaigns to boost engagement by up to <strong>3x</strong>
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
