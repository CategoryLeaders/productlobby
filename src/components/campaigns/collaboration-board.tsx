'use client'

import React, { useState, useEffect } from 'react'
import { Loader2, Users, MessageSquare, Plus, Clock, CheckCircle, Star } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface CollabTask {
  id: string
  title: string
  description: string
  assignee?: string
  status: 'todo' | 'in_progress' | 'review' | 'done'
  priority: 'low' | 'medium' | 'high'
  createdAt: string
}

interface CollaborationBoardProps {
  campaignId: string
}

export default function CollaborationBoard({ campaignId }: CollaborationBoardProps) {
  const [tasks, setTasks] = useState<CollabTask[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showAddForm, setShowAddForm] = useState(false)
  const [newTitle, setNewTitle] = useState('')
  const [newDescription, setNewDescription] = useState('')
  const [newPriority, setNewPriority] = useState<'low' | 'medium' | 'high'>('medium')
  const [filter, setFilter] = useState<'all' | 'todo' | 'in_progress' | 'review' | 'done'>('all')
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    fetchTasks()
  }, [campaignId])

  const fetchTasks = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/campaigns/${campaignId}/collaboration`)
      if (!response.ok) throw new Error('Failed to fetch tasks')
      const data = await response.json()
      setTasks(data.tasks || [])
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  const addTask = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newTitle.trim()) return

    try {
      setIsSubmitting(true)
      const response = await fetch(`/api/campaigns/${campaignId}/collaboration`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: newTitle,
          description: newDescription,
          priority: newPriority,
        }),
      })

      if (!response.ok) throw new Error('Failed to create task')
      const data = await response.json()
      setTasks([...tasks, data.task])
      setNewTitle('')
      setNewDescription('')
      setNewPriority('medium')
      setShowAddForm(false)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create task')
    } finally {
      setIsSubmitting(false)
    }
  }

  const updateStatus = async (taskId: string, newStatus: CollabTask['status']) => {
    try {
      const response = await fetch(`/api/campaigns/${campaignId}/collaboration`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ taskId, status: newStatus }),
      })

      if (!response.ok) throw new Error('Failed to update task')
      setTasks(tasks.map(t => t.id === taskId ? { ...t, status: newStatus } : t))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update task')
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'bg-red-100 text-red-800 border-red-300'
      case 'medium':
        return 'bg-amber-100 text-amber-800 border-amber-300'
      case 'low':
        return 'bg-lime-100 text-lime-800 border-lime-300'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'done':
        return <CheckCircle className="w-4 h-4 text-lime-600" />
      case 'review':
        return <MessageSquare className="w-4 h-4 text-violet-600" />
      case 'in_progress':
        return <Clock className="w-4 h-4 text-amber-600" />
      default:
        return <Plus className="w-4 h-4 text-gray-600" />
    }
  }

  const filteredTasks = (status: string) => {
    return tasks.filter(t => t.status === status)
  }

  const statusLabels = {
    todo: 'To Do',
    in_progress: 'In Progress',
    review: 'Review',
    done: 'Done',
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-violet-600" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Users className="w-6 h-6 text-violet-600" />
          <h2 className="text-2xl font-bold text-gray-900">Collaboration Board</h2>
        </div>
        <Button
          onClick={() => setShowAddForm(!showAddForm)}
          className="bg-violet-600 hover:bg-violet-700 text-white"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Task
        </Button>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {/* Add Task Form */}
      {showAddForm && (
        <form onSubmit={addTask} className="bg-gray-50 border border-gray-200 p-4 rounded-lg space-y-4">
          <input
            type="text"
            placeholder="Task title"
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500"
          />
          <textarea
            placeholder="Description (optional)"
            value={newDescription}
            onChange={(e) => setNewDescription(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500"
            rows={3}
          />
          <div className="flex gap-3">
            <select
              value={newPriority}
              onChange={(e) => setNewPriority(e.target.value as any)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500"
            >
              <option value="low">Low Priority</option>
              <option value="medium">Medium Priority</option>
              <option value="high">High Priority</option>
            </select>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="bg-violet-600 hover:bg-violet-700 text-white"
            >
              {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Create'}
            </Button>
            <Button
              type="button"
              onClick={() => setShowAddForm(false)}
              variant="outline"
            >
              Cancel
            </Button>
          </div>
        </form>
      )}

      {/* Kanban Board */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {Object.entries(statusLabels).map(([status, label]) => (
          <div key={status} className="bg-gray-50 rounded-lg p-4 border border-gray-200">
            <div className="flex items-center gap-2 mb-4">
              {getStatusIcon(status)}
              <h3 className="font-semibold text-gray-900">{label}</h3>
              <span className="ml-auto bg-gray-200 text-gray-700 text-xs font-medium px-2 py-1 rounded">
                {filteredTasks(status).length}
              </span>
            </div>

            <div className="space-y-3">
              {filteredTasks(status).map(task => (
                <div
                  key={task.id}
                  className="bg-white border border-gray-200 rounded-lg p-3 cursor-move hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <h4 className="font-medium text-gray-900 text-sm">{task.title}</h4>
                    <Star className={cn(
                      'w-4 h-4 flex-shrink-0',
                      task.priority === 'high' ? 'text-red-500 fill-red-500' :
                      task.priority === 'medium' ? 'text-amber-500 fill-amber-500' :
                      'text-lime-500 fill-lime-500'
                    )} />
                  </div>

                  {task.description && (
                    <p className="text-xs text-gray-600 mb-2 line-clamp-2">{task.description}</p>
                  )}

                  <div className="flex items-center gap-2 mb-3">
                    <span className={cn('text-xs font-medium px-2 py-1 rounded border', getPriorityColor(task.priority))}>
                      {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}
                    </span>
                  </div>

                  {task.assignee && (
                    <div className="flex items-center gap-2 mb-3 text-xs text-gray-600">
                      <Users className="w-3 h-3" />
                      {task.assignee}
                    </div>
                  )}

                  {status !== 'done' && (
                    <div className="flex gap-2">
                      {status === 'todo' && (
                        <Button
                          size="sm"
                          variant="outline"
                          className="text-xs flex-1"
                          onClick={() => updateStatus(task.id, 'in_progress')}
                        >
                          Start
                        </Button>
                      )}
                      {status === 'in_progress' && (
                        <Button
                          size="sm"
                          variant="outline"
                          className="text-xs flex-1"
                          onClick={() => updateStatus(task.id, 'review')}
                        >
                          Review
                        </Button>
                      )}
                      {status === 'review' && (
                        <Button
                          size="sm"
                          variant="outline"
                          className="text-xs flex-1"
                          onClick={() => updateStatus(task.id, 'done')}
                        >
                          Done
                        </Button>
                      )}
                    </div>
                  )}
                </div>
              ))}

              {filteredTasks(status).length === 0 && (
                <div className="text-center py-8 text-gray-400">
                  <MessageSquare className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <p className="text-xs">No tasks yet</p>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
