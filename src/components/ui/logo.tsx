'use client'

/**
 * Logo wrapper component that maps size tokens to the brand Logo (E1-B).
 * Delegates to src/components/brand/Logo.tsx for the actual rendering.
 */

import React from 'react'
import BrandLogo, { LogoIcon } from '@/components/brand/Logo'

type LogoSize = 'sm' | 'md' | 'lg'

export interface LogoProps {
  size?: LogoSize
  showIcon?: boolean
  className?: string
}

const sizeMap: Record<LogoSize, number> = {
  sm: 18,
  md: 24,
  lg: 40,
}

export const Logo: React.FC<LogoProps> = ({
  size = 'md',
  showIcon = true,
  className,
}) => {
  const pixelSize = sizeMap[size]
  const variant = showIcon ? 'full' : 'wordmark'

  return (
    <BrandLogo
      size={pixelSize}
      variant={variant}
      theme="colour"
      className={className}
    />
  )
}

export { LogoIcon }
