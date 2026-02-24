'use client'

import React, { useState, useEffect } from 'react'
import {
  Loader2,
  FileText,
  Users,
  Target,
  Share2,
  CheckCircle,
  Edit3,
  Eye,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface Petition {
  id: string
  campaignId: string
  title: string
  description: string
  demands: string[]
  targetRecipient: string
  signatureGoal: number
  currentSignatures: number
  status: 'draft' | 'active' | 'delivered' | 'responded'
  createdAt: string
  deliveryDate?: string
}

interface PetitionBuilderProps {
  campaignId: string
}

const statusSteps = [
  { step: 'Draft', status: 'draft' },
  { step: 'Active', status: 'active' },
  { step: 'Delivered', status: 'delivered' },
  { step: 'Responded', status: 'responded' },
]

export function PetitionBuilder({ campaignId }: PetitionBuilderProps) {
  const [petition, setPetition] = useState<Petition | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [editFields, setEditFields] = useState({
    title: '',
    description: '',
    demands: [] as string[],
  })
  const [isSigning, setIsSigning] = useState(false)

  useEffect(() => {
    const fetchPetition = async () => {
      try {
        setLoading(true)
        const response = await fetch(`/api/campaigns/${campaignId}/petition`)
        if (!response.ok) {
          throw new Error('Failed to fetch petition')
        }
        const data = await response.json()
        setPetition(data)
        setEditFields({
          title: data.title,
          description: data.description,
          demands: data.demands,
        })
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error occurred')
      } finally {
        setLoading(false)
      }
    }

    fetchPetition()
  }, [campaignId])

  const signPetition = async () => {
    if (!petition) return

    try {
      setIsSigning(true)
      const response = await fetch(`/api/campaigns/${campaignId}/petition`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'petition_sign' }),
      })

      if (!response.ok) {
        throw new Error('Failed to sign petition')
      }

      const updated = await response.json()
      setPetition(updated)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to sign petition')
    } finally {
      setIsSigning(false)
    }
  }

  const updatePetition = async () => {
    try {
      const response = await fetch(`/api/campaigns/${campaignId}/petition`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: editFields.title,
          description: editFields.description,
          demands: editFields.demands,
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to update petition')
      }

      const updated = await response.json()
      setPetition(updated)
      setIsEditing(false)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update petition')
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12">
        <Loader2 className="h-8 w-8 animate-spin text-violet-600" />
      </div>
    )
  }

  if (error || !petition) {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 p-6 text-red-800">
        {error || 'Failed to load petition'}
      </div>
    )
  }

  const signaturePercentage = Math.min(
    (petition.currentSignatures / petition.signatureGoal) * 100,
    100
  )
  const currentStatusIndex = statusSteps.findIndex(
    (s) => s.status === petition.status
  )

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <FileText className="h-6 w-6 text-violet-600" />
          <h1 className="text-3xl font-bold text-gray-900">Petition Builder</h1>
        </div>
        {!isEditing && (
          <Button
            onClick={() => setIsEditing(true)}
            variant="outline"
            size="sm"
            className="text-violet-600 hover:text-violet-700"
          >
            <Edit3 className="mr-2 h-4 w-4" />
            Edit
          </Button>
        )}
      </div>

      {/* Title & Description Section */}
      <div className="rounded-lg border border-violet-200 bg-gradient-to-br from-violet-50 to-lime-50 p-6">
        {isEditing ? (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Title
              </label>
              <input
                type="text"
                value={editFields.title}
                onChange={(e) =>
                  setEditFields({ ...editFields, title: e.target.value })
                }
                className="mt-1 w-full rounded border border-gray-300 px-3 py-2"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Description
              </label>
              <textarea
                value={editFields.description}
                onChange={(e) =>
                  setEditFields({ ...editFields, description: e.target.value })
                }
                className="mt-1 w-full rounded border border-gray-300 px-3 py-2"
                rows={3}
              />
            </div>
            <div className="flex gap-2">
              <Button
                onClick={updatePetition}
                className="bg-violet-600 hover:bg-violet-700"
              >
                Save Changes
              </Button>
              <Button
                onClick={() => setIsEditing(false)}
                variant="outline"
              >
                Cancel
              </Button>
            </div>
          </div>
        ) : (
          <>
            <h2 className="text-2xl font-bold text-gray-900">
              {petition.title}
            </h2>
            <p className="mt-2 text-gray-700">{petition.description}</p>
          </>
        )}
      </div>

      {/* Demands Section */}
      <div className="rounded-lg border border-gray-200 p-6">
        <div className="flex items-center gap-2 mb-4">
          <FileText className="h-5 w-5 text-violet-600" />
          <h3 className="text-lg font-semibold text-gray-900">Key Demands</h3>
        </div>
        <ul className="space-y-2">
          {petition.demands.map((demand, idx) => (
            <li
              key={idx}
              className="flex items-start gap-3 rounded bg-gray-50 p-3"
            >
              <CheckCircle className="mt-0.5 h-5 w-5 flex-shrink-0 text-lime-600" />
              <span className="text-gray-700">{demand}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Signature Progress */}
      <div className="rounded-lg border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Users className="h-5 w-5 text-violet-600" />
            <h3 className="text-lg font-semibold text-gray-900">
              Signatures
            </h3>
          </div>
          <span className="text-sm font-medium text-gray-600">
            {petition.currentSignatures.toLocaleString()} of{' '}
            {petition.signatureGoal.toLocaleString()}
          </span>
        </div>
        <div className="h-4 rounded-full bg-gray-200 overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-lime-400 to-lime-600 transition-all duration-300"
            style={{ width: `${signaturePercentage}%` }}
          />
        </div>
        <p className="mt-2 text-sm text-gray-600">
          {Math.round(signaturePercentage)}% of goal reached
        </p>
      </div>

      {/* Target Recipient Card */}
      <div className="rounded-lg border border-gray-200 bg-blue-50 p-6">
        <div className="flex items-center gap-2 mb-3">
          <Target className="h-5 w-5 text-blue-600" />
          <h3 className="text-lg font-semibold text-gray-900">
            Target Recipient
          </h3>
        </div>
        <p className="text-gray-700 font-medium">{petition.targetRecipient}</p>
      </div>

      {/* Sign Button */}
      <Button
        onClick={signPetition}
        disabled={isSigning || petition.status !== 'active'}
        className={cn(
          'w-full h-12 text-lg font-semibold transition-all',
          petition.status === 'active'
            ? 'bg-violet-600 hover:bg-violet-700 text-white'
            : 'bg-gray-300 text-gray-500 cursor-not-allowed'
        )}
      >
        {isSigning && <Loader2 className="mr-2 h-5 w-5 animate-spin" />}
        {petition.status === 'active' ? 'Sign This Petition' : 'Petition Closed'}
      </Button>

      {/* Share Section */}
      <div className="rounded-lg border border-gray-200 p-6">
        <div className="flex items-center gap-2 mb-4">
          <Share2 className="h-5 w-5 text-violet-600" />
          <h3 className="text-lg font-semibold text-gray-900">Share</h3>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            Share on Twitter
          </Button>
          <Button variant="outline" size="sm">
            Share on Facebook
          </Button>
          <Button variant="outline" size="sm">
            Copy Link
          </Button>
        </div>
      </div>

      {/* Status Timeline */}
      <div className="rounded-lg border border-gray-200 p-6">
        <div className="flex items-center gap-2 mb-6">
          <Eye className="h-5 w-5 text-violet-600" />
          <h3 className="text-lg font-semibold text-gray-900">
            Campaign Status
          </h3>
        </div>
        <div className="flex justify-between">
          {statusSteps.map((step, idx) => (
            <div key={step.status} className="flex flex-col items-center">
              <div
                className={cn(
                  'h-10 w-10 rounded-full flex items-center justify-center font-semibold text-white transition-all',
                  idx <= currentStatusIndex
                    ? 'bg-violet-600'
                    : 'bg-gray-300'
                )}
              >
                {idx <= currentStatusIndex ? (
                  <CheckCircle className="h-6 w-6" />
                ) : (
                  idx + 1
                )}
              </div>
              <span className="mt-2 text-sm font-medium text-gray-700">
                {step.step}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
