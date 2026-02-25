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
const MAX_TAGLINE = 300
const MAX_PROBLEM = 500

export function StepIdea() {
  const { formData, setFormData, validationErrors, setValidationErrors } = useWizard()

  const handleChange = (field: string, value: string, maxLen?: number) => {
    const trimmed = maxLen ? value.slice(0, maxLen) : value
    setFormData({ [field]: trimmed })
    if (trimmed.length > 0 && validationErrors[field]) {
      setValidationErrors({ ...validationErrors, [field]: '' })
    }
  }

  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <h2 className="text-2xl font-bold text-gray-900">The Idea</h2>
        <p className="text-gray-600">
          What product or feature do you want to exist? Be specific — the clearer your idea, the more support it gets.
        </p>
      </div>

      <div className="space-y-6">
        {/* Campaign Name */}
        <div>
          <label htmlFor="title" className="block text-sm font-semibold text-gray-900 mb-2">
            Campaign Name <span className="text-red-500">*</span>
          </label>
          <input
            id="title"
            type="text"
            value={formData.title}
            onChange={(e) => handleChange('title', e.target.value, MAX_TITLE)}
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

        {/* Category */}
        <div>
          <label className="block text-sm font-semibold text-gray-900 mb-4">
            Category <span className="text-red-500">*</span>
          </label>
          <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
            {CATEGORIES.map((cat) => (
              <button
                key={cat.value}
                type="button"
                onClick={() => {
                  setFormData({ category: cat.value })
                  setValidationErrors({ ...validationErrors, category: '' })
                }}
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

        {/* One-liner / Tagline */}
        <div>
          <label htmlFor="tagline" className="block text-sm font-semibold text-gray-900 mb-2">
            One-liner <span className="text-red-500">*</span>
          </label>
          <input
            id="tagline"
            type="text"
            value={formData.tagline}
            onChange={(e) => handleChange('tagline', e.target.value, MAX_TAGLINE)}
            placeholder="e.g., A premium size option for those of us with bigger feet"
            className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-transparent outline-none transition ${
              validationErrors.tagline
                ? 'border-red-300 bg-red-50'
                : 'border-gray-200 focus:border-violet-500'
            }`}
          />
          <div className="flex justify-between mt-2">
            <p className="text-xs text-gray-500">
              A short pitch that explains your campaign in one sentence.
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

        {/* Problem Statement */}
        <div>
          <label htmlFor="problemStatement" className="block text-sm font-semibold text-gray-900 mb-2">
            Problem Statement <span className="text-red-500">*</span>
          </label>
          <textarea
            id="problemStatement"
            value={formData.problemStatement}
            onChange={(e) => handleChange('problemStatement', e.target.value, MAX_PROBLEM)}
            placeholder="What problem does this solve? Who experiences it? Why do current solutions fall short?"
            rows={3}
            className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-transparent outline-none transition resize-none ${
              validationErrors.problemStatement
                ? 'border-red-300 bg-red-50'
                : 'border-gray-200 focus:border-violet-500'
            }`}
          />
          <div className="flex justify-between mt-2">
            <p className="text-xs text-gray-500">
              Describe the real-world issue this product would address.
            </p>
            <span className={`text-xs font-medium ${
              formData.problemStatement.length > MAX_PROBLEM * 0.9
                ? 'text-red-500'
                : 'text-gray-400'
            }`}>
              {formData.problemStatement.length}/{MAX_PROBLEM}
            </span>
          </div>
          {validationErrors.problemStatement && (
            <div className="flex items-center gap-2 mt-2 text-red-600">
              <AlertCircle className="w-4 h-4" />
              <span className="text-xs">{validationErrors.problemStatement}</span>
            </div>
          )}
        </div>
      </div>

      <div className="bg-lime-50 border border-lime-200 rounded-lg p-4">
        <p className="text-sm text-lime-800">
          <span className="font-semibold">Tip:</span> Campaigns with specific, detailed titles get 3x more support. Be as clear as possible about what you want to see built.
        </p>
      </div>
    </div>
  )
}
