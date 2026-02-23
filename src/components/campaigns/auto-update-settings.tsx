'use client'

import React, { useState, useEffect } from 'react'
import { AlertCircle, Clock, Settings, CheckCircle } from 'lucide-react'
import { cn } from '@/lib/utils'

interface AutoUpdateSettings {
  campaignId: string
  enabled: boolean
  frequency: 'daily' | 'weekly' | 'monthly'
  includeStats: boolean
  includeComments: boolean
  lastSentAt?: string
  nextScheduledUpdate?: string
}

interface AutoUpdateSettingsProps {
  campaignId: string
  onSettingsSaved?: (settings: AutoUpdateSettings) => void
}

export const AutoUpdateSettings: React.FC<AutoUpdateSettingsProps> = ({
  campaignId,
  onSettingsSaved,
}) => {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const [settings, setSettings] = useState<AutoUpdateSettings>({
    campaignId,
    enabled: false,
    frequency: 'weekly',
    includeStats: true,
    includeComments: true,
  })

  // Fetch current settings
  useEffect(() => {
    const fetchSettings = async () => {
      try {
        setLoading(true)
        const response = await fetch(`/api/campaigns/${campaignId}/auto-updates`)

        if (!response.ok) {
          throw new Error('Failed to fetch auto-update settings')
        }

        const data = await response.json()
        setSettings(data)
        setError(null)
      } catch (err) {
        const message = err instanceof Error ? err.message : 'An error occurred'
        setError(message)
      } finally {
        setLoading(false)
      }
    }

    fetchSettings()
  }, [campaignId])

  const handleToggleEnabled = async (newEnabled: boolean) => {
    setSaving(true)
    setSuccess(false)

    try {
      const response = await fetch(`/api/campaigns/${campaignId}/auto-updates`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          enabled: newEnabled,
          frequency: settings.frequency,
          includeStats: settings.includeStats,
          includeComments: settings.includeComments,
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to update auto-update settings')
      }

      const data = await response.json()
      setSettings(data)
      setError(null)
      setSuccess(true)
      onSettingsSaved?.(data)

      setTimeout(() => setSuccess(false), 3000)
    } catch (err) {
      const message = err instanceof Error ? err.message : 'An error occurred'
      setError(message)
    } finally {
      setSaving(false)
    }
  }

  const handleFrequencyChange = async (newFrequency: 'daily' | 'weekly' | 'monthly') => {
    setSaving(true)
    setSuccess(false)

    try {
      const response = await fetch(`/api/campaigns/${campaignId}/auto-updates`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          enabled: settings.enabled,
          frequency: newFrequency,
          includeStats: settings.includeStats,
          includeComments: settings.includeComments,
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to update frequency')
      }

      const data = await response.json()
      setSettings(data)
      setError(null)
      setSuccess(true)
      onSettingsSaved?.(data)

      setTimeout(() => setSuccess(false), 3000)
    } catch (err) {
      const message = err instanceof Error ? err.message : 'An error occurred'
      setError(message)
    } finally {
      setSaving(false)
    }
  }

  const handleCheckboxChange = async (field: 'includeStats' | 'includeComments', value: boolean) => {
    setSaving(true)
    setSuccess(false)

    try {
      const updateData: any = {
        enabled: settings.enabled,
        frequency: settings.frequency,
        includeStats: settings.includeStats,
        includeComments: settings.includeComments,
      }

      updateData[field] = value

      const response = await fetch(`/api/campaigns/${campaignId}/auto-updates`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updateData),
      })

      if (!response.ok) {
        throw new Error('Failed to update settings')
      }

      const data = await response.json()
      setSettings(data)
      setError(null)
      setSuccess(true)
      onSettingsSaved?.(data)

      setTimeout(() => setSuccess(false), 3000)
    } catch (err) {
      const message = err instanceof Error ? err.message : 'An error occurred'
      setError(message)
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <p className="text-gray-500">Loading auto-update settings...</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-2">
        <Clock className="w-5 h-5 text-blue-600" />
        <h3 className="text-lg font-semibold">Auto-Update Schedule</h3>
      </div>

      {/* Error Message */}
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      {/* Success Message */}
      {success && (
        <div className="p-4 bg-green-50 border border-green-200 rounded-lg flex items-start gap-3">
          <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-green-700">Settings saved successfully</p>
        </div>
      )}

      {/* Enable Toggle */}
      <div className="border rounded-lg p-4 space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <p className="font-medium">Enable Auto-Updates</p>
            <p className="text-sm text-gray-600">Automatically send campaign updates to supporters</p>
          </div>
          <button
            onClick={() => handleToggleEnabled(!settings.enabled)}
            disabled={saving}
            className={cn(
              'relative inline-flex h-8 w-14 items-center rounded-full transition-colors',
              settings.enabled ? 'bg-blue-600' : 'bg-gray-300',
              saving && 'opacity-50 cursor-not-allowed'
            )}
          >
            <span
              className={cn(
                'inline-block h-6 w-6 transform rounded-full bg-white transition-transform',
                settings.enabled ? 'translate-x-7' : 'translate-x-1'
              )}
            />
          </button>
        </div>
      </div>

      {/* Settings (only show if enabled) */}
      {settings.enabled && (
        <div className="space-y-4 border rounded-lg p-4 bg-blue-50">
          {/* Frequency Selector */}
          <div className="space-y-2">
            <label className="font-medium text-sm">Update Frequency</label>
            <div className="grid grid-cols-3 gap-2">
              {(['daily', 'weekly', 'monthly'] as const).map((freq) => (
                <button
                  key={freq}
                  onClick={() => handleFrequencyChange(freq)}
                  disabled={saving}
                  className={cn(
                    'py-2 px-3 rounded-lg text-sm font-medium transition-colors capitalize',
                    settings.frequency === freq
                      ? 'bg-blue-600 text-white'
                      : 'bg-white text-gray-700 border border-gray-300 hover:border-blue-400',
                    saving && 'opacity-50 cursor-not-allowed'
                  )}
                >
                  {freq}
                </button>
              ))}
            </div>
          </div>

          {/* Include Checkboxes */}
          <div className="space-y-2 border-t pt-3">
            <p className="font-medium text-sm">Include in Updates</p>

            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={settings.includeStats}
                onChange={(e) => handleCheckboxChange('includeStats', e.target.checked)}
                disabled={saving}
                className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm">Campaign Statistics</span>
            </label>

            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={settings.includeComments}
                onChange={(e) => handleCheckboxChange('includeComments', e.target.checked)}
                disabled={saving}
                className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm">Comments Digest</span>
            </label>
          </div>

          {/* Next Scheduled Update */}
          {settings.nextScheduledUpdate && (
            <div className="border-t pt-3 text-sm">
              <p className="text-gray-600">
                Next scheduled update:{' '}
                <span className="font-medium text-gray-900">
                  {new Date(settings.nextScheduledUpdate).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </span>
              </p>
            </div>
          )}
        </div>
      )}

      {/* Info Box */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <p className="text-sm text-gray-700">
          <strong>What are auto-updates?</strong> Automated campaign updates are sent to your supporters based on your
          configured frequency. Include statistics to showcase campaign growth and momentum, or add a comments digest to
          highlight recent community feedback.
        </p>
      </div>
    </div>
  )
}
