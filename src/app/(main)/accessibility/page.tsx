import { Metadata } from "next";
import Link from "next/link";
import { Accessibility, Check, AlertCircle, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Accessibility | ProductLobby",
  description: "ProductLobby's commitment to accessibility and inclusive design",
};

export default function AccessibilityPage() {
  const features = [
    "Keyboard navigation support for all interactive elements",
    "Screen reader compatibility and semantic HTML markup",
    "WCAG 2.1 AA compliant color contrast ratios",
    "Descriptive alt text for all images and graphics",
    "Responsive design that works on all devices",
    "Clear focus indicators for keyboard navigation",
  ];

  const limitations = [
    "Some third-party embedded content may have limited accessibility support",
    "Complex data visualizations require additional documentation",
    "Legacy report formats may not meet all accessibility standards",
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Hero Section */}
      <section className="relative overflow-hidden py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-center mb-8">
            <Accessibility className="w-16 h-16 text-violet-600" />
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold text-center text-slate-900 mb-6">
            Accessibility Statement
          </h1>
          <p className="text-xl text-center text-slate-600">
            ProductLobby is committed to ensuring digital accessibility for all users, regardless of ability or disability.
          </p>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-4xl mx-auto">
          {/* Our Commitment */}
          <div className="mb-16">
            <h2 className="text-3xl font-bold text-slate-900 mb-6 flex items-center gap-3">
              <div className="w-1 h-8 bg-violet-600 rounded"></div>
              Our Commitment
            </h2>
            <p className="text-lg text-slate-700 leading-relaxed mb-4">
              We believe that accessibility is a fundamental right. ProductLobby is dedicated to providing an inclusive experience for everyone, including people with disabilities. We continuously work to improve the accessibility of our platform and welcome feedback from our users.
            </p>
            <p className="text-lg text-slate-700 leading-relaxed">
              Our accessibility efforts are an ongoing process. We regularly audit our platform, implement improvements, and stay updated with the latest accessibility standards and best practices.
            </p>
          </div>

          {/* Standards We Follow */}
          <div className="mb-16">
            <h2 className="text-3xl font-bold text-slate-900 mb-6 flex items-center gap-3">
              <div className="w-1 h-8 bg-violet-600 rounded"></div>
              Standards We Follow
            </h2>
            <div className="bg-lime-50 border-l-4 border-lime-500 p-6 rounded">
              <h3 className="text-xl font-semibold text-slate-900 mb-2">WCAG 2.1 Level AA</h3>
              <p className="text-slate-700">
                We strive to meet the Web Content Accessibility Guidelines (WCAG) 2.1 Level AA standards, which provide technical specifications for creating accessible web content.
              </p>
            </div>
          </div>

          {/* Features */}
          <div className="mb-16">
            <h2 className="text-3xl font-bold text-slate-900 mb-6 flex items-center gap-3">
              <div className="w-1 h-8 bg-violet-600 rounded"></div>
              Accessibility Features
            </h2>
            <div className="grid gap-4">
              {features.map((feature, index) => (
                <div
                  key={index}
                  className="flex items-start gap-4 p-4 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors"
                >
                  <Check className="w-6 h-6 text-lime-600 flex-shrink-0 mt-1" />
                  <span className="text-slate-700 text-lg">{feature}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Known Limitations */}
          <div className="mb-16">
            <h2 className="text-3xl font-bold text-slate-900 mb-6 flex items-center gap-3">
              <div className="w-1 h-8 bg-violet-600 rounded"></div>
              Known Limitations
            </h2>
            <div className="space-y-4">
              {limitations.map((limitation, index) => (
                <div
                  key={index}
                  className="flex items-start gap-4 p-4 bg-amber-50 border border-amber-200 rounded-lg"
                >
                  <AlertCircle className="w-6 h-6 text-amber-600 flex-shrink-0 mt-1" />
                  <span className="text-slate-700 text-lg">{limitation}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Feedback & Contact */}
          <div className="bg-gradient-to-r from-violet-50 to-lime-50 p-8 rounded-xl border border-violet-200">
            <h2 className="text-3xl font-bold text-slate-900 mb-6 flex items-center gap-3">
              <div className="w-1 h-8 bg-violet-600 rounded"></div>
              Feedback & Contact
            </h2>
            <p className="text-lg text-slate-700 mb-6">
              We value your feedback and are committed to making ProductLobby accessible to everyone. If you encounter any accessibility barriers or have suggestions for improvement, please don't hesitate to contact us.
            </p>
            <Link href="/contact">
              <Button
                size="lg"
                className="bg-violet-600 hover:bg-violet-700 text-white flex items-center gap-2"
              >
                <Mail className="w-5 h-5" />
                Contact Us
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer Note */}
      <section className="py-12 px-4 sm:px-6 lg:px-8 bg-slate-100">
        <div className="max-w-4xl mx-auto text-center">
          <p className="text-slate-600 text-sm">
            Last updated: February 2026. This statement will be reviewed and updated regularly to reflect our ongoing accessibility improvements.
          </p>
        </div>
      </section>
    </div>
  );
}
