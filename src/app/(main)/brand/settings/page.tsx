'use client'

import React, { useState } from 'react'
import { DashboardLayout, PageHeader } from '@/components/shared'
import { Card, CardContent, CardHeader, CardTitle, CardFooter, Badge, Button, Input, Textarea } from '@/components/ui'
import { Avatar } from '@/components/ui'
import { Upload, Users, Bell, Save } from 'lucide-react'

interface TeamMember {
  id: string
  name: string
  email: string
  role: 'owner' | 'manager' | 'viewer'
  avatar: string
}

const BrandSettings: React.FC = () => {
  const [formData, setFormData] = useState({
    brandName: 'Nike',
    website: 'https://www.nike.com',
    description:
      'Nike is a global leader in athletic footwear and apparel, dedicated to innovation and sustainability.',
    logoUpload: null as File | null,
  })

  const [notifications, setNotifications] = useState({
    campaignAlerts: true,
    milestoneNotifications: true,
    weeklySummary: true,
  })

  const [teamMembers] = useState<TeamMember[]>([
    {
      id: '1',
      name: 'Sarah Chen',
      email: 'sarah@nike.com',
      role: 'owner',
      avatar: 'SC',
    },
    {
      id: '2',
      name: 'Marcus Johnson',
      email: 'marcus@nike.com',
      role: 'manager',
      avatar: 'MJ',
    },
    {
      id: '3',
      name: 'Emma Rodriguez',
      email: 'emma@nike.com',
      role: 'manager',
      avatar: 'ER',
    },
    {
      id: '4',
      name: 'David Park',
      email: 'david@nike.com',
      role: 'viewer',
      avatar: 'DP',
    },
  ])

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setFormData((prev) => ({ ...prev, logoUpload: file }))
    }
  }

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleNotificationChange = (key: keyof typeof notifications) => {
    setNotifications((prev) => ({ ...prev, [key]: !prev[key] }))
  }

  const handleSave = () => {
    console.log('Saving settings:', { formData, notifications })
  }

  const getRoleBadge = (role: TeamMember['role']) => {
    const roleConfig = {
      owner: { text: 'Owner', variant: 'default' as const },
      manager: { text: 'Manager', variant: 'lime' as const },
      viewer: { text: 'Viewer', variant: 'gray' as const },
    }
    return roleConfig[role]
  }

  return (
    <DashboardLayout role="brand">
      <PageHeader
        title="Brand Settings"
        description="Manage your brand profile, notifications, and team"
      />

      {/* Brand Profile Section */}
      <div className="mb-8">
        <h2 className="font-display font-bold text-xl text-foreground mb-6">Brand Profile</h2>

        <Card>
          <CardContent className="pt-6 space-y-6">
            {/* Logo Upload */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-3">
                Brand Logo
              </label>
              <div className="flex items-center gap-6">
                <div className="w-24 h-24 bg-gradient-to-br from-blue-600 to-blue-700 rounded-lg flex items-center justify-center text-white font-display font-bold text-4xl shadow-card">
                  N
                </div>
                <div>
                  <label className="inline-flex items-center px-4 py-2 bg-white border border-gray-300 rounded-lg hover:border-gray-400 cursor-pointer transition-colors">
                    <Upload className="w-4 h-4 text-gray-600 mr-2" />
                    <span className="text-sm font-medium text-foreground">Upload Logo</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileChange}
                      className="hidden"
                    />
                  </label>
                  <p className="text-xs text-gray-600 mt-2">PNG, SVG or JPG (max 5MB)</p>
                </div>
              </div>
            </div>

            {/* Brand Name */}
            <div>
              <label htmlFor="brandName" className="block text-sm font-medium text-foreground mb-2">
                Brand Name
              </label>
              <Input
                id="brandName"
                name="brandName"
                type="text"
                value={formData.brandName}
                onChange={handleInputChange}
                placeholder="Enter your brand name"
                className="w-full"
              />
            </div>

            {/* Website */}
            <div>
              <label htmlFor="website" className="block text-sm font-medium text-foreground mb-2">
                Website
              </label>
              <Input
                id="website"
                name="website"
                type="url"
                value={formData.website}
                onChange={handleInputChange}
                placeholder="https://your-website.com"
                className="w-full"
              />
            </div>

            {/* Description */}
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-foreground mb-2">
                Brand Description
              </label>
              <Textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                placeholder="Tell us about your brand..."
                className="w-full min-h-24"
              />
              <p className="text-xs text-gray-600 mt-2">
                {formData.description.length}/500 characters
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Notification Preferences */}
      <div className="mb-8">
        <h2 className="font-display font-bold text-xl text-foreground mb-6">Notification Preferences</h2>

        <Card>
          <CardContent className="pt-6 space-y-4">
            {/* Campaign Alerts */}
            <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
              <div>
                <p className="font-medium text-foreground">Campaign Alerts</p>
                <p className="text-sm text-gray-600">Get notified when new campaigns are targeting your brand</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={notifications.campaignAlerts}
                  onChange={() => handleNotificationChange('campaignAlerts')}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-300 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-violet-500 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-violet-600" />
              </label>
            </div>

            {/* Milestone Notifications */}
            <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
              <div>
                <p className="font-medium text-foreground">Milestone Notifications</p>
                <p className="text-sm text-gray-600">Get alerted when campaigns reach important milestones (500, 1000, 2500+ lobbies)</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={notifications.milestoneNotifications}
                  onChange={() => handleNotificationChange('milestoneNotifications')}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-300 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-violet-500 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-violet-600" />
              </label>
            </div>

            {/* Weekly Summary */}
            <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
              <div>
                <p className="font-medium text-foreground">Weekly Summary</p>
                <p className="text-sm text-gray-600">Receive a weekly digest of all campaigns and activity</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={notifications.weeklySummary}
                  onChange={() => handleNotificationChange('weeklySummary')}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-300 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-violet-500 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-violet-600" />
              </label>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Team Management */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-display font-bold text-xl text-foreground">Team Members</h2>
          <Button variant="primary" size="sm">
            <Users className="w-4 h-4 mr-2" />
            Invite Team Member
          </Button>
        </div>

        <Card>
          <CardContent className="pt-6">
            <div className="space-y-3">
              {teamMembers.map((member) => {
                const roleBadge = getRoleBadge(member.role)
                return (
                  <div
                    key={member.id}
                    className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <Avatar size="md" initials={member.avatar} />
                      <div>
                        <p className="font-medium text-foreground">{member.name}</p>
                        <p className="text-sm text-gray-600">{member.email}</p>
                      </div>
                    </div>
                    <Badge variant={roleBadge.variant} size="md">
                      {roleBadge.text}
                    </Badge>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Save Button */}
      <div className="flex items-center justify-end gap-3">
        <Button variant="secondary">Cancel</Button>
        <Button variant="primary" onClick={handleSave}>
          <Save className="w-4 h-4 mr-2" />
          Save Settings
        </Button>
      </div>
    </DashboardLayout>
  )
}

export default BrandSettings
