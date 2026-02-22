'use client'

import { useState } from 'react'
import { Copy, ChevronDown, ChevronUp } from 'lucide-react'
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
});
const data = await response.json();
console.log(data.data);`,
      },
      {
        language: 'python',
        code: `import requests

headers = {
    'X-API-Key': 'pl_live_your_api_key_here'
}

response = requests.get(
    'https://api.productlobby.com/api/v1/campaigns',
    params={'category': 'tech', 'limit': 20},
    headers=headers
)
data = response.json()
print(data['data'])`,
      },
    ],
    response: `{
  "data": [
    {
      "id": "campaign_123",
      "title": "Wireless Charging for iPhones",
      "description": "We need faster wireless charging speeds",
      "category": "tech",
      "signalScore": 450,
      "lobbyCount": 1250,
      "createdAt": "2025-02-20T10:30:00Z",
      "updatedAt": "2025-02-22T14:20:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 856,
    "pages": 43
  },
  "meta": {
    "rateLimit": {
      "remaining": 999,
      "reset": "2025-02-22T15:45:00Z"
    }
  }
}`,
  },
  {
    method: 'GET',
    path: '/api/v1/campaigns/[id]',
    title: 'Get Campaign Details',
    description: 'Retrieve detailed information about a specific campaign.',
    auth: true,
    rateLimit: '1000 requests/hour',
    examples: [
      {
        language: 'curl',
        code: `curl -X GET 'https://api.productlobby.com/api/v1/campaigns/campaign_123' \\
  -H 'X-API-Key: pl_live_your_api_key_here'`,
      },
      {
        language: 'javascript',
        code: `const campaignId = 'campaign_123';
const response = await fetch(\`https://api.productlobby.com/api/v1/campaigns/\${campaignId}\`, {
  headers: {
    'X-API-Key': 'pl_live_your_api_key_here'
  }
});
const { data } = await response.json();
console.log(data.signalBreakdown);`,
      },
      {
        language: 'python',
        code: `import requests

campaign_id = 'campaign_123'
headers = {'X-API-Key': 'pl_live_your_api_key_here'}

response = requests.get(
    f'https://api.productlobby.com/api/v1/campaigns/{campaign_id}',
    headers=headers
)
data = response.json()['data']
print(f"Signal Score: {data['signalScore']}")
print(f"Market Size: {data['estimatedMarketSize']}")`,
      },
    ],
    response: `{
  "data": {
    "id": "campaign_123",
    "title": "Wireless Charging for iPhones",
    "description": "We need faster wireless charging speeds",
    "category": "tech",
    "signalScore": 450,
    "signalBreakdown": {
      "socialMedia": 180,
      "reviews": 112,
      "news": 90,
      "forums": 68
    },
    "demandMetrics": {
      "total": 1250,
      "byIntensity": {
        "high": 450,
        "medium": 600,
        "low": 200
      }
    },
    "targetedBrandName": "Apple",
    "estimatedMarketSize": 5000000,
    "createdAt": "2025-02-20T10:30:00Z",
    "updatedAt": "2025-02-22T14:20:00Z"
  }
}`,
  },
  {
    method: 'GET',
    path: '/api/v1/campaigns/[id]/signals',
    title: 'Get Campaign Signals',
    description: 'Retrieve time series signal data and intensity distribution for a campaign.',
    auth: true,
    rateLimit: '1000 requests/hour',
    examples: [
      {
        language: 'curl',
        code: `curl -X GET 'https://api.productlobby.com/api/v1/campaigns/campaign_123/signals' \\
  -H 'X-API-Key: pl_live_your_api_key_here'`,
      },
      {
        language: 'javascript',
        code: `const campaignId = 'campaign_123';
const response = await fetch(\`https://api.productlobby.com/api/v1/campaigns/\${campaignId}/signals\`, {
  headers: {
    'X-API-Key': 'pl_live_your_api_key_here'
  }
});
const { data } = await response.json();
console.log(data.timeSeries);`,
      },
      {
        language: 'python',
        code: `import requests
import json

campaign_id = 'campaign_123'
headers = {'X-API-Key': 'pl_live_your_api_key_here'}

response = requests.get(
    f'https://api.productlobby.com/api/v1/campaigns/{campaign_id}/signals',
    headers=headers
)
data = response.json()['data']
for point in data['timeSeries']:
    print(f"{point['date']}: {point['score']} ({point['trend']}%)")`,
      },
    ],
    response: `{
  "data": {
    "campaignId": "campaign_123",
    "timeSeries": [
      {
        "date": "2025-02-20",
        "score": 100,
        "trend": 0
      },
      {
        "date": "2025-02-21",
        "score": 250,
        "trend": 150
      },
      {
        "date": "2025-02-22",
        "score": 450,
        "trend": 80
      }
    ],
    "intensityDistribution": [
      {
        "intensity": "HIGH",
        "count": 450,
        "percentage": 36
      },
      {
        "intensity": "MEDIUM",
        "count": 600,
        "percentage": 48
      },
      {
        "intensity": "LOW",
        "count": 200,
        "percentage": 16
      }
    ],
    "currentScore": 450,
    "trend": 80
  }
}`,
  },
  {
    method: 'GET',
    path: '/api/v1/categories',
    title: 'List Categories',
    description: 'Get overview data for all product categories.',
    auth: true,
    rateLimit: '1000 requests/hour',
    examples: [
      {
        language: 'curl',
        code: `curl -X GET 'https://api.productlobby.com/api/v1/categories' \\
  -H 'X-API-Key: pl_live_your_api_key_here'`,
      },
      {
        language: 'javascript',
        code: `const response = await fetch('https://api.productlobby.com/api/v1/categories', {
  headers: {
    'X-API-Key': 'pl_live_your_api_key_here'
  }
});
const { data } = await response.json();
data.forEach(cat => {
  console.log(\`\${cat.name}: \${cat.campaignCount} campaigns\`);
});`,
      },
      {
        language: 'python',
        code: `import requests

headers = {'X-API-Key': 'pl_live_your_api_key_here'}

response = requests.get(
    'https://api.productlobby.com/api/v1/categories',
    headers=headers
)
categories = response.json()['data']
for cat in categories:
    print(f"{cat['name']}: {cat['campaignCount']} campaigns, avg score {cat['averageSignalScore']}")`,
      },
    ],
    response: `{
  "data": [
    {
      "name": "tech",
      "campaignCount": 234,
      "averageSignalScore": 325,
      "totalLobbies": 12450
    },
    {
      "name": "audio",
      "campaignCount": 156,
      "averageSignalScore": 285,
      "totalLobbies": 8920
    }
  ]
}`,
  },
  {
    method: 'GET',
    path: '/api/v1/trends',
    title: 'Get Market Trends',
    description: 'Retrieve trending campaigns and rising categories with growth metrics.',
    auth: true,
    rateLimit: '1000 requests/hour',
    examples: [
      {
        language: 'curl',
        code: `curl -X GET 'https://api.productlobby.com/api/v1/trends' \\
  -H 'X-API-Key: pl_live_your_api_key_here'`,
      },
      {
        language: 'javascript',
        code: `const response = await fetch('https://api.productlobby.com/api/v1/trends', {
  headers: {
    'X-API-Key': 'pl_live_your_api_key_here'
  }
});
const { data } = await response.json();
console.log('Trending:', data.trendingCampaigns);
console.log('Rising:', data.risingCategories);`,
      },
      {
        language: 'python',
        code: `import requests

headers = {'X-API-Key': 'pl_live_your_api_key_here'}

response = requests.get(
    'https://api.productlobby.com/api/v1/trends',
    headers=headers
)
trends = response.json()['data']
print("Top Trending:")
for campaign in trends['trendingCampaigns'][:5]:
    print(f"  {campaign['title']} ({campaign['growthRate']}% growth)")`,
      },
    ],
    response: `{
  "data": {
    "trendingCampaigns": [
      {
        "id": "campaign_123",
        "title": "Wireless Charging for iPhones",
        "category": "tech",
        "signalScore": 450,
        "lobbyCount": 1250,
        "growthRate": 8.5
      }
    ],
    "risingCategories": [
      {
        "name": "tech",
        "campaignCount": 234,
        "averageSignalScore": 325,
        "growthRate": 12
      }
    ],
    "marketSignals": [
      {
        "metric": "Active Campaigns",
        "value": 1850,
        "trend": "up",
        "change": 8
      }
    ]
  }
}`,
  },
]

export default function DevelopersPage() {
  const [expandedEndpoint, setExpandedEndpoint] = useState<number | null>(0)
  const [copiedCode, setCopiedCode] = useState<string | null>(null)

  const copyCode = (code: string) => {
    navigator.clipboard.writeText(code)
    setCopiedCode(code)
    setTimeout(() => setCopiedCode(null), 2000)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 py-8 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-5xl">
        {/* Header */}
        <div className="mb-12">
          <h1 className="text-4xl font-bold text-slate-900 mb-4">API Documentation</h1>
          <p className="text-lg text-slate-600 mb-6">
            Integrate ProductLobby's demand data into your applications. Access real-time campaign signals, trends, and market insights.
          </p>

          {/* Quick Links */}
          <div className="flex flex-wrap gap-4">
            <Link href="/brand/api-keys" className="inline-flex items-center gap-2 px-4 py-2 bg-violet-600 text-white rounded-lg font-medium hover:bg-violet-700 transition-colors">
              Create API Key →
            </Link>
            <a href="#authentication" className="inline-flex items-center gap-2 px-4 py-2 bg-slate-600 text-white rounded-lg font-medium hover:bg-slate-700 transition-colors">
              Learn Authentication →
            </a>
          </div>
        </div>

        {/* Authentication Section */}
        <section id="authentication" className="mb-12 rounded-lg bg-white p-8 shadow-md">
          <h2 className="text-2xl font-bold text-slate-900 mb-6">Authentication</h2>

          <div className="space-y-6">
            <div>
              <h3 className="font-semibold text-slate-900 mb-3">API Key Header</h3>
              <p className="text-slate-600 mb-4">Include your API key in the X-API-Key header for all requests:</p>
              <div className="relative bg-slate-50 p-4 rounded-lg border border-slate-200">
                <pre className="text-sm font-mono text-slate-900 overflow-x-auto">
{`X-API-Key: pl_live_your_api_key_here`}
                </pre>
                <button
                  onClick={() => copyCode('X-API-Key: pl_live_your_api_key_here')}
                  className="absolute top-4 right-4 p-2 hover:bg-slate-200 rounded transition-colors"
                >
                  <Copy className="h-4 w-4 text-slate-600" />
                </button>
              </div>
            </div>

            <div>
              <h3 className="font-semibold text-slate-900 mb-3">API Key Environments</h3>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="p-4 rounded-lg bg-green-50 border border-green-200">
                  <p className="font-medium text-green-900 mb-1">Live (pl_live_...)</p>
                  <p className="text-sm text-green-800">Production API calls. Use for real integrations.</p>
                </div>
                <div className="p-4 rounded-lg bg-yellow-50 border border-yellow-200">
                  <p className="font-medium text-yellow-900 mb-1">Test (pl_test_...)</p>
                  <p className="text-sm text-yellow-800">Testing and development. Rate limits apply.</p>
                </div>
              </div>
            </div>

            <div>
              <h3 className="font-semibold text-slate-900 mb-3">Rate Limiting</h3>
              <p className="text-slate-600 mb-3">Each API key is limited to 1000 requests per hour.</p>
              <div className="space-y-2 text-sm text-slate-600">
                <p>Check rate limit status in response headers:</p>
                <div className="bg-slate-50 p-3 rounded border border-slate-200 font-mono">
                  <p>X-RateLimit-Remaining: 999</p>
                  <p>X-RateLimit-Reset: 2025-02-22T15:45:00Z</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Endpoints Section */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-slate-900 mb-6">API Endpoints</h2>

          <div className="space-y-4">
            {endpoints.map((endpoint, idx) => (
              <div key={idx} className="rounded-lg bg-white shadow-md overflow-hidden">
                <button
                  onClick={() => setExpandedEndpoint(expandedEndpoint === idx ? null : idx)}
                  className="w-full px-6 py-4 flex items-center justify-between hover:bg-slate-50 transition-colors text-left"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span className={`px-3 py-1 rounded font-mono text-xs font-bold text-white ${endpoint.method === 'GET' ? 'bg-blue-600' : 'bg-green-600'}`}>
                        {endpoint.method}
                      </span>
                      <code className="text-sm font-mono text-slate-900">{endpoint.path}</code>
                    </div>
                    <p className="text-sm text-slate-600">{endpoint.description}</p>
                  </div>
                  {expandedEndpoint === idx ? (
                    <ChevronUp className="h-5 w-5 text-slate-400 flex-shrink-0 ml-4" />
                  ) : (
                    <ChevronDown className="h-5 w-5 text-slate-400 flex-shrink-0 ml-4" />
                  )}
                </button>

                {expandedEndpoint === idx && (
                  <div className="border-t border-slate-200 px-6 py-4 space-y-6">
                    {/* Parameters */}
                    {endpoint.params && endpoint.params.length > 0 && (
                      <div>
                        <h4 className="font-semibold text-slate-900 mb-3">Query Parameters</h4>
                        <div className="space-y-2">
                          {endpoint.params.map((param, pidx) => (
                            <div key={pidx} className="text-sm">
                              <span className="font-mono font-medium text-slate-900">{param.name}</span>
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
                            <p className="text-xs font-semibold text-slate-500 uppercase mb-2">{example.language}</p>
                            <div className="relative bg-slate-900 p-4 rounded-lg overflow-x-auto">
                              <pre className="text-sm font-mono text-slate-100">{example.code}</pre>
                              <button
                                onClick={() => copyCode(example.code)}
                                className="absolute top-4 right-4 p-2 bg-slate-700 hover:bg-slate-600 rounded transition-colors"
                              >
                                <Copy className="h-4 w-4 text-slate-300" />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Response Example */}
                    <div>
                      <h4 className="font-semibold text-slate-900 mb-3">Response Example</h4>
                      <div className="relative bg-slate-50 p-4 rounded-lg border border-slate-200 overflow-x-auto">
                        <pre className="text-xs font-mono text-slate-900">{endpoint.response}</pre>
                        <button
                          onClick={() => copyCode(endpoint.response)}
                          className="absolute top-4 right-4 p-2 hover:bg-slate-200 rounded transition-colors"
                        >
                          <Copy className="h-4 w-4 text-slate-600" />
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

        {/* Error Handling */}
        <section className="rounded-lg bg-white p-8 shadow-md">
          <h2 className="text-2xl font-bold text-slate-900 mb-6">Error Handling</h2>

          <div className="space-y-4">
            <div className="border-l-4 border-red-500 pl-4 py-2">
              <p className="font-mono text-sm font-semibold text-slate-900 mb-1">401 Unauthorized</p>
              <p className="text-sm text-slate-600">Missing or invalid API key</p>
            </div>
            <div className="border-l-4 border-red-500 pl-4 py-2">
              <p className="font-mono text-sm font-semibold text-slate-900 mb-1">404 Not Found</p>
              <p className="text-sm text-slate-600">Resource (campaign, category) does not exist</p>
            </div>
            <div className="border-l-4 border-red-500 pl-4 py-2">
              <p className="font-mono text-sm font-semibold text-slate-900 mb-1">429 Too Many Requests</p>
              <p className="text-sm text-slate-600">Rate limit exceeded. Check X-RateLimit-Reset header for when you can retry</p>
            </div>
            <div className="border-l-4 border-red-500 pl-4 py-2">
              <p className="font-mono text-sm font-semibold text-slate-900 mb-1">500 Internal Server Error</p>
              <p className="text-sm text-slate-600">Server error. Retry after a short delay</p>
            </div>
          </div>
        </section>
      </div>
    </div>
  )
}
