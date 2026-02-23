'use client'

import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import {
  Bell,
  Mail,
  Clock,
  Save,
  AlertCircle,
  CheckCircle,
  Users,
  ThumbsUp,
  MessageSquare,
  Target,
  Zap,
  Gift,
} from 'lucide-react'

interface NotificationCategory {
  id: string
  label: string
  description: string
  icon: React.ReactNode
  emailEnabled: boolean
  pushEnabled: boolean
  frequency: 'instant' | 'daily' | 'weekly'
}

interface QuietHours {
  enabled: boolean
  startTime: string
  endTime: string
}

interface NotificationPreferencesData {
  categories: NotificationCategory[]
  quietHours: QuietHours
  allNotificationsEnabled: boolean
}

const DEFAULT_CATEGORIES: NotificationCategory[] = [
  {
    id: 'new-supporters',
    label: 'New Supporters',
    description: 'When someone backs or pledges to this campaign',
    icon: <Users className="h-5 w-5" />,
    emailEnabled: true,
    pushEnabled: true,
    frequency: 'instant',
  },
  {
    id: 'votes',
    label: 'Votes & Reactions',
    description: 'When supporters vote on campaign updates',
    icon: <ThumbsUp className="h-5 w-5" />,
    emailEnabled: true,
    pushEnabled: true,
    frequency: 'daily',
  },
  {
    id: 'comments',
    label: 'Comments',
    description: 'New comments on updates and announcements',
    icon: <MessageSquare className="h-5 w-5" />,
    emailEnabled: true,
    pushEnabled: true,
    frequency: 'daily',
  },
  {
    id: 'milestones',
    label: 'Milestones',
    description: 'Campaign goals reached and milestone achievements',
    icon: <Target className="h-5 w-5" />,
    emailEnabled: true,
    pushEnabled: true,
    frequency: 'instant',
  },
  {
    id: 'weekly-digest',
    label: 'Weekly Digest',
    description: 'Summary of campaign activity and engagement',
    icon: <Zap className="h-5 w-5" />,
    emailEnabled: true,
    pushEnabled: false,
    frequency: 'weekly',
  },
  {
    id: 'marketing',
    label: 'Marketing & Promotions',
    description: 'Tips, feature updates, and promotional content',
    icon: <Gift className="h-5 w-5" />,
    emailEnabled: true,
    pushEnabled: false,
    frequency: 'weekly',
  },
]

export function CampaignNotificationPreferences({ campaignId }: { campaignId: string }) {
  const [categories, setCategories] = useState<NotificationCategory[]>(DEFAULT_CATEGORIES)
  const [quietHours, setQuietHours] = useState<QuietHours>({
    enabled: false,
    startTime: '22:00',
    endTime: '08:00',
  })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [unsavedChanges, setUnsavedChanges] = useState(false)
  const [allNotificationsEnabled, setAllNotificationsEnabled] = useState(true)

  // Fetch preferences on mount
  useEffect(() => {
    const fetchPreferences = async () => {
      try {
        setLoading(true)
        const response = await fetch(
          `/api/campaigns/${campaignId}/notification-preferences`
        )

        if (!response.ok) {
          if (response.status === 401) {
            setError('You must be logged in to manage notification preferences')
          } else {
            throw new Error(`Failed to fetch preferences: ${response.statusText}`)
          }
          return
        }

        const data = await response.json()
        if (data.preferences) {
          setCategories(data.preferences.categories || DEFAULT_CATEGORIES)
          setQuietHours(data.preferences.quietHours || quietHours)
          setAllNotificationsEnabled(data.preferences.allNotificationsEnabled ?? true)
        }
        setError(null)
      } catch (err) {
        console.error('Error fetching notification preferences:', err)
        setError(err instanceof Error ? err.message : 'Failed to load preferences')
      } finally {
        setLoading(false)
      }
    }

    fetchPreferences()
  }, [campaignId])

  const handleCategoryToggle = (categoryId: string, field: 'emailEnabled' | 'pushEnabled') => {
    setCategories((prev) =>
      prev.map((cat) =>
        cat.id === categoryId ? { ...cat, [field]: !cat[field] } : cat
      )
    )
    setUnsavedChanges(true)
    setSuccess(false)
  }

  const handleFrequencyChange = (categoryId: string, frequency: 'instant' | 'daily' | 'weekly') => {
    setCategories((prev) =>
      prev.map((cat) =>
        cat.id === categoryId ? { ...cat, frequency } : cat
      )
    )
    setUnsavedChanges(true)
    setSuccess(false)
  }

  const toggleAllNotifications = () => {
    const newState = !allNotificationsEnabled
    setAllNotificationsEnabled(newState)
    setCategories((prev) =>
      prev.map((cat) => ({
        ...cat,
        emailEnabled: newState,
        pushEnabled: newState,
      }))
    )
    setUnsavedChanges(true)
    setSuccess(false)
  }

  const handleQuietHoursToggle = () => {
    setQuietHours((prev) => ({ ...prev, enabled: !prev.enabled }))
    setUnsavedChanges(true)
    setSuccess(false)
  }

  const handleQuietHoursChange = (field: 'startTime' | 'endTime', value: string) => {
    setQuietHours((prev) => ({ ...prev, [field]: value }))
    setUnsavedChanges(true)
    setSuccess(false)
  }

  const handleSave = async () => {
    try {
      setSaving(true)
      setError(null)
      setSuccess(false)

      const response = await fetch(
        `/api/campaigns/${campaignId}/notification-preferences`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            categories,
            quietHours,
            allNotificationsEnabled,
          }),
        }
      )

      if (!response.ok) {
        if (response.status === 401) {
          setError('You must be logged in to update preferences')
        } else {
          throw new Error(`Failed to save preferences: ${response.statusText}`)
        }
        return
      }

      setSuccess(true)
      setUnsavedChanges(false)
      setTimeout(() => setSuccess(false), 3000)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save preferences')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="rounded-lg border border-gray-200 bg-white p-6">
        <p className="text-gray-500">Loading notification preferences...</p>
      </div>
    )
  }

  const anyCategoryEnabled = categories.some((cat) => cat.emailEnabled || cat.pushEnabled)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="border-b border-gray-200 pb-6">
        <div className="flex items-center gap-3">
          <Bell className="h-6 w-6 text-violet-600" />
          <h2 className="text-2xl font-semibold text-gray-900">Notification Preferences</h2>
        </div>
        <p className="mt-2 text-sm text-gray-600">
          Manage how you receive updates about this campaign
        </p>
      </div>

      {/* Error Banner */}
      {error && (
        <div className="flex gap-3 rounded-lg border border-red-200 bg-red-50 p-4">
          <AlertCircle className="h-5 w-5 flex-shrink-0 text-red-600" />
          <div>
            <p className="font-medium text-red-900">Error</p>
            <p className="text-sm text-red-700">{error}</p>
          </div>
        </div>
      )}

      {/* Success Banner */}
      {success && (
        <div className="flex gap-3 rounded-lg border border-green-200 bg-green-50 p-4">
          <CheckCircle className="h-5 w-5 flex-shrink-0 text-green-600" />
          <div>
            <p className="font-medium text-green-900">Success</p>
            <p className="text-sm text-green-700">Preferences saved successfully</p>
          </div>
        </div>
      )}

      {/* Unsaved Changes Indicator */}
      {unsavedChanges && (
        <div className="flex items-center gap-2 rounded-lg bg-amber-50 p-3 text-sm text-amber-700">
          <AlertCircle className="h-4 w-4" />
          You have unsaved changes
        </div>
      )}

      {/* Master Toggle */}
      <div className="rounded-lg border border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-semibold text-gray-900">All Notifications</h3>
            <p className="text-sm text-gray-600 mt-1">
              {allNotificationsEnabled
                ? 'All notification types are enabled'
                : 'All notifications are currently disabled'}
            </p>
          </div>
          <button
            onClick={toggleAllNotifications}
            disabled={saving}
            className={cn(
              'relative h-7 w-12 rounded-full transition-colors',
              allNotificationsEnabled ? 'bg-violet-600' : 'bg-gray-300'
            )}
            aria-label="Toggle all notifications"
          >
            <span
              className={cn(
                'absolute top-1 h-5 w-5 rounded-full bg-white transition-transform',
                allNotificationsEnabled ? 'translate-x-6' : 'translate-x-1'
              )}
            />
          </button>
        </div>
      </div>

      {/* Notification Categories */}
      <div className="space-y-4">
        <h3 className="font-semibold text-gray-900">Notification Categories</h3>
        {categories.map((category) => (
          <div
            key={category.id}
            className="rounded-lg border border-gray-200 p-4 transition-colors hover:bg-gray-50"
          >
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-4 flex-1">
                <div className="mt-1 text-gray-600">{category.icon}</div>
                <div className="flex-1">
                  <h4 className="font-medium text-gray-900">{category.label}</h4>
                  <p className="text-sm text-gray-600 mt-1">{category.description}</p>

                  {/* Frequency Options */}
                  <div className="mt-3 flex flex-wrap gap-2">
                    {(['instant', 'daily', 'weekly'] as const).map((freq) => (
                      <button
                        key={freq}
                        onClick={() => handleFrequencyChange(category.id, freq)}
                        disabled={saving || (!category.emailEnabled && !category.pushEnabled)}
                        className={cn(
                          'rounded-full px-3 py-1 text-xs font-medium transition-colors',
                          category.frequency === freq
                            ? 'bg-violet-100 text-violet-700'
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        )}
                      >
                        {freq === 'instant' && 'Instant'}
                        {freq === 'daily' && 'Daily Summary'}
                        {freq === 'weekly' && 'Weekly Summary'}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Toggles */}
              <div className="flex items-center gap-4 ml-4">
                <div className="text-center">
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <Mail className="h-4 w-4 text-gray-500" />
                  </div>
                  <button
                    onClick={() => handleCategoryToggle(category.id, 'emailEnabled')}
                    disabled={saving}
                    className={cn(
                      'relative h-6 w-11 rounded-full transition-colors',
                      category.emailEnabled ? 'bg-violet-600' : 'bg-gray-300'
                    )}
                    aria-label={`Toggle email for ${category.label}`}
                  >
                    <span
                      className={cn(
                        'absolute top-1 h-4 w-4 rounded-full bg-white transition-transform',
                        category.emailEnabled ? 'translate-x-6' : 'translate-x-1'
                      )}
                    />
                  </button>
                </div>

                <div className="text-center">
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <Bell className="h-4 w-4 text-gray-500" />
                  </div>
                  <button
                    onClick={() => handleCategoryToggle(category.id, 'pushEnabled')}
                    disabled={saving}
                    className={cn(
                      'relative h-6 w-11 rounded-full transition-colors',
                      category.pushEnabled ? 'bg-violet-600' : 'bg-gray-300'
                    )}
                    aria-label={`Toggle push for ${category.label}`}
                  >
                    <span
                      className={cn(
                        'absolute top-1 h-4 w-4 rounded-full bg-white transition-transform',
                        category.pushEnabled ? 'translate-x-6' : 'translate-x-1'
                      )}
                    />
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Quiet Hours Settings */}
      <div className="border-t border-gray-200 pt-6">
        <div className="rounded-lg border border-gray-200 p-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <Clock className="h-5 w-5 text-gray-600" />
              <h3 className="font-semibold text-gray-900">Quiet Hours</h3>
            </div>
            <button
              onClick={handleQuietHoursToggle}
              disabled={saving}
              className={cn(
                'relative h-6 w-11 rounded-full transition-colors',
                quietHours.enabled ? 'bg-violet-600' : 'bg-gray-300'
              )}
              aria-label="Toggle quiet hours"
            >
              <span
                className={cn(
                  'absolute top-1 h-4 w-4 rounded-full bg-white transition-transform',
                  quietHours.enabled ? 'translate-x-6' : 'translate-x-1'
                )}
              />
            </button>
          </div>

          <p className="text-sm text-gray-600 mb-4">
            Pause notifications during these hours
          </p>

          {quietHours.enabled && (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Start Time
                </label>
                <input
                  type="time"
                  value={quietHours.startTime}
                  onChange={(e) => handleQuietHoursChange('startTime', e.target.value)}
                  disabled={saving}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-violet-600 focus:outline-none focus:ring-2 focus:ring-violet-100"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  End Time
                </label>
                <input
                  type="time"
                  value={quietHours.endTime}
                  onChange={(e) => handleQuietHoursChange('endTime', e.target.value)}
                  disabled={saving}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-violet-600 focus:outline-none focus:ring-2 focus:ring-violet-100"
                />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Notification Preview */}
      <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
        <h3 className="font-semibold text-gray-900 mb-3">Notification Preview</h3>
        <div className="space-y-2 text-sm text-gray-600">
          <p>
            <span className="font-medium text-gray-700">Enabled channels:</span>{' '}
            {anyCategoryEnabled
              ? [
                  categories.some((c) => c.emailEnabled) && 'Email',
                  categories.some((c) => c.pushEnabled) && 'Push',
                ]
                  .filter(Boolean)
                  .join(', ')
              : 'None'}
          </p>
          <p>
            <span className="font-medium text-gray-700">Active categories:</span>{' '}
            {anyCategoryEnabled ? categories.filter((c) => c.emailEnabled || c.pushEnabled).length : 0}{' '}
            / {categories.length}
          </p>
          {quietHours.enabled && (
            <p>
              <span className="font-medium text-gray-700">Quiet hours:</span> {quietHours.startTime} -{' '}
              {quietHours.endTime}
            </p>
          )}
        </div>
      </div>

      {/* Save Button */}
      <div className="flex items-center justify-end gap-3 border-t border-gray-200 pt-6">
        <Button
          onClick={handleSave}
          disabled={saving || !unsavedChanges}
          className="gap-2"
        >
          <Save className="h-4 w-4" />
          {saving ? 'Saving...' : 'Save Preferences'}
        </Button>
      </div>
    </div>
  )
}
