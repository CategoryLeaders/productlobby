import { Metadata } from "next";
import { Lock, Shield, Server, Eye, AlertTriangle, FileCheck, Key } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Security | ProductLobby",
  description: "Learn about ProductLobby's security practices, certifications, and commitment to protecting your data.",
};

const SecurityPage = () => {
  const sections = [
    {
      icon: Key,
      title: "Data Encryption",
      description:
        "All data in transit and at rest is encrypted using industry-standard 256-bit encryption. We implement TLS 1.3 for all communications and AES-256 for data storage to ensure maximum security.",
    },
    {
      icon: Shield,
      title: "Authentication",
      description:
        "We support multi-factor authentication (MFA) and OAuth 2.0 for secure account access. All passwords are hashed using bcrypt with salt, and we recommend enabling MFA for all users.",
    },
    {
      icon: Server,
      title: "Infrastructure",
      description:
        "Our infrastructure is hosted on secure, redundant servers with automatic backups and disaster recovery. We maintain 99.9% uptime with distributed systems across multiple data centers.",
    },
    {
      icon: Eye,
      title: "Data Privacy",
      description:
        "We are fully GDPR compliant and follow strict data privacy regulations. Your personal data is never shared with third parties without explicit consent, and you have full control over your information.",
    },
    {
      icon: AlertTriangle,
      title: "Incident Response",
      description:
        "We have a dedicated security team monitoring threats 24/7. Our incident response plan ensures rapid detection and response to any potential security issues.",
    },
    {
      icon: FileCheck,
      title: "Compliance",
      description:
        "ProductLobby is SOC 2 Type II certified and compliant with HIPAA, PCI-DSS, and other industry standards. We undergo regular security audits and penetration testing.",
    },
  ];

  const stats = [
    { value: "256-bit", label: "Data Encryption" },
    { value: "SOC 2", label: "Compliant" },
    { value: "99.9%", label: "Uptime" },
    { value: "GDPR", label: "Ready" },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative py-24 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-violet-50/50 to-transparent">
        <div className="max-w-5xl mx-auto text-center">
          <div className="flex justify-center mb-6">
            <div className="p-3 bg-violet-100 rounded-full">
              <Lock className="w-12 h-12 text-violet-600" />
            </div>
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold tracking-tight mb-6 text-foreground">
            Security at ProductLobby
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            We take security seriously. Our platform is built with industry-leading security practices and certifications to protect your data.
          </p>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-violet-50/30">
        <div className="max-w-5xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-3xl font-bold text-violet-600 mb-2">
                  {stat.value}
                </div>
                <p className="text-sm text-muted-foreground">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Security Sections */}
      <section className="py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto">
          <div className="grid md:grid-cols-2 gap-8">
            {sections.map((section, index) => {
              const IconComponent = section.icon;
              return (
                <div
                  key={index}
                  className="bg-card border border-border rounded-lg p-8 hover:shadow-lg transition-shadow"
                >
                  <div className="flex items-start gap-4">
                    <div className="p-3 bg-lime-100 rounded-lg flex-shrink-0">
                      <IconComponent className="w-6 h-6 text-lime-600" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-foreground mb-3">
                        {section.title}
                      </h3>
                      <p className="text-muted-foreground leading-relaxed">
                        {section.description}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 bg-violet-50/30">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-4 text-foreground">
            Found a Security Issue?
          </h2>
          <p className="text-lg text-muted-foreground mb-8">
            We take all security reports seriously. If you discover a vulnerability, please report it to us immediately.
          </p>
          <Link href="/contact">
            <Button
              size="lg"
              className="bg-violet-600 hover:bg-violet-700 text-white"
            >
              Report a Vulnerability
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
};

export default SecurityPage;
