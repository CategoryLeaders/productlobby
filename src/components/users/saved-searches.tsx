'use client'

import React, { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Loader2, Trash2, Search, Save } from 'lucide-react'
import { cn } from '@/lib/utils'
import { formatRelativeTime } from '@/lib/utils'

interface SavedSearch {
  id: string
  query: string
  filters: Record<string, any>
  label: string
  createdAt: string
}

interface SavedSearchesProps {
  campaignId: string
  onSearch?: (query: string, filters: Record<string, any>) => void
  className?: string
}

export function SavedSearches({
  campaignId,
  onSearch,
  className,
}: SavedSearchesProps) {
  const [savedSearches, setSavedSearches] = useState<SavedSearch[]>([])
  const [loading, setLoading] = useState(false)
  const [deleting, setDeleting] = useState<string | null>(null)

  // New search form state
  const [searchQuery, setSearchQuery] = useState('')
  const [showSaveForm, setShowSaveForm] = useState(false)
  const [saveLabel, setSaveLabel] = useState('')
  const [saving, setSaving] = useState(false)

  // Load saved searches on mount
  useEffect(() => {
    fetchSavedSearches()
  }, [campaignId])

  const fetchSavedSearches = async () => {
    try {
      setLoading(true)
      const response = await fetch(
        `/api/users/saved-searches?campaignId=${campaignId}`
      )

      if (!response.ok) {
        throw new Error('Failed to fetch saved searches')
      }

      const data = await response.json()
      setSavedSearches(data.data || [])
    } catch (error) {
      console.error('Error fetching saved searches:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSaveSearch = async () => {
    if (!searchQuery.trim()) {
      alert('Please enter a search query')
      return
    }

    try {
      setSaving(true)
      const response = await fetch(
        `/api/users/saved-searches?campaignId=${campaignId}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            query: searchQuery.trim(),
            filters: {},
            label: saveLabel || searchQuery.trim(),
          }),
        }
      )

      if (!response.ok) {
        throw new Error('Failed to save search')
      }

      const data = await response.json()

      // Add to list
      setSavedSearches([data.data, ...savedSearches])

      // Reset form
      setSearchQuery('')
      setSaveLabel('')
      setShowSaveForm(false)
    } catch (error) {
      console.error('Error saving search:', error)
      alert('Failed to save search. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  const handleDeleteSearch = async (id: string) => {
    if (!confirm('Are you sure you want to delete this saved search?')) {
      return
    }

    try {
      setDeleting(id)
      const response = await fetch(
        `/api/users/saved-searches?id=${id}`,
        { method: 'DELETE' }
      )

      if (!response.ok) {
        throw new Error('Failed to delete search')
      }

      // Remove from list
      setSavedSearches(savedSearches.filter((s) => s.id !== id))
    } catch (error) {
      console.error('Error deleting search:', error)
      alert('Failed to delete search. Please try again.')
    } finally {
      setDeleting(null)
    }
  }

  const handleRunSearch = (search: SavedSearch) => {
    setSearchQuery(search.query)
    if (onSearch) {
      onSearch(search.query, search.filters)
    }
  }

  return (
    <div className={cn('space-y-4', className)}>
      {/* Save Current Search Form */}
      <div className="rounded-lg border border-gray-200 bg-white p-4">
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-gray-900">Save Search</h3>
            {!showSaveForm && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowSaveForm(!showSaveForm)}
                className="gap-2"
              >
                <Save className="h-4 w-4" />
                Quick Save
              </Button>
            )}
          </div>

          {showSaveForm && (
            <div className="space-y-3 border-t border-gray-200 pt-3">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Search Query
                </label>
                <Input
                  type="text"
                  placeholder="Enter search query..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="mt-1"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Label (Optional)
                </label>
                <Input
                  type="text"
                  placeholder="Give this search a name..."
                  value={saveLabel}
                  onChange={(e) => setSaveLabel(e.target.value)}
                  className="mt-1"
                />
              </div>

              <div className="flex gap-2">
                <Button
                  size="sm"
                  onClick={handleSaveSearch}
                  disabled={saving || !searchQuery.trim()}
                  className="gap-2"
                >
                  {saving && <Loader2 className="h-4 w-4 animate-spin" />}
                  Save Search
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setShowSaveForm(false)
                    setSearchQuery('')
                    setSaveLabel('')
                  }}
                >
                  Cancel
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Saved Searches List */}
      <div className="space-y-2">
        <h3 className="font-semibold text-gray-900">Your Saved Searches</h3>

        {loading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-5 w-5 animate-spin text-gray-400" />
          </div>
        ) : savedSearches.length === 0 ? (
          <div className="rounded-lg border border-dashed border-gray-300 bg-gray-50 px-4 py-8 text-center">
            <Search className="mx-auto h-8 w-8 text-gray-400" />
            <p className="mt-2 text-sm text-gray-600">
              No saved searches yet
            </p>
            <p className="text-xs text-gray-500">
              Save searches to quickly access them later
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {savedSearches.map((search) => (
              <div
                key={search.id}
                className="flex items-center justify-between rounded-lg border border-gray-200 bg-white px-4 py-3 hover:bg-gray-50"
              >
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-900 truncate">
                    {search.label}
                  </p>
                  <p className="text-xs text-gray-500 truncate">
                    "{search.query}"
                  </p>
                  <p className="text-xs text-gray-400 mt-1">
                    {formatRelativeTime(new Date(search.createdAt))}
                  </p>
                </div>

                <div className="flex items-center gap-2 ml-2 flex-shrink-0">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleRunSearch(search)}
                    className="gap-2"
                  >
                    <Search className="h-4 w-4" />
                    Run
                  </Button>

                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDeleteSearch(search.id)}
                    disabled={deleting === search.id}
                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                  >
                    {deleting === search.id ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Trash2 className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Info */}
      <p className="text-xs text-gray-500">
        Save your frequently used searches to quickly filter campaigns and find what
        matters to you.
      </p>
    </div>
  )
}
