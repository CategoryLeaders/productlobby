'use client'

import React, { useState, useMemo } from 'react'
import { Send, Copy, ChevronDown, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import {
  getAllTemplates,
  getTemplate,
  fillTemplate,
  getPlaceholdersForTemplate,
  validateTemplatePlaceholders,
} from '@/lib/brand-response-templates'

interface ResponseTemplateSelectorProps {
  campaignId: string
  brandName: string
  onSubmitResponse?: (content: string, templateId: string) => void | Promise<void>
}

export const ResponseTemplateSelector: React.FC<ResponseTemplateSelectorProps> = ({
  campaignId,
  brandName,
  onSubmitResponse,
}) => {
  const templates = getAllTemplates()
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>(templates[0]?.id || '')
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const [placeholderValues, setPlaceholderValues] = useState<Record<string, string>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [copyFeedback, setCopyFeedback] = useState(false)

  const selectedTemplate = useMemo(
    () => getTemplate(selectedTemplateId),
    [selectedTemplateId]
  )

  const placeholders = useMemo(
    () => getPlaceholdersForTemplate(selectedTemplateId),
    [selectedTemplateId]
  )

  const validation = useMemo(
    () => validateTemplatePlaceholders(selectedTemplateId, placeholderValues),
    [selectedTemplateId, placeholderValues]
  )

  const filledContent = useMemo(() => {
    if (!selectedTemplate) return ''
    return fillTemplate(selectedTemplate, placeholderValues)
  }, [selectedTemplate, placeholderValues])

  const handlePlaceholderChange = (placeholder: string, value: string) => {
    setPlaceholderValues((prev) => ({
      ...prev,
      [placeholder]: value,
    }))
  }

  const handleCopyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(filledContent)
      setCopyFeedback(true)
      setTimeout(() => setCopyFeedback(false), 2000)
    } catch (error) {
      console.error('Failed to copy:', error)
    }
  }

  const handleSubmit = async () => {
    if (!validation.valid || !selectedTemplate) {
      return
    }

    try {
      setIsSubmitting(true)

      if (onSubmitResponse) {
        await onSubmitResponse(filledContent, selectedTemplateId)
      }

      // Reset form
      setSelectedTemplateId(templates[0]?.id || '')
      setPlaceholderValues({})
    } catch (error) {
      console.error('Failed to submit response:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!selectedTemplate) {
    return <div className="text-slate-500">No templates available</div>
  }

  return (
    <div className="space-y-6 rounded-lg border border-slate-200 bg-white p-6">
      {/* Template Selector */}
      <div>
        <label className="block text-sm font-semibold text-slate-900">
          Select Response Template
        </label>
        <div className="relative mt-2">
          <button
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className={cn(
              'w-full rounded-lg border px-4 py-3 text-left font-medium',
              'border-slate-300 bg-white text-slate-900',
              'hover:border-slate-400 focus:border-violet-500 focus:outline-none focus:ring-1 focus:ring-violet-500'
            )}
          >
            <div className="flex items-center justify-between">
              <div>
                <div className="font-semibold">{selectedTemplate.title}</div>
                <div className="text-xs text-slate-500">{selectedTemplate.description}</div>
              </div>
              <ChevronDown
                className={cn('h-5 w-5 text-slate-400 transition-transform', {
                  'rotate-180': isDropdownOpen,
                })}
              />
            </div>
          </button>

          {isDropdownOpen && (
            <div className="absolute top-full z-10 mt-1 w-full rounded-lg border border-slate-200 bg-white shadow-lg">
              {templates.map((template) => (
                <button
                  key={template.id}
                  onClick={() => {
                    setSelectedTemplateId(template.id)
                    setIsDropdownOpen(false)
                    setPlaceholderValues({})
                  }}
                  className={cn(
                    'w-full border-b px-4 py-3 text-left last:border-b-0',
                    'hover:bg-slate-50 transition-colors',
                    selectedTemplateId === template.id ? 'bg-violet-50' : ''
                  )}
                >
                  <div className="font-semibold text-slate-900">{template.title}</div>
                  <div className="text-xs text-slate-500">{template.description}</div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Placeholder Form */}
      {placeholders.length > 0 && (
        <div>
          <label className="block text-sm font-semibold text-slate-900">
            Customize Your Response
          </label>
          <div className="mt-3 space-y-3">
            {placeholders.map((placeholder) => (
              <div key={placeholder}>
                <label className="block text-xs font-medium text-slate-700">
                  {placeholder.replace(/_/g, ' ').charAt(0).toUpperCase() + placeholder.replace(/_/g, ' ').slice(1)}
                </label>
                <input
                  type="text"
                  value={placeholderValues[placeholder] || ''}
                  onChange={(e) => handlePlaceholderChange(placeholder, e.target.value)}
                  placeholder={`Enter ${placeholder.toLowerCase()}`}
                  className={cn(
                    'mt-1 w-full rounded-lg border px-3 py-2 text-sm',
                    'border-slate-300 bg-white text-slate-900',
                    'hover:border-slate-400 focus:border-violet-500 focus:outline-none focus:ring-1 focus:ring-violet-500'
                  )}
                />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Content Preview */}
      <div>
        <label className="block text-sm font-semibold text-slate-900">
          Response Preview
        </label>
        <div className="mt-3 max-h-80 overflow-y-auto rounded-lg border border-slate-200 bg-slate-50 p-4">
          <div className="whitespace-pre-wrap font-mono text-sm text-slate-700">
            {filledContent}
          </div>
        </div>
        {!validation.valid && (
          <div className="mt-2 rounded-lg bg-amber-50 p-3 text-sm text-amber-800">
            <strong>Missing fields:</strong> {validation.missingPlaceholders.join(', ')}
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="flex gap-3">
        <button
          onClick={handleCopyToClipboard}
          className={cn(
            'flex-1 rounded-lg px-4 py-2 font-medium transition-colors',
            'border border-slate-300 text-slate-700 hover:bg-slate-50'
          )}
        >
          <Copy className="mr-2 inline h-4 w-4" />
          {copyFeedback ? 'Copied!' : 'Copy to Clipboard'}
        </button>
        <button
          onClick={handleSubmit}
          disabled={!validation.valid || isSubmitting}
          className={cn(
            'flex-1 rounded-lg px-4 py-2 font-medium text-white transition-colors',
            'bg-violet-600 hover:bg-violet-700',
            'disabled:opacity-50 disabled:cursor-not-allowed'
          )}
        >
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 inline h-4 w-4 animate-spin" />
              Submitting...
            </>
          ) : (
            <>
              <Send className="mr-2 inline h-4 w-4" />
              Submit Response
            </>
          )}
        </button>
      </div>
    </div>
  )
}
