'use client'

import React, {
  useState,
  useEffect,
  useRef,
  useCallback,
  useMemo,
} from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  Search,
  X,
  TrendingUp,
  Building2,
  User,
  ArrowRight,
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Avatar } from '@/components/ui/avatar'
import { cn } from '@/lib/utils'
import { Spinner } from '@/components/ui/spinner'

interface SearchResult {
  campaigns: Array<{
    id: string
    title: string
    slug: string
    description: string | null
    category: string | null
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
    lobbyCount: number
  }>
  brands: Array<{
    id: string
    name: string
    slug: string
    logo: string | null
    campaignCount: number
  }>
  creators: Array<{
    id: string
    displayName: string
    handle: string | null
    avatar: string | null
    bio: string | null
    campaignCount: number
  }>
}

interface TrendingCampaign {
  id: string
  title: string
  slug: string
  description: string | null
  category: string | null
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
  lobbyCount: number
  trendPercentage?: number
}

const DEBOUNCE_MS = 300
const STORAGE_KEY = 'productlobby-recent-searches'

export interface SearchCommandProps {
  isOpen: boolean
  onClose: () => void
}

export const SearchCommand: React.FC<SearchCommandProps> = ({
  isOpen,
  onClose,
}) => {
  const router = useRouter()
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<SearchResult>({
    campaigns: [],
    brands: [],
    creators: [],
  })
  const [trendingCampaigns, setTrendingCampaigns] = useState<TrendingCampaign[]>([])
  const [recentSearches, setRecentSearches] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [selectedIndex, setSelectedIndex] = useState(0)

  const inputRef = useRef<HTMLInputElement>(null)
  const abortControllerRef = useRef<AbortController | null>(null)
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null)

  // Load recent searches from localStorage
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored) {
      try {
        setRecentSearches(JSON.parse(stored))
      } catch (e) {
        console.error('Failed to parse recent searches', e)
      }
    }
  }, [])

  // Load trending campaigns when modal opens and query is empty
  useEffect(() => {
    if (isOpen && !query) {
      loadTrendingCampaigns()
    }
  }, [isOpen, query])

  // Focus input when modal opens
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 0)
    }
  }, [isOpen])

  const loadTrendingCampaigns = useCallback(async () => {
    try {
      const response = await fetch('/api/campaigns/trending?limit=5')
      if (response.ok) {
        const data = await response.json()
        setTrendingCampaigns(data.data || [])
      }
    } catch (error) {
      console.error('Failed to load trending campaigns', error)
    }
  }, [])

  // Search handler with debouncing
  const handleSearch = useCallback(async (searchTerm: string) => {
    // Clear previous debounce timer
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current)
    }

    // Cancel previous request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
    }

    if (!searchTerm.trim()) {
      setResults({
        campaigns: [],
        brands: [],
        creators: [],
      })
      setSelectedIndex(0)
      return
    }

    // Set debounce timer for new search
    debounceTimerRef.current = setTimeout(async () => {
      try {
        setIsLoading(true)
        abortControllerRef.current = new AbortController()

        const response = await fetch(
          `/api/search?q=${encodeURIComponent(searchTerm)}&limit=5`,
          { signal: abortControllerRef.current.signal }
        )

        if (response.ok) {
          const data: SearchResult = await response.json()
          setResults(data)
          setSelectedIndex(0)
        }
      } catch (error: any) {
        if (error.name !== 'AbortError') {
          console.error('Search failed', error)
        }
      } finally {
        setIsLoading(false)
      }
    }, DEBOUNCE_MS)
  }, [])

  // Handle query change
  const handleQueryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newQuery = e.target.value
    setQuery(newQuery)
    handleSearch(newQuery)
  }

  // Save search to recent searches
  const saveRecentSearch = (searchTerm: string) => {
    if (!searchTerm.trim()) return

    const updated = [
      searchTerm,
      ...recentSearches.filter((s) => s !== searchTerm),
    ].slice(0, 5)

    setRecentSearches(updated)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated))
  }

  // Clear recent searches
  const clearRecentSearches = () => {
    setRecentSearches([])
    localStorage.removeItem(STORAGE_KEY)
  }

  // Get all selectable items in order
  const allItems = useMemo(() => {
    const items: Array<{
      type: 'campaign' | 'brand' | 'creator'
      data: any
      href: string
    }> = []

    results.campaigns.forEach((campaign) => {
      items.push({
        type: 'campaign',
        data: campaign,
        href: `/campaigns/${campaign.slug}`,
      })
    })

    results.brands.forEach((brand) => {
      items.push({
        type: 'brand',
        data: brand,
        href: `/brands/${brand.slug}`,
      })
    })

    results.creators.forEach((creator) => {
      items.push({
        type: 'creator',
        data: creator,
        href: `/profile/${creator.handle || creator.id}`,
      })
    })

    return items
  }, [results])

  // Handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Escape') {
      onClose()
      return
    }

    // Arrow down
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setSelectedIndex((prev) =>
        prev < allItems.length - 1 ? prev + 1 : prev
      )
    }

    // Arrow up
    if (e.key === 'ArrowUp') {
      e.preventDefault()
      setSelectedIndex((prev) => (prev > 0 ? prev - 1 : 0))
    }

    // Enter
    if (e.key === 'Enter') {
      e.preventDefault()
      if (query.trim()) {
        if (allItems.length > 0 && selectedIndex < allItems.length) {
          // Navigate to selected item
          const item = allItems[selectedIndex]
          saveRecentSearch(query)
          router.push(item.href)
          onClose()
        } else {
          // Navigate to view all results
          saveRecentSearch(query)
          router.push(`/campaigns?q=${encodeURIComponent(query)}`)
          onClose()
        }
      }
    }
  }

  // Handle item click
  const handleItemClick = (href: string) => {
    saveRecentSearch(query)
    router.push(href)
    onClose()
  }

  // Handle recent search click
  const handleRecentSearchClick = (search: string) => {
    setQuery(search)
    handleSearch(search)
  }

  // Close on backdrop click
  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose()
    }
  }

  if (!isOpen) return null

  const hasResults = allItems.length > 0
  const showEmpty = query.trim() && !hasResults && !isLoading
  const showTrending =
    !query.trim() && trendingCampaigns.length > 0
  const showRecent =
    !query.trim() && recentSearches.length > 0

  return (
    <div
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-start justify-center pt-20"
      onClick={handleBackdropClick}
    >
      <div className="w-full max-w-2xl mx-4 animate-fade-in">
        {/* Search Input Container */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-200">
          {/* Input Section */}
          <div className="flex items-center gap-3 px-4 py-4 border-b border-gray-200">
            <Search size={20} className="text-gray-400 flex-shrink-0" />
            <input
              ref={inputRef}
              type="text"
              placeholder="Search campaigns, brands, creators..."
              value={query}
              onChange={handleQueryChange}
              onKeyDown={handleKeyDown}
              className="flex-1 bg-transparent text-lg outline-none text-foreground placeholder:text-gray-400"
            />
            {isLoading && <Spinner size="sm" />}
            {query && (
              <button
                onClick={() => {
                  setQuery('')
                  setResults({
                    campaigns: [],
                    brands: [],
                    creators: [],
                  })
                  setSelectedIndex(0)
                }}
                className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X size={18} className="text-gray-400" />
              </button>
            )}
            <button
              onClick={onClose}
              className="px-2 py-1 text-xs font-medium text-gray-500 bg-gray-100 rounded hover:bg-gray-200 transition-colors"
            >
              ESC
            </button>
          </div>

          {/* Results Section */}
          <div className="max-h-96 overflow-y-auto">
            {showEmpty && (
              <div className="px-4 py-8 text-center text-gray-500">
                <p className="text-sm">No results found for "{query}"</p>
              </div>
            )}

            {!query.trim() && !showTrending && !showRecent && (
              <div className="px-4 py-8 text-center text-gray-500">
                <p className="text-sm">Start typing to search</p>
              </div>
            )}

            {hasResults && (
              <>
                {/* Campaigns Section */}
                {results.campaigns.length > 0 && (
                  <div>
                    <div className="px-4 pt-3 pb-2">
                      <h3 className="text-xs font-semibold text-gray-600 uppercase tracking-wide">
                        Campaigns
                      </h3>
                    </div>
                    {results.campaigns.map((campaign, idx) => {
                      const itemIndex = idx
                      const isSelected =
                        selectedIndex === itemIndex
                      return (
                        <button
                          key={campaign.id}
                          onClick={() =>
                            handleItemClick(
                              `/campaigns/${campaign.slug}`
                            )
                          }
                          className={cn(
                            'w-full px-4 py-3 text-left transition-colors duration-150 border-b border-gray-100 last:border-b-0',
                            isSelected
                              ? 'bg-violet-50'
                              : 'hover:bg-gray-50'
                          )}
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div className="flex-1 min-w-0">
                              <p className="font-medium text-sm text-foreground truncate">
                                {campaign.title}
                              </p>
                              <p className="text-xs text-gray-600 truncate mt-0.5">
                                {campaign.description?.substring(
                                  0,
                                  60
                                )}
                                {campaign.description &&
                                  campaign.description.length > 60
                                  ? '...'
                                  : ''}
                              </p>
                              <div className="flex items-center gap-2 mt-2">
                                {campaign.category && (
                                  <Badge
                                    variant="outline"
                                    size="sm"
                                  >
                                    {campaign.category}
                                  </Badge>
                                )}
                                <span className="text-xs text-gray-500">
                                  {campaign.lobbyCount}{' '}
                                  supporter
                                  {campaign.lobbyCount !==
                                    1
                                    ? 's'
                                    : ''}
                                </span>
                              </div>
                            </div>
                            {isSelected && (
                              <ArrowRight
                                size={16}
                                className="text-violet-600 flex-shrink-0 mt-0.5"
                              />
                            )}
                          </div>
                        </button>
                      )
                    })}
                  </div>
                )}

                {/* Brands Section */}
                {results.brands.length > 0 && (
                  <div>
                    <div className="px-4 pt-3 pb-2">
                      <h3 className="text-xs font-semibold text-gray-600 uppercase tracking-wide">
                        Brands
                      </h3>
                    </div>
                    {results.brands.map((brand, idx) => {
                      const itemIndex =
                        results.campaigns.length + idx
                      const isSelected =
                        selectedIndex === itemIndex
                      return (
                        <button
                          key={brand.id}
                          onClick={() =>
                            handleItemClick(
                              `/brands/${brand.slug}`
                            )
                          }
                          className={cn(
                            'w-full px-4 py-3 text-left transition-colors duration-150 border-b border-gray-100 last:border-b-0',
                            isSelected
                              ? 'bg-violet-50'
                              : 'hover:bg-gray-50'
                          )}
                        >
                          <div className="flex items-center justify-between gap-3">
                            <div className="flex items-center gap-3 flex-1 min-w-0">
                              {brand.logo && (
                                <img
                                  src={brand.logo}
                                  alt={brand.name}
                                  className="w-6 h-6 rounded-lg object-cover flex-shrink-0"
                                />
                              )}
                              {!brand.logo && (
                                <Building2
                                  size={16}
                                  className="text-gray-400 flex-shrink-0"
                                />
                              )}
                              <div className="flex-1 min-w-0">
                                <p className="font-medium text-sm text-foreground truncate">
                                  {brand.name}
                                </p>
                                <p className="text-xs text-gray-500">
                                  {brand.campaignCount}{' '}
                                  campaign
                                  {brand.campaignCount !==
                                    1
                                    ? 's'
                                    : ''}
                                </p>
                              </div>
                            </div>
                            {isSelected && (
                              <ArrowRight
                                size={16}
                                className="text-violet-600 flex-shrink-0"
                              />
                            )}
                          </div>
                        </button>
                      )
                    })}
                  </div>
                )}

                {/* Creators Section */}
                {results.creators.length > 0 && (
                  <div>
                    <div className="px-4 pt-3 pb-2">
                      <h3 className="text-xs font-semibold text-gray-600 uppercase tracking-wide">
                        Creators
                      </h3>
                    </div>
                    {results.creators.map((creator, idx) => {
                      const itemIndex =
                        results.campaigns.length +
                        results.brands.length +
                        idx
                      const isSelected =
                        selectedIndex === itemIndex
                      return (
                        <button
                          key={creator.id}
                          onClick={() =>
                            handleItemClick(
                              `/profile/${creator.handle || creator.id}`
                            )
                          }
                          className={cn(
                            'w-full px-4 py-3 text-left transition-colors duration-150 border-b border-gray-100 last:border-b-0',
                            isSelected
                              ? 'bg-violet-50'
                              : 'hover:bg-gray-50'
                          )}
                        >
                          <div className="flex items-center justify-between gap-3">
                            <div className="flex items-center gap-3 flex-1 min-w-0">
                              <Avatar
                                src={creator.avatar || undefined}
                                alt={creator.displayName}
                                initials={creator.displayName
                                  .charAt(0)
                                  .toUpperCase()}
                                size="sm"
                              />
                              <div className="flex-1 min-w-0">
                                <p className="font-medium text-sm text-foreground truncate">
                                  {creator.displayName}
                                </p>
                                <p className="text-xs text-gray-500 truncate">
                                  {creator.handle
                                    ? `@${creator.handle}`
                                    : creator.bio?.substring(
                                        0,
                                        40
                                      ) || 'Creator'}
                                </p>
                              </div>
                            </div>
                            {isSelected && (
                              <ArrowRight
                                size={16}
                                className="text-violet-600 flex-shrink-0"
                              />
                            )}
                          </div>
                        </button>
                      )
                    })}
                  </div>
                )}

                {/* View All Results Link */}
                {query.trim() && allItems.length > 0 && (
                  <div className="px-4 py-3 border-t border-gray-200 bg-gray-50">
                    <Link
                      href={`/campaigns?q=${encodeURIComponent(
                        query
                      )}`}
                      onClick={() => {
                        saveRecentSearch(query)
                        onClose()
                      }}
                      className="flex items-center justify-between text-sm font-medium text-violet-600 hover:text-violet-700 transition-colors"
                    >
                      <span>View all results</span>
                      <ArrowRight size={16} />
                    </Link>
                  </div>
                )}
              </>
            )}

            {/* Trending Campaigns Section */}
            {showTrending && (
              <div>
                <div className="px-4 pt-3 pb-2">
                  <h3 className="text-xs font-semibold text-gray-600 uppercase tracking-wide flex items-center gap-1.5">
                    <TrendingUp size={14} />
                    Trending Now
                  </h3>
                </div>
                {trendingCampaigns.map((campaign, idx) => (
                  <button
                    key={campaign.id}
                    onClick={() =>
                      handleItemClick(
                        `/campaigns/${campaign.slug}`
                      )
                    }
                    className={cn(
                      'w-full px-4 py-3 text-left transition-colors duration-150 border-b border-gray-100 last:border-b-0',
                      selectedIndex === idx
                        ? 'bg-violet-50'
                        : 'hover:bg-gray-50'
                    )}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm text-foreground truncate">
                          {campaign.title}
                        </p>
                        <p className="text-xs text-gray-600 truncate mt-0.5">
                          {campaign.description?.substring(
                            0,
                            60
                          )}
                          {campaign.description &&
                            campaign.description.length > 60
                            ? '...'
                            : ''}
                        </p>
                        <div className="flex items-center gap-2 mt-2">
                          {campaign.category && (
                            <Badge
                              variant="outline"
                              size="sm"
                            >
                              {campaign.category}
                            </Badge>
                          )}
                          <span className="text-xs text-gray-500">
                            {campaign.lobbyCount} supporter
                            {campaign.lobbyCount !== 1
                              ? 's'
                              : ''}
                          </span>
                        </div>
                      </div>
                      {selectedIndex === idx && (
                        <ArrowRight
                          size={16}
                          className="text-violet-600 flex-shrink-0 mt-0.5"
                        />
                      )}
                    </div>
                  </button>
                ))}
              </div>
            )}

            {/* Recent Searches Section */}
            {showRecent && (
              <div>
                <div className="px-4 pt-3 pb-2 flex items-center justify-between">
                  <h3 className="text-xs font-semibold text-gray-600 uppercase tracking-wide">
                    Recent Searches
                  </h3>
                  <button
                    onClick={clearRecentSearches}
                    className="text-xs text-gray-500 hover:text-gray-700 transition-colors"
                  >
                    Clear
                  </button>
                </div>
                {recentSearches.map((search, idx) => (
                  <button
                    key={`${search}-${idx}`}
                    onClick={() =>
                      handleRecentSearchClick(search)
                    }
                    className={cn(
                      'w-full px-4 py-2.5 text-left transition-colors duration-150 border-b border-gray-100 last:border-b-0',
                      selectedIndex === idx
                        ? 'bg-violet-50'
                        : 'hover:bg-gray-50'
                    )}
                  >
                    <div className="flex items-center justify-between gap-3">
                      <span className="text-sm text-gray-700">
                        {search}
                      </span>
                      {selectedIndex === idx && (
                        <ArrowRight
                          size={14}
                          className="text-violet-600"
                        />
                      )}
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="mt-2 text-center text-xs text-gray-500">
          <p>
            Press{' '}
            <kbd className="px-2 py-1 bg-gray-100 rounded font-mono text-xs">
              Enter
            </kbd>{' '}
            to select •{' '}
            <kbd className="px-2 py-1 bg-gray-100 rounded font-mono text-xs">
              ESC
            </kbd>{' '}
            to close
          </p>
        </div>
      </div>
    </div>
  )
}
