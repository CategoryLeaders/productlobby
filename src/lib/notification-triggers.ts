/**
 * Notification Trigger Documentation
 * This file documents where notification triggers should be called in the API routes
 */

/**
 * NOTIFICATION TRIGGER CHECKLIST
 * ==============================
 *
 * Campaign Updates:
 * - Route: POST /api/campaigns/[id]/updates
 * - Trigger: notifyNewUpdate(campaignId, updateTitle)
 * - When: After successful CampaignUpdate creation
 * - Action: Notifies all campaign followers
 *
 * Creator Polls:
 * - Route: POST /api/campaigns/[id]/creator-polls
 * - Trigger: notifyNewPoll(campaignId, pollQuestion)
 * - When: After successful CreatorPoll creation
 * - Action: Notifies all campaign followers
 *
 * Poll Closed:
 * - Route: PATCH /api/campaigns/[id]/creator-polls/[pollId]
 * - Trigger: notifyPollClosed(campaignId, pollQuestion) when status changes to CLOSED
 * - When: When poll status is updated to CLOSED
 * - Action: Notifies all campaign followers
 *
 * Brand Response:
 * - Route: POST /api/brand/campaigns/[id]/response
 * - Trigger: notifyBrandResponse(campaignId, brandName)
 * - When: After successful BrandResponse creation
 * - Action: Notifies all campaign followers
 *
 * Comment Reply:
 * - Route: POST /api/campaigns/[id]/comments
 * - Trigger: notifyCommentReply(parentCommentUserId, replierName, campaignSlug)
 * - When: When creating a comment with parentId (replying to another comment)
 * - Action: Notifies the original comment author
 *
 * New Follower:
 * - Route: POST /api/campaigns/[id]/follow
 * - Trigger: notifyNewFollower(campaignCreatorId, followerName, campaignTitle)
 * - When: After successful Follow creation
 * - Action: Notifies the campaign creator
 *
 * Milestone:
 * - Route: Signal score update or lobby count update
 * - Trigger: notifyMilestone(campaignId, milestone)
 * - When: Specific thresholds are crossed (e.g., 100 lobbies, signal score 80)
 * - Action: Notifies all campaign followers
 */

// This file is purely documentation. Import from @/lib/notifications instead.
export {}
