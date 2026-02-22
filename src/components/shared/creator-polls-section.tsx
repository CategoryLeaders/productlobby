'use client'

import { useEffect, useState } from 'react'
import { CreatorPollCard } from './creator-poll-card'
import { CreatorPollCreate } from './creator-poll-create'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { PlusCircle, Loader2 } from 'lucide-react'

interface CreatorPollsData {
  polls: Array<{
    id: string
    campaignId: string
    creatorId: string
    question: string
    description?: string | null
    pollType: 'SINGLE_SELECT' | 'MULTI_SELECT' | 'RANKED'
    maxSelections: number
    status: 'ACTIVE' | 'CLOSED' | 'DRAFT'
    closesAt?: string | null
    totalVotes: number
    createdAt: string
    updatedAt: string
    options: Array<{
      id: string
      text: string
      voteCount: number
      percentage: number
    }>
    userVotes: Array<{ optionId: string; rank?: number | null }>
    isCreator: boolean
  }>
}

interface CreatorPollsSectionProps {
  campaignId: string
  isCreator: boolean
  isLoggedIn: boolean
}

export function CreatorPollsSection({
  campaignId,
  isCreator,
  isLoggedIn,
}: CreatorPollsSectionProps) {
  const [polls, setPolls] = useState<CreatorPollsData['polls']>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [isVoting, setIsVoting] = useState<string | null>(null)

  useEffect(() => {
    fetchPolls()
  }, [campaignId])

  const fetchPolls = async () => {
    setIsLoading(true)
    setError(null)
    try {
      const response = await fetch(`/api/campaigns/${campaignId}/creator-polls`)
      if (!response.ok) throw new Error('Failed to fetch polls')
      const data = await response.json()
      setPolls(data.polls)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch polls')
    } finally {
      setIsLoading(false)
    }
  }

  const handleVote = async (pollId: string, optionIds: string[], ranks?: number[]) => {
    setIsVoting(pollId)
    try {
      const response = await fetch(
        `/api/campaigns/${campaignId}/creator-polls/${pollId}/vote`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ optionIds, ranks }),
        }
      )

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to submit vote')
      }

      // Refresh polls to get updated counts
      await fetchPolls()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to submit vote')
    } finally {
      setIsVoting(null)
    }
  }

  const handleClosePoll = async (pollId: string) => {
    try {
      const response = await fetch(
        `/api/campaigns/${campaignId}/creator-polls/${pollId}`,
        {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ status: 'CLOSED' }),
        }
      )

      if (!response.ok) throw new Error('Failed to close poll')
      await fetchPolls()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to close poll')
    }
  }

  const handleDeletePoll = async (pollId: string) => {
    if (!confirm('Are you sure you want to delete this poll?')) return

    try {
      const response = await fetch(
        `/api/campaigns/${campaignId}/creator-polls/${pollId}`,
        {
          method: 'DELETE',
        }
      )

      if (!response.ok) throw new Error('Failed to delete poll')
      await fetchPolls()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete poll')
    }
  }

  const activePolls = polls.filter((p) => p.status === 'ACTIVE')
  const closedPolls = polls.filter((p) => p.status === 'CLOSED' || p.status === 'DRAFT')

  if (isLoading) {
    return (
      <div className="w-full flex justify-center py-8">
        <Loader2 className="animate-spin text-violet-600" size={32} />
      </div>
    )
  }

  if (error) {
    return (
      <Card className="p-6 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
        <p className="text-red-700 dark:text-red-400">{error}</p>
      </Card>
    )
  }

  if (polls.length === 0 && !showCreateForm) {
    return (
      <div className="w-full">
        {isCreator && (
          <div className="text-center py-12">
            <h3 className="text-lg font-semibold mb-2 text-slate-900 dark:text-white">
              No polls yet
            </h3>
            <p className="text-slate-600 dark:text-slate-400 mb-6">
              Create your first poll to gather supporter preferences!
            </p>
            <Button
              onClick={() => setShowCreateForm(true)}
              className="bg-violet-600 hover:bg-violet-700 text-white"
            >
              <PlusCircle className="mr-2 h-4 w-4" />
              Create Your First Poll
            </Button>
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="w-full space-y-6" id="polls">
      {showCreateForm ? (
        <CreatorPollCreate
          campaignId={campaignId}
          onSuccess={() => {
            setShowCreateForm(false)
            fetchPolls()
          }}
          onCancel={() => setShowCreateForm(false)}
        />
      ) : isCreator ? (
        <div className="flex justify-end">
          <Button
            onClick={() => setShowCreateForm(true)}
            className="bg-violet-600 hover:bg-violet-700 text-white"
          >
            <PlusCircle className="mr-2 h-4 w-4" />
            Create Poll
          </Button>
        </div>
      ) : null}

      {polls.length > 0 && (
        <Tabs defaultValue="active" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="active">
              Active Polls ({activePolls.length})
            </TabsTrigger>
            <TabsTrigger value="closed">
              Closed Polls ({closedPolls.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="active" className="space-y-4 mt-4">
            {activePolls.length === 0 ? (
              <Card className="p-6 text-center text-slate-500 dark:text-slate-400">
                No active polls
              </Card>
            ) : (
              activePolls.map((poll) => (
                <CreatorPollCard
                  key={poll.id}
                  poll={poll}
                  onVote={
                    isLoggedIn
                      ? (optionIds, ranks) => handleVote(poll.id, optionIds, ranks)
                      : undefined
                  }
                  onClose={() => handleClosePoll(poll.id)}
                  onDelete={() => handleDeletePoll(poll.id)}
                />
              ))
            )}
          </TabsContent>

          <TabsContent value="closed" className="space-y-4 mt-4">
            {closedPolls.length === 0 ? (
              <Card className="p-6 text-center text-slate-500 dark:text-slate-400">
                No closed polls
              </Card>
            ) : (
              closedPolls.map((poll) => (
                <CreatorPollCard
                  key={poll.id}
                  poll={poll}
                  onDelete={() => handleDeletePoll(poll.id)}
                />
              ))
            )}
          </TabsContent>
        </Tabs>
      )}
    </div>
  )
}
