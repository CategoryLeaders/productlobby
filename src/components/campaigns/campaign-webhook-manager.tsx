'use client'

import React, { useEffect, useState } from 'react'
import {
  Webhook,
  Plus,
  Trash2,
  Toggle2,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Copy,
  ExternalLink,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useToast } from '@/components/ui/toast'
import { cn } from '@/lib/utils'

interface WebhookItem {
  id: string
  url: string
  events: string[]
  status: 'active' | 'paused' | 'failed'
  lastTriggered?: string
  successRate: number
  failureCount: number
}

interface CampaignWebhookManagerProps {
  campaignId: string
}

const EVENT_OPTIONS = [
  { id: 'campaigns.created', label: 'Campaign Created' },
  { id: 'campaigns.updated', label: 'Campaign Updated' },
  { id: 'campaigns.deleted', label: 'Campaign Deleted' },
  { id: 'lobbies.submitted', label: 'Lobby Submitted' },
  { id: 'comments.posted', label: 'Comment Posted' },
  { id: 'updates.published', label: 'Update Published' },
  { id: 'milestones.reached', label: 'Milestone Reached' },
  { id: 'webhooks.test', label: 'Webhook Test' },
]

export const CampaignWebhookManager: React.FC<CampaignWebhookManagerProps> = ({
  campaignId,
}) => {
  const { toast } = useToast()
  const [webhooks, setWebhooks] = useState<WebhookItem[]>([])
  const [loading, setLoading] = useState(true)
  const [creating, setCreating] = useState(false)
  const [showAddForm, setShowAddForm] = useState(false)
  const [newUrl, setNewUrl] = useState('')
  const [selectedEvents, setSelectedEvents] = useState<string[]>([])
  const [togglingId, setTogglingId] = useState<string | null>(null)

  useEffect(() => {
    fetchWebhooks()
  }, [campaignId])

  const fetchWebhooks = async () => {
    try {
      setLoading(true)
      const response = await fetch(
        `/api/campaigns/${campaignId}/campaign-webhooks`
      )
      if (!response.ok) throw new Error('Failed to fetch webhooks')
      const data = await response.json()
      setWebhooks(data)
    } catch (err) {
      toast({
        title: 'Error',
        description: err instanceof Error ? err.message : 'Failed to fetch webhooks',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  const handleCreateWebhook = async () => {
    if (!newUrl.trim()) {
      toast({
        title: 'Error',
        description: 'Please enter a webhook URL',
        variant: 'destructive',
      })
      return
    }

    if (selectedEvents.length === 0) {
      toast({
        title: 'Error',
        description: 'Please select at least one event',
        variant: 'destructive',
      })
      return
    }

    try {
      setCreating(true)
      const response = await fetch(
        `/api/campaigns/${campaignId}/campaign-webhooks`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ url: newUrl, events: selectedEvents }),
        }
      )

      if (!response.ok) throw new Error('Failed to create webhook')

      toast({
        title: 'Success',
        description: 'Webhook created successfully',
      })

      setNewUrl('')
      setSelectedEvents([])
      setShowAddForm(false)
      await fetchWebhooks()
    } catch (err) {
      toast({
        title: 'Error',
        description: err instanceof Error ? err.message : 'Failed to create webhook',
        variant: 'destructive',
      })
    } finally {
      setCreating(false)
    }
  }

  const handleToggleStatus = async (webhookId: string, currentStatus: string) => {
    try {
      setTogglingId(webhookId)
      const newStatus =
        currentStatus === 'active' ? 'paused' : 'active'

      const response = await fetch(
        `/api/campaigns/${campaignId}/campaign-webhooks`,
        {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ webhookId, status: newStatus }),
        }
      )

      if (!response.ok) throw new Error('Failed to update webhook')

      await fetchWebhooks()
      toast({
        title: 'Success',
        description: `Webhook ${newStatus}`,
      })
    } catch (err) {
      toast({
        title: 'Error',
        description: err instanceof Error ? err.message : 'Failed to update webhook',
        variant: 'destructive',
      })
    } finally {
      setTogglingId(null)
    }
  }

  const handleDeleteWebhook = async (webhookId: string) => {
    if (!confirm('Are you sure you want to delete this webhook?')) return

    try {
      const response = await fetch(
        `/api/campaigns/${campaignId}/campaign-webhooks/${webhookId}`,
        { method: 'DELETE' }
      )

      if (!response.ok) throw new Error('Failed to delete webhook')

      toast({
        title: 'Success',
        description: 'Webhook deleted',
      })
      await fetchWebhooks()
    } catch (err) {
      toast({
        title: 'Error',
        description: err instanceof Error ? err.message : 'Failed to delete webhook',
        variant: 'destructive',
      })
    }
  }

  const handleCopyUrl = (url: string) => {
    navigator.clipboard.writeText(url)
    toast({
      title: 'Copied',
      description: 'Webhook URL copied to clipboard',
    })
  }

  if (loading) {
    return (
      <div className="rounded-lg border border-violet-200 bg-white p-8 flex items-center justify-center">
        <Loader2 className="w-6 h-6 text-violet-600 animate-spin" />
        <span className="ml-3 text-slate-600">Loading webhooks...</span>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <Webhook className="w-6 h-6 text-violet-600" />
            Webhook Manager
          </h2>
          <p className="text-slate-600 mt-1">
            Manage webhooks to receive real-time updates about your campaign
          </p>
        </div>
        <Button
          onClick={() => setShowAddForm(!showAddForm)}
          className="bg-violet-600 hover:bg-violet-700"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Webhook
        </Button>
      </div>

      {/* Add Webhook Form */}
      {showAddForm && (
        <div className="rounded-lg border border-lime-200 bg-lime-50 p-6">
          <h3 className="font-semibold text-slate-900 mb-4">Create New Webhook</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Webhook URL
              </label>
              <Input
                type="url"
                placeholder="https://example.com/webhook"
                value={newUrl}
                onChange={(e) => setNewUrl(e.target.value)}
                className="bg-white"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-3">
                Subscribe to Events
              </label>
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                {EVENT_OPTIONS.map((event) => (
                  <label
                    key={event.id}
                    className="flex items-center gap-2 cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      checked={selectedEvents.includes(event.id)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedEvents([...selectedEvents, event.id])
                        } else {
                          setSelectedEvents(
                            selectedEvents.filter((id) => id !== event.id)
                          )
                        }
                      }}
                      className="w-4 h-4 rounded border-slate-300"
                    />
                    <span className="text-sm text-slate-700">{event.label}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="flex gap-2">
              <Button
                onClick={handleCreateWebhook}
                disabled={creating}
                className="bg-violet-600 hover:bg-violet-700"
              >
                {creating ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Creating...
                  </>
                ) : (
                  'Create Webhook'
                )}
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setShowAddForm(false)
                  setNewUrl('')
                  setSelectedEvents([])
                }}
              >
                Cancel
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Webhooks List */}
      {webhooks.length === 0 ? (
        <div className="rounded-lg border border-slate-200 bg-slate-50 p-8 text-center">
          <Webhook className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <p className="text-slate-600">No webhooks configured yet</p>
          <p className="text-sm text-slate-500 mt-1">
            Add a webhook to receive real-time updates
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {webhooks.map((webhook) => (
            <div
              key={webhook.id}
              className="rounded-lg border border-slate-200 bg-white p-4 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  {/* URL */}
                  <div className="flex items-center gap-2 mb-2">
                    <code className="text-sm font-mono text-slate-700 truncate">
                      {webhook.url}
                    </code>
                    <button
                      onClick={() => handleCopyUrl(webhook.url)}
                      className="p-1 hover:bg-slate-100 rounded"
                    >
                      <Copy className="w-4 h-4 text-slate-500" />
                    </button>
                  </div>

                  {/* Status and Info */}
                  <div className="flex items-center gap-3 flex-wrap mb-3">
                    <div
                      className={cn(
                        'flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full',
                        webhook.status === 'active'
                          ? 'bg-lime-100 text-lime-700'
                          : webhook.status === 'paused'
                          ? 'bg-amber-100 text-amber-700'
                          : 'bg-red-100 text-red-700'
                      )}
                    >
                      {webhook.status === 'active' && (
                        <CheckCircle2 className="w-3 h-3" />
                      )}
                      {webhook.status === 'paused' && (
                        <AlertCircle className="w-3 h-3" />
                      )}
                      {webhook.status === 'failed' && (
                        <AlertCircle className="w-3 h-3" />
                      )}
                      {webhook.status.charAt(0).toUpperCase() +
                        webhook.status.slice(1)}
                    </div>

                    {webhook.lastTriggered && (
                      <span className="text-xs text-slate-500">
                        Last triggered: {webhook.lastTriggered}
                      </span>
                    )}
                  </div>

                  {/* Events and Stats */}
                  <div className="space-y-2">
                    <div className="flex flex-wrap gap-1">
                      {webhook.events.map((event) => (
                        <span
                          key={event}
                          className="text-xs bg-violet-100 text-violet-700 px-2 py-1 rounded"
                        >
                          {event}
                        </span>
                      ))}
                    </div>

                    <div className="flex items-center gap-4 text-sm">
                      <span className="text-slate-600">
                        Success Rate: <span className="font-semibold text-lime-600">{webhook.successRate}%</span>
                      </span>
                      <span className="text-slate-600">
                        Failures: <span className="font-semibold text-amber-600">{webhook.failureCount}</span>
                      </span>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleToggleStatus(webhook.id, webhook.status)}
                    disabled={togglingId === webhook.id}
                    className="p-2 hover:bg-slate-100 rounded transition-colors"
                    title={webhook.status === 'active' ? 'Pause' : 'Resume'}
                  >
                    {togglingId === webhook.id ? (
                      <Loader2 className="w-4 h-4 text-slate-400 animate-spin" />
                    ) : (
                      <Toggle2 className="w-4 h-4 text-slate-500" />
                    )}
                  </button>
                  <button
                    onClick={() => handleDeleteWebhook(webhook.id)}
                    className="p-2 hover:bg-red-50 rounded transition-colors"
                    title="Delete"
                  >
                    <Trash2 className="w-4 h-4 text-red-500" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
