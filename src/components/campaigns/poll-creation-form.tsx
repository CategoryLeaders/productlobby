'use client'

import React, { useState } from 'react'
import { useToast } from '@/components/ui/toast'

function cn(...classes: (string | undefined | false)[]) {
  return classes.filter(Boolean).join(' ')
}

interface PollCreationFormProps {
  campaignId: string
  onPollCreated: () => void
}

export function PollCreationForm({ campaignId, onPollCreated }: PollCreationFormProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  const [question, setQuestion] = useState('')
  const [pollType, setPollType] = useState<'SINGLE_SELECT' | 'MULTI_SELECT'>('SINGLE_SELECT')
  const [options, setOptions] = useState(['', ''])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { addToast } = useToast()

  const addOption = () => {
    if (options.length < 10) {
      setOptions([...options, ''])
    }
  }

  const removeOption = (index: number) => {
    if (options.length > 2) {
      setOptions(options.filter((_, i) => i !== index))
    }
  }

  const updateOption = (index: number, value: string) => {
    const updated = [...options]
    updated[index] = value
    setOptions(updated)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!question.trim()) {
      addToast('Please enter a poll question', 'error')
      return
    }

    const nonEmptyOptions = options.filter((o) => o.trim())
    if (nonEmptyOptions.length < 2) {
      addToast('Please provide at least 2 options', 'error')
      return
    }

    setIsSubmitting(true)
    try {
      const res = await fetch(`/api/campaigns/${campaignId}/polls`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question: question.trim(),
          pollType,
          options: nonEmptyOptions.map((o) => o.trim()),
        }),
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Failed to create poll')
      }

      addToast('Poll created!', 'success')
      setQuestion('')
      setPollType('SINGLE_SELECT')
      setOptions(['', ''])
      setIsExpanded(false)
      onPollCreated()
    } catch (error) {
      addToast(error instanceof Error ? error.message : 'Failed to create poll', 'error')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!isExpanded) {
    return (
      <button
        onClick={() => setIsExpanded(true)}
        className="w-full px-4 py-3 bg-white border border-dashed border-gray-300 rounded-lg text-sm font-medium text-gray-500 hover:border-violet-400 hover:text-violet-600 transition-colors mb-4"
      >
        + Create a Poll
      </button>
    )
  }

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6 mb-4">
      <h4 className="font-display font-semibold text-foreground mb-4">Create a Poll</h4>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Question */}
        <div>
          <label htmlFor="poll-question" className="block text-sm font-medium text-foreground mb-1">
            Question
          </label>
          <input
            id="poll-question"
            type="text"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder="What would you like to ask supporters?"
            maxLength={500}
            className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500 transition-all"
          />
        </div>

        {/* Poll Type */}
        <div>
          <label htmlFor="poll-type" className="block text-sm font-medium text-foreground mb-1">
            Type
          </label>
          <select
            id="poll-type"
            value={pollType}
            onChange={(e) => setPollType(e.target.value as 'SINGLE_SELECT' | 'MULTI_SELECT')}
            className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500 transition-all"
          >
            <option value="SINGLE_SELECT">Single Choice</option>
            <option value="MULTI_SELECT">Multiple Choice</option>
          </select>
        </div>

        {/* Options */}
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">Options</label>
          <div className="space-y-2">
            {options.map((option, index) => (
              <div key={index} className="flex gap-2">
                <input
                  type="text"
                  value={option}
                  onChange={(e) => updateOption(index, e.target.value)}
                  placeholder={`Option ${index + 1}`}
                  className="flex-1 px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500 transition-all"
                />
                {options.length > 2 && (
                  <button
                    type="button"
                    onClick={() => removeOption(index)}
                    className="px-3 py-2 text-gray-400 hover:text-red-500 transition-colors"
                  >
                    &times;
                  </button>
                )}
              </div>
            ))}
          </div>
          {options.length < 10 && (
            <button
              type="button"
              onClick={addOption}
              className="mt-2 text-sm text-violet-600 hover:text-violet-700 font-medium"
            >
              + Add option
            </button>
          )}
        </div>

        {/* Actions */}
        <div className="flex gap-3 pt-2">
          <button
            type="submit"
            disabled={isSubmitting}
            className={cn(
              'px-6 py-2 rounded-lg text-sm font-medium transition-colors',
              isSubmitting
                ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                : 'bg-violet-600 text-white hover:bg-violet-700'
            )}
          >
            {isSubmitting ? 'Creating...' : 'Create Poll'}
          </button>
          <button
            type="button"
            onClick={() => setIsExpanded(false)}
            className="px-6 py-2 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-100 transition-colors"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  )
}
