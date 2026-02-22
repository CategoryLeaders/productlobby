'use client'

import React, { useState, useEffect } from 'react'
import { PollCard, PollData } from './poll-card'

interface CampaignPollsFeedProps {
  campaignId: string
  currentUserId: string | null
}

export function CampaignPollsFeed({ campaignId, currentUserId }: CampaignPollsFeedProps) {
  const [polls, setPolls] = useState<PollData[]>([])
  const [loading, setLoading] = useState(true)

  const fetchPolls = async () => {
    try {
      const res = await fetch(`/api/campaigns/${campaignId}/polls`)
      if (res.ok) {
        const data = await res.json()
        if (data.success) {
          setPolls(data.data)
        }
      }
    } catch (error) {
      console.error('Error fetching polls:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (campaignId) fetchPolls()
  }, [campaignId])

  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2].map((i) => (
          <div key={i} className="bg-white border border-gray-200 rounded-lg p-6 animate-pulse">
            <div className="h-5 bg-gray-200 rounded w-3/4 mb-4"></div>
            <div className="space-y-3">
              <div className="h-10 bg-gray-100 rounded"></div>
              <div className="h-10 bg-gray-100 rounded"></div>
              <div className="h-10 bg-gray-100 rounded"></div>
            </div>
          </div>
        ))}
      </div>
    )
  }

  if (polls.length === 0) return null

  return (
    <div className="space-y-4 mb-6">
      <h4 className="text-sm font-medium text-gray-500 uppercase tracking-wide">Polls</h4>
      {polls.map((poll) => (
        <PollCard
          key={poll.id}
          poll={poll}
          currentUserId={currentUserId}
          onVoteChange={fetchPolls}
        />
      ))}
    </div>
  )
}
