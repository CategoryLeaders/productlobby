'use client'

import React, { useState, useEffect } from 'react'
import { Crown, Users, Search, Send, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

interface Collaborator {
  id: string
  email: string
  displayName: string
  handle: string | null
  avatar: string | null
  role: 'owner' | 'collaborator'
  invitedAt?: string
}

interface CollaboratorPanelProps {
  campaignId: string
  isOwner: boolean
}

export const CollaboratorPanel: React.FC<CollaboratorPanelProps> = ({
  campaignId,
  isOwner,
}) => {
  const [collaborators, setCollaborators] = useState<Collaborator[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [inviting, setInviting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  // Fetch collaborators on mount
  useEffect(() => {
    fetchCollaborators()
  }, [campaignId])

  const fetchCollaborators = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/campaigns/${campaignId}/collaborators`)

      if (!response.ok) {
        throw new Error('Failed to fetch collaborators')
      }

      const data = await response.json()
      if (data.success) {
        setCollaborators(data.data)
      }
    } catch (err) {
      console.error('Error fetching collaborators:', err)
      setError('Failed to load collaborators')
    } finally {
      setLoading(false)
    }
  }

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!searchQuery.trim()) {
      setError('Please enter a handle or email address')
      return
    }

    try {
      setInviting(true)
      setError(null)
      setSuccess(null)

      const response = await fetch(`/api/campaigns/${campaignId}/collaborators`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          handle: searchQuery.includes('@') ? undefined : searchQuery,
          email: searchQuery.includes('@') ? searchQuery : undefined,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to invite collaborator')
      }

      setSuccess(`Invitation sent to ${data.data.displayName}`)
      setSearchQuery('')

      // Refresh collaborators list
      await fetchCollaborators()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to invite collaborator')
    } finally {
      setInviting(false)
    }
  }

  return (
    <div className="w-full max-w-md mx-auto p-6 border rounded-lg bg-card">
      {/* Header */}
      <div className="flex items-center gap-2 mb-6">
        <Users className="w-5 h-5" />
        <h3 className="text-lg font-semibold">Campaign Collaborators</h3>
      </div>

      {/* Collaborators List */}
      <div className="mb-6">
        <h4 className="text-sm font-medium mb-3 text-muted-foreground">
          {collaborators.length} {collaborators.length === 1 ? 'collaborator' : 'collaborators'}
        </h4>

        {loading ? (
          <div className="text-sm text-muted-foreground py-4">Loading collaborators...</div>
        ) : collaborators.length === 0 ? (
          <div className="text-sm text-muted-foreground py-4">No collaborators yet</div>
        ) : (
          <div className="space-y-3">
            {collaborators.map((collab) => (
              <div
                key={collab.id}
                className="flex items-center gap-3 p-3 rounded-lg bg-background border"
              >
                {/* Avatar */}
                {collab.avatar ? (
                  <img
                    src={collab.avatar}
                    alt={collab.displayName}
                    className="w-8 h-8 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-xs font-semibold">
                    {collab.displayName.charAt(0)}
                  </div>
                )}

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-medium truncate">{collab.displayName}</p>
                    {collab.role === 'owner' && (
                      <Crown className="w-4 h-4 text-yellow-500 flex-shrink-0" />
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground truncate">
                    {collab.handle ? `@${collab.handle}` : collab.email}
                  </p>
                </div>

                {/* Role Badge */}
                <div className="flex-shrink-0">
                  <span className="text-xs font-medium px-2 py-1 rounded-full bg-primary/10 text-primary">
                    {collab.role === 'owner' ? 'Owner' : 'Collaborator'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Invite Form (only for owner) */}
      {isOwner && (
        <div className="pt-6 border-t">
          <h4 className="text-sm font-medium mb-3">Invite a Collaborator</h4>

          {error && (
            <div className="mb-4 p-3 rounded-lg bg-destructive/10 border border-destructive/20 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-destructive mt-0.5 flex-shrink-0" />
              <p className="text-sm text-destructive">{error}</p>
            </div>
          )}

          {success && (
            <div className="mb-4 p-3 rounded-lg bg-green-500/10 border border-green-500/20">
              <p className="text-sm text-green-700 dark:text-green-400">{success}</p>
            </div>
          )}

          <form onSubmit={handleInvite} className="space-y-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Handle (@username) or email"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
                disabled={inviting}
              />
            </div>

            <Button
              type="submit"
              disabled={inviting || !searchQuery.trim()}
              className="w-full gap-2"
            >
              <Send className="w-4 h-4" />
              {inviting ? 'Inviting...' : 'Send Invite'}
            </Button>
          </form>

          <p className="text-xs text-muted-foreground mt-3">
            Enter a user's handle (without @) or email address to invite them to collaborate on this campaign.
          </p>
        </div>
      )}
    </div>
  )
}
