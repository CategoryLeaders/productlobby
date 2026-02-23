'use client'

import React, { useState, useEffect } from 'react'
import {
  ZapOff,
  Zap,
  Plus,
  Trash2,
  Copy,
  CheckCircle2,
  AlertCircle,
  Clock,
  Loader,
  Edit2,
  X,
  Mail,
  Users,
  Calendar,
  TrendingUp,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface Trigger {
  type: 'NEW_SUPPORTER' | 'VOTE_THRESHOLD' | 'TIME_BASED' | 'ENGAGEMENT_SCORE'
  config: Record<string, any>
}

interface Action {
  type: 'SEND_EMAIL' | 'UPDATE_STATUS' | 'NOTIFY_TEAM' | 'CREATE_TASK'
  config: Record<string, any>
}

interface ExecutionHistory {
  id: string
  ruleId: string
  timestamp: Date
  status: 'SUCCESS' | 'FAILED' | 'PENDING'
  message: string
}

interface AutomationRule {
  id: string
  campaignId: string
  name: string
  description?: string
  trigger: Trigger
  action: Action
  isActive: boolean
  createdAt: Date
  updatedAt: Date
  lastExecuted?: Date
  executionCount: number
}

interface AutomationTemplate {
  id: string
  name: string
  description: string
  trigger: Trigger
  action: Action
  icon: React.ReactNode
}

interface AutomationRulesProps {
  campaignId: string
  isCreator?: boolean
}

const TEMPLATES: AutomationTemplate[] = [
  {
    id: 'welcome-email',
    name: 'Welcome Email',
    description: 'Send email when supporter joins',
    trigger: {
      type: 'NEW_SUPPORTER',
      config: {},
    },
    action: {
      type: 'SEND_EMAIL',
      config: {
        template: 'welcome',
        subject: 'Welcome to our campaign!',
      },
    },
    icon: <Mail className="w-5 h-5" />,
  },
  {
    id: 'milestone-alert',
    name: 'Milestone Alert',
    description: 'Notify team at 100 votes',
    trigger: {
      type: 'VOTE_THRESHOLD',
      config: {
        threshold: 100,
      },
    },
    action: {
      type: 'NOTIFY_TEAM',
      config: {
        message: 'Milestone reached: 100 votes!',
      },
    },
    icon: <TrendingUp className="w-5 h-5" />,
  },
  {
    id: 'weekly-summary',
    name: 'Weekly Summary',
    description: 'Send summary every Monday',
    trigger: {
      type: 'TIME_BASED',
      config: {
        frequency: 'weekly',
        dayOfWeek: 'monday',
        time: '09:00',
      },
    },
    action: {
      type: 'SEND_EMAIL',
      config: {
        template: 'weekly_summary',
        recipients: 'campaign_creator',
      },
    },
    icon: <Calendar className="w-5 h-5" />,
  },
]

const TRIGGER_LABELS: Record<string, string> = {
  NEW_SUPPORTER: 'New Supporter',
  VOTE_THRESHOLD: 'Vote Threshold',
  TIME_BASED: 'Time-Based',
  ENGAGEMENT_SCORE: 'Engagement Score',
}

const ACTION_LABELS: Record<string, string> = {
  SEND_EMAIL: 'Send Email',
  UPDATE_STATUS: 'Update Status',
  NOTIFY_TEAM: 'Notify Team',
  CREATE_TASK: 'Create Task',
}

export const AutomationRules: React.FC<AutomationRulesProps> = ({
  campaignId,
  isCreator = false,
}) => {
  const [rules, setRules] = useState<AutomationRule[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  // Modal state
  const [showAddRuleModal, setShowAddRuleModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [editingRule, setEditingRule] = useState<AutomationRule | null>(null)
  const [selectedTemplate, setSelectedTemplate] = useState<AutomationTemplate | null>(null)

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    trigger: { type: 'NEW_SUPPORTER' as const, config: {} },
    action: { type: 'SEND_EMAIL' as const, config: {} },
  })

  // Execution history
  const [executionHistory, setExecutionHistory] = useState<ExecutionHistory[]>([])
  const [showHistory, setShowHistory] = useState(false)

  // Fetch rules
  useEffect(() => {
    const fetchRules = async () => {
      try {
        setLoading(true)
        const response = await fetch(`/api/campaigns/${campaignId}/automation-rules`)
        if (!response.ok) {
          throw new Error('Failed to fetch automation rules')
        }
        const data = await response.json()
        setRules(data.data.rules || [])
        setExecutionHistory(data.data.executionHistory || [])
      } catch (err) {
        console.error('Error fetching automation rules:', err)
        setError('Failed to load automation rules')
      } finally {
        setLoading(false)
      }
    }

    fetchRules()
  }, [campaignId])

  const handleAddRule = async () => {
    if (!formData.name.trim()) {
      setError('Rule name is required')
      return
    }

    try {
      setSaving(true)
      setError(null)

      const response = await fetch(`/api/campaigns/${campaignId}/automation-rules`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      if (!response.ok) {
        throw new Error('Failed to create rule')
      }

      const data = await response.json()
      setRules([...rules, data.data])
      setShowAddRuleModal(false)
      setFormData({
        name: '',
        description: '',
        trigger: { type: 'NEW_SUPPORTER', config: {} },
        action: { type: 'SEND_EMAIL', config: {} },
      })
      setSelectedTemplate(null)
      setSuccess(true)
      setTimeout(() => setSuccess(false), 3000)
    } catch (err) {
      console.error('Error creating rule:', err)
      setError('Failed to create rule')
    } finally {
      setSaving(false)
    }
  }

  const handleUpdateRule = async () => {
    if (!editingRule) return

    try {
      setSaving(true)
      setError(null)

      const response = await fetch(
        `/api/campaigns/${campaignId}/automation-rules?id=${editingRule.id}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: formData.name,
            description: formData.description,
            trigger: formData.trigger,
            action: formData.action,
          }),
        }
      )

      if (!response.ok) {
        throw new Error('Failed to update rule')
      }

      const data = await response.json()
      setRules(rules.map((r) => (r.id === editingRule.id ? data.data : r)))
      setShowEditModal(false)
      setEditingRule(null)
      setFormData({
        name: '',
        description: '',
        trigger: { type: 'NEW_SUPPORTER', config: {} },
        action: { type: 'SEND_EMAIL', config: {} },
      })
      setSuccess(true)
      setTimeout(() => setSuccess(false), 3000)
    } catch (err) {
      console.error('Error updating rule:', err)
      setError('Failed to update rule')
    } finally {
      setSaving(false)
    }
  }

  const handleDeleteRule = async (ruleId: string) => {
    if (!confirm('Are you sure you want to delete this rule?')) return

    try {
      setSaving(true)
      setError(null)

      const response = await fetch(
        `/api/campaigns/${campaignId}/automation-rules?id=${ruleId}`,
        {
          method: 'DELETE',
        }
      )

      if (!response.ok) {
        throw new Error('Failed to delete rule')
      }

      setRules(rules.filter((r) => r.id !== ruleId))
      setSuccess(true)
      setTimeout(() => setSuccess(false), 3000)
    } catch (err) {
      console.error('Error deleting rule:', err)
      setError('Failed to delete rule')
    } finally {
      setSaving(false)
    }
  }

  const handleToggleRule = async (ruleId: string, isActive: boolean) => {
    try {
      const response = await fetch(
        `/api/campaigns/${campaignId}/automation-rules?id=${ruleId}&toggle=true`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ isActive: !isActive }),
        }
      )

      if (!response.ok) {
        throw new Error('Failed to toggle rule')
      }

      const data = await response.json()
      setRules(rules.map((r) => (r.id === ruleId ? data.data : r)))
    } catch (err) {
      console.error('Error toggling rule:', err)
      setError('Failed to toggle rule status')
    }
  }

  const handleApplyTemplate = (template: AutomationTemplate) => {
    setSelectedTemplate(template)
    setFormData({
      name: template.name,
      description: template.description,
      trigger: { ...template.trigger },
      action: { ...template.action },
    })
  }

  const handleEditRule = (rule: AutomationRule) => {
    setEditingRule(rule)
    setFormData({
      name: rule.name,
      description: rule.description || '',
      trigger: rule.trigger,
      action: rule.action,
    })
    setShowEditModal(true)
  }

  const openAddModal = () => {
    setFormData({
      name: '',
      description: '',
      trigger: { type: 'NEW_SUPPORTER', config: {} },
      action: { type: 'SEND_EMAIL', config: {} },
    })
    setSelectedTemplate(null)
    setShowAddRuleModal(true)
  }

  const activeRulesCount = rules.filter((r) => r.isActive).length
  const totalExecutions = rules.reduce((sum, r) => sum + r.executionCount, 0)
  const recentExecutions = executionHistory.slice(0, 5)

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader className="w-8 h-8 animate-spin text-violet-600" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Campaign Automation</h2>
          <p className="text-gray-600 mt-1">Set up automated actions based on triggers</p>
        </div>
        {isCreator && (
          <Button onClick={openAddModal} variant="primary" size="default">
            <Plus className="w-4 h-4 mr-2" />
            Add Rule
          </Button>
        )}
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-4 border border-blue-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-blue-600 font-medium">Total Rules</p>
              <p className="text-3xl font-bold text-blue-900 mt-1">{rules.length}</p>
            </div>
            <Zap className="w-8 h-8 text-blue-500 opacity-50" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-4 border border-green-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-green-600 font-medium">Active Rules</p>
              <p className="text-3xl font-bold text-green-900 mt-1">{activeRulesCount}</p>
            </div>
            <CheckCircle2 className="w-8 h-8 text-green-500 opacity-50" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-4 border border-purple-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-purple-600 font-medium">Total Executions</p>
              <p className="text-3xl font-bold text-purple-900 mt-1">{totalExecutions}</p>
            </div>
            <Clock className="w-8 h-8 text-purple-500 opacity-50" />
          </div>
        </div>
      </div>

      {/* Status Messages */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-medium text-red-900">{error}</p>
          </div>
        </div>
      )}

      {success && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-start gap-3">
          <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
          <p className="font-medium text-green-900">Changes saved successfully!</p>
        </div>
      )}

      {/* Rules List */}
      <div className="space-y-3">
        <h3 className="text-lg font-semibold text-gray-900">Automation Rules</h3>

        {rules.length === 0 ? (
          <div className="bg-gray-50 rounded-lg p-8 text-center border border-dashed border-gray-300">
            <Zap className="w-12 h-12 text-gray-400 mx-auto mb-3 opacity-50" />
            <p className="text-gray-600 font-medium">No rules yet</p>
            <p className="text-sm text-gray-500 mt-1">Create your first automation rule to get started</p>
            {isCreator && (
              <Button onClick={openAddModal} variant="secondary" size="sm" className="mt-4">
                <Plus className="w-4 h-4 mr-2" />
                Create Rule
              </Button>
            )}
          </div>
        ) : (
          <div className="space-y-3">
            {rules.map((rule) => (
              <div
                key={rule.id}
                className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <h4 className="font-semibold text-gray-900">{rule.name}</h4>
                      <span
                        className={cn(
                          'px-2 py-1 rounded text-xs font-medium',
                          rule.isActive
                            ? 'bg-green-100 text-green-700'
                            : 'bg-gray-100 text-gray-600'
                        )}
                      >
                        {rule.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                    {rule.description && (
                      <p className="text-sm text-gray-600 mt-1">{rule.description}</p>
                    )}

                    <div className="flex items-center gap-4 mt-3">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-medium text-gray-600">Trigger:</span>
                        <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">
                          {TRIGGER_LABELS[rule.trigger.type]}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-medium text-gray-600">Action:</span>
                        <span className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded">
                          {ACTION_LABELS[rule.action.type]}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-gray-400" />
                        <span className="text-xs text-gray-500">
                          {rule.lastExecuted
                            ? `Last run: ${new Date(rule.lastExecuted).toLocaleDateString()}`
                            : 'Never executed'}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 ml-4">
                    {isCreator && (
                      <>
                        <button
                          onClick={() => handleToggleRule(rule.id, rule.isActive)}
                          className="p-2 hover:bg-gray-100 rounded transition-colors"
                          title={rule.isActive ? 'Deactivate' : 'Activate'}
                        >
                          {rule.isActive ? (
                            <Zap className="w-5 h-5 text-green-600" />
                          ) : (
                            <ZapOff className="w-5 h-5 text-gray-400" />
                          )}
                        </button>
                        <button
                          onClick={() => handleEditRule(rule)}
                          className="p-2 hover:bg-gray-100 rounded transition-colors"
                          title="Edit"
                        >
                          <Edit2 className="w-5 h-5 text-gray-600" />
                        </button>
                        <button
                          onClick={() => handleDeleteRule(rule.id)}
                          className="p-2 hover:bg-red-50 rounded transition-colors"
                          title="Delete"
                        >
                          <Trash2 className="w-5 h-5 text-red-600" />
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Execution History */}
      {recentExecutions.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">Recent Executions</h3>
            <button
              onClick={() => setShowHistory(!showHistory)}
              className="text-sm text-violet-600 hover:text-violet-700 font-medium"
            >
              {showHistory ? 'Hide' : 'Show All'}
            </button>
          </div>

          <div className="space-y-2">
            {recentExecutions.map((exec) => (
              <div
                key={exec.id}
                className="bg-white border border-gray-200 rounded-lg p-3 flex items-start justify-between"
              >
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">
                    {rules.find((r) => r.id === exec.ruleId)?.name}
                  </p>
                  <p className="text-xs text-gray-600 mt-0.5">{exec.message}</p>
                </div>
                <div className="flex items-center gap-3 ml-4">
                  <span
                    className={cn(
                      'text-xs font-medium px-2 py-1 rounded',
                      exec.status === 'SUCCESS'
                        ? 'bg-green-100 text-green-700'
                        : exec.status === 'FAILED'
                          ? 'bg-red-100 text-red-700'
                          : 'bg-yellow-100 text-yellow-700'
                    )}
                  >
                    {exec.status}
                  </span>
                  <span className="text-xs text-gray-500">
                    {new Date(exec.timestamp).toLocaleString()}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Add/Edit Rule Modal */}
      {(showAddRuleModal || showEditModal) && isCreator && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
          <div className="bg-white rounded-lg max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex items-center justify-between">
              <h3 className="text-xl font-bold text-gray-900">
                {showEditModal ? 'Edit Rule' : 'Add Automation Rule'}
              </h3>
              <button
                onClick={() => {
                  setShowAddRuleModal(false)
                  setShowEditModal(false)
                  setEditingRule(null)
                }}
                className="p-1 hover:bg-gray-100 rounded transition-colors"
              >
                <X className="w-5 h-5 text-gray-600" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Template Selection (only on new rule) */}
              {!showEditModal && !selectedTemplate && (
                <div className="space-y-3">
                  <h4 className="font-semibold text-gray-900">Start with a template</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    {TEMPLATES.map((template) => (
                      <button
                        key={template.id}
                        onClick={() => handleApplyTemplate(template)}
                        className="p-4 border border-gray-200 rounded-lg hover:border-violet-300 hover:bg-violet-50 transition-all text-left"
                      >
                        <div className="flex items-center gap-3 mb-2">
                          <div className="text-violet-600">{template.icon}</div>
                          <h5 className="font-semibold text-gray-900 text-sm">{template.name}</h5>
                        </div>
                        <p className="text-xs text-gray-600">{template.description}</p>
                      </button>
                    ))}
                  </div>
                  <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-gray-300" />
                    </div>
                    <div className="relative flex justify-center text-sm">
                      <span className="px-2 bg-white text-gray-500">or create custom</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Form Fields */}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-1">
                    Rule Name
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g., Welcome New Supporters"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-1">
                    Description (optional)
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) =>
                      setFormData({ ...formData, description: e.target.value })
                    }
                    placeholder="Describe what this rule does"
                    rows={2}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-1">
                    Trigger Type
                  </label>
                  <select
                    value={formData.trigger.type}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        trigger: {
                          ...formData.trigger,
                          type: e.target.value as any,
                        },
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500"
                  >
                    {Object.entries(TRIGGER_LABELS).map(([value, label]) => (
                      <option key={value} value={value}>
                        {label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-1">
                    Action Type
                  </label>
                  <select
                    value={formData.action.type}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        action: {
                          ...formData.action,
                          type: e.target.value as any,
                        },
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500"
                  >
                    {Object.entries(ACTION_LABELS).map(([value, label]) => (
                      <option key={value} value={value}>
                        {label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            <div className="bg-gray-50 border-t border-gray-200 p-6 flex items-center justify-end gap-3">
              <Button
                variant="outline"
                onClick={() => {
                  setShowAddRuleModal(false)
                  setShowEditModal(false)
                  setEditingRule(null)
                }}
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                onClick={showEditModal ? handleUpdateRule : handleAddRule}
                loading={saving}
              >
                {showEditModal ? 'Update Rule' : 'Create Rule'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
