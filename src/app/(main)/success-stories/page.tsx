'use client'

import React, { useState, useEffect } from 'react'
import { useInfiniteQuery } from '@tanstack/react-query'
import { Button } from '@/components/ui/button'
import { StoryCard } from '@/components/success-stories/story-card'
import { Users, Zap, CheckCircle2 } from 'lucide-react'

const CATEGORIES = [
  { value: 'all', label: 'All Categories' },
  { value: 'tech', label: 'Tech' },
  { value: 'fashion', label: 'Fashion' },
  { value: 'food-drink', label: 'Food & Drink' },
  { value: 'health', label: 'Health & Wellness' },
  { value: 'home', label: 'Home & Living' },
  { value: 'entertainment', label: 'Entertainment' },
  { value: 'other', label: 'Other' }
]

interface Story {
  id: string
  title: string
  slug: string
  description: string
  category: string
  creator: {
    id: string
    displayName: string
    handle: string | null
    avatar: string | null
  }
  brand: {
    id: string
    name: string
    slug: string
    logo: string | null
  } | null
  brandResponse: {
    id: string
    content: string
    responseType: string
    createdAt: string
  } | null
  lobbyCount: number
  commentCount: number
  createdAt: string
}

async function fetchStories({ pageParam = 1, category }: { pageParam?: number; category: string }) {
  const params = new URLSearchParams({
    page: pageParam.toString(),
    limit: '12',
    ...(category !== 'all' && { category })
  })

  try {
    const res = await fetch(`/api/success-stories?${params}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    })
    if (!res.ok) throw new Error('Failed to fetch stories')
    return res.json()
  } catch (error) {
    console.error('Error fetching stories:', error)
    throw error
  }
}

export default function SuccessStoriesPage() {
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [stats, setStats] = useState({ total: 0, supporters: 0, brands: 0 })

  const { data, fetchNextPage, hasNextPage, isLoading, isFetchingNextPage } = useInfiniteQuery({
    queryKey: ['success-stories', selectedCategory],
    queryFn: ({ pageParam = 1 }) =>
      fetchStories({ pageParam, category: selectedCategory }),
    getNextPageParam: (lastPage) =>
      lastPage.pagination.page < lastPage.pagination.pages
        ? lastPage.pagination.page + 1
        : undefined,
    initialPageParam: 1,
  })

  // Calculate stats from all fetched stories
  useEffect(() => {
    if (data) {
      const allStories = data.pages.flatMap((page) => page.stories)
      const totalStories = data.pages[0]?.pagination.total || 0
      const totalSupporters = allStories.reduce((acc, story) => acc + story.lobbyCount, 0)
      const brandsResponded = new Set(
        allStories.filter((s) => s.brandResponse).map((s) => s.brand?.id)
      ).size

      setStats({
        total: totalStories,
        supporters: totalSupporters,
        brands: brandsResponded,
      })
    }
  }, [data])

  const stories = data?.pages.flatMap((page) => page.stories) || []
  const isEmpty = !isLoading && stories.length === 0

  if (isLoading) {
    return (
      <main className="min-h-screen bg-gray-50">
        <section className="bg-gradient-to-br from-violet-50 via-white to-violet-50 pt-32 pb-16 px-4 md:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
              Success Stories
            </h1>
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-violet-600" />
            </div>
          </div>
        </section>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-violet-50 via-white to-violet-50 pt-32 pb-16 px-4 md:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
            Success Stories
          </h1>
          <p className="text-xl text-gray-600 mb-12 max-w-2xl mx-auto">
            See how consumer voices are driving real product change
          </p>

          {/* Stats Bar */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 bg-white rounded-2xl shadow-sm p-8 border border-gray-200">
            <div className="flex flex-col items-center">
              <CheckCircle2 className="w-8 h-8 text-violet-600 mb-2" />
              <div className="text-3xl font-bold text-foreground">{stats.total}</div>
              <p className="text-sm text-gray-600 mt-1">Success Stories</p>
            </div>
            <div className="flex flex-col items-center">
              <Users className="w-8 h-8 text-violet-600 mb-2" />
              <div className="text-3xl font-bold text-foreground">{stats.supporters.toLocaleString()}</div>
              <p className="text-sm text-gray-600 mt-1">Total Supporters</p>
            </div>
            <div className="flex flex-col items-center">
              <Zap className="w-8 h-8 text-violet-600 mb-2" />
              <div className="text-3xl font-bold text-foreground">{stats.brands}</div>
              <p className="text-sm text-gray-600 mt-1">Brands That Listened</p>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-16 px-4 md:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          {/* Category Filter */}
          <div className="mb-12">
            <h2 className="text-sm font-semibold text-gray-700 mb-4">Filter by Category</h2>
            <div className="flex flex-wrap gap-3">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat.value}
                  onClick={() => setSelectedCategory(cat.value)}
                  className={`px-4 py-2 rounded-full font-medium text-sm transition-all duration-200 ${
                    selectedCategory === cat.value
                      ? 'bg-violet-600 text-white shadow-md'
                      : 'bg-white border border-gray-300 text-gray-700 hover:border-violet-600 hover:text-violet-600'
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          </div>

          {/* Stories Grid */}
          {isEmpty ? (
            <div className="text-center py-16">
              <p className="text-gray-600 text-lg">No success stories yet.</p>
              <p className="text-gray-500 mt-2">Check back soon for inspiring success stories!</p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
                {stories.map((story) => (
                  <StoryCard key={story.id} story={story} />
                ))}
              </div>

              {/* Load More Button */}
              {hasNextPage && (
                <div className="flex justify-center">
                  <Button
                    onClick={() => fetchNextPage()}
                    disabled={isFetchingNextPage}
                    variant="outline"
                    size="lg"
                    className="px-8"
                  >
                    {isFetchingNextPage ? 'Loading...' : 'Load More Stories'}
                  </Button>
                </div>
              )}
            </>
          )}
        </div>
      </section>
    </main>
  )
}
