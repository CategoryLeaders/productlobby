'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Users, TrendingUp, AlertCircle } from 'lucide-react'

interface WidgetData {
  id: string
  title: string
  slug: string
  description: string
  category: string
  status: string
  currency: string
  signalScore: number | null
  creator: {
    name: string
    avatar: string | null
  }
  brand: {
    id: string
    name: string
    logo: string | null
  } | null
  metrics: {
    lobbyCount: number
    pledgeCount: number
    intentPledges: number
    supportPledges: number
    avgIntensity: number
  }
  links: {
    campaign: string
    create_lobby: string
  }
}

export default function CampaignWidgetPage({
  params,
}: {
  params: { slug: string }
}) {
  const [campaign, setCampaign] = useState<WidgetData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchCampaign = async () => {
      try {
        setLoading(true)
        setError(null)

        // First, find campaign by slug
        const searchRes = await fetch(
          `/api/campaigns/search?slug=${encodeURIComponent(params.slug)}`
        )

        if (!searchRes.ok) {
          setError('Campaign not found')
          return
        }

        const searchData = await searchRes.json()
        if (!searchData.success || !searchData.data[0]) {
          setError('Campaign not found')
          return
        }

        const campaignId = searchData.data[0].id

        // Then fetch widget data
        const widgetRes = await fetch(`/api/campaigns/${campaignId}/widget`)
        const widgetData = await widgetRes.json()

        if (widgetData.success) {
          setCampaign(widgetData.data)
        } else {
          setError('Failed to load campaign data')
        }
      } catch (err) {
        console.error('Error fetching campaign:', err)
        setError('Failed to load campaign')
      } finally {
        setLoading(false)
      }
    }

    fetchCampaign()
  }, [params.slug])

  if (loading) {
    return (
      <div className="w-full h-screen flex items-center justify-center bg-white">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-64 mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-48"></div>
        </div>
      </div>
    )
  }

  if (error || !campaign) {
    return (
      <div className="w-full h-screen flex items-center justify-center bg-white">
        <div className="text-center space-y-4">
          <AlertCircle className="w-12 h-12 text-gray-400 mx-auto" />
          <p className="text-gray-600">{error || 'Campaign not found'}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="w-full min-h-screen bg-gradient-to-br from-violet-50 to-white p-4 sm:p-6">
      <div className="max-w-md mx-auto">
        {/* Campaign Card */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-100">
          {/* Header */}
          <div className="bg-gradient-to-r from-violet-600 to-violet-700 px-6 py-4">
            <h1 className="text-xl font-bold text-white line-clamp-2">
              {campaign.title}
            </h1>
          </div>

          {/* Content */}
          <div className="p-6 space-y-4">
            {/* Brand & Category */}
            <div className="flex items-center justify-between">
              {campaign.brand && (
                <div className="flex items-center gap-2">
                  {campaign.brand.logo && (
                    <div className="relative w-6 h-6 bg-gray-100 rounded-full overflow-hidden">
                      <Image
                        src={campaign.brand.logo}
                        alt={campaign.brand.name}
                        fill
                        className="object-cover"
                      />
                    </div>
                  )}
                  <span className="text-sm font-medium text-gray-700">
                    {campaign.brand.name}
                  </span>
                </div>
              )}
              <span className="inline-block px-2 py-1 bg-lime-100 text-lime-700 rounded text-xs font-semibold">
                {campaign.category}
              </span>
            </div>

            {/* Description */}
            <p className="text-sm text-gray-600 line-clamp-3">
              {campaign.description}
            </p>

            {/* Metrics */}
            <div className="grid grid-cols-2 gap-3 py-4 border-y border-gray-200">
              <div className="text-center">
                <div className="flex items-center justify-center gap-1 mb-1">
                  <Users className="w-4 h-4 text-violet-600" />
                  <span className="text-lg font-bold text-gray-900">
                    {campaign.metrics.lobbyCount}
                  </span>
                </div>
                <p className="text-xs text-gray-500">
                  {campaign.metrics.lobbyCount === 1 ? 'Lobby' : 'Lobbies'}
                </p>
              </div>

              <div className="text-center">
                <div className="flex items-center justify-center gap-1 mb-1">
                  <TrendingUp className="w-4 h-4 text-lime-600" />
                  <span className="text-lg font-bold text-gray-900">
                    {campaign.signalScore
                      ? campaign.signalScore.toFixed(1)
                      : '0.0'}
                  </span>
                </div>
                <p className="text-xs text-gray-500">Signal Score</p>
              </div>
            </div>

            {/* Creator */}
            <div className="flex items-center gap-3 text-sm text-gray-600">
              <div className="text-xs">
                <p className="font-medium text-gray-900">Created by</p>
                <p className="text-gray-500">{campaign.creator.name}</p>
              </div>
            </div>
          </div>

          {/* CTA Button */}
          <div className="bg-gray-50 px-6 py-4 border-t border-gray-100">
            <Link href={campaign.links.campaign} target="_blank" rel="noopener noreferrer">
              <button className="w-full py-3 px-4 bg-violet-600 hover:bg-violet-700 text-white font-semibold rounded-lg transition-colors">
                View Campaign
              </button>
            </Link>
          </div>
        </div>

        {/* Widget Info */}
        <p className="text-center text-xs text-gray-500 mt-4">
          Powered by ProductLobby
        </p>
      </div>
    </div>
  )
}
