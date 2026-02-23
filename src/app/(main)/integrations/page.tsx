import React, { useState } from 'react'
import { DashboardLayout } from '@/components/shared'
import { Filter } from 'lucide-react'
import { cn } from '@/lib/utils'

interface Integration {
  id: string
  name: string
  description: string
  status: 'Available' | 'Coming Soon'
  logo: string
  category: string
}

const INTEGRATIONS: Integration[] = [
  {
    id: 'shopify',
    name: 'Shopify',
    description:
      'Connect your Shopify store to sync products and manage campaigns directly from ProductLobby',
    status: 'Available',
    logo: '🛍️',
    category: 'ecommerce',
  },
  {
    id: 'woocommerce',
    name: 'WooCommerce',
    description:
      'Integrate your WooCommerce store to track product demand and manage pre-orders',
    status: 'Available',
    logo: '📦',
    category: 'ecommerce',
  },
  {
    id: 'stripe',
    name: 'Stripe',
    description:
      'Accept payments securely through Stripe for pledges and pre-orders',
    status: 'Available',
    logo: '💳',
    category: 'payments',
  },
  {
    id: 'slack',
    name: 'Slack',
    description:
      'Get real-time notifications in Slack when your campaigns reach milestones',
    status: 'Coming Soon',
    logo: '💬',
    category: 'communication',
  },
  {
    id: 'discord',
    name: 'Discord',
    description:
      'Build a community around your products with Discord integration and updates',
    status: 'Coming Soon',
    logo: '🎮',
    category: 'communication',
  },
  {
    id: 'twitter',
    name: 'Twitter / X',
    description:
      'Share campaign updates and track social engagement from Twitter directly',
    status: 'Coming Soon',
    logo: '𝕏',
    category: 'social',
  },
  {
    id: 'instagram',
    name: 'Instagram',
    description:
      'Connect Instagram to track mentions and engage with your audience visually',
    status: 'Coming Soon',
    logo: '📷',
    category: 'social',
  },
  {
    id: 'mailchimp',
    name: 'Mailchimp',
    description:
      'Sync your campaign supporters to Mailchimp email lists for newsletters',
    status: 'Coming Soon',
    logo: '📧',
    category: 'email',
  },
]

export default function IntegrationsPage() {
  const [filterStatus, setFilterStatus] = useState<
    'All' | 'Available' | 'Coming Soon'
  >('All')

  const filteredIntegrations =
    filterStatus === 'All'
      ? INTEGRATIONS
      : INTEGRATIONS.filter((i) => i.status === filterStatus)

  return (
    <DashboardLayout role="supporter">
      <div className="space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Integrations</h1>
          <p className="text-lg text-gray-600 mt-2">
            Connect ProductLobby with your favorite tools and platforms
          </p>
        </div>

        {/* Filter Section */}
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
          <div className="flex items-center gap-2 text-gray-700 font-medium">
            <Filter size={20} />
            <span>Filter:</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {(['All', 'Available', 'Coming Soon'] as const).map((status) => (
              <button
                key={status}
                onClick={() => setFilterStatus(status)}
                className={cn(
                  'px-4 py-2 rounded-lg font-medium transition-all',
                  'focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500',
                  filterStatus === status
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                )}
              >
                {status}
              </button>
            ))}
          </div>
        </div>

        {/* Integration Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {filteredIntegrations.map((integration) => (
            <div
              key={integration.id}
              className={cn(
                'border rounded-lg p-6 transition-all',
                'hover:shadow-lg',
                integration.status === 'Available'
                  ? 'bg-white border-gray-200 cursor-pointer'
                  : 'bg-gray-50 border-gray-200'
              )}
            >
              {/* Logo */}
              <div
                className={cn(
                  'text-4xl mb-4 w-12 h-12 flex items-center justify-center rounded-lg',
                  integration.status === 'Available'
                    ? 'bg-blue-50'
                    : 'bg-gray-200'
                )}
              >
                {integration.logo}
              </div>

              {/* Name */}
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {integration.name}
              </h3>

              {/* Description */}
              <p className="text-sm text-gray-600 mb-4 line-clamp-3">
                {integration.description}
              </p>

              {/* Status Badge */}
              <div className="flex items-center justify-between">
                <span
                  className={cn(
                    'text-xs font-semibold px-2 py-1 rounded',
                    integration.status === 'Available'
                      ? 'bg-green-100 text-green-700'
                      : 'bg-yellow-100 text-yellow-700'
                  )}
                >
                  {integration.status}
                </span>
                {integration.status === 'Available' && (
                  <button
                    className={cn(
                      'text-xs font-medium px-3 py-1 rounded',
                      'bg-blue-600 text-white hover:bg-blue-700',
                      'transition-colors'
                    )}
                  >
                    Connect
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Empty State */}
        {filteredIntegrations.length === 0 && (
          <div className="text-center py-12">
            <p className="text-lg text-gray-600 mb-2">
              No integrations found for "{filterStatus}"
            </p>
            <p className="text-sm text-gray-500">
              Try adjusting your filter
            </p>
          </div>
        )}

        {/* Info Section */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="font-semibold text-blue-900 mb-2">
            Don't see what you need?
          </h3>
          <p className="text-sm text-blue-800">
            We're constantly adding new integrations. Have a request?{' '}
            <a
              href="/contact"
              className="font-semibold hover:underline text-blue-700"
            >
              Get in touch
            </a>{' '}
            and let us know what would help your workflow.
          </p>
        </div>
      </div>
    </DashboardLayout>
  )
}
