'use client'

import { AlertCircle, Target, TrendingUp, Users, PartyPopper } from 'lucide-react'
import { useWizard } from './wizard-context'

const MAX_SUCCESS = 2000

const EXAMPLE_CRITERIA = [
  'A major brand publicly commits to producing this product',
  '10,000 supporters signal demand within 90 days',
  'A prototype is built and tested with real users',
  'The product launches at a price point under the ceiling set by supporters',
]

export function StepSuccess() {
  const { formData, setFormData, validationErrors, setValidationErrors } = useWizard()

  const handleChange = (value: string) => {
    const trimmed = value.slice(0, MAX_SUCCESS)
    setFormData({ successCriteria: trimmed })
    if (trimmed.length > 0 && validationErrors.successCriteria) {
      setValidationErrors({ ...validationErrors, successCriteria: '' })
    }
  }

  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <h2 className="text-2xl font-bold text-gray-900">Success Criteria</h2>
        <p className="text-gray-600">
          What does winning look like? Define clear goals so supporters know what they're rallying towards.
        </p>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div>
            <label htmlFor="successCriteria" className="block text-sm font-semibold text-gray-900 mb-2">
              What Would Success Look Like? <span className="text-red-500">*</span>
            </label>
            <p className="text-xs text-gray-500 mb-3">
              Describe the specific outcomes that would make this campaign a success. Be concrete and measurable where possible.
            </p>
            <textarea
              id="successCriteria"
              value={formData.successCriteria}
              onChange={(e) => handleChange(e.target.value)}
              placeholder="e.g., Success means Nike announces a Size 15 Air Max 90 within their next season. We'd need at least 5,000 supporters to demonstrate real demand. Ideally, the shoe would retail under £150 and be available in the same colourways as the standard range..."
              rows={8}
              className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-transparent outline-none transition resize-none text-sm ${
                validationErrors.successCriteria
                  ? 'border-red-300 bg-red-50'
                  : 'border-gray-200 focus:border-violet-500'
              }`}
            />
            <div className="flex justify-between mt-2">
              <p className="text-xs text-gray-500">
                {formData.successCriteria.length < 50
                  ? 'Add at least 50 characters'
                  : 'Looking good!'}
              </p>
              <span className={`text-xs font-medium ${
                formData.successCriteria.length > MAX_SUCCESS * 0.9
                  ? 'text-red-500'
                  : 'text-gray-400'
              }`}>
                {formData.successCriteria.length}/{MAX_SUCCESS}
              </span>
            </div>
            {validationErrors.successCriteria && (
              <div className="flex items-center gap-2 mt-2 text-red-600">
                <AlertCircle className="w-4 h-4" />
                <span className="text-xs">{validationErrors.successCriteria}</span>
              </div>
            )}
          </div>

          {/* Success milestones preview */}
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
            <h4 className="text-sm font-semibold text-gray-900 mb-3">Built-in milestones your campaign will track:</h4>
            <div className="grid grid-cols-2 gap-3">
              <div className="flex items-start gap-2">
                <Users className="w-4 h-4 text-violet-600 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-xs font-semibold text-gray-900">Supporter Count</p>
                  <p className="text-xs text-gray-600">Tracked automatically</p>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <TrendingUp className="w-4 h-4 text-violet-600 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-xs font-semibold text-gray-900">Signal Score</p>
                  <p className="text-xs text-gray-600">Measures momentum</p>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <Target className="w-4 h-4 text-violet-600 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-xs font-semibold text-gray-900">Brand Response</p>
                  <p className="text-xs text-gray-600">Tracked when brands engage</p>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <PartyPopper className="w-4 h-4 text-violet-600 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-xs font-semibold text-gray-900">Campaign Status</p>
                  <p className="text-xs text-gray-600">Live, active, or fulfilled</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="lg:col-span-1">
          <div className="bg-lime-50 border border-lime-200 rounded-lg p-4 sticky top-24">
            <h4 className="font-semibold text-gray-900 mb-3 text-sm">Example Success Criteria</h4>
            <ul className="space-y-3">
              {EXAMPLE_CRITERIA.map((example, index) => (
                <li key={index} className="text-xs text-gray-700 flex gap-2">
                  <span className="font-semibold text-lime-600 flex-shrink-0">{index + 1}.</span>
                  <span>{example}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}
