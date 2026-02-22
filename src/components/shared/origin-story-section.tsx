'use client'

import React, { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Spinner } from '@/components/ui/spinner'
import { cn } from '@/lib/utils'

interface OriginStorySectionProps {
  campaignId: string
  originStory?: string | null
  pitchSummary?: string | null
  inspiration?: string | null
  problemSolved?: string | null
  isCreator: boolean
}

export const OriginStorySection: React.FC<OriginStorySectionProps> = ({
  campaignId,
  originStory: initialOriginStory,
  pitchSummary: initialPitchSummary,
  inspiration: initialInspiration,
  problemSolved: initialProblemSolved,
  isCreator,
}) => {
  const [isEditing, setIsEditing] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const [originStory, setOriginStory] = useState(initialOriginStory || '')
  const [pitchSummary, setPitchSummary] = useState(initialPitchSummary || '')
  const [inspiration, setInspiration] = useState(initialInspiration || '')
  const [problemSolved, setProblemSolved] = useState(initialProblemSolved || '')

  const hasStory = !!(originStory || pitchSummary || inspiration || problemSolved)

  // Character limits
  const ORIGIN_STORY_LIMIT = 5000
  const PITCH_SUMMARY_LIMIT = 280
  const INSPIRATION_LIMIT = 2000
  const PROBLEM_SOLVED_LIMIT = 2000

  const handleSave = async () => {
    setIsSaving(true)
    setError(null)
    setSuccess(false)

    try {
      const response = await fetch(`/api/campaigns/${campaignId}/story`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          originStory: originStory || null,
          pitchSummary: pitchSummary || null,
          inspiration: inspiration || null,
          problemSolved: problemSolved || null,
        }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to save story')
      }

      setSuccess(true)
      setIsEditing(false)
      setTimeout(() => setSuccess(false), 3000)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setIsSaving(false)
    }
  }

  const handleCancel = () => {
    setOriginStory(initialOriginStory || '')
    setPitchSummary(initialPitchSummary || '')
    setInspiration(initialInspiration || '')
    setProblemSolved(initialProblemSolved || '')
    setIsEditing(false)
    setError(null)
  }

  if (!hasStory && !isCreator) {
    return null
  }

  return (
    <div className="space-y-6">
      {/* Display Mode */}
      {!isEditing && hasStory && (
        <div className="space-y-8 py-6 px-6 bg-gradient-to-br from-violet-50 to-purple-50 rounded-lg border border-violet-200">
          <div className="space-y-2">
            <h2 className="text-2xl font-bold text-slate-900">The Story</h2>
            <p className="text-slate-600">Why this product matters</p>
          </div>

          {pitchSummary && (
            <div className="space-y-2">
              <h3 className="text-sm font-semibold text-violet-700 uppercase tracking-wide">
                Elevator Pitch
              </h3>
              <p className="text-lg text-slate-900 italic leading-relaxed">
                "{pitchSummary}"
              </p>
            </div>
          )}

          {inspiration && (
            <div className="space-y-3 border-l-4 border-violet-400 pl-4">
              <h3 className="text-sm font-semibold text-violet-700 uppercase tracking-wide">
                The Inspiration
              </h3>
              <p className="text-slate-700 whitespace-pre-wrap leading-relaxed">
                {inspiration}
              </p>
            </div>
          )}

          {problemSolved && (
            <div className="space-y-3 border-l-4 border-violet-400 pl-4">
              <h3 className="text-sm font-semibold text-violet-700 uppercase tracking-wide">
                The Problem
              </h3>
              <p className="text-slate-700 whitespace-pre-wrap leading-relaxed">
                {problemSolved}
              </p>
            </div>
          )}

          {originStory && (
            <div className="space-y-3 border-l-4 border-violet-400 pl-4">
              <h3 className="text-sm font-semibold text-violet-700 uppercase tracking-wide">
                The Vision
              </h3>
              <p className="text-slate-700 whitespace-pre-wrap leading-relaxed">
                {originStory}
              </p>
            </div>
          )}

          {isCreator && (
            <Button
              onClick={() => setIsEditing(true)}
              variant="outline"
              size="sm"
              className="text-violet-600 border-violet-200 hover:bg-violet-100"
            >
              Edit Story
            </Button>
          )}
        </div>
      )}

      {/* Empty State - Creator Only */}
      {!isEditing && !hasStory && isCreator && (
        <div className="py-8 px-6 bg-violet-50 rounded-lg border border-dashed border-violet-300 text-center">
          <h3 className="text-lg font-semibold text-slate-900 mb-2">
            Tell Your Story
          </h3>
          <p className="text-slate-600 mb-4">
            Share why this product idea matters to you and inspire others to support it
          </p>
          <Button
            onClick={() => setIsEditing(true)}
            className="bg-violet-600 hover:bg-violet-700"
          >
            Add Your Story
          </Button>
        </div>
      )}

      {/* Edit Mode */}
      {isEditing && (
        <div className="space-y-6 p-6 bg-white rounded-lg border border-slate-200">
          <h3 className="text-lg font-semibold text-slate-900">Edit Story</h3>

          {error && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
              {error}
            </div>
          )}

          {/* Pitch Summary */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-slate-700">
              Elevator Pitch
              <span className="text-slate-500 font-normal ml-2">
                {pitchSummary.length}/{PITCH_SUMMARY_LIMIT}
              </span>
            </label>
            <Textarea
              value={pitchSummary}
              onChange={(e) => setPitchSummary(e.target.value.slice(0, PITCH_SUMMARY_LIMIT))}
              placeholder="A short, compelling one-liner (max 280 characters)"
              className="resize-none h-24"
            />
            <p className="text-xs text-slate-500">
              Maximum 280 characters. Keep it catchy!
            </p>
          </div>

          {/* Inspiration */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-slate-700">
              The Inspiration
              <span className="text-slate-500 font-normal ml-2">
                {inspiration.length}/{INSPIRATION_LIMIT}
              </span>
            </label>
            <Textarea
              value={inspiration}
              onChange={(e) => setInspiration(e.target.value.slice(0, INSPIRATION_LIMIT))}
              placeholder="What inspired you to think of this product?"
              className="resize-none h-32"
            />
            <p className="text-xs text-slate-500">
              Maximum 2000 characters
            </p>
          </div>

          {/* Problem Solved */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-slate-700">
              The Problem
              <span className="text-slate-500 font-normal ml-2">
                {problemSolved.length}/{PROBLEM_SOLVED_LIMIT}
              </span>
            </label>
            <Textarea
              value={problemSolved}
              onChange={(e) => setProblemSolved(e.target.value.slice(0, PROBLEM_SOLVED_LIMIT))}
              placeholder="What problem does this product solve?"
              className="resize-none h-32"
            />
            <p className="text-xs text-slate-500">
              Maximum 2000 characters
            </p>
          </div>

          {/* Origin Story */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-slate-700">
              The Vision
              <span className="text-slate-500 font-normal ml-2">
                {originStory.length}/{ORIGIN_STORY_LIMIT}
              </span>
            </label>
            <Textarea
              value={originStory}
              onChange={(e) => setOriginStory(e.target.value.slice(0, ORIGIN_STORY_LIMIT))}
              placeholder="Tell the full story behind this product. Why do you believe in it? What's your vision for how it will impact the world?"
              className="resize-none h-40"
            />
            <p className="text-xs text-slate-500">
              Maximum 5000 characters
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4 border-t border-slate-200">
            <Button
              onClick={handleSave}
              disabled={isSaving}
              className="bg-violet-600 hover:bg-violet-700"
            >
              {isSaving && <Spinner className="mr-2 h-4 w-4" />}
              {isSaving ? 'Saving...' : 'Save Story'}
            </Button>
            <Button
              onClick={handleCancel}
              variant="outline"
              disabled={isSaving}
            >
              Cancel
            </Button>
          </div>

          {success && (
            <div className="p-4 bg-green-50 border border-green-200 rounded-lg text-green-700 text-sm">
              Story saved successfully!
            </div>
          )}
        </div>
      )}
    </div>
  )
}
