'use client'

import { useState, useCallback, useEffect } from 'react'
import { Search, X, ChevronDown } from 'lucide-react'

interface CampaignFiltersProps {
  onFiltersChange: (filters: FilterState) => void
  initialFilters?: FilterState
  isLoading?: boolean
}

export interface FilterState {
  search: string
  category: string
  status: string
  sort: string
  brand?: string
}

const CATEGORIES = [
  { value: 'all', label: 'All Categories' },
  { value: 'TECH', label: 'Tech' },
  { value: 'FASHION', label: 'Fashion' },
  { value: 'FOOD_DRINK', label: 'Food & Drink' },
  { value: 'HOME', label: 'Home' },
  { value: 'SPORTS', label: 'Sports' },
  { value: 'BEAUTY', label: 'Beauty' },
  { value: 'TRANSPORT', label: 'Transport' },
  { value: 'OTHER', label: 'Other' },
]

const STATUS_OPTIONS = [
  { value: 'all', label: 'All Status' },
  { value: 'LIVE', label: 'Active' },
  { value: 'CLOSED', label: 'Closed' },
  { value: 'PAUSED', label: 'Paused' },
]

const SORT_OPTIONS = [
  { value: 'trending', label: 'Trending' },
  { value: 'signal', label: 'Most Lobbied' },
  { value: 'newest', label: 'Newest' },
  { value: 'oldest', label: 'Oldest' },
]

export function CampaignFilters({
  onFiltersChange,
  initialFilters,
  isLoading = false,
}: CampaignFiltersProps) {
  const [filters, setFilters] = useState<FilterState>(
    initialFilters || {
      search: '',
      category: 'all',
      status: 'all',
      sort: 'trending',
    }
  )

  const [debouncedSearch, setDebouncedSearch] = useState(filters.search)
  const [showMobileFilters, setShowMobileFilters] = useState(false)

  // Debounce search input (300ms)
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(filters.search)
    }, 300)
    return () => clearTimeout(timer)
  }, [filters.search])

  // Notify parent of filter changes
  useEffect(() => {
    onFiltersChange({ ...filters, search: debouncedSearch })
  }, [debouncedSearch, filters.category, filters.status, filters.sort, onFiltersChange])

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFilters(prev => ({ ...prev, search: e.target.value }))
  }

  const handleCategoryChange = (value: string) => {
    setFilters(prev => ({ ...prev, category: value }))
  }

  const handleStatusChange = (value: string) => {
    setFilters(prev => ({ ...prev, status: value }))
  }

  const handleSortChange = (value: string) => {
    setFilters(prev => ({ ...prev, sort: value }))
  }

  const handleClearFilters = () => {
    setFilters({
      search: '',
      category: 'all',
      status: 'all',
      sort: 'trending',
    })
  }

  const hasActiveFilters =
    filters.search !== '' ||
    filters.category !== 'all' ||
    filters.status !== 'all' ||
    filters.sort !== 'trending'

  const getCategoryLabel = (value: string) =>
    CATEGORIES.find(c => c.value === value)?.label || 'All Categories'
  const getStatusLabel = (value: string) =>
    STATUS_OPTIONS.find(s => s.value === value)?.label || 'All Status'
  const getSortLabel = (value: string) =>
    SORT_OPTIONS.find(s => s.value === value)?.label || 'Trending'

  return (
    <div className="bg-white border-b border-gray-200 sticky top-16 z-30">
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto py-4">
          {/* Search Bar */}
          <div className="relative mb-4">
            <Search className="absolute left-3 top-3 w-5 h-5 text-gray-400 pointer-events-none" />
            <input
              type="text"
              placeholder="Search campaigns..."
              value={filters.search}
              onChange={handleSearchChange}
              disabled={isLoading}
              className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            />
          </div>

          {/* Mobile Filter Toggle */}
          <div className="lg:hidden mb-4">
            <button
              onClick={() => setShowMobileFilters(!showMobileFilters)}
              className="w-full px-4 py-2 bg-gray-50 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-100 transition-colors flex items-center justify-between disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={isLoading}
            >
              <span>{showMobileFilters ? 'Hide Filters' : 'Show Filters'}</span>
              <ChevronDown
                className={`w-4 h-4 transition-transform ${
                  showMobileFilters ? 'rotate-180' : ''
                }`}
              />
            </button>
          </div>

          {/* Filters Container */}
          <div
            className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 transition-all duration-300 overflow-hidden ${
              showMobileFilters ? 'max-h-96' : 'max-h-0 lg:max-h-none'
            } lg:max-h-none`}
          >
            {/* Category Filter */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-2 uppercase">
                Category
              </label>
              <select
                value={filters.category}
                onChange={e => handleCategoryChange(e.target.value)}
                disabled={isLoading}
                className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {CATEGORIES.map(cat => (
                  <option key={cat.value} value={cat.value}>
                    {cat.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Status Filter */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-2 uppercase">
                Status
              </label>
              <select
                value={filters.status}
                onChange={e => handleStatusChange(e.target.value)}
                disabled={isLoading}
                className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {STATUS_OPTIONS.map(status => (
                  <option key={status.value} value={status.value}>
                    {status.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Sort Options */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-2 uppercase">
                Sort By
              </label>
              <select
                value={filters.sort}
                onChange={e => handleSortChange(e.target.value)}
                disabled={isLoading}
                className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {SORT_OPTIONS.map(sort => (
                  <option key={sort.value} value={sort.value}>
                    {sort.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Clear Filters Button */}
            {hasActiveFilters && (
              <div className="flex items-end">
                <button
                  onClick={handleClearFilters}
                  disabled={isLoading}
                  className="w-full px-4 py-2 bg-lime-100 text-lime-700 border border-lime-300 rounded-lg text-sm font-medium hover:bg-lime-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  <X className="w-4 h-4" />
                  Clear Filters
                </button>
              </div>
            )}
          </div>

          {/* Active Filters Display - Pills/Chips */}
          {hasActiveFilters && (
            <div className="mt-4 flex flex-wrap gap-2 items-center">
              <span className="text-xs font-semibold text-gray-600 uppercase">
                Active Filters:
              </span>
              {filters.search && (
                <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-violet-100 border border-violet-300 rounded-full">
                  <span className="text-xs text-violet-700">
                    Search: <span className="font-medium">"{filters.search}"</span>
                  </span>
                  <button
                    onClick={() => setFilters(prev => ({ ...prev, search: '' }))}
                    className="text-violet-700 hover:text-violet-900 transition-colors"
                    disabled={isLoading}
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              )}
              {filters.category !== 'all' && (
                <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-violet-100 border border-violet-300 rounded-full">
                  <span className="text-xs text-violet-700">
                    {getCategoryLabel(filters.category)}
                  </span>
                  <button
                    onClick={() => setFilters(prev => ({ ...prev, category: 'all' }))}
                    className="text-violet-700 hover:text-violet-900 transition-colors"
                    disabled={isLoading}
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              )}
              {filters.status !== 'all' && (
                <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-violet-100 border border-violet-300 rounded-full">
                  <span className="text-xs text-violet-700">
                    {getStatusLabel(filters.status)}
                  </span>
                  <button
                    onClick={() => setFilters(prev => ({ ...prev, status: 'all' }))}
                    className="text-violet-700 hover:text-violet-900 transition-colors"
                    disabled={isLoading}
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              )}
              {filters.sort !== 'trending' && (
                <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-lime-100 border border-lime-300 rounded-full">
                  <span className="text-xs text-lime-700">
                    {getSortLabel(filters.sort)}
                  </span>
                  <button
                    onClick={() => setFilters(prev => ({ ...prev, sort: 'trending' }))}
                    className="text-lime-700 hover:text-lime-900 transition-colors"
                    disabled={isLoading}
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
