'use client'

import React, { useState, useEffect } from 'react'
import {
  Link2,
  X,
  Search,
  Loader2,
  AlertCircle,
  Users,
  TrendingUp,
  Badge,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

// ============================================================================
// TYPES
// ============================================================================

interface LinkedCampaign {
  id: string
  title: string
  slug: string
  supporters: number
  status: 'active' | 'completed' | 'draft'
  relationship: 'related' | 'coalition' | 'sequel' | 'prerequisite'
  sharedSupporters: number
}

interface LinkedCampaignsProps {
  campaignId: string
  className?: string
}

interface LinkedCampaignsState {
  campaigns: LinkedCampaign[]
  availableCampaigns: LinkedCampaign[]
  loading: boolean
  error: string | null
  searchQuery: string
  showLinkModal: boolean
}

// ============================================================================
// RELATIONSHIP BADGE CONFIG
// ============================================================================

const relationshipConfig = {
  related: {
    label: 'Related',
    color: 'bg-violet-100 text-violet-700 border-violet-200',
  },
  coalition: {
    label: 'Coalition',
    color: 'bg-lime-100 text-lime-700 border-lime-200',
  },
  sequel: {
    label: 'Sequel',
    color: 'bg-amber-100 text-amber-700 border-amber-200',
  },
  prerequisite: {
    label: 'Prerequisite',
    color: 'bg-rose-100 text-rose-700 border-rose-200',
  },
}

const statusConfig = {
  active: { label: 'Active', color: 'bg-emerald-100 text-emerald-700' },
  completed: { label: 'Completed', color: 'bg-slate-100 text-slate-700' },
  draft: { label: 'Draft', color: 'bg-sky-100 text-sky-700' },
}

// ============================================================================
// COMPONENT
// ============================================================================

export function LinkedCampaigns({ campaignId, className }: LinkedCampaignsProps) {
  const [state, setState] = useState<LinkedCampaignsState>({
    campaigns: [],
    availableCampaigns: [],
    loading: true,
    error: null,
    searchQuery: '',
    showLinkModal: false,
  })

  // Fetch linked campaigns
  useEffect(() => {
    const fetchLinkedCampaigns = async () => {
      try {
        const res = await fetch(
          `/api/campaigns/${campaignId}/linked-campaigns`
        )
        if (!res.ok) throw new Error('Failed to fetch linked campaigns')
        const data = await res.json()
        setState((prev) => ({
          ...prev,
          campaigns: data.linkedCampaigns || [],
          availableCampaigns: data.availableCampaigns || [],
          loading: false,
        }))
      } catch (err) {
        setState((prev) => ({
          ...prev,
          error:
            err instanceof Error
              ? err.message
              : 'Failed to fetch linked campaigns',
          loading: false,
        }))
      }
    }

    fetchLinkedCampaigns()
  }, [campaignId])

  const handleLinkCampaign = async (linkedCampaignId: string) => {
    try {
      const res = await fetch(
        `/api/campaigns/${campaignId}/linked-campaigns`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            linkedCampaignId,
            relationship: 'related',
          }),
        }
      )
      if (!res.ok) throw new Error('Failed to link campaign')
      const data = await res.json()
      setState((prev) => ({
        ...prev,
        campaigns: [...prev.campaigns, data],
        showLinkModal: false,
        searchQuery: '',
      }))
    } catch (err) {
      setState((prev) => ({
        ...prev,
        error:
          err instanceof Error ? err.message : 'Failed to link campaign',
      }))
    }
  }

  const handleUnlinkCampaign = (campaignId: string) => {
    setState((prev) => ({
      ...prev,
      campaigns: prev.campaigns.filter((c) => c.id !== campaignId),
    }))
  }

  const filteredAvailable = state.availableCampaigns.filter((c) =>
    c.title.toLowerCase().includes(state.searchQuery.toLowerCase())
  )

  if (state.loading) {
    return (
      <div className={cn('space-y-4', className)}>
        <div className="flex items-center gap-2">
          <Link2 className="w-5 h-5 text-violet-600" />
          <h2 className="text-2xl font-bold">Linked Campaigns</h2>
        </div>
        <div className="flex items-center justify-center h-40">
          <Loader2 className="w-6 h-6 animate-spin text-violet-600" />
        </div>
      </div>
    )
  }

  return (
    <div className={cn('space-y-6', className)}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Link2 className="w-5 h-5 text-violet-600" />
          <h2 className="text-2xl font-bold">Linked Campaigns</h2>
        </div>
        <Button
          onClick={() => setState((prev) => ({ ...prev, showLinkModal: true }))}
          className="bg-violet-600 hover:bg-violet-700 text-white"
        >
          Link Campaign
        </Button>
      </div>

      {state.error && (
        <div className="flex items-start gap-3 p-4 bg-rose-50 border border-rose-200 rounded-lg">
          <AlertCircle className="w-5 h-5 text-rose-600 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-rose-700">{state.error}</p>
        </div>
      )}

      {state.campaigns.length === 0 ? (
        <div className="text-center py-12 bg-slate-50 rounded-lg border border-slate-200">
          <Link2 className="w-12 h-12 text-slate-400 mx-auto mb-3" />
          <p className="text-slate-600 font-medium mb-2">No linked campaigns</p>
          <p className="text-slate-500 text-sm mb-4">
            Connect related campaigns to strengthen your network
          </p>
          <Button
            onClick={() =>
              setState((prev) => ({ ...prev, showLinkModal: true }))
            }
            variant="outline"
          >
            Link First Campaign
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {state.campaigns.map((campaign) => {
            const relationshipInfo =
              relationshipConfig[
                campaign.relationship as keyof typeof relationshipConfig
              ]
            const statusInfo =
              statusConfig[campaign.status as keyof typeof statusConfig]

            return (
              <div
                key={campaign.id}
                className="border border-slate-200 rounded-lg p-4 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <h3 className="font-semibold text-slate-900 mb-2 line-clamp-2">
                      {campaign.title}
                    </h3>
                    <div className="flex gap-2 flex-wrap">
                      <Badge
                        variant="outline"
                        className={cn(
                          'border',
                          relationshipInfo.color
                        )}
                      >
                        {relationshipInfo.label}
                      </Badge>
                      <Badge
                        variant="outline"
                        className={cn('border', statusInfo.color)}
                      >
                        {statusInfo.label}
                      </Badge>
                    </div>
                  </div>
                  <button
                    onClick={() => handleUnlinkCampaign(campaign.id)}
                    className="text-slate-400 hover:text-rose-600 transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2 text-slate-600">
                    <Users className="w-4 h-4" />
                    <span>{campaign.supporters.toLocaleString()} supporters</span>
                  </div>
                  <div className="flex items-center gap-2 text-lime-600">
                    <TrendingUp className="w-4 h-4" />
                    <span>
                      {campaign.sharedSupporters} shared supporters
                    </span>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {state.showLinkModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-bold mb-4">Link Campaign</h3>

            <Input
              placeholder="Search campaigns..."
              value={state.searchQuery}
              onChange={(e) =>
                setState((prev) => ({ ...prev, searchQuery: e.target.value }))
              }
              className="mb-4"
            />

            <div className="space-y-2 max-h-64 overflow-y-auto mb-4">
              {filteredAvailable.length === 0 ? (
                <p className="text-center text-slate-500 py-4">
                  No campaigns found
                </p>
              ) : (
                filteredAvailable.map((campaign) => (
                  <button
                    key={campaign.id}
                    onClick={() => handleLinkCampaign(campaign.id)}
                    className="w-full text-left p-3 rounded-lg hover:bg-violet-50 border border-slate-200 hover:border-violet-300 transition-colors"
                  >
                    <p className="font-medium text-slate-900">
                      {campaign.title}
                    </p>
                    <p className="text-sm text-slate-600">
                      {campaign.supporters} supporters
                    </p>
                  </button>
                ))
              )}
            </div>

            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() =>
                  setState((prev) => ({ ...prev, showLinkModal: false }))
                }
                className="flex-1"
              >
                Cancel
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
