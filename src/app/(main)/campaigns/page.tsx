'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Search, ArrowRight } from 'lucide-react'
import { Navbar } from '@/components/shared/navbar'
import { Footer } from '@/components/shared/footer'
import { PageHeader } from '@/components/shared/page-header'
import { Button } from '@/components/ui/button'
import { CampaignCard, type CampaignCardProps } from '@/components/shared/campaign-card'

const CATEGORIES = [
  { value: 'all', label: 'All' },
  { value: 'tech', label: 'Tech' },
  { value: 'fashion', label: 'Fashion' },
  { value: 'food', label: 'Food & Drink' },
  { value: 'home', label: 'Home' },
  { value: 'sports', label: 'Sports' },
  { value: 'beauty', label: 'Beauty' },
  { value: 'transport', label: 'Transport' },
  { value: 'other', label: 'Other' },
]

const SORT_OPTIONS = [
  { value: 'trending', label: 'Trending' },
  { value: 'newest', label: 'Newest' },
  { value: 'lobbied', label: 'Most Lobbied' },
  { value: 'nearly', label: 'Nearly There' },
]

const DEMO_CAMPAIGNS: CampaignCardProps[] = [
  {
    id: '1',
    title: 'Nike Women\'s Size 14 Running Shoes',
    slug: 'nike-womens-size-14-running-shoes',
    description: 'Extended size range for women\'s running shoes. Many athletes need sizes beyond standard offerings.',
    category: 'Fashion',
    image: undefined,
    lobbyCount: 2847,
    intensityDistribution: {
      low: 800,
      medium: 1200,
      high: 847,
    },
    completenessScore: 89,
    status: 'active',
    creator: {
      id: 'user1',
      displayName: 'Sarah Chen',
      email: 'sarah.chen@example.com',
    },
    brand: {
      id: 'nike',
      name: 'Nike',
    },
    createdAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: '2',
    title: 'Portable Espresso Machine - No Electricity Required',
    slug: 'portable-espresso-machine',
    description: 'A genuinely portable espresso maker that doesn\'t need electricity. Perfect for camping and travel.',
    category: 'Food & Drink',
    image: undefined,
    lobbyCount: 1523,
    intensityDistribution: {
      low: 600,
      medium: 650,
      high: 273,
    },
    completenessScore: 72,
    status: 'active',
    creator: {
      id: 'user2',
      displayName: 'Marcus Johnson',
      email: 'marcus.j@example.com',
    },
    createdAt: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: '3',
    title: 'Noise-Cancelling Headphones for Dogs',
    slug: 'noise-cancelling-headphones-dogs',
    description: 'Protective headphones designed to reduce anxiety from loud noises for anxious dogs.',
    category: 'Tech',
    image: undefined,
    lobbyCount: 847,
    intensityDistribution: {
      low: 700,
      medium: 120,
      high: 27,
    },
    completenessScore: 45,
    status: 'active',
    creator: {
      id: 'user3',
      displayName: 'Emma Rodriguez',
      email: 'emma.r@example.com',
    },
    createdAt: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: '4',
    title: 'Modular Kitchen Island with Built-in Herb Garden',
    slug: 'modular-kitchen-island-herb-garden',
    description: 'Customizable kitchen island that includes integrated hydroponic herb garden for fresh cooking ingredients.',
    category: 'Home',
    image: undefined,
    lobbyCount: 3201,
    intensityDistribution: {
      low: 950,
      medium: 1400,
      high: 851,
    },
    completenessScore: 92,
    status: 'active',
    creator: {
      id: 'user4',
      displayName: 'David Kim',
      email: 'david.kim@example.com',
    },
    brand: {
      id: 'ikea',
      name: 'IKEA',
    },
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: '5',
    title: 'Sustainable Running Shoes from Recycled Ocean Plastic',
    slug: 'sustainable-running-shoes-ocean-plastic',
    description: 'High-performance running shoes made entirely from recycled ocean plastic and sustainable materials.',
    category: 'Sports',
    image: undefined,
    lobbyCount: 4112,
    intensityDistribution: {
      low: 1100,
      medium: 1800,
      high: 1212,
    },
    completenessScore: 96,
    status: 'active',
    creator: {
      id: 'user5',
      displayName: 'Lisa Anderson',
      email: 'lisa.anderson@example.com',
    },
    brand: {
      id: 'adidas',
      name: 'Adidas',
    },
    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: '6',
    title: 'Vegan Leather Work Bag That Doesn\'t Look Vegan',
    slug: 'vegan-leather-work-bag',
    description: 'Professional work bag made from vegan leather that actually looks like premium leather. No compromises on aesthetics.',
    category: 'Fashion',
    image: undefined,
    lobbyCount: 1888,
    intensityDistribution: {
      low: 650,
      medium: 850,
      high: 388,
    },
    completenessScore: 78,
    status: 'active',
    creator: {
      id: 'user6',
      displayName: 'James Wilson',
      email: 'james.w@example.com',
    },
    createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: '7',
    title: 'AI-Powered Sleep Tracker Pillow',
    slug: 'ai-sleep-tracker-pillow',
    description: 'Smart pillow that tracks sleep patterns and provides personalized recommendations for better rest.',
    category: 'Tech',
    image: undefined,
    lobbyCount: 956,
    intensityDistribution: {
      low: 400,
      medium: 350,
      high: 206,
    },
    completenessScore: 68,
    status: 'active',
    creator: {
      id: 'user7',
      displayName: 'Michael Zhang',
      email: 'michael.z@example.com',
    },
    createdAt: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: '8',
    title: 'Zero-Waste Meal Kit Delivery',
    slug: 'zero-waste-meal-kit',
    description: 'Sustainable meal kit delivery service with completely compostable or reusable packaging.',
    category: 'Food & Drink',
    image: undefined,
    lobbyCount: 2334,
    intensityDistribution: {
      low: 750,
      medium: 1050,
      high: 534,
    },
    completenessScore: 85,
    status: 'active',
    creator: {
      id: 'user8',
      displayName: 'Nina Patel',
      email: 'nina.p@example.com',
    },
    createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: '9',
    title: 'Electric Cargo Bike for Families',
    slug: 'electric-cargo-bike-families',
    description: 'Electric cargo bike designed to safely transport children and groceries. Perfect for urban families.',
    category: 'Transport',
    image: undefined,
    lobbyCount: 1677,
    intensityDistribution: {
      low: 550,
      medium: 750,
      high: 377,
    },
    completenessScore: 80,
    status: 'active',
    creator: {
      id: 'user9',
      displayName: 'Robert Chen',
      email: 'robert.c@example.com',
    },
    createdAt: new Date(Date.now() - 11 * 24 * 60 * 60 * 1000).toISOString(),
  },
]

function getCategoryValue(category: string): string {
  const categoryMap: Record<string, string> = {
    'Fashion': 'fashion',
    'Food & Drink': 'food',
    'Tech': 'tech',
    'Home': 'home',
    'Sports': 'sports',
    'Transport': 'transport',
  }
  return categoryMap[category] || 'other'
}

export default function CampaignsPage() {
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [sortBy, setSortBy] = useState('trending')
  const [searchQuery, setSearchQuery] = useState('')
  const [displayCount, setDisplayCount] = useState(9)

  const filteredCampaigns = DEMO_CAMPAIGNS.filter((campaign) => {
    const matchesCategory =
      selectedCategory === 'all' || getCategoryValue(campaign.category) === selectedCategory
    const matchesSearch =
      campaign.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      campaign.description.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesCategory && matchesSearch
  })

  const sortedCampaigns = [...filteredCampaigns].sort((a, b) => {
    switch (sortBy) {
      case 'newest':
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      case 'lobbied':
        return b.lobbyCount - a.lobbyCount
      case 'nearly':
        return b.completenessScore - a.completenessScore
      case 'trending':
      default:
        const totalIntensityA =
          a.intensityDistribution.low +
          a.intensityDistribution.medium +
          a.intensityDistribution.high
        const totalIntensityB =
          b.intensityDistribution.low +
          b.intensityDistribution.medium +
          b.intensityDistribution.high
        const scoreA =
          a.lobbyCount +
          totalIntensityA * 2 +
          a.completenessScore
        const scoreB =
          b.lobbyCount +
          totalIntensityB * 2 +
          b.completenessScore
        return scoreB - scoreA
    }
  })

  const displayedCampaigns = sortedCampaigns.slice(0, displayCount)
  const hasMore = displayCount < sortedCampaigns.length

  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      <div className="pt-24">
        {/* Page Header */}
        <div className="px-4 sm:px-6 lg:px-8 bg-white border-b border-gray-200">
          <div className="max-w-7xl mx-auto py-12">
            <PageHeader
              title="Browse Campaigns"
              description="Discover ideas worth lobbying for"
            />
          </div>
        </div>

        {/* Filter Bar */}
        <div className="px-4 sm:px-6 lg:px-8 bg-gray-50 border-b border-gray-200">
          <div className="max-w-7xl mx-auto py-6">
            <div className="flex flex-col gap-6">
              {/* Search Input */}
              <div className="relative">
                <Search className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search campaigns..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent"
                />
              </div>

              {/* Category Chips */}
              <div className="flex flex-wrap gap-2">
                {CATEGORIES.map((category) => (
                  <button
                    key={category.value}
                    onClick={() => setSelectedCategory(category.value)}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                      selectedCategory === category.value
                        ? 'bg-violet-600 text-white'
                        : 'bg-white border border-gray-300 text-gray-700 hover:border-gray-400'
                    }`}
                  >
                    {category.label}
                  </button>
                ))}
              </div>

              {/* Sort Options */}
              <div className="flex gap-2">
                {SORT_OPTIONS.map((option) => (
                  <button
                    key={option.value}
                    onClick={() => setSortBy(option.value)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                      sortBy === option.value
                        ? 'bg-violet-100 text-violet-700 border border-violet-300'
                        : 'bg-white border border-gray-300 text-gray-700 hover:border-gray-400'
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Campaign Grid */}
        <main className="px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto py-12">
            {displayedCampaigns.length === 0 ? (
              <div className="text-center py-20">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Search className="w-8 h-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-2">
                  No campaigns found
                </h3>
                <p className="text-gray-600 mb-6">
                  Try adjusting your filters or create a new campaign
                </p>
                <Link href="/campaigns/create">
                  <Button variant="primary" size="lg">
                    Create Campaign
                  </Button>
                </Link>
              </div>
            ) : (
              <>
                <div className="mb-6">
                  <p className="text-gray-600">
                    Showing <span className="font-semibold">{displayedCampaigns.length}</span> of{' '}
                    <span className="font-semibold">{sortedCampaigns.length}</span> campaigns
                  </p>
                </div>

                <div className="grid lg:grid-cols-3 md:grid-cols-2 grid-cols-1 gap-6 mb-12">
                  {displayedCampaigns.map((campaign) => (
                    <CampaignCard key={campaign.id} {...campaign} />
                  ))}
                </div>

                {hasMore && (
                  <div className="flex justify-center">
                    <Button
                      variant="secondary"
                      size="lg"
                      onClick={() => setDisplayCount((prev) => prev + 6)}
                      className="flex items-center gap-2"
                    >
                      Load More Campaigns
                      <ArrowRight className="w-4 h-4" />
                    </Button>
                  </div>
                )}
              </>
            )}
          </div>
        </main>
      </div>

      <Footer />
    </div>
  )
}
