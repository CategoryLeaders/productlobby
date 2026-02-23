'use client'

import React, { useState, useEffect } from 'react'
import { cn } from '@/lib/utils'
import { Users, UserCheck, AlertCircle } from 'lucide-react'

type StakeholderRole = 'consumer' | 'retailer' | 'investor' | 'influencer' | 'media'

interface StakeholderData {
  id: string
  userId: string
  userName: string
  userEmail: string
  role: StakeholderRole
  registeredAt: string
}

interface StakeholderGroup {
  role: StakeholderRole
  count: number
  stakeholders: StakeholderData[]
}

interface StakeholderRegistryProps {
  campaignId: string
}

const roleConfig: Record<StakeholderRole, { label: string; color: string; icon: string }> = {
  consumer: { label: 'Consumer', color: 'bg-green-100 text-green-700', icon: '👤' },
  retailer: { label: 'Retailer', color: 'bg-blue-100 text-blue-700', icon: '🏪' },
  investor: { label: 'Investor', color: 'bg-purple-100 text-purple-700', icon: '💰' },
  influencer: { label: 'Influencer', color: 'bg-pink-100 text-pink-700', icon: '⭐' },
  media: { label: 'Media', color: 'bg-orange-100 text-orange-700', icon: '📰' },
}

export function StakeholderRegistry({ campaignId }: StakeholderRegistryProps) {
  const [stakeholders, setStakeholders] = useState<StakeholderGroup[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedRole, setSelectedRole] = useState<StakeholderRole>('consumer')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [submitSuccess, setSubmitSuccess] = useState(false)

  // Fetch stakeholders
  useEffect(() => {
    const fetchStakeholders = async () => {
      try {
        setIsLoading(true)
        const response = await fetch(`/api/campaigns/${campaignId}/stakeholders`)
        if (!response.ok) {
          throw new Error('Failed to fetch stakeholders')
        }
        const data = await response.json()
        if (data.success) {
          setStakeholders(data.data.stakeholders)
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred')
      } finally {
        setIsLoading(false)
      }
    }

    fetchStakeholders()
  }, [campaignId])

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitError(null)
    setSubmitSuccess(false)

    try {
      setIsSubmitting(true)
      const response = await fetch(`/api/campaigns/${campaignId}/stakeholders`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role: selectedRole }),
      })

      const data = await response.json()

      if (!response.ok) {
        setSubmitError(data.error || 'Failed to register as stakeholder')
        return
      }

      setSubmitSuccess(true)
      setStakeholders(data.data.stakeholders)

      // Reset form
      setSelectedRole('consumer')

      // Clear success message after 3 seconds
      setTimeout(() => setSubmitSuccess(false), 3000)
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setIsSubmitting(false)
    }
  }

  const totalStakeholders = stakeholders.reduce((sum, group) => sum + group.count, 0)

  return (
    <div className="rounded-lg border border-slate-200 bg-white p-6">
      <div className="mb-6 flex items-center gap-3">
        <Users className="h-6 w-6 text-blue-600" />
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Stakeholder Registry</h2>
          <p className="text-sm text-slate-600">
            {totalStakeholders} stakeholder{totalStakeholders !== 1 ? 's' : ''} registered
          </p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Registration Form */}
        <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
          <h3 className="mb-4 font-semibold text-slate-900">Register as Stakeholder</h3>

          {submitSuccess && (
            <div className="mb-4 rounded-lg bg-green-50 p-3 text-sm text-green-700">
              <div className="flex gap-2">
                <UserCheck className="h-4 w-4 flex-shrink-0" />
                <span>Successfully registered as a {roleConfig[selectedRole].label}</span>
              </div>
            </div>
          )}

          {submitError && (
            <div className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-700">
              <div className="flex gap-2">
                <AlertCircle className="h-4 w-4 flex-shrink-0" />
                <span>{submitError}</span>
              </div>
            </div>
          )}

          <form onSubmit={handleRegister} className="space-y-4">
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Select Your Role
              </label>
              <select
                value={selectedRole}
                onChange={(e) => setSelectedRole(e.target.value as StakeholderRole)}
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-900"
              >
                {(Object.entries(roleConfig) as Array<[StakeholderRole, any]>).map(
                  ([role, config]) => (
                    <option key={role} value={role}>
                      {config.icon} {config.label}
                    </option>
                  )
                )}
              </select>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className={cn(
                'w-full rounded-lg py-2 font-medium transition-colors',
                isSubmitting
                  ? 'bg-slate-300 text-slate-500 cursor-not-allowed'
                  : 'bg-blue-600 text-white hover:bg-blue-700'
              )}
            >
              {isSubmitting ? 'Registering...' : 'Register'}
            </button>
          </form>
        </div>

        {/* Stakeholder Count Summary */}
        <div className="space-y-3">
          <h3 className="font-semibold text-slate-900">Registered Stakeholders</h3>
          {isLoading ? (
            <div className="text-slate-500">Loading stakeholders...</div>
          ) : error ? (
            <div className="text-red-600">{error}</div>
          ) : stakeholders.length === 0 ? (
            <div className="text-slate-500">No stakeholders registered yet</div>
          ) : (
            <div className="space-y-2">
              {stakeholders.map((group) => (
                <div
                  key={group.role}
                  className="flex items-center justify-between rounded-lg border border-slate-200 p-3"
                >
                  <span className="flex items-center gap-2">
                    <span className="text-lg">
                      {roleConfig[group.role].icon}
                    </span>
                    <span className="font-medium text-slate-900">
                      {roleConfig[group.role].label}
                    </span>
                  </span>
                  <span
                    className={cn(
                      'rounded-full px-3 py-1 font-bold',
                      roleConfig[group.role].color
                    )}
                  >
                    {group.count}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Stakeholders List */}
      {stakeholders.length > 0 && (
        <div className="mt-6 border-t border-slate-200 pt-6">
          <h3 className="mb-4 font-semibold text-slate-900">All Stakeholders</h3>
          <div className="space-y-4">
            {stakeholders.map((group) =>
              group.stakeholders.map((stakeholder) => (
                <div
                  key={stakeholder.id}
                  className="flex items-center justify-between rounded-lg border border-slate-200 p-3"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-lg">{roleConfig[stakeholder.role].icon}</span>
                    <div>
                      <p className="font-medium text-slate-900">{stakeholder.userName}</p>
                      <p className="text-xs text-slate-500">{stakeholder.userEmail}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span
                      className={cn(
                        'inline-block rounded-full px-2 py-1 text-xs font-semibold',
                        roleConfig[stakeholder.role].color
                      )}
                    >
                      {roleConfig[stakeholder.role].label}
                    </span>
                    <p className="mt-1 text-xs text-slate-500">
                      {new Date(stakeholder.registeredAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  )
}
