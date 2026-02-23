'use client'

import React, { useState, useEffect } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { Loader2, X, ArrowRight, TrendingUp } from 'lucide-react'
import { Navbar } from '@/components/shared/navbar'
import { Footer } from '@/components/shared/footer'
import { PageHeader } from '@/components/shared/page-header'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar } from '@/components/ui/avatar'
import { formatDistanceToNow } from 'date-fns'

interface CampaignComparison {
  id: string
  title: string
  description: string
  slug: string
  category: string
  status: string
  createdAt: string
  signalScore: number
  completenessScore: number
  creator: {
    id: string
    displayName: string
    handle: string | null
    avatar: string | null
    email: string
  }
  targetedBrand: {
    id: string
    name: string
    slug: string
    logo: string | null
  } | null
  media: {
    url: string
    kind: string
  } | null
  preferenceFields: Array<{
    id: string
    fieldName: string
  }>
  lobbyStats: {
    totalLobbies: number
    intensityDistribution: {
      NEAT_IDEA: number
      PROBABLY_BUY: number
      TAKE_MY_MONEY: number
    }
  }
}

const getStatusColor = (status: string) => {
  switch (status) {
    case 'LIVE':
    case 'active':
      return 'lime'
    case 'COMPLETED':
    case 'completed':
      return 'green'
    case 'PAUSED':
    case 'paused':
      return 'yellow'
    case 'DRAFT':
    case 'draft':
      return 'gray'
    default:
      return 'default'
  }
}

const getStatusLabel = (status: string) => {
  const normalized = status.toUpperCase()
  switch (normalized) {
    case 'LIVE':
      return 'Active'
    default:
      return status.charAt(0).toUpperCase() + status.slice(1).toLowerCase()
  }
}

const getSignalScoreColor = (score: number): string => {
  if (score >= 80) return 'text-green-600'
  if (score >= 50) return 'text-yellow-600'
  return 'text-red-600'
}

const getSignalScoreBgColor = (score: number): string => {
  if (score >= 80) return 'bg-green-50 border-green-200'
  if (score >= 50) return 'bg-yellow-50 border-yellow-200'
  return 'bg-red-50 border-red-200'
}

const getCreatorInitials = (name: string, email: string) => {
  if (name) {
    return name
      .split(' ')
      .map((n) => n.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }
  return email.charAt(0).toUpperCase()
}

function ComparisonMetricRow({
  label,
  values,
  isHigherBetter = true,
}: {
  label: string
  values: (string | number)[]
  isHigherBetter?: boolean
}) {
  // Find the winner (max or min value)
  const numValues = values.map(v => {
    if (typeof v === 'number') return v
    const num = parseFloat(String(v))
    return isNaN(num) ? 0 : num
  })

  const maxValue = Math.max(...numValues)
  const minValue = Math.min(...numValues)
  const winningValue = isHigherBetter ? maxValue : minValue

  return (
    <div className="border-t border-gray-200">
      <div className="grid grid-cols-1 md:grid-cols-[150px_1fr] gap-4 md:gap-0">
        <div className="font-medium text-gray-700 p-4">
          {label}
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-0">
          {values.map((value, idx) => {
            const isWinner =
              typeof value === 'number'
                ? value === winningValue && value !== minValue
                : parseFloat(String(value)) === winningValue && winningValue !== minValue

            return (
              <div
                key={idx}
                className={`p-4 text-center transition-colors ${
                  isWinner ? 'bg-violet-50' : ''
                }`}
              >
                <div
                  className={`text-lg font-semibold ${
                    isWinner ? 'text-violet-700' : 'text-gray-900'
                  }`}
                >
                  {value}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

function IntensityBreakdown({
  distribution,
}: {
  distribution: {
    NEAT_IDEA: number
    PROBABLY_BUY: number
    TAKE_MY_MONEY: number
  }
}) {
  const total =
    distribution.NEAT_IDEA +
    distribution.PROBABLY_BUY +
    distribution.TAKE_MY_MONEY

  const neatPercent = total > 0 ? (distribution.NEAT_IDEA / total) * 100 : 0
  const probablyPercent = total > 0 ? (distribution.PROBABLY_BUY / total) * 100 : 0
  const moneyPercent = total > 0 ? (distribution.TAKE_MY_MONEY / total) * 100 : 0

  return (
    <div>
      <div className="flex h-3 rounded-full overflow-hidden bg-gray-200 mb-2">
        {neatPercent > 0 && (
          <div
            className="bg-green-500 transition-all duration-300"
            style={{ width: `${neatPercent}%` }}
            title={`Neat Idea: ${distribution.NEAT_IDEA}`}
          />
        )}
        {probablyPercent > 0 && (
          <div
            className="bg-yellow-400 transition-all duration-300"
            style={{ width: `${probablyPercent}%` }}
            title={`Probably Buy: ${distribution.PROBABLY_BUY}`}
          />
        )}
        {moneyPercent > 0 && (
          <div
            className="bg-violet-600 transition-all duration-300"
            style={{ width: `${moneyPercent}%` }}
            title={`Take My Money: ${distribution.TAKE_MY_MONEY}`}
          />
        )}
      </div>
      <div className="text-xs text-gray-600">
        <span className="inline-block mr-3">
          <span className="inline-block w-2 h-2 bg-green-500 rounded-full mr-1" />
          Neat Idea: {distribution.NEAT_IDEA}
        </span>
        <span className="inline-block mr-3">
          <span className="inline-block w-2 h-2 bg-yellow-400 rounded-full mr-1" />
          Probably Buy: {distribution.PROBABLY_BUY}
        </span>
        <span className="inline-block">
          <span className="inline-block w-2 h-2 bg-violet-600 rounded-full mr-1" />
          Take My Money: {distribution.TAKE_MY_MONEY}
        </span>
      </div>
    </div>
  )
}

export default function CampaignComparePage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const idsParam = searchParams.get('ids')

  const [campaigns, setCampaigns] = useState<CampaignComparison[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isMobile, setIsMobile] = useState(false)
  const [currentIndex, setCurrentIndex] = useState(0)

  useEffect(() => {
    // Check if mobile
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  useEffect(() => {
    if (!idsParam) {
      setError('No campaigns selected for comparison')
      setIsLoading(false)
      return
    }

    const fetchCampaigns = async () => {
      try {
        setIsLoading(true)
        setError(null)

        const res = await fetch(`/api/campaigns/compare?ids=${idsParam}`)
        const json = await res.json()

        if (json.success && json.data) {
          setCampaigns(json.data)
        } else {
          setError(json.error || 'Failed to load campaigns')
        }
      } catch (err) {
        console.error('Error fetching campaigns:', err)
        setError('Failed to load campaigns for comparison')
      } finally {
        setIsLoading(false)
      }
    }

    fetchCampaigns()
  }, [idsParam])

  const handleRemoveCampaign = (id: string) => {
    const remaining = campaigns.filter(c => c.id !== id)
    if (remaining.length < 2) {
      router.push('/campaigns')
      return
    }

    const newIds = remaining.map(c => c.id).join(',')
    router.push(`/campaigns/compare?ids=${newIds}`)
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white">
        <Navbar />
        <div className="pt-24 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto py-20 text-center">
            <Loader2 className="w-8 h-8 text-violet-500 animate-spin mx-auto mb-4" />
            <p className="text-gray-600">Loading campaigns...</p>
          </div>
        </div>
        <Footer />
      </div>
    )
  }

  if (error || campaigns.length === 0) {
    return (
      <div className="min-h-screen bg-white">
        <Navbar />
        <div className="pt-24 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto py-20 text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">🔍</span>
            </div>
            <h3 className="text-lg font-semibold text-foreground mb-2">
              {error || 'No campaigns to compare'}
            </h3>
            <p className="text-gray-600 mb-6">
              Select 2-4 campaigns to compare side by side
            </p>
            <Link href="/campaigns">
              <Button variant="primary" size="lg" className="inline-flex items-center gap-2">
                <ArrowRight className="w-5 h-5" />
                Browse Campaigns
              </Button>
            </Link>
          </div>
        </div>
        <Footer />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      <div className="pt-24">
        {/* Page Header */}
        <div className="px-4 sm:px-6 lg:px-8 bg-white border-b border-gray-200">
          <div className="max-w-7xl mx-auto py-12">
            <PageHeader
              title="Compare Campaigns"
              description={`Comparing ${campaigns.length} campaigns side by side`}
            />
          </div>
        </div>

        {/* Comparison Container */}
        <main className="px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto py-12">
            {/* Mobile: Swipeable carousel */}
            {isMobile && (
              <div className="mb-6">
                <div className="flex gap-2 mb-4 overflow-x-auto pb-2">
                  {campaigns.map((campaign, idx) => (
                    <button
                      key={campaign.id}
                      onClick={() => setCurrentIndex(idx)}
                      className={`px-3 py-2 rounded-lg whitespace-nowrap text-sm font-medium transition-colors ${
                        idx === currentIndex
                          ? 'bg-violet-600 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {campaign.title}
                    </button>
                  ))}
                </div>

                {/* Mobile card view */}
                <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                  {campaigns.slice(currentIndex, currentIndex + 1).map(campaign => (
                    <div key={campaign.id} className="p-4">
                      {/* Image */}
                      <div className="relative w-full h-48 bg-gradient-to-br from-violet-50 to-violet-100 rounded-lg overflow-hidden mb-4">
                        {campaign.media?.url ? (
                          <Image
                            src={campaign.media.url}
                            alt={campaign.title}
                            fill
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <span className="text-3xl">📋</span>
                          </div>
                        )}
                      </div>

                      {/* Title and Category */}
                      <div className="mb-3">
                        <h2 className="text-xl font-semibold text-gray-900 mb-2">
                          {campaign.title}
                        </h2>
                        <div className="flex gap-2 mb-2">
                          <Badge variant="default" size="sm">
                            {campaign.category}
                          </Badge>
                          <Badge variant={getStatusColor(campaign.status)} size="sm">
                            {getStatusLabel(campaign.status)}
                          </Badge>
                        </div>
                      </div>

                      {/* Signal Score */}
                      <div
                        className={`border rounded-lg p-3 mb-4 ${getSignalScoreBgColor(
                          campaign.signalScore
                        )}`}
                      >
                        <div className="flex items-center gap-2">
                          <TrendingUp
                            className={`w-4 h-4 ${getSignalScoreColor(
                              campaign.signalScore
                            )}`}
                          />
                          <span className="text-sm font-semibold">
                            Signal Score: {campaign.signalScore}
                          </span>
                        </div>
                      </div>

                      {/* Stats */}
                      <div className="space-y-4">
                        <div>
                          <p className="text-sm font-medium text-gray-700 mb-2">
                            Total Lobbies
                          </p>
                          <p className="text-2xl font-bold text-violet-600">
                            {campaign.lobbyStats.totalLobbies}
                          </p>
                        </div>

                        <div>
                          <p className="text-sm font-medium text-gray-700 mb-2">
                            Intensity Breakdown
                          </p>
                          <IntensityBreakdown
                            distribution={campaign.lobbyStats.intensityDistribution}
                          />
                        </div>

                        <div className="pt-2 border-t border-gray-200">
                          <p className="text-sm font-medium text-gray-700 mb-2">Creator</p>
                          <div className="flex items-center gap-2">
                            <Avatar
                              src={campaign.creator.avatar}
                              alt={campaign.creator.displayName}
                              initials={getCreatorInitials(
                                campaign.creator.displayName,
                                campaign.creator.email
                              )}
                              size="sm"
                            />
                            <div>
                              <p className="text-sm font-medium text-gray-900">
                                {campaign.creator.displayName}
                              </p>
                              <p className="text-xs text-gray-500">
                                {campaign.creator.handle
                                  ? `@${campaign.creator.handle}`
                                  : campaign.creator.email}
                              </p>
                            </div>
                          </div>
                        </div>

                        {campaign.targetedBrand && (
                          <div className="pt-2 border-t border-gray-200">
                            <p className="text-sm font-medium text-gray-700 mb-2">
                              Target Brand
                            </p>
                            <Badge variant="outline">
                              {campaign.targetedBrand.name}
                            </Badge>
                          </div>
                        )}

                        <div className="pt-2 border-t border-gray-200">
                          <p className="text-sm font-medium text-gray-700 mb-2">
                            Created
                          </p>
                          <p className="text-sm text-gray-600">
                            {formatDistanceToNow(new Date(campaign.createdAt), {
                              addSuffix: true,
                            })}
                          </p>
                        </div>
                      </div>

                      <div className="flex gap-2 mt-6">
                        <Link href={`/campaigns/${campaign.slug}`} className="flex-1">
                          <Button variant="primary" size="md" className="w-full">
                            View Campaign
                          </Button>
                        </Link>
                        <button
                          onClick={() => handleRemoveCampaign(campaign.id)}
                          className="px-3 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                          title="Remove from comparison"
                        >
                          <X className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Desktop: Grid layout */}
            {!isMobile && (
              <>
                {/* Campaign Cards Header */}
                <div
                  className={`grid gap-4 mb-8 ${
                    campaigns.length === 2
                      ? 'grid-cols-2'
                      : campaigns.length === 3
                        ? 'grid-cols-3'
                        : 'grid-cols-4'
                  }`}
                >
                  {campaigns.map(campaign => (
                    <div
                      key={campaign.id}
                      className="bg-white border border-gray-200 rounded-lg overflow-hidden"
                    >
                      {/* Image */}
                      <div className="relative w-full h-40 bg-gradient-to-br from-violet-50 to-violet-100 overflow-hidden">
                        {campaign.media?.url ? (
                          <Image
                            src={campaign.media.url}
                            alt={campaign.title}
                            fill
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <span className="text-3xl">📋</span>
                          </div>
                        )}
                      </div>

                      {/* Content */}
                      <div className="p-4">
                        <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2">
                          {campaign.title}
                        </h3>

                        <div className="flex gap-2 mb-3 flex-wrap">
                          <Badge variant="default" size="sm">
                            {campaign.category}
                          </Badge>
                          <Badge variant={getStatusColor(campaign.status)} size="sm">
                            {getStatusLabel(campaign.status)}
                          </Badge>
                        </div>

                        <button
                          onClick={() => handleRemoveCampaign(campaign.id)}
                          className="text-gray-400 hover:text-gray-600 transition-colors ml-auto"
                          title="Remove from comparison"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Comparison Table */}
                <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                  <ComparisonMetricRow
                    label="Signal Score"
                    values={campaigns.map(c => c.signalScore)}
                    isHigherBetter={true}
                  />

                  <ComparisonMetricRow
                    label="Total Lobbies"
                    values={campaigns.map(c => c.lobbyStats.totalLobbies)}
                    isHigherBetter={true}
                  />

                  {/* Intensity Breakdown */}
                  <div className="border-t border-gray-200">
                    <div className="grid grid-cols-1 md:grid-cols-[150px_1fr] gap-4 md:gap-0">
                      <div className="font-medium text-gray-700 p-4">
                        Intensity Breakdown
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-0">
                        {campaigns.map(campaign => (
                          <div key={campaign.id} className="p-4">
                            <IntensityBreakdown
                              distribution={campaign.lobbyStats.intensityDistribution}
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  <ComparisonMetricRow
                    label="Completeness Score"
                    values={campaigns.map(c => `${c.completenessScore}%`)}
                    isHigherBetter={true}
                  />

                  <ComparisonMetricRow
                    label="Preference Fields"
                    values={campaigns.map(c => c.preferenceFields.length)}
                    isHigherBetter={true}
                  />

                  <ComparisonMetricRow
                    label="Creator"
                    values={campaigns.map(c => c.creator.displayName)}
                    isHigherBetter={false}
                  />

                  {campaigns.some(c => c.targetedBrand) && (
                    <ComparisonMetricRow
                      label="Target Brand"
                      values={campaigns.map(c => c.targetedBrand?.name || 'None')}
                      isHigherBetter={false}
                    />
                  )}

                  <ComparisonMetricRow
                    label="Created"
                    values={campaigns.map(c =>
                      formatDistanceToNow(new Date(c.createdAt), { addSuffix: true })
                    )}
                    isHigherBetter={false}
                  />

                  {/* Action Row */}
                  <div className="border-t border-gray-200">
                    <div className="grid grid-cols-1 md:grid-cols-[150px_1fr] gap-4 md:gap-0">
                      <div className="font-medium text-gray-700 p-4">
                        Action
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-0">
                        {campaigns.map(campaign => (
                          <div key={campaign.id} className="p-4">
                            <Link href={`/campaigns/${campaign.slug}`}>
                              <Button
                                variant="primary"
                                size="sm"
                                className="w-full text-sm"
                              >
                                View Campaign
                              </Button>
                            </Link>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </>
            )}

            {/* Back to Campaigns */}
            <div className="mt-12 text-center">
              <Link href="/campaigns">
                <Button variant="secondary" size="lg" className="inline-flex items-center gap-2">
                  <ArrowRight className="w-5 h-5 rotate-180" />
                  Back to Campaigns
                </Button>
              </Link>
            </div>
          </div>
        </main>
      </div>

      <Footer />
    </div>
  )
}
