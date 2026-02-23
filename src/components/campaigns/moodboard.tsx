'use client'

import React, { useState, useEffect } from 'react'
import { cn } from '@/lib/utils'
import { ExternalLink, ImageIcon, LinkIcon, FileTextIcon, Plus, X } from 'lucide-react'

interface MoodBoardItem {
  id: string
  type: 'image' | 'link' | 'note'
  content: string
  description?: string
  imageUrl?: string
  linkUrl?: string
  createdBy: {
    id: string
    displayName: string
    avatar?: string
    handle?: string
  }
  createdAt: string
}

interface MoodboardProps {
  campaignId: string
  isCreator?: boolean
}

export const Moodboard: React.FC<MoodboardProps> = ({
  campaignId,
  isCreator = false,
}) => {
  const [items, setItems] = useState<MoodBoardItem[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    type: 'note' as 'image' | 'link' | 'note',
    content: '',
    description: '',
    imageUrl: '',
    linkUrl: '',
  })

  // Fetch mood board items
  useEffect(() => {
    const fetchItems = async () => {
      try {
        setLoading(true)
        const response = await fetch(`/api/campaigns/${campaignId}/moodboard`)
        if (!response.ok) {
          throw new Error('Failed to fetch mood board items')
        }
        const data = await response.json()
        setItems(data.data.items || [])
      } catch (err) {
        console.error('Error fetching mood board items:', err)
        setError('Failed to load mood board items')
      } finally {
        setLoading(false)
      }
    }

    fetchItems()
  }, [campaignId])

  // Handle form submission
  const handleAddItem = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!formData.content.trim()) {
      setError('Content is required')
      return
    }

    if (
      formData.type === 'image' &&
      !formData.imageUrl?.trim()
    ) {
      setError('Image URL is required')
      return
    }

    if (
      formData.type === 'link' &&
      !formData.linkUrl?.trim()
    ) {
      setError('Link URL is required')
      return
    }

    try {
      setSubmitting(true)
      const response = await fetch(`/api/campaigns/${campaignId}/moodboard`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to add item')
      }

      const data = await response.json()
      setItems([data.data, ...items])
      setFormData({
        type: 'note',
        content: '',
        description: '',
        imageUrl: '',
        linkUrl: '',
      })
      setShowForm(false)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add item')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="w-full h-96 flex items-center justify-center">
        <p className="text-gray-500">Loading mood board...</p>
      </div>
    )
  }

  return (
    <div className="w-full">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Mood Board</h2>
          <p className="text-sm text-gray-600 mt-1">
            Inspiration and reference materials for this campaign
          </p>
        </div>
        {isCreator && (
          <button
            onClick={() => setShowForm(!showForm)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus size={18} />
            Add Item
          </button>
        )}
      </div>

      {/* Add Item Form */}
      {showForm && isCreator && (
        <div className="mb-6 p-6 bg-gray-50 rounded-lg border border-gray-200">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-gray-900">
              Add Mood Board Item
            </h3>
            <button
              onClick={() => setShowForm(false)}
              className="text-gray-500 hover:text-gray-700"
            >
              <X size={20} />
            </button>
          </div>

          <form onSubmit={handleAddItem} className="space-y-4">
            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded text-red-700 text-sm">
                {error}
              </div>
            )}

            {/* Type Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Type
              </label>
              <select
                value={formData.type}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    type: e.target.value as 'image' | 'link' | 'note',
                  })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="note">Note</option>
                <option value="image">Image</option>
                <option value="link">Link</option>
              </select>
            </div>

            {/* Content */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Content
              </label>
              <input
                type="text"
                value={formData.content}
                onChange={(e) =>
                  setFormData({ ...formData, content: e.target.value })
                }
                placeholder="Enter content title or description"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description (Optional)
              </label>
              <textarea
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                placeholder="Add more details about this item"
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Image URL */}
            {formData.type === 'image' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Image URL
                </label>
                <input
                  type="url"
                  value={formData.imageUrl}
                  onChange={(e) =>
                    setFormData({ ...formData, imageUrl: e.target.value })
                  }
                  placeholder="https://example.com/image.jpg"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            )}

            {/* Link URL */}
            {formData.type === 'link' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Link URL
                </label>
                <input
                  type="url"
                  value={formData.linkUrl}
                  onChange={(e) =>
                    setFormData({ ...formData, linkUrl: e.target.value })
                  }
                  placeholder="https://example.com"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            )}

            {/* Submit Button */}
            <div className="flex gap-3">
              <button
                type="submit"
                disabled={submitting}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 transition-colors"
              >
                {submitting ? 'Adding...' : 'Add Item'}
              </button>
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Masonry Grid */}
      {items.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500">
            {isCreator
              ? 'No mood board items yet. Add your first item to get started!'
              : 'No mood board items yet.'}
          </p>
        </div>
      ) : (
        <div className="columns-1 md:columns-2 lg:columns-3 gap-4 space-y-4">
          {items.map((item) => (
            <MoodBoardCard key={item.id} item={item} />
          ))}
        </div>
      )}
    </div>
  )
}

// ============================================================================
// Mood Board Card Component
// ============================================================================
interface MoodBoardCardProps {
  item: MoodBoardItem
}

const MoodBoardCard: React.FC<MoodBoardCardProps> = ({ item }) => {
  const cardBaseClass =
    'break-inside-avoid rounded-lg border border-gray-200 overflow-hidden bg-white hover:shadow-lg transition-shadow'

  if (item.type === 'image') {
    return (
      <div className={cardBaseClass}>
        {item.imageUrl && (
          <img
            src={item.imageUrl}
            alt={item.content}
            className="w-full h-auto object-cover"
          />
        )}
        <div className="p-4">
          <h3 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
            <ImageIcon size={16} className="text-gray-600" />
            {item.content}
          </h3>
          {item.description && (
            <p className="text-sm text-gray-600 mb-3">{item.description}</p>
          )}
          <p className="text-xs text-gray-500">
            Added by {item.createdBy.displayName}
          </p>
        </div>
      </div>
    )
  }

  if (item.type === 'link') {
    return (
      <div className={cardBaseClass}>
        <div className="p-4">
          <h3 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
            <LinkIcon size={16} className="text-blue-600" />
            {item.content}
          </h3>
          {item.description && (
            <p className="text-sm text-gray-600 mb-3">{item.description}</p>
          )}
          {item.linkUrl && (
            <a
              href={item.linkUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-700 text-sm font-medium mb-3"
            >
              Visit Link
              <ExternalLink size={14} />
            </a>
          )}
          <p className="text-xs text-gray-500">
            Added by {item.createdBy.displayName}
          </p>
        </div>
      </div>
    )
  }

  // Note type
  return (
    <div className={cardBaseClass}>
      <div className="p-4">
        <h3 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
          <FileTextIcon size={16} className="text-gray-600" />
          {item.content}
        </h3>
        {item.description && (
          <p className="text-sm text-gray-700 mb-3 whitespace-pre-wrap">
            {item.description}
          </p>
        )}
        <p className="text-xs text-gray-500">
          Added by {item.createdBy.displayName}
        </p>
      </div>
    </div>
  )
}
