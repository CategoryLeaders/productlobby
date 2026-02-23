'use client'

import React, { useState, useEffect, useMemo } from 'react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import {
  Plus,
  X,
  Trash2,
  ImageIcon,
  LinkIcon,
  FileTextIcon,
  Palette,
  Tag,
  ExternalLink,
  Grid3x3,
} from 'lucide-react'

interface MoodBoardItem {
  id: string
  type: 'color' | 'image' | 'link' | 'note'
  content: string
  description?: string
  imageUrl?: string
  linkUrl?: string
  colorValue?: string
  categories?: string[]
  createdBy: {
    id: string
    displayName: string
    avatar?: string
    handle?: string
  }
  createdAt: string
}

interface MoodBoardProps {
  campaignId: string
  isCreator?: boolean
}

interface ExtractedColor {
  color: string
  hex: string
  frequency: number
}

// Helper function to extract dominant colors from image URL
const extractColorsFromImage = async (
  imageUrl: string
): Promise<ExtractedColor[]> => {
  try {
    const img = new Image()
    img.crossOrigin = 'anonymous'
    
    return new Promise((resolve) => {
      img.onload = () => {
        const canvas = document.createElement('canvas')
        canvas.width = img.width
        canvas.height = img.height
        const ctx = canvas.getContext('2d')
        
        if (!ctx) {
          resolve([])
          return
        }
        
        ctx.drawImage(img, 0, 0)
        const imageData = ctx.getImageData(
          0,
          0,
          canvas.width,
          canvas.height
        )
        const data = imageData.data
        
        const colorMap: Record<string, number> = {}
        
        // Sample every 4th pixel for performance
        for (let i = 0; i < data.length; i += 16) {
          const r = data[i]
          const g = data[i + 1]
          const b = data[i + 2]
          const hex = `#${((1 << 24) + (r << 16) + (g << 8) + b)
            .toString(16)
            .slice(1)}`
          colorMap[hex] = (colorMap[hex] || 0) + 1
        }
        
        const colors = Object.entries(colorMap)
          .map(([hex, frequency]) => ({
            color: hex,
            hex,
            frequency,
          }))
          .sort((a, b) => b.frequency - a.frequency)
          .slice(0, 5)
        
        resolve(colors)
      }
      
      img.onerror = () => {
        resolve([])
      }
      
      img.src = imageUrl
    })
  } catch {
    return []
  }
}

// Helper to parse hex color to RGB
const hexToRgb = (hex: string): { r: number; g: number; b: number } | null => {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
  return result
    ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16),
      }
    : null
}

// Helper to determine if a color is light or dark
const isLightColor = (hex: string): boolean => {
  const rgb = hexToRgb(hex)
  if (!rgb) return false
  const luminance = (0.299 * rgb.r + 0.587 * rgb.g + 0.114 * rgb.b) / 255
  return luminance > 0.5
}

export const MoodBoard: React.FC<MoodBoardProps> = ({
  campaignId,
  isCreator = false,
}) => {
  const [items, setItems] = useState<MoodBoardItem[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [selectedCategory, setSelectedCategory] = useState<string>('')
  const [extractedColors, setExtractedColors] = useState<ExtractedColor[]>([])
  const [formData, setFormData] = useState({
    type: 'note' as 'color' | 'image' | 'link' | 'note',
    content: '',
    description: '',
    imageUrl: '',
    linkUrl: '',
    colorValue: '#FF5733',
    categories: [] as string[],
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

  // Extract colors from new image when added
  useEffect(() => {
    if (formData.type === 'image' && formData.imageUrl) {
      const timer = setTimeout(async () => {
        const colors = await extractColorsFromImage(formData.imageUrl)
        setExtractedColors(colors)
      }, 500)
      return () => clearTimeout(timer)
    }
  }, [formData.imageUrl])

  // Get all unique categories from items
  const allCategories = useMemo(() => {
    const cats = new Set<string>()
    items.forEach((item) => {
      item.categories?.forEach((cat) => cats.add(cat))
    })
    return Array.from(cats).sort()
  }, [items])

  // Filter items by selected category
  const filteredItems = useMemo(() => {
    if (!selectedCategory) return items
    return items.filter((item) =>
      item.categories?.includes(selectedCategory)
    )
  }, [items, selectedCategory])

  // Calculate palette from all color items
  const colorPalette = useMemo(() => {
    return items
      .filter((item) => item.type === 'color')
      .map((item) => ({
        id: item.id,
        hex: item.colorValue || '#000000',
        label: item.content,
      }))
  }, [items])

  // Handle form submission
  const handleAddItem = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!formData.content.trim()) {
      setError('Content is required')
      return
    }

    if (formData.type === 'image' && !formData.imageUrl?.trim()) {
      setError('Image URL is required')
      return
    }

    if (formData.type === 'link' && !formData.linkUrl?.trim()) {
      setError('Link URL is required')
      return
    }

    if (formData.type === 'color' && !formData.colorValue?.trim()) {
      setError('Color value is required')
      return
    }

    try {
      setSubmitting(true)
      const payload = {
        type: formData.type,
        content: formData.content,
        description: formData.description,
        ...(formData.type === 'image' && { imageUrl: formData.imageUrl }),
        ...(formData.type === 'link' && { linkUrl: formData.linkUrl }),
        ...(formData.type === 'color' && { colorValue: formData.colorValue }),
        categories: formData.categories,
      }

      const response = await fetch(
        `/api/campaigns/${campaignId}/moodboard`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        }
      )

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
        colorValue: '#FF5733',
        categories: [],
      })
      setExtractedColors([])
      setShowForm(false)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add item')
    } finally {
      setSubmitting(false)
    }
  }

  // Handle item deletion
  const handleDeleteItem = async (itemId: string) => {
    if (!confirm('Are you sure you want to delete this item?')) return

    try {
      const response = await fetch(
        `/api/campaigns/${campaignId}/moodboard/${itemId}`,
        { method: 'DELETE' }
      )

      if (!response.ok) {
        throw new Error('Failed to delete item')
      }

      setItems(items.filter((item) => item.id !== itemId))
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Failed to delete item'
      )
    }
  }

  // Toggle category selection
  const toggleCategory = (category: string) => {
    setFormData((prev) => ({
      ...prev,
      categories: prev.categories.includes(category)
        ? prev.categories.filter((c) => c !== category)
        : [...prev.categories, category],
    }))
  }

  if (loading) {
    return (
      <div className="w-full h-96 flex items-center justify-center bg-gray-50 rounded-lg">
        <p className="text-gray-500">Loading mood board...</p>
      </div>
    )
  }

  return (
    <div className="w-full space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Grid3x3 className="text-blue-600" />
            Mood Board
          </h2>
          <p className="text-sm text-gray-600 mt-1">
            Collect and organize visual inspiration for your campaign
          </p>
        </div>
        {isCreator && (
          <Button
            onClick={() => setShowForm(!showForm)}
            className="flex items-center gap-2"
          >
            <Plus size={18} />
            Add Item
          </Button>
        )}
      </div>

      {/* Add Item Form */}
      {showForm && isCreator && (
        <div className="p-6 bg-white rounded-lg border border-gray-200 space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold text-gray-900">
              Add Mood Board Item
            </h3>
            <button
              onClick={() => {
                setShowForm(false)
                setExtractedColors([])
              }}
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
                onChange={(e) => {
                  setFormData({
                    ...formData,
                    type: e.target.value as
                      | 'color'
                      | 'image'
                      | 'link'
                      | 'note',
                  })
                  setExtractedColors([])
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="note">Text Note</option>
                <option value="image">Image</option>
                <option value="color">Color Swatch</option>
                <option value="link">Link Reference</option>
              </select>
            </div>

            {/* Content */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {formData.type === 'color' ? 'Color Name' : 'Content'}
              </label>
              <input
                type="text"
                value={formData.content}
                onChange={(e) =>
                  setFormData({ ...formData, content: e.target.value })
                }
                placeholder={
                  formData.type === 'color'
                    ? 'e.g., Brand Blue'
                    : 'Enter content title or description'
                }
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

            {/* Color Picker */}
            {formData.type === 'color' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Color Value
                </label>
                <div className="flex gap-2">
                  <input
                    type="color"
                    value={formData.colorValue}
                    onChange={(e) =>
                      setFormData({ ...formData, colorValue: e.target.value })
                    }
                    className="h-12 w-20 rounded-md cursor-pointer border border-gray-300"
                  />
                  <input
                    type="text"
                    value={formData.colorValue}
                    onChange={(e) =>
                      setFormData({ ...formData, colorValue: e.target.value })
                    }
                    placeholder="#FF5733"
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            )}

            {/* Image URL */}
            {formData.type === 'image' && (
              <>
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

                {/* Extracted Colors Preview */}
                {extractedColors.length > 0 && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Extracted Colors
                    </label>
                    <div className="grid grid-cols-5 gap-2">
                      {extractedColors.map((color) => (
                        <div
                          key={color.hex}
                          className="flex flex-col items-center"
                        >
                          <div
                            className="w-full aspect-square rounded-md border-2 border-gray-300 cursor-pointer hover:border-blue-500 transition-colors"
                            style={{ backgroundColor: color.hex }}
                            onClick={() =>
                              setFormData({
                                ...formData,
                                colorValue: color.hex,
                              })
                            }
                            title={`Click to use: ${color.hex}`}
                          />
                          <span className="text-xs text-gray-600 mt-1 font-mono">
                            {color.hex}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </>
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

            {/* Categories */}
            {allCategories.length > 0 && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Categories
                </label>
                <div className="flex flex-wrap gap-2">
                  {allCategories.map((cat) => (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => toggleCategory(cat)}
                      className={cn(
                        'px-3 py-1 rounded-full text-sm transition-colors',
                        formData.categories.includes(cat)
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                      )}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Submit Buttons */}
            <div className="flex gap-3 pt-4">
              <Button type="submit" disabled={submitting}>
                {submitting ? 'Adding...' : 'Add Item'}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setShowForm(false)
                  setExtractedColors([])
                }}
              >
                Cancel
              </Button>
            </div>
          </form>
        </div>
      )}

      {/* Color Palette Section */}
      {colorPalette.length > 0 && (
        <div className="p-4 bg-white rounded-lg border border-gray-200">
          <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
            <Palette size={16} />
            Color Palette ({colorPalette.length})
          </h3>
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3">
            {colorPalette.map((color) => (
              <div key={color.id} className="flex flex-col items-center gap-1">
                <div
                  className="w-full aspect-square rounded-md border-2 border-gray-300 shadow-sm hover:shadow-md transition-shadow"
                  style={{ backgroundColor: color.hex }}
                  title={color.label}
                />
                <span className="text-xs text-gray-600 font-mono text-center">
                  {color.hex}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Category Filter */}
      {allCategories.length > 0 && (
        <div className="flex items-center gap-3 flex-wrap">
          <button
            onClick={() => setSelectedCategory('')}
            className={cn(
              'px-3 py-1 rounded-full text-sm transition-colors',
              !selectedCategory
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            )}
          >
            All Items
          </button>
          {allCategories.map((cat) => (
            <button
              key={cat}
              onClick={() =>
                setSelectedCategory(selectedCategory === cat ? '' : cat)
              }
              className={cn(
                'px-3 py-1 rounded-full text-sm transition-colors flex items-center gap-1',
                selectedCategory === cat
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              )}
            >
              <Tag size={14} />
              {cat}
            </button>
          ))}
        </div>
      )}

      {/* Masonry Grid */}
      {filteredItems.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <Grid3x3 className="mx-auto text-gray-400 mb-2" size={32} />
          <p className="text-gray-500">
            {items.length === 0
              ? isCreator
                ? 'No mood board items yet. Add your first item to get started!'
                : 'No mood board items yet.'
              : 'No items match the selected category.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredItems.map((item) => (
            <MoodBoardCard
              key={item.id}
              item={item}
              isCreator={isCreator}
              onDelete={handleDeleteItem}
            />
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
  isCreator?: boolean
  onDelete?: (id: string) => void
}

const MoodBoardCard: React.FC<MoodBoardCardProps> = ({
  item,
  isCreator = false,
  onDelete,
}) => {
  const cardBaseClass =
    'rounded-lg border border-gray-200 overflow-hidden bg-white hover:shadow-lg transition-shadow relative'

  if (item.type === 'color') {
    return (
      <div className={cardBaseClass}>
        <div
          className="w-full h-40"
          style={{ backgroundColor: item.colorValue || '#000000' }}
        />
        <div className="p-4">
          <h3 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
            <Palette size={16} className="text-gray-600" />
            {item.content}
          </h3>
          {item.description && (
            <p className="text-sm text-gray-600 mb-3">{item.description}</p>
          )}
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-500">
                {item.colorValue || '#000000'}
              </p>
              <p className="text-xs text-gray-500">
                Added by {item.createdBy.displayName}
              </p>
            </div>
            {isCreator && onDelete && (
              <button
                onClick={() => onDelete(item.id)}
                className="text-red-600 hover:text-red-700 transition-colors"
                title="Delete item"
              >
                <Trash2 size={16} />
              </button>
            )}
          </div>
        </div>
      </div>
    )
  }

  if (item.type === 'image') {
    return (
      <div className={cardBaseClass}>
        {item.imageUrl && (
          <img
            src={item.imageUrl}
            alt={item.content}
            className="w-full h-48 object-cover"
            onError={(e) => {
              ;(e.target as HTMLImageElement).src =
                'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="400" height="300"%3E%3Crect fill="%23e5e7eb" width="400" height="300"/%3E%3Ctext x="50%25" y="50%25" text-anchor="middle" dominant-baseline="middle" fill="%239ca3af" font-family="sans-serif"%3EImage not available%3C/text%3E%3C/svg%3E'
            }}
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
          {item.categories && item.categories.length > 0 && (
            <div className="flex flex-wrap gap-1 mb-3">
              {item.categories.map((cat) => (
                <span
                  key={cat}
                  className="inline-block px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded"
                >
                  {cat}
                </span>
              ))}
            </div>
          )}
          <div className="flex items-center justify-between">
            <p className="text-xs text-gray-500">
              Added by {item.createdBy.displayName}
            </p>
            {isCreator && onDelete && (
              <button
                onClick={() => onDelete(item.id)}
                className="text-red-600 hover:text-red-700 transition-colors"
                title="Delete item"
              >
                <Trash2 size={16} />
              </button>
            )}
          </div>
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
          {item.categories && item.categories.length > 0 && (
            <div className="flex flex-wrap gap-1 mb-3">
              {item.categories.map((cat) => (
                <span
                  key={cat}
                  className="inline-block px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded"
                >
                  {cat}
                </span>
              ))}
            </div>
          )}
          <div className="flex items-center justify-between">
            <p className="text-xs text-gray-500">
              Added by {item.createdBy.displayName}
            </p>
            {isCreator && onDelete && (
              <button
                onClick={() => onDelete(item.id)}
                className="text-red-600 hover:text-red-700 transition-colors"
                title="Delete item"
              >
                <Trash2 size={16} />
              </button>
            )}
          </div>
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
        {item.categories && item.categories.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-3">
            {item.categories.map((cat) => (
              <span
                key={cat}
                className="inline-block px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded"
              >
                {cat}
              </span>
            ))}
          </div>
        )}
        <div className="flex items-center justify-between">
          <p className="text-xs text-gray-500">
            Added by {item.createdBy.displayName}
          </p>
          {isCreator && onDelete && (
            <button
              onClick={() => onDelete(item.id)}
              className="text-red-600 hover:text-red-700 transition-colors"
              title="Delete item"
            >
              <Trash2 size={16} />
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
