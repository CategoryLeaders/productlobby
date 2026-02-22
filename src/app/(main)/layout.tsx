import OnboardingCheck from '@/components/onboarding-check'

export default function MainLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <>
      <OnboardingCheck />
      {children}
    </>
  )
}
