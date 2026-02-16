'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { ArrowRight, Zap } from 'lucide-react'
import { Navbar } from '@/components/shared/navbar'
import { Footer } from '@/components/shared/footer'
import { PageHeader } from '@/components/shared/page-header'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card'
import { cn } from '@/lib/utils'

const DEMO_STORIES = [
  {
    id: 1,
    slug: 'nike-womens-running-shoes-extended-sizes',
    title: "Nike Women's Running Shoes in Extended Sizes",
    category: 'Fashion & Footwear',
    brand: 'Nike',
    brandLogo: '🔵',
    heroEmoji: '👟',
    image: 'bg-gradient-to-br from-slate-100 to-slate-50',
    stat: '2,847 lobbied → Product shipped',
    description: 'Extended sizes 14+ now available across Nike women\'s running line',
    date: '2026-02-08',
    success: true,
  },
  {
    id: 2,
    slug: 'allbirds-carbon-negative-materials',
    title: 'Allbirds: 100% Carbon Negative Shoes',
    category: 'Sustainability',
    brand: 'Allbirds',
    brandLogo: '🌳',
    heroEmoji: '👟',
    image: 'bg-gradient-to-br from-green-100 to-green-50',
    stat: '1,956 lobbied → 60% ready',
    description: 'Expanding carbon negative materials across entire core collection',
    date: '2026-01-15',
    success: true,
  },
  {
    id: 3,
    slug: 'ikea-flat-pack-assembly-service',
    title: 'IKEA Flat-Pack Assembly Service',
    category: 'Home & Furniture',
    brand: 'IKEA',
    brandLogo: '🏠',
    heroEmoji: '🪛',
    image: 'bg-gradient-to-br from-yellow-100 to-yellow-50',
    stat: '3,421 lobbied → In 50 stores',
    description: 'Professional assembly service now available in major IKEA locations',
    date: '2025-12-10',
    success: true,
  },
  {
    id: 4,
    slug: 'dyson-student-discount-program',
    title: 'Dyson Student Discount Program',
    category: 'Electronics',
    brand: 'Dyson',
    brandLogo: '⚡',
    heroEmoji: '💨',
    image: 'bg-gradient-to-br from-purple-100 to-purple-50',
    stat: '2,134 lobbied → Program live',
    description: '20% discount for all verified students on vacuum & air purifiers',
    date: '2025-11-22',
    success: true,
  },
]

const CATEGORIES = ['All', 'Fashion & Footwear', 'Sustainability', 'Home & Furniture', 'Electronics']

export default function SuccessStoriesPage() {
  const [selectedCategory, setSelectedCategory] = useState('All')

  const filteredStories = selectedCategory === 'All'
    ? DEMO_STORIES
    : DEMO_STORIES.filter(story => story.category === selectedCategory)

  return (
    <div className="min-h-screen bg-[#FAFAFA] flex flex-col">
      <Navbar />

      <main className="flex-1">
        {/* Page Header */}
        <PageHeader
          title="Success Stories"
          subtitle="See what happens when people lobby"
        />

        {/* Filter Section */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex gap-2 flex-wrap">
            {CATEGORIES.map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={cn(
                  'px-4 py-2 rounded-full text-sm font-medium transition-all',
                  selectedCategory === category
                    ? 'bg-violet-600 text-white'
                    : 'bg-white text-gray-700 border border-gray-300 hover:border-gray-400'
                )}
              >
                {category}
              </button>
            ))}
          </div>
        </section>

        {/* Stories Grid */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
          {filteredStories.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-600 text-lg">No stories in this category yet.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {filteredStories.map((story) => (
                <Link key={story.id} href={`/campaigns/${story.slug}/case-study`}>
                  <Card className="h-full hover:shadow-lg transition-shadow cursor-pointer bg-white overflow-hidden group">
                    {/* Hero Section */}
                    <div className={cn('h-48 flex items-center justify-center text-7xl relative overflow-hidden', story.image)}>
                      <div className="group-hover:scale-110 transition-transform duration-300">
                        {story.heroEmoji}
                      </div>
                    </div>

                    <CardHeader>
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <span className="text-lg">{story.brandLogo}</span>
                          <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                            {story.brand}
                          </span>
                        </div>
                        {story.success && (
                          <Badge className="bg-green-600 hover:bg-green-700">
                            ✓ Success
                          </Badge>
                        )}
                      </div>
                      <CardTitle className="text-xl text-gray-900 line-clamp-2">
                        {story.title}
                      </CardTitle>
                    </CardHeader>

                    <CardContent className="space-y-3">
                      <p className="text-sm text-gray-600 line-clamp-2">
                        {story.description}
                      </p>
                      <div className="bg-violet-50 border border-violet-200 rounded-lg p-3">
                        <p className="font-semibold text-violet-900 text-sm flex items-center gap-2">
                          <Zap className="w-4 h-4" />
                          {story.stat}
                        </p>
                      </div>
                      <Badge variant="secondary" className="bg-gray-100 text-gray-700">
                        {story.category}
                      </Badge>
                    </CardContent>

                    <CardFooter>
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full border-gray-300 hover:bg-gray-50 group/btn"
                      >
                        Read the Story
                        <ArrowRight className="w-4 h-4 ml-2 group-hover/btn:translate-x-1 transition-transform" />
                      </Button>
                    </CardFooter>
                  </Card>
                </Link>
              ))}
            </div>
          )}
        </section>

        {/* CTA Section */}
        <section className="bg-white border-t border-gray-200">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 text-center">
            <h2 className="text-3xl font-display font-bold text-gray-900 mb-3">
              Your Idea Could Be Next
            </h2>
            <p className="text-lg text-gray-600 mb-6">
              Start a campaign today and join thousands of successful product lobbies
            </p>
            <Link href="/campaigns/new">
              <Button className="bg-violet-600 hover:bg-violet-700 text-white px-8 py-3 text-base">
                Create a Campaign
              </Button>
            </Link>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}
