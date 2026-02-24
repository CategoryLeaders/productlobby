'use client'

import React, { useState, useEffect } from 'react'
import { Loader2, Users, Mail, CheckCircle, Clock, Star, ExternalLink, Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface Influencer {
  id: string
  name: string
  handle: string
  platform: 'twitter' | 'instagram' | 'youtube' | 'tiktok' | 'linkedin'
  followers: number
  engagementRate: number
  status: 'identified' | 'contacted' | 'interested' | 'confirmed' | 'declined'
  niche: string
  matchScore: number
}

interface InfluencerOutreachProps {
  campaignId: string
}

export function InfluencerOutreach({ campaignId }: InfluencerOutreachProps) {
  const [influencers, setInfluencers] = useState<Influencer[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [filter, setFilter] = useState<'all' | 'identified' | 'contacted' | 'interested' | 'confirmed' | 'declined'>('all')
  const [showAddForm, setShowAddForm] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [newInfluencer, setNewInfluencer] = useState({
    name: '',
    handle: '',
    platform: 'twitter' as const,
    followers: 0,
    engagementRate: 0,
    niche: '',
    matchScore: 0,
  })

  useEffect(() => {
    const fetchInfluencers = async () => {
      try {
        setLoading(true)
        setError(null)
        const response = await fetch(`/api/campaigns/${campaignId}/influencer-outreach`)
        if (!response.ok) throw new Error('Failed to fetch influencers')
        const data = await response.json()
        setInfluencers(data)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred')
      } finally {
        setLoading(false)
      }
    }

    fetchInfluencers()
  }, [campaignId])

  const contactInfluencer = async (influencerId: string, newStatus: Influencer['status']) => {
    try {
      const response = await fetch(`/api/campaigns/${campaignId}/influencer-outreach`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ influencerId, status: newStatus }),
      })
      if (!response.ok) throw new Error('Failed to update status')
      const updated = await response.json()
      setInfluencers((prev) =>
        prev.map((inf) => (inf.id === influencerId ? updated : inf))
      )
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    }
  }

  const handleAddInfluencer = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      setIsSubmitting(true)
      const response = await fetch(`/api/campaigns/${campaignId}/influencer-outreach`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newInfluencer),
      })
      if (!response.ok) throw new Error('Failed to add influencer')
      const created = await response.json()
      setInfluencers((prev) => [...prev, created])
      setNewInfluencer({
        name: '',
        handle: '',
        platform: 'twitter',
        followers: 0,
        engagementRate: 0,
        niche: '',
        matchScore: 0,
      })
      setShowAddForm(false)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setIsSubmitting(false)
    }
  }

  const stats = {
    total: influencers.length,
    identified: influencers.filter((i) => i.status === 'identified').length,
    contacted: influencers.filter((i) => i.status === 'contacted').length,
    confirmed: influencers.filter((i) => i.status === 'confirmed').length,
  }

  const filteredInfluencers =
    filter === 'all' ? influencers : influencers.filter((inf) => inf.status === filter)

  const platformColors = {
    twitter: 'bg-blue-100 text-blue-700',
    instagram: 'bg-pink-100 text-pink-700',
    youtube: 'bg-red-100 text-red-700',
    tiktok: 'bg-purple-100 text-purple-700',
    linkedin: 'bg-blue-600 text-white',
  }

  const statusColors = {
    identified: 'bg-gray-100 text-gray-700',
    contacted: 'bg-yellow-100 text-yellow-700',
    interested: 'bg-blue-100 text-blue-700',
    confirmed: 'bg-green-100 text-green-700',
    declined: 'bg-red-100 text-red-700',
  }

  const statusIcons = {
    identified: <Clock className="w-4 h-4" />,
    contacted: <Mail className="w-4 h-4" />,
    interested: <Star className="w-4 h-4" />,
    confirmed: <CheckCircle className="w-4 h-4" />,
    declined: <Users className="w-4 h-4" />,
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-violet-500" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Influencer Outreach</h2>
          <p className="text-gray-500 mt-1">Discover and manage influencer partnerships</p>
        </div>
        <Button
          onClick={() => setShowAddForm(!showAddForm)}
          className="bg-violet-600 hover:bg-violet-700 text-white"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Influencer
        </Button>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
          {error}
        </div>
      )}

      <div className="grid grid-cols-4 gap-4">
        <div className="p-4 bg-violet-50 rounded-lg border border-violet-200">
          <div className="text-sm text-violet-600 font-medium">Total Identified</div>
          <div className="text-3xl font-bold text-violet-900">{stats.total}</div>
        </div>
        <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-200">
          <div className="text-sm text-yellow-600 font-medium">Contacted</div>
          <div className="text-3xl font-bold text-yellow-900">{stats.contacted}</div>
        </div>
        <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
          <div className="text-sm text-blue-600 font-medium">Interested</div>
          <div className="text-3xl font-bold text-blue-900">
            {influencers.filter((i) => i.status === 'interested').length}
          </div>
        </div>
        <div className="p-4 bg-lime-50 rounded-lg border border-lime-200">
          <div className="text-sm text-lime-600 font-medium">Confirmed</div>
          <div className="text-3xl font-bold text-lime-900">{stats.confirmed}</div>
        </div>
      </div>

      {showAddForm && (
        <div className="p-6 bg-gray-50 border border-gray-200 rounded-lg">
          <h3 className="text-lg font-semibold mb-4 text-gray-900">Add New Influencer</h3>
          <form onSubmit={handleAddInfluencer} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <input
                type="text"
                placeholder="Name"
                value={newInfluencer.name}
                onChange={(e) => setNewInfluencer({ ...newInfluencer, name: e.target.value })}
                className="px-3 py-2 border border-gray-300 rounded-md text-sm"
                required
              />
              <input
                type="text"
                placeholder="Handle"
                value={newInfluencer.handle}
                onChange={(e) => setNewInfluencer({ ...newInfluencer, handle: e.target.value })}
                className="px-3 py-2 border border-gray-300 rounded-md text-sm"
                required
              />
              <select
                value={newInfluencer.platform}
                onChange={(e) =>
                  setNewInfluencer({
                    ...newInfluencer,
                    platform: e.target.value as Influencer['platform'],
                  })
                }
                className="px-3 py-2 border border-gray-300 rounded-md text-sm"
              >
                <option value="twitter">Twitter</option>
                <option value="instagram">Instagram</option>
                <option value="youtube">YouTube</option>
                <option value="tiktok">TikTok</option>
                <option value="linkedin">LinkedIn</option>
              </select>
              <input
                type="number"
                placeholder="Followers"
                value={newInfluencer.followers}
                onChange={(e) =>
                  setNewInfluencer({ ...newInfluencer, followers: parseInt(e.target.value) })
                }
                className="px-3 py-2 border border-gray-300 rounded-md text-sm"
              />
              <input
                type="text"
                placeholder="Niche"
                value={newInfluencer.niche}
                onChange={(e) => setNewInfluencer({ ...newInfluencer, niche: e.target.value })}
                className="px-3 py-2 border border-gray-300 rounded-md text-sm"
              />
              <input
                type="number"
                placeholder="Match Score (0-100)"
                min="0"
                max="100"
                value={newInfluencer.matchScore}
                onChange={(e) =>
                  setNewInfluencer({ ...newInfluencer, matchScore: parseInt(e.target.value) })
                }
                className="px-3 py-2 border border-gray-300 rounded-md text-sm"
              />
            </div>
            <div className="flex gap-2">
              <Button
                type="submit"
                disabled={isSubmitting}
                className="bg-violet-600 hover:bg-violet-700 text-white"
              >
                {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                Add Influencer
              </Button>
              <Button
                type="button"
                onClick={() => setShowAddForm(false)}
                className="bg-gray-300 hover:bg-gray-400 text-gray-700"
              >
                Cancel
              </Button>
            </div>
          </form>
        </div>
      )}

      <div className="flex gap-2 border-b border-gray-200">
        {['all', 'identified', 'contacted', 'interested', 'confirmed', 'declined'].map((status) => (
          <button
            key={status}
            onClick={() => setFilter(status as typeof filter)}
            className={cn(
              'px-4 py-2 text-sm font-medium border-b-2 -mb-0.5 transition-colors',
              filter === status
                ? 'border-violet-600 text-violet-600'
                : 'border-transparent text-gray-600 hover:text-gray-900'
            )}
          >
            {status.charAt(0).toUpperCase() + status.slice(1)}
          </button>
        ))}
      </div>

      <div className="grid gap-4">
        {filteredInfluencers.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            No influencers found for this filter
          </div>
        ) : (
          filteredInfluencers.map((influencer) => (
            <div
              key={influencer.id}
              className="p-4 border border-gray-200 rounded-lg hover:border-violet-300 transition-colors"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="font-semibold text-gray-900">{influencer.name}</h3>
                    <span
                      className={cn(
                        'px-2 py-1 text-xs font-medium rounded',
                        platformColors[influencer.platform]
                      )}
                    >
                      @{influencer.handle}
                    </span>
                    <span className={cn('px-2 py-1 text-xs font-medium rounded flex items-center gap-1', statusColors[influencer.status])}>
                      {statusIcons[influencer.status]}
                      {influencer.status.charAt(0).toUpperCase() + influencer.status.slice(1)}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600">{influencer.niche}</p>
                </div>
                <div className="text-right">
                  <div className="inline-block bg-lime-100 text-lime-700 px-3 py-1 rounded-full text-sm font-semibold">
                    {influencer.matchScore}% Match
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4 mb-4 text-sm">
                <div>
                  <span className="text-gray-500">Followers</span>
                  <p className="font-semibold text-gray-900">
                    {(influencer.followers / 1000).toFixed(1)}K
                  </p>
                </div>
                <div>
                  <span className="text-gray-500">Engagement Rate</span>
                  <p className="font-semibold text-gray-900">{influencer.engagementRate}%</p>
                </div>
                <div>
                  <span className="text-gray-500">Platform</span>
                  <p className="font-semibold text-gray-900 capitalize">{influencer.platform}</p>
                </div>
              </div>

              <div className="flex gap-2">
                {influencer.status === 'identified' && (
                  <Button
                    onClick={() => contactInfluencer(influencer.id, 'contacted')}
                    size="sm"
                    className="bg-violet-600 hover:bg-violet-700 text-white"
                  >
                    <Mail className="w-4 h-4 mr-2" />
                    Contact
                  </Button>
                )}
                {influencer.status === 'contacted' && (
                  <Button
                    onClick={() => contactInfluencer(influencer.id, 'interested')}
                    size="sm"
                    className="bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    <Star className="w-4 h-4 mr-2" />
                    Mark Interested
                  </Button>
                )}
                {influencer.status === 'interested' && (
                  <>
                    <Button
                      onClick={() => contactInfluencer(influencer.id, 'confirmed')}
                      size="sm"
                      className="bg-lime-600 hover:bg-lime-700 text-white"
                    >
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Confirm
                    </Button>
                    <Button
                      onClick={() => contactInfluencer(influencer.id, 'declined')}
                      size="sm"
                      className="bg-gray-300 hover:bg-gray-400 text-gray-700"
                    >
                      Decline
                    </Button>
                  </>
                )}
                <Button
                  size="sm"
                  variant="ghost"
                  className="text-violet-600 hover:bg-violet-50"
                >
                  <ExternalLink className="w-4 h-4" />
                </Button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
