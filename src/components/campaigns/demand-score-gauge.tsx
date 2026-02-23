'use client'

import React from 'react'

type GaugeSize = 'sm' | 'md' | 'lg'

interface DemandScoreGaugeProps {
  score: number
  size?: GaugeSize
}

export const DemandScoreGauge: React.FC<DemandScoreGaugeProps> = ({
  score,
  size = 'md',
}) => {
  // Clamp score between 0-100
  const clampedScore = Math.max(0, Math.min(100, score))

  // Determine color and label based on score
  let color: string
  let label: string

  if (clampedScore < 25) {
    color = '#EF4444' // red
    label = 'Low Demand'
  } else if (clampedScore < 50) {
    color = '#EAB308' // yellow
    label = 'Growing'
  } else if (clampedScore < 75) {
    color = '#22C55E' // green
    label = 'Strong Demand'
  } else {
    color = '#7C3AED' // violet
    label = 'Viral'
  }

  // Size configurations
  const sizeConfig = {
    sm: { size: 120, radius: 60, strokeWidth: 8, fontSize: 24, labelSize: 12 },
    md: { size: 180, radius: 90, strokeWidth: 12, fontSize: 36, labelSize: 14 },
    lg: { size: 240, radius: 120, strokeWidth: 14, fontSize: 48, labelSize: 16 },
  }

  const config = sizeConfig[size]

  // Calculate the arc
  const circumference = 2 * Math.PI * (config.radius - config.strokeWidth / 2)
  const offset = circumference - (clampedScore / 100) * circumference

  return (
    <div className="flex flex-col items-center gap-4">
      {/* SVG Gauge */}
      <svg width={config.size} height={config.size} className="drop-shadow-sm">
        {/* Background circle */}
        <circle
          cx={config.size / 2}
          cy={config.size / 2}
          r={config.radius - config.strokeWidth / 2}
          fill="none"
          stroke="#E5E7EB"
          strokeWidth={config.strokeWidth}
        />

        {/* Progress circle */}
        <circle
          cx={config.size / 2}
          cy={config.size / 2}
          r={config.radius - config.strokeWidth / 2}
          fill="none"
          stroke={color}
          strokeWidth={config.strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          style={{
            transform: `rotate(-90deg)`,
            transformOrigin: `${config.size / 2}px ${config.size / 2}px`,
            transition: 'stroke-dashoffset 0.8s ease-in-out',
          }}
        />

        {/* Center text */}
        <text
          x={config.size / 2}
          y={config.size / 2 - 12}
          textAnchor="middle"
          fontSize={config.fontSize}
          fontWeight="700"
          fill="#1F2937"
        >
          {clampedScore}
        </text>
        <text
          x={config.size / 2}
          y={config.size / 2 + config.fontSize / 2 - 8}
          textAnchor="middle"
          fontSize={12}
          fill="#6B7280"
        >
          / 100
        </text>
      </svg>

      {/* Label below gauge */}
      <div className="text-center">
        <p className="text-sm font-semibold" style={{ color }}>
          {label}
        </p>
      </div>
    </div>
  )
}
