'use client'

import { AlertCircle } from 'lucide-react'
import { useWizard } from './wizard-context'

const CATEGORIES = [
  { value: 'apparel', label: 'Apparel', emoji: '👕' },
  { value: 'tech', label: 'Tech', emoji: '💻' },
  { value: 'audio', label: 'Audio', emoji: '🎧' },
  { value: 'wearables', label: 'Wearables', emoji: '⌚' },
  { value: 'home', label: 'Home', emoji: '🏠' },
  { value: 'sports', label: 'Sports', emoji: '⚽' },
  { value: 'automotive', label: 'Automotive', emoji: '🚗' },
  { value: 'food_drink', label: 'Food & Drink', emoji: '🍔' },
  { value: 'beauty', label: 'Beauty', emoji: '💄' },
  { value: 'gaming', label: 'Gaming', emoji: '🎮' },
  { value: 'pets', label: 'Pets', emoji: '🐾' },
  { value: 'other', label: 'Other', emoji: '✨' },
]

const MAX_TITLE = 100
const MAX_TAGLINE = 200

export function StepBasics() {
  const { formData, setFormData, validationErrors, setValidationErrors } = useWizard()

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.slice(0, MAX_TITLE)
    setFormData({ title: value })
    if (value.length >= 10) {
      setValidationErrors({ ...validationErrors, title: '' })
    }
  }

  const handleTaglineChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.slice(0, MAX_TAGLINE)
    setFormData({ tagline: value })
    if (value.length >= 10) {
      setValidationErrors({ ...validationErrors, tagline: '' })
    }
  }

  const handleCategoryChange = (category: string) => {
    setFormData({ category })
    setValidationErrors({ ...validationErrors, category: '' })
  }

  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <h2 className="text-2xl font-bold text-gray-900">The Basics</h2>
        <p className="text-gray-600">
          Give us the essentials about your campaign. These will appear publicly on your campaign page.
        </p>
      </div>

      <div className="space-y-4">
        <div>
          <label htmlFor="title" className="block text-sm font-semibold text-gray-900 mb-2">
            Campaign Title <span className="text-red-500">*</span>
          </label>
          <input
            id="title"
            type="text"
            value={formData.title}
            onChange={handleTitleChange}
            placeholder="e.g., Nike Air Max 90 in Size 15 UK"
            className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-transparent outline-none transition ${
              validationErrors.title
                ? 'border-red-300 bg-red-50'
                : 'border-gray-200 focus:border-violet-500'
            }`}
          />
          <div className="flex justify-between mt-2">
            <p className="text-xs text-gray-500">
              Be specific and clear about what you want to exist.
            </p>
            <span className={`text-xs font-medium ${
              formData.title.length > MAX_TITLE * 0.9
                ? 'text-red-500'
                : formData.title.length > MAX_TITLE * 0.7
                  ? 'text-yellow-500'
                  : 'text-gray-400'
            }`}>
              {formData.title.length}/{MAX_TITLE}
            </span>
          </div>
          {validationErrors.title && (
            <div className="flex items-center gap-2 mt-2 text-red-600">
              <AlertCircle className="w-4 h-4" />
              <span className="text-xs">{validationErrors.title}</span>
            </div>
          )}
        </div>

        <div>
          <label htmlFor="tagline" className="block text-sm font-semibold text-gray-900 mb-2">
            Tagline <span className="text-red-500">*</span>
          </label>
          <input
            id="tagline"
            type="text"
            value={formData.tagline}
            onChange={handleTaglineChange}
            placeholder="e.g., A premium size option for those of us with bigger feet"
            className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-transparent outline-none transition ${
              validationErrors.tagline
                ? 'border-red-300 bg-red-50'
                : 'border-gray-200 focus:border-violet-500'
            }`}
          />
          <div className="flex justify-between mt-2">
            <p className="text-xs text-gray-500">
              A short pitch explaining why this matters.
            </p>
            <span className={`text-xs font-medium ${
              formData.tagline.length > MAX_TAGLINE * 0.9
                ? 'text-red-500'
                : formData.tagline.length > MAX_TAGLINE * 0.7
                  ? 'text-yellow-500'
                  : 'text-gray-400'
            }`}>
              {formData.tagline.length}/{MAX_TAGLINE}
            </span>
          </div>
          {validationErrors.tagline && (
            <div className="flex items-center gap-2 mt-2 text-red-600">
              <AlertCircle className="w-4 h-4" />
              <span className="text-xs">{validationErrors.tagline}</span>
            </div>
          )}
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-900 mb-4">
            Category <span className="text-red-500">*</span>
          </label>
          <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
            {CATEGORIES.map((cat) => (
              <button
                key={cat.value}
                type="button"
                onClick={() => handleCategoryChange(cat.value)}
                className={`p-4 rounded-xl border-2 text-center transition flex flex-col items-center gap-2 ${
                  formData.category === cat.value
                    ? 'border-violet-500 bg-violet-50'
                    : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                }`}
              >
                <span className="text-2xl">{cat.emoji}</span>
                <span className="text-xs font-medium text-gray-900">{cat.label}</span>
              </button>
            ))}
          </div>
          {validationErrors.category && (
            <div className="flex items-center gap-2 mt-2 text-red-600">
              <AlertCircle className="w-4 h-4" />
              <span className="text-xs">{validationErrors.category}</span>
            </div>
          )}
        </div>
      </div>

      <div className="bg-lime-50 border border-lime-200 rounded-lg p-4">
        <p className="text-sm text-lime-800">
          <span className="font-semibold">Tip:</span> Campaigns with specific, detailed titles get 3x more support. Be as clear as possible.
        </p>
      </div>
    </div>
  )
}
