import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getCurrentUser, requireAuth } from '@/lib/auth'

export const dynamic = 'force-dynamic'

// ============================================================================
// GET /api/user/account
// ============================================================================
// Returns account details for the authenticated user
export async function GET(req: NextRequest) {
  try {
    const user = await requireAuth()

    const account = await prisma.user.findUnique({
      where: { id: user.id },
      select: {
        id: true,
        email: true,
        displayName: true,
        handle: true,
        avatar: true,
        bio: true,
        emailVerified: true,
        createdAt: true,
      },
    })

    if (!account) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      account,
    })
  } catch (error) {
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    console.error('Error fetching user account:', error)
    return NextResponse.json(
      { error: 'Failed to fetch user account' },
      { status: 500 }
    )
  }
}

// ============================================================================
// PATCH /api/user/account
// ============================================================================
// Update account details: display name, bio, avatar, and handle
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

    if (bio && bio.length > 500) {
      errors.bio = 'Bio must be 500 characters or less'
    }

    if (avatar !== undefined && typeof avatar !== 'string') {
      errors.avatar = 'Avatar must be a string'
    }

    // Validate avatar is a valid URL if provided
    if (avatar && avatar.length > 0) {
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

    if (handle && handle.length > 0) {
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

    // Build update data
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

    const updatedAccount = await prisma.user.update({
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
        createdAt: true,
      },
    })

    return NextResponse.json({
      message: 'Account updated successfully',
      account: updatedAccount,
    })
  } catch (error) {
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    console.error('Error updating user account:', error)
    return NextResponse.json(
      { error: 'Failed to update user account' },
      { status: 500 }
    )
  }
}

// ============================================================================
// DELETE /api/user/account
// ============================================================================
// Soft delete user account (mark as deleted)
export async function DELETE(req: NextRequest) {
  try {
    const user = await requireAuth()

    // Get confirmation from request body
    const body = await req.json()
    const { confirmed } = body

    if (!confirmed) {
      return NextResponse.json(
        { error: 'Account deletion must be confirmed' },
        { status: 400 }
      )
    }

    // Perform soft delete by clearing sensitive data
    // For now, we'll keep the account but mark key fields as deleted
    await prisma.user.update({
      where: { id: user.id },
      data: {
        email: `deleted-${user.id}@deleted.local`,
        displayName: 'Deleted User',
        avatar: null,
        bio: null,
        handle: null,
        location: null,
        website: null,
        twitterHandle: null,
        instagramHandle: null,
        tiktokHandle: null,
        linkedinHandle: null,
        phoneE164: null,
      },
    })

    // Clear all sessions for this user
    await prisma.session.deleteMany({
      where: { userId: user.id },
    })

    return NextResponse.json({
      message: 'Account deleted successfully',
    })
  } catch (error) {
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    console.error('Error deleting user account:', error)
    return NextResponse.json(
      { error: 'Failed to delete user account' },
      { status: 500 }
    )
  }
}
