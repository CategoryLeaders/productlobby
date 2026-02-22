import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getCurrentUser } from '@/lib/auth'

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const adminEmail = process.env.ADMIN_EMAIL
    if (!adminEmail || user.email !== adminEmail) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const searchParams = request.nextUrl.searchParams
    const tier = searchParams.get('tier')

    const where: any = {}
    if (tier) {
      where.tier = tier
    }

    const templates = await prisma.outreachTemplate.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json(templates)
  } catch (error) {
    console.error('Get templates error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch templates' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const adminEmail = process.env.ADMIN_EMAIL
    if (!adminEmail || user.email !== adminEmail) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { name, subject, htmlBody, textBody, tier, variables } = await request.json()

    if (!name || !subject || !htmlBody || !textBody || !tier) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    const template = await prisma.outreachTemplate.create({
      data: {
        name,
        subject,
        htmlBody,
        textBody,
        tier,
        variables: variables || null,
      },
    })

    return NextResponse.json(template, { status: 201 })
  } catch (error) {
    console.error('Create template error:', error)
    return NextResponse.json(
      { error: 'Failed to create template' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const adminEmail = process.env.ADMIN_EMAIL
    if (!adminEmail || user.email !== adminEmail) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { id, name, subject, htmlBody, textBody, tier, variables } = await request.json()

    if (!id) {
      return NextResponse.json({ error: 'Template ID required' }, { status: 400 })
    }

    const template = await prisma.outreachTemplate.update({
      where: { id },
      data: {
        ...(name && { name }),
        ...(subject && { subject }),
        ...(htmlBody && { htmlBody }),
        ...(textBody && { textBody }),
        ...(tier && { tier }),
        ...(variables && { variables }),
      },
    })

    return NextResponse.json(template)
  } catch (error) {
    console.error('Update template error:', error)
    return NextResponse.json(
      { error: 'Failed to update template' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const adminEmail = process.env.ADMIN_EMAIL
    if (!adminEmail || user.email !== adminEmail) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const searchParams = request.nextUrl.searchParams
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json({ error: 'Template ID required' }, { status: 400 })
    }

    await prisma.outreachTemplate.delete({
      where: { id },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Delete template error:', error)
    return NextResponse.json(
      { error: 'Failed to delete template' },
      { status: 500 }
    )
  }
}
