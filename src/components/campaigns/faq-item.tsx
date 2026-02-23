'use client'

import React, { useState } from 'react'
import { useToast } from '@/components/ui/toast'
import { ChevronDown } from 'lucide-react'

interface FAQItemProps {
  id: string
  question: string
  answer: string | null
  askedBy: {
    displayName: string
    avatar: string | null
  }
  answeredBy: {
    displayName: string
    avatar: string | null
  } | null
  createdAt: string
  answeredAt: string | null
  isPinned: boolean
  isCreator: boolean
  campaignId: string
  onAnswer?: () => void
}

export function FAQItem({
  id,
  question,
  answer,
  askedBy,
  answeredBy,
  createdAt,
  answeredAt,
  isPinned,
  isCreator,
  campaignId,
  onAnswer,
}: FAQItemProps) {
  const [isExpanded, setIsExpanded] = useState(!!answer)
  const [isAnswering, setIsAnswering] = useState(false)
  const [answerText, setAnswerText] = useState(answer || '')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { addToast } = useToast()

  const handleSubmitAnswer = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!answerText.trim()) {
      addToast('Please provide an answer', 'error')
      return
    }

    setIsSubmitting(true)
    try {
      const res = await fetch(`/api/campaigns/${campaignId}/faq/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ answer: answerText.trim() }),
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Failed to submit answer')
      }

      addToast('Answer submitted!', 'success')
      setIsAnswering(false)
      setIsExpanded(true)
      onAnswer?.()
    } catch (error) {
      addToast(
        error instanceof Error ? error.message : 'Failed to submit answer',
        'error'
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  const formattedDate = new Date(createdAt).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })

  const answeredDate = answeredAt
    ? new Date(answeredAt).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      })
    : null

  return (
    <div className="bg-white border border-gray-200 rounded-lg overflow-hidden hover:border-gray-300 transition-colors">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full px-4 py-3 flex items-start gap-3 text-left hover:bg-gray-50 transition-colors"
      >
        <ChevronDown
          size={18}
          className={`mt-1 flex-shrink-0 text-gray-400 transition-transform ${
            isExpanded ? 'rotate-180' : ''
          }`}
        />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            {isPinned && (
              <span className="inline-flex px-2 py-0.5 bg-violet-100 text-violet-700 text-xs font-medium rounded">
                Pinned
              </span>
            )}
            {!answer && (
              <span className="inline-flex px-2 py-0.5 bg-amber-100 text-amber-700 text-xs font-medium rounded">
                Awaiting answer
              </span>
            )}
          </div>
          <p className="text-sm font-medium text-foreground mt-1 break-words">{question}</p>
          <p className="text-xs text-gray-500 mt-1">
            Asked by <span className="font-medium">{askedBy.displayName}</span> on{' '}
            {formattedDate}
          </p>
        </div>
      </button>

      {isExpanded && (
        <div className="border-t border-gray-100 px-4 py-4 bg-gray-50">
          {answer && (
            <div className="mb-4">
              <div className="flex items-center gap-2 mb-3">
                {answeredBy && (
                  <>
                    {answeredBy.avatar && (
                      <img
                        src={answeredBy.avatar}
                        alt={answeredBy.displayName}
                        className="w-5 h-5 rounded-full"
                      />
                    )}
                    <div className="flex items-center gap-2">
                      <span className="inline-flex px-2 py-0.5 bg-green-100 text-green-700 text-xs font-medium rounded">
                        Answered by Creator
                      </span>
                      <span className="text-xs text-gray-500">{answeredDate}</span>
                    </div>
                  </>
                )}
              </div>
              <div className="prose prose-sm max-w-none">
                <p className="text-sm text-foreground whitespace-pre-wrap break-words">
                  {answer}
                </p>
              </div>
            </div>
          )}

          {isCreator && !answer && (
            <div className="mt-4 pt-4 border-t border-gray-200">
              {!isAnswering ? (
                <button
                  onClick={() => setIsAnswering(true)}
                  className="px-4 py-2 bg-violet-600 text-white text-sm font-medium rounded-lg hover:bg-violet-700 transition-colors"
                >
                  Answer Question
                </button>
              ) : (
                <form onSubmit={handleSubmitAnswer} className="space-y-3">
                  <div>
                    <label htmlFor={`answer-${id}`} className="block text-xs font-medium text-foreground mb-2">
                      Your Answer
                    </label>
                    <textarea
                      id={`answer-${id}`}
                      value={answerText}
                      onChange={(e) => setAnswerText(e.target.value)}
                      placeholder="Type your answer here..."
                      rows={4}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500 transition-all text-sm resize-none"
                    />
                  </div>
                  <div className="flex gap-2">
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="px-4 py-2 bg-violet-600 text-white text-sm font-medium rounded-lg hover:bg-violet-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                    >
                      {isSubmitting ? 'Submitting...' : 'Submit Answer'}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setIsAnswering(false)
                        setAnswerText(answer || '')
                      }}
                      className="px-4 py-2 text-gray-600 text-sm font-medium rounded-lg hover:bg-gray-100 transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
