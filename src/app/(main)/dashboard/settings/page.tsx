'use client'

import React, { useState } from 'react'
import { DashboardLayout } from '@/components/shared/dashboard-layout'
import { PageHeader } from '@/components/shared/page-header'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Avatar } from '@/components/ui/avatar'
import { AlertCircle } from 'lucide-react'

export default function SettingsPage() {
  // Profile tab state
  const [displayName, setDisplayName] = useState('Sarah Chen')
  const [handle, setHandle] = useState('@sarahchen')
  const [bio, setBio] = useState(
    'Product enthusiast and designer. Passionate about innovation and user-centric design.'
  )
  const [email, setEmail] = useState('sarah@example.com')

  // Notification preferences
  const [notifications, setNotifications] = useState({
    milestones: true,
    brandResponses: true,
    campaignUpdates: true,
    weeklyDigest: false,
  })

  // Privacy preferences
  const [privacy, setPrivacy] = useState({
    profileVisible: true,
    lobbyVisible: true,
  })

  // Account settings
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

  const handleNotificationToggle = (key: keyof typeof notifications) => {
    setNotifications((prev) => ({
      ...prev,
      [key]: !prev[key],
    }))
  }

  const handlePrivacyToggle = (key: keyof typeof privacy) => {
    setPrivacy((prev) => ({
      ...prev,
      [key]: !prev[key],
    }))
  }

  return (
    <DashboardLayout role="creator">
      <PageHeader title="Settings" />

      <Tabs defaultValue="profile" className="w-full">
        <TabsList className="grid w-full grid-cols-4 mb-8 bg-white border border-gray-200">
          <TabsTrigger value="profile" className="font-medium">
            Profile
          </TabsTrigger>
          <TabsTrigger value="notifications" className="font-medium">
            Notifications
          </TabsTrigger>
          <TabsTrigger value="privacy" className="font-medium">
            Privacy
          </TabsTrigger>
          <TabsTrigger value="account" className="font-medium">
            Account
          </TabsTrigger>
        </TabsList>

        {/* Profile Tab */}
        <TabsContent value="profile">
          <Card className="bg-white border-gray-200">
            <CardHeader>
              <CardTitle className="font-display">Profile Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Avatar Upload */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Profile Picture
                </label>
                <div className="flex items-center gap-4">
                  <Avatar
                    src="/profile-avatar.jpg"
                    alt="Sarah Chen"
                    initials="SC"
                    size="lg"
                  />
                  <Button variant="outline">Change Avatar</Button>
                </div>
              </div>

              {/* Display Name */}
              <div>
                <label htmlFor="displayName" className="block text-sm font-medium text-gray-700 mb-2">
                  Display Name
                </label>
                <Input
                  id="displayName"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder="Your display name"
                />
              </div>

              {/* Handle */}
              <div>
                <label htmlFor="handle" className="block text-sm font-medium text-gray-700 mb-2">
                  Handle
                </label>
                <Input
                  id="handle"
                  value={handle}
                  onChange={(e) => setHandle(e.target.value)}
                  placeholder="@yourhandle"
                  prefix="@"
                />
              </div>

              {/* Bio */}
              <div>
                <label htmlFor="bio" className="block text-sm font-medium text-gray-700 mb-2">
                  Bio
                </label>
                <Textarea
                  id="bio"
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder="Tell us about yourself"
                  rows={4}
                  maxLength={160}
                />
                <p className="text-xs text-gray-500 mt-1">
                  {bio.length}/160 characters
                </p>
              </div>

              {/* Email (Read-only) */}
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address
                </label>
                <Input
                  id="email"
                  value={email}
                  disabled
                  className="bg-gray-50 cursor-not-allowed"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Email cannot be changed here. Contact support to update.
                </p>
              </div>

              {/* Save Button */}
              <div className="pt-4 border-t border-gray-200">
                <Button variant="primary" size="lg">
                  Save Changes
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Notifications Tab */}
        <TabsContent value="notifications">
          <Card className="bg-white border-gray-200">
            <CardHeader>
              <CardTitle className="font-display">Notification Preferences</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Lobby Milestones */}
              <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                <div>
                  <h4 className="font-medium text-foreground mb-1">Lobby Milestones</h4>
                  <p className="text-sm text-gray-600">
                    Get notified when campaigns reach 100, 500, 1K lobbies
                  </p>
                </div>
                <button
                  onClick={() => handleNotificationToggle('milestones')}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    notifications.milestones ? 'bg-violet-600' : 'bg-gray-300'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      notifications.milestones ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>

              {/* Brand Responses */}
              <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                <div>
                  <h4 className="font-medium text-foreground mb-1">Brand Responses</h4>
                  <p className="text-sm text-gray-600">
                    Get notified when brands respond to your campaigns
                  </p>
                </div>
                <button
                  onClick={() => handleNotificationToggle('brandResponses')}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    notifications.brandResponses ? 'bg-violet-600' : 'bg-gray-300'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      notifications.brandResponses ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>

              {/* Campaign Updates */}
              <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                <div>
                  <h4 className="font-medium text-foreground mb-1">Campaign Updates</h4>
                  <p className="text-sm text-gray-600">
                    Get notified about updates to campaigns you created
                  </p>
                </div>
                <button
                  onClick={() => handleNotificationToggle('campaignUpdates')}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    notifications.campaignUpdates ? 'bg-violet-600' : 'bg-gray-300'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      notifications.campaignUpdates ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>

              {/* Weekly Digest */}
              <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                <div>
                  <h4 className="font-medium text-foreground mb-1">Weekly Digest</h4>
                  <p className="text-sm text-gray-600">
                    Get a weekly summary of all your campaigns performance
                  </p>
                </div>
                <button
                  onClick={() => handleNotificationToggle('weeklyDigest')}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    notifications.weeklyDigest ? 'bg-violet-600' : 'bg-gray-300'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      notifications.weeklyDigest ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>

              {/* Save Button */}
              <div className="pt-4 border-t border-gray-200">
                <Button variant="primary" size="lg">
                  Save Preferences
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Privacy Tab */}
        <TabsContent value="privacy">
          <Card className="bg-white border-gray-200">
            <CardHeader>
              <CardTitle className="font-display">Privacy Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Profile Visibility */}
              <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                <div>
                  <h4 className="font-medium text-foreground mb-1">Profile Visibility</h4>
                  <p className="text-sm text-gray-600">
                    Allow others to view your public profile
                  </p>
                </div>
                <button
                  onClick={() => handlePrivacyToggle('profileVisible')}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    privacy.profileVisible ? 'bg-violet-600' : 'bg-gray-300'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      privacy.profileVisible ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>

              {/* Lobby Visibility */}
              <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                <div>
                  <h4 className="font-medium text-foreground mb-1">Lobby Visibility</h4>
                  <p className="text-sm text-gray-600">
                    Allow others to see which lobbies you've contributed to
                  </p>
                </div>
                <button
                  onClick={() => handlePrivacyToggle('lobbyVisible')}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    privacy.lobbyVisible ? 'bg-violet-600' : 'bg-gray-300'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      privacy.lobbyVisible ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>

              {/* Save Button */}
              <div className="pt-4 border-t border-gray-200">
                <Button variant="primary" size="lg">
                  Save Privacy Settings
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Account Tab */}
        <TabsContent value="account">
          <div className="space-y-6">
            {/* Change Email */}
            <Card className="bg-white border-gray-200">
              <CardHeader>
                <CardTitle className="font-display">Change Email Address</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label htmlFor="currentEmail" className="block text-sm font-medium text-gray-700 mb-2">
                    Current Email
                  </label>
                  <Input
                    id="currentEmail"
                    value={email}
                    disabled
                    className="bg-gray-50 cursor-not-allowed"
                  />
                </div>

                <div>
                  <label htmlFor="newEmail" className="block text-sm font-medium text-gray-700 mb-2">
                    New Email
                  </label>
                  <Input
                    id="newEmail"
                    type="email"
                    placeholder="Enter new email address"
                  />
                </div>

                <Button variant="primary" size="lg">
                  Update Email
                </Button>
              </CardContent>
            </Card>

            {/* Delete Account */}
            <Card className="bg-white border-gray-200 border-red-200">
              <CardHeader>
                <CardTitle className="font-display text-red-600">Danger Zone</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-start gap-3 p-4 bg-red-50 rounded-lg border border-red-200">
                  <AlertCircle className="text-red-600 flex-shrink-0" size={20} />
                  <div>
                    <h4 className="font-medium text-red-900 mb-1">Delete Account</h4>
                    <p className="text-sm text-red-800 mb-4">
                      This action cannot be undone. All your campaigns, lobbies, and earnings will
                      be permanently deleted.
                    </p>
                    {!showDeleteConfirm ? (
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-red-600 border-red-600 hover:bg-red-50"
                        onClick={() => setShowDeleteConfirm(true)}
                      >
                        Delete Account
                      </Button>
                    ) : (
                      <div className="space-y-3">
                        <p className="text-sm font-medium text-red-900">
                          Are you sure? This cannot be undone.
                        </p>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setShowDeleteConfirm(false)}
                          >
                            Cancel
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-red-600 border-red-600 hover:bg-red-50"
                          >
                            Permanently Delete
                          </Button>
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
