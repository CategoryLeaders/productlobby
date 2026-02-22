'use client'

import React, { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { Navbar } from '@/components/shared/navbar'
import { Footer } from '@/components/shared/footer'
import { PageHeader } from '@/components/shared/page-header'
import { TrendingCampaigns } from '@/components/shared/trending-campaigns'
import { CampaignRecommendations } from '@/components/shared/campaign-recommendations'
import { Button } from '@/components/ui/button'
import { Loader2, ArrowRight } from 'lucide-react'
import type { TrendingCampaignProps } from '@/components/shared/trending-campaigns'
import type { CampaignRecommendationCardProps } from '@/components/shared/campaign-recommendations'

const CATEGORIES = [
  { value: 'TECH', label: 'Tech' },
  { value: 'FASHION', label: 'Fashion' },
  { value: 'FOOD_DRINK', label: 'Food & Drink' },
  { value: 'HOME', label: 'Home' },
  { value: 'SPORTS', label: 'Sports' },
  { value: 'BEAUTY', label: 'Beauty' },
  { value: 'TRANSPORT', label: 'Transport' },
  { value: 'OTHER', label: 'Other' },
]

interface TrendingResponse {
  success: boolean
  data: Array<{
    id: string
    title: string
    slug: string
    category: string
    signalScore: number | null
    image: string | null
    lobbyCount: number
    trendPercentage: number
  }>
}

interface RecommendationResponse {
  success: boolean
  data: Array<{
    id: string
    title: string
    slug: string
    category: string
    signalScore: number | null
    media: Array<{ url: string }>
    _count: { lobbies: number }
  }>
}

interface CategoryCampaignsResponse {
  success: boolean
  data: {
    items: Array<{
      id: string
      title: string
      slug: string
      description: string
      category: string
      signalScore: number | null
      media: Array<{ url: string }>
      _count: { lobbies: number }
      creator: { displayName: string; avatar: string | null }
      targetedBrand: { name: string; logo: string | null } | null
    }>
  }
}

export default function ExplorePage() {
  const [trendingCampaigns, setTrendingCampaigns] = useState<TrendingCampaignProps[]>([])
  const [trendingLoading, setTrendingLoading] = useState(true)
  const [newAndNoteworthy, setNewAndNoteworthy] = useState<CampaignRecommendationCardProps[]>([])
  const [newLoading, setNewLoading] = useState(true)
  const [personalizedCampaigns, setPersonalizedCampaigns] = useState<CampaignRecommendationCardProps[]>([])
  const [personalizedLoading, setPersonalizedLoading] = useState(false)
  const [categoryCampaigns, setCategoryCampaigns] = useState<{
    [key: string]: CampaignRecommendationCardProps[]
  }>({})
  const [categoryLoading, setCategoryLoading] = useState<{ [key: string]: boolean }>({})

  const fetchTrendingCampaigns = useCallback(async () => {
    try {
      setTrendingLoading(true)
      const response = await fetch('/api/campaigns/trending?limit=8')
      const data: TrendingResponse = await response.json()

      if (data.success && Array.isArray(data.data)) {
        setTrendingCampaigns(
          data.data.map((campaign) => ({
            id: campaign.id,
            title: campaign.title,
            slug: campaign.slug,
            category: campaign.category,
            signalScore: campaign.signalScore,
            image: campaign.image,
            lobbyCount: campaign.lobbyCount,
            trendPercentage: campaign.trendPercentage,
          }))
        )
      }
    } catch (error) {
      console.error('Failed to fetch trending campaigns:', error)
    } finally {
      setTrendingLoading(false)
    }
  }, [])

  const fetchNewAndNoteworthy = useCallback(async () => {
    try {
      setNewLoading(true)
      const response = await fetch('/api/campaigns?status=LIVE&sort=newest&limit=8')
      const data: CategoryCampaignsResponse = await response.json()

      if (data.success && Array.isArray(data.data.items)) {
        setNewAndNoteworthy(
          data.data.items.map((campaign) => ({
            id: campaign.id,
            title: campaign.title,
            slug: campaign.slug,
            category: campaign.category,
            signalScore: campaign.signalScore,
            image: campaign.media[0]?.url,
            lobbyCount: campaign._count.lobbies,
          }))
        )
      }
    } catch (error) {
      console.error('Failed to fetch new campaigns:', error)
    } finally {
      setNewLoading(false)
    }
  }, [])

  const fetchPersonalizedRecommendations = useCallback(async () => {
    try {
      setPersonalizedLoading(true)
      const response = await fetch('/api/campaigns/recommendations?limit=8')
      const data: RecommendationResponse = await response.json()

      if (data.success && Array.isArray(data.data)) {
        setPersonalizedCampaigns(
          data.data.map((campaign) => ({
            id: campaign.id,
            title: campaign.title,
            slug: campaign.slug,
            category: campaign.category,
            signalScore: campaign.signalScore,
            image: campaign.media[0]?.url,
            lobbyCount: campaign._count.lobbies,
          }))
        )
      }
    } catch (error) {
      console.error('Failed to fetch personalized recommendations:', error)
    } finally {
      setPersonalizedLoading(false)
    }
  }, [])

  const fetchCategoryCampaigns = useCallback(
    async (category: string) => {
      try {
        setCategoryLoading((prev) => ({ ...prev, [category]: true }))
        const response = await fetch(
          `/api/campaigns?category=${category}&status=LIVE&sort=trending&limit=6`
        )
        const data: CategoryCampaignsResponse = await response.json()

        if (data.success && Array.isArray(data.data.items)) {
          setCategoryCampaigns((prev) => ({
            ...prev,
            [category]: data.data.items.map((campaign) => ({
              id: campaign.id,
              title: campaign.title,
              slug: campaign.slug,
              category: campaign.category,
              signalScore: campaign.signalScore,
              image: campaign.media[0]?.url,
              lobbyCount: campaign._count.lobbies,
            })),
          }))
        }
      } catch (error) {
        console.error(`Failed to fetch ${category} campaigns:`, error)
      } finally {
        setCategoryLoading((prev) => ({ ...prev, [category]: false }))
      }
    },
    []
  )

  useEffect(() => {
    fetchTrendingCampaigns()
    fetchNewAndNoteworthy()
    fetchPersonalizedRecommendations()
  }, [fetchTrendingCampaigns, fetchNewAndNoteworthy, fetchPersonalizedRecommendations])

  useEffect(() => {
    CATEGORIES.forEach((category) => {
      if (!(category.value in categoryCampaigns)) {
        fetchCategoryCampaigns(category.value)
      }
    })
  }, [categoryCampaigns, fetchCategoryCampaigns])

  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      <PageHeader
        title="Discover Campaigns"
        subtitle="Explore the latest campaigns, trending demand, and recommendations tailored to your interests."
      />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-16">
        <section>
          <TrendingCampaigns
            campaigns={trendingCampaigns}
            isLoading={trendingLoading}
            autoRefreshInterval={5 * 60 * 1000}
            onRefresh={fetchTrendingCampaigns}
          />
        </section>

        <section>
          <CampaignRecommendations
            campaigns={newAndNoteworthy}
            isLoading={newLoading}
            title="New & Noteworthy"
            showArrows={true}
          />
        </section>

        {personalizedCampaigns.length > 0 && (
          <section>
            <CampaignRecommendations
              campaigns={personalizedCampaigns}
              isLoading={personalizedLoading}
              title="Recommended for You"
              showArrows={true}
            />
          </section>
        )}

        <section className="space-y-8">
          <div>
            <h2 className="text-2xl font-bold text-foreground mb-2">
              Browse by Category
            </h2>
            <p className="text-gray-600">
              Find campaigns across your favorite categories
            </p>
          </div>

          <div className="space-y-12">
            {CATEGORIES.map((category) => (
              <div key={category.value} className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-foreground">
                    {category.label}
                  </h3>
                  <Link href={`/campaigns?category=${category.value}`}>
                    <Button variant="ghost" size="sm" className="gap-2">
                      View All
                      <ArrowRight size={16} />
                    </Button>
                  </Link>
                </div>

                {categoryLoading[category.value] ? (
                  <div className="flex items-center justify-center py-12">
                    <Loader2 className="animate-spin text-violet-600" size={24} />
                  </div>
                ) : categoryCampaigns[category.value]?.length > 0 ? (
                  <CampaignRecommendations
                    campaigns={categoryCampaigns[category.value]}
                    isLoading={false}
                    showArrows={false}
                  />
                ) : (
                  <div className="bg-gray-50 border border-gray-200 rounded-lg p-8 text-center">
                    <p className="text-gray-600">
                      No campaigns in {category.label} yet. Check back soon!
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>

        <section className="bg-gradient-to-r from-violet-50 to-violet-100 rounded-lg border border-violet-200 p-12 text-center">
          <h2 className="text-2xl font-bold text-foreground mb-4">
            Have an idea for a campaign?
          </h2>
          <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
            Join thousands of creators and innovators lobbying for the products
            they want to see in the world.
          </p>
          <Link href="/campaigns/new">
            <Button variant="primary" size="lg">
              Create Campaign
            </Button>
          </Link>
        </section>
      </main>

      <Footer />
    </div>
  )
}
