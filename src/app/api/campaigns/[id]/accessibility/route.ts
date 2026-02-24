import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/auth'

export const dynamic = 'force-dynamic'

interface AccessibilityIssue {
  id: string
  type: 'error' | 'warning' | 'info'
  category: 'color_contrast' | 'alt_text' | 'heading_structure' | 'link_text' | 'form_labels' | 'keyboard_nav'
  description: string
  element: string
  suggestion: string
  wcagLevel: 'A' | 'AA' | 'AAA'
}

interface AccessibilityReport {
  score: number
  totalIssues: number
  errors: number
  warnings: number
  info: number
  issues: AccessibilityIssue[]
  lastChecked: string
}

function generateSimulatedReport(): AccessibilityReport {
  const issues: AccessibilityIssue[] = [
    {
      id: '1',
      type: 'error',
      category: 'color_contrast',
      description: 'Low contrast text detected',
      element: '.campaign-title',
      suggestion: 'Increase contrast ratio to meet WCAG AA standards (minimum 4.5:1)',
      wcagLevel: 'AA',
    },
    {
      id: '2',
      type: 'error',
      category: 'alt_text',
      description: 'Missing alt text for image',
      element: '<img id="hero-image">',
      suggestion: 'Add descriptive alt text that conveys the meaning of the image',
      wcagLevel: 'A',
    },
    {
      id: '3',
      type: 'warning',
      category: 'heading_structure',
      description: 'Heading hierarchy skipped (h1 to h3)',
      element: '<h1> followed by <h3>',
      suggestion: 'Use h2 between h1 and h3 to maintain proper heading structure',
      wcagLevel: 'A',
    },
    {
      id: '4',
      type: 'warning',
      category: 'link_text',
      description: 'Non-descriptive link text',
      element: '<a href="/campaign">click here</a>',
      suggestion: 'Use descriptive link text like "View campaign details" instead of "click here"',
      wcagLevel: 'A',
    },
    {
      id: '5',
      type: 'warning',
      category: 'form_labels',
      description: 'Form input missing associated label',
      element: '<input type="email">',
      suggestion: 'Add a <label> element with for attribute matching the input id',
      wcagLevel: 'A',
    },
    {
      id: '6',
      type: 'warning',
      category: 'keyboard_nav',
      description: 'Custom button not keyboard accessible',
      element: '<div class="custom-button">',
      suggestion: 'Use native <button> element or add role="button" with keyboard event handlers',
      wcagLevel: 'A',
    },
    {
      id: '7',
      type: 'info',
      category: 'alt_text',
      description: 'Consider adding extended description for complex image',
      element: '<img id="data-chart">',
      suggestion: 'Provide a data table or text description as supplement to the chart',
      wcagLevel: 'AAA',
    },
    {
      id: '8',
      type: 'info',
      category: 'color_contrast',
      description: 'Secondary text could improve contrast',
      element: '.secondary-text',
      suggestion: 'Consider increasing contrast from 3.8:1 to 4.5:1 for enhanced readability',
      wcagLevel: 'AAA',
    },
    {
      id: '9',
      type: 'info',
      category: 'keyboard_nav',
      description: 'Focus indicator could be more visible',
      element: ':focus pseudo-class',
      suggestion: 'Add a more prominent focus indicator for keyboard navigation',
      wcagLevel: 'AAA',
    },
  ]

  return {
    score: 74,
    totalIssues: 9,
    errors: 2,
    warnings: 4,
    info: 3,
    issues,
    lastChecked: new Date().toISOString(),
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const campaign = await prisma.campaign.findUnique({
      where: { id: params.id },
      select: { userId: true },
    })

    if (!campaign || campaign.userId !== user.id) {
      return NextResponse.json({ error: 'Campaign not found' }, { status: 404 })
    }

    const report = generateSimulatedReport()
    return NextResponse.json(report)
  } catch (error) {
    console.error('Error fetching accessibility report:', error)
    return NextResponse.json(
      { error: 'Failed to fetch accessibility report' },
      { status: 500 }
    )
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const campaign = await prisma.campaign.findUnique({
      where: { id: params.id },
      select: { userId: true },
    })

    if (!campaign || campaign.userId !== user.id) {
      return NextResponse.json({ error: 'Campaign not found' }, { status: 404 })
    }

    // Simulate running a new accessibility check
    const report = generateSimulatedReport()
    return NextResponse.json(report)
  } catch (error) {
    console.error('Error running accessibility check:', error)
    return NextResponse.json(
      { error: 'Failed to run accessibility check' },
      { status: 500 }
    )
  }
}
