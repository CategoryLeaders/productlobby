export default function CampaignsLoading() {
  return (
    <div className="min-h-screen bg-background pt-20">
      <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8 py-8">
        {/* Header skeleton */}
        <div className="mb-8">
          <div className="h-8 w-48 bg-gray-200 rounded-lg animate-pulse mb-2"></div>
          <div className="h-4 w-72 bg-gray-100 rounded animate-pulse"></div>
        </div>

        {/* Filter bar skeleton */}
        <div className="flex gap-3 mb-8">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-10 w-24 bg-gray-100 rounded-lg animate-pulse"></div>
          ))}
        </div>

        {/* Campaign cards skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="bg-white rounded-xl border border-gray-200 overflow-hidden">
              <div className="h-48 bg-gray-200 animate-pulse"></div>
              <div className="p-5 space-y-3">
                <div className="h-5 w-3/4 bg-gray-200 rounded animate-pulse"></div>
                <div className="h-4 w-full bg-gray-100 rounded animate-pulse"></div>
                <div className="h-4 w-2/3 bg-gray-100 rounded animate-pulse"></div>
                <div className="flex justify-between pt-3">
                  <div className="h-8 w-20 bg-gray-100 rounded animate-pulse"></div>
                  <div className="h-8 w-24 bg-violet-100 rounded animate-pulse"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
