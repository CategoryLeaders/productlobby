import { Metadata } from 'next'
import Link from 'next/link'
import {
  ArrowLeft,
  FileText,
  BarChart3,
  Users,
  Mail,
  Download,
  Image as ImageIcon,
  Newspaper,
} from 'lucide-react'
import { Navbar } from '@/components/shared/navbar'
import { Footer } from '@/components/shared/footer'

export const metadata: Metadata = {
  title: 'Press Kit | ProductLobby',
  description:
    'ProductLobby press resources, brand assets, key facts & figures, and media contact information.',
}

export default function PressPage() {
  const pressReleases = [
    {
      id: 1,
      date: '2025-02-01',
      title: 'ProductLobby Launches Campaign FAQ Manager Feature',
      summary:
        'New feature enables campaign creators to build comprehensive FAQ sections with accordion-style displays, improving supporter engagement.',
      link: '#',
    },
    {
      id: 2,
      date: '2024-12-15',
      title: 'ProductLobby Reaches 500K Active Campaigns Milestone',
      summary:
        'Platform celebrates significant growth with half a million active campaigns, demonstrating strong adoption across product innovation community.',
      link: '#',
    },
    {
      id: 3,
      date: '2024-10-20',
      title: 'ProductLobby Partners with Major Brands to Amplify Product Ideas',
      summary:
        'Strategic partnerships expand platform reach, enabling creators to connect directly with leading companies to validate and develop product concepts.',
      link: '#',
    },
  ]

  return (
    <>
      <Navbar />

      <main className="min-h-screen bg-white">
        {/* Header with Back Link */}
        <section className="border-b border-gray-200 bg-gray-50 py-6 px-4 sm:px-6 lg:px-8">
          <div className="max-w-6xl mx-auto">
            <Link
              href="/"
              className="inline-flex items-center gap-2 text-violet-600 hover:text-violet-700 font-medium mb-6 text-sm"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Home
            </Link>
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-2">
              Press Kit
            </h1>
            <p className="text-lg text-gray-600">
              Resources for journalists, bloggers, and media professionals
            </p>
          </div>
        </section>

        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          {/* Key Facts & Figures Section */}
          <section className="mb-16">
            <div className="flex items-center gap-3 mb-8">
              <BarChart3 className="w-8 h-8 text-violet-600" />
              <h2 className="text-3xl font-bold text-gray-900">Key Facts & Figures</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-gradient-to-br from-violet-50 to-violet-100 border border-violet-200 rounded-lg p-8 text-center">
                <p className="text-5xl font-bold text-violet-700 mb-2">500K+</p>
                <p className="text-gray-700 font-medium">Active Campaigns</p>
                <p className="text-sm text-gray-600 mt-1">
                  Ideas gaining momentum globally
                </p>
              </div>

              <div className="bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200 rounded-lg p-8 text-center">
                <p className="text-5xl font-bold text-blue-700 mb-2">2M+</p>
                <p className="text-gray-700 font-medium">Community Members</p>
                <p className="text-sm text-gray-600 mt-1">
                  Supporting product innovation
                </p>
              </div>

              <div className="bg-gradient-to-br from-lime-50 to-lime-100 border border-lime-200 rounded-lg p-8 text-center">
                <p className="text-5xl font-bold text-lime-700 mb-2">150+</p>
                <p className="text-gray-700 font-medium">Partner Brands</p>
                <p className="text-sm text-gray-600 mt-1">
                  Companies using ProductLobby
                </p>
              </div>

              <div className="bg-gradient-to-br from-orange-50 to-orange-100 border border-orange-200 rounded-lg p-8 text-center">
                <p className="text-5xl font-bold text-orange-700 mb-2">50</p>
                <p className="text-gray-700 font-medium">Countries</p>
                <p className="text-sm text-gray-600 mt-1">
                  Worldwide coverage
                </p>
              </div>
            </div>
          </section>

          <hr className="my-16" />

          {/* Brand Assets Section */}
          <section className="mb-16">
            <div className="flex items-center gap-3 mb-8">
              <ImageIcon className="w-8 h-8 text-violet-600" />
              <h2 className="text-3xl font-bold text-gray-900">Brand Assets</h2>
            </div>

            <p className="text-gray-600 mb-8">
              Use these resources for articles, presentations, and media coverage.
              All assets are available under our Media License.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Logo Description */}
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-8">
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0">
                    <div className="flex items-center justify-center h-12 w-12 rounded-lg bg-violet-100">
                      <ImageIcon className="h-6 w-6 text-violet-600" />
                    </div>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      Logo & Mark
                    </h3>
                    <p className="text-gray-600 text-sm mb-4">
                      ProductLobby logo is available in full color, monochrome, and
                      white versions. Minimum size: 40px width for digital use.
                    </p>
                    <button className="inline-flex items-center gap-2 px-4 py-2 bg-violet-600 text-white rounded-lg font-medium hover:bg-violet-700 transition-colors">
                      <Download className="w-4 h-4" />
                      Download Logo Package
                    </button>
                  </div>
                </div>
              </div>

              {/* Color Palette Description */}
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-8">
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0">
                    <div className="flex items-center justify-center h-12 w-12 rounded-lg bg-blue-100">
                      <div className="flex gap-1">
                        <div className="w-2 h-2 rounded-full bg-violet-600" />
                        <div className="w-2 h-2 rounded-full bg-blue-600" />
                        <div className="w-2 h-2 rounded-full bg-lime-600" />
                      </div>
                    </div>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      Color Palette
                    </h3>
                    <p className="text-gray-600 text-sm mb-4">
                      Primary: Violet (#7C3AED). Secondary: Blue (#3B82F6), Lime
                      (#84CC16). Download brand guidelines for specifications.
                    </p>
                    <button className="inline-flex items-center gap-2 px-4 py-2 bg-violet-600 text-white rounded-lg font-medium hover:bg-violet-700 transition-colors">
                      <Download className="w-4 h-4" />
                      Brand Guidelines
                    </button>
                  </div>
                </div>
              </div>

              {/* Typography Description */}
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-8">
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0">
                    <div className="flex items-center justify-center h-12 w-12 rounded-lg bg-emerald-100">
                      <FileText className="h-6 w-6 text-emerald-600" />
                    </div>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      Typography
                    </h3>
                    <p className="text-gray-600 text-sm mb-4">
                      We use Inter for UI and system fonts. Headings use Inter Bold,
                      body text uses Inter Regular. See guidelines for detailed specs.
                    </p>
                    <button className="inline-flex items-center gap-2 px-4 py-2 bg-violet-600 text-white rounded-lg font-medium hover:bg-violet-700 transition-colors">
                      <Download className="w-4 h-4" />
                      Font Files
                    </button>
                  </div>
                </div>
              </div>

              {/* Screenshot Package Description */}
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-8">
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0">
                    <div className="flex items-center justify-center h-12 w-12 rounded-lg bg-pink-100">
                      <ImageIcon className="h-6 w-6 text-pink-600" />
                    </div>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      Screenshots & Demos
                    </h3>
                    <p className="text-gray-600 text-sm mb-4">
                      High-resolution screenshots of key features and user flows.
                      Perfect for articles and presentations. Updated monthly.
                    </p>
                    <button className="inline-flex items-center gap-2 px-4 py-2 bg-violet-600 text-white rounded-lg font-medium hover:bg-violet-700 transition-colors">
                      <Download className="w-4 h-4" />
                      Download Screenshots
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <hr className="my-16" />

          {/* Press Releases Section */}
          <section className="mb-16">
            <div className="flex items-center gap-3 mb-8">
              <Newspaper className="w-8 h-8 text-violet-600" />
              <h2 className="text-3xl font-bold text-gray-900">Latest Press Releases</h2>
            </div>

            <div className="space-y-6">
              {pressReleases.map((release) => (
                <div
                  key={release.id}
                  className="bg-white border border-gray-200 rounded-lg p-8 hover:shadow-lg transition-shadow"
                >
                  <div className="flex items-start justify-between gap-4 mb-4">
                    <div>
                      <p className="text-sm text-gray-500 font-medium mb-2">
                        {new Date(release.date).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                        })}
                      </p>
                      <h3 className="text-2xl font-bold text-gray-900 mb-3">
                        {release.title}
                      </h3>
                      <p className="text-gray-600 leading-relaxed mb-6">
                        {release.summary}
                      </p>
                      <button className="inline-flex items-center gap-2 text-violet-600 hover:text-violet-700 font-medium">
                        Read Full Release
                        <span className="text-lg">→</span>
                      </button>
                    </div>
                    <div className="flex-shrink-0">
                      <FileText className="w-12 h-12 text-gray-300" />
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-8 text-center">
              <p className="text-gray-600 mb-4">
                Looking for older press releases? Check our news archive.
              </p>
              <Link
                href="/press/archive"
                className="inline-flex items-center gap-2 text-violet-600 hover:text-violet-700 font-medium"
              >
                View Archive
                <span className="text-lg">→</span>
              </Link>
            </div>
          </section>

          <hr className="my-16" />

          {/* Media Contact Section */}
          <section>
            <div className="flex items-center gap-3 mb-8">
              <Mail className="w-8 h-8 text-violet-600" />
              <h2 className="text-3xl font-bold text-gray-900">Media Contact</h2>
            </div>

            <div className="bg-gradient-to-r from-violet-50 to-blue-50 border border-violet-200 rounded-lg p-12">
              <div className="max-w-2xl">
                <h3 className="text-2xl font-bold text-gray-900 mb-4">
                  Get in Touch
                </h3>
                <p className="text-gray-700 mb-6">
                  For media inquiries, interview requests, or to learn more about
                  ProductLobby, please contact our communications team.
                </p>

                <div className="space-y-4 mb-8">
                  <div className="flex items-center gap-4">
                    <Mail className="w-5 h-5 text-violet-600 flex-shrink-0" />
                    <div>
                      <p className="font-medium text-gray-900">Email</p>
                      <a
                        href="mailto:press@productlobby.com"
                        className="text-violet-600 hover:text-violet-700 font-medium"
                      >
                        press@productlobby.com
                      </a>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <Users className="w-5 h-5 text-violet-600 flex-shrink-0" />
                    <div>
                      <p className="font-medium text-gray-900">Press Team</p>
                      <p className="text-gray-600">
                        Available for interviews, quotes, and technical insights
                      </p>
                    </div>
                  </div>
                </div>

                <button className="inline-flex items-center gap-2 px-6 py-3 bg-violet-600 text-white rounded-lg font-medium hover:bg-violet-700 transition-colors">
                  <Mail className="w-4 h-4" />
                  Request Media Kit
                </button>
              </div>
            </div>
          </section>

          {/* Additional Info */}
          <section className="mt-16 bg-gray-50 border border-gray-200 rounded-lg p-8">
            <h3 className="text-xl font-bold text-gray-900 mb-4">About ProductLobby</h3>
            <p className="text-gray-700 leading-relaxed mb-4">
              ProductLobby is a global platform empowering creators, entrepreneurs, and
              innovators to validate, develop, and launch product ideas. We connect
              visionary makers with a community of millions of supporters and leading
              brands looking to innovate together.
            </p>
            <p className="text-gray-700 leading-relaxed">
              Founded in 2020, ProductLobby has become the go-to platform for product
              validation, community engagement, and market research. Our mission is to
              democratize product development and give every great idea a chance to
              succeed.
            </p>
          </section>
        </div>
      </main>

      <Footer />
    </>
  )
}
