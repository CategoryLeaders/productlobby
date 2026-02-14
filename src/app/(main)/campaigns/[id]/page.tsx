'use client'

import { useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { useQuery } from '@tanstack/react-query'
import { ArrowLeft, Users, Target, TrendingUp, Clock, Share2, Flag, Loader2, ChevronLeft, ChevronRight, Heart } from 'lucide-react'
import { formatCurrency, formatNumber, formatRelativeTime } from '@/lib/utils'

export default function CampaignDetailPage() {
  const params = useParams()
  const id = params.id as string
  const [currentImageIndex, setCurrentImageIndex] = useState(0)

  const { data, isLoading, error } = useQuery({
    queryKey: ['campaign', id],
    queryFn: async () => {
      const res = await fetch(`/api/campaigns/${id}`)
      if (!res.ok) throw new Error('Failed to fetch campaign')
      return res.json()
    },
  })

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader2 className="w-8 h-8 animate-spin text-primary-600" />
      </div>
    )
  }

  if (error || !data?.data) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-2">Campaign not found</h1>
          <p className="text-gray-600 mb-6">This campaign may have been removed or doesn&apos;t exist.</p>
          <Link href="/campaigns" className="text-primary-600 hover:underline">
            Browse campaigns
          </Link>
        </div>
      </div>
    )
  }

  const campaign = data.data
  const progress = campaign.signalScore ? Math.min(campaign.signalScore, 100) : 0
  const media = campaign.media || []
  const hasMedia = media.length > 0

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b sticky top-0 z-40">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <Link href="/campaigns" className="inline-flex items-center text-gray-600 hover:text-gray-900">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Link>
            <div className="flex items-center gap-3">
              <button className="p-2 text-gray-400 hover:text-gray-600 transition">
                <Share2 className="w-5 h-5" />
              </button>
              <button className="p-2 text-gray-400 hover:text-gray-600 transition">
                <Flag className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Hero Image / Media Gallery */}
            {hasMedia && (
              <div className="bg-white rounded-2xl shadow-sm border overflow-hidden">
                <div className="relative aspect-video bg-gray-100">
                  <img
                    src={media[currentImageIndex]?.url}
                    alt={campaign.title}
                    className="w-full h-full object-cover"
                  />
                  {media.length > 1 && (
                    <>
                      <button
                        onClick={() => setCurrentImageIndex(i => i === 0 ? media.length - 1 : i - 1)}
                        className="absolute left-3 top-1/2 -translate-y-1/2 p-2 bg-white/90 rounded-full shadow hover:bg-white transition"
                      >
                        <ChevronLeft className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => setCurrentImageIndex(i => i === media.length - 1 ? 0 : i + 1)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 p-2 bg-white/90 rounded-full shadow hover:bg-white transition"
                      >
                        <ChevronRight className="w-5 h-5" />
                      </button>
                      <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
                        {media.map((_: unknown, i: number) => (
                          <button
                            key={i}
                            onClick={() => setCurrentImageIndex(i)}
                            className={`w-2 h-2 rounded-full transition ${
                              i === currentImageIndex ? 'bg-white' : 'bg-white/50'
                            }`}
                          />
                        ))}
                      </div>
                    </>
                  )}
                </div>
                {/* Thumbnail strip */}
                {media.length > 1 && (
                  <div className="flex gap-2 p-3 overflow-x-auto">
                    {media.map((m: { url: string; id: string }, i: number) => (
                      <button
                        key={m.id}
                        onClick={() => setCurrentImageIndex(i)}
                        className={`flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition ${
                          i === currentImageIndex ? 'border-primary-500' : 'border-transparent hover:border-gray-300'
                        }`}
                      >
                        <img src={m.url} alt="" className="w-full h-full object-cover" />
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Campaign Info */}
            <div className="bg-white rounded-2xl shadow-sm border p-8">
              <div className="flex items-center gap-3 mb-4">
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                  campaign.template === 'VARIANT'
                    ? 'bg-blue-100 text-blue-700'
                    : 'bg-purple-100 text-purple-700'
                }`}>
                  {campaign.template === 'VARIANT' ? 'Product Variant' : 'Feature Request'}
                </span>
                {campaign.category && (
                  <span className="px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
                    {campaign.category}
                  </span>
                )}
                <span className={`ml-auto px-3 py-1 rounded-full text-xs font-medium ${
                  campaign.status === 'LIVE' ? 'bg-green-100 text-green-700' :
                  campaign.status === 'PAUSED' ? 'bg-yellow-100 text-yellow-700' :
                  'bg-gray-100 text-gray-600'
                }`}>
                  {campaign.status}
                </span>
              </div>

              <h1 className="text-3xl font-bold text-gray-900 mb-4">{campaign.title}</h1>

              {campaign.targetedBrand && (
                <div className="flex items-center gap-2 mb-4 text-gray-600">
                  <Target className="w-4 h-4" />
                  <span>Targeting: <strong>{campaign.targetedBrand.name}</strong></span>
                </div>
              )}

              <p className="text-gray-600 text-lg leading-relaxed whitespace-pre-wrap">
                {campaign.description}
              </p>

              <div className="mt-6 pt-6 border-t flex items-center gap-4 text-sm text-gray-500">
                <span>Created by {campaign.creator?.displayName || 'Anonymous'}</span>
                <span className="flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  {formatRelativeTime(campaign.createdAt)}
                </span>
              </div>
            </div>

            {/* Brand Responses */}
            {campaign.brandResponses && campaign.brandResponses.length > 0 && (
              <div className="bg-white rounded-2xl shadow-sm border p-8">
                <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                  <Heart className="w-5 h-5 text-green-600" />
                  Brand Responses
                </h2>
                <div className="space-y-4">
                  {campaign.brandResponses.map((response: { id: string; brand: { name: string; logo: string | null }; content: string; createdAt: string }) => (
                    <div key={response.id} className="p-4 bg-green-50 rounded-xl border border-green-200">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center text-green-700 font-bold text-sm">
                          {response.brand.name[0]}
                        </div>
                        <span className="font-semibold text-green-800">{response.brand.name}</span>
                      </div>
                      <p className="text-gray-700">{response.content}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Pledges Section */}
            <div className="bg-white rounded-2xl shadow-sm border p-8">
              <h2 className="text-xl font-bold mb-6">Support This Campaign</h2>
              <div className="grid sm:grid-cols-2 gap-4">
                <button className="p-6 rounded-xl border-2 border-gray-200 hover:border-primary-400 hover:bg-primary-50 transition text-left">
                  <Users className="w-6 h-6 text-primary-600 mb-3" />
                  <div className="font-semibold mb-1">Quick Support</div>
                  <div className="text-sm text-gray-500">
                    Show your support with one click. Fast and viral.
                  </div>
                </button>
                <button className="p-6 rounded-xl border-2 border-gray-200 hover:border-primary-400 hover:bg-primary-50 transition text-left">
                  <Target className="w-6 h-6 text-primary-600 mb-3" />
                  <div className="font-semibold mb-1">Buying Intent</div>
                  <div className="text-sm text-gray-500">
                    Set your price ceiling and timeframe. Stronger signal.
                  </div>
                </button>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Signal Score */}
            <div className="bg-white rounded-2xl shadow-sm border p-6">
              <h3 className="font-semibold mb-4">Signal Score</h3>
              <div className="relative w-32 h-32 mx-auto mb-4">
                <svg className="w-full h-full -rotate-90" viewBox="0 0 120 120">
                  <circle cx="60" cy="60" r="50" fill="none" stroke="#f3f4f6" strokeWidth="10" />
                  <circle
                    cx="60" cy="60" r="50" fill="none"
                    stroke={progress >= 70 ? '#10b981' : progress >= 35 ? '#f59e0b' : '#d1d5db'}
                    strokeWidth="10"
                    strokeLinecap="round"
                    strokeDasharray={`${progress * 3.14} ${314 - progress * 3.14}`}
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-3xl font-bold">{Math.round(progress)}</span>
                </div>
              </div>
              <div className="text-center text-sm text-gray-500">
                {progress >= 80 ? 'Ready for offers' :
                 progress >= 70 ? 'High signal' :
                 progress >= 55 ? 'Brand notified' :
                 progress >= 35 ? 'Trending' :
                 'Gathering support'}
              </div>
            </div>

            {/* Stats */}
            <div className="bg-white rounded-2xl shadow-sm border p-6">
              <h3 className="font-semibold mb-4">Campaign Stats</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600 flex items-center gap-2">
                    <Users className="w-4 h-4" /> Supporters
                  </span>
                  <span className="font-semibold">{formatNumber(campaign.stats?.supportCount || 0)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600 flex items-center gap-2">
                    <Target className="w-4 h-4" /> Buying Intent
                  </span>
                  <span className="font-semibold">{formatNumber(campaign.stats?.intentCount || 0)}</span>
                </div>
                {campaign.stats?.estimatedDemand > 0 && (
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600 flex items-center gap-2">
                      <TrendingUp className="w-4 h-4" /> Est. Demand
                    </span>
                    <span className="font-semibold text-primary-600">
                      {formatCurrency(campaign.stats.estimatedDemand, campaign.currency)}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Offers */}
            {campaign.offers && campaign.offers.length > 0 && (
              <div className="bg-white rounded-2xl shadow-sm border p-6">
                <h3 className="font-semibold mb-4 text-green-700">Active Offers</h3>
                <div className="space-y-3">
                  {campaign.offers.map((offer: { id: string; title: string; price: number; brand: { name: string }; _count: { orders: number }; goalQuantity: number }) => (
                    <div key={offer.id} className="p-3 bg-green-50 rounded-lg border border-green-200">
                      <div className="font-medium text-sm">{offer.title}</div>
                      <div className="text-xs text-gray-600 mt-1">by {offer.brand.name}</div>
                      <div className="flex items-center justify-between mt-2">
                        <span className="font-bold text-green-700">{formatCurrency(offer.price, campaign.currency)}</span>
                        <span className="text-xs text-gray-500">{offer._count.orders}/{offer.goalQuantity} orders</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}
