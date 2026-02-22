'use client'

import React, { useState, useRef, useEffect, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { useToast } from '@/components/ui/toast'

interface UpdateCreationFormProps {
  campaignId: string
  onUpdatePublished: () => void
}

interface Supporter {
  id: string
  displayName: string
  handle: string | null
  avatar: string | null
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

  // @mention state
  const [showMentionDropdown, setShowMentionDropdown] = useState(false)
  const [mentionSearch, setMentionSearch] = useState('')
  const [mentionResults, setMentionResults] = useState<Supporter[]>([])
  const [mentionLoading, setMentionLoading] = useState(false)
  const [mentionIndex, setMentionIndex] = useState(0)
  const [cursorPosition, setCursorPosition] = useState(0)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const dropdownRef = useRef<HTMLDivElement>(null)

  // Debounced search for supporters
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  const searchSupporters = useCallback(async (query: string) => {
    if (query.length === 0) {
      // Show recent supporters when @ is typed with no query
      setMentionLoading(true)
      try {
        const res = await fetch(`/api/campaigns/${campaignId}/supporters?limit=5`)
        if (res.ok) {
          const data = await res.json()
          setMentionResults(data.success ? data.data : [])
        }
      } catch {
        setMentionResults([])
      }
      setMentionLoading(false)
      return
    }

    setMentionLoading(true)
    try {
      const res = await fetch(`/api/campaigns/${campaignId}/supporters?search=${encodeURIComponent(query)}&limit=5`)
      if (res.ok) {
        const data = await res.json()
        setMentionResults(data.success ? data.data : [])
      }
    } catch {
      setMentionResults([])
    }
    setMentionLoading(false)
  }, [campaignId])

  const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newContent = e.target.value
    const cursor = e.target.selectionStart || 0
    setContent(newContent)
    setCursorPosition(cursor)

    if (errors.content) {
      setErrors({ ...errors, content: undefined })
    }

    // Check if we're in an @mention context
    const textBeforeCursor = newContent.slice(0, cursor)
    const atIndex = textBeforeCursor.lastIndexOf('@')

    if (atIndex >= 0) {
      const charBefore = atIndex > 0 ? textBeforeCursor[atIndex - 1] : ' '
      const textAfterAt = textBeforeCursor.slice(atIndex + 1)

      // Only trigger if @ is at start or preceded by whitespace, and no spaces in search
      if ((charBefore === ' ' || charBefore === '\n' || atIndex === 0) && !textAfterAt.includes(' ')) {
        setShowMentionDropdown(true)
        setMentionSearch(textAfterAt)
        setMentionIndex(0)

        // Debounce the search
        if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current)
        searchTimeoutRef.current = setTimeout(() => {
          searchSupporters(textAfterAt)
        }, 200)
        return
      }
    }

    setShowMentionDropdown(false)
  }

  const insertMention = (supporter: Supporter) => {
    const handle = supporter.handle || supporter.displayName.replace(/\s+/g, '')
    const textBeforeCursor = content.slice(0, cursorPosition)
    const atIndex = textBeforeCursor.lastIndexOf('@')
    const textAfterCursor = content.slice(cursorPosition)

    const newContent = content.slice(0, atIndex) + `@${handle} ` + textAfterCursor
    setContent(newContent)
    setShowMentionDropdown(false)

    // Refocus textarea
    setTimeout(() => {
      if (textareaRef.current) {
        const newCursorPos = atIndex + handle.length + 2 // +2 for @ and space
        textareaRef.current.focus()
        textareaRef.current.setSelectionRange(newCursorPos, newCursorPos)
      }
    }, 0)
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (!showMentionDropdown || mentionResults.length === 0) return

    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setMentionIndex((prev) => Math.min(prev + 1, mentionResults.length - 1))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setMentionIndex((prev) => Math.max(prev - 1, 0))
    } else if (e.key === 'Enter' && showMentionDropdown) {
      e.preventDefault()
      insertMention(mentionResults[mentionIndex])
    } else if (e.key === 'Escape') {
      setShowMentionDropdown(false)
    }
  }

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setShowMentionDropdown(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const validateForm = () => {
    const newErrors: { title?: string; content?: string } = {}
    if (!title.trim()) newErrors.title = 'Title is required'
    if (!content.trim()) newErrors.content = 'Content is required'
    if (title.length > 200) newErrors.title = 'Title must be less than 200 characters'
    if (content.length > 5000) newErrors.content = 'Content must be less than 5000 characters'
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!validateForm()) return

    try {
      setIsSubmitting(true)
      const response = await fetch(`/api/campaigns/${campaignId}/updates`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
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
          <label htmlFor="title" className="block text-sm font-medium text-foreground mb-2">
            Title
          </label>
          <input
            id="title"
            type="text"
            maxLength={200}
            value={title}
            onChange={(e) => {
              setTitle(e.target.value)
              if (errors.title) setErrors({ ...errors, title: undefined })
            }}
            placeholder="What's your update about?"
            className={cn(
              'w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-0 transition-all',
              errors.title ? 'border-red-500 focus:ring-red-500' : 'border-gray-200 focus:ring-violet-500'
            )}
          />
          <div className="flex justify-between items-start mt-2">
            {errors.title && <p className="text-sm text-red-600">{errors.title}</p>}
            <p className={cn('text-xs ml-auto', title.length > 180 ? 'text-orange-600' : 'text-gray-500')}>
              {title.length}/200
            </p>
          </div>
        </div>

        {/* Content Textarea with @mention support */}
        <div className="relative">
          <label htmlFor="content" className="block text-sm font-medium text-foreground mb-2">
            Update Content
            <span className="text-xs text-gray-400 ml-2 font-normal">Type @ to mention supporters</span>
          </label>
          <textarea
            ref={textareaRef}
            id="content"
            maxLength={5000}
            value={content}
            onChange={handleContentChange}
            onKeyDown={handleKeyDown}
            placeholder="Share your update with the community... Use @name to mention supporters"
            rows={6}
            className={cn(
              'w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-0 transition-all resize-none',
              errors.content ? 'border-red-500 focus:ring-red-500' : 'border-gray-200 focus:ring-violet-500'
            )}
          />

          {/* @mention Dropdown */}
          {showMentionDropdown && (
            <div
              ref={dropdownRef}
              className="absolute z-50 left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-48 overflow-y-auto"
            >
              {mentionLoading ? (
                <div className="px-4 py-3 text-sm text-gray-500">Searching supporters...</div>
              ) : mentionResults.length === 0 ? (
                <div className="px-4 py-3 text-sm text-gray-500">No matching supporters</div>
              ) : (
                mentionResults.map((supporter, index) => (
                  <button
                    key={supporter.id}
                    type="button"
                    onClick={() => insertMention(supporter)}
                    className={cn(
                      'w-full flex items-center gap-3 px-4 py-2 text-left hover:bg-violet-50 transition-colors',
                      index === mentionIndex && 'bg-violet-50'
                    )}
                  >
                    {supporter.avatar ? (
                      <img
                        src={supporter.avatar}
                        alt={supporter.displayName}
                        className="w-8 h-8 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-violet-100 flex items-center justify-center text-sm font-medium text-violet-700">
                        {supporter.displayName.charAt(0).toUpperCase()}
                      </div>
                    )}
                    <div>
                      <p className="text-sm font-medium text-foreground">{supporter.displayName}</p>
                      {supporter.handle && (
                        <p className="text-xs text-gray-500">@{supporter.handle}</p>
                      )}
                    </div>
                  </button>
                ))
              )}
            </div>
          )}

          <div className="flex justify-between items-start mt-2">
            {errors.content && <p className="text-sm text-red-600">{errors.content}</p>}
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
