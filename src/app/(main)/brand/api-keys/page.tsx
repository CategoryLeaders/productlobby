'use client'

import { useState, useEffect } from 'react'
import { Copy, Plus, Trash2, Eye, EyeOff, AlertCircle, CheckCircle } from 'lucide-react'
import Link from 'next/link'

interface ApiKey {
  id: string
  environment: 'live' | 'test'
  createdAt: string
  lastUsedAt: string | null
  isActive: boolean
  revokedAt: string | null
}

interface NewKeyResponse {
  id: string
  key: string
  environment: string
  message: string
}

export default function ApiKeysPage() {
  const [apiKeys, setApiKeys] = useState<ApiKey[]>([])
  const [loading, setLoading] = useState(true)
  const [creating, setCreating] = useState(false)
  const [showNewKey, setShowNewKey] = useState(false)
  const [newKey, setNewKey] = useState<NewKeyResponse | null>(null)
  const [copiedKeyId, setCopiedKeyId] = useState<string | null>(null)
  const [visibleKeys, setVisibleKeys] = useState<Set<string>>(new Set())
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  useEffect(() => {
    fetchApiKeys()
  }, [])

  async function fetchApiKeys() {
    try {
      setLoading(true)
      const response = await fetch('/api/brand/api-keys')
      if (!response.ok) throw new Error('Failed to fetch API keys')
      const data = await response.json()
      setApiKeys(data.data || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error loading API keys')
    } finally {
      setLoading(false)
    }
  }

  async function createApiKey(environment: 'live' | 'test') {
    try {
      setCreating(true)
      setError(null)
      const response = await fetch('/api/brand/api-keys', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ environment }),
      })
      if (!response.ok) throw new Error('Failed to create API key')
      const data = await response.json()
      setNewKey(data)
      setShowNewKey(true)
      await fetchApiKeys()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error creating API key')
    } finally {
      setCreating(false)
    }
  }

  async function revokeApiKey(keyId: string) {
    try {
      setError(null)
      const response = await fetch('/api/brand/api-keys', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ keyId, action: 'revoke' }),
      })
      if (!response.ok) throw new Error('Failed to revoke API key')
      setSuccess('API key revoked successfully')
      await fetchApiKeys()
      setTimeout(() => setSuccess(null), 3000)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error revoking API key')
    }
  }

  async function deleteApiKey(keyId: string) {
    try {
      setError(null)
      const response = await fetch(`/api/brand/api-keys?keyId=${keyId}`, {
        method: 'DELETE',
      })
      if (!response.ok) throw new Error('Failed to delete API key')
      setSuccess('API key deleted successfully')
      await fetchApiKeys()
      setTimeout(() => setSuccess(null), 3000)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error deleting API key')
    }
  }

  function copyToClipboard(text: string, keyId: string) {
    navigator.clipboard.writeText(text)
    setCopiedKeyId(keyId)
    setTimeout(() => setCopiedKeyId(null), 2000)
  }

  function toggleKeyVisibility(keyId: string) {
    setVisibleKeys((prev) => {
      const next = new Set(prev)
      if (next.has(keyId)) {
        next.delete(keyId)
      } else {
        next.add(keyId)
      }
      return next
    })
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  }

  const maskKey = (key: string) => {
    const visible = key.substring(0, 10)
    const hidden = '*'.repeat(key.length - 15)
    const ending = key.substring(key.length - 5)
    return `${visible}${hidden}${ending}`
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 py-8 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-4xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900">API Keys</h1>
          <p className="mt-2 text-slate-600">Create and manage API keys to access the ProductLobby demand data API.</p>
        </div>

        {/* Alert Messages */}
        {error && (
          <div className="mb-6 flex items-start gap-3 rounded-lg bg-red-50 p-4 border border-red-200">
            <AlertCircle className="h-5 w-5 flex-shrink-0 text-red-600 mt-0.5" />
            <div className="flex-1">
              <h3 className="font-medium text-red-900">Error</h3>
              <p className="text-sm text-red-800">{error}</p>
            </div>
          </div>
        )}

        {success && (
          <div className="mb-6 flex items-start gap-3 rounded-lg bg-green-50 p-4 border border-green-200">
            <CheckCircle className="h-5 w-5 flex-shrink-0 text-green-600 mt-0.5" />
            <div className="flex-1">
              <h3 className="font-medium text-green-900">Success</h3>
              <p className="text-sm text-green-800">{success}</p>
            </div>
          </div>
        )}

        {/* New Key Modal */}
        {showNewKey && newKey && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div className="w-full max-w-lg rounded-lg bg-white p-6 shadow-lg">
              <h2 className="text-xl font-bold text-slate-900 mb-4">API Key Created</h2>
              <p className="text-sm text-slate-600 mb-4">Save this key now. You will not see it again.</p>

              <div className="mb-6 p-4 bg-slate-50 rounded-lg border border-slate-200">
                <p className="text-xs text-slate-500 mb-2">Your API Key:</p>
                <div className="flex items-center gap-2">
                  <code className="flex-1 break-all font-mono text-sm text-slate-900">{newKey.key}</code>
                  <button
                    onClick={() => copyToClipboard(newKey.key, 'new-key')}
                    className="flex-shrink-0 p-2 hover:bg-slate-200 rounded transition-colors"
                  >
                    {copiedKeyId === 'new-key' ? (
                      <CheckCircle className="h-5 w-5 text-green-600" />
                    ) : (
                      <Copy className="h-5 w-5 text-slate-600" />
                    )}
                  </button>
                </div>
              </div>

              <div className="bg-violet-50 border border-violet-200 rounded-lg p-4 mb-6">
                <p className="text-sm text-violet-900">
                  <strong>Environment:</strong> {newKey.environment === 'live' ? 'Live (Production)' : 'Test'}
                </p>
              </div>

              <button
                onClick={() => setShowNewKey(false)}
                className="w-full py-2 px-4 bg-violet-600 text-white rounded-lg font-medium hover:bg-violet-700 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        )}

        {/* Create Key Section */}
        <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2">
          <button
            onClick={() => createApiKey('live')}
            disabled={creating}
            className="flex items-center justify-center gap-2 rounded-lg bg-violet-600 px-6 py-3 font-medium text-white hover:bg-violet-700 disabled:opacity-50 transition-colors"
          >
            <Plus className="h-5 w-5" />
            Create Live Key
          </button>
          <button
            onClick={() => createApiKey('test')}
            disabled={creating}
            className="flex items-center justify-center gap-2 rounded-lg bg-slate-600 px-6 py-3 font-medium text-white hover:bg-slate-700 disabled:opacity-50 transition-colors"
          >
            <Plus className="h-5 w-5" />
            Create Test Key
          </button>
        </div>

        {/* API Keys List */}
        <div className="rounded-lg bg-white shadow-md overflow-hidden">
          {loading ? (
            <div className="p-8 text-center">
              <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-slate-300 border-t-violet-600"></div>
              <p className="mt-4 text-slate-600">Loading API keys...</p>
            </div>
          ) : apiKeys.length === 0 ? (
            <div className="p-8 text-center">
              <p className="text-slate-600 mb-4">No API keys yet. Create one to get started.</p>
              <Link href="/developers" className="text-violet-600 hover:text-violet-700 font-medium">
                View documentation →
              </Link>
            </div>
          ) : (
            <div className="divide-y">
              {apiKeys.map((key) => (
                <div key={key.id} className="p-6 hover:bg-slate-50 transition-colors">
                  <div className="flex flex-col gap-4">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <span
                            className={`px-2 py-1 rounded text-xs font-medium ${
                              key.environment === 'live'
                                ? 'bg-green-100 text-green-800'
                                : 'bg-yellow-100 text-yellow-800'
                            }`}
                          >
                            {key.environment === 'live' ? 'Live' : 'Test'}
                          </span>
                          {!key.isActive && (
                            <span className="px-2 py-1 rounded text-xs font-medium bg-red-100 text-red-800">
                              Revoked
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-slate-600">
                          Created: {formatDate(key.createdAt)}
                        </p>
                        {key.lastUsedAt && (
                          <p className="text-sm text-slate-600">
                            Last used: {formatDate(key.lastUsedAt)}
                          </p>
                        )}
                      </div>
                      <div className="flex gap-2 flex-shrink-0">
                        {key.isActive && (
                          <>
                            <button
                              onClick={() => revokeApiKey(key.id)}
                              className="p-2 text-slate-600 hover:bg-slate-100 rounded transition-colors"
                              title="Revoke key"
                            >
                              <AlertCircle className="h-5 w-5" />
                            </button>
                            <button
                              onClick={() => deleteApiKey(key.id)}
                              className="p-2 text-red-600 hover:bg-red-50 rounded transition-colors"
                              title="Delete key"
                            >
                              <Trash2 className="h-5 w-5" />
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Documentation Link */}
        <div className="mt-8 rounded-lg bg-blue-50 border border-blue-200 p-6">
          <h3 className="font-medium text-blue-900 mb-2">Need Help?</h3>
          <p className="text-sm text-blue-800 mb-4">
            Check out the API documentation for examples and integration guides.
          </p>
          <Link
            href="/developers"
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
          >
            View API Docs →
          </Link>
        </div>
      </div>
    </div>
  )
}
