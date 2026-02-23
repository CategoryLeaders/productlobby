import { type Metadata } from 'next';
import {
  Shield,
  Lock,
  Server,
  CheckCircle2,
  AlertCircle,
  Eye,
  Code2,
  Users,
  Key,
  Clock,
  TrendingUp,
  Mail,
} from 'lucide-react';
import { Button } from '@/components/ui/button';

export const metadata: Metadata = {
  title: 'Security at ProductLobby | Data Protection & Compliance',
  description:
    'Learn about ProductLobby\'s security practices, encryption, compliance certifications, and how we protect your data with industry-leading security standards.',
  keywords: [
    'security',
    'data protection',
    'GDPR compliant',
    'SOC 2',
    'encryption',
    'compliance',
  ],
  openGraph: {
    title: 'Security at ProductLobby',
    description: 'Enterprise-grade security protecting your data',
    type: 'website',
  },
};

const SecurityFeature = ({
  icon: Icon,
  title,
  description,
  features,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
  features: string[];
}) => (
  <div className="rounded-lg border border-gray-200 bg-white p-6 transition-all hover:border-violet-300 hover:shadow-lg">
    <div className="mb-4 flex items-center gap-3">
      <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-gradient-to-br from-violet-500 to-violet-600">
        <Icon className="h-6 w-6 text-white" />
      </div>
      <h3 className="text-xl font-semibold text-gray-900">{title}</h3>
    </div>
    <p className="mb-4 text-gray-600">{description}</p>
    <ul className="space-y-2">
      {features.map((feature, index) => (
        <li key={index} className="flex items-start gap-2">
          <CheckCircle2 className="mt-0.5 h-5 w-5 flex-shrink-0 text-lime-500" />
          <span className="text-sm text-gray-700">{feature}</span>
        </li>
      ))}
    </ul>
  </div>
);

const FAQItem = ({
  question,
  answer,
}: {
  question: string;
  answer: string;
}) => (
  <details className="group rounded-lg border border-gray-200 p-6">
    <summary className="flex cursor-pointer items-center justify-between font-semibold text-gray-900 hover:text-violet-600">
      {question}
      <span className="transition group-open:rotate-180">
        <svg
          className="h-5 w-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 14l-7 7m0 0l-7-7m7 7V3"
          />
        </svg>
      </span>
    </summary>
    <p className="mt-4 text-gray-600">{answer}</p>
  </details>
);

const CertificationBadge = ({
  name,
  description,
}: {
  name: string;
  description: string;
}) => (
  <div className="flex flex-col items-center rounded-lg border border-gray-200 bg-gradient-to-br from-gray-50 to-gray-100 p-6 text-center">
    <CheckCircle2 className="mb-3 h-8 w-8 text-lime-500" />
    <h4 className="font-semibold text-gray-900">{name}</h4>
    <p className="mt-2 text-sm text-gray-600">{description}</p>
  </div>
);

export default function SecurityPage() {
  return (
    <main className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-violet-50 via-white to-lime-50 px-4 py-20 sm:px-6 lg:px-8">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 h-80 w-80 rounded-full bg-violet-100 opacity-20 blur-3xl" />
          <div className="absolute -bottom-40 -left-40 h-80 w-80 rounded-full bg-lime-100 opacity-20 blur-3xl" />
        </div>

        <div className="relative mx-auto max-w-4xl text-center">
          <div className="mb-6 flex justify-center">
            <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-500 to-violet-600 shadow-lg">
              <Shield className="h-12 w-12 text-white" />
            </div>
          </div>

          <h1 className="mb-4 text-4xl font-bold text-gray-900 sm:text-5xl md:text-6xl">
            Security at ProductLobby
          </h1>

          <p className="mx-auto max-w-2xl text-lg text-gray-600 sm:text-xl">
            Enterprise-grade security with industry-leading compliance standards.
            We take data protection seriously and invest heavily in security
            infrastructure to keep your information safe.
          </p>
        </div>
      </section>

      {/* Security Practices */}
      <section className="px-4 py-20 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-6xl">
          <div className="mb-12 text-center">
            <h2 className="mb-4 text-3xl font-bold text-gray-900 sm:text-4xl">
              Our Security Practices
            </h2>
            <p className="text-lg text-gray-600">
              Comprehensive protection across all layers of our platform
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            <SecurityFeature
              icon={Lock}
              title="Data Encryption"
              description="All sensitive data is encrypted using industry-standard encryption protocols to ensure maximum protection in transit and at rest."
              features={[
                'AES-256 encryption for data at rest',
                'TLS 1.3 for data in transit',
                'End-to-end encryption for sensitive communications',
                'Regular encryption key rotation',
                'Hardware security modules (HSM) for key management',
              ]}
            />

            <SecurityFeature
              icon={Key}
              title="Authentication & Authorization"
              description="Multiple layers of authentication ensure only authorized users can access your data and accounts."
              features={[
                'OAuth 2.0 authentication protocol',
                'Two-factor authentication (2FA)',
                'Multi-factor authentication (MFA) support',
                'Session management with timeout policies',
                'Role-based access control (RBAC)',
              ]}
            />

            <SecurityFeature
              icon={Server}
              title="Infrastructure Security"
              description="Our infrastructure is built on secure, scalable cloud platforms with advanced protection mechanisms."
              features={[
                'Enterprise-grade cloud hosting',
                'DDoS protection and mitigation',
                'Web Application Firewall (WAF)',
                'Network segmentation and isolation',
                'Regular infrastructure audits',
              ]}
            />

            <SecurityFeature
              icon={AlertCircle}
              title="Compliance & Standards"
              description="We comply with major data protection and security regulations to protect your privacy and meet regulatory requirements."
              features={[
                'GDPR compliant data processing',
                'SOC 2 Type II certification',
                'HIPAA compliance ready',
                'Data Processing Agreements (DPA)',
                'Regular compliance audits',
              ]}
            />

            <SecurityFeature
              icon={Eye}
              title="24/7 Monitoring & Response"
              description="Continuous monitoring and rapid incident response ensure we can detect and address security issues immediately."
              features={[
                '24/7 security monitoring and alerts',
                'Incident response team on call',
                '1-hour incident response SLA',
                'Security event logging and analysis',
                'Regular threat intelligence updates',
              ]}
            />

            <SecurityFeature
              icon={Code2}
              title="Vulnerability Management"
              description="Proactive vulnerability identification and remediation keeps our platform secure against emerging threats."
              features={[
                'Regular penetration testing',
                'Bug bounty program',
                'Automated security scanning',
                'Code review and static analysis',
                'Security patch management',
              ]}
            />
          </div>
        </div>
      </section>

      {/* Certifications Section */}
      <section className="bg-gray-50 px-4 py-20 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-6xl">
          <div className="mb-12 text-center">
            <h2 className="mb-4 text-3xl font-bold text-gray-900 sm:text-4xl">
              Security Certifications & Compliance
            </h2>
            <p className="text-lg text-gray-600">
              Third-party verified security and compliance certifications
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            <CertificationBadge
              name="SOC 2 Type II"
              description="Annual security, availability, and data integrity audits"
            />
            <CertificationBadge
              name="GDPR Compliant"
              description="Full compliance with EU data protection regulations"
            />
            <CertificationBadge
              name="ISO 27001"
              description="International information security management standard"
            />
            <CertificationBadge
              name="HIPAA Ready"
              description="Healthcare data protection compliance framework"
            />
          </div>
        </div>
      </section>

      {/* Report Vulnerability CTA */}
      <section className="relative overflow-hidden px-4 py-20 sm:px-6 lg:px-8">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-20 -right-20 h-40 w-40 rounded-full bg-lime-100 opacity-20 blur-2xl" />
          <div className="absolute -bottom-20 -left-20 h-40 w-40 rounded-full bg-violet-100 opacity-20 blur-2xl" />
        </div>

        <div className="relative mx-auto max-w-4xl rounded-2xl border border-violet-200 bg-gradient-to-br from-violet-50 to-lime-50 p-8 sm:p-12">
          <div className="grid gap-8 md:grid-cols-2 md:items-center">
            <div>
              <h2 className="mb-4 text-3xl font-bold text-gray-900 sm:text-4xl">
                Found a Security Issue?
              </h2>
              <p className="mb-6 text-lg text-gray-600">
                We take security vulnerabilities seriously. If you discover a
                security issue, please report it responsibly to our security
                team. We offer rewards through our bug bounty program.
              </p>
              <div className="flex flex-col gap-3 sm:flex-row">
                <Button
                  size="lg"
                  className="bg-violet-600 text-white hover:bg-violet-700"
                  asChild
                >
                  <a href="mailto:security@productlobby.com">
                    <Mail className="mr-2 h-5 w-5" />
                    Report Vulnerability
                  </a>
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="border-violet-200 text-violet-600 hover:bg-violet-50"
                >
                  View Bounty Program
                </Button>
              </div>
            </div>

            <div className="flex justify-center">
              <div className="relative h-64 w-64">
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-violet-500 to-lime-500 p-1 opacity-75 blur-lg" />
                <div className="relative flex h-full w-full items-center justify-center rounded-2xl bg-white">
                  <AlertCircle className="h-32 w-32 text-violet-600" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="px-4 py-20 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-4xl">
          <div className="mb-12 text-center">
            <h2 className="mb-4 text-3xl font-bold text-gray-900 sm:text-4xl">
              Security FAQ
            </h2>
            <p className="text-lg text-gray-600">
              Common questions about ProductLobby's security practices
            </p>
          </div>

          <div className="space-y-4">
            <FAQItem
              question="How is my data encrypted?"
              answer="All data at rest is encrypted using AES-256 encryption, and all data in transit is encrypted using TLS 1.3. We use hardware security modules (HSMs) to securely manage encryption keys. Your data is encrypted from the moment it enters our system until you retrieve it."
            />

            <FAQItem
              question="Is ProductLobby GDPR compliant?"
              answer="Yes, ProductLobby is fully GDPR compliant. We have Data Processing Agreements (DPA) in place, implement data protection by design, support data subject rights (access, deletion, portability), and maintain comprehensive data processing documentation. We undergo regular GDPR compliance audits."
            />

            <FAQItem
              question="What happens if there's a security breach?"
              answer="We have a comprehensive incident response plan with a dedicated security team on call 24/7. In the event of a security incident, we maintain a 1-hour response SLA and will notify affected parties within 72 hours as required by law. We conduct thorough post-incident reviews and implement preventive measures."
            />

            <FAQItem
              question="How often is ProductLobby audited?"
              answer="ProductLobby undergoes multiple types of security assessments: annual SOC 2 Type II audits, quarterly penetration testing, monthly vulnerability scanning, and continuous code security analysis. We also participate in a responsible disclosure bug bounty program."
            />

            <FAQItem
              question="Do you support two-factor authentication?"
              answer="Yes, we support both two-factor authentication (2FA) and multi-factor authentication (MFA). Users can enable 2FA through authenticator apps or SMS, and enterprise customers can enable MFA with various methods including TOTP, WebAuthn, and SSO integration."
            />

            <FAQItem
              question="How long do you retain my data?"
              answer="We retain data only as long as necessary to provide our services or as required by law. You can request deletion of your data at any time, and we will comply within the timeframe specified by applicable regulations (typically 30 days). We provide data export functionality to help you retrieve your information."
            />

            <FAQItem
              question="Is ProductLobby SOC 2 certified?"
              answer="Yes, ProductLobby is SOC 2 Type II certified. This means we have undergone independent audits by certified auditors who verify our security controls, availability measures, and data integrity practices. Our certification is valid for 12 months and we maintain continuous compliance."
            />

            <FAQItem
              question="What DDoS protection do you have?"
              answer="We utilize enterprise-grade DDoS protection services that automatically detect and mitigate DDoS attacks. Our infrastructure includes network-level DDoS mitigation, application-level protection through our WAF, and intelligent rate limiting. We can handle attacks up to multiple Tbps."
            />

            <FAQItem
              question="How do you handle sensitive data?"
              answer="Sensitive data is handled with additional protection layers including encryption, access controls, and monitoring. We use role-based access control (RBAC) to limit who can access sensitive information, maintain detailed audit logs, and conduct regular access reviews. Our team members undergo security training."
            />

            <FAQItem
              question="Can I audit your security practices?"
              answer="Yes, enterprise customers can request security audits and documentation. We provide SOC 2 reports to customers, conduct customized security assessments, and maintain detailed security documentation. Contact our enterprise team to discuss your audit requirements."
            />
          </div>
        </div>
      </section>

      {/* Trust Section */}
      <section className="border-t border-gray-200 bg-gray-50 px-4 py-20 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-4xl">
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            <div className="text-center">
              <TrendingUp className="mx-auto mb-4 h-8 w-8 text-violet-600" />
              <div className="text-3xl font-bold text-gray-900">99.99%</div>
              <p className="mt-2 text-gray-600">Uptime SLA</p>
            </div>

            <div className="text-center">
              <Clock className="mx-auto mb-4 h-8 w-8 text-violet-600" />
              <div className="text-3xl font-bold text-gray-900">1 Hour</div>
              <p className="mt-2 text-gray-600">Incident Response</p>
            </div>

            <div className="text-center">
              <Users className="mx-auto mb-4 h-8 w-8 text-violet-600" />
              <div className="text-3xl font-bold text-gray-900">24/7</div>
              <p className="mt-2 text-gray-600">Security Monitoring</p>
            </div>

            <div className="text-center">
              <Shield className="mx-auto mb-4 h-8 w-8 text-violet-600" />
              <div className="text-3xl font-bold text-gray-900">Zero</div>
              <p className="mt-2 text-gray-600">Data Breaches</p>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="px-4 py-20 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-4xl text-center">
          <h2 className="mb-4 text-3xl font-bold text-gray-900 sm:text-4xl">
            Questions About Security?
          </h2>
          <p className="mb-8 text-lg text-gray-600">
            Our security team is here to help. Contact us for more information
            about our security practices and how we protect your data.
          </p>

          <div className="flex flex-col gap-4 sm:flex-row sm:justify-center">
            <Button
              size="lg"
              className="bg-violet-600 text-white hover:bg-violet-700"
              asChild
            >
              <a href="mailto:security@productlobby.com">Email Security Team</a>
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="border-violet-200 text-violet-600 hover:bg-violet-50"
            >
              Schedule a Call
            </Button>
          </div>
        </div>
      </section>
    </main>
  );
}
