'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { MessageCircle, Send, Users, Eye, Loader2, Clock } from 'lucide-react'
import { formatRelativeTime, cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'

interface SupporterMessage {
  id: string
  subject: string
  body: string
  recipientGroup: 'all' | 'top' | 'recent'
  recipientCount: number
  createdAt: string
}

interface SupporterMessagingProps {
  campaignId: string
}

export function SupporterMessaging({ campaignId }: SupporterMessagingProps) {
  const [subject, setSubject] = useState('')
  const [body, setBody] = useState('')
  const [recipientGroup, setRecipientGroup] = useState<'all' | 'top' | 'recent'>('all')
  const [showPreview, setShowPreview] = useState(false)
  const [loading, setLoading] = useState(false)
  const [messages, setMessages] = useState<SupporterMessage[]>([])
  const [messagesLoading, setMessagesLoading] = useState(true)
  const [error, setError] = useState('')
  const [successMessage, setSuccessMessage] = useState('')

  // Fetch past messages
  const fetchMessages = useCallback(async () => {
    try {
      setMessagesLoading(true)
      const response = await fetch(`/api/campaigns/${campaignId}/messages`)
      if (!response.ok) throw new Error('Failed to fetch messages')
      const data = await response.json()
      setMessages(data.messages || [])
    } catch (err) {
      console.error('Error fetching messages:', err)
      setError('Failed to load message history')
    } finally {
      setMessagesLoading(false)
    }
  }, [campaignId])

  useEffect(() => {
    fetchMessages()
  }, [fetchMessages])

  const handleSend = async () => {
    setError('')
    setSuccessMessage('')

    if (!subject.trim()) {
      setError('Subject is required')
      return
    }

    if (!body.trim()) {
      setError('Message body is required')
      return
    }

    setLoading(true)

    try {
      const response = await fetch(`/api/campaigns/${campaignId}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subject: subject.trim(),
          body: body.trim(),
          recipientGroup,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to send message')
      }

      setSuccessMessage('Message sent successfully!')
      setSubject('')
      setBody('')
      setRecipientGroup('all')
      setShowPreview(false)

      // Refresh messages list
      await fetchMessages()

      // Clear success message after 3 seconds
      setTimeout(() => setSuccessMessage(''), 3000)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send message')
    } finally {
      setLoading(false)
    }
  }

  const bodyCharCount = body.length
  const maxChars = 5000

  const getRecipientLabel = (group: string) => {
    switch (group) {
      case 'all':
        return 'All Supporters'
      case 'top':
        return 'Top Supporters'
      case 'recent':
        return 'Recent Supporters'
      default:
        return group
    }
  }

  return (
    <div className="space-y-6">
      {/* Compose Section */}
      <div className="border rounded-lg p-6 bg-white shadow-sm">
        <div className="flex items-center gap-2 mb-4">
          <MessageCircle className="w-5 h-5 text-blue-600" />
          <h2 className="text-lg font-semibold">Send Message to Supporters</h2>
        </div>

        <div className="space-y-4">
          {/* Error Alert */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-md p-3 text-sm text-red-800">
              {error}
            </div>
          )}

          {/* Success Alert */}
          {successMessage && (
            <div className="bg-green-50 border border-green-200 rounded-md p-3 text-sm text-green-800">
              {successMessage}
            </div>
          )}

          {/* Subject Input */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Subject
            </label>
            <Input
              placeholder="e.g., Campaign Update"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              disabled={loading}
              maxLength={200}
            />
            <p className="text-xs text-gray-500 mt-1">
              {subject.length}/200 characters
            </p>
          </div>

          {/* Body Textarea */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Message
            </label>
            <Textarea
              placeholder="Write your message to supporters..."
              value={body}
              onChange={(e) => setBody(e.target.value)}
              disabled={loading}
              rows={6}
              maxLength={maxChars}
            />
            <p className="text-xs text-gray-500 mt-1">
              {bodyCharCount}/{maxChars} characters
            </p>
          </div>

          {/* Recipient Group Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <div className="flex items-center gap-2 mb-2">
                <Users className="w-4 h-4" />
                Send to
              </div>
            </label>
            <div className="grid grid-cols-3 gap-3">
              {(['all', 'top', 'recent'] as const).map((group) => (
                <button
                  key={group}
                  onClick={() => setRecipientGroup(group)}
                  disabled={loading}
                  className={cn(
                    'px-4 py-2 rounded-md text-sm font-medium transition-colors',
                    recipientGroup === group
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  )}
                >
                  {getRecipientLabel(group)}
                </button>
              ))}
            </div>
          </div>

          {/* Preview and Send Buttons */}
          <div className="flex gap-3 pt-4">
            <Button
              variant="outline"
              onClick={() => setShowPreview(!showPreview)}
              disabled={loading || !subject.trim() || !body.trim()}
              className="flex items-center gap-2"
            >
              <Eye className="w-4 h-4" />
              {showPreview ? 'Hide Preview' : 'Preview'}
            </Button>
            <Button
              onClick={handleSend}
              disabled={loading || !subject.trim() || !body.trim()}
              className="flex items-center gap-2 flex-1"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Sending...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  Send Message
                </>
              )}
            </Button>
          </div>
        </div>
      </div>

      {/* Preview Section */}
      {showPreview && (subject.trim() || body.trim()) && (
        <div className="border rounded-lg p-6 bg-blue-50 border-blue-200">
          <h3 className="font-semibold text-gray-900 mb-3">Message Preview</h3>
          <div className="bg-white rounded p-4 space-y-3">
            {subject.trim() && (
              <div>
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                  Subject
                </p>
                <p className="text-base font-semibold text-gray-900 mt-1">
                  {subject}
                </p>
              </div>
            )}
            {body.trim() && (
              <div>
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                  Message
                </p>
                <p className="text-sm text-gray-700 mt-1 whitespace-pre-wrap">
                  {body}
                </p>
              </div>
            )}
            {subject.trim() && body.trim() && (
              <div>
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                  Recipients
                </p>
                <p className="text-sm text-gray-700 mt-1">
                  {getRecipientLabel(recipientGroup)}
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Message History Section */}
      <div className="border rounded-lg p-6 bg-white shadow-sm">
        <div className="flex items-center gap-2 mb-4">
          <Clock className="w-5 h-5 text-gray-600" />
          <h2 className="text-lg font-semibold">Message History</h2>
        </div>

        {messagesLoading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="w-5 h-5 animate-spin text-gray-400" />
          </div>
        ) : messages.length === 0 ? (
          <p className="text-center text-gray-500 py-8">
            No messages sent yet. Send your first message to supporters!
          </p>
        ) : (
          <div className="space-y-3">
            {messages.map((message) => (
              <div
                key={message.id}
                className="border rounded-md p-4 hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-start justify-between gap-4 mb-2">
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-gray-900 truncate">
                      {message.subject}
                    </h3>
                    <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                      {message.body}
                    </p>
                  </div>
                  <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded whitespace-nowrap">
                    {getRecipientLabel(message.recipientGroup)}
                  </span>
                </div>
                <div className="flex items-center justify-between text-xs text-gray-500 mt-3 pt-3 border-t">
                  <span>{message.recipientCount} supporters</span>
                  <span>{formatRelativeTime(new Date(message.createdAt))}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
