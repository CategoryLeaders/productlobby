'use client'

import React from 'react'
import { cn } from '@/lib/utils'
import { CheckCircle2, Clock } from 'lucide-react'

interface TimelineEvent {
  label: string
  date: string
  status?: 'completed' | 'pending'
  description?: string
}

interface StoryTimelineProps {
  events: TimelineEvent[]
  className?: string
}

export const StoryTimeline: React.FC<StoryTimelineProps> = ({ events, className }) => {
  return (
    <div className={cn('py-8', className)}>
      <div className="relative">
        {/* Vertical line */}
        <div className="absolute left-[23px] top-10 bottom-0 w-0.5 bg-gray-300" />

        {/* Events */}
        <div className="space-y-8">
          {events.map((event, index) => (
            <div key={index} className="flex gap-6 relative z-10">
              {/* Dot */}
              <div className="flex-shrink-0 flex items-center justify-center">
                {event.status === 'completed' ? (
                  <div className="w-12 h-12 rounded-full bg-violet-600 border-4 border-white shadow-sm flex items-center justify-center">
                    <CheckCircle2 size={20} className="text-white" />
                  </div>
                ) : (
                  <div className="w-12 h-12 rounded-full bg-gray-200 border-4 border-white shadow-sm flex items-center justify-center">
                    <Clock size={20} className="text-gray-600" />
                  </div>
                )}
              </div>

              {/* Content */}
              <div className="flex-grow pt-2">
                <h4 className="font-semibold text-foreground text-base">
                  {event.label}
                </h4>
                <p className="text-sm text-gray-600 mt-1">{event.date}</p>
                {event.description && (
                  <p className="text-sm text-gray-700 mt-2">{event.description}</p>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
