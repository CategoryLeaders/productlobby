'use client'

import React, { useEffect, useState } from 'react'
import {
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  ChevronRight,
  MessageSquare,
  Filter,
  User,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { formatDate, formatRelativeTime } from '@/lib/utils'

interface ApprovalItem {
  id: string
  title: string
  submitterId: string
  submitterName: string
  submitterAvatar?: string
  submittedAt: string
  currentStage: 'Draft' | 'Review' | 'Approved' | 'Published'
  assignedReviewerId?: string
  assignedReviewerName?: string
  status: 'pending' | 'approved' | 'rejected'
  rejectionReason?: string
  approvalHistory: Array<{
    id: string
    action: 'approved' | 'rejected'
    reviewerId: string
    reviewerName: string
    comment: string
    timestamp: string
  }>
}

interface ApprovalWorkflowProps {
  campaignId: string
}

const WORKFLOW_STAGES = ['Draft', 'Review', 'Approved', 'Published']

const getStageIndex = (stage: string): number => {
  return WORKFLOW_STAGES.indexOf(stage)
}

const getStageColor = (stage: string): string => {
  switch (stage) {
    case 'Draft':
      return 'bg-slate-200'
    case 'Review':
      return 'bg-blue-200'
    case 'Approved':
      return 'bg-amber-200'
    case 'Published':
      return 'bg-green-200'
    default:
      return 'bg-slate-200'
  }
}

const getStatusIcon = (status: string) => {
  switch (status) {
    case 'approved':
      return <CheckCircle2 className="w-5 h-5 text-green-600" />
    case 'rejected':
      return <XCircle className="w-5 h-5 text-red-600" />
    case 'pending':
    default:
      return <Clock className="w-5 h-5 text-blue-600" />
  }
}

const getStatusLabel = (status: string): string => {
  switch (status) {
    case 'approved':
      return 'Approved'
    case 'rejected':
      return 'Rejected'
    case 'pending':
    default:
      return 'Pending'
  }
}

export const ApprovalWorkflow: React.FC<ApprovalWorkflowProps> = ({
  campaignId,
}) => {
  const [approvals, setApprovals] = useState<ApprovalItem[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedStage, setSelectedStage] = useState<string | null>(null)
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [commentText, setCommentText] = useState<Record<string, string>>({})
  const [submitting, setSubmitting] = useState<Record<string, boolean>>({})

  useEffect(() => {
    fetchApprovals()
  }, [campaignId])

  const fetchApprovals = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/campaigns/${campaignId}/approvals`)
      if (!response.ok) throw new Error('Failed to fetch approvals')
      const data = await response.json()
      setApprovals(data.items || [])
    } catch (error) {
      console.error('Error fetching approvals:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleApprove = async (itemId: string, comment: string) => {
    try {
      setSubmitting({ ...submitting, [itemId]: true })
      const response = await fetch(`/api/campaigns/${campaignId}/approvals`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          itemId,
          action: 'approved',
          comment,
        }),
      })

      if (!response.ok) throw new Error('Failed to approve')
      await fetchApprovals()
      setCommentText({ ...commentText, [itemId]: '' })
      setExpandedId(null)
    } catch (error) {
      console.error('Error approving:', error)
    } finally {
      setSubmitting({ ...submitting, [itemId]: false })
    }
  }

  const handleReject = async (itemId: string, comment: string) => {
    try {
      setSubmitting({ ...submitting, [itemId]: true })
      const response = await fetch(`/api/campaigns/${campaignId}/approvals`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          itemId,
          action: 'rejected',
          comment,
        }),
      })

      if (!response.ok) throw new Error('Failed to reject')
      await fetchApprovals()
      setCommentText({ ...commentText, [itemId]: '' })
      setExpandedId(null)
    } catch (error) {
      console.error('Error rejecting:', error)
    } finally {
      setSubmitting({ ...submitting, [itemId]: false })
    }
  }

  const filteredApprovals = selectedStage
    ? approvals.filter((item) => item.currentStage === selectedStage)
    : approvals

  const pendingCount = approvals.filter((item) => item.status === 'pending')
    .length

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <Clock className="w-8 h-8 text-blue-600 mx-auto mb-2 animate-spin" />
          <p className="text-gray-600">Loading approval workflow...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6 p-6 bg-white rounded-lg border border-gray-200">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">
            Campaign Approval Workflow
          </h2>
          <p className="text-sm text-gray-600 mt-1">
            Manage content approvals before publishing
          </p>
        </div>
        {pendingCount > 0 && (
          <div className="bg-amber-100 text-amber-800 px-4 py-2 rounded-full flex items-center gap-2">
            <AlertCircle className="w-5 h-5" />
            <span className="font-semibold">{pendingCount} Pending</span>
          </div>
        )}
      </div>

      {/* Workflow Progress Bar */}
      <div className="bg-gray-50 p-6 rounded-lg">
        <h3 className="text-sm font-semibold text-gray-900 mb-4">
          Workflow Stages
        </h3>
        <div className="flex items-center gap-2">
          {WORKFLOW_STAGES.map((stage, index) => (
            <React.Fragment key={stage}>
              <button
                onClick={() =>
                  setSelectedStage(selectedStage === stage ? null : stage)
                }
                className={cn(
                  'flex items-center gap-2 px-4 py-2 rounded-lg transition-all',
                  selectedStage === stage
                    ? 'ring-2 ring-violet-500 ' + getStageColor(stage)
                    : getStageColor(stage) + ' opacity-60 hover:opacity-80'
                )}
              >
                <div
                  className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                    index <= getStageIndex(selectedStage || 'Draft')
                      ? 'bg-violet-600 text-white'
                      : 'bg-gray-400 text-white'
                  }`}
                >
                  {index + 1}
                </div>
                <span className="text-sm font-medium text-gray-900">
                  {stage}
                </span>
              </button>
              {index < WORKFLOW_STAGES.length - 1 && (
                <ChevronRight className="w-5 h-5 text-gray-400" />
              )}
            </React.Fragment>
          ))}
        </div>
      </div>

      {/* Filter Bar */}
      <div className="flex items-center gap-2">
        <Filter className="w-5 h-5 text-gray-600" />
        <span className="text-sm font-medium text-gray-600">
          Showing {filteredApprovals.length} item
          {filteredApprovals.length !== 1 ? 's' : ''}
        </span>
        {selectedStage && (
          <button
            onClick={() => setSelectedStage(null)}
            className="text-sm text-violet-600 hover:text-violet-700 ml-auto"
          >
            Clear filter
          </button>
        )}
      </div>

      {/* Approval Items List */}
      {filteredApprovals.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <CheckCircle2 className="w-12 h-12 text-green-600 mx-auto mb-3" />
          <p className="text-gray-900 font-medium">All items approved!</p>
          <p className="text-gray-600 text-sm mt-1">
            {selectedStage
              ? 'No items in the selected stage'
              : 'No approval items to review'}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredApprovals.map((item) => (
            <div
              key={item.id}
              className="border border-gray-200 rounded-lg overflow-hidden hover:border-gray-300 transition-colors"
            >
              {/* Item Header */}
              <button
                onClick={() =>
                  setExpandedId(
                    expandedId === item.id ? null : item.id
                  )
                }
                className="w-full p-4 text-left bg-white hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-2">
                      {getStatusIcon(item.status)}
                      <h4 className="font-semibold text-gray-900 truncate">
                        {item.title}
                      </h4>
                      <span
                        className={cn(
                          'px-2 py-1 rounded text-xs font-medium whitespace-nowrap',
                          getStageColor(item.currentStage)
                        )}
                      >
                        {item.currentStage}
                      </span>
                    </div>

                    <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                      <div className="flex items-center gap-1">
                        <User className="w-4 h-4" />
                        <span>{item.submitterName}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        <span title={formatDate(item.submittedAt)}>
                          {formatRelativeTime(item.submittedAt)}
                        </span>
                      </div>
                      {item.status === 'rejected' && item.rejectionReason && (
                        <div className="text-red-600">
                          Reason: {item.rejectionReason.substring(0, 30)}...
                        </div>
                      )}
                    </div>
                  </div>

                  <ChevronRight
                    className={cn(
                      'w-5 h-5 text-gray-400 transition-transform',
                      expandedId === item.id && 'rotate-90'
                    )}
                  />
                </div>
              </button>

              {/* Expanded Content */}
              {expandedId === item.id && (
                <div className="border-t border-gray-200 bg-gray-50 p-4 space-y-4">
                  {/* Assigned Reviewer */}
                  {item.assignedReviewerId && (
                    <div className="bg-white p-3 rounded border border-gray-200">
                      <p className="text-xs font-medium text-gray-600 mb-1">
                        Assigned Reviewer
                      </p>
                      <p className="text-sm text-gray-900">
                        {item.assignedReviewerName}
                      </p>
                    </div>
                  )}

                  {/* Approval History */}
                  {item.approvalHistory.length > 0 && (
                    <div className="bg-white p-3 rounded border border-gray-200 space-y-3">
                      <p className="text-xs font-medium text-gray-600">
                        Approval History
                      </p>
                      {item.approvalHistory.map((entry) => (
                        <div key={entry.id} className="text-sm border-l-2 border-gray-300 pl-3">
                          <div className="flex items-center gap-2 mb-1">
                            {entry.action === 'approved' ? (
                              <CheckCircle2 className="w-4 h-4 text-green-600" />
                            ) : (
                              <XCircle className="w-4 h-4 text-red-600" />
                            )}
                            <span className="font-medium">
                              {entry.reviewerName}
                            </span>
                            <span className="text-xs text-gray-600">
                              {formatRelativeTime(entry.timestamp)}
                            </span>
                          </div>
                          {entry.comment && (
                            <p className="text-gray-700 italic">
                              "{entry.comment}"
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Action Buttons (only if pending) */}
                  {item.status === 'pending' && (
                    <div className="bg-white p-4 rounded border border-gray-200 space-y-3">
                      <label className="block">
                        <span className="text-xs font-medium text-gray-600 mb-2 block">
                          Add Comment
                        </span>
                        <textarea
                          value={commentText[item.id] || ''}
                          onChange={(e) =>
                            setCommentText({
                              ...commentText,
                              [item.id]: e.target.value,
                            })
                          }
                          placeholder="Add comments for approval or rejection..."
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
                          rows={3}
                        />
                      </label>

                      <div className="flex gap-3">
                        <Button
                          variant="primary"
                          size="sm"
                          loading={submitting[item.id]}
                          onClick={() =>
                            handleApprove(item.id, commentText[item.id] || '')
                          }
                          className="flex-1 flex items-center justify-center gap-2"
                        >
                          <CheckCircle2 className="w-4 h-4" />
                          Approve
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          loading={submitting[item.id]}
                          onClick={() =>
                            handleReject(item.id, commentText[item.id] || '')
                          }
                          className="flex-1 flex items-center justify-center gap-2"
                        >
                          <XCircle className="w-4 h-4" />
                          Reject
                        </Button>
                      </div>
                    </div>
                  )}

                  {/* Status Badge for Completed Items */}
                  {item.status !== 'pending' && (
                    <div
                      className={cn(
                        'px-4 py-3 rounded-lg text-sm font-medium',
                        item.status === 'approved'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                      )}
                    >
                      {item.status === 'approved'
                        ? '✓ Approved'
                        : '✗ Rejected'}
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Stats Footer */}
      {approvals.length > 0 && (
        <div className="flex gap-6 p-4 bg-gray-50 rounded-lg">
          <div>
            <p className="text-xs text-gray-600 font-medium">Total Items</p>
            <p className="text-2xl font-bold text-gray-900">{approvals.length}</p>
          </div>
          <div>
            <p className="text-xs text-gray-600 font-medium">Pending</p>
            <p className="text-2xl font-bold text-amber-600">{pendingCount}</p>
          </div>
          <div>
            <p className="text-xs text-gray-600 font-medium">Approved</p>
            <p className="text-2xl font-bold text-green-600">
              {approvals.filter((a) => a.status === 'approved').length}
            </p>
          </div>
          <div>
            <p className="text-xs text-gray-600 font-medium">Rejected</p>
            <p className="text-2xl font-bold text-red-600">
              {approvals.filter((a) => a.status === 'rejected').length}
            </p>
          </div>
        </div>
      )}
    </div>
  )
}

export default ApprovalWorkflow
