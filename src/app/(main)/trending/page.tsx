'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { TrendingUp, Flame, Calendar, Users } from 'lucide-react'
import { cn } from '@/lib/utils'

interface TrendingCampaign {
  id: string
  rank: number
  title: string
  slug: string
  description: string
  image?: string
  lobbyCount: number
  followCount: number
  commentCount: number
  trendScore: number
  creator: {
    id: string
    displayName: string
    avatar?: string
  }
  targetedBrand?: {
    id: string
    name: string
    logo?: string
  }
  recentActivity: {
    lobbies: number
    comments: number
    shares: number
    follows: number
  }
}

type Period = '24h' | '7d' | '30d'

export default function TrendingPage() {
  const [campaigns, setCampaigns] = useState<TrendingCampaign[]>([])
  const [period, setPeriod] = useState<Period>('24h')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchTrending = async () => {
      try {
        setLoading(true)
        const response = await fetch(
          `/api/campaigns/trending?limit=20&period=${period}`
        )
        if (!response.ok) {
          throw new Error('Failed to fetch trending campaigns')
        }
        const data = await response.json()
        setCampaigns(data.data.campaigns || [])
      } catch (err) {
        setError(
          err instanceof Error ? err.message : 'Failed to load trending campaigns'
        )
      } finally {
        setLoading(false)
      }
    }

    fetchTrending()
  }, [period])

  const periodLabels = {
    '24h': 'Last 24 Hours',
    '7d': 'Last 7 Days',
    '30d': 'Last 30 Days',
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-violet-600 to-violet-700 text-white py-12">
        <div className="container mx-auto px-4">
          <div className="flex items-center gap-3 mb-3">
            <TrendingUp className="w-8 h-8" />
            <h1 className="text-4xl font-bold">Trending Campaigns</h1>
          </div>
          <p className="text-violet-100 text-lg max-w-2xl">
            Discover the most talked about campaigns right now. See what the community is
            supporting and follow along.
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Period Selector */}
        <div className="mb-8 flex gap-3 justify-center">
          {(Object.keys(periodLabels) as Period[]).map((p) => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={cn(
                'px-6 py-2.5 rounded-lg font-medium transition-all duration-200',
                period === p
                  ? 'bg-violet-600 text-white shadow-lg'
                  : 'bg-white text-gray-700 border border-gray-200 hover:border-violet-300 hover:text-violet-600'
              )}
            >
              {periodLabels[p]}
            </button>
          ))}
        </div>

        {/* Loading State */}
        {loading && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="animate-pulse bg-white rounded-lg border border-gray-200 h-64"
              />
            ))}
          </div>
        )}

        {/* Error State */}
        {error && !loading && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
            <p className="text-red-600 font-medium">{error}</p>
          </div>
        )}

        {/* Empty State */}
        {!loading && !error && campaigns.length === 0 && (
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-12 text-center">
            <TrendingUp className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 text-lg font-medium">No trending campaigns yet</p>
            <p className="text-gray-500 mt-2">Check back soon!</p>
          </div>
        )}

        {/* Campaigns Grid */}
        {!loading && !error && campaigns.length > 0 && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              {campaigns.map((campaign) => (
                <Link
                  key={campaign.id}
                  href={`/campaigns/${campaign.slug}`}
                  className="group relative bg-white rounded-lg border border-gray-200 overflow-hidden hover:border-violet-300 hover:shadow-xl transition-all duration-300"
                >
                  {/* Rank Badge */}
                  <div className="absolute top-3 left-3 z-10 w-10 h-10 rounded-lg bg-gradient-to-br from-violet-600 to-violet-700 text-white font-bold flex items-center justify-center shadow-lg">
                    {campaign.rank}
                  </div>

                  {/* Hot Badge */}
                  {campaign.rank <= 3 && (
                    <div className="absolute top-3 right-3 z-10 flex items-center gap-1 bg-gradient-to-r from-orange-500 to-orange-600 text-white px-3 py-1 rounded-full text-sm font-bold">
                      <Flame className="w-4 h-4" />
                      Hot
                    </div>
                  )}

                  {/* Image */}
                  <div className="relative h-40 overflow-hidden bg-gray-100">
                    {campaign.image ? (
                      <img
                        src={campaign.image}
                        alt={campaign.title}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-violet-100 to-lime-100">
                        <TrendingUp className="w-12 h-12 text-violet-400" />
                      </div>
                    )}
                  </div>

                  {/* Content */}
                  <div className="p-4 space-y-3">
                    {/* Title */}
                    <h3 className="font-bold text-lg text-gray-900 group-hover:text-violet-600 line-clamp-2">
                      {campaign.title}
                    </h3>

                    {/* Description */}
                    <p className="text-sm text-gray-600 line-clamp-2">
                      {campaign.description}
                    </p>

                    {/* Creator & Brand */}
                    <div className="flex items-center gap-2 pt-2 border-t border-gray-100">
                      {campaign.creator.avatar && (
                        <img
                          src={campaign.creator.avatar}
                          alt={campaign.creator.displayName}
                          className="w-6 h-6 rounded-full"
                        />
                      )}
                      <span className="text-xs font-medium text-gray-600">
                        {campaign.creator.displayName}
                      </span>

                      {campaign.targetedBrand && (
                        <>
                          <span className="text-gray-300">•</span>
                          {campaign.targetedBrand.logo && (
                            <img
                              src={campaign.targetedBrand.logo}
                              alt={campaign.targetedBrand.name}
                              className="w-5 h-5 rounded"
                            />
                          )}
                          <span className="text-xs text-gray-600">
                            {campaign.targetedBrand.name}
                          </span>
                        </>
                      )}
                    </div>

                    {/* Stats */}
                    <div className="grid grid-cols-3 gap-2 pt-3 border-t border-gray-100">
                      <div className="text-center">
                        <div className="text-lg font-bold text-violet-600">
                          {campaign.lobbyCount}
                        </div>
                        <div className="text-xs text-gray-600">Support</div>
                      </div>
                      <div className="text-center">
                        <div className="text-lg font-bold text-lime-600">
                          {campaign.recentActivity.lobbies}
                        </div>
                        <div className="text-xs text-gray-600">This Period</div>
                      </div>
                      <div className="text-center">
                        <div className="text-lg font-bold text-blue-600">
                          {campaign.followCount}
                        </div>
                        <div className="text-xs text-gray-600">Followers</div>
                      </div>
                    </div>

                    {/* Activity Breakdown */}
                    <div className="flex gap-2 text-xs text-gray-600 pt-2">
                      {campaign.recentActivity.comments > 0 && (
                        <span>💬 {campaign.recentActivity.comments} comments</span>
                      )}
                      {campaign.recentActivity.shares > 0 && (
                        <span>📤 {campaign.recentActivity.shares} shares</span>
                      )}
                    </div>
                  </div>
                </Link>
              ))}
            </div>

            {/* Legend */}
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <h3 className="font-semibold text-gray-900 mb-3">How we rank trending</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div className="flex gap-3">
                  <div className="text-2xl">📈</div>
                  <div>
                    <p className="font-medium text-gray-900">Recent Support</p>
                    <p className="text-gray-600">New lobbies in this period</p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <div className="text-2xl">💬</div>
                  <div>
                    <p className="font-medium text-gray-900">Engagement</p>
                    <p className="text-gray-600">Comments and community activity</p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <div className="text-2xl">⭐</div>
                  <div>
                    <p className="font-medium text-gray-900">Signal Score</p>
                    <p className="text-gray-600">Overall campaign momentum</p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <div className="text-2xl">👥</div>
                  <div>
                    <p className="font-medium text-gray-900">Total Support</p>
                    <p className="text-gray-600">Cumulative community backing</p>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
