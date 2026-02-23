'use client'

import React, { useState, useEffect, useRef, useCallback } from 'react'
import { X, Plus, Tag, Search, Loader2, Zap, TrendingUp } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

// Preset colors for tags
const TAG_COLORS = [
  { name: 'blue', bg: 'bg-blue-100', text: 'text-blue-700', border: 'border-blue-300', dot: 'bg-blue-500' },
  { name: 'purple', bg: 'bg-purple-100', text: 'text-purple-700', border: 'border-purple-300', dot: 'bg-purple-500' },
  { name: 'pink', bg: 'bg-pink-100', text: 'text-pink-700', border: 'border-pink-300', dot: 'bg-pink-500' },
  { name: 'green', bg: 'bg-green-100', text: 'text-green-700', border: 'border-green-300', dot: 'bg-green-500' },
  { name: 'orange', bg: 'bg-orange-100', text: 'text-orange-700', border: 'border-orange-300', dot: 'bg-orange-500' },
  { name: 'red', bg: 'bg-red-100', text: 'text-red-700', border: 'border-red-300', dot: 'bg-red-500' },
  { name: 'yellow', bg: 'bg-yellow-100', text: 'text-yellow-700', border: 'border-yellow-300', dot: 'bg-yellow-500' },
  { name: 'indigo', bg: 'bg-indigo-100', text: 'text-indigo-700', border: 'border-indigo-300', dot: 'bg-indigo-500' },
]

interface TagData {
  id: string
  name: string
  color: string
  count: number
  createdAt: string
}

interface TagManagerProps {
  campaignId: string
  campaignTitle?: string
  onTagsChange?: (tags: TagData[]) => void
  readOnly?: boolean
}

export const TagManager: React.FC<TagManagerProps> = ({
  campaignId,
  campaignTitle = '',
  onTagsChange,
  readOnly = false,
}) => {
  const [tags, setTags] = useState<TagData[]>([])
  const [popularTags, setPopularTags] = useState<TagData[]>([])
  const [suggestions, setSuggestions] = useState<string[]>([])
  const [newTag, setNewTag] = useState('')
  const [selectedColor, setSelectedColor] = useState(TAG_COLORS[0].name)
  const [searchTerm, setSearchTerm] = useState('')
  const [loading, setLoading] = useState(true)
  const [adding, setAdding] = useState(false)
  const [removing, setRemoving] = useState<string | null>(null)
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [showColorPicker, setShowColorPicker] = useState(false)
  const searchInputRef = useRef<HTMLInputElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  // Fetch tags and suggestions on mount
  useEffect(() => {
    fetchTags()
    generateSuggestions()
  }, [campaignId])

  const fetchTags = useCallback(async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/campaigns/${campaignId}/tags`)
      if (response.ok) {
        const data = await response.json()
        setTags(data.tags || [])
        setPopularTags(data.popularTags || [])
        onTagsChange?.(data.tags || [])
      }
    } catch (error) {
      console.error('Error fetching tags:', error)
    } finally {
      setLoading(false)
    }
  }, [campaignId, onTagsChange])

  const generateSuggestions = useCallback(async () => {
    try {
      // Generate suggestions based on campaign content
      const baseTagSuggestions = [
        'Innovation',
        'Design',
        'Feature Request',
        'Community',
        'Sustainability',
        'Performance',
        'Security',
        'Accessibility',
        'User Experience',
        'Mobile-Friendly',
        'AI-Powered',
        'Open Source',
      ]

      // Filter out already added tags
      const existingTagNames = tags.map((t) => t.name.toLowerCase())
      const filtered = baseTagSuggestions.filter(
        (s) => !existingTagNames.includes(s.toLowerCase())
      )

      setSuggestions(filtered.slice(0, 6))
    } catch (error) {
      console.error('Error generating suggestions:', error)
    }
  }, [tags])

  // Regenerate suggestions when tags change
  useEffect(() => {
    generateSuggestions()
  }, [generateSuggestions])

  const addTag = useCallback(
    async (tagName: string, tagColor: string = selectedColor) => {
      if (!tagName.trim()) return
      if (tags.length >= 20) {
        alert('Maximum 20 tags per campaign')
        return
      }

      try {
        setAdding(true)
        const response = await fetch(`/api/campaigns/${campaignId}/tags`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name: tagName.trim(), color: tagColor }),
        })

        if (response.ok) {
          const data = await response.json()
          setTags(data.tags || [])
          setNewTag('')
          onTagsChange?.(data.tags || [])
          setShowSuggestions(false)
        } else if (response.status === 400) {
          const error = await response.json()
          if (error.message?.includes('already exists')) {
            alert('This tag already exists for this campaign')
          }
        }
      } catch (error) {
        console.error('Error adding tag:', error)
      } finally {
        setAdding(false)
      }
    },
    [campaignId, tags.length, selectedColor, onTagsChange]
  )

  const removeTag = useCallback(
    async (tagId: string) => {
      try {
        setRemoving(tagId)
        const response = await fetch(`/api/campaigns/${campaignId}/tags`, {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ tagId }),
        })

        if (response.ok) {
          const data = await response.json()
          setTags(data.tags || [])
          onTagsChange?.(data.tags || [])
        }
      } catch (error) {
        console.error('Error removing tag:', error)
      } finally {
        setRemoving(null)
      }
    },
    [campaignId, onTagsChange]
  )

  const getColorClasses = (colorName: string) => {
    return TAG_COLORS.find((c) => c.name === colorName) || TAG_COLORS[0]
  }

  const filteredTags = tags.filter((tag) =>
    tag.name.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const getTagSize = (count: number, maxCount: number) => {
    if (count === 0) return 'text-sm'
    const ratio = count / maxCount
    if (ratio < 0.2) return 'text-sm'
    if (ratio < 0.5) return 'text-base'
    if (ratio < 0.8) return 'text-lg'
    return 'text-xl'
  }

  const maxTagCount =
    tags.length > 0 ? Math.max(...tags.map((t) => t.count || 0)) : 1

  // Handle click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setShowSuggestions(false)
        setShowColorPicker(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  return (
    <div ref={containerRef} className="w-full space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Tag className="w-5 h-5 text-blue-600" />
          <h3 className="text-lg font-semibold">Campaign Tags</h3>
          <span className="px-2 py-1 text-xs font-medium bg-gray-100 text-gray-700 rounded-full">
            {tags.length}/20
          </span>
        </div>
      </div>

      {/* Add Tag Form */}
      {!readOnly && (
        <div className="space-y-3 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200">
          <label className="block text-sm font-medium text-gray-700">
            Add New Tag
          </label>
          <div className="flex gap-2">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                ref={searchInputRef}
                type="text"
                placeholder="Enter tag name..."
                value={newTag}
                onChange={(e) => {
                  setNewTag(e.target.value)
                  setShowSuggestions(e.target.value.length > 0)
                }}
                onFocus={() => newTag.length > 0 && setShowSuggestions(true)}
                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />

              {/* Tag Suggestions Dropdown */}
              {showSuggestions && newTag.length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-10 max-h-48 overflow-y-auto">
                  {suggestions
                    .filter((s) =>
                      s.toLowerCase().includes(newTag.toLowerCase())
                    )
                    .map((suggestion) => (
                      <button
                        key={suggestion}
                        onClick={() => {
                          setNewTag(suggestion)
                          setShowSuggestions(false)
                        }}
                        className="w-full text-left px-3 py-2 hover:bg-gray-50 text-sm text-gray-700"
                      >
                        {suggestion}
                      </button>
                    ))}
                </div>
              )}
            </div>

            {/* Color Picker */}
            <div className="relative">
              <button
                onClick={() => setShowColorPicker(!showColorPicker)}
                className="px-3 py-2 border border-gray-300 rounded-lg bg-white hover:bg-gray-50 flex items-center gap-2"
              >
                <div
                  className={cn(
                    'w-4 h-4 rounded-full',
                    getColorClasses(selectedColor).dot
                  )}
                />
              </button>

              {showColorPicker && (
                <div className="absolute top-full right-0 mt-1 p-3 bg-white border border-gray-200 rounded-lg shadow-lg z-10 grid grid-cols-4 gap-2">
                  {TAG_COLORS.map((color) => (
                    <button
                      key={color.name}
                      onClick={() => {
                        setSelectedColor(color.name)
                        setShowColorPicker(false)
                      }}
                      className={cn(
                        'w-6 h-6 rounded-full border-2 transition-all',
                        selectedColor === color.name
                          ? 'border-gray-800 scale-110'
                          : 'border-transparent hover:scale-105',
                        color.dot
                      )}
                    />
                  ))}
                </div>
              )}
            </div>

            {/* Add Button */}
            <Button
              onClick={() => addTag(newTag, selectedColor)}
              disabled={!newTag.trim() || adding || tags.length >= 20}
              size="sm"
              className="gap-2"
            >
              {adding ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Plus className="w-4 h-4" />
              )}
              Add
            </Button>
          </div>
        </div>
      )}

      {/* Current Tags */}
      {loading ? (
        <div className="flex items-center justify-center py-8">
          <Loader2 className="w-5 h-5 animate-spin text-blue-600" />
        </div>
      ) : filteredTags.length > 0 ? (
        <div className="space-y-3">
          <label className="text-sm font-medium text-gray-700">
            Current Tags ({filteredTags.length})
          </label>
          <div className="flex flex-wrap gap-2">
            {filteredTags.map((tag) => {
              const colorClasses = getColorClasses(tag.color)
              const size = getTagSize(tag.count || 0, maxTagCount)
              return (
                <div
                  key={tag.id}
                  className={cn(
                    'inline-flex items-center gap-2 px-3 py-2 rounded-lg border transition-all',
                    colorClasses.bg,
                    colorClasses.text,
                    colorClasses.border,
                    size
                  )}
                >
                  <div className={cn('w-2 h-2 rounded-full', colorClasses.dot)} />
                  <span className="font-medium">{tag.name}</span>
                  <span className="text-xs opacity-75">({tag.count})</span>
                  {!readOnly && (
                    <button
                      onClick={() => removeTag(tag.id)}
                      disabled={removing === tag.id}
                      className="ml-1 p-0.5 hover:bg-white/50 rounded transition-colors"
                    >
                      {removing === tag.id ? (
                        <Loader2 className="w-3 h-3 animate-spin" />
                      ) : (
                        <X className="w-3 h-3" />
                      )}
                    </button>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      ) : (
        <div className="p-4 text-center bg-gray-50 rounded-lg border border-gray-200">
          <Tag className="w-8 h-8 text-gray-400 mx-auto mb-2" />
          <p className="text-gray-600">No tags yet. Add your first tag above!</p>
        </div>
      )}

      {/* Tag Cloud - Popular Tags */}
      {!readOnly && popularTags.length > 0 && (
        <div className="space-y-3 p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg border border-purple-200">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-purple-600" />
            <h4 className="font-semibold text-gray-800">Popular Tags</h4>
          </div>
          <div className="flex flex-wrap gap-2">
            {popularTags.slice(0, 8).map((tag) => {
              const colorClasses = getColorClasses(tag.color)
              const size = getTagSize(tag.count || 0, Math.max(...popularTags.map((t) => t.count || 0)))
              return (
                <button
                  key={tag.id}
                  onClick={() => {
                    if (!tags.some((t) => t.id === tag.id)) {
                      setNewTag(tag.name)
                      setSelectedColor(tag.color)
                    }
                  }}
                  className={cn(
                    'inline-flex items-center gap-1 px-3 py-2 rounded-full border transition-all hover:scale-105 cursor-pointer',
                    colorClasses.bg,
                    colorClasses.text,
                    colorClasses.border,
                    size
                  )}
                >
                  <div className={cn('w-1.5 h-1.5 rounded-full', colorClasses.dot)} />
                  <span className="font-medium">{tag.name}</span>
                </button>
              )
            })}
          </div>
        </div>
      )}

      {/* Filter by Tag - Tag Cloud Visualization */}
      {tags.length > 0 && (
        <div className="space-y-3 p-4 bg-gray-50 rounded-lg border border-gray-200">
          <div className="flex items-center gap-2">
            <Zap className="w-5 h-5 text-amber-600" />
            <h4 className="font-semibold text-gray-800">Tag Cloud</h4>
          </div>
          <div className="flex flex-wrap gap-3 items-center">
            {tags.map((tag) => {
              const colorClasses = getColorClasses(tag.color)
              const size = getTagSize(tag.count || 0, maxTagCount)
              return (
                <span
                  key={tag.id}
                  className={cn(
                    'px-3 py-1 rounded-full border cursor-default transition-all',
                    colorClasses.bg,
                    colorClasses.text,
                    colorClasses.border,
                    size,
                    'font-medium'
                  )}
                >
                  {tag.name}
                </span>
              )
            })}
          </div>
        </div>
      )}

      {/* Tag Search */}
      {tags.length > 3 && (
        <div className="space-y-3 p-4 bg-gray-50 rounded-lg border border-gray-200">
          <label className="block text-sm font-medium text-gray-700">
            Search Tags
          </label>
          <input
            type="text"
            placeholder="Search tags..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      )}
    </div>
  )
}

export default TagManager
