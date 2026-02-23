'use client'

import { useState } from 'react'
import { Copy, ChevronDown, ChevronUp, Code, Lock, Zap } from 'lucide-react'
import Link from 'next/link'

interface CodeExample {
  language: string
  code: string
}

interface ApiEndpoint {
  method: string
  path: string
  description: string
  title: string
  auth: boolean
  rateLimit: string
  examples: CodeExample[]
  params?: { name: string; type: string; description: string }[]
  response: string
}

const endpoints: ApiEndpoint[] = [
  // Campaigns Endpoints
  {
    method: 'GET',
    path: '/api/v1/campaigns',
    title: 'List Campaigns',
    description: 'Retrieve a paginated list of active campaigns with filtering options.',
    auth: true,
    rateLimit: '1000 requests/hour',
    params: [
      { name: 'category', type: 'string', description: 'Filter by category (apparel, tech, audio, etc.)' },
      { name: 'minSignal', type: 'number', description: 'Minimum signal score threshold' },
      { name: 'sort', type: 'string', description: 'Sort by: signal, trending, newest' },
      { name: 'page', type: 'number', description: 'Page number (default: 1)' },
      { name: 'limit', type: 'number', description: 'Results per page (max: 100)' },
    ],
    examples: [
      {
        language: 'curl',
        code: `curl -X GET 'https://api.productlobby.com/api/v1/campaigns?category=tech&sort=signal&limit=20' \\
  -H 'X-API-Key: pl_live_your_api_key_here'`,
      },
      {
        language: 'javascript',
        code: `const response = await fetch('https://api.productlobby.com/api/v1/campaigns?category=tech', {
  headers: {
    'X-API-Key': 'pl_live_your_api_key_here'
  }
})
const campaigns = await response.json()`,
      },
      {
        language: 'python',
        code: `import requests

headers = {'X-API-Key': 'pl_live_your_api_key_here'}
response = requests.get(
  'https://api.productlobby.com/api/v1/campaigns?category=tech',
  headers=headers
)
campaigns = response.json()`,
      },
    ],
    response: `{
  "data": [
    {
      "id": "camp_123abc",
      "title": "Sustainable Water Bottle",
      "description": "An eco-friendly water bottle with temperature control",
      "category": "household",
      "signal": 8500,
      "lobbies": 1250,
      "sentiment": 0.92,
      "createdAt": "2024-02-15T10:30:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 548
  }
}`,
  },
  {
    method: 'GET',
    path: '/api/v1/campaigns/[id]',
    title: 'Get Campaign Details',
    description: 'Retrieve detailed information about a specific campaign including stats and updates.',
    auth: false,
    rateLimit: '2000 requests/hour',
    params: [{ name: 'id', type: 'string', description: 'Campaign ID or slug' }],
    examples: [
      {
        language: 'curl',
        code: `curl -X GET 'https://api.productlobby.com/api/v1/campaigns/sustainable-water-bottle'`,
      },
      {
        language: 'javascript',
        code: `const response = await fetch('https://api.productlobby.com/api/v1/campaigns/sustainable-water-bottle')
const campaign = await response.json()`,
      },
    ],
    response: `{
  "id": "camp_123abc",
  "title": "Sustainable Water Bottle",
  "description": "An eco-friendly water bottle with temperature control",
  "category": "household",
  "status": "ACTIVE",
  "signal": 8500,
  "lobbies": 1250,
  "sentiment": 0.92,
  "targetedBrand": {
    "id": "brand_456def",
    "name": "EcoTech Solutions",
    "logo": "https://..."
  },
  "creator": {
    "id": "user_789ghi",
    "displayName": "Sarah Chen",
    "handle": "@sarahchen",
    "avatar": "https://..."
  },
  "lobbyStats": {
    "totalLobbies": 1250,
    "pendingLobbies": 45,
    "intensityDistribution": {
      "NEAT_IDEA": 300,
      "PROBABLY_BUY": 650,
      "TAKE_MY_MONEY": 300
    }
  },
  "topWishlistThemes": [
    { "theme": "solar powered", "count": 230 },
    { "theme": "leak proof", "count": 180 }
  ],
  "createdAt": "2024-02-15T10:30:00Z",
  "updatedAt": "2024-02-23T15:45:00Z"
}`,
  },

  // Lobbies Endpoints
  {
    method: 'GET',
    path: '/api/v1/lobbies',
    title: 'List Lobbies',
    description: 'Get a list of lobbies (user demand signals) for campaigns.',
    auth: false,
    rateLimit: '2000 requests/hour',
    params: [
      { name: 'campaignId', type: 'string', description: 'Filter by campaign ID' },
      { name: 'status', type: 'string', description: 'Filter by status: PENDING, VERIFIED, REJECTED' },
      { name: 'sort', type: 'string', description: 'Sort by: newest, intensity' },
      { name: 'limit', type: 'number', description: 'Results per page (max: 100)' },
    ],
    examples: [
      {
        language: 'curl',
        code: `curl -X GET 'https://api.productlobby.com/api/v1/lobbies?campaignId=camp_123abc&status=VERIFIED'`,
      },
      {
        language: 'javascript',
        code: `const lobbies = await fetch('https://api.productlobby.com/api/v1/lobbies?campaignId=camp_123abc')
  .then(r => r.json())`,
      },
    ],
    response: `{
  "data": [
    {
      "id": "lobby_001",
      "campaignId": "camp_123abc",
      "userId": "user_123",
      "intensity": "TAKE_MY_MONEY",
      "status": "VERIFIED",
      "reasonText": "I would buy this immediately",
      "createdAt": "2024-02-20T08:15:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 1250
  }
}`,
  },

  // Users Endpoints
  {
    method: 'GET',
    path: '/api/v1/users/[id]',
    title: 'Get User Profile',
    description: 'Retrieve public profile information for a user.',
    auth: false,
    rateLimit: '2000 requests/hour',
    params: [
      { name: 'id', type: 'string', description: 'User ID or handle (e.g., @username)' },
    ],
    examples: [
      {
        language: 'curl',
        code: `curl -X GET 'https://api.productlobby.com/api/v1/users/@sarahchen'`,
      },
    ],
    response: `{
  "id": "user_789ghi",
  "displayName": "Sarah Chen",
  "handle": "@sarahchen",
  "bio": "Product enthusiast & early adopter",
  "avatar": "https://...",
  "location": "San Francisco, CA",
  "contributionScore": 2850,
  "createdAt": "2023-06-15T12:00:00Z"
}`,
  },
]

export default function DevelopersPage() {
  const [expandedEndpoint, setExpandedEndpoint] = useState<number | null>(null)
  const [copiedIdx, setCopiedIdx] = useState<number | null>(null)

  const copyCode = (code: string, idx?: number) => {
    navigator.clipboard.writeText(code)
    if (idx !== undefined) {
      setCopiedIdx(idx)
      setTimeout(() => setCopiedIdx(null), 2000)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      {/* Header */}
      <section className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3 mb-4">
            <Code className="w-8 h-8 text-blue-600" />
            <h1 className="text-4xl font-bold text-slate-900">API Documentation</h1>
          </div>
          <p className="text-lg text-slate-600">
            Build integrations with ProductLobby using our comprehensive REST API
          </p>
        </div>
      </section>

      <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8 space-y-12">
        {/* Overview Section */}
        <section className="rounded-lg bg-white p-8 shadow-md">
          <h2 className="text-2xl font-bold text-slate-900 mb-6">Overview</h2>

          <div className="space-y-4 text-slate-700">
            <p>
              The ProductLobby API allows you to integrate demand signals, campaign data, and user information into
              your applications. Our API is built on REST principles with JSON responses and is optimized for reliability
              and speed.
            </p>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 mt-6">
              <div className="p-4 rounded-lg bg-blue-50 border border-blue-200">
                <div className="flex items-center gap-2 mb-2">
                  <Zap className="w-5 h-5 text-blue-600" />
                  <h3 className="font-semibold text-blue-900">Fast</h3>
                </div>
                <p className="text-sm text-blue-800">Sub-200ms response times with global CDN</p>
              </div>

              <div className="p-4 rounded-lg bg-green-50 border border-green-200">
                <div className="flex items-center gap-2 mb-2">
                  <Lock className="w-5 h-5 text-green-600" />
                  <h3 className="font-semibold text-green-900">Secure</h3>
                </div>
                <p className="text-sm text-green-800">API key authentication with rate limiting</p>
              </div>

              <div className="p-4 rounded-lg bg-purple-50 border border-purple-200">
                <div className="flex items-center gap-2 mb-2">
                  <Code className="w-5 h-5 text-purple-600" />
                  <h3 className="font-semibold text-purple-900">Developer-Friendly</h3>
                </div>
                <p className="text-sm text-purple-800">Clear docs with code examples</p>
              </div>
            </div>
          </div>
        </section>

        {/* Authentication Section */}
        <section className="rounded-lg bg-white p-8 shadow-md">
          <h2 className="text-2xl font-bold text-slate-900 mb-6">Authentication</h2>

          <div className="space-y-4">
            <p className="text-slate-700">
              Use your API key in the <code className="bg-slate-100 px-2 py-1 rounded font-mono text-sm">X-API-Key</code>{' '}
              header for authenticated requests.
            </p>

            <div className="bg-slate-900 text-slate-100 p-4 rounded-lg overflow-x-auto">
              <pre className="text-sm font-mono">
{`curl -X GET 'https://api.productlobby.com/api/v1/campaigns' \\
  -H 'X-API-Key: pl_live_your_api_key_here'`}
              </pre>
            </div>

            <div className="bg-amber-50 border border-amber-200 p-4 rounded-lg">
              <p className="text-sm text-amber-900">
                <strong>Note:</strong> Keep your API keys private. Never commit them to public repositories.
              </p>
            </div>
          </div>
        </section>

        {/* Endpoints Section */}
        <section className="rounded-lg bg-white p-8 shadow-md">
          <h2 className="text-2xl font-bold text-slate-900 mb-6">Endpoints</h2>

          <div className="space-y-2">
            {endpoints.map((endpoint, idx) => (
              <div key={idx} className="border border-slate-200 rounded-lg overflow-hidden">
                <button
                  onClick={() => setExpandedEndpoint(expandedEndpoint === idx ? null : idx)}
                  className="w-full px-6 py-4 flex items-center justify-between hover:bg-slate-50 transition-colors"
                >
                  <div className="flex items-center gap-4 flex-1 text-left">
                    <span
                      className={`px-3 py-1 rounded text-xs font-bold text-white ${
                        endpoint.method === 'GET' ? 'bg-blue-600' : 'bg-green-600'
                      }`}
                    >
                      {endpoint.method}
                    </span>
                    <div className="flex-1">
                      <p className="font-semibold text-slate-900">{endpoint.title}</p>
                      <p className="text-xs font-mono text-slate-500">{endpoint.path}</p>
                    </div>
                  </div>

                  {expandedEndpoint === idx ? (
                    <ChevronUp className="w-5 h-5 text-slate-400" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-slate-400" />
                  )}
                </button>

                {expandedEndpoint === idx && (
                  <div className="border-t border-slate-200 px-6 py-4 space-y-6 bg-slate-50">
                    <p className="text-slate-700">{endpoint.description}</p>

                    {/* Parameters */}
                    {endpoint.params && endpoint.params.length > 0 && (
                      <div>
                        <h4 className="font-semibold text-slate-900 mb-3">Parameters</h4>
                        <div className="space-y-2">
                          {endpoint.params.map((param, pidx) => (
                            <div key={pidx} className="text-sm bg-white p-3 rounded border border-slate-200">
                              <span className="font-mono font-medium text-blue-600">{param.name}</span>
                              <span className="text-slate-500 mx-2">({param.type})</span>
                              <p className="text-slate-600 mt-1">{param.description}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Code Examples */}
                    <div>
                      <h4 className="font-semibold text-slate-900 mb-3">Code Examples</h4>
                      <div className="space-y-3">
                        {endpoint.examples.map((example, eidx) => (
                          <div key={eidx}>
                            <p className="text-xs font-semibold text-slate-500 uppercase mb-2 ml-1">{example.language}</p>
                            <div className="relative bg-slate-900 p-4 rounded-lg overflow-x-auto">
                              <pre className="text-sm font-mono text-green-400">{example.code}</pre>
                              <button
                                onClick={() => copyCode(example.code, eidx)}
                                className="absolute top-4 right-4 p-2 bg-slate-700 hover:bg-slate-600 rounded transition-colors"
                              >
                                <Copy
                                  className={`h-4 w-4 ${
                                    copiedIdx === eidx ? 'text-green-400' : 'text-slate-300'
                                  }`}
                                />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Response Example */}
                    <div>
                      <h4 className="font-semibold text-slate-900 mb-3">Response Example</h4>
                      <div className="relative bg-gray-900 p-4 rounded-lg overflow-x-auto">
                        <pre className="text-xs font-mono text-green-400 whitespace-pre-wrap break-words">
                          {endpoint.response}
                        </pre>
                        <button
                          onClick={() => copyCode(endpoint.response)}
                          className="absolute top-4 right-4 p-2 hover:bg-gray-800 rounded transition-colors"
                        >
                          <Copy className="h-4 w-4 text-gray-400" />
                        </button>
                      </div>
                    </div>

                    {/* Info Boxes */}
                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                      <div className="p-3 rounded-lg bg-blue-50 border border-blue-200">
                        <p className="text-xs font-semibold text-blue-900 uppercase mb-1">Authentication</p>
                        <p className="text-sm text-blue-900">{endpoint.auth ? 'Required' : 'Not required'}</p>
                      </div>
                      <div className="p-3 rounded-lg bg-violet-50 border border-violet-200">
                        <p className="text-xs font-semibold text-violet-900 uppercase mb-1">Rate Limit</p>
                        <p className="text-sm text-violet-900">{endpoint.rateLimit}</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>

        {/* Rate Limits Section */}
        <section className="rounded-lg bg-white p-8 shadow-md">
          <h2 className="text-2xl font-bold text-slate-900 mb-6">Rate Limits</h2>

          <div className="space-y-4">
            <p className="text-slate-700">
              API requests are rate limited to prevent abuse. Rate limit information is included in response headers.
            </p>

            <div className="space-y-2 bg-slate-50 p-4 rounded-lg border border-slate-200">
              <div className="text-sm">
                <span className="font-mono font-semibold text-slate-900">X-RateLimit-Limit</span>
                <span className="text-slate-600 ml-2">Total requests allowed in the time window</span>
              </div>
              <div className="text-sm">
                <span className="font-mono font-semibold text-slate-900">X-RateLimit-Remaining</span>
                <span className="text-slate-600 ml-2">Requests remaining in current window</span>
              </div>
              <div className="text-sm">
                <span className="font-mono font-semibold text-slate-900">X-RateLimit-Reset</span>
                <span className="text-slate-600 ml-2">Unix timestamp when the limit resets</span>
              </div>
            </div>

            <p className="text-sm text-slate-600 italic">
              If you exceed the rate limit, you will receive a 429 Too Many Requests response. Wait until the
              X-RateLimit-Reset time before retrying.
            </p>
          </div>
        </section>

        {/* Error Handling */}
        <section className="rounded-lg bg-white p-8 shadow-md">
          <h2 className="text-2xl font-bold text-slate-900 mb-6">Error Handling</h2>

          <div className="space-y-3">
            <div className="border-l-4 border-red-500 bg-red-50 p-4 rounded-r">
              <p className="font-mono text-sm font-semibold text-slate-900 mb-1">400 Bad Request</p>
              <p className="text-sm text-slate-600">Invalid request parameters or malformed JSON</p>
            </div>
            <div className="border-l-4 border-red-500 bg-red-50 p-4 rounded-r">
              <p className="font-mono text-sm font-semibold text-slate-900 mb-1">401 Unauthorized</p>
              <p className="text-sm text-slate-600">Missing or invalid API key</p>
            </div>
            <div className="border-l-4 border-red-500 bg-red-50 p-4 rounded-r">
              <p className="font-mono text-sm font-semibold text-slate-900 mb-1">404 Not Found</p>
              <p className="text-sm text-slate-600">Resource (campaign, user, lobby) does not exist</p>
            </div>
            <div className="border-l-4 border-red-500 bg-red-50 p-4 rounded-r">
              <p className="font-mono text-sm font-semibold text-slate-900 mb-1">429 Too Many Requests</p>
              <p className="text-sm text-slate-600">Rate limit exceeded. Check X-RateLimit-Reset for retry time</p>
            </div>
            <div className="border-l-4 border-red-500 bg-red-50 p-4 rounded-r">
              <p className="font-mono text-sm font-semibold text-slate-900 mb-1">500 Internal Server Error</p>
              <p className="text-sm text-slate-600">Server error. Retry after a short delay</p>
            </div>
          </div>
        </section>

        {/* Support Section */}
        <section className="rounded-lg bg-gradient-to-r from-blue-50 to-blue-100 p-8 border border-blue-200">
          <h2 className="text-2xl font-bold text-blue-900 mb-4">Need Help?</h2>
          <p className="text-blue-800 mb-4">
            Check out our developer guides, join our community Discord, or contact our support team.
          </p>
          <div className="flex gap-4">
            <Link
              href="/help"
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              Developer Guides
            </Link>
            <Link
              href="/contact"
              className="px-6 py-2 bg-white text-blue-600 rounded-lg hover:bg-blue-50 transition-colors font-medium border border-blue-200"
            >
              Contact Support
            </Link>
          </div>
        </section>
      </div>
    </div>
  )
}
