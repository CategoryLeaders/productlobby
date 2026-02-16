'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Navbar, Footer } from '@/components/shared'
import { Card, CardContent, CardHeader, CardTitle, Badge, Button, Avatar, Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui'
import { Edit, Calendar, Award } from 'lucide-react'

interface UserProfile {
  id: string
  displayName: string
  handle: string
  bio: string
  avatar?: string
  joinedDate: string
  contributionScore: number
  isOwnProfile: boolean
}

interface CreatedCampaign {
  id: string
  title: string
  description: string
  category: string
  image?: string
  lobbyCount: number
  status: 'active' | 'completed' | 'draft'
}

interface LobbiedCampaign {
  id: string
  title: string
  brandName: string
  myIntensity: 'neat_idea' | 'probably_buy' | 'take_my_money'
}

const DEMO_PROFILE: UserProfile = {
  id: 'user-1',
  displayName: 'Alex Johnson',
  handle: '@alexjohnson',
  bio: 'Product enthusiast. Always looking for better design and sustainability.',
  avatar: undefined,
  joinedDate: '2023-06-15',
  contributionScore: 342,
  isOwnProfile: true,
}

const DEMO_CREATED_CAMPAIGNS: CreatedCampaign[] = [
  {
    id: 'campaign-1',
    title: 'Sustainable Coffee Pods',
    description: 'Eco-friendly alternatives to single-use coffee pods',
    category: 'Home & Kitchen',
    lobbyCount: 1850,
    status: 'completed',
  },
  {
    id: 'campaign-2',
    title: 'Ergonomic Standing Desk',
    description: 'Affordable smart standing desk with health tracking',
    category: 'Office & Furniture',
    lobbyCount: 2140,
    status: 'active',
  },
  {
    id: 'campaign-3',
    title: 'Waterproof AirPods Case',
    description: 'Rugged waterproof case for Apple AirPods',
    category: 'Electronics & Accessories',
    lobbyCount: 890,
    status: 'active',
  },
]

const DEMO_LOBBIED_CAMPAIGNS: LobbiedCampaign[] = [
  {
    id: 'nike-extended',
    title: 'Nike Extended Sizes',
    brandName: 'Nike',
    myIntensity: 'take_my_money',
  },
  {
    id: 'dyson-fan',
    title: 'Dyson Silent Fan',
    brandName: 'Dyson',
    myIntensity: 'probably_buy',
  },
  {
    id: 'ikea-desk',
    title: 'IKEA Gaming Chair',
    brandName: 'IKEA',
    myIntensity: 'neat_idea',
  },
  {
    id: 'ms-meals',
    title: 'Plant-Based Ready Meals',
    brandName: 'M&S',
    myIntensity: 'take_my_money',
  },
  {
    id: 'garmin-tracker',
    title: 'Dog Walking GPS Tracker',
    brandName: 'Garmin',
    myIntensity: 'probably_buy',
  },
]

const intensityConfig = {
  'neat_idea': { label: 'Neat idea', color: 'default' },
  'probably_buy': { label: 'Probably buy', color: 'yellow' },
  'take_my_money': { label: 'Take my money', color: 'green' },
}

const statusBadgeColor = {
  'active': 'lime',
  'completed': 'green',
  'draft': 'gray',
}

export default function ProfilePage() {
  const profile = DEMO_PROFILE
  const [activeTab, setActiveTab] = useState('created')

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
    })
  }

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
                  <Avatar
                    size="xl"
                    initials={profile.displayName.split(' ').map(n => n[0]).join('')}
                    alt={profile.displayName}
                  />
                </div>

                {/* Name & Handle */}
                <h1 className="text-3xl font-bold font-display text-foreground mb-1">
                  {profile.displayName}
                </h1>
                <p className="text-gray-600 mb-4">{profile.handle}</p>

                {/* Bio */}
                {profile.bio && (
                  <p className="text-gray-600 max-w-2xl mx-auto mb-6">
                    {profile.bio}
                  </p>
                )}

                {/* Metadata */}
                <div className="flex flex-col md:flex-row items-center justify-center gap-4 mb-6 text-sm text-gray-600">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    Joined {formatDate(profile.joinedDate)}
                  </div>
                  <div className="w-px h-4 bg-gray-300 hidden md:block"></div>
                  <div className="flex items-center gap-2">
                    <Award className="w-4 h-4" />
                    Contribution Score: {profile.contributionScore}
                  </div>
                </div>

                {/* Edit Profile Button (if own profile) */}
                {profile.isOwnProfile && (
                  <Button variant="secondary" className="gap-2">
                    <Edit className="w-4 h-4" />
                    Edit Profile
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Stats Cards */}
          <div className="grid grid-cols-3 gap-4 mb-8">
            <Card>
              <CardContent className="text-center py-6">
                <p className="text-3xl font-bold font-display text-violet-600 mb-1">
                  {DEMO_CREATED_CAMPAIGNS.length}
                </p>
                <p className="text-sm text-gray-600">Campaigns Created</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="text-center py-6">
                <p className="text-3xl font-bold font-display text-green-600 mb-1">
                  {DEMO_LOBBIED_CAMPAIGNS.length}
                </p>
                <p className="text-sm text-gray-600">Campaigns Lobbied</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="text-center py-6">
                <p className="text-3xl font-bold font-display text-lime-600 mb-1">
                  1
                </p>
                <p className="text-sm text-gray-600">Products Shipped</p>
              </CardContent>
            </Card>
          </div>

          {/* Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="mb-6">
              <TabsTrigger value="created">Created Campaigns</TabsTrigger>
              <TabsTrigger value="lobbied">Lobbied Campaigns</TabsTrigger>
            </TabsList>

            {/* Created Campaigns Tab */}
            <TabsContent value="created" className="space-y-4">
              {DEMO_CREATED_CAMPAIGNS.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {DEMO_CREATED_CAMPAIGNS.map(campaign => (
                    <Link key={campaign.id} href={`/campaigns/${campaign.id}`}>
                      <Card className="h-full hover:shadow-card-hover transition-shadow cursor-pointer overflow-hidden">
                        {/* Placeholder for image */}
                        <div className="bg-gradient-to-br from-violet-100 to-lime-100 h-40"></div>

                        <CardContent className="pt-4">
                          <div className="flex items-start justify-between gap-2 mb-2">
                            <h3 className="font-semibold text-foreground line-clamp-2">
                              {campaign.title}
                            </h3>
                            <Badge
                              variant={statusBadgeColor[campaign.status] as any}
                              size="sm"
                              className="flex-shrink-0"
                            >
                              {campaign.status.charAt(0).toUpperCase() + campaign.status.slice(1)}
                            </Badge>
                          </div>
                          <p className="text-xs text-gray-600 mb-3 line-clamp-2">
                            {campaign.description}
                          </p>
                          <p className="text-sm font-medium text-violet-600">
                            {campaign.lobbyCount.toLocaleString()} lobbies
                          </p>
                        </CardContent>
                      </Card>
                    </Link>
                  ))}
                </div>
              ) : (
                <Card>
                  <CardContent className="py-12 text-center">
                    <p className="text-gray-600">No campaigns created yet</p>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            {/* Lobbied Campaigns Tab */}
            <TabsContent value="lobbied" className="space-y-3">
              {DEMO_LOBBIED_CAMPAIGNS.length > 0 ? (
                DEMO_LOBBIED_CAMPAIGNS.map(campaign => {
                  const intensity = intensityConfig[campaign.myIntensity]
                  return (
                    <Link key={campaign.id} href={`/campaigns/${campaign.id}`}>
                      <Card className="hover:shadow-card-hover transition-all cursor-pointer">
                        <CardContent className="py-4 px-6">
                          <div className="flex items-center justify-between gap-4">
                            <div className="flex-1 min-w-0">
                              <h3 className="font-semibold text-foreground">{campaign.title}</h3>
                              <p className="text-sm text-gray-600 mt-1">{campaign.brandName}</p>
                            </div>
                            <Badge variant={intensity.color as any} size="sm">
                              {intensity.label}
                            </Badge>
                          </div>
                        </CardContent>
                      </Card>
                    </Link>
                  )
                })
              ) : (
                <Card>
                  <CardContent className="py-12 text-center">
                    <p className="text-gray-600">No campaigns lobbied yet</p>
                  </CardContent>
                </Card>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </main>

      <Footer />
    </div>
  )
}
