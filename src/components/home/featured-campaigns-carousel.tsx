'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'

export interface FeaturedCampaign {
  id: string
  slug: string
  title: string
  category: string
  image?: string | null
  lobbyCount: number
  supporterCount: number
  pledgeAmount: number
}

interface FeaturedCampaignsCarouselProps {
  campaigns: FeaturedCampaign[]
  autoPlayInterval?: number
}

export function FeaturedCampaignsCarousel({
  campaigns,
  autoPlayInterval = 5000,
}: FeaturedCampaignsCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isAutoPlaying, setIsAutoPlaying] = useState(true)
  const [direction, setDirection] = useState<'next' | 'prev'>('next')

  // Auto-rotate slides
  useEffect(() => {
    if (!isAutoPlaying || campaigns.length <= 1) return

    const interval = setInterval(() => {
      setDirection('next')
      setCurrentIndex((prev) => (prev + 1) % campaigns.length)
    }, autoPlayInterval)

    return () => clearInterval(interval)
  }, [isAutoPlaying, campaigns.length, autoPlayInterval])

  if (campaigns.length === 0) {
    return (
      <div className="bg-gradient-to-b from-gray-50 to-white rounded-xl p-8 text-center">
        <p className="text-gray-500">No featured campaigns available</p>
      </div>
    )
  }

  const goToPrevious = () => {
    setIsAutoPlaying(false)
    setDirection('prev')
    setCurrentIndex((prev) =>
      prev === 0 ? campaigns.length - 1 : prev - 1
    )
  }

  const goToNext = () => {
    setIsAutoPlaying(false)
    setDirection('next')
    setCurrentIndex((prev) => (prev + 1) % campaigns.length)
  }

  const goToSlide = (index: number) => {
    setIsAutoPlaying(false)
    setDirection(index > currentIndex ? 'next' : 'prev')
    setCurrentIndex(index)
  }

  const handleMouseEnter = () => {
    setIsAutoPlaying(false)
  }

  const handleMouseLeave = () => {
    setIsAutoPlaying(true)
  }

  const campaign = campaigns[currentIndex]

  return (
    <div
      className="relative bg-white rounded-xl overflow-hidden shadow-lg"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {/* Carousel Container */}
      <div className="relative h-80 md:h-96">
        {/* Image Slide */}
        <div className="absolute inset-0 overflow-hidden">
          {campaign.image ? (
            <Image
              src={campaign.image}
              alt={campaign.title}
              fill
              className="object-cover"
              priority={currentIndex === 0}
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-violet-100 to-violet-50 flex items-center justify-center">
              <div className="text-center">
                <div className="text-4xl text-violet-300 mb-2">📱</div>
                <p className="text-violet-600 font-medium">{campaign.title}</p>
              </div>
            </div>
          )}

          {/* Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-60" />
        </div>

        {/* Content Overlay */}
        <div className="absolute inset-0 flex flex-col justify-end p-6">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <span className="text-xs font-semibold px-3 py-1 bg-violet-500 text-white rounded-full">
                {campaign.category}
              </span>
              <span className="text-xs text-white/80">
                Featured Campaign
              </span>
            </div>

            <h3 className="text-2xl md:text-3xl font-bold text-white mb-3 line-clamp-2">
              {campaign.title}
            </h3>

            <div className="flex items-center gap-4 mb-4">
              <div className="flex flex-col">
                <span className="text-xs text-white/70">Lobbies</span>
                <span className="text-lg font-semibold text-white">
                  {campaign.lobbyCount.toLocaleString()}
                </span>
              </div>
              <div className="h-8 w-px bg-white/30" />
              <div className="flex flex-col">
                <span className="text-xs text-white/70">Supporters</span>
                <span className="text-lg font-semibold text-white">
                  {campaign.supporterCount.toLocaleString()}
                </span>
              </div>
            </div>

            <Link
              href={`/campaigns/${campaign.slug}`}
              className="inline-block bg-lime-400 hover:bg-lime-500 text-black font-semibold px-6 py-2 rounded-lg transition-colors"
            >
              View Campaign
            </Link>
          </div>
        </div>
      </div>

      {/* Navigation Arrows */}
      {campaigns.length > 1 && (
        <>
          <button
            onClick={goToPrevious}
            className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white text-gray-900 rounded-full p-2 transition-all z-10"
            aria-label="Previous slide"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>

          <button
            onClick={goToNext}
            className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white text-gray-900 rounded-full p-2 transition-all z-10"
            aria-label="Next slide"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </>
      )}

      {/* Navigation Dots */}
      {campaigns.length > 1 && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2 z-10">
          {campaigns.map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={cn(
                'rounded-full transition-all',
                index === currentIndex
                  ? 'bg-white w-2 h-2'
                  : 'bg-white/50 hover:bg-white/70 w-2 h-2'
              )}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  )
}
