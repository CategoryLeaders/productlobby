import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="text-center max-w-md">
        <div className="text-8xl font-display font-bold text-violet-200 mb-4">404</div>
        <h2 className="font-display text-2xl font-bold text-foreground mb-3">
          Page not found
        </h2>
        <p className="text-gray-500 mb-6">
          The page you&apos;re looking for doesn&apos;t exist or has been moved.
          Maybe try browsing campaigns instead?
        </p>
        <div className="flex items-center justify-center gap-3">
          <Link
            href="/campaigns"
            className="px-5 py-2.5 bg-violet-600 text-white font-medium rounded-lg hover:bg-violet-700 transition-colors"
          >
            Browse Campaigns
          </Link>
          <Link
            href="/"
            className="px-5 py-2.5 bg-gray-100 text-foreground font-medium rounded-lg hover:bg-gray-200 transition-colors"
          >
            Go Home
          </Link>
        </div>
      </div>
    </div>
  )
}
