'use client'

import { useState } from 'react'
import { Button, Input, Textarea, Card, CardContent, CardHeader, CardTitle } from '@/components/ui'
import { CheckCircle, AlertCircle } from 'lucide-react'

interface EditProfileFormProps {
  initialDisplayName: string
  initialHandle: string | null
  initialBio: string | null
  initialAvatar: string | null
  onSuccess?: (updatedUser: any) => void
  onCancel?: () => void
}

interface FormErrors {
  displayName?: string
  handle?: string
  bio?: string
  avatar?: string
  submit?: string
}

export function EditProfileForm({
  initialDisplayName,
  initialHandle,
  initialBio,
  initialAvatar,
  onSuccess,
  onCancel,
}: EditProfileFormProps) {
  const [displayName, setDisplayName] = useState(initialDisplayName)
  const [handle, setHandle] = useState(initialHandle || '')
  const [bio, setBio] = useState(initialBio || '')
  const [avatar, setAvatar] = useState(initialAvatar || '')
  const [errors, setErrors] = useState<FormErrors>({})
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const handleHandleChange = (value: string) => {
    const lowerValue = value.toLowerCase()
    setHandle(lowerValue)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrors({})
    setSuccess(false)
    setLoading(true)

    try {
      const response = await fetch('/api/user/profile', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
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
          setErrors({ submit: data.error || 'Failed to update profile' })
        }
      } else {
        setSuccess(true)
        onSuccess?.(data.user)
        setTimeout(() => setSuccess(false), 3000)
      }
    } catch (error) {
      setErrors({ submit: 'An unexpected error occurred' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Edit Profile</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Display Name */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Display Name
            </label>
            <Input
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="Your display name"
              maxLength={100}
              disabled={loading}
            />
            {errors.displayName && (
              <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                <AlertCircle className="w-4 h-4" />
                {errors.displayName}
              </p>
            )}
          </div>

          {/* Handle */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Handle
            </label>
            <div className="relative">
              <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">@</div>
              <Input
                type="text"
                value={handle}
                onChange={(e) => handleHandleChange(e.target.value)}
                placeholder="your-handle"
                maxLength={30}
                disabled={loading}
                className="pl-7"
              />
            </div>
            <p className="text-gray-600 text-xs mt-1">
              3-30 characters, lowercase letters, numbers, and hyphens only
            </p>
            {errors.handle && (
              <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                <AlertCircle className="w-4 h-4" />
                {errors.handle}
              </p>
            )}
          </div>

          {/* Bio */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Bio
            </label>
            <Textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Tell us about yourself..."
              maxLength={300}
              disabled={loading}
              rows={4}
            />
            <div className="flex justify-between items-center mt-1">
              <p className="text-gray-600 text-xs">
                Max 300 characters
              </p>
              <span className="text-gray-600 text-xs">
                {bio.length}/300
              </span>
            </div>
            {errors.bio && (
              <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                <AlertCircle className="w-4 h-4" />
                {errors.bio}
              </p>
            )}
          </div>

          {/* Avatar URL */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Avatar URL
            </label>
            <Input
              type="url"
              value={avatar}
              onChange={(e) => setAvatar(e.target.value)}
              placeholder="https://example.com/avatar.jpg"
              disabled={loading}
            />
            <p className="text-gray-600 text-xs mt-1">
              Direct link to your avatar image (PNG, JPG, or GIF)
            </p>
            {errors.avatar && (
              <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                <AlertCircle className="w-4 h-4" />
                {errors.avatar}
              </p>
            )}
          </div>

          {/* Success Message */}
          {success && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-center gap-3">
              <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
              <p className="text-green-700 text-sm">
                Profile updated successfully!
              </p>
            </div>
          )}

          {/* Submit Error */}
          {errors.submit && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center gap-3">
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
              <p className="text-red-700 text-sm">
                {errors.submit}
              </p>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3 justify-end pt-4">
            <Button
              type="button"
              variant="ghost"
              onClick={onCancel}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              loading={loading}
              disabled={loading}
            >
              Save Changes
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
