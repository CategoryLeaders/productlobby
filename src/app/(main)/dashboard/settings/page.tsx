'use client'

import React, { useState, useEffect } from 'react'
import { DashboardLayout } from '@/components/shared/dashboard-layout'
import { PageHeader } from '@/components/shared/page-header'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Avatar } from '@/components/ui/avatar'
import { Spinner } from '@/components/ui/spinner'
import { useToast } from '@/components/ui/toast'
import { AlertCircle } from 'lucide-react'

interface UserProfile {
  id: string
  displayName: string
  handle: string | null
  bio: string | null
  email: string
  avatar: string | null
}

export default function DashboardSettingsPage() {
  const { addToast } = useToast()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [profile, setProfile] = useState<UserProfile | null>(null)

  const [displayName, setDisplayName] = useState('')
  const [handle, setHandle] = useState('')
  const [bio, setBio] = useState('')
  const [email, setEmail] = useState('')

  const [notifications, setNotifications] = useState({
    milestones: true,
    brandResponses: true,
    campaignUpdates: true,
    weeklyDigest: false,
  })

  const [privacy, setPrivacy] = useState({
    profileVisible: true,
    lobbyVisible: true,
  })

  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true)
        const response = await fetch('/api/user/profile')
        if (!response.ok) throw new Error('Failed to load profile')
        const data = await response.json()
        setProfile(data.user)
        setDisplayName(data.user.displayName || '')
        setHandle(data.user.handle || '')
        setBio(data.user.bio || '')
        setEmail(data.user.email || '')
      } catch (err) {
        console.error('Error loading profile:', err)
        addToast('Failed to load profile', 'error')
      } finally {
        setLoading(false)
      }
    }
    fetchProfile()
  }, [addToast])

  const handleSaveProfile = async () => {
    setSaving(true)
    try {
      const response = await fetch('/api/user/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          displayName,
          handle: handle || null,
          bio: bio || null,
        }),
      })
      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to save profile')
      }
      const data = await response.json()
      setProfile(data.user)
      addToast('Profile updated successfully!', 'success')
    } catch (err) {
      addToast(err instanceof Error ? err.message : 'Failed to save', 'error')
    } finally {
      setSaving(false)
    }
  }

  const handleNotificationToggle = (key: keyof typeof notifications) => {
    setNotifications((prev) => ({ ...prev, [key]: !prev[key] }))
  }

  const handlePrivacyToggle = (key: keyof typeof privacy) => {
    setPrivacy((prev) => ({ ...prev, [key]: !prev[key] }))
  }

  if (loading) {
    return (
      <DashboardLayout role="creator">
        <PageHeader title="Settings" />
        <div className="flex justify-center items-center h-96">
          <Spinner size="lg" />
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout role="creator">
      <PageHeader title="Settings" />

      <Tabs defaultValue="profile" className="w-full">
        <TabsList className="grid w-full grid-cols-4 mb-8 bg-white border border-gray-200">
          <TabsTrigger value="profile" className="font-medium">Profile</TabsTrigger>
          <TabsTrigger value="notifications" className="font-medium">Notifications</TabsTrigger>
          <TabsTrigger value="privacy" className="font-medium">Privacy</TabsTrigger>
          <TabsTrigger value="account" className="font-medium">Account</TabsTrigger>
        </TabsList>

        <TabsContent value="profile">
          <Card className="bg-white border-gray-200">
            <CardHeader>
              <CardTitle className="font-display">Profile Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">Profile Picture</label>
                <div className="flex items-center gap-4">
                  <Avatar
                    src={profile?.avatar || undefined}
                    alt={displayName}
                    initials={displayName ? displayName.charAt(0).toUpperCase() : '?'}
                    size="lg"
                  />
                  <a href="/settings" className="text-violet-600 hover:text-violet-700 text-sm font-medium">
                    Change avatar in full settings
                  </a>
                </div>
              </div>

              <div>
                <label htmlFor="displayName" className="block text-sm font-medium text-gray-700 mb-2">Display Name</label>
                <Input id="displayName" value={displayName} onChange={(e) => setDisplayName(e.target.value)} placeholder="Your display name" disabled={saving} />
              </div>

              <div>
                <label htmlFor="handle" className="block text-sm font-medium text-gray-700 mb-2">Handle</label>
                <div className="relative">
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">@</div>
                  <Input id="handle" value={handle} onChange={(e) => setHandle(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))} placeholder="yourhandle" className="pl-7" disabled={saving} />
                </div>
              </div>

              <div>
                <label htmlFor="bio" className="block text-sm font-medium text-gray-700 mb-2">Bio</label>
                <Textarea id="bio" value={bio} onChange={(e) => setBio(e.target.value)} placeholder="Tell us about yourself" rows={4} maxLength={500} disabled={saving} />
                <p className="text-xs text-gray-500 mt-1">{bio.length}/500 characters</p>
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
                <Input id="email" value={email} disabled className="bg-gray-50 cursor-not-allowed" />
                <p className="text-xs text-gray-500 mt-1">Email cannot be changed here.</p>
              </div>

              <div className="pt-4 border-t border-gray-200">
                <Button variant="primary" size="lg" onClick={handleSaveProfile} disabled={saving}>
                  {saving ? 'Saving...' : 'Save Changes'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications">
          <Card className="bg-white border-gray-200">
            <CardHeader>
              <CardTitle className="font-display">Notification Preferences</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {([
                { key: 'milestones' as const, title: 'Lobby Milestones', desc: 'Get notified when campaigns reach 100, 500, 1K lobbies' },
                { key: 'brandResponses' as const, title: 'Brand Responses', desc: 'Get notified when brands respond to your campaigns' },
                { key: 'campaignUpdates' as const, title: 'Campaign Updates', desc: 'Get notified about updates to campaigns you created' },
                { key: 'weeklyDigest' as const, title: 'Weekly Digest', desc: 'Get a weekly summary of all your campaigns performance' },
              ]).map((item) => (
                <div key={item.key} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                  <div>
                    <h4 className="font-medium text-foreground mb-1">{item.title}</h4>
                    <p className="text-sm text-gray-600">{item.desc}</p>
                  </div>
                  <button
                    onClick={() => handleNotificationToggle(item.key)}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${notifications[item.key] ? 'bg-violet-600' : 'bg-gray-300'}`}
                  >
                    <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${notifications[item.key] ? 'translate-x-6' : 'translate-x-1'}`} />
                  </button>
                </div>
              ))}
              <div className="pt-4 border-t border-gray-200">
                <Button variant="primary" size="lg" disabled={saving}>
                  {saving ? 'Saving...' : 'Save Preferences'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="privacy">
          <Card className="bg-white border-gray-200">
            <CardHeader>
              <CardTitle className="font-display">Privacy Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {([
                { key: 'profileVisible' as const, title: 'Profile Visibility', desc: 'Allow others to view your public profile' },
                { key: 'lobbyVisible' as const, title: 'Lobby Visibility', desc: 'Allow others to see which lobbies you\'ve contributed to' },
              ]).map((item) => (
                <div key={item.key} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                  <div>
                    <h4 className="font-medium text-foreground mb-1">{item.title}</h4>
                    <p className="text-sm text-gray-600">{item.desc}</p>
                  </div>
                  <button
                    onClick={() => handlePrivacyToggle(item.key)}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${privacy[item.key] ? 'bg-violet-600' : 'bg-gray-300'}`}
                  >
                    <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${privacy[item.key] ? 'translate-x-6' : 'translate-x-1'}`} />
                  </button>
                </div>
              ))}
              <div className="pt-4 border-t border-gray-200">
                <Button variant="primary" size="lg" disabled={saving}>Save Privacy Settings</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="account">
          <div className="space-y-6">
            <Card className="bg-white border-gray-200">
              <CardHeader>
                <CardTitle className="font-display">Email Address</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600 mb-2">Your current email address:</p>
                <p className="font-medium text-foreground">{email}</p>
                <p className="text-xs text-gray-500 mt-2">Contact support to change your email address.</p>
              </CardContent>
            </Card>

            <Card className="bg-white border-red-200">
              <CardHeader>
                <CardTitle className="font-display text-red-600">Danger Zone</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-start gap-3 p-4 bg-red-50 rounded-lg border border-red-200">
                  <AlertCircle className="text-red-600 flex-shrink-0" size={20} />
                  <div>
                    <h4 className="font-medium text-red-900 mb-1">Delete Account</h4>
                    <p className="text-sm text-red-800 mb-4">
                      This action cannot be undone. All your campaigns, lobbies, and data will be permanently deleted.
                    </p>
                    {!showDeleteConfirm ? (
                      <Button variant="outline" size="sm" className="text-red-600 border-red-600 hover:bg-red-50" onClick={() => setShowDeleteConfirm(true)}>
                        Delete Account
                      </Button>
                    ) : (
                      <div className="space-y-3">
                        <p className="text-sm font-medium text-red-900">Are you sure? This cannot be undone.</p>
                        <div className="flex gap-2">
                          <Button variant="outline" size="sm" onClick={() => setShowDeleteConfirm(false)}>Cancel</Button>
                          <Button variant="outline" size="sm" className="text-red-600 border-red-600 hover:bg-red-50">Permanently Delete</Button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </DashboardLayout>
  )
}
