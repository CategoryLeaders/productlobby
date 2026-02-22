import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { calculateSurveyResults, exportResults } from '@/lib/survey-engine'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string; surveyId: string } }
) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const survey = await prisma.survey.findUnique({
      where: { id: params.surveyId },
    })

    if (!survey) {
      return NextResponse.json({ error: 'Survey not found' }, { status: 404 })
    }

    if (survey.creatorUserId !== user.id) {
      return NextResponse.json(
        { error: 'Unauthorized to view results' },
        { status: 403 }
      )
    }

    const format = request.nextUrl.searchParams.get('format')

    if (format === 'CSV' || format === 'JSON') {
      const exportData = await exportResults(survey.id, format)

      const headers = new Headers()
      headers.set(
        'Content-Type',
        format === 'CSV' ? 'text/csv' : 'application/json'
      )
      headers.set(
        'Content-Disposition',
        `attachment; filename="survey-results.${format.toLowerCase()}"`
      )

      return new NextResponse(exportData, { headers })
    }

    const results = await calculateSurveyResults(survey.id)

    return NextResponse.json(results)
  } catch (error) {
    console.error('Error fetching survey results:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
