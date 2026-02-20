'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { Search, ArrowRight, Loader2, Plus } from 'lucide-react'
import { Navbar } from '@/components/shared/navbar'
import { Footer } from '@/components/shared/footer'
import { PageHeader } from '@/components/shared/page-header'
import { Button } from '@/components/ui/button'
import { CampaignCard, type CampaignCardProps } from '@/components/shared/campaign-card'

const CATEGORIES = [
  { value: 'all', label: 'All' },
  { value: 'TECH', label: 'Tech' },
  { value: 'FASHION', label: 'Fashion' },
  { value: 'FOOD_DRINK', label: 'Food & Drink' },
  { value: 'HOME', label: 'Home' },
  { value: 'SPORTS', label: 'Sports' },
  { value: 'BEAUTY', label: 'Beauty' },
  { value: 'TRANSPORT', label: 'Transport' },
  { value: 'OTHER', label: 'Other' },
]

const SORT_OPTIONS = [
  { value: 'trending', label: 'Trending' },
  { value: 'newest', label: 'Newest' },
  { value: 'signal', label: 'Most Lobbied' },
]

interface ApiCampaign {
  id: string
  title: string
  slug: string
  description: string
  category: string
  status: string
  signalScore: number
  completenessScore: number
  createdAt: string
  creator: {
    id: string
    displayName: string
    handle: string | null
  }
  targetedBrand: {
    id: string
    name: string
    slug: string
    logo: string | null
  } | null
  media: Array<{ url: string; type: string }>
  _count: {
    lobbies: number
    follows: number
  }
  stats: {
    supportCount: number
    intentCount: number
    estimatedDemand: number
  }
}

function mapApiToCampaignCard(campaign: ApiCampaign): CampaignCardProps {
  const lobbyCount = campaign._count.lobbies
  // Estimate intensity distribution from available data
  const high = campaign.stats.intentCount
  const medium = campaign.stats.supportCount
  const low = Math.max(0, lobbyCount - high - medium)

  return {
    id: campaign.id,
    title: campaign.title,
    slug: campaign.slug,
    description: campaign.description,
    category: campaign.category,
    image: campaign.media?.[0]?.url || undefined,
    lobbyCount,
    intensityDistribution: { low, medium, high },
    completenessScore: campaign.completenessScore,
    status: campaign.status === 'LIVE' ? 'active' : campaign.status.toLowerCase(),
    creator: {
      id: campaign.creator.id,
      displayName: campaign.creator.displayName,
      email: '',
    },
    brand: campaign.targetedBrand
      ? { id: campaign.targetedBrand.id, name: campaign.targetedBrand.name }
      : undefined,
    createdAt: campaign.createdAt,
  }
}

export default function CampaignsPage() {
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [sortBy, setSortBy] = useState('trending')
  const [searchQuery, setSearchQuery] = useState('')
  const [campaigns, setCampaigns] = useState<CampaignCardProps[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [isLoading, setIsLoading] = useState(true)
  const [hasMore, setHasMore] = useState(false)

  const fetchCampaigns = useCallback(async (pageNum: number, append: boolean = false) => {
    setIsLoading(true)
    try {
      const params = new URLSearchParams({
        sort: sortBy,
        page: String(pageNum),
        limit: '12',
      })
      if (selectedCategory !== 'all') params.set('category', selectedCategory)
      if (searchQuery.trim()) params.set('query', searchQuery.trim())

      const res = await fetch(`/api/campaigns?${params}`)
      const json = await res.json()

      if (json.success && json.data) {
        const mapped = json.data.items.map(mapApiToCampaignCard)
        setCampaigns(prev => append ? [...prev, ...mapped] : mapped)
        setTotal(json.data.total)
        setHasMore(pageNum < json.data.totalPages)
      } else {
        if (!append) setCampaigns([])
        setTotal(0)
        setHasMore(false)
      }
    } catch {
      if (!append) setCampaigns([])
      setTotal(0)
      setHasMore(false)
    } finally {
      setIsLoading(false)
    }
  }, [sortBy, selectedCategory, searchQuery])

  // Fetch on filter/sort changes
  useEffect(() => {
    setPage(1)
    fetchCampaigns(1)
  }, [fetchCampaigns])

  // Debounced search
  const [debouncedSearch, setDebouncedSearch] = useState('')
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(searchQuery), 300)
    return () => clearTimeout(timer)
  }, [searchQuery])

  const loadMore = () => {
    const nextPage = page + 1
    setPage(nextPage)
    fetchCampaigns(nextPage, true)
  }

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
            {isLoading && campaigns.length === 0 ? (
              <div className="text-center py-20">
                <Loader2 className="w-8 h-8 text-violet-500 animate-spin mx-auto mb-4" />
                <p className="text-gray-600">Loading campaigns...</p>
              </div>
            ) : campaigns.length === 0 ? (
              <div className="text-center py-20">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Search className="w-8 h-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-2">
                  No campaigns yet
                </h3>
                <p className="text-gray-600 mb-6">
                  Be the first to create a campaign and rally support for a product idea
                </p>
                <Link href="/campaigns/create">
                  <Button variant="primary" size="lg" className="inline-flex items-center gap-2">
                    <Plus className="w-5 h-5" />
                    Create Campaign
                  </Button>
                </Link>
              </div>
            ) : (
              <>
                <div className="mb-6">
                  <p className="text-gray-600">
                    Showing <span className="font-semibold">{campaigns.length}</span> of{' '}
                    <span className="font-semibold">{total}</span> campaigns
                  </p>
                </div>

                <div className="grid lg:grid-cols-3 md:grid-cols-2 grid-cols-1 gap-6 mb-12">
                  {campaigns.map((campaign) => (
                    <CampaignCard key={campaign.id} {...campaign} />
                  ))}
                </div>

                {hasMore && (
                  <div className="flex justify-center">
                    <Button
                      variant="secondary"
                      size="lg"
                      onClick={loadMore}
                      disabled={isLoading}
                      className="flex items-center gap-2"
                    >
                      {isLoading ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <ArrowRight className="w-4 h-4" />
                      )}
                      Load More Campaigns
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
