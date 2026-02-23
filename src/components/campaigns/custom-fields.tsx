'use client'

import React, { useState, useEffect } from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Settings,
  Plus,
  Trash2,
  Loader2,
  Edit2,
  Check,
  X,
  Type,
  Hash,
  Calendar,
  List,
  ToggleLeft,
  Link as LinkIcon,
  AlertCircle,
  CheckCircle2,
} from 'lucide-react'
import { cn } from '@/lib/utils'

type FieldType = 'text' | 'number' | 'date' | 'select' | 'toggle' | 'url'

interface CustomField {
  id: string
  name: string
  type: FieldType
  value: string
  required?: boolean
  placeholder?: string
  options?: string[]
  createdAt: string
}

interface CustomFieldsProps {
  campaignId: string
  isCreator: boolean
  className?: string
}

const FIELD_TYPE_ICONS: Record<FieldType, React.ReactNode> = {
  text: <Type className="h-4 w-4" />,
  number: <Hash className="h-4 w-4" />,
  date: <Calendar className="h-4 w-4" />,
  select: <List className="h-4 w-4" />,
  toggle: <ToggleLeft className="h-4 w-4" />,
  url: <LinkIcon className="h-4 w-4" />,
}

const FIELD_TYPE_LABELS: Record<FieldType, string> = {
  text: 'Text',
  number: 'Number',
  date: 'Date',
  select: 'Select',
  toggle: 'Toggle',
  url: 'URL',
}

function formatFieldValue(value: string, type: FieldType): React.ReactNode {
  try {
    switch (type) {
      case 'date':
        const date = new Date(value)
        if (isNaN(date.getTime())) return value
        return date.toLocaleDateString('en-GB', {
          year: 'numeric',
          month: 'short',
          day: 'numeric',
        })

      case 'number':
        const num = parseFloat(value)
        if (isNaN(num)) return value
        return num.toLocaleString('en-GB')

      case 'url':
        try {
          const url = new URL(value)
          return (
            <a
              href={value}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:underline break-all"
            >
              {url.hostname}
            </a>
          )
        } catch {
          return value
        }

      case 'toggle':
        const isTrue = value.toLowerCase() === 'true' || value === '1'
        return (
          <span
            className={cn(
              'inline-flex items-center gap-1 rounded-full px-3 py-1 text-sm font-medium',
              isTrue
                ? 'bg-green-100 text-green-800'
                : 'bg-gray-100 text-gray-800'
            )}
          >
            {isTrue ? (
              <CheckCircle2 className="h-3 w-3" />
            ) : (
              <X className="h-3 w-3" />
            )}
            {isTrue ? 'Yes' : 'No'}
          </span>
        )

      case 'select':
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-violet-100 px-3 py-1 text-sm font-medium text-violet-800">
            {value}
          </span>
        )

      default:
        return value
    }
  } catch (error) {
    return value
  }
}

function isValidFieldValue(value: string, type: FieldType): boolean {
  if (!value.trim()) return false

  switch (type) {
    case 'number':
      return !isNaN(parseFloat(value))

    case 'date':
      const date = new Date(value)
      return !isNaN(date.getTime())

    case 'url':
      try {
        new URL(value)
        return true
      } catch {
        return false
      }

    case 'toggle':
      return ['true', 'false', '1', '0', 'yes', 'no'].includes(
        value.toLowerCase()
      )

    default:
      return true
  }
}

export function CustomFields({
  campaignId,
  isCreator,
  className,
}: CustomFieldsProps) {
  const [fields, setFields] = useState<CustomField[]>([])
  const [fieldName, setFieldName] = useState('')
  const [fieldType, setFieldType] = useState<FieldType>('text')
  const [fieldValue, setFieldValue] = useState('')
  const [fieldRequired, setFieldRequired] = useState(false)
  const [fieldPlaceholder, setFieldPlaceholder] = useState('')
  const [fieldOptions, setFieldOptions] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [isAdding, setIsAdding] = useState(false)
  const [deleting, setDeleting] = useState<string | null>(null)
  const [editing, setEditing] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [validationError, setValidationError] = useState<string | null>(null)

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
          const parsedFields = (data.fields || []).map((field: any) => {
            const metadata =
              typeof field.metadata === 'string'
                ? JSON.parse(field.metadata)
                : field.metadata || {}
            return {
              id: field.id,
              name: field.name || metadata.name || '',
              type: (metadata.type || 'text') as FieldType,
              value: field.value || metadata.value || '',
              required: metadata.required || false,
              placeholder: metadata.placeholder || '',
              options: metadata.options || [],
              createdAt: field.createdAt,
            }
          })
          setFields(parsedFields)
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

  const resetForm = () => {
    setFieldName('')
    setFieldType('text')
    setFieldValue('')
    setFieldRequired(false)
    setFieldPlaceholder('')
    setFieldOptions('')
    setValidationError(null)
  }

  const handleAddField = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setValidationError(null)

    // Validation
    if (!fieldName.trim()) {
      setValidationError('Field name is required')
      return
    }

    if (fieldName.length > 100) {
      setValidationError('Field name must be 100 characters or less')
      return
    }

    if (fieldRequired && !fieldValue.trim()) {
      setValidationError('Value is required for this field')
      return
    }

    if (fieldValue && !isValidFieldValue(fieldValue, fieldType)) {
      setValidationError(
        `Invalid ${FIELD_TYPE_LABELS[fieldType].toLowerCase()} format`
      )
      return
    }

    if (fields.length >= 20) {
      setValidationError('Maximum 20 custom fields allowed')
      return
    }

    if (fieldType === 'select' && !fieldOptions.trim()) {
      setValidationError('Select options are required')
      return
    }

    try {
      setIsAdding(true)

      const metadata: any = {
        type: fieldType,
        required: fieldRequired,
      }

      if (fieldPlaceholder) metadata.placeholder = fieldPlaceholder
      if (fieldType === 'select') {
        metadata.options = fieldOptions
          .split(',')
          .map((o) => o.trim())
          .filter((o) => o)
      }

      const response = await fetch(
        `/api/campaigns/${campaignId}/custom-fields`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: fieldName.trim(),
            value: fieldValue.trim(),
            metadata,
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
      const newField: CustomField = {
        id: data.field.id,
        name: data.field.name,
        type: fieldType,
        value: data.field.value,
        required: fieldRequired,
        placeholder: fieldPlaceholder,
        options:
          fieldType === 'select'
            ? fieldOptions
                .split(',')
                .map((o) => o.trim())
                .filter((o) => o)
            : [],
        createdAt: data.field.createdAt,
      }

      setFields([...fields, newField])
      resetForm()
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

  const startEdit = (field: CustomField) => {
    setEditing(field.id)
    setFieldName(field.name)
    setFieldType(field.type)
    setFieldValue(field.value)
    setFieldRequired(field.required || false)
    setFieldPlaceholder(field.placeholder || '')
    setFieldOptions(field.options ? field.options.join(', ') : '')
  }

  const cancelEdit = () => {
    setEditing(null)
    resetForm()
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
        <h3 className="text-lg font-semibold text-slate-900">
          Campaign Custom Fields
        </h3>
        {fields.length > 0 && (
          <span className="ml-auto text-sm font-medium text-slate-600">
            {fields.length}/20 fields
          </span>
        )}
      </div>

      {/* Error message */}
      {error && (
        <div className="flex gap-2 rounded-md bg-red-50 p-3 text-sm text-red-700">
          <AlertCircle className="h-4 w-4 shrink-0 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Success message */}
      {success && (
        <div className="flex gap-2 rounded-md bg-lime-50 p-3 text-sm text-lime-700">
          <CheckCircle2 className="h-4 w-4 shrink-0 flex-shrink-0" />
          <span>Field updated successfully</span>
        </div>
      )}

      {/* Creator form */}
      {isCreator && (
        <form onSubmit={handleAddField} className="space-y-4 rounded-lg border border-violet-100 bg-white p-4">
          <div className="space-y-3">
            <h4 className="text-sm font-semibold text-slate-900">
              {editing ? 'Edit Field' : 'Add New Field'}
            </h4>

            {/* Field name and type */}
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">
                  Field Name *
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
                  Field Type
                </label>
                <select
                  value={fieldType}
                  onChange={(e) => setFieldType(e.target.value as FieldType)}
                  disabled={isAdding || deleting !== null}
                  className="flex h-9 w-full rounded-md border border-violet-200 bg-white px-3 py-2 text-sm placeholder:text-slate-500 focus:border-violet-500 focus:outline-none focus:ring-1 focus:ring-violet-500 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {Object.entries(FIELD_TYPE_LABELS).map(([key, label]) => (
                    <option key={key} value={key}>
                      {label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Field value */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">
                Field Value {fieldRequired && '*'}
              </label>
              {fieldType === 'select' ? (
                <Input
                  placeholder="e.g., Option 1, Option 2, Option 3"
                  value={fieldOptions}
                  onChange={(e) => setFieldOptions(e.target.value)}
                  disabled={isAdding || deleting !== null}
                  className="border-violet-200 focus:border-violet-500 focus:ring-violet-500"
                  type="text"
                />
              ) : fieldType === 'toggle' ? (
                <div className="flex items-center gap-2">
                  <Checkbox
                    checked={fieldValue.toLowerCase() === 'true'}
                    onCheckedChange={(checked) =>
                      setFieldValue(checked ? 'true' : 'false')
                    }
                    disabled={isAdding || deleting !== null}
                  />
                  <span className="text-sm text-slate-600">
                    {fieldValue.toLowerCase() === 'true' ? 'Enabled' : 'Disabled'}
                  </span>
                </div>
              ) : fieldType === 'date' ? (
                <Input
                  placeholder="YYYY-MM-DD"
                  value={fieldValue}
                  onChange={(e) => setFieldValue(e.target.value)}
                  disabled={isAdding || deleting !== null}
                  type="date"
                  className="border-violet-200 focus:border-violet-500 focus:ring-violet-500"
                />
              ) : fieldType === 'number' ? (
                <Input
                  placeholder="0"
                  value={fieldValue}
                  onChange={(e) => setFieldValue(e.target.value)}
                  disabled={isAdding || deleting !== null}
                  type="number"
                  className="border-violet-200 focus:border-violet-500 focus:ring-violet-500"
                />
              ) : (
                <Input
                  placeholder={fieldPlaceholder || 'Enter value...'}
                  value={fieldValue}
                  onChange={(e) => setFieldValue(e.target.value)}
                  disabled={isAdding || deleting !== null}
                  maxLength={fieldType === 'text' ? 500 : undefined}
                  className="border-violet-200 focus:border-violet-500 focus:ring-violet-500"
                />
              )}
              {fieldType === 'text' && (
                <p className="text-xs text-slate-500">
                  {fieldValue.length}/500 characters
                </p>
              )}
            </div>

            {/* Placeholder and required */}
            <div className="grid gap-3 sm:grid-cols-2">
              {fieldType !== 'toggle' && (
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700">
                    Placeholder (optional)
                  </label>
                  <Input
                    placeholder="Hint text..."
                    value={fieldPlaceholder}
                    onChange={(e) => setFieldPlaceholder(e.target.value)}
                    disabled={isAdding || deleting !== null}
                    maxLength={100}
                    className="border-violet-200 focus:border-violet-500 focus:ring-violet-500"
                  />
                </div>
              )}

              <div className="flex items-end gap-2">
                <div className="flex items-center gap-2">
                  <Checkbox
                    id="required"
                    checked={fieldRequired}
                    onCheckedChange={(checked) =>
                      setFieldRequired(checked as boolean)
                    }
                    disabled={isAdding || deleting !== null}
                  />
                  <label
                    htmlFor="required"
                    className="text-sm font-medium text-slate-700"
                  >
                    Required field
                  </label>
                </div>
              </div>
            </div>

            {/* Validation error */}
            {validationError && (
              <div className="flex gap-2 rounded-md bg-orange-50 p-2 text-sm text-orange-700">
                <AlertCircle className="h-4 w-4 shrink-0 flex-shrink-0" />
                <span>{validationError}</span>
              </div>
            )}
          </div>

          {/* Action buttons */}
          <div className="flex gap-2 pt-2">
            <Button
              type="submit"
              disabled={isAdding || fields.length >= 20 || deleting !== null}
              className="gap-2 bg-gradient-to-r from-violet-600 to-lime-600 hover:from-violet-700 hover:to-lime-700"
            >
              {isAdding ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  {editing ? 'Updating...' : 'Adding...'}
                </>
              ) : (
                <>
                  {editing ? (
                    <Check className="h-4 w-4" />
                  ) : (
                    <Plus className="h-4 w-4" />
                  )}
                  {editing ? 'Update Field' : 'Add Field'}
                </>
              )}
            </Button>

            {editing && (
              <Button
                type="button"
                onClick={cancelEdit}
                disabled={isAdding || deleting !== null}
                variant="outline"
                className="gap-2"
              >
                <X className="h-4 w-4" />
                Cancel
              </Button>
            )}
          </div>
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
                className="flex items-start gap-3 rounded-lg border border-violet-100 bg-white p-4"
              >
                {/* Field icon and type */}
                <div className="flex shrink-0 flex-col items-center gap-1">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-violet-100 text-violet-600">
                    {FIELD_TYPE_ICONS[field.type]}
                  </div>
                  <span className="text-xs font-medium text-slate-500">
                    {FIELD_TYPE_LABELS[field.type]}
                  </span>
                </div>

                {/* Field details */}
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <h4 className="font-semibold text-slate-900">
                      {field.name}
                    </h4>
                    {field.required && (
                      <span className="inline-flex items-center rounded-full bg-orange-100 px-2 py-0.5 text-xs font-medium text-orange-800">
                        Required
                      </span>
                    )}
                  </div>

                  <div className="mt-2 text-sm text-slate-600">
                    {formatFieldValue(field.value, field.type)}
                  </div>

                  {field.placeholder && (
                    <p className="mt-1 text-xs text-slate-500 italic">
                      Placeholder: {field.placeholder}
                    </p>
                  )}

                  {field.options && field.options.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-1">
                      {field.options.map((option, idx) => (
                        <span
                          key={idx}
                          className="inline-flex items-center rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-700"
                        >
                          {option}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {/* Actions */}
                {isCreator && (
                  <div className="flex shrink-0 gap-1">
                    <button
                      onClick={() => startEdit(field)}
                      disabled={deleting !== null || isAdding}
                      className="rounded-md p-2 text-slate-500 hover:bg-violet-50 hover:text-violet-600 disabled:opacity-50"
                      aria-label="Edit field"
                    >
                      <Edit2 className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteField(field.id)}
                      disabled={deleting === field.id}
                      className="rounded-md p-2 text-slate-500 hover:bg-red-50 hover:text-red-600 disabled:opacity-50"
                      aria-label="Delete field"
                    >
                      {deleting === field.id ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Trash2 className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="rounded-md bg-white p-6 text-center text-sm text-slate-600">
          <Settings className="mx-auto mb-2 h-8 w-8 text-slate-300" />
          {isCreator
            ? 'No custom fields yet. Add one to get started!'
            : 'No custom fields available for this campaign'}
        </div>
      )}
    </div>
  )
}
