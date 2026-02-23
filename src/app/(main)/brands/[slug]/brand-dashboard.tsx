'use client'

import React, { useMemo } from 'react'
import Link from 'next/link'
import { Navbar } from '@/components/shared/navbar'
import { Footer } from '@/components/shared/footer'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { ResponsiveCampaignCard } from '@/components/shared/responsive-campaign-card'
import { cn, formatNumber } from '@/lib/utils'
import {
  BarChart3,
  TrendingUp,
  Users,
  Target,
  ArrowRight,
  Globe,
} from 'lucide-react'

interface BrandDashboardProps {
  brand: {
    id: string
    name: string
    slug: string
    website?: string | null
    logo?: string | null
    description?: string | null
    status: string
    responsivenessScore?: number | null
    campaigns: Array<{
      id: string
      title: string
      slug: string
      description: string
      category: string
      status: string
      createdAt: Date
      creator: {
        id: string
        displayName: string
        handle?: string | null
        avatar?: string | null
        email: string
      }
      media: Array<{
        url: string
      }>
      _count: {
        lobbies: number
        follows: number
      }
    }>
  }
}

export default function BrandDashboard({ brand }: BrandDashboardProps) {
  // Calculate aggregate stats
  const stats = useMemo(() => {
    const totalLobbies = brand.campaigns.reduce(
      (sum, campaign) => sum + campaign._count.lobbies,
      0
    )
    const totalFollows = brand.campaigns.reduce(
      (sum, campaign) => sum + campaign._count.follows,
      0
    )
    const activeCampaigns = brand.campaigns.filter(
      (c) => c.status === 'LIVE'
    ).length

    return {
      totalCampaigns: brand.campaigns.length,
      activeCampaigns,
      totalLobbies,
      totalFollows,
      estimatedDemand: totalLobbies,
    }
  }, [brand.campaigns])

  // Map campaign status to display variant
  const getCampaignStatus = (status: string) => {
    switch (status) {
      case 'LIVE':
        return 'active'
      case 'DRAFT':
        return 'draft'
      case 'PAUSED':
        return 'paused'
      case 'COMPLETED':
        return 'completed'
      default:
        return 'active'
    }
  }

  // Calculate completeness score (simplified based on data available)
  const getCompletenessScore = (campaign: any) => {
    let score = 0
    if (campaign.title) score += 20
    if (campaign.description && campaign.description.length > 50) score += 20
    if (campaign.media.length > 0) score += 20
    if (campaign._count.lobbies > 0) score += 20
    if (campaign.creator) score += 20
    return Math.min(100, score)
  }

  const statusColor = brand.status === 'VERIFIED'
    ? 'bg-green-100 text-green-800'
    : brand.status === 'CLAIMED'
      ? 'bg-blue-100 text-blue-800'
      : 'bg-gray-100 text-gray-800'

  return (
    <div className="min-h-screen bg-[#FAFAFA] flex flex-col">
      <Navbar />

      <main className="flex-1">
        {/* Brand Hero Section */}
        <section className="bg-white border-b border-gray-200">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6 mb-6">
              {/* Brand Logo/Avatar */}
              <div className="text-6xl">
                {brand.logo ? (
                  <img
                    src={brand.logo}
                    alt={brand.name}
                    className="w-24 h-24 rounded-lg object-cover"
                  />
                ) : (
                  <div className="w-24 h-24 bg-gradient-to-br from-violet-100 to-violet-200 rounded-lg flex items-center justify-center text-4xl font-bold text-violet-600">
                    {brand.name.charAt(0)}
                  </div>
                )}
              </div>

              {/* Brand Info */}
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h1 className="text-4xl font-display font-bold text-gray-900">
                    {brand.name}
                  </h1>
                  <Badge className={`${statusColor}`}>
                    {brand.status === 'VERIFIED'
                      ? '✓ Verified'
                      : brand.status === 'CLAIMED'
                        ? 'Claimed'
                        : 'Unclaimed'}
                  </Badge>
                </div>
                {brand.description && (
                  <p className="text-gray-600 text-lg mb-4">{brand.description}</p>
                )}
                {brand.website && (
                  <a
                    href={brand.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-violet-600 hover:text-violet-700 font-semibold"
                  >
                    <Globe className="w-4 h-4" />
                    Visit Website
                    <ArrowRight className="w-4 h-4" />
                  </a>
                )}
              </div>

              {/* Responsiveness Score Card */}
              {brand.responsivenessScore !== null && (
                <div className="bg-gradient-to-br from-violet-50 to-violet-100 p-6 rounded-lg border border-violet-200 text-center min-w-fit">
                  <p className="text-sm text-gray-600 mb-1">Responsiveness</p>
                  <p className="text-4xl font-bold text-violet-600 mb-1">
                    {Math.round(brand.responsivenessScore)}%
                  </p>
                  <p className="text-xs text-gray-600">Response Rate</p>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* Summary Stats Section */}
        <section className="bg-white border-b border-gray-200">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <div className="text-center">
                <div className="flex justify-center mb-2">
                  <Target className="w-6 h-6 text-violet-600" />
                </div>
                <p className="text-3xl font-bold text-gray-900 mb-1">
                  {stats.totalCampaigns}
                </p>
                <p className="text-sm text-gray-600">Total Campaigns</p>
              </div>

              <div className="text-center">
                <div className="flex justify-center mb-2">
                  <TrendingUp className="w-6 h-6 text-lime-500" />
                </div>
                <p className="text-3xl font-bold text-gray-900 mb-1">
                  {stats.activeCampaigns}
                </p>
                <p className="text-sm text-gray-600">Active Campaigns</p>
              </div>

              <div className="text-center">
                <div className="flex justify-center mb-2">
                  <Users className="w-6 h-6 text-blue-600" />
                </div>
                <p className="text-3xl font-bold text-gray-900 mb-1">
                  {formatNumber(stats.totalLobbies)}
                </p>
                <p className="text-sm text-gray-600">Total Lobbies</p>
              </div>

              <div className="text-center">
                <div className="flex justify-center mb-2">
                  <BarChart3 className="w-6 h-6 text-green-600" />
                </div>
                <p className="text-3xl font-bold text-gray-900 mb-1">
                  {formatNumber(stats.estimatedDemand)}
                </p>
                <p className="text-sm text-gray-600">Demand Signal</p>
              </div>
            </div>
          </div>
        </section>

        {/* Campaigns Section */}
        <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Campaigns Targeting {brand.name}
            </h2>
            <p className="text-gray-600">
              {brand.campaigns.length} campaign
              {brand.campaigns.length !== 1 ? 's' : ''} created by the community
            </p>
          </div>

          {brand.campaigns.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <p className="text-gray-600 mb-4">
                  No campaigns for {brand.name} yet.
                </p>
                <Link href="/campaigns/new">
                  <Button className="bg-violet-600 hover:bg-violet-700 text-white">
                    Start the First Campaign
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {brand.campaigns.map((campaign) => (
                <ResponsiveCampaignCard
                  key={campaign.id}
                  id={campaign.id}
                  title={campaign.title}
                  slug={campaign.slug}
                  description={campaign.description}
                  category={campaign.category}
                  image={campaign.media[0]?.url}
                  lobbyCount={campaign._count.lobbies}
                  signalScore={campaign._count.lobbies}
                  completenessScore={getCompletenessScore(campaign)}
                  status={getCampaignStatus(campaign.status)}
                  creator={campaign.creator}
                  brand={{ id: brand.id, name: brand.name, logo: brand.logo || undefined }}
                  createdAt={campaign.createdAt.toISOString()}
                />
              ))}
            </div>
          )}
        </section>

        {/* Demand Signal Visualization Section */}
        {brand.campaigns.length > 0 && (
          <section className="bg-white border-t border-gray-200 py-12">
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-8">
                Demand Signal Overview
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                {/* Top Campaigns by Lobbies */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <TrendingUp className="w-5 h-5 text-violet-600" />
                      Top Campaigns by Support
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {brand.campaigns
                        .sort(
                          (a, b) => b._count.lobbies - a._count.lobbies
                        )
                        .slice(0, 5)
                        .map((campaign) => (
                          <Link
                            key={campaign.id}
                            href={`/campaigns/${campaign.slug}`}
                            className="block group"
                          >
                            <div className="flex items-between justify-between gap-4 p-3 rounded-lg hover:bg-gray-50 transition-colors">
                              <div className="flex-1 min-w-0">
                                <h3 className="font-semibold text-sm text-gray-900 group-hover:text-violet-600 truncate">
                                  {campaign.title}
                                </h3>
                                <p className="text-xs text-gray-500 mt-1">
                                  {campaign.category}
                                </p>
                              </div>
                              <div className="text-right flex-shrink-0">
                                <p className="font-bold text-lg text-violet-600">
                                  {campaign._count.lobbies}
                                </p>
                                <p className="text-xs text-gray-500">lobbies</p>
                              </div>
                            </div>
                          </Link>
                        ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Campaign Status Distribution */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <BarChart3 className="w-5 h-5 text-violet-600" />
                      Campaign Status
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {[
                        {
                          status: 'LIVE',
                          label: 'Active',
                          count: brand.campaigns.filter((c) => c.status === 'LIVE')
                            .length,
                          color: 'bg-green-100 text-green-800',
                        },
                        {
                          status: 'DRAFT',
                          label: 'Draft',
                          count: brand.campaigns.filter((c) => c.status === 'DRAFT')
                            .length,
                          color: 'bg-gray-100 text-gray-800',
                        },
                        {
                          status: 'COMPLETED',
                          label: 'Completed',
                          count: brand.campaigns.filter(
                            (c) => c.status === 'COMPLETED'
                          ).length,
                          color: 'bg-blue-100 text-blue-800',
                        },
                        {
                          status: 'PAUSED',
                          label: 'Paused',
                          count: brand.campaigns.filter((c) => c.status === 'PAUSED')
                            .length,
                          color: 'bg-yellow-100 text-yellow-800',
                        },
                      ]
                        .filter((s) => s.count > 0)
                        .map((status) => (
                          <div key={status.status} className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <div className={`w-3 h-3 rounded-full ${status.color}`}></div>
                              <span className="text-sm font-medium text-gray-700">
                                {status.label}
                              </span>
                            </div>
                            <span className={`px-3 py-1 rounded-full text-sm font-semibold ${status.color}`}>
                              {status.count}
                            </span>
                          </div>
                        ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </section>
        )}

        {/* CTA Section */}
        <section className="bg-white border-t border-gray-200 py-12">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-3xl font-display font-bold text-gray-900 mb-3">
              Have an Idea for {brand.name}?
            </h2>
            <p className="text-lg text-gray-600 mb-6">
              Start a campaign and help shape their next product
            </p>
            <Link href={`/campaigns/new?brand=${brand.slug}`}>
              <Button className="bg-violet-600 hover:bg-violet-700 text-white px-8 py-3 text-base">
                Start a Campaign
              </Button>
            </Link>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}
