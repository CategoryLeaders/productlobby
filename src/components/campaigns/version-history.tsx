'use client'

import React, { useState, useEffect, useCallback } from 'react'
import {
  GitBranch,
  Clock,
  User,
  ChevronDown,
  Loader2,
} from 'lucide-react'
import { formatRelativeTime, cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Avatar } from '@/components/ui/avatar'

interface VersionChange {
  field: string
  oldValue: string
  newValue: string
}

interface CampaignVersion {
  id: string
  versionNumber: number
  createdAt: string
  editor: {
    id: string
    displayName: string
    avatar?: string
  }
  metadata?: {
    action?: string
    changes?: VersionChange[]
    summary?: string
  }
}

interface VersionHistoryProps {
  campaignId: string
}

const VersionSkeleton = () => (
  <div className="space-y-4">
    {[1, 2, 3].map((i) => (
      <div key={i} className="border rounded-lg p-4 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3 flex-1">
            <div className="w-10 h-10 rounded-full bg-gray-200 animate-pulse" />
            <div className="flex-1">
              <div className="h-4 bg-gray-200 rounded w-48 mb-2 animate-pulse" />
              <div className="h-3 bg-gray-100 rounded w-32 animate-pulse" />
            </div>
          </div>
          <div className="w-20 h-4 bg-gray-200 rounded animate-pulse" />
        </div>
      </div>
    ))}
  </div>
)

export function VersionHistory({ campaignId }: VersionHistoryProps) {
  const [versions, setVersions] = useState<CampaignVersion[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [expandedVersions, setExpandedVersions] = useState<Set<string>>(new Set())

  const fetchVersions = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      const response = await fetch(
        `/api/campaigns/${campaignId}/versions`,
        {
          method: 'GET',
        }
      )

      if (!response.ok) {
        throw new Error('Failed to fetch version history')
      }

      const data = await response.json()
      setVersions(data.versions || [])
    } catch (err) {
      console.error('Error fetching versions:', err)
      setError(err instanceof Error ? err.message : 'Failed to load versions')
    } finally {
      setLoading(false)
    }
  }, [campaignId])

  useEffect(() => {
    fetchVersions()
  }, [fetchVersions])

  const toggleExpanded = (versionId: string) => {
    const newExpanded = new Set(expandedVersions)
    if (newExpanded.has(versionId)) {
      newExpanded.delete(versionId)
    } else {
      newExpanded.add(versionId)
    }
    setExpandedVersions(newExpanded)
  }

  const isLatestVersion = (index: number) => index === 0
  const isCurrentVersion = (index: number) => index === 0

  if (loading) {
    return <VersionSkeleton />
  }

  if (error) {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-red-700">
        <p className="font-medium">Error loading version history</p>
        <p className="text-sm mt-1">{error}</p>
        <Button
          size="sm"
          variant="outline"
          onClick={fetchVersions}
          className="mt-3 border-red-300 text-red-700 hover:bg-red-100"
        >
          Try again
        </Button>
      </div>
    )
  }

  if (versions.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-gray-300 p-6 text-center">
        <GitBranch className="w-8 h-8 text-gray-400 mx-auto mb-2" />
        <p className="text-gray-600">No version history yet</p>
        <p className="text-sm text-gray-500">Changes will appear here as you edit the campaign</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 text-sm font-medium text-gray-700">
        <GitBranch className="w-4 h-4" />
        <span>Campaign Version History ({versions.length})</span>
      </div>

      <div className="space-y-3">
        {versions.map((version, index) => {
          const isExpanded = expandedVersions.has(version.id)
          const isCurrent = isCurrentVersion(index)

          return (
            <div
              key={version.id}
              className={cn(
                'rounded-lg border transition-colors',
                isCurrent
                  ? 'border-blue-300 bg-blue-50'
                  : 'border-gray-200 bg-white hover:border-gray-300'
              )}
            >
              {/* Version Header */}
              <button
                onClick={() => toggleExpanded(version.id)}
                className="w-full px-4 py-3 flex items-center justify-between hover:bg-gray-50/50 group transition-colors"
              >
                <div className="flex items-center gap-3 flex-1 text-left">
                  {/* Avatar */}
                  <div className="flex-shrink-0">
                    {version.editor.avatar ? (
                      <img
                        src={version.editor.avatar}
                        alt={version.editor.displayName}
                        className="w-10 h-10 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white text-sm font-medium">
                        {version.editor.displayName
                          .split(' ')
                          .map((n) => n[0])
                          .join('')
                          .toUpperCase()
                          .slice(0, 2)}
                      </div>
                    )}
                  </div>

                  {/* Version Details */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-medium text-gray-900">
                        Version {version.versionNumber}
                      </span>
                      {isCurrent && (
                        <span className="inline-flex items-center rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-medium text-blue-700">
                          Current
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-4 mt-1 text-sm text-gray-600">
                      <div className="flex items-center gap-1">
                        <User className="w-3.5 h-3.5" />
                        <span>{version.editor.displayName}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" />
                        <span>{formatRelativeTime(version.createdAt)}</span>
                      </div>
                    </div>
                    {version.metadata?.summary && (
                      <p className="text-sm text-gray-600 mt-1">
                        {version.metadata.summary}
                      </p>
                    )}
                  </div>
                </div>

                {/* Expand Button */}
                {version.metadata?.changes && version.metadata.changes.length > 0 && (
                  <div className="flex-shrink-0 ml-4">
                    <ChevronDown
                      className={cn(
                        'w-5 h-5 text-gray-400 transition-transform',
                        isExpanded ? 'rotate-180' : ''
                      )}
                    />
                  </div>
                )}
              </button>

              {/* Expanded Diff View */}
              {isExpanded && version.metadata?.changes && version.metadata.changes.length > 0 && (
                <div className="border-t border-gray-200 bg-gray-50/50 px-4 py-3 space-y-2">
                  <p className="text-xs font-medium text-gray-600 mb-3">Changes:</p>
                  <div className="space-y-2">
                    {version.metadata.changes.map((change, changeIndex) => (
                      <div
                        key={changeIndex}
                        className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm font-mono text-xs"
                      >
                        <div className="rounded bg-red-50 border border-red-200 p-2">
                          <p className="text-gray-600 mb-1 font-sans">
                            <span className="font-semibold text-gray-700">{change.field}</span>
                          </p>
                          <p className="text-red-700 break-words">{change.oldValue}</p>
                        </div>
                        <div className="rounded bg-green-50 border border-green-200 p-2">
                          <p className="text-gray-600 mb-1 font-sans">
                            <span className="font-semibold text-gray-700">{change.field}</span>
                          </p>
                          <p className="text-green-700 break-words">{change.newValue}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* No Changes Indicator */}
              {isExpanded && (!version.metadata?.changes || version.metadata.changes.length === 0) && (
                <div className="border-t border-gray-200 bg-gray-50/50 px-4 py-3 text-sm text-gray-600">
                  No detailed changes recorded
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
