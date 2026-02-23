'use client'

import React, { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Loader2, Plus, Clock, Calendar, ChevronLeft, ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useAuth } from '@/hooks/useAuth'

interface ScheduledItem {
  id: string
  date: string
  type: 'update' | 'social_post' | 'email' | 'milestone'
  description: string
  createdAt: string
}

interface ContentCalendarProps {
  campaignId: string
  creatorId?: string
}

const ITEM_TYPE_COLORS: Record<string, string> = {
  update: 'bg-blue-500',
  social_post: 'bg-purple-500',
  email: 'bg-green-500',
  milestone: 'bg-red-500',
}

const ITEM_TYPE_LABELS: Record<string, string> = {
  update: 'Update',
  social_post: 'Social Post',
  email: 'Email',
  milestone: 'Milestone',
}

export function ContentCalendar({ campaignId, creatorId }: ContentCalendarProps) {
  const { user } = useAuth()
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [items, setItems] = useState<ScheduledItem[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedDay, setSelectedDay] = useState<string | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState({
    date: '',
    type: 'update' as const,
    description: '',
  })
  const [submitting, setSubmitting] = useState(false)
  const [dayItems, setDayItems] = useState<ScheduledItem[]>([])

  const isCreator = user?.id === creatorId

  // Fetch items for the current month
  useEffect(() => {
    const fetchItems = async () => {
      try {
        setLoading(true)
        const startDate = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1)
        const endDate = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0)

        const response = await fetch(
          `/api/campaigns/${campaignId}/calendar?` +
          `startDate=${startDate.toISOString()}&` +
          `endDate=${endDate.toISOString()}`
        )

        if (response.ok) {
          const data = await response.json()
          setItems(data.items || [])
        }
      } catch (error) {
        console.error('Error fetching calendar items:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchItems()
  }, [campaignId, currentMonth])

  // Get items for selected day
  useEffect(() => {
    if (selectedDay) {
      const day = new Date(selectedDay)
      const dayString = day.toISOString().split('T')[0]
      const filtered = items.filter((item) => item.date.split('T')[0] === dayString)
      setDayItems(filtered)
      setFormData({ ...formData, date: selectedDay })
    }
  }, [selectedDay, items])

  const handleAddItem = async () => {
    if (!formData.date || !formData.description.trim() || !isCreator) return

    try {
      setSubmitting(true)
      const response = await fetch(`/api/campaigns/${campaignId}/calendar`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          date: new Date(formData.date).toISOString(),
          type: formData.type,
          description: formData.description,
        }),
      })

      if (response.ok) {
        const newItem = await response.json()
        setItems([...items, newItem.item])
        setFormData({ date: formData.date, type: 'update', description: '' })
      }
    } catch (error) {
      console.error('Error adding item:', error)
    } finally {
      setSubmitting(false)
    }
  }

  const getDaysInMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate()
  }

  const getFirstDayOfMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay()
  }

  const getItemsForDate = (day: number) => {
    const dateStr = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day)
      .toISOString()
      .split('T')[0]
    return items.filter((item) => item.date.split('T')[0] === dateStr)
  }

  const prevMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1))
    setSelectedDay(null)
  }

  const nextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1))
    setSelectedDay(null)
  }

  const daysInMonth = getDaysInMonth(currentMonth)
  const firstDayOfMonth = getFirstDayOfMonth(currentMonth)
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1)
  const emptyDays = Array.from({ length: firstDayOfMonth }, (_, i) => i)

  const monthName = currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <Calendar className="h-6 w-6" />
          Content Calendar
        </h2>
      </div>

      {/* Calendar Grid */}
      <div className="border rounded-lg overflow-hidden bg-white">
        {/* Month Navigation */}
        <div className="bg-gray-50 p-4 border-b flex items-center justify-between">
          <h3 className="text-lg font-semibold">{monthName}</h3>
          <div className="flex gap-2">
            <Button variant="ghost" size="sm" onClick={prevMonth}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm" onClick={nextMonth}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Day Headers */}
        <div className="grid grid-cols-7 bg-gray-100 border-b">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
            <div key={day} className="p-2 text-center font-semibold text-sm">
              {day}
            </div>
          ))}
        </div>

        {/* Calendar Days */}
        <div className="grid grid-cols-7">
          {emptyDays.map((_, i) => (
            <div key={`empty-${i}`} className="aspect-square bg-gray-50" />
          ))}
          {days.map((day) => {
            const dateStr = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day)
              .toISOString()
              .split('T')[0]
            const dayItems = getItemsForDate(day)
            const isSelected = selectedDay?.split('T')[0] === dateStr

            return (
              <div
                key={day}
                onClick={() => {
                  setSelectedDay(dateStr)
                  setShowForm(true)
                }}
                className={cn(
                  'aspect-square p-2 border cursor-pointer hover:bg-blue-50 transition-colors flex flex-col',
                  isSelected && 'bg-blue-100 border-blue-500'
                )}
              >
                <div className="font-semibold text-sm">{day}</div>
                <div className="flex flex-wrap gap-1 mt-1 flex-1 overflow-hidden">
                  {dayItems.slice(0, 3).map((item, idx) => (
                    <div
                      key={item.id}
                      className={cn(
                        'w-2 h-2 rounded-full',
                        ITEM_TYPE_COLORS[item.type] || 'bg-gray-400'
                      )}
                      title={`${ITEM_TYPE_LABELS[item.type]}: ${item.description}`}
                    />
                  ))}
                  {dayItems.length > 3 && (
                    <div className="text-xs text-gray-600">+{dayItems.length - 3}</div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Day Details Sidebar */}
      {selectedDay && (
        <div className="border rounded-lg p-6 bg-white space-y-4">
          <h3 className="text-lg font-semibold">
            {new Date(selectedDay).toLocaleDateString('en-US', {
              weekday: 'long',
              month: 'long',
              day: 'numeric',
            })}
          </h3>

          {/* Day Items List */}
          {dayItems.length > 0 && (
            <div className="space-y-3">
              <h4 className="font-semibold text-sm text-gray-600">Scheduled Items</h4>
              {dayItems.map((item) => (
                <div key={item.id} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                  <div
                    className={cn(
                      'w-3 h-3 rounded-full mt-1 flex-shrink-0',
                      ITEM_TYPE_COLORS[item.type] || 'bg-gray-400'
                    )}
                  />
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-semibold">{ITEM_TYPE_LABELS[item.type]}</div>
                    <div className="text-sm text-gray-600 break-words">{item.description}</div>
                    <div className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {new Date(item.createdAt).toLocaleTimeString()}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Add Item Form */}
          {isCreator && (
            <div className="space-y-3 pt-4 border-t">
              <h4 className="font-semibold text-sm text-gray-600">Add New Item</h4>
              <div className="space-y-2">
                <select
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value as any })}
                  className="w-full px-3 py-2 border rounded-lg text-sm"
                >
                  {Object.entries(ITEM_TYPE_LABELS).map(([key, label]) => (
                    <option key={key} value={key}>
                      {label}
                    </option>
                  ))}
                </select>
                <Input
                  placeholder="What's happening on this day?"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="text-sm"
                />
                <Button
                  onClick={handleAddItem}
                  disabled={submitting || !formData.description.trim()}
                  size="sm"
                  className="w-full"
                >
                  {submitting ? (
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  ) : (
                    <Plus className="h-4 w-4 mr-2" />
                  )}
                  Add Item
                </Button>
              </div>
            </div>
          )}

          {!isCreator && (
            <div className="p-3 bg-gray-50 rounded-lg text-sm text-gray-600">
              Only the campaign creator can add scheduled items.
            </div>
          )}
        </div>
      )}
    </div>
  )
}
