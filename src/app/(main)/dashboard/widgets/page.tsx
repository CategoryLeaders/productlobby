'use client'

import { DashboardLayout } from '@/components/shared'
import { Card } from '@/components/ui/card'
import {
  TrendingUp,
  MessageSquare,
  Zap,
  Bookmark,
  BarChart3,
  Bell,
  Clock,
  Target,
} from 'lucide-react'

const DashboardWidgetsPage = () => {
  // Mock data for widgets
  const recentActivity = [
    { id: 1, type: 'lobby', message: 'You joined "Better battery life" campaign', time: '2 hours ago' },
    { id: 2, type: 'comment', message: 'Your comment received 12 likes', time: '4 hours ago' },
    { id: 3, type: 'update', message: 'Campaign "Sustainable packaging" posted an update', time: '6 hours ago' },
  ]

  const myCampaigns = [
    { id: 1, name: 'Better Smartphone Camera', supporters: 2341, trend: 12 },
    { id: 2, name: 'Improved Battery Life', supporters: 1856, trend: 8 },
    { id: 3, name: 'Sustainable Packaging', supporters: 945, trend: -2 },
  ]

  const trendingCampaigns = [
    { id: 1, name: 'Carbon Neutral Shipping', category: 'Environment', heat: 892 },
    { id: 2, name: 'Better Voice Assistant', category: 'AI & Tech', heat: 756 },
    { id: 3, name: 'Disability Accessibility', category: 'Accessibility', heat: 634 },
  ]

  const savedCampaigns = [
    { id: 1, name: 'Extended Warranty Options', supporters: 3421 },
    { id: 2, name: 'Open Source Initiative', supporters: 2156 },
    { id: 3, name: 'Better Payment Options', supporters: 1823 },
  ]

  const quickStats = {
    totalCampaigns: 12,
    activeLobbies: 23,
    supportersReached: 15420,
    impactScore: 87,
  }

  const notifications = [
    { id: 1, title: 'Campaign milestone reached', description: '5000 supporters on "Better Camera"', unread: true },
    { id: 2, title: 'New supporter joined', description: '342 new supporters this week', unread: true },
    { id: 3, title: 'Company response', description: 'Samsung responded to your campaign', unread: false },
  ]

  return (
    <DashboardLayout role="supporter">
      <div className="space-y-8">
        {/* Page Header */}
        <div>
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground mt-1">Welcome back! Here's what's happening with your campaigns.</p>
        </div>

        {/* Widget Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Recent Activity Widget */}
          <Card className="p-6 lg:col-span-1">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-lg">Recent Activity</h3>
              <Clock className="w-4 h-4 text-muted-foreground" />
            </div>
            <div className="space-y-3">
              {recentActivity.map((item) => (
                <div key={item.id} className="pb-3 border-b last:border-b-0 last:pb-0">
                  <p className="text-sm font-medium text-foreground">{item.message}</p>
                  <p className="text-xs text-muted-foreground mt-1">{item.time}</p>
                </div>
              ))}
            </div>
            <a
              href="/dashboard/activity"
              className="text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400 mt-4 inline-block font-medium"
            >
              View all activity →
            </a>
          </Card>

          {/* My Campaigns Summary Widget */}
          <Card className="p-6 lg:col-span-1">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-lg">My Campaigns</h3>
              <Target className="w-4 h-4 text-muted-foreground" />
            </div>
            <div className="space-y-3">
              {myCampaigns.map((campaign) => (
                <div key={campaign.id} className="pb-3 border-b last:border-b-0 last:pb-0">
                  <div className="flex items-start justify-between">
                    <p className="text-sm font-medium text-foreground">{campaign.name}</p>
                    <span
                      className={`text-xs font-semibold px-2 py-1 rounded ${
                        campaign.trend >= 0
                          ? 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-100'
                          : 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-100'
                      }`}
                    >
                      {campaign.trend >= 0 ? '+' : ''}{campaign.trend}%
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">{campaign.supporters.toLocaleString()} supporters</p>
                </div>
              ))}
            </div>
            <a
              href="/dashboard/campaigns"
              className="text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400 mt-4 inline-block font-medium"
            >
              Manage campaigns →
            </a>
          </Card>

          {/* Trending Now Widget */}
          <Card className="p-6 lg:col-span-1">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-lg">Trending Now</h3>
              <TrendingUp className="w-4 h-4 text-muted-foreground" />
            </div>
            <div className="space-y-3">
              {trendingCampaigns.map((campaign) => (
                <div key={campaign.id} className="pb-3 border-b last:border-b-0 last:pb-0">
                  <p className="text-sm font-medium text-foreground">{campaign.name}</p>
                  <div className="flex items-center justify-between mt-1">
                    <span className="text-xs text-muted-foreground">{campaign.category}</span>
                    <span className="text-xs font-semibold text-orange-600 dark:text-orange-400">🔥 {campaign.heat}</span>
                  </div>
                </div>
              ))}
            </div>
            <a
              href="/explore"
              className="text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400 mt-4 inline-block font-medium"
            >
              Explore more →
            </a>
          </Card>

          {/* Saved Campaigns Widget */}
          <Card className="p-6 lg:col-span-1">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-lg">Saved Campaigns</h3>
              <Bookmark className="w-4 h-4 text-muted-foreground" />
            </div>
            <div className="space-y-3">
              {savedCampaigns.map((campaign) => (
                <div key={campaign.id} className="pb-3 border-b last:border-b-0 last:pb-0">
                  <p className="text-sm font-medium text-foreground">{campaign.name}</p>
                  <p className="text-xs text-muted-foreground mt-1">{campaign.supporters.toLocaleString()} supporters</p>
                </div>
              ))}
            </div>
            <a
              href="/dashboard/saved"
              className="text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400 mt-4 inline-block font-medium"
            >
              View all →
            </a>
          </Card>

          {/* Quick Stats Widget */}
          <Card className="p-6 lg:col-span-1">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-lg">Quick Stats</h3>
              <BarChart3 className="w-4 h-4 text-muted-foreground" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-blue-50 dark:bg-blue-950 p-3 rounded">
                <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">{quickStats.totalCampaigns}</p>
                <p className="text-xs text-muted-foreground mt-1">Total Campaigns</p>
              </div>
              <div className="bg-purple-50 dark:bg-purple-950 p-3 rounded">
                <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">{quickStats.activeLobbies}</p>
                <p className="text-xs text-muted-foreground mt-1">Active Lobbies</p>
              </div>
              <div className="bg-green-50 dark:bg-green-950 p-3 rounded">
                <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                  {(quickStats.supportersReached / 1000).toFixed(1)}K
                </p>
                <p className="text-xs text-muted-foreground mt-1">Supporters Reached</p>
              </div>
              <div className="bg-orange-50 dark:bg-orange-950 p-3 rounded">
                <p className="text-2xl font-bold text-orange-600 dark:text-orange-400">{quickStats.impactScore}</p>
                <p className="text-xs text-muted-foreground mt-1">Impact Score</p>
              </div>
            </div>
          </Card>

          {/* Notifications Summary Widget */}
          <Card className="p-6 lg:col-span-1">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-lg">Notifications</h3>
              <Bell className="w-4 h-4 text-muted-foreground" />
            </div>
            <div className="space-y-3">
              {notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`pb-3 border-b last:border-b-0 last:pb-0 ${
                    notification.unread ? 'bg-blue-50 dark:bg-blue-950 -mx-6 px-6 py-3' : ''
                  }`}
                >
                  <p className="text-sm font-medium text-foreground">{notification.title}</p>
                  <p className="text-xs text-muted-foreground mt-1">{notification.description}</p>
                </div>
              ))}
            </div>
            <a
              href="/dashboard/notifications"
              className="text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400 mt-4 inline-block font-medium"
            >
              View all notifications →
            </a>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  )
}

export default DashboardWidgetsPage
