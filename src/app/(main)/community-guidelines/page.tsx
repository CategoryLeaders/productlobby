import { Metadata } from 'next';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import {
  Shield,
  Heart,
  MessageCircle,
  AlertTriangle,
  Scale,
  Mail,
} from 'lucide-react';

export const metadata: Metadata = {
  title: 'Community Guidelines | ProductLobby',
  description: 'ProductLobby community guidelines and code of conduct',
};

export default function CommunityGuidelinesPage() {
  const guidelines = [
    {
      icon: Heart,
      title: 'Our Values',
      content:
        'ProductLobby is built on the foundation of respect, inclusivity, and integrity. We believe that diverse perspectives strengthen our community and drive innovation. Every member deserves to be treated with dignity, and we are committed to creating an environment where everyone can contribute meaningfully.',
    },
    {
      icon: MessageCircle,
      title: 'Respectful Communication',
      content:
        'Engage with others constructively and respectfully. Disagreements are natural, but attacks, harassment, or discrimination of any kind are not tolerated. Listen actively, assume good intent, and focus on ideas rather than individuals. Keep discussions professional and avoid personal insults or offensive language.',
    },
    {
      icon: Shield,
      title: 'Content Standards',
      content:
        'All content must comply with applicable laws and regulations. Do not share spam, malware, or misleading information. Respect intellectual property rights and do not plagiarize. Avoid posting explicit, violent, or hateful content. Commercial promotion should follow our guidelines and must be clearly marked.',
    },
    {
      icon: AlertTriangle,
      title: 'Reporting Violations',
      content:
        'If you encounter a violation of these guidelines, please report it immediately. Use the report function on the platform or contact our moderation team. Provide specific details about the violation to help us investigate. We take all reports seriously and will respond promptly.',
    },
    {
      icon: Scale,
      title: 'Enforcement',
      content:
        'Violations of community guidelines may result in warnings, content removal, temporary suspension, or permanent banning depending on severity. We believe in proportional responses and second chances when appropriate. Repeat offenders or severe violations will result in immediate permanent removal from the community.',
    },
    {
      icon: Mail,
      title: 'Contact & Support',
      content:
        'Have questions about our guidelines? Need to report something? Our community team is here to help. Reach out through our contact form, and we will respond to your inquiry within 24 hours. Your feedback helps us build a better community.',
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-r from-violet-600 via-violet-700 to-purple-700 py-20 text-white">
        <div className="mx-auto max-w-4xl px-6">
          <div className="flex items-center gap-4 mb-6">
            <Shield className="h-12 w-12 flex-shrink-0 text-lime-300" />
            <h1 className="text-5xl font-bold">Community Guidelines</h1>
          </div>
          <p className="text-lg text-violet-100">
            Building a safe, respectful, and inclusive community where everyone
            can contribute and grow together.
          </p>
        </div>
      </section>

      {/* Guidelines Sections */}
      <section className="py-16 px-6">
        <div className="mx-auto max-w-4xl">
          <div className="grid gap-8 md:grid-cols-2">
            {guidelines.map((guideline, index) => {
              const IconComponent = guideline.icon;
              return (
                <div
                  key={index}
                  className="rounded-lg border border-slate-200 bg-white p-8 shadow-sm transition-all hover:shadow-md hover:border-violet-200"
                >
                  <div className="mb-4 flex items-center gap-3">
                    <IconComponent className="h-6 w-6 text-violet-600" />
                    <h2 className="text-xl font-bold text-slate-900">
                      {guideline.title}
                    </h2>
                  </div>
                  <p className="text-base leading-relaxed text-slate-600">
                    {guideline.content}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="border-t border-slate-200 bg-white py-12 px-6">
        <div className="mx-auto max-w-4xl text-center">
          <p className="mb-6 text-slate-700">
            Have concerns or questions? Our community team is ready to help.
          </p>
          <Link href="/contact">
            <Button className="bg-violet-600 hover:bg-violet-700 text-white px-8 py-6 text-lg rounded-lg transition-colors">
              Contact Us
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
}
