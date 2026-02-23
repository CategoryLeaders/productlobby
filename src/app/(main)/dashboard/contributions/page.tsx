'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { DashboardLayout } from '@/components/shared/dashboard-layout'
import { PageHeader } from '@/components/shared/page-header'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Heart,
  MessageSquare,
  Share2,
  Zap,
  TrendingUp,
  Loader2,
  Megaphone,
} from 'lucide-react'
import { cn, formatNumber } from '@/lib/utils'

interface Contribution {
  id: string
  eventType: string
  points: number
  metadata: any
  createdAt: string
  campaign: {
    id: string
    title: string
    slug: string
    status: string
    targetedBrand: {
      id: string
      name: string
      logo: string | null
    } | null
  }
}

interface ContributionData {
  user: {
    id: string
    displayName: string
    avatar: string | null
    handle: string | null
  }
  summary: {
    totalContributions: number
    totalPoints: number
    campaignsSupported: number
    byType: Record<string, number>
    lobbies: number
    pledges: number
    shares: number
  }
  contributions: Contribution[]
  grouped: Record<string, Contribution[]>
  pagination: {
    skip: number
    take: number
    total: number
    pages: number
    currentPage: number
  }
}

const getEventIcon = (eventType: string) => {
  switch (eventType) {
    case 'PREFERENCE_SUBMITTED':
      return <TrendingUp className="w-4 h-4" />
    case 'COMMENT_ENGAGEMENT':
      return <MessageSquare className="w-4 h-4" />
    case 'SOCIAL_SHARE':
      return <Share2 className="w-4 h-4" />
    case 'BRAND_OUTREACH':
      return <Megaphone className="w-4 h-4" />
    default:
      return <Zap className="w-4 h-4" />
  }
}

const getEventLabel = (eventType: string) => {
  switch (eventType) {
    case 'PREFERENCE_SUBMITTED':
      return 'Preferences Submitted'
    case 'WISHLIST_SUBMITTED':
      return 'Wishlist Added'
    case 'REFERRAL_SIGNUP':
      return 'Referral Signup'
    case 'COMMENT_ENGAGEMENT':
      return 'Comment'
    case 'SOCIAL_SHARE':
      return 'Social Share'
    case 'BRAND_OUTREACH':
      return 'Brand Outreach'
    default:
      return eventType
  }
}

const getEventColor = (eventType: string) => {
  switch (eventType) {
    case 'PREFERENCE_SUBMITTED':
      return 'violet'
    case 'COMMENT_ENGAGEMENT':
      return 'blue'
    case 'SOCIAL_SHARE':
      return 'green'
    case 'BRAND_OUTREACH':
      return 'amber'
    default:
      return 'gray'
  }
}

export default function ContributionsPage() {
  const [data, setData] = useState<ContributionData | null>(null)
  const [loading, setLoading] = useState(true)
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null)
  const [filterType, setFilterType] = useState<string>('all')
  const [groupBy, setGroupBy] = useState<'campaign' | 'type'>('campaign')
  const [currentPage, setCurrentPage] = useState(1)

  useEffect(() => {
    const fetchContributions = async () => {
      try {
        setLoading(true)
        const params = new URLSearchParams({
          skip: ((currentPage - 1) * 20).toString(),
          take: '20',
        })

        if (filterType !== 'all') {
          params.append('type', filterType)
        }

        const response = await fetch(`/api/user/contributions?${params}`)

        if (response.status === 401) {
          setIsAuthenticated(false)
          return
        }

        if (!response.ok) {
          throw new Error('Failed to load contributions')
        }

        setIsAuthenticated(true)
        const contributionData = await response.json()
        setData(contributionData.data)
      } catch (error) {
        console.error('Error fetching contributions:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchContributions()
  }, [filterType, currentPage])

  if (isAuthenticated === false) {
    return (
      <DashboardLayout role="supporter">
        <PageHeader title="My Contributions" />
        <div className="flex items-center justify-center min-h-[400px]">
          <Card className="bg-white border-gray-200 max-w-md">
            <CardContent className="p-8 text-center">
              <Heart className="w-12 h-12 text-violet-600 mx-auto mb-4" />
              <p className="text-lg font-medium text-gray-900 mb-2">
                Welcome to Contributions
              </p>
              <p className="text-gray-600 mb-6">
                Sign in to see your lobbies, pledges, and other contributions
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

  if (loading || !data) {
    return (
      <DashboardLayout role="supporter">
        <PageHeader title="My Contributions" />
        <div className="flex items-center justify-center min-h-[400px]">
          <Loader2 className="w-8 h-8 animate-spin text-violet-600" />
        </div>
      </DashboardLayout>
    )
  }

  const { summary, contributions } = data

  // Group contributions by campaign
  const groupedByCampaign = contributions.reduce(
    (acc, contribution) => {
      const key = contribution.campaign.slug
      if (!acc[key]) {
        acc[key] = {
          campaign: contribution.campaign,
          contributions: [],
        }
      }
      acc[key].contributions.push(contribution)
      return acc
    },
    {} as Record<
      string,
      {
        campaign: Contribution['campaign']
        contributions: Contribution[]
      }
    >
  )

  // Group contributions by type
  const groupedByType = contributions.reduce(
    (acc, contribution) => {
      const key = contribution.eventType
      if (!acc[key]) {
        acc[key] = {
          type: key,
          contributions: [],
        }
      }
      acc[key].contributions.push(contribution)
      return acc
    },
    {} as Record<
      string,
      {
        type: string
        contributions: Contribution[]
      }
    >
  )

  return (
    <DashboardLayout role="supporter">
      <PageHeader title="My Contributions" />

      {/* Summary Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white border border-gray-200 rounded-lg p-5 shadow-card">
          <div className="flex items-center gap-2 mb-2">
            <Zap className="w-4 h-4 text-yellow-500" />
            <h3 className="text-sm font-medium text-gray-600">Total Points</h3>
          </div>
          <p className="text-2xl font-display font-bold text-foreground">
            {summary.totalPoints}
          </p>
          <p className="text-xs text-gray-500 mt-1">
            {summary.totalContributions} contributions
          </p>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-5 shadow-card">
          <div className="flex items-center gap-2 mb-2">
            <Megaphone className="w-4 h-4 text-violet-600" />
            <h3 className="text-sm font-medium text-gray-600">Campaigns</h3>
          </div>
          <p className="text-2xl font-display font-bold text-foreground">
            {summary.campaignsSupported}
          </p>
          <p className="text-xs text-gray-500 mt-1">supported</p>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-5 shadow-card">
          <div className="flex items-center gap-2 mb-2">
            <Heart className="w-4 h-4 text-pink-600" />
            <h3 className="text-sm font-medium text-gray-600">Lobbies</h3>
          </div>
          <p className="text-2xl font-display font-bold text-foreground">
            {summary.lobbies}
          </p>
          <p className="text-xs text-gray-500 mt-1">sent</p>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-5 shadow-card">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="w-4 h-4 text-green-600" />
            <h3 className="text-sm font-medium text-gray-600">Pledges</h3>
          </div>
          <p className="text-2xl font-display font-bold text-foreground">
            {summary.pledges}
          </p>
          <p className="text-xs text-gray-500 mt-1">made</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white border border-gray-200 rounded-lg p-4 mb-6">
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Filter by Type
            </label>
            <select
              value={filterType}
              onChange={(e) => {
                setFilterType(e.target.value)
                setCurrentPage(1)
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
            >
              <option value="all">All Types</option>
              <option value="PREFERENCE_SUBMITTED">Preferences</option>
              <option value="COMMENT_ENGAGEMENT">Comments</option>
              <option value="SOCIAL_SHARE">Shares</option>
              <option value="BRAND_OUTREACH">Outreach</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Group by
            </label>
            <select
              value={groupBy}
              onChange={(e) =>
                setGroupBy(e.target.value as 'campaign' | 'type')
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
            >
              <option value="campaign">Campaign</option>
              <option value="type">Type</option>
            </select>
          </div>
        </div>
      </div>

      {/* Contributions List */}
      {contributions.length === 0 ? (
        <Card className="bg-white border-gray-200">
          <CardContent className="p-8 text-center">
            <Heart className="w-10 h-10 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 mb-4">
              You haven't made any contributions yet
            </p>
            <Link href="/campaigns">
              <Button variant="primary">Browse Campaigns</Button>
            </Link>
          </CardContent>
        </Card>
      ) : groupBy === 'campaign' ? (
        // Group by Campaign
        <div className="space-y-6">
          {Object.values(groupedByCampaign).map((group) => (
            <Card
              key={group.campaign.slug}
              className="bg-white border-gray-200 hover:shadow-card-hover transition-shadow"
            >
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <Link
                      href={`/campaigns/${group.campaign.slug}`}
                      className="font-display font-semibold text-foreground hover:text-violet-600 transition-colors"
                    >
                      {group.campaign.title}
                    </Link>
                    {group.campaign.targetedBrand && (
                      <p className="text-sm text-gray-500 mt-1">
                        → {group.campaign.targetedBrand.name}
                      </p>
                    )}
                  </div>
                  <Badge variant="default" size="sm">
                    {group.campaign.status}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {group.contributions.map((contribution) => (
                    <div
                      key={contribution.id}
                      className="flex items-center justify-between py-2 border-t border-gray-100 first:border-t-0 first:pt-0"
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={cn(
                            'w-8 h-8 rounded-full flex items-center justify-center',
                            {
                              'bg-violet-100 text-violet-600':
                                getEventColor(contribution.eventType) ===
                                'violet',
                              'bg-blue-100 text-blue-600':
                                getEventColor(contribution.eventType) === 'blue',
                              'bg-green-100 text-green-600':
                                getEventColor(contribution.eventType) ===
                                'green',
                              'bg-amber-100 text-amber-600':
                                getEventColor(contribution.eventType) ===
                                'amber',
                              'bg-gray-100 text-gray-600':
                                getEventColor(contribution.eventType) === 'gray',
                            }
                          )}
                        >
                          {getEventIcon(contribution.eventType)}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900">
                            {getEventLabel(contribution.eventType)}
                          </p>
                          <p className="text-xs text-gray-500">
                            {new Date(contribution.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-bold text-yellow-600">
                          +{contribution.points}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        // Group by Type
        <div className="space-y-6">
          {Object.values(groupedByType).map((group) => (
            <Card
              key={group.type}
              className="bg-white border-gray-200 hover:shadow-card-hover transition-shadow"
            >
              <CardHeader className="pb-3">
                <div className="flex items-center gap-2">
                  <div
                    className={cn(
                      'w-8 h-8 rounded-full flex items-center justify-center',
                      {
                        'bg-violet-100 text-violet-600':
                          getEventColor(group.type) === 'violet',
                        'bg-blue-100 text-blue-600':
                          getEventColor(group.type) === 'blue',
                        'bg-green-100 text-green-600':
                          getEventColor(group.type) === 'green',
                        'bg-amber-100 text-amber-600':
                          getEventColor(group.type) === 'amber',
                        'bg-gray-100 text-gray-600': getEventColor(group.type) === 'gray',
                      }
                    )}
                  >
                    {getEventIcon(group.type)}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-display font-semibold text-foreground">
                      {getEventLabel(group.type)}
                    </h3>
                  </div>
                  <span className="text-sm text-gray-500">
                    {group.contributions.length} contribution
                    {group.contributions.length !== 1 ? 's' : ''}
                  </span>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {group.contributions.map((contribution) => (
                    <div
                      key={contribution.id}
                      className="flex items-center justify-between py-2 border-t border-gray-100 first:border-t-0 first:pt-0"
                    >
                      <div className="flex-1 min-w-0">
                        <Link
                          href={`/campaigns/${contribution.campaign.slug}`}
                          className="text-sm font-medium text-violet-600 hover:text-violet-700 line-clamp-1"
                        >
                          {contribution.campaign.title}
                        </Link>
                        <p className="text-xs text-gray-500 mt-0.5">
                          {new Date(contribution.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="text-right ml-2">
                        <p className="text-sm font-bold text-yellow-600">
                          +{contribution.points}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Pagination */}
      {data.pagination.pages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-8">
          <Button
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            variant="outline"
            size="sm"
          >
            Previous
          </Button>
          <div className="flex items-center gap-1">
            {Array.from({ length: data.pagination.pages }, (_, i) => i + 1).map(
              (page) => (
                <button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  className={cn(
                    'w-8 h-8 rounded-md text-sm font-medium transition-colors',
                    page === currentPage
                      ? 'bg-violet-600 text-white'
                      : 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-50'
                  )}
                >
                  {page}
                </button>
              )
            )}
          </div>
          <Button
            onClick={() =>
              setCurrentPage((p) =>
                Math.min(data.pagination.pages, p + 1)
              )
            }
            disabled={currentPage === data.pagination.pages}
            variant="outline"
            size="sm"
          >
            Next
          </Button>
        </div>
      )}
    </DashboardLayout>
  )
}
