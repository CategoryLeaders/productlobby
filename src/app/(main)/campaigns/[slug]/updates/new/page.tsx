'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Navbar } from '@/components/shared/navbar'
import { Footer } from '@/components/shared/footer'
import { PageHeader } from '@/components/shared/page-header'
import { Button } from '@/components/ui/button'
import { UpdateEditor } from '@/components/shared/update-editor'
import { Loader2, ArrowLeft } from 'lucide-react'
import Link from 'next/link'

type UpdateType =
  | 'ANNOUNCEMENT'
  | 'PROGRESS_UPDATE'
  | 'LAUNCH_DATE'
  | 'PROTOTYPE'
  | 'BEHIND_SCENES'
  | 'THANK_YOU'

const UPDATE_TYPES: Array<{ value: UpdateType; label: string }> = [
  { value: 'ANNOUNCEMENT', label: 'Announcement' },
  { value: 'PROGRESS_UPDATE', label: 'Progress Update' },
  { value: 'LAUNCH_DATE', label: 'Launch Date' },
  { value: 'PROTOTYPE', label: 'Prototype' },
  { value: 'BEHIND_SCENES', label: 'Behind the Scenes' },
  { value: 'THANK_YOU', label: 'Thank You' },
]

interface Campaign {
  id: string
  title: string
  slug: string
}

interface UpdateImage {
  id: string
  url: string
  file?: File
}

export default function NewUpdatePage() {
  const params = useParams()
  const router = useRouter()
  const slug = params.slug as string

  const [campaign, setCampaign] = useState<Campaign | null>(null)
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [updateType, setUpdateType] = useState<UpdateType>('ANNOUNCEMENT')
  const [images, setImages] = useState<UpdateImage[]>([])
  const [notifySubscribers, setNotifySubscribers] = useState(true)
  const [scheduledFor, setScheduledFor] = useState('')
  const [previewMode, setPreviewMode] = useState(false)
  const [loading, setLoading] = useState(true)
  const [publishing, setPublishing] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    const fetchCampaign = async () => {
      try {
        setLoading(true)

        const res = await fetch(`/api/campaigns?slug=${slug}`)
        if (!res.ok) throw new Error('Campaign not found')

        const data = await res.json()
        const campaignInfo = data.data?.[0]

        if (!campaignInfo) {
          router.push('/campaigns')
          return
        }

        const memberRes = await fetch(
          `/api/campaigns/${campaignInfo.id}/brand-member`
        )
        const memberData = await memberRes.json()

        if (!memberData.isMember) {
          router.push(`/campaigns/${slug}`)
          return
        }

        setCampaign(campaignInfo)
      } catch (error) {
        console.error('Error fetching campaign:', error)
        router.push('/campaigns')
      } finally {
        setLoading(false)
      }
    }

    if (slug) {
      fetchCampaign()
    }
  }, [slug, router])

  const handlePublish = async () => {
    if (!campaign) return

    if (!title.trim() || !content.trim()) {
      setError('Please fill in all required fields')
      return
    }

    try {
      setPublishing(true)
      setError('')

      const formattedImages = images.map((img) => ({
        url: img.url,
        altText: img.url.split('/').pop(),
      }))

      const res = await fetch(`/api/campaigns/${campaign.id}/updates`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          content,
          updateType,
          images: formattedImages,
          notifySubscribers,
          scheduledFor: scheduledFor ? new Date(scheduledFor).toISOString() : null,
        }),
      })

      if (!res.ok) {
        const data = await res.json()
        setError(data.error || 'Failed to publish update')
        return
      }

      router.push(`/campaigns/${campaign.slug}/updates`)
    } catch (err) {
      console.error('Error publishing update:', err)
      setError('An error occurred while publishing')
    } finally {
      setPublishing(false)
    }
  }

  const handleImageUpload = (uploadedImages: UpdateImage[]) => {
    setImages(uploadedImages)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white flex flex-col">
        <Navbar />
        <main className="flex-1 flex items-center justify-center">
          <div className="flex flex-col items-center gap-3">
            <Loader2 className="w-8 h-8 animate-spin text-violet-600" />
            <p className="text-gray-600">Loading...</p>
          </div>
        </main>
        <Footer />
      </div>
    )
  }

  if (!campaign) {
    return null
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white flex flex-col">
      <Navbar />

      <main className="flex-1">
        <PageHeader
          title="Create Update"
          description={`Share news about ${campaign.title}`}
        />

        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <Link
            href={`/campaigns/${campaign.slug}/updates`}
            className="inline-flex items-center gap-2 text-violet-600 hover:text-violet-700 font-medium mb-8"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Updates
          </Link>

          <div className="bg-white rounded-xl border border-gray-200 p-8">
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-semibold text-foreground mb-2">
                  Update Title
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g., We're launching next month!"
                  maxLength={200}
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg font-medium focus:outline-none focus:ring-2 focus:ring-violet-500"
                />
                <p className="text-xs text-gray-500 mt-1">
                  {title.length}/200
                </p>
              </div>

              <div>
                <label className="block text-sm font-semibold text-foreground mb-2">
                  Update Type
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {UPDATE_TYPES.map((type) => (
                    <button
                      key={type.value}
                      onClick={() => setUpdateType(type.value)}
                      className={`px-3 py-2 rounded-lg font-medium text-sm transition-all duration-200 ${
                        updateType === type.value
                          ? 'bg-violet-600 text-white ring-2 ring-violet-400'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {type.label}
                    </button>
                  ))}
                </div>
              </div>

              <UpdateEditor
                value={content}
                onChange={setContent}
                images={images}
                onImagesChange={handleImageUpload}
                previewMode={previewMode}
                onPreviewToggle={setPreviewMode}
                characterLimit={5000}
              />

              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    id="notifySubscribers"
                    checked={notifySubscribers}
                    onChange={(e) => setNotifySubscribers(e.target.checked)}
                    className="w-4 h-4 rounded border-gray-300 text-violet-600 focus:ring-violet-500"
                  />
                  <label
                    htmlFor="notifySubscribers"
                    className="text-sm text-foreground font-medium"
                  >
                    Notify all supporters about this update
                  </label>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-foreground mb-2">
                    Schedule for Later (Optional)
                  </label>
                  <input
                    type="datetime-local"
                    value={scheduledFor}
                    onChange={(e) => setScheduledFor(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Leave blank to publish immediately
                  </p>
                </div>
              </div>

              {error && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-sm text-red-700 font-medium">{error}</p>
                </div>
              )}

              <div className="flex gap-3 pt-6 border-t border-gray-200">
                <Link
                  href={`/campaigns/${campaign.slug}/updates`}
                  className="flex-1"
                >
                  <Button variant="outline" className="w-full">
                    Cancel
                  </Button>
                </Link>
                <Button
                  onClick={handlePublish}
                  disabled={publishing}
                  className="flex-1 gap-2"
                >
                  {publishing ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Publishing...
                    </>
                  ) : (
                    'Publish Update'
                  )}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
