'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { DashboardLayout } from '@/components/shared/dashboard-layout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Sparkles,
  Users,
  Rocket,
  CheckCircle,
  ArrowRight,
  ArrowLeft,
} from 'lucide-react'
import { cn } from '@/lib/utils'

const CATEGORIES = [
  'Technology',
  'Health & Wellness',
  'Home & Garden',
  'Fashion',
  'Food & Beverage',
  'Entertainment',
  'Sports',
  'Education',
  'Finance',
  'Travel',
  'Gaming',
  'Automotive',
]

const FEATURES = [
  {
    icon: Sparkles,
    title: 'Discover Campaigns',
    description: 'Explore innovative ideas and products that people want to see in the world',
  },
  {
    icon: Users,
    title: 'Join Communities',
    description: 'Connect with like-minded supporters and creators building the future together',
  },
  {
    icon: Rocket,
    title: 'Make Impact',
    description: 'Vote, comment, and help bring your favorite campaigns to life',
  },
]

export default function OnboardingPage() {
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState(1)
  const [role, setRole] = useState<'supporter' | 'creator' | null>(null)
  const [selectedInterests, setSelectedInterests] = useState<string[]>([])

  const handleSelectInterest = (interest: string) => {
    setSelectedInterests((prev) =>
      prev.includes(interest)
        ? prev.filter((i) => i !== interest)
        : [...prev, interest]
    )
  }

  const handleNext = () => {
    if (currentStep < 4) {
      setCurrentStep(currentStep + 1)
    }
  }

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleGetStarted = () => {
    if (role === 'supporter') {
      router.push('/dashboard')
    } else if (role === 'creator') {
      router.push('/creator/dashboard')
    }
  }

  return (
    <DashboardLayout role="supporter">
      <div className="max-w-3xl mx-auto space-y-8">
        {/* Progress Bar */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold text-foreground">Welcome to ProductLobby</h1>
            <Badge variant="outline" className="text-sm">
              Step {currentStep} of 4
            </Badge>
          </div>
          <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-violet-500 to-lime-500 rounded-full transition-all duration-300"
              style={{ width: `${(currentStep / 4) * 100}%` }}
            />
          </div>
        </div>

        {/* Step 1: Welcome & Role Selection */}
        {currentStep === 1 && (
          <Card>
            <CardHeader>
              <CardTitle>Choose Your Path</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <p className="text-muted-foreground">
                ProductLobby connects people who want products with the makers who create them. How would you like to get involved?
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Supporter Option */}
                <button
                  onClick={() => setRole('supporter')}
                  className={cn(
                    'p-6 rounded-lg border-2 transition-all text-left',
                    role === 'supporter'
                      ? 'border-violet-500 bg-violet-50 dark:bg-violet-950'
                      : 'border-border hover:border-violet-500'
                  )}
                >
                  <Users className="h-8 w-8 mb-3 text-violet-500" />
                  <h3 className="font-semibold text-foreground mb-2">Supporter</h3>
                  <p className="text-sm text-muted-foreground">
                    Vote on campaigns, engage with creators, and help shape product development
                  </p>
                  {role === 'supporter' && (
                    <CheckCircle className="h-5 w-5 text-violet-500 mt-4" />
                  )}
                </button>

                {/* Creator Option */}
                <button
                  onClick={() => setRole('creator')}
                  className={cn(
                    'p-6 rounded-lg border-2 transition-all text-left',
                    role === 'creator'
                      ? 'border-lime-500 bg-lime-50 dark:bg-lime-950'
                      : 'border-border hover:border-lime-500'
                  )}
                >
                  <Rocket className="h-8 w-8 mb-3 text-lime-500" />
                  <h3 className="font-semibold text-foreground mb-2">Creator</h3>
                  <p className="text-sm text-muted-foreground">
                    Launch campaigns, gather feedback, and validate product ideas with real demand
                  </p>
                  {role === 'creator' && (
                    <CheckCircle className="h-5 w-5 text-lime-500 mt-4" />
                  )}
                </button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Step 2: Interest Selection */}
        {currentStep === 2 && (
          <Card>
            <CardHeader>
              <CardTitle>What interests you?</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <p className="text-muted-foreground">
                Select categories you're interested in. This helps us personalize your experience.
              </p>

              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {CATEGORIES.map((category) => (
                  <button
                    key={category}
                    onClick={() => handleSelectInterest(category)}
                    className={cn(
                      'p-3 rounded-lg border-2 transition-all text-left text-sm font-medium',
                      selectedInterests.includes(category)
                        ? 'border-violet-500 bg-violet-50 dark:bg-violet-950 text-violet-900 dark:text-violet-100'
                        : 'border-border hover:border-violet-500 text-foreground'
                    )}
                  >
                    <div className="flex items-center justify-between">
                      <span>{category}</span>
                      {selectedInterests.includes(category) && (
                        <CheckCircle className="h-4 w-4" />
                      )}
                    </div>
                  </button>
                ))}
              </div>

              <p className="text-xs text-muted-foreground">
                Selected: {selectedInterests.length} {selectedInterests.length === 1 ? 'category' : 'categories'}
              </p>
            </CardContent>
          </Card>
        )}

        {/* Step 3: Feature Highlights */}
        {currentStep === 3 && (
          <Card>
            <CardHeader>
              <CardTitle>Get the Most Out of ProductLobby</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                {FEATURES.map((feature, index) => {
                  const Icon = feature.icon
                  return (
                    <div
                      key={index}
                      className="p-4 rounded-lg border border-border hover:border-violet-500 transition-colors flex gap-4"
                    >
                      <div className="flex-shrink-0">
                        <div className="flex items-center justify-center h-10 w-10 rounded-lg bg-violet-100 dark:bg-violet-900">
                          <Icon className="h-5 w-5 text-violet-600 dark:text-violet-400" />
                        </div>
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-foreground">{feature.title}</h3>
                        <p className="text-sm text-muted-foreground mt-1">{feature.description}</p>
                      </div>
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Step 4: Get Started */}
        {currentStep === 4 && (
          <Card>
            <CardHeader>
              <CardTitle>You're All Set!</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="text-center space-y-3">
                <CheckCircle className="h-16 w-16 text-lime-500 mx-auto" />
                <h2 className="text-2xl font-semibold text-foreground">
                  Welcome to the Community!
                </h2>
                <p className="text-muted-foreground max-w-md mx-auto">
                  {role === 'supporter'
                    ? "You're ready to start exploring campaigns and supporting innovative ideas."
                    : "You're ready to launch your campaign and reach supporters around the world."}
                </p>
              </div>

              <div className="bg-muted/50 p-4 rounded-lg space-y-2">
                <p className="text-sm font-semibold text-foreground">Your Profile</p>
                <div className="space-y-1 text-sm text-muted-foreground">
                  <p>Role: {role === 'supporter' ? 'Supporter' : 'Creator'}</p>
                  {selectedInterests.length > 0 && (
                    <p>Interests: {selectedInterests.join(', ')}</p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Navigation Buttons */}
        <div className="flex gap-3 justify-between">
          <Button
            variant="outline"
            onClick={handlePrevious}
            disabled={currentStep === 1}
            className="gap-2"
          >
            <ArrowLeft className="h-4 w-4" /> Previous
          </Button>

          {currentStep < 4 ? (
            <Button
              onClick={handleNext}
              disabled={
                (currentStep === 1 && !role) ||
                (currentStep === 2 && selectedInterests.length === 0)
              }
              className="gap-2"
            >
              Next <ArrowRight className="h-4 w-4" />
            </Button>
          ) : (
            <Button onClick={handleGetStarted} className="gap-2">
              Get Started <ArrowRight className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>
    </DashboardLayout>
  )
}
