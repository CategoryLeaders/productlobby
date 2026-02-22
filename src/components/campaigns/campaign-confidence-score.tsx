'use client'

import React, { useState, useEffect, useRef } from 'react'
import { ChevronDown, ChevronUp, TrendingUp, Zap, Users, MessageSquare, FileText, Award, Building2 } from 'lucide-react'
import { cn } from '@/lib/utils'

interface Factor {
  name: string
  value: number
  maxValue: number
  weight: number
  contribution: number
}

interface ConfidenceData {
  score: number | null
  level: string
  message?: string
  factors: Factor[]
  totalLobbies: number
  takeMyMoneyCount?: number
}

interface CampaignConfidenceScoreProps {
  campaignId: string
}

const factorIcons: Record<string, React.ReactNode> = {
  'Total Lobbies': <Users className="w-4 h-4" />,
  'Lobby Intensity': <Zap className="w-4 h-4" />,
  'Activity Rate': <TrendingUp className="w-4 h-4" />,
  'Creator Updates': <FileText className="w-4 h-4" />,
  'Community Engagement': <MessageSquare className="w-4 h-4" />,
  'Campaign Quality': <Award className="w-4 h-4" />,
  'Brand Response': <Building2 className="w-4 h-4" />,
}

function getScoreColor(score: number): string {
  if (score >= 61) return '#7C3AED' // violet
  if (score >= 31) return '#F59E0B' // amber
  return '#EF4444' // red
}

function getScoreBgColor(score: number): string {
  if (score >= 61) return 'bg-violet-50 border-violet-200'
  if (score >= 31) return 'bg-amber-50 border-amber-200'
  return 'bg-red-50 border-red-200'
}

function getScoreTextColor(score: number): string {
  if (score >= 61) return 'text-violet-700'
  if (score >= 31) return 'text-amber-700'
  return 'text-red-700'
}

function CircularProgress({ score, size = 120 }: { score: number; size?: number }) {
  const [animatedScore, setAnimatedScore] = useState(0)
  const strokeWidth = 8
  const radius = (size - strokeWidth) / 2
  const circumference = 2 * Math.PI * radius
  const offset = circumference - (animatedScore / 100) * circumference
  const color = getScoreColor(animatedScore)

  useEffect(() => {
    let frame: number
    const duration = 1200
    const start = performance.now()

    const animate = (now: number) => {
      const elapsed = now - start
      const progress = Math.min(elapsed / duration, 1)
      // Ease out cubic
      const eased = 1 - Math.pow(1 - progress, 3)
      setAnimatedScore(Math.round(score * eased))
      if (progress < 1) {
        frame = requestAnimationFrame(animate)
      }
    }

    frame = requestAnimationFrame(animate)
    return () => cancelAnimationFrame(frame)
  }, [score])

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        {/* Background circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="#E5E7EB"
          strokeWidth={strokeWidth}
        />
        {/* Progress circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          className="transition-all duration-100"
        />
      </svg>
      {/* Score text in center */}
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="font-display font-bold text-3xl" style={{ color }}>
          {animatedScore}
        </span>
        <span className="text-xs text-gray-500 -mt-1">/ 100</span>
      </div>
    </div>
  )
}

export function CampaignConfidenceScore({ campaignId }: CampaignConfidenceScoreProps) {
  const [data, setData] = useState<ConfidenceData | null>(null)
  const [loading, setLoading] = useState(true)
  const [showBreakdown, setShowBreakdown] = useState(false)

  useEffect(() => {
    fetchScore()
  }, [campaignId])

  const fetchScore = async () => {
    try {
      const response = await fetch(`/api/campaigns/${campaignId}/confidence-score`)
      if (!response.ok) return
      const result = await response.json()
      if (result.success) {
        setData(result.data)
      }
    } catch (error) {
      console.error('Error fetching confidence score:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="bg-white border border-gray-200 rounded-xl p-6 animate-pulse">
        <div className="flex items-center gap-6">
          <div className="w-[120px] h-[120px] bg-gray-200 rounded-full"></div>
          <div className="flex-1">
            <div className="h-5 bg-gray-200 rounded w-48 mb-3"></div>
            <div className="h-4 bg-gray-100 rounded w-32"></div>
          </div>
        </div>
      </div>
    )
  }

  if (!data) return null

  // Handle "too early" state
  if (data.score === null) {
    return (
      <div className="bg-gray-50 border border-gray-200 rounded-xl p-6">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-gray-200 flex items-center justify-center">
            <TrendingUp className="w-8 h-8 text-gray-400" />
          </div>
          <div>
            <h3 className="font-semibold text-foreground">Brand Confidence Score</h3>
            <p className="text-sm text-gray-500 mt-1">{data.message || 'Score calculating...'}</p>
          </div>
        </div>
      </div>
    )
  }

  // Handle zero lobbies
  if (data.totalLobbies === 0) {
    return (
      <div className="bg-gray-50 border border-gray-200 rounded-xl p-6">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-gray-200 flex items-center justify-center">
            <TrendingUp className="w-8 h-8 text-gray-400" />
          </div>
          <div>
            <h3 className="font-semibold text-foreground">Brand Confidence Score</h3>
            <p className="text-sm text-gray-500 mt-1">Be the first to lobby for this!</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className={cn('border rounded-xl p-6', getScoreBgColor(data.score))}>
      {/* Main Score Display */}
      <div className="flex items-center gap-6">
        <CircularProgress score={data.score} />
        <div className="flex-1">
          <h3 className="font-semibold text-foreground text-lg">Brand Confidence Score</h3>
          <p className={cn('font-bold text-lg mt-1', getScoreTextColor(data.score))}>
            {data.level}
          </p>
          {data.takeMyMoneyCount !== undefined && data.takeMyMoneyCount > 0 && (
            <p className="text-sm text-gray-600 mt-2">
              {data.takeMyMoneyCount} supporter{data.takeMyMoneyCount !== 1 ? 's' : ''} would pay for this product
            </p>
          )}
        </div>
      </div>

      {/* Breakdown Toggle */}
      <button
        onClick={() => setShowBreakdown(!showBreakdown)}
        className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 mt-4 transition-colors"
      >
        {showBreakdown ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        What affects this score?
      </button>

      {/* Factor Breakdown */}
      {showBreakdown && (
        <div className="mt-4 space-y-3 pt-4 border-t border-gray-200/50">
          {data.factors.map((factor) => (
            <div key={factor.name} className="flex items-center gap-3">
              <div className="text-gray-500 flex-shrink-0">
                {factorIcons[factor.name] || <TrendingUp className="w-4 h-4" />}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm text-gray-700">{factor.name}</span>
                  <span className="text-xs text-gray-500">{Math.round(factor.weight * 100)}%</span>
                </div>
                <div className="h-2 bg-gray-200/80 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{
                      width: `${Math.min(100, (factor.contribution / factor.weight) )}%`,
                      backgroundColor: getScoreColor(factor.contribution / factor.weight),
                    }}
                  ></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
