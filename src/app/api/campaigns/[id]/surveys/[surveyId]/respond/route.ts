import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth'
import { prisma } from '@/lib/db'
import {
  createSurveyResponse,
  submitSurveyAnswer,
  completeSurveyResponse,
} from '@/lib/survey-engine'

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string; surveyId: string } }
) {
  try {
    const user = await getCurrentUser()

    const survey = await prisma.survey.findUnique({
      where: { id: params.surveyId },
      include: {
        questions: {
          orderBy: { order: 'asc' },
        },
      },
    })

    if (!survey) {
      return NextResponse.json({ error: 'Survey not found' }, { status: 404 })
    }

    if (survey.status !== 'PUBLISHED') {
      return NextResponse.json({ error: 'Survey is not published' }, { status: 400 })
    }

    const { answers, isAnonymous, lobbyIntensity } = await request.json()

    if (!answers || Object.keys(answers).length === 0) {
      return NextResponse.json({ error: 'No answers provided' }, { status: 400 })
    }

    const validateRequiredAnswers = survey.questions
      .filter((q) => q.required)
      .every((q) => answers[q.id] !== undefined && answers[q.id] !== null && answers[q.id] !== '')

    if (!validateRequiredAnswers) {
      return NextResponse.json({ error: 'All required questions must be answered' }, { status: 400 })
    }

    const responseId = await createSurveyResponse(
      survey.id,
      isAnonymous ? undefined : user?.id,
      lobbyIntensity
    )

    for (const [questionId, answer] of Object.entries(answers)) {
      if (answer !== undefined && answer !== null && answer !== '') {
        await submitSurveyAnswer(responseId, questionId, answer)
      }
    }

    await completeSurveyResponse(responseId)

    const completedCount = await prisma.surveyResponse.count({
      where: {
        surveyId: survey.id,
        completedAt: { not: null },
      },
    })

    await prisma.survey.update({
      where: { id: survey.id },
      data: {
        responseCount: completedCount,
      },
    })

    return NextResponse.json({
      success: true,
      responseId,
    })
  } catch (error) {
    console.error('Error submitting survey response:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
