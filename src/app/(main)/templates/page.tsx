'use client'

import React, { useState, useMemo } from 'react'
import { DashboardLayout } from '@/components/shared/dashboard-layout'
import { PageHeader } from '@/components/shared/page-header'
import { cn } from '@/lib/utils'
import Link from 'next/link'

// Template data structure
interface CampaignTemplate {
  id: string
  slug: string
  title: string
  description: string
  category: string
  imageUrl: string
}

// Hardcoded templates
const TEMPLATES: CampaignTemplate[] = [
  {
    id: 'product-return',
    slug: 'product-return',
    title: 'Product Return Program',
    description: 'Campaign for advocating better product return policies and customer service',
    category: 'Consumer Rights',
    imageUrl: 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="400" height="250"%3E%3Crect fill="%23f3f4f6" width="400" height="250"/%3E%3Ctext x="50%25" y="50%25" dominant-baseline="middle" text-anchor="middle" font-family="system-ui" font-size="24" fill="%23374151"%3EProduct Return Program%3C/text%3E%3C/svg%3E',
  },
  {
    id: 'feature-request',
    slug: 'feature-request',
    title: 'Feature Request',
    description: 'Request new features or improvements to existing products',
    category: 'Product Development',
    imageUrl: 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="400" height="250"%3E%3Crect fill="%23f3f4f6" width="400" height="250"/%3E%3Ctext x="50%25" y="50%25" dominant-baseline="middle" text-anchor="middle" font-family="system-ui" font-size="24" fill="%23374151"%3EFeature Request%3C/text%3E%3C/svg%3E',
  },
  {
    id: 'size-color-variant',
    slug: 'size-color-variant',
    title: 'Size/Color Variant',
    description: 'Campaign to request specific sizes, colors, or variations of a product',
    category: 'Product Variants',
    imageUrl: 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="400" height="250"%3E%3Crect fill="%23f3f4f6" width="400" height="250"/%3E%3Ctext x="50%25" y="50%25" dominant-baseline="middle" text-anchor="middle" font-family="system-ui" font-size="24" fill="%23374151"%3ESize/Color Variant%3C/text%3E%3C/svg%3E',
  },
  {
    id: 'price-reduction',
    slug: 'price-reduction',
    title: 'Price Reduction Campaign',
    description: 'Advocate for lower pricing on quality products',
    category: 'Pricing',
    imageUrl: 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="400" height="250"%3E%3Crect fill="%23f3f4f6" width="400" height="250"/%3E%3Ctext x="50%25" y="50%25" dominant-baseline="middle" text-anchor="middle" font-family="system-ui" font-size="24" fill="%23374151"%3EPrice Reduction%3C/text%3E%3C/svg%3E',
  },
  {
    id: 'sustainability',
    slug: 'sustainability',
    title: 'Sustainability Initiative',
    description: 'Campaign for eco-friendly and sustainable product practices',
    category: 'Sustainability',
    imageUrl: 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="400" height="250"%3E%3Crect fill="%23f3f4f6" width="400" height="250"/%3E%3Ctext x="50%25" y="50%25" dominant-baseline="middle" text-anchor="middle" font-family="system-ui" font-size="24" fill="%23374151"%3ESustainability%3C/text%3E%3C/svg%3E',
  },
  {
    id: 'collaboration',
    slug: 'collaboration',
    title: 'Collaboration Campaign',
    description: 'Request collaboration between brands or product partnerships',
    category: 'Partnerships',
    imageUrl: 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="400" height="250"%3E%3Crect fill="%23f3f4f6" width="400" height="250"/%3E%3Ctext x="50%25" y="50%25" dominant-baseline="middle" text-anchor="middle" font-family="system-ui" font-size="24" fill="%23374151"%3ECollaboration%3C/text%3E%3C/svg%3E',
  },
  {
    id: 'limited-edition',
    slug: 'limited-edition',
    title: 'Limited Edition Release',
    description: 'Campaign for limited edition or exclusive product releases',
    category: 'Exclusive Offerings',
    imageUrl: 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="400" height="250"%3E%3Crect fill="%23f3f4f6" width="400" height="250"/%3E%3Ctext x="50%25" y="50%25" dominant-baseline="middle" text-anchor="middle" font-family="system-ui" font-size="24" fill="%23374151"%3ELimited Edition%3C/text%3E%3C/svg%3E',
  },
  {
    id: 'accessibility',
    slug: 'accessibility',
    title: 'Accessibility Improvements',
    description: 'Campaign for better accessibility features and inclusive design',
    category: 'Accessibility',
    imageUrl: 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="400" height="250"%3E%3Crect fill="%23f3f4f6" width="400" height="250"/%3E%3Ctext x="50%25" y="50%25" dominant-baseline="middle" text-anchor="middle" font-family="system-ui" font-size="24" fill="%23374151"%3EAccessibility%3C/text%3E%3C/svg%3E',
  },
]

// Get unique categories
const CATEGORIES = ['All', ...Array.from(new Set(TEMPLATES.map(t => t.category)))]

export default function TemplateLibraryPage() {
  const [selectedCategory, setSelectedCategory] = useState('All')

  // Filter templates based on selected category
  const filteredTemplates = useMemo(() => {
    if (selectedCategory === 'All') {
      return TEMPLATES
    }
    return TEMPLATES.filter(t => t.category === selectedCategory)
  }, [selectedCategory])

  return (
    <DashboardLayout role="supporter">
      <div className="space-y-8">
        <PageHeader
          title="Campaign Templates"
          description="Start your campaign with pre-built templates designed to help you advocate effectively"
        />

        {/* Category Filter */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 flex-wrap">
            {CATEGORIES.map(category => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={cn(
                  'px-4 py-2 rounded-lg border transition-colors',
                  selectedCategory === category
                    ? 'bg-blue-500 text-white border-blue-500'
                    : 'bg-white text-gray-700 border-gray-200 hover:border-gray-300'
                )}
              >
                {category}
              </button>
            ))}
          </div>
        </div>

        {/* Templates Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTemplates.map(template => (
            <div
              key={template.id}
              className="bg-white rounded-lg border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow"
            >
              {/* Image Placeholder */}
              <div className="w-full h-40 bg-gray-100 overflow-hidden flex items-center justify-center">
                <img
                  src={template.imageUrl}
                  alt={template.title}
                  className="w-full h-full object-cover"
                />
              </div>

              {/* Content */}
              <div className="p-4 space-y-3">
                <div>
                  <div className="text-xs font-medium text-blue-600 mb-1">
                    {template.category}
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    {template.title}
                  </h3>
                </div>

                <p className="text-sm text-gray-600 line-clamp-2">
                  {template.description}
                </p>

                {/* Use Template Button */}
                <Link
                  href={`/campaigns/new?template=${template.slug}`}
                  className="block w-full text-center bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 rounded-lg transition-colors"
                >
                  Use Template
                </Link>
              </div>
            </div>
          ))}
        </div>

        {/* Empty State */}
        {filteredTemplates.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500">No templates found in this category.</p>
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}
