/**
 * Brand Claim & Verification Page
 * Located at /brands/claim
 *
 * Allows brand representatives to claim their brand profile by:
 * 1. Entering brand details
 * 2. Providing company email
 * 3. Submitting verification request
 */

'use client'

import React, { useState } from 'react'
import { DashboardLayout } from '@/components/shared'
import { AlertCircle, CheckCircle, Loader } from 'lucide-react'

export default function BrandClaimPage() {
  const [step, setStep] = useState<'form' | 'confirmation'>('form')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [submittedData, setSubmittedData] = useState<{
    brandName: string
    companyEmail: string
  } | null>(null)

  const [formData, setFormData] = useState({
    brandName: '',
    companyEmail: '',
    role: '',
    message: '',
  })

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    // Validation
    if (!formData.brandName.trim()) {
      setError('Brand name is required')
      return
    }

    if (!formData.companyEmail.trim()) {
      setError('Company email is required')
      return
    }

    if (!formData.companyEmail.includes('@')) {
      setError('Please enter a valid email address')
      return
    }

    if (!formData.role.trim()) {
      setError('Your role/title is required')
      return
    }

    if (!formData.message.trim()) {
      setError('Please tell us how you are connected to this brand')
      return
    }

    try {
      setSubmitting(true)

      const response = await fetch('/api/brands/claim', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          brandName: formData.brandName,
          companyEmail: formData.companyEmail,
          role: formData.role,
          message: formData.message,
        }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to submit brand claim')
      }

      // Success - move to confirmation
      setSubmittedData({
        brandName: formData.brandName,
        companyEmail: formData.companyEmail,
      })
      setStep('confirmation')
      setFormData({
        brandName: '',
        companyEmail: '',
        role: '',
        message: '',
      })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setSubmitting(false)
    }
  }

  if (step === 'confirmation' && submittedData) {
    return (
      <DashboardLayout role="supporter">
        <div className="max-w-2xl mx-auto">
          <div className="text-center py-12">
            <div className="flex justify-center mb-4">
              <CheckCircle className="w-16 h-16 text-green-600" />
            </div>

            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              Brand Claim Submitted!
            </h1>

            <p className="text-lg text-gray-700 mb-6">
              Thank you for submitting your brand verification request.
            </p>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-8 text-left">
              <p className="text-gray-700 mb-4">
                We have received your claim for <strong>{submittedData.brandName}</strong>.
              </p>

              <p className="text-gray-700 mb-4">
                A verification email will be sent to{' '}
                <strong>{submittedData.companyEmail}</strong>. Please follow the
                instructions in that email to complete the verification process.
              </p>

              <p className="text-gray-600 text-sm">
                Verification typically takes 1-2 business days. You will receive a
                confirmation email once your brand has been verified and your profile
                has been updated.
              </p>
            </div>

            <div className="space-y-3">
              <p className="text-gray-600">
                In the meantime, you can explore more features or check your notifications.
              </p>

              <div className="flex gap-3 justify-center">
                <a
                  href="/brands"
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                >
                  Back to Brands
                </a>
                <button
                  onClick={() => {
                    setStep('form')
                    setSubmittedData(null)
                  }}
                  className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                >
                  Submit Another Claim
                </button>
              </div>
            </div>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout role="supporter">
      <div className="max-w-2xl mx-auto">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Claim Your Brand
          </h1>
          <p className="text-gray-600">
            Register your brand on ProductLobby to unlock exclusive features,
            respond to customer feedback, and manage your brand presence.
          </p>
        </div>

        {/* Form Card */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
          {error && (
            <div className="mb-6 flex items-start gap-3 p-4 bg-red-50 border border-red-200 rounded-lg">
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="font-semibold text-red-900">Error</h3>
                <p className="text-red-700 text-sm">{error}</p>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Brand Name */}
            <div>
              <label htmlFor="brandName" className="block text-sm font-semibold text-gray-900 mb-2">
                Brand Name <span className="text-red-600">*</span>
              </label>
              <input
                type="text"
                id="brandName"
                name="brandName"
                value={formData.brandName}
                onChange={handleInputChange}
                placeholder="e.g., Acme Corp"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                disabled={submitting}
              />
              <p className="text-xs text-gray-500 mt-1">
                The official name of your brand or company
              </p>
            </div>

            {/* Company Email */}
            <div>
              <label htmlFor="companyEmail" className="block text-sm font-semibold text-gray-900 mb-2">
                Company Email <span className="text-red-600">*</span>
              </label>
              <input
                type="email"
                id="companyEmail"
                name="companyEmail"
                value={formData.companyEmail}
                onChange={handleInputChange}
                placeholder="name@company.com"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                disabled={submitting}
              />
              <p className="text-xs text-gray-500 mt-1">
                We will send a verification link to this email address
              </p>
            </div>

            {/* Role/Title */}
            <div>
              <label htmlFor="role" className="block text-sm font-semibold text-gray-900 mb-2">
                Your Role/Title <span className="text-red-600">*</span>
              </label>
              <input
                type="text"
                id="role"
                name="role"
                value={formData.role}
                onChange={handleInputChange}
                placeholder="e.g., Marketing Manager, CEO"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                disabled={submitting}
              />
              <p className="text-xs text-gray-500 mt-1">
                Your position or role in the organization
              </p>
            </div>

            {/* Message */}
            <div>
              <label htmlFor="message" className="block text-sm font-semibold text-gray-900 mb-2">
                How are you connected to this brand? <span className="text-red-600">*</span>
              </label>
              <textarea
                id="message"
                name="message"
                value={formData.message}
                onChange={handleInputChange}
                placeholder="Explain your connection to this brand and why you should be able to claim it..."
                rows={4}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                disabled={submitting}
              />
              <p className="text-xs text-gray-500 mt-1">
                Help us verify that you represent this brand
              </p>
            </div>

            {/* Submit Button */}
            <div className="flex gap-3 pt-4">
              <button
                type="submit"
                disabled={submitting}
                className="flex-1 px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 disabled:bg-gray-400 transition-colors flex items-center justify-center gap-2"
              >
                {submitting && <Loader size={18} className="animate-spin" />}
                {submitting ? 'Submitting...' : 'Submit Claim Request'}
              </button>
              <a
                href="/brands"
                className="px-6 py-3 border border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </a>
            </div>
          </form>

          {/* Info Box */}
          <div className="mt-8 p-4 bg-gray-50 rounded-lg border border-gray-200">
            <h3 className="font-semibold text-gray-900 mb-2">What happens next?</h3>
            <ul className="space-y-2 text-sm text-gray-700">
              <li className="flex items-start gap-2">
                <span className="text-blue-600 font-bold">1.</span>
                <span>We send a verification email to your company address</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-600 font-bold">2.</span>
                <span>Click the link to confirm your identity</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-600 font-bold">3.</span>
                <span>Your brand profile will be verified and updated</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-600 font-bold">4.</span>
                <span>Start managing your brand on ProductLobby</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
