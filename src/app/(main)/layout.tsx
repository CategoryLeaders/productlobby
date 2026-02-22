import OnboardingCheck from '@/components/onboarding-check'
import VerificationBanner from '@/components/auth/verification-banner'

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
    </>
  )
}
