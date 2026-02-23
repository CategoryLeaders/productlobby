'use client'

import React from 'react'
import { ArrowUp, ArrowDown } from 'lucide-react'
import { cn } from '@/lib/utils'

export interface StatCardProps {
  title: string
  value: string | number
  change?: number
  icon: React.ReactNode
  color?: 'violet' | 'emerald' | 'blue' | 'amber' | 'rose'
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  change,
  icon,
  color = 'violet',
}) => {
  const colorClasses = {
    violet: 'bg-violet-100 text-violet-600',
    emerald: 'bg-emerald-100 text-emerald-600',
    blue: 'bg-blue-100 text-blue-600',
    amber: 'bg-amber-100 text-amber-600',
    rose: 'bg-rose-100 text-rose-600',
  }

  const changeIsPositive = change !== undefined && change >= 0

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow duration-200">
      {/* Icon */}
      <div className={cn('w-12 h-12 rounded-lg flex items-center justify-center mb-4', colorClasses[color])}>
        {icon}
      </div>

      {/* Content */}
      <p className="text-sm font-medium text-gray-600 mb-2">{title}</p>
      <h3 className="text-3xl font-display font-bold text-foreground mb-3">
        {value}
      </h3>

      {/* Change indicator */}
      {change !== undefined && (
        <div
          className={cn(
            'flex items-center gap-1 text-sm font-medium',
            changeIsPositive ? 'text-emerald-600' : 'text-rose-600'
          )}
        >
          {changeIsPositive ? (
            <ArrowUp size={16} />
          ) : (
            <ArrowDown size={16} />
          )}
          <span>{Math.abs(change)}%</span>
        </div>
      )}
    </div>
  )
}
