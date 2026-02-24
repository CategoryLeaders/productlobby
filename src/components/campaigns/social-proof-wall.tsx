'use client'

import { useEffect, useState } from 'react'
import { Loader2, Quote, Star, ThumbsUp, Heart, Share2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface Testimonial {
  id: string
  author: string
  role: string
  content: string
  rating: number
  platform: string
  likes: number
  date: string
  verified: boolean
}

interface SocialProofData {
  totalTestimonials: number
  averageRating: number
  verifiedPercentage: number
  testimonials: Testimonial[]
}

interface SocialProofWallProps {
  campaignId: string
}

export function SocialProofWall({ campaignId }: SocialProofWallProps) {
  const [loading, setLoading] = useState(true)
  const [data, setData] = useState<SocialProofData | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchSocialProof()
  }, [campaignId])

  const fetchSocialProof = async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await fetch(`/api/campaigns/${campaignId}/social-proof`)
      if (!response.ok) throw new Error('Failed to fetch social proof data')
      const result = await response.json()
      setData(result.data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-violet-500" />
      </div>
    )
  }

  if (error || !data) {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-red-700">
        {error || 'Failed to load social proof data'}
      </div>
    )
  }

  const renderStars = (rating: number) => {
    return (
      <div className="flex gap-1">
        {[...Array(5)].map((_, i) => (
          <Star
            key={i}
            className={cn('w-4 h-4', i < rating ? 'fill-lime-400 text-lime-400' : 'text-gray-300')}
          />
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Quote className="w-6 h-6 text-violet-500" />
            Social Proof
          </h2>
          <p className="text-sm text-gray-600 mt-1">Testimonials and feedback from supporters</p>
        </div>
        <Button
          onClick={fetchSocialProof}
          variant="outline"
          size="sm"
          className="text-violet-600 border-violet-200 hover:bg-violet-50"
        >
          Refresh
        </Button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-3 gap-4">
        <div className="rounded-lg border border-violet-200 bg-violet-50 p-4">
          <div className="text-sm font-medium text-gray-600 mb-1">Total Testimonials</div>
          <div className="text-2xl font-bold text-violet-600">{data.totalTestimonials}</div>
        </div>
        <div className="rounded-lg border border-lime-200 bg-lime-50 p-4">
          <div className="text-sm font-medium text-gray-600 mb-1">Average Rating</div>
          <div className="text-2xl font-bold text-lime-600">{data.averageRating.toFixed(1)}</div>
        </div>
        <div className="rounded-lg border border-orange-200 bg-orange-50 p-4">
          <div className="text-sm font-medium text-gray-600 mb-1">Verified %</div>
          <div className="text-2xl font-bold text-orange-600">{data.verifiedPercentage}%</div>
        </div>
      </div>

      {/* Testimonials Grid - Masonry Style */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 auto-rows-max">
        {data.testimonials.map((testimonial) => (
          <div
            key={testimonial.id}
            className="rounded-lg border border-gray-200 bg-white p-4 hover:shadow-lg transition-shadow"
          >
            {/* Testimonial Content */}
            <p className="text-gray-700 text-sm mb-4">{testimonial.content}</p>

            {/* Author Section */}
            <div className="border-t border-gray-100 pt-4 space-y-3">
              <div className="flex items-start justify-between">
                <div>
                  <div className="font-semibold text-gray-900 text-sm">{testimonial.author}</div>
                  <div className="text-xs text-gray-500">{testimonial.role}</div>
                  <div className="text-xs text-gray-400 mt-1">{testimonial.date}</div>
                </div>
                {testimonial.verified && (
                  <div className="bg-lime-100 text-lime-700 px-2 py-1 rounded text-xs font-medium flex items-center gap-1">
                    <span className="w-1.5 h-1.5 bg-lime-600 rounded-full" />
                    Verified
                  </div>
                )}
              </div>

              {/* Ratings and Actions */}
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  {renderStars(testimonial.rating)}
                  <span className="text-xs text-gray-500">{testimonial.rating}.0</span>
                </div>
                <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                  <span className="text-xs text-gray-500">{testimonial.platform}</span>
                  <div className="flex items-center gap-3">
                    <button className="flex items-center gap-1 text-gray-500 hover:text-lime-600 transition-colors">
                      <ThumbsUp className="w-3.5 h-3.5" />
                      <span className="text-xs">{testimonial.likes}</span>
                    </button>
                    <button className="flex items-center gap-1 text-gray-500 hover:text-red-600 transition-colors">
                      <Heart className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
