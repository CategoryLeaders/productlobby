'use client'

import { AlertCircle } from 'lucide-react'
import { useWizard } from './wizard-context'

const MIN_PRICE = 5
const MAX_PRICE = 10000

export function StepPricing() {
  const { formData, setFormData, validationErrors, setValidationErrors } = useWizard()

  const handleMinPriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = Math.max(MIN_PRICE, Math.min(Number(e.target.value), formData.maxPrice))
    setFormData({ minPrice: value })
    if (value >= MIN_PRICE) {
      setValidationErrors({ ...validationErrors, minPrice: '' })
    }
  }

  const handleMaxPriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = Math.max(formData.minPrice, Math.min(Number(e.target.value), MAX_PRICE))
    setFormData({ maxPrice: value })
    if (value <= MAX_PRICE) {
      setValidationErrors({ ...validationErrors, maxPrice: '' })
    }
  }

  const handleWillPayChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = Math.max(0, Math.min(Number(e.target.value), formData.maxPrice))
    setFormData({ willPay: value })
  }

  const getPriceComparison = () => {
    if (formData.minPrice <= 50 && formData.maxPrice <= 100) {
      return 'Similar budget products typically cost £30-£80'
    }
    if (formData.minPrice <= 200 && formData.maxPrice <= 500) {
      return 'Similar premium products typically cost £150-£400'
    }
    if (formData.minPrice > 500) {
      return 'High-end luxury products in this category typically exceed £500'
    }
    return 'Mid-range products typically cost £50-£150'
  }

  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <h2 className="text-2xl font-bold text-gray-900">Set Expectations</h2>
        <p className="text-gray-600">
          Help potential supporters understand the realistic price range for your campaign.
        </p>
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-4">
              Expected Price Range <span className="text-red-500">*</span>
            </label>

            <div className="space-y-4">
              <div className="bg-violet-50 border border-violet-200 rounded-lg p-4">
                <div className="flex items-baseline gap-3 mb-4">
                  <span className="text-3xl font-bold text-violet-600">£{formData.minPrice}</span>
                  <span className="text-gray-600">to</span>
                  <span className="text-3xl font-bold text-violet-600">£{formData.maxPrice}</span>
                </div>
                <p className="text-xs text-gray-600">
                  {getPriceComparison()}
                </p>
              </div>

              <div className="space-y-3">
                <div>
                  <label htmlFor="minPrice" className="block text-xs font-semibold text-gray-700 mb-1">
                    Minimum Price (£)
                  </label>
                  <input
                    id="minPrice"
                    type="range"
                    min={MIN_PRICE}
                    max={formData.maxPrice}
                    value={formData.minPrice}
                    onChange={handleMinPriceChange}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-violet-600"
                  />
                  <div className="flex justify-between mt-2">
                    <span className="text-xs text-gray-600">£{MIN_PRICE}</span>
                    <input
                      type="number"
                      value={formData.minPrice}
                      onChange={handleMinPriceChange}
                      className="w-20 px-2 py-1 border border-gray-200 rounded text-xs text-right"
                    />
                    <span className="text-xs text-gray-600">£{formData.maxPrice}</span>
                  </div>
                </div>

                <div>
                  <label htmlFor="maxPrice" className="block text-xs font-semibold text-gray-700 mb-1">
                    Maximum Price (£)
                  </label>
                  <input
                    id="maxPrice"
                    type="range"
                    min={formData.minPrice}
                    max={MAX_PRICE}
                    value={formData.maxPrice}
                    onChange={handleMaxPriceChange}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-violet-600"
                  />
                  <div className="flex justify-between mt-2">
                    <span className="text-xs text-gray-600">£{formData.minPrice}</span>
                    <input
                      type="number"
                      value={formData.maxPrice}
                      onChange={handleMaxPriceChange}
                      className="w-20 px-2 py-1 border border-gray-200 rounded text-xs text-right"
                    />
                    <span className="text-xs text-gray-600">£{MAX_PRICE}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div>
            <label htmlFor="willPay" className="block text-sm font-semibold text-gray-900 mb-2">
              How Much Would You Pay? <span className="text-red-500">*</span>
            </label>
            <div className="flex items-center gap-2">
              <span className="text-lg font-semibold text-gray-700">£</span>
              <input
                id="willPay"
                type="number"
                value={formData.willPay}
                onChange={handleWillPayChange}
                min="0"
                max={formData.maxPrice}
                className={`flex-1 px-4 py-3 border rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-transparent outline-none transition text-lg font-semibold ${
                  validationErrors.willPay
                    ? 'border-red-300 bg-red-50'
                    : 'border-gray-200'
                }`}
              />
            </div>
            <p className="text-xs text-gray-500 mt-2">
              Your personal willingness to pay helps validate demand.
            </p>
          </div>
        </div>

        <div>
          <div className="bg-lime-50 border border-lime-200 rounded-lg p-4 space-y-4 sticky top-24">
            <h4 className="font-semibold text-gray-900">Pricing Tips</h4>

            <div className="space-y-3">
              <div>
                <h5 className="text-xs font-semibold text-gray-900 mb-1">Research First</h5>
                <p className="text-xs text-gray-700">
                  Look at similar products from competitors to set realistic expectations.
                </p>
              </div>

              <div>
                <h5 className="text-xs font-semibold text-gray-900 mb-1">Factor in Costs</h5>
                <p className="text-xs text-gray-700">
                  Consider materials, manufacturing, shipping, and profit margins.
                </p>
              </div>

              <div>
                <h5 className="text-xs font-semibold text-gray-900 mb-1">Be Honest</h5>
                <p className="text-xs text-gray-700">
                  Supporters appreciate realistic pricing. Premium quality commands premium prices.
                </p>
              </div>

              <div>
                <h5 className="text-xs font-semibold text-gray-900 mb-1">Volume Matters</h5>
                <p className="text-xs text-gray-700">
                  Higher demand can justify lower prices. Set ranges, not fixed prices.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {validationErrors.willPay && (
        <div className="flex items-center gap-2 text-red-600">
          <AlertCircle className="w-4 h-4" />
          <span className="text-xs">{validationErrors.willPay}</span>
        </div>
      )}
    </div>
  )
}
