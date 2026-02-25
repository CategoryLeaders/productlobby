'use client'

import { useState } from 'react'
import { CheckCircle2, AlertCircle, Pencil } from 'lucide-react'
import { useWizard } from './wizard-context'

interface StepReviewProps {
  onEdit: (step: number) => void
}

const CATEGORY_LABELS: Record<string, string> = {
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

function SummaryRow({
  label,
  value,
  step,
  onEdit,
  truncate = false,
}: {
  label: string
  value: string
  step: number
  onEdit: (step: number) => void
  truncate?: boolean
}) {
  const isEmpty = !value || value === '0'
  return (
    <div className="flex items-start justify-between p-4 bg-gray-50 rounded-lg border border-gray-200">
      <div className="flex-1 min-w-0 mr-3">
        <p className="text-sm font-medium text-gray-900">{label}</p>
        <p className={`text-xs mt-1 ${isEmpty ? 'text-red-500 italic' : 'text-gray-600'} ${truncate ? 'line-clamp-2' : ''}`}>
          {isEmpty ? 'Not provided' : value}
        </p>
      </div>
      <button
        type="button"
        onClick={() => onEdit(step)}
        className="inline-flex items-center gap-1 text-xs font-medium text-violet-600 hover:text-violet-700 flex-shrink-0"
      >
        <Pencil className="w-3 h-3" />
        Edit
      </button>
    </div>
  )
}

export function StepReview({ onEdit }: StepReviewProps) {
  const { formData } = useWizard()
  const [acceptedTerms, setAcceptedTerms] = useState(false)

  const fields = [
    formData.title.length > 0,
    formData.category.length > 0,
    formData.tagline.length > 0,
    formData.problemStatement.length > 0,
    formData.description.length >= 100,
    formData.suggestedPrice > 0,
    formData.images.length > 0,
    formData.originStory.length > 0,
    formData.whyItMatters.length > 0,
    formData.successCriteria.length > 0,
  ]
  const completionScore = Math.round((fields.filter(Boolean).length / fields.length) * 100)

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
          {/* Campaign Card Preview */}
          <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
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
                    <p className="text-sm text-gray-500">No image uploaded yet</p>
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
                  {CATEGORY_LABELS[formData.category] || 'Category'}
                </span>
                {formData.targetBrand && (
                  <span className="inline-block px-3 py-1 rounded-full text-xs font-medium bg-lime-100 text-lime-700">
                    {formData.targetBrand}
                  </span>
                )}
              </div>

              {formData.suggestedPrice > 0 && (
                <div className="flex items-baseline gap-3 text-sm">
                  <span className="text-gray-500">Price range:</span>
                  <span className="font-semibold text-gray-900">
                    &pound;{formData.priceRangeMin} &ndash; &pound;{formData.priceRangeMax}
                  </span>
                  <span className="text-gray-400">|</span>
                  <span className="text-gray-500">I'd pay:</span>
                  <span className="font-semibold text-violet-600">&pound;{formData.suggestedPrice}</span>
                </div>
              )}
            </div>
          </div>

          {/* Full Summary */}
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-gray-900">Campaign Summary</h3>

            <div className="space-y-3">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Step 1 — The Idea</p>
              <SummaryRow label="Campaign Name" value={formData.title} step={1} onEdit={onEdit} />
              <SummaryRow label="Category" value={CATEGORY_LABELS[formData.category] || ''} step={1} onEdit={onEdit} />
              <SummaryRow label="One-liner" value={formData.tagline} step={1} onEdit={onEdit} />
              <SummaryRow label="Problem Statement" value={formData.problemStatement} step={1} onEdit={onEdit} truncate />

              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide pt-2">Step 2 — The Detail</p>
              <SummaryRow label="Full Description" value={formData.description} step={2} onEdit={onEdit} truncate />
              <SummaryRow label="Target Brand" value={formData.targetBrand || 'Open to any brand'} step={2} onEdit={onEdit} />
              <SummaryRow
                label="Price Range"
                value={`£${formData.priceRangeMin} – £${formData.priceRangeMax}`}
                step={2}
                onEdit={onEdit}
              />
              <SummaryRow
                label="What You'd Pay"
                value={formData.suggestedPrice > 0 ? `£${formData.suggestedPrice}` : ''}
                step={2}
                onEdit={onEdit}
              />

              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide pt-2">Step 3 — Visual Evidence</p>
              <SummaryRow
                label="Images"
                value={
                  formData.images.length > 0
                    ? `${formData.images.length} image${formData.images.length !== 1 ? 's' : ''} uploaded`
                    : ''
                }
                step={3}
                onEdit={onEdit}
              />
              <SummaryRow
                label="Video"
                value={formData.videoUrl || 'No video added'}
                step={3}
                onEdit={onEdit}
              />

              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide pt-2">Step 4 — The Pitch</p>
              <SummaryRow label="Origin Story" value={formData.originStory} step={4} onEdit={onEdit} truncate />
              <SummaryRow label="Why It Matters" value={formData.whyItMatters} step={4} onEdit={onEdit} truncate />

              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide pt-2">Step 5 — Success Criteria</p>
              <SummaryRow label="Success Criteria" value={formData.successCriteria} step={5} onEdit={onEdit} truncate />
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="lg:col-span-1 space-y-4">
          <div className="sticky top-24 space-y-4">
            {/* Completion Score */}
            <div className="bg-violet-50 border border-violet-200 rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <p className="font-semibold text-gray-900 text-sm">Campaign Completeness</p>
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

            {/* What Happens Next */}
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

            {/* Terms */}
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
