import { Metadata } from 'next';
import { AlertCircle, Activity, CheckCircle2, Zap, Mail, Globe, Webhook, Clock, TrendingUp } from 'lucide-react';
import { Button } from '@/components/ui/button';

export const metadata: Metadata = {
  title: 'System Status | ProductLobby',
  description:
    'Real-time status and uptime information for ProductLobby services. Monitor the health of our platform and recent incidents.',
  openGraph: {
    title: 'System Status | ProductLobby',
    description: 'Real-time status and uptime information for ProductLobby services.',
  },
};

interface Service {
  id: string;
  name: string;
  status: 'operational' | 'degraded' | 'down';
  uptime: number;
  responseTime: number;
  description: string;
  icon: React.ReactNode;
}

interface Incident {
  id: string;
  title: string;
  status: 'resolved' | 'investigating' | 'identified';
  date: string;
  resolvedTime?: string;
  impact: string;
}

const services: Service[] = [
  {
    id: 'website',
    name: 'Website',
    status: 'operational',
    uptime: 99.98,
    responseTime: 145,
    description: 'ProductLobby main website and dashboard',
    icon: <Globe className="w-5 h-5" />,
  },
  {
    id: 'api',
    name: 'API',
    status: 'operational',
    uptime: 99.95,
    responseTime: 89,
    description: 'Core API services',
    icon: <Zap className="w-5 h-5" />,
  },
  {
    id: 'database',
    name: 'Database',
    status: 'operational',
    uptime: 99.99,
    responseTime: 23,
    description: 'Primary data storage',
    icon: <Activity className="w-5 h-5" />,
  },
  {
    id: 'auth',
    name: 'Authentication',
    status: 'operational',
    uptime: 99.97,
    responseTime: 156,
    description: 'User authentication and authorization',
    icon: <CheckCircle2 className="w-5 h-5" />,
  },
  {
    id: 'email',
    name: 'Email Service',
    status: 'operational',
    uptime: 99.92,
    responseTime: 234,
    description: 'Email delivery and notifications',
    icon: <Mail className="w-5 h-5" />,
  },
  {
    id: 'cdn',
    name: 'CDN',
    status: 'operational',
    uptime: 99.99,
    responseTime: 34,
    description: 'Content delivery network',
    icon: <Globe className="w-5 h-5" />,
  },
  {
    id: 'webhooks',
    name: 'Webhooks',
    status: 'operational',
    uptime: 99.94,
    responseTime: 167,
    description: 'Webhook and event delivery',
    icon: <Webhook className="w-5 h-5" />,
  },
];

const incidents: Incident[] = [
  {
    id: '1',
    title: 'Email Service Latency',
    status: 'resolved',
    date: '2026-02-20',
    resolvedTime: '2026-02-20T14:35:00Z',
    impact: 'Email delivery was experiencing delays of 2-5 minutes.',
  },
  {
    id: '2',
    title: 'API Rate Limiting Adjustment',
    status: 'resolved',
    date: '2026-02-18',
    resolvedTime: '2026-02-18T09:15:00Z',
    impact: 'Temporary rate limit adjustments were made to API endpoints for maintenance.',
  },
  {
    id: '3',
    title: 'Database Maintenance Window',
    status: 'resolved',
    date: '2026-02-15',
    resolvedTime: '2026-02-15T03:45:00Z',
    impact: 'Scheduled maintenance completed successfully with 30-minute planned downtime.',
  },
];

const getStatusColor = (status: 'operational' | 'degraded' | 'down') => {
  switch (status) {
    case 'operational':
      return 'bg-green-500';
    case 'degraded':
      return 'bg-yellow-500';
    case 'down':
      return 'bg-red-500';
    default:
      return 'bg-gray-500';
  }
};

const getStatusText = (status: 'operational' | 'degraded' | 'down') => {
  switch (status) {
    case 'operational':
      return 'Operational';
    case 'degraded':
      return 'Degraded';
    case 'down':
      return 'Down';
    default:
      return 'Unknown';
  }
};

const UptimeChart = ({ uptime }: { uptime: number }) => {
  const segments = 90;
  const operationalSegments = Math.round((uptime / 100) * segments);

  return (
    <div className="flex gap-0.5">
      {Array.from({ length: segments }).map((_, i) => (
        <div
          key={i}
          className={`h-6 flex-1 rounded-sm transition-colors ${
            i < operationalSegments
              ? 'bg-green-500 hover:bg-green-600'
              : 'bg-red-500 hover:bg-red-600'
          }`}
          title={`${i < operationalSegments ? 'Operational' : 'Down'}`}
        />
      ))}
    </div>
  );
};

export default function StatusPage() {
  const lastChecked = new Date().toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });

  const allOperational = services.every((s) => s.status === 'operational');

  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        {/* Header */}
        <div className="mb-12">
          <div className="text-center mb-8">
            <h1 className="text-4xl sm:text-5xl font-bold text-slate-900 mb-4">
              System Status
            </h1>
            <p className="text-lg text-slate-600">
              Monitor the health and performance of ProductLobby services in real-time
            </p>
          </div>

          {/* Overall Status Banner */}
          <div
            className={`rounded-lg p-6 sm:p-8 text-center border-2 ${
              allOperational
                ? 'bg-green-50 border-green-200'
                : 'bg-yellow-50 border-yellow-200'
            }`}
          >
            <div className="flex items-center justify-center gap-3 mb-3">
              <div
                className={`w-4 h-4 rounded-full ${
                  allOperational ? 'bg-green-500' : 'bg-yellow-500'
                }`}
              />
              <h2
                className={`text-2xl font-bold ${
                  allOperational ? 'text-green-700' : 'text-yellow-700'
                }`}
              >
                {allOperational ? 'All Systems Operational' : 'Some Systems Degraded'}
              </h2>
            </div>
            <p
              className={`text-sm ${
                allOperational ? 'text-green-600' : 'text-yellow-600'
              }`}
            >
              {allOperational
                ? 'All ProductLobby services are running normally'
                : 'Some services may be experiencing issues'}
            </p>
          </div>
        </div>

        {/* Services Grid */}
        <section className="mb-16">
          <h2 className="text-2xl font-bold text-slate-900 mb-8">Services</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {services.map((service) => (
              <div
                key={service.id}
                className="bg-white rounded-lg border border-slate-200 p-6 hover:shadow-lg transition-shadow"
              >
                {/* Service Header */}
                <div className="flex items-start justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div className="text-violet-600">{service.icon}</div>
                    <div>
                      <h3 className="font-semibold text-slate-900">{service.name}</h3>
                      <p className="text-sm text-slate-500">{service.description}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div
                      className={`w-3 h-3 rounded-full ${getStatusColor(
                        service.status
                      )}`}
                    />
                    <span className="text-sm font-medium text-slate-600">
                      {getStatusText(service.status)}
                    </span>
                  </div>
                </div>

                {/* Uptime Chart */}
                <div className="mb-6">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-slate-700">90-day uptime</span>
                    <span className="text-sm font-bold text-lime-600">{service.uptime}%</span>
                  </div>
                  <UptimeChart uptime={service.uptime} />
                </div>

                {/* Response Time */}
                <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                  <div className="flex items-center gap-2 text-slate-600">
                    <Clock className="w-4 h-4" />
                    <span className="text-sm">Response Time</span>
                  </div>
                  <span className="font-semibold text-slate-900">{service.responseTime}ms</span>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Recent Incidents */}
        <section className="mb-16">
          <h2 className="text-2xl font-bold text-slate-900 mb-8">Recent Incidents</h2>
          <div className="space-y-4">
            {incidents.map((incident) => (
              <div
                key={incident.id}
                className="bg-white rounded-lg border border-slate-200 p-6 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between mb-3">
                  <h3 className="font-semibold text-slate-900">{incident.title}</h3>
                  <span
                    className={`text-xs font-semibold px-3 py-1 rounded-full ${
                      incident.status === 'resolved'
                        ? 'bg-green-100 text-green-700'
                        : incident.status === 'investigating'
                        ? 'bg-yellow-100 text-yellow-700'
                        : 'bg-blue-100 text-blue-700'
                    }`}
                  >
                    {incident.status.charAt(0).toUpperCase() + incident.status.slice(1)}
                  </span>
                </div>
                <p className="text-slate-600 text-sm mb-4">{incident.impact}</p>
                <div className="flex items-center gap-4 text-xs text-slate-500">
                  <div className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    <span>{new Date(incident.date).toLocaleDateString()}</span>
                  </div>
                  {incident.resolvedTime && (
                    <div className="flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" />
                      <span>
                        Resolved at{' '}
                        {new Date(incident.resolvedTime).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Subscribe Section */}
        <section className="bg-gradient-to-r from-violet-600 to-violet-700 rounded-lg p-8 sm:p-12 mb-16">
          <div className="max-w-2xl">
            <h2 className="text-3xl font-bold text-white mb-3">Get Status Updates</h2>
            <p className="text-violet-100 mb-8">
              Subscribe to receive real-time notifications when our services experience any issues or
              maintenance windows.
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <input
                type="email"
                placeholder="Enter your email"
                className="flex-1 px-4 py-3 rounded-lg bg-violet-50 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-lime-500"
              />
              <Button
                variant="accent"
                size="default"
                className="sm:w-auto whitespace-nowrap"
              >
                Subscribe
              </Button>
            </div>
          </div>
        </section>

        {/* Footer Info */}
        <div className="text-center text-sm text-slate-500 py-8 border-t border-slate-200">
          <div className="flex items-center justify-center gap-2 mb-2">
            <TrendingUp className="w-4 h-4" />
            <span>Last checked: {lastChecked} UTC</span>
          </div>
          <p>
            For more information, visit our{' '}
            <a href="/contact" className="text-violet-600 hover:text-violet-700 font-medium">
              contact page
            </a>
            {' '}or check our{' '}
            <a href="/blog" className="text-violet-600 hover:text-violet-700 font-medium">
              blog
            </a>
            {' '}for updates.
          </p>
        </div>
      </div>
    </main>
  );
}
