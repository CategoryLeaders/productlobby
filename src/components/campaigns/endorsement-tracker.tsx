'use client'

import React, { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import {
  Quote,
  Star,
  Loader2,
  User,
  Trash2,
  Plus,
  Filter,
  BarChart3,
  Award,
  Building2,
  Newspaper,
  Clock,
  TrendingUp,
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface Endorser {
  id: string
  displayName: string
  avatar?: string
  handle?: string
}

interface Endorsement {
  id: string
  userId: string
  user: Endorser
  name: string
  title: string
  organization: string
  quote: string
  type?: 'individual' | 'organization' | 'media'
  avatarUrl?: string
  timestamp?: string
  createdAt: string | Date
}

interface EndorsementTrackerProps {
  campaignId: string
  className?: string
  isAuthenticated?: boolean
  currentUserId?: string
  isCampaignCreator?: boolean
  onEndorsementAdded?: () => void
  onEndorsementDeleted?: () => void
}

interface Stats {
  total: number
  individual: number
  organization: number
  media: number
}

export const EndorsementTracker: React.FC<EndorsementTrackerProps> = ({
  campaignId,
  className,
  isAuthenticated = false,
  currentUserId,
  isCampaignCreator = false,
  onEndorsementAdded,
  onEndorsementDeleted,
}) => {
  const [endorsements, setEndorsements] = useState<Endorsement[]>([])
  const [filteredEndorsements, setFilteredEndorsements] = useState<Endorsement[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showForm, setShowForm] = useState(false)
  const [hasEndorsed, setHasEndorsed] = useState(false)
  const [stats, setStats] = useState<Stats>({
    total: 0,
    individual: 0,
    organization: 0,
    media: 0,
  })

  // Filter and sort states
  const [filterType, setFilterType] = useState<'all' | 'individual' | 'organization' | 'media'>('all')
  const [sortBy, setSortBy] = useState<'date' | 'prominence'>('date')
  const [searchQuery, setSearchQuery] = useState('')

  const [formData, setFormData] = useState({
    name: '',
    title: '',
    organization: '',
    quote: '',
    type: 'individual' as 'individual' | 'organization' | 'media',
    avatarUrl: '',
  })

  const [error, setError] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null)

  useEffect(() => {
    fetchEndorsements()
  }, [campaignId])

  useEffect(() => {
    applyFiltersAndSort()
  }, [endorsements, filterType, sortBy, searchQuery])

  const fetchEndorsements = async () => {
    try {
      setIsLoading(true)
      setError(null)
      const response = await fetch(`/api/campaigns/${campaignId}/endorsements`)
      const result = await response.json()

      if (result.success) {
        const endorsementsList = (result.data || []).map((e: any) => ({
          ...e,
          type: e.type || 'individual',
          timestamp: e.timestamp || new Date(e.createdAt).toISOString(),
        }))
        setEndorsements(endorsementsList)
        calculateStats(endorsementsList)

        if (currentUserId) {
          setHasEndorsed(endorsementsList.some((e: Endorsement) => e.userId === currentUserId))
        }
      } else {
        setError(result.error || 'Failed to load endorsements')
      }
    } catch (err) {
      console.error('Error fetching endorsements:', err)
      setError('Failed to load endorsements')
    } finally {
      setIsLoading(false)
    }
  }

  const calculateStats = (endorsementsList: Endorsement[]) => {
    const statData: Stats = {
      total: endorsementsList.length,
      individual: endorsementsList.filter(e => e.type === 'individual').length,
      organization: endorsementsList.filter(e => e.type === 'organization').length,
      media: endorsementsList.filter(e => e.type === 'media').length,
    }
    setStats(statData)
  }

  const applyFiltersAndSort = () => {
    let filtered = endorsements

    // Apply filter by type
    if (filterType !== 'all') {
      filtered = filtered.filter(e => e.type === filterType)
    }

    // Apply search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(
        e =>
          e.name.toLowerCase().includes(query) ||
          e.organization.toLowerCase().includes(query) ||
          e.quote.toLowerCase().includes(query) ||
          e.title.toLowerCase().includes(query)
      )
    }

    // Apply sort
    if (sortBy === 'date') {
      filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    } else if (sortBy === 'prominence') {
      // Prominence: media > organization > individual
      const typeWeight = { media: 3, organization: 2, individual: 1 }
      filtered.sort(
        (a, b) => (typeWeight[b.type || 'individual'] || 1) - (typeWeight[a.type || 'individual'] || 1)
      )
    }

    setFilteredEndorsements(filtered)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setSuccessMessage(null)

    // Validate form
    if (!formData.name.trim()) {
      setError('Name is required')
      return
    }
    if (!formData.title.trim()) {
      setError('Title is required')
      return
    }
    if (!formData.organization.trim()) {
      setError('Organization is required')
      return
    }
    if (!formData.quote.trim()) {
      setError('Quote is required')
      return
    }

    try {
      setIsSubmitting(true)
      const response = await fetch(`/api/campaigns/${campaignId}/endorsements`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name.trim(),
          title: formData.title.trim(),
          organization: formData.organization.trim(),
          quote: formData.quote.trim(),
          type: formData.type,
          avatarUrl: formData.avatarUrl,
        }),
      })

      const result = await response.json()

      if (result.success) {
        setSuccessMessage('Endorsement added successfully!')
        setFormData({
          name: '',
          title: '',
          organization: '',
          quote: '',
          type: 'individual',
          avatarUrl: '',
        })
        setShowForm(false)
        await fetchEndorsements()
        onEndorsementAdded?.()
        setTimeout(() => setSuccessMessage(null), 3000)
      } else {
        setError(result.error || 'Failed to add endorsement')
      }
    } catch (err) {
      console.error('Error submitting endorsement:', err)
      setError('Failed to add endorsement')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDelete = async (endorsementId: string) => {
    if (!isCampaignCreator) {
      setError('Only campaign creators can delete endorsements')
      return
    }

    try {
      setIsSubmitting(true)
      const response = await fetch(`/api/campaigns/${campaignId}/endorsements/${endorsementId}`, {
        method: 'DELETE',
      })

      const result = await response.json()

      if (result.success) {
        setSuccessMessage('Endorsement deleted successfully!')
        setDeleteConfirm(null)
        await fetchEndorsements()
        onEndorsementDeleted?.()
        setTimeout(() => setSuccessMessage(null), 3000)
      } else {
        setError(result.error || 'Failed to delete endorsement')
      }
    } catch (err) {
      console.error('Error deleting endorsement:', err)
      setError('Failed to delete endorsement')
    } finally {
      setIsSubmitting(false)
    }
  }

  const getTypeIcon = (type?: string) => {
    switch (type) {
      case 'organization':
        return <Building2 className="w-4 h-4" />
      case 'media':
        return <Newspaper className="w-4 h-4" />
      case 'individual':
      default:
        return <User className="w-4 h-4" />
    }
  }

  const getTypeColor = (type?: string) => {
    switch (type) {
      case 'organization':
        return 'bg-violet-100 text-violet-700'
      case 'media':
        return 'bg-lime-100 text-lime-700'
      case 'individual':
      default:
        return 'bg-violet-100 text-violet-700'
    }
  }

  return (
    <div className={cn('w-full max-w-4xl mx-auto', className)}>
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Award className="w-6 h-6 text-violet-600" />
            <h2 className="text-2xl font-bold text-gray-900">Endorsement Tracker</h2>
          </div>
          {isCampaignCreator && (
            <Button
              onClick={() => setShowForm(!showForm)}
              className={`gap-2 ${showForm ? 'bg-gray-500 hover:bg-gray-600' : 'bg-violet-600 hover:bg-violet-700'}`}
            >
              <Plus className="w-4 h-4" />
              {showForm ? 'Cancel' : 'Add Endorsement'}
            </Button>
          )}
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-4 gap-3 mb-6">
          <div className="bg-gradient-to-br from-violet-50 to-violet-100 rounded-lg p-4 border border-violet-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-violet-600 uppercase tracking-wider">Total</p>
                <p className="text-2xl font-bold text-violet-900 mt-1">{stats.total}</p>
              </div>
              <Star className="w-8 h-8 text-violet-400" />
            </div>
          </div>

          <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-4 border border-blue-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-blue-600 uppercase tracking-wider">Individual</p>
                <p className="text-2xl font-bold text-blue-900 mt-1">{stats.individual}</p>
              </div>
              <User className="w-8 h-8 text-blue-400" />
            </div>
          </div>

          <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-4 border border-purple-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-purple-600 uppercase tracking-wider">Organization</p>
                <p className="text-2xl font-bold text-purple-900 mt-1">{stats.organization}</p>
              </div>
              <Building2 className="w-8 h-8 text-purple-400" />
            </div>
          </div>

          <div className="bg-gradient-to-br from-lime-50 to-lime-100 rounded-lg p-4 border border-lime-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-lime-600 uppercase tracking-wider">Media</p>
                <p className="text-2xl font-bold text-lime-900 mt-1">{stats.media}</p>
              </div>
              <Newspaper className="w-8 h-8 text-lime-400" />
            </div>
          </div>
        </div>
      </div>

      {/* Messages */}
      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
          {error}
        </div>
      )}
      {successMessage && (
        <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg text-green-700 text-sm">
          {successMessage}
        </div>
      )}

      {/* Add Endorsement Form */}
      {showForm && isCampaignCreator && (
        <div className="mb-8 p-6 bg-violet-50 border border-violet-200 rounded-lg">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Add New Endorsement</h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Endorser Name *
                </label>
                <Input
                  type="text"
                  placeholder="John Doe"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="border-violet-300 focus:border-violet-500 focus:ring-violet-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Type *
                </label>
                <select
                  value={formData.type}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      type: e.target.value as 'individual' | 'organization' | 'media',
                    })
                  }
                  className="w-full px-3 py-2 border border-violet-300 rounded-md focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500"
                >
                  <option value="individual">Individual</option>
                  <option value="organization">Organization</option>
                  <option value="media">Media</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Title *
                </label>
                <Input
                  type="text"
                  placeholder="CEO, Founder, etc."
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="border-violet-300 focus:border-violet-500 focus:ring-violet-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Organization *
                </label>
                <Input
                  type="text"
                  placeholder="Company or Organization"
                  value={formData.organization}
                  onChange={(e) => setFormData({ ...formData, organization: e.target.value })}
                  className="border-violet-300 focus:border-violet-500 focus:ring-violet-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Avatar URL
              </label>
              <Input
                type="url"
                placeholder="https://example.com/avatar.jpg"
                value={formData.avatarUrl}
                onChange={(e) => setFormData({ ...formData, avatarUrl: e.target.value })}
                className="border-violet-300 focus:border-violet-500 focus:ring-violet-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Endorsement Quote *
              </label>
              <Textarea
                placeholder="What do they say about this campaign?"
                value={formData.quote}
                onChange={(e) => setFormData({ ...formData, quote: e.target.value })}
                rows={4}
                className="border-violet-300 focus:border-violet-500 focus:ring-violet-500"
              />
            </div>

            <Button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-violet-600 hover:bg-violet-700"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Adding...
                </>
              ) : (
                'Add Endorsement'
              )}
            </Button>
          </form>
        </div>
      )}

      {/* Filters and Search */}
      <div className="mb-6 space-y-4">
        <div className="flex gap-2 flex-wrap">
          <div className="flex-1 min-w-[250px]">
            <Input
              type="text"
              placeholder="Search endorsements..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="border-violet-300 focus:border-violet-500 focus:ring-violet-500"
            />
          </div>
        </div>

        <div className="flex gap-2 flex-wrap items-center">
          <Filter className="w-4 h-4 text-gray-500" />
          <button
            onClick={() => setFilterType('all')}
            className={cn(
              'px-4 py-2 rounded-full text-sm font-medium transition-all',
              filterType === 'all'
                ? 'bg-violet-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            )}
          >
            All ({stats.total})
          </button>
          <button
            onClick={() => setFilterType('individual')}
            className={cn(
              'px-4 py-2 rounded-full text-sm font-medium transition-all flex items-center gap-2',
              filterType === 'individual'
                ? 'bg-violet-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            )}
          >
            <User className="w-4 h-4" />
            Individual ({stats.individual})
          </button>
          <button
            onClick={() => setFilterType('organization')}
            className={cn(
              'px-4 py-2 rounded-full text-sm font-medium transition-all flex items-center gap-2',
              filterType === 'organization'
                ? 'bg-violet-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            )}
          >
            <Building2 className="w-4 h-4" />
            Organization ({stats.organization})
          </button>
          <button
            onClick={() => setFilterType('media')}
            className={cn(
              'px-4 py-2 rounded-full text-sm font-medium transition-all flex items-center gap-2',
              filterType === 'media'
                ? 'bg-violet-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            )}
          >
            <Newspaper className="w-4 h-4" />
            Media ({stats.media})
          </button>
        </div>

        <div className="flex gap-2 items-center">
          <TrendingUp className="w-4 h-4 text-gray-500" />
          <span className="text-sm font-medium text-gray-700">Sort by:</span>
          <button
            onClick={() => setSortBy('date')}
            className={cn(
              'px-3 py-1 rounded text-sm transition-all',
              sortBy === 'date'
                ? 'bg-violet-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            )}
          >
            <Clock className="w-4 h-4 inline mr-1" />
            Recent
          </button>
          <button
            onClick={() => setSortBy('prominence')}
            className={cn(
              'px-3 py-1 rounded text-sm transition-all',
              sortBy === 'prominence'
                ? 'bg-violet-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            )}
          >
            <BarChart3 className="w-4 h-4 inline mr-1" />
            Prominence
          </button>
        </div>
      </div>

      {/* Endorsements List */}
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 text-violet-600 animate-spin" />
        </div>
      ) : filteredEndorsements.length === 0 ? (
        <div className="text-center py-12">
          <Quote className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500 text-lg">
            {endorsements.length === 0 ? 'No endorsements yet' : 'No endorsements match your filters'}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredEndorsements.map((endorsement) => (
            <div
              key={endorsement.id}
              className="relative p-6 bg-white border border-gray-200 rounded-lg hover:shadow-lg transition-shadow"
            >
              {/* Type Badge */}
              <div className="absolute top-4 right-4 flex gap-2">
                <span
                  className={cn(
                    'inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold',
                    getTypeColor(endorsement.type)
                  )}
                >
                  {getTypeIcon(endorsement.type)}
                  {(endorsement.type || 'individual').charAt(0).toUpperCase() +
                    (endorsement.type || 'individual').slice(1)}
                </span>
                {isCampaignCreator && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setDeleteConfirm(endorsement.id)}
                    className="text-red-600 hover:bg-red-50"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                )}
              </div>

              {/* Endorser Info */}
              <div className="flex gap-4 mb-4">
                {endorsement.avatarUrl ? (
                  <img
                    src={endorsement.avatarUrl}
                    alt={endorsement.name}
                    className="w-12 h-12 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-12 h-12 rounded-full bg-violet-100 flex items-center justify-center">
                    <User className="w-6 h-6 text-violet-600" />
                  </div>
                )}
                <div className="flex-1">
                  <h4 className="font-bold text-gray-900">{endorsement.name}</h4>
                  <p className="text-sm text-gray-600">
                    {endorsement.title}
                    {endorsement.organization && ` at ${endorsement.organization}`}
                  </p>
                </div>
              </div>

              {/* Quote */}
              <div className="pl-16 mb-3">
                <div className="flex gap-2">
                  <Quote className="w-4 h-4 text-violet-400 flex-shrink-0 mt-1" />
                  <p className="text-gray-700 italic">"{endorsement.quote}"</p>
                </div>
              </div>

              {/* Date */}
              <div className="flex items-center gap-2 text-xs text-gray-500 pl-16">
                <Clock className="w-3 h-3" />
                {new Date(endorsement.createdAt).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'short',
                  day: 'numeric',
                })}
              </div>

              {/* Delete Confirmation */}
              {deleteConfirm === endorsement.id && (
                <div className="absolute inset-0 bg-red-50 border border-red-200 rounded-lg p-4 flex items-center justify-between">
                  <p className="text-sm font-medium text-red-700">
                    Delete this endorsement? This action cannot be undone.
                  </p>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setDeleteConfirm(null)}
                      className="border-red-300"
                    >
                      Cancel
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => handleDelete(endorsement.id)}
                      disabled={isSubmitting}
                      className="bg-red-600 hover:bg-red-700"
                    >
                      {isSubmitting ? (
                        <Loader2 className="w-3 h-3 animate-spin" />
                      ) : (
                        'Delete'
                      )}
                    </Button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
