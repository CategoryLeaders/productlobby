'use client'

import React, { useState, useEffect } from 'react'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Area,
  AreaChart,
} from 'recharts'
import { TrendingUp, Flame, DollarSign, Users, BarChart3 } from 'lucide-react'
import { Spinner } from '@/components/ui/spinner'
import { cn } from '@/lib/utils'

interface DemandSignalData {
  totalLobbies: number
  velocity: { date: string; count: number; cumulative: number }[]
  trending: {
    isTrending: boolean
    weekOverWeekGrowth: number
    lobbiesThisWeek: number
    lobbiesLastWeek: number
  }
  priceSensitivity: {
    takeMyMoney: number
    probablyBuy: number
    neatIdea: number
    buyerSignal: number
  }
  badges: { label: string; type: 'trending' | 'signal' | 'velocity' }[]
}

interface DemandSignalDisplayProps {
  campaignId: string
}

export function DemandSignalDisplay({ campaignId }: DemandSignalDisplayProps) {
  const [data, setData] = useState<DemandSignalData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch(`/api/campaigns/${campaignId}/demand-signal`)
        if (!res.ok) throw new Error('Failed to fetch demand signal')
        const json = await res.json()
        setData(json)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load')
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [campaignId])

  if (loading) {
    return (
      <div className="flex justify-center py-8">
        <Spinner />
      </div>
    )
  }

  if (error || !data) {
    return null // Silently fail — not critical
  }

  if (data.totalLobbies < 2) {
    return (
      <div className="text-center py-6 text-gray-500 text-sm">
        Demand signals will appear as more people lobby for this campaign.
      </div>
    )
  }

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr)
    return date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })
  }

  const badgeColors = {
    trending: 'bg-orange-100 text-orange-700 border-orange-200',
    signal: 'bg-lime-100 text-lime-700 border-lime-200',
    velocity: 'bg-violet-100 text-violet-700 border-violet-200',
  }

  const badgeIcons = {
    trending: <Flame size={14} />,
    signal: <DollarSign size={14} />,
    velocity: <TrendingUp size={14} />,
  }

  return (
    <div className="space-y-6">
      {/* Section Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <BarChart3 size={20} className="text-violet-600" />
          <h3 className="text-lg font-semibold text-gray-900">Demand Signal</h3>
        </div>

        {/* Trending Badges */}
        {data.badges.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {data.badges.map((badge, i) => (
              <span
                key={i}
                className={cn(
                  'inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium border',
                  badgeColors[badge.type]
                )}
              >
                {badgeIcons[badge.type]}
                {badge.label}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Velocity Chart */}
      <div className="bg-white border border-gray-200 rounded-lg p-4">
        <div className="flex items-center justify-between mb-4">
          <h4 className="text-sm font-medium text-gray-700">Lobby Growth (30 days)</h4>
          <div className="flex items-center gap-1 text-sm">
            {data.trending.weekOverWeekGrowth > 0 ? (
              <span className="text-green-600 font-medium flex items-center gap-1">
                <TrendingUp size={14} />
                +{data.trending.weekOverWeekGrowth}% this week
              </span>
            ) : data.trending.weekOverWeekGrowth < 0 ? (
              <span className="text-red-500 font-medium">
                {data.trending.weekOverWeekGrowth}% this week
              </span>
            ) : (
              <span className="text-gray-500">Steady</span>
            )}
          </div>
        </div>

        <div className="h-48">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data.velocity}>
              <defs>
                <linearGradient id="colorCumulative" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#7C3AED" stopOpacity={0.15} />
                  <stop offset="95%" stopColor="#7C3AED" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis
                dataKey="date"
                tickFormatter={formatDate}
                tick={{ fontSize: 11, fill: '#9CA3AF' }}
                interval="preserveStartEnd"
              />
              <YAxis
                tick={{ fontSize: 11, fill: '#9CA3AF' }}
                allowDecimals={false}
              />
              <Tooltip
                labelFormatter={formatDate}
                formatter={(value: number, name: string) => [
                  value,
                  name === 'cumulative' ? 'Total Lobbies' : 'New Today',
                ]}
                contentStyle={{
                  borderRadius: '8px',
                  border: '1px solid #E5E7EB',
                  fontSize: '12px',
                }}
              />
              <Area
                type="monotone"
                dataKey="cumulative"
                stroke="#7C3AED"
                strokeWidth={2}
                fill="url(#colorCumulative)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Price Sensitivity */}
      <div className="bg-white border border-gray-200 rounded-lg p-4">
        <h4 className="text-sm font-medium text-gray-700 mb-3">Buyer Intent Signal</h4>

        <div className="flex items-center gap-3 mb-4">
          <div className="flex-1 h-3 bg-gray-100 rounded-full overflow-hidden flex">
            {data.priceSensitivity.takeMyMoney > 0 && (
              <div
                className="bg-violet-600 h-full transition-all"
                style={{
                  width: `${(data.priceSensitivity.takeMyMoney / data.totalLobbies) * 100}%`,
                }}
              />
            )}
            {data.priceSensitivity.probablyBuy > 0 && (
              <div
                className="bg-yellow-400 h-full transition-all"
                style={{
                  width: `${(data.priceSensitivity.probablyBuy / data.totalLobbies) * 100}%`,
                }}
              />
            )}
            {data.priceSensitivity.neatIdea > 0 && (
              <div
                className="bg-green-400 h-full transition-all"
                style={{
                  width: `${(data.priceSensitivity.neatIdea / data.totalLobbies) * 100}%`,
                }}
              />
            )}
          </div>
          <span className="text-lg font-bold text-violet-600">
            {data.priceSensitivity.buyerSignal}%
          </span>
        </div>

        <div className="grid grid-cols-3 gap-2 text-center text-xs">
          <div className="flex flex-col items-center gap-1">
            <div className="w-3 h-3 rounded-full bg-violet-600" />
            <span className="text-gray-600">Take My Money!</span>
            <span className="font-semibold text-gray-900">{data.priceSensitivity.takeMyMoney}</span>
          </div>
          <div className="flex flex-col items-center gap-1">
            <div className="w-3 h-3 rounded-full bg-yellow-400" />
            <span className="text-gray-600">Probably Buy</span>
            <span className="font-semibold text-gray-900">{data.priceSensitivity.probablyBuy}</span>
          </div>
          <div className="flex flex-col items-center gap-1">
            <div className="w-3 h-3 rounded-full bg-green-400" />
            <span className="text-gray-600">Neat Idea</span>
            <span className="font-semibold text-gray-900">{data.priceSensitivity.neatIdea}</span>
          </div>
        </div>
      </div>
    </div>
  )
}
