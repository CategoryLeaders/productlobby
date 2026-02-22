import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getCurrentUser, requireAuth } from '@/lib/auth'

export async function GET(req: NextRequest) {
  try {
    const user = await requireAuth()

    const profile = await prisma.user.findUnique({
      where: { id: user.id },
      select: {
        id: true,
        email: true,
        displayName: true,
        handle: true,
        avatar: true,
        bio: true,
        location: true,
        website: true,
        interests: true,
        emailVerified: true,
      },
    })

    if (!profile) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      user: profile,
    })
  } catch (error) {
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    console.error('Error fetching user profile:', error)
    return NextResponse.json(
      { error: 'Failed to fetch user profile' },
      { status: 500 }
    )
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const user = await requireAuth()

    const body = await req.json()
    const { displayName, bio, avatar, handle, location, website, interests } = body

    // Validate inputs
    const errors: Record<string, string> = {}

    if (displayName !== undefined && typeof displayName !== 'string') {
      errors.displayName = 'Display name must be a string'
    }

    if (displayName && displayName.length < 1) {
      errors.displayName = 'Display name is required'
    }

    if (displayName && displayName.length > 100) {
      errors.displayName = 'Display name must be 100 characters or less'
    }

    if (bio !== undefined && typeof bio !== 'string') {
      errors.bio = 'Bio must be a string'
    }

    if (bio && bio.length > 500) {
      errors.bio = 'Bio must be 500 characters or less'
    }

    if (avatar !== undefined && typeof avatar !== 'string') {
      errors.avatar = 'Avatar must be a string'
    }

    // Validate avatar is a valid URL
    if (avatar) {
      try {
        new URL(avatar)
      } catch {
        errors.avatar = 'Avatar must be a valid URL'
      }
    }

    // Validate location
    if (location !== undefined && typeof location !== 'string') {
      errors.location = 'Location must be a string'
    }

    if (location && location.length > 100) {
      errors.location = 'Location must be 100 characters or less'
    }

    // Validate website
    if (website !== undefined && typeof website !== 'string') {
      errors.website = 'Website must be a string'
    }

    if (website && website.length > 255) {
      errors.website = 'Website must be 255 characters or less'
    }

    // Accept domains with or without protocol (e.g. www.example.com, example.me, https://example.com)
    if (website && !errors.website) {
      const domainRegex = /^(https?:\/\/)?([a-zA-Z0-9-]+\.)+[a-zA-Z]{2,}(\/.*)?$/
      if (!domainRegex.test(website.trim())) {
        errors.website = 'Please enter a valid website address'
      }
    }

    // Validate interests
    if (interests !== undefined) {
      if (!Array.isArray(interests)) {
        errors.interests = 'Interests must be an array'
      } else {
        const validInterests = ['tech', 'home', 'health', 'food', 'fashion', 'sustainability', 'pets', 'kids', 'travel', 'fitness']
        const invalidInterests = interests.filter((i) => !validInterests.includes(i))
        if (invalidInterests.length > 0) {
          errors.interests = 'Invalid interests selected'
        }
      }
    }

    // Validate handle
    if (handle !== undefined && typeof handle !== 'string') {
      errors.handle = 'Handle must be a string'
    }

    if (handle) {
      // Handle validation: lowercase alphanumeric + hyphens, 3-30 chars
      const handleRegex = /^[a-z0-9-]{3,30}$/
      if (!handleRegex.test(handle)) {
        errors.handle = 'Handle must be 3-30 characters and contain only lowercase letters, numbers, and hyphens'
      }

      // Check if handle is unique (excluding current user)
      const existingHandle = await prisma.user.findFirst({
        where: {
          handle,
          id: { not: user.id },
        },
      })

      if (existingHandle) {
        errors.handle = 'This handle is already taken'
      }
    }

    if (Object.keys(errors).length > 0) {
      return NextResponse.json(
        { error: 'Validation failed', errors },
        { status: 400 }
      )
    }

    // Update user
    const updateData: Record<string, any> = {}

    if (displayName !== undefined) {
      updateData.displayName = displayName
    }

    if (bio !== undefined) {
      updateData.bio = bio || null
    }

    if (avatar !== undefined) {
      updateData.avatar = avatar || null
    }

    if (location !== undefined) {
      updateData.location = location || null
    }

    if (website !== undefined) {
      updateData.website = website || null
    }

    if (interests !== undefined) {
      updateData.interests = interests || []
    }

    if (handle !== undefined) {
      updateData.handle = handle || null
    }

    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: updateData,
      select: {
        id: true,
        email: true,
        displayName: true,
        handle: true,
        avatar: true,
        bio: true,
        location: true,
        website: true,
        interests: true,
        emailVerified: true,
      },
    })

    return NextResponse.json({
      message: 'Profile updated successfully',
      user: updatedUser,
    })
  } catch (error) {
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    console.error('Error updating user profile:', error)
    return NextResponse.json(
      { error: 'Failed to update user profile' },
      { status: 500 }
    )
  }
}
