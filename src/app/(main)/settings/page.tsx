'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Navbar, Footer } from '@/components/shared'
import { AvatarUpload } from '@/components/shared/avatar-upload'
import { Card, CardContent, CardHeader, CardTitle, Button, Input, Textarea, Spinner } from '@/components/ui'
import { AlertCircle, CheckCircle, ArrowLeft } from 'lucide-react'
import { useToast } from '@/components/ui/toast'
import { cn } from '@/lib/utils'

interface UserProfile {
  id: string
  displayName: string
  handle: string | null
  avatar: string | null
  bio: string | null
  email: string
}

const INTERESTS = [
  { id: 'tech', label: 'Tech', color: 'bg-blue-100 text-blue-700 border-blue-300' },
  { id: 'home', label: 'Home', color: 'bg-amber-100 text-amber-700 border-amber-300' },
  { id: 'health', label: 'Health', color: 'bg-red-100 text-red-700 border-red-300' },
  { id: 'food', label: 'Food', color: 'bg-orange-100 text-orange-700 border-orange-300' },
  { id: 'fashion', label: 'Fashion', color: 'bg-pink-100 text-pink-700 border-pink-300' },
  { id: 'sustainability', label: 'Sustainability', color: 'bg-green-100 text-green-700 border-green-300' },
  { id: 'pets', label: 'Pets', color: 'bg-purple-100 text-purple-700 border-purple-300' },
  { id: 'kids', label: 'Kids', color: 'bg-indigo-100 text-indigo-700 border-indigo-300' },
  { id: 'travel', label: 'Travel', color: 'bg-cyan-100 text-cyan-700 border-cyan-300' },
  { id: 'fitness', label: 'Fitness', color: 'bg-lime-100 text-lime-700 border-lime-300' },
]

interface FormErrors {
  displayName?: string
  handle?: string
  bio?: string
  avatar?: string
  location?: string
  website?: string
  submit?: string
}

export default function SettingsPage() {
  const { addToast } = useToast()
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [errors, setErrors] = useState<FormErrors>({})

  const [displayName, setDisplayName] = useState('')
  const [handle, setHandle] = useState('')
  const [bio, setBio] = useState('')
  const [avatar, setAvatar] = useState('')
  const [location, setLocation] = useState('')
  const [website, setWebsite] = useState('')
  const [interests, setInterests] = useState<string[]>([])
  const [handleCheckTimeout, setHandleCheckTimeout] = useState<NodeJS.Timeout | null>(null)
  const [handleAvailable, setHandleAvailable] = useState<boolean | null>(null)
  const [checkingHandle, setCheckingHandle] = useState(false)

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true)
        const response = await fetch('/api/user/profile')
        if (!response.ok) {
          throw new Error('Failed to load profile')
        }

        const data = await response.json()
        setProfile(data.user)
        setDisplayName(data.user.displayName)
        setHandle(data.user.handle || '')
        setBio(data.user.bio || '')
        setAvatar(data.user.avatar || '')
        setLocation(data.user.location || '')
        setWebsite(data.user.website || '')
        setInterests(data.user.interests || [])
      } catch (err) {
        console.error('Error loading profile:', err)
        addToast('Failed to load profile', 'error')
      } finally {
        setLoading(false)
      }
    }

    fetchProfile()
  }, [addToast])

  const checkHandleAvailability = async (handleValue: string) => {
    if (!handleValue || handleValue.length < 3) {
      setHandleAvailable(null)
      return
    }

    setCheckingHandle(true)
    try {
      const response = await fetch(`/api/user/handles/${handleValue}/availability`)
      if (response.ok) {
        const data = await response.json()
        setHandleAvailable(data.available)
      }
    } catch (err) {
      console.error('Error checking handle:', err)
    } finally {
      setCheckingHandle(false)
    }
  }

  const handleHandleChange = (value: string) => {
    const lowerValue = value.toLowerCase().replace(/[^a-z0-9-]/g, '')
    setHandle(lowerValue)
    setErrors({ ...errors, handle: undefined })

    if (handleCheckTimeout) {
      clearTimeout(handleCheckTimeout)
    }

    const timeout = setTimeout(() => {
      if (lowerValue !== profile?.handle && lowerValue.length >= 3) {
        checkHandleAvailability(lowerValue)
      }
    }, 500)

    setHandleCheckTimeout(timeout)
  }

  const toggleInterest = (id: string) => {
    setInterests((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    )
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrors({})
    setSaving(true)

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
          location: location || null,
          website: website || null,
          interests,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        if (data.errors) {
          setErrors(data.errors)
        } else {
          setErrors({ submit: data.error || 'Failed to update profile' })
        }
        addToast('Failed to save profile', 'error')
      } else {
        addToast('Profile updated successfully!', 'success')
        setProfile(data.user)
      }
    } catch (error) {
      setErrors({ submit: 'An unexpected error occurred' })
      addToast('An error occurred', 'error')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="py-12">
          <div className="max-w-3xl mx-auto px-4 md:px-6 lg:px-8">
            <div className="flex justify-center items-center h-96">
              <Spinner size="lg" />
            </div>
          </div>
        </main>
        <Footer />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="py-12">
        <div className="max-w-3xl mx-auto px-4 md:px-6 lg:px-8">
          {/* Header */}
          <div className="mb-8">
            <Link
              href="/"
              className="inline-flex items-center gap-2 text-violet-600 hover:text-violet-700 mb-4"
            >
              <ArrowLeft className="w-4 h-4" />
              Back
            </Link>
            <h1 className="text-4xl font-bold font-display text-foreground">Profile Settings</h1>
            <p className="text-gray-600 mt-2">Manage your public profile information</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Profile Photo Section */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  Profile Photo
                </CardTitle>
              </CardHeader>
              <CardContent>
                <AvatarUpload
                  currentAvatar={avatar}
                  displayName={displayName}
                  onAvatarChange={setAvatar}
                  disabled={saving}
                />
                {errors.avatar && (
                  <p className="text-red-500 text-sm mt-4 flex items-center gap-1">
                    <AlertCircle className="w-4 h-4" />
                    {errors.avatar}
                  </p>
                )}
              </CardContent>
            </Card>

            {/* Basic Info Section */}
            <Card>
              <CardHeader>
                <CardTitle>Basic Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Display Name */}
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Display Name *
                  </label>
                  <Input
                    type="text"
                    value={displayName}
                    onChange={(e) => {
                      setDisplayName(e.target.value)
                      setErrors({ ...errors, displayName: undefined })
                    }}
                    placeholder="Your name"
                    maxLength={100}
                    disabled={saving}
                    required
                  />
                  <p className="text-gray-600 text-xs mt-1">Up to 100 characters</p>
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
                    Username
                  </label>
                  <div className="relative">
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">@</div>
                    <Input
                      type="text"
                      value={handle}
                      onChange={(e) => handleHandleChange(e.target.value)}
                      placeholder="your-handle"
                      maxLength={30}
                      disabled={saving}
                      className="pl-7"
                    />
                    {checkingHandle && (
                      <div className="absolute right-3 top-1/2 -translate-y-1/2">
                        <div className="animate-spin">
                          <div className="w-4 h-4 border-2 border-gray-300 border-t-violet-600 rounded-full" />
                        </div>
                      </div>
                    )}
                    {!checkingHandle && handleAvailable === true && (
                      <div className="absolute right-3 top-1/2 -translate-y-1/2 text-green-600">
                        <CheckCircle className="w-5 h-5" />
                      </div>
                    )}
                    {!checkingHandle && handleAvailable === false && (
                      <div className="absolute right-3 top-1/2 -translate-y-1/2 text-red-600">
                        <AlertCircle className="w-5 h-5" />
                      </div>
                    )}
                  </div>
                  <p className="text-gray-600 text-xs mt-1">
                    3-30 characters, lowercase letters, numbers, and hyphens only
                  </p>
                  {handleAvailable === false && (
                    <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                      <AlertCircle className="w-4 h-4" />
                      This username is already taken
                    </p>
                  )}
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
                    About Me
                  </label>
                  <Textarea
                    value={bio}
                    onChange={(e) => {
                      setBio(e.target.value)
                      setErrors({ ...errors, bio: undefined })
                    }}
                    placeholder="Tell us about yourself..."
                    maxLength={500}
                    disabled={saving}
                    rows={4}
                  />
                  <div className="flex justify-between items-center mt-1">
                    <p className="text-gray-600 text-xs">Max 500 characters</p>
                    <span className="text-gray-600 text-xs">
                      {bio.length}/500
                    </span>
                  </div>
                  {errors.bio && (
                    <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                      <AlertCircle className="w-4 h-4" />
                      {errors.bio}
                    </p>
                  )}
                </div>

                {/* Location */}
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Location
                  </label>
                  <Input
                    type="text"
                    value={location}
                    onChange={(e) => {
                      setLocation(e.target.value)
                      setErrors({ ...errors, location: undefined })
                    }}
                    placeholder="City, Country"
                    maxLength={100}
                    disabled={saving}
                  />
                  <p className="text-gray-600 text-xs mt-1">Optional</p>
                  {errors.location && (
                    <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                      <AlertCircle className="w-4 h-4" />
                      {errors.location}
                    </p>
                  )}
                </div>

                {/* Website */}
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Website
                  </label>
                  <Input
                    type="text"
                    value={website}
                    onChange={(e) => {
                      setWebsite(e.target.value)
                      setErrors({ ...errors, website: undefined })
                    }}
                    placeholder="www.example.com"
                    maxLength={255}
                    disabled={saving}
                  />
                  <p className="text-gray-600 text-xs mt-1">Optional</p>
                  {errors.website && (
                    <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                      <AlertCircle className="w-4 h-4" />
                      {errors.website}
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Interests Section */}
            <Card>
              <CardHeader>
                <CardTitle>Interests</CardTitle>
                <p className="text-sm text-gray-600 mt-1">
                  Select the topics you're interested in
                </p>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
                  {INTERESTS.map((interest) => (
                    <button
                      key={interest.id}
                      type="button"
                      onClick={() => toggleInterest(interest.id)}
                      className={cn(
                        'px-4 py-2 rounded-full border-2 font-medium text-sm transition-all',
                        interests.includes(interest.id)
                          ? `${interest.color} border-current`
                          : 'bg-gray-100 text-gray-600 border-gray-200 hover:border-gray-300'
                      )}
                      disabled={saving}
                    >
                      {interest.label}
                    </button>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Error Message */}
            {errors.submit && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center gap-3">
                <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
                <p className="text-red-700 text-sm">
                  {errors.submit}
                </p>
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-3 justify-end pt-4 border-t">
              <Link href="/">
                <Button
                  type="button"
                  variant="ghost"
                  disabled={saving}
                >
                  Cancel
                </Button>
              </Link>
              <Button
                type="submit"
                variant="primary"
                loading={saving}
                disabled={saving}
              >
                Save Changes
              </Button>
            </div>
          </form>
        </div>
      </main>

      <Footer />
    </div>
  )
}
