/**
 * Campaign Automation Rules API
 * GET /api/campaigns/[id]/automation-rules - Get all rules for campaign
 * POST /api/campaigns/[id]/automation-rules - Create new rule
 * DELETE /api/campaigns/[id]/automation-rules?id=ruleId - Delete rule
 *
 * Automation rules are stored as ContributionEvents with SOCIAL_SHARE eventType
 * and metadata containing rule configuration and execution history
 */

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getCurrentUser } from '@/lib/auth'

export const dynamic = 'force-dynamic'

interface Trigger {
  type: 'NEW_SUPPORTER' | 'VOTE_THRESHOLD' | 'TIME_BASED' | 'ENGAGEMENT_SCORE'
  config: Record<string, any>
}

interface Action {
  type: 'SEND_EMAIL' | 'UPDATE_STATUS' | 'NOTIFY_TEAM' | 'CREATE_TASK'
  config: Record<string, any>
}

interface AutomationRuleData {
  name: string
  description?: string
  trigger: Trigger
  action: Action
  isActive?: boolean
}

// ============================================================================
// GET /api/campaigns/[id]/automation-rules
// ============================================================================
// Returns all automation rules for a campaign with execution history
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id: campaignId } = params

    // Verify campaign exists
    const campaign = await prisma.campaign.findUnique({
      where: { id: campaignId },
      select: { id: true, creatorId: true },
    })

    if (!campaign) {
      return NextResponse.json(
        { success: false, error: 'Campaign not found' },
        { status: 404 }
      )
    }

    // Get all automation rule events for this campaign
    const ruleEvents = await prisma.contributionEvent.findMany({
      where: {
        campaignId,
        eventType: 'SOCIAL_SHARE',
        metadata: {
          path: ['action'],
          equals: 'automation_rule',
        },
      },
      orderBy: { createdAt: 'desc' },
      include: {
        user: {
          select: {
            id: true,
            displayName: true,
            avatar: true,
          },
        },
      },
    })

    // Group by rule ID and get latest version of each rule
    const rulesMap = new Map<string, any>()
    const executionHistoryMap = new Map<string, any[]>()

    ruleEvents.forEach((event) => {
      const metadata = (event.metadata as any) || {}
      const ruleId = metadata.ruleId || event.id

      if (metadata.isExecution) {
        // This is an execution history entry
        if (!executionHistoryMap.has(ruleId)) {
          executionHistoryMap.set(ruleId, [])
        }
        executionHistoryMap.get(ruleId)!.push({
          id: event.id,
          ruleId,
          timestamp: event.createdAt,
          status: metadata.executionStatus || 'PENDING',
          message: metadata.executionMessage || 'Execution recorded',
        })
      } else {
        // This is a rule definition or update
        if (!rulesMap.has(ruleId) || rulesMap.get(ruleId)!.createdAt < event.createdAt) {
          rulesMap.set(ruleId, {
            id: ruleId,
            campaignId,
            name: metadata.name,
            description: metadata.description,
            trigger: metadata.trigger,
            action: metadata.action,
            isActive: metadata.isActive !== false,
            createdAt: event.createdAt,
            updatedAt: event.createdAt,
            lastExecuted: metadata.lastExecuted,
            executionCount: metadata.executionCount || 0,
          })
        }
      }
    })

    // Convert to arrays
    const rules = Array.from(rulesMap.values())
    const executionHistory = Array.from(executionHistoryMap.values())
      .flat()
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())

    return NextResponse.json({
      success: true,
      data: {
        campaignId,
        rules,
        executionHistory: executionHistory.slice(0, 50), // Last 50 executions
        summary: {
          totalRules: rules.length,
          activeRules: rules.filter((r) => r.isActive).length,
          totalExecutions: rules.reduce((sum, r) => sum + r.executionCount, 0),
        },
      },
    })
  } catch (error) {
    console.error('[GET /api/campaigns/[id]/automation-rules]', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch automation rules' },
      { status: 500 }
    )
  }
}

// ============================================================================
// POST /api/campaigns/[id]/automation-rules
// ============================================================================
// Create a new automation rule or update/execute existing rule
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized - authentication required' },
        { status: 401 }
      )
    }

    const { id: campaignId } = params
    const url = new URL(request.url)
    const ruleIdParam = url.searchParams.get('id')
    const toggleParam = url.searchParams.get('toggle')

    const body = await request.json()
    const { name, description, trigger, action, isActive }: AutomationRuleData = body

    // Verify campaign exists and user is creator
    const campaign = await prisma.campaign.findUnique({
      where: { id: campaignId },
      select: { id: true, creatorId: true },
    })

    if (!campaign) {
      return NextResponse.json(
        { success: false, error: 'Campaign not found' },
        { status: 404 }
      )
    }

    // Only campaign creator can manage automation rules
    if (campaign.creatorId !== user.id) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized - only campaign creator can manage automation rules' },
        { status: 403 }
      )
    }

    // Handle toggle request
    if (toggleParam === 'true' && ruleIdParam) {
      const previousEvent = await prisma.contributionEvent.findFirst({
        where: {
          campaignId,
          eventType: 'SOCIAL_SHARE',
          metadata: {
            path: ['ruleId'],
            equals: ruleIdParam,
          },
        },
        orderBy: { createdAt: 'desc' },
      })

      if (!previousEvent) {
        return NextResponse.json(
          { success: false, error: 'Rule not found' },
          { status: 404 }
        )
      }

      const previousMetadata = (previousEvent.metadata as any) || {}

      // Create new event for toggle
      const event = await prisma.contributionEvent.create({
        data: {
          userId: user.id,
          campaignId,
          eventType: 'SOCIAL_SHARE',
          points: 2,
          metadata: {
            action: 'automation_rule',
            ruleId: ruleIdParam,
            name: previousMetadata.name,
            description: previousMetadata.description,
            trigger: previousMetadata.trigger,
            action: previousMetadata.action,
            isActive: isActive,
            executionCount: previousMetadata.executionCount || 0,
            lastExecuted: previousMetadata.lastExecuted,
          },
        },
      })

      const updatedRule = {
        id: ruleIdParam,
        campaignId,
        name: previousMetadata.name,
        description: previousMetadata.description,
        trigger: previousMetadata.trigger,
        action: previousMetadata.action,
        isActive: isActive,
        createdAt: previousEvent.createdAt,
        updatedAt: event.createdAt,
        lastExecuted: previousMetadata.lastExecuted,
        executionCount: previousMetadata.executionCount || 0,
      }

      return NextResponse.json(
        {
          success: true,
          data: updatedRule,
        },
        { status: 200 }
      )
    }

    // Validate required fields
    if (!name || !trigger || !action) {
      return NextResponse.json(
        { success: false, error: 'Name, trigger, and action are required' },
        { status: 400 }
      )
    }

    // Validate trigger and action types
    const validTriggers = ['NEW_SUPPORTER', 'VOTE_THRESHOLD', 'TIME_BASED', 'ENGAGEMENT_SCORE']
    const validActions = ['SEND_EMAIL', 'UPDATE_STATUS', 'NOTIFY_TEAM', 'CREATE_TASK']

    if (!validTriggers.includes(trigger.type)) {
      return NextResponse.json(
        { success: false, error: 'Invalid trigger type' },
        { status: 400 }
      )
    }

    if (!validActions.includes(action.type)) {
      return NextResponse.json(
        { success: false, error: 'Invalid action type' },
        { status: 400 }
      )
    }

    // Handle rule update
    if (ruleIdParam) {
      const previousEvent = await prisma.contributionEvent.findFirst({
        where: {
          campaignId,
          eventType: 'SOCIAL_SHARE',
          metadata: {
            path: ['ruleId'],
            equals: ruleIdParam,
          },
        },
        orderBy: { createdAt: 'desc' },
      })

      if (!previousEvent) {
        return NextResponse.json(
          { success: false, error: 'Rule not found' },
          { status: 404 }
        )
      }

      const previousMetadata = (previousEvent.metadata as any) || {}

      // Create event for rule update
      const event = await prisma.contributionEvent.create({
        data: {
          userId: user.id,
          campaignId,
          eventType: 'SOCIAL_SHARE',
          points: 3,
          metadata: {
            action: 'automation_rule',
            ruleId: ruleIdParam,
            name,
            description,
            trigger,
            action,
            isActive: isActive !== false,
            executionCount: previousMetadata.executionCount || 0,
            lastExecuted: previousMetadata.lastExecuted,
          },
        },
      })

      const updatedRule = {
        id: ruleIdParam,
        campaignId,
        name,
        description,
        trigger,
        action,
        isActive: isActive !== false,
        createdAt: previousEvent.createdAt,
        updatedAt: event.createdAt,
        lastExecuted: previousMetadata.lastExecuted,
        executionCount: previousMetadata.executionCount || 0,
      }

      return NextResponse.json(
        {
          success: true,
          data: updatedRule,
          message: 'Rule updated successfully',
        },
        { status: 200 }
      )
    }

    // Create new rule
    const ruleId = `rule-${crypto.randomUUID()}`

    const event = await prisma.contributionEvent.create({
      data: {
        userId: user.id,
        campaignId,
        eventType: 'SOCIAL_SHARE',
        points: 5,
        metadata: {
          action: 'automation_rule',
          ruleId,
          name,
          description,
          trigger,
          action,
          isActive: true,
          executionCount: 0,
        },
      },
    })

    const newRule = {
      id: ruleId,
      campaignId,
      name,
      description,
      trigger,
      action,
      isActive: true,
      createdAt: event.createdAt,
      updatedAt: event.createdAt,
      lastExecuted: undefined,
      executionCount: 0,
    }

    return NextResponse.json(
      {
        success: true,
        data: newRule,
        message: 'Automation rule created successfully',
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('[POST /api/campaigns/[id]/automation-rules]', error)
    return NextResponse.json(
      { success: false, error: 'Failed to manage automation rule' },
      { status: 500 }
    )
  }
}

// ============================================================================
// DELETE /api/campaigns/[id]/automation-rules?id=ruleId
// ============================================================================
// Delete an automation rule (soft delete via status flag)
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized - authentication required' },
        { status: 401 }
      )
    }

    const { id: campaignId } = params
    const url = new URL(request.url)
    const ruleId = url.searchParams.get('id')

    if (!ruleId) {
      return NextResponse.json(
        { success: false, error: 'Rule ID is required' },
        { status: 400 }
      )
    }

    // Verify campaign exists and user is creator
    const campaign = await prisma.campaign.findUnique({
      where: { id: campaignId },
      select: { id: true, creatorId: true },
    })

    if (!campaign) {
      return NextResponse.json(
        { success: false, error: 'Campaign not found' },
        { status: 404 }
      )
    }

    if (campaign.creatorId !== user.id) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized - only campaign creator can delete rules' },
        { status: 403 }
      )
    }

    // Find the rule
    const previousEvent = await prisma.contributionEvent.findFirst({
      where: {
        campaignId,
        eventType: 'SOCIAL_SHARE',
        metadata: {
          path: ['ruleId'],
          equals: ruleId,
        },
      },
      orderBy: { createdAt: 'desc' },
    })

    if (!previousEvent) {
      return NextResponse.json(
        { success: false, error: 'Rule not found' },
        { status: 404 }
      )
    }

    const previousMetadata = (previousEvent.metadata as any) || {}

    // Create deletion event (soft delete)
    await prisma.contributionEvent.create({
      data: {
        userId: user.id,
        campaignId,
        eventType: 'SOCIAL_SHARE',
        points: 0,
        metadata: {
          action: 'automation_rule_deleted',
          ruleId,
          name: previousMetadata.name,
          deletedAt: new Date().toISOString(),
        },
      },
    })

    return NextResponse.json(
      {
        success: true,
        message: 'Rule deleted successfully',
      },
      { status: 200 }
    )
  } catch (error) {
    console.error('[DELETE /api/campaigns/[id]/automation-rules]', error)
    return NextResponse.json(
      { success: false, error: 'Failed to delete automation rule' },
      { status: 500 }
    )
  }
}
