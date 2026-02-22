/**
 * Loading skeleton for admin dashboard page
 */

import { AdminDashboardSkeleton } from '@/components/shared/skeleton'

export default function AdminLoading() {
  return (
    <div className="min-h-screen bg-white">
      {/* Navbar space */}
      <div className="h-20" />

      <main className="px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto py-12">
          <AdminDashboardSkeleton />
        </div>
      </main>
    </div>
  )
}
