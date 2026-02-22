'use client'

import { useState } from 'react'
import { AlertCircle, CheckCircle2 } from 'lucide-react'
import { useWizard } from './wizard-context'

interface StepReviewProps {
  onEdit: (step: number) => void
}

export function StepReview({ onEdit }: StepReviewProps) {
  const { formData } = useWizard()
  const [acceptedTerms, setAcceptedTerms] = useState(false)

  const getCategoryLabel = (value: string) => {
    const categories: Record<string, string> = {
      apparel: 'Apparel',
      tech: 'Tech',
      audio: 'Audio',
      wearables: 'Wearables',
      home: 'Home',
      sports: 'Sports',
      automotive: 'Automotive',
      food_drink: 'Food & Drink',
      beauty: 'Beauty',
      gaming: 'Gaming',
      pets: 'Pets',
      other: 'Other',
    }
    return categories[value] || value
  }

  const completionScore = Math.round(
    ((formData.title.length > 0 ? 1 : 0) +
      (formData.tagline.length > 0 ? 1 : 0) +
      (formData.category.length > 0 ? 1 : 0) +
      (formData.description.length >= 100 ? 1 : 0) +
      (formData.problem.length > 0 ? 1 : 0) +
      (formData.inspiration.length > 0 ? 1 : 0) +
      (formData.images.length > 0 ? 1 : 0)) /
      7 *
      100
  )

  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <h2 className="text-2xl font-bold text-gray-900">Review & Launch</h2>
        <p className="text-gray-600">
          Here's how your campaign will appear to supporters. Review everything and make sure it looks great.
        </p>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition">
            <div className="aspect-video bg-gradient-to-br from-violet-100 to-violet-50 relative overflow-hidden">
              {formData.images.length > 0 ? (
                <img
                  src={formData.images[0]}
                  alt="Campaign hero"
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <div className="text-center">
                    <div className="text-4xl mb-2">📷</div>
                    <p className="text-sm text-gray-500">No image uploaded</p>
                  </div>
                </div>
              )}
            </div>

            <div className="p-6 space-y-4">
              <div>
                <h3 className="text-xl font-bold text-gray-900">{formData.title || 'Campaign Title'}</h3>
                <p className="text-sm text-gray-600 mt-1">{formData.tagline || 'Your tagline here'}</p>
              </div>

              <div className="flex flex-wrap gap-2">
                <span className="inline-block px-3 py-1 rounded-full text-xs font-medium bg-violet-100 text-violet-700">
                  {getCategoryLabel(formData.category) || 'Category'}
                </span>
              </div>

              <div className="border-t border-gray-200 pt-4">
                <p className="text-sm font-semibold text-gray-900 mb-2">About this campaign</p>
                <p className="text-sm text-gray-600 line-clamp-3">
                  {formData.description || 'Campaign description goes here...'}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4 border-t border-gray-200 pt-4">
                <div>
                  <p className="text-xs text-gray-500 font-medium mb-1">Problem Solved</p>
                  <p className="text-sm text-gray-900 font-semibold">
                    {formData.problem || 'Problem description'}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 font-medium mb-1">Expected Price</p>
                  <p className="text-sm text-gray-900 font-semibold">
                    £{formData.minPrice} - £{formData.maxPrice}
                  </p>
                </div>
              </div>

              {formData.images.length > 1 && (
                <div className="border-t border-gray-200 pt-4">
                  <p className="text-xs text-gray-500 font-medium mb-2">More Images</p>
                  <div className="grid grid-cols-4 gap-2">
                    {formData.images.slice(1).map((url, index) => (
                      <img
                        key={index}
                        src={url}
                        alt={`Campaign image ${index + 2}`}
                        className="w-full h-20 object-cover rounded"
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-bold text-gray-900">Campaign Summary</h3>

            <div className="space-y-3">
              <div className="flex items-start justify-between p-4 bg-gray-50 rounded-lg border border-gray-200">
                <div>
                  <p className="text-sm font-medium text-gray-900">Title</p>
                  <p className="text-xs text-gray-600 mt-1">{formData.title || 'Not provided'}</p>
                </div>
                <button
                  type="button"
                  onClick={() => onEdit(1)}
                  className="text-xs font-medium text-violet-600 hover:text-violet-700"
                >
                  Edit
                </button>
              </div>

              <div className="flex items-start justify-between p-4 bg-gray-50 rounded-lg border border-gray-200">
                <div>
                  <p className="text-sm font-medium text-gray-900">Category</p>
                  <p className="text-xs text-gray-600 mt-1">{getCategoryLabel(formData.category) || 'Not selected'}</p>
                </div>
                <button
                  type="button"
                  onClick={() => onEdit(1)}
                  className="text-xs font-medium text-violet-600 hover:text-violet-700"
                >
                  Edit
                </button>
              </div>

              <div className="flex items-start justify-between p-4 bg-gray-50 rounded-lg border border-gray-200">
                <div>
                  <p className="text-sm font-medium text-gray-900">Description</p>
                  <p className="text-xs text-gray-600 mt-1 line-clamp-2">{formData.description || 'Not provided'}</p>
                </div>
                <button
                  type="button"
                  onClick={() => onEdit(2)}
                  className="text-xs font-medium text-violet-600 hover:text-violet-700 flex-shrink-0 ml-2"
                >
                  Edit
                </button>
              </div>

              <div className="flex items-start justify-between p-4 bg-gray-50 rounded-lg border border-gray-200">
                <div>
                  <p className="text-sm font-medium text-gray-900">Price Range</p>
                  <p className="text-xs text-gray-600 mt-1">£{formData.minPrice} - £{formData.maxPrice}</p>
                </div>
                <button
                  type="button"
                  onClick={() => onEdit(3)}
                  className="text-xs font-medium text-violet-600 hover:text-violet-700"
                >
                  Edit
                </button>
              </div>

              <div className="flex items-start justify-between p-4 bg-gray-50 rounded-lg border border-gray-200">
                <div>
                  <p className="text-sm font-medium text-gray-900">Visuals</p>
                  <p className="text-xs text-gray-600 mt-1">
                    {formData.images.length} image{formData.images.length !== 1 ? 's' : ''}
                    {formData.videoUrl ? ' + 1 video' : ''}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => onEdit(4)}
                  className="text-xs font-medium text-violet-600 hover:text-violet-700"
                >
                  Edit
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="lg:col-span-1 space-y-4">
          <div className="sticky top-24 space-y-4">
            <div className="bg-violet-50 border border-violet-200 rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <p className="font-semibold text-gray-900">Campaign Completeness</p>
                <span className="text-lg font-bold text-violet-600">{completionScore}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-violet-600 h-2 rounded-full transition-all"
                  style={{ width: `${completionScore}%` }}
                />
              </div>
              <p className="text-xs text-gray-600 mt-2">
                {completionScore === 100
                  ? 'Perfect! Your campaign is fully ready to launch.'
                  : completionScore >= 80
                    ? 'Great! Minor details remaining.'
                    : completionScore >= 50
                      ? 'Good progress. Keep adding details.'
                      : 'Add more information to strengthen your campaign.'}
              </p>
            </div>

            <div className="bg-white border border-gray-200 rounded-lg p-4 space-y-3">
              <h4 className="font-semibold text-gray-900 text-sm">What Happens Next</h4>
              <ul className="space-y-2 text-xs text-gray-700">
                <li className="flex gap-2">
                  <CheckCircle2 className="w-4 h-4 text-lime-500 flex-shrink-0 mt-0.5" />
                  <span>Your campaign goes live immediately</span>
                </li>
                <li className="flex gap-2">
                  <CheckCircle2 className="w-4 h-4 text-lime-500 flex-shrink-0 mt-0.5" />
                  <span>Start receiving lobbies and support</span>
                </li>
                <li className="flex gap-2">
                  <CheckCircle2 className="w-4 h-4 text-lime-500 flex-shrink-0 mt-0.5" />
                  <span>Track impact with real-time analytics</span>
                </li>
                <li className="flex gap-2">
                  <CheckCircle2 className="w-4 h-4 text-lime-500 flex-shrink-0 mt-0.5" />
                  <span>Connect with supporters and brands</span>
                </li>
              </ul>
            </div>

            <div className="bg-lime-50 border border-lime-200 rounded-lg p-4">
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={acceptedTerms}
                  onChange={(e) => setAcceptedTerms(e.target.checked)}
                  className="w-4 h-4 rounded border-gray-300 mt-0.5 accent-violet-600"
                />
                <span className="text-xs text-gray-700">
                  I agree to the{' '}
                  <a href="/terms" className="font-semibold text-violet-600 hover:underline">
                    Terms of Service
                  </a>{' '}
                  and{' '}
                  <a href="/privacy" className="font-semibold text-violet-600 hover:underline">
                    Privacy Policy
                  </a>
                  . I confirm this campaign complies with all platform guidelines.
                </span>
              </label>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
