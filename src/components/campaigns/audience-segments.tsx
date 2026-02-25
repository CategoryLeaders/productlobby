'use client'

import { useState, useEffect } from 'react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import {
  Users,
  TrendingUp,
  UserCheck,
  UserX,
  Share2,
  Plus,
  Eye,
  BarChart3,
  X,
  ChevronDown,
} from 'lucide-react'

interface SegmentMember {
  id: string
  email: string
  displayName: string
  joinedAt: string
}

interface AudienceSegment {
  id: string
  name: string
  description: string
  memberCount: number
  color: string
  badge: string
  criteria: string[]
  activityScore: number
  lastUpdated: string
  members?: SegmentMember[]
  stats?: {
    avgEngagement: number
    totalContributions: number
    retentionRate: number
    growthRate: number
  }
}

interface SegmentRule {
  field: string
  operator: string
  value: string
}

interface Props {
  campaignId: string
}

const PREDEFINED_SEGMENTS: AudienceSegment[] = [
  {
    id: 'power-users',
    name: 'Power Users',
    description: 'Most active contributors with multiple interactions',
    memberCount: 0,
    color: 'from-amber-500 to-orange-600',
    badge: 'bg-amber-100 text-amber-700',
    criteria: ['5+ contributions', 'Active within 7 days', 'High engagement score'],
    activityScore: 95,
    lastUpdated: new Date().toISOString(),
    stats: {
      avgEngagement: 8.5,
      totalContributions: 45000,
      retentionRate: 94,
      growthRate: 12,
    },
  },
  {
    id: 'new-supporters',
    name: 'New Supporters',
    description: 'Recently joined supporters',
    memberCount: 0,
    color: 'from-green-500 to-emerald-600',
    badge: 'bg-green-100 text-green-700',
    criteria: ['Joined within 30 days', 'Initial contribution made'],
    activityScore: 72,
    lastUpdated: new Date().toISOString(),
    stats: {
      avgEngagement: 6.2,
      totalContributions: 8200,
      retentionRate: 78,
      growthRate: 25,
    },
  },
  {
    id: 'dormant',
    name: 'Dormant Supporters',
    description: 'Inactive for more than 60 days',
    memberCount: 0,
    color: 'from-gray-500 to-slate-600',
    badge: 'bg-gray-100 text-gray-700',
    criteria: ['No activity for 60+ days', 'Previous contributor'],
    activityScore: 15,
    lastUpdated: new Date().toISOString(),
    stats: {
      avgEngagement: 2.1,
      totalContributions: 3400,
      retentionRate: 12,
      growthRate: -8,
    },
  },
  {
    id: 'top-voters',
    name: 'Top Voters',
    description: 'Frequent voters on polls and proposals',
    memberCount: 0,
    color: 'from-purple-500 to-indigo-600',
    badge: 'bg-purple-100 text-purple-700',
    criteria: ['10+ votes cast', 'Regular voter', 'High voting consistency'],
    activityScore: 88,
    lastUpdated: new Date().toISOString(),
    stats: {
      avgEngagement: 7.8,
      totalContributions: 12500,
      retentionRate: 91,
      growthRate: 15,
    },
  },
  {
    id: 'social-sharers',
    name: 'Social Sharers',
    description: 'Actively sharing campaign on social media',
    memberCount: 0,
    color: 'from-pink-500 to-rose-600',
    badge: 'bg-pink-100 text-pink-700',
    criteria: ['5+ social shares', 'Recent activity', 'High amplification impact'],
    activityScore: 82,
    lastUpdated: new Date().toISOString(),
    stats: {
      avgEngagement: 7.4,
      totalContributions: 6800,
      retentionRate: 86,
      growthRate: 18,
    },
  },
]

const ACTIVITY_SPARKLINE = [65, 78, 72, 85, 88, 92, 95, 89, 94, 97]

export function AudienceSegments({ campaignId }: Props) {
  const [segments, setSegments] = useState<AudienceSegment[]>(PREDEFINED_SEGMENTS)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedSegments, setSelectedSegments] = useState<string[]>([])
  const [showComparison, setShowComparison] = useState(false)
  const [showCreateCustom, setShowCreateCustom] = useState(false)
  const [expandedSegment, setExpandedSegment] = useState<string | null>(null)
  const [customRules, setCustomRules] = useState<SegmentRule[]>([
    { field: 'contributions', operator: 'gte', value: '5' },
  ])
  const [customName, setCustomName] = useState('')
  const [customDescription, setCustomDescription] = useState('')

  // Load segments on mount
  useEffect(() => {
    fetchSegments()
  }, [campaignId])

  const fetchSegments = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/campaigns/${campaignId}/segments`)
      const data = await response.json()

      if (data.success && data.data) {
        setSegments(data.data)
      } else {
        setError(data.error || 'Failed to load segments')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setLoading(false)
    }
  }

  const handleCreateSegment = async () => {
    if (!customName) {
      setError('Segment name is required')
      return
    }

    try {
      const response = await fetch(`/api/campaigns/${campaignId}/segments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: customName,
          description: customDescription,
          rules: customRules,
        }),
      })

      const data = await response.json()

      if (data.success) {
        setCustomName('')
        setCustomDescription('')
        setCustomRules([{ field: 'contributions', operator: 'gte', value: '5' }])
        setShowCreateCustom(false)
        await fetchSegments()
      } else {
        setError(data.error || 'Failed to create segment')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
    }
  }

  const toggleSegmentSelection = (segmentId: string) => {
    setSelectedSegments((prev) =>
      prev.includes(segmentId)
        ? prev.filter((id) => id !== segmentId)
        : [...prev, segmentId]
    )
  }

  const getSegmentColor = (segment: AudienceSegment) => {
    const colorMap: Record<string, string> = {
      'power-users': 'amber',
      'new-supporters': 'green',
      'dormant': 'gray',
      'top-voters': 'purple',
      'social-sharers': 'pink',
    }
    return colorMap[segment.id] || 'violet'
  }

  const ActivitySparkline = ({ scores = ACTIVITY_SPARKLINE }: { scores?: number[] }) => {
    const maxScore = Math.max(...scores)
    const minScore = Math.min(...scores)
    const range = maxScore - minScore || 1

    return (
      <div className="flex items-end gap-1 h-8">
        {scores.map((score, idx) => {
          const height = ((score - minScore) / range) * 100 + 10
          return (
            <div
              key={idx}
              className="flex-1 bg-violet-400 rounded-t-sm opacity-70 hover:opacity-100 transition-opacity"
              style={{ height: `${height}%`, minHeight: '4px' }}
              title={`Day ${idx + 1}: ${score}`}
            />
          )
        })}
      </div>
    )
  }

  const SegmentCard = ({ segment }: { segment: AudienceSegment }) => {
    const isSelected = selectedSegments.includes(segment.id)
    const isExpanded = expandedSegment === segment.id

    return (
      <div
        className={cn(
          'group relative bg-white rounded-lg border-2 transition-all duration-200 cursor-pointer overflow-hidden',
          isSelected ? 'border-violet-500 bg-violet-50' : 'border-gray-200 hover:border-violet-300'
        )}
        onClick={() => toggleSegmentSelection(segment.id)}
      >
        {/* Header with gradient */}
        <div className={cn('bg-gradient-to-r p-4 text-white', `from-${getSegmentColor(segment)}-500 to-${getSegmentColor(segment)}-600`)}>
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h3 className="font-bold text-lg">{segment.name}</h3>
              <p className="text-sm opacity-90">{segment.description}</p>
            </div>
            <div className="text-right">
              <div className={cn('px-3 py-1 rounded-full text-sm font-medium', segment.badge)}>
                {segment.activityScore}%
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-4 space-y-3">
          {/* Member count */}
          <div className="flex items-center gap-3 bg-gray-50 p-3 rounded-lg">
            <Users className="w-5 h-5 text-violet-600" />
            <div className="flex-1">
              <p className="text-sm text-gray-600">Members</p>
              <p className="text-xl font-bold text-gray-900">
                {segment.memberCount.toLocaleString()}
              </p>
            </div>
            <TrendingUp className="w-5 h-5 text-green-500" />
          </div>

          {/* Criteria badges */}
          <div>
            <p className="text-xs font-semibold text-gray-700 mb-2">Criteria</p>
            <div className="flex flex-wrap gap-2">
              {segment.criteria.map((criterion, idx) => (
                <span
                  key={idx}
                  className="inline-block bg-gray-100 text-gray-700 text-xs px-2 py-1 rounded-full"
                >
                  {criterion}
                </span>
              ))}
            </div>
          </div>

          {/* Activity sparkline */}
          {!isExpanded && (
            <div>
              <p className="text-xs font-semibold text-gray-700 mb-2">Recent Activity</p>
              <ActivitySparkline />
            </div>
          )}

          {/* Expanded details */}
          {isExpanded && segment.stats && (
            <div className="space-y-2 pt-2 border-t">
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-blue-50 p-3 rounded-lg">
                  <p className="text-xs text-gray-600">Avg Engagement</p>
                  <p className="text-lg font-bold text-blue-700">{segment.stats.avgEngagement.toFixed(1)}</p>
                </div>
                <div className="bg-green-50 p-3 rounded-lg">
                  <p className="text-xs text-gray-600">Retention Rate</p>
                  <p className="text-lg font-bold text-green-700">{segment.stats.retentionRate}%</p>
                </div>
                <div className="bg-purple-50 p-3 rounded-lg">
                  <p className="text-xs text-gray-600">Total Contributions</p>
                  <p className="text-lg font-bold text-purple-700">
                    {(segment.stats.totalContributions / 1000).toFixed(1)}K
                  </p>
                </div>
                <div className={cn(
                  'p-3 rounded-lg',
                  segment.stats.growthRate > 0 ? 'bg-green-50' : 'bg-red-50'
                )}>
                  <p className="text-xs text-gray-600">Growth Rate</p>
                  <p className={cn(
                    'text-lg font-bold',
                    segment.stats.growthRate > 0 ? 'text-green-700' : 'text-red-700'
                  )}>
                    {segment.stats.growthRate > 0 ? '+' : ''}{segment.stats.growthRate}%
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer actions */}
        <div className="px-4 py-3 border-t bg-gray-50 flex items-center justify-between gap-2">
          <button
            onClick={(e) => {
              e.stopPropagation()
              setExpandedSegment(isExpanded ? null : segment.id)
            }}
            className="flex items-center gap-1 text-sm text-violet-600 hover:text-violet-700 font-medium"
          >
            <Eye className="w-4 h-4" />
            {isExpanded ? 'Less' : 'More'}
          </button>
          <div className="flex gap-2">
            <button
              onClick={(e) => {
                e.stopPropagation()
                // Handle export
              }}
              className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
              title="Export segment"
            >
              <Share2 className="w-4 h-4 text-gray-600" />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation()
              }}
              className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
              title="View members"
            >
              <Users className="w-4 h-4 text-gray-600" />
            </button>
          </div>
        </div>

        {/* Selection indicator */}
        {isSelected && (
          <div className="absolute top-3 right-3 w-6 h-6 bg-violet-600 rounded-full flex items-center justify-center">
            <div className="w-2 h-2 bg-white rounded-full" />
          </div>
        )}
      </div>
    )
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-violet-600" />
          <p className="mt-2 text-gray-600">Loading segments...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Audience Segments</h2>
          <p className="text-gray-600 mt-1">Organize supporters into groups for targeted engagement</p>
        </div>
        <div className="flex gap-3">
          {selectedSegments.length > 0 && (
            <Button
              onClick={() => setShowComparison(!showComparison)}
              variant="outline"
              size="sm"
            >
              <BarChart3 className="w-4 h-4 mr-2" />
              Compare ({selectedSegments.length})
            </Button>
          )}
          <Button
            onClick={() => setShowCreateCustom(!showCreateCustom)}
            variant="primary"
            size="sm"
          >
            <Plus className="w-4 h-4 mr-2" />
            Custom Segment
          </Button>
        </div>
      </div>

      {/* Error message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center justify-between">
          <p className="text-red-700">{error}</p>
          <button
            onClick={() => setError(null)}
            className="text-red-700 hover:text-red-800"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Create custom segment form */}
      {showCreateCustom && (
        <div className="bg-white border-2 border-violet-200 rounded-lg p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Create Custom Segment</h3>

          <div className="space-y-4">
            {/* Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Segment Name
              </label>
              <input
                type="text"
                value={customName}
                onChange={(e) => setCustomName(e.target.value)}
                placeholder="e.g., Premium Tier Supporters"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500"
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <textarea
                value={customDescription}
                onChange={(e) => setCustomDescription(e.target.value)}
                placeholder="What defines this segment?"
                rows={2}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500"
              />
            </div>

            {/* Rules */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Segment Rules
              </label>
              {customRules.map((rule, idx) => (
                <div key={idx} className="flex gap-2 mb-2">
                  <select
                    value={rule.field}
                    onChange={(e) => {
                      const newRules = [...customRules]
                      newRules[idx].field = e.target.value
                      setCustomRules(newRules)
                    }}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm"
                  >
                    <option value="contributions">Contributions</option>
                    <option value="daysInactive">Days Inactive</option>
                    <option value="votes">Votes Cast</option>
                    <option value="shares">Social Shares</option>
                    <option value="joinDate">Join Date</option>
                  </select>
                  <select
                    value={rule.operator}
                    onChange={(e) => {
                      const newRules = [...customRules]
                      newRules[idx].operator = e.target.value
                      setCustomRules(newRules)
                    }}
                    className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
                  >
                    <option value="gte">≥</option>
                    <option value="lte">≤</option>
                    <option value="eq">=</option>
                    <option value="gt">{">"}</option>
                    <option value="lt">{"<"}</option>
                  </select>
                  <input
                    type="text"
                    value={rule.value}
                    onChange={(e) => {
                      const newRules = [...customRules]
                      newRules[idx].value = e.target.value
                      setCustomRules(newRules)
                    }}
                    placeholder="Value"
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm"
                  />
                  <button
                    onClick={() => {
                      setCustomRules(customRules.filter((_, i) => i !== idx))
                    }}
                    className="px-3 py-2 hover:bg-red-50 text-red-600 rounded-lg transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}
              <button
                onClick={() => {
                  setCustomRules([...customRules, { field: 'contributions', operator: 'gte', value: '' }])
                }}
                className="text-sm text-violet-600 hover:text-violet-700 font-medium mt-2"
              >
                + Add Rule
              </button>
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-4">
              <Button
                onClick={handleCreateSegment}
                variant="primary"
              >
                Create Segment
              </Button>
              <Button
                onClick={() => {
                  setShowCreateCustom(false)
                  setCustomName('')
                  setCustomDescription('')
                  setCustomRules([{ field: 'contributions', operator: 'gte', value: '5' }])
                }}
                variant="outline"
              >
                Cancel
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Segments grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {segments.map((segment) => (
          <SegmentCard key={segment.id} segment={segment} />
        ))}
      </div>

      {/* Segment comparison */}
      {showComparison && selectedSegments.length > 0 && (
        <div className="bg-white rounded-lg border-2 border-violet-200 p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4">
            Segment Comparison ({selectedSegments.length} selected)
          </h3>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left font-semibold text-gray-700">Metric</th>
                  {segments
                    .filter((s) => selectedSegments.includes(s.id))
                    .map((segment) => (
                      <th
                        key={segment.id}
                        className="px-4 py-3 text-center font-semibold text-gray-700"
                      >
                        {segment.name}
                      </th>
                    ))}
                </tr>
              </thead>
              <tbody>
                <tr className="border-t">
                  <td className="px-4 py-3 font-medium text-gray-700">Members</td>
                  {segments
                    .filter((s) => selectedSegments.includes(s.id))
                    .map((segment) => (
                      <td key={segment.id} className="px-4 py-3 text-center text-gray-900">
                        {segment.memberCount.toLocaleString()}
                      </td>
                    ))}
                </tr>
                <tr className="border-t bg-gray-50">
                  <td className="px-4 py-3 font-medium text-gray-700">Activity Score</td>
                  {segments
                    .filter((s) => selectedSegments.includes(s.id))
                    .map((segment) => (
                      <td key={segment.id} className="px-4 py-3 text-center">
                        <div className="inline-block bg-violet-100 text-violet-700 px-2 py-1 rounded-full text-xs font-bold">
                          {segment.activityScore}%
                        </div>
                      </td>
                    ))}
                </tr>
                {segments[0]?.stats && (
                  <>
                    <tr className="border-t">
                      <td className="px-4 py-3 font-medium text-gray-700">Avg Engagement</td>
                      {segments
                        .filter((s) => selectedSegments.includes(s.id))
                        .map((segment) => (
                          <td key={segment.id} className="px-4 py-3 text-center text-gray-900">
                            {segment.stats?.avgEngagement.toFixed(1) || '-'}
                          </td>
                        ))}
                    </tr>
                    <tr className="border-t bg-gray-50">
                      <td className="px-4 py-3 font-medium text-gray-700">Retention Rate</td>
                      {segments
                        .filter((s) => selectedSegments.includes(s.id))
                        .map((segment) => (
                          <td key={segment.id} className="px-4 py-3 text-center text-gray-900">
                            {segment.stats?.retentionRate}%
                          </td>
                        ))}
                    </tr>
                    <tr className="border-t">
                      <td className="px-4 py-3 font-medium text-gray-700">Growth Rate</td>
                      {segments
                        .filter((s) => selectedSegments.includes(s.id))
                        .map((segment) => (
                          <td key={segment.id} className="px-4 py-3 text-center">
                            <span className={segment.stats && segment.stats.growthRate > 0 ? 'text-green-700 font-bold' : 'text-red-700 font-bold'}>
                              {segment.stats && segment.stats.growthRate > 0 ? '+' : ''}{segment.stats?.growthRate}%
                            </span>
                          </td>
                        ))}
                    </tr>
                  </>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
