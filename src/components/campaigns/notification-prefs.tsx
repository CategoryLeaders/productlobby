'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';

interface NotificationPreferences {
  newLobbies: boolean;
  comments: boolean;
  brandResponses: boolean;
  milestones: boolean;
}

export function NotificationPreferences({ campaignId }: { campaignId: string }) {
  const [prefs, setPrefs] = useState<NotificationPreferences>({
    newLobbies: true,
    comments: true,
    brandResponses: true,
    milestones: true,
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const fetchPreferences = async () => {
      try {
        setLoading(true);
        const response = await fetch(
          `/api/campaigns/${campaignId}/notification-prefs`
        );

        if (!response.ok) {
          if (response.status === 401) {
            setError('You must be logged in to manage notification preferences');
          } else {
            throw new Error(`Failed to fetch preferences: ${response.statusText}`);
          }
          return;
        }

        const data = await response.json();
        setPrefs(data.preferences);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load preferences');
      } finally {
        setLoading(false);
      }
    };

    fetchPreferences();
  }, [campaignId]);

  const handleToggle = (key: keyof NotificationPreferences) => {
    setPrefs((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
    setSuccess(false);
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      setError(null);
      setSuccess(false);

      const response = await fetch(
        `/api/campaigns/${campaignId}/notification-prefs`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(prefs),
        }
      );

      if (!response.ok) {
        if (response.status === 401) {
          setError('You must be logged in to update preferences');
        } else {
          throw new Error(`Failed to save preferences: ${response.statusText}`);
        }
        return;
      }

      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save preferences');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="rounded-lg border border-gray-200 bg-white p-6">
        <p className="text-gray-500">Loading preferences...</p>
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-6">
      <h3 className="mb-6 text-lg font-semibold text-gray-900">
        Notification Preferences
      </h3>

      {error && (
        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {success && (
        <div className="mb-4 rounded-lg border border-green-200 bg-green-50 p-3 text-sm text-green-700">
          Preferences saved successfully
        </div>
      )}

      <div className="space-y-4">
        <div className="flex items-center justify-between rounded-lg border border-gray-100 p-4 hover:bg-gray-50">
          <div>
            <p className="font-medium text-gray-900">New Lobbies</p>
            <p className="text-sm text-gray-600">
              Notify me when new lobbies are added to this campaign
            </p>
          </div>
          <button
            onClick={() => handleToggle('newLobbies')}
            className={`relative h-6 w-11 rounded-full transition-colors ${
              prefs.newLobbies ? 'bg-blue-600' : 'bg-gray-300'
            }`}
            disabled={saving}
            aria-label="Toggle new lobbies notification"
          >
            <span
              className={`absolute top-1 h-4 w-4 transform rounded-full bg-white transition-transform ${
                prefs.newLobbies ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </button>
        </div>

        <div className="flex items-center justify-between rounded-lg border border-gray-100 p-4 hover:bg-gray-50">
          <div>
            <p className="font-medium text-gray-900">Comments</p>
            <p className="text-sm text-gray-600">
              Notify me when new comments are added
            </p>
          </div>
          <button
            onClick={() => handleToggle('comments')}
            className={`relative h-6 w-11 rounded-full transition-colors ${
              prefs.comments ? 'bg-blue-600' : 'bg-gray-300'
            }`}
            disabled={saving}
            aria-label="Toggle comments notification"
          >
            <span
              className={`absolute top-1 h-4 w-4 transform rounded-full bg-white transition-transform ${
                prefs.comments ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </button>
        </div>

        <div className="flex items-center justify-between rounded-lg border border-gray-100 p-4 hover:bg-gray-50">
          <div>
            <p className="font-medium text-gray-900">Brand Responses</p>
            <p className="text-sm text-gray-600">
              Notify me when a brand responds to this campaign
            </p>
          </div>
          <button
            onClick={() => handleToggle('brandResponses')}
            className={`relative h-6 w-11 rounded-full transition-colors ${
              prefs.brandResponses ? 'bg-blue-600' : 'bg-gray-300'
            }`}
            disabled={saving}
            aria-label="Toggle brand responses notification"
          >
            <span
              className={`absolute top-1 h-4 w-4 transform rounded-full bg-white transition-transform ${
                prefs.brandResponses ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </button>
        </div>

        <div className="flex items-center justify-between rounded-lg border border-gray-100 p-4 hover:bg-gray-50">
          <div>
            <p className="font-medium text-gray-900">Milestones</p>
            <p className="text-sm text-gray-600">
              Notify me when campaign milestones are reached
            </p>
          </div>
          <button
            onClick={() => handleToggle('milestones')}
            className={`relative h-6 w-11 rounded-full transition-colors ${
              prefs.milestones ? 'bg-blue-600' : 'bg-gray-300'
            }`}
            disabled={saving}
            aria-label="Toggle milestones notification"
          >
            <span
              className={`absolute top-1 h-4 w-4 transform rounded-full bg-white transition-transform ${
                prefs.milestones ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </button>
        </div>
      </div>

      <Button
        onClick={handleSave}
        disabled={saving}
        className="mt-6 w-full"
      >
        {saving ? 'Saving...' : 'Save Preferences'}
      </Button>
    </div>
  );
}
