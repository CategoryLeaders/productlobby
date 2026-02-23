'use client'

import React, { useState, useEffect } from 'react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useToast } from '@/components/ui/toast'
import {
  Webhook,
  Plus,
  Trash2,
  PlayCircle,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Copy,
  MoreVertical,
} from 'lucide-react'

interface Webhook {
  id: string
  url: string
  events: string[]
  active: boolean
  lastTriggered?: string | null
  createdAt: string
}

interface WebhookManagerProps {
  campaignId: string
  currentUserId: string | null
  isCreator?: boolean
}

const EVENT_TYPES = [
  { id: 'lobby', label: 'Lobby Event', description: 'When campaign is added to lobby' },
  { id: 'comment', label: 'Comment', description: 'When a comment is posted' },
  { id: 'share', label: 'Social Share', description: 'When campaign is shared' },
  { id: 'milestone', label: 'Milestone', description: 'When milestone is reached' },
]

export function WebhookManager({
  campaignId,
  currentUserId,
  isCreator = false,
}: WebhookManagerProps) {
  const { toast } = useToast()
  const [webhooks, setWebhooks] = useState<Webhook[]>([])
  const [loading, setLoading] = useState(false)
  const [adding, setAdding] = useState(false)
  const [testingId, setTestingId] = useState<string | null>(null)
  const [newWebhook, setNewWebhook] = useState({
    url: '',
    events: [] as string[],
  })

  // Load webhooks
  useEffect(() => {
    fetchWebhooks()
  }, [campaignId])

  const fetchWebhooks = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/campaigns/${campaignId}/webhooks`)
      if (!response.ok) throw new Error('Failed to fetch webhooks')
      const data = await response.json()
      setWebhooks(data.webhooks || [])
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to load webhooks',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  const handleAddWebhook = async () => {
    if (!newWebhook.url.trim()) {
      toast({
        title: 'Error',
        description: 'Please enter a webhook URL',
        variant: 'destructive',
      })
      return
    }

    if (newWebhook.events.length === 0) {
      toast({
        title: 'Error',
        description: 'Please select at least one event',
        variant: 'destructive',
      })
      return
    }

    try {
      setAdding(true)
      const response = await fetch(`/api/campaigns/${campaignId}/webhooks`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newWebhook),
      })

      if (!response.ok) throw new Error('Failed to add webhook')

      toast({
        title: 'Success',
        description: 'Webhook added successfully',
      })

      setNewWebhook({ url: '', events: [] })
      await fetchWebhooks()
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to add webhook',
        variant: 'destructive',
      })
    } finally {
      setAdding(false)
    }
  }

  const handleTestWebhook = async (webhookId: string) => {
    try {
      setTestingId(webhookId)
      const response = await fetch(`/api/campaigns/${campaignId}/webhooks/${webhookId}/test`, {
        method: 'POST',
      })

      if (!response.ok) throw new Error('Test failed')

      toast({
        title: 'Success',
        description: 'Webhook test successful',
      })
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Webhook test failed',
        variant: 'destructive',
      })
    } finally {
      setTestingId(null)
    }
  }

  const handleDeleteWebhook = async (webhookId: string) => {
    if (!confirm('Are you sure you want to delete this webhook?')) return

    try {
      const response = await fetch(`/api/campaigns/${campaignId}/webhooks/${webhookId}`, {
        method: 'DELETE',
      })

      if (!response.ok) throw new Error('Failed to delete webhook')

      toast({
        title: 'Success',
        description: 'Webhook deleted',
      })

      await fetchWebhooks()
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to delete webhook',
        variant: 'destructive',
      })
    }
  }

  const toggleEventSelection = (eventId: string) => {
    setNewWebhook(prev => ({
      ...prev,
      events: prev.events.includes(eventId)
        ? prev.events.filter(e => e !== eventId)
        : [...prev.events, eventId],
    }))
  }

  if (!isCreator) {
    return (
      <div className="flex items-center justify-center p-8 text-center">
        <div>
          <AlertCircle className="mx-auto h-12 w-12 text-muted-foreground" />
          <p className="mt-2 text-sm text-muted-foreground">
            Only campaign creators can manage webhooks
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Add Webhook Form */}
      <div className="rounded-lg border border-border bg-card p-6">
        <h3 className="flex items-center gap-2 text-lg font-semibold mb-4">
          <Plus className="h-5 w-5" />
          Add New Webhook
        </h3>

        <div className="space-y-4">
          {/* URL Input */}
          <div>
            <label className="block text-sm font-medium mb-2">Webhook URL</label>
            <Input
              type="url"
              placeholder="https://example.com/webhook"
              value={newWebhook.url}
              onChange={e => setNewWebhook(prev => ({ ...prev, url: e.target.value }))}
              className="w-full"
            />
          </div>

          {/* Event Selection */}
          <div>
            <label className="block text-sm font-medium mb-3">Events to Monitor</label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {EVENT_TYPES.map(event => (
                <label
                  key={event.id}
                  className="flex items-start gap-3 p-3 rounded-lg border border-border hover:bg-accent cursor-pointer transition"
                >
                  <input
                    type="checkbox"
                    checked={newWebhook.events.includes(event.id)}
                    onChange={() => toggleEventSelection(event.id)}
                    className="mt-1"
                  />
                  <div className="flex-1">
                    <div className="font-medium text-sm">{event.label}</div>
                    <div className="text-xs text-muted-foreground">{event.description}</div>
                  </div>
                </label>
              ))}
            </div>
          </div>

          <Button
            onClick={handleAddWebhook}
            disabled={adding}
            className="w-full"
          >
            {adding ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Adding...
              </>
            ) : (
              <>
                <Plus className="mr-2 h-4 w-4" />
                Add Webhook
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Webhooks List */}
      <div className="space-y-3">
        <h3 className="flex items-center gap-2 text-lg font-semibold">
          <Webhook className="h-5 w-5" />
          Configured Webhooks ({webhooks.length})
        </h3>

        {loading ? (
          <div className="flex justify-center p-8">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : webhooks.length === 0 ? (
          <div className="rounded-lg border border-border bg-muted/50 p-8 text-center">
            <Webhook className="mx-auto h-12 w-12 text-muted-foreground mb-2" />
            <p className="text-sm text-muted-foreground">No webhooks configured yet</p>
          </div>
        ) : (
          webhooks.map(webhook => (
            <div
              key={webhook.id}
              className="rounded-lg border border-border bg-card p-4 hover:border-primary/50 transition"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  {/* URL and Status */}
                  <div className="flex items-center gap-2 mb-2">
                    <code className="flex-1 text-sm bg-muted p-2 rounded overflow-x-auto break-all">
                      {webhook.url}
                    </code>
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(webhook.url)
                        toast({
                          title: 'Copied',
                          description: 'URL copied to clipboard',
                        })
                      }}
                      className="p-2 hover:bg-muted rounded transition"
                    >
                      <Copy className="h-4 w-4" />
                    </button>
                  </div>

                  {/* Status */}
                  <div className="flex items-center gap-2 text-sm mb-2">
                    {webhook.active ? (
                      <>
                        <CheckCircle2 className="h-4 w-4 text-green-600" />
                        <span className="text-green-600">Active</span>
                      </>
                    ) : (
                      <>
                        <AlertCircle className="h-4 w-4 text-yellow-600" />
                        <span className="text-yellow-600">Inactive</span>
                      </>
                    )}
                  </div>

                  {/* Events */}
                  <div className="flex flex-wrap gap-2">
                    {webhook.events.map(event => (
                      <span key={event} className="px-2 py-1 text-xs rounded-full bg-primary/10 text-primary">
                        {EVENT_TYPES.find(e => e.id === event)?.label || event}
                      </span>
                    ))}
                  </div>

                  {/* Last Triggered */}
                  {webhook.lastTriggered && (
                    <p className="text-xs text-muted-foreground mt-2">
                      Last triggered: {new Date(webhook.lastTriggered).toLocaleString()}
                    </p>
                  )}
                </div>

                {/* Actions */}
                <div className="flex gap-2 shrink-0">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleTestWebhook(webhook.id)}
                    disabled={testingId === webhook.id}
                    title="Test this webhook"
                  >
                    {testingId === webhook.id ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <PlayCircle className="h-4 w-4" />
                    )}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDeleteWebhook(webhook.id)}
                    className="text-destructive hover:text-destructive"
                    title="Delete this webhook"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
