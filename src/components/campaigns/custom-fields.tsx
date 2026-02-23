'use client'

import React, { useState, useEffect } from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Settings, Plus, Trash2, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'

interface CustomField {
  id: string
  name: string
  value: string
  createdAt: string
}

interface CustomFieldsProps {
  campaignId: string
  isCreator: boolean
  className?: string
}

export function CustomFields({
  campaignId,
  isCreator,
  className,
}: CustomFieldsProps) {
  const [fields, setFields] = useState<CustomField[]>([])
  const [fieldName, setFieldName] = useState('')
  const [fieldValue, setFieldValue] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [isAdding, setIsAdding] = useState(false)
  const [deleting, setDeleting] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  // Load custom fields on mount
  useEffect(() => {
    const loadFields = async () => {
      try {
        setIsLoading(true)
        const response = await fetch(
          `/api/campaigns/${campaignId}/custom-fields`
        )

        if (response.ok) {
          const data = await response.json()
          setFields(data.fields || [])
        } else if (response.status !== 404) {
          console.error('Error loading custom fields')
        }
      } catch (err) {
        console.error('Error loading custom fields:', err)
      } finally {
        setIsLoading(false)
      }
    }

    loadFields()
  }, [campaignId])

  const handleAddField = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    // Validation
    if (!fieldName.trim()) {
      setError('Field name is required')
      return
    }

    if (!fieldValue.trim()) {
      setError('Field value is required')
      return
    }

    if (fieldName.length > 100) {
      setError('Field name must be 100 characters or less')
      return
    }

    if (fieldValue.length > 500) {
      setError('Field value must be 500 characters or less')
      return
    }

    if (fields.length >= 20) {
      setError('Maximum 20 custom fields allowed')
      return
    }

    try {
      setIsAdding(true)

      const response = await fetch(
        `/api/campaigns/${campaignId}/custom-fields`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: fieldName.trim(),
            value: fieldValue.trim(),
          }),
        }
      )

      if (response.status === 401) {
        window.location.href = '/login'
        return
      }

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to add custom field')
      }

      const data = await response.json()
      setFields([...fields, data.field])
      setFieldName('')
      setFieldValue('')
      setSuccess(true)

      // Reset success message after 2 seconds
      setTimeout(() => {
        setSuccess(false)
      }, 2000)
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Failed to add custom field'
      setError(message)
    } finally {
      setIsAdding(false)
    }
  }

  const handleDeleteField = async (fieldId: string) => {
    if (!confirm('Are you sure you want to delete this field?')) {
      return
    }

    try {
      setDeleting(fieldId)
      setError(null)

      const response = await fetch(
        `/api/campaigns/${campaignId}/custom-fields`,
        {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ fieldId }),
        }
      )

      if (response.status === 401) {
        window.location.href = '/login'
        return
      }

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to delete custom field')
      }

      setFields(fields.filter((f) => f.id !== fieldId))
      setSuccess(true)

      // Reset success message after 2 seconds
      setTimeout(() => {
        setSuccess(false)
      }, 2000)
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Failed to delete custom field'
      setError(message)
    } finally {
      setDeleting(null)
    }
  }

  if (isLoading) {
    return (
      <div className={cn('flex items-center justify-center p-8', className)}>
        <Loader2 className="h-6 w-6 animate-spin text-violet-500" />
      </div>
    )
  }

  return (
    <div
      className={cn(
        'space-y-6 rounded-lg border border-violet-200 bg-gradient-to-br from-violet-50 to-lime-50 p-6',
        className
      )}
    >
      {/* Header */}
      <div className="flex items-center gap-2">
        <Settings className="h-5 w-5 text-violet-600" />
        <h3 className="text-lg font-semibold text-slate-900">Custom Fields</h3>
        {fields.length > 0 && (
          <span className="ml-auto text-sm text-slate-600">
            {fields.length}/20
          </span>
        )}
      </div>

      {/* Error message */}
      {error && (
        <div className="rounded-md bg-red-50 p-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* Success message */}
      {success && (
        <div className="rounded-md bg-lime-50 p-3 text-sm text-lime-700">
          Field updated successfully
        </div>
      )}

      {/* Creator form */}
      {isCreator && (
        <form onSubmit={handleAddField} className="space-y-4">
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">
                Field Name
              </label>
              <Input
                placeholder="e.g., Platform, Integration, Support"
                value={fieldName}
                onChange={(e) => setFieldName(e.target.value)}
                disabled={isAdding || deleting !== null}
                maxLength={100}
                className="border-violet-200 focus:border-violet-500 focus:ring-violet-500"
              />
              <p className="text-xs text-slate-500">
                {fieldName.length}/100 characters
              </p>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">
                Field Value
              </label>
              <Input
                placeholder="e.g., iOS, REST API, 24/7"
                value={fieldValue}
                onChange={(e) => setFieldValue(e.target.value)}
                disabled={isAdding || deleting !== null}
                maxLength={500}
                className="border-violet-200 focus:border-violet-500 focus:ring-violet-500"
              />
              <p className="text-xs text-slate-500">
                {fieldValue.length}/500 characters
              </p>
            </div>
          </div>

          <Button
            type="submit"
            disabled={isAdding || fields.length >= 20 || deleting !== null}
            className="w-full gap-2 bg-gradient-to-r from-violet-600 to-lime-600 hover:from-violet-700 hover:to-lime-700 sm:w-auto"
          >
            {isAdding ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Adding...
              </>
            ) : (
              <>
                <Plus className="h-4 w-4" />
                Add Field
              </>
            )}
          </Button>
        </form>
      )}

      {/* Fields list */}
      {fields.length > 0 ? (
        <div className="space-y-3">
          <div className="text-sm font-medium text-slate-700">
            {isCreator ? 'Your Custom Fields' : 'Campaign Metadata'}
          </div>
          <div className="space-y-2">
            {fields.map((field) => (
              <div
                key={field.id}
                className="flex items-center justify-between rounded-md border border-violet-100 bg-white p-3"
              >
                <div className="min-w-0 flex-1">
                  <div className="font-medium text-slate-900">{field.name}</div>
                  <div className="text-sm text-slate-600">{field.value}</div>
                </div>

                {isCreator && (
                  <button
                    onClick={() => handleDeleteField(field.id)}
                    disabled={deleting === field.id}
                    className="ml-3 rounded-md p-2 text-slate-500 hover:bg-red-50 hover:text-red-600 disabled:opacity-50"
                    aria-label="Delete field"
                  >
                    {deleting === field.id ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Trash2 className="h-4 w-4" />
                    )}
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="rounded-md bg-white p-4 text-center text-sm text-slate-600">
          {isCreator
            ? 'No custom fields yet. Add one to get started!'
            : 'No custom fields available for this campaign'}
        </div>
      )}
    </div>
  )
}
