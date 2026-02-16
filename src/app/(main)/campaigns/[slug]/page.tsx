'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { ChevronRight, Share2, Twitter, Facebook, MessageCircle, Mail, Megaphone } from 'lucide-react'
import { Navbar } from '@/components/shared/navbar'
import { Footer } from '@/components/shared/footer'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar } from '@/components/ui/avatar'
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { LobbyFlow } from './lobby-flow'
import { cn, formatDate, formatNumber } from '@/lib/utils'

interface CampaignDetailPageProps {
  params: {
    slug: string
  }
}

// Demo campaign data
const CAMPAIGN_DATA = {
  id: 'campaign-nike-women-shoes',
  title: 'Nike Women\'s Running Shoes in Extended Sizes',
  slug: 'nike-womens-running-shoes-extended-sizes',
  description: 'Nike needs to expand their women\'s running shoe line to include extended sizes (14+). Many athletes with larger feet are currently unable to find properly fitting running shoes, leading them to choose competitor brands. This campaign advocates for Nike to invest in developing and manufacturing women\'s running shoes in sizes 14, 15, and 16.',
  category: 'Fashion & Footwear',
  brand: {
    id: 'nike',
    name: 'Nike',
    logo: '👟',
  },
  creator: {
    id: 'user-sarah-mitchell',
    displayName: 'Sarah Mitchell',
    email: 'sarah.mitchell@example.com',
    avatar: undefined,
    bio: 'Passionate about inclusive product design. Size 13 shoe wearer.',
  },
  lobbyCount: 2847,
  intensityDistribution: {
    low: 427,
    medium: 1052,
    high: 1368,
  },
  createdAt: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000).toISOString(),
  updatedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
  status: 'active' as const,
  completenessScore: 87,
  vision: [
    'Extended size availability (14-16)',
    'Premium quality matching existing lines',
    'Color options across the range',
    'Competitive pricing within Nike standards',
  ],
  preferences: {
    sizeDistribution: [
      { size: 'UK 3', count: 0 },
      { size: 'UK 4', count: 0 },
      { size: 'UK 5', count: 0 },
      { size: 'UK 6', count: 45 },
      { size: 'UK 7', count: 189 },
      { size: 'UK 8', count: 312 },
      { size: 'UK 9', count: 287 },
      { size: 'UK 10', count: 234 },
      { size: 'UK 11', count: 289 },
      { size: 'UK 12', count: 456 },
    ],
    colorPreferences: [
      { color: 'Black', count: 892 },
      { color: 'White', count: 674 },
      { color: 'Red', count: 445 },
      { color: 'Blue', count: 312 },
      { color: 'Pink', count: 234 },
      { color: 'Other', count: 290 },
    ],
    priceWillingness: [
      { range: 'Under £50', percent: 5 },
      { range: '£50-100', percent: 25 },
      { range: '£100-150', percent: 45 },
      { range: '£150+', percent: 25 },
    ],
  },
  wishlistThemes: [
    { theme: 'Wider toe box', mentions: 234 },
    { theme: 'Arch support options', mentions: 189 },
    { theme: 'Vegan materials', mentions: 156 },
    { theme: 'Extended width options', mentions: 143 },
    { theme: 'More colourways', mentions: 128 },
  ],
  updates: [
    {
      id: 'update-1',
      date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
      title: 'We\'ve hit 2,500 lobbies!',
      content: 'Thanks everyone for your support. We\'re halfway to our next milestone. Keep sharing!',
      author: 'Sarah Mitchell',
    },
    {
      id: 'update-2',
      date: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
      title: 'Campaign Launch',
      content: 'Excited to launch this campaign! Together, we can make Nike see the market opportunity.',
      author: 'Sarah Mitchell',
    },
  ],
  brandResponse: {
    status: 'unresponsive',
    message: 'Nike hasn\'t responded to this campaign yet.',
  },
}

const getCreatorInitials = (name: string) => {
  return name
    .split(' ')
    .map((n) => n.charAt(0))
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

export default function CampaignDetailPage({ params }: CampaignDetailPageProps) {
  const [isLobbyFlowOpen, setIsLobbyFlowOpen] = useState(false)
  const campaign = CAMPAIGN_DATA

  const totalLobbies = campaign.intensityDistribution.low + campaign.intensityDistribution.medium + campaign.intensityDistribution.high
  const lowPercent = (campaign.intensityDistribution.low / totalLobbies) * 100
  const mediumPercent = (campaign.intensityDistribution.medium / totalLobbies) * 100
  const highPercent = (campaign.intensityDistribution.high / totalLobbies) * 100

  const creatorInitials = getCreatorInitials(campaign.creator.displayName)

  const maxSizeCount = Math.max(...campaign.preferences.sizeDistribution.map(s => s.count))
  const maxColorCount = Math.max(...campaign.preferences.colorPreferences.map(c => c.count))

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <Navbar />

      <main className="flex-1">
        <div className="bg-white">
          {/* Breadcrumb */}
          <div className="max-w-7xl mx-auto px-4 py-4 border-b border-gray-100">
            <div className="flex items-center gap-2 text-sm">
              <Link href="/" className="text-violet-600 hover:text-violet-700">
                Home
              </Link>
              <ChevronRight className="w-4 h-4 text-gray-400" />
              <Link href="/campaigns" className="text-violet-600 hover:text-violet-700">
                Fashion & Footwear
              </Link>
              <ChevronRight className="w-4 h-4 text-gray-400" />
              <span className="text-gray-600">{campaign.title}</span>
            </div>
          </div>

          {/* Hero Section */}
          <div className="max-w-7xl mx-auto px-4 py-8">
            {/* Hero Image */}
            <div className="w-full h-96 bg-gradient-to-br from-violet-50 to-violet-100 rounded-lg mb-8 flex items-center justify-center overflow-hidden">
              <div className="text-center">
                <div className="text-8xl mb-4">{campaign.brand.logo}</div>
                <p className="text-violet-600 text-lg font-display font-semibold">Campaign Hero</p>
              </div>
            </div>

            {/* Title & Meta */}
            <div className="mb-6">
              <h1 className="font-display font-bold text-4xl text-foreground mb-4">
                {campaign.title}
              </h1>

              {/* Badges & Info Row */}
              <div className="flex flex-wrap items-center gap-3 mb-6">
                <Badge variant="default">{campaign.category}</Badge>
                <Badge variant="outline">Targeted at: {campaign.brand.name}</Badge>
              </div>

              {/* Creator Info & Dates */}
              <div className="flex flex-col gap-4 mb-6">
                <div className="flex items-center gap-3">
                  <Avatar
                    src={campaign.creator.avatar}
                    alt={campaign.creator.displayName}
                    initials={creatorInitials}
                    size="sm"
                  />
                  <div>
                    <p className="font-medium text-foreground">{campaign.creator.displayName}</p>
                    <p className="text-sm text-gray-600">Campaign Creator</p>
                  </div>
                </div>

                <div className="flex gap-6 text-sm text-gray-600">
                  <span>Created {formatDate(campaign.createdAt)}</span>
                  <span>Updated {formatDate(campaign.updatedAt)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Stats Bar */}
          <div className="bg-white border-y border-gray-100">
            <div className="max-w-7xl mx-auto px-4 py-8">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
                {/* Total Lobbies */}
                <div>
                  <p className="text-gray-600 text-sm mb-2">Total Lobbies</p>
                  <p className="font-display font-bold text-4xl text-foreground">
                    {formatNumber(campaign.lobbyCount)}
                  </p>
                </div>

                {/* Intensity Distribution */}
                <div className="md:col-span-2">
                  <p className="text-gray-600 text-sm mb-4">Intensity Distribution</p>
                  <div className="flex items-end gap-6">
                    {/* Green - Neat Idea */}
                    <div className="flex-1">
                      <div className="flex items-baseline gap-2 mb-2">
                        <span className="inline-block w-3 h-3 rounded-full bg-green-500"></span>
                        <span className="text-sm font-medium text-foreground">Neat Idea</span>
                      </div>
                      <p className="text-2xl font-bold text-foreground">{campaign.intensityDistribution.low}</p>
                      <p className="text-xs text-gray-600">{lowPercent.toFixed(0)}%</p>
                    </div>

                    {/* Yellow - I'd Probably Buy */}
                    <div className="flex-1">
                      <div className="flex items-baseline gap-2 mb-2">
                        <span className="inline-block w-3 h-3 rounded-full bg-yellow-400"></span>
                        <span className="text-sm font-medium text-foreground">I'd Probably Buy</span>
                      </div>
                      <p className="text-2xl font-bold text-foreground">{campaign.intensityDistribution.medium}</p>
                      <p className="text-xs text-gray-600">{mediumPercent.toFixed(0)}%</p>
                    </div>

                    {/* Purple - Take My Money */}
                    <div className="flex-1">
                      <div className="flex items-baseline gap-2 mb-2">
                        <span className="inline-block w-3 h-3 rounded-full bg-violet-600"></span>
                        <span className="text-sm font-medium text-foreground">Take My Money!</span>
                      </div>
                      <p className="text-2xl font-bold text-foreground">{campaign.intensityDistribution.high}</p>
                      <p className="text-xs text-gray-600">{highPercent.toFixed(0)}%</p>
                    </div>
                  </div>

                  {/* Stacked Bar */}
                  <div className="flex h-3 rounded-full overflow-hidden bg-gray-200 mt-6">
                    <div
                      className="bg-green-500 transition-all duration-300"
                      style={{ width: `${lowPercent}%` }}
                    ></div>
                    <div
                      className="bg-yellow-400 transition-all duration-300"
                      style={{ width: `${mediumPercent}%` }}
                    ></div>
                    <div
                      className="bg-violet-600 transition-all duration-300"
                      style={{ width: `${highPercent}%` }}
                    ></div>
                  </div>
                </div>
              </div>

              {/* Milestone Progress */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <p className="text-sm font-medium text-foreground">Next milestone: 5,000 lobbies</p>
                  <p className="text-sm text-gray-600">{campaign.lobbyCount} of 5,000</p>
                </div>
                <Progress value={(campaign.lobbyCount / 5000) * 100} className="h-2" />
              </div>
            </div>
          </div>

          {/* Main Content + Sidebar Layout */}
          <div className="max-w-7xl mx-auto px-4 py-8">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Left Column - Main Content */}
              <div className="lg:col-span-2">
                {/* Lobby Section */}
                <Card className="mb-8 sticky top-4 lg:hidden">
                  <CardContent className="p-6">
                    <Button
                      variant="primary"
                      size="lg"
                      className="w-full mb-4 flex items-center justify-center gap-2"
                      onClick={() => setIsLobbyFlowOpen(true)}
                    >
                      <Megaphone className="w-5 h-5" />
                      Lobby for this!
                    </Button>
                    <div className="text-center text-sm text-gray-600">
                      <p className="mb-1">{formatNumber(campaign.lobbyCount)} people have lobbied</p>
                      <p className="font-medium text-foreground">{highPercent.toFixed(0)}% say 'shut up and take my money!'</p>
                    </div>
                  </CardContent>
                </Card>

                {/* Tabs */}
                <Tabs defaultValue="about" className="w-full">
                  <TabsList className="border-b border-gray-200 mb-0 rounded-none">
                    <TabsTrigger value="about">About</TabsTrigger>
                    <TabsTrigger value="preferences">Preferences</TabsTrigger>
                    <TabsTrigger value="wishlist">Wishlist</TabsTrigger>
                    <TabsTrigger value="updates">Updates</TabsTrigger>
                    <TabsTrigger value="response">Brand Response</TabsTrigger>
                  </TabsList>

                  {/* Tab 1: About */}
                  <TabsContent value="about" className="py-8">
                    <div className="space-y-6">
                      <div>
                        <h2 className="font-display font-semibold text-xl text-foreground mb-3">Campaign Vision</h2>
                        <p className="text-gray-700 leading-relaxed mb-4">
                          {campaign.description}
                        </p>
                      </div>

                      <div>
                        <h3 className="font-display font-semibold text-lg text-foreground mb-3">What We're Asking For</h3>
                        <ul className="space-y-2">
                          {campaign.vision.map((item, idx) => (
                            <li key={idx} className="flex items-start gap-3">
                              <span className="inline-block w-2 h-2 bg-lime-500 rounded-full mt-2"></span>
                              <span className="text-gray-700">{item}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      <div>
                        <h3 className="font-display font-semibold text-lg text-foreground mb-4">Campaign Gallery</h3>
                        <div className="grid grid-cols-2 gap-4">
                          {[1, 2, 3, 4].map((i) => (
                            <div
                              key={i}
                              className="h-48 bg-gradient-to-br from-violet-50 to-violet-100 rounded-lg flex items-center justify-center"
                            >
                              <div className="text-center">
                                <div className="text-4xl mb-2">📸</div>
                                <p className="text-xs text-violet-600">Image {i}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div>
                        <h3 className="font-display font-semibold text-lg text-foreground mb-3">Creator's Pitch</h3>
                        <div className="bg-violet-50 border border-violet-200 rounded-lg p-4">
                          <p className="text-gray-700 italic">
                            "As someone who wears size 13 shoes, I've always struggled to find running shoes that fit properly. Nike makes excellent running shoes, but they stop at size 12. I know I'm not alone—there are thousands of women and girls who would choose Nike if extended sizes were available. This isn't just about shoes; it's about inclusion and recognizing that diverse bodies deserve access to quality products."
                          </p>
                          <p className="text-sm text-gray-600 mt-3">— Sarah Mitchell, Campaign Creator</p>
                        </div>
                      </div>
                    </div>
                  </TabsContent>

                  {/* Tab 2: Preferences */}
                  <TabsContent value="preferences" className="py-8">
                    <div className="space-y-8">
                      {/* Size Distribution */}
                      <div>
                        <h3 className="font-display font-semibold text-lg text-foreground mb-4">Popular Shoe Sizes</h3>
                        <div className="space-y-3">
                          {campaign.preferences.sizeDistribution
                            .filter(s => s.count > 0)
                            .sort((a, b) => b.count - a.count)
                            .map((size) => (
                              <div key={size.size}>
                                <div className="flex justify-between items-center mb-1">
                                  <span className="text-sm font-medium text-foreground">{size.size}</span>
                                  <span className="text-sm text-gray-600">{size.count} people</span>
                                </div>
                                <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                                  <div
                                    className="h-full bg-violet-600 rounded-full transition-all duration-300"
                                    style={{ width: `${(size.count / maxSizeCount) * 100}%` }}
                                  ></div>
                                </div>
                              </div>
                            ))}
                        </div>
                      </div>

                      {/* Color Preferences */}
                      <div>
                        <h3 className="font-display font-semibold text-lg text-foreground mb-4">Preferred Colours</h3>
                        <div className="flex flex-wrap gap-3">
                          {campaign.preferences.colorPreferences.map((color) => (
                            <div
                              key={color.color}
                              className="bg-white border border-gray-300 rounded-lg px-4 py-2 flex items-center gap-2 hover:border-violet-500 transition-colors"
                            >
                              <span className="text-sm font-medium text-foreground">{color.color}</span>
                              <span className="text-xs text-gray-600">{color.count}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Price Willingness */}
                      <div>
                        <h3 className="font-display font-semibold text-lg text-foreground mb-4">Price Range People Are Willing to Pay</h3>
                        <div className="space-y-3">
                          {campaign.preferences.priceWillingness.map((price) => (
                            <div key={price.range}>
                              <div className="flex justify-between items-center mb-1">
                                <span className="text-sm font-medium text-foreground">{price.range}</span>
                                <span className="text-sm text-gray-600">{price.percent}%</span>
                              </div>
                              <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                                <div
                                  className="h-full bg-lime-500 rounded-full transition-all duration-300"
                                  style={{ width: `${price.percent}%` }}
                                ></div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </TabsContent>

                  {/* Tab 3: Wishlist */}
                  <TabsContent value="wishlist" className="py-8">
                    <div>
                      <h3 className="font-display font-semibold text-lg text-foreground mb-4">Top Feature Requests</h3>
                      <div className="space-y-3">
                        {campaign.wishlistThemes.map((theme) => (
                          <div
                            key={theme.theme}
                            className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-card-hover transition-shadow"
                          >
                            <div className="flex justify-between items-start">
                              <div>
                                <p className="font-medium text-foreground">{theme.theme}</p>
                                <p className="text-sm text-gray-600 mt-1">{theme.mentions} people mentioned this</p>
                              </div>
                              <div className="text-right">
                                <p className="text-2xl font-bold text-violet-600">{theme.mentions}</p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                      <p className="text-sm text-gray-600 mt-6">
                        Themes are aggregated from supporter comments and feedback. They represent what people care about most.
                      </p>
                    </div>
                  </TabsContent>

                  {/* Tab 4: Updates */}
                  <TabsContent value="updates" className="py-8">
                    <div className="space-y-6">
                      {campaign.updates.map((update) => (
                        <div key={update.id} className="border-l-4 border-violet-600 pl-4">
                          <div className="flex items-start justify-between mb-2">
                            <h4 className="font-display font-semibold text-foreground">{update.title}</h4>
                            <span className="text-xs text-gray-500">{formatDate(update.date)}</span>
                          </div>
                          <p className="text-gray-700 mb-2">{update.content}</p>
                          <p className="text-xs text-gray-600">By {update.author}</p>
                        </div>
                      ))}
                    </div>
                  </TabsContent>

                  {/* Tab 5: Brand Response */}
                  <TabsContent value="response" className="py-8">
                    <div className="text-center py-12">
                      <div className="mb-4">
                        <p className="text-5xl mb-4">🤷</p>
                        <h3 className="font-display font-semibold text-lg text-foreground mb-2">No Response Yet</h3>
                        <p className="text-gray-600 mb-6">
                          {campaign.brandResponse.message}
                        </p>
                        <Badge variant="yellow" className="mb-6">
                          Unresponsive
                        </Badge>
                      </div>
                      <Button
                        variant="primary"
                        onClick={() => setIsLobbyFlowOpen(true)}
                        className="inline-flex items-center gap-2"
                      >
                        <Megaphone className="w-4 h-4" />
                        Help lobby {campaign.brand.name}
                      </Button>
                    </div>
                  </TabsContent>
                </Tabs>
              </div>

              {/* Right Sidebar */}
              <div className="hidden lg:block space-y-6">
                {/* Lobby Card */}
                <Card className="sticky top-4">
                  <CardContent className="p-6">
                    <Button
                      variant="primary"
                      size="lg"
                      className="w-full mb-4 flex items-center justify-center gap-2"
                      onClick={() => setIsLobbyFlowOpen(true)}
                    >
                      <Megaphone className="w-5 h-5" />
                      Lobby for this!
                    </Button>
                    <div className="text-center text-sm text-gray-600">
                      <p className="mb-1">{formatNumber(campaign.lobbyCount)} people have lobbied</p>
                      <p className="font-medium text-foreground">{highPercent.toFixed(0)}% say 'shut up and take my money!'</p>
                    </div>
                  </CardContent>
                </Card>

                {/* Share Card */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Share this campaign</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <Button
                      variant="secondary"
                      size="md"
                      className="w-full justify-center gap-2"
                      onClick={() => {
                        navigator.clipboard.writeText(window.location.href)
                      }}
                    >
                      <Share2 className="w-4 h-4" />
                      Copy link
                    </Button>
                    <Button
                      variant="secondary"
                      size="md"
                      className="w-full justify-center gap-2"
                    >
                      <Twitter className="w-4 h-4" />
                      Twitter / X
                    </Button>
                    <Button
                      variant="secondary"
                      size="md"
                      className="w-full justify-center gap-2"
                    >
                      <Facebook className="w-4 h-4" />
                      Facebook
                    </Button>
                    <Button
                      variant="secondary"
                      size="md"
                      className="w-full justify-center gap-2"
                    >
                      <MessageCircle className="w-4 h-4" />
                      WhatsApp
                    </Button>
                    <Button
                      variant="secondary"
                      size="md"
                      className="w-full justify-center gap-2"
                    >
                      <Mail className="w-4 h-4" />
                      Email
                    </Button>
                  </CardContent>
                </Card>

                {/* Campaign Stats Card */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Campaign Details</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <p className="text-xs text-gray-600 mb-1">Created</p>
                      <p className="text-sm font-medium text-foreground">{formatDate(campaign.createdAt)}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-600 mb-1">Category</p>
                      <Badge variant="default" size="sm">
                        {campaign.category}
                      </Badge>
                    </div>
                    <div>
                      <p className="text-xs text-gray-600 mb-1">Targeted Brand</p>
                      <Badge variant="outline" size="sm">
                        {campaign.brand.name}
                      </Badge>
                    </div>
                    <div>
                      <p className="text-xs text-gray-600 mb-1">Status</p>
                      <Badge variant="lime" size="sm">
                        Active
                      </Badge>
                    </div>
                    <div>
                      <p className="text-xs text-gray-600 mb-1">Completeness</p>
                      <div className="flex items-center gap-2">
                        <Progress value={campaign.completenessScore} className="h-2" />
                        <span className="text-sm font-medium text-foreground">{campaign.completenessScore}%</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Creator Card */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Campaign Creator</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center gap-3">
                      <Avatar
                        src={campaign.creator.avatar}
                        alt={campaign.creator.displayName}
                        initials={creatorInitials}
                        size="md"
                      />
                      <div>
                        <p className="font-medium text-foreground">{campaign.creator.displayName}</p>
                        <p className="text-xs text-gray-600">Creator</p>
                      </div>
                    </div>
                    <p className="text-sm text-gray-700">{campaign.creator.bio}</p>
                    <Button
                      variant="secondary"
                      size="md"
                      className="w-full"
                    >
                      View profile
                    </Button>
                  </CardContent>
                </Card>

                {/* Similar Campaigns */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Similar Campaigns</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {[1, 2, 3].map((i) => (
                      <Link key={i} href="/campaigns" className="block">
                        <div className="bg-gray-50 hover:bg-violet-50 rounded-lg p-3 transition-colors cursor-pointer">
                          <p className="font-medium text-foreground text-sm line-clamp-2">
                            Similar Campaign {i}
                          </p>
                          <p className="text-xs text-gray-600 mt-1">1,200+ lobbies</p>
                        </div>
                      </Link>
                    ))}
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />

      {/* Lobby Flow Modal */}
      <LobbyFlow
        isOpen={isLobbyFlowOpen}
        onClose={() => setIsLobbyFlowOpen(false)}
        campaignTitle={campaign.title}
      />
    </div>
  )
}
