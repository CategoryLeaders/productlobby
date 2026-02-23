'use client'

import React, { useEffect, useState } from 'react'
import Link from 'next/link'
import { ArrowRight, Users, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { formatNumber } from '@/lib/utils'
import { Button } from '@/components/ui/button'

interface RelatedCampaign {
  id: string
  slug: string
  title: string
  description: string
  category: string
  lobbyCount: number
}

interface RelatedCampaignsWidgetProps {
  campaignId: string
}

export const RelatedCampaignsWidget: React.FC<RelatedCampaignsWidgetProps> = ({ campaignId }) => {
  const [campaigns, setCampaigns] = useState<RelatedCampaign[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchRelatedCampaigns = async () => {
      try {
        setIsLoading(true)
        setError(null)

        const response = await fetch(`/api/campaigns/${campaignId}/related`)
        if (!response.ok) {
          throw new Error('Failed to fetch related campaigns')
        }

        const data = await response.json()
        setCampaigns(data.campaigns || [])
      } catch (err) {
        console.error('Error fetching related campaigns:', err)
        setError(err instanceof Error ? err.message : 'An error occurred')
      } finally {
        setIsLoading(false)
      }
    }

    fetchRelatedCampaigns()
  }, [campaignId])

  if (isLoading) {
    return (
      <div className="rounded-lg border border-slate-200 bg-white p-6">
        <h2 className="mb-6 text-lg font-semibold text-slate-900">Related Campaigns</h2>
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-5 w-5 animate-spin text-violet-600" />
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="rounded-lg border border-slate-200 bg-white p-6">
        <h2 className="mb-6 text-lg font-semibold text-slate-900">Related Campaigns</h2>
        <div className="rounded-lg bg-slate-50 p-4 text-center text-sm text-slate-600">
          Unable to load related campaigns
        </div>
      </div>
    )
  }

  if (campaigns.length === 0) {
    return (
      <div className="rounded-lg border border-slate-200 bg-white p-6">
        <h2 className="mb-6 text-lg font-semibold text-slate-900">Related Campaigns</h2>
        <div className="rounded-lg bg-slate-50 p-4 text-center text-sm text-slate-600">
          No related campaigns found
        </div>
      </div>
    )
  }

  return (
    <div className="rounded-lg border border-slate-200 bg-white p-6">
      <h2 className="mb-6 text-lg font-semibold text-slate-900">Related Campaigns</h2>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {campaigns.map((campaign) => (
          <Link
            key={campaign.id}
            href={`/campaigns/${campaign.slug}`}
            className="group rounded-lg border border-slate-200 p-4 transition-all hover:border-violet-300 hover:shadow-md"
          >
            {/* Category Badge */}
            <div className="mb-3 flex items-start justify-between gap-2">
              <span className="inline-flex rounded-full bg-violet-100 px-2.5 py-1 text-xs font-medium text-violet-700">
                {campaign.category}
              </span>
            </div>

            {/* Title */}
            <h3 className="mb-2 line-clamp-2 font-semibold text-slate-900 group-hover:text-violet-600">
              {campaign.title}
            </h3>

            {/* Description */}
            <p className="mb-4 line-clamp-2 text-sm text-slate-600">
              {campaign.description}
            </p>

            {/* Lobby Count */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-slate-500" />
                <span className="text-sm font-medium text-slate-700">
                  {formatNumber(campaign.lobbyCount)} supporters
                </span>
              </div>
              <ArrowRight className={cn(
                'h-4 w-4 transition-transform',
                'text-slate-400 group-hover:text-violet-600 group-hover:translate-x-1'
              )} />
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}
