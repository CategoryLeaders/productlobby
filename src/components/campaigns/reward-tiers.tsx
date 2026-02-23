'use client'

import { useState, useEffect } from 'react'
import { Plus, Lock, Unlock, Gift } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

interface RewardTier {
  id: string
  name: string
  description: string
  minLobbiesRequired: number
  rewardDescription: string
  createdAt: string
}

interface RewardTiersProps {
  campaignId: string
  isCreator?: boolean
  userLobbyCount?: number
}

interface RewardTiersData {
  rewardTiers: RewardTier[]
  total: number
}

export function RewardTiers({
  campaignId,
  isCreator = false,
  userLobbyCount = 0,
}: RewardTiersProps) {
  const [tiers, setTiers] = useState<RewardTier[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [posting, setPosting] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    minLobbiesRequired: '',
    rewardDescription: '',
  })

  useEffect(() => {
    fetchRewardTiers()
  }, [campaignId])

  const fetchRewardTiers = async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await fetch(`/api/campaigns/${campaignId}/reward-tiers`)
      if (!response.ok) {
        throw new Error('Failed to fetch reward tiers')
      }
      const result: RewardTiersData = await response.json()
      setTiers(result.rewardTiers)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (
      !formData.name.trim() ||
      !formData.description.trim() ||
      !formData.minLobbiesRequired ||
      !formData.rewardDescription.trim()
    ) {
      setError('All fields are required')
      return
    }

    const minLobbies = parseInt(formData.minLobbiesRequired)
    if (isNaN(minLobbies) || minLobbies < 0) {
      setError('Min lobbies required must be a non-negative number')
      return
    }

    try {
      setPosting(true)
      setError(null)
      const response = await fetch(`/api/campaigns/${campaignId}/reward-tiers`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          description: formData.description,
          minLobbiesRequired: minLobbies,
          rewardDescription: formData.rewardDescription,
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to create reward tier')
      }

      const result = await response.json()
      setTiers((prev) => [...prev].sort((a, b) => a.minLobbiesRequired - b.minLobbiesRequired))
      setTiers((prev) =>
        [...prev, result.rewardTier].sort(
          (a, b) => a.minLobbiesRequired - b.minLobbiesRequired
        )
      )
      setFormData({
        name: '',
        description: '',
        minLobbiesRequired: '',
        rewardDescription: '',
      })
      setShowForm(false)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setPosting(false)
    }
  }

  const isUnlocked = (minRequired: number) => userLobbyCount >= minRequired

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Loading reward tiers...</CardTitle>
        </CardHeader>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Reward Tiers</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Unlock exclusive rewards as lobbies grow
          </p>
        </div>
        {isCreator && (
          <Button
            onClick={() => setShowForm(!showForm)}
            className="gap-2"
            variant={showForm ? 'outline' : 'default'}
          >
            <Plus className="w-4 h-4" />
            {showForm ? 'Cancel' : 'Add Tier'}
          </Button>
        )}
      </div>

      {error && (
        <div className="p-4 bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 rounded-lg text-red-700 dark:text-red-200">
          {error}
        </div>
      )}

      {showForm && isCreator && (
        <Card className="bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-800">
          <CardHeader>
            <CardTitle className="text-lg">Create New Reward Tier</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-sm font-medium">Tier Name</label>
                <Input
                  placeholder="e.g., Bronze Supporter"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="mt-1"
                />
              </div>

              <div>
                <label className="text-sm font-medium">Description</label>
                <Textarea
                  placeholder="Brief description of this tier..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="mt-1"
                  rows={2}
                />
              </div>

              <div>
                <label className="text-sm font-medium">Minimum Lobbies Required</label>
                <Input
                  type="number"
                  placeholder="e.g., 10"
                  value={formData.minLobbiesRequired}
                  onChange={(e) =>
                    setFormData({ ...formData, minLobbiesRequired: e.target.value })
                  }
                  className="mt-1"
                  min="0"
                />
              </div>

              <div>
                <label className="text-sm font-medium">Reward Description</label>
                <Textarea
                  placeholder="What do supporters get when they reach this tier?"
                  value={formData.rewardDescription}
                  onChange={(e) =>
                    setFormData({ ...formData, rewardDescription: e.target.value })
                  }
                  className="mt-1"
                  rows={2}
                />
              </div>

              <Button type="submit" disabled={posting} className="w-full">
                {posting ? 'Creating...' : 'Create Reward Tier'}
              </Button>
            </form>
          </CardContent>
        </Card>
      )}

      {tiers.length === 0 ? (
        <Card>
          <CardContent className="pt-8">
            <div className="text-center py-12">
              <Gift className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-50" />
              <p className="text-muted-foreground">
                {isCreator ? 'No reward tiers yet. Create one to engage supporters!' : 'No reward tiers available yet.'}
              </p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {tiers.map((tier, index) => {
            const unlocked = isUnlocked(tier.minLobbiesRequired)
            const progress = (userLobbyCount / tier.minLobbiesRequired) * 100

            return (
              <Card
                key={tier.id}
                className={cn(
                  'transition-all duration-300',
                  unlocked
                    ? 'border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-950'
                    : 'border-gray-200 dark:border-gray-800'
                )}
              >
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3">
                      <div
                        className={cn(
                          'rounded-lg p-2.5 mt-1',
                          unlocked
                            ? 'bg-amber-100 dark:bg-amber-900 text-amber-700 dark:text-amber-200'
                            : 'bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400'
                        )}
                      >
                        {unlocked ? (
                          <Unlock className="w-5 h-5" />
                        ) : (
                          <Lock className="w-5 h-5" />
                        )}
                      </div>
                      <div>
                        <CardTitle className="text-lg">{tier.name}</CardTitle>
                        <p className="text-sm text-muted-foreground mt-1">{tier.description}</p>
                      </div>
                    </div>
                    {unlocked && <Badge className="bg-amber-600">Unlocked</Badge>}
                  </div>
                </CardHeader>

                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between items-center text-sm">
                      <span className="font-medium">Progress</span>
                      <span className="text-muted-foreground">
                        {userLobbyCount} / {tier.minLobbiesRequired} lobbies
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 overflow-hidden">
                      <div
                        className={cn(
                          'h-full transition-all duration-500',
                          unlocked
                            ? 'bg-amber-500 dark:bg-amber-400'
                            : 'bg-blue-500 dark:bg-blue-400'
                        )}
                        style={{ width: `${Math.min(progress, 100)}%` }}
                      />
                    </div>
                  </div>

                  <div className="pt-2 border-t border-gray-200 dark:border-gray-700">
                    <p className="text-sm font-medium mb-2">Reward</p>
                    <p className="text-sm text-muted-foreground">{tier.rewardDescription}</p>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
