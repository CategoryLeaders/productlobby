'use client'

import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { useToast } from '@/components/ui/toast'

interface UpdateCreationFormProps {
  campaignId: string
  onUpdatePublished: () => void
}

function cn(...classes: (string | undefined | false)[]) {
  return classes.filter(Boolean).join(' ')
}

export function UpdateCreationForm({
  campaignId,
  onUpdatePublished,
}: UpdateCreationFormProps) {
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errors, setErrors] = useState<{ title?: string; content?: string }>({})
  const { addToast } = useToast()

  const validateForm = () => {
    const newErrors: { title?: string; content?: string } = {}

    if (!title.trim()) {
      newErrors.title = 'Title is required'
    }
    if (!content.trim()) {
      newErrors.content = 'Content is required'
    }
    if (title.length > 200) {
      newErrors.title = 'Title must be less than 200 characters'
    }
    if (content.length > 5000) {
      newErrors.content = 'Content must be less than 5000 characters'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    try {
      setIsSubmitting(true)

      const response = await fetch(`/api/campaigns/${campaignId}/updates`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title,
          content,
          updateType: 'UPDATE',
          notifySubscribers: true,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to publish update')
      }

      addToast('Update published successfully!', 'success')

      setTitle('')
      setContent('')
      setErrors({})
      onUpdatePublished()
    } catch (error) {
      console.error('Error publishing update:', error)
      addToast(
        error instanceof Error ? error.message : 'Failed to publish update',
        'error'
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6 mb-8">
      <h3 className="font-display font-semibold text-lg text-foreground mb-6">
        Share an Update
      </h3>

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Title Input */}
        <div>
          <label
            htmlFor="title"
            className="block text-sm font-medium text-foreground mb-2"
          >
            Title
          </label>
          <input
            id="title"
            type="text"
            maxLength={200}
            value={title}
            onChange={(e) => {
              setTitle(e.target.value)
              if (errors.title) {
                setErrors({ ...errors, title: undefined })
              }
            }}
            placeholder="What's your update about?"
            className={cn(
              'w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-0 transition-all',
              errors.title
                ? 'border-red-500 focus:ring-red-500'
                : 'border-gray-200 focus:ring-violet-500'
            )}
          />
          <div className="flex justify-between items-start mt-2">
            {errors.title && (
              <p className="text-sm text-red-600">{errors.title}</p>
            )}
            <p className={cn('text-xs ml-auto', title.length > 180 ? 'text-orange-600' : 'text-gray-500')}>
              {title.length}/200
            </p>
          </div>
        </div>

        {/* Content Textarea */}
        <div>
          <label
            htmlFor="content"
            className="block text-sm font-medium text-foreground mb-2"
          >
            Update Content
          </label>
          <textarea
            id="content"
            maxLength={5000}
            value={content}
            onChange={(e) => {
              setContent(e.target.value)
              if (errors.content) {
                setErrors({ ...errors, content: undefined })
              }
            }}
            placeholder="Share your update with the community..."
            rows={6}
            className={cn(
              'w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-0 transition-all resize-none',
              errors.content
                ? 'border-red-500 focus:ring-red-500'
                : 'border-gray-200 focus:ring-violet-500'
            )}
          />
          <div className="flex justify-between items-start mt-2">
            {errors.content && (
              <p className="text-sm text-red-600">{errors.content}</p>
            )}
            <p className={cn('text-xs ml-auto', content.length > 4500 ? 'text-orange-600' : 'text-gray-500')}>
              {content.length}/5000
            </p>
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex justify-end pt-4">
          <Button
            type="submit"
            disabled={isSubmitting || !title.trim() || !content.trim()}
            className="bg-violet-600 hover:bg-violet-700 text-white px-6 py-2"
          >
            {isSubmitting ? 'Publishing...' : 'Publish Update'}
          </Button>
        </div>
      </form>
    </div>
  )
}
