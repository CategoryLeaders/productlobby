'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { Search, Link2, Loader2, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

interface LinkedCampaign {
  id: string
  title: string
  slug: string
  description: string
  status: string
  image?: string | null
  lobbyCount: number
  creator: {
    id: string
    displayName: string
    handle: string | null
    avatar: string | null
  }
  linkedAt: string
  linkedBy: {
    id: string
    displayName: string
    avatar: string | null
  }
}

interface LinkedCampaignsProps {
  campaignId: string
  isCreator: boolean
  currentTitle: string
}

export const LinkedCampaigns: React.FC<LinkedCampaignsProps> = ({
  campaignId,
  isCreator,
  currentTitle,
}) => {
  const [linkedCampaigns, setLinkedCampaigns] = useState<LinkedCampaign[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<any[]>([])
  const [searching, setSearching] = useState(false)
  const [showSearchForm, setShowSearchForm] = useState(false)
  const [linking, setLinking] = useState(false)
  const [linkReason, setLinkReason] = useState('')

  // Fetch linked campaigns
  useEffect(() => {
    const fetchLinkedCampaigns = async () => {
      try {
        setLoading(true)
        const response = await fetch(`/api/campaigns/${campaignId}/linked`)
        const data = await response.json()

        if (!response.ok) {
          setError(data.error || 'Failed to fetch linked campaigns')
          return
        }

        setLinkedCampaigns(data.data || [])
      } catch (err) {
        console.error('Error fetching linked campaigns:', err)
        setError('Failed to fetch linked campaigns')
      } finally {
        setLoading(false)
      }
    }

    fetchLinkedCampaigns()
  }, [campaignId])

  // Search for campaigns to link
  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!searchQuery.trim()) {
      setSearchResults([])
      return
    }

    try {
      setSearching(true)
      const response = await fetch(`/api/campaigns?search=${encodeURIComponent(searchQuery)}&limit=10`)
      const data = await response.json()

      if (response.ok) {
        // Filter out current campaign and already linked campaigns
        const linkedIds = linkedCampaigns.map((c) => c.id)
        const filtered = (data.data || []).filter(
          (c: any) => c.id !== campaignId && !linkedIds.includes(c.id)
        )
        setSearchResults(filtered)
      }
    } catch (err) {
      console.error('Error searching campaigns:', err)
      setError('Failed to search campaigns')
    } finally {
      setSearching(false)
    }
  }

  // Link campaign
  const handleLinkCampaign = async (linkedCampaignId: string, linkedTitle: string) => {
    try {
      setLinking(true)
      const response = await fetch(`/api/campaigns/${campaignId}/linked`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          linkedCampaignId,
          reason: linkReason || 'Related campaign',
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.error || 'Failed to link campaign')
        return
      }

      // Refresh linked campaigns
      const refreshResponse = await fetch(`/api/campaigns/${campaignId}/linked`)
      const refreshData = await refreshResponse.json()
      if (refreshResponse.ok) {
        setLinkedCampaigns(refreshData.data || [])
      }

      // Clear form
      setSearchQuery('')
      setSearchResults([])
      setLinkReason('')
      setShowSearchForm(false)
    } catch (err) {
      console.error('Error linking campaign:', err)
      setError('Failed to link campaign')
    } finally {
      setLinking(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status?.toUpperCase()) {
      case 'LIVE':
        return 'bg-lime-100 text-lime-800'
      case 'DRAFT':
        return 'bg-gray-100 text-gray-800'
      case 'PAUSED':
        return 'bg-yellow-100 text-yellow-800'
      case 'CLOSED':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="w-6 h-6 text-violet-600 animate-spin mr-2" />
        <p className="text-gray-600">Loading linked campaigns...</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Link2 className="w-6 h-6 text-violet-600" />
            Linked Campaigns
          </h2>
          <p className="text-gray-600 text-sm mt-1">
            Related or duplicate campaigns linked to {currentTitle}
          </p>
        </div>

        {isCreator && (
          <Button
            onClick={() => setShowSearchForm(!showSearchForm)}
            variant="default"
            className="bg-violet-600 hover:bg-violet-700"
          >
            {showSearchForm ? 'Cancel' : '+ Link Campaign'}
          </Button>
        )}
      </div>

      {/* Error Message */}
      {error && (
        <div className="flex items-start gap-3 p-4 bg-red-50 border border-red-200 rounded-lg">
          <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
          <p className="text-red-800 text-sm">{error}</p>
        </div>
      )}

      {/* Search Form */}
      {showSearchForm && isCreator && (
        <Card className="border-violet-200">
          <CardHeader>
            <CardTitle className="text-lg">Link a Campaign</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <form onSubmit={handleSearch} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Search Campaigns
                </label>
                <div className="flex gap-2">
                  <Input
                    type="text"
                    placeholder="Search by title or campaign ID..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="flex-1"
                  />
                  <Button
                    type="submit"
                    disabled={searching}
                    className="bg-violet-600 hover:bg-violet-700"
                  >
                    {searching ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Search className="w-4 h-4" />
                    )}
                  </Button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Reason for linking
                </label>
                <Input
                  type="text"
                  placeholder="e.g., Duplicate campaign, Related feature request"
                  value={linkReason}
                  onChange={(e) => setLinkReason(e.target.value)}
                />
              </div>
            </form>

            {/* Search Results */}
            {searchResults.length > 0 && (
              <div className="mt-4 space-y-2">
                <p className="text-sm font-medium text-gray-700">
                  Found {searchResults.length} campaign(s)
                </p>
                <div className="max-h-48 overflow-y-auto space-y-2">
                  {searchResults.map((campaign: any) => (
                    <div
                      key={campaign.id}
                      className="flex items-start justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50"
                    >
                      <div className="flex-1">
                        <p className="font-medium text-gray-900 line-clamp-1">
                          {campaign.title}
                        </p>
                        <p className="text-sm text-gray-600 line-clamp-1">
                          {campaign.description?.substring(0, 80)}...
                        </p>
                      </div>
                      <Button
                        type="button"
                        size="sm"
                        onClick={() => handleLinkCampaign(campaign.id, campaign.title)}
                        disabled={linking}
                        className="ml-2 bg-violet-600 hover:bg-violet-700"
                      >
                        {linking ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          'Link'
                        )}
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Linked Campaigns List */}
      {linkedCampaigns.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Link2 className="w-12 h-12 text-gray-300 mb-3" />
            <p className="text-gray-600 font-medium">No linked campaigns yet</p>
            {isCreator && (
              <p className="text-gray-500 text-sm mt-1">
                Link related or duplicate campaigns to improve campaign visibility
              </p>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {linkedCampaigns.map((campaign) => (
            <Link
              key={campaign.id}
              href={`/campaigns/${campaign.slug}`}
              className="block"
            >
              <Card className="hover:shadow-lg transition-shadow h-full">
                {campaign.image && (
                  <div className="w-full h-40 overflow-hidden bg-gray-100">
                    <img
                      src={campaign.image}
                      alt={campaign.title}
                      className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                      onError={(e) => {
                        e.currentTarget.src =
                          'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="400" height="300"%3E%3Crect fill="%23f3f4f6" width="400" height="300"/%3E%3Ctext x="50%25" y="50%25" font-size="14" fill="%239ca3af" text-anchor="middle" dy=".3em"%3ENo image%3C/text%3E%3C/svg%3E'
                      }}
                    />
                  </div>
                )}
                <CardContent className="pt-4 pb-4">
                  <div className="space-y-3">
                    {/* Title and Status */}
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="font-semibold text-gray-900 line-clamp-2 flex-1">
                        {campaign.title}
                      </h3>
                      <Badge className={cn('flex-shrink-0', getStatusColor(campaign.status))}>
                        {campaign.status}
                      </Badge>
                    </div>

                    {/* Description */}
                    <p className="text-sm text-gray-600 line-clamp-2">
                      {campaign.description}
                    </p>

                    {/* Creator Info */}
                    <div className="flex items-center gap-2 pt-2 border-t border-gray-100">
                      {campaign.creator.avatar && (
                        <img
                          src={campaign.creator.avatar}
                          alt={campaign.creator.displayName}
                          className="w-6 h-6 rounded-full"
                        />
                      )}
                      <span className="text-xs text-gray-600">
                        by {campaign.creator.displayName}
                      </span>
                    </div>

                    {/* Stats */}
                    <div className="flex items-center justify-between pt-2 text-xs text-gray-500">
                      <span>{campaign.lobbyCount} lobbies</span>
                      <span className="text-violet-600 font-medium">
                        Linked by {campaign.linkedBy.displayName}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
