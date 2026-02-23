'use client'

import React, { useState, useRef, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Search, Loader2, ArrowRight } from 'lucide-react'
import { cn } from '@/lib/utils'

interface SuggestionResult {
  campaigns: Array<{
    id: string
    title: string
    slug: string
  }>
  users: Array<{
    id: string
    displayName: string
    handle: string | null
    avatar: string | null
  }>
}

export const SearchBar: React.FC = () => {
  const router = useRouter()
  const [query, setQuery] = useState('')
  const [suggestions, setSuggestions] = useState<SuggestionResult | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isOpen, setIsOpen] = useState(false)
  const [selectedIndex, setSelectedIndex] = useState(-1)
  const searchRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const debounceTimerRef = useRef<NodeJS.Timeout>()

  // Fetch suggestions with debounce
  const fetchSuggestions = useCallback(async (q: string) => {
    if (!q || q.length < 1) {
      setSuggestions(null)
      setSelectedIndex(-1)
      return
    }

    setIsLoading(true)
    try {
      const response = await fetch(`/api/search/suggestions?q=${encodeURIComponent(q)}`)
      if (response.ok) {
        const data = await response.json()
        setSuggestions(data)
        setSelectedIndex(-1)
      }
    } catch (error) {
      console.error('Failed to fetch suggestions:', error)
    } finally {
      setIsLoading(false)
    }
  }, [])

  // Handle query change with debounce
  const handleQueryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newQuery = e.target.value
    setQuery(newQuery)

    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current)
    }

    if (newQuery.length > 0) {
      setIsOpen(true)
      debounceTimerRef.current = setTimeout(() => {
        fetchSuggestions(newQuery)
      }, 300)
    } else {
      setIsOpen(false)
      setSuggestions(null)
    }
  }

  // Handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!isOpen || !suggestions) return

    const totalItems =
      (suggestions.campaigns?.length || 0) + (suggestions.users?.length || 0) + 1

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault()
        setSelectedIndex((prev) => (prev < totalItems - 1 ? prev + 1 : 0))
        break
      case 'ArrowUp':
        e.preventDefault()
        setSelectedIndex((prev) => (prev > 0 ? prev - 1 : totalItems - 1))
        break
      case 'Enter':
        e.preventDefault()
        handleSelectItem(selectedIndex)
        break
      case 'Escape':
        e.preventDefault()
        setIsOpen(false)
        break
      default:
        break
    }
  }

  // Handle item selection
  const handleSelectItem = (index: number) => {
    if (!suggestions) return

    const campaignCount = suggestions.campaigns?.length || 0
    const userCount = suggestions.users?.length || 0

    if (index < campaignCount) {
      const campaign = suggestions.campaigns[index]
      router.push(`/campaigns/${campaign.slug}`)
    } else if (index < campaignCount + userCount) {
      const user = suggestions.users[index - campaignCount]
      router.push(`/users/${user.handle || user.id}`)
    } else {
      // View all results
      handleViewAllResults()
    }

    setIsOpen(false)
    setQuery('')
  }

  // Handle view all results
  const handleViewAllResults = () => {
    if (query.trim()) {
      router.push(`/search?q=${encodeURIComponent(query)}`)
      setIsOpen(false)
      setQuery('')
    }
  }

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Handle Cmd/Ctrl+K keyboard shortcut
  useEffect(() => {
    const handleKeyboardShortcut = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        inputRef.current?.focus()
        setIsOpen(true)
      }
    }

    document.addEventListener('keydown', handleKeyboardShortcut)
    return () => document.removeEventListener('keydown', handleKeyboardShortcut)
  }, [])

  return (
    <div ref={searchRef} className="relative w-full max-w-md">
      {/* Search Input */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
        <input
          ref={inputRef}
          type="text"
          placeholder="Search campaigns, users..."
          value={query}
          onChange={handleQueryChange}
          onKeyDown={handleKeyDown}
          onFocus={() => query && setIsOpen(true)}
          className={cn(
            'w-full pl-10 pr-10 py-2 border rounded-lg bg-white text-sm',
            'placeholder-gray-400 text-gray-900',
            'focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500',
            'transition-colors'
          )}
        />
        {isLoading && (
          <Loader2 className="absolute right-3 top-1/2 transform -translate-y-1/2 text-violet-500 w-4 h-4 animate-spin" />
        )}

        {/* Keyboard shortcut hint (desktop only) */}
        {!query && !isLoading && (
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-xs text-gray-400 hidden sm:block pointer-events-none">
            Cmd+K
          </div>
        )}
      </div>

      {/* Suggestions Dropdown */}
      {isOpen && suggestions && (
        <div
          className={cn(
            'absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200',
            'rounded-lg shadow-lg z-50 overflow-hidden'
          )}
        >
          {/* Campaigns */}
          {suggestions.campaigns && suggestions.campaigns.length > 0 && (
            <div className="border-b border-gray-100 last:border-b-0">
              <div className="px-3 py-2 text-xs font-semibold text-gray-500 bg-gray-50">
                Campaigns
              </div>
              {suggestions.campaigns.map((campaign, idx) => (
                <button
                  key={campaign.id}
                  onClick={() => {
                    router.push(`/campaigns/${campaign.slug}`)
                    setIsOpen(false)
                    setQuery('')
                  }}
                  className={cn(
                    'w-full px-3 py-2 text-left text-sm hover:bg-gray-100',
                    'transition-colors flex items-center justify-between group',
                    selectedIndex === idx && 'bg-gray-100'
                  )}
                >
                  <span className="text-gray-900 truncate">{campaign.title}</span>
                  <ArrowRight className="w-3 h-3 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0 ml-2" />
                </button>
              ))}
            </div>
          )}

          {/* Users */}
          {suggestions.users && suggestions.users.length > 0 && (
            <div className="border-b border-gray-100 last:border-b-0">
              <div className="px-3 py-2 text-xs font-semibold text-gray-500 bg-gray-50">
                Users
              </div>
              {suggestions.users.map((user, idx) => (
                <button
                  key={user.id}
                  onClick={() => {
                    router.push(`/users/${user.handle || user.id}`)
                    setIsOpen(false)
                    setQuery('')
                  }}
                  className={cn(
                    'w-full px-3 py-2 text-left text-sm hover:bg-gray-100',
                    'transition-colors flex items-center gap-2 group',
                    selectedIndex === suggestions.campaigns.length + idx && 'bg-gray-100'
                  )}
                >
                  {user.avatar && (
                    <img
                      src={user.avatar}
                      alt={user.displayName}
                      className="w-6 h-6 rounded-full object-cover flex-shrink-0"
                    />
                  )}
                  <div className="min-w-0 flex-1">
                    <div className="text-gray-900 truncate text-sm font-medium">
                      {user.displayName}
                    </div>
                    {user.handle && (
                      <div className="text-gray-500 truncate text-xs">@{user.handle}</div>
                    )}
                  </div>
                  <ArrowRight className="w-3 h-3 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0" />
                </button>
              ))}
            </div>
          )}

          {/* View All Results */}
          {query && (
            <button
              onClick={handleViewAllResults}
              className={cn(
                'w-full px-3 py-2 text-left text-sm hover:bg-gray-100',
                'transition-colors text-violet-600 font-medium flex items-center justify-between',
                selectedIndex ===
                  (suggestions.campaigns?.length || 0) + (suggestions.users?.length || 0) &&
                  'bg-gray-100'
              )}
            >
              View all results for "{query}"
              <ArrowRight className="w-4 h-4" />
            </button>
          )}

          {/* Empty State */}
          {(!suggestions.campaigns || suggestions.campaigns.length === 0) &&
            (!suggestions.users || suggestions.users.length === 0) && (
              <div className="px-3 py-6 text-center text-gray-500 text-sm">
                No results found
              </div>
            )}
        </div>
      )}
    </div>
  )
}
