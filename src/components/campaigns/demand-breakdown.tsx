'use client'

import React from 'react'
import { Users, TrendingUp, MessageSquare, Heart } from 'lucide-react'

interface DemandBreakdownProps {
  breakdown: {
    lobbies: number
    growth: number
    comments: number
    contributors: number
  }
  componentScores?: {
    lobbies: number
    growth: number
    comments: number
    contributors: number
  }
}

export const DemandBreakdown: React.FC<DemandBreakdownProps> = ({
  breakdown,
  componentScores = { lobbies: 0, growth: 0, comments: 0, contributors: 0 },
}) => {
  const factors = [
    {
      id: 'lobbies',
      label: 'Total Lobbies',
      icon: Heart,
      value: breakdown.lobbies,
      weight: 0.4,
      score: componentScores.lobbies,
      color: 'bg-violet-500',
    },
    {
      id: 'growth',
      label: 'Growth Rate',
      icon: TrendingUp,
      value: `${breakdown.growth.toFixed(1)}%`,
      weight: 0.3,
      score: componentScores.growth,
      color: 'bg-blue-500',
    },
    {
      id: 'comments',
      label: 'Comments',
      icon: MessageSquare,
      value: breakdown.comments,
      weight: 0.15,
      score: componentScores.comments,
      color: 'bg-emerald-500',
    },
    {
      id: 'contributors',
      label: 'Contributors',
      icon: Users,
      value: breakdown.contributors,
      weight: 0.15,
      score: componentScores.contributors,
      color: 'bg-orange-500',
    },
  ]

  return (
    <div className="space-y-4">
      {factors.map(factor => {
        const Icon = factor.icon
        const weightPercent = Math.round(factor.weight * 100)

        return (
          <div key={factor.id} className="space-y-2">
            {/* Header with icon and label */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Icon size={18} className="text-gray-600" />
                <span className="text-sm font-medium text-gray-700">
                  {factor.label}
                </span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-sm font-semibold text-gray-900">
                  {factor.value}
                </span>
                <span className="text-xs text-gray-500 px-2 py-1 bg-gray-100 rounded">
                  {weightPercent}%
                </span>
              </div>
            </div>

            {/* Progress bar */}
            <div className="relative h-2 bg-gray-200 rounded-full overflow-hidden">
              <div
                className={`h-full ${factor.color} transition-all duration-500`}
                style={{ width: `${factor.score}%` }}
              />
            </div>

            {/* Score display */}
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-500">
                Component Score: <span className="font-semibold text-gray-700">{factor.score}/100</span>
              </span>
              <span className="text-xs text-gray-500">
                Contribution: <span className="font-semibold text-gray-700">{Math.round(factor.score * factor.weight)}/100</span>
              </span>
            </div>
          </div>
        )
      })}

      {/* Summary note */}
      <div className="mt-6 p-3 bg-violet-50 border border-violet-200 rounded-lg">
        <p className="text-xs text-gray-600">
          <span className="font-semibold text-violet-700">Demand Score</span> is calculated from
          weighted factors: Lobbies (40%), Growth (30%), Comments (15%), and Contributors (15%).
        </p>
      </div>
    </div>
  )
}
