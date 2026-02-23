'use client'

import React, { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import {
  Mail,
  Send,
  Loader2,
  Eye,
  EyeOff,
  Smartphone,
  Monitor,
  RefreshCw,
  Settings2,
} from 'lucide-react'

interface DigestSettings {
  frequency: 'daily' | 'weekly' | 'monthly'
  includeSupporters: boolean
  includeVotes: boolean
  includeComments: boolean
  includeSummary: boolean
  enabled: boolean
}

interface DigestEmailPreviewProps {
  campaignId: string
  campaignTitle: string
  onSettingsSaved?: (settings: DigestSettings) => void
}

export const DigestEmailPreview: React.FC<DigestEmailPreviewProps> = ({
  campaignId,
  campaignTitle,
  onSettingsSaved,
}) => {
  const [settings, setSettings] = useState<DigestSettings>({
    frequency: 'weekly',
    includeSupporters: true,
    includeVotes: true,
    includeComments: true,
    includeSummary: true,
    enabled: true,
  })
  const [previewMode, setPreviewMode] = useState<'desktop' | 'mobile'>('desktop')
  const [showPreview, setShowPreview] = useState(true)
  const [isLoading, setIsLoading] = useState(false)
  const [isSending, setIsSending] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [digestData, setDigestData] = useState<any>(null)

  useEffect(() => {
    loadDigestSettings()
  }, [campaignId])

  const loadDigestSettings = async () => {
    try {
      setIsLoading(true)
      const response = await fetch(`/api/campaigns/${campaignId}/digest-settings`)
      if (response.ok) {
        const data = await response.json()
        setSettings(data.settings || settings)
      }
    } catch (err) {
      console.error('Failed to load digest settings:', err)
    } finally {
      setIsLoading(false)
    }
  }

  const saveSettings = async () => {
    try {
      setIsLoading(true)
      setError(null)
      setSuccess(null)

      const response = await fetch(`/api/campaigns/${campaignId}/digest-settings`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ settings }),
      })

      if (!response.ok) {
        throw new Error('Failed to save settings')
      }

      setSuccess('Settings saved successfully')
      onSettingsSaved?.(settings)
      setTimeout(() => setSuccess(null), 3000)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save settings')
    } finally {
      setIsLoading(false)
    }
  }

  const sendTestEmail = async () => {
    try {
      setIsSending(true)
      setError(null)

      const response = await fetch(`/api/campaigns/${campaignId}/digest-settings`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ settings, sendTestEmail: true }),
      })

      if (!response.ok) {
        throw new Error('Failed to send test email')
      }

      setSuccess('Test email sent successfully')
      setTimeout(() => setSuccess(null), 3000)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send test email')
    } finally {
      setIsSending(false)
    }
  }

  const generateEmailPreview = () => {
    const frequencyLabel = {
      daily: 'Daily',
      weekly: 'Weekly',
      monthly: 'Monthly',
    }[settings.frequency]

    return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <style>
    body {
      margin: 0;
      padding: 20px;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      background-color: #f8fafc;
      color: #1e293b;
    }
    .container {
      max-width: 600px;
      margin: 0 auto;
      background-color: #ffffff;
      border-radius: 12px;
      overflow: hidden;
      box-shadow: 0 1px 3px rgba(0,0,0,0.1);
    }
    .header {
      background: linear-gradient(135deg, #7c3aed 0%, #9333ea 100%);
      padding: 40px 20px;
      text-align: center;
      color: white;
    }
    .header-logo {
      font-size: 24px;
      font-weight: 700;
      margin-bottom: 10px;
    }
    .header-title {
      font-size: 20px;
      font-weight: 600;
      margin: 10px 0;
    }
    .header-subtitle {
      font-size: 14px;
      opacity: 0.9;
      margin: 5px 0;
    }
    .content {
      padding: 30px 20px;
    }
    .section {
      margin-bottom: 30px;
    }
    .section-title {
      font-size: 16px;
      font-weight: 600;
      margin-bottom: 15px;
      color: #7c3aed;
      display: flex;
      align-items: center;
      gap: 8px;
    }
    .stat-card {
      background-color: #f1f5f9;
      padding: 15px;
      border-radius: 8px;
      margin-bottom: 10px;
      border-left: 4px solid #84cc16;
    }
    .stat-value {
      font-size: 28px;
      font-weight: 700;
      color: #7c3aed;
    }
    .stat-label {
      font-size: 12px;
      color: #64748b;
      margin-top: 5px;
    }
    .stat-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 12px;
      margin-bottom: 20px;
    }
    .supporter-item {
      padding: 12px;
      background-color: #f8fafc;
      border-radius: 6px;
      border-left: 3px solid #84cc16;
      margin-bottom: 8px;
    }
    .supporter-name {
      font-weight: 600;
      color: #1e293b;
      font-size: 14px;
    }
    .supporter-action {
      font-size: 12px;
      color: #64748b;
      margin-top: 3px;
    }
    .footer {
      background-color: #f1f5f9;
      padding: 20px;
      text-align: center;
      font-size: 12px;
      color: #64748b;
      border-top: 1px solid #e2e8f0;
    }
    .button {
      display: inline-block;
      background-color: #7c3aed;
      color: white;
      padding: 12px 24px;
      border-radius: 6px;
      text-decoration: none;
      font-weight: 600;
      margin-top: 15px;
    }
    .divider {
      height: 1px;
      background-color: #e2e8f0;
      margin: 20px 0;
    }
  </style>
</head>
<body>
  <div class="container">
    <!-- Header -->
    <div class="header">
      <div class="header-logo">ProductLobby</div>
      <div class="header-title">${frequencyLabel} Digest</div>
      <div class="header-subtitle">for "${campaignTitle}"</div>
      <div class="header-subtitle" style="margin-top: 10px;">Campaign activity summary</div>
    </div>

    <!-- Content -->
    <div class="content">
      <!-- Summary Section -->
      ${settings.includeSummary ? `
      <div class="section">
        <div class="section-title">📊 Activity Summary</div>
        <div class="stat-grid">
          <div class="stat-card">
            <div class="stat-value">42</div>
            <div class="stat-label">Total Supporters</div>
          </div>
          <div class="stat-card">
            <div class="stat-value">8</div>
            <div class="stat-label">New This Period</div>
          </div>
          <div class="stat-card">
            <div class="stat-value">156</div>
            <div class="stat-label">Total Votes</div>
          </div>
          <div class="stat-card">
            <div class="stat-value">23</div>
            <div class="stat-label">New Comments</div>
          </div>
        </div>
      </div>
      ` : ''}

      <!-- New Supporters Section -->
      ${settings.includeSupporters ? `
      <div class="section">
        <div class="section-title">🌟 New Supporters</div>
        <div class="supporter-item">
          <div class="supporter-name">Sarah Chen</div>
          <div class="supporter-action">Joined and lobbied for this campaign</div>
        </div>
        <div class="supporter-item">
          <div class="supporter-name">Alex Rodriguez</div>
          <div class="supporter-action">Pledged support to the cause</div>
        </div>
        <div class="supporter-item">
          <div class="supporter-name">Jamie Mitchell</div>
          <div class="supporter-action">Added this to their wishlist</div>
        </div>
      </div>
      ` : ''}

      <!-- Recent Votes Section -->
      ${settings.includeVotes ? `
      <div class="section">
        <div class="section-title">👍 Recent Votes</div>
        <div class="stat-card">
          <div class="stat-value">45</div>
          <div class="stat-label">Votes received this period</div>
        </div>
      </div>
      ` : ''}

      <!-- Top Comments Section -->
      ${settings.includeComments ? `
      <div class="section">
        <div class="section-title">💬 Top Comments</div>
        <div class="supporter-item">
          <div class="supporter-name">Jordan Williams</div>
          <div class="supporter-action">This feature would solve our biggest problem</div>
        </div>
      </div>
      ` : ''}

      <div class="divider"></div>

      <div style="text-align: center;">
        <a href="https://productlobby.com" class="button">View Campaign</a>
      </div>
    </div>

    <!-- Footer -->
    <div class="footer">
      <p>ProductLobby - where customer voices drive product decisions</p>
      <p style="margin-top: 10px; opacity: 0.7;">
        You're receiving this because you're the creator of this campaign.
      </p>
    </div>
  </div>
</body>
</html>
    `
  }

  return (
    <div className="space-y-6">
      {/* Settings Card */}
      <div className="rounded-lg border border-slate-200 bg-white p-6">
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-violet-100">
              <Settings2 className="h-5 w-5 text-violet-600" />
            </div>
            <div>
              <h3 className="font-semibold text-slate-900">Digest Email Settings</h3>
              <p className="text-sm text-slate-500">Configure how your digest emails look</p>
            </div>
          </div>
          <button
            onClick={() => setShowPreview(!showPreview)}
            className="rounded-lg p-2 hover:bg-slate-100"
            title="Toggle preview"
          >
            {showPreview ? (
              <EyeOff className="h-5 w-5 text-slate-600" />
            ) : (
              <Eye className="h-5 w-5 text-slate-600" />
            )}
          </button>
        </div>

        {error && (
          <div className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-700">
            {error}
          </div>
        )}

        {success && (
          <div className="mb-4 rounded-lg bg-green-50 p-3 text-sm text-green-700">
            {success}
          </div>
        )}

        {/* Enable/Disable Toggle */}
        <div className="mb-6 flex items-center justify-between rounded-lg bg-slate-50 p-4">
          <div>
            <div className="font-medium text-slate-900">Enable Digest Emails</div>
            <p className="text-sm text-slate-600">Receive periodic campaign activity summaries</p>
          </div>
          <button
            onClick={() => {
              const updated = { ...settings, enabled: !settings.enabled }
              setSettings(updated)
            }}
            className={cn(
              'relative inline-flex h-8 w-14 items-center rounded-full transition-colors',
              settings.enabled ? 'bg-violet-600' : 'bg-slate-300'
            )}
          >
            <span
              className={cn(
                'inline-block h-6 w-6 transform rounded-full bg-white transition-transform',
                settings.enabled ? 'translate-x-7' : 'translate-x-1'
              )}
            />
          </button>
        </div>

        {settings.enabled && (
          <>
            {/* Frequency Selection */}
            <div className="mb-6">
              <label className="mb-3 block text-sm font-medium text-slate-900">
                Digest Frequency
              </label>
              <div className="flex gap-3">
                {(['daily', 'weekly', 'monthly'] as const).map((freq) => (
                  <button
                    key={freq}
                    onClick={() => setSettings({ ...settings, frequency: freq })}
                    className={cn(
                      'flex-1 rounded-lg px-4 py-2 font-medium transition-all',
                      settings.frequency === freq
                        ? 'bg-violet-600 text-white'
                        : 'border border-slate-300 text-slate-700 hover:bg-slate-50'
                    )}
                  >
                    {freq.charAt(0).toUpperCase() + freq.slice(1)}
                  </button>
                ))}
              </div>
            </div>

            {/* Content Sections Toggle */}
            <div className="mb-6">
              <label className="mb-3 block text-sm font-medium text-slate-900">
                Include in Digest
              </label>
              <div className="space-y-3">
                <label className="flex items-center gap-3 rounded-lg p-3 hover:bg-slate-50">
                  <input
                    type="checkbox"
                    checked={settings.includeSummary}
                    onChange={(e) =>
                      setSettings({ ...settings, includeSummary: e.target.checked })
                    }
                    className="h-4 w-4 rounded border-slate-300 text-violet-600"
                  />
                  <div>
                    <div className="font-medium text-slate-900">Activity Summary</div>
                    <p className="text-xs text-slate-600">Total supporters, votes, and comments</p>
                  </div>
                </label>

                <label className="flex items-center gap-3 rounded-lg p-3 hover:bg-slate-50">
                  <input
                    type="checkbox"
                    checked={settings.includeSupporters}
                    onChange={(e) =>
                      setSettings({ ...settings, includeSupporters: e.target.checked })
                    }
                    className="h-4 w-4 rounded border-slate-300 text-violet-600"
                  />
                  <div>
                    <div className="font-medium text-slate-900">New Supporters</div>
                    <p className="text-xs text-slate-600">Highlights of new campaign backers</p>
                  </div>
                </label>

                <label className="flex items-center gap-3 rounded-lg p-3 hover:bg-slate-50">
                  <input
                    type="checkbox"
                    checked={settings.includeVotes}
                    onChange={(e) =>
                      setSettings({ ...settings, includeVotes: e.target.checked })
                    }
                    className="h-4 w-4 rounded border-slate-300 text-violet-600"
                  />
                  <div>
                    <div className="font-medium text-slate-900">Recent Votes</div>
                    <p className="text-xs text-slate-600">Vote counts and trends</p>
                  </div>
                </label>

                <label className="flex items-center gap-3 rounded-lg p-3 hover:bg-slate-50">
                  <input
                    type="checkbox"
                    checked={settings.includeComments}
                    onChange={(e) =>
                      setSettings({ ...settings, includeComments: e.target.checked })
                    }
                    className="h-4 w-4 rounded border-slate-300 text-violet-600"
                  />
                  <div>
                    <div className="font-medium text-slate-900">Top Comments</div>
                    <p className="text-xs text-slate-600">Highlighted feedback and discussions</p>
                  </div>
                </label>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3">
              <Button
                onClick={saveSettings}
                disabled={isLoading}
                className="flex-1 bg-violet-600 hover:bg-violet-700"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  'Save Settings'
                )}
              </Button>

              <Button
                onClick={sendTestEmail}
                disabled={isSending || isLoading}
                variant="outline"
                className="flex-1"
              >
                {isSending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Sending...
                  </>
                ) : (
                  <>
                    <Send className="mr-2 h-4 w-4" />
                    Send Test Email
                  </>
                )}
              </Button>
            </div>
          </>
        )}
      </div>

      {/* Preview Card */}
      {showPreview && (
        <div className="rounded-lg border border-slate-200 bg-white p-6">
          <div className="mb-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Mail className="h-5 w-5 text-violet-600" />
              <div>
                <h3 className="font-semibold text-slate-900">Email Preview</h3>
                <p className="text-sm text-slate-500">How your digest will look</p>
              </div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setPreviewMode('desktop')}
                className={cn(
                  'rounded-lg p-2 transition-colors',
                  previewMode === 'desktop'
                    ? 'bg-violet-100 text-violet-600'
                    : 'text-slate-400 hover:text-slate-600'
                )}
                title="Desktop preview"
              >
                <Monitor className="h-5 w-5" />
              </button>
              <button
                onClick={() => setPreviewMode('mobile')}
                className={cn(
                  'rounded-lg p-2 transition-colors',
                  previewMode === 'mobile'
                    ? 'bg-violet-100 text-violet-600'
                    : 'text-slate-400 hover:text-slate-600'
                )}
                title="Mobile preview"
              >
                <Smartphone className="h-5 w-5" />
              </button>
            </div>
          </div>

          {/* Email Preview Container */}
          <div
            className={cn(
              'overflow-hidden rounded-lg bg-slate-50 p-4',
              previewMode === 'mobile' ? 'max-w-sm mx-auto' : ''
            )}
          >
            <iframe
              srcDoc={generateEmailPreview()}
              className="w-full border-none"
              style={{ height: previewMode === 'mobile' ? '600px' : '800px' }}
              title="Email Preview"
            />
          </div>

          {/* Preview Info */}
          <div className="mt-4 rounded-lg bg-blue-50 p-3 text-xs text-blue-700">
            This preview shows how your{' '}
            <span className="font-semibold">
              {['daily', 'weekly', 'monthly'][['daily', 'weekly', 'monthly'].indexOf(settings.frequency)]}
            </span>{' '}
            digest email will appear to your supporters. The actual content will be personalized with
            real campaign data.
          </div>
        </div>
      )}
    </div>
  )
}
