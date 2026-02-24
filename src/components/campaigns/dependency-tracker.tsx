'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

type DependencyType = 'blocks' | 'requires' | 'related-to' | 'duplicates'
type DependencyStatus = 'active' | 'resolved' | 'blocked'

interface Dependency {
  id: string
  sourceItem: string
  targetItem: string
  dependencyType: DependencyType
  status: DependencyStatus
  notes?: string
  createdAt: string
  createdBy: {
    id: string
    displayName: string
  }
}

interface DependencyTrackerProps {
  campaignId: string
  readOnly?: boolean
}

export function DependencyTracker({ campaignId, readOnly = false }: DependencyTrackerProps) {
  const [dependencies, setDependencies] = useState<Dependency[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedType, setSelectedType] = useState<DependencyType | 'all'>('all')
  const [selectedStatus, setSelectedStatus] = useState<DependencyStatus | 'all'>('all')
  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState({
    sourceItem: '',
    targetItem: '',
    dependencyType: 'requires' as DependencyType,
    status: 'active' as DependencyStatus,
    notes: '',
  })

  // Fetch dependencies
  useEffect(() => {
    fetchDependencies()
  }, [campaignId])

  const fetchDependencies = async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await fetch(`/api/campaigns/${campaignId}/dependencies`)
      
      if (!response.ok) {
        throw new Error('Failed to fetch dependencies')
      }
      
      const data = await response.json()
      setDependencies(data.dependencies || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  const handleAddDependency = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.sourceItem.trim() || !formData.targetItem.trim()) {
      setError('Source and target items are required')
      return
    }

    try {
      const response = await fetch(`/api/campaigns/${campaignId}/dependencies`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      if (!response.ok) {
        throw new Error('Failed to create dependency')
      }

      const data = await response.json()
      setDependencies([...dependencies, data.dependency])
      setFormData({
        sourceItem: '',
        targetItem: '',
        dependencyType: 'requires',
        status: 'active',
        notes: '',
      })
      setShowForm(false)
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    }
  }

  const handleDeleteDependency = async (id: string) => {
    try {
      const response = await fetch(`/api/campaigns/${campaignId}/dependencies`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ dependencyId: id }),
      })

      if (!response.ok) {
        throw new Error('Failed to delete dependency')
      }

      setDependencies(dependencies.filter(d => d.id !== id))
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    }
  }

  // Filter dependencies
  const filteredDependencies = dependencies.filter(dep => {
    const typeMatch = selectedType === 'all' || dep.dependencyType === selectedType
    const statusMatch = selectedStatus === 'all' || dep.status === selectedStatus
    return typeMatch && statusMatch
  })

  // Calculate stats
  const stats = {
    total: dependencies.length,
    blocked: dependencies.filter(d => d.status === 'blocked').length,
    resolved: dependencies.filter(d => d.status === 'resolved').length,
  }

  const getDependencyTypeLabel = (type: DependencyType): string => {
    const labels: Record<DependencyType, string> = {
      blocks: 'Blocks',
      requires: 'Requires',
      'related-to': 'Related To',
      duplicates: 'Duplicates',
    }
    return labels[type]
  }

  const getDependencyTypeColor = (type: DependencyType): string => {
    const colors: Record<DependencyType, string> = {
      blocks: 'bg-red-50 border-red-200 text-red-700',
      requires: 'bg-blue-50 border-blue-200 text-blue-700',
      'related-to': 'bg-purple-50 border-purple-200 text-purple-700',
      duplicates: 'bg-orange-50 border-orange-200 text-orange-700',
    }
    return colors[type]
  }

  const getStatusLabel = (status: DependencyStatus): string => {
    const labels: Record<DependencyStatus, string> = {
      active: 'Active',
      resolved: 'Resolved',
      blocked: 'Blocked',
    }
    return labels[status]
  }

  const getStatusColor = (status: DependencyStatus): string => {
    const colors: Record<DependencyStatus, string> = {
      active: 'bg-lime-100 text-lime-800 border-lime-300',
      resolved: 'bg-green-100 text-green-800 border-green-300',
      blocked: 'bg-red-100 text-red-800 border-red-300',
    }
    return colors[status]
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="text-slate-600">Loading dependencies...</div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Campaign Dependency Tracker</h2>
          <p className="mt-1 text-sm text-slate-600">Manage and track dependencies between tasks and milestones</p>
        </div>
        {!readOnly && (
          <Button
            onClick={() => setShowForm(!showForm)}
            className="bg-violet-600 hover:bg-violet-700 text-white"
          >
            {showForm ? 'Cancel' : '+ Add Dependency'}
          </Button>
        )}
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-gradient-to-br from-violet-50 to-violet-100 border border-violet-200 rounded-lg p-4">
          <div className="text-3xl font-bold text-violet-700">{stats.total}</div>
          <div className="text-sm text-violet-600 mt-1">Total Dependencies</div>
        </div>
        <div className="bg-gradient-to-br from-red-50 to-red-100 border border-red-200 rounded-lg p-4">
          <div className="text-3xl font-bold text-red-700">{stats.blocked}</div>
          <div className="text-sm text-red-600 mt-1">Blocked Dependencies</div>
        </div>
        <div className="bg-gradient-to-br from-green-50 to-green-100 border border-green-200 rounded-lg p-4">
          <div className="text-3xl font-bold text-green-700">{stats.resolved}</div>
          <div className="text-sm text-green-600 mt-1">Resolved Dependencies</div>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700 text-sm">
          {error}
        </div>
      )}

      {/* Add Dependency Form */}
      {showForm && !readOnly && (
        <div className="bg-white border border-violet-200 rounded-lg p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-slate-900 mb-4">Add New Dependency</h3>
          <form onSubmit={handleAddDependency} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Source Item
                </label>
                <input
                  type="text"
                  value={formData.sourceItem}
                  onChange={(e) => setFormData({ ...formData, sourceItem: e.target.value })}
                  placeholder="e.g., Task 1, Milestone A"
                  className="w-full px-3 py-2 border border-slate-300 rounded-md text-slate-900 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-violet-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Target Item
                </label>
                <input
                  type="text"
                  value={formData.targetItem}
                  onChange={(e) => setFormData({ ...formData, targetItem: e.target.value })}
                  placeholder="e.g., Task 2, Milestone B"
                  className="w-full px-3 py-2 border border-slate-300 rounded-md text-slate-900 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-violet-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Dependency Type
                </label>
                <select
                  value={formData.dependencyType}
                  onChange={(e) => setFormData({ ...formData, dependencyType: e.target.value as DependencyType })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-md text-slate-900 focus:outline-none focus:ring-2 focus:ring-violet-500"
                >
                  <option value="requires">Requires</option>
                  <option value="blocks">Blocks</option>
                  <option value="related-to">Related To</option>
                  <option value="duplicates">Duplicates</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Status
                </label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value as DependencyStatus })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-md text-slate-900 focus:outline-none focus:ring-2 focus:ring-violet-500"
                >
                  <option value="active">Active</option>
                  <option value="blocked">Blocked</option>
                  <option value="resolved">Resolved</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Notes (Optional)
              </label>
              <textarea
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                placeholder="Add any relevant notes..."
                rows={3}
                className="w-full px-3 py-2 border border-slate-300 rounded-md text-slate-900 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-violet-500"
              />
            </div>

            <div className="flex gap-2 justify-end pt-4">
              <Button
                type="button"
                onClick={() => setShowForm(false)}
                variant="ghost"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="bg-violet-600 hover:bg-violet-700 text-white"
              >
                Create Dependency
              </Button>
            </div>
          </form>
        </div>
      )}

      {/* Filters */}
      <div className="flex gap-4 items-center flex-wrap bg-slate-50 p-4 rounded-lg border border-slate-200">
        <div>
          <label className="text-sm font-medium text-slate-700 mr-3">Filter by Type:</label>
          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value as DependencyType | 'all')}
            className="px-3 py-1.5 border border-slate-300 rounded-md text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-violet-500"
          >
            <option value="all">All Types</option>
            <option value="requires">Requires</option>
            <option value="blocks">Blocks</option>
            <option value="related-to">Related To</option>
            <option value="duplicates">Duplicates</option>
          </select>
        </div>
        <div>
          <label className="text-sm font-medium text-slate-700 mr-3">Filter by Status:</label>
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value as DependencyStatus | 'all')}
            className="px-3 py-1.5 border border-slate-300 rounded-md text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-violet-500"
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="blocked">Blocked</option>
            <option value="resolved">Resolved</option>
          </select>
        </div>
        {(selectedType !== 'all' || selectedStatus !== 'all') && (
          <Button
            onClick={() => {
              setSelectedType('all')
              setSelectedStatus('all')
            }}
            variant="ghost"
            size="sm"
          >
            Clear Filters
          </Button>
        )}
      </div>

      {/* Dependencies List */}
      {filteredDependencies.length === 0 ? (
        <div className="bg-slate-50 border border-slate-200 rounded-lg p-8 text-center">
          <div className="text-slate-600 text-sm">
            {dependencies.length === 0
              ? 'No dependencies created yet. Add one to get started!'
              : 'No dependencies match the selected filters.'}
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredDependencies.map((dependency) => (
            <div
              key={dependency.id}
              className="bg-white border border-slate-200 rounded-lg p-4 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 flex-wrap mb-3">
                    {/* Source Item */}
                    <div className="bg-slate-100 px-3 py-1 rounded-md text-sm font-medium text-slate-900">
                      {dependency.sourceItem}
                    </div>

                    {/* Dependency Type Badge */}
                    <span className={cn(
                      'px-2.5 py-1 rounded-md text-xs font-medium border',
                      getDependencyTypeColor(dependency.dependencyType)
                    )}>
                      {getDependencyTypeLabel(dependency.dependencyType)}
                    </span>

                    {/* Target Item */}
                    <div className="bg-slate-100 px-3 py-1 rounded-md text-sm font-medium text-slate-900">
                      {dependency.targetItem}
                    </div>
                  </div>

                  {/* Status and Metadata */}
                  <div className="flex items-center gap-3 text-xs text-slate-600">
                    <span className={cn(
                      'px-2.5 py-1 rounded-md font-medium border',
                      getStatusColor(dependency.status)
                    )}>
                      {getStatusLabel(dependency.status)}
                    </span>
                    <span>By {dependency.createdBy.displayName}</span>
                    <span>{new Date(dependency.createdAt).toLocaleDateString()}</span>
                  </div>

                  {/* Notes */}
                  {dependency.notes && (
                    <div className="mt-2 text-sm text-slate-600 italic">
                      "{dependency.notes}"
                    </div>
                  )}
                </div>

                {/* Delete Button */}
                {!readOnly && (
                  <Button
                    onClick={() => handleDeleteDependency(dependency.id)}
                    variant="ghost"
                    size="sm"
                    className="text-red-600 hover:bg-red-50 hover:text-red-700"
                  >
                    Delete
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
