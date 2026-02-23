'use client'

import React, { useState, useEffect } from 'react'
import { DashboardLayout } from '@/components/shared'
import { Users, Inbox, ArrowRight, Loader2 } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

interface CampaignCollaborationData {
  id: string
  title: string
  slug: string
  category: string
  role: 'owner' | 'collaborator'
  lastActivityAt?: string
  createdAt: string
}

export default function CollaborationsPage() {
  const [ownedCampaigns, setOwnedCampaigns] = useState<CampaignCollaborationData[]>([])
  const [collaboratingCampaigns, setCollaboratingCampaigns] = useState<CampaignCollaborationData[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'owned' | 'collaborating'>('owned')

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      setLoading(true)

      // Fetch campaigns owned by user
      const ownedResponse = await fetch('/api/campaigns/my-campaigns?type=owned')
      if (ownedResponse.ok) {
        const ownedData = await ownedResponse.json()
        if (ownedData.success) {
          setOwnedCampaigns(ownedData.data || [])
        }
      }

      // Fetch campaigns user is collaborating on
      const collaboratingResponse = await fetch('/api/campaigns/my-campaigns?type=collaborating')
      if (collaboratingResponse.ok) {
        const collabData = await collaboratingResponse.json()
        if (collabData.success) {
          setCollaboratingCampaigns(collabData.data || [])
        }
      }
    } catch (error) {
      console.error('Error loading collaboration data:', error)
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: date.getFullYear() !== new Date().getFullYear() ? 'numeric' : undefined,
    })
  }

  const campaigns = activeTab === 'owned' ? ownedCampaigns : collaboratingCampaigns

  return (
    <DashboardLayout role="creator">
      <div className="space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold mb-2">Campaign Collaborations</h1>
          <p className="text-muted-foreground">
            Manage and track campaigns you own and collaborate on
          </p>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 border-b">
          <button
            onClick={() => setActiveTab('owned')}
            className={`px-4 py-2 font-medium border-b-2 transition-colors ${
              activeTab === 'owned'
                ? 'border-primary text-primary'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
          >
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4" />
              My Campaigns ({ownedCampaigns.length})
            </div>
          </button>

          <button
            onClick={() => setActiveTab('collaborating')}
            className={`px-4 py-2 font-medium border-b-2 transition-colors ${
              activeTab === 'collaborating'
                ? 'border-primary text-primary'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
          >
            <div className="flex items-center gap-2">
              <Inbox className="w-4 h-4" />
              Collaborating ({collaboratingCampaigns.length})
            </div>
          </button>
        </div>

        {/* Content */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
          </div>
        ) : campaigns.length === 0 ? (
          <div className="text-center py-12">
            <Users className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-50" />
            <h3 className="text-lg font-semibold mb-2">No campaigns yet</h3>
            <p className="text-muted-foreground mb-6">
              {activeTab === 'owned'
                ? 'Create your first campaign to get started'
                : 'You haven\'t been invited to collaborate on any campaigns yet'}
            </p>
            {activeTab === 'owned' && (
              <Link href="/dashboard/campaigns">
                <Button>View Campaigns</Button>
              </Link>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {campaigns.map((campaign) => (
              <Link key={campaign.id} href={`/campaigns/${campaign.slug}`}>
                <div className="p-6 rounded-lg border bg-card hover:border-primary/50 hover:shadow-lg transition-all cursor-pointer h-full">
                  {/* Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold line-clamp-2 mb-2">
                        {campaign.title}
                      </h3>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-medium px-2 py-1 rounded-full bg-primary/10 text-primary">
                          {campaign.category}
                        </span>
                        {campaign.role === 'owner' ? (
                          <span className="text-xs font-medium px-2 py-1 rounded-full bg-yellow-500/10 text-yellow-700 dark:text-yellow-400">
                            Owner
                          </span>
                        ) : (
                          <span className="text-xs font-medium px-2 py-1 rounded-full bg-blue-500/10 text-blue-700 dark:text-blue-400">
                            Collaborator
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Footer */}
                  <div className="flex items-center justify-between pt-4 border-t">
                    <div>
                      <p className="text-xs text-muted-foreground">Created</p>
                      <p className="text-sm font-medium">{formatDate(campaign.createdAt)}</p>
                    </div>
                    <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}

        {/* Sections Info */}
        {!loading && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-8 border-t">
            {/* My Campaigns Info */}
            <div className="p-6 rounded-lg bg-blue-500/5 border border-blue-500/20">
              <h4 className="font-semibold mb-2 flex items-center gap-2">
                <Users className="w-4 h-4" />
                My Campaigns
              </h4>
              <p className="text-sm text-muted-foreground">
                Campaigns you created and manage. You can invite other users as collaborators to help develop and promote your campaign.
              </p>
            </div>

            {/* Collaborating Info */}
            <div className="p-6 rounded-lg bg-green-500/5 border border-green-500/20">
              <h4 className="font-semibold mb-2 flex items-center gap-2">
                <Inbox className="w-4 h-4" />
                Collaborating
              </h4>
              <p className="text-sm text-muted-foreground">
                Campaigns where you've been invited as a collaborator. Work together with other creators to make campaigns more successful.
              </p>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}
