'use client'

import React, { useState } from 'react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Avatar } from '@/components/ui/avatar'
import {
  ChevronUp,
  Trash2,
  Pin,
  CheckCircle2,
} from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'

interface User {
  id: string
  displayName: string
  avatar?: string | null
}

interface QuestionCardProps {
  id: string
  content: string
  answer?: string | null
  answeredAt?: Date | null
  answeredBy?: User | null
  isPinned: boolean
  status: 'OPEN' | 'ANSWERED' | 'CLOSED'
  user: User
  voteCount: number
  userVoted: boolean
  createdAt: Date
  isCreator: boolean
  currentUserId?: string
  onVote: (questionId: string) => Promise<void>
  onAnswer: (questionId: string, answer: string) => Promise<void>
  onPin: (questionId: string) => Promise<void>
  onDelete: (questionId: string) => Promise<void>
}

export function QuestionCard({
  id,
  content,
  answer,
  answeredAt,
  answeredBy,
  isPinned,
  status,
  user,
  voteCount,
  userVoted,
  createdAt,
  isCreator,
  currentUserId,
  onVote,
  onAnswer,
  onPin,
  onDelete,
}: QuestionCardProps) {
  const [isAnswering, setIsAnswering] = useState(false)
  const [answerText, setAnswerText] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isVoting, setIsVoting] = useState(false)
  const [isExpanded, setIsExpanded] = useState(false)

  const isQuestionAuthor = currentUserId === user.id
  const canDelete = isCreator || isQuestionAuthor

  const handleVote = async () => {
    setIsVoting(true)
    try {
      await onVote(id)
    } finally {
      setIsVoting(false)
    }
  }

  const handleSubmitAnswer = async () => {
    if (!answerText.trim()) return

    setIsSubmitting(true)
    try {
      await onAnswer(id, answerText)
      setAnswerText('')
      setIsAnswering(false)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handlePin = async () => {
    try {
      await onPin(id)
    } catch (error) {
      console.error('Failed to pin question:', error)
    }
  }

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this question?')) return

    try {
      await onDelete(id)
    } catch (error) {
      console.error('Failed to delete question:', error)
    }
  }

  const isAnswerLong = answer && answer.length > 300
  const displayAnswer = isExpanded || !isAnswerLong ? answer : answer?.substring(0, 300) + '...'

  return (
    <div
      className={cn(
        'flex gap-4 border-b border-gray-200 pb-4 last:border-b-0',
        isPinned && 'bg-lime-50 p-4 rounded-lg border border-lime-200'
      )}
    >
      {/* Vote Column */}
      <div className="flex flex-col items-center gap-2">
        <button
          onClick={handleVote}
          disabled={isVoting}
          className={cn(
            'flex flex-col items-center gap-1 transition-all',
            userVoted
              ? 'text-violet-600'
              : 'text-gray-400 hover:text-gray-600'
          )}
          title={userVoted ? 'Unvote' : 'Vote'}
        >
          <ChevronUp
            size={20}
            className={cn(
              'transition-transform',
              userVoted && 'scale-110'
            )}
          />
          <span className="text-xs font-medium">{voteCount}</span>
        </button>
        {isPinned && (
          <Pin size={16} className="text-lime-600" fill="currentColor" />
        )}
      </div>

      {/* Content Column */}
      <div className="flex-1 min-w-0">
        {/* Question Header */}
        <div className="flex items-start justify-between gap-2 mb-2">
          <div className="flex items-center gap-2 min-w-0">
            <Avatar
              src={user.avatar || undefined}
              alt={user.displayName}
              size="sm"
            />
            <div className="min-w-0">
              <p className="text-sm font-medium text-gray-900">
                {user.displayName}
              </p>
              <p className="text-xs text-gray-500">
                {formatDistanceToNow(new Date(createdAt), { addSuffix: true })}
              </p>
            </div>
          </div>

          {/* Status Badge */}
          {status === 'ANSWERED' && (
            <div className="flex items-center gap-1 px-2 py-1 bg-green-100 rounded text-green-700">
              <CheckCircle2 size={14} />
              <span className="text-xs font-medium">Answered</span>
            </div>
          )}
        </div>

        {/* Question Content */}
        <p className="text-sm text-gray-700 mb-3 whitespace-pre-wrap break-words">
          {content}
        </p>

        {/* Answer Section */}
        {answer && (
          <div className="mb-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
            <div className="flex items-center gap-2 mb-2">
              <CheckCircle2 size={16} className="text-green-600" />
              <span className="text-xs font-medium text-gray-600">
                Answered by {answeredBy?.displayName}
              </span>
            </div>
            <p className="text-sm text-gray-700 whitespace-pre-wrap break-words">
              {displayAnswer}
            </p>
            {isAnswerLong && (
              <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="text-xs text-violet-600 hover:text-violet-700 font-medium mt-2"
              >
                {isExpanded ? 'Show less' : 'Show more'}
              </button>
            )}
          </div>
        )}

        {/* Answer Form (Creator Only) */}
        {isCreator && !answer && (
          <>
            {isAnswering ? (
              <div className="space-y-2 mb-3">
                <Textarea
                  value={answerText}
                  onChange={(e) => setAnswerText(e.target.value)}
                  placeholder="Type your answer here..."
                  className="min-h-24 text-sm"
                  disabled={isSubmitting}
                />
                <div className="flex gap-2">
                  <Button
                    onClick={handleSubmitAnswer}
                    loading={isSubmitting}
                    disabled={!answerText.trim() || isSubmitting}
                    variant="primary"
                    size="sm"
                  >
                    Post Answer
                  </Button>
                  <Button
                    onClick={() => {
                      setIsAnswering(false)
                      setAnswerText('')
                    }}
                    variant="ghost"
                    size="sm"
                    disabled={isSubmitting}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            ) : (
              <Button
                onClick={() => setIsAnswering(true)}
                variant="secondary"
                size="sm"
                className="mb-3"
              >
                Answer Question
              </Button>
            )}
          </>
        )}

        {/* Action Buttons */}
        <div className="flex items-center gap-2 mt-3">
          {isCreator && (
            <Button
              onClick={handlePin}
              variant="ghost"
              size="sm"
              className="text-xs"
              title={isPinned ? 'Unpin question' : 'Pin question'}
            >
              <Pin size={14} />
              {isPinned ? 'Pinned' : 'Pin'}
            </Button>
          )}

          {canDelete && (
            <Button
              onClick={handleDelete}
              variant="ghost"
              size="sm"
              className="text-xs text-red-600 hover:text-red-700 hover:bg-red-50"
              title="Delete question"
            >
              <Trash2 size={14} />
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}
