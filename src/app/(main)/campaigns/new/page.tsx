'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Loader2, Target, Sparkles } from 'lucide-react'

const CATEGORIES = [
  { value: 'apparel', label: 'Apparel' },
  { value: 'tech', label: 'Tech' },
  { value: 'audio', label: 'Audio' },
  { value: 'wearables', label: 'Wearables' },
  { value: 'home', label: 'Home' },
  { value: 'sports', label: 'Sports' },
  { value: 'automotive', label: 'Automotive' },
  { value: 'other', label: 'Other' },
]

export default function NewCampaignPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [form, setForm] = useState({
    title: '',
    description: '',
    template: 'VARIANT',
    category: '',
    targetBrand: '',
    currency: 'GBP',
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const res = await fetch('/api/campaigns', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || 'Failed to create campaign')
      }

      router.push(`/campaigns/${data.data.id}`)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b sticky top-0 z-40">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <Link href="/campaigns" className="inline-flex items-center text-gray-600 hover:text-gray-900">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Campaigns
          </Link>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-2xl shadow-sm border p-8">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Sparkles className="w-8 h-8 text-primary-600" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900">Create a Campaign</h1>
            <p className="text-gray-600 mt-2">Tell us what product or feature you want to exist.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">Campaign Type</label>
              <div className="grid grid-cols-2 gap-4">
                <button type="button" onClick={() => setForm({ ...form, template: 'VARIANT' })}
                  className={`p-4 rounded-xl border-2 text-left transition ${form.template === 'VARIANT' ? 'border-primary-500 bg-primary-50' : 'border-gray-200 hover:border-gray-300'}`}>
                  <Target className="w-6 h-6 text-primary-600 mb-2" />
                  <div className="font-medium">Product Variant</div>
                  <div className="text-sm text-gray-500 mt-1">New size, color, or version of an existing product</div>
                </button>
                <button type="button" onClick={() => setForm({ ...form, template: 'FEATURE' })}
                  className={`p-4 rounded-xl border-2 text-left transition ${form.template === 'FEATURE' ? 'border-primary-500 bg-primary-50' : 'border-gray-200 hover:border-gray-300'}`}>
                  <Sparkles className="w-6 h-6 text-primary-600 mb-2" />
                  <div className="font-medium">Feature Request</div>
                  <div className="text-sm text-gray-500 mt-1">New feature or improvement for an existing product</div>
                </button>
              </div>
            </div>

            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">Campaign Title</label>
              <input type="text" id="title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })}
                placeholder="e.g. Nike Air Max 90 in size 15 UK" required
                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition" />
            </div>

            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <textarea id="description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })}
                placeholder="Describe what you want and why." required rows={4}
                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition resize-none" />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                <select id="category" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} required
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition">
                  <option value="">Select category</option>
                  {CATEGORIES.map((cat) => (<option key={cat.value} value={cat.value}>{cat.label}</option>))}
                </select>
              </div>
              <div>
                <label htmlFor="targetBrand" className="block text-sm font-medium text-gray-700 mb-1">Target Brand</label>
                <input type="text" id="targetBrand" value={form.targetBrand} onChange={(e) => setForm({ ...form, targetBrand: e.target.value })}
                  placeholder="e.g. Nike, Apple, Sony"
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition" />
              </div>
            </div>

            {error && (<div className="bg-error-50 text-error-700 px-4 py-3 rounded-lg text-sm">{error}</div>)}

            <button type="submit" disabled={loading}
              className="w-full bg-primary-600 text-white py-3 rounded-lg font-semibold hover:bg-primary-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center">
              {loading ? (<><Loader2 className="w-5 h-5 mr-2 animate-spin" />Creating...</>) : ('Create Campaign')}
            </button>
          </form>
        </div>
      </main>
    </div>
  )
}
