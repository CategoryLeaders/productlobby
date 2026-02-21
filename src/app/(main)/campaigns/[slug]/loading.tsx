export default function CampaignDetailLoading() {
  return (
    <div className="min-h-screen bg-background pt-20">
      <div className="max-w-5xl mx-auto px-4 md:px-6 py-8">
        {/* Hero image skeleton */}
        <div className="h-64 md:h-96 bg-gray-200 rounded-2xl animate-pulse mb-8"></div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main content */}
          <div className="lg:col-span-2 space-y-6">
            <div className="h-8 w-3/4 bg-gray-200 rounded-lg animate-pulse"></div>
            <div className="flex gap-3">
              <div className="h-6 w-20 bg-violet-100 rounded-full animate-pulse"></div>
              <div className="h-6 w-24 bg-gray-100 rounded-full animate-pulse"></div>
            </div>
            <div className="space-y-3">
              <div className="h-4 w-full bg-gray-100 rounded animate-pulse"></div>
              <div className="h-4 w-full bg-gray-100 rounded animate-pulse"></div>
              <div className="h-4 w-2/3 bg-gray-100 rounded animate-pulse"></div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
              <div className="h-6 w-32 bg-gray-200 rounded animate-pulse"></div>
              <div className="h-3 w-full bg-violet-100 rounded-full animate-pulse"></div>
              <div className="flex justify-between">
                <div className="h-4 w-16 bg-gray-100 rounded animate-pulse"></div>
                <div className="h-4 w-16 bg-gray-100 rounded animate-pulse"></div>
              </div>
              <div className="h-12 w-full bg-violet-200 rounded-lg animate-pulse"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
