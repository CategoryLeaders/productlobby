'use client'

import { AlertCircle } from 'lucide-react'
import { useWizard } from './wizard-context'

const MIN_DESCRIPTION = 100
const MAX_DESCRIPTION = 2000
const MIN_PRICE = 5
const MAX_PRICE = 10000

const WRITING_PROMPTS = [
  'Who would benefit most from this? Be specific about the use case.',
  'How would your life be different if this existed?',
  'What alternatives exist today, and why are they inadequate?',
  'What would make this product perfect?',
]

export function StepDetail() {
  const { formData, setFormData, validationErrors, setValidationErrors } = useWizard()

  const handleDescriptionChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value.slice(0, MAX_DESCRIPTION)
    setFormData({ description: value })
    if (value.length >= MIN_DESCRIPTION) {
      setValidationErrors({ ...validationErrors, description: '' })
    }
  }

  const handleTargetBrandChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ targetBrand: e.target.value })
  }

  const handleMinPriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = Math.max(MIN_PRICE, Math.min(Number(e.target.value), formData.priceRangeMax))
    setFormData({ priceRangeMin: value })
  }

  const handleMaxPriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = Math.max(formData.priceRangeMin, Math.min(Number(e.target.value), MAX_PRICE))
    setFormData({ priceRangeMax: value })
  }

  const handleSuggestedPriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = Math.max(0, Math.min(Number(e.target.value), formData.priceRangeMax))
    setFormData({ suggestedPrice: value })
  }

  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <h2 className="text-2xl font-bold text-gray-900">The Detail</h2>
        <p className="text-gray-600">
          Flesh out the idea. The more detail you provide, the more compelling your campaign becomes.
        </p>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          {/* Full Description */}
          <div>
            <label htmlFor="description" className="block text-sm font-semibold text-gray-900 mb-2">
              Full Description <span className="text-red-500">*</span>
            </label>
            <textarea
              id="description"
              value={formData.description}
              onChange={handleDescriptionChange}
              placeholder="Describe your campaign in detail. What is the product? Why does it matter? Who needs it? How should it work?"
              rows={8}
              className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-transparent outline-none transition resize-none text-sm ${
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

          {/* Target Brand */}
          <div>
            <label htmlFor="targetBrand" className="block text-sm font-semibold text-gray-900 mb-2">
              Target Brand <span className="text-gray-500 font-normal">(optional)</span>
            </label>
            <input
              id="targetBrand"
              type="text"
              value={formData.targetBrand}
              onChange={handleTargetBrandChange}
              placeholder="e.g., Nike, Apple, Samsung, Dyson..."
              className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-transparent outline-none transition"
            />
            <p className="text-xs text-gray-500 mt-2">
              Which brand should make this? Leave blank if you're open to any brand.
            </p>
          </div>

          {/* Price Expectations */}
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-4">
              Price Expectations <span className="text-red-500">*</span>
            </label>

            <div className="bg-violet-50 border border-violet-200 rounded-lg p-4 mb-4">
              <div className="flex items-baseline gap-3 mb-2">
                <span className="text-2xl font-bold text-violet-600">&pound;{formData.priceRangeMin}</span>
                <span className="text-gray-600">to</span>
                <span className="text-2xl font-bold text-violet-600">&pound;{formData.priceRangeMax}</span>
              </div>
            </div>

            <div className="space-y-3">
              <div>
                <label htmlFor="priceRangeMin" className="block text-xs font-semibold text-gray-700 mb-1">
                  Minimum Price (&pound;)
                </label>
                <input
                  id="priceRangeMin"
                  type="range"
                  min={MIN_PRICE}
                  max={formData.priceRangeMax}
                  value={formData.priceRangeMin}
                  onChange={handleMinPriceChange}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-violet-600"
                />
                <div className="flex justify-between mt-1">
                  <span className="text-xs text-gray-600">&pound;{MIN_PRICE}</span>
                  <input
                    type="number"
                    value={formData.priceRangeMin}
                    onChange={handleMinPriceChange}
                    className="w-20 px-2 py-1 border border-gray-200 rounded text-xs text-right"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="priceRangeMax" className="block text-xs font-semibold text-gray-700 mb-1">
                  Maximum Price (&pound;)
                </label>
                <input
                  id="priceRangeMax"
                  type="range"
                  min={formData.priceRangeMin}
                  max={MAX_PRICE}
                  value={formData.priceRangeMax}
                  onChange={handleMaxPriceChange}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-violet-600"
                />
                <div className="flex justify-between mt-1">
                  <span className="text-xs text-gray-600">&pound;{formData.priceRangeMin}</span>
                  <input
                    type="number"
                    value={formData.priceRangeMax}
                    onChange={handleMaxPriceChange}
                    className="w-20 px-2 py-1 border border-gray-200 rounded text-xs text-right"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="suggestedPrice" className="block text-xs font-semibold text-gray-700 mb-1">
                  What Would You Pay? (&pound;) <span className="text-red-500">*</span>
                </label>
                <div className="flex items-center gap-2">
                  <span className="text-lg font-semibold text-gray-700">&pound;</span>
                  <input
                    id="suggestedPrice"
                    type="number"
                    value={formData.suggestedPrice}
                    onChange={handleSuggestedPriceChange}
                    min="0"
                    max={formData.priceRangeMax}
                    className={`flex-1 px-4 py-3 border rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-transparent outline-none transition text-lg font-semibold ${
                      validationErrors.suggestedPrice
                        ? 'border-red-300 bg-red-50'
                        : 'border-gray-200'
                    }`}
                  />
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  Your personal willingness to pay helps validate demand.
                </p>
                {validationErrors.suggestedPrice && (
                  <div className="flex items-center gap-2 mt-2 text-red-600">
                    <AlertCircle className="w-4 h-4" />
                    <span className="text-xs">{validationErrors.suggestedPrice}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar Tips */}
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
