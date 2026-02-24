'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface BudgetItem {
  id: string
  name: string
  category: 'marketing' | 'content' | 'design' | 'development' | 'operations' | 'other'
  estimated: number
  actual: number
  status: 'planned' | 'in-progress' | 'completed' | 'on-hold'
  notes?: string
  timestamp: string
}

interface BudgetSummary {
  totalBudget: number
  totalSpent: number
  remaining: number
  utilisationPercent: number
}

const categoryColors: Record<string, { bg: string; text: string; border: string; icon: string }> = {
  marketing: { bg: 'bg-violet-50', text: 'text-violet-700', border: 'border-violet-200', icon: '📢' },
  content: { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200', icon: '✍️' },
  design: { bg: 'bg-pink-50', text: 'text-pink-700', border: 'border-pink-200', icon: '🎨' },
  development: { bg: 'bg-cyan-50', text: 'text-cyan-700', border: 'border-cyan-200', icon: '⚙️' },
  operations: { bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200', icon: '📋' },
  other: { bg: 'bg-slate-50', text: 'text-slate-700', border: 'border-slate-200', icon: '📌' },
}

const statusStyles: Record<string, { bg: string; text: string; label: string }> = {
  'planned': { bg: 'bg-slate-100', text: 'text-slate-700', label: 'Planned' },
  'in-progress': { bg: 'bg-blue-100', text: 'text-blue-700', label: 'In Progress' },
  'completed': { bg: 'bg-lime-100', text: 'text-lime-700', label: 'Completed' },
  'on-hold': { bg: 'bg-amber-100', text: 'text-amber-700', label: 'On Hold' },
}

export function BudgetPlanner({ campaignId }: { campaignId: string }) {
  const [items, setItems] = useState<BudgetItem[]>([])
  const [summary, setSummary] = useState<BudgetSummary | null>(null)
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    category: 'marketing' as const,
    estimated: '',
    actual: '',
    status: 'planned' as const,
    notes: '',
  })

  useEffect(() => {
    fetchBudgetItems()
  }, [campaignId])

  const fetchBudgetItems = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/campaigns/${campaignId}/budget`)
      if (response.ok) {
        const data = await response.json()
        setItems(data.items || [])
        setSummary(data.summary)
      }
    } catch (error) {
      console.error('Failed to fetch budget items:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleAddItem = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.name || !formData.estimated) return

    try {
      const response = await fetch(`/api/campaigns/${campaignId}/budget`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          category: formData.category,
          estimated: parseFloat(formData.estimated),
          actual: parseFloat(formData.actual) || 0,
          status: formData.status,
          notes: formData.notes,
        }),
      })

      if (response.ok) {
        setFormData({
          name: '',
          category: 'marketing',
          estimated: '',
          actual: '',
          status: 'planned',
          notes: '',
        })
        setShowForm(false)
        fetchBudgetItems()
      }
    } catch (error) {
      console.error('Failed to add budget item:', error)
    }
  }

  const handleDeleteItem = async (itemId: string) => {
    try {
      const response = await fetch(`/api/campaigns/${campaignId}/budget?id=${itemId}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        fetchBudgetItems()
      }
    } catch (error) {
      console.error('Failed to delete budget item:', error)
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-GB', {
      style: 'currency',
      currency: 'GBP',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-slate-600">Loading budget data...</div>
      </div>
    )
  }

  const getUtilisationColor = (spent: number, estimated: number) => {
    const utilisation = (spent / estimated) * 100
    if (utilisation > 100) return 'bg-red-500'
    if (utilisation > 80) return 'bg-amber-500'
    return 'bg-lime-500'
  }

  return (
    <div className="space-y-6">
      {/* Summary Stats */}
      {summary && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-white border border-violet-200 rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow">
              <div className="text-sm text-slate-600 mb-1">Total Budget</div>
              <div className="text-2xl font-bold text-violet-600">
                {formatCurrency(summary.totalBudget)}
              </div>
            </div>
            <div className="bg-white border border-red-200 rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow">
              <div className="text-sm text-slate-600 mb-1">Total Spent</div>
              <div className="text-2xl font-bold text-red-600">
                {formatCurrency(summary.totalSpent)}
              </div>
            </div>
            <div className="bg-white border border-lime-300 rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow">
              <div className="text-sm text-slate-600 mb-1">Remaining</div>
              <div className="text-2xl font-bold text-lime-600">
                {formatCurrency(summary.remaining)}
              </div>
            </div>
            <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow">
              <div className="text-sm text-slate-600 mb-1">Utilisation</div>
              <div className="text-2xl font-bold text-slate-600">
                {summary.utilisationPercent.toFixed(1)}%
              </div>
              {summary.utilisationPercent > 100 && (
                <div className="text-xs text-red-600 mt-1">⚠️ Over budget</div>
              )}
            </div>
          </div>

          {/* Utilisation Bar */}
          <div className="bg-white border border-slate-200 rounded-lg p-4">
            <div className="flex justify-between items-center mb-3">
              <h3 className="text-sm font-semibold text-slate-900">Budget Utilisation</h3>
              <span className="text-sm font-bold text-slate-600">{summary.utilisationPercent.toFixed(1)}%</span>
            </div>
            <div className="w-full bg-slate-200 rounded-full h-3">
              <div
                className={cn('h-3 rounded-full transition-all', getUtilisationColor(summary.totalSpent, summary.totalBudget))}
                style={{ width: `${Math.min(summary.utilisationPercent, 100)}%` }}
              />
            </div>
          </div>
        </>
      )}

      {/* Add Item Button/Form */}
      {!showForm && (
        <div className="flex justify-center">
          <Button
            onClick={() => setShowForm(true)}
            className="bg-violet-600 hover:bg-violet-700 text-white"
          >
            Add Budget Item
          </Button>
        </div>
      )}

      {showForm && (
        <div className="bg-violet-50 border border-violet-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-slate-900 mb-4">Add Budget Item</h3>
          <form onSubmit={handleAddItem} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Item Name</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g., Social Media Campaign"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Category</label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value as any })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500"
                >
                  <option value="marketing">Marketing</option>
                  <option value="content">Content</option>
                  <option value="design">Design</option>
                  <option value="development">Development</option>
                  <option value="operations">Operations</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Estimated Cost (£)</label>
                <input
                  type="number"
                  value={formData.estimated}
                  onChange={(e) => setFormData({ ...formData, estimated: e.target.value })}
                  placeholder="0.00"
                  step="0.01"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Actual Cost (£)</label>
                <input
                  type="number"
                  value={formData.actual}
                  onChange={(e) => setFormData({ ...formData, actual: e.target.value })}
                  placeholder="0.00"
                  step="0.01"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Status</label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500"
                >
                  <option value="planned">Planned</option>
                  <option value="in-progress">In Progress</option>
                  <option value="completed">Completed</option>
                  <option value="on-hold">On Hold</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Notes</label>
                <input
                  type="text"
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="Optional notes"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500"
                />
              </div>
            </div>
            <div className="flex gap-2 justify-end">
              <Button variant="outline" onClick={() => setShowForm(false)}>
                Cancel
              </Button>
              <Button type="submit" className="bg-violet-600 hover:bg-violet-700 text-white">
                Add Item
              </Button>
            </div>
          </form>
        </div>
      )}

      {/* Budget Table */}
      {items.length === 0 ? (
        <div className="text-center py-12 bg-white border border-slate-200 rounded-lg">
          <div className="text-slate-600">No budget items yet</div>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50">
                <th className="px-4 py-3 text-left text-sm font-semibold text-slate-900">Item Name</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-slate-900">Category</th>
                <th className="px-4 py-3 text-right text-sm font-semibold text-slate-900">Estimated</th>
                <th className="px-4 py-3 text-right text-sm font-semibold text-slate-900">Actual</th>
                <th className="px-4 py-3 text-center text-sm font-semibold text-slate-900">Status</th>
                <th className="px-4 py-3 text-center text-sm font-semibold text-slate-900">Variance</th>
                <th className="px-4 py-3 text-center text-sm font-semibold text-slate-900">Action</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item) => {
                const variance = item.actual - item.estimated
                const variancePercent = (variance / item.estimated) * 100
                const colors = categoryColors[item.category]
                const statusStyle = statusStyles[item.status]

                return (
                  <tr key={item.id} className="border-b border-slate-200 hover:bg-slate-50">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <span className="text-lg">{colors.icon}</span>
                        <span className="text-sm font-medium text-slate-900">{item.name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className={cn('text-sm font-medium', colors.text)}>
                        {item.category.charAt(0).toUpperCase() + item.category.slice(1)}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <span className="text-sm font-medium text-slate-900">{formatCurrency(item.estimated)}</span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <span className={cn('text-sm font-medium', item.actual > item.estimated ? 'text-red-600' : 'text-slate-900')}>
                        {formatCurrency(item.actual)}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className={cn('inline-block px-2 py-1 text-xs font-medium rounded', statusStyle.bg, statusStyle.text)}>
                        {statusStyle.label}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <div className="flex flex-col items-center gap-1">
                        <span className={cn('text-sm font-medium', variance > 0 ? 'text-red-600' : 'text-lime-600')}>
                          {variance > 0 ? '+' : ''}{formatCurrency(variance)}
                        </span>
                        <span className={cn('text-xs', variance > 0 ? 'text-red-500' : 'text-lime-500')}>
                          {variancePercent > 0 ? '+' : ''}{variancePercent.toFixed(1)}%
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteItem(item.id)}
                        className="text-red-600 hover:bg-red-100"
                      >
                        Remove
                      </Button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
