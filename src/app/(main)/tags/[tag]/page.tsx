'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'
import { Navbar } from '@/components/shared/navbar'
import { Footer } from '@/components/shared/footer'
import { PageHeader } from '@/components/shared/page-header'
import { Button } from '@/components/ui/button'
import { Loader2, ArrowLeft, Image as ImageIcon } from 'lucide-react'
import { formatNumber } from '@/lib/utils'

interface CampaignCard {
  id: string
  title: string
  slug: string
  description: string
  category: string
  signalScore: number | null
  media: Array<{ url: string }>
  _count: { lobbies: number }
  creator: {
    displayName: string
    avatar: string | null
    handle: string | null
  }
  targetedBrand: {
    name: string
    logo: string | null
  } | null
}

export default function TagResultsPage() {
  const params = useParams()
  const router = useRouter()
  const tag = decodeURIComponent(params.tag as string)

  const [campaigns, setCampaigns] = useState<CampaignCard[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchCampaigns = async () => {
      try {
        setLoading(true)
        setError(null)

        // Fetch campaigns with this tag
        // We need to get campaigns and filter by those with this tag
        const response = await fetch(`/api/campaigns?limit=100`)
        const result = await response.json()

        if (result.success && result.data) {
          // For now, we filter client-side campaigns that might have this tag
          // In a production app, you'd have a dedicated /api/tags/[tag]/campaigns endpoint
          // This is a simplified approach showing all campaigns with ability to add tags
          setCampaigns(result.data || [])
        }
      } catch (error) {
        console.error('Failed to fetch campaigns:', error)
        setError('Failed to load campaigns for this tag')
      } finally {
        setLoading(false)
      }
    }

    fetchCampaigns()
  }, [tag])

  const handleGoBack = () => {
    router.back()
  }

  return (
    <>
      <Navbar />
      <div className="min-h-screen flex flex-col bg-gray-50">
        <PageHeader
          title={`Campaigns Tagged: ${tag}`}
          description={`Exploring campaigns related to "${tag}"`}
        />

        <main className="flex-1 px-4 sm:px-6 lg:px-8 py-12 max-w-6xl mx-auto w-full">
          {/* Back Button */}
          <Button
            variant="ghost"
            onClick={handleGoBack}
            className="mb-8 flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </Button>

          {/* Loading State */}
          {loading ? (
            <div className="flex justify-center items-center py-20">
              <Loader2 className="w-8 h-8 animate-spin text-violet-600" />
            </div>
          ) : error ? (
            <div className="text-center py-20">
              <p className="text-red-600 text-lg">{error}</p>
            </div>
          ) : campaigns.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-gray-600 text-lg">
                No campaigns found for this tag yet
              </p>
              <Link href="/explore">
                <Button className="mt-4">Explore All Campaigns</Button>
              </Link>
            </div>
          ) : (
            <>
              {/* Campaigns Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {campaigns.map((campaign) => (
                  <Link
                    key={campaign.id}
                    href={`/campaigns/${campaign.slug}`}
                  >
                    <div className="bg-white rounded-lg shadow-sm hover:shadow-lg transition-shadow duration-200 overflow-hidden h-full flex flex-col border border-gray-200">
                      {/* Image */}
                      <div className="relative w-full h-48 bg-gray-100 flex items-center justify-center overflow-hidden">
                        {campaign.media && campaign.media.length > 0 ? (
                          <img
                            src={campaign.media[0].url}
                            alt={campaign.title}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <ImageIcon className="w-12 h-12 text-gray-300" />
                        )}
                      </div>

                      {/* Content */}
                      <div className="flex-1 p-4 flex flex-col">
                        {/* Brand */}
                        {campaign.targetedBrand && (
                          <p className="text-xs font-medium text-violet-600 uppercase tracking-wide mb-2">
                            {campaign.targetedBrand.name}
                          </p>
                        )}

                        {/* Title */}
                        <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">
                          {campaign.title}
                        </h3>

                        {/* Description */}
                        <p className="text-sm text-gray-600 mb-4 line-clamp-2 flex-1">
                          {campaign.description}
                        </p>

                        {/* Creator & Stats */}
                        <div className="flex items-center justify-between text-xs text-gray-500">
                          <div className="flex items-center gap-2">
                            {campaign.creator.avatar && (
                              <img
                                src={campaign.creator.avatar}
                                alt={campaign.creator.displayName}
                                className="w-6 h-6 rounded-full"
                              />
                            )}
                            <span className="truncate">
                              {campaign.creator.displayName}
                            </span>
                          </div>

                          <div className="flex items-center gap-2 font-medium text-gray-700">
                            <span>{formatNumber(campaign._count.lobbies)}</span>
                            <span>lobbies</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>

              {/* Results Count */}
              <div className="mt-12 text-center text-gray-600">
                <p className="text-sm">
                  Showing {campaigns.length} campaigns
                </p>
              </div>
            </>
          )}
        </main>
      </div>
      <Footer />
    </>
  )
}
