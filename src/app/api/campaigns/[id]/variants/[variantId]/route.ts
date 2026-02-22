import { getCurrentUser } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { NextRequest, NextResponse } from 'next/server'

type Params = Promise<{ id: string; variantId: string }>

// PATCH: Update variant field (creator only)
export async function PATCH(
  request: NextRequest,
  props: { params: Params }
) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { id, variantId } = await props.params

    const campaign = await prisma.campaign.findUnique({
      where: { id },
    })

    if (!campaign) {
      return NextResponse.json(
        { error: 'Campaign not found' },
        { status: 404 }
      )
    }

    if (campaign.creatorUserId !== user.id) {
      return NextResponse.json(
        { error: 'Forbidden' },
        { status: 403 }
      )
    }

    const field = await prisma.campaignPreferenceField.findUnique({
      where: { id: variantId },
    })

    if (!field || field.campaignId !== id) {
      return NextResponse.json(
        { error: 'Variant field not found' },
        { status: 404 }
      )
    }

    const body = await request.json()
    const { name, options, description, order } = body

    if (options && (!Array.isArray(options) || options.length === 0)) {
      return NextResponse.json(
        { error: 'Options must be a non-empty array' },
        { status: 400 }
      )
    }

    const updatedField = await prisma.campaignPreferenceField.update({
      where: { id: variantId },
      data: {
        ...(name && { fieldName: name }),
        ...(options && { options }),
        ...(description !== undefined && { placeholder: description }),
        ...(order !== undefined && { order }),
      },
    })

    return NextResponse.json({
      success: true,
      data: {
        id: updatedField.id,
        name: updatedField.fieldName,
        fieldType: updatedField.fieldType,
        options: updatedField.options || [],
        description: updatedField.placeholder || '',
        required: updatedField.required,
        order: updatedField.order,
        createdAt: updatedField.createdAt,
      },
    })
  } catch (error) {
    console.error('PATCH /api/campaigns/[id]/variants/[variantId] error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// DELETE: Remove variant field (creator only)
export async function DELETE(
  _request: NextRequest,
  props: { params: Params }
) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { id, variantId } = await props.params

    const campaign = await prisma.campaign.findUnique({
      where: { id },
    })

    if (!campaign) {
      return NextResponse.json(
        { error: 'Campaign not found' },
        { status: 404 }
      )
    }

    if (campaign.creatorUserId !== user.id) {
      return NextResponse.json(
        { error: 'Forbidden' },
        { status: 403 }
      )
    }

    const field = await prisma.campaignPreferenceField.findUnique({
      where: { id: variantId },
    })

    if (!field || field.campaignId !== id) {
      return NextResponse.json(
        { error: 'Variant field not found' },
        { status: 404 }
      )
    }

    await prisma.campaignPreferenceField.delete({
      where: { id: variantId },
    })

    return NextResponse.json({
      success: true,
      message: 'Variant field deleted successfully',
    })
  } catch (error) {
    console.error('DELETE /api/campaigns/[id]/variants/[variantId] error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
