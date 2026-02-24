'use client'

import React, { useState, useEffect, useCallback } from 'react'
import {
  Loader2,
  Mail,
  Send,
  Users,
  Clock,
  CheckCircle,
  AlertCircle,
  Edit3,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'

// ============================================================================
// TYPES
// ============================================================================

interface EmailTemplate {
  id: string
  name: string
  subject: string
  body: string
  recipientCount: number
  sentCount: number
  openRate: number
  clickRate: number
  status: 'draft' | 'scheduled' | 'sent' | 'failed'
}

interface EmailOutreachProps {
  campaignId: string
}

interface EmailOutreachState {
  templates: EmailTemplate[]
  loading: boolean
  error: string | null
  selectedTemplate: EmailTemplate | null
  showCompose: boolean
  newSubject: string
  newBody: string
  isSending: boolean
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

const getStatusColor = (status: string) => {
  switch (status) {
    case 'draft':
      return 'bg-gray-100 text-gray-800'
    case 'scheduled':
      return 'bg-blue-100 text-blue-800'
    case 'sent':
      return 'bg-emerald-100 text-emerald-800'
    case 'failed':
      return 'bg-red-100 text-red-800'
    default:
      return 'bg-gray-100 text-gray-800'
  }
}

const getStatusIcon = (status: string) => {
  switch (status) {
    case 'draft':
      return Edit3
    case 'scheduled':
      return Clock
    case 'sent':
      return CheckCircle
    case 'failed':
      return AlertCircle
    default:
      return Mail
  }
}

// ============================================================================
// COMPONENT
// ============================================================================

export function EmailOutreach({ campaignId }: EmailOutreachProps) {
  const [state, setState] = useState<EmailOutreachState>({
    templates: [],
    loading: true,
    error: null,
    selectedTemplate: null,
    showCompose: false,
    newSubject: '',
    newBody: '',
    isSending: false,
  })

  // Fetch email templates
  const fetchTemplates = useCallback(async () => {
    try {
      setState((prev) => ({ ...prev, loading: true, error: null }))
      const response = await fetch(
        `/api/campaigns/${campaignId}/email-outreach`
      )
      if (!response.ok) {
        throw new Error('Failed to fetch email templates')
      }
      const data = await response.json()
      setState((prev) => ({
        ...prev,
        templates: data.templates || [],
        loading: false,
      }))
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Failed to load email templates'
      setState((prev) => ({
        ...prev,
        error: errorMessage,
        loading: false,
      }))
    }
  }, [campaignId])

  useEffect(() => {
    fetchTemplates()
  }, [fetchTemplates])

  // Handle sending new email
  const handleSendEmail = async () => {
    if (!state.newSubject.trim() || !state.newBody.trim()) {
      setState((prev) => ({
        ...prev,
        error: 'Please fill in both subject and body',
      }))
      return
    }

    try {
      setState((prev) => ({ ...prev, isSending: true, error: null }))
      const response = await fetch(
        `/api/campaigns/${campaignId}/email-outreach`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            subject: state.newSubject,
            body: state.newBody,
          }),
        }
      )

      if (!response.ok) {
        throw new Error('Failed to send email')
      }

      setState((prev) => ({
        ...prev,
        newSubject: '',
        newBody: '',
        showCompose: false,
        isSending: false,
      }))

      // Refresh templates
      fetchTemplates()
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Failed to send email'
      setState((prev) => ({
        ...prev,
        error: errorMessage,
        isSending: false,
      }))
    }
  }

  const avgOpenRate =
    state.templates.length > 0
      ? Math.round(
          state.templates.reduce((sum, t) => sum + t.openRate, 0) /
            state.templates.length
        )
      : 0

  const avgClickRate =
    state.templates.length > 0
      ? Math.round(
          state.templates.reduce((sum, t) => sum + t.clickRate, 0) /
            state.templates.length
        )
      : 0

  const totalSent = state.templates.reduce((sum, t) => sum + t.sentCount, 0)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="rounded-lg bg-violet-100 p-2">
            <Mail className="h-6 w-6 text-violet-600" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Email Outreach</h2>
            <p className="text-sm text-gray-500">
              Create and manage email campaigns for your supporters
            </p>
          </div>
        </div>
        <Button
          onClick={() =>
            setState((prev) => ({ ...prev, showCompose: !prev.showCompose }))
          }
          className="bg-violet-600 hover:bg-violet-700"
        >
          <Send className="mr-2 h-4 w-4" />
          New Email
        </Button>
      </div>

      {/* Error message */}
      {state.error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4">
          <div className="flex gap-3">
            <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-red-800">{state.error}</p>
          </div>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="rounded-lg border border-gray-200 bg-white p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Sent</p>
              <p className="text-2xl font-bold text-gray-900">{totalSent}</p>
            </div>
            <div className="rounded-lg bg-violet-100 p-3">
              <Send className="h-5 w-5 text-violet-600" />
            </div>
          </div>
        </div>

        <div className="rounded-lg border border-gray-200 bg-white p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Avg Open Rate</p>
              <p className="text-2xl font-bold text-gray-900">{avgOpenRate}%</p>
            </div>
            <div className="rounded-lg bg-lime-100 p-3">
              <Mail className="h-5 w-5 text-lime-600" />
            </div>
          </div>
        </div>

        <div className="rounded-lg border border-gray-200 bg-white p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Avg Click Rate</p>
              <p className="text-2xl font-bold text-gray-900">{avgClickRate}%</p>
            </div>
            <div className="rounded-lg bg-lime-100 p-3">
              <Users className="h-5 w-5 text-lime-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Compose Form */}
      {state.showCompose && (
        <div className="rounded-lg border border-gray-200 bg-white p-6">
          <h3 className="mb-4 text-lg font-semibold text-gray-900">
            Compose New Email
          </h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Subject
              </label>
              <input
                type="text"
                value={state.newSubject}
                onChange={(e) =>
                  setState((prev) => ({
                    ...prev,
                    newSubject: e.target.value,
                  }))
                }
                placeholder="Email subject line"
                className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm placeholder-gray-400 focus:border-violet-500 focus:outline-none focus:ring-1 focus:ring-violet-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Body
              </label>
              <textarea
                value={state.newBody}
                onChange={(e) =>
                  setState((prev) => ({
                    ...prev,
                    newBody: e.target.value,
                  }))
                }
                placeholder="Email message body"
                rows={6}
                className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm placeholder-gray-400 focus:border-violet-500 focus:outline-none focus:ring-1 focus:ring-violet-500"
              />
            </div>

            <div className="flex gap-3">
              <Button
                onClick={handleSendEmail}
                disabled={state.isSending}
                className="bg-violet-600 hover:bg-violet-700"
              >
                {state.isSending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Sending...
                  </>
                ) : (
                  <>
                    <Send className="mr-2 h-4 w-4" />
                    Send Email
                  </>
                )}
              </Button>
              <Button
                onClick={() =>
                  setState((prev) => ({
                    ...prev,
                    showCompose: false,
                    newSubject: '',
                    newBody: '',
                  }))
                }
                variant="outline"
              >
                Cancel
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Templates List */}
      <div className="space-y-3">
        <h3 className="text-lg font-semibold text-gray-900">Email Templates</h3>

        {state.loading ? (
          <div className="flex items-center justify-center rounded-lg border border-gray-200 bg-white py-8">
            <Loader2 className="h-6 w-6 animate-spin text-violet-600" />
          </div>
        ) : state.templates.length === 0 ? (
          <div className="rounded-lg border border-gray-200 bg-white p-6 text-center">
            <Mail className="mx-auto h-12 w-12 text-gray-300 mb-3" />
            <p className="text-gray-600">No email templates yet</p>
            <p className="text-sm text-gray-500">
              Create your first email campaign to get started
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {state.templates.map((template) => {
              const StatusIcon = getStatusIcon(template.status)
              return (
                <div
                  key={template.id}
                  className="rounded-lg border border-gray-200 bg-white p-4 hover:border-gray-300 transition"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="text-sm font-semibold text-gray-900 truncate">
                          {template.name}
                        </h4>
                        <span
                          className={cn(
                            'inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-medium whitespace-nowrap',
                            getStatusColor(template.status)
                          )}
                        >
                          <StatusIcon className="h-3 w-3" />
                          {template.status}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 truncate">
                        {template.subject}
                      </p>
                    </div>
                  </div>

                  {/* Metrics */}
                  <div className="mt-3 flex flex-wrap gap-4 text-xs">
                    <div className="flex items-center gap-1 text-gray-600">
                      <Users className="h-4 w-4" />
                      <span>
                        {template.sentCount}/{template.recipientCount} sent
                      </span>
                    </div>
                    <div className="flex items-center gap-1 text-gray-600">
                      <Mail className="h-4 w-4" />
                      <span>{template.openRate}% open rate</span>
                    </div>
                    <div className="flex items-center gap-1 text-gray-600">
                      <CheckCircle className="h-4 w-4" />
                      <span>{template.clickRate}% click rate</span>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
