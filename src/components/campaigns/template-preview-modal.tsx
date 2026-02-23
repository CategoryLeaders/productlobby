'use client'

import React from 'react'
import Link from 'next/link'
import { CampaignTemplate } from '@/lib/campaign-templates'
import { Button } from '@/components/ui/button'
import { X } from 'lucide-react'
import * as Icons from 'lucide-react'

interface TemplatePreviewModalProps {
  template: CampaignTemplate
  isOpen: boolean
  onClose: () => void
}

export function TemplatePreviewModal({ template, isOpen, onClose }: TemplatePreviewModalProps) {
  if (!isOpen) return null

  const IconComponent = (Icons as any)[template.icon] || Icons.Lightbulb

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      {/* Modal Card */}
      <div className="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl bg-white shadow-2xl dark:bg-gray-950">
        {/* Header with Close */}
        <div className="sticky top-0 flex items-center justify-between border-b border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-950">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{template.name}</h2>
            <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">{template.description}</p>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-2 hover:bg-gray-100 dark:hover:bg-gray-800"
            aria-label="Close"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Content */}
        <div className="space-y-6 p-6">
          {/* Icon and Category */}
          <div className="flex items-center gap-4">
            <div
              className="flex h-16 w-16 items-center justify-center rounded-lg text-white"
              style={{
                background: `linear-gradient(135deg, ${getGradientColor(template.coverGradient)[0]} 0%, ${getGradientColor(template.coverGradient)[1]} 100%)`,
              }}
            >
              <IconComponent className="h-8 w-8" strokeWidth={1.5} />
            </div>
            <div>
              <span className="inline-block rounded-full bg-violet-100 px-3 py-1 text-xs font-medium text-violet-700 dark:bg-violet-950 dark:text-violet-300">
                {template.category}
              </span>
            </div>
          </div>

          {/* Structure Information */}
          <div className="space-y-4 rounded-lg bg-gray-50 p-4 dark:bg-gray-900">
            <h3 className="font-semibold text-gray-900 dark:text-white">Template Structure</h3>

            <div className="space-y-3">
              <div>
                <label className="text-xs font-medium uppercase text-gray-600 dark:text-gray-400">
                  Title Pattern
                </label>
                <p className="mt-1 text-sm text-gray-900 dark:text-gray-100">
                  {template.structure.titlePattern}
                </p>
              </div>

              <div>
                <label className="text-xs font-medium uppercase text-gray-600 dark:text-gray-400">
                  Description Template
                </label>
                <p className="mt-1 text-sm text-gray-900 dark:text-gray-100">
                  {template.structure.descriptionTemplate}
                </p>
              </div>

              <div>
                <label className="text-xs font-medium uppercase text-gray-600 dark:text-gray-400">
                  Problem Statement
                </label>
                <p className="mt-1 text-sm text-gray-900 dark:text-gray-100">
                  {template.structure.problemStatement}
                </p>
              </div>

              <div>
                <label className="text-xs font-medium uppercase text-gray-600 dark:text-gray-400">
                  Ideal Outcome
                </label>
                <p className="mt-1 text-sm text-gray-900 dark:text-gray-100">
                  {template.structure.idealOutcome}
                </p>
              </div>
            </div>
          </div>

          {/* Preference Fields */}
          <div className="space-y-3">
            <h3 className="font-semibold text-gray-900 dark:text-white">
              Pre-filled Fields ({template.preferenceFields.length})
            </h3>
            <div className="space-y-2">
              {template.preferenceFields.map((field, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between rounded-lg border border-gray-200 bg-white p-3 dark:border-gray-800 dark:bg-gray-900"
                >
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      {field.fieldName}
                    </p>
                    <p className="text-xs text-gray-600 dark:text-gray-400">
                      Type: {field.fieldType}
                    </p>
                  </div>
                  {field.options && (
                    <span className="rounded-full bg-lime-100 px-2 py-1 text-xs font-medium text-lime-700 dark:bg-lime-950 dark:text-lime-300">
                      {field.options.length} options
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Tips */}
          <div className="space-y-3">
            <h3 className="font-semibold text-gray-900 dark:text-white">Tips for Success</h3>
            <ul className="space-y-2">
              {template.tips.map((tip, idx) => (
                <li key={idx} className="flex gap-3 text-sm text-gray-700 dark:text-gray-300">
                  <span className="mt-1 inline-block h-2 w-2 flex-shrink-0 rounded-full bg-violet-500" />
                  <span>{tip}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* CTA Button */}
          <div className="flex gap-3 border-t border-gray-200 pt-6 dark:border-gray-800">
            <Button
              asChild
              size="lg"
              className="flex-1 bg-violet-600 hover:bg-violet-700"
            >
              <Link href={`/campaigns/new?template=${template.id}`}>Use This Template</Link>
            </Button>
            <Button
              type="button"
              size="lg"
              variant="outline"
              onClick={onClose}
              className="flex-1"
            >
              Close
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

// Helper function to get actual gradient colors from Tailwind palette
function getGradientColor(gradientString: string): [string, string] {
  const gradients: Record<string, [string, string]> = {
    'from-violet-500 to-purple-600': ['#a78bfa', '#9333ea'],
    'from-pink-500 to-rose-600': ['#ec4899', '#e11d48'],
    'from-orange-500 to-amber-600': ['#f97316', '#b45309'],
    'from-green-500 to-emerald-600': ['#22c55e', '#059669'],
    'from-blue-500 to-cyan-600': ['#3b82f6', '#0891b2'],
    'from-yellow-500 to-amber-600': ['#eab308', '#b45309'],
    'from-red-500 to-rose-600': ['#ef4444', '#e11d48'],
    'from-purple-500 to-pink-600': ['#a855f7', '#ec4899'],
  }
  return gradients[gradientString] || ['#8b5cf6', '#6d28d9']
}
