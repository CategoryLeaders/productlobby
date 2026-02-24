'use client'

import React, { useState, useEffect } from 'react'
import {
  Calendar,
  Loader2,
  Clock,
  MapPin,
  Users,
  Plus,
  Video,
  Megaphone,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface CampaignEvent {
  id: string
  campaignId: string
  title: string
  description: string
  date: string
  time: string
  type: 'rally' | 'webinar' | 'social_blast' | 'milestone' | 'deadline' | 'meetup'
  location?: string
  attendees: number
  maxAttendees?: number
  isVirtual: boolean
}

interface EventCalendarProps {
  campaignId: string
}

const getEventIcon = (type: CampaignEvent['type']) => {
  switch (type) {
    case 'rally':
      return Megaphone
    case 'webinar':
      return Video
    case 'social_blast':
      return Megaphone
    case 'milestone':
      return Calendar
    case 'deadline':
      return Clock
    case 'meetup':
      return Users
    default:
      return Calendar
  }
}

const getEventColor = (type: CampaignEvent['type']) => {
  switch (type) {
    case 'rally':
      return 'bg-violet-100 border-violet-300 text-violet-900'
    case 'webinar':
      return 'bg-lime-100 border-lime-300 text-lime-900'
    case 'social_blast':
      return 'bg-amber-100 border-amber-300 text-amber-900'
    case 'milestone':
      return 'bg-violet-100 border-violet-300 text-violet-900'
    case 'deadline':
      return 'bg-amber-100 border-amber-300 text-amber-900'
    case 'meetup':
      return 'bg-lime-100 border-lime-300 text-lime-900'
    default:
      return 'bg-gray-100 border-gray-300 text-gray-900'
  }
}

const getEventBadgeColor = (type: CampaignEvent['type']) => {
  switch (type) {
    case 'rally':
      return 'bg-violet-600 text-white'
    case 'webinar':
      return 'bg-lime-600 text-white'
    case 'social_blast':
      return 'bg-amber-600 text-white'
    case 'milestone':
      return 'bg-violet-600 text-white'
    case 'deadline':
      return 'bg-amber-600 text-white'
    case 'meetup':
      return 'bg-lime-600 text-white'
    default:
      return 'bg-gray-600 text-white'
  }
}

const getEventTypeLabel = (type: CampaignEvent['type']) => {
  switch (type) {
    case 'rally':
      return 'Rally'
    case 'webinar':
      return 'Webinar'
    case 'social_blast':
      return 'Social Blast'
    case 'milestone':
      return 'Milestone'
    case 'deadline':
      return 'Deadline'
    case 'meetup':
      return 'Meetup'
    default:
      return 'Event'
  }
}

export function EventCalendar({ campaignId }: EventCalendarProps) {
  const [events, setEvents] = useState<CampaignEvent[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showAddForm, setShowAddForm] = useState(false)
  const [selectedMonth, setSelectedMonth] = useState(new Date())
  const [viewMode, setViewMode] = useState<'list' | 'calendar'>('list')
  const [newEvent, setNewEvent] = useState({
    title: '',
    description: '',
    date: '',
    time: '09:00',
    type: 'rally' as CampaignEvent['type'],
    location: '',
    maxAttendees: '',
    isVirtual: false,
  })
  const [submittingEvent, setSubmittingEvent] = useState(false)
  const [rsvpLoading, setRsvpLoading] = useState<string | null>(null)

  const fetchEvents = async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await fetch(`/api/campaigns/${campaignId}/event-calendar`)

      if (!response.ok) {
        setError('Failed to load events')
        return
      }

      const data = await response.json()
      setEvents(data.events || [])
    } catch (err) {
      console.error('Error fetching events:', err)
      setError('Failed to load events')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchEvents()
  }, [campaignId])

  const addEvent = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!newEvent.title || !newEvent.date) {
      setError('Please fill in required fields')
      return
    }

    try {
      setSubmittingEvent(true)
      const response = await fetch(`/api/campaigns/${campaignId}/event-calendar`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'create',
          ...newEvent,
          maxAttendees: newEvent.maxAttendees ? parseInt(newEvent.maxAttendees) : undefined,
        }),
      })

      if (!response.ok) {
        setError('Failed to create event')
        return
      }

      setNewEvent({
        title: '',
        description: '',
        date: '',
        time: '09:00',
        type: 'rally',
        location: '',
        maxAttendees: '',
        isVirtual: false,
      })
      setShowAddForm(false)
      await fetchEvents()
    } catch (err) {
      console.error('Error creating event:', err)
      setError('Failed to create event')
    } finally {
      setSubmittingEvent(false)
    }
  }

  const handleRsvp = async (eventId: string) => {
    try {
      setRsvpLoading(eventId)
      const response = await fetch(`/api/campaigns/${campaignId}/event-calendar`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'rsvp',
          eventId,
        }),
      })

      if (!response.ok) {
        setError('Failed to RSVP to event')
        return
      }

      await fetchEvents()
    } catch (err) {
      console.error('Error RSVP:', err)
      setError('Failed to RSVP to event')
    } finally {
      setRsvpLoading(null)
    }
  }

  const monthName = new Intl.DateTimeFormat('en-US', {
    month: 'long',
    year: 'numeric',
  }).format(selectedMonth)

  const previousMonth = () => {
    setSelectedMonth(
      new Date(selectedMonth.getFullYear(), selectedMonth.getMonth() - 1)
    )
  }

  const nextMonth = () => {
    setSelectedMonth(
      new Date(selectedMonth.getFullYear(), selectedMonth.getMonth() + 1)
    )
  }

  const filteredEvents = events.filter((event) => {
    const eventDate = new Date(event.date)
    return (
      eventDate.getMonth() === selectedMonth.getMonth() &&
      eventDate.getFullYear() === selectedMonth.getFullYear()
    )
  })

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-6 h-6 animate-spin text-violet-600" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Calendar className="w-6 h-6 text-violet-600" />
          <h2 className="text-2xl font-bold text-gray-900">Event Calendar</h2>
        </div>
        <Button
          onClick={() => setShowAddForm(!showAddForm)}
          className="bg-violet-600 hover:bg-violet-700"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Event
        </Button>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
          {error}
        </div>
      )}

      {/* Add Event Form */}
      {showAddForm && (
        <div className="p-6 bg-gray-50 border border-gray-200 rounded-lg">
          <form onSubmit={addEvent} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input
                type="text"
                placeholder="Event Title"
                value={newEvent.title}
                onChange={(e) =>
                  setNewEvent({ ...newEvent, title: e.target.value })
                }
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-violet-500"
                required
              />
              <select
                value={newEvent.type}
                onChange={(e) =>
                  setNewEvent({
                    ...newEvent,
                    type: e.target.value as CampaignEvent['type'],
                  })
                }
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-violet-500"
              >
                <option value="rally">Rally</option>
                <option value="webinar">Webinar</option>
                <option value="social_blast">Social Blast</option>
                <option value="milestone">Milestone</option>
                <option value="deadline">Deadline</option>
                <option value="meetup">Meetup</option>
              </select>
            </div>

            <textarea
              placeholder="Description"
              value={newEvent.description}
              onChange={(e) =>
                setNewEvent({ ...newEvent, description: e.target.value })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-violet-500"
              rows={3}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input
                type="date"
                value={newEvent.date}
                onChange={(e) =>
                  setNewEvent({ ...newEvent, date: e.target.value })
                }
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-violet-500"
                required
              />
              <input
                type="time"
                value={newEvent.time}
                onChange={(e) =>
                  setNewEvent({ ...newEvent, time: e.target.value })
                }
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-violet-500"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input
                type="text"
                placeholder="Location (if in-person)"
                value={newEvent.location}
                onChange={(e) =>
                  setNewEvent({ ...newEvent, location: e.target.value })
                }
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-violet-500"
              />
              <input
                type="number"
                placeholder="Max Attendees"
                value={newEvent.maxAttendees}
                onChange={(e) =>
                  setNewEvent({ ...newEvent, maxAttendees: e.target.value })
                }
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-violet-500"
              />
            </div>

            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={newEvent.isVirtual}
                onChange={(e) =>
                  setNewEvent({ ...newEvent, isVirtual: e.target.checked })
                }
                className="w-4 h-4 rounded border-gray-300"
              />
              <span className="text-sm text-gray-700">Virtual Event</span>
            </label>

            <div className="flex gap-3">
              <Button
                type="submit"
                disabled={submittingEvent}
                className="bg-violet-600 hover:bg-violet-700"
              >
                {submittingEvent && (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                )}
                Create Event
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowAddForm(false)}
              >
                Cancel
              </Button>
            </div>
          </form>
        </div>
      )}

      {/* Month Navigation */}
      <div className="flex items-center justify-between bg-white p-4 rounded-lg border border-gray-200">
        <button
          onClick={previousMonth}
          className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md"
        >
          Previous
        </button>
        <h3 className="text-lg font-semibold text-gray-900">{monthName}</h3>
        <button
          onClick={nextMonth}
          className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md"
        >
          Next
        </button>
      </div>

      {/* View Mode Toggle */}
      <div className="flex gap-2">
        <button
          onClick={() => setViewMode('list')}
          className={cn(
            'px-4 py-2 text-sm font-medium rounded-md transition-colors',
            viewMode === 'list'
              ? 'bg-violet-600 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          )}
        >
          List View
        </button>
        <button
          onClick={() => setViewMode('calendar')}
          className={cn(
            'px-4 py-2 text-sm font-medium rounded-md transition-colors',
            viewMode === 'calendar'
              ? 'bg-violet-600 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          )}
        >
          Calendar View
        </button>
      </div>

      {/* Events List */}
      {filteredEvents.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg border border-gray-200">
          <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-3" />
          <p className="text-gray-600">No events scheduled for {monthName}</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredEvents.map((event) => {
            const EventIcon = getEventIcon(event.type)
            return (
              <div
                key={event.id}
                className={cn(
                  'p-4 border rounded-lg',
                  getEventColor(event.type)
                )}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3 flex-1">
                    <div
                      className={cn(
                        'p-2 rounded-lg',
                        getEventBadgeColor(event.type)
                      )}
                    >
                      <EventIcon className="w-5 h-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-semibold text-lg">{event.title}</h4>
                        <span
                          className={cn(
                            'text-xs font-medium px-2 py-1 rounded',
                            getEventBadgeColor(event.type)
                          )}
                        >
                          {getEventTypeLabel(event.type)}
                        </span>
                      </div>
                      <p className="text-sm mb-3">{event.description}</p>

                      <div className="flex flex-wrap gap-4 text-sm">
                        <div className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          <span>{event.date} at {event.time}</span>
                        </div>

                        {event.location && !event.isVirtual && (
                          <div className="flex items-center gap-1">
                            <MapPin className="w-4 h-4" />
                            <span>{event.location}</span>
                          </div>
                        )}

                        {event.isVirtual && (
                          <div className="flex items-center gap-1">
                            <Video className="w-4 h-4" />
                            <span>Virtual</span>
                          </div>
                        )}

                        <div className="flex items-center gap-1">
                          <Users className="w-4 h-4" />
                          <span>
                            {event.attendees}
                            {event.maxAttendees && ` / ${event.maxAttendees}`}{' '}
                            attending
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <Button
                    onClick={() => handleRsvp(event.id)}
                    disabled={rsvpLoading === event.id}
                    variant="outline"
                    className="flex-shrink-0 whitespace-nowrap"
                  >
                    {rsvpLoading === event.id && (
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    )}
                    RSVP
                  </Button>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
