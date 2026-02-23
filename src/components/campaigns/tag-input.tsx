'use client'

import React, { useState, useRef, useEffect } from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { X, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'

interface TagInputProps {
  campaignId: string
  onTagsChange?: (tags: TagItem[]) => void
  maxTags?: number
  disabled?: boolean
}

interface TagItem {
  name: string
  count: number
  addedBy: {
    id: string
    displayName: string
    avatar: string | null
    handle: string | null
  }
  addedAt: Date
}

export function TagInput({
  campaignId,
  onTagsChange,
  maxTags = 10,
  disabled = false,
}: TagInputProps) {
  const [tags, setTags] = useState<TagItem[]>([])
  const [inputValue, setInputValue] = useState('')
  const [suggestions, setSuggestions] = useState<Array<{ name: string; count: number }>>([])
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [loading, setLoading] = useState(false)
  const [adding, setAdding] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [initialLoading, setInitialLoading] = useState(true)
  const inputRef = useRef<HTMLInputElement>(null)
  const suggestionsRef = useRef<HTMLDivElement>(null)

  // Load existing tags on mount
  useEffect(() => {
    const loadTags = async () => {
      try {
        setInitialLoading(true)
        const response = await fetch(`/api/campaigns/${campaignId}/tags`)
        const result = await response.json()

        if (result.success && result.data) {
          setTags(result.data)
          onTagsChange?.(result.data)
        }
      } catch (error) {
        console.error('Failed to load tags:', error)
      } finally {
        setInitialLoading(false)
      }
    }

    loadTags()
  }, [campaignId, onTagsChange])

  // Fetch autocomplete suggestions
  useEffect(() => {
    if (!inputValue.trim()) {
      setSuggestions([])
      setShowSuggestions(false)
      return
    }

    const fetchSuggestions = async () => {
      try {
        setLoading(true)
        const response = await fetch(
          `/api/tags?q=${encodeURIComponent(inputValue.trim())}&limit=10`
        )
        const result = await response.json()

        if (result.success && result.data) {
          // Filter out already added tags
          const filtered = result.data.filter(
            (tag: any) => !tags.some((t) => t.name === tag.name)
          )
          setSuggestions(filtered)
          setShowSuggestions(true)
        }
      } catch (error) {
        console.error('Failed to fetch suggestions:', error)
      } finally {
        setLoading(false)
      }
    }

    const timer = setTimeout(fetchSuggestions, 300)
    return () => clearTimeout(timer)
  }, [inputValue, tags])

  // Handle click outside to close suggestions
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        suggestionsRef.current &&
        !suggestionsRef.current.contains(event.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(event.target as Node)
      ) {
        setShowSuggestions(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleAddTag = async (tagName?: string) => {
    const name = (tagName || inputValue).trim().toLowerCase()

    if (!name) {
      setError('Tag cannot be empty')
      return
    }

    if (name.length > 30) {
      setError('Tag must be less than 30 characters')
      return
    }

    if (tags.some((tag) => tag.name === name)) {
      setError('Tag already added')
      return
    }

    if (tags.length >= maxTags) {
      setError(`Maximum ${maxTags} tags allowed`)
      return
    }

    try {
      setAdding(true)
      setError(null)

      const response = await fetch(
        `/api/campaigns/${campaignId}/tags`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ tagName: name }),
        }
      )

      const result = await response.json()

      if (!response.ok) {
        setError(result.error || 'Failed to add tag')
        return
      }

      const newTag: TagItem = {
        name: result.data.name,
        count: result.data.count,
        addedBy: result.data.addedBy,
        addedAt: new Date(result.data.addedAt),
      }

      const updatedTags = [...tags, newTag]
      setTags(updatedTags)
      onTagsChange?.(updatedTags)
      setInputValue('')
      setShowSuggestions(false)
      setSuggestions([])
    } catch (error) {
      console.error('Failed to add tag:', error)
      setError('Failed to add tag')
    } finally {
      setAdding(false)
    }
  }

  const handleRemoveTag = (tagName: string) => {
    const updatedTags = tags.filter((tag) => tag.name !== tagName)
    setTags(updatedTags)
    onTagsChange?.(updatedTags)
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      handleAddTag()
    }
  }

  if (initialLoading) {
    return (
      <div className="flex items-center justify-center py-4">
        <Loader2 className="w-5 h-5 animate-spin text-gray-400" />
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Input field with suggestions */}
      <div className="relative">
        <div className="flex gap-2">
          <div className="flex-1 relative">
            <Input
              ref={inputRef}
              type="text"
              placeholder="Add a tag..."
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyDown}
              onFocus={() => inputValue && setShowSuggestions(true)}
              disabled={disabled || adding || tags.length >= maxTags}
              className="w-full"
            />

            {/* Suggestions Dropdown */}
            {showSuggestions && suggestions.length > 0 && (
              <div
                ref={suggestionsRef}
                className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-10 max-h-64 overflow-y-auto"
              >
                {loading ? (
                  <div className="p-3 text-center text-gray-500">
                    <Loader2 className="w-4 h-4 animate-spin inline" />
                  </div>
                ) : (
                  suggestions.map((suggestion) => (
                    <button
                      key={suggestion.name}
                      onClick={() => handleAddTag(suggestion.name)}
                      className="w-full text-left px-3 py-2 hover:bg-gray-100 transition-colors text-sm border-b border-gray-100 last:border-b-0"
                      type="button"
                    >
                      <div className="flex justify-between items-center">
                        <span className="font-medium text-gray-900">
                          {suggestion.name}
                        </span>
                        <span className="text-xs text-gray-500">
                          {suggestion.count}
                        </span>
                      </div>
                    </button>
                  ))
                )}
              </div>
            )}
          </div>

          <Button
            onClick={() => handleAddTag()}
            disabled={
              disabled ||
              adding ||
              !inputValue.trim() ||
              tags.length >= maxTags
            }
            className="bg-violet-600 hover:bg-violet-700 text-white"
          >
            {adding ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              'Add'
            )}
          </Button>
        </div>

        {error && (
          <p className="mt-1 text-sm text-red-600">{error}</p>
        )}
      </div>

      {/* Tags Display */}
      {tags.length > 0 && (
        <div className="space-y-2">
          <div className="flex flex-wrap gap-2">
            {tags.map((tag) => (
              <div
                key={tag.name}
                className="inline-flex items-center gap-2 px-3 py-1 bg-violet-50 border border-violet-200 rounded-full"
              >
                <span className="text-sm font-medium text-violet-900">
                  {tag.name}
                </span>
                <button
                  onClick={() => handleRemoveTag(tag.name)}
                  disabled={disabled}
                  className={cn(
                    'p-0.5 rounded-full hover:bg-violet-100 transition-colors',
                    disabled && 'opacity-50 cursor-not-allowed'
                  )}
                  type="button"
                  aria-label={`Remove tag ${tag.name}`}
                >
                  <X className="w-3 h-3 text-violet-600" />
                </button>
              </div>
            ))}
          </div>

          <p className="text-xs text-gray-500">
            {tags.length} of {maxTags} tags
          </p>
        </div>
      )}
    </div>
  )
}
