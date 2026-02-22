'use client'

import { useState, useRef } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Loader2, Target, Sparkles, Upload, X } from 'lucide-react'

const CATEGORIES = [
  { value: 'apparel', label: 'Apparel', emoji: '\uD83D\uDC55' },
  { value: 'tech', label: 'Tech', emoji: '\uD83D\uDCBB' },
  { value: 'audio', label: 'Audio', emoji: '\uD83C\uDFA7' },
  { value: 'wearables', label: 'Wearables', emoji: '\u231A' },
  { value: 'home', label: 'Home', emoji: '\uD83C\uDFE0' },
  { value: 'sports', label: 'Sports', emoji: '\u26BD' },
  { value: 'automotive', label: 'Automotive', emoji: '\uD83D\uDE97' },
  { value: 'food_drink', label: 'Food & Drink', emoji: '\uD83C\uDF54' },
  { value: 'beauty', label: 'Beauty', emoji: '\uD83D\uDC84' },
  { value: 'gaming', label: 'Gaming', emoji: '\uD83C\uDFAE' },
  { value: 'pets', label: 'Pets', emoji: '\uD83D\uDC3E' },
  { value: 'other', label: 'Other', emoji: '\u2728' },
]

const MAX_DESCRIPTION_LENGTH = 1000

const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/svg+xml']
const MAX_FILE_SIZE = 4.5 * 1024 * 1024

interface UploadedImage {
  url: string
  filename: string
  size: number
  type: string
}

export default function NewCampaignPage() {
  const router = useRouter()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const additionalFileInputRef = useRef<HTMLInputElement>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [isDragging, setIsDragging] = useState(false)
  const [heroImage, setHeroImage] = useState<UploadedImage | null>(null)
  const [additionalImages, setAdditionalImages] = useState<UploadedImage[]>([])
  const [uploading, setUploading] = useState(false)
  const [needsAuth, setNeedsAuth] = useState(false)
  const [form, setForm] = useState({
    title: '',
    description: '',
    template: 'VARIANT',
    category: '',
    targetBrand: '',
    currency: 'GBP',
  })

  const uploadFile = async (file: File): Promise<UploadedImage | null> => {
    if (!ALLOWED_TYPES.includes(file.type)) {
      setError('Invalid file type. Use JPEG, PNG, WebP, GIF, or SVG.')
      return null
    }
    if (file.size > MAX_FILE_SIZE) {
      setError('File too large. Maximum size is 4.5MB.')
      return null
    }
    setUploading(true)
    try {
      const formData = new FormData()
      formData.append('file', file)
      const res = await fetch('/api/upload', { method: 'POST', body: formData })
      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Upload failed')
      }
      const data = await res.json()
      return { url: data.url, filename: data.filename, size: data.size, type: data.type }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed')
      return null
    } finally {
      setUploading(false)
    }
  }

  const handleHeroSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const uploaded = await uploadFile(file)
    if (uploaded) { setHeroImage(uploaded); setError('') }
  }

  const handleAdditionalSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files) return
    const slots = 5 - additionalImages.length
    for (const file of Array.from(files).slice(0, slots)) {
      const uploaded = await uploadFile(file)
      if (uploaded) {
        setAdditionalImages(prev => [...prev, uploaded])
        setError('')
      }
    }
  }

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)
    const file = e.dataTransfer.files[0]
    if (!file) return
    if (!heroImage) {
      const uploaded = await uploadFile(file)
      if (uploaded) { setHeroImage(uploaded); setError('') }
    } else if (additionalImages.length < 5) {
      const uploaded = await uploadFile(file)
      if (uploaded) {
        setAdditionalImages(prev => [...prev, uploaded])
        setError('')
      }
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      const mediaUrls: string[] = []
      if (heroImage) mediaUrls.push(heroImage.url)
      additionalImages.forEach(img => mediaUrls.push(img.url))

      const res = await fetch('/api/campaigns', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          ...(mediaUrls.length > 0 ? { mediaUrls } : {}),
        }),
      })
      if (res.status === 401) {
        setNeedsAuth(true)
        setLoading(false)
        return
      }
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to create campaign')
      router.push(`/campaigns/${data.data.slug || data.data.id}`)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b sticky top-0 z-40">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <Link
            href="/campaigns"
            className="inline-flex items-center text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Campaigns
          </Link>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-2xl shadow-sm border p-8">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-violet-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Sparkles className="w-8 h-8 text-violet-600" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900">Create a Campaign</h1>
            <p className="text-gray-600 mt-2">
              Tell us what product or feature you want to exist. We&apos;ll help you rally support.
            </p>
          </div>

          {needsAuth && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6 text-center">
              <p className="text-sm font-medium text-yellow-800 mb-2">You need to sign in to create a campaign</p>
              <a href="/login" className="text-sm text-violet-600 hover:text-violet-700 font-medium underline">
                Sign in or create an account
              </a>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Campaign Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Campaign Type
              </label>
              <div className="grid grid-cols-2 gap-4">
                <button
                  type="button"
                  onClick={() => setForm({ ...form, template: 'VARIANT' })}
                  className={`p-4 rounded-xl border-2 text-left transition ${
                    form.template === 'VARIANT'
                      ? 'border-violet-500 bg-violet-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <Target className="w-6 h-6 text-violet-600 mb-2" />
                  <div className="font-medium">Product Variant</div>
                  <div className="text-sm text-gray-500 mt-1">
                    New size, color, or version of an existing product
                  </div>
                </button>
                <button
                  type="button"
                  onClick={() => setForm({ ...form, template: 'FEATURE' })}
                  className={`p-4 rounded-xl border-2 text-left transition ${
                    form.template === 'FEATURE'
                      ? 'border-violet-500 bg-violet-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <Sparkles className="w-6 h-6 text-violet-600 mb-2" />
                  <div className="font-medium">Feature Request</div>
                  <div className="text-sm text-gray-500 mt-1">
                    New feature or improvement for an existing product
                  </div>
                </button>
              </div>
            </div>

            {/* Title */}
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
                Campaign Title
              </label>
              <input
                type="text"
                id="title"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                placeholder="e.g. Nike Air Max 90 in size 15 UK"
                required
                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-violet-500 outline-none transition"
              />
            </div>

            {/* Description */}
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <textarea
                id="description"
                value={form.description}
                onChange={(e) => {
                  if (e.target.value.length <= MAX_DESCRIPTION_LENGTH) {
                    setForm({ ...form, description: e.target.value })
                  }
                }}
                placeholder="Describe what you want and why. Be specific about the product, feature, or variant you'd like to see."
                required
                rows={4}
                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-violet-500 outline-none transition resize-none"
              />
              <div className="flex justify-between mt-1.5">
                <p className="text-xs text-gray-400">
                  Tip: Be specific — campaigns with detailed descriptions get 3x more lobbies.
                </p>
                <span className={`text-xs font-medium ${
                  form.description.length > MAX_DESCRIPTION_LENGTH * 0.9
                    ? 'text-red-500'
                    : form.description.length > MAX_DESCRIPTION_LENGTH * 0.7
                    ? 'text-yellow-500'
                    : 'text-gray-400'
                }`}>
                  {form.description.length}/{MAX_DESCRIPTION_LENGTH}
                </span>
              </div>
            </div>

            {/* Image Upload */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Campaign Images <span className="text-gray-400 font-normal">(optional)</span>
              </label>

              {/* Hero Image Drop Zone */}
              <div
                onDragOver={(e) => { e.preventDefault(); setIsDragging(true) }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={handleDrop}
                onClick={() => !heroImage && fileInputRef.current?.click()}
                className={`border-2 border-dashed rounded-xl p-6 text-center transition cursor-pointer ${
                  isDragging ? 'border-violet-500 bg-violet-50' :
                  heroImage ? 'border-gray-200 bg-gray-50' :
                  'border-gray-300 hover:border-violet-400 hover:bg-violet-50'
                }`}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/gif,image/svg+xml"
                  onChange={handleHeroSelect}
                  className="hidden"
                />
                {uploading && !heroImage ? (
                  <div className="py-4">
                    <Loader2 className="w-8 h-8 animate-spin text-violet-500 mx-auto mb-2" />
                    <p className="text-sm text-gray-600">Uploading...</p>
                  </div>
                ) : heroImage ? (
                  <div className="relative">
                    <img
                      src={heroImage.url}
                      alt="Hero"
                      className="w-full h-48 object-cover rounded-lg"
                    />
                    <button
                      type="button"
                      onClick={(e) => { e.stopPropagation(); setHeroImage(null) }}
                      className="absolute top-2 right-2 p-1.5 bg-white/90 rounded-full shadow hover:bg-white transition"
                    >
                      <X className="w-4 h-4 text-gray-700" />
                    </button>
                    <p className="text-xs text-gray-500 mt-2">{heroImage.filename}</p>
                  </div>
                ) : (
                  <div className="py-4">
                    <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                    <p className="text-sm font-medium text-gray-700">
                      Drop a hero image here, or click to browse
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      JPEG, PNG, WebP, GIF or SVG up to 4.5MB
                    </p>
                  </div>
                )}
              </div>

              {/* Additional Images */}
              {heroImage && (
                <div className="mt-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-medium text-gray-600">Additional images ({additionalImages.length}/5)</span>
                    {additionalImages.length < 5 && (
                      <button
                        type="button"
                        onClick={() => additionalFileInputRef.current?.click()}
                        disabled={uploading}
                        className="text-xs text-violet-600 hover:text-violet-700 font-medium disabled:opacity-50"
                      >
                        + Add more
                      </button>
                    )}
                  </div>
                  <input
                    ref={additionalFileInputRef}
                    type="file"
                    multiple
                    accept="image/jpeg,image/png,image/webp,image/gif,image/svg+xml"
                    onChange={handleAdditionalSelect}
                    className="hidden"
                  />
                  {additionalImages.length > 0 && (
                    <div className="grid grid-cols-3 gap-3">
                      {additionalImages.map((img, i) => (
                        <div key={i} className="relative group">
                          <img
                            src={img.url}
                            alt={img.filename}
                            className="w-full h-24 object-cover rounded-lg"
                          />
                          <button
                            type="button"
                            onClick={() => setAdditionalImages(prev => prev.filter((_, idx) => idx !== i))}
                            className="absolute top-1 right-1 p-1 bg-white/90 rounded-full shadow opacity-0 group-hover:opacity-100 transition"
                          >
                            <X className="w-3 h-3 text-gray-700" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Category */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Category
              </label>
              <div className="flex flex-wrap gap-2">
                {CATEGORIES.map((cat) => (
                  <button
                    key={cat.value}
                    type="button"
                    onClick={() => setForm({ ...form, category: cat.value })}
                    className={`px-3.5 py-2 rounded-full text-sm font-medium border transition ${
                      form.category === cat.value
                        ? 'border-violet-500 bg-violet-50 text-violet-700'
                        : 'border-gray-200 text-gray-600 hover:border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    <span className="mr-1.5">{cat.emoji}</span>
                    {cat.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Target Brand */}
            <div>
              <label htmlFor="targetBrand" className="block text-sm font-medium text-gray-700 mb-1">
                Target Brand <span className="text-gray-400 font-normal">(optional)</span>
              </label>
              <input
                type="text"
                id="targetBrand"
                value={form.targetBrand}
                onChange={(e) => setForm({ ...form, targetBrand: e.target.value })}
                placeholder="e.g. Nike, Apple, Sony"
                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-violet-500 outline-none transition"
              />
              <p className="text-xs text-gray-400 mt-1.5">
                Which brand should make this? Leave blank if you&apos;re open to any.
              </p>
            </div>

            {error && (
              <div className="bg-error-50 text-error-700 px-4 py-3 rounded-lg text-sm">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading || uploading}
              className="w-full bg-violet-600 text-white py-3 rounded-lg font-semibold hover:bg-violet-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Creating...
                </>
              ) : (
                'Create Campaign'
              )}
            </button>
          </form>
        </div>
      </main>
    </div>
  )
}
