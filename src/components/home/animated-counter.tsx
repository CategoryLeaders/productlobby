'use client'

import React, { useEffect, useRef, useState } from 'react'

interface AnimatedCounterProps {
  target: number
  duration?: number
  format?: 'number' | 'percentage' | 'compact'
  label?: string
}

export function AnimatedCounter({
  target,
  duration = 2000,
  format = 'number',
  label,
}: AnimatedCounterProps) {
  const [count, setCount] = useState(0)
  const [hasStarted, setHasStarted] = useState(false)
  const elementRef = useRef<HTMLDivElement>(null)

  // Use Intersection Observer to trigger animation on scroll into view
  useEffect(() => {
    const element = elementRef.current
    if (!element) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasStarted) {
          setHasStarted(true)
          observer.unobserve(element)
        }
      },
      { threshold: 0.1 }
    )

    observer.observe(element)

    return () => {
      observer.unobserve(element)
    }
  }, [hasStarted])

  // Animate the counter
  useEffect(() => {
    if (!hasStarted) return

    let startTime: number
    let animationFrameId: number

    const animate = (currentTime: number) => {
      if (!startTime) startTime = currentTime
      const elapsed = currentTime - startTime
      const progress = Math.min(elapsed / duration, 1)

      setCount(Math.floor(progress * target))

      if (progress < 1) {
        animationFrameId = requestAnimationFrame(animate)
      }
    }

    animationFrameId = requestAnimationFrame(animate)

    return () => cancelAnimationFrame(animationFrameId)
  }, [hasStarted, target, duration])

  const formatValue = (value: number): string => {
    switch (format) {
      case 'percentage':
        return `${value}%`
      case 'compact':
        if (value >= 1000000) {
          return (value / 1000000).toFixed(1) + 'M'
        }
        if (value >= 1000) {
          return (value / 1000).toFixed(1) + 'K'
        }
        return value.toString()
      case 'number':
      default:
        return value.toLocaleString()
    }
  }

  return (
    <div ref={elementRef} className="flex flex-col items-center">
      <div className="text-4xl md:text-5xl font-bold text-violet-600">
        {formatValue(count)}
      </div>
      {label && (
        <p className="text-sm md:text-base text-gray-600 mt-2">{label}</p>
      )}
    </div>
  )
}
