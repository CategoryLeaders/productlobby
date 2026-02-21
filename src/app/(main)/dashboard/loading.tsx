export default function DashboardLoading() {
  return (
    <div className="min-h-screen bg-background pt-20">
      <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8 py-8">
        {/* Dashboard header skeleton */}
        <div className="mb-8">
          <div className="h-8 w-40 bg-gray-200 rounded-lg animate-pulse mb-2"></div>
          <div className="h-4 w-56 bg-gray-100 rounded animate-pulse"></div>
        </div>

        {/* Stats row skeleton */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="bg-white rounded-xl border border-gray-200 p-5">
              <div className="h-4 w-20 bg-gray-100 rounded animate-pulse mb-2"></div>
              <div className="h-8 w-16 bg-gray-200 rounded-lg animate-pulse"></div>
            </div>
          ))}
        </div>

        {/* Content skeleton */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center gap-4 p-4 border-b border-gray-100 last:border-0">
                <div className="w-16 h-16 bg-gray-200 rounded-lg animate-pulse flex-shrink-0"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-5 w-2/3 bg-gray-200 rounded animate-pulse"></div>
                  <div className="h-4 w-1/3 bg-gray-100 rounded animate-pulse"></div>
                </div>
                <div className="h-8 w-20 bg-violet-100 rounded-lg animate-pulse"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
