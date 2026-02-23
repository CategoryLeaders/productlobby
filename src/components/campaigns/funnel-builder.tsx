'use client'

import React, { useState, useCallback } from 'react'
import { Plus, Trash2, Edit2, ArrowUp, ArrowDown, TrendingUp } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

export interface FunnelStage {
  id: string
  name: string
  count: number
  conversionRate?: number // percentage from previous stage
  dropOffPercentage?: number // percentage of people who dropped off
  order: number
}

export interface FunnelData {
  stages: FunnelStage[]
  overallConversionRate: number
  createdAt?: string
  updatedAt?: string
}

interface FunnelBuilderProps {
  campaignId: string
  initialData?: FunnelData
  onSave?: (data: FunnelData) => Promise<void>
  readOnly?: boolean
  className?: string
}

const DEFAULT_STAGES: FunnelStage[] = [
  { id: '1', name: 'Awareness', count: 1000, order: 0 },
  { id: '2', name: 'Interest', count: 750, order: 1 },
  { id: '3', name: 'Consideration', count: 500, order: 2 },
  { id: '4', name: 'Action', count: 250, order: 3 },
  { id: '5', name: 'Advocacy', count: 100, order: 4 },
]

// Color progression from blue to green
const STAGE_COLORS = [
  { bg: 'bg-blue-100', border: 'border-blue-400', text: 'text-blue-700', label: 'text-blue-600', gradient: 'from-blue-500' },
  { bg: 'bg-cyan-100', border: 'border-cyan-400', text: 'text-cyan-700', label: 'text-cyan-600', gradient: 'from-cyan-500' },
  { bg: 'bg-emerald-100', border: 'border-emerald-400', text: 'text-emerald-700', label: 'text-emerald-600', gradient: 'from-emerald-500' },
  { bg: 'bg-green-100', border: 'border-green-400', text: 'text-green-700', label: 'text-green-600', gradient: 'from-green-500' },
  { bg: 'bg-lime-100', border: 'border-lime-400', text: 'text-lime-700', label: 'text-lime-600', gradient: 'from-lime-500' },
]

function calculateConversionRate(stages: FunnelStage[]): number {
  if (stages.length === 0) return 0
  const firstCount = stages[0].count || 1
  const lastCount = stages[stages.length - 1].count
  return Math.round((lastCount / firstCount) * 100)
}

function calculateDropOff(current: FunnelStage, next?: FunnelStage): number {
  if (!next) return 0
  const dropOff = current.count - next.count
  return Math.round((dropOff / current.count) * 100)
}

export function FunnelBuilder({
  campaignId,
  initialData,
  onSave,
  readOnly = false,
  className,
}: FunnelBuilderProps) {
  const [stages, setStages] = useState<FunnelStage[]>(initialData?.stages || DEFAULT_STAGES)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editingName, setEditingName] = useState('')
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const overallConversionRate = calculateConversionRate(stages)

  const handleAddStage = useCallback(() => {
    const newStage: FunnelStage = {
      id: Math.random().toString(36).substr(2, 9),
      name: `Stage ${stages.length + 1}`,
      count: Math.max(0, (stages[stages.length - 1]?.count || 100) - 100),
      order: stages.length,
    }
    setStages([...stages, newStage])
    setError(null)
  }, [stages])

  const handleRemoveStage = useCallback((id: string) => {
    if (stages.length <= 1) {
      setError('Must have at least one stage')
      return
    }
    setStages(stages.filter((s) => s.id !== id).map((s, i) => ({ ...s, order: i })))
    setError(null)
  }, [stages])

  const handleRenameStagStart = useCallback((id: string, name: string) => {
    setEditingId(id)
    setEditingName(name)
  }, [])

  const handleRenameStageEnd = useCallback(() => {
    if (editingId && editingName.trim()) {
      setStages(
        stages.map((s) => (s.id === editingId ? { ...s, name: editingName.trim() } : s))
      )
    }
    setEditingId(null)
    setEditingName('')
  }, [editingId, editingName, stages])

  const handleUpdateCount = useCallback((id: string, count: number) => {
    const newCount = Math.max(0, count)
    setStages(stages.map((s) => (s.id === id ? { ...s, count: newCount } : s)))
    setError(null)
  }, [stages])

  const handleMoveStage = useCallback((id: string, direction: 'up' | 'down') => {
    const index = stages.findIndex((s) => s.id === id)
    if (direction === 'up' && index > 0) {
      const newStages = [...stages]
      ;[newStages[index - 1], newStages[index]] = [newStages[index], newStages[index - 1]]
      setStages(newStages.map((s, i) => ({ ...s, order: i })))
    } else if (direction === 'down' && index < stages.length - 1) {
      const newStages = [...stages]
      ;[newStages[index], newStages[index + 1]] = [newStages[index + 1], newStages[index]]
      setStages(newStages.map((s, i) => ({ ...s, order: i })))
    }
  }, [stages])

  const handleSave = async () => {
    if (!onSave) return

    setIsSaving(true)
    setError(null)

    try {
      const data: FunnelData = {
        stages,
        overallConversionRate,
      }

      await onSave(data)
      setSuccess(true)
      setTimeout(() => setSuccess(false), 3000)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save funnel')
    } finally {
      setIsSaving(false)
    }
  }

  // Calculate width percentages for trapezoid effect
  const getWidthPercentage = (index: number) => {
    const baseWidth = 100 - (index * 12)
    return Math.max(20, baseWidth)
  }

  const getMaxCount = stages.reduce((max, s) => Math.max(max, s.count), 1)

  return (
    <div className={cn('space-y-6', className)}>
      {/* Header */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-blue-600" />
            <h2 className="text-2xl font-bold text-gray-900">Conversion Funnel</h2>
          </div>
          {!readOnly && (
            <Button
              onClick={handleAddStage}
              variant="outline"
              size="sm"
              className="gap-2"
            >
              <Plus className="h-4 w-4" />
              Add Stage
            </Button>
          )}
        </div>

        {/* Overall Conversion Rate */}
        <div className="flex items-center gap-4 rounded-lg bg-gradient-to-r from-blue-50 to-green-50 p-4 border border-blue-200">
          <div>
            <p className="text-sm font-medium text-gray-600">Overall Conversion Rate</p>
            <p className="text-3xl font-bold text-green-600">{overallConversionRate}%</p>
          </div>
          <div className="ml-auto text-right">
            <p className="text-sm text-gray-600">
              {stages[0]?.count || 0} → {stages[stages.length - 1]?.count || 0}
            </p>
            <p className="text-xs text-gray-500">
              {stages.length} {stages.length === 1 ? 'stage' : 'stages'}
            </p>
          </div>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="rounded-lg bg-red-50 p-4 text-sm text-red-700 border border-red-200">
          {error}
        </div>
      )}

      {/* Success Message */}
      {success && (
        <div className="rounded-lg bg-green-50 p-4 text-sm text-green-700 border border-green-200">
          Funnel saved successfully
        </div>
      )}

      {/* Funnel Visualization */}
      <div className="space-y-6">
        {stages.map((stage, index) => {
          const color = STAGE_COLORS[index % STAGE_COLORS.length]
          const nextStage = stages[index + 1]
          const widthPercent = getWidthPercentage(index)
          const conversionRate = nextStage
            ? Math.round((nextStage.count / stage.count) * 100)
            : 100
          const dropOff = calculateDropOff(stage, nextStage)
          const isEditing = editingId === stage.id

          return (
            <div key={stage.id} className="space-y-3">
              {/* Stage Visualization */}
              <div className="flex flex-col items-center">
                {/* Trapezoid Shape */}
                <div
                  className="relative overflow-hidden rounded-lg border-2 transition-all"
                  style={{
                    width: `${widthPercent}%`,
                    backgroundImage: `linear-gradient(135deg, var(--tw-gradient-from), var(--tw-gradient-to))`,
                    borderColor: 'var(--tw-border-opacity)',
                  }}
                >
                  <div
                    className={cn(
                      'px-4 py-4 text-center space-y-2',
                      color.bg,
                      color.border,
                      'border-2'
                    )}
                  >
                    {/* Stage Name */}
                    {isEditing ? (
                      <input
                        autoFocus
                        type="text"
                        value={editingName}
                        onChange={(e) => setEditingName(e.target.value)}
                        onBlur={handleRenameStageEnd}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            handleRenameStageEnd()
                          }
                        }}
                        className={cn(
                          'w-full rounded px-2 py-1 text-center font-semibold text-sm border',
                          color.text
                        )}
                      />
                    ) : (
                      <h3 className={cn('font-semibold text-sm', color.text)}>
                        {stage.name}
                      </h3>
                    )}

                    {/* Stage Count */}
                    <div className="space-y-1">
                      <input
                        type="number"
                        min="0"
                        value={stage.count}
                        onChange={(e) => handleUpdateCount(stage.id, parseInt(e.target.value) || 0)}
                        disabled={readOnly}
                        className="w-full rounded px-2 py-1 text-center font-bold text-lg text-gray-900 bg-white border border-gray-300 disabled:bg-gray-100 disabled:cursor-not-allowed"
                      />
                      <p className="text-xs text-gray-600">
                        {Math.round((stage.count / getMaxCount) * 100)}% of initial
                      </p>
                    </div>

                    {/* Conversion Metrics */}
                    {nextStage && (
                      <div className="border-t border-gray-300 pt-2 flex gap-2 justify-center text-xs">
                        <div>
                          <span className="font-semibold text-green-600">{conversionRate}%</span>
                          <p className="text-gray-600">→ next</p>
                        </div>
                        <div>
                          <span className="font-semibold text-red-600">{dropOff}%</span>
                          <p className="text-gray-600">drop-off</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Stage Controls */}
                {!readOnly && (
                  <div className="mt-3 flex gap-2 items-center">
                    {index > 0 && (
                      <Button
                        onClick={() => handleMoveStage(stage.id, 'up')}
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0"
                        title="Move up"
                      >
                        <ArrowUp className="h-4 w-4" />
                      </Button>
                    )}
                    {index < stages.length - 1 && (
                      <Button
                        onClick={() => handleMoveStage(stage.id, 'down')}
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0"
                        title="Move down"
                      >
                        <ArrowDown className="h-4 w-4" />
                      </Button>
                    )}
                    <Button
                      onClick={() => handleRenameStagStart(stage.id, stage.name)}
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0"
                      title="Rename"
                    >
                      <Edit2 className="h-4 w-4" />
                    </Button>
                    {stages.length > 1 && (
                      <Button
                        onClick={() => handleRemoveStage(stage.id)}
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                        title="Remove"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                )}

                {/* Connector */}
                {nextStage && (
                  <div className="my-2 h-8 w-0.5 bg-gradient-to-b from-blue-300 to-green-300" />
                )}
              </div>

              {/* Analytics Row */}
              {nextStage && (
                <div className="rounded-lg bg-gray-50 p-3 grid grid-cols-3 gap-4 text-center border border-gray-200">
                  <div>
                    <p className="text-xs font-medium text-gray-600">Conversion</p>
                    <p className="text-lg font-bold text-green-600">{conversionRate}%</p>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-gray-600">Drop-off</p>
                    <p className="text-lg font-bold text-red-600">{dropOff}%</p>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-gray-600">Users Lost</p>
                    <p className="text-lg font-bold text-orange-600">{stage.count - nextStage.count}</p>
                  </div>
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* Summary Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="rounded-lg bg-blue-50 p-4 border border-blue-200">
          <p className="text-xs font-medium text-blue-600 uppercase tracking-wide">Entry Point</p>
          <p className="text-2xl font-bold text-blue-900">{stages[0]?.count || 0}</p>
          <p className="text-xs text-blue-700 mt-1">{stages[0]?.name || 'Initial Stage'}</p>
        </div>
        <div className="rounded-lg bg-purple-50 p-4 border border-purple-200">
          <p className="text-xs font-medium text-purple-600 uppercase tracking-wide">Exit Point</p>
          <p className="text-2xl font-bold text-purple-900">{stages[stages.length - 1]?.count || 0}</p>
          <p className="text-xs text-purple-700 mt-1">{stages[stages.length - 1]?.name || 'Final Stage'}</p>
        </div>
        <div className="rounded-lg bg-green-50 p-4 border border-green-200">
          <p className="text-xs font-medium text-green-600 uppercase tracking-wide">Conversion</p>
          <p className="text-2xl font-bold text-green-900">{overallConversionRate}%</p>
          <p className="text-xs text-green-700 mt-1">Overall Rate</p>
        </div>
      </div>

      {/* Save Button */}
      {!readOnly && onSave && (
        <div className="flex gap-3 justify-end">
          <Button
            onClick={handleSave}
            disabled={isSaving}
            className="gap-2 bg-gradient-to-r from-blue-600 to-green-600 hover:from-blue-700 hover:to-green-700"
          >
            {isSaving ? (
              <>
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                Saving...
              </>
            ) : (
              'Save Funnel'
            )}
          </Button>
        </div>
      )}
    </div>
  )
}
