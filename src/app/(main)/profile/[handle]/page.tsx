'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { Navbar, Footer } from '@/components/shared'
import { Card, CardContent, CardHeader, CardTitle, Badge, Button, Tabs, TabsList, TabsTrigger, TabsContent, Spinner } from '@/components/ui'
import { Edit, Calendar, Award, Lock } from 'lucide-react'
import { Badge as BadgeType } from '@/lib/badges'
import { EditProfileForm } from '@/components/shared/edit-profile-form'
import { formatDate, formatNumber } from '@/lib/utils'

interface UserProfile {
  id: string
  displayName: string
  handle: string | null
  avatar: string | null
  bio: string | null
  contributionScore: number
  createdAt: string
  isOwnProfile: boolean
  stats: {
    campaignsCreated: number
    campaignsSupported: number
    totalComments: number
    totalShares: number
  }
  badges: BadgeType[]
  recentCampaignsCreated: Array<{ id: string; title: string; slug: string }>
  recentCampaignsLobbied: Array<{ id: string; title: string; slug: string }>
}

function ContributionLevel({ score }: { score: number }) {
  let level = 'Novice'
  let color = 'gray'

  if (score >= 1000) {
    level = 'Legendary'
    color = 'purple'
  } else if (score >= 500) {
    level = 'Expert'
    color = 'violet'
  } else if (score >= 250) {
    level = 'Advanced'
    color = 'blue'
  } else if (score >= 100) {
    level = 'Intermediate'
    color = 'emerald'
  } else if (score >= 25) {
    level = 'Beginner'
    color = 'amber'
  }

  return (
    <Badge variant={color as any} size="sm">
      {level} • {score} pts
    </Badge>
  )
}

export default function UserProfilePage() {
  const params = useParams()
  const handle = params.handle as string
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showEditForm, setShowEditForm] = useState(false)
  const [activeTab, setActiveTab] = useState('created')

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true)
        setError(null)

        const response = await fetch(`/api/user/${handle}/profile`)
        if (!response.ok) {
          if (response.status === 404) {
            setError('User not found')
          } else {
            setError('Failed to load profile')
          }
          return
        }

        const data = await response.json()
        setProfile(data)
      } catch (err) {
        setError('An error occurred while loading the profile')
        console.error(err)
      } finally {
        setLoading(false)
      }
    }

    if (handle) {
      fetchProfile()
    }
  }, [handle])

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="py-12">
          <div className="max-w-4xl mx-auto px-4 md:px-6 lg:px-8">
            <div className="flex justify-center items-center h-96">
              <Spinner size="lg" />
            </div>
          </div>
        </main>
        <Footer />
      </div>
    )
  }

  if (error || !profile) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="py-12">
          <div className="max-w-4xl mx-auto px-4 md:px-6 lg:px-8">
            <Card>
              <CardContent className="py-12 text-center">
                <p className="text-red-600 mb-4">{error || 'Profile not found'}</p>
                <Link href="/">
                  <Button variant="primary">
                    Back to Home
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </main>
        <Footer />
      </div>
    )
  }

  if (showEditForm && profile.isOwnProfile) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="py-12">
          <div className="max-w-2xl mx-auto px-4 md:px-6 lg:px-8">
            <EditProfileForm
              initialDisplayName={profile.displayName}
              initialHandle={profile.handle}
              initialBio={profile.bio}
              initialAvatar={profile.avatar}
              onSuccess={(updatedUser) => {
                setProfile({
                  ...profile,
                  displayName: updatedUser.displayName,
                  handle: updatedUser.handle,
                  bio: updatedUser.bio,
                  avatar: updatedUser.avatar,
                })
                setShowEditForm(false)
              }}
              onCancel={() => setShowEditForm(false)}
            />
          </div>
        </main>
        <Footer />
      </div>
    )
  }

  const earnedBadges = profile.badges.filter((b) => b.earned)
  const unearnedBadges = profile.badges.filter((b) => !b.earned)

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="py-12">
        <div className="max-w-4xl mx-auto px-4 md:px-6 lg:px-8">
          {/* Profile Header */}
          <Card className="mb-8">
            <CardContent className="py-12">
              <div className="text-center">
                {/* Avatar */}
                <div className="flex justify-center mb-6">
                  {profile.avatar ? (
                    <img
                      src={profile.avatar}
                      alt={profile.displayName}
                      className="h-24 w-24 rounded-full object-cover"
                    />
                  ) : (
                    <div className="h-24 w-24 rounded-full bg-violet-100 flex items-center justify-center text-3xl font-semibold text-violet-700">
                      {profile.displayName.split(' ').map((n) => n[0]).join('')}
                    </div>
                  )}
                </div>

                {/* Name & Handle */}
                <h1 className="text-3xl font-bold font-display text-foreground mb-1">
                  {profile.displayName}
                </h1>
                {profile.handle && (
                  <p className="text-gray-600 mb-4">@{profile.handle}</p>
                )}

                {/* Bio */}
                {profile.bio && (
                  <p className="text-gray-600 max-w-2xl mx-auto mb-6">
                    {profile.bio}
                  </p>
                )}

                {/* Contribution Score & Metadata */}
                <div className="flex flex-col md:flex-row items-center justify-center gap-4 mb-6">
                  <ContributionLevel score={profile.contributionScore} />
                  <div className="w-px h-4 bg-gray-300 hidden md:block"></div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Calendar className="w-4 h-4" />
                    Joined {formatDate(profile.createdAt)}
                  </div>
                </div>

                {/* Edit Profile Button (if own profile) */}
                {profile.isOwnProfile && (
                  <Button
                    variant="secondary"
                    className="gap-2"
                    onClick={() => setShowEditForm(true)}
                  >
                    <Edit className="w-4 h-4" />
                    Edit Profile
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Stats Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <Card>
              <CardContent className="text-center py-6">
                <p className="text-2xl md:text-3xl font-bold font-display text-violet-600 mb-1">
                  {profile.stats.campaignsCreated}
                </p>
                <p className="text-xs md:text-sm text-gray-600">Campaigns Created</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="text-center py-6">
                <p className="text-2xl md:text-3xl font-bold font-display text-lime-500 mb-1">
                  {profile.stats.campaignsSupported}
                </p>
                <p className="text-xs md:text-sm text-gray-600">Campaigns Lobbied</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="text-center py-6">
                <p className="text-2xl md:text-3xl font-bold font-display text-blue-600 mb-1">
                  {profile.stats.totalComments}
                </p>
                <p className="text-xs md:text-sm text-gray-600">Comments</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="text-center py-6">
                <p className="text-2xl md:text-3xl font-bold font-display text-emerald-600 mb-1">
                  {profile.stats.totalShares}
                </p>
                <p className="text-xs md:text-sm text-gray-600">Shares</p>
              </CardContent>
            </Card>
          </div>

          {/* Badges Section */}
          {profile.badges.length > 0 && (
            <Card className="mb-8">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Award className="w-5 h-5" />
                  Achievements ({earnedBadges.length} earned)
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                  {/* Earned badges */}
                  {earnedBadges.map((badge) => (
                    <div
                      key={badge.id}
                      className="text-center p-4 rounded-lg bg-gradient-to-br from-violet-50 to-lime-50 border border-violet-100"
                      title={badge.description}
                    >
                      <div className="text-4xl mb-2">{badge.icon}</div>
                      <p className="font-semibold text-sm text-foreground">
                        {badge.name}
                      </p>
                      <p className="text-xs text-gray-600 mt-1">
                        {badge.description}
                      </p>
                    </div>
                  ))}

                  {/* Unearned badges */}
                  {unearnedBadges.map((badge) => (
                    <div
                      key={badge.id}
                      className="text-center p-4 rounded-lg bg-gray-50 border border-gray-200 opacity-50"
                      title={`Locked: ${badge.description}`}
                    >
                      <div className="text-4xl mb-2 grayscale">{badge.icon}</div>
                      <p className="font-semibold text-sm text-gray-600">
                        {badge.name}
                      </p>
                      <div className="flex justify-center mt-2">
                        <Lock className="w-4 h-4 text-gray-400" />
                      </div>
                      <p className="text-xs text-gray-500 mt-1">
                        {badge.description}
                      </p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="mb-6">
              <TabsTrigger value="created">
                Campaigns Created ({profile.stats.campaignsCreated})
              </TabsTrigger>
              <TabsTrigger value="lobbied">
                Campaigns Lobbied ({profile.stats.campaignsSupported})
              </TabsTrigger>
            </TabsList>

            {/* Created Campaigns Tab */}
            <TabsContent value="created" className="space-y-4">
              {profile.stats.campaignsCreated === 0 ? (
                <Card>
                  <CardContent className="py-12 text-center">
                    <p className="text-gray-600 mb-4">
                      {profile.isOwnProfile
                        ? "You haven't created any campaigns yet"
                        : "This user hasn't created any campaigns yet"}
                    </p>
                    {profile.isOwnProfile && (
                      <Link href="/campaigns/new">
                        <Button variant="primary">Create Your First Campaign</Button>
                      </Link>
                    )}
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-3">
                  {profile.recentCampaignsCreated.map((campaign) => (
                    <Link
                      key={campaign.id}
                      href={`/campaigns/${campaign.slug}`}
                    >
                      <Card className="hover:shadow-card-hover transition-shadow cursor-pointer">
                        <CardContent className="py-4 px-6">
                          <h3 className="font-semibold text-foreground hover:text-violet-600 transition-colors">
                            {campaign.title}
                          </h3>
                        </CardContent>
                      </Card>
                    </Link>
                  ))}
                </div>
              )}
            </TabsContent>

            {/* Lobbied Campaigns Tab */}
            <TabsContent value="lobbied" className="space-y-3">
              {profile.stats.campaignsSupported === 0 ? (
                <Card>
                  <CardContent className="py-12 text-center">
                    <p className="text-gray-600 mb-4">
                      {profile.isOwnProfile
                        ? "You haven't lobbied any campaigns yet"
                        : "This user hasn't lobbied any campaigns yet"}
                    </p>
                    {profile.isOwnProfile && (
                      <Link href="/campaigns">
                        <Button variant="primary">Explore Campaigns</Button>
                      </Link>
                    )}
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-3">
                  {profile.recentCampaignsLobbied.map((campaign) => (
                    <Link
                      key={campaign.id}
                      href={`/campaigns/${campaign.slug}`}
                    >
                      <Card className="hover:shadow-card-hover transition-shadow cursor-pointer">
                        <CardContent className="py-4 px-6">
                          <h3 className="font-semibold text-foreground hover:text-violet-600 transition-colors">
                            {campaign.title}
                          </h3>
                        </CardContent>
                      </Card>
                    </Link>
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </main>

      <Footer />
    </div>
  )
}
