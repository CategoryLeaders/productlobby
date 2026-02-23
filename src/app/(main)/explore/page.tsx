'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { DashboardLayout } from '@/components/shared'
import { cn } from '@/lib/utils'
import {
  Search,
  Map,
  Filter,
  Globe,
  Users,
  TrendingUp,
} from 'lucide-react'

interface Campaign {
  id: string
  title: string
  slug: string
  category: string
  signalScore: number | null
  lobbyCount: number
}

interface Region {
  region: string
  campaignCount: number
  totalLobbies: number
  campaigns: Campaign[]
}

export default function ExplorePage() {
  const [regions, setRegions] = useState<Region[]>([])
  const [selectedRegion, setSelectedRegion] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [categoryFilter, setCategoryFilter] = useState<string>('')
  const [loading, setLoading] = useState(true)
  const [categories, setCategories] = useState<string[]>([])

  useEffect(() => {
    fetchRegions()
    fetchCategories()
  }, [])

  const fetchRegions = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/campaigns/by-region')
      const data = await response.json()

      if (data.success) {
        setRegions(data.data.regions)
      }
    } catch (error) {
      console.error('Failed to fetch regions:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchCategories = async () => {
    try {
      const response = await fetch('/api/tags')
      const data = await response.json()

      if (data.success && Array.isArray(data.data)) {
        const cats = data.data.map((tag: any) => tag.name)
        setCategories(cats)
      }
    } catch (error) {
      console.error('Failed to fetch categories:', error)
    }
  }

  // Filter campaigns based on search and category
  let filteredRegions = regions
  if (selectedRegion) {
    filteredRegions = regions.filter((r) => r.region === selectedRegion)
  }

  if (searchQuery || categoryFilter) {
    filteredRegions = filteredRegions.map((region) => ({
      ...region,
      campaigns: region.campaigns.filter((campaign) => {
        const matchesSearch =
          campaign.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          campaign.slug.toLowerCase().includes(searchQuery.toLowerCase())
        const matchesCategory =
          !categoryFilter || campaign.category === categoryFilter

        return matchesSearch && matchesCategory
      }),
    }))
  }

  return (
    <DashboardLayout role="supporter">
      <div className="space-y-8">
        {/* Header */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Map className="w-8 h-8 text-violet-600" />
            <h1 className="text-3xl font-bold">Explore Campaigns</h1>
          </div>
          <p className="text-gray-600">
            Discover campaigns by region and category
          </p>
        </div>

        {/* Search & Filter Bar */}
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search campaigns..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500"
              />
            </div>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500"
            >
              <option value="">All Categories</option>
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Region Selector Grid */}
        <div className="space-y-4">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <Globe className="w-5 h-5" />
            Select Region
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {/* All Regions Option */}
            <button
              onClick={() => setSelectedRegion(null)}
              className={cn(
                'p-4 rounded-lg border-2 transition-all text-left',
                selectedRegion === null
                  ? 'border-violet-600 bg-violet-50'
                  : 'border-gray-200 hover:border-violet-300'
              )}
            >
              <div className="text-sm font-semibold text-gray-700">All Regions</div>
              <div className="text-2xl font-bold text-violet-600 mt-2">
                {regions.reduce((sum, r) => sum + r.campaignCount, 0)}
              </div>
              <div className="text-xs text-gray-500 mt-1">Campaigns</div>
            </button>

            {/* Individual Regions */}
            {regions.map((region) => (
              <button
                key={region.region}
                onClick={() =>
                  setSelectedRegion(
                    selectedRegion === region.region ? null : region.region
                  )
                }
                className={cn(
                  'p-4 rounded-lg border-2 transition-all text-left',
                  selectedRegion === region.region
                    ? 'border-violet-600 bg-violet-50'
                    : 'border-gray-200 hover:border-violet-300'
                )}
              >
                <div className="text-sm font-semibold text-gray-700">
                  {region.region}
                </div>
                <div className="text-2xl font-bold text-violet-600 mt-2">
                  {region.campaignCount}
                </div>
                <div className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                  <Users className="w-3 h-3" />
                  {region.totalLobbies} lobbies
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Campaigns Grid */}
        <div className="space-y-4">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <TrendingUp className="w-5 h-5" />
            Featured Campaigns
          </h2>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div
                  key={i}
                  className="p-4 border border-gray-200 rounded-lg animate-pulse"
                >
                  <div className="h-6 bg-gray-200 rounded w-3/4 mb-4"></div>
                  <div className="h-4 bg-gray-200 rounded w-full mb-3"></div>
                  <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredRegions.length > 0 ? (
                filteredRegions.flatMap((region) =>
                  region.campaigns.map((campaign) => (
                    <Link
                      key={campaign.id}
                      href={`/campaigns/${campaign.slug}`}
                    >
                      <div className="h-full p-6 border border-gray-200 rounded-lg hover:shadow-lg transition-shadow cursor-pointer">
                        <div className="flex items-start justify-between mb-3">
                          <h3 className="font-semibold text-gray-900 flex-1">
                            {campaign.title}
                          </h3>
                        </div>

                        <div className="space-y-2">
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-gray-600">Category</span>
                            <span className="px-2 py-1 bg-violet-100 text-violet-700 rounded text-xs font-medium">
                              {campaign.category}
                            </span>
                          </div>

                          <div className="flex items-center justify-between text-sm">
                            <span className="text-gray-600">Signal Score</span>
                            <span className="font-semibold text-violet-600">
                              {campaign.signalScore
                                ? campaign.signalScore.toFixed(1)
                                : '0.0'}
                            </span>
                          </div>

                          <div className="flex items-center justify-between text-sm">
                            <span className="text-gray-600">Lobbies</span>
                            <span className="font-semibold text-lime-600">
                              {campaign.lobbyCount}
                            </span>
                          </div>
                        </div>

                        <div className="mt-4 pt-4 border-t border-gray-200">
                          <button className="w-full py-2 px-3 bg-violet-600 text-white text-sm font-medium rounded hover:bg-violet-700 transition-colors">
                            View Campaign
                          </button>
                        </div>
                      </div>
                    </Link>
                  ))
                )
              ) : (
                <div className="col-span-3 text-center py-12">
                  <Filter className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500">
                    No campaigns match your filters
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  )
}
