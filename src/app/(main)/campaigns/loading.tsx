import { Skeleton, CampaignGridSkeleton } from '@/components/shared/skeleton'

export default function CampaignsLoading() {
  return (
    <div className="min-h-screen bg-white">
      <div className="pt-24">
        {/* Page Header Skeleton */}
        <div className="px-4 sm:px-6 lg:px-8 bg-white border-b border-gray-200">
          <div className="max-w-7xl mx-auto py-12 space-y-4">
            <Skeleton variant="line" width="40%" height="32px" />
            <Skeleton variant="line" width="60%" />
          </div>
        </div>

        {/* Filter Bar Skeleton */}
        <div className="px-4 sm:px-6 lg:px-8 bg-gray-50 border-b border-gray-200">
          <div className="max-w-7xl mx-auto py-6 space-y-6">
            {/* Search Input Skeleton */}
            <Skeleton variant="block" height="40px" />

            {/* Category Chips Skeleton */}
            <div className="flex flex-wrap gap-2">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} width="80px" height="36px" />
              ))}
            </div>

            {/* Sort Options Skeleton */}
            <div className="flex gap-2">
              {Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} width="100px" height="36px" />
              ))}
            </div>
          </div>
        </div>

        {/* Campaign Grid Skeleton */}
        <main className="px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto py-12 space-y-6">
            {/* Stats line */}
            <Skeleton variant="line" width="30%" />

            {/* Grid of campaign cards */}
            <CampaignGridSkeleton count={12} />
          </div>
        </main>
      </div>
    </div>
  )
}
