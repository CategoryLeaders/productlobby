'use client'

import { useState } from 'react'
import Link from 'next/link'
import { DashboardLayout, PageHeader } from '@/components/shared'
import { Card, CardContent, Badge, Button, Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui'
import { CheckCircle, ArrowRight } from 'lucide-react'
import { cn } from '@/lib/utils'

interface Lobby {
  id: string
  campaignId: string
  campaignTitle: string
  brandName: string
  brandLogo?: string
  status: 'live' | 'shipped' | 'brand_reviewing'
  myIntensity: 'neat_idea' | 'probably_buy' | 'take_my_money'
  createdAt: string
}

const intensityConfig = {
  'neat_idea': { label: 'Neat idea', color: 'text-violet-600', bg: 'bg-violet-50' },
  'probably_buy': { label: 'Probably buy', color: 'text-yellow-600', bg: 'bg-yellow-50' },
  'take_my_money': { label: 'Take my money', color: 'text-green-600', bg: 'bg-green-50' },
}

const statusConfig = {
  'live': { label: 'Live', color: 'lime' },
  'shipped': { label: 'Shipped! ✓', color: 'green' },
  'brand_reviewing': { label: 'Brand reviewing', color: 'default' },
}

const DEMO_LOBBIES: Lobby[] = [
  {
    id: '1',
    campaignId: 'nike-extended',
    campaignTitle: 'Nike Extended Sizes',
    brandName: 'Nike',
    status: 'live',
    myIntensity: 'take_my_money',
    createdAt: '2024-12-15',
  },
  {
    id: '2',
    campaignId: 'dyson-fan',
    campaignTitle: 'Dyson Silent Fan',
    brandName: 'Dyson',
    status: 'live',
    myIntensity: 'probably_buy',
    createdAt: '2024-12-10',
  },
  {
    id: '3',
    campaignId: 'nespresso-coffee',
    campaignTitle: 'Sustainable Coffee Pods',
    brandName: 'Nespresso',
    status: 'shipped',
    myIntensity: 'take_my_money',
    createdAt: '2024-11-20',
  },
  {
    id: '4',
    campaignId: 'ikea-desk',
    campaignTitle: 'Ergonomic Standing Desk',
    brandName: 'IKEA',
    status: 'live',
    myIntensity: 'neat_idea',
    createdAt: '2024-12-08',
  },
  {
    id: '5',
    campaignId: 'apple-airpods',
    campaignTitle: 'Waterproof AirPods Case',
    brandName: 'Apple',
    status: 'brand_reviewing',
    myIntensity: 'probably_buy',
    createdAt: '2024-12-05',
  },
  {
    id: '6',
    campaignId: 'ms-meals',
    campaignTitle: 'Plant-Based Ready Meals',
    brandName: 'M&S',
    status: 'live',
    myIntensity: 'take_my_money',
    createdAt: '2024-12-01',
  },
  {
    id: '7',
    campaignId: 'garmin-tracker',
    campaignTitle: 'Dog Walking GPS Tracker',
    brandName: 'Garmin',
    status: 'live',
    myIntensity: 'probably_buy',
    createdAt: '2024-11-28',
  },
  {
    id: '8',
    campaignId: 'gift-wrap',
    campaignTitle: 'Reusable Gift Wrap',
    brandName: 'Open to any brand',
    status: 'live',
    myIntensity: 'neat_idea',
    createdAt: '2024-11-25',
  },
]

function StatCard({ label, value }: { label: string; value: string | number }) {
  return (
    <Card className="bg-white">
      <CardContent className="pt-6">
        <p className="text-sm text-gray-600 mb-2">{label}</p>
        <p className="text-3xl font-bold font-display text-foreground">{value}</p>
      </CardContent>
    </Card>
  )
}

function LobbyListItem({ lobby }: { lobby: Lobby }) {
  const intensity = intensityConfig[lobby.myIntensity]
  const status = statusConfig[lobby.status]

  return (
    <Card className="hover:shadow-card-hover transition-shadow">
      <CardContent className="py-4 px-6">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <h3 className="font-semibold text-foreground">{lobby.campaignTitle}</h3>
              <Badge variant="gray" size="sm">
                {lobby.brandName}
              </Badge>
            </div>
            <div className="flex items-center gap-2 mb-3">
              <div className={cn('px-3 py-1 rounded-md text-sm font-medium', intensity.bg, intensity.color)}>
                {intensity.label}
              </div>
              <Badge variant={status.color} size="sm">
                {status.label}
              </Badge>
            </div>
            <p className="text-xs text-gray-500">
              Lobbied on {new Date(lobby.createdAt).toLocaleDateString()}
            </p>
          </div>
          <Link href={`/campaigns/${lobby.campaignId}`}>
            <Button variant="ghost" size="sm" className="gap-1">
              View Campaign
              <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  )
}

export default function LobbiesPage() {
  const [activeTab, setActiveTab] = useState('all')

  const filteredLobbies = DEMO_LOBBIES.filter(lobby => {
    switch (activeTab) {
      case 'active':
        return lobby.status === 'live'
      case 'brand_responded':
        return lobby.status === 'brand_reviewing'
      case 'shipped':
        return lobby.status === 'shipped'
      default:
        return true
    }
  })

  const stats = {
    campaignsLobbied: DEMO_LOBBIES.length,
    activeCampaigns: DEMO_LOBBIES.filter(l => l.status === 'live').length,
    productsShipped: DEMO_LOBBIES.filter(l => l.status === 'shipped').length,
    contributionScore: 342,
  }

  return (
    <DashboardLayout role="supporter">
      <div className="space-y-8">
        <PageHeader
          title="My Lobbies"
          description="Campaigns you've supported and followed"
        />

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard label="Campaigns Lobbied" value={stats.campaignsLobbied} />
          <StatCard label="Active Campaigns" value={stats.activeCampaigns} />
          <StatCard label="Products Shipped" value={stats.productsShipped} />
          <StatCard label="Contribution Score" value={stats.contributionScore} />
        </div>

        {/* Filter Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="active">Active</TabsTrigger>
            <TabsTrigger value="brand_responded">Brand Responded</TabsTrigger>
            <TabsTrigger value="shipped">Shipped</TabsTrigger>
          </TabsList>

          <TabsContent value={activeTab} className="mt-6 space-y-3">
            {filteredLobbies.length > 0 ? (
              filteredLobbies.map(lobby => (
                <LobbyListItem key={lobby.id} lobby={lobby} />
              ))
            ) : (
              <Card>
                <CardContent className="py-12 text-center">
                  <p className="text-gray-600">No lobbies found in this category</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  )
}
