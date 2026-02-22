'use client'

import React, { useState } from 'react'
import { useToast } from '@/components/ui/toast'

function cn(...classes: (string | undefined | false)[]) {
  return classes.filter(Boolean).join(' ')
}

export interface PollOption {
  id: string
  text: string
  voteCount: number
  percentage: number
}

export interface PollData {
  id: string
  question: string
  description?: string | null
  pollType: 'SINGLE_SELECT' | 'MULTI_SELECT' | 'RANKED'
  status: 'ACTIVE' | 'CLOSED' | 'DRAFT'
  closesAt?: string | null
  totalVotes: number
  userHasVoted: boolean
  userVotes: { optionId: string; rank?: number | null }[]
  options: PollOption[]
  isCreator: boolean
}

interface PollCardProps {
  poll: PollData
  currentUserId: string | null
  onVoteChange: () => void
}

function formatClosesAt(closesAt: string): string {
  const date = new Date(closesAt)
  const now = new Date()
  const diffMs = date.getTime() - now.getTime()
  const diffHours = Math.floor(diffMs / 3600000)
  const diffDays = Math.floor(diffMs / 86400000)

  if (diffMs < 0) return 'Poll closed'
  if (diffHours < 1) return 'Closing soon'
  if (diffHours < 24) return `Closes in ${diffHours}h`
  if (diffDays < 7) return `Closes in ${diffDays}d`
  return `Closes ${date.toLocaleDateString()}`
}

export function PollCard({ poll, currentUserId, onVoteChange }: PollCardProps) {
  const [selectedOption, setSelectedOption] = useState<string | null>(null)
  const [isVoting, setIsVoting] = useState(false)
  const { addToast } = useToast()

  const canVote = !poll.userHasVoted && poll.status === 'ACTIVE' && !!currentUserId
  const userVoteOptionIds = poll.userVotes.map((v) => v.optionId)

  const handleVote = async () => {
    if (!selectedOption) return

    setIsVoting(true)
    try {
      const res = await fetch(`/api/polls/${poll.id}/vote`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ optionId: selectedOption }),
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Failed to vote')
      }

      addToast('Vote recorded!', 'success')
      onVoteChange()
    } catch (error) {
      addToast(error instanceof Error ? error.message : 'Failed to vote', 'error')
    } finally {
      setIsVoting(false)
    }
  }

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6">
      {/* Header */}
      <div className="flex items-start justify-between mb-1">
        <h4 className="font-display font-semibold text-foreground">{poll.question}</h4>
        <div className="flex items-center gap-2 flex-shrink-0 ml-3">
          {poll.status === 'CLOSED' && (
            <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">Closed</span>
          )}
          {poll.closesAt && poll.status === 'ACTIVE' && (
            <span className="text-xs text-gray-500">{formatClosesAt(poll.closesAt)}</span>
          )}
        </div>
      </div>

      {poll.description && (
        <p className="text-sm text-gray-500 mb-4">{poll.description}</p>
      )}

      {/* Voting or Results */}
      {canVote ? (
        <div className="mt-4 space-y-2">
          {poll.options.map((option) => (
            <label
              key={option.id}
              className={cn(
                'flex items-center gap-3 p-3 border rounded-lg cursor-pointer transition-colors',
                selectedOption === option.id
                  ? 'border-violet-500 bg-violet-50'
                  : 'border-gray-200 hover:bg-gray-50'
              )}
            >
              <input
                type="radio"
                name={`poll-${poll.id}`}
                value={option.id}
                checked={selectedOption === option.id}
                onChange={() => setSelectedOption(option.id)}
                className="w-4 h-4 text-violet-600 accent-violet-600"
              />
              <span className="text-sm text-foreground">{option.text}</span>
            </label>
          ))}

          <button
            onClick={handleVote}
            disabled={isVoting || !selectedOption}
            className={cn(
              'w-full mt-3 px-4 py-2 rounded-lg text-sm font-medium transition-colors',
              isVoting || !selectedOption
                ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                : 'bg-violet-600 text-white hover:bg-violet-700'
            )}
          >
            {isVoting ? 'Voting...' : 'Vote'}
          </button>
        </div>
      ) : (
        <div className="mt-4 space-y-3">
          {poll.options.map((option) => {
            const isUserVote = userVoteOptionIds.includes(option.id)
            return (
              <div key={option.id}>
                <div className="flex items-center justify-between mb-1">
                  <span className={cn('text-sm', isUserVote ? 'font-medium text-violet-700' : 'text-gray-700')}>
                    {option.text}
                    {isUserVote && <span className="text-violet-500 ml-1">(you)</span>}
                  </span>
                  <span className="text-sm text-gray-500">{option.percentage}%</span>
                </div>
                <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className={cn(
                      'h-full rounded-full transition-all duration-500',
                      isUserVote ? 'bg-violet-600' : 'bg-violet-300'
                    )}
                    style={{ width: `${option.percentage}%` }}
                  />
                </div>
                <p className="text-xs text-gray-400 mt-0.5">
                  {option.voteCount} vote{option.voteCount !== 1 ? 's' : ''}
                </p>
              </div>
            )
          })}
        </div>
      )}

      {/* Footer */}
      <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between">
        <span className="text-xs text-gray-500">
          {poll.totalVotes} total vote{poll.totalVotes !== 1 ? 's' : ''}
        </span>
        {poll.pollType === 'MULTI_SELECT' && (
          <span className="text-xs text-gray-400">Multiple choice</span>
        )}
      </div>
    </div>
  )
}
