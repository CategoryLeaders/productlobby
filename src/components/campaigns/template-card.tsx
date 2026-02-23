'use client'

import React from 'react'
import Link from 'next/link'
import { CampaignTemplate } from '@/lib/campaign-templates'
import { cn } from '@/lib/utils'
import * as Icons from 'lucide-react'
import { Button } from '@/components/ui/button'

interface TemplateCardProps {
  template: CampaignTemplate
  onPreview?: (template: CampaignTemplate) => void
}

export function TemplateCard({ template, onPreview }: TemplateCardProps) {
  const IconComponent = (Icons as any)[template.icon] || Icons.Lightbulb

  return (
    <div className="group h-full overflow-hidden rounded-xl border border-gray-200 bg-white transition-all hover:border-violet-300 hover:shadow-lg dark:border-gray-800 dark:bg-gray-950">
      {/* Gradient Header */}
      <div
        className={cn(
          'flex h-32 flex-col items-center justify-center gap-2 bg-gradient-to-br text-white',
          `from-${template.coverGradient.split(' ')[1]} to-${template.coverGradient.split(' ')[3]}`
        )}
        style={{
          background: `linear-gradient(135deg, var(--color-1) 0%, var(--color-2) 100%)`,
          '--color-1': getGradientColor(template.coverGradient)[0],
          '--color-2': getGradientColor(template.coverGradient)[1],
        } as any}
      >
        <IconComponent className="h-10 w-10" strokeWidth={1.5} />
      </div>

      {/* Content */}
      <div className="flex flex-col gap-3 p-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{template.name}</h3>
          <p className="mt-1 line-clamp-2 text-sm text-gray-600 dark:text-gray-400">{template.description}</p>
        </div>

        {/* Category Badge */}
        <div className="flex items-center gap-2">
          <span className="inline-block rounded-full bg-violet-100 px-3 py-1 text-xs font-medium text-violet-700 dark:bg-violet-950 dark:text-violet-300">
            {template.category}
          </span>
          <span className="text-xs text-gray-600 dark:text-gray-400">{template.preferenceFields.length} fields</span>
        </div>

        {/* Actions */}
        <div className="flex gap-2 pt-2">
          <Button
            asChild
            size="sm"
            className="flex-1 bg-violet-600 hover:bg-violet-700"
          >
            <Link href={`/campaigns/new?template=${template.id}`}>Use Template</Link>
          </Button>
          {onPreview && (
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={() => onPreview(template)}
              className="flex-1"
            >
              Preview
            </Button>
          )}
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
