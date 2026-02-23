'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface Risk {
  id: string;
  title: string;
  description: string;
  category: 'market' | 'financial' | 'operational' | 'reputational' | 'technical';
  severity: 'low' | 'medium' | 'high' | 'critical';
  likelihood: 'low' | 'medium' | 'high' | 'critical';
  mitigation: string;
  status: 'open' | 'mitigated' | 'closed';
  riskScore: number;
  createdAt: string;
  creator: {
    id: string;
    name: string | null;
    email: string;
  };
}

interface RiskStats {
  totalRisks: number;
  bySeverity: {
    low: number;
    medium: number;
    high: number;
    critical: number;
  };
  averageRiskScore: number;
}

interface RiskAssessmentProps {
  campaignId: string;
}

const RISK_CATEGORIES = [
  { value: 'market', label: 'Market Risk' },
  { value: 'financial', label: 'Financial Risk' },
  { value: 'operational', label: 'Operational Risk' },
  { value: 'reputational', label: 'Reputational Risk' },
  { value: 'technical', label: 'Technical Risk' },
];

const SEVERITY_LEVELS = ['low', 'medium', 'high', 'critical'];
const LIKELIHOOD_LEVELS = ['low', 'medium', 'high', 'critical'];

function getSeverityColor(severity: string): string {
  switch (severity) {
    case 'low':
      return 'bg-lime-100 text-lime-800 border-lime-300';
    case 'medium':
      return 'bg-yellow-100 text-yellow-800 border-yellow-300';
    case 'high':
      return 'bg-orange-100 text-orange-800 border-orange-300';
    case 'critical':
      return 'bg-red-100 text-red-800 border-red-300';
    default:
      return 'bg-gray-100 text-gray-800 border-gray-300';
  }
}

function getLikelihoodColor(likelihood: string): string {
  switch (likelihood) {
    case 'low':
      return 'bg-blue-100 text-blue-800 border-blue-300';
    case 'medium':
      return 'bg-cyan-100 text-cyan-800 border-cyan-300';
    case 'high':
      return 'bg-purple-100 text-purple-800 border-purple-300';
    case 'critical':
      return 'bg-pink-100 text-pink-800 border-pink-300';
    default:
      return 'bg-gray-100 text-gray-800 border-gray-300';
  }
}

function getRiskScoreColor(score: number): string {
  if (score <= 6) return 'text-green-600';
  if (score <= 12) return 'text-yellow-600';
  if (score <= 18) return 'text-orange-600';
  return 'text-red-600';
}

export function RiskAssessment({ campaignId }: RiskAssessmentProps) {
  const [risks, setRisks] = useState<Risk[]>([]);
  const [stats, setStats] = useState<RiskStats>({
    totalRisks: 0,
    bySeverity: { low: 0, medium: 0, high: 0, critical: 0 },
    averageRiskScore: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'operational' as const,
    severity: 'medium' as const,
    likelihood: 'medium' as const,
    mitigation: '',
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchRisks();
  }, [campaignId]);

  const fetchRisks = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch(`/api/campaigns/${campaignId}/risks`);

      if (!response.ok) {
        throw new Error('Failed to fetch risks');
      }

      const data = await response.json();
      setRisks(data.data.risks);
      setStats(data.data.stats);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.title.trim() || !formData.description.trim() || !formData.mitigation.trim()) {
      setError('Please fill in all required fields');
      return;
    }

    try {
      setSubmitting(true);
      setError(null);
      const response = await fetch(`/api/campaigns/${campaignId}/risks`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to create risk');
      }

      setFormData({
        title: '',
        description: '',
        category: 'operational',
        severity: 'medium',
        likelihood: 'medium',
        mitigation: '',
      });
      setShowForm(false);
      await fetchRisks();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create risk');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (riskId: string) => {
    if (!confirm('Are you sure you want to delete this risk?')) {
      return;
    }

    try {
      setError(null);
      const response = await fetch(`/api/campaigns/${campaignId}/risks?riskId=${riskId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to delete risk');
      }

      await fetchRisks();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete risk');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-gray-500">Loading risk assessment...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Campaign Risk Assessment</h2>
        <Button
          onClick={() => setShowForm(!showForm)}
          className="bg-violet-600 hover:bg-violet-700 text-white"
        >
          {showForm ? 'Cancel' : 'Add Risk'}
        </Button>
      </div>

      {/* Error Message */}
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-800 text-sm font-medium">{error}</p>
        </div>
      )}

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <div className="text-gray-600 text-sm font-medium">Total Risks</div>
          <div className="text-3xl font-bold text-violet-600 mt-1">{stats.totalRisks}</div>
        </div>
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <div className="text-gray-600 text-sm font-medium">Critical</div>
          <div className="text-3xl font-bold text-red-600 mt-1">{stats.bySeverity.critical}</div>
        </div>
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <div className="text-gray-600 text-sm font-medium">High</div>
          <div className="text-3xl font-bold text-orange-600 mt-1">{stats.bySeverity.high}</div>
        </div>
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <div className="text-gray-600 text-sm font-medium">Medium</div>
          <div className="text-3xl font-bold text-yellow-600 mt-1">{stats.bySeverity.medium}</div>
        </div>
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <div className="text-gray-600 text-sm font-medium">Avg Risk Score</div>
          <div className={`text-3xl font-bold mt-1 ${getRiskScoreColor(stats.averageRiskScore)}`}>
            {stats.averageRiskScore.toFixed(1)}
          </div>
        </div>
      </div>

      {/* Add Risk Form */}
      {showForm && (
        <div className="bg-white border border-violet-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Add New Risk</h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Title */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Risk Title *
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-transparent outline-none"
                placeholder="e.g., Supply chain disruption"
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description *
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-transparent outline-none"
                placeholder="Describe the risk in detail"
                rows={3}
              />
            </div>

            {/* Category */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Category *
              </label>
              <select
                value={formData.category}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    category: e.target.value as typeof formData.category,
                  })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-transparent outline-none"
              >
                {RISK_CATEGORIES.map((cat) => (
                  <option key={cat.value} value={cat.value}>
                    {cat.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Severity and Likelihood */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Severity *
                </label>
                <select
                  value={formData.severity}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      severity: e.target.value as typeof formData.severity,
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-transparent outline-none"
                >
                  {SEVERITY_LEVELS.map((level) => (
                    <option key={level} value={level}>
                      {level.charAt(0).toUpperCase() + level.slice(1)}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Likelihood *
                </label>
                <select
                  value={formData.likelihood}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      likelihood: e.target.value as typeof formData.likelihood,
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-transparent outline-none"
                >
                  {LIKELIHOOD_LEVELS.map((level) => (
                    <option key={level} value={level}>
                      {level.charAt(0).toUpperCase() + level.slice(1)}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Mitigation Plan */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Mitigation Plan *
              </label>
              <textarea
                value={formData.mitigation}
                onChange={(e) => setFormData({ ...formData, mitigation: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-transparent outline-none"
                placeholder="Describe the strategy to mitigate this risk"
                rows={3}
              />
            </div>

            {/* Submit Button */}
            <div className="flex gap-3 pt-2">
              <Button
                type="submit"
                disabled={submitting}
                className="bg-violet-600 hover:bg-violet-700 text-white disabled:opacity-50"
              >
                {submitting ? 'Creating...' : 'Create Risk'}
              </Button>
              <Button
                type="button"
                onClick={() => setShowForm(false)}
                className="bg-gray-200 hover:bg-gray-300 text-gray-800"
              >
                Cancel
              </Button>
            </div>
          </form>
        </div>
      )}

      {/* Risk Matrix */}
      {risks.length > 0 && (
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Risk Matrix</h3>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50">
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                    Risk Title
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                    Category
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                    Severity
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                    Likelihood
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                    Score
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {risks.map((risk) => (
                  <tr key={risk.id} className="border-b border-gray-200 hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm font-medium text-gray-900">{risk.title}</td>
                    <td className="px-4 py-3 text-sm text-gray-600">
                      {RISK_CATEGORIES.find((c) => c.value === risk.category)?.label}
                    </td>
                    <td className="px-4 py-3 text-sm">
                      <span
                        className={cn(
                          'inline-block px-3 py-1 rounded-full font-medium text-xs border',
                          getSeverityColor(risk.severity)
                        )}
                      >
                        {risk.severity.charAt(0).toUpperCase() + risk.severity.slice(1)}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm">
                      <span
                        className={cn(
                          'inline-block px-3 py-1 rounded-full font-medium text-xs border',
                          getLikelihoodColor(risk.likelihood)
                        )}
                      >
                        {risk.likelihood.charAt(0).toUpperCase() + risk.likelihood.slice(1)}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm font-bold">
                      <span className={getRiskScoreColor(risk.riskScore)}>
                        {risk.riskScore}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm">
                      <button
                        onClick={() => handleDelete(risk.id)}
                        className="text-red-600 hover:text-red-800 font-medium text-xs"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Risk Details */}
      {risks.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900">Risk Details</h3>
          {risks.map((risk) => (
            <div key={risk.id} className="bg-white border border-gray-200 rounded-lg p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h4 className="text-lg font-semibold text-gray-900">{risk.title}</h4>
                  <p className="text-sm text-gray-600 mt-1">{risk.description}</p>
                </div>
                <span className={cn('px-3 py-1 rounded-full font-medium text-xs border', getSeverityColor(risk.severity))}>
                  {risk.severity.toUpperCase()}
                </span>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4 pb-4 border-b border-gray-200">
                <div>
                  <div className="text-xs font-medium text-gray-600">Category</div>
                  <div className="text-sm font-semibold text-gray-900 mt-1">
                    {RISK_CATEGORIES.find((c) => c.value === risk.category)?.label}
                  </div>
                </div>
                <div>
                  <div className="text-xs font-medium text-gray-600">Likelihood</div>
                  <div className="text-sm font-semibold text-gray-900 mt-1">
                    {risk.likelihood.charAt(0).toUpperCase() + risk.likelihood.slice(1)}
                  </div>
                </div>
                <div>
                  <div className="text-xs font-medium text-gray-600">Risk Score</div>
                  <div className={`text-sm font-bold mt-1 ${getRiskScoreColor(risk.riskScore)}`}>
                    {risk.riskScore}
                  </div>
                </div>
                <div>
                  <div className="text-xs font-medium text-gray-600">Created</div>
                  <div className="text-sm font-semibold text-gray-900 mt-1">
                    {new Date(risk.createdAt).toLocaleDateString()}
                  </div>
                </div>
              </div>

              <div className="mb-4">
                <h5 className="text-sm font-semibold text-gray-900 mb-2">Mitigation Strategy</h5>
                <p className="text-sm text-gray-700 bg-lime-50 border border-lime-200 rounded p-3">
                  {risk.mitigation}
                </p>
              </div>

              <div className="flex items-center justify-between">
                <div className="text-xs text-gray-500">
                  Created by: {risk.creator.name || risk.creator.email}
                </div>
                <button
                  onClick={() => handleDelete(risk.id)}
                  className="px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50 rounded border border-red-200"
                >
                  Delete Risk
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Empty State */}
      {risks.length === 0 && !showForm && (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No Risks Identified</h3>
          <p className="text-gray-600 mb-6">Start by adding the first risk assessment for your campaign.</p>
          <Button
            onClick={() => setShowForm(true)}
            className="bg-violet-600 hover:bg-violet-700 text-white"
          >
            Add Your First Risk
          </Button>
        </div>
      )}
    </div>
  );
}
