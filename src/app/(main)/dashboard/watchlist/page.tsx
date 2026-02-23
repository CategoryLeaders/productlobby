'use client'

import React, { useEffect, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { DashboardLayout } from '@/components/shared/dashboard-layout'
import { PageHeader } from '@/components/shared/page-header'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Spinner } from '@/components/ui/spinner'
import { EmptyState } from '@/components/ui/empty-state'
import { WatchButton } from '@/components/campaigns/watch-button'
import { Eye, ArrowRight } from 'lucide-react'

interface WatchedCampaign {
  id: string
  title: string
  slug: string
  description: string
  category: string
  image?: string
  status: string
  lobbyCount: number
  createdAt: string
  updatedAt: string
}

interface WatchlistResponse {
  success: boolean
  data: {
    campaigns: WatchedCampaign[]
    pagination: {
      page: number
      limit: number
      total: number
      totalPages: number
      hasMore: boolean
    }
  }
}

const getCategoryColor = (category: string) => {
  const colors: Record<string, string> = {
    TECHNOLOGY: 'blue',
    FASHION: 'pink',
    HOME: 'purple',
    HEALTH: 'green',
    FOOD: 'orange',
    SPORTS: 'red',
    AUTOMOTIVE: 'gray',
    BEAUTY: 'rose',
    LIFESTYLE: 'amber',
    OTHER: 'slate',
  }
  return colors[category] || 'slate'
}

const getStatusColor = (status: string) => {
  switch (status) {
    case 'LIVE':
      return 'lime'
    case 'DRAFT':
      return 'gray'
    case 'PAUSED':
      return 'yellow'
    case 'CLOSED':
      return 'slate'
    default:
      return 'slate'
  }
}

const getStatusLabel = (status: string) => {
  switch (status) {
    case 'LIVE':
      return 'Live'
    case 'DRAFT':
      return 'Draft'
    case 'PAUSED':
      return 'Paused'
    case 'CLOSED':
      return 'Closed'
    default:
      return status
  }
}

export default function WatchlistPage() {
  const [campaigns, setCampaigns] = useState<WatchedCampaign[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [total, setTotal] = useState(0)

  const ITEMS_PER_PAGE = 12

  useEffect(() => {
    const fetchWatchlist = async () => {
      try {
        setLoading(true)
        setError(null)

        const res = await fetch(
          `/api/user/watchlist?page=${page}&limit=${ITEMS_PER_PAGE}`
        )

        if (!res.ok) {
          if (res.status === 401) {
            throw new Error('Please log in to view your watchlist')
          }
          throw new Error('Failed to load watchlist')
        }

        const data: WatchlistResponse = await res.json()
        setCampaigns(data.data.campaigns)
        setTotalPages(data.data.pagination.totalPages)
        setTotal(data.data.pagination.total)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load watchlist')
      } finally {
        setLoading(false)
      }
    }

    fetchWatchlist()
  }, [page])

  const handleUnwatch = (campaignId: string) => {
    setCampaigns((prev) =>
      prev.filter((campaign) => campaign.id !== campaignId)
    )
    setTotal((prev) => prev - 1)
  }

  if (loading) {
    return (
      <DashboardLayout role="supporter">
        <div className="flex justify-center py-16">
          <Spinner />
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout role="supporter">
      {/* Page Header */}
      <PageHeader
        title="Campaign Watchlist"
        description="Keep track of campaigns you're interested in and get updates"
      />

      {/* Empty State */}
      {campaigns.length === 0 ? (
        <EmptyState
          icon={<Eye size={48} className="text-gray-400" />}
          title="No campaigns watched yet"
          description="Start watching campaigns to track updates and never miss important changes"
          action={{
            label: 'Explore Campaigns',
            onClick: () => (window.location.href = '/campaigns'),
          }}
        />
      ) : (
        <>
          {/* Summary Stats */}
          <div className="mb-8 flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">
                You're watching{' '}
                <span className="font-semibold text-gray-900">{total}</span>{' '}
                {total === 1 ? 'campaign' : 'campaigns'}
              </p>
            </div>
          </div>

          {/* Campaign Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {campaigns.map((campaign) => (
              <Card
                key={campaign.id}
                className="overflow-hidden hover:shadow-lg transition-shadow duration-200"
              >
                {/* Campaign Image */}
                {campaign.image && (
                  <div className="relative w-full h-40 bg-gray-100">
                    <Image
                      src={campaign.image}
                      alt={campaign.title}
                      fill
                      className="object-cover"
                    />
                  </div>
                )}

                <CardContent className="p-6">
                  {/* Category & Status Badge */}
                  <div className="flex gap-2 mb-3">
                    <Badge color={getCategoryColor(campaign.category)}>
                      {campaign.category}
                    </Badge>
                    <Badge color={getStatusColor(campaign.status)}>
                      {getStatusLabel(campaign.status)}
                    </Badge>
                  </div>

                  {/* Campaign Title */}
                  <Link href={`/campaigns/${campaign.slug}`}>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2 hover:text-violet-600 transition-colors duration-200 line-clamp-2">
                      {campaign.title}
                    </h3>
                  </Link>

                  {/* Description */}
                  <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                    {campaign.description}
                  </p>

                  {/* Lobby Count */}
                  <div className="mb-4 pb-4 border-b border-gray-200">
                    <p className="text-xs text-gray-600 uppercase tracking-wide font-medium mb-1">
                      Lobbies
                    </p>
                    <p className="text-2xl font-bold text-violet-600">
                      {campaign.lobbyCount.toLocaleString()}
                    </p>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2">
                    <Button
                      asChild
                      variant="outline"
                      className="flex-1 gap-2"
                    >
                      <Link href={`/campaigns/${campaign.slug}`}>
                        View
                        <ArrowRight size={16} />
                      </Link>
                    </Button>
                    <div className="flex-1">
                      <WatchButton
                        campaignId={campaign.id}
                        initialWatching={true}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="mt-8 flex justify-center items-center gap-2">
              <Button
                variant="outline"
                disabled={page === 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
              >
                Previous
              </Button>

              <div className="flex items-center gap-2">
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  let pageNum: number
                  if (totalPages <= 5) {
                    pageNum = i + 1
                  } else if (page <= 3) {
                    pageNum = i + 1
                  } else if (page >= totalPages - 2) {
                    pageNum = totalPages - 4 + i
                  } else {
                    pageNum = page - 2 + i
                  }

                  return (
                    <Button
                      key={pageNum}
                      variant={page === pageNum ? 'primary' : 'outline'}
                      size="sm"
                      onClick={() => setPage(pageNum)}
                    >
                      {pageNum}
                    </Button>
                  )
                })}
              </div>

              <Button
                variant="outline"
                disabled={page === totalPages}
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              >
                Next
              </Button>
            </div>
          )}
        </>
      )}
    </DashboardLayout>
  )
}
