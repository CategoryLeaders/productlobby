'use client'

import React, { useState, useEffect } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'

interface Testimonial {
  id: string
  userId: string
  userName: string
  userHandle?: string | null
  userAvatar?: string | null
  content: string
  createdAt: Date
}

interface TestimonialCarouselProps {
  campaignId: string
  autoRotateInterval?: number
}

export const TestimonialCarousel: React.FC<TestimonialCarouselProps> = ({
  campaignId,
  autoRotateInterval = 5000,
}) => {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Fetch testimonials
  useEffect(() => {
    const fetchTestimonials = async () => {
      try {
        setLoading(true)
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
        setLoading(false)
      }
    }

    fetchTestimonials()
  }, [campaignId])

  // Auto-rotate testimonials
  useEffect(() => {
    if (testimonials.length <= 1) return

    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % testimonials.length)
    }, autoRotateInterval)

    return () => clearInterval(timer)
  }, [testimonials.length, autoRotateInterval])

  const handlePrevious = () => {
    setCurrentIndex((prev) =>
      prev === 0 ? testimonials.length - 1 : prev - 1
    )
  }

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % testimonials.length)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-pulse text-gray-400">Loading testimonials...</div>
      </div>
    )
  }

  if (error || testimonials.length === 0) {
    return null
  }

  const current = testimonials[currentIndex]

  return (
    <div className="w-full bg-gradient-to-r from-violet-50 to-lime-50 rounded-lg p-8">
      <div className="flex flex-col items-center gap-6">
        {/* Quote content */}
        <blockquote className="text-center">
          <p className="text-lg font-medium text-gray-800 italic mb-4">
            "{current.content}"
          </p>
          <cite className="not-italic flex flex-col items-center gap-2">
            {current.userAvatar && (
              <img
                src={current.userAvatar}
                alt={current.userName}
                className="w-12 h-12 rounded-full object-cover border-2 border-violet-200"
              />
            )}
            <div className="flex flex-col items-center">
              <span className="font-semibold text-gray-800">
                {current.userName}
              </span>
              {current.userHandle && (
                <span className="text-sm text-gray-500">
                  @{current.userHandle}
                </span>
              )}
            </div>
          </cite>
        </blockquote>

        {/* Navigation */}
        <div className="flex items-center gap-4">
          <button
            onClick={handlePrevious}
            disabled={testimonials.length <= 1}
            className={cn(
              'p-2 rounded-lg transition-all duration-200',
              'focus:outline-none focus:ring-2 focus:ring-violet-500 focus:ring-offset-2',
              testimonials.length > 1
                ? 'hover:bg-violet-200 text-violet-600'
                : 'text-gray-300 cursor-not-allowed'
            )}
            aria-label="Previous testimonial"
          >
            <ChevronLeft size={20} />
          </button>

          {/* Dots */}
          <div className="flex gap-2">
            {testimonials.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentIndex(index)}
                className={cn(
                  'w-2 h-2 rounded-full transition-all duration-200',
                  index === currentIndex
                    ? 'bg-violet-600 w-6'
                    : 'bg-gray-300 hover:bg-gray-400'
                )}
                aria-label={`Go to testimonial ${index + 1}`}
              />
            ))}
          </div>

          <button
            onClick={handleNext}
            disabled={testimonials.length <= 1}
            className={cn(
              'p-2 rounded-lg transition-all duration-200',
              'focus:outline-none focus:ring-2 focus:ring-violet-500 focus:ring-offset-2',
              testimonials.length > 1
                ? 'hover:bg-violet-200 text-violet-600'
                : 'text-gray-300 cursor-not-allowed'
            )}
            aria-label="Next testimonial"
          >
            <ChevronRight size={20} />
          </button>
        </div>

        {/* Counter */}
        <span className="text-xs text-gray-500">
          {currentIndex + 1} of {testimonials.length}
        </span>
      </div>
    </div>
  )
}
