import { NextRequest, NextResponse } from 'next/server'
import { del } from '@vercel/blob'
import { getCurrentUser } from '@/lib/auth'

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      )
    }

    const imageId = decodeURIComponent(params.id)

    // Verify the image belongs to the current user
    // Only allow deletion of images in user's own directory
    if (!imageId.includes(`campaigns/${user.id}/`)) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 403 }
      )
    }

    await del(imageId)

    return NextResponse.json({
      success: true,
      message: 'Image deleted successfully',
    })
  } catch (error) {
    console.error('Delete image error:', error)
    return NextResponse.json(
      { success: false, error: 'Deletion failed' },
      { status: 500 }
    )
  }
}
