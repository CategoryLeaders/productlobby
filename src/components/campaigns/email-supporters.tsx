'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { Mail, Send, Eye, Loader2, Clock } from 'lucide-react'
import { formatRelativeTime, cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'

interface EmailBlast {
  id: string
  subject: string
  body: string
  recipientCount: number
  createdAt: string
}

interface EmailSupportersProps {
  campaignId: string
}

export function EmailSupporters({ campaignId }: EmailSupportersProps) {
  const [subject, setSubject] = useState('')
  const [body, setBody] = useState('')
  const [showPreview, setShowPreview] = useState(false)
  const [loading, setLoading] = useState(false)
  const [blasts, setBlasts] = useState<EmailBlast[]>([])
  const [blastLoading, setBlastLoading] = useState(true)
  const [error, setError] = useState('')
  const [successMessage, setSuccessMessage] = useState('')

  // Fetch past email blasts
  const fetchBlasts = useCallback(async () => {
    try {
      setBlastLoading(true)
      const response = await fetch(`/api/campaigns/${campaignId}/email-blast`)
      if (!response.ok) throw new Error('Failed to fetch email blasts')
      const data = await response.json()
      setBlasts(data.blasts || [])
    } catch (err) {
      console.error('Error fetching blasts:', err)
      setError('Failed to load email blast history')
    } finally {
      setBlastLoading(false)
    }
  }, [campaignId])

  useEffect(() => {
    fetchBlasts()
  }, [fetchBlasts])

  const handleSend = async () => {
    setError('')
    setSuccessMessage('')

    if (!subject.trim()) {
      setError('Subject line is required')
      return
    }

    if (!body.trim()) {
      setError('Message body is required')
      return
    }

    try {
      setLoading(true)
      const response = await fetch(`/api/campaigns/${campaignId}/email-blast`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ subject, body }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to send email blast')
      }

      const data = await response.json()
      setSuccessMessage(`Email sent to ${data.recipientCount} supporters`)
      setSubject('')
      setBody('')
      setShowPreview(false)
      await fetchBlasts()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-8">
      {/* Form Section */}
      <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
        <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Mail className="w-5 h-5" />
          Send Email Blast
        </h2>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Subject Line
            </label>
            <Input
              type="text"
              placeholder="e.g., New Feature Release: Dark Mode is Here!"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              disabled={loading}
              className="w-full"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Message Body
            </label>
            <Textarea
              placeholder="Write your message to supporters... (Rich text preview available)"
              value={body}
              onChange={(e) => setBody(e.target.value)}
              disabled={loading}
              className="w-full min-h-[200px] resize-none"
            />
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md text-sm">
              {error}
            </div>
          )}

          {successMessage && (
            <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-md text-sm">
              {successMessage}
            </div>
          )}

          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => setShowPreview(!showPreview)}
              className="flex items-center gap-2"
              disabled={loading || (!subject.trim() && !body.trim())}
            >
              <Eye className="w-4 h-4" />
              {showPreview ? 'Hide Preview' : 'Preview'}
            </Button>
            <Button
              onClick={handleSend}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white"
              disabled={loading || !subject.trim() || !body.trim()}
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
              Send to All Supporters
            </Button>
          </div>
        </div>
      </div>

      {/* Email Preview Section */}
      {showPreview && (subject.trim() || body.trim()) && (
        <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
          <h3 className="text-sm font-semibold text-gray-700 mb-4">Email Preview</h3>
          <div className="bg-gray-50 border border-gray-200 rounded-lg overflow-hidden">
            {/* Mock Email Header */}
            <div className="bg-gray-100 px-6 py-4 border-b border-gray-200">
              <div className="text-sm text-gray-600 mb-2">From: ProductLobby Team</div>
              <div className="text-sm text-gray-600">Subject: {subject || '(no subject)'}</div>
            </div>

            {/* Mock Email Content */}
            <div className="px-6 py-6 bg-white">
              <div className="text-gray-800 whitespace-pre-wrap text-sm leading-relaxed">
                {body || '(message body will appear here)'}
              </div>
              <div className="mt-6 pt-4 border-t border-gray-200 text-xs text-gray-500">
                <p>This is a preview of your email. Actual styling may vary based on the recipient's email client.</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Email Blast History Section */}
      <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Clock className="w-5 h-5" />
          Email Blast History
        </h3>

        {blastLoading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="w-5 h-5 animate-spin text-gray-400" />
          </div>
        ) : blasts.length === 0 ? (
          <p className="text-gray-500 text-sm text-center py-6">
            No email blasts sent yet. Send your first campaign email above.
          </p>
        ) : (
          <div className="space-y-3">
            {blasts.map((blast) => (
              <div
                key={blast.id}
                className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <div className="flex-1 min-w-0">
                  <h4 className="font-medium text-gray-900 truncate">{blast.subject}</h4>
                  <p className="text-sm text-gray-600 mt-1">
                    {blast.recipientCount} supporter{blast.recipientCount !== 1 ? 's' : ''} •{' '}
                    {formatRelativeTime(blast.createdAt)}
                  </p>
                </div>
                <div className="ml-4 text-xs font-semibold text-gray-500 bg-gray-100 px-3 py-1 rounded-full whitespace-nowrap">
                  Sent
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
