'use client'

import React, { useState } from 'react'
import { FlaskConical, Sparkles, ArrowLeftRight, Play, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { cn } from '@/lib/utils'

interface SplitTestVariant {
  label: string
  description: string
}

interface SplitTestData {
  testName: string
  variantA: SplitTestVariant
  variantB: SplitTestVariant
  trafficSplit: number
  testDuration: number
}

interface SplitTestCreatorProps {
  campaignId: string
  onTestCreated?: (test: SplitTestData) => void
}

const TRAFFIC_SPLIT_OPTIONS = [
  { label: '50/50', value: 50 },
  { label: '60/40', value: 60 },
  { label: '70/30', value: 70 },
  { label: '80/20', value: 80 },
]

const TEST_DURATION_OPTIONS = [
  { label: '7 days', value: 7 },
  { label: '14 days', value: 14 },
  { label: '30 days', value: 30 },
]

export const SplitTestCreator: React.FC<SplitTestCreatorProps> = ({
  campaignId,
  onTestCreated,
}) => {
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState<SplitTestData>({
    testName: '',
    variantA: {
      label: 'Variant A',
      description: '',
    },
    variantB: {
      label: 'Variant B',
      description: '',
    },
    trafficSplit: 50,
    testDuration: 14,
  })

  const [errors, setErrors] = useState<Record<string, string>>({})

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {}

    if (!formData.testName.trim()) {
      newErrors.testName = 'Test name is required'
    }

    if (!formData.variantA.label.trim()) {
      newErrors.variantALabel = 'Variant A label is required'
    }

    if (!formData.variantA.description.trim()) {
      newErrors.variantADescription = 'Variant A description is required'
    }

    if (!formData.variantB.label.trim()) {
      newErrors.variantBLabel = 'Variant B label is required'
    }

    if (!formData.variantB.description.trim()) {
      newErrors.variantBDescription = 'Variant B description is required'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    try {
      setLoading(true)

      if (onTestCreated) {
        onTestCreated(formData)
      }

      // Reset form
      setFormData({
        testName: '',
        variantA: {
          label: 'Variant A',
          description: '',
        },
        variantB: {
          label: 'Variant B',
          description: '',
        },
        trafficSplit: 50,
        testDuration: 14,
      })
      setErrors({})
    } catch (error) {
      console.error('Error creating split test:', error)
      setErrors({ submit: 'Failed to create split test' })
    } finally {
      setLoading(false)
    }
  }

  const variantATraffic = formData.trafficSplit
  const variantBTraffic = 100 - formData.trafficSplit

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <FlaskConical className="w-6 h-6 text-violet-600" />
        <h3 className="text-lg font-semibold text-slate-900">Create A/B Test Variant</h3>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Test Name */}
        <div>
          <Input
            label="Test Name"
            placeholder="e.g., Homepage CTA Button Test"
            value={formData.testName}
            onChange={(e) => setFormData({ ...formData, testName: e.target.value })}
            error={errors.testName}
          />
        </div>

        {/* Variants Section */}
        <div className="space-y-6">
          <h4 className="text-sm font-semibold text-slate-900 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-500" />
            Define Variants
          </h4>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Variant A */}
            <div className="border border-slate-200 rounded-lg p-6 space-y-4 bg-slate-50">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-3 h-3 rounded-full bg-blue-500" />
                <h5 className="font-medium text-slate-900">Variant A</h5>
              </div>

              <Input
                label="Label"
                placeholder="e.g., Original Design"
                value={formData.variantA.label}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    variantA: { ...formData.variantA, label: e.target.value },
                  })
                }
                error={errors.variantALabel}
              />

              <Textarea
                label="Description"
                placeholder="Describe what makes this variant unique..."
                value={formData.variantA.description}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    variantA: { ...formData.variantA, description: e.target.value },
                  })
                }
                error={errors.variantADescription}
                rows={4}
              />
            </div>

            {/* Variant B */}
            <div className="border border-slate-200 rounded-lg p-6 space-y-4 bg-slate-50">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-3 h-3 rounded-full bg-lime-500" />
                <h5 className="font-medium text-slate-900">Variant B</h5>
              </div>

              <Input
                label="Label"
                placeholder="e.g., Alternative Design"
                value={formData.variantB.label}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    variantB: { ...formData.variantB, label: e.target.value },
                  })
                }
                error={errors.variantBLabel}
              />

              <Textarea
                label="Description"
                placeholder="Describe what makes this variant unique..."
                value={formData.variantB.description}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    variantB: { ...formData.variantB, description: e.target.value },
                  })
                }
                error={errors.variantBDescription}
                rows={4}
              />
            </div>
          </div>
        </div>

        {/* Traffic Split */}
        <div className="space-y-4">
          <h4 className="text-sm font-semibold text-slate-900 flex items-center gap-2">
            <ArrowLeftRight className="w-4 h-4 text-indigo-600" />
            Traffic Split
          </h4>

          <div className="grid grid-cols-4 gap-2">
            {TRAFFIC_SPLIT_OPTIONS.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => setFormData({ ...formData, trafficSplit: option.value })}
                className={cn(
                  'py-2 px-3 rounded-lg border-2 text-sm font-medium transition-colors',
                  formData.trafficSplit === option.value
                    ? 'border-violet-600 bg-violet-50 text-violet-700'
                    : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300'
                )}
              >
                {option.label}
              </button>
            ))}
          </div>

          {/* Traffic Split Preview */}
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <div className="h-2 bg-slate-200 rounded-full overflow-hidden flex">
                <div
                  className="bg-blue-500 transition-all duration-200"
                  style={{ width: `${variantATraffic}%` }}
                />
                <div
                  className="bg-lime-500 transition-all duration-200"
                  style={{ width: `${variantBTraffic}%` }}
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <p className="text-xs text-blue-600 font-medium mb-1">Variant A</p>
              <p className="text-lg font-bold text-blue-700">{variantATraffic}%</p>
            </div>
            <div className="bg-lime-50 border border-lime-200 rounded-lg p-3">
              <p className="text-xs text-lime-600 font-medium mb-1">Variant B</p>
              <p className="text-lg font-bold text-lime-700">{variantBTraffic}%</p>
            </div>
          </div>
        </div>

        {/* Test Duration */}
        <div className="space-y-4">
          <label className="text-sm font-semibold text-slate-900">Test Duration</label>

          <div className="grid grid-cols-3 gap-3">
            {TEST_DURATION_OPTIONS.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => setFormData({ ...formData, testDuration: option.value })}
                className={cn(
                  'py-2 px-3 rounded-lg border-2 text-sm font-medium transition-colors',
                  formData.testDuration === option.value
                    ? 'border-violet-600 bg-violet-50 text-violet-700'
                    : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300'
                )}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>

        {/* Side-by-Side Preview */}
        <div className="space-y-4">
          <h4 className="text-sm font-semibold text-slate-900">Preview</h4>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Variant A Preview */}
            <div className="border border-blue-200 rounded-lg p-6 bg-gradient-to-br from-blue-50 to-white">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-3 h-3 rounded-full bg-blue-500" />
                <h5 className="font-semibold text-slate-900">{formData.variantA.label}</h5>
              </div>
              <p className="text-sm text-slate-700 leading-relaxed">
                {formData.variantA.description || '(No description yet)'}
              </p>
              <div className="mt-4 pt-4 border-t border-blue-200">
                <span className="inline-block px-2 py-1 bg-blue-100 text-blue-700 text-xs font-medium rounded">
                  {variantATraffic}% traffic
                </span>
              </div>
            </div>

            {/* Variant B Preview */}
            <div className="border border-lime-200 rounded-lg p-6 bg-gradient-to-br from-lime-50 to-white">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-3 h-3 rounded-full bg-lime-500" />
                <h5 className="font-semibold text-slate-900">{formData.variantB.label}</h5>
              </div>
              <p className="text-sm text-slate-700 leading-relaxed">
                {formData.variantB.description || '(No description yet)'}
              </p>
              <div className="mt-4 pt-4 border-t border-lime-200">
                <span className="inline-block px-2 py-1 bg-lime-100 text-lime-700 text-xs font-medium rounded">
                  {variantBTraffic}% traffic
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Error Message */}
        {errors.submit && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-800 text-sm">{errors.submit}</p>
          </div>
        )}

        {/* Submit Button */}
        <div className="flex gap-3">
          <Button
            type="submit"
            variant="primary"
            size="lg"
            disabled={loading}
            className="flex items-center gap-2"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Creating Test...
              </>
            ) : (
              <>
                <Play className="w-4 h-4" />
                Start Test
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  )
}

export default SplitTestCreator
