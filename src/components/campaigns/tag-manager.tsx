'use client'

import React, { useState, useRef, useEffect } from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Tag, X, Plus, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'

interface TagManagerProps {
  campaignId: string
  creatorId: string
  currentUserId?: string
  onTagsChange?: (tags: TagData[]) => void
  maxTags?: number
  disabled?: boolean
}

interface TagData {
  name: string
  count: number
  addedBy: {
    id: string
    displayName: string
    avatar: string | null
    handle: string | null
  }
  addedAt: string
}

const COMMON_TAGS = [
  'innovative',
  'sustainability',
  'community-driven',
  'affordable',
  'eco-friendly',
  'inclusive',
  'transparent',
  'user-focused',
  'quality',
  'reliable',
]

export function TagManager({
  campaignId,
  creatorId,
  currentUserId,
  onTagsChange,
  maxTags = 10,
  disabled = false,
}: TagManagerProps) {
  const [tags, setTags] = useState<TagData[]>([])
  const [inputValue, setInputValue] = useState('')
  const [suggestions, setSuggestions] = useState<string[]>([])
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [loading, setLoading] = useState(false)
  const [adding, setAdding] = useState(false)
  const [removing, setRemoving] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [initialLoading, setInitialLoading] = useState(true)
  const inputRef = useRef<HTMLInputElement>(null)
  const suggestionsRef = useRef<HTMLDivElement>(null)

  const isCreator = currentUserId === creatorId

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
    if (!inputValue.trim() || !isCreator) {
      setSuggestions([])
      setShowSuggestions(false)
      return
    }

    const fetchSuggestions = async () => {
      try {
        setLoading(true)
        const query = inputValue.trim().toLowerCase()

        // Filter common tags and already added tags
        const filtered = COMMON_TAGS.filter(
          (tag) =>
            tag.includes(query) &&
            !tags.some((t) => t.name === tag)
        )

        setSuggestions(filtered)
        setShowSuggestions(filtered.length > 0)
      } catch (error) {
        console.error('Failed to fetch suggestions:', error)
      } finally {
        setLoading(false)
      }
    }

    const timer = setTimeout(fetchSuggestions, 200)
    return () => clearTimeout(timer)
  }, [inputValue, tags, isCreator])

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
    if (!isCreator) {
      setError('Only the campaign creator can add tags')
      return
    }

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

      const newTag: TagData = {
        name: result.data.name,
        count: result.data.count,
        addedBy: result.data.addedBy,
        addedAt: result.data.addedAt,
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

  const handleRemoveTag = async (tagName: string) => {
    if (!isCreator) {
      setError('Only the campaign creator can remove tags')
      return
    }

    try {
      setRemoving(tagName)
      setError(null)

      const response = await fetch(
        `/api/campaigns/${campaignId}/tags`,
        {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ tagName }),
        }
      )

      const result = await response.json()

      if (!response.ok) {
        setError(result.error || 'Failed to remove tag')
        setRemoving(null)
        return
      }

      const updatedTags = tags.filter((tag) => tag.name !== tagName)
      setTags(updatedTags)
      onTagsChange?.(updatedTags)
    } catch (error) {
      console.error('Failed to remove tag:', error)
      setError('Failed to remove tag')
    } finally {
      setRemoving(null)
    }
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
      {/* Input field with suggestions - only for creator */}
      {isCreator && (
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
                        key={suggestion}
                        onClick={() => handleAddTag(suggestion)}
                        className="w-full text-left px-3 py-2 hover:bg-violet-50 transition-colors text-sm border-b border-gray-100 last:border-b-0"
                        type="button"
                      >
                        <div className="flex items-center gap-2">
                          <Tag className="w-3 h-3 text-violet-600" />
                          <span className="font-medium text-gray-900">
                            {suggestion}
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
              className="bg-violet-600 hover:bg-violet-700 text-white gap-2"
            >
              {adding ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  <Plus className="w-4 h-4" />
                  <span>Add</span>
                </>
              )}
            </Button>
          </div>

          {error && (
            <p className="mt-1 text-sm text-red-600">{error}</p>
          )}
        </div>
      )}

      {/* Tags Display */}
      <div className="space-y-3">
        {tags.length > 0 ? (
          <>
            <div className="flex flex-wrap gap-2">
              {tags.map((tag) => (
                <div
                  key={tag.name}
                  className="inline-flex items-center gap-2 px-3 py-2 bg-gradient-to-r from-violet-50 to-lime-50 border border-violet-200 rounded-full shadow-sm hover:shadow-md transition-shadow"
                >
                  <Tag className="w-3.5 h-3.5 text-violet-600" />
                  <span className="text-sm font-medium text-violet-900">
                    {tag.name}
                  </span>
                  {tag.count > 1 && (
                    <span className="text-xs text-lime-700 bg-lime-100 px-2 py-0.5 rounded-full">
                      {tag.count}
                    </span>
                  )}
                  {isCreator && (
                    <button
                      onClick={() => handleRemoveTag(tag.name)}
                      disabled={disabled || removing === tag.name}
                      className={cn(
                        'p-0.5 rounded-full hover:bg-violet-200 transition-colors ml-1',
                        (disabled || removing === tag.name) && 'opacity-50 cursor-not-allowed'
                      )}
                      type="button"
                      aria-label={`Remove tag ${tag.name}`}
                    >
                      {removing === tag.name ? (
                        <Loader2 className="w-3 h-3 animate-spin text-violet-600" />
                      ) : (
                        <X className="w-3 h-3 text-violet-600" />
                      )}
                    </button>
                  )}
                </div>
              ))}
            </div>

            {isCreator && (
              <p className="text-xs text-gray-500">
                {tags.length} of {maxTags} tags
              </p>
            )}
          </>
        ) : (
          <div className="flex items-center gap-2 text-gray-400 text-sm py-4">
            <Tag className="w-4 h-4" />
            <span>
              {isCreator
                ? 'No tags yet. Add one to describe this campaign.'
                : 'No tags added for this campaign yet.'}
            </span>
          </div>
        )}
      </div>
    </div>
  )
}
