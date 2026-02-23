'use client'

import React, { useState, useEffect } from 'react'
import { Calendar, Globe, Lock, Trash2, Loader2, Send } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { cn, formatDate, formatRelativeTime } from '@/lib/utils'

interface Note {
  id: string
  content: string
  isPublic: boolean
  createdAt: string
}

interface CreatorJournalProps {
  campaignId: string
  isCreator: boolean
}

export function CreatorJournal({ campaignId, isCreator }: CreatorJournalProps) {
  const [notes, setNotes] = useState<Note[]>([])
  const [loading, setLoading] = useState(true)
  const [newNote, setNewNote] = useState('')
  const [isPublic, setIsPublic] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null)

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
      const response = await fetch(`/api/campaigns/${campaignId}/notes`)
      if (response.ok) {
        const data = await response.json()
        setNotes(data.notes || [])
      } else if (response.status === 403) {
        // User is not the creator
        setNotes([])
      }
    } catch (error) {
      console.error('Error loading notes:', error)
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
      const response = await fetch(`/api/campaigns/${campaignId}/notes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: newNote.trim(),
          isPublic,
        }),
      })

      if (response.ok) {
        const note = await response.json()
        setNotes((prev) => [note, ...prev])
        setNewNote('')
        setIsPublic(false)
      } else if (response.status === 403) {
        alert('You are not the creator of this campaign')
      }
    } catch (error) {
      console.error('Error adding note:', error)
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
      }
    } catch (error) {
      console.error('Error deleting note:', error)
    }
  }

  const groupedNotes = notes.reduce(
    (acc, note) => {
      const date = formatDate(note.createdAt)
      if (!acc[date]) {
        acc[date] = []
      }
      acc[date].push(note)
      return acc
    },
    {} as Record<string, Note[]>
  )

  if (!isCreator) {
    return null
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Creator Journal</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-40 bg-gray-200 rounded animate-pulse" />
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="border-violet-200 bg-gradient-to-br from-violet-50 to-white">
      <CardHeader>
        <CardTitle className="text-violet-900">Creator Journal</CardTitle>
        <p className="text-sm text-gray-600 mt-1">
          Keep a private log of your campaign progress and updates
        </p>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Add Note Form */}
        <form onSubmit={handleAddNote} className="space-y-3 bg-white p-4 rounded-lg border border-violet-200">
          <textarea
            value={newNote}
            onChange={(e) => setNewNote(e.target.value)}
            placeholder="Write a note about your campaign progress, next steps, or any important updates..."
            maxLength={5000}
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-violet-500 focus:border-violet-500 resize-none"
          />

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <label className="flex items-center gap-2 text-sm cursor-pointer">
                <input
                  type="checkbox"
                  checked={isPublic}
                  onChange={(e) => setIsPublic(e.target.checked)}
                  className="rounded"
                />
                <span className="text-gray-700">
                  {isPublic ? (
                    <>
                      <Globe className="w-3.5 h-3.5 inline mr-1" />
                      Make Public
                    </>
                  ) : (
                    <>
                      <Lock className="w-3.5 h-3.5 inline mr-1" />
                      Keep Private
                    </>
                  )}
                </span>
              </label>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-500">
                {newNote.length}/5000
              </span>
              <Button
                type="submit"
                disabled={submitting || !newNote.trim()}
                size="sm"
                className="gap-2"
              >
                {submitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Adding...
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    Add Note
                  </>
                )}
              </Button>
            </div>
          </div>
        </form>

        {/* Notes Timeline */}
        {notes.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <Calendar className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">No notes yet. Start tracking your progress!</p>
          </div>
        ) : (
          <div className="space-y-4">
            {Object.entries(groupedNotes).map(([date, dateNotes]) => (
              <div key={date}>
                <h3 className="text-sm font-semibold text-gray-600 mb-3 flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  {date}
                </h3>

                <div className="space-y-2 ml-6 border-l border-violet-200 pl-4">
                  {dateNotes.map((note) => (
                    <div
                      key={note.id}
                      className="relative bg-white border border-gray-200 rounded-lg p-3 group hover:shadow-md transition-shadow"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <p className="text-sm text-gray-700 flex-1">
                          {note.content}
                        </p>
                        {deleteConfirm === note.id ? (
                          <div className="flex gap-1">
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => handleDeleteNote(note.id)}
                              className="h-7 text-xs"
                            >
                              Confirm
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => setDeleteConfirm(null)}
                              className="h-7 text-xs"
                            >
                              Cancel
                            </Button>
                          </div>
                        ) : (
                          <button
                            onClick={() => setDeleteConfirm(note.id)}
                            className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-red-50 rounded"
                            title="Delete note"
                          >
                            <Trash2 className="w-4 h-4 text-red-600" />
                          </button>
                        )}
                      </div>

                      <div className="flex items-center justify-between mt-2">
                        <span className="text-xs text-gray-500">
                          {formatRelativeTime(note.createdAt)}
                        </span>
                        <span
                          className={cn(
                            'text-xs font-medium flex items-center gap-1',
                            note.isPublic
                              ? 'text-green-600'
                              : 'text-gray-600'
                          )}
                        >
                          {note.isPublic ? (
                            <>
                              <Globe className="w-3 h-3" />
                              Public
                            </>
                          ) : (
                            <>
                              <Lock className="w-3 h-3" />
                              Private
                            </>
                          )}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
