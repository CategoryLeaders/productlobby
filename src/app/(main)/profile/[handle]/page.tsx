'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { Navbar } from '@/components/shared/navbar'
import { Footer } from '@/components/shared/footer'
import { ProfileHeader } from '@/components/users/profile-header'
import { CampaignCard } from '@/components/shared/campaign-card'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'

interface UserProfile {
  id: string
  displayName: string
  handle: string
  avatar?: string
  bio?: string
  joinDate: string
  twitterHandle?: string
  instagramHandle?: string
  tiktokHandle?: string
  linkedinHandle?: string
  location?: string
  website?: string
  stats: {
    campaignsCreated: number
    campaignsSupported: number
    commentsMade: number
  }
  campaigns: Array<{
    id: string
    slug: string
    title: string
    description: string
    category: string
    image?: string
    lobbyCount: number
    createdAt: string
  }>
  lobbiedCampaigns: Array<{
    id: string
    slug: string
    title: string
    description: string
    category: string
    image?: string
    lobbyCount: number
    createdAt: string
    creatorId: string
  }>
}

interface PageProps {
  params: {
    handle: string
  }
}

const LoadingSpinner = () => (
  <div className="min-h-screen bg-white flex flex-col">
    <Navbar />
    <main className="flex-1 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-violet-600 mx-auto mb-4"></div>
        <p className="text-gray-600">Loading profile...</p>
      </div>
    </main>
    <Footer />
  </div>
)

const ErrorPage = ({ message }: { message: string }) => (
  <div className="min-h-screen bg-white flex flex-col">
    <Navbar />
    <main className="flex-1 flex items-center justify-center">
      <div className="text-center">
        <div className="text-6xl mb-4">404</div>
        <h1 className="text-3xl font-display font-bold text-foreground mb-2">
          Profile not found
        </h1>
        <p className="text-gray-600 mb-6">{message}</p>
        <Link href="/campaigns">
          <Button variant="primary">Back to campaigns</Button>
        </Link>
      </div>
    </main>
    <Footer />
  </div>
)

export default function ProfilePage({ params }: PageProps) {
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true)
        setError(null)
        const response = await fetch(`/api/users/${params.handle}`)

        if (!response.ok) {
          if (response.status === 404) {
            setError('This user profile doesn\'t exist.')
          } else {
            setError('Failed to load profile. Please try again.')
          }
          setProfile(null)
          return
        }

        const data = await response.json()
        setProfile(data)
      } catch (err) {
        setError('Failed to load profile. Please try again.')
        setProfile(null)
      } finally {
        setLoading(false)
      }
    }

    fetchProfile()
  }, [params.handle])

  if (loading) {
    return <LoadingSpinner />
  }

  if (error || !profile) {
    return <ErrorPage message={error || 'This user profile doesn\'t exist.'} />
  }

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <Navbar />

      <main className="flex-1">
        {/* Profile Header */}
        <ProfileHeader
          displayName={profile.displayName}
          handle={profile.handle}
          avatar={profile.avatar}
          bio={profile.bio}
          joinDate={profile.joinDate}
          twitterHandle={profile.twitterHandle}
          instagramHandle={profile.instagramHandle}
          tiktokHandle={profile.tiktokHandle}
          linkedinHandle={profile.linkedinHandle}
          location={profile.location}
          website={profile.website}
          stats={profile.stats}
        />

        {/* Tabs Section */}
        <div className="bg-gray-50 border-b border-gray-200">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <Tabs defaultValue="campaigns" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="campaigns">
                  Campaigns Created ({profile.stats.campaignsCreated})
                </TabsTrigger>
                <TabsTrigger value="lobbied">
                  Campaigns Supported ({profile.stats.campaignsSupported})
                </TabsTrigger>
              </TabsList>

              {/* Campaigns Created Tab */}
              <TabsContent value="campaigns" className="mt-8">
                {profile.campaigns.length === 0 ? (
                  <div className="text-center py-12">
                    <p className="text-gray-600 mb-4">
                      This user hasn't created any campaigns yet.
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {profile.campaigns.map((campaign) => (
                      <CampaignCard
                        key={campaign.id}
                        id={campaign.id}
                        title={campaign.title}
                        slug={campaign.slug}
                        description={campaign.description}
                        category={campaign.category}
                        image={campaign.image}
                        lobbyCount={campaign.lobbyCount}
                        intensityDistribution={{
                          low: 0,
                          medium: 0,
                          high: 0,
                        }}
                        completenessScore={0}
                        status="active"
                        creator={{
                          id: profile.id,
                          displayName: profile.displayName,
                          email: profile.handle,
                          avatar: profile.avatar,
                        }}
                        createdAt={campaign.createdAt}
                      />
                    ))}
                  </div>
                )}
              </TabsContent>

              {/* Campaigns Supported Tab */}
              <TabsContent value="lobbied" className="mt-8">
                {profile.lobbiedCampaigns.length === 0 ? (
                  <div className="text-center py-12">
                    <p className="text-gray-600 mb-4">
                      This user hasn't supported any campaigns yet.
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {profile.lobbiedCampaigns.map((campaign) => (
                      <CampaignCard
                        key={campaign.id}
                        id={campaign.id}
                        title={campaign.title}
                        slug={campaign.slug}
                        description={campaign.description}
                        category={campaign.category}
                        image={campaign.image}
                        lobbyCount={campaign.lobbyCount}
                        intensityDistribution={{
                          low: 0,
                          medium: 0,
                          high: 0,
                        }}
                        completenessScore={0}
                        status="active"
                        creator={{
                          id: campaign.creatorId,
                          displayName: '',
                          email: '',
                        }}
                        createdAt={campaign.createdAt}
                      />
                    ))}
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
