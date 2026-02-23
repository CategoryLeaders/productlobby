'use client'

import React, { useState, useEffect } from 'react'
import { AlertTriangle, Clock, Archive, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface AutoArchiveWarningProps {
  campaignId: string
  onExtendActivity?: () => void
}

interface ArchiveStatus {
  lastActivityDate: string | null
  daysUntilArchive: number
  status: 'safe' | 'warning' | 'critical'
  isArchived: boolean
}

export const AutoArchiveWarning: React.FC<AutoArchiveWarningProps> = ({
  campaignId,
  onExtendActivity,
}) => {
  const [archiveStatus, setArchiveStatus] = useState<ArchiveStatus | null>(null)
  const [loading, setLoading] = useState(true)
  const [extending, setExtending] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (!mounted) return

    const fetchArchiveStatus = async () => {
      try {
        setLoading(true)
        setError(null)
        const response = await fetch(
          `/api/campaigns/${campaignId}/archive-status`
        )
        if (!response.ok) throw new Error('Failed to fetch archive status')
        const data = await response.json()
        setArchiveStatus(data)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred')
      } finally {
        setLoading(false)
      }
    }

    fetchArchiveStatus()
  }, [campaignId, mounted])

  const handleExtendActivity = async () => {
    try {
      setExtending(true)
      const response = await fetch(
        `/api/campaigns/${campaignId}/archive-status`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'extend' }),
        }
      )
      if (!response.ok) throw new Error('Failed to extend activity')
      const data = await response.json()
      setArchiveStatus(data)
      onExtendActivity?.()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to extend activity')
    } finally {
      setExtending(false)
    }
  }

  if (!mounted || loading) {
    return (
      <div className="flex items-center justify-center p-4">
        <Loader2 className="h-4 w-4 animate-spin text-gray-400" />
      </div>
    )
  }

  if (!archiveStatus || error) return null

  if (archiveStatus.isArchived) {
    return (
      <div className="rounded-lg bg-gray-100 border border-gray-300 p-4">
        <div className="flex items-start gap-3">
          <Archive className="h-5 w-5 text-gray-600 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <h3 className="font-semibold text-gray-900">Campaign Archived</h3>
            <p className="text-sm text-gray-600 mt-1">
              This campaign has been archived due to inactivity for 180 days.
              You can still view it, but it won't appear in active lists.
            </p>
          </div>
        </div>
      </div>
    )
  }

  if (archiveStatus.status === 'safe') return null

  const isWarning = archiveStatus.status === 'warning'
  const isCritical = archiveStatus.status === 'critical'

  const bgColor = isCritical ? 'bg-red-50' : 'bg-yellow-50'
  const borderColor = isCritical ? 'border-red-200' : 'border-yellow-200'
  const textColor = isCritical ? 'text-red-900' : 'text-yellow-900'
  const subTextColor = isCritical ? 'text-red-700' : 'text-yellow-700'
  const iconColor = isCritical ? 'text-red-500' : 'text-yellow-500'

  const lastActivityFormatted = archiveStatus.lastActivityDate
    ? new Date(archiveStatus.lastActivityDate).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      })
    : 'Never'

  return (
    <div
      className={cn(
        'rounded-lg border p-4',
        bgColor,
        borderColor
      )}
    >
      <div className="flex items-start gap-3">
        <AlertTriangle className={cn('h-5 w-5 flex-shrink-0 mt-0.5', iconColor)} />
        <div className="flex-1">
          <h3 className={cn('font-semibold', textColor)}>
            {isCritical
              ? 'Campaign Auto-Archive Alert'
              : 'Campaign Auto-Archive Warning'}
          </h3>
          <p className={cn('text-sm mt-1', subTextColor)}>
            {isCritical
              ? `Your campaign will be auto-archived in ${archiveStatus.daysUntilArchive} days due to inactivity.`
              : `Your campaign will be auto-archived in ${archiveStatus.daysUntilArchive} days if inactive.`}
          </p>
          <div className="flex items-center gap-4 mt-3 text-sm">
            <div className="flex items-center gap-1.5">
              <Clock className={cn('h-4 w-4', iconColor)} />
              <span className={subTextColor}>
                Last activity: {lastActivityFormatted}
              </span>
            </div>
          </div>
          <Button
            onClick={handleExtendActivity}
            disabled={extending}
            variant={isCritical ? 'primary' : 'secondary'}
            size="sm"
            className="mt-3"
          >
            {extending ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Extending...
              </>
            ) : (
              <>
                <Clock className="h-4 w-4 mr-2" />
                Extend Activity
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  )
}

export default AutoArchiveWarning
