'use client'

import React, { useState } from 'react'
import { cn } from '@/lib/utils'
import { useToast } from '@/components/ui/toast'

export interface PollOptionData {
  id: string
  text: string
  order: number
  voteCount: number
  percentage: number
}

export interface CampaignPollProps {
  id: string
  campaignId: string
  question: string
  description?: string | null
  pollType: 'SINGLE_SELECT' | 'MULTI_SELECT' | 'RANKED'
  maxSelections?: number
  status: 'ACTIVE' | 'CLOSED' | 'DRAFT'
  closesAt?: string | null
  totalVotes: number
  options: PollOptionData[]
  userVotes: Array<{ optionId: string; rank?: number | null }>
  isCreator?: boolean
  currentUserId: string | null
  onVoteChange?: () => void
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

export function CampaignPoll({
  id,
  campaignId,
  question,
  description,
  pollType,
  maxSelections = 1,
  status,
  closesAt,
  totalVotes,
  options,
  userVotes,
  isCreator = false,
  currentUserId,
  onVoteChange,
}: CampaignPollProps) {
  const [selectedOptions, setSelectedOptions] = useState<Set<string>>(
    new Set(userVotes.map((v) => v.optionId))
  )
  const [isVoting, setIsVoting] = useState(false)
  const { addToast } = useToast()

  const userHasVoted = userVotes.length > 0
  const canVote =
    !userHasVoted &&
    status === 'ACTIVE' &&
    !!currentUserId &&
    selectedOptions.size > 0

  const handleToggleOption = (optionId: string) => {
    if (pollType === 'SINGLE_SELECT') {
      setSelectedOptions(new Set([optionId]))
    } else {
      const newSelected = new Set(selectedOptions)
      if (newSelected.has(optionId)) {
        newSelected.delete(optionId)
      } else {
        if (newSelected.size >= maxSelections) {
          addToast(
            `You can only select up to ${maxSelections} options`,
            'warning'
          )
          return
        }
        newSelected.add(optionId)
      }
      setSelectedOptions(newSelected)
    }
  }

  const handleVote = async () => {
    if (selectedOptions.size === 0) return

    setIsVoting(true)
    try {
      // Submit vote for each selected option
      const votePromises = Array.from(selectedOptions).map((optionId) =>
        fetch(
          `/api/campaigns/${campaignId}/polls/${id}/vote`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ optionId }),
          }
        )
      )

      const responses = await Promise.all(votePromises)

      // Check if all votes succeeded
      const allSuccess = responses.every((res) => res.ok)
      if (!allSuccess) {
        const firstError = await responses.find((res) => !res.ok)?.json()
        throw new Error(firstError?.error || 'Failed to vote')
      }

      addToast('Vote recorded!', 'success')
      if (onVoteChange) {
        onVoteChange()
      }
    } catch (error) {
      addToast(
        error instanceof Error ? error.message : 'Failed to vote',
        'error'
      )
    } finally {
      setIsVoting(false)
    }
  }

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <h3 className="font-semibold text-lg text-foreground mb-1">
            {question}
          </h3>
          {description && (
            <p className="text-sm text-gray-600">{description}</p>
          )}
        </div>

        <div className="flex items-center gap-2 ml-4 flex-shrink-0">
          {status === 'CLOSED' && (
            <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full">
              Closed
            </span>
          )}
          {closesAt && status === 'ACTIVE' && (
            <span className="text-xs text-gray-500">
              {formatClosesAt(closesAt)}
            </span>
          )}
        </div>
      </div>

      {/* Voting or Results */}
      {!userHasVoted && status === 'ACTIVE' && currentUserId ? (
        <div className="space-y-2 mb-4">
          {options.map((option) => {
            const isSelected = selectedOptions.has(option.id)
            return (
              <button
                key={option.id}
                onClick={() => handleToggleOption(option.id)}
                className={cn(
                  'w-full flex items-center gap-3 p-3 border-2 rounded-lg transition-all text-left',
                  isSelected
                    ? 'border-violet-500 bg-violet-50'
                    : 'border-gray-200 hover:border-gray-300 bg-white'
                )}
              >
                {pollType === 'SINGLE_SELECT' ? (
                  <div
                    className={cn(
                      'w-4 h-4 rounded-full border-2 flex items-center justify-center flex-shrink-0',
                      isSelected
                        ? 'border-violet-600 bg-violet-600'
                        : 'border-gray-300'
                    )}
                  >
                    {isSelected && (
                      <div className="w-1.5 h-1.5 bg-white rounded-full" />
                    )}
                  </div>
                ) : (
                  <div
                    className={cn(
                      'w-4 h-4 rounded border-2 flex items-center justify-center flex-shrink-0',
                      isSelected
                        ? 'border-violet-600 bg-violet-600'
                        : 'border-gray-300'
                    )}
                  >
                    {isSelected && (
                      <svg
                        className="w-3 h-3 text-white"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={3}
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                    )}
                  </div>
                )}
                <span className="text-sm text-foreground">{option.text}</span>
              </button>
            )
          })}

          {pollType === 'MULTI_SELECT' && (
            <p className="text-xs text-gray-500 mt-2">
              Select up to {maxSelections} option
              {maxSelections !== 1 ? 's' : ''}
            </p>
          )}

          <button
            onClick={handleVote}
            disabled={isVoting || selectedOptions.size === 0}
            className={cn(
              'w-full mt-4 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors',
              isVoting || selectedOptions.size === 0
                ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                : 'bg-violet-600 text-white hover:bg-violet-700 active:bg-violet-800'
            )}
          >
            {isVoting ? 'Voting...' : 'Submit Vote'}
          </button>
        </div>
      ) : (
        <div className="space-y-3 mb-4">
          {options.map((option) => {
            const isUserVote = userVotes.some((v) => v.optionId === option.id)
            return (
              <div key={option.id}>
                <div className="flex items-center justify-between mb-2">
                  <span
                    className={cn(
                      'text-sm',
                      isUserVote
                        ? 'font-medium text-violet-700'
                        : 'text-gray-700'
                    )}
                  >
                    {option.text}
                    {isUserVote && (
                      <span className="text-violet-500 ml-2 text-xs font-normal">
                        (you)
                      </span>
                    )}
                  </span>
                  <span className="text-sm font-medium text-gray-600">
                    {option.percentage}%
                  </span>
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

                <p className="text-xs text-gray-400 mt-1">
                  {option.voteCount} vote{option.voteCount !== 1 ? 's' : ''}
                </p>
              </div>
            )
          })}
        </div>
      )}

      {/* Footer Stats */}
      <div className="pt-4 border-t border-gray-100 flex items-center justify-between">
        <span className="text-xs text-gray-500">
          {totalVotes} total vote{totalVotes !== 1 ? 's' : ''}
        </span>
        {pollType === 'MULTI_SELECT' && (
          <span className="text-xs text-gray-400">
            Multiple choice
          </span>
        )}
      </div>

      {/* Not logged in message */}
      {!currentUserId && status === 'ACTIVE' && (
        <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-xs text-blue-800">
            Sign in to vote on this poll
          </p>
        </div>
      )}
    </div>
  )
}
