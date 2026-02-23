'use client'

import { Rocket, Gift, MessageCircle, Users, UserCheck, Zap } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { ImpactBadge } from './impact-badge'

export interface UserStatsData {
  totalCampaignsCreated: number
  totalLobbiesGiven: number
  totalComments: number
  followers: number
  following: number
  impactScore: number
}

interface ProfileStatsGridProps {
  stats: UserStatsData
}

export function ProfileStatsGrid({ stats }: ProfileStatsGridProps) {
  const statCards = [
    {
      label: 'Campaigns Created',
      value: stats.totalCampaignsCreated,
      icon: Rocket,
      color: 'text-violet-600',
    },
    {
      label: 'Lobbies Given',
      value: stats.totalLobbiesGiven,
      icon: Gift,
      color: 'text-lime-600',
    },
    {
      label: 'Comments',
      value: stats.totalComments,
      icon: MessageCircle,
      color: 'text-violet-600',
    },
    {
      label: 'Followers',
      value: stats.followers,
      icon: Users,
      color: 'text-lime-600',
    },
    {
      label: 'Following',
      value: stats.following,
      icon: UserCheck,
      color: 'text-violet-600',
    },
  ]

  return (
    <div className="space-y-6">
      {/* Main Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {statCards.map((stat) => {
          const Icon = stat.icon
          return (
            <Card key={stat.label} variant="interactive">
              <CardContent className="flex flex-col items-center justify-center p-6 text-center">
                <Icon className={`${stat.color} mb-3 w-8 h-8`} />
                <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
                <p className="text-sm text-gray-600 mt-2">{stat.label}</p>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Impact Score Badge */}
      <div className="flex justify-center">
        <Card variant="interactive" className="w-full max-w-sm">
          <CardContent className="flex flex-col items-center justify-center p-8 text-center">
            <Zap className="text-violet-600 mb-4 w-6 h-6" />
            <p className="text-sm font-medium text-gray-600 mb-4">Supporter Impact Score</p>
            <ImpactBadge score={stats.impactScore} size="lg" />
            <p className="text-xs text-gray-600 mt-4">
              Based on campaigns, lobbies, comments, and followers
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
