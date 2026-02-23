import { Metadata } from 'next';
import {
  AccessibilityIcon,
  Keyboard,
  Speaker,
  Palette,
  ImageIcon,
  Focus,
  Smartphone,
  CheckCircle,
  AlertCircle,
  Mail,
  BarChart3,
} from 'lucide-react';
import { Button } from '@/components/ui/button';

export const metadata: Metadata = {
  title: 'Accessibility Statement | ProductLobby',
  description:
    'Learn about ProductLobby\'s commitment to digital accessibility and WCAG 2.1 AA compliance.',
  openGraph: {
    title: 'Accessibility Statement | ProductLobby',
    description:
      'Learn about ProductLobby\'s commitment to digital accessibility and WCAG 2.1 AA compliance.',
    type: 'website',
  },
};

const AccessibilityFeature = ({
  icon: Icon,
  title,
  description,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
}) => (
  <div className="flex gap-4">
    <div className="flex-shrink-0">
      <Icon className="h-6 w-6 text-violet-600" aria-hidden="true" />
    </div>
    <div>
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
        {title}
      </h3>
      <p className="text-gray-600 dark:text-gray-400">{description}</p>
    </div>
  </div>
);

export default function AccessibilityPage() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="mx-auto max-w-4xl px-4 py-24 sm:px-6 lg:px-8">
          <div className="flex flex-col items-center text-center">
            <div className="mb-6 rounded-full bg-violet-100 dark:bg-violet-900/30 p-4">
              <AccessibilityIcon className="h-12 w-12 text-violet-600 dark:text-violet-400" />
            </div>
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white sm:text-5xl mb-4">
              Accessibility Statement
            </h1>
            <p className="max-w-2xl text-lg text-gray-600 dark:text-gray-400">
              ProductLobby is committed to providing digital accessibility for all users,
              regardless of ability or device used to access our platform.
            </p>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <div className="mx-auto max-w-4xl px-4 py-16 sm:px-6 lg:px-8">
        {/* Commitment Statement */}
        <section className="mb-16">
          <div className="rounded-lg bg-white dark:bg-gray-700 p-8 shadow-sm border border-gray-200 dark:border-gray-600">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
              <CheckCircle className="h-6 w-6 text-lime-500" />
              Our Commitment
            </h2>
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              ProductLobby strives to ensure that all features are accessible to everyone,
              including people with disabilities. We are committed to providing an inclusive
              experience and continuously improving our platform's accessibility.
            </p>
            <p className="text-gray-700 dark:text-gray-300">
              We follow the Web Content Accessibility Guidelines (WCAG) 2.1 Level AA as our
              standard for digital accessibility. These guidelines help ensure our website is
              accessible to the widest possible audience, including people with visual, motor,
              hearing, and cognitive impairments.
            </p>
          </div>
        </section>

        {/* WCAG Compliance */}
        <section className="mb-16">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
            WCAG 2.1 Level AA Compliance
          </h2>
          <div className="grid gap-6 md:grid-cols-3">
            {[
              {
                title: 'Perceivable',
                description:
                  'Information and user interface components are presented in ways users can perceive.',
              },
              {
                title: 'Operable',
                description:
                  'Users can navigate and operate all functionality through keyboard and other input devices.',
              },
              {
                title: 'Understandable',
                description:
                  'Information and operations are clear and easy to understand for all users.',
              },
            ].map((item) => (
              <div
                key={item.title}
                className="rounded-lg bg-white dark:bg-gray-700 p-6 shadow-sm border border-gray-200 dark:border-gray-600"
              >
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                  {item.title}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">{item.description}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Accessibility Features */}
        <section className="mb-16">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-8">
            Accessibility Features
          </h2>
          <div className="space-y-8">
            <AccessibilityFeature
              icon={Keyboard}
              title="Full Keyboard Navigation"
              description="All interactive elements, including buttons, links, and form fields, are fully accessible using keyboard navigation. Users can navigate through the entire application using Tab, Enter, and arrow keys without requiring a mouse."
            />
            <AccessibilityFeature
              icon={Speaker}
              title="Screen Reader Support"
              description="Our platform is tested and compatible with popular screen readers including NVDA, JAWS, and VoiceOver. Proper ARIA labels and semantic HTML ensure content is properly announced to assistive technologies."
            />
            <AccessibilityFeature
              icon={Palette}
              title="Color Contrast"
              description="All text meets or exceeds WCAG AA standards for color contrast ratios (4.5:1 for normal text, 3:1 for large text). Users can also enable high contrast modes for enhanced visibility."
            />
            <AccessibilityFeature
              icon={ImageIcon}
              title="Descriptive Alt Text"
              description="All meaningful images include descriptive alt text. Decorative images are properly marked as such to prevent unnecessary verbosity for screen reader users."
            />
            <AccessibilityFeature
              icon={Focus}
              title="Clear Focus Indicators"
              description="All interactive elements display clear, visible focus indicators when navigated via keyboard. This helps users track their position on the page and improves overall navigation experience."
            />
            <AccessibilityFeature
              icon={Smartphone}
              title="Responsive Design"
              description="Our platform is fully responsive and accessible on all screen sizes, from mobile devices to large desktop monitors. Content reflows properly and remains usable at any zoom level."
            />
          </div>
        </section>

        {/* Known Limitations */}
        <section className="mb-16">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
            <AlertCircle className="h-6 w-6 text-amber-500" />
            Known Limitations
          </h2>
          <div className="rounded-lg bg-white dark:bg-gray-700 p-8 shadow-sm border border-gray-200 dark:border-gray-600">
            <ul className="space-y-3 text-gray-700 dark:text-gray-300">
              <li className="flex gap-3">
                <span className="text-violet-600 dark:text-violet-400 font-bold">•</span>
                <span>
                  Some data visualization charts may require alternative text descriptions for
                  full comprehension by screen reader users.
                </span>
              </li>
              <li className="flex gap-3">
                <span className="text-violet-600 dark:text-violet-400 font-bold">•</span>
                <span>
                  PDFs and downloadable documents may not always meet accessibility standards.
                  Please contact us if you need accessible alternatives.
                </span>
              </li>
              <li className="flex gap-3">
                <span className="text-violet-600 dark:text-violet-400 font-bold">•</span>
                <span>
                  Third-party embedded content and integrations may have varying levels of
                  accessibility support beyond our control.
                </span>
              </li>
            </ul>
          </div>
        </section>

        {/* Report Accessibility Issues */}
        <section className="mb-16">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
            <Mail className="h-6 w-6 text-lime-500" />
            Report Accessibility Issues
          </h2>
          <div className="rounded-lg bg-white dark:bg-gray-700 p-8 shadow-sm border border-gray-200 dark:border-gray-600">
            <p className="text-gray-700 dark:text-gray-300 mb-6">
              We welcome feedback on the accessibility of ProductLobby. If you encounter any
              accessibility barriers or have suggestions for improvement, please get in touch
              with us using one of the following methods:
            </p>
            <div className="space-y-4 mb-8">
              <div className="flex items-center gap-3">
                <Mail className="h-5 w-5 text-violet-600 dark:text-violet-400 flex-shrink-0" />
                <div>
                  <p className="font-semibold text-gray-900 dark:text-white">Email</p>
                  <a
                    href="mailto:accessibility@productlobby.com"
                    className="text-violet-600 dark:text-violet-400 hover:underline"
                  >
                    accessibility@productlobby.com
                  </a>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <AlertCircle className="h-5 w-5 text-violet-600 dark:text-violet-400 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-gray-900 dark:text-white">Support Form</p>
                  <p className="text-gray-600 dark:text-gray-400">
                    Use our support portal to submit detailed accessibility reports with
                    screenshots and browser information.
                  </p>
                </div>
              </div>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
              Please include as much detail as possible about the issue, including:
            </p>
            <ul className="space-y-2 text-gray-700 dark:text-gray-300 mb-6">
              <li className="flex gap-2">
                <span className="text-lime-500">✓</span>
                <span>Page or feature where the issue occurs</span>
              </li>
              <li className="flex gap-2">
                <span className="text-lime-500">✓</span>
                <span>Browser and assistive technology used</span>
              </li>
              <li className="flex gap-2">
                <span className="text-lime-500">✓</span>
                <span>Description of the accessibility barrier</span>
              </li>
              <li className="flex gap-2">
                <span className="text-lime-500">✓</span>
                <span>Steps to reproduce the issue</span>
              </li>
            </ul>
            <Button className="bg-violet-600 hover:bg-violet-700 text-white">
              Submit Accessibility Report
            </Button>
          </div>
        </section>

        {/* Testing Methods */}
        <section className="mb-16">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
            <BarChart3 className="h-6 w-6 text-lime-500" />
            Testing Methods
          </h2>
          <div className="space-y-6">
            <div className="rounded-lg bg-white dark:bg-gray-700 p-8 shadow-sm border border-gray-200 dark:border-gray-600">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                Automated Testing
              </h3>
              <p className="text-gray-700 dark:text-gray-300 mb-4">
                We use automated accessibility testing tools to continuously monitor and identify
                potential accessibility issues:
              </p>
              <ul className="space-y-2 text-gray-600 dark:text-gray-400 ml-4">
                <li>• axe DevTools for automated accessibility audits</li>
                <li>• Lighthouse for comprehensive web vitals and accessibility scoring</li>
                <li>• WAVE for visual feedback on accessibility features</li>
                <li>• Color contrast checkers for WCAG compliance</li>
              </ul>
            </div>
            <div className="rounded-lg bg-white dark:bg-gray-700 p-8 shadow-sm border border-gray-200 dark:border-gray-600">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                Manual Testing
              </h3>
              <p className="text-gray-700 dark:text-gray-300 mb-4">
                Beyond automated tools, our team conducts regular manual accessibility testing:
              </p>
              <ul className="space-y-2 text-gray-600 dark:text-gray-400 ml-4">
                <li>• Keyboard-only navigation testing</li>
                <li>• Screen reader testing with NVDA, JAWS, and VoiceOver</li>
                <li>• Zoom and text size adjustment verification</li>
                <li>• Focus indicator and keyboard trap testing</li>
                <li>• Color blindness simulation testing</li>
              </ul>
            </div>
          </div>
        </section>

        {/* Third-Party Content */}
        <section className="mb-16">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
            Third-Party Content & Services
          </h2>
          <div className="rounded-lg bg-white dark:bg-gray-700 p-8 shadow-sm border border-gray-200 dark:border-gray-600">
            <p className="text-gray-700 dark:text-gray-300">
              ProductLobby integrates with various third-party services and embeds content from
              external sources. While we strive to choose accessible partners and solutions, we
              cannot guarantee the accessibility of all third-party content. If you experience
              accessibility issues with embedded content or integrations, please contact us and
              we will work with you to find accessible alternatives where possible.
            </p>
          </div>
        </section>

        {/* Last Updated */}
        <section className="border-t border-gray-200 dark:border-gray-600 pt-8">
          <div className="rounded-lg bg-gradient-to-r from-violet-50 to-lime-50 dark:from-violet-900/20 dark:to-lime-900/20 p-6 border border-violet-200 dark:border-violet-800">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              <span className="font-semibold text-gray-900 dark:text-white">Last Updated:</span>{' '}
              February 23, 2026
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
              This accessibility statement was last reviewed and updated on February 23, 2026.
              We continuously work to improve accessibility and update this statement as
              improvements are made.
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}
