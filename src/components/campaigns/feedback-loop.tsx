'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'
import {
  ThumbsUp,
  ThumbsDown,
  MessageSquare,
  Filter,
  TrendingUp,
  Clock,
  Zap,
  CheckCircle,
  AlertCircle,
  Clock as ClockIcon,
  Play,
  Loader2,
} from 'lucide-react'

export interface FeedbackItem {
  id: string
  title: string
  description: string
  category: 'Bug' | 'Feature Request' | 'Improvement' | 'Question'
  status: 'Open' | 'Under Review' | 'Planned' | 'In Progress' | 'Done'
  votes: number
  userVote?: 1 | -1 | null
  createdAt: string
  createdBy: {
    id: string
    displayName: string
    avatar?: string
  }
  isCreator?: boolean
}

export interface FeedbackLoopProps {
  campaignId: string
  isCreator: boolean
  feedbackItems?: FeedbackItem[]
  onFeedbackSubmitted?: () => void
}

type SortOption = 'newest' | 'most-votes' | 'trending'
type CategoryFilter = 'All' | 'Bug' | 'Feature Request' | 'Improvement' | 'Question'

const STATUS_COLORS: Record<FeedbackItem['status'], string> = {
  'Open': 'bg-blue-100 text-blue-800',
  'Under Review': 'bg-purple-100 text-purple-800',
  'Planned': 'bg-indigo-100 text-indigo-800',
  'In Progress': 'bg-amber-100 text-amber-800',
  'Done': 'bg-green-100 text-green-800',
}

const STATUS_ICONS: Record<FeedbackItem['status'], React.ReactNode> = {
  'Open': <AlertCircle className="w-4 h-4" />,
  'Under Review': <ClockIcon className="w-4 h-4" />,
  'Planned': <TrendingUp className="w-4 h-4" />,
  'In Progress': <Play className="w-4 h-4" />,
  'Done': <CheckCircle className="w-4 h-4" />,
}

export const FeedbackLoop: React.FC<FeedbackLoopProps> = ({
  campaignId,
  isCreator,
  feedbackItems: initialFeedback = [],
  onFeedbackSubmitted,
}) => {
  const [feedbackItems, setFeedbackItems] = useState<FeedbackItem[]>(initialFeedback)
  const [isLoading, setIsLoading] = useState(false)
  const [sortBy, setSortBy] = useState<SortOption>('newest')
  const [categoryFilter, setCategoryFilter] = useState<CategoryFilter>('All')
  const [showForm, setShowForm] = useState(false)
  const [editingStatus, setEditingStatus] = useState<string | null>(null)
  const [newStatus, setNewStatus] = useState<FeedbackItem['status']>('Open')

  // Form state
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'Feature Request' as FeedbackItem['category'],
  })

  // Fetch feedback on mount
  useEffect(() => {
    fetchFeedback()
  }, [campaignId])

  const fetchFeedback = async () => {
    try {
      setIsLoading(true)
      const response = await fetch(`/api/campaigns/${campaignId}/feedback-loop`)
      if (response.ok) {
        const data = await response.json()
        setFeedbackItems(data.feedback || [])
      }
    } catch (error) {
      console.error('Failed to fetch feedback:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSubmitFeedback = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.title.trim() || !formData.description.trim()) {
      return
    }

    try {
      const response = await fetch(`/api/campaigns/${campaignId}/feedback-loop`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'submit_feedback',
          title: formData.title,
          description: formData.description,
          category: formData.category,
        }),
      })

      if (response.ok) {
        setFormData({ title: '', description: '', category: 'Feature Request' })
        setShowForm(false)
        fetchFeedback()
        onFeedbackSubmitted?.()
      }
    } catch (error) {
      console.error('Failed to submit feedback:', error)
    }
  }

  const handleVote = async (feedbackId: string, voteType: 1 | -1) => {
    try {
      const response = await fetch(`/api/campaigns/${campaignId}/feedback-loop`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'vote',
          feedbackId,
          voteType,
        }),
      })

      if (response.ok) {
        fetchFeedback()
      }
    } catch (error) {
      console.error('Failed to vote on feedback:', error)
    }
  }

  const handleStatusUpdate = async (feedbackId: string, newStatus: FeedbackItem['status']) => {
    try {
      const response = await fetch(`/api/campaigns/${campaignId}/feedback-loop`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'update_status',
          feedbackId,
          status: newStatus,
        }),
      })

      if (response.ok) {
        setEditingStatus(null)
        fetchFeedback()
      }
    } catch (error) {
      console.error('Failed to update status:', error)
    }
  }

  const filteredAndSorted = feedbackItems
    .filter(item => categoryFilter === 'All' || item.category === categoryFilter)
    .sort((a, b) => {
      if (sortBy === 'newest') {
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      } else if (sortBy === 'most-votes') {
        return b.votes - a.votes
      } else {
        // trending: combination of votes and recency
        const aScore = a.votes + Math.max(0, 7 - Math.floor((Date.now() - new Date(a.createdAt).getTime()) / (1000 * 60 * 60 * 24)))
        const bScore = b.votes + Math.max(0, 7 - Math.floor((Date.now() - new Date(b.createdAt).getTime()) / (1000 * 60 * 60 * 24)))
        return bScore - aScore
      }
    })

  const categories: CategoryFilter[] = ['All', 'Bug', 'Feature Request', 'Improvement', 'Question']

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Feedback Loop</h2>
          <p className="text-gray-600 mt-1">Collect and manage supporter feedback</p>
        </div>
        <Button
          onClick={() => setShowForm(!showForm)}
          className="bg-blue-600 hover:bg-blue-700"
        >
          <MessageSquare className="w-4 h-4 mr-2" />
          Share Feedback
        </Button>
      </div>

      {/* Submit Form */}
      {showForm && (
        <Card className="border-blue-200 bg-blue-50">
          <CardHeader>
            <CardTitle className="text-lg">Submit Feedback</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmitFeedback} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Title
                </label>
                <Input
                  placeholder="Brief summary of your feedback"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="border-gray-300"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  placeholder="Provide more details about your feedback"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 resize-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Category
                </label>
                <div className="flex gap-2">
                  {(['Bug', 'Feature Request', 'Improvement', 'Question'] as const).map(cat => (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => setFormData({ ...formData, category: cat })}
                      className={cn(
                        'px-3 py-2 rounded-md text-sm font-medium transition-colors',
                        formData.category === cat
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                      )}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex gap-2">
                <Button
                  type="submit"
                  className="bg-blue-600 hover:bg-blue-700"
                  disabled={!formData.title.trim() || !formData.description.trim()}
                >
                  Submit
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowForm(false)}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Filters and Sort */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 mb-4">
          <Filter className="w-4 h-4 text-gray-600" />
          <span className="text-sm font-medium text-gray-700">Category:</span>
          <div className="flex gap-2 flex-wrap">
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setCategoryFilter(cat)}
                className={cn(
                  'px-3 py-1 rounded-full text-sm font-medium transition-colors',
                  categoryFilter === cat
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                )}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-4">
          <span className="text-sm font-medium text-gray-700">Sort by:</span>
          <div className="flex gap-2">
            <button
              onClick={() => setSortBy('newest')}
              className={cn(
                'flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors',
                sortBy === 'newest'
                  ? 'bg-blue-100 text-blue-700'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              )}
            >
              <Clock className="w-4 h-4" />
              Newest
            </button>
            <button
              onClick={() => setSortBy('most-votes')}
              className={cn(
                'flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors',
                sortBy === 'most-votes'
                  ? 'bg-blue-100 text-blue-700'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              )}
            >
              <ThumbsUp className="w-4 h-4" />
              Most Votes
            </button>
            <button
              onClick={() => setSortBy('trending')}
              className={cn(
                'flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors',
                sortBy === 'trending'
                  ? 'bg-blue-100 text-blue-700'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              )}
            >
              <Zap className="w-4 h-4" />
              Trending
            </button>
          </div>
        </div>
      </div>

      {/* Feedback Items */}
      {isLoading ? (
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-5 h-5 text-gray-400 animate-spin" />
            </div>
          </CardContent>
        </Card>
      ) : filteredAndSorted.length === 0 ? (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-8 text-gray-500">
              <MessageSquare className="w-12 h-12 mx-auto mb-3 opacity-40" />
              <p>No feedback yet. Be the first to share!</p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {filteredAndSorted.map(item => (
            <Card key={item.id} className="border-gray-200 hover:border-gray-300 transition-colors">
              <CardContent className="pt-6">
                {/* Top Row: Title, Category, Status */}
                <div className="flex items-start justify-between gap-4 mb-3">
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900">{item.title}</h3>
                    <p className="text-sm text-gray-600 mt-1">{item.description}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="bg-gray-100">
                      {item.category}
                    </Badge>
                  </div>
                </div>

                {/* Status */}
                <div className="mb-3 flex items-center gap-2">
                  {editingStatus === item.id && isCreator ? (
                    <div className="flex gap-2 items-center">
                      <select
                        value={newStatus}
                        onChange={(e) => setNewStatus(e.target.value as FeedbackItem['status'])}
                        className="text-sm border border-gray-300 rounded px-2 py-1"
                      >
                        <option>Open</option>
                        <option>Under Review</option>
                        <option>Planned</option>
                        <option>In Progress</option>
                        <option>Done</option>
                      </select>
                      <Button
                        size="sm"
                        onClick={() => handleStatusUpdate(item.id, newStatus)}
                        className="h-8 px-2 text-xs bg-blue-600 hover:bg-blue-700"
                      >
                        Save
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setEditingStatus(null)}
                        className="h-8 px-2 text-xs"
                      >
                        Cancel
                      </Button>
                    </div>
                  ) : (
                    <button
                      onClick={() => {
                        if (isCreator) {
                          setEditingStatus(item.id)
                          setNewStatus(item.status)
                        }
                      }}
                      className={cn(
                        'flex items-center gap-1 px-2 py-1 rounded-md text-sm font-medium',
                        STATUS_COLORS[item.status],
                        isCreator && 'cursor-pointer hover:opacity-80'
                      )}
                    >
                      {STATUS_ICONS[item.status]}
                      {item.status}
                    </button>
                  )}
                </div>

                {/* Bottom Row: Creator, Voting */}
                <div className="flex items-center justify-between pt-3 border-t border-gray-200">
                  <div className="text-sm text-gray-500">
                    by <span className="font-medium text-gray-700">{item.createdBy.displayName}</span>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="text-sm text-gray-600">
                      {item.votes > 0 ? (
                        <span className="font-medium text-green-600">{item.votes} votes</span>
                      ) : item.votes < 0 ? (
                        <span className="font-medium text-red-600">{item.votes} votes</span>
                      ) : (
                        <span>No votes</span>
                      )}
                    </div>

                    <div className="flex gap-1">
                      <button
                        onClick={() => handleVote(item.id, 1)}
                        className={cn(
                          'p-1.5 rounded-md transition-colors',
                          item.userVote === 1
                            ? 'bg-green-100 text-green-600'
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        )}
                        title="Upvote"
                      >
                        <ThumbsUp className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleVote(item.id, -1)}
                        className={cn(
                          'p-1.5 rounded-md transition-colors',
                          item.userVote === -1
                            ? 'bg-red-100 text-red-600'
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        )}
                        title="Downvote"
                      >
                        <ThumbsDown className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Stats Footer */}
      {feedbackItems.length > 0 && (
        <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
          <CardContent className="pt-6">
            <div className="grid grid-cols-3 gap-4">
              <div>
                <div className="text-sm text-gray-600">Total Feedback</div>
                <div className="text-2xl font-bold text-gray-900">{feedbackItems.length}</div>
              </div>
              <div>
                <div className="text-sm text-gray-600">Total Votes</div>
                <div className="text-2xl font-bold text-gray-900">
                  {feedbackItems.reduce((sum, item) => sum + item.votes, 0)}
                </div>
              </div>
              <div>
                <div className="text-sm text-gray-600">Status Distribution</div>
                <div className="text-sm font-medium text-gray-900">
                  {['Open', 'Under Review', 'Planned', 'In Progress', 'Done'].map(status => {
                    const count = feedbackItems.filter(item => item.status === status).length
                    return count > 0 ? `${status}: ${count}` : null
                  }).filter(Boolean).join(' • ')}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

export default FeedbackLoop
