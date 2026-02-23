'use client'

import React, { useState, useEffect } from 'react'
import { Users, AlertCircle, CheckCircle, Send, Loader2 } from 'lucide-react'
import { Avatar } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

interface CollabRequest {
  id: string
  requesterId: string
  requesterName: string
  requesterHandle?: string
  requesterAvatar?: string
  message: string
  roleWanted: 'contributor' | 'reviewer' | 'promoter' | 'other'
  status: 'pending' | 'accepted' | 'rejected'
  createdAt: string
}

interface CollabRequestsProps {
  campaignId: string
  isCreator?: boolean
}

const getRoleBadgeColor = (
  role: 'contributor' | 'reviewer' | 'promoter' | 'other'
): string => {
  switch (role) {
    case 'contributor':
      return 'bg-blue-600'
    case 'reviewer':
      return 'bg-purple-600'
    case 'promoter':
      return 'bg-green-600'
    case 'other':
      return 'bg-gray-600'
  }
}

const getRoleLabel = (role: string): string => {
  switch (role) {
    case 'contributor':
      return 'Contributor'
    case 'reviewer':
      return 'Reviewer'
    case 'promoter':
      return 'Promoter'
    case 'other':
      return 'Other'
    default:
      return 'Unknown'
  }
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

interface FormState {
  message: string
  roleWanted: 'contributor' | 'reviewer' | 'promoter' | 'other'
  submitting: boolean
  error: string | null
}

const CollabRequestForm = ({
  campaignId,
  onSuccess,
}: {
  campaignId: string
  onSuccess: () => void
}) => {
  const [formState, setFormState] = useState<FormState>({
    message: '',
    roleWanted: 'contributor',
    submitting: false,
    error: null,
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setFormState((prev) => ({ ...prev, error: null }))

    if (!formState.message.trim()) {
      setFormState((prev) => ({
        ...prev,
        error: 'Message is required',
      }))
      return
    }

    setFormState((prev) => ({ ...prev, submitting: true }))

    try {
      const response = await fetch(
        `/api/campaigns/${campaignId}/collab-requests`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            message: formState.message.trim(),
            roleWanted: formState.roleWanted,
          }),
        }
      )

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to submit request')
      }

      setFormState({
        message: '',
        roleWanted: 'contributor',
        submitting: false,
        error: null,
      })
      onSuccess()
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'An error occurred'
      setFormState((prev) => ({
        ...prev,
        error: errorMessage,
        submitting: false,
      }))
    }
  }

  return (
    <Card className="border-blue-200 bg-blue-50 mb-6">
      <CardHeader>
        <CardTitle className="text-base flex items-center gap-2">
          <Users className="w-4 h-4" />
          Request to Collaborate
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              What's your role?
            </label>
            <select
              value={formState.roleWanted}
              onChange={(e) =>
                setFormState((prev) => ({
                  ...prev,
                  roleWanted: e.target.value as FormState['roleWanted'],
                }))
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-violet-500"
            >
              <option value="contributor">Contributor (Help create content)</option>
              <option value="reviewer">Reviewer (Review campaigns)</option>
              <option value="promoter">Promoter (Help share campaigns)</option>
              <option value="other">Other (Specify in message)</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Message to Creator
            </label>
            <textarea
              value={formState.message}
              onChange={(e) =>
                setFormState((prev) => ({
                  ...prev,
                  message: e.target.value,
                }))
              }
              placeholder="Tell the creator why you'd like to collaborate..."
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-violet-500 resize-none"
              rows={3}
            />
          </div>

          {formState.error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-md flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-800">{formState.error}</p>
            </div>
          )}

          <Button
            type="submit"
            disabled={formState.submitting}
            className="w-full bg-violet-600 hover:bg-violet-700 text-white"
          >
            {formState.submitting ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Submitting...
              </>
            ) : (
              <>
                <Send className="w-4 h-4 mr-2" />
                Send Request
              </>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}

const CollabRequestItem = ({ request }: { request: CollabRequest }) => {
  return (
    <div className="border border-gray-200 rounded-lg p-4 hover:border-violet-300 transition-colors">
      <div className="flex items-start gap-3 mb-3">
        <Avatar className="w-10 h-10">
          {request.requesterAvatar ? (
            <img
              src={request.requesterAvatar}
              alt={request.requesterName}
              className="w-full h-full object-cover rounded-full"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-violet-400 to-lime-400 rounded-full flex items-center justify-center text-white font-bold">
              {request.requesterName.charAt(0).toUpperCase()}
            </div>
          )}
        </Avatar>

        <div className="flex-1">
          <div className="flex items-center gap-2">
            <p className="font-semibold text-gray-900">
              {request.requesterName}
            </p>
            {request.requesterHandle && (
              <span className="text-sm text-gray-500">@{request.requesterHandle}</span>
            )}
          </div>
          <p className="text-xs text-gray-500">{formatDate(request.createdAt)}</p>
        </div>

        <div className="flex items-center gap-2">
          <Badge className={cn('text-white', getRoleBadgeColor(request.roleWanted))}>
            {getRoleLabel(request.roleWanted)}
          </Badge>
          {request.status === 'accepted' && (
            <Badge className="bg-green-600">
              <CheckCircle className="w-3 h-3 mr-1" />
              Accepted
            </Badge>
          )}
        </div>
      </div>

      <p className="text-sm text-gray-700 bg-gray-50 p-3 rounded border border-gray-200">
        {request.message}
      </p>
    </div>
  )
}

export function CollabRequests({
  campaignId,
  isCreator = false,
}: CollabRequestsProps) {
  const [requests, setRequests] = useState<CollabRequest[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showForm, setShowForm] = useState(false)

  const fetchRequests = async () => {
    try {
      const response = await fetch(
        `/api/campaigns/${campaignId}/collab-requests`
      )
      if (!response.ok) {
        throw new Error('Failed to fetch collaboration requests')
      }
      const data = await response.json()
      setRequests(data.data || [])
    } catch (err) {
      console.error('Error fetching collab requests:', err)
      setError('Unable to load collaboration requests')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchRequests()
  }, [campaignId])

  const handleFormSuccess = () => {
    setShowForm(false)
    fetchRequests()
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="w-5 h-5" />
            Collaboration Requests
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 animate-pulse">
            <div className="h-20 bg-gray-200 rounded-lg"></div>
            <div className="h-20 bg-gray-200 rounded-lg"></div>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card className="border-red-200 bg-red-50">
        <CardContent className="p-6">
          <div className="flex items-center gap-2 text-red-900">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <p>{error}</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      {!isCreator && !showForm && (
        <Button
          onClick={() => setShowForm(true)}
          className="w-full bg-violet-600 hover:bg-violet-700 text-white"
        >
          <Users className="w-4 h-4 mr-2" />
          Collaborate on This Campaign
        </Button>
      )}

      {showForm && (
        <CollabRequestForm
          campaignId={campaignId}
          onSuccess={handleFormSuccess}
        />
      )}

      {isCreator && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span className="flex items-center gap-2">
                <Users className="w-5 h-5" />
                Collaboration Requests ({requests.length})
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {requests.length === 0 ? (
              <div className="text-center py-8">
                <Users className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-600">
                  No collaboration requests yet. People can request to help with
                  this campaign.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {requests.map((request) => (
                  <CollabRequestItem key={request.id} request={request} />
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {!isCreator && requests.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Users className="w-4 h-4" />
              Other Collaborators ({requests.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {requests.slice(0, 5).map((request) => (
                <div key={request.id} className="flex items-center gap-2">
                  <Avatar className="w-6 h-6">
                    {request.requesterAvatar ? (
                      <img
                        src={request.requesterAvatar}
                        alt={request.requesterName}
                        className="w-full h-full object-cover rounded-full"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-violet-400 to-lime-400 rounded-full flex items-center justify-center text-white text-xs font-bold">
                        {request.requesterName.charAt(0).toUpperCase()}
                      </div>
                    )}
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {request.requesterName}
                    </p>
                  </div>
                  <Badge className={cn('text-white text-xs', getRoleBadgeColor(request.roleWanted))}>
                    {getRoleLabel(request.roleWanted)}
                  </Badge>
                </div>
              ))}
              {requests.length > 5 && (
                <p className="text-xs text-gray-500 pt-2">
                  +{requests.length - 5} more
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
