import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth'
import { prisma } from '@/lib/db'

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const campaignId = params.id

    const campaign = await prisma.campaign.findUnique({
      where: { id: campaignId },
    })

    if (!campaign) {
      return NextResponse.json({ error: 'Campaign not found' }, { status: 404 })
    }

    const surveys = await prisma.survey.findMany({
      where: { campaignId },
      include: {
        questions: {
          orderBy: { order: 'asc' },
        },
        _count: {
          select: { responses: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    })

    const formattedSurveys = surveys.map((survey) => ({
      ...survey,
      responseCount: survey._count.responses,
    }))

    return NextResponse.json(formattedSurveys)
  } catch (error) {
    console.error('Error fetching surveys:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const campaignId = params.id
    const { title, description, surveyType, isAnonymous, questions, status } = await request.json()

    const campaign = await prisma.campaign.findUnique({
      where: { id: campaignId },
      include: { targetedBrand: true },
    })

    if (!campaign) {
      return NextResponse.json({ error: 'Campaign not found' }, { status: 404 })
    }

    if (!campaign.targetedBrandId) {
      return NextResponse.json({ error: 'Campaign must have a targeted brand' }, { status: 400 })
    }

    if (!title || title.trim().length === 0) {
      return NextResponse.json({ error: 'Survey title is required' }, { status: 400 })
    }

    if (!questions || questions.length === 0) {
      return NextResponse.json({ error: 'Survey must have at least one question' }, { status: 400 })
    }

    const survey = await prisma.survey.create({
      data: {
        campaignId,
        brandId: campaign.targetedBrandId,
        creatorUserId: user.id,
        title,
        description: description || null,
        surveyType,
        isAnonymous,
        status: status || 'DRAFT',
        questions: {
          create: questions.map((q: any, idx: number) => ({
            question: q.question,
            description: q.description || null,
            questionType: q.questionType,
            options: q.options ? JSON.stringify(q.options) : null,
            minScale: q.minScale || null,
            maxScale: q.maxScale || null,
            minLabel: q.minLabel || null,
            maxLabel: q.maxLabel || null,
            required: q.required,
            order: idx,
          })),
        },
      },
      include: {
        questions: {
          orderBy: { order: 'asc' },
        },
      },
    })

    return NextResponse.json(survey)
  } catch (error) {
    console.error('Error creating survey:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
