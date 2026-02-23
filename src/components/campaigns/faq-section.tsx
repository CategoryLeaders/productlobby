'use client'

import React, { useState, useEffect } from 'react'
import { useToast } from '@/components/ui/toast'
import { FAQItem } from './faq-item'
import { MessageCircle, Loader } from 'lucide-react'

interface FAQData {
  id: string
  question: string
  answer: string | null
  askedBy: {
    id: string
    displayName: string
    avatar: string | null
  }
  answeredBy: {
    id: string
    displayName: string
    avatar: string | null
  } | null
  createdAt: string
  answeredAt: string | null
  isPinned: boolean
}

interface FAQSectionProps {
  campaignId: string
  isCreator: boolean
  isLoggedIn: boolean
}

export function FAQSection({ campaignId, isCreator, isLoggedIn }: FAQSectionProps) {
  const [faqItems, setFaqItems] = useState<FAQData[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isFormExpanded, setIsFormExpanded] = useState(false)
  const [question, setQuestion] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { addToast } = useToast()

  useEffect(() => {
    fetchFAQ()
  }, [campaignId])

  const fetchFAQ = async () => {
    try {
      setIsLoading(true)
      const res = await fetch(`/api/campaigns/${campaignId}/faq`)
      if (!res.ok) throw new Error('Failed to fetch FAQ')
      const data = await res.json()
      setFaqItems(data.data || [])
    } catch (error) {
      console.error('Error fetching FAQ:', error)
      addToast('Failed to load FAQ section', 'error')
    } finally {
      setIsLoading(false)
    }
  }

  const handleSubmitQuestion = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!question.trim()) {
      addToast('Please enter a question', 'error')
      return
    }

    setIsSubmitting(true)
    try {
      const res = await fetch(`/api/campaigns/${campaignId}/faq`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question: question.trim() }),
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Failed to submit question')
      }

      const data = await res.json()
      setFaqItems([data.data, ...faqItems])
      setQuestion('')
      setIsFormExpanded(false)
      addToast('Question submitted!', 'success')
    } catch (error) {
      addToast(
        error instanceof Error ? error.message : 'Failed to submit question',
        'error'
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleAnswerSubmitted = async () => {
    await fetchFAQ()
  }

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-8 flex justify-center items-center min-h-64">
        <div className="flex flex-col items-center gap-2">
          <Loader size={32} className="text-violet-600 animate-spin" />
          <p className="text-sm text-gray-500">Loading FAQ...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3 mb-4">
        <div className="p-2 bg-violet-100 rounded-lg">
          <MessageCircle size={20} className="text-violet-600" />
        </div>
        <div>
          <h3 className="text-lg font-display font-semibold text-foreground">
            Frequently Asked Questions
          </h3>
          <p className="text-sm text-gray-600">
            {faqItems.length} question{faqItems.length !== 1 ? 's' : ''} so far
          </p>
        </div>
      </div>

      {/* Ask Question Form */}
      {isLoggedIn && (
        <>
          {!isFormExpanded ? (
            <button
              onClick={() => setIsFormExpanded(true)}
              className="w-full px-4 py-3 bg-white border border-dashed border-gray-300 rounded-lg text-sm font-medium text-gray-600 hover:border-violet-400 hover:text-violet-600 transition-colors"
            >
              + Ask a Question
            </button>
          ) : (
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <h4 className="font-display font-semibold text-foreground mb-4">
                Ask a Question
              </h4>

              <form onSubmit={handleSubmitQuestion} className="space-y-4">
                <div>
                  <label htmlFor="faq-question" className="block text-sm font-medium text-foreground mb-2">
                    Your Question
                  </label>
                  <textarea
                    id="faq-question"
                    value={question}
                    onChange={(e) => setQuestion(e.target.value)}
                    placeholder="What would you like to know about this campaign?"
                    maxLength={500}
                    rows={3}
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500 transition-all resize-none"
                  />
                  <p className="text-xs text-gray-500 mt-1">{question.length}/500</p>
                </div>

                <div className="flex gap-3">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-6 py-2 rounded-lg text-sm font-medium transition-colors bg-violet-600 text-white hover:bg-violet-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
                  >
                    {isSubmitting ? 'Submitting...' : 'Submit Question'}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setIsFormExpanded(false)
                      setQuestion('')
                    }}
                    className="px-6 py-2 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-100 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          )}
        </>
      )}

      {/* FAQ Items */}
      {faqItems.length === 0 ? (
        <div className="bg-gray-50 border border-dashed border-gray-200 rounded-lg p-8 text-center">
          <MessageCircle size={32} className="mx-auto text-gray-300 mb-3" />
          <p className="text-gray-600 font-medium">No questions yet</p>
          <p className="text-sm text-gray-500 mt-1">
            {isLoggedIn
              ? 'Be the first to ask a question about this campaign!'
              : 'Sign in to ask a question'}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {faqItems.map((item) => (
            <FAQItem
              key={item.id}
              id={item.id}
              question={item.question}
              answer={item.answer}
              askedBy={item.askedBy}
              answeredBy={item.answeredBy}
              createdAt={item.createdAt}
              answeredAt={item.answeredAt}
              isPinned={item.isPinned}
              isCreator={isCreator}
              campaignId={campaignId}
              onAnswer={handleAnswerSubmitted}
            />
          ))}
        </div>
      )}

      {/* Creator Info */}
      {isCreator && (
        <div className="bg-violet-50 border border-violet-200 rounded-lg p-4">
          <p className="text-xs font-medium text-violet-900">
            As the campaign creator, you can answer questions here. Your answers will be
            marked as official responses and appear at the top of the FAQ section.
          </p>
        </div>
      )}
    </div>
  )
}
