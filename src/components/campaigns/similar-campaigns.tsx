'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { formatNumber } from '@/lib/utils'
import { Campaign } from '@prisma/client'

interface SimilarCampaign extends Campaign {
  creator: {
    id: string
    displayName: string
    handle: string | null
    avatar: string | null
  }
  media: Array<{
    id: string
    url: string
    kind: string
    order: number
  }>
  _count: {
    lobbies: number
    follows: number
  }
  overlapCount: number
}

interface SimilarCampaignsProps {
  campaignId: string
}

export function SimilarCampaigns({ campaignId }: SimilarCampaignsProps) {
  const [campaigns, setCampaigns] = useState<SimilarCampaign[]>([])
  const [totalContributors, setTotalContributors] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchSimilarCampaigns() {
      try {
        setIsLoading(true)
        const response = await fetch(`/api/campaigns/${campaignId}/similar`)

        if (!response.ok) {
          throw new Error('Failed to fetch similar campaigns')
        }

        const data = await response.json()

        if (data.success) {
          setCampaigns(data.data.similarCampaigns)
          setTotalContributors(data.data.totalContributors)
        } else {
          setError(data.error)
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error')
      } finally {
        setIsLoading(false)
      }
    }

    fetchSimilarCampaigns()
  }, [campaignId])

  if (isLoading) {
    return (
      <div className="space-y-4 animate-pulse">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-24 bg-gray-200 rounded-lg" />
        ))}
      </div>
    )
  }

  if (error || campaigns.length === 0) {
    return null
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-gray-900">People Also Lobbied</h2>
        <p className="text-sm text-gray-500 mt-1">
          {formatNumber(totalContributors)} supporters also backed these campaigns
        </p>
      </div>

      <div className="space-y-3">
        {campaigns.map((campaign) => (
          <Link
            key={campaign.id}
            href={`/campaigns/${campaign.slug}`}
            className="group block p-4 border border-gray-200 rounded-lg hover:border-violet-400 hover:shadow-md transition-all"
          >
            <div className="flex gap-4">
              {campaign.media.length > 0 && (
                <div className="flex-shrink-0 w-20 h-20 bg-gray-100 rounded overflow-hidden">
                  <img
                    src={campaign.media[0].url}
                    alt={campaign.title}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}

              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-gray-900 group-hover:text-violet-600 transition-colors truncate">
                  {campaign.title}
                </h3>
                <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                  {campaign.description}
                </p>

                <div className="flex items-center gap-4 mt-3 text-xs text-gray-500">
                  <span className="inline-flex items-center gap-1">
                    <span className="w-4 h-4 rounded-full bg-lime-400 flex items-center justify-center">
                      <span className="text-xs font-bold text-gray-900">+</span>
                    </span>
                    {formatNumber(campaign.overlapCount)} shared supporters
                  </span>
                  <span>{formatNumber(campaign._count.lobbies)} lobbies</span>
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}
