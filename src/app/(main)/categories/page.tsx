'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Navbar } from '@/components/shared/navbar'
import { Footer } from '@/components/shared/footer'
import { PageHeader } from '@/components/shared/page-header'
import { Button } from '@/components/ui/button'
import { Loader2, ArrowRight } from 'lucide-react'
import { getAllCategories, getCategoryIcon } from '@/lib/category-definitions'

interface CategoryStats {
  slug: string
  campaignCount: number
  lobbyCount: number
}

export default function CategoriesPage() {
  const categories = getAllCategories()
  const [stats, setStats] = useState<{ [key: string]: CategoryStats }>({})
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const statsMap: { [key: string]: CategoryStats } = {}

        for (const category of categories) {
          const response = await fetch(`/api/categories/${category.slug}`)
          const data = await response.json()

          if (data.success) {
            statsMap[category.slug] = {
              slug: category.slug,
              campaignCount: data.data.stats.totalCampaigns,
              lobbyCount: data.data.stats.totalLobbies,
            }
          }
        }

        setStats(statsMap)
      } catch (error) {
        console.error('Failed to fetch category stats:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchStats()
  }, [categories])

  const totalCampaigns = Object.values(stats).reduce((sum, cat) => sum + cat.campaignCount, 0)
  const totalLobbies = Object.values(stats).reduce((sum, cat) => sum + cat.lobbyCount, 0)

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
        <PageHeader
          title="Explore Categories"
          description="Browse campaigns by category and discover the products people are demanding"
          breadcrumbs={[{ label: 'Categories', href: '/categories' }]}
        />

        {/* Stats Overview */}
        <section className="border-b border-slate-200 bg-white py-12">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
              <div className="rounded-lg bg-gradient-to-br from-violet-50 to-violet-100 p-6">
                <p className="text-sm font-medium text-violet-600">Total Categories</p>
                <p className="mt-2 text-3xl font-bold text-violet-900">{categories.length}</p>
              </div>
              <div className="rounded-lg bg-gradient-to-br from-lime-50 to-lime-100 p-6">
                <p className="text-sm font-medium text-lime-600">Total Campaigns</p>
                <p className="mt-2 text-3xl font-bold text-lime-900">
                  {loading ? (
                    <Loader2 className="h-6 w-6 animate-spin" />
                  ) : (
                    totalCampaigns.toLocaleString()
                  )}
                </p>
              </div>
              <div className="rounded-lg bg-gradient-to-br from-blue-50 to-blue-100 p-6">
                <p className="text-sm font-medium text-blue-600">Community Support</p>
                <p className="mt-2 text-3xl font-bold text-blue-900">
                  {loading ? (
                    <Loader2 className="h-6 w-6 animate-spin" />
                  ) : (
                    totalLobbies.toLocaleString()
                  )}
                </p>
              </div>
              <div className="rounded-lg bg-gradient-to-br from-rose-50 to-rose-100 p-6">
                <p className="text-sm font-medium text-rose-600">Avg Campaigns</p>
                <p className="mt-2 text-3xl font-bold text-rose-900">
                  {loading ? (
                    <Loader2 className="h-6 w-6 animate-spin" />
                  ) : (
                    Math.round(totalCampaigns / categories.length)
                  )}
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Categories Grid */}
        <section className="py-16">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {categories.map((category) => {
                const Icon = getCategoryIcon(category.slug)
                const categoryStats = stats[category.slug]
                const campaignCount = categoryStats?.campaignCount || 0

                return (
                  <Link key={category.slug} href={`/categories/${category.slug}`}>
                    <div className="group relative overflow-hidden rounded-xl border border-slate-200 bg-white p-6 transition-all hover:border-violet-300 hover:shadow-lg">
                      {/* Gradient background on hover */}
                      <div
                        className={`absolute inset-0 opacity-0 transition-opacity group-hover:opacity-10 ${category.gradientFrom} ${category.gradientTo} bg-gradient-to-br`}
                      />

                      {/* Content */}
                      <div className="relative z-10">
                        {/* Icon */}
                        <div
                          className={`mb-4 inline-flex rounded-lg ${category.gradientFrom} ${category.gradientTo} bg-gradient-to-br p-3 text-white`}
                        >
                          <Icon className="h-6 w-6" />
                        </div>

                        {/* Category Name */}
                        <h3 className="mb-2 text-lg font-semibold text-slate-900">
                          {category.name}
                        </h3>

                        {/* Description */}
                        <p className="mb-4 line-clamp-2 text-sm text-slate-600">
                          {category.description}
                        </p>

                        {/* Stats */}
                        <div className="mb-4 flex items-center justify-between">
                          <span className="text-sm font-medium text-slate-900">
                            {campaignCount} {campaignCount === 1 ? 'Campaign' : 'Campaigns'}
                          </span>
                          {categoryStats && (
                            <span className="text-xs text-slate-500">
                              {categoryStats.lobbyCount} supporters
                            </span>
                          )}
                        </div>

                        {/* CTA */}
                        <div className="flex items-center text-sm font-medium text-violet-600 transition-colors group-hover:text-violet-700">
                          Explore
                          <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                        </div>
                      </div>
                    </div>
                  </Link>
                )
              })}
            </div>
          </div>
        </section>

        {/* Call to Action */}
        <section className="border-t border-slate-200 bg-gradient-to-r from-violet-50 to-lime-50 py-16">
          <div className="mx-auto max-w-2xl px-4 text-center sm:px-6 lg:px-8">
            <h2 className="text-3xl font-bold text-slate-900">
              Don't see what you're looking for?
            </h2>
            <p className="mt-4 text-lg text-slate-600">
              Start a new campaign and let the community know what you want to exist.
            </p>
            <Link href="/campaigns/new">
              <Button size="lg" className="mt-8">
                Create a Campaign
              </Button>
            </Link>
          </div>
        </section>
      </main>
      <Footer />
    </>
  )
}
