'use client';

import React, { useState, useCallback } from 'react';
import { Clock, Globe, Calendar, Send, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

const TIMEZONES = [
  { value: 'UTC', label: 'UTC (Coordinated Universal Time)' },
  { value: 'America/New_York', label: 'Eastern Time (ET)' },
  { value: 'America/Chicago', label: 'Central Time (CT)' },
  { value: 'America/Denver', label: 'Mountain Time (MT)' },
  { value: 'America/Los_Angeles', label: 'Pacific Time (PT)' },
  { value: 'Europe/London', label: 'London (GMT)' },
  { value: 'Europe/Paris', label: 'Central European Time (CET)' },
  { value: 'Europe/Tokyo', label: 'Japan Standard Time (JST)' },
  { value: 'Asia/Shanghai', label: 'China Standard Time (CST)' },
  { value: 'Asia/Dubai', label: 'Gulf Standard Time (GST)' },
  { value: 'Asia/Singapore', label: 'Singapore Time (SGT)' },
  { value: 'Australia/Sydney', label: 'Australian Eastern Time (AEDT)' },
  { value: 'Pacific/Auckland', label: 'New Zealand Time (NZDT)' },
];

const ACTION_TYPES = [
  { value: 'publish', label: 'Publish Campaign' },
  { value: 'update', label: 'Update Campaign' },
  { value: 'email', label: 'Send Email' },
];

const POPULAR_TIMEZONES = ['America/New_York', 'Europe/London', 'Asia/Tokyo'];

interface ScheduledAction {
  id: string;
  actionType: string;
  scheduledDate: string;
  scheduledTime: string;
  timezone: string;
  createdAt: Date;
}

interface TimezoneSchedulerProps {
  campaignId: string;
  onSchedule: (action: {
    actionType: string;
    scheduledDate: string;
    scheduledTime: string;
    timezone: string;
  }) => void;
}

export function TimezoneScheduler({
  campaignId,
  onSchedule,
}: TimezoneSchedulerProps) {
  const [selectedTimezone, setSelectedTimezone] = useState('UTC');
  const [scheduledActions, setScheduledActions] = useState<ScheduledAction[]>(
    []
  );
  const [formData, setFormData] = useState({
    actionType: 'publish',
    scheduledDate: '',
    scheduledTime: '',
  });
  const [isLoading, setIsLoading] = useState(false);

  const getCurrentTimeInTimezone = useCallback((timezone: string) => {
    try {
      const now = new Date();
      const formatter = new Intl.DateTimeFormat('en-US', {
        timeZone: timezone,
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: true,
      });
      return formatter.format(now);
    } catch {
      return 'Invalid timezone';
    }
  }, []);

  const getTimezoneLabel = (timezone: string) => {
    const tz = TIMEZONES.find((t) => t.value === timezone);
    return tz ? tz.label : timezone;
  };

  const getActionTypeLabel = (actionType: string) => {
    const action = ACTION_TYPES.find((a) => a.value === actionType);
    return action ? action.label : actionType;
  };

  const handleSchedule = useCallback(async () => {
    if (!formData.scheduledDate || !formData.scheduledTime) {
      alert('Please fill in all fields');
      return;
    }

    setIsLoading(true);

    try {
      // Simulate API call delay
      await new Promise((resolve) => setTimeout(resolve, 500));

      const newAction: ScheduledAction = {
        id: `action-${Date.now()}`,
        actionType: formData.actionType,
        scheduledDate: formData.scheduledDate,
        scheduledTime: formData.scheduledTime,
        timezone: selectedTimezone,
        createdAt: new Date(),
      };

      setScheduledActions((prev) => [newAction, ...prev]);
      onSchedule({
        actionType: formData.actionType,
        scheduledDate: formData.scheduledDate,
        scheduledTime: formData.scheduledTime,
        timezone: selectedTimezone,
      });

      // Reset form
      setFormData({
        actionType: 'publish',
        scheduledDate: '',
        scheduledTime: '',
      });
    } finally {
      setIsLoading(false);
    }
  }, [formData, selectedTimezone, onSchedule]);

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6 p-6 bg-white rounded-lg border border-gray-200">
      {/* Header */}
      <div className="flex items-center gap-2">
        <Globe className="w-6 h-6 text-blue-600" />
        <h2 className="text-2xl font-bold text-gray-900">Campaign Scheduler</h2>
        <span className="text-sm text-gray-500 ml-auto">
          Campaign ID: {campaignId}
        </span>
      </div>

      {/* Timezone Selector and Current Time */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Select Timezone
          </label>
          <select
            value={selectedTimezone}
            onChange={(e) => setSelectedTimezone(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          >
            {TIMEZONES.map((tz) => (
              <option key={tz.value} value={tz.value}>
                {tz.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Current Time
          </label>
          <div className="flex items-center gap-2 px-3 py-2 bg-white border border-gray-300 rounded-md">
            <Clock className="w-5 h-5 text-blue-600" />
            <span className="text-sm font-mono font-semibold">
              {getCurrentTimeInTimezone(selectedTimezone)}
            </span>
          </div>
        </div>
      </div>

      {/* Schedule Action Form */}
      <div className="p-4 bg-blue-50 rounded-lg border border-blue-200 space-y-4">
        <h3 className="text-lg font-semibold text-gray-900">
          Schedule New Action
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Action Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Action Type
            </label>
            <select
              value={formData.actionType}
              onChange={(e) =>
                setFormData({ ...formData, actionType: e.target.value })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            >
              {ACTION_TYPES.map((action) => (
                <option key={action.value} value={action.value}>
                  {action.label}
                </option>
              ))}
            </select>
          </div>

          {/* Date Picker */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Date
            </label>
            <div className="relative">
              <Calendar className="w-5 h-5 absolute left-3 top-2.5 text-gray-400 pointer-events-none" />
              <Input
                type="date"
                value={formData.scheduledDate}
                onChange={(e) =>
                  setFormData({ ...formData, scheduledDate: e.target.value })
                }
                className="pl-10"
              />
            </div>
          </div>

          {/* Time Input */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Time ({selectedTimezone})
            </label>
            <div className="relative">
              <Clock className="w-5 h-5 absolute left-3 top-2.5 text-gray-400 pointer-events-none" />
              <Input
                type="time"
                value={formData.scheduledTime}
                onChange={(e) =>
                  setFormData({ ...formData, scheduledTime: e.target.value })
                }
                className="pl-10"
              />
            </div>
          </div>
        </div>

        {/* Schedule Button */}
        <Button
          onClick={handleSchedule}
          disabled={isLoading}
          className={cn(
            'w-full gap-2',
            isLoading ? 'opacity-70 cursor-not-allowed' : ''
          )}
        >
          {isLoading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Scheduling...
            </>
          ) : (
            <>
              <Send className="w-4 h-4" />
              Schedule Action
            </>
          )}
        </Button>
      </div>

      {/* Timezone Comparison */}
      <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Time Comparison (Popular Zones)
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {POPULAR_TIMEZONES.map((tz) => (
            <div
              key={tz}
              className={cn(
                'p-3 rounded-md border-2',
                selectedTimezone === tz
                  ? 'bg-white border-purple-400'
                  : 'bg-white border-gray-200'
              )}
            >
              <div className="text-xs font-medium text-gray-600 mb-1">
                {getTimezoneLabel(tz)}
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-purple-600" />
                <span className="text-sm font-mono font-semibold">
                  {getCurrentTimeInTimezone(tz)}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Scheduled Actions List */}
      <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Scheduled Actions ({scheduledActions.length})
        </h3>

        {scheduledActions.length === 0 ? (
          <p className="text-sm text-gray-500 italic">
            No actions scheduled yet
          </p>
        ) : (
          <div className="space-y-2">
            {scheduledActions.map((action) => (
              <div
                key={action.id}
                className="flex items-center justify-between p-3 bg-white rounded border border-gray-200 hover:border-blue-300 transition-colors"
              >
                <div className="flex items-center gap-3 flex-1">
                  <div className="flex-shrink-0">
                    <Calendar className="w-5 h-5 text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <div className="text-sm font-medium text-gray-900">
                      {getActionTypeLabel(action.actionType)}
                    </div>
                    <div className="text-xs text-gray-500">
                      {action.scheduledDate} at {action.scheduledTime}
                    </div>
                  </div>
                  <div className="flex-shrink-0">
                    <div className="inline-flex items-center gap-1 px-2 py-1 bg-purple-100 text-purple-700 text-xs font-medium rounded">
                      <Globe className="w-3 h-3" />
                      {action.timezone}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
