'use client'

import { useState, Suspense } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { useQuery } from '@tanstack/react-query'
import { Search, Filter, TrendingUp, Clock, Zap, Plus, Users, Target, Loader2 } from 'lucide-react'
import { formatCurrency, formatNumber, formatRelativeTime } from '@/lib/utils'

const CATEGORIES = [
  { value: '', label: 'All Categories' },
  { value: 'apparel', label: 'Apparel' },
  { value: 'tech', label: 'Tech' },
  { value: 'audio', label: 'Audio' },
  { value: 'wearables', label: 'Wearables' },
  { value: 'home', label: 'Home' },
  { value: 'sports', label: 'Sports' },
  { value: 'automotive', label: 'Automotive' },
  { value: 'other', label: 'Other' },
]

const SORT_OPTIONS = [
  { value: 'trending', label: 'Trending', icon: TrendingUp },
  { value: 'newest', label: 'Newest', icon: Clock },
  { value: 'signal', label: 'High Signal', icon: Zap },
]

function CampaignCard({ campaign }: { campaign: any }) {
  const progress = campaign.signalScore ? Math.min(campaign.signalScore, 100) : 0

  return (
    <Link
      href={`/campaigns/${campaign.id}`}
      className="bg-white rounded-xl border border-gray-100 hover:shadow-lg transition-all p-6 block"
    >
      <div className="flex justify-between items-start mb-4">
        <span className={`px-2 py-1 rounded text-xs font-medium ${
          campaign.template === 'VARIANT'
            ? 'bg-blue-100 text-blue-700'
            : 'bg-purple-100 text-purple-700'
        }`}>
          {campaign.template === 'VARIANT' ? 'Variant' : 'Feature'}
        </span>
        {campaign.targetedBrand && (
          <span className="text-sm text-gray-500">
            → {campaign.targetedBrand.name}
          </span>
        )}
      </div>

      <h3 className="font-semibold text-lg mb-2 line-clamp-2">{campaign.title}</h3>
      <p className="text-gray-600 text-sm mb-4 line-clamp-2">{campaign.description}</p>

      {/* Signal Score Bar */}
      <div className="mb-4">
        <div className="flex justify-between text-sm mb-1">
          <span className="text-gray-500">Signal Score</span>
          <span className="font-medium">{Math.round(progress)}/100</span>
        </div>
        <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all ${
              progress >= 70
                ? 'bg-success-500'
                : progress >= 35
                ? 'bg-warning-500'
                : 'bg-gray-300'
            }`}
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Stats */}
      <div className="flex items-center gap-4 text-sm text-gray-600">
        <div className="flex items-center gap-1">
          <Users className="w-4 h-4" />
          <span>{formatNumber(campaign.stats?.supportCount || 0)} support</span>
        </div>
        <div className="flex items-center gap-1">
          <Target className="w-4 h-4" />
          <span>{formatNumber(campaign.stats?.intentCount || 0)} intent</span>
        </div>
      </div>

      {campaign.stats?.estimatedDemand > 0 && (
        <div className="mt-3 pt-3 border-t text-sm">
          <span className="text-gray-500">Est. demand: </span>
          <span className="font-semibold text-primary-600">
            {formatCurrency(campaign.stats.estimatedDemand, campaign.currency)}
          </span>
        </div>
      )}

      <div className="mt-4 pt-3 border-t flex items-center justify-between text-sm text-gray-500">
        <span>by {campaign.creator?.displayName}</span>
        <span>{formatRelativeTime(campaign.createdAt)}</span>
      </div>
    </Link>
  )
}

function CampaignsContent() {
  const searchParams = useSearchParams()
  const [search, setSearch] = useState(searchParams.get('query') || '')
  const [category, setCategory] = useState(searchParams.get('category') || '')
  const [sort, setSort] = useState(searchParams.get('sort') || 'trending')

  const { data, isLoading, error } = useQuery({
    queryKey: ['campaigns', { search, category, sort }],
    queryFn: async () => {
      const params = new URLSearchParams()
      if (search) params.set('query', search)
      if (category) params.set('category', category)
      params.set('sort', sort)

      const res = await fetch(`/api/campaigns?${params}`)
      if (!res.ok) throw new Error('Failed to fetch campaigns')
      return res.json()
    },
  })

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="text-2xl font-bold text-primary-600">
              ProductLobby
            </Link>
            <Link
              href="/campaigns/new"
              className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              New Campaign
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filters */}
        <div className="bg-white rounded-xl p-4 mb-8 shadow-sm">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search campaigns..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
              />
            </div>

            {/* Category Filter */}
            <div className="flex items-center gap-2">
              <Filter className="w-5 h-5 text-gray-400" />
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="border border-gray-200 rounded-lg px-3 py-2.5 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat.value} value={cat.value}>
                    {cat.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Sort */}
            <div className="flex rounded-lg border border-gray-200 overflow-hidden">
              {SORT_OPTIONS.map((option) => {
                const Icon = option.icon
                return (
                  <button
                    key={option.value}
                    onClick={() => setSort(option.value)}
                    className={`px-4 py-2.5 flex items-center gap-2 text-sm transition ${
                      sort === option.value
                        ? 'bg-primary-50 text-primary-600 font-medium'
                        : 'text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    {option.label}
                  </button>
                )
              })}
            </div>
          </div>
        </div>

        {/* Results */}
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-primary-600" />
          </div>
        ) : error ? (
          <div className="text-center py-20 text-error-600">
            Failed to load campaigns. Please try again.
          </div>
        ) : data?.data?.items?.length === 0 ? (
          <div className="text-center py-20">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Search className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold mb-2">No campaigns found</h3>
            <p className="text-gray-600 mb-6">
              Try adjusting your filters or create a new campaign
            </p>
            <Link
              href="/campaigns/new"
              className="bg-primary-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-primary-700 transition inline-flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Create Campaign
            </Link>
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between mb-6">
              <p className="text-gray-600">
                {data.data.total} campaign{data.data.total !== 1 ? 's' : ''} found
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {data.data.items.map((campaign: any) => (
                <CampaignCard key={campaign.id} campaign={campaign} />
              ))}
            </div>

            {/* Pagination */}
            {data.data.totalPages > 1 && (
              <div className="mt-8 flex justify-center">
                <div className="flex items-center gap-2">
                  {Array.from({ length: data.data.totalPages }, (_, i) => (
                    <button
                      key={i}
                      className={`w-10 h-10 rounded-lg ${
                        i + 1 === data.data.page
                          ? 'bg-primary-600 text-white'
                          : 'bg-white border hover:bg-gray-50'
                      }`}
                    >
                      {i + 1}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  )
}

export default function CampaignsPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader2 className="w-8 h-8 animate-spin text-primary-600" />
      </div>
    }>
      <CampaignsContent />
    </Suspense>
  )
}
