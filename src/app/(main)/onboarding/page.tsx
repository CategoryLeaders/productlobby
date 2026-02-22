'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

type OnboardingStep = 'name' | 'idea'

export default function OnboardingPage() {
  const router = useRouter()
  const [step, setStep] = useState<OnboardingStep>('name')
  const [name, setName] = useState('')
  const [productIdea, setProductIdea] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleNameSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (name.trim().length < 2) {
      setError('Please enter a name with at least 2 characters')
      return
    }
    setError('')
    setStep('idea')
  }

  const handleSkipIdea = async () => {
    await submitOnboarding(name, '')
  }

  const handleIdeaSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    await submitOnboarding(name, productIdea)
  }

  const submitOnboarding = async (userName: string, idea: string) => {
    setLoading(true)
    setError('')

    try {
      const response = await fetch('/api/user/onboarding', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          name: userName,
          productIdea: idea,
        }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to complete onboarding')
      }

      const data = await response.json()

      // Redirect based on whether they entered a product idea
      if (idea.trim() && data.campaignDraftId) {
        router.push(`/campaigns/new?draftId=${data.campaignDraftId}`)
      } else {
        router.push('/campaigns')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-50 via-white to-lime-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo/Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-violet-600 mb-2">ProductLobby</h1>
          <p className="text-gray-600">Your Ideas, Their Products</p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl shadow-lg p-8 space-y-6">
          {/* Progress dots */}
          <div className="flex justify-center gap-2">
            <div
              className={`w-2 h-2 rounded-full transition-all ${
                step === 'name' || step === 'idea' || step === 'complete'
                  ? 'bg-violet-600 w-8'
                  : 'bg-gray-300'
              }`}
            />
            <div
              className={`w-2 h-2 rounded-full transition-all ${
                step === 'idea' || step === 'complete'
                  ? 'bg-violet-600 w-8'
                  : 'bg-gray-300'
              }`}
            />
          </div>

          {/* Step 1: Name Input */}
          {step === 'name' && (
            <form onSubmit={handleNameSubmit} className="space-y-6">
              <div>
                <h2 className="text-3xl font-bold text-gray-900 mb-2">
                  Welcome to ProductLobby!
                </h2>
                <p className="text-gray-600">
                  What should we call you?
                </p>
              </div>

              <div>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => {
                    setName(e.target.value)
                    setError('')
                  }}
                  placeholder="Enter your name"
                  className="w-full px-4 py-3 text-lg border-2 border-gray-200 rounded-lg focus:outline-none focus:border-violet-600 transition-colors"
                  autoFocus
                />
                {error && (
                  <p className="text-red-500 text-sm mt-2">{error}</p>
                )}
              </div>

              <button
                type="submit"
                disabled={loading || name.trim().length < 2}
                className="w-full bg-violet-600 hover:bg-violet-700 disabled:bg-gray-300 text-white font-semibold py-3 px-4 rounded-lg transition-colors"
              >
                Continue
              </button>
            </form>
          )}

          {/* Step 2: Product Idea */}
          {step === 'idea' && (
            <form onSubmit={handleIdeaSubmit} className="space-y-6">
              <div>
                <h2 className="text-3xl font-bold text-gray-900 mb-2">
                  Your Dream Product
                </h2>
                <p className="text-gray-600">
                  If there was one great product new in the world, what would you love to see?
                </p>
                <p className="text-sm text-gray-500 mt-2">(Hint: we can try to make it happen)</p>
              </div>

              <div>
                <textarea
                  value={productIdea}
                  onChange={(e) => setProductIdea(e.target.value)}
                  placeholder="Describe the product you'd love to see..."
                  className="w-full px-4 py-3 text-base border-2 border-gray-200 rounded-lg focus:outline-none focus:border-violet-600 transition-colors resize-none h-32"
                  autoFocus
                />
              </div>

              {error && (
                <p className="text-red-500 text-sm">{error}</p>
              )}

              <div className="space-y-3">
                <button
                  type="submit"
                  disabled={loading || !productIdea.trim()}
                  className="w-full bg-violet-600 hover:bg-violet-700 disabled:bg-gray-300 text-white font-semibold py-3 px-4 rounded-lg transition-colors"
                >
                  {loading ? 'Creating Draft...' : 'Create Campaign Draft'}
                </button>

                <button
                  type="button"
                  onClick={handleSkipIdea}
                  disabled={loading}
                  className="w-full bg-gray-100 hover:bg-gray-200 disabled:bg-gray-300 text-gray-700 font-semibold py-3 px-4 rounded-lg transition-colors"
                >
                  {loading ? 'Loading...' : 'Skip for Now'}
                </button>
              </div>
            </form>
          )}
        </div>

        {/* Footer */}
        <p className="text-center text-sm text-gray-500 mt-8">
          This helps us personalize your experience
        </p>
      </div>
    </div>
  )
}
