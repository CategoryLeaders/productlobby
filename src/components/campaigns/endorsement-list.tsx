'use client'

import React, { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Loader2, Star } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useAuth } from '@/hooks/useAuth'
import { EndorsementCard } from './endorsement-card'
import { EndorsementModal } from './endorsement-modal'

interface Endorser {
  id: string
  displayName: string
  avatar?: string
  handle?: string
}

interface Endorsement {
  id: string
  userId: string
  user: Endorser
  title: string
  organization: string
  reason: string
  createdAt: string
}

interface EndorsementListProps {
  campaignId: string
  className?: string
}

export const EndorsementList: React.FC<EndorsementListProps> = ({
  campaignId,
  className,
}) => {
  const { user } = useAuth()
  const [endorsements, setEndorsements] = useState<Endorsement[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [hasEndorsed, setHasEndorsed] = useState(false)

  useEffect(() => {
    fetchEndorsements()
  }, [campaignId])

  const fetchEndorsements = async () => {
    try {
      setIsLoading(true)
      const response = await fetch(`/api/campaigns/${campaignId}/endorsements`)
      const result = await response.json()

      if (result.success) {
        setEndorsements(result.data || [])
        setHasEndorsed(
          user ? result.data.some((e: Endorsement) => e.userId === user.id) : false
        )
      }
    } catch (error) {
      console.error('Error fetching endorsements:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleEndorsementSubmit = async (data: {
    title: string
    organization: string
    reason: string
  }) => {
    try {
      const response = await fetch(`/api/campaigns/${campaignId}/endorsements`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      })

      const result = await response.json()

      if (result.success) {
        setShowModal(false)
        await fetchEndorsements()
      } else {
        alert(result.error || 'Failed to submit endorsement')
      }
    } catch (error) {
      console.error('Error submitting endorsement:', error)
      alert('Failed to submit endorsement')
    }
  }

  return (
    <div className={cn('space-y-6', className)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Star className="w-6 h-6 text-amber-500" />
            Endorsements
          </h2>
          <p className="mt-1 text-gray-600">
            {endorsements.length} professional endorsement
            {endorsements.length !== 1 ? 's' : ''}
          </p>
        </div>

        {user && !hasEndorsed && (
          <Button
            onClick={() => setShowModal(true)}
            className="bg-violet-600 hover:bg-violet-700 text-white"
          >
            Endorse This Campaign
          </Button>
        )}
      </div>

      {/* Endorsement Modal */}
      {showModal && (
        <EndorsementModal
          onSubmit={handleEndorsementSubmit}
          onClose={() => setShowModal(false)}
          campaignId={campaignId}
        />
      )}

      {/* Endorsements List */}
      <div className="space-y-4">
        {isLoading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="w-8 h-8 animate-spin text-violet-600" />
          </div>
        ) : endorsements.length === 0 ? (
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-8 text-center">
            <Star className="w-8 h-8 text-gray-400 mx-auto mb-2" />
            <p className="text-gray-600">No endorsements yet</p>
            {user && (
              <button
                onClick={() => setShowModal(true)}
                className="mt-4 text-violet-600 hover:text-violet-700 font-medium"
              >
                Be the first to endorse
              </button>
            )}
            {!user && (
              <p className="text-sm text-gray-500 mt-2">
                Sign in to endorse this campaign
              </p>
            )}
          </div>
        ) : (
          endorsements.map((endorsement) => (
            <EndorsementCard
              key={endorsement.id}
              endorsement={endorsement}
            />
          ))
        )}
      </div>
    </div>
  )
}

export default EndorsementList
