'use client'

import React, { useEffect, useState } from 'react'
import { AlertCircle, Loader2 } from 'lucide-react'
import { AnimatedCounter } from './animated-counter'

interface PlatformStats {
  totalCampaigns: number
  totalLobbies: number
  totalUsers: number
  totalComments: number
  totalShares: number
}

export function PlatformStats() {
  const [stats, setStats] = useState<PlatformStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true)
        const response = await fetch('/api/platform/stats')

        if (!response.ok) {
          throw new Error('Failed to fetch platform stats')
        }

        const data = await response.json()
        setStats(data.data)
        setError(null)
      } catch (err) {
        console.error('[PlatformStats fetch error]', err)
        setError(err instanceof Error ? err.message : 'Failed to load stats')
        // Fallback stats for demo
        setStats({
          totalCampaigns: 0,
          totalLobbies: 0,
          totalUsers: 0,
          totalComments: 0,
          totalShares: 0,
        })
      } finally {
        setLoading(false)
      }
    }

    fetchStats()
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="w-8 h-8 text-violet-600 animate-spin" />
      </div>
    )
  }

  if (error && !stats) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-gap-3">
        <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
        <div>
          <p className="text-red-800 font-medium">Failed to load statistics</p>
          <p className="text-red-700 text-sm">{error}</p>
        </div>
      </div>
    )
  }

  if (!stats) {
    return null
  }

  const statItems = [
    {
      label: 'Active Campaigns',
      value: stats.totalCampaigns,
      format: 'compact' as const,
      description: 'Community-driven campaigns',
    },
    {
      label: 'Total Lobbies',
      value: stats.totalLobbies,
      format: 'compact' as const,
      description: 'Engaged supporters',
    },
    {
      label: 'Community Members',
      value: stats.totalUsers,
      format: 'compact' as const,
      description: 'Active users',
    },
    {
      label: 'Conversations',
      value: stats.totalComments,
      format: 'compact' as const,
      description: 'Comments & discussions',
    },
  ]

  return (
    <div className="bg-gradient-to-b from-violet-50 to-transparent py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
            Platform Impact
          </h2>
          <p className="text-gray-600 text-lg">
            Real numbers from our growing community
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {statItems.map((stat) => (
            <div
              key={stat.label}
              className="bg-white rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow"
            >
              <AnimatedCounter
                target={stat.value}
                duration={2000}
                format={stat.format}
                label={stat.label}
              />
              <p className="text-sm text-gray-500 text-center mt-3">
                {stat.description}
              </p>
            </div>
          ))}
        </div>

        {/* Additional Impact Metric */}
        <div className="mt-12 bg-gradient-to-r from-violet-600 to-violet-700 rounded-lg p-8 text-center text-white">
          <p className="text-sm uppercase tracking-widest font-semibold opacity-90 mb-2">
            Combined Impact
          </p>
          <h3 className="text-4xl md:text-5xl font-bold mb-2">
            {((stats.totalCampaigns + stats.totalLobbies + stats.totalUsers) / 1000).toFixed(1)}K+
          </h3>
          <p className="text-violet-100">
            Total platform activities this quarter
          </p>
        </div>
      </div>
    </div>
  )
}
