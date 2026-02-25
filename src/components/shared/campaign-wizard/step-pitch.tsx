'use client'

import { AlertCircle, Lightbulb } from 'lucide-react'
import { useWizard } from './wizard-context'

const MAX_ORIGIN_STORY = 2000
const MAX_WHY_IT_MATTERS = 1000

export function StepPitch() {
  const { formData, setFormData, validationErrors, setValidationErrors } = useWizard()

  const handleChange = (field: string, value: string, maxLen: number) => {
    const trimmed = value.slice(0, maxLen)
    setFormData({ [field]: trimmed })
    if (trimmed.length > 0 && validationErrors[field]) {
      setValidationErrors({ ...validationErrors, [field]: '' })
    }
  }

  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <h2 className="text-2xl font-bold text-gray-900">The Pitch</h2>
        <p className="text-gray-600">
          Every great campaign has a story behind it. Share yours — it's what makes people rally behind your idea.
        </p>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          {/* Origin Story */}
          <div>
            <label htmlFor="originStory" className="block text-sm font-semibold text-gray-900 mb-2">
              Origin Story <span className="text-red-500">*</span>
            </label>
            <p className="text-xs text-gray-500 mb-3">
              Tell us the moment you realised this product needed to exist. What happened? Where were you?
            </p>
            <textarea
              id="originStory"
              value={formData.originStory}
              onChange={(e) => handleChange('originStory', e.target.value, MAX_ORIGIN_STORY)}
              placeholder="e.g., I was shopping for running shoes last month and realised that despite trying 15+ brands, not a single one made my size in their premium range..."
              rows={6}
              className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-transparent outline-none transition resize-none text-sm ${
                validationErrors.originStory
                  ? 'border-red-300 bg-red-50'
                  : 'border-gray-200 focus:border-violet-500'
              }`}
            />
            <div className="flex justify-between mt-2">
              <p className="text-xs text-gray-500">
                Share the personal moment that sparked this idea.
              </p>
              <span className={`text-xs font-medium ${
                formData.originStory.length > MAX_ORIGIN_STORY * 0.9
                  ? 'text-red-500'
                  : formData.originStory.length > MAX_ORIGIN_STORY * 0.7
                    ? 'text-yellow-500'
                    : 'text-gray-400'
              }`}>
                {formData.originStory.length}/{MAX_ORIGIN_STORY}
              </span>
            </div>
            {validationErrors.originStory && (
              <div className="flex items-center gap-2 mt-2 text-red-600">
                <AlertCircle className="w-4 h-4" />
                <span className="text-xs">{validationErrors.originStory}</span>
              </div>
            )}
          </div>

          {/* Why It Matters */}
          <div>
            <label htmlFor="whyItMatters" className="block text-sm font-semibold text-gray-900 mb-2">
              Why This Matters <span className="text-red-500">*</span>
            </label>
            <p className="text-xs text-gray-500 mb-3">
              Why should people care? Who does this help beyond just you?
            </p>
            <textarea
              id="whyItMatters"
              value={formData.whyItMatters}
              onChange={(e) => handleChange('whyItMatters', e.target.value, MAX_WHY_IT_MATTERS)}
              placeholder="e.g., There are millions of people with larger feet who feel excluded from premium brands. This isn't just about shoes — it's about inclusivity in fashion..."
              rows={4}
              className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-transparent outline-none transition resize-none text-sm ${
                validationErrors.whyItMatters
                  ? 'border-red-300 bg-red-50'
                  : 'border-gray-200 focus:border-violet-500'
              }`}
            />
            <div className="flex justify-between mt-2">
              <p className="text-xs text-gray-500">
                Connect your idea to something bigger.
              </p>
              <span className={`text-xs font-medium ${
                formData.whyItMatters.length > MAX_WHY_IT_MATTERS * 0.9
                  ? 'text-red-500'
                  : 'text-gray-400'
              }`}>
                {formData.whyItMatters.length}/{MAX_WHY_IT_MATTERS}
              </span>
            </div>
            {validationErrors.whyItMatters && (
              <div className="flex items-center gap-2 mt-2 text-red-600">
                <AlertCircle className="w-4 h-4" />
                <span className="text-xs">{validationErrors.whyItMatters}</span>
              </div>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div className="lg:col-span-1">
          <div className="bg-violet-50 border border-violet-200 rounded-lg p-4 sticky top-24 space-y-4">
            <div className="flex items-center gap-2">
              <Lightbulb className="w-5 h-5 text-violet-600" />
              <h4 className="font-semibold text-gray-900 text-sm">Storytelling Tips</h4>
            </div>
            <ul className="space-y-3">
              <li className="text-xs text-gray-700">
                <span className="font-semibold">Be personal.</span> Describe the exact moment you felt this frustration.
              </li>
              <li className="text-xs text-gray-700">
                <span className="font-semibold">Be vivid.</span> Paint a picture. Where were you? What were you doing?
              </li>
              <li className="text-xs text-gray-700">
                <span className="font-semibold">Be honest.</span> Authenticity wins more support than polish.
              </li>
              <li className="text-xs text-gray-700">
                <span className="font-semibold">Think bigger.</span> Who else shares this problem? How many people?
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}
