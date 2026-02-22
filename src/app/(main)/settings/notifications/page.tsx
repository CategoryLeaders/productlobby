'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { toast } from 'sonner'

interface NotificationPreferences {
  id: string
  userId: string
  emailDigestFrequency: 'DAILY' | 'WEEKLY' | 'NEVER'
  emailCampaignUpdates: boolean
  emailBrandResponses: boolean
  emailNewFollowers: boolean
  emailMilestones: boolean
  pushEnabled: boolean
  createdAt: string
  updatedAt: string
}

export default function NotificationSettingsPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [preferences, setPreferences] = useState<NotificationPreferences | null>(
    null
  )

  // Load preferences
  useEffect(() => {
    const loadPreferences = async () => {
      try {
        setLoading(true)
        const response = await fetch('/api/user/preferences')
        if (!response.ok) {
          throw new Error('Failed to load preferences')
        }
        const data = await response.json()
        setPreferences(data)
      } catch (error) {
        console.error('Error loading preferences:', error)
        toast.error('Failed to load your notification preferences')
      } finally {
        setLoading(false)
      }
    }

    loadPreferences()
  }, [])

  const handleToggle = (field: keyof NotificationPreferences) => {
    if (!preferences) return

    setPreferences((prev) => {
      if (!prev) return prev
      return {
        ...prev,
        [field]: !prev[field],
      }
    })
  }

  const handleFrequencyChange = (
    value: 'DAILY' | 'WEEKLY' | 'NEVER'
  ) => {
    if (!preferences) return

    setPreferences((prev) => {
      if (!prev) return prev
      return {
        ...prev,
        emailDigestFrequency: value,
      }
    })
  }

  const handleSave = async () => {
    if (!preferences) return

    try {
      setSaving(true)
      const response = await fetch('/api/user/preferences', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          emailDigestFrequency: preferences.emailDigestFrequency,
          emailCampaignUpdates: preferences.emailCampaignUpdates,
          emailBrandResponses: preferences.emailBrandResponses,
          emailNewFollowers: preferences.emailNewFollowers,
          emailMilestones: preferences.emailMilestones,
          pushEnabled: preferences.pushEnabled,
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to save preferences')
      }

      const updated = await response.json()
      setPreferences(updated)
      toast.success('Notification preferences saved successfully!')
    } catch (error) {
      console.error('Error saving preferences:', error)
      toast.error('Failed to save notification preferences')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="animate-pulse space-y-4">
          <div className="h-10 bg-gray-200 rounded w-1/3"></div>
          <div className="h-6 bg-gray-200 rounded w-1/2"></div>
          <div className="space-y-4 mt-8">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-12 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (!preferences) {
    return (
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="bg-white rounded-lg shadow p-8 text-center">
          <p className="text-gray-600 mb-4">
            Failed to load notification preferences
          </p>
          <button
            onClick={() => window.location.reload()}
            className="text-violet-600 hover:text-violet-700 font-semibold"
          >
            Try Again
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          {/* Header */}
          <div className="mb-8">
            <Link
              href="/dashboard"
              className="text-violet-600 hover:text-violet-700 text-sm font-medium mb-4 inline-flex items-center"
            >
              ← Back to Dashboard
            </Link>
            <h1 className="text-3xl font-bold text-gray-900 mt-2">
              Notification Settings
            </h1>
            <p className="text-gray-600 mt-2">
              Manage how you receive updates from ProductLobby
            </p>
          </div>

          <div className="space-y-6">
            {/* Email Digest Section */}
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-violet-600 to-violet-700">
                <h2 className="text-lg font-semibold text-white">
                  Email Digest
                </h2>
                <p className="text-violet-100 text-sm mt-1">
                  Receive a summary of your activity and updates
                </p>
              </div>

              <div className="px-6 py-6 space-y-6">
                {/* Digest Frequency */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Digest Frequency
                  </label>
                  <div className="space-y-2">
                    {(['DAILY', 'WEEKLY', 'NEVER'] as const).map((freq) => (
                      <label key={freq} className="flex items-center">
                        <input
                          type="radio"
                          name="digestFrequency"
                          value={freq}
                          checked={
                            preferences.emailDigestFrequency === freq
                          }
                          onChange={() => handleFrequencyChange(freq)}
                          disabled={saving}
                          className="h-4 w-4 text-violet-600 border-gray-300 focus:ring-violet-500"
                        />
                        <span className="ml-3 text-sm text-gray-700">
                          {freq === 'DAILY' && 'Daily digest'}
                          {freq === 'WEEKLY' && 'Weekly digest'}
                          {freq === 'NEVER' && 'Never send digests'}
                        </span>
                      </label>
                    ))}
                  </div>
                  <p className="text-sm text-gray-500 mt-2">
                    Select how often you'd like to receive digest emails
                  </p>
                </div>
              </div>
            </div>

            {/* Email Notifications Section */}
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-lime-500 to-lime-600">
                <h2 className="text-lg font-semibold text-white">
                  Email Notifications
                </h2>
                <p className="text-lime-50 text-sm mt-1">
                  Choose which types of emails you want to receive
                </p>
              </div>

              <div className="px-6 py-6 space-y-4">
                {/* Campaign Updates */}
                <div className="flex items-center justify-between py-4 border-b border-gray-100 last:border-b-0">
                  <div>
                    <h3 className="text-sm font-medium text-gray-900">
                      Campaign Updates
                    </h3>
                    <p className="text-sm text-gray-600 mt-1">
                      Get notified when campaigns you follow have new updates
                    </p>
                  </div>
                  <button
                    onClick={() => handleToggle('emailCampaignUpdates')}
                    disabled={saving}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      preferences.emailCampaignUpdates
                        ? 'bg-violet-600'
                        : 'bg-gray-300'
                    } ${saving ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        preferences.emailCampaignUpdates
                          ? 'translate-x-6'
                          : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>

                {/* Brand Responses */}
                <div className="flex items-center justify-between py-4 border-b border-gray-100 last:border-b-0">
                  <div>
                    <h3 className="text-sm font-medium text-gray-900">
                      Brand Responses
                    </h3>
                    <p className="text-sm text-gray-600 mt-1">
                      Get notified when brands respond to campaigns
                    </p>
                  </div>
                  <button
                    onClick={() => handleToggle('emailBrandResponses')}
                    disabled={saving}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      preferences.emailBrandResponses
                        ? 'bg-violet-600'
                        : 'bg-gray-300'
                    } ${saving ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        preferences.emailBrandResponses
                          ? 'translate-x-6'
                          : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>

                {/* New Followers */}
                <div className="flex items-center justify-between py-4 border-b border-gray-100 last:border-b-0">
                  <div>
                    <h3 className="text-sm font-medium text-gray-900">
                      New Followers
                    </h3>
                    <p className="text-sm text-gray-600 mt-1">
                      Get notified when you gain new followers
                    </p>
                  </div>
                  <button
                    onClick={() => handleToggle('emailNewFollowers')}
                    disabled={saving}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      preferences.emailNewFollowers
                        ? 'bg-violet-600'
                        : 'bg-gray-300'
                    } ${saving ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        preferences.emailNewFollowers
                          ? 'translate-x-6'
                          : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>

                {/* Milestones */}
                <div className="flex items-center justify-between py-4 border-b border-gray-100 last:border-b-0">
                  <div>
                    <h3 className="text-sm font-medium text-gray-900">
                      Campaign Milestones
                    </h3>
                    <p className="text-sm text-gray-600 mt-1">
                      Get notified when campaigns reach goals or milestones
                    </p>
                  </div>
                  <button
                    onClick={() => handleToggle('emailMilestones')}
                    disabled={saving}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      preferences.emailMilestones
                        ? 'bg-violet-600'
                        : 'bg-gray-300'
                    } ${saving ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        preferences.emailMilestones
                          ? 'translate-x-6'
                          : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>
              </div>
            </div>

            {/* Push Notifications Section */}
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-blue-500 to-blue-600">
                <h2 className="text-lg font-semibold text-white">
                  Push Notifications
                </h2>
                <p className="text-blue-50 text-sm mt-1">
                  Browser notifications for real-time updates
                </p>
              </div>

              <div className="px-6 py-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-medium text-gray-900">
                      Enable Push Notifications
                    </h3>
                    <p className="text-sm text-gray-600 mt-1">
                      Receive browser notifications for important events
                    </p>
                  </div>
                  <button
                    onClick={() => handleToggle('pushEnabled')}
                    disabled={saving}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      preferences.pushEnabled
                        ? 'bg-violet-600'
                        : 'bg-gray-300'
                    } ${saving ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        preferences.pushEnabled
                          ? 'translate-x-6'
                          : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-4 pt-6">
              <button
                onClick={handleSave}
                disabled={saving}
                className="flex-1 bg-violet-600 hover:bg-violet-700 disabled:bg-gray-400 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
              >
                {saving ? 'Saving...' : 'Save Preferences'}
              </button>
              <Link
                href="/dashboard"
                className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-900 font-semibold py-3 px-6 rounded-lg transition-colors text-center"
              >
                Cancel
              </Link>
            </div>
          </div>
    </div>
  )
}
