'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { Mail, Send, UserPlus, Clock, Check, X, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { cn } from '@/lib/utils'

interface Invitation {
  id: string
  email: string
  status: 'pending' | 'accepted' | 'declined'
  createdAt: string
  respondedAt?: string
}

interface InvitationStats {
  pending: number
  accepted: number
  declined: number
  total: number
}

interface InvitationManagerProps {
  campaignId: string
}

const formatDate = (dateString: string): string => {
  const date = new Date(dateString)
  const now = new Date()
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000)

  if (seconds < 60) return 'just now'
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`
  if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`

  return date.toLocaleDateString()
}

const getStatusIcon = (status: string) => {
  switch (status) {
    case 'pending':
      return <Clock className="w-4 h-4 text-yellow-600" />
    case 'accepted':
      return <Check className="w-4 h-4 text-green-600" />
    case 'declined':
      return <X className="w-4 h-4 text-red-600" />
    default:
      return null
  }
}

const getStatusBadge = (status: string) => {
  switch (status) {
    case 'pending':
      return <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">Pending</Badge>
    case 'accepted':
      return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">Accepted</Badge>
    case 'declined':
      return <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">Declined</Badge>
    default:
      return null
  }
}

export function InvitationManager({ campaignId }: InvitationManagerProps) {
  const [emailInput, setEmailInput] = useState('')
  const [emails, setEmails] = useState<string[]>([])
  const [invitations, setInvitations] = useState<Invitation[]>([])
  const [stats, setStats] = useState<InvitationStats>({
    pending: 0,
    accepted: 0,
    declined: 0,
    total: 0,
  })
  const [loading, setLoading] = useState(false)
  const [invitationLoading, setInvitationLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const [error, setError] = useState('')
  const [successMessage, setSuccessMessage] = useState('')

  // Fetch existing invitations
  const fetchInvitations = useCallback(async () => {
    try {
      setInvitationLoading(true)
      const response = await fetch(`/api/campaigns/${campaignId}/invitations`)
      if (!response.ok) throw new Error('Failed to fetch invitations')
      const data = await response.json()
      
      if (data.invitations) {
        setInvitations(data.invitations)
        
        // Calculate stats
        const pendingCount = data.invitations.filter((inv: Invitation) => inv.status === 'pending').length
        const acceptedCount = data.invitations.filter((inv: Invitation) => inv.status === 'accepted').length
        const declinedCount = data.invitations.filter((inv: Invitation) => inv.status === 'declined').length
        
        setStats({
          pending: pendingCount,
          accepted: acceptedCount,
          declined: declinedCount,
          total: data.invitations.length,
        })
      }
    } catch (err) {
      console.error('Error fetching invitations:', err)
      setError('Failed to load invitations')
    } finally {
      setInvitationLoading(false)
    }
  }, [campaignId])

  useEffect(() => {
    fetchInvitations()
  }, [fetchInvitations])

  // Validate email
  const isValidEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }

  // Handle adding email from input
  const handleAddEmail = () => {
    setError('')
    
    if (!emailInput.trim()) {
      setError('Please enter an email address')
      return
    }

    const emailList = emailInput
      .split(/[,\n]/)
      .map((e) => e.trim())
      .filter((e) => e)

    const invalidEmails = emailList.filter((e) => !isValidEmail(e))
    
    if (invalidEmails.length > 0) {
      setError(`Invalid email(s): ${invalidEmails.join(', ')}`)
      return
    }

    // Check for duplicates within the list and existing emails
    const newEmails = emailList.filter((e) => !emails.includes(e))
    
    if (newEmails.length === 0) {
      setError('All entered emails are already in the list')
      return
    }

    setEmails([...emails, ...newEmails])
    setEmailInput('')
  }

  // Remove email from list
  const handleRemoveEmail = (email: string) => {
    setEmails(emails.filter((e) => e !== email))
  }

  // Send invitations
  const handleSendInvitations = async () => {
    setError('')
    setSuccessMessage('')

    if (emails.length === 0) {
      setError('Add at least one email address')
      return
    }

    setSending(true)

    try {
      const response = await fetch(`/api/campaigns/${campaignId}/invitations`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ emails }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to send invitations')
      }

      const data = await response.json()
      setSuccessMessage(`Successfully sent ${data.invitationCount} invitation(s)`)
      setEmails([])
      setEmailInput('')
      
      // Refresh invitations list
      await fetchInvitations()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send invitations')
    } finally {
      setSending(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600">{stats.total}</div>
              <div className="text-sm text-gray-600 mt-1">Total Invitations</div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-yellow-600">{stats.pending}</div>
              <div className="text-sm text-gray-600 mt-1">Pending</div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600">{stats.accepted}</div>
              <div className="text-sm text-gray-600 mt-1">Accepted</div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-red-600">{stats.declined}</div>
              <div className="text-sm text-gray-600 mt-1">Declined</div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Invitation Form */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mail className="w-5 h-5" />
            Send Campaign Invitations
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {error && (
            <div className="p-3 bg-red-50 text-red-700 rounded-md text-sm">{error}</div>
          )}
          
          {successMessage && (
            <div className="p-3 bg-green-50 text-green-700 rounded-md text-sm">{successMessage}</div>
          )}

          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Email Addresses
            </label>
            <div className="flex gap-2">
              <Input
                type="email"
                placeholder="Enter email (comma or newline separated)"
                value={emailInput}
                onChange={(e) => setEmailInput(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault()
                    handleAddEmail()
                  }
                }}
                className="flex-1"
              />
              <Button
                onClick={handleAddEmail}
                variant="outline"
                disabled={!emailInput.trim() || loading}
              >
                <UserPlus className="w-4 h-4 mr-2" />
                Add
              </Button>
            </div>
            <p className="text-xs text-gray-500">
              Separate multiple emails with commas or newlines
            </p>
          </div>

          {/* Email List */}
          {emails.length > 0 && (
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Emails to Invite ({emails.length})
              </label>
              <div className="bg-gray-50 rounded-md p-3 max-h-48 overflow-y-auto space-y-2">
                {emails.map((email) => (
                  <div
                    key={email}
                    className="flex items-center justify-between bg-white p-2 rounded border border-gray-200"
                  >
                    <span className="text-sm">{email}</span>
                    <button
                      onClick={() => handleRemoveEmail(email)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          <Button
            onClick={handleSendInvitations}
            disabled={emails.length === 0 || sending}
            className="w-full bg-blue-600 hover:bg-blue-700"
          >
            {sending ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Sending Invitations...
              </>
            ) : (
              <>
                <Send className="w-4 h-4 mr-2" />
                Send {emails.length > 0 ? `Invitations (${emails.length})` : 'Invitations'}
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Invitations List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="w-5 h-5" />
            Campaign Invitations
          </CardTitle>
        </CardHeader>
        <CardContent>
          {invitationLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
            </div>
          ) : invitations.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Mail className="w-12 h-12 mx-auto mb-2 text-gray-300" />
              <p>No invitations sent yet</p>
            </div>
          ) : (
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {invitations.map((invitation) => (
                <div
                  key={invitation.id}
                  className="flex items-center justify-between p-3 border border-gray-200 rounded-md hover:bg-gray-50"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-sm truncate">{invitation.email}</span>
                      {getStatusIcon(invitation.status)}
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      Sent {formatDate(invitation.createdAt)}
                      {invitation.respondedAt && (
                        <> • Responded {formatDate(invitation.respondedAt)}</>
                      )}
                    </p>
                  </div>
                  <div className="flex-shrink-0 ml-2">
                    {getStatusBadge(invitation.status)}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
