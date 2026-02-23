'use client'

import React, { useState, useEffect } from 'react'
import {
  Plus,
  Loader2,
  MapPin,
  Clock,
  CheckCircle2,
  AlertCircle,
  Circle,
  ChevronDown,
  Filter,
  X,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'
import { useAuth } from '@/hooks/useAuth'

interface Milestone {
  id: string
  title: string
  description?: string
  targetDate: string
  status: 'planned' | 'in-progress' | 'completed' | 'delayed'
  progress: number
  createdAt: string
  userId: string
  userName: string
}

interface RoadmapViewProps {
  campaignId: string
  creatorId?: string
}

const STATUS_CONFIG = {
  planned: {
    color: 'bg-slate-500',
    textColor: 'text-slate-600',
    bgColor: 'bg-slate-100',
    label: 'Planned',
    icon: Circle,
  },
  'in-progress': {
    color: 'bg-blue-500',
    textColor: 'text-blue-600',
    bgColor: 'bg-blue-100',
    label: 'In Progress',
    icon: Clock,
  },
  completed: {
    color: 'bg-green-500',
    textColor: 'text-green-600',
    bgColor: 'bg-green-100',
    label: 'Completed',
    icon: CheckCircle2,
  },
  delayed: {
    color: 'bg-red-500',
    textColor: 'text-red-600',
    bgColor: 'bg-red-100',
    label: 'Delayed',
    icon: AlertCircle,
  },
}

const formatDate = (dateString: string): string => {
  const date = new Date(dateString)
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

const getTimelinePosition = (date: string, allDates: string[]): number => {
  if (allDates.length === 0) return 0
  const sortedDates = [...allDates].sort()
  const minDate = new Date(sortedDates[0])
  const maxDate = new Date(sortedDates[sortedDates.length - 1])
  const currentDate = new Date(date)

  if (maxDate.getTime() === minDate.getTime()) return 0
  const percentage = (currentDate.getTime() - minDate.getTime()) / (maxDate.getTime() - minDate.getTime()) * 100
  return Math.max(0, Math.min(100, percentage))
}

export function RoadmapView({ campaignId, creatorId }: RoadmapViewProps) {
  const { user } = useAuth()
  const [milestones, setMilestones] = useState<Milestone[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [selectedStatus, setSelectedStatus] = useState<string | null>(null)
  const [expandedMilestone, setExpandedMilestone] = useState<string | null>(null)

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    targetDate: '',
    status: 'planned' as const,
    progress: 0,
  })

  const isCreator = user?.id === creatorId

  // Fetch milestones
  useEffect(() => {
    const fetchMilestones = async () => {
      try {
        setLoading(true)
        const response = await fetch(`/api/campaigns/${campaignId}/roadmap`)

        if (!response.ok) {
          throw new Error('Failed to fetch milestones')
        }

        const data = await response.json()
        setMilestones(data.data || [])
        setError(null)
      } catch (err) {
        console.error('Error fetching milestones:', err)
        setError('Failed to load roadmap milestones')
      } finally {
        setLoading(false)
      }
    }

    fetchMilestones()
  }, [campaignId])

  const handleAddMilestone = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!isCreator) {
      setError('Only the campaign creator can add milestones')
      return
    }

    if (!formData.title.trim() || !formData.targetDate) {
      setError('Title and target date are required')
      return
    }

    try {
      setSubmitting(true)
      setError(null)

      const response = await fetch(`/api/campaigns/${campaignId}/roadmap`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to create milestone')
      }

      const data = await response.json()
      setMilestones([data.data, ...milestones])
      setFormData({
        title: '',
        description: '',
        targetDate: '',
        status: 'planned',
        progress: 0,
      })
      setShowForm(false)
    } catch (err) {
      console.error('Error creating milestone:', err)
      setError(err instanceof Error ? err.message : 'Failed to create milestone')
    } finally {
      setSubmitting(false)
    }
  }

  const filteredMilestones = selectedStatus
    ? milestones.filter((m) => m.status === selectedStatus)
    : milestones

  const allTargetDates = milestones.map((m) => m.targetDate)
  const sortedMilestones = [...filteredMilestones].sort(
    (a, b) => new Date(a.targetDate).getTime() - new Date(b.targetDate).getTime()
  )

  const statusCounts = {
    planned: milestones.filter((m) => m.status === 'planned').length,
    'in-progress': milestones.filter((m) => m.status === 'in-progress').length,
    completed: milestones.filter((m) => m.status === 'completed').length,
    delayed: milestones.filter((m) => m.status === 'delayed').length,
  }

  const averageProgress = milestones.length > 0
    ? Math.round(milestones.reduce((sum, m) => sum + m.progress, 0) / milestones.length)
    : 0

  return (
    <div className="w-full space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Campaign Roadmap</h2>
          <p className="text-sm text-gray-500 mt-1">Track milestones and planned features</p>
        </div>

        {isCreator && (
          <Button
            onClick={() => setShowForm(!showForm)}
            className="gap-2"
          >
            <Plus className="w-4 h-4" />
            {showForm ? 'Cancel' : 'Add Milestone'}
          </Button>
        )}
      </div>

      {/* Add Milestone Form */}
      {showForm && isCreator && (
        <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
          <form onSubmit={handleAddMilestone} className="space-y-4">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Milestone Title *
                </label>
                <Input
                  type="text"
                  placeholder="e.g., Beta Launch"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Target Date *
                </label>
                <Input
                  type="date"
                  value={formData.targetDate}
                  onChange={(e) => setFormData({ ...formData, targetDate: e.target.value })}
                  className="w-full"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <textarea
                placeholder="Describe this milestone..."
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows={3}
              />
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Status
                </label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({
                    ...formData,
                    status: e.target.value as any,
                  })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {Object.entries(STATUS_CONFIG).map(([key, { label }]) => (
                    <option key={key} value={key}>
                      {label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Progress: {formData.progress}%
                </label>
                <input
                  type="range"
                  min="0"
                  max="100"
                  step="5"
                  value={formData.progress}
                  onChange={(e) => setFormData({ ...formData, progress: parseInt(e.target.value) })}
                  className="w-full h-2 bg-gray-300 rounded-lg appearance-none cursor-pointer"
                />
              </div>
            </div>

            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded text-sm text-red-700">
                {error}
              </div>
            )}

            <div className="flex gap-2">
              <Button
                type="submit"
                disabled={submitting}
                className="gap-2"
              >
                {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
                Create Milestone
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowForm(false)}
              >
                Cancel
              </Button>
            </div>
          </form>
        </div>
      )}

      {/* Status Summary */}
      {milestones.length > 0 && (
        <div className="grid grid-cols-2 gap-3 md:grid-cols-5">
          <div className="p-3 border border-gray-200 rounded-lg">
            <div className="text-sm text-gray-600">Total</div>
            <div className="text-2xl font-bold text-gray-900">{milestones.length}</div>
          </div>

          {Object.entries(statusCounts).map(([status, count]) => {
            const config = STATUS_CONFIG[status as keyof typeof STATUS_CONFIG]
            return (
              <button
                key={status}
                onClick={() => setSelectedStatus(selectedStatus === status ? null : status)}
                className={cn(
                  'p-3 border rounded-lg cursor-pointer transition-colors',
                  selectedStatus === status
                    ? 'border-gray-400 bg-gray-100'
                    : 'border-gray-200 hover:border-gray-300'
                )}
              >
                <div className={cn('text-sm', config.textColor)}>
                  {config.label}
                </div>
                <div className="text-2xl font-bold text-gray-900">{count}</div>
              </button>
            )
          })}

          <div className="p-3 border border-gray-200 rounded-lg">
            <div className="text-sm text-gray-600">Avg Progress</div>
            <div className="text-2xl font-bold text-gray-900">{averageProgress}%</div>
          </div>
        </div>
      )}

      {/* Timeline View */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
        </div>
      ) : milestones.length === 0 ? (
        <div className="text-center py-12">
          <MapPin className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500">No milestones yet</p>
          {isCreator && (
            <p className="text-sm text-gray-400 mt-1">
              Click "Add Milestone" to create your first roadmap item
            </p>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {/* Horizontal Timeline */}
          {sortedMilestones.length > 0 && (
            <div className="hidden lg:block">
              <div className="relative h-32 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-6 border border-gray-200">
                <div className="absolute inset-x-0 top-1/2 h-1 bg-gray-300 transform -translate-y-1/2" />

                <div className="relative h-full flex items-end justify-between px-4">
                  {sortedMilestones.map((milestone) => {
                    const config = STATUS_CONFIG[milestone.status]
                    const position = getTimelinePosition(milestone.targetDate, allTargetDates)

                    return (
                      <div
                        key={milestone.id}
                        className="flex flex-col items-center gap-2"
                        style={{ left: `${position}%` }}
                      >
                        <div className={cn(
                          'w-4 h-4 rounded-full border-2 border-white shadow-md',
                          config.color
                        )} />
                        <div className="bg-white px-2 py-1 rounded border border-gray-200 text-xs font-medium text-center whitespace-nowrap">
                          {formatDate(milestone.targetDate)}
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>
          )}

          {/* Milestone Cards - Responsive */}
          <div className="space-y-3">
            {sortedMilestones.map((milestone) => {
              const config = STATUS_CONFIG[milestone.status]
              const IconComponent = config.icon

              return (
                <div
                  key={milestone.id}
                  className="border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition-shadow"
                >
                  <button
                    onClick={() => setExpandedMilestone(
                      expandedMilestone === milestone.id ? null : milestone.id
                    )}
                    className="w-full p-4 flex items-start gap-4 bg-white hover:bg-gray-50 transition-colors text-left"
                  >
                    {/* Status Icon */}
                    <div className={cn(
                      'mt-1 flex-shrink-0 p-2 rounded-lg',
                      config.bgColor
                    )}>
                      <IconComponent className={cn('w-5 h-5', config.textColor)} />
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                        <div>
                          <h3 className="font-semibold text-gray-900 line-clamp-1">
                            {milestone.title}
                          </h3>
                          <div className="flex flex-wrap gap-2 mt-2 text-sm text-gray-600">
                            <div className="flex items-center gap-1">
                              <Clock className="w-4 h-4" />
                              {formatDate(milestone.targetDate)}
                            </div>
                            <div className={cn('px-2 py-0.5 rounded text-xs font-medium', config.bgColor, config.textColor)}>
                              {config.label}
                            </div>
                          </div>
                        </div>

                        {/* Progress Bar */}
                        <div className="flex-shrink-0 w-full sm:w-24">
                          <div className="text-right text-sm font-medium text-gray-700 mb-1">
                            {milestone.progress}%
                          </div>
                          <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                            <div
                              className={cn('h-full transition-all', config.color)}
                              style={{ width: `${milestone.progress}%` }}
                            />
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Expand Button */}
                    <div className="flex-shrink-0">
                      <ChevronDown
                        className={cn(
                          'w-5 h-5 text-gray-400 transition-transform',
                          expandedMilestone === milestone.id && 'rotate-180'
                        )}
                      />
                    </div>
                  </button>

                  {/* Expanded Details */}
                  {expandedMilestone === milestone.id && (
                    <div className="border-t border-gray-200 bg-gray-50 p-4 space-y-3">
                      {milestone.description && (
                        <div>
                          <h4 className="text-sm font-medium text-gray-700 mb-1">
                            Description
                          </h4>
                          <p className="text-sm text-gray-600 whitespace-pre-wrap">
                            {milestone.description}
                          </p>
                        </div>
                      )}

                      <div className="grid grid-cols-2 gap-3 pt-2 border-t border-gray-200">
                        <div>
                          <div className="text-xs text-gray-500">Created By</div>
                          <div className="text-sm font-medium text-gray-900">
                            {milestone.userName}
                          </div>
                        </div>
                        <div>
                          <div className="text-xs text-gray-500">Created Date</div>
                          <div className="text-sm font-medium text-gray-900">
                            {formatDate(milestone.createdAt)}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Filter Info */}
      {selectedStatus && (
        <div className="flex items-center gap-2 p-3 bg-blue-50 border border-blue-200 rounded-lg text-sm text-blue-700">
          <Filter className="w-4 h-4" />
          Showing {filteredMilestones.length} milestone{filteredMilestones.length !== 1 ? 's' : ''} with status "{STATUS_CONFIG[selectedStatus as keyof typeof STATUS_CONFIG].label}"
          <button
            onClick={() => setSelectedStatus(null)}
            className="ml-auto hover:text-blue-900"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  )
}
