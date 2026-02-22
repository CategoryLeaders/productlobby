'use client'

import { AlertCircle } from 'lucide-react'
import { useWizard } from './wizard-context'

const MIN_DESCRIPTION = 100
const MAX_DESCRIPTION = 2000

const WRITING_PROMPTS = [
  'Describe the current problem without this product or feature.',
  'Who would benefit most from this? Be specific about the use case.',
  'How would your life be different if this existed?',
  'What alternatives exist today, and why are they inadequate?',
  'What would make this product perfect?',
]

export function StepStory() {
  const { formData, setFormData, validationErrors, setValidationErrors } = useWizard()

  const handleDescriptionChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value.slice(0, MAX_DESCRIPTION)
    setFormData({ description: value })
    if (value.length >= MIN_DESCRIPTION) {
      setValidationErrors({ ...validationErrors, description: '' })
    }
  }

  const handleProblemChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ problem: e.target.value })
    if (e.target.value.length > 0) {
      setValidationErrors({ ...validationErrors, problem: '' })
    }
  }

  const handleInspirationChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ inspiration: e.target.value })
    if (e.target.value.length > 0) {
      setValidationErrors({ ...validationErrors, inspiration: '' })
    }
  }

  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <h2 className="text-2xl font-bold text-gray-900">Tell the Story</h2>
        <p className="text-gray-600">
          Help people understand your campaign. The more detail you provide, the more support you'll receive.
        </p>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div>
            <label htmlFor="description" className="block text-sm font-semibold text-gray-900 mb-2">
              Full Description <span className="text-red-500">*</span>
            </label>
            <textarea
              id="description"
              value={formData.description}
              onChange={handleDescriptionChange}
              placeholder="Describe your campaign in detail. What is it? Why does it matter? Who needs it? What problem does it solve?"
              rows={8}
              className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-transparent outline-none transition resize-none font-mono text-sm ${
                validationErrors.description
                  ? 'border-red-300 bg-red-50'
                  : 'border-gray-200 focus:border-violet-500'
              }`}
            />
            <div className="flex justify-between mt-2">
              <p className="text-xs text-gray-500">
                {formData.description.length < MIN_DESCRIPTION
                  ? `Minimum ${MIN_DESCRIPTION} characters required`
                  : 'Great! You have enough detail.'}
              </p>
              <span className={`text-xs font-medium ${
                formData.description.length > MAX_DESCRIPTION * 0.9
                  ? 'text-red-500'
                  : formData.description.length > MAX_DESCRIPTION * 0.7
                    ? 'text-yellow-500'
                    : 'text-gray-400'
              }`}>
                {formData.description.length}/{MAX_DESCRIPTION}
              </span>
            </div>
            {validationErrors.description && (
              <div className="flex items-center gap-2 mt-2 text-red-600">
                <AlertCircle className="w-4 h-4" />
                <span className="text-xs">{validationErrors.description}</span>
              </div>
            )}
          </div>

          <div>
            <label htmlFor="problem" className="block text-sm font-semibold text-gray-900 mb-2">
              What Problem Does This Solve? <span className="text-red-500">*</span>
            </label>
            <input
              id="problem"
              type="text"
              value={formData.problem}
              onChange={handleProblemChange}
              placeholder="e.g., Many people with larger feet struggle to find premium athletic shoes in their size"
              className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-transparent outline-none transition ${
                validationErrors.problem
                  ? 'border-red-300 bg-red-50'
                  : 'border-gray-200 focus:border-violet-500'
              }`}
            />
            <p className="text-xs text-gray-500 mt-2">
              Be specific about the real-world issue this addresses.
            </p>
            {validationErrors.problem && (
              <div className="flex items-center gap-2 mt-2 text-red-600">
                <AlertCircle className="w-4 h-4" />
                <span className="text-xs">{validationErrors.problem}</span>
              </div>
            )}
          </div>

          <div>
            <label htmlFor="inspiration" className="block text-sm font-semibold text-gray-900 mb-2">
              What Inspired This Idea? <span className="text-red-500">*</span>
            </label>
            <input
              id="inspiration"
              type="text"
              value={formData.inspiration}
              onChange={handleInspirationChange}
              placeholder="e.g., I've worn the same shoe size since age 16, but still can't find options in premium brands"
              className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-transparent outline-none transition ${
                validationErrors.inspiration
                  ? 'border-red-300 bg-red-50'
                  : 'border-gray-200 focus:border-violet-500'
              }`}
            />
            <p className="text-xs text-gray-500 mt-2">
              Share the personal story behind your campaign.
            </p>
            {validationErrors.inspiration && (
              <div className="flex items-center gap-2 mt-2 text-red-600">
                <AlertCircle className="w-4 h-4" />
                <span className="text-xs">{validationErrors.inspiration}</span>
              </div>
            )}
          </div>
        </div>

        <div className="lg:col-span-1">
          <div className="bg-violet-50 border border-violet-200 rounded-lg p-4 sticky top-24">
            <h4 className="font-semibold text-gray-900 mb-3 text-sm">Writing Tips</h4>
            <ul className="space-y-3">
              {WRITING_PROMPTS.map((prompt, index) => (
                <li key={index} className="text-xs text-gray-700 flex gap-2">
                  <span className="font-semibold text-violet-600 flex-shrink-0">{index + 1}.</span>
                  <span>{prompt}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}
