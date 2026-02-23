'use client'

import React, { useState, useEffect } from 'react'
import { BookOpen, ExternalLink, Plus, Loader2, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { cn } from '@/lib/utils'

interface Resource {
  id: string
  title: string
  description: string
  url: string
  resourceType: string
  createdAt: string
}

interface ResourceLibraryProps {
  campaignId: string
  isCreator?: boolean
}

type ResourceTypeOption = 'article' | 'video' | 'pdf' | 'tool' | 'other'

const RESOURCE_TYPES: { value: ResourceTypeOption; label: string; color: string }[] = [
  { value: 'article', label: 'Article', color: 'bg-blue-100 text-blue-800' },
  { value: 'video', label: 'Video', color: 'bg-red-100 text-red-800' },
  { value: 'pdf', label: 'PDF', color: 'bg-amber-100 text-amber-800' },
  { value: 'tool', label: 'Tool', color: 'bg-green-100 text-green-800' },
  { value: 'other', label: 'Other', color: 'bg-gray-100 text-gray-800' },
]

export function ResourceLibrary({ campaignId, isCreator = false }: ResourceLibraryProps) {
  const [resources, setResources] = useState<Resource[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [showForm, setShowForm] = useState(false)
  const [isDeleting, setIsDeleting] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    url: '',
    resourceType: 'article' as ResourceTypeOption,
  })

  // Fetch resources
  useEffect(() => {
    const fetchResources = async () => {
      try {
        setIsLoading(true)
        const response = await fetch(`/api/campaigns/${campaignId}/resources`)
        if (!response.ok) throw new Error('Failed to fetch resources')
        const data = await response.json()
        setResources(data.resources || [])
      } catch (err) {
        console.error('Error fetching resources:', err)
        setError('Failed to load resources')
      } finally {
        setIsLoading(false)
      }
    }

    fetchResources()
  }, [campaignId])

  const handleAddResource = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setSuccess(null)

    if (!formData.title.trim() || !formData.url.trim()) {
      setError('Title and URL are required')
      return
    }

    // Basic URL validation
    try {
      new URL(formData.url)
    } catch {
      setError('Please enter a valid URL')
      return
    }

    try {
      setIsSaving(true)
      const response = await fetch(`/api/campaigns/${campaignId}/resources`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: formData.title,
          description: formData.description,
          url: formData.url,
          resourceType: formData.resourceType,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to add resource')
      }

      const data = await response.json()
      setResources([data.resource, ...resources])
      setFormData({
        title: '',
        description: '',
        url: '',
        resourceType: 'article',
      })
      setShowForm(false)
      setSuccess('Resource added successfully')
      setTimeout(() => setSuccess(null), 3000)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add resource')
    } finally {
      setIsSaving(false)
    }
  }

  const handleDeleteResource = async (resourceId: string) => {
    if (!confirm('Are you sure you want to delete this resource?')) return

    try {
      setIsDeleting(resourceId)
      const response = await fetch(`/api/campaigns/${campaignId}/resources`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ resourceId }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to delete resource')
      }

      setResources(resources.filter((r) => r.id !== resourceId))
      setSuccess('Resource deleted successfully')
      setTimeout(() => setSuccess(null), 3000)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete resource')
    } finally {
      setIsDeleting(null)
    }
  }

  const getTypeColor = (type: string) => {
    const typeConfig = RESOURCE_TYPES.find((t) => t.value === type)
    return typeConfig?.color || 'bg-gray-100 text-gray-800'
  }

  const getTypeLabel = (type: string) => {
    const typeConfig = RESOURCE_TYPES.find((t) => t.value === type)
    return typeConfig?.label || type
  }

  return (
    <div className="w-full space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="rounded-lg bg-violet-100 p-2.5">
            <BookOpen className="h-5 w-5 text-violet-600" />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Resource Library</h2>
            <p className="text-sm text-gray-600">Educational resources for your campaign</p>
          </div>
        </div>

        {isCreator && (
          <Button
            onClick={() => setShowForm(!showForm)}
            className="flex items-center gap-2 bg-violet-600 hover:bg-violet-700 text-white"
          >
            <Plus className="h-4 w-4" />
            Add Resource
          </Button>
        )}
      </div>

      {/* Messages */}
      {error && (
        <div className="rounded-lg bg-red-50 p-4 text-sm text-red-800 border border-red-200">
          {error}
        </div>
      )}

      {success && (
        <div className="rounded-lg bg-lime-50 p-4 text-sm text-lime-800 border border-lime-200">
          {success}
        </div>
      )}

      {/* Add Resource Form */}
      {isCreator && showForm && (
        <form onSubmit={handleAddResource} className="rounded-lg border border-gray-200 bg-white p-6 space-y-4">
          <h3 className="font-semibold text-gray-900">Add New Resource</h3>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">Title *</label>
            <Input
              type="text"
              placeholder="e.g., Product Market Fit Explained"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="border-gray-300"
            />
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">Description</label>
            <Textarea
              placeholder="Brief description of the resource..."
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="border-gray-300 resize-none"
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">URL *</label>
            <Input
              type="url"
              placeholder="https://example.com/resource"
              value={formData.url}
              onChange={(e) => setFormData({ ...formData, url: e.target.value })}
              className="border-gray-300"
            />
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">Type</label>
            <select
              value={formData.resourceType}
              onChange={(e) =>
                setFormData({ ...formData, resourceType: e.target.value as ResourceTypeOption })
              }
              className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:border-violet-500 focus:outline-none focus:ring-1 focus:ring-violet-500"
            >
              {RESOURCE_TYPES.map((type) => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>
          </div>

          <div className="flex gap-3 pt-2">
            <Button
              type="submit"
              disabled={isSaving}
              className="flex items-center gap-2 bg-violet-600 hover:bg-violet-700 text-white"
            >
              {isSaving ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                'Save Resource'
              )}
            </Button>
            <Button
              type="button"
              onClick={() => setShowForm(false)}
              variant="outline"
              className="border-gray-300 text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </Button>
          </div>
        </form>
      )}

      {/* Resources List */}
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-6 w-6 animate-spin text-violet-600" />
        </div>
      ) : resources.length === 0 ? (
        <div className="rounded-lg border border-dashed border-gray-300 bg-gray-50 p-12 text-center">
          <BookOpen className="mx-auto h-12 w-12 text-gray-400 mb-3" />
          <h3 className="text-sm font-medium text-gray-900">No resources yet</h3>
          <p className="text-sm text-gray-600 mt-1">
            {isCreator ? 'Add your first educational resource to get started' : 'Check back soon for resources'}
          </p>
        </div>
      ) : (
        <div className="grid gap-4">
          {resources.map((resource) => (
            <div
              key={resource.id}
              className="rounded-lg border border-gray-200 bg-white p-5 hover:border-violet-300 hover:shadow-sm transition-all"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="font-semibold text-gray-900 break-words">{resource.title}</h3>
                    <span
                      className={cn(
                        'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium whitespace-nowrap',
                        getTypeColor(resource.resourceType)
                      )}
                    >
                      {getTypeLabel(resource.resourceType)}
                    </span>
                  </div>

                  {resource.description && (
                    <p className="text-sm text-gray-600 mb-3 line-clamp-2">{resource.description}</p>
                  )}

                  <a
                    href={resource.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-sm font-medium text-violet-600 hover:text-violet-700 hover:underline"
                  >
                    View Resource
                    <ExternalLink className="h-4 w-4" />
                  </a>
                </div>

                {isCreator && (
                  <button
                    onClick={() => handleDeleteResource(resource.id)}
                    disabled={isDeleting === resource.id}
                    className="flex-shrink-0 rounded-lg p-2 text-gray-400 hover:bg-red-50 hover:text-red-600 transition-colors disabled:opacity-50"
                    title="Delete resource"
                  >
                    {isDeleting === resource.id ? (
                      <Loader2 className="h-5 w-5 animate-spin" />
                    ) : (
                      <Trash2 className="h-5 w-5" />
                    )}
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
