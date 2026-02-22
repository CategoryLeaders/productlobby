'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Plus, Trash2, X, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'

interface CreatorPollCreateProps {
  campaignId: string
  onSuccess?: () => void
  onCancel?: () => void
}

interface PollFormData {
  question: string
  description: string
  pollType: 'SINGLE_SELECT' | 'MULTI_SELECT' | 'RANKED'
  options: string[]
  maxSelections: number
  closesAt: string
}

export function CreatorPollCreate({
  campaignId,
  onSuccess,
  onCancel,
}: CreatorPollCreateProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [showPreview, setShowPreview] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [formData, setFormData] = useState<PollFormData>({
    question: '',
    description: '',
    pollType: 'SINGLE_SELECT',
    options: ['', ''],
    maxSelections: 1,
    closesAt: '',
  })

  const handleQuestionChange = (value: string) => {
    setFormData((prev) => ({ ...prev, question: value }))
    setError(null)
  }

  const handleDescriptionChange = (value: string) => {
    setFormData((prev) => ({ ...prev, description: value }))
  }

  const handlePollTypeChange = (value: string) => {
    const type = value as PollFormData['pollType']
    setFormData((prev) => ({
      ...prev,
      pollType: type,
      maxSelections: type === 'MULTI_SELECT' ? 2 : 1,
    }))
  }

  const handleOptionChange = (index: number, value: string) => {
    const newOptions = [...formData.options]
    newOptions[index] = value
    setFormData((prev) => ({ ...prev, options: newOptions }))
  }

  const handleAddOption = () => {
    if (formData.options.length < 10) {
      setFormData((prev) => ({
        ...prev,
        options: [...prev.options, ''],
      }))
    }
  }

  const handleRemoveOption = (index: number) => {
    if (formData.options.length > 2) {
      setFormData((prev) => ({
        ...prev,
        options: prev.options.filter((_, i) => i !== index),
      }))
    }
  }

  const handleMaxSelectionsChange = (value: string) => {
    const num = parseInt(value, 10)
    if (num > 0 && num < formData.options.length) {
      setFormData((prev) => ({ ...prev, maxSelections: num }))
    }
  }

  const handleClosesAtChange = (value: string) => {
    setFormData((prev) => ({ ...prev, closesAt: value }))
  }

  const validateForm = () => {
    if (formData.question.length < 5 || formData.question.length > 500) {
      setError('Question must be between 5 and 500 characters')
      return false
    }

    const nonEmptyOptions = formData.options.filter((o) => o.trim())
    if (nonEmptyOptions.length < 2) {
      setError('Poll must have at least 2 options')
      return false
    }

    if (nonEmptyOptions.length > 10) {
      setError('Poll can have maximum 10 options')
      return false
    }

    if (formData.pollType === 'MULTI_SELECT' && formData.maxSelections >= nonEmptyOptions.length) {
      setError('Max selections must be less than number of options')
      return false
    }

    if (formData.closesAt) {
      const closesAt = new Date(formData.closesAt)
      if (closesAt <= new Date()) {
        setError('Close date must be in the future')
        return false
      }
    }

    return true
  }

  const handleSubmit = async () => {
    if (!validateForm()) return

    setIsLoading(true)
    try {
      const response = await fetch(`/api/campaigns/${campaignId}/creator-polls`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question: formData.question,
          description: formData.description || undefined,
          pollType: formData.pollType,
          maxSelections: formData.pollType === 'MULTI_SELECT' ? formData.maxSelections : undefined,
          options: formData.options.filter((o) => o.trim()),
          closesAt: formData.closesAt || undefined,
        }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to create poll')
      }

      onSuccess?.()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create poll')
    } finally {
      setIsLoading(false)
    }
  }

  const nonEmptyOptions = formData.options.filter((o) => o.trim())

  return (
    <Card className="w-full bg-white dark:bg-slate-950">
      <CardHeader>
        <CardTitle>Create a New Poll</CardTitle>
      </CardHeader>

      <CardContent className="space-y-6">
        {error && (
          <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded text-sm text-red-700 dark:text-red-400">
            {error}
          </div>
        )}

        {!showPreview ? (
          <div className="space-y-6">
            {/* Question */}
            <div className="space-y-2">
              <Label htmlFor="question" className="font-medium">
                Poll Question *
              </Label>
              <Input
                id="question"
                value={formData.question}
                onChange={(e) => handleQuestionChange(e.target.value)}
                placeholder="What are your first three preferred colours?"
                maxLength={500}
                className="bg-slate-50 dark:bg-slate-900"
              />
              <div className="text-xs text-slate-500 dark:text-slate-400">
                {formData.question.length}/500 characters
              </div>
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label htmlFor="description" className="font-medium">
                Description (Optional)
              </Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => handleDescriptionChange(e.target.value)}
                placeholder="Add context or instructions for voters..."
                className="bg-slate-50 dark:bg-slate-900 min-h-20"
              />
            </div>

            {/* Poll Type */}
            <div className="space-y-2">
              <Label htmlFor="pollType" className="font-medium">
                Poll Type *
              </Label>
              <Select value={formData.pollType} onValueChange={handlePollTypeChange}>
                <SelectTrigger id="pollType" className="bg-slate-50 dark:bg-slate-900">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="SINGLE_SELECT">Single Choice</SelectItem>
                  <SelectItem value="MULTI_SELECT">Multiple Choice</SelectItem>
                  <SelectItem value="RANKED">Ranked (Order Preference)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Max Selections (for Multi-Select) */}
            {formData.pollType === 'MULTI_SELECT' && (
              <div className="space-y-2">
                <Label htmlFor="maxSelections" className="font-medium">
                  Maximum Selections Allowed *
                </Label>
                <Select
                  value={formData.maxSelections.toString()}
                  onValueChange={handleMaxSelectionsChange}
                >
                  <SelectTrigger id="maxSelections" className="bg-slate-50 dark:bg-slate-900">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Array.from({ length: Math.max(0, nonEmptyOptions.length - 1) }, (_, i) => (
                      <SelectItem key={i + 1} value={(i + 1).toString()}>
                        {i + 1}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* Options */}
            <div className="space-y-3">
              <Label className="font-medium">
                Poll Options * ({formData.options.filter((o) => o.trim()).length}/10)
              </Label>
              <div className="space-y-2">
                {formData.options.map((option, index) => (
                  <div key={index} className="flex gap-2">
                    <Badge variant="outline" className="h-10 w-10 flex items-center justify-center flex-shrink-0">
                      {index + 1}
                    </Badge>
                    <Input
                      value={option}
                      onChange={(e) => handleOptionChange(index, e.target.value)}
                      placeholder={`Option ${index + 1}`}
                      className="flex-1 bg-slate-50 dark:bg-slate-900"
                    />
                    {formData.options.length > 2 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRemoveOption(index)}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
                      >
                        <Trash2 size={16} />
                      </Button>
                    )}
                  </div>
                ))}
              </div>

              {formData.options.length < 10 && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleAddOption}
                  className="w-full"
                >
                  <Plus size={16} className="mr-2" />
                  Add Option
                </Button>
              )}
            </div>

            {/* Close Date */}
            <div className="space-y-2">
              <Label htmlFor="closesAt" className="font-medium">
                Close Date (Optional)
              </Label>
              <Input
                id="closesAt"
                type="datetime-local"
                value={formData.closesAt}
                onChange={(e) => handleClosesAtChange(e.target.value)}
                className="bg-slate-50 dark:bg-slate-900"
              />
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Leave empty to keep poll open indefinitely
              </p>
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-4">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => setShowPreview(true)}
                disabled={
                  !formData.question || nonEmptyOptions.length < 2 || nonEmptyOptions.length > 10
                }
              >
                Preview
              </Button>
              <Button
                onClick={handleSubmit}
                disabled={
                  isLoading ||
                  !formData.question ||
                  nonEmptyOptions.length < 2 ||
                  nonEmptyOptions.length > 10
                }
                className="flex-1 bg-violet-600 hover:bg-violet-700 text-white"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating...
                  </>
                ) : (
                  'Create Poll'
                )}
              </Button>
            </div>
          </div>
        ) : (
          // Preview Mode
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold mb-2">{formData.question}</h3>
              {formData.description && (
                <p className="text-sm text-slate-600 dark:text-slate-400">{formData.description}</p>
              )}
            </div>

            <div>
              <p className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-3">
                {formData.pollType === 'SINGLE_SELECT' && 'Choose one option:'}
                {formData.pollType === 'MULTI_SELECT' && `Choose up to ${formData.maxSelections} options:`}
                {formData.pollType === 'RANKED' && 'Rank in order of preference:'}
              </p>

              <div className="space-y-2">
                {nonEmptyOptions.map((option, index) => (
                  <div key={index} className="p-3 bg-slate-50 dark:bg-slate-900 rounded border border-slate-200 dark:border-slate-700">
                    {formData.pollType === 'SINGLE_SELECT' && (
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 rounded-full border-2 border-violet-600" />
                        <span>{option}</span>
                      </div>
                    )}
                    {formData.pollType === 'MULTI_SELECT' && (
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 rounded border-2 border-violet-600" />
                        <span>{option}</span>
                      </div>
                    )}
                    {formData.pollType === 'RANKED' && (
                      <div className="flex items-center gap-3">
                        <div className="w-6 h-6 rounded-full bg-violet-600 text-white text-xs flex items-center justify-center font-semibold">
                          {index + 1}
                        </div>
                        <span>{option}</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {formData.closesAt && (
              <div className="p-3 bg-slate-100 dark:bg-slate-800 rounded text-sm">
                <strong>Closes:</strong> {new Date(formData.closesAt).toLocaleString()}
              </div>
            )}

            <div className="flex gap-3 pt-4">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => setShowPreview(false)}
              >
                Back to Edit
              </Button>
              <Button
                onClick={handleSubmit}
                disabled={isLoading}
                className="flex-1 bg-violet-600 hover:bg-violet-700 text-white"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating...
                  </>
                ) : (
                  'Create Poll'
                )}
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
