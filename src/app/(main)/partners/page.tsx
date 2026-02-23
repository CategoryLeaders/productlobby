import type { Metadata } from 'next';
import { Button } from '@/components/ui/button';
import { Handshake, ExternalLink, ArrowRight } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Partners | ProductLobby',
  description: 'Discover our platform partners and integrations that enhance your ProductLobby experience.',
};

interface Partner {
  id: string;
  name: string;
  category: string;
  description: string;
  icon: string;
  link: string;
}

const partners: Partner[] = [
  {
    id: '1',
    name: 'Amplitude',
    category: 'Analytics',
    description: 'Deep analytics and product insights to understand user behavior and optimize your product roadmap.',
    icon: '📊',
    link: 'https://amplitude.com',
  },
  {
    id: '2',
    name: 'Salesforce',
    category: 'CRM',
    description: 'Complete customer relationship management platform to track leads and manage customer relationships.',
    icon: '☁️',
    link: 'https://salesforce.com',
  },
  {
    id: '3',
    name: 'Slack',
    category: 'Communication',
    description: 'Real-time messaging and collaboration for seamless team communication and notifications.',
    icon: '💬',
    link: 'https://slack.com',
  },
  {
    id: '4',
    name: 'HubSpot',
    category: 'Marketing',
    description: 'All-in-one marketing, sales, and service platform to grow your business and nurture leads.',
    icon: '🎯',
    link: 'https://hubspot.com',
  },
  {
    id: '5',
    name: 'Mixpanel',
    category: 'Analytics',
    description: 'Product analytics platform to track user actions and measure feature impact in real-time.',
    icon: '📈',
    link: 'https://mixpanel.com',
  },
  {
    id: '6',
    name: 'Segment',
    category: 'Data Platform',
    description: 'Customer data platform that unifies data from all sources for better insights and personalization.',
    icon: '🔗',
    link: 'https://segment.com',
  },
  {
    id: '7',
    name: 'Twitter API',
    category: 'Social Media',
    description: 'Integrate with Twitter to track mentions, engage with users, and monitor social sentiment.',
    icon: '🐦',
    link: 'https://twitter.com',
  },
  {
    id: '8',
    name: 'Stripe',
    category: 'Payments',
    description: 'Reliable payment processing and subscription management for SaaS and digital products.',
    icon: '💳',
    link: 'https://stripe.com',
  },
  {
    id: '9',
    name: 'Jira',
    category: 'Project Management',
    description: 'Issue tracking and project management tool for agile teams building great products.',
    icon: '✓',
    link: 'https://jira.atlassian.com',
  },
];

export default function PartnersPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="relative overflow-hidden px-4 py-16 sm:px-6 sm:py-24 lg:px-8 lg:py-32">
        <div className="absolute inset-0 bg-gradient-to-br from-violet-50 to-lime-50 opacity-40" />
        <div className="relative mx-auto max-w-7xl">
          <div className="text-center">
            <div className="mb-6 flex justify-center">
              <div className="rounded-full bg-violet-100 p-4">
                <Handshake className="h-10 w-10 text-violet-700" />
              </div>
            </div>
            <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl lg:text-6xl">
              Our Partners
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-lg text-gray-600">
              Seamlessly integrate ProductLobby with your favorite tools and platforms to streamline your workflow and unlock new possibilities.
            </p>
          </div>
        </div>
      </section>

      {/* Partners Grid */}
      <section className="px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
        <div className="mx-auto max-w-7xl">
          <div className="grid gap-8 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
            {partners.map((partner) => (
              <div
                key={partner.id}
                className="group relative rounded-xl border border-gray-200 bg-white p-6 transition-all hover:border-violet-300 hover:shadow-lg hover:shadow-violet-200"
              >
                {/* Category Badge */}
                <div className="mb-4 inline-block">
                  <span className="rounded-full bg-lime-100 px-3 py-1 text-sm font-semibold text-lime-700">
                    {partner.category}
                  </span>
                </div>

                {/* Icon and Title */}
                <div className="mb-4 flex items-center gap-4">
                  <div className="text-4xl">{partner.icon}</div>
                  <h3 className="text-xl font-bold text-gray-900">{partner.name}</h3>
                </div>

                {/* Description */}
                <p className="mb-6 text-gray-600">{partner.description}</p>

                {/* Learn More Link */}
                <a
                  href={partner.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-violet-600 transition-colors hover:text-violet-700 font-medium"
                >
                  Learn More
                  <ExternalLink className="h-4 w-4" />
                </a>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Become a Partner CTA Section */}
      <section className="px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
        <div className="mx-auto max-w-4xl">
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-violet-600 to-violet-700 px-6 py-12 sm:px-12 sm:py-16 lg:px-16">
            {/* Background accent */}
            <div className="absolute right-0 top-0 -z-10 opacity-20">
              <svg
                className="h-96 w-96"
                viewBox="0 0 400 400"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <circle cx="200" cy="200" r="200" fill="currentColor" />
              </svg>
            </div>

            <div className="relative z-10">
              <h2 className="text-3xl font-bold text-white sm:text-4xl">
                Become a Partner
              </h2>
              <p className="mt-4 text-lg text-violet-100">
                Interested in integrating with ProductLobby? Join our partner network and reach our growing community of product teams.
              </p>
              <div className="mt-8">
                <Button
                  asChild
                  className="bg-lime-400 text-gray-900 hover:bg-lime-300"
                >
                  <a href="mailto:partners@productlobby.com">
                    Get in Touch
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </a>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Additional Info Section */}
      <section className="px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
        <div className="mx-auto max-w-7xl">
          <div className="grid gap-8 sm:grid-cols-1 md:grid-cols-3">
            <div className="text-center">
              <div className="mb-4 text-4xl">🤝</div>
              <h3 className="text-lg font-semibold text-gray-900">Easy Integration</h3>
              <p className="mt-2 text-gray-600">
                Quick setup with our comprehensive APIs and webhooks
              </p>
            </div>
            <div className="text-center">
              <div className="mb-4 text-4xl">🚀</div>
              <h3 className="text-lg font-semibold text-gray-900">Grow Together</h3>
              <p className="mt-2 text-gray-600">
                Co-marketing opportunities and mutual promotion
              </p>
            </div>
            <div className="text-center">
              <div className="mb-4 text-4xl">💡</div>
              <h3 className="text-lg font-semibold text-gray-900">Innovation</h3>
              <p className="mt-2 text-gray-600">
                Access to our product roadmap and early features
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
