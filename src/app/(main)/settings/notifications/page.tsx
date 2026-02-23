'use client'

import { useState, useEffect } from 'react'
import { DashboardLayout, PageHeader } from '@/components/shared'
import { ToggleSwitch } from '@/components/ui/toggle-switch'
import { useToast } from '@/components/ui/toast'
import { Loader2 } from 'lucide-react'

interface NotificationPreferences {
  emailNotifications: boolean
  campaignUpdates: boolean
  lobbyActivity: boolean
  brandResponses: boolean
  comments: boolean
  weeklyDigest: boolean
  marketingEmails: boolean
  newFollowers: boolean
}

const DEFAULT_PREFERENCES: NotificationPreferences = {
  emailNotifications: true,
  campaignUpdates: true,
  lobbyActivity: true,
  brandResponses: true,
  comments: true,
  weeklyDigest: true,
  marketingEmails: true,
  newFollowers: false,
}

export default function NotificationPreferencesPage() {
  const { addToast } = useToast()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [preferences, setPreferences] = useState<NotificationPreferences>(
    DEFAULT_PREFERENCES
  )

  // Load preferences
  useEffect(() => {
    const loadPreferences = async () => {
      try {
        setLoading(true)
        const response = await fetch('/api/user/notification-preferences')
        if (!response.ok) {
          throw new Error('Failed to load preferences')
        }
        const data = await response.json()
        setPreferences(data)
      } catch (error) {
        console.error('Error loading preferences:', error)
        addToast(
          'Failed to load your notification preferences',
          'error'
        )
      } finally {
        setLoading(false)
      }
    }

    loadPreferences()
  }, [addToast])

  const handleToggle = (field: keyof NotificationPreferences) => {
    setPreferences((prev) => ({
      ...prev,
      [field]: !prev[field],
    }))
  }

  const handleMasterToggle = () => {
    setPreferences((prev) => {
      const newMaster = !prev.emailNotifications
      return {
        ...prev,
        emailNotifications: newMaster,
        campaignUpdates: newMaster ? prev.campaignUpdates : false,
        lobbyActivity: newMaster ? prev.lobbyActivity : false,
        brandResponses: newMaster ? prev.brandResponses : false,
        comments: newMaster ? prev.comments : false,
        weeklyDigest: newMaster ? prev.weeklyDigest : false,
        newFollowers: newMaster ? prev.newFollowers : false,
        marketingEmails: newMaster ? prev.marketingEmails : false,
      }
    })
  }

  const handleSave = async () => {
    try {
      setSaving(true)
      const response = await fetch('/api/user/notification-preferences', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ preferences }),
      })

      if (!response.ok) {
        throw new Error('Failed to save preferences')
      }

      const updated = await response.json()
      setPreferences(updated)
      addToast(
        'Notification preferences saved successfully!',
        'success'
      )
    } catch (error) {
      console.error('Error saving preferences:', error)
      addToast(
        'Failed to save notification preferences',
        'error'
      )
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <DashboardLayout role="supporter">
        <div className="space-y-4">
          <div className="h-10 bg-gray-200 rounded w-1/3 animate-pulse"></div>
          <div className="h-6 bg-gray-200 rounded w-1/2 animate-pulse"></div>
          <div className="space-y-4 mt-8">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-16 bg-gray-200 rounded animate-pulse"></div>
            ))}
          </div>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout role="supporter">
      <PageHeader
        title="Notification Preferences"
        description="Manage how you receive email notifications from ProductLobby"
      />

      <div className="space-y-8 max-w-3xl">
        {/* Master Email Notifications Section */}
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <h2 className="text-lg font-semibold text-gray-900 mb-1">
                Email Notifications
              </h2>
              <p className="text-sm text-gray-600">
                Master toggle to enable or disable all email notifications
              </p>
            </div>
            <button
              onClick={handleMasterToggle}
              disabled={saving}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 flex-shrink-0 ${
                preferences.emailNotifications ? 'bg-violet-600' : 'bg-gray-300'
              } ${saving ? 'opacity-50 cursor-not-allowed' : ''} focus:outline-none focus:ring-2 focus:ring-violet-500 focus:ring-offset-2`}
              role="switch"
              aria-checked={preferences.emailNotifications}
              type="button"
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-200 ${
                  preferences.emailNotifications ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>
        </div>

        {/* Campaign Activity Section */}
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
            <h3 className="font-semibold text-gray-900">Campaign Activity</h3>
          </div>
          <div className="divide-y divide-gray-200">
            {/* Campaign Updates */}
            <div className="p-6">
              <ToggleSwitch
                checked={preferences.campaignUpdates && preferences.emailNotifications}
                onChange={() => handleToggle('campaignUpdates')}
                disabled={!preferences.emailNotifications || saving}
                label="Campaign Updates"
                description="Get notified when campaigns you follow have updates"
              />
            </div>

            {/* Lobby Activity */}
            <div className="p-6">
              <ToggleSwitch
                checked={preferences.lobbyActivity && preferences.emailNotifications}
                onChange={() => handleToggle('lobbyActivity')}
                disabled={!preferences.emailNotifications || saving}
                label="Lobby Activity"
                description="Get notified when someone lobbies your campaign"
              />
            </div>

            {/* Brand Responses */}
            <div className="p-6">
              <ToggleSwitch
                checked={preferences.brandResponses && preferences.emailNotifications}
                onChange={() => handleToggle('brandResponses')}
                disabled={!preferences.emailNotifications || saving}
                label="Brand Responses"
                description="Get notified when brands respond to campaigns"
              />
            </div>

            {/* Comments */}
            <div className="p-6">
              <ToggleSwitch
                checked={preferences.comments && preferences.emailNotifications}
                onChange={() => handleToggle('comments')}
                disabled={!preferences.emailNotifications || saving}
                label="New Comments"
                description="Get notified about new comments on your campaigns"
              />
            </div>
          </div>
        </div>

        {/* Community Section */}
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
            <h3 className="font-semibold text-gray-900">Community</h3>
          </div>
          <div className="divide-y divide-gray-200">
            {/* New Followers */}
            <div className="p-6">
              <ToggleSwitch
                checked={preferences.newFollowers && preferences.emailNotifications}
                onChange={() => handleToggle('newFollowers')}
                disabled={!preferences.emailNotifications || saving}
                label="New Followers"
                description="Get notified when someone follows you"
              />
            </div>
          </div>
        </div>

        {/* Digest & Marketing Section */}
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
            <h3 className="font-semibold text-gray-900">Digest & Marketing</h3>
          </div>
          <div className="divide-y divide-gray-200">
            {/* Weekly Digest */}
            <div className="p-6">
              <ToggleSwitch
                checked={preferences.weeklyDigest && preferences.emailNotifications}
                onChange={() => handleToggle('weeklyDigest')}
                disabled={!preferences.emailNotifications || saving}
                label="Weekly Digest"
                description="Receive a weekly summary of activity"
              />
            </div>

            {/* Marketing Emails */}
            <div className="p-6">
              <ToggleSwitch
                checked={preferences.marketingEmails && preferences.emailNotifications}
                onChange={() => handleToggle('marketingEmails')}
                disabled={!preferences.emailNotifications || saving}
                label="Marketing Emails"
                description="Product news, tips, and feature announcements"
              />
            </div>
          </div>
        </div>

        {/* Save Button */}
        <div className="flex gap-3">
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 px-6 py-3 bg-violet-600 hover:bg-violet-700 disabled:bg-gray-400 text-white font-semibold rounded-lg transition-colors"
          >
            {saving && <Loader2 className="w-4 h-4 animate-spin" />}
            {saving ? 'Saving...' : 'Save Preferences'}
          </button>
        </div>
      </div>
    </DashboardLayout>
  )
}
