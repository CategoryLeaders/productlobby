import React from 'react'
import Link from 'next/link'
import { ChevronDown } from 'lucide-react'

export interface Breadcrumb {
  label: string
  href: string
}

export interface PageHeaderProps {
  title: string
  subtitle?: string
  description?: string
  breadcrumbs?: Breadcrumb[]
  actions?: React.ReactNode
}

export const PageHeader: React.FC<PageHeaderProps> = ({
  title,
  subtitle,
  description,
  breadcrumbs,
  actions,
}) => {
  return (
    <div className="mb-8">
      {/* Breadcrumbs */}
      {breadcrumbs && breadcrumbs.length > 0 && (
        <nav className="flex items-center gap-2 mb-4" aria-label="Breadcrumb">
          {breadcrumbs.map((breadcrumb, index) => (
            <React.Fragment key={breadcrumb.href}>
              {index > 0 && (
                <ChevronDown
                  size={16}
                  className="text-gray-400 rotate-[-90deg]"
                />
              )}
              <Link
                href={breadcrumb.href}
                className="text-sm text-gray-600 hover:text-violet-600 transition-colors duration-200"
              >
                {breadcrumb.label}
              </Link>
            </React.Fragment>
          ))}
        </nav>
      )}

      {/* Header Row */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        {/* Title & Description */}
        <div className="flex-1">
          <h1 className="font-display font-bold text-3xl md:text-4xl text-foreground mb-2">
            {title}
          </h1>
          {subtitle && (
            <p className="text-lg text-gray-500 mb-1">{subtitle}</p>
          )}
          {description && (
            <p className="text-gray-600 text-base leading-relaxed max-w-2xl">
              {description}
            </p>
          )}
        </div>

        {/* Actions */}
        {actions && <div className="flex items-center gap-3">{actions}</div>}
      </div>
    </div>
  )
}
