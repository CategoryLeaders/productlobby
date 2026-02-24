'use client'

import React, { useState, useEffect, useCallback } from 'react'
import {
  Send,
  Loader2,
  Trash2,
  Plus,
  TrendingUp,
  CheckCircle,
  Clock,
  ArrowRight,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface OutreachItem {
  id: string
  partnerName: string
  contactMethod: string
  dateSent: string
  status: 'draft' | 'sent' | 'opened' | 'responded' | 'declined' | 'accepted'
  response?: string
  notes?: string
  timestamp: string
}

interface OutreachStats {
  totalOutreach: number
  responseRate: number
  acceptedCount: number
  draftCount: number
  sentCount: number
  respondedCount: number
}

interface PartnerOutreachProps {
  campaignId: string
}

const contactMethodLabels: Record<string, string> = {
  email: 'Email',
  phone: 'Phone',
  linkedin: 'LinkedIn',
  twitter: 'Twitter',
  direct: 'Direct Message',
  other: 'Other',
}

const getStatusColor = (status: string) => {
  switch (status) {
    case 'draft':
      return 'bg-gray-100 text-gray-800 border-gray-300'
    case 'sent':
      return 'bg-blue-100 text-blue-800 border-blue-300'
    case 'opened':
      return 'bg-cyan-100 text-cyan-800 border-cyan-300'
    case 'responded':
      return 'bg-amber-100 text-amber-800 border-amber-300'
    case 'declined':
      return 'bg-red-100 text-red-800 border-red-300'
    case 'accepted':
      return 'bg-lime-100 text-lime-800 border-lime-300'
    default:
      return 'bg-gray-100 text-gray-800 border-gray-300'
  }
}

const getStatusIcon = (status: string) => {
  switch (status) {
    case 'accepted':
      return <CheckCircle className="w-4 h-4" />
    case 'draft':
    case 'sent':
    case 'opened':
      return <Clock className="w-4 h-4" />
    case 'responded':
      return <ArrowRight className="w-4 h-4" />
    default:
      return null
  }
}

const LoadingSkeleton = () => (
  <div className="space-y-4">
    {[1, 2, 3].map((i) => (
      <div key={i} className="p-4 bg-gray-50 rounded-lg animate-pulse">
        <div className="h-4 bg-gray-200 rounded w-48 mb-2"></div>
        <div className="h-3 bg-gray-100 rounded w-32"></div>
      </div>
    ))}
  </div>
)

export const PartnerOutreach: React.FC<PartnerOutreachProps> = ({ campaignId }) => {
  const [items, setItems] = useState<OutreachItem[]>([])
  const [stats, setStats] = useState<OutreachStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isAdding, setIsAdding] = useState(false)
  const [showForm, setShowForm] = useState(false)
  const [isDeletingId, setIsDeletingId] = useState<string | null>(null)

  // Form state
  const [formData, setFormData] = useState({
    partnerName: '',
    contactMethod: 'email' as const,
    dateSent: new Date().toISOString().split('T')[0],
    status: 'draft' as const,
    response: '',
    notes: '',
  })

  // Load outreach data
  const fetchOutreach = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      const response = await fetch(`/api/campaigns/${campaignId}/outreach`)

      if (!response.ok) {
        if (response.status === 401) {
          setError('Unauthorized: Please log in to manage outreach')
        } else if (response.status === 404) {
          setError('Campaign not found')
        } else {
          setError('Failed to load outreach data')
        }
        return
      }

      const data = await response.json()
      if (data.success) {
        setItems(data.items || [])
        setStats(data.stats || null)
      } else {
        setError(data.error || 'Failed to load outreach data')
      }
    } catch (err) {
      console.error('Error fetching outreach:', err)
      setError('Failed to load outreach data')
    } finally {
      setLoading(false)
    }
  }, [campaignId])

  useEffect(() => {
    fetchOutreach()
  }, [fetchOutreach])

  // Add new outreach attempt
  const handleAddOutreach = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.partnerName.trim() || !formData.contactMethod) {
      setError('Please fill in all required fields')
      return
    }

    setIsAdding(true)
    setError(null)

    try {
      const response = await fetch(`/api/campaigns/${campaignId}/outreach`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      if (!response.ok) {
        const data = await response.json()
        setError(data.error || 'Failed to add outreach attempt')
        return
      }

      // Reset form and reload
      setFormData({
        partnerName: '',
        contactMethod: 'email',
        dateSent: new Date().toISOString().split('T')[0],
        status: 'draft',
        response: '',
        notes: '',
      })
      setShowForm(false)
      await fetchOutreach()
    } catch (err) {
      console.error('Error adding outreach:', err)
      setError('Failed to add outreach attempt')
    } finally {
      setIsAdding(false)
    }
  }

  // Delete outreach attempt
  const handleDeleteOutreach = async (id: string) => {
    if (!confirm('Are you sure you want to delete this outreach attempt?')) {
      return
    }

    setIsDeletingId(id)
    setError(null)

    try {
      const response = await fetch(
        `/api/campaigns/${campaignId}/outreach?id=${id}`,
        { method: 'DELETE' }
      )

      if (!response.ok) {
        const data = await response.json()
        setError(data.error || 'Failed to delete outreach attempt')
        return
      }

      await fetchOutreach()
    } catch (err) {
      console.error('Error deleting outreach:', err)
      setError('Failed to delete outreach attempt')
    } finally {
      setIsDeletingId(null)
    }
  }

  // Group items by status for pipeline view
  const pipelineGroups = {
    draft: items.filter((i) => i.status === 'draft'),
    sent: items.filter((i) => i.status === 'sent' || i.status === 'opened'),
    responded: items.filter((i) => i.status === 'responded'),
    outcome: items.filter((i) => i.status === 'accepted' || i.status === 'declined'),
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-6 bg-gray-200 rounded w-48 animate-pulse"></div>
        <LoadingSkeleton />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Send className="w-6 h-6 text-violet-600" />
          <h2 className="text-2xl font-bold text-gray-900">Partner Outreach</h2>
        </div>
        <Button
          onClick={() => setShowForm(!showForm)}
          className={cn(
            'gap-2',
            showForm
              ? 'bg-gray-200 text-gray-900 hover:bg-gray-300'
              : 'bg-violet-600 text-white hover:bg-violet-700'
          )}
        >
          <Plus className="w-4 h-4" />
          {showForm ? 'Cancel' : 'Add Outreach'}
        </Button>
      </div>

      {/* Error message */}
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-800">
          {error}
        </div>
      )}

      {/* Stats */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <div className="p-4 bg-gradient-to-br from-violet-50 to-violet-100 rounded-lg border border-violet-200">
            <div className="text-3xl font-bold text-violet-700">{stats.totalOutreach}</div>
            <div className="text-sm text-violet-600 mt-1">Total Outreach</div>
          </div>
          <div className="p-4 bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg border border-blue-200">
            <div className="text-3xl font-bold text-blue-700">{stats.responseRate}%</div>
            <div className="text-sm text-blue-600 mt-1">Response Rate</div>
          </div>
          <div className="p-4 bg-gradient-to-br from-lime-50 to-lime-100 rounded-lg border border-lime-200">
            <div className="text-3xl font-bold text-lime-700">{stats.acceptedCount}</div>
            <div className="text-sm text-lime-600 mt-1">Accepted</div>
          </div>
          <div className="p-4 bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg border border-gray-200">
            <div className="text-3xl font-bold text-gray-700">{stats.draftCount}</div>
            <div className="text-sm text-gray-600 mt-1">Drafts</div>
          </div>
          <div className="p-4 bg-gradient-to-br from-amber-50 to-amber-100 rounded-lg border border-amber-200">
            <div className="text-3xl font-bold text-amber-700">{stats.sentCount}</div>
            <div className="text-sm text-amber-600 mt-1">Sent</div>
          </div>
        </div>
      )}

      {/* Add Form */}
      {showForm && (
        <form
          onSubmit={handleAddOutreach}
          className="p-6 bg-gray-50 rounded-lg border border-gray-200 space-y-4"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Partner Name *
              </label>
              <input
                type="text"
                required
                value={formData.partnerName}
                onChange={(e) =>
                  setFormData({ ...formData, partnerName: e.target.value })
                }
                placeholder="e.g., TechVentures Inc."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Contact Method *
              </label>
              <select
                value={formData.contactMethod}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    contactMethod: e.target.value as any,
                  })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-transparent"
              >
                {Object.entries(contactMethodLabels).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Date Sent
              </label>
              <input
                type="date"
                value={formData.dateSent}
                onChange={(e) =>
                  setFormData({ ...formData, dateSent: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Status
              </label>
              <select
                value={formData.status}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    status: e.target.value as any,
                  })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-transparent"
              >
                <option value="draft">Draft</option>
                <option value="sent">Sent</option>
                <option value="opened">Opened</option>
                <option value="responded">Responded</option>
                <option value="declined">Declined</option>
                <option value="accepted">Accepted</option>
              </select>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Response
            </label>
            <textarea
              value={formData.response}
              onChange={(e) =>
                setFormData({ ...formData, response: e.target.value })
              }
              placeholder="Partner's response (if any)"
              rows={2}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Notes
            </label>
            <textarea
              value={formData.notes}
              onChange={(e) =>
                setFormData({ ...formData, notes: e.target.value })
              }
              placeholder="Internal notes about this outreach"
              rows={2}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-transparent"
            />
          </div>
          <div className="flex gap-2">
            <Button
              type="submit"
              disabled={isAdding}
              className="bg-violet-600 text-white hover:bg-violet-700 gap-2"
            >
              {isAdding && <Loader2 className="w-4 h-4 animate-spin" />}
              Add Outreach
            </Button>
            <Button
              type="button"
              onClick={() => setShowForm(false)}
              className="bg-gray-200 text-gray-900 hover:bg-gray-300"
            >
              Cancel
            </Button>
          </div>
        </form>
      )}

      {/* Pipeline View */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-violet-600" />
          Outreach Pipeline
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Draft Column */}
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <h4 className="font-semibold text-gray-700 mb-3 pb-2 border-b border-gray-200">
              Draft ({pipelineGroups.draft.length})
            </h4>
            <div className="space-y-2">
              {pipelineGroups.draft.length === 0 ? (
                <p className="text-sm text-gray-500 py-4">No drafts</p>
              ) : (
                pipelineGroups.draft.map((item) => (
                  <div
                    key={item.id}
                    className="p-2 bg-gray-50 rounded text-sm text-gray-700 border border-gray-200"
                  >
                    {item.partnerName}
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Sent Column */}
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <h4 className="font-semibold text-gray-700 mb-3 pb-2 border-b border-gray-200">
              Sent ({pipelineGroups.sent.length})
            </h4>
            <div className="space-y-2">
              {pipelineGroups.sent.length === 0 ? (
                <p className="text-sm text-gray-500 py-4">No sent</p>
              ) : (
                pipelineGroups.sent.map((item) => (
                  <div
                    key={item.id}
                    className="p-2 bg-blue-50 rounded text-sm text-blue-700 border border-blue-200"
                  >
                    {item.partnerName}
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Responded Column */}
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <h4 className="font-semibold text-gray-700 mb-3 pb-2 border-b border-gray-200">
              Responded ({pipelineGroups.responded.length})
            </h4>
            <div className="space-y-2">
              {pipelineGroups.responded.length === 0 ? (
                <p className="text-sm text-gray-500 py-4">No responses yet</p>
              ) : (
                pipelineGroups.responded.map((item) => (
                  <div
                    key={item.id}
                    className="p-2 bg-amber-50 rounded text-sm text-amber-700 border border-amber-200"
                  >
                    {item.partnerName}
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Outcome Column */}
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <h4 className="font-semibold text-gray-700 mb-3 pb-2 border-b border-gray-200">
              Outcome ({pipelineGroups.outcome.length})
            </h4>
            <div className="space-y-2">
              {pipelineGroups.outcome.length === 0 ? (
                <p className="text-sm text-gray-500 py-4">No outcomes</p>
              ) : (
                pipelineGroups.outcome.map((item) => (
                  <div
                    key={item.id}
                    className={cn(
                      'p-2 rounded text-sm border',
                      item.status === 'accepted'
                        ? 'bg-lime-50 text-lime-700 border-lime-200'
                        : 'bg-red-50 text-red-700 border-red-200'
                    )}
                  >
                    {item.partnerName}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      {/* List View */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-900">Outreach Attempts</h3>

        {items.length === 0 ? (
          <div className="p-8 text-center bg-gray-50 rounded-lg border border-gray-200">
            <Send className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-600">
              No outreach attempts yet. Start by adding your first partner outreach.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {items.map((item) => (
              <div
                key={item.id}
                className="p-4 bg-white rounded-lg border border-gray-200 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h4 className="font-semibold text-gray-900">
                        {item.partnerName}
                      </h4>
                      <span
                        className={cn(
                          'px-3 py-1 rounded-full text-xs font-medium border flex items-center gap-1',
                          getStatusColor(item.status)
                        )}
                      >
                        {getStatusIcon(item.status)}
                        {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
                      </span>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm text-gray-600 mb-3">
                      <div>
                        <span className="font-medium">Contact:</span> {contactMethodLabels[item.contactMethod]}
                      </div>
                      <div>
                        <span className="font-medium">Sent:</span>{' '}
                        {new Date(item.dateSent).toLocaleDateString()}
                      </div>
                      <div>
                        <span className="font-medium">Created:</span>{' '}
                        {new Date(item.timestamp).toLocaleDateString()}
                      </div>
                    </div>
                    {item.response && (
                      <div className="mb-2 p-2 bg-blue-50 rounded border border-blue-200">
                        <p className="text-sm text-blue-900">
                          <span className="font-medium">Response:</span> {item.response}
                        </p>
                      </div>
                    )}
                    {item.notes && (
                      <div className="p-2 bg-gray-50 rounded border border-gray-200">
                        <p className="text-sm text-gray-700">
                          <span className="font-medium">Notes:</span> {item.notes}
                        </p>
                      </div>
                    )}
                  </div>
                  <Button
                    onClick={() => handleDeleteOutreach(item.id)}
                    disabled={isDeletingId === item.id}
                    variant="ghost"
                    size="sm"
                    className="text-red-600 hover:bg-red-50 hover:text-red-700"
                  >
                    {isDeletingId === item.id ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Trash2 className="w-4 h-4" />
                    )}
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
