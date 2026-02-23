'use client'

import React, { useState } from 'react'
import { ChevronDown } from 'lucide-react'
import { cn } from '@/lib/utils'

export interface FAQItem {
  id: string
  question: string
  answer: string
}

interface FAQAccordionProps {
  items: FAQItem[]
  defaultOpenIndex?: number
  allowMultipleOpen?: boolean
}

export function FAQAccordion({
  items,
  defaultOpenIndex,
  allowMultipleOpen = false,
}: FAQAccordionProps) {
  const [openItems, setOpenItems] = useState<Set<string>>(
    defaultOpenIndex !== undefined ? new Set([items[defaultOpenIndex]?.id]) : new Set()
  )

  const toggleItem = (id: string) => {
    const newOpenItems = new Set(openItems)

    if (!allowMultipleOpen) {
      newOpenItems.clear()
    }

    if (newOpenItems.has(id)) {
      newOpenItems.delete(id)
    } else {
      newOpenItems.add(id)
    }

    setOpenItems(newOpenItems)
  }

  return (
    <div className="space-y-3">
      {items.map((item) => {
        const isOpen = openItems.has(item.id)

        return (
          <div
            key={item.id}
            className="border border-gray-200 rounded-lg overflow-hidden transition-colors hover:border-gray-300"
          >
            <button
              onClick={() => toggleItem(item.id)}
              className="w-full flex items-center justify-between p-4 bg-white hover:bg-gray-50 transition-colors text-left"
            >
              <h3 className="font-semibold text-gray-900 pr-4 flex-1">
                {item.question}
              </h3>
              <ChevronDown
                className={cn(
                  'w-5 h-5 text-gray-600 flex-shrink-0 transition-transform duration-300',
                  isOpen && 'rotate-180'
                )}
              />
            </button>

            {isOpen && (
              <div className="px-4 py-3 bg-gray-50 border-t border-gray-200 text-gray-700 text-sm">
                {item.answer}
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}
