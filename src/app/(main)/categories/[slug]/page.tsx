'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { Navbar } from '@/components/shared/navbar'
import { Footer } from '@/components/shared/footer'
import { Button } from '@/components/ui/button'
import { ResponsiveCampaignCard } from '@/components/shared/responsive-campaign-card'
import { Loader2, ArrowLeft, Users, Zap, TrendingUp } from 'lucide-react'
import {
  getCategoryBySlug,
  getCategoryIcon,
  getAllCategories,
} from '@/lib/category-definitions'

interface Campaign {
  id: string
  title: string
  slug: string
  description: string
  category: string
  signalScore: number | null
  completenessScore: number
  status: string
  createdAt: string
  media: Array<{
    url: string
    altText: string | null
  }>
  creator: {
    id: string
    displayName: string
    handle: string | null
    avatar: string | null
  }
  targetedBrand: {
    id: string
    name: string
    slug: string
    logo: string | null
  } | null
  _count: {
    lobbies: number
    follows: number
  }
}

interface CategoryData {
  success: boolean
  data?: {
    slug: string
    category: string
    stats: {
      totalCampaigns: number
      totalLobbies: number
      activeCampaigns: number
      totalFollows: number
    }
    featured: Campaign[]
    recent: Campaign[]
  }
  error?: string
}

export default function CategoryPage() {
  const params = useParams()
  const slug = params?.slug as string
  const category = getCategoryBySlug(slug)
  const Icon = category ? getCategoryIcon(slug) : null
  const [categoryData, setCategoryData] = useState<CategoryData | null>(null)
  const [allCampaigns, setAllCampaigns] = useState<Campaign[]>([])
  const [filteredCampaigns, setFilteredCampaigns] = useState<Campaign[]>([])
  const [loading, setLoading] = useState(true)
  const [sortBy, setSortBy] = useState<'trending' | 'newest' | 'popular'>('trending')
  const [currentPage, setCurrentPage] = useState(1)
  const campaignsPerPage = 12

  useEffect(() => {
    if (!slug) return

    const fetchCategoryData = async () => {
      try {
        setLoading(true)
        const response = await fetch(`/api/categories/${slug}`)
        const data: CategoryData = await response.json()

        if (data.success && data.data) {
          setCategoryData(data)

          // Combine featured and recent campaigns
          const combined = [...data.data.featured, ...data.data.recent]
          // Remove duplicates
          const unique = Array.from(
            new Map(combined.map((c) => [c.id, c])).values()
          )
          setAllCampaigns(unique)
          applySort(unique, 'trending')
        }
      } catch (error) {
        console.error('Failed to fetch category data:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchCategoryData()
  }, [slug])

  const applySort = (campaigns: Campaign[], sortType: typeof sortBy) => {
    let sorted = [...campaigns]

    if (sortType === 'trending') {
      sorted.sort(
        (a, b) => (b.signalScore || 0) - (a.signalScore || 0)
      )
    } else if (sortType === 'popular') {
      sorted.sort(
        (a, b) => b._count.lobbies - a._count.lobbies
      )
    } else if (sortType === 'newest') {
      sorted.sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      )
    }

    setFilteredCampaigns(sorted)
  }

  const handleSortChange = (newSort: typeof sortBy) => {
    setSortBy(newSort)
    applySort(allCampaigns, newSort)
    setCurrentPage(1)
  }

  // Pagination
  const totalPages = Math.ceil(filteredCampaigns.length / campaignsPerPage)
  const paginatedCampaigns = filteredCampaigns.slice(
    (currentPage - 1) * campaignsPerPage,
    currentPage * campaignsPerPage
  )

  if (!category) {
    return (
      <>
        <Navbar />
        <main className="min-h-screen bg-white">
          <div className="flex flex-col items-center justify-center py-24">
            <p className="text-lg text-slate-600">Category not found</p>
            <Link href="/categories">
              <Button variant="outline" className="mt-4">
                Back to Categories
              </Button>
            </Link>
          </div>
        </main>
        <Footer />
      </>
    )
  }

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
        {/* Hero Section */}
        <section
          className={`${category.gradientFrom} ${category.gradientTo} relative overflow-hidden bg-gradient-to-br py-20 text-white`}
        >
          <div className="absolute inset-0 opacity-10">
            <div className="absolute -right-40 -top-40 h-80 w-80 rounded-full bg-white" />
            <div className="absolute -bottom-40 -left-40 h-80 w-80 rounded-full bg-white" />
          </div>

          <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            {/* Back Link */}
            <Link href="/categories" className="inline-flex items-center text-white/80 hover:text-white">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Categories
            </Link>

            {/* Icon and Title */}
            <div className="mt-8 flex items-end gap-6">
              <div className="rounded-2xl bg-white/20 p-4 backdrop-blur-sm">
                {Icon && <Icon className="h-12 w-12" />}
              </div>
              <div>
                <h1 className="text-4xl font-bold md:text-5xl">{category.name}</h1>
                <p className="mt-2 text-lg text-white/90">{category.description}</p>
              </div>
            </div>

            {/* Stats */}
            {categoryData?.data && (
              <div className="mt-12 grid grid-cols-2 gap-4 sm:grid-cols-4">
                <div className="rounded-lg bg-white/10 p-4 backdrop-blur-sm">
                  <p className="text-sm font-medium text-white/70">Total Campaigns</p>
                  <p className="mt-1 text-2xl font-bold">
                    {categoryData.data.stats.totalCampaigns}
                  </p>
                </div>
                <div className="rounded-lg bg-white/10 p-4 backdrop-blur-sm">
                  <p className="text-sm font-medium text-white/70">Community Support</p>
                  <p className="mt-1 text-2xl font-bold">
                    {categoryData.data.stats.totalLobbies.toLocaleString()}
                  </p>
                </div>
                <div className="rounded-lg bg-white/10 p-4 backdrop-blur-sm">
                  <p className="text-sm font-medium text-white/70">Active Campaigns</p>
                  <p className="mt-1 text-2xl font-bold">
                    {categoryData.data.stats.activeCampaigns}
                  </p>
                </div>
                <div className="rounded-lg bg-white/10 p-4 backdrop-blur-sm">
                  <p className="text-sm font-medium text-white/70">Follows</p>
                  <p className="mt-1 text-2xl font-bold">
                    {categoryData.data.stats.totalFollows.toLocaleString()}
                  </p>
                </div>
              </div>
            )}
          </div>
        </section>

        {/* Featured Campaigns */}
        {categoryData?.data?.featured && categoryData.data.featured.length > 0 && (
          <section className="border-b border-slate-200 bg-white py-16">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <h2 className="flex items-center text-2xl font-bold text-slate-900">
                <Zap className="mr-3 h-6 w-6 text-amber-500" />
                Featured Campaigns
              </h2>
              <p className="mt-2 text-slate-600">
                The most popular campaigns in {category.name}
              </p>

              <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {categoryData.data.featured.map((campaign) => (
                  <ResponsiveCampaignCard
                    key={campaign.id}
                    id={campaign.id}
                    title={campaign.title}
                    slug={campaign.slug}
                    description={campaign.description}
                    category={campaign.category}
                    image={campaign.media?.[0]?.url}
                    lobbyCount={campaign._count.lobbies}
                    signalScore={campaign.signalScore ?? undefined}
                    completenessScore={campaign.completenessScore}
                    status={campaign.status.toLowerCase() as 'active' | 'completed' | 'paused' | 'draft'}
                    creator={{
                      id: campaign.creator.id,
                      displayName: campaign.creator.displayName,
                      email: '',
                      avatar: campaign.creator.avatar ?? undefined,
                    }}
                    brand={
                      campaign.targetedBrand
                        ? {
                            id: campaign.targetedBrand.id,
                            name: campaign.targetedBrand.name,
                            logo: campaign.targetedBrand.logo ?? undefined,
                          }
                        : undefined
                    }
                    createdAt={campaign.createdAt}
                  />
                ))}
              </div>
            </div>
          </section>
        )}

        {/* All Campaigns Section */}
        <section className="py-16">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            {/* Section Header */}
            <div className="mb-8 flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
              <h2 className="text-2xl font-bold text-slate-900">
                All {category.name} Campaigns
              </h2>

              {/* Sort Controls */}
              <div className="flex gap-2">
                {(['trending', 'popular', 'newest'] as const).map((sort) => (
                  <button
                    key={sort}
                    onClick={() => handleSortChange(sort)}
                    className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                      sortBy === sort
                        ? 'bg-violet-100 text-violet-900'
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    }`}
                  >
                    {sort === 'trending' && (
                      <>
                        <TrendingUp className="mr-2 inline h-4 w-4" />
                        Trending
                      </>
                    )}
                    {sort === 'popular' && (
                      <>
                        <Users className="mr-2 inline h-4 w-4" />
                        Popular
                      </>
                    )}
                    {sort === 'newest' && 'Newest'}
                  </button>
                ))}
              </div>
            </div>

            {/* Loading State */}
            {loading ? (
              <div className="flex justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-violet-600" />
              </div>
            ) : paginatedCampaigns.length > 0 ? (
              <>
                {/* Campaign Grid */}
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                  {paginatedCampaigns.map((campaign) => (
                    <ResponsiveCampaignCard
                      key={campaign.id}
                      id={campaign.id}
                      title={campaign.title}
                      slug={campaign.slug}
                      description={campaign.description}
                      category={campaign.category}
                      image={campaign.media?.[0]?.url}
                      lobbyCount={campaign._count.lobbies}
                      signalScore={campaign.signalScore ?? undefined}
                      completenessScore={campaign.completenessScore}
                      status={campaign.status.toLowerCase() as 'active' | 'completed' | 'paused' | 'draft'}
                      creator={{
                        id: campaign.creator.id,
                        displayName: campaign.creator.displayName,
                        email: '',
                        avatar: campaign.creator.avatar ?? undefined,
                      }}
                      brand={
                        campaign.targetedBrand
                          ? {
                              id: campaign.targetedBrand.id,
                              name: campaign.targetedBrand.name,
                              logo: campaign.targetedBrand.logo ?? undefined,
                            }
                          : undefined
                      }
                      createdAt={campaign.createdAt}
                    />
                  ))}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="mt-12 flex items-center justify-center gap-2">
                    <button
                      onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                      disabled={currentPage === 1}
                      className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 disabled:opacity-50 hover:bg-slate-50"
                    >
                      Previous
                    </button>

                    <div className="flex gap-1">
                      {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                        let page = i + 1
                        if (totalPages > 5 && currentPage > 3) {
                          page = currentPage - 2 + i
                        }
                        if (page > totalPages) return null

                        return (
                          <button
                            key={page}
                            onClick={() => setCurrentPage(page)}
                            className={`rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                              currentPage === page
                                ? 'bg-violet-600 text-white'
                                : 'border border-slate-300 text-slate-700 hover:bg-slate-50'
                            }`}
                          >
                            {page}
                          </button>
                        )
                      })}
                    </div>

                    <button
                      onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                      disabled={currentPage === totalPages}
                      className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 disabled:opacity-50 hover:bg-slate-50"
                    >
                      Next
                    </button>
                  </div>
                )}
              </>
            ) : (
              <div className="rounded-lg border border-slate-200 bg-slate-50 py-12 text-center">
                <p className="text-slate-600">No campaigns in this category yet.</p>
              </div>
            )}
          </div>
        </section>

        {/* Call to Action */}
        <section className="border-t border-slate-200 bg-gradient-to-r from-violet-50 to-lime-50 py-16">
          <div className="mx-auto max-w-2xl px-4 text-center sm:px-6 lg:px-8">
            <h2 className="text-3xl font-bold text-slate-900">
              Want to see something new in {category.name}?
            </h2>
            <p className="mt-4 text-lg text-slate-600">
              Start a campaign and let brands know what the community wants.
            </p>
            <Link href="/campaigns/new">
              <Button size="lg" className="mt-8">
                Start a Campaign
              </Button>
            </Link>
          </div>
        </section>
      </main>
      <Footer />
    </>
  )
}
