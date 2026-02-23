'use client'

import React, { useState, useEffect, useMemo } from 'react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Input } from '@/components/ui/input'
import { Star, Quote, Loader2, Plus, Sparkles } from 'lucide-react'
import { cn, formatRelativeTime } from '@/lib/utils'

interface Testimonial {
  id: string
  userId: string
  quote: string
  author: string
  title?: string
  rating: number
  createdAt: string | Date
}

interface TestimonialWallProps {
  campaignId: string
  className?: string
  isAuthenticated?: boolean
  currentUserId?: string
}

type SortOption = 'newest' | 'highest-rated'
type FilterRating = 0 | 1 | 2 | 3 | 4 | 5

export const TestimonialWall: React.FC<TestimonialWallProps> = ({
  campaignId,
  className,
  isAuthenticated = false,
  currentUserId,
}) => {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showForm, setShowForm] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [sortBy, setSortBy] = useState<SortOption>('newest')
  const [filterRating, setFilterRating] = useState<FilterRating>(0)
  const [formData, setFormData] = useState({
    quote: '',
    author: '',
    title: '',
    rating: 5,
  })
  const [hoverRating, setHoverRating] = useState(0)

  // Fetch testimonials
  useEffect(() => {
    const fetchTestimonials = async () => {
      try {
        setIsLoading(true)
        const response = await fetch(
          `/api/campaigns/${campaignId}/testimonials`
        )
        if (response.ok) {
          const data = await response.json()
          setTestimonials(data.data || [])
          setError(null)
        } else {
          setError('Failed to load testimonials')
        }
      } catch (err) {
        console.error('Error fetching testimonials:', err)
        setError('Error loading testimonials')
      } finally {
        setIsLoading(false)
      }
    }

    fetchTestimonials()
  }, [campaignId])

  // Filter and sort testimonials
  const filteredAndSortedTestimonials = useMemo(() => {
    let filtered = [...testimonials]

    // Apply rating filter
    if (filterRating > 0) {
      filtered = filtered.filter((t) => t.rating === filterRating)
    }

    // Apply sorting
    if (sortBy === 'newest') {
      filtered.sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      )
    } else if (sortBy === 'highest-rated') {
      filtered.sort((a, b) => {
        if (b.rating !== a.rating) {
          return b.rating - a.rating
        }
        // If ratings are the same, sort by newest
        return (
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        )
      })
    }

    return filtered
  }, [testimonials, sortBy, filterRating])

  // Get featured testimonial (highest rated, most recent)
  const featuredTestimonial = useMemo(() => {
    if (filteredAndSortedTestimonials.length === 0) return null

    let featured = filteredAndSortedTestimonials[0]

    // Find highest rated, then most recent
    const sorted = [...filteredAndSortedTestimonials].sort((a, b) => {
      if (b.rating !== a.rating) {
        return b.rating - a.rating
      }
      return (
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      )
    })

    return sorted[0]
  }, [filteredAndSortedTestimonials])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.quote.trim()) {
      setError('Testimonial text is required')
      return
    }

    if (!formData.author.trim()) {
      setError('Name is required')
      return
    }

    setIsSubmitting(true)
    setError(null)

    try {
      const response = await fetch(
        `/api/campaigns/${campaignId}/testimonials`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            quote: formData.quote.trim(),
            author: formData.author.trim(),
            title: formData.title?.trim(),
            rating: formData.rating,
          }),
        }
      )

      if (response.ok) {
        const data = await response.json()
        setTestimonials([data.data, ...testimonials])
        setFormData({ quote: '', author: '', title: '', rating: 5 })
        setShowForm(false)
      } else {
        const errorData = await response.json()
        setError(errorData.error || 'Failed to submit testimonial')
      }
    } catch (err) {
      console.error('Error submitting testimonial:', err)
      setError('Error submitting testimonial')
    } finally {
      setIsSubmitting(false)
    }
  }

  const renderStars = (
    rating: number,
    interactive = false,
    onRate?: (rating: number) => void
  ) => {
    return (
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            onClick={() => interactive && onRate?.(star)}
            onMouseEnter={() => interactive && setHoverRating(star)}
            onMouseLeave={() => interactive && setHoverRating(0)}
            className={cn(
              'transition-all duration-200',
              interactive && 'cursor-pointer',
              interactive ? 'hover:scale-110' : 'cursor-default'
            )}
            disabled={!interactive}
            type="button"
          >
            <Star
              size={16}
              className={cn(
                'transition-all duration-200',
                star <=
                  (interactive && hoverRating > 0 ? hoverRating : rating)
                  ? 'fill-amber-400 text-amber-400'
                  : 'text-gray-300'
              )}
            />
          </button>
        ))}
      </div>
    )
  }

  const TestimonialCard = ({
    testimonial,
    isFeatured = false,
  }: {
    testimonial: Testimonial
    isFeatured?: boolean
  }) => (
    <div
      className={cn(
        'rounded-lg border bg-white p-5 shadow-sm hover:shadow-md transition-all duration-200 break-inside-avoid mb-6',
        isFeatured
          ? 'border-amber-300 bg-gradient-to-br from-amber-50 to-white ring-2 ring-amber-200 lg:col-span-full'
          : 'border-violet-200'
      )}
    >
      {isFeatured && (
        <div className="flex items-center gap-2 mb-3">
          <Sparkles size={16} className="text-amber-500" />
          <span className="text-xs font-semibold text-amber-600 uppercase">
            Featured
          </span>
        </div>
      )}

      {/* Quote icon */}
      <Quote size={20} className="text-violet-200 mb-3" />

      {/* Quote text */}
      <p
        className={cn(
          'mb-4 leading-relaxed',
          isFeatured ? 'text-gray-800 font-medium text-base' : 'text-gray-700 text-sm'
        )}
      >
        {testimonial.quote}
      </p>

      {/* Rating */}
      <div className="mb-3">{renderStars(testimonial.rating)}</div>

      {/* Author and date */}
      <div className="border-t border-gray-100 pt-3">
        <p className="font-medium text-gray-800 text-sm">
          {testimonial.author}
        </p>
        {testimonial.title && (
          <p className="text-xs text-gray-600 mt-0.5">{testimonial.title}</p>
        )}
        <p className="text-xs text-gray-500 mt-1">
          {formatRelativeTime(new Date(testimonial.createdAt))}
        </p>
      </div>
    </div>
  )

  return (
    <div className={cn('w-full', className)}>
      {/* Header */}
      <div className="mb-6 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold bg-gradient-to-r from-violet-600 to-lime-600 bg-clip-text text-transparent">
              Supporter Testimonials
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              {filteredAndSortedTestimonials.length} of {testimonials.length}{' '}
              testimonial{testimonials.length !== 1 ? 's' : ''}
            </p>
          </div>

          {isAuthenticated && (
            <Button
              onClick={() => setShowForm(!showForm)}
              className="gap-2 bg-gradient-to-r from-violet-600 to-lime-600 hover:from-violet-700 hover:to-lime-700"
              size="sm"
            >
              <Plus size={16} />
              Add Testimonial
            </Button>
          )}
        </div>

        {/* Filters and Sort */}
        {testimonials.length > 0 && (
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-gray-600">Sort:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as SortOption)}
                className="text-sm border border-violet-300 rounded-md px-3 py-1 focus:outline-none focus:ring-2 focus:ring-violet-500"
              >
                <option value="newest">Newest</option>
                <option value="highest-rated">Highest Rated</option>
              </select>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-gray-600">Filter:</span>
              <select
                value={filterRating}
                onChange={(e) => setFilterRating(parseInt(e.target.value) as FilterRating)}
                className="text-sm border border-violet-300 rounded-md px-3 py-1 focus:outline-none focus:ring-2 focus:ring-violet-500"
              >
                <option value="0">All ratings</option>
                <option value="5">5 stars</option>
                <option value="4">4+ stars</option>
                <option value="3">3+ stars</option>
                <option value="2">2+ stars</option>
                <option value="1">1+ stars</option>
              </select>
            </div>
          </div>
        )}
      </div>

      {/* Add Testimonial Form */}
      {showForm && isAuthenticated && (
        <form
          onSubmit={handleSubmit}
          className="mb-8 p-6 rounded-lg border border-violet-200 bg-gradient-to-br from-violet-50 to-lime-50"
        >
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Your Testimonial
              </label>
              <Textarea
                value={formData.quote}
                onChange={(e) =>
                  setFormData({ ...formData, quote: e.target.value })
                }
                placeholder="Share your thoughts about this campaign..."
                className="resize-none focus-visible:ring-violet-500"
                rows={4}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Your Name
                </label>
                <Input
                  type="text"
                  value={formData.author}
                  onChange={(e) =>
                    setFormData({ ...formData, author: e.target.value })
                  }
                  placeholder="Your name"
                  className="focus-visible:ring-violet-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Your Title/Role (Optional)
                </label>
                <Input
                  type="text"
                  value={formData.title}
                  onChange={(e) =>
                    setFormData({ ...formData, title: e.target.value })
                  }
                  placeholder="e.g., Product Manager, Designer"
                  className="focus-visible:ring-violet-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Rating
              </label>
              <div className="flex items-center gap-4">
                {renderStars(formData.rating, true, (rating) =>
                  setFormData({ ...formData, rating })
                )}
                <span className="text-sm text-gray-600">
                  {formData.rating} star{formData.rating !== 1 ? 's' : ''}
                </span>
              </div>
            </div>

            {error && (
              <div className="p-3 rounded-lg bg-red-100 border border-red-300 text-red-700 text-sm">
                {error}
              </div>
            )}

            <div className="flex gap-2 pt-4">
              <Button
                type="submit"
                disabled={isSubmitting}
                className="bg-violet-600 hover:bg-violet-700"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 size={16} className="mr-2 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  'Submit Testimonial'
                )}
              </Button>
              <Button
                type="button"
                onClick={() => {
                  setShowForm(false)
                  setError(null)
                  setFormData({ quote: '', author: '', title: '', rating: 5 })
                }}
                variant="outline"
              >
                Cancel
              </Button>
            </div>
          </div>
        </form>
      )}

      {/* Testimonials Wall */}
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 size={24} className="animate-spin text-violet-600" />
        </div>
      ) : error ? (
        <div className="p-4 rounded-lg bg-red-100 border border-red-300 text-red-700">
          {error}
        </div>
      ) : testimonials.length === 0 ? (
        <div className="text-center py-12">
          <Quote size={32} className="mx-auto text-gray-300 mb-3" />
          <p className="text-gray-600">
            {isAuthenticated
              ? 'Be the first to share your testimonial!'
              : 'No testimonials yet. Sign in to add one.'}
          </p>
        </div>
      ) : filteredAndSortedTestimonials.length === 0 ? (
        <div className="text-center py-12">
          <Quote size={32} className="mx-auto text-gray-300 mb-3" />
          <p className="text-gray-600">
            No testimonials match your current filters.
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Featured Testimonial */}
          {featuredTestimonial && (
            <div className="mb-8">
              <TestimonialCard
                testimonial={featuredTestimonial}
                isFeatured={true}
              />
            </div>
          )}

          {/* Masonry Grid */}
          <div
            className="columns-1 sm:columns-2 lg:columns-3 gap-6"
            style={{ columnGap: '1.5rem' }}
          >
            {filteredAndSortedTestimonials.map((testimonial) => (
              <TestimonialCard
                key={testimonial.id}
                testimonial={testimonial}
                isFeatured={
                  featuredTestimonial?.id === testimonial.id
                }
              />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
