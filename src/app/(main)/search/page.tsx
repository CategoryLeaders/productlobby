'use client'

import React, { useState, useEffect, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Search, User, FileText } from 'lucide-react'
import { cn } from '@/lib/utils'

interface SearchResult {
  campaigns?: Array<{
    id: string
    title: string
    slug: string
    description: string
    category: string
    status: string
    creator: {
      id: string
      displayName: string
      avatar: string | null
      handle: string | null
    }
    lobbyCount: number
  }>
  users?: Array<{
    id: string
    displayName: string
    handle: string | null
    avatar: string | null
    bio: string | null
    contributionScore: number
  }>
}

type TabType = 'all' | 'campaigns' | 'users'

function SearchContent() {
  const searchParams = useSearchParams()
  const query = searchParams.get('q') || ''
  const [results, setResults] = useState<SearchResult | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<TabType>('all')

  useEffect(() => {
    const fetchResults = async () => {
      if (!query || query.trim().length < 2) {
        setResults(null)
        setIsLoading(false)
        return
      }

      setIsLoading(true)
      setError(null)

      try {
        const response = await fetch(`/api/search?q=${encodeURIComponent(query)}&limit=50`)
        if (response.ok) {
          const data = await response.json()
          setResults(data)
        } else {
          setError('Failed to fetch search results')
        }
      } catch (err) {
        setError('An error occurred while searching')
        console.error('Search error:', err)
      } finally {
        setIsLoading(false)
      }
    }

    fetchResults()
  }, [query])

  const campaigns = results?.campaigns || []
  const users = results?.users || []

  const showCampaigns =
    activeTab === 'all' || activeTab === 'campaigns'
  const showUsers = activeTab === 'all' || activeTab === 'users'

  const noResults = !isLoading && campaigns.length === 0 && users.length === 0

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-4 py-8">
          <div className="flex items-center gap-3 mb-6">
            <Search className="w-8 h-8 text-violet-600" />
            <h1 className="text-3xl font-bold text-gray-900">
              Search Results
            </h1>
          </div>

          {query ? (
            <p className="text-lg text-gray-600">
              Results for <span className="font-semibold">"{query}"</span>
            </p>
          ) : (
            <p className="text-lg text-gray-600">
              Enter a search query to get started
            </p>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Tabs */}
        {!noResults && (
          <div className="flex gap-8 border-b border-gray-200 mb-8">
            <button
              onClick={() => setActiveTab('all')}
              className={cn(
                'pb-3 px-1 font-medium text-sm transition-colors relative',
                activeTab === 'all'
                  ? 'text-violet-600'
                  : 'text-gray-600 hover:text-gray-900',
                activeTab === 'all' && 'border-b-2 border-violet-600'
              )}
            >
              All Results {campaigns.length + users.length > 0 && `(${campaigns.length + users.length})`}
            </button>
            <button
              onClick={() => setActiveTab('campaigns')}
              className={cn(
                'pb-3 px-1 font-medium text-sm transition-colors relative',
                activeTab === 'campaigns'
                  ? 'text-violet-600'
                  : 'text-gray-600 hover:text-gray-900',
                activeTab === 'campaigns' && 'border-b-2 border-violet-600'
              )}
            >
              Campaigns {campaigns.length > 0 && `(${campaigns.length})`}
            </button>
            <button
              onClick={() => setActiveTab('users')}
              className={cn(
                'pb-3 px-1 font-medium text-sm transition-colors relative',
                activeTab === 'users'
                  ? 'text-violet-600'
                  : 'text-gray-600 hover:text-gray-900',
                activeTab === 'users' && 'border-b-2 border-violet-600'
              )}
            >
              Users {users.length > 0 && `(${users.length})`}
            </button>
          </div>
        )}

        {/* Loading State */}
        {isLoading && (
          <div className="flex justify-center py-12">
            <div className="text-center">
              <div className="inline-block">
                <div className="w-12 h-12 border-4 border-violet-200 border-t-violet-600 rounded-full animate-spin"></div>
              </div>
              <p className="mt-4 text-gray-600">Searching...</p>
            </div>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-8">
            <p className="text-red-700 font-medium">{error}</p>
          </div>
        )}

        {/* No Results State */}
        {noResults && (
          <div className="text-center py-12">
            <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              No results found
            </h2>
            <p className="text-gray-600 max-w-md mx-auto">
              {query
                ? `We couldn't find any campaigns or users matching "${query}". Try using different keywords.`
                : 'Enter a search query to find campaigns and users.'}
            </p>
          </div>
        )}

        {/* Results */}
        {!isLoading && !error && !noResults && (
          <div className="space-y-8">
            {/* Campaigns Section */}
            {showCampaigns && campaigns.length > 0 && (
              <div>
                <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <FileText className="w-5 h-5 text-violet-600" />
                  Campaigns ({campaigns.length})
                </h2>
                <div className="space-y-4">
                  {campaigns.map((campaign) => (
                    <Link
                      key={campaign.id}
                      href={`/campaigns/${campaign.slug}`}
                      className={cn(
                        'block p-6 bg-white border border-gray-200 rounded-lg',
                        'hover:border-violet-300 hover:shadow-md transition-all'
                      )}
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <h3 className="text-lg font-bold text-gray-900 mb-1">
                            {campaign.title}
                          </h3>
                          <p className="text-sm text-gray-600 line-clamp-2">
                            {campaign.description}
                          </p>
                        </div>
                        <span className={cn(
                          'ml-4 px-3 py-1 rounded-full text-xs font-semibold flex-shrink-0',
                          campaign.status === 'LIVE'
                            ? 'bg-green-100 text-green-700'
                            : campaign.status === 'DRAFT'
                            ? 'bg-gray-100 text-gray-700'
                            : campaign.status === 'PAUSED'
                            ? 'bg-yellow-100 text-yellow-700'
                            : 'bg-red-100 text-red-700'
                        )}>
                          {campaign.status}
                        </span>
                      </div>

                      <div className="flex items-center gap-4 text-sm text-gray-500">
                        <div className="flex items-center gap-2">
                          {campaign.creator.avatar && (
                            <img
                              src={campaign.creator.avatar}
                              alt={campaign.creator.displayName}
                              className="w-6 h-6 rounded-full object-cover"
                            />
                          )}
                          <span>{campaign.creator.displayName}</span>
                        </div>

                        <span className="text-gray-300">•</span>
                        <span>{campaign.category}</span>

                        <span className="text-gray-300">•</span>
                        <span>{campaign.lobbyCount} {campaign.lobbyCount === 1 ? 'supporter' : 'supporters'}</span>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* Users Section */}
            {showUsers && users.length > 0 && (
              <div>
                <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <User className="w-5 h-5 text-violet-600" />
                  Users ({users.length})
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {users.map((user) => (
                    <Link
                      key={user.id}
                      href={`/users/${user.handle || user.id}`}
                      className={cn(
                        'p-6 bg-white border border-gray-200 rounded-lg',
                        'hover:border-violet-300 hover:shadow-md transition-all'
                      )}
                    >
                      <div className="flex items-start gap-4">
                        {user.avatar && (
                          <img
                            src={user.avatar}
                            alt={user.displayName}
                            className="w-12 h-12 rounded-full object-cover flex-shrink-0"
                          />
                        )}
                        <div className="flex-1 min-w-0">
                          <h3 className="font-bold text-gray-900 truncate">
                            {user.displayName}
                          </h3>
                          {user.handle && (
                            <p className="text-sm text-gray-500 truncate">
                              @{user.handle}
                            </p>
                          )}
                          {user.bio && (
                            <p className="text-sm text-gray-600 mt-2 line-clamp-2">
                              {user.bio}
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="mt-4 text-xs text-gray-500">
                        <span className="font-semibold text-violet-600">
                          {user.contributionScore}
                        </span>
                        {' contribution points'}
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export default function SearchPage() {
  return (
    <Suspense fallback={<div>Loading search...</div>}>
      <SearchContent />
    </Suspense>
  )
}
