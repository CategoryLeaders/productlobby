'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import {
  Globe,
  TrendingUp,
  CheckCircle,
  Users,
  Package,
  Calendar,
  ArrowRight,
} from 'lucide-react'
import { Navbar } from '@/components/shared/navbar'
import { Footer } from '@/components/shared/footer'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { cn, formatDate, formatNumber } from '@/lib/utils'

interface BrandPageProps {
  params: {
    slug: string
  }
}

// Demo brand data
const BRANDS: Record<string, any> = {
  nike: {
    name: 'Nike',
    logo: '🔵',
    website: 'https://nike.com',
    description: 'Just do it. Nike creates innovative sports products.',
    responseRate: 67,
    respondedAt: '2025-12-02',
    campaignCount: 15,
    audienceSize: 24891,
    productsShipped: 2,
    score: 8.2,
    status: 'responsive',
    campaigns: [
      {
        id: 1,
        title: "Women's Running Shoes in Extended Sizes",
        lobbies: 2847,
        status: 'success',
        date: '2025-10-15',
        slug: 'nike-womens-running-shoes-extended-sizes',
      },
      {
        id: 2,
        title: 'Sustainable Running Shoe Collection',
        lobbies: 1456,
        status: 'in-progress',
        date: '2025-11-20',
        slug: 'nike-sustainable-running-collection',
      },
      {
        id: 3,
        title: 'Custom Fit Technology for All',
        lobbies: 892,
        status: 'in-progress',
        date: '2025-12-05',
        slug: 'nike-custom-fit-technology',
      },
      {
        id: 4,
        title: 'Extended Color Options',
        lobbies: 654,
        status: 'pending',
        date: '2026-01-10',
        slug: 'nike-extended-colors',
      },
    ],
    activity: [
      {
        date: '2026-01-28',
        action: "Responded to 'Extended Sizes'",
        type: 'response',
      },
      {
        date: '2025-12-02',
        action: "Selected Path B for 'Extended Sizes'",
        type: 'selection',
      },
      {
        date: '2025-11-28',
        action: "Viewed 'Sustainable Collection'",
        type: 'view',
      },
      {
        date: '2025-11-15',
        action: "Responded to 'Custom Fit Technology'",
        type: 'response',
      },
      {
        date: '2025-10-20',
        action: "Viewed 'Extended Sizes'",
        type: 'view',
      },
    ],
  },
  patagonia: {
    name: 'Patagonia',
    logo: '🏔️',
    website: 'https://patagonia.com',
    description: 'We\'re in business to save our home planet.',
    responseRate: 92,
    respondedAt: '2025-11-15',
    campaignCount: 12,
    audienceSize: 18234,
    productsShipped: 3,
    score: 9.4,
    status: 'responsive',
    campaigns: [
      {
        id: 1,
        title: 'Fully Recyclable Packaging',
        lobbies: 3421,
        status: 'success',
        date: '2025-09-01',
        slug: 'patagonia-recyclable-packaging',
      },
      {
        id: 2,
        title: 'Carbon Negative Shipping',
        lobbies: 2156,
        status: 'success',
        date: '2025-10-10',
        slug: 'patagonia-carbon-negative-shipping',
      },
      {
        id: 3,
        title: 'Sustainable Dye Technology',
        lobbies: 1834,
        status: 'in-progress',
        date: '2025-11-20',
        slug: 'patagonia-sustainable-dyes',
      },
    ],
    activity: [
      {
        date: '2026-01-15',
        action: "Responded to 'Sustainable Dyes'",
        type: 'response',
      },
      {
        date: '2025-12-28',
        action: "Selected Path A for 'Carbon Negative Shipping'",
        type: 'selection',
      },
      {
        date: '2025-11-15',
        action: "Viewed all active campaigns",
        type: 'view',
      },
    ],
  },
  allbirds: {
    name: 'Allbirds',
    logo: '🌳',
    website: 'https://allbirds.com',
    description: 'Sustainable footwear made from natural materials.',
    responseRate: 85,
    respondedAt: '2025-12-10',
    campaignCount: 9,
    audienceSize: 14567,
    productsShipped: 2,
    score: 8.8,
    status: 'responsive',
    campaigns: [
      {
        id: 1,
        title: 'Carbon Negative Materials',
        lobbies: 2567,
        status: 'success',
        date: '2025-09-15',
        slug: 'allbirds-carbon-negative',
      },
      {
        id: 2,
        title: 'Extended Size Range',
        lobbies: 1923,
        status: 'in-progress',
        date: '2025-10-25',
        slug: 'allbirds-extended-sizes',
      },
    ],
    activity: [
      {
        date: '2025-12-10',
        action: "Selected Path B for 'Carbon Negative'",
        type: 'selection',
      },
      {
        date: '2025-11-20',
        action: "Viewed 'Extended Size Range'",
        type: 'view',
      },
    ],
  },
}

export default function BrandPage({ params }: BrandPageProps) {
  const brand = BRANDS[params.slug] || BRANDS.nike
  const [activeTab, setActiveTab] = useState('campaigns')

  return (
    <div className="min-h-screen bg-[#FAFAFA] flex flex-col">
      <Navbar />

      <main className="flex-1">
        {/* Brand Header */}
        <section className="bg-white border-b border-gray-200">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6 mb-6">
              <div className="text-6xl">{brand.logo}</div>
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h1 className="text-4xl font-display font-bold text-gray-900">{brand.name}</h1>
                  {brand.status === 'responsive' ? (
                    <Badge className="bg-green-600 hover:bg-green-700">
                      ✓ Responsive
                    </Badge>
                  ) : (
                    <Badge variant="destructive" className="bg-red-600 hover:bg-red-700">
                      Unresponsive
                    </Badge>
                  )}
                </div>
                <p className="text-gray-600 text-lg mb-4">{brand.description}</p>
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
              </div>

              {/* Score Card */}
              <div className="bg-gradient-to-br from-violet-50 to-violet-100 p-6 rounded-lg border border-violet-200 text-center min-w-fit">
                <p className="text-sm text-gray-600 mb-1">Brand Score</p>
                <p className="text-4xl font-bold text-violet-600 mb-1">{brand.score.toFixed(1)}</p>
                <p className="text-xs text-gray-600">/10</p>
              </div>
            </div>
          </div>
        </section>

        {/* Stats Section */}
        <section className="bg-white border-b border-gray-200">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <div className="text-center">
                <p className="text-3xl font-bold text-gray-900 mb-1">
                  {formatNumber(brand.campaignCount)}
                </p>
                <p className="text-sm text-gray-600">Campaigns</p>
              </div>
              <div className="text-center">
                <p className="text-3xl font-bold text-gray-900 mb-1">
                  {formatNumber(brand.audienceSize)}
                </p>
                <p className="text-sm text-gray-600">Total Audience</p>
              </div>
              <div className="text-center">
                <p className="text-3xl font-bold text-gray-900 mb-1">{brand.responseRate}%</p>
                <p className="text-sm text-gray-600">Response Rate</p>
              </div>
              <div className="text-center">
                <p className="text-3xl font-bold text-gray-900 mb-1">{brand.productsShipped}</p>
                <p className="text-sm text-gray-600">Products Shipped</p>
              </div>
            </div>
          </div>
        </section>

        {/* Tabs */}
        <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <Tabs defaultValue="campaigns" className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-8">
              <TabsTrigger value="campaigns" className="text-base">
                Campaigns ({brand.campaigns.length})
              </TabsTrigger>
              <TabsTrigger value="activity" className="text-base">
                Activity
              </TabsTrigger>
            </TabsList>

            {/* Campaigns Tab */}
            <TabsContent value="campaigns" className="space-y-4">
              {brand.campaigns.length === 0 ? (
                <Card>
                  <CardContent className="p-8 text-center">
                    <p className="text-gray-600">No campaigns for this brand yet.</p>
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-4">
                  {brand.campaigns.map((campaign: any) => (
                    <Link key={campaign.id} href={`/campaigns/${campaign.slug}`}>
                      <Card className="hover:shadow-lg transition-shadow cursor-pointer bg-white group">
                        <CardContent className="p-6 flex items-center justify-between">
                          <div className="flex-1">
                            <h3 className="text-lg font-semibold text-gray-900 group-hover:text-violet-600 transition-colors mb-2">
                              {campaign.title}
                            </h3>
                            <p className="text-sm text-gray-600 flex items-center gap-4">
                              <span className="flex items-center gap-1">
                                <Users className="w-4 h-4" />
                                {formatNumber(campaign.lobbies)} lobbies
                              </span>
                              <span className="flex items-center gap-1">
                                <Calendar className="w-4 h-4" />
                                {formatDate(campaign.date)}
                              </span>
                            </p>
                          </div>
                          <div className="flex items-center gap-4">
                            {campaign.status === 'success' && (
                              <Badge className="bg-green-600 hover:bg-green-700">
                                ✓ Success
                              </Badge>
                            )}
                            {campaign.status === 'in-progress' && (
                              <Badge className="bg-blue-600 hover:bg-blue-700">
                                In Progress
                              </Badge>
                            )}
                            {campaign.status === 'pending' && (
                              <Badge variant="secondary" className="bg-gray-100 text-gray-800">
                                Pending
                              </Badge>
                            )}
                            <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-violet-600 transition-colors" />
                          </div>
                        </CardContent>
                      </Card>
                    </Link>
                  ))}
                </div>
              )}
            </TabsContent>

            {/* Activity Tab */}
            <TabsContent value="activity" className="space-y-3">
              {brand.activity.length === 0 ? (
                <Card>
                  <CardContent className="p-8 text-center">
                    <p className="text-gray-600">No activity yet.</p>
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-3">
                  {brand.activity.map((item: any, idx: number) => (
                    <div
                      key={idx}
                      className="flex gap-4 p-4 border border-gray-200 rounded-lg bg-white hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex-shrink-0">
                        {item.type === 'response' && (
                          <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                            <CheckCircle className="w-6 h-6 text-green-600" />
                          </div>
                        )}
                        {item.type === 'selection' && (
                          <div className="w-10 h-10 rounded-full bg-violet-100 flex items-center justify-center">
                            <Zap className="w-6 h-6 text-violet-600" />
                          </div>
                        )}
                        {item.type === 'view' && (
                          <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                            <TrendingUp className="w-6 h-6 text-blue-600" />
                          </div>
                        )}
                      </div>
                      <div className="flex-1">
                        <p className="font-semibold text-gray-900">{item.action}</p>
                        <p className="text-sm text-gray-500">{formatDate(item.date)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </section>

        {/* CTA Section */}
        <section className="bg-white border-t border-gray-200 py-12">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-3xl font-display font-bold text-gray-900 mb-3">
              Have an Idea for {brand.name}?
            </h2>
            <p className="text-lg text-gray-600 mb-6">
              Start a campaign and help shape their next product
            </p>
            <Link href="/campaigns/new">
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

// Add Zap icon from lucide-react if not imported
import { Zap } from 'lucide-react'
