'use client'

import React, { useState, useEffect } from 'react'
import { ChevronDown, ChevronUp, Plus, Trash2, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'

interface FAQItem {
  id: string
  question: string
  answer: string
  createdAt: string
  createdBy: {
    id: string
    displayName: string
    avatar: string | null
  }
}

interface FAQManagerProps {
  campaignId: string
  isCreator?: boolean
}

export function FAQManager({ campaignId, isCreator = false }: FAQManagerProps) {
  const [faqItems, setFaqItems] = useState<FAQItem[]>([])
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState({ question: '', answer: '' })
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  // Fetch FAQ items
  useEffect(() => {
    const fetchFAQItems = async () => {
      try {
        setIsLoading(true)
        const response = await fetch(`/api/campaigns/${campaignId}/faq-items`)
        if (!response.ok) throw new Error('Failed to fetch FAQ items')
        const data = await response.json()
        setFaqItems(data.data || [])
      } catch (err) {
        console.error('Error fetching FAQ items:', err)
        setError('Failed to load FAQ items')
      } finally {
        setIsLoading(false)
      }
    }

    fetchFAQItems()
  }, [campaignId])

  const handleAddFAQ = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setSuccess(null)

    if (!formData.question.trim() || !formData.answer.trim()) {
      setError('Both question and answer are required')
      return
    }

    try {
      setIsSaving(true)
      const response = await fetch(`/api/campaigns/${campaignId}/faq-items`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question: formData.question,
          answer: formData.answer,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to add FAQ item')
      }

      const data = await response.json()
      setFaqItems([data.data, ...faqItems])
      setFormData({ question: '', answer: '' })
      setShowForm(false)
      setSuccess('FAQ item added successfully')
      setTimeout(() => setSuccess(null), 3000)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add FAQ item')
    } finally {
      setIsSaving(false)
    }
  }

  const handleDeleteFAQ = async (eventId: string) => {
    if (!confirm('Are you sure you want to delete this FAQ item?')) return

    try {
      setIsSaving(true)
      const response = await fetch(`/api/campaigns/${campaignId}/faq-items`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ eventId }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to delete FAQ item')
      }

      setFaqItems(faqItems.filter((item) => item.id !== eventId))
      setSuccess('FAQ item deleted successfully')
      setTimeout(() => setSuccess(null), 3000)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete FAQ item')
    } finally {
      setIsSaving(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-6 h-6 text-violet-600 animate-spin" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Messages */}
      {error && (
        <div className="p-4 rounded-lg bg-red-50 border border-red-200">
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}
      {success && (
        <div className="p-4 rounded-lg bg-lime-50 border border-lime-200">
          <p className="text-sm text-lime-700">{success}</p>
        </div>
      )}

      {/* Add FAQ Form */}
      {isCreator && (
        <div className="space-y-4">
          <button
            onClick={() => setShowForm(!showForm)}
            className={cn(
              'flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all',
              showForm
                ? 'bg-violet-100 text-violet-700 hover:bg-violet-200'
                : 'bg-violet-600 text-white hover:bg-violet-700'
            )}
          >
            <Plus className="w-4 h-4" />
            Add FAQ Item
          </button>

          {showForm && (
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Question *
                </label>
                <input
                  type="text"
                  value={formData.question}
                  onChange={(e) =>
                    setFormData({ ...formData, question: e.target.value })
                  }
                  placeholder="What is your question?"
                  className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-violet-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Answer *
                </label>
                <textarea
                  value={formData.answer}
                  onChange={(e) =>
                    setFormData({ ...formData, answer: e.target.value })
                  }
                  placeholder="Provide a detailed answer..."
                  rows={4}
                  className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-violet-500 resize-none"
                />
              </div>

              <div className="flex gap-3">
                <button
                  onClick={handleAddFAQ}
                  disabled={isSaving}
                  className="flex items-center gap-2 px-4 py-2 bg-violet-600 text-white rounded-lg font-medium hover:bg-violet-700 disabled:opacity-50"
                >
                  {isSaving && <Loader2 className="w-4 h-4 animate-spin" />}
                  Save
                </button>
                <button
                  onClick={() => {
                    setShowForm(false)
                    setFormData({ question: '', answer: '' })
                  }}
                  disabled={isSaving}
                  className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg font-medium hover:bg-gray-300"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* FAQ Items List */}
      <div className="space-y-3">
        {faqItems.length === 0 ? (
          <div className="text-center py-12 bg-gray-50 rounded-lg">
            <p className="text-gray-600">
              {isCreator
                ? 'No FAQ items yet. Add your first FAQ item to help supporters!'
                : 'No FAQ items available for this campaign yet.'}
            </p>
          </div>
        ) : (
          faqItems.map((item) => (
            <div
              key={item.id}
              className="bg-white rounded-lg border border-gray-200 hover:shadow-md transition-shadow"
            >
              <button
                onClick={() =>
                  setExpandedId(expandedId === item.id ? null : item.id)
                }
                className="w-full flex items-center justify-between px-6 py-4 hover:bg-gray-50 transition-colors"
              >
                <div className="flex-1 text-left">
                  <h3 className="font-semibold text-gray-900 text-base">
                    {item.question}
                  </h3>
                  <p className="text-xs text-gray-500 mt-1">
                    By {item.createdBy.displayName} •{' '}
                    {new Date(item.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex items-center gap-3 ml-4">
                  {isCreator && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        handleDeleteFAQ(item.id)
                      }}
                      disabled={isSaving}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                      title="Delete FAQ item"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                  {expandedId === item.id ? (
                    <ChevronUp className="w-5 h-5 text-gray-400" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-gray-400" />
                  )}
                </div>
              </button>

              {/* Expanded Answer */}
              {expandedId === item.id && (
                <div className="border-t border-gray-200 px-6 py-4 bg-gray-50">
                  <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                    {item.answer}
                  </p>
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* Info Text */}
      {!isCreator && faqItems.length > 0 && (
        <p className="text-sm text-gray-600 text-center">
          Click on a question to see the answer
        </p>
      )}
    </div>
  )
}
