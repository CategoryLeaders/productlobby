// POST /api/cron/weekly-digest
// Sends weekly digest emails to all creators with active campaigns
// Called by Vercel Cron (Monday 9am UTC) or manually with CRON_SECRET

import { NextRequest, NextResponse } from 'next/server'
import { sendWeeklyCreatorDigests } from '@/lib/email/send-digest'

/**
 * POST /api/cron/weekly-digest
 * Generates and sends weekly digest emails to creators
 *
 * Required header: x-cron-secret matching env CRON_SECRET
 *
 * Response:
 * {
 *   success: boolean
 *   total: number (creators processed)
 *   sent: number (successful emails)
 *   failed: number (failed emails)
 *   results: Array of {creatorId, creatorEmail, creatorName, digestSent, reason?}
 *   errors: Array of error messages
 * }
 */
export async function POST(request: NextRequest) {
  try {
    // Verify cron secret
    const cronSecret = request.headers.get('x-cron-secret')
    if (cronSecret !== process.env.CRON_SECRET) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Send the weekly digests
    const result = await sendWeeklyCreatorDigests()

    return NextResponse.json({
      success: true,
      ...result,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error('[POST /api/cron/weekly-digest]', error)
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to generate weekly creator digests',
        details: errorMessage,
      },
      { status: 500 }
    )
  }
}

/**
 * Optional GET endpoint for manual testing
 * Only works if ALLOW_CRON_GET is set to true
 */
export async function GET(request: NextRequest) {
  // Security: Only allow GET in development or with explicit permission
  const allowGet = process.env.ALLOW_CRON_GET === 'true'
  if (!allowGet && process.env.NODE_ENV === 'production') {
    return NextResponse.json(
      { error: 'Method not allowed' },
      { status: 405 }
    )
  }

  // Verify cron secret even for GET
  const cronSecret = request.headers.get('x-cron-secret')
  if (cronSecret !== process.env.CRON_SECRET) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    )
  }

  try {
    const result = await sendWeeklyCreatorDigests()

    return NextResponse.json({
      success: true,
      ...result,
      timestamp: new Date().toISOString(),
      mode: 'test',
    })
  } catch (error) {
    console.error('[GET /api/cron/weekly-digest]', error)
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to generate weekly creator digests',
        details: errorMessage,
      },
      { status: 500 }
    )
  }
}
