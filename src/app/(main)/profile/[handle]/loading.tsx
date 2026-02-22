/**
 * Loading skeleton for user profile page
 */

import { Skeleton, ProfileSkeleton } from '@/components/shared/skeleton'

export default function ProfileLoading() {
  return (
    <div className="min-h-screen bg-white">
      {/* Navbar space */}
      <div className="h-20" />

      <main className="px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto py-12">
          <ProfileSkeleton />
        </div>
      </main>
    </div>
  )
}
