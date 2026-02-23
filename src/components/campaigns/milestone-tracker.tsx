'use client'

import React, { useEffect, useState } from 'react'
import {
  CheckCircle2,
  Lock,
  Share2,
  Trophy,
  Users,
  ThumbsUp,
  Clock,
  ChevronDown,
  Sparkles,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'

interface Milestone {
  id: string
  type: 'supporters' | 'votes' | 'shares' | 'days_active'
  threshold: number
  achieved: boolean
  achievedAt?: string
  progress?: number
  progressPercent?: number
}

interface MilestoneData {
  campaignId: string
  totalSupporters: number
  totalVotes: number
  totalShares: number
  daysActive: number
  totalMilestonesAchieved: number
  milestones: Milestone[]
}

interface MilestoneTrackerProps {
  campaignId: string
  title?: string
  showSharing?: boolean
}

const getMilestoneIcon = (type: string) => {
  switch (type) {
    case 'supporters':
      return Users
    case 'votes':
      return ThumbsUp
    case 'shares':
      return Share2
    case 'days_active':
      return Clock
    default:
      return Trophy
  }
}

const getMilestoneLabel = (type: string) => {
  switch (type) {
    case 'supporters':
      return 'Supporters'
    case 'votes':
      return 'Votes'
    case 'shares':
      return 'Shares'
    case 'days_active':
      return 'Days Active'
    default:
      return 'Milestone'
  }
}

const getMilestoneColor = (type: string, achieved: boolean) => {
  if (!achieved) {
    return 'text-gray-400'
  }
  switch (type) {
    case 'supporters':
      return 'text-blue-600'
    case 'votes':
      return 'text-purple-600'
    case 'shares':
      return 'text-green-600'
    case 'days_active':
      return 'text-orange-600'
    default:
      return 'text-violet-600'
  }
}

const getMilestoneGradient = (type: string, achieved: boolean) => {
  if (!achieved) {
    return 'from-gray-50 to-gray-100'
  }
  switch (type) {
    case 'supporters':
      return 'from-blue-50 to-blue-100'
    case 'votes':
      return 'from-purple-50 to-purple-100'
    case 'shares':
      return 'from-green-50 to-green-100'
    case 'days_active':
      return 'from-orange-50 to-orange-100'
    default:
      return 'from-violet-50 to-violet-100'
  }
}

const Confetti: React.FC = () => {
  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden">
      {Array.from({ length: 50 }).map((_, i) => (
        <div
          key={i}
          className="absolute w-1 h-1 bg-violet-500 rounded-full"
          style={{
            left: `${Math.random() * 100}%`,
            top: `-10px`,
            animation: `confetti-fall ${2 + Math.random() * 1}s ease-in forwards`,
            animationDelay: `${i * 0.02}s`,
          }}
        />
      ))}
      <style>{`
        @keyframes confetti-fall {
          to {
            transform: translateY(100vh) rotate(720deg);
            opacity: 0;
          }
        }
      `}</style>
    </div>
  )
}

export const MilestoneTracker: React.FC<MilestoneTrackerProps> = ({
  campaignId,
  title = 'Campaign Milestones',
  showSharing = true,
}) => {
  const [data, setData] = useState<MilestoneData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showCelebration, setShowCelebration] = useState(false)
  const [expandedMilestone, setExpandedMilestone] = useState<string | null>(null)
  const [sharingMilestone, setSharingMilestone] = useState<string | null>(null)

  useEffect(() => {
    const fetchMilestones = async () => {
      try {
        setLoading(true)
        const response = await fetch(`/api/campaigns/${campaignId}/milestones`)

        if (!response.ok) {
          throw new Error('Failed to fetch milestones')
        }

        const result = await response.json()
        setData(result.data)
        setError(null)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch milestones')
        console.error('Error fetching milestones:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchMilestones()
    const interval = setInterval(fetchMilestones, 30000)

    return () => clearInterval(interval)
  }, [campaignId])

  const handleShareMilestone = async (milestone: Milestone) => {
    try {
      setSharingMilestone(milestone.id)

      const shareText = `Just hit a milestone! ${getMilestoneLabel(milestone.type)} reached ${milestone.threshold} on this campaign. Join the movement!`
      const shareUrl = `${typeof window !== 'undefined' ? window.location.origin : ''}/campaigns/${campaignId}`

      // Create contribution event for share
      const response = await fetch(`/api/campaigns/${campaignId}/milestones`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'share_milestone',
          milestoneId: milestone.id,
          milestoneType: milestone.type,
          milestoneThreshold: milestone.threshold,
          shareText,
          shareUrl,
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to record share')
      }

      // Show celebration
      setShowCelebration(true)
      setTimeout(() => setShowCelebration(false), 2000)

      // Trigger native share if available
      if (navigator.share) {
        await navigator.share({
          title: 'Campaign Milestone',
          text: shareText,
          url: shareUrl,
        })
      } else {
        // Fallback: copy to clipboard
        await navigator.clipboard.writeText(`${shareText}\n\n${shareUrl}`)
        alert('Milestone link copied to clipboard!')
      }
    } catch (err) {
      console.error('Error sharing milestone:', err)
      alert('Failed to share milestone')
    } finally {
      setSharingMilestone(null)
    }
  }

  if (loading) {
    return (
      <div className="w-full max-w-2xl mx-auto p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded-lg w-1/3" />
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-20 bg-gray-100 rounded-lg" />
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (error || !data) {
    return (
      <div className="w-full max-w-2xl mx-auto p-6 bg-red-50 rounded-lg border border-red-200">
        <p className="text-red-700 font-medium">Failed to load milestones</p>
        <p className="text-red-600 text-sm mt-1">{error}</p>
      </div>
    )
  }

  const currentMilestoneIndex = data.milestones.findIndex((m) => !m.achieved)
  const currentMilestone =
    currentMilestoneIndex !== -1 ? data.milestones[currentMilestoneIndex] : null

  return (
    <div className="w-full max-w-2xl mx-auto">
      {showCelebration && <Confetti />}

      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Trophy className="w-6 h-6 text-violet-600" />
            <h2 className="text-2xl font-bold text-gray-900">{title}</h2>
          </div>
          <div className="flex items-center gap-2 bg-violet-100 px-3 py-1 rounded-full">
            <Sparkles className="w-4 h-4 text-violet-600" />
            <span className="text-sm font-semibold text-violet-700">
              {data.totalMilestonesAchieved} Unlocked
            </span>
          </div>
        </div>
        <p className="text-gray-600 text-sm mt-2">
          Track your campaign's growth and celebrate achievements
        </p>
      </div>

      {/* Stats Bar */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
        <div className="bg-blue-50 rounded-lg p-4 border border-blue-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-blue-600 font-medium">Supporters</p>
              <p className="text-2xl font-bold text-blue-900 mt-1">
                {data.totalSupporters}
              </p>
            </div>
            <Users className="w-8 h-8 text-blue-300" />
          </div>
        </div>
        <div className="bg-purple-50 rounded-lg p-4 border border-purple-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-purple-600 font-medium">Votes</p>
              <p className="text-2xl font-bold text-purple-900 mt-1">
                {data.totalVotes}
              </p>
            </div>
            <ThumbsUp className="w-8 h-8 text-purple-300" />
          </div>
        </div>
        <div className="bg-green-50 rounded-lg p-4 border border-green-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-green-600 font-medium">Shares</p>
              <p className="text-2xl font-bold text-green-900 mt-1">
                {data.totalShares}
              </p>
            </div>
            <Share2 className="w-8 h-8 text-green-300" />
          </div>
        </div>
        <div className="bg-orange-50 rounded-lg p-4 border border-orange-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-orange-600 font-medium">Days Active</p>
              <p className="text-2xl font-bold text-orange-900 mt-1">
                {data.daysActive}
              </p>
            </div>
            <Clock className="w-8 h-8 text-orange-300" />
          </div>
        </div>
      </div>

      {/* Milestones Timeline */}
      <div className="space-y-4">
        {data.milestones.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <p>No milestones to track yet</p>
          </div>
        ) : (
          data.milestones.map((milestone, index) => {
            const Icon = getMilestoneIcon(milestone.type)
            const isExpanded = expandedMilestone === milestone.id
            const isCurrent = currentMilestone?.id === milestone.id
            const isAchieved = milestone.achieved

            return (
              <div key={milestone.id} className="relative">
                {/* Connecting line */}
                {index < data.milestones.length - 1 && (
                  <div
                    className={cn(
                      'absolute left-6 top-20 bottom-0 w-1 z-0',
                      isAchieved ? 'bg-violet-400' : 'bg-gray-200'
                    )}
                  />
                )}

                {/* Milestone card */}
                <div
                  className={cn(
                    'relative z-10 rounded-lg border-2 transition-all duration-300 cursor-pointer',
                    isAchieved
                      ? cn(
                          'border-violet-300 bg-gradient-to-r',
                          getMilestoneGradient(milestone.type, true),
                          'shadow-md hover:shadow-lg'
                        )
                      : 'border-gray-200 bg-gray-50 opacity-60'
                  )}
                  onClick={() =>
                    setExpandedMilestone(isExpanded ? null : milestone.id)
                  }
                >
                  <div className="flex items-start gap-4 p-4">
                    {/* Icon */}
                    <div
                      className={cn(
                        'flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center',
                        isAchieved
                          ? cn('bg-white', getMilestoneColor(milestone.type, true))
                          : 'bg-gray-200 text-gray-400'
                      )}
                    >
                      {isAchieved ? (
                        <CheckCircle2 className="w-7 h-7 text-violet-600" />
                      ) : isCurrent ? (
                        <Icon className="w-6 h-6" />
                      ) : (
                        <Lock className="w-6 h-6" />
                      )}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <h3 className={cn('font-semibold text-lg')}>
                            {getMilestoneLabel(milestone.type)}: {milestone.threshold}
                          </h3>
                          <p
                            className={cn(
                              'text-sm mt-1',
                              isAchieved ? 'text-gray-600' : 'text-gray-500'
                            )}
                          >
                            {isAchieved
                              ? `Unlocked on ${new Date(milestone.achievedAt!).toLocaleDateString()}`
                              : isCurrent
                                ? `${milestone.progressPercent || 0}% progress`
                                : 'Locked'}
                          </p>
                        </div>
                        <ChevronDown
                          className={cn(
                            'w-5 h-5 text-gray-400 transition-transform flex-shrink-0',
                            isExpanded && 'rotate-180'
                          )}
                        />
                      </div>

                      {/* Progress bar for current milestone */}
                      {isCurrent && !isAchieved && (
                        <div className="mt-3">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-xs text-gray-600">Progress</span>
                            <span className="text-xs font-semibold text-gray-700">
                              {milestone.progress || 0} / {milestone.threshold}
                            </span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                              className={cn(
                                'h-2 rounded-full transition-all duration-300',
                                getMilestoneColor(milestone.type, true).replace('text', 'bg')
                              )}
                              style={{
                                width: `${milestone.progressPercent || 0}%`,
                              }}
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Expanded content */}
                  {isExpanded && (
                    <div
                      className={cn(
                        'border-t px-4 py-3',
                        isAchieved ? 'border-violet-200' : 'border-gray-200'
                      )}
                    >
                      <div className="space-y-3">
                        <div>
                          <p className="text-xs font-medium text-gray-600 uppercase tracking-wider">
                            Milestone Details
                          </p>
                          <p className="text-sm text-gray-700 mt-1">
                            {isAchieved
                              ? `Congratulations! This milestone was reached on ${new Date(milestone.achievedAt!).toLocaleDateString()} at ${new Date(milestone.achievedAt!).toLocaleTimeString()}.`
                              : isCurrent
                                ? `Keep going! You're ${milestone.progressPercent || 0}% of the way to reaching ${milestone.threshold} ${getMilestoneLabel(milestone.type).toLowerCase()}. Every contribution helps!`
                                : 'This milestone is locked until previous milestones are achieved.'}
                          </p>
                        </div>

                        {isAchieved && showSharing && (
                          <Button
                            variant="secondary"
                            size="sm"
                            onClick={() => handleShareMilestone(milestone)}
                            disabled={sharingMilestone === milestone.id}
                            className="w-full"
                          >
                            <Share2 className="w-4 h-4 mr-2" />
                            {sharingMilestone === milestone.id
                              ? 'Sharing...'
                              : 'Share Achievement'}
                          </Button>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )
          })
        )}
      </div>

      {/* Footer message */}
      {currentMilestone && !currentMilestone.achieved && (
        <div className="mt-8 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <p className="text-sm text-blue-900">
            <span className="font-semibold">Next milestone:</span> Reach{' '}
            <span className="font-bold">{currentMilestone.threshold}</span>{' '}
            {getMilestoneLabel(currentMilestone.type).toLowerCase()} to unlock your next
            achievement!
          </p>
        </div>
      )}

      {data.milestones.every((m) => m.achieved) && (
        <div className="mt-8 p-4 bg-green-50 rounded-lg border border-green-200">
          <p className="text-sm text-green-900">
            <span className="font-semibold">Amazing!</span> You've unlocked all available
            milestones. Keep up the momentum!
          </p>
        </div>
      )}
    </div>
  )
}
