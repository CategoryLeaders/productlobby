'use client'

import React, { useEffect, useState } from 'react'
import { CheckCircle2, Target, MessageSquare } from 'lucide-react'
import { cn } from '@/lib/utils'

interface Milestone {
  type: 'lobbies' | 'comments'
  threshold: number
  reached: boolean
}

interface NextMilestone {
  threshold: number
  remaining: number
}

interface ProgressMilestonesData {
  lobbyCount: number
  commentCount: number
  lobbyMilestones: Milestone[]
  commentMilestones: Milestone[]
  nextLobbyMilestone: NextMilestone | null
  nextCommentMilestone: NextMilestone | null
  lobbyProgressPercent: number
  commentProgressPercent: number
}

interface MilestoneTrackerProps {
  campaignId: string
}

const CelebrationAnimation: React.FC<{ type: 'lobbies' | 'comments' }> = ({ type }) => {
  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden">
      {/* Confetti-like celebration elements */}
      {Array.from({ length: 20 }).map((_, i) => (
        <div
          key={i}
          className={cn(
            'absolute w-2 h-2 rounded-full animate-bounce',
            type === 'lobbies' ? 'bg-violet-400' : 'bg-lime-400'
          )}
          style={{
            left: `${Math.random() * 100}%`,
            top: `-10px`,
            animation: `fall ${1.5 + Math.random() * 1}s linear forwards`,
            animationDelay: `${i * 0.05}s`,
          }}
        />
      ))}
      <style>{`
        @keyframes fall {
          to {
            transform: translateY(100vh) rotate(360deg);
            opacity: 0;
          }
        }
      `}</style>
    </div>
  )
}

export const MilestoneTracker: React.FC<MilestoneTrackerProps> = ({ campaignId }) => {
  const [data, setData] = useState<ProgressMilestonesData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showCelebration, setShowCelebration] = useState<'lobbies' | 'comments' | null>(null)
  const [lastLobbyCount, setLastLobbyCount] = useState(0)
  const [lastCommentCount, setLastCommentCount] = useState(0)

  useEffect(() => {
    const fetchMilestones = async () => {
      try {
        setLoading(true)
        const response = await fetch(
          `/api/campaigns/${campaignId}/progress-milestones`
        )

        if (!response.ok) {
          throw new Error('Failed to fetch milestones')
        }

        const result = await response.json()
        const newData = result.data

        // Check if a new milestone was just reached
        if (newData.lobbyCount > lastLobbyCount) {
          const reachedNewLobbyMilestone = newData.lobbyMilestones.some(
            (m) => m.reached && m.threshold > lastLobbyCount
          )
          if (reachedNewLobbyMilestone) {
            setShowCelebration('lobbies')
            setTimeout(() => setShowCelebration(null), 2000)
          }
          setLastLobbyCount(newData.lobbyCount)
        }

        if (newData.commentCount > lastCommentCount) {
          const reachedNewCommentMilestone = newData.commentMilestones.some(
            (m) => m.reached && m.threshold > lastCommentCount
          )
          if (reachedNewCommentMilestone) {
            setShowCelebration('comments')
            setTimeout(() => setShowCelebration(null), 2000)
          }
          setLastCommentCount(newData.commentCount)
        }

        setData(newData)
        setError(null)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred')
        console.error('Error fetching milestones:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchMilestones()
    const interval = setInterval(fetchMilestones, 30000) // Refresh every 30 seconds

    return () => clearInterval(interval)
  }, [campaignId, lastLobbyCount, lastCommentCount])

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="h-20 bg-gray-100 rounded-lg animate-pulse" />
        <div className="h-40 bg-gray-100 rounded-lg animate-pulse" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
        {error}
      </div>
    )
  }

  if (!data) {
    return null
  }

  return (
    <>
      {showCelebration && <CelebrationAnimation type={showCelebration} />}

      <div className="space-y-8">
        {/* Lobbies Section */}
        <div className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
          <div className="flex items-center gap-3 mb-4">
            <Target className="w-5 h-5 text-violet-600" />
            <h3 className="text-lg font-semibold text-gray-900">Lobby Milestones</h3>
          </div>

          {/* Progress Bar */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700">
                {data.lobbyCount} lobbies
              </span>
              <span className="text-sm text-gray-600">
                {data.lobbyProgressPercent}% to next milestone
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-violet-600 h-2 rounded-full transition-all duration-500"
                style={{ width: `${data.lobbyProgressPercent}%` }}
              />
            </div>
            {data.nextLobbyMilestone && (
              <p className="text-sm text-gray-600 mt-2">
                <span className="font-medium">{data.nextLobbyMilestone.remaining}</span> more
                lobbies to reach <span className="font-medium">{data.nextLobbyMilestone.threshold}</span>!
              </p>
            )}
          </div>

          {/* Milestone List */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
            {data.lobbyMilestones.map((milestone) => (
              <div
                key={milestone.threshold}
                className={cn(
                  'flex items-center gap-2 px-3 py-2 rounded-md border transition-all',
                  milestone.reached
                    ? 'bg-violet-50 border-violet-200'
                    : 'bg-gray-50 border-gray-200 opacity-60'
                )}
              >
                {milestone.reached && (
                  <CheckCircle2 className="w-4 h-4 text-violet-600 flex-shrink-0" />
                )}
                <span className="text-sm font-medium text-gray-900">
                  {milestone.threshold}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Comments Section */}
        <div className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
          <div className="flex items-center gap-3 mb-4">
            <MessageSquare className="w-5 h-5 text-lime-600" />
            <h3 className="text-lg font-semibold text-gray-900">Comment Milestones</h3>
          </div>

          {/* Progress Bar */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700">
                {data.commentCount} comments
              </span>
              <span className="text-sm text-gray-600">
                {data.commentProgressPercent}% to next milestone
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-lime-600 h-2 rounded-full transition-all duration-500"
                style={{ width: `${data.commentProgressPercent}%` }}
              />
            </div>
            {data.nextCommentMilestone && (
              <p className="text-sm text-gray-600 mt-2">
                <span className="font-medium">{data.nextCommentMilestone.remaining}</span> more
                comments to reach <span className="font-medium">{data.nextCommentMilestone.threshold}</span>!
              </p>
            )}
          </div>

          {/* Milestone List */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
            {data.commentMilestones.map((milestone) => (
              <div
                key={milestone.threshold}
                className={cn(
                  'flex items-center gap-2 px-3 py-2 rounded-md border transition-all',
                  milestone.reached
                    ? 'bg-lime-50 border-lime-200'
                    : 'bg-gray-50 border-gray-200 opacity-60'
                )}
              >
                {milestone.reached && (
                  <CheckCircle2 className="w-4 h-4 text-lime-600 flex-shrink-0" />
                )}
                <span className="text-sm font-medium text-gray-900">
                  {milestone.threshold}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  )
}
