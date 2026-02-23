import { Metadata } from "next";
import {
  Search,
  ArrowRight,
  Code2,
  Slack,
  Mail,
  BarChart3,
  MessageSquare,
  Building2,
  Mail as MailIcon,
  Search as SearchIcon,
  LayoutGrid,
  Zap,
} from "lucide-react";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Integrations | ProductLobby",
  description:
    "Connect ProductLobby with your favorite tools and services. Explore 500+ integrations to automate your workflow.",
  openGraph: {
    title: "Integrations | ProductLobby",
    description:
      "Connect ProductLobby with your favorite tools and services. Explore 500+ integrations to automate your workflow.",
  },
};

interface Integration {
  id: string;
  name: string;
  description: string;
  category: "analytics" | "communication" | "crm" | "marketing" | "productivity" | "payments";
  icon: React.ReactNode;
  color: string;
  comingSoon?: boolean;
  connected?: boolean;
}

const integrations: Integration[] = [
  {
    id: "slack",
    name: "Slack",
    description: "Get ProductLobby notifications in your Slack workspace",
    category: "communication",
    icon: "S",
    color: "bg-blue-500",
  },
  {
    id: "zapier",
    name: "Zapier",
    description: "Connect ProductLobby to thousands of apps via Zapier",
    category: "productivity",
    icon: "Z",
    color: "bg-orange-500",
    comingSoon: true,
  },
  {
    id: "hubspot",
    name: "HubSpot",
    description: "Sync customer data and manage relationships seamlessly",
    category: "crm",
    icon: "H",
    color: "bg-orange-600",
  },
  {
    id: "mailchimp",
    name: "Mailchimp",
    description: "Send targeted email campaigns to your ProductLobby users",
    category: "marketing",
    icon: "M",
    color: "bg-yellow-500",
  },
  {
    id: "google-analytics",
    name: "Google Analytics",
    description: "Track user behavior and engagement metrics",
    category: "analytics",
    icon: "G",
    color: "bg-red-500",
  },
  {
    id: "intercom",
    name: "Intercom",
    description: "Chat with your customers directly in ProductLobby",
    category: "communication",
    icon: "I",
    color: "bg-blue-600",
    comingSoon: true,
  },
  {
    id: "salesforce",
    name: "Salesforce",
    description: "Manage sales pipelines and customer information",
    category: "crm",
    icon: "S",
    color: "bg-blue-400",
  },
  {
    id: "jira",
    name: "Jira",
    description: "Track issues and manage projects with Jira integration",
    category: "productivity",
    icon: "J",
    color: "bg-blue-700",
  },
  {
    id: "notion",
    name: "Notion",
    description: "Embed and sync your Notion workspace data",
    category: "productivity",
    icon: "N",
    color: "bg-gray-800",
  },
  {
    id: "stripe",
    name: "Stripe",
    description: "Process payments and manage subscriptions",
    category: "payments",
    icon: "S",
    color: "bg-purple-600",
  },
  {
    id: "segment",
    name: "Segment",
    description: "Unify your customer data and send to any destination",
    category: "analytics",
    icon: "S",
    color: "bg-green-600",
  },
  {
    id: "webhooks",
    name: "Webhooks",
    description: "Custom integrations with incoming and outgoing webhooks",
    category: "productivity",
    icon: "W",
    color: "bg-violet-600",
  },
];

const categories = [
  { id: "all", label: "All" },
  { id: "analytics", label: "Analytics" },
  { id: "communication", label: "Communication" },
  { id: "crm", label: "CRM" },
  { id: "marketing", label: "Marketing" },
  { id: "productivity", label: "Productivity" },
];

interface IntegrationCardProps {
  integration: Integration;
}

function IntegrationCard({ integration }: IntegrationCardProps) {
  return (
    <div className="group relative overflow-hidden rounded-xl border border-gray-200 bg-white p-6 transition-all hover:border-violet-300 hover:shadow-lg">
      {integration.comingSoon && (
        <div className="absolute right-0 top-0 bg-amber-500 px-3 py-1 text-xs font-semibold text-white">
          Coming Soon
        </div>
      )}

      <div className="mb-4 flex items-center gap-3">
        <div
          className={`${integration.color} flex h-12 w-12 items-center justify-center rounded-lg font-bold text-white`}
        >
          {integration.icon}
        </div>
        <h3 className="font-semibold text-gray-900">{integration.name}</h3>
      </div>

      <p className="mb-4 text-sm text-gray-600">{integration.description}</p>

      <div className="mb-4 flex items-center gap-2">
        <span className="inline-block rounded-full bg-violet-100 px-3 py-1 text-xs font-medium text-violet-700 capitalize">
          {integration.category}
        </span>
      </div>

      <Button
        disabled={integration.comingSoon}
        className={`w-full ${
          integration.comingSoon
            ? "bg-gray-200 text-gray-500 hover:bg-gray-200"
            : "bg-violet-600 text-white hover:bg-violet-700"
        }`}
      >
        {integration.comingSoon ? "Coming Soon" : "Connect"}
      </Button>
    </div>
  );
}

export default function IntegrationsPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50">
      {/* Hero Section */}
      <section className="border-b border-gray-200 bg-white">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="mb-4 text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl">
              Integrations Marketplace
            </h1>
            <p className="mx-auto mb-8 max-w-2xl text-lg text-gray-600">
              Connect ProductLobby with your favorite tools and services. Automate your workflow
              and sync data across platforms seamlessly.
            </p>

            {/* Search Bar */}
            <div className="mx-auto max-w-xl">
              <div className="relative">
                <SearchIcon className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search integrations..."
                  className="w-full rounded-lg border border-gray-300 bg-white py-3 pl-12 pr-4 text-gray-900 placeholder-gray-500 focus:border-violet-500 focus:outline-none focus:ring-2 focus:ring-violet-200"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
        {/* Category Filter Tabs */}
        <div className="mb-10 flex flex-wrap gap-2">
          {categories.map((category) => (
            <button
              key={category.id}
              className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${
                category.id === "all"
                  ? "bg-violet-600 text-white"
                  : "border border-gray-300 bg-white text-gray-700 hover:border-violet-400 hover:text-violet-600"
              }`}
            >
              {category.label}
            </button>
          ))}
        </div>

        {/* Integration Cards Grid */}
        <div className="mb-16 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {integrations.map((integration) => (
            <IntegrationCard key={integration.id} integration={integration} />
          ))}
        </div>

        {/* Stats Section */}
        <div className="mb-16 rounded-xl border border-violet-200 bg-gradient-to-r from-violet-50 to-lime-50 p-8 text-center">
          <div className="mb-2 text-4xl font-bold text-violet-600">500+</div>
          <p className="text-gray-700">
            Integrations available through our marketplace and API
          </p>
        </div>

        {/* Build Your Own CTA */}
        <div className="rounded-xl border border-gray-200 bg-white p-8 text-center">
          <div className="mb-4 flex justify-center">
            <Code2 className="h-12 w-12 text-lime-500" />
          </div>
          <h2 className="mb-3 text-2xl font-bold text-gray-900">
            Build Your Own Integration
          </h2>
          <p className="mx-auto mb-6 max-w-2xl text-gray-600">
            Use our powerful REST API and webhooks to build custom integrations tailored to your
            needs. Our comprehensive documentation makes it easy to get started.
          </p>
          <div className="flex flex-col justify-center gap-3 sm:flex-row">
            <Button className="bg-violet-600 text-white hover:bg-violet-700">
              View API Documentation
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
            <Button variant="outline" className="border-gray-300 text-gray-900">
              View Code Examples
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
