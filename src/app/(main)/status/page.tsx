import { Metadata } from "next";
import { CheckCircle, AlertCircle, Clock, Bell } from "lucide-react";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Platform Status | ProductLobby",
  description: "Real-time platform operational status and uptime indicators for ProductLobby services.",
};

interface Service {
  name: string;
  status: "operational" | "degraded" | "offline";
  uptime: number;
}

const services: Service[] = [
  { name: "API", status: "operational", uptime: 99.98 },
  { name: "Web App", status: "operational", uptime: 99.95 },
  { name: "Database", status: "operational", uptime: 99.99 },
  { name: "Authentication", status: "operational", uptime: 100.0 },
  { name: "Search", status: "operational", uptime: 99.92 },
  { name: "Email Notifications", status: "operational", uptime: 99.87 },
  { name: "CDN/Media", status: "operational", uptime: 99.96 },
  { name: "Webhooks", status: "operational", uptime: 99.94 },
];

interface Incident {
  id: string;
  service: string;
  title: string;
  date: string;
  status: "resolved" | "investigating";
}

const incidents: Incident[] = [
  {
    id: "1",
    service: "Search",
    title: "Temporary search indexing delays",
    date: "Feb 18, 2026",
    status: "resolved",
  },
  {
    id: "2",
    service: "Email Notifications",
    title: "Delayed email delivery",
    date: "Feb 15, 2026",
    status: "resolved",
  },
];

const getStatusColor = (status: string) => {
  switch (status) {
    case "operational":
      return "bg-green-500";
    case "degraded":
      return "bg-yellow-500";
    case "offline":
      return "bg-red-500";
    default:
      return "bg-gray-500";
  }
};

const getStatusText = (status: string) => {
  switch (status) {
    case "operational":
      return "Operational";
    case "degraded":
      return "Degraded";
    case "offline":
      return "Offline";
    default:
      return "Unknown";
  }
};

export default function StatusPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Hero Section */}
      <div className="border-b border-gray-200">
        <div className="mx-auto max-w-5xl px-4 py-16 sm:px-6 lg:px-8">
          <div className="flex items-center gap-4 mb-6">
            <CheckCircle className="h-12 w-12 text-green-500" />
            <h1 className="text-4xl font-bold text-gray-900">
              All Systems Operational
            </h1>
          </div>
          <p className="text-lg text-gray-600 max-w-2xl">
            ProductLobby is running smoothly. All services are operational and performing
            at optimal levels.
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6 lg:px-8">
        {/* Services Status Section */}
        <div className="mb-16">
          <h2 className="text-2xl font-bold text-gray-900 mb-8">Services Status</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {services.map((service) => (
              <div
                key={service.name}
                className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="flex items-center gap-3 mb-4">
                  <div
                    className={`h-3 w-3 rounded-full ${getStatusColor(
                      service.status
                    )}`}
                  />
                  <h3 className="font-semibold text-gray-900">{service.name}</h3>
                </div>
                <div className="space-y-2">
                  <p className="text-sm text-gray-600">
                    Status: <span className="font-medium text-green-600">
                      {getStatusText(service.status)}
                    </span>
                  </p>
                  <p className="text-sm text-gray-600">
                    Uptime: <span className="font-medium text-gray-900">
                      {service.uptime}%
                    </span>
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Incidents Section */}
        <div className="mb-16">
          <div className="flex items-center gap-2 mb-8">
            <Clock className="h-6 w-6 text-gray-400" />
            <h2 className="text-2xl font-bold text-gray-900">
              Last 7 Days Incident History
            </h2>
          </div>
          {incidents.length === 0 ? (
            <div className="rounded-lg border border-green-200 bg-green-50 p-8 text-center">
              <CheckCircle className="h-8 w-8 text-green-500 mx-auto mb-3" />
              <p className="text-green-800 font-medium">No incidents in the last 7 days</p>
            </div>
          ) : (
            <div className="space-y-4">
              {incidents.map((incident) => (
                <div
                  key={incident.id}
                  className="rounded-lg border border-gray-200 bg-white p-6 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <span className="inline-flex items-center rounded-full bg-lime-100 px-3 py-1 text-sm font-medium text-lime-700">
                          {incident.service}
                        </span>
                        {incident.status === "resolved" && (
                          <span className="inline-flex items-center rounded-full bg-green-100 px-3 py-1 text-sm font-medium text-green-700">
                            Resolved
                          </span>
                        )}
                      </div>
                      <h3 className="font-semibold text-gray-900 mb-1">
                        {incident.title}
                      </h3>
                      <p className="text-sm text-gray-600">{incident.date}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Subscribe Section */}
        <div className="rounded-lg border border-violet-200 bg-gradient-to-r from-violet-50 to-indigo-50 p-8 sm:p-12">
          <div className="flex items-start gap-4">
            <Bell className="h-6 w-6 text-violet-600 flex-shrink-0 mt-1" />
            <div className="flex-1">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Stay Updated
              </h2>
              <p className="text-gray-700 mb-6">
                Subscribe to our status page to receive notifications about service
                updates, maintenance windows, and incident reports.
              </p>
              <Button className="bg-violet-600 hover:bg-violet-700 text-white font-medium">
                Subscribe to Updates
              </Button>
            </div>
          </div>
        </div>

        {/* Footer Info */}
        <div className="mt-12 pt-8 border-t border-gray-200 text-center text-sm text-gray-600">
          <p>
            Last updated: {new Date().toLocaleString("en-US", {
              month: "short",
              day: "numeric",
              year: "numeric",
              hour: "2-digit",
              minute: "2-digit",
              timeZone: "UTC",
            })} UTC
          </p>
        </div>
      </div>
    </div>
  );
}
