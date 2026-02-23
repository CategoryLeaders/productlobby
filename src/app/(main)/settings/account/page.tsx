'use client'

import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { DashboardLayout, PageHeader } from '@/components/shared'
import { AvatarUpload } from '@/components/shared/avatar-upload'
import { Card, CardContent, CardHeader, CardTitle, Button, Input, Textarea, Spinner, Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui'
import { AlertCircle, CheckCircle, Trash2, Eye, EyeOff } from 'lucide-react'
import { useToast } from '@/components/ui/toast'
import { cn } from '@/lib/utils'

interface UserAccount {
  id: string
  email: string
  displayName: string
  handle: string | null
  avatar: string | null
  bio: string | null
  emailVerified: boolean
  createdAt: string
}

interface FormErrors {
  displayName?: string
  handle?: string
  bio?: string
  avatar?: string
  submit?: string
}

export default function AccountSettingsPage() {
  const router = useRouter()
  const { addToast } = useToast()

  // Form state
  const [account, setAccount] = useState<UserAccount | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [errors, setErrors] = useState<FormErrors>({})

  const [displayName, setDisplayName] = useState('')
  const [handle, setHandle] = useState('')
  const [bio, setBio] = useState('')
  const [avatar, setAvatar] = useState('')

  // Delete state
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [deleteConfirmation, setDeleteConfirmation] = useState('')
  const [deleting, setDeleting] = useState(false)

  // Fetch account data
  useEffect(() => {
    const fetchAccount = async () => {
      try {
        setLoading(true)
        const response = await fetch('/api/user/account')
        if (!response.ok) {
          throw new Error('Failed to load account')
        }

        const data = await response.json()
        setAccount(data.account)
        setDisplayName(data.account.displayName)
        setHandle(data.account.handle || '')
        setBio(data.account.bio || '')
        setAvatar(data.account.avatar || '')
      } catch (err) {
        console.error('Error loading account:', err)
        addToast('Failed to load account settings', 'error')
      } finally {
        setLoading(false)
      }
    }

    fetchAccount()
  }, [addToast])

  // Handle avatar upload
  const handleAvatarChange = useCallback((url: string) => {
    setAvatar(url)
  }, [])

  // Save account changes
  const handleSave = async () => {
    try {
      setSaving(true)
      setErrors({})

      const response = await fetch('/api/user/account', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          displayName,
          handle: handle || null,
          bio: bio || null,
          avatar: avatar || null,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        if (data.errors) {
          setErrors(data.errors)
        } else {
          setErrors({ submit: data.error || 'Failed to save account' })
        }
        addToast('Failed to save account changes', 'error')
        return
      }

      setAccount(data.account)
      addToast('Account settings saved successfully', 'success')
    } catch (error) {
      console.error('Error saving account:', error)
      setErrors({ submit: 'An unexpected error occurred' })
      addToast('An error occurred while saving', 'error')
    } finally {
      setSaving(false)
    }
  }

  // Handle account deletion
  const handleDeleteAccount = async () => {
    if (deleteConfirmation !== 'DELETE MY ACCOUNT') {
      addToast('Please type the confirmation text', 'error')
      return
    }

    try {
      setDeleting(true)

      const response = await fetch('/api/user/account', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ confirmed: true }),
      })

      if (!response.ok) {
        throw new Error('Failed to delete account')
      }

      addToast('Your account has been deleted', 'success')

      // Redirect to home after a short delay
      setTimeout(() => {
        router.push('/')
      }, 1000)
    } catch (error) {
      console.error('Error deleting account:', error)
      addToast('Failed to delete account. Please try again.', 'error')
    } finally {
      setDeleting(false)
    }
  }

  if (loading) {
    return (
      <DashboardLayout role="supporter">
        <div className="flex items-center justify-center py-12">
          <Spinner />
        </div>
      </DashboardLayout>
    )
  }

  if (!account) {
    return (
      <DashboardLayout role="supporter">
        <div className="text-center py-12">
          <p className="text-gray-600">Failed to load account settings</p>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout role="supporter">
      <div className="space-y-6">
        {/* Header */}
        <PageHeader
          title="Account Settings"
          description="Manage your account details and profile information"
        />

        {/* Profile Section */}
        <Card>
          <CardHeader>
            <CardTitle>Profile Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Avatar Upload */}
            <div className="space-y-3">
              <label className="text-sm font-medium">Profile Picture</label>
              <AvatarUpload currentAvatar={avatar} displayName={displayName} onAvatarChange={handleAvatarChange} />
            </div>

            {/* Display Name */}
            <div className="space-y-2">
              <label htmlFor="displayName" className="text-sm font-medium">
                Display Name *
              </label>
              <Input
                id="displayName"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="Your display name"
                disabled={saving}
                className={errors.displayName ? 'border-red-500' : ''}
              />
              {errors.displayName && (
                <p className="text-sm text-red-600 flex items-center gap-1">
                  <AlertCircle className="w-4 h-4" />
                  {errors.displayName}
                </p>
              )}
              <p className="text-xs text-gray-500">This is the name that will appear on your profile and campaigns.</p>
            </div>

            {/* Handle */}
            <div className="space-y-2">
              <label htmlFor="handle" className="text-sm font-medium">
                Handle
              </label>
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600">productlobby.com/</span>
                <Input
                  id="handle"
                  value={handle}
                  onChange={(e) => setHandle(e.target.value.toLowerCase())}
                  placeholder="your-handle"
                  disabled={saving}
                  className={cn('flex-1', errors.handle ? 'border-red-500' : '')}
                  maxLength={30}
                />
              </div>
              {errors.handle && (
                <p className="text-sm text-red-600 flex items-center gap-1">
                  <AlertCircle className="w-4 h-4" />
                  {errors.handle}
                </p>
              )}
              <p className="text-xs text-gray-500">Lowercase letters, numbers, and hyphens only. 3-30 characters.</p>
            </div>

            {/* Bio */}
            <div className="space-y-2">
              <label htmlFor="bio" className="text-sm font-medium">
                Bio
              </label>
              <Textarea
                id="bio"
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="Tell us about yourself..."
                disabled={saving}
                rows={4}
                className={errors.bio ? 'border-red-500' : ''}
                maxLength={500}
              />
              <div className="flex justify-between">
                <p className="text-xs text-gray-500">
                  {bio.length}/500 characters
                </p>
                {errors.bio && (
                  <p className="text-sm text-red-600 flex items-center gap-1">
                    <AlertCircle className="w-4 h-4" />
                    {errors.bio}
                  </p>
                )}
              </div>
            </div>

            {/* Submit Error */}
            {errors.submit && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-3">
                <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
                <p className="text-sm text-red-800">{errors.submit}</p>
              </div>
            )}

            {/* Save Button */}
            <div className="flex justify-end gap-3 pt-4">
              <Button
                variant="secondary"
                onClick={() => {
                  if (account) {
                    setDisplayName(account.displayName)
                    setHandle(account.handle || '')
                    setBio(account.bio || '')
                    setAvatar(account.avatar || '')
                    setErrors({})
                  }
                }}
                disabled={saving}
              >
                Cancel
              </Button>
              <Button
                onClick={handleSave}
                disabled={saving}
                variant="primary"
              >
                {saving ? (
                  <>
                    <Spinner className="w-4 h-4 mr-2" />
                    Saving...
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Save Changes
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Account Information Section */}
        <Card>
          <CardHeader>
            <CardTitle>Account Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-600">Email Address</label>
              <p className="text-base text-gray-900 mt-1">{account.email}</p>
              <div className="flex items-center gap-2 mt-2">
                {account.emailVerified ? (
                  <span className="inline-flex items-center gap-1 text-sm text-green-600">
                    <CheckCircle className="w-4 h-4" />
                    Email verified
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 text-sm text-yellow-600">
                    <AlertCircle className="w-4 h-4" />
                    Email not verified
                  </span>
                )}
              </div>
            </div>

            <div className="border-t pt-4">
              <label className="text-sm font-medium text-gray-600">Account Created</label>
              <p className="text-base text-gray-900 mt-1">
                {new Date(account.createdAt).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </p>
            </div>

            <div className="border-t pt-4">
              <label className="text-sm font-medium text-gray-600">Account ID</label>
              <p className="text-base text-gray-900 font-mono mt-1 text-sm">{account.id}</p>
            </div>
          </CardContent>
        </Card>

        {/* Danger Zone */}
        <Card className="border-red-200 bg-red-50">
          <CardHeader>
            <CardTitle className="text-red-900">Danger Zone</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-red-800">
              Once you delete your account, there is no going back. Please be certain.
            </p>
            <Button
              variant="destructive"
              onClick={() => setShowDeleteDialog(true)}
              className="w-full sm:w-auto"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Delete Account
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Delete Confirmation Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-red-900">Delete Account</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-900">
                This action cannot be undone. Your account and all associated data will be permanently deleted.
              </p>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">
                To confirm, type: <span className="font-mono font-bold">DELETE MY ACCOUNT</span>
              </label>
              <Input
                type="text"
                value={deleteConfirmation}
                onChange={(e) => setDeleteConfirmation(e.target.value)}
                placeholder="Type the confirmation text"
                disabled={deleting}
              />
            </div>

            <div className="flex gap-3 justify-end">
              <Button
                variant="secondary"
                onClick={() => {
                  setShowDeleteDialog(false)
                  setDeleteConfirmation('')
                }}
                disabled={deleting}
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={handleDeleteAccount}
                disabled={deleting || deleteConfirmation !== 'DELETE MY ACCOUNT'}
              >
                {deleting ? (
                  <>
                    <Spinner className="w-4 h-4 mr-2" />
                    Deleting...
                  </>
                ) : (
                  <>
                    <Trash2 className="w-4 h-4 mr-2" />
                    Delete Account
                  </>
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  )
}
