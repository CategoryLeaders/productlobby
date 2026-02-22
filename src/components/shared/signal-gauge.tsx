'use client'

import React, { useEffect, useState } from 'react'
import { cn } from '@/lib/utils'

interface SignalGaugeProps {
  score: number
  size?: 'sm' | 'md' | 'lg'
}

type SignalSize = {
  radius: number
  circumference: number
  fontSize: string
  width: string
  height: string
}

const SIZES: Record<'sm' | 'md' | 'lg', SignalSize> = {
  sm: {
    radius: 35,
    circumference: 2 * Math.PI * 35,
    fontSize: 'text-lg',
    width: '100',
    height: '60',
  },
  md: {
    radius: 50,
    circumference: 2 * Math.PI * 50,
    fontSize: 'text-3xl',
    width: '140',
    height: '85',
  },
  lg: {
    radius: 70,
    circumference: 2 * Math.PI * 70,
    fontSize: 'text-5xl',
    width: '200',
    height: '120',
  },
}

// Color zones based on score
const getScoreColor = (score: number): string => {
  if (score >= 70) return '#22c55e' // lime-500
  if (score >= 55) return '#7c3aed' // violet-600
  if (score >= 35) return '#3b82f6' // blue-500
  return '#9ca3af' // gray-400
}

export const SignalGauge: React.FC<SignalGaugeProps> = ({ score, size = 'md' }) => {
  const [animatedScore, setAnimatedScore] = useState(0)
  const sizeConfig = SIZES[size]

  // Animate the score on mount
  useEffect(() => {
    let frame = 0
    const target = Math.round(score)
    const animationDuration = 1000 // 1 second
    const startTime = Date.now()

    const animate = () => {
      const elapsed = Date.now() - startTime
      const progress = Math.min(elapsed / animationDuration, 1)
      const current = Math.round(progress * target)
      setAnimatedScore(current)

      if (progress < 1) {
        frame = requestAnimationFrame(animate)
      }
    }

    animate()

    return () => cancelAnimationFrame(frame)
  }, [score])

  // Calculate stroke-dashoffset for the progress arc
  // Arc spans 180 degrees (half circle)
  const arcProgress = Math.min(animatedScore / 100, 1)
  const strokeDashoffset = sizeConfig.circumference * (1 - arcProgress) * 0.5

  const cx = parseInt(sizeConfig.width) / 2
  const cy = parseInt(sizeConfig.height) - 10

  return (
    <div className="flex flex-col items-center gap-3">
      <svg
        width={sizeConfig.width}
        height={sizeConfig.height}
        viewBox={`0 0 ${sizeConfig.width} ${sizeConfig.height}`}
        className="filter drop-shadow-sm"
      >
        {/* Background arc */}
        <path
          d={`M 10 ${cy} A ${sizeConfig.radius} ${sizeConfig.radius} 0 0 1 ${parseInt(sizeConfig.width) - 10} ${cy}`}
          fill="none"
          stroke="#e5e7eb"
          strokeWidth="6"
          strokeLinecap="round"
        />

        {/* Colored arc (animated) */}
        <path
          d={`M 10 ${cy} A ${sizeConfig.radius} ${sizeConfig.radius} 0 0 1 ${parseInt(sizeConfig.width) - 10} ${cy}`}
          fill="none"
          stroke={getScoreColor(animatedScore)}
          strokeWidth="6"
          strokeLinecap="round"
          strokeDasharray={`${sizeConfig.circumference * 0.5}`}
          strokeDashoffset={strokeDashoffset}
          style={{
            transition: 'stroke-dashoffset 0.3s ease-out, stroke 0.3s ease-out',
          }}
        />

        {/* Center text - Score number */}
        <text
          x={cx}
          y={cy - 15}
          textAnchor="middle"
          className={cn('font-bold fill-foreground', sizeConfig.fontSize)}
        >
          {animatedScore}
        </text>

        {/* Center text - Label */}
        <text
          x={cx}
          y={cy + 15}
          textAnchor="middle"
          className="text-xs fill-gray-500 font-medium"
        >
          Signal Score
        </text>
      </svg>

      {/* Score range indicator */}
      <div className="text-center">
        <p className="text-xs text-gray-500">
          {animatedScore >= 70
            ? 'Very High Signal'
            : animatedScore >= 55
              ? 'High Signal'
              : animatedScore >= 35
                ? 'Trending'
                : 'Early Stage'}
        </p>
      </div>
    </div>
  )
}
