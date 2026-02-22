'use client'

import React, { useState, useEffect } from 'react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Spinner } from '@/components/ui/spinner'
import { QuestionCard } from './question-card'
import { AlertCircle, ChevronLeft, ChevronRight } from 'lucide-react'
import { useRouter } from 'next/navigation'

interface Question {
  id: string
  content: string
  answer?: string | null
  answeredAt?: Date | null
  answeredBy?: {
    id: string
    displayName: string
    avatar?: string | null
  } | null
  isPinned: boolean
  status: 'OPEN' | 'ANSWERED' | 'CLOSED'
  user: {
    id: string
    displayName: string
    avatar?: string | null
  }
  voteCount: number
  userVoted: boolean
  createdAt: Date
}

interface QASectionProps {
  campaignId: string
  isCreator: boolean
  isLoggedIn: boolean
}

type SortType = 'popular' | 'newest' | 'unanswered'

export function QASection({
  campaignId,
  isCreator,
  isLoggedIn,
}: QASectionProps) {
  const router = useRouter()
  const [questions, setQuestions] = useState<Question[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [sort, setSort] = useState<SortType>('popular')
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [total, setTotal] = useState(0)
  const [questionContent, setQuestionContent] = useState('')
  const [isAskingQuestion, setIsAskingQuestion] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)

  // Fetch questions
  useEffect(() => {
    const fetchQuestions = async () => {
      setLoading(true)
      setError(null)
      try {
        const response = await fetch(
          `/api/campaigns/${campaignId}/questions?sort=${sort}&page=${page}&limit=10`
        )

        if (!response.ok) {
          throw new Error('Failed to fetch questions')
        }

        const data = await response.json()
        setQuestions(data.questions)
        setTotalPages(data.totalPages)
        setTotal(data.total)
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : 'Failed to fetch questions'
        )
      } finally {
        setLoading(false)
      }
    }

    fetchQuestions()
  }, [campaignId, sort, page])

  const handleAskQuestion = async () => {
    if (!isLoggedIn) {
      router.push('/auth/login')
      return
    }

    if (!questionContent.trim()) {
      setSubmitError('Please enter a question')
      return
    }

    setIsSubmitting(true)
    setSubmitError(null)

    try {
      const response = await fetch(
        `/api/campaigns/${campaignId}/questions`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ content: questionContent }),
        }
      )

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to ask question')
      }

      setQuestionContent('')
      setIsAskingQuestion(false)
      setPage(1)
      // Refetch questions
      const fetchResponse = await fetch(
        `/api/campaigns/${campaignId}/questions?sort=${sort}&page=1&limit=10`
      )
      const fetchData = await fetchResponse.json()
      setQuestions(fetchData.questions)
      setTotalPages(fetchData.totalPages)
      setTotal(fetchData.total)
    } catch (err) {
      setSubmitError(
        err instanceof Error
          ? err.message
          : 'Failed to ask question'
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleVote = async (questionId: string) => {
    if (!isLoggedIn) {
      router.push('/auth/login')
      return
    }

    try {
      const response = await fetch(
        `/api/campaigns/${campaignId}/questions/${questionId}/vote`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
        }
      )

      if (!response.ok) {
        throw new Error('Failed to vote')
      }

      const data = await response.json()

      // Update question in state
      setQuestions((prev) =>
        prev.map((q) =>
          q.id === questionId
            ? {
                ...q,
                voteCount: data.voteCount,
                userVoted: data.userVoted,
              }
            : q
        )
      )
    } catch (err) {
      console.error('Vote error:', err)
    }
  }

  const handleAnswer = async (questionId: string, answer: string) => {
    try {
      const response = await fetch(
        `/api/campaigns/${campaignId}/questions/${questionId}`,
        {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ answer }),
        }
      )

      if (!response.ok) {
        throw new Error('Failed to answer question')
      }

      const updatedQuestion = await response.json()

      // Update question in state
      setQuestions((prev) =>
        prev.map((q) =>
          q.id === questionId
            ? {
                ...q,
                answer: updatedQuestion.answer,
                answeredAt: updatedQuestion.answeredAt,
                answeredBy: updatedQuestion.answeredBy,
                status: updatedQuestion.status,
              }
            : q
        )
      )
    } catch (err) {
      console.error('Answer error:', err)
      throw err
    }
  }

  const handlePin = async (questionId: string) => {
    try {
      const response = await fetch(
        `/api/campaigns/${campaignId}/questions/${questionId}/pin`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
        }
      )

      if (!response.ok) {
        throw new Error('Failed to pin question')
      }

      const data = await response.json()

      // Update question in state
      setQuestions((prev) =>
        prev.map((q) =>
          q.id === questionId
            ? { ...q, isPinned: data.isPinned }
            : q
        )
      )
    } catch (err) {
      console.error('Pin error:', err)
      throw err
    }
  }

  const handleDelete = async (questionId: string) => {
    try {
      const response = await fetch(
        `/api/campaigns/${campaignId}/questions/${questionId}`,
        {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
        }
      )

      if (!response.ok) {
        throw new Error('Failed to delete question')
      }

      // Remove question from state
      setQuestions((prev) => prev.filter((q) => q.id !== questionId))
      setTotal((prev) => prev - 1)
    } catch (err) {
      console.error('Delete error:', err)
      throw err
    }
  }

  const handleSortChange = (newSort: SortType) => {
    setSort(newSort)
    setPage(1)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-1">Q&A</h2>
        <p className="text-gray-600">
          Ask questions and get answers from the creator and community
        </p>
      </div>

      {/* Ask Question Section */}
      <div className="border border-gray-200 rounded-lg p-4 bg-white">
        {isAskingQuestion ? (
          <div className="space-y-3">
            <Textarea
              value={questionContent}
              onChange={(e) => setQuestionContent(e.target.value)}
              placeholder="Ask your question here... (10-1000 characters)"
              className="min-h-24 text-sm"
              disabled={isSubmitting}
            />
            {submitError && (
              <div className="flex items-center gap-2 px-3 py-2 bg-red-50 border border-red-200 rounded text-red-700 text-sm">
                <AlertCircle size={16} />
                {submitError}
              </div>
            )}
            <div className="flex gap-2">
              <Button
                onClick={handleAskQuestion}
                variant="primary"
                loading={isSubmitting}
                disabled={isSubmitting}
              >
                Ask Question
              </Button>
              <Button
                onClick={() => {
                  setIsAskingQuestion(false)
                  setQuestionContent('')
                  setSubmitError(null)
                }}
                variant="ghost"
                disabled={isSubmitting}
              >
                Cancel
              </Button>
            </div>
          </div>
        ) : (
          <Button
            onClick={() =>
              isLoggedIn
                ? setIsAskingQuestion(true)
                : router.push('/auth/login')
            }
            variant="primary"
            className="w-full"
          >
            Ask a Question
          </Button>
        )}
      </div>

      {/* Sort Tabs */}
      <div className="flex gap-2 border-b border-gray-200">
        {(['popular', 'newest', 'unanswered'] as const).map((sortType) => (
          <button
            key={sortType}
            onClick={() => handleSortChange(sortType)}
            className={cn(
              'px-3 py-2 font-medium text-sm transition-colors',
              sort === sortType
                ? 'text-violet-600 border-b-2 border-violet-600 -mb-[2px]'
                : 'text-gray-600 hover:text-gray-900'
            )}
          >
            {sortType.charAt(0).toUpperCase() + sortType.slice(1)}
          </button>
        ))}
      </div>

      {/* Error State */}
      {error && (
        <div className="flex items-center gap-2 px-4 py-3 bg-red-50 border border-red-200 rounded-lg text-red-700">
          <AlertCircle size={18} />
          {error}
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="flex justify-center py-8">
          <Spinner />
        </div>
      )}

      {/* Questions List */}
      {!loading && questions.length > 0 && (
        <div className="space-y-2">
          {questions.map((question) => (
            <QuestionCard
              key={question.id}
              {...question}
              isCreator={isCreator}
              currentUserId={
                isLoggedIn ? undefined : undefined // Should be passed from parent context
              }
              onVote={handleVote}
              onAnswer={handleAnswer}
              onPin={handlePin}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}

      {/* Empty State */}
      {!loading && questions.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-600 mb-4">
            {sort === 'unanswered'
              ? 'No unanswered questions yet'
              : 'No questions yet. Ask the first one!'}
          </p>
          {!isAskingQuestion && (
            <Button
              onClick={() =>
                isLoggedIn
                  ? setIsAskingQuestion(true)
                  : router.push('/auth/login')
              }
              variant="primary"
            >
              Ask a Question
            </Button>
          )}
        </div>
      )}

      {/* Pagination */}
      {!loading && totalPages > 1 && (
        <div className="flex items-center justify-center gap-4">
          <Button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            variant="ghost"
            size="sm"
          >
            <ChevronLeft size={16} />
            Previous
          </Button>

          <span className="text-sm text-gray-600">
            Page {page} of {totalPages}
          </span>

          <Button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            variant="ghost"
            size="sm"
          >
            Next
            <ChevronRight size={16} />
          </Button>
        </div>
      )}

      {/* Stats */}
      {!loading && total > 0 && (
        <div className="text-center text-sm text-gray-500">
          {total} question{total !== 1 ? 's' : ''} total
        </div>
      )}
    </div>
  )
}
