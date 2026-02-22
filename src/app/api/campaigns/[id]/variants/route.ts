import { getCurrentUser } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { NextRequest, NextResponse } from 'next/server'

type Params = Promise<{ id: string }>

// GET: List all variants/preference fields for a campaign with their options
export async function GET(
  _request: NextRequest,
  props: { params: Params }
) {
  try {
    const { id } = await props.params

    const campaign = await prisma.campaign.findUnique({
      where: { id },
    })

    if (!campaign) {
      return NextResponse.json(
        { error: 'Campaign not found' },
        { status: 404 }
      )
    }

    // Fetch all preference fields for the campaign
    const preferenceFields = await prisma.campaignPreferenceField.findMany({
      where: { campaignId: id },
      orderBy: { order: 'asc' },
    })

    // Format the response to include options
    const variants = preferenceFields.map((field) => ({
      id: field.id,
      name: field.fieldName,
      fieldType: field.fieldType,
      options: field.options ? (Array.isArray(field.options) ? field.options : []) : [],
      description: field.placeholder || '',
      required: field.required,
      order: field.order,
      createdAt: field.createdAt,
    }))

    return NextResponse.json({
      success: true,
      data: variants,
    })
  } catch (error) {
    console.error('GET /api/campaigns/[id]/variants error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// POST: Create a new variant field
export async function POST(
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

    const { id } = await props.params

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

    const body = await request.json()
    const { name, fieldType, options, description } = body

    // Validate required fields
    if (!name || !fieldType) {
      return NextResponse.json(
        { error: 'Missing required fields: name, fieldType' },
        { status: 400 }
      )
    }

    // Validate fieldType
    const validFieldTypes = ['SELECT', 'MULTI_SELECT', 'TEXT', 'NUMBER', 'RANGE']
    const normalizedFieldType = fieldType.toUpperCase()
    if (!validFieldTypes.includes(normalizedFieldType)) {
      return NextResponse.json(
        { error: `Invalid fieldType. Must be one of: ${validFieldTypes.join(', ')}` },
        { status: 400 }
      )
    }

    // Get the next order number
    const lastField = await prisma.campaignPreferenceField.findFirst({
      where: { campaignId: id },
      orderBy: { order: 'desc' },
    })

    const nextOrder = (lastField?.order ?? -1) + 1

    // Create the preference field
    const preferenceField = await prisma.campaignPreferenceField.create({
      data: {
        campaignId: id,
        fieldName: name,
        fieldType: normalizedFieldType,
        options: ['SELECT', 'MULTI_SELECT'].includes(normalizedFieldType)
          ? options || []
          : null,
        placeholder: description || null,
        required: false,
        order: nextOrder,
      },
    })

    return NextResponse.json(
      {
        success: true,
        data: {
          id: preferenceField.id,
          name: preferenceField.fieldName,
          fieldType: preferenceField.fieldType,
          options: preferenceField.options || [],
          description: preferenceField.placeholder || '',
          required: preferenceField.required,
          order: preferenceField.order,
          createdAt: preferenceField.createdAt,
        },
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('POST /api/campaigns/[id]/variants error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
