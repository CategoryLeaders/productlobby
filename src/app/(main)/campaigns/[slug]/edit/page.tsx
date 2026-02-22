'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Loader2, Save } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Spinner } from '@/components/ui/spinner'
import { useToast } from '@/components/ui/toast'

interface CampaignData {
  id: string
  slug: string
  title: string
  description: string
  story: string | null
  category: string | null
  targetPrice: number | null
  status: string
}

export default function EditCampaignPage() {
  const params = useParams()
  const router = useRouter()
  const { addToast } = useToast()
  const slug = params.slug as string

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [campaign, setCampaign] = useState<CampaignData | null>(null)

  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [story, setStory] = useState('')
  const [category, setCategory] = useState('')
  const [targetPrice, setTargetPrice] = useState('')

  useEffect(() => {
    const fetchCampaign = async () => {
      try {
        setLoading(true)
        const response = await fetch(`/api/campaigns/${slug}`)
        if (!response.ok) throw new Error('Campaign not found')
        const data = await response.json()
        setCampaign(data.campaign || data)
        const c = data.campaign || data
        setTitle(c.title || '')
        setDescription(c.description || '')
        setStory(c.story || '')
        setCategory(c.category || '')
        setTargetPrice(c.targetPrice ? String(c.targetPrice) : '')
      } catch (err) {
        console.error('Error loading campaign:', err)
        addToast('Failed to load campaign', 'error')
      } finally {
        setLoading(false)
      }
    }
    if (slug) fetchCampaign()
  }, [slug, addToast])

  const handleSave = async () => {
    if (!campaign) return
    setSaving(true)
    try {
      const response = await fetch(`/api/campaigns/${slug}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          description,
          story: story || null,
          category: category || null,
          targetPrice: targetPrice ? parseFloat(targetPrice) : null,
        }),
      })
      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to save')
      }
      addToast('Campaign updated successfully!', 'success')
      router.push(`/campaigns/${slug}`)
    } catch (err) {
      addToast(err instanceof Error ? err.message : 'Failed to save', 'error')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Spinner size="lg" />
      </div>
    )
  }

  if (!campaign) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Campaign Not Found</h1>
          <p className="text-gray-600 mb-4">This campaign doesn't exist or you don't have permission to edit it.</p>
          <Link href="/dashboard/campaigns" className="text-violet-600 hover:text-violet-700 font-semibold">
            Back to Campaigns
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-8">
          <Link
            href="/dashboard/campaigns"
            className="inline-flex items-center gap-2 text-violet-600 hover:text-violet-700 mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Campaigns
          </Link>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Edit Campaign</h1>
          <p className="text-gray-600">Update your campaign details</p>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Campaign Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Title *</label>
                <Input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Campaign title"
                  disabled={saving}
                  maxLength={200}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Description *</label>
                <Textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe your campaign..."
                  rows={3}
                  disabled={saving}
                  maxLength={500}
                />
                <p className="text-xs text-gray-500 mt-1">{description.length}/500</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Full Story</label>
                <Textarea
                  value={story}
                  onChange={(e) => setStory(e.target.value)}
                  placeholder="Tell the full story behind this campaign..."
                  rows={6}
                  disabled={saving}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                <Input
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  placeholder="e.g. Tech, Home, Health"
                  disabled={saving}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Target Price</label>
                <div className="relative">
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">£</div>
                  <Input
                    type="number"
                    value={targetPrice}
                    onChange={(e) => setTargetPrice(e.target.value)}
                    placeholder="0.00"
                    className="pl-7"
                    disabled={saving}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="flex gap-3 justify-end">
            <Link href={`/campaigns/${slug}`}>
              <Button variant="ghost" disabled={saving}>Cancel</Button>
            </Link>
            <Button variant="primary" onClick={handleSave} disabled={saving}>
              {saving ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Save Changes
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
