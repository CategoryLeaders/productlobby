'use client'

import { useState } from 'react'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Select } from '@/components/ui/select'
import { Card } from '@/components/ui/card'
import { Spinner } from '@/components/ui/spinner'
import { AlertCircle, Eye, EyeOff } from 'lucide-react'

interface MediaUploadFormProps {
  campaignId: string
  onSuccess?: () => void
  onError?: (error: string) => void
}

export function MediaUploadForm({
  campaignId,
  onSuccess,
  onError,
}: MediaUploadFormProps) {
  const [formData, setFormData] = useState({
    url: '',
    kind: 'IMAGE',
    altText: '',
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showPreview, setShowPreview] = useState(false)
  const [previewError, setPreviewError] = useState<string | null>(null)

  const isValidUrl = (urlString: string): boolean => {
    try {
      new URL(urlString)
      return true
    } catch {
      return false
    }
  }

  const handleUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const url = e.target.value
    setFormData({ ...formData, url })
    setPreviewError(null)
  }

  const handleAltTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value.slice(0, 500)
    setFormData({ ...formData, altText: value })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!formData.url.trim()) {
      setError('URL is required')
      return
    }

    if (!isValidUrl(formData.url)) {
      setError('Please enter a valid URL')
      return
    }

    if (!formData.kind) {
      setError('Media type is required')
      return
    }

    setLoading(true)
    try {
      const res = await fetch(`/api/campaigns/${campaignId}/media`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          url: formData.url.trim(),
          kind: formData.kind,
          altText: formData.altText.trim() || undefined,
        }),
      })

      if (!res.ok) {
        const errorData = await res.json()
        const errorMessage = errorData.error || 'Failed to upload media'
        setError(errorMessage)
        onError?.(errorMessage)
        return
      }

      // Reset form
      setFormData({ url: '', kind: 'IMAGE', altText: '' })
      setShowPreview(false)
      onSuccess?.()
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'An unexpected error occurred'
      setError(errorMessage)
      onError?.(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  const getMediaTypeDescription = (type: string): string => {
    const descriptions: Record<string, string> = {
      IMAGE: 'Product images, photos, or screenshots',
      VIDEO: 'Product demo videos or promotional content',
      SKETCH: 'Hand-drawn sketches or concept art',
      MOCKUP: 'Design mockups or prototypes',
    }
    return descriptions[type] || ''
  }

  const renderPreview = () => {
    if (!formData.url || !isValidUrl(formData.url)) {
      return null
    }

    switch (formData.kind) {
      case 'IMAGE':
      case 'MOCKUP':
        return (
          <div className="relative w-full h-48 bg-gray-100 rounded border border-gray-200">
            <Image
              src={formData.url}
              alt="Preview"
              fill
              className="object-contain"
              onError={() =>
                setPreviewError('Could not load image preview')
              }
            />
          </div>
        )
      case 'VIDEO':
        return (
          <div className="relative w-full h-48 bg-gray-100 rounded border border-gray-200">
            <video
              src={formData.url}
              className="w-full h-full object-contain"
              onError={() =>
                setPreviewError('Could not load video preview')
              }
            />
          </div>
        )
      case 'SKETCH':
        return (
          <div className="w-full h-48 bg-gradient-to-br from-orange-100 to-orange-50 rounded border border-orange-200 flex items-center justify-center">
            <div className="text-center">
              <div className="text-5xl mb-2">✏️</div>
              <p className="text-sm text-gray-600">Sketch</p>
            </div>
          </div>
        )
      default:
        return null
    }
  }

  return (
    <Card className="p-6 bg-white">
      <div className="mb-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-2">
          Upload Media
        </h2>
        <p className="text-sm text-gray-600">
          Add mockups, sketches, images, or videos to showcase your campaign
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Error Message */}
        {error && (
          <div className="flex gap-3 p-4 bg-red-50 border border-red-200 rounded-lg">
            <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-medium text-red-900">Error</h3>
              <p className="text-sm text-red-700 mt-0.5">{error}</p>
            </div>
          </div>
        )}

        {/* Media Type Selection */}
        <div>
          <label className="block text-sm font-semibold text-gray-900 mb-3">
            Media Type
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {[
              { value: 'IMAGE', label: 'Image', icon: '🖼️' },
              { value: 'VIDEO', label: 'Video', icon: '🎥' },
              { value: 'SKETCH', label: 'Sketch', icon: '✏️' },
              { value: 'MOCKUP', label: 'Mockup', icon: '📐' },
            ].map((type) => (
              <button
                key={type.value}
                type="button"
                onClick={() => setFormData({ ...formData, kind: type.value })}
                className={`p-4 rounded-lg border-2 transition-colors ${
                  formData.kind === type.value
                    ? 'border-violet-600 bg-violet-50'
                    : 'border-gray-200 bg-white hover:border-violet-300'
                }`}
              >
                <div className="flex items-center gap-2">
                  <span className="text-xl">{type.icon}</span>
                  <div className="text-left">
                    <p className="font-medium text-sm text-gray-900">
                      {type.label}
                    </p>
                    <p className="text-xs text-gray-600 mt-0.5">
                      {getMediaTypeDescription(type.value)}
                    </p>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* URL Input */}
        <div>
          <label htmlFor="url" className="block text-sm font-semibold text-gray-900 mb-2">
            Media URL
          </label>
          <Input
            id="url"
            type="url"
            placeholder="https://example.com/image.jpg"
            value={formData.url}
            onChange={handleUrlChange}
            disabled={loading}
            className="w-full"
          />
          <p className="text-xs text-gray-600 mt-1.5">
            Enter a direct link to your media file. Supports external storage services.
          </p>
        </div>

        {/* Caption/Alt Text */}
        <div>
          <label
            htmlFor="altText"
            className="block text-sm font-semibold text-gray-900 mb-2"
          >
            Caption (Optional)
          </label>
          <Textarea
            id="altText"
            placeholder="Add a description or caption for this media"
            value={formData.altText}
            onChange={handleAltTextChange}
            disabled={loading}
            rows={3}
            className="w-full resize-none"
          />
          <div className="flex items-center justify-between mt-1.5">
            <p className="text-xs text-gray-600">
              Helps provide context for viewers
            </p>
            <p className="text-xs text-gray-500">
              {formData.altText.length}/500
            </p>
          </div>
        </div>

        {/* Preview Toggle */}
        {formData.url && isValidUrl(formData.url) && (
          <div>
            <button
              type="button"
              onClick={() => setShowPreview(!showPreview)}
              className="flex items-center gap-2 text-sm font-medium text-violet-600 hover:text-violet-700 transition-colors"
            >
              {showPreview ? (
                <>
                  <EyeOff className="h-4 w-4" />
                  Hide Preview
                </>
              ) : (
                <>
                  <Eye className="h-4 w-4" />
                  Show Preview
                </>
              )}
            </button>

            {showPreview && (
              <div className="mt-3">
                {previewError ? (
                  <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg text-sm text-yellow-800">
                    {previewError}
                  </div>
                ) : (
                  renderPreview()
                )}
              </div>
            )}
          </div>
        )}

        {/* Submit Buttons */}
        <div className="flex gap-3 pt-4 border-t border-gray-200">
          <Button
            type="submit"
            disabled={loading}
            className="flex-1 bg-violet-600 hover:bg-violet-700 disabled:bg-gray-300 text-white font-medium"
          >
            {loading ? (
              <>
                <Spinner className="mr-2 h-4 w-4" />
                Uploading...
              </>
            ) : (
              'Upload Media'
            )}
          </Button>
        </div>
      </form>
    </Card>
  )
}
