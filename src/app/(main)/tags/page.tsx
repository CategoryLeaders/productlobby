'use client'

import React, { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { Navbar } from '@/components/shared/navbar'
import { Footer } from '@/components/shared/footer'
import { PageHeader } from '@/components/shared/page-header'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Loader2, Search } from 'lucide-react'
import { cn } from '@/lib/utils'

interface Tag {
  name: string
  count: number
}

export default function TagsPage() {
  const [allTags, setAllTags] = useState<Tag[]>([])
  const [filteredTags, setFilteredTags] = useState<Tag[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')

  // Fetch all tags on mount
  useEffect(() => {
    const fetchTags = async () => {
      try {
        setLoading(true)
        const response = await fetch('/api/tags?limit=500')
        const result = await response.json()

        if (result.success && result.data) {
          setAllTags(result.data)
          setFilteredTags(result.data)
        }
      } catch (error) {
        console.error('Failed to fetch tags:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchTags()
  }, [])

  // Filter tags based on search query
  useEffect(() => {
    const query = searchQuery.toLowerCase().trim()

    if (!query) {
      setFilteredTags(allTags)
    } else {
      setFilteredTags(
        allTags.filter((tag) => tag.name.includes(query))
      )
    }
  }, [searchQuery, allTags])

  // Calculate font size based on tag count for cloud effect
  const getTagSize = (count: number, min: number, max: number) => {
    if (allTags.length === 0) return 'text-base'

    const maxCount = Math.max(...allTags.map((t) => t.count))
    const minCount = Math.min(...allTags.map((t) => t.count))

    if (maxCount === minCount) return 'text-base'

    const percentage = (count - minCount) / (maxCount - minCount)
    const sizePercent = min + percentage * (max - min)

    if (sizePercent >= 2.4) return 'text-4xl font-bold'
    if (sizePercent >= 2) return 'text-3xl font-bold'
    if (sizePercent >= 1.6) return 'text-2xl font-semibold'
    if (sizePercent >= 1.3) return 'text-xl font-semibold'
    if (sizePercent >= 1.1) return 'text-lg font-medium'
    return 'text-base'
  }

  return (
    <>
      <Navbar />
      <div className="min-h-screen flex flex-col bg-gray-50">
        <PageHeader
          title="Explore Campaign Tags"
          description="Discover campaigns by browsing popular tags and topics from our community"
        />

        <main className="flex-1 px-4 sm:px-6 lg:px-8 py-12 max-w-6xl mx-auto w-full">
          {/* Search Bar */}
          <div className="mb-12">
            <div className="relative max-w-md mx-0">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <Input
                type="text"
                placeholder="Search tags..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-4 py-2 text-base"
              />
            </div>
          </div>

          {/* Tags Cloud */}
          {loading ? (
            <div className="flex justify-center items-center py-20">
              <Loader2 className="w-8 h-8 animate-spin text-violet-600" />
            </div>
          ) : filteredTags.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-gray-600 text-lg">
                {searchQuery
                  ? 'No tags found matching your search'
                  : 'No tags available yet'}
              </p>
              {searchQuery && (
                <Button
                  variant="outline"
                  onClick={() => setSearchQuery('')}
                  className="mt-4"
                >
                  Clear search
                </Button>
              )}
            </div>
          ) : (
            <div className="flex flex-wrap gap-4 justify-center">
              {filteredTags.map((tag) => (
                <Link
                  key={tag.name}
                  href={`/tags/${encodeURIComponent(tag.name)}`}
                  className="group"
                >
                  <div
                    className={cn(
                      'px-4 py-2 rounded-full bg-white border-2 border-gray-200 hover:border-violet-500 transition-all duration-200 hover:shadow-md cursor-pointer',
                      getTagSize(tag.count, 0.8, 2.5)
                    )}
                  >
                    <div className="text-gray-800 group-hover:text-violet-600 transition-colors">
                      {tag.name}
                    </div>
                    <div className="text-xs text-gray-500 group-hover:text-violet-500 transition-colors text-center mt-1">
                      {tag.count} {tag.count === 1 ? 'campaign' : 'campaigns'}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}

          {/* Stats */}
          {!loading && allTags.length > 0 && (
            <div className="mt-16 text-center text-gray-600">
              <p className="text-sm">
                Showing {filteredTags.length} of {allTags.length} tags
              </p>
            </div>
          )}
        </main>
      </div>
      <Footer />
    </>
  )
}
