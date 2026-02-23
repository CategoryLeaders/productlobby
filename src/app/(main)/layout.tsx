import OnboardingCheck from '@/components/onboarding-check'
import VerificationBanner from '@/components/auth/verification-banner'
import { CompareBar } from '@/components/shared/compare-bar'

export default function MainLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <>
      <OnboardingCheck />
      <VerificationBanner />
      {children}
      <CompareBar />
    </>
  )
}
