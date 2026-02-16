'use client'

import { useState } from 'react'
import Link from 'next/link'
import { DashboardLayout, PageHeader } from '@/components/shared'
import { Card, CardContent, CardHeader, CardTitle, Badge, Button, Progress } from '@/components/ui'
import { Copy, Share2, Link as LinkIcon } from 'lucide-react'

interface CampaignHeroStatus {
  id: string
  title: string
  heroEarnings: number
}

const DEMO_HERO_CAMPAIGNS: CampaignHeroStatus[] = [
  { id: 'nike-extended', title: 'Nike Extended Sizes', heroEarnings: 4.50 },
  { id: 'sustainable-coffee', title: 'Sustainable Coffee Pods', heroEarnings: 5.20 },
  { id: 'standing-desk', title: 'Ergonomic Standing Desk', heroEarnings: 2.70 },
]

export default function ScorePage() {
  const [copied, setCopied] = useState(false)

  const referralLink = 'https://productlobby.com/ref/alex_johnson_2024'
  const score = 342
  const topPercentage = 'Top 15%'

  const scoreBreakdown = [
    { label: 'Content Quality', points: 120, color: 'green' as const },
    { label: 'Referrals', points: 85, color: 'violet' as const, note: '12 people joined via your links' },
    { label: 'Comments', points: 67, color: 'lime' as const, note: '23 comments, 8 with engagement' },
    { label: 'Advocacy', points: 70, color: 'violet' as const, note: 'Social shares, brand outreach' },
  ]

  const totalEarnings = DEMO_HERO_CAMPAIGNS.reduce((sum, c) => sum + c.heroEarnings, 0)

  const handleCopyLink = () => {
    navigator.clipboard.writeText(referralLink)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <DashboardLayout role="supporter">
      <div className="space-y-8">
        <PageHeader title="Your Contribution Score" />

        {/* Main Score Display */}
        <Card className="bg-gradient-to-br from-violet-50 to-white border border-violet-100">
          <CardContent className="py-12">
            <div className="text-center">
              <div className="text-6xl font-bold font-display text-violet-600 mb-3">{score}</div>
              <Badge variant="default" size="md">
                {topPercentage} contributor
              </Badge>
              <p className="text-gray-600 mt-4">You're a top contributor on {DEMO_HERO_CAMPAIGNS.length} campaigns</p>
            </div>
          </CardContent>
        </Card>

        {/* Score Breakdown */}
        <div>
          <h2 className="text-2xl font-bold font-display text-foreground mb-4">Score Breakdown</h2>
          <div className="grid gap-4">
            {scoreBreakdown.map((item, idx) => (
              <Card key={idx}>
                <CardContent className="py-4 px-6">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <p className="font-semibold text-foreground">{item.label}</p>
                      {item.note && <p className="text-sm text-gray-600 mt-1">{item.note}</p>}
                    </div>
                    <span className="text-lg font-bold text-gray-700">{item.points} pts</span>
                  </div>
                  <Progress
                    value={item.points}
                    max={120}
                    variant={item.color}
                    animated={false}
                  />
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Hero Status */}
          <Card>
            <CardHeader>
              <CardTitle>Hero Status Campaigns</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {DEMO_HERO_CAMPAIGNS.map(campaign => (
                <div key={campaign.id} className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                  <Link
                    href={`/campaigns/${campaign.id}`}
                    className="text-sm font-medium text-foreground hover:text-green-700 transition-colors"
                  >
                    {campaign.title}
                  </Link>
                  <Badge variant="green" size="sm">
                    £{campaign.heroEarnings.toFixed(2)}
                  </Badge>
                </div>
              ))}
              <div className="pt-3 border-t border-gray-200 mt-3">
                <p className="text-sm text-gray-600">Total earned from Hero Pool</p>
                <p className="text-2xl font-bold font-display text-green-600">£{totalEarnings.toFixed(2)}</p>
              </div>
            </CardContent>
          </Card>

          {/* Referral Link */}
          <Card>
            <CardHeader>
              <CardTitle>Your Referral Link</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                <p className="text-xs text-gray-600 mb-2">Share your unique referral link</p>
                <div className="flex items-center gap-2">
                  <code className="text-xs font-mono text-gray-700 flex-1 truncate">
                    {referralLink}
                  </code>
                  <button
                    onClick={handleCopyLink}
                    className="p-2 hover:bg-gray-200 rounded transition-colors"
                    title="Copy link"
                  >
                    <Copy className="w-4 h-4 text-gray-600" />
                  </button>
                </div>
                {copied && <p className="text-xs text-green-600 mt-2">Copied!</p>}
              </div>

              <div className="bg-lime-50 p-4 rounded-lg border border-lime-200">
                <p className="text-sm font-semibold text-lime-900 mb-2">Referral Stats</p>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <p className="text-2xl font-bold text-lime-600">89</p>
                    <p className="text-xs text-gray-600">Link clicks</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-lime-600">12</p>
                    <p className="text-xs text-gray-600">Sign-ups</p>
                  </div>
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <Button
                  variant="accent"
                  size="sm"
                  className="flex-1 gap-2"
                  onClick={() => {
                    const text = `Join ProductLobby and help shape the products you love! ${referralLink}`
                    navigator.share?.({ text }) || navigator.clipboard.writeText(text)
                  }}
                >
                  <Share2 className="w-4 h-4" />
                  Share
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  )
}
