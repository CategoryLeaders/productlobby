'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { ArrowRight, Users, Target, CreditCard, TrendingUp, Loader2, AlertCircle } from 'lucide-react'
import { Navbar } from '@/components/shared/navbar'
import { Footer } from '@/components/shared/footer'
import { CampaignCard, type CampaignCardProps } from '@/components/shared/campaign-card'
import { WebsiteJsonLd, OrganizationJsonLd } from '@/components/shared/json-ld'

export default function HomePage() {
  const [trendingCampaigns, setTrendingCampaigns] = useState<CampaignCardProps[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchTrendingCampaigns = async () => {
      try {
        setIsLoading(true)
        setError(null)
        const res = await fetch('/api/campaigns/trending?limit=6')

        if (!res.ok) {
          throw new Error('Failed to fetch trending campaigns')
        }

        const data = await res.json()

        // Map the API response to CampaignCardProps format
        const mapped: CampaignCardProps[] = data.campaigns.map((campaign: any) => ({
          id: campaign.id,
          title: campaign.title,
          slug: campaign.slug,
          description: campaign.description,
          category: campaign.category,
          image: campaign.firstMediaImage?.url || undefined,
          lobbyCount: campaign.verifiedLobbiesCount || 0,
          intensityDistribution: {
            low: campaign.lobbyStats?.intensityDistribution?.NEAT_IDEA || 0,
            medium: campaign.lobbyStats?.intensityDistribution?.PROBABLY_BUY || 0,
            high: campaign.lobbyStats?.intensityDistribution?.TAKE_MY_MONEY || 0,
          },
          completenessScore: campaign.completenessScore || 0,
          status: 'active' as const,
          creator: {
            id: campaign.creator.id,
            displayName: campaign.creator.displayName,
            email: '',
            avatar: campaign.creator.avatar || undefined,
          },
          brand: campaign.targetedBrand
            ? {
                id: campaign.targetedBrand.id,
                name: campaign.targetedBrand.name,
                logo: campaign.targetedBrand.logo || undefined,
              }
            : undefined,
          createdAt: campaign.createdAt,
        }))

        setTrendingCampaigns(mapped)
      } catch (err) {
        console.error('Error fetching trending campaigns:', err)
        setError('Unable to load trending campaigns. Please try again later.')
        setTrendingCampaigns([])
      } finally {
        setIsLoading(false)
      }
    }

    fetchTrendingCampaigns()
  }, [])

  return (
    <div className="min-h-screen bg-white">
      <WebsiteJsonLd />
      <OrganizationJsonLd />
      <Navbar />

      {/* Hero Section */}
      <section className="pt-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
        <h1 className="text-5xl sm:text-6xl font-bold text-gray-900 mb-6 font-display">
          Turn Your Wish List Into
          <span className="text-primary-600"> Real Products</span>
        </h1>
        <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-10">
          ProductLobby lets you demand the products and features you want.
          Rally support, show buying intent, and get brands to actually listen.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/campaigns"
            className="bg-primary-600 text-white px-8 py-4 rounded-xl text-lg font-semibold hover:bg-primary-700 transition flex items-center justify-center gap-2"
          >
            Explore Campaigns
            <ArrowRight className="w-5 h-5" />
          </Link>
          <Link
            href="/campaigns/create"
            className="border-2 border-primary-600 text-primary-600 px-8 py-4 rounded-xl text-lg font-semibold hover:bg-primary-50 transition"
          >
            Create a Campaign
          </Link>
        </div>
      </section>

      {/* How It Works */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <h2 className="text-3xl font-bold text-center mb-12">How It Works</h2>
        <div className="grid md:grid-cols-4 gap-8">
          <div className="text-center">
            <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Target className="w-8 h-8 text-primary-600" />
            </div>
            <h3 className="font-semibold text-lg mb-2">Create a Campaign</h3>
            <p className="text-gray-600">
              Request a new product variant, feature, or size from your favorite brand.
            </p>
          </div>
          <div className="text-center">
            <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Users className="w-8 h-8 text-primary-600" />
            </div>
            <h3 className="font-semibold text-lg mb-2">Gather Support</h3>
            <p className="text-gray-600">
              Others add support or buying intent with price and timeframe.
            </p>
          </div>
          <div className="text-center">
            <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <TrendingUp className="w-8 h-8 text-primary-600" />
            </div>
            <h3 className="font-semibold text-lg mb-2">Brands Engage</h3>
            <p className="text-gray-600">
              When demand is credible, brands respond, run polls, and create offers.
            </p>
          </div>
          <div className="text-center">
            <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CreditCard className="w-8 h-8 text-primary-600" />
            </div>
            <h3 className="font-semibold text-lg mb-2">Binding Offers</h3>
            <p className="text-gray-600">
              Pay on-platform. Refunded if the offer fails. Product ships if it succeeds.
            </p>
          </div>
        </div>
      </section>

      {/* Trending Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="mb-12">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-3xl font-bold mb-2">Trending Now</h2>
              <p className="text-gray-600">The most popular campaigns gaining momentum</p>
            </div>
            <Link
              href="/campaigns?sort=trending"
              className="flex items-center gap-2 text-primary-600 hover:text-primary-700 font-semibold transition"
            >
              View All
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center py-20">
            <div className="text-center">
              <Loader2 className="w-8 h-8 text-primary-600 animate-spin mx-auto mb-4" />
              <p className="text-gray-600">Loading trending campaigns...</p>
            </div>
          </div>
        ) : error ? (
          <div className="bg-red-50 border border-red-200 rounded-lg p-8">
            <div className="flex items-center gap-3 text-red-800">
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
              <div>
                <p className="font-semibold">Could not load trending campaigns</p>
                <p className="text-sm text-red-700 mt-1">{error}</p>
              </div>
            </div>
          </div>
        ) : trendingCampaigns.length === 0 ? (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-8 text-center">
            <p className="text-gray-600">No campaigns yet. Be the first to create one!</p>
            <Link
              href="/campaigns/create"
              className="mt-4 inline-flex items-center gap-2 bg-primary-600 text-white px-6 py-2 rounded-lg hover:bg-primary-700 transition font-semibold"
            >
              Create a Campaign
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        ) : (
          <div className="grid lg:grid-cols-3 md:grid-cols-2 grid-cols-1 gap-6">
            {trendingCampaigns.map((campaign) => (
              <CampaignCard key={campaign.id} {...campaign} />
            ))}
          </div>
        )}
      </section>

      {/* Categories */}
      <section className="bg-gray-50 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center mb-12">Popular Categories</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { name: 'Apparel', description: 'Sizes, colors, fits', icon: '👕' },
              { name: 'Tech', description: 'Hardware & gadgets', icon: '💻' },
              { name: 'Audio', description: 'Speakers & headphones', icon: '🎧' },
              { name: 'Wearables', description: 'Watches & fitness', icon: '⌚' },
            ].map((category) => (
              <Link
                key={category.name}
                href={`/campaigns?category=${category.name.toLowerCase()}`}
                className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition border border-gray-100"
              >
                <span className="text-4xl mb-4 block">{category.icon}</span>
                <h3 className="font-semibold text-lg">{category.name}</h3>
                <p className="text-gray-600 text-sm">{category.description}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
        <div className="bg-primary-600 rounded-2xl p-12 text-white">
          <h2 className="text-3xl font-bold mb-4">Ready to Make Your Voice Heard?</h2>
          <p className="text-primary-100 mb-8 max-w-2xl mx-auto">
            Join thousands of people who are tired of wishing and start demanding.
            Create your first campaign in minutes.
          </p>
          <Link
            href="/campaigns/create"
            className="bg-white text-primary-600 px-8 py-4 rounded-xl text-lg font-semibold hover:bg-primary-50 transition inline-flex items-center gap-2"
          >
            Start Your Campaign
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </section>

      <Footer />
    </div>
  )
}
