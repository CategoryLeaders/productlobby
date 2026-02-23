'use client'

import React, { useState, useEffect } from 'react'
import { StickyNote, Plus, Trash2, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { cn, formatRelativeTime } from '@/lib/utils'

interface Note {
  id: string
  content: string
  createdAt: string
}

interface CreatorNotesProps {
  campaignId: string
  isCreator: boolean
}

export function CreatorNotes({ campaignId, isCreator }: CreatorNotesProps) {
  const [notes, setNotes] = useState<Note[]>([])
  const [loading, setLoading] = useState(true)
  const [newNote, setNewNote] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (isCreator) {
      loadNotes()
    } else {
      setLoading(false)
    }
  }, [campaignId, isCreator])

  const loadNotes = async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await fetch(`/api/campaigns/${campaignId}/notes`)
      if (response.ok) {
        const data = await response.json()
        setNotes(data.notes || [])
      } else if (response.status === 403) {
        // User is not the creator
        setNotes([])
      } else {
        setError('Failed to load notes')
      }
    } catch (error) {
      console.error('Error loading notes:', error)
      setError('Failed to load notes')
    } finally {
      setLoading(false)
    }
  }

  const handleAddNote = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!newNote.trim()) {
      return
    }

    try {
      setSubmitting(true)
      setError(null)
      const response = await fetch(`/api/campaigns/${campaignId}/notes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: newNote.trim(),
        }),
      })

      if (response.ok) {
        const note = await response.json()
        setNotes((prev) => [note, ...prev])
        setNewNote('')
      } else if (response.status === 403) {
        setError('You are not the creator of this campaign')
      } else {
        setError('Failed to add note')
      }
    } catch (error) {
      console.error('Error adding note:', error)
      setError('Failed to add note')
    } finally {
      setSubmitting(false)
    }
  }

  const handleDeleteNote = async (noteId: string) => {
    try {
      const response = await fetch(
        `/api/campaigns/${campaignId}/notes/${noteId}`,
        {
          method: 'DELETE',
        }
      )

      if (response.ok) {
        setNotes((prev) => prev.filter((n) => n.id !== noteId))
        setDeleteConfirm(null)
      } else {
        setError('Failed to delete note')
      }
    } catch (error) {
      console.error('Error deleting note:', error)
      setError('Failed to delete note')
    }
  }

  if (!isCreator) {
    return null
  }

  if (loading) {
    return (
      <div className="border rounded-lg p-6 bg-white">
        <div className="space-y-4">
          <div className="h-6 bg-gray-200 rounded w-32 animate-pulse" />
          <div className="h-20 bg-gray-200 rounded animate-pulse" />
        </div>
      </div>
    )
  }

  return (
    <div className="border rounded-lg bg-white overflow-hidden">
      {/* Header */}
      <div className="border-b bg-gradient-to-r from-amber-50 to-orange-50 p-4">
        <div className="flex items-center gap-2">
          <StickyNote className="w-5 h-5 text-amber-600" />
          <h3 className="font-semibold text-gray-900">Campaign Notes</h3>
        </div>
        <p className="text-sm text-gray-600 mt-1">
          Private notes for campaign creators (not visible to supporters)
        </p>
      </div>

      {/* Content */}
      <div className="p-4 space-y-4">
        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded p-3">
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}

        {/* Add Note Form */}
        <form onSubmit={handleAddNote} className="space-y-3">
          <Textarea
            value={newNote}
            onChange={(e) => setNewNote(e.target.value)}
            placeholder="Add a private note about your campaign..."
            className="resize-none focus:ring-2 focus:ring-amber-500"
            rows={3}
            maxLength={5000}
          />
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-500">
              {newNote.length}/5000
            </span>
            <Button
              type="submit"
              disabled={!newNote.trim() || submitting}
              size="sm"
              className="gap-2 bg-amber-600 hover:bg-amber-700"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Adding...
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4" />
                  Add Note
                </>
              )}
            </Button>
          </div>
        </form>

        {/* Notes List */}
        <div className="space-y-2">
          {notes.length === 0 ? (
            <div className="text-center py-8">
              <StickyNote className="w-10 h-10 text-gray-300 mx-auto mb-2" />
              <p className="text-sm text-gray-500">No notes yet. Add your first note above.</p>
            </div>
          ) : (
            notes.map((note) => (
              <div
                key={note.id}
                className={cn(
                  'bg-amber-50 border border-amber-200 rounded p-3 hover:border-amber-300 transition',
                  deleteConfirm === note.id && 'bg-red-50 border-red-200'
                )}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-800 whitespace-pre-wrap break-words">
                      {note.content}
                    </p>
                    <p className="text-xs text-gray-500 mt-2">
                      {formatRelativeTime(note.createdAt)}
                    </p>
                  </div>
                  <div className="flex gap-1 flex-shrink-0">
                    {deleteConfirm === note.id ? (
                      <>
                        <Button
                          type="button"
                          size="sm"
                          variant="ghost"
                          className="text-xs h-8 px-2"
                          onClick={() => handleDeleteNote(note.id)}
                        >
                          Confirm
                        </Button>
                        <Button
                          type="button"
                          size="sm"
                          variant="ghost"
                          className="text-xs h-8 px-2"
                          onClick={() => setDeleteConfirm(null)}
                        >
                          Cancel
                        </Button>
                      </>
                    ) : (
                      <Button
                        type="button"
                        size="sm"
                        variant="ghost"
                        className="text-red-600 hover:text-red-700 hover:bg-red-50 h-8 w-8 p-0"
                        onClick={() => setDeleteConfirm(note.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
