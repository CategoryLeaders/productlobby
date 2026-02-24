'use client'

import React, { useState, useEffect } from 'react'
import { GitBranch, RotateCcw, User, Calendar, AlertCircle } from 'lucide-react'
import { formatRelativeTime, cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'

interface Version {
  id: string
  version: string
  changes: string[]
  author: string
  createdAt: string
  type: 'major' | 'minor' | 'patch'
}

interface VersionHistoryProps {
  campaignId: string
}

export default function VersionHistory({ campaignId }: VersionHistoryProps) {
  const [versions, setVersions] = useState<Version[]>([])
  const [loading, setLoading] = useState(true)
  const [restoring, setRestoring] = useState<string | null>(null)

  useEffect(() => {
    fetchVersions()
  }, [campaignId])

  const fetchVersions = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/campaigns/${campaignId}/version-history`)
      const data = await response.json()
      if (data.success) {
        setVersions(data.data || [])
      }
    } catch (error) {
      console.error('Failed to fetch versions:', error)
      toast.error('Failed to load version history')
    } finally {
      setLoading(false)
    }
  }

  const restoreVersion = async (versionId: string) => {
    try {
      setRestoring(versionId)
      const response = await fetch(`/api/campaigns/${campaignId}/version-history`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ versionId }),
      })
      const data = await response.json()
      if (data.success) {
        toast.success('Version restored successfully')
        await fetchVersions()
      } else {
        toast.error(data.error || 'Failed to restore version')
      }
    } catch (error) {
      console.error('Failed to restore version:', error)
      toast.error('Failed to restore version')
    } finally {
      setRestoring(null)
    }
  }

  const getTypeBadgeStyle = (type: 'major' | 'minor' | 'patch') => {
    switch (type) {
      case 'major':
        return 'bg-violet-100 text-violet-700 border-violet-200'
      case 'minor':
        return 'bg-lime-100 text-lime-700 border-lime-200'
      case 'patch':
        return 'bg-blue-100 text-blue-700 border-blue-200'
    }
  }

  return (
    <div className="w-full bg-white rounded-lg border border-gray-200">
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-violet-100 rounded-lg">
            <GitBranch className="w-5 h-5 text-violet-600" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900">Version History</h2>
            <p className="text-sm text-gray-600">Track all campaign changes and restore previous versions</p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-violet-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Loading version history...</p>
            </div>
          </div>
        ) : versions.length === 0 ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <AlertCircle className="w-8 h-8 text-gray-400 mx-auto mb-2" />
              <p className="text-gray-600">No version history available</p>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {versions.map((version, index) => (
              <div
                key={version.id}
                className="border border-gray-200 rounded-lg p-4 hover:border-violet-300 transition-colors"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 space-y-3">
                    {/* Version Header */}
                    <div className="flex items-center gap-3 flex-wrap">
                      <span className="text-lg font-bold text-gray-900">v{version.version}</span>
                      <span className={cn('px-2 py-1 rounded-full text-xs font-semibold border', getTypeBadgeStyle(version.type))}>
                        {version.type.charAt(0).toUpperCase() + version.type.slice(1)} Release
                      </span>
                      {index === 0 && (
                        <span className="px-2 py-1 bg-lime-100 text-lime-700 rounded-full text-xs font-semibold border border-lime-200">
                          Current
                        </span>
                      )}
                    </div>

                    {/* Metadata */}
                    <div className="flex items-center gap-4 text-sm text-gray-600">
                      <div className="flex items-center gap-1">
                        <User className="w-4 h-4" />
                        <span>{version.author}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        <span>{formatRelativeTime(new Date(version.createdAt))}</span>
                      </div>
                    </div>

                    {/* Changes */}
                    <div className="space-y-2">
                      <p className="text-sm font-semibold text-gray-700">Changes in this version:</p>
                      <ul className="space-y-1">
                        {version.changes.map((change, idx) => (
                          <li key={idx} className="text-sm text-gray-600 flex items-start gap-2">
                            <span className="text-violet-600 mt-1">•</span>
                            <span>{change}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  {/* Restore Button */}
                  {index !== 0 && (
                    <Button
                      onClick={() => restoreVersion(version.id)}
                      disabled={restoring === version.id}
                      variant="outline"
                      size="sm"
                      className="flex items-center gap-2 whitespace-nowrap"
                    >
                      <RotateCcw className="w-4 h-4" />
                      {restoring === version.id ? 'Restoring...' : 'Restore'}
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
