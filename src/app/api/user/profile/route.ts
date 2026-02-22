import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getCurrentUser, requireAuth } from '@/lib/auth'

export async function PATCH(req: NextRequest) {
  try {
    const user = await requireAuth()

    const body = await req.json()
    const { displayName, bio, avatar, handle } = body

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

    if (bio && bio.length > 300) {
      errors.bio = 'Bio must be 300 characters or less'
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
