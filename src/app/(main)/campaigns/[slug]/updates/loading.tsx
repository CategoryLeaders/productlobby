import { Navbar } from '@/components/shared/navbar'
import { Footer } from '@/components/shared/footer'
import { PageHeader } from '@/components/shared/page-header'

const UpdateSkeleton = () => (
  <div className="bg-white rounded-lg border border-gray-200 p-6 space-y-4">
    <div className="flex items-start justify-between">
      <div className="flex items-center gap-3 flex-1">
        <div className="w-10 h-10 bg-gray-200 rounded-full animate-pulse" />
        <div className="space-y-2 flex-1">
          <div className="h-4 w-24 bg-gray-200 rounded animate-pulse" />
          <div className="h-3 w-20 bg-gray-100 rounded animate-pulse" />
        </div>
      </div>
      <div className="w-6 h-6 bg-gray-200 rounded animate-pulse" />
    </div>
    <div className="space-y-3">
      <div className="h-4 w-32 bg-gray-200 rounded animate-pulse" />
      <div className="space-y-2">
        <div className="h-3 w-full bg-gray-100 rounded animate-pulse" />
        <div className="h-3 w-full bg-gray-100 rounded animate-pulse" />
        <div className="h-3 w-3/4 bg-gray-100 rounded animate-pulse" />
      </div>
    </div>
    <div className="flex gap-2">
      <div className="h-8 w-20 bg-gray-100 rounded animate-pulse" />
      <div className="h-8 w-20 bg-gray-100 rounded animate-pulse" />
    </div>
  </div>
)

export default function UpdatesLoading() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white flex flex-col">
      <Navbar />

      <main className="flex-1">
        <PageHeader
          title="Campaign Updates"
          description="Latest news and developments from the brand"
        />

        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
            <div className="space-y-2 flex-1">
              <div className="h-8 w-48 bg-gray-200 rounded animate-pulse" />
              <div className="h-5 w-64 bg-gray-100 rounded animate-pulse" />
            </div>

            <div className="flex gap-3">
              <div className="h-10 w-32 bg-gray-200 rounded-lg animate-pulse" />
            </div>
          </div>

          <div className="space-y-6">
            {[...Array(3)].map((_, i) => (
              <UpdateSkeleton key={i} />
            ))}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
