'use client';

import React, { useMemo } from 'react';
import {
  Shield,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Loader2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface RiskFactor {
  id: string;
  name: string;
  severity: 'low' | 'medium' | 'high';
  description: string;
  detected: boolean;
}

interface RiskAssessmentData {
  score: number;
  level: 'Safe' | 'Caution' | 'High Risk';
  factors: RiskFactor[];
}

interface RiskAssessmentProps {
  campaignId: string;
  data?: RiskAssessmentData;
  isLoading?: boolean;
  onRefresh?: () => void;
}

const SEVERITY_COLORS = {
  low: 'text-yellow-600 bg-yellow-50',
  medium: 'text-orange-600 bg-orange-50',
  high: 'text-red-600 bg-red-50',
};

const SEVERITY_BADGE = {
  low: 'bg-yellow-100 text-yellow-800',
  medium: 'bg-orange-100 text-orange-800',
  high: 'bg-red-100 text-red-800',
};

const LEVEL_CONFIG = {
  Safe: {
    color: 'text-green-600',
    bgColor: 'bg-green-50',
    borderColor: 'border-green-200',
    icon: CheckCircle2,
  },
  Caution: {
    color: 'text-yellow-600',
    bgColor: 'bg-yellow-50',
    borderColor: 'border-yellow-200',
    icon: AlertTriangle,
  },
  'High Risk': {
    color: 'text-red-600',
    bgColor: 'bg-red-50',
    borderColor: 'border-red-200',
    icon: XCircle,
  },
};

export function RiskAssessment({
  campaignId,
  data,
  isLoading = false,
  onRefresh,
}: RiskAssessmentProps) {
  const hasData = data && data.score !== null && data.score !== undefined;

  if (isLoading) {
    return (
      <div className="w-full max-w-2xl mx-auto p-6 bg-white rounded-lg border border-gray-200">
        <div className="flex items-center justify-center gap-2 h-32">
          <Loader2 className="h-5 w-5 animate-spin text-blue-600" />
          <span className="text-gray-600">Analyzing campaign for risks...</span>
        </div>
      </div>
    );
  }

  if (!hasData) {
    return (
      <div className="w-full max-w-2xl mx-auto p-6 bg-white rounded-lg border border-gray-200">
        <div className="text-center py-8">
          <Shield className="h-12 w-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-600 mb-4">No risk assessment data available</p>
          {onRefresh && (
            <Button onClick={onRefresh} variant="outline" size="sm">
              Run Assessment
            </Button>
          )}
        </div>
      </div>
    );
  }

  const levelConfig = LEVEL_CONFIG[data.level];
  const LevelIcon = levelConfig.icon;
  const scorePercentage = (data.score / 100) * 100;
  const activeFactors = data.factors.filter(f => f.detected);

  return (
    <div className="w-full max-w-2xl mx-auto space-y-6">
      {/* Risk Score Card */}
      <div className={cn(
        'p-6 rounded-lg border-2',
        levelConfig.bgColor,
        levelConfig.borderColor
      )}>
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <LevelIcon className={cn('h-8 w-8', levelConfig.color)} />
            <div>
              <h3 className="text-lg font-semibold">Risk Assessment</h3>
              <p className={cn('text-sm font-medium', levelConfig.color)}>
                {data.level}
              </p>
            </div>
          </div>
          {onRefresh && (
            <Button onClick={onRefresh} variant="ghost" size="sm">
              Refresh
            </Button>
          )}
        </div>

        {/* Score Display */}
        <div className="mb-4">
          <div className="flex items-baseline gap-2 mb-2">
            <span className={cn('text-4xl font-bold', levelConfig.color)}>
              {data.score}
            </span>
            <span className="text-sm text-gray-600">/100</span>
          </div>
          <p className="text-xs text-gray-600 mb-2">
            {data.score <= 30 ? 'Lower is better - Your campaign looks good!' : 
             data.score <= 60 ? 'Moderate risk - Consider addressing flagged issues.' :
             'High risk - Multiple issues detected. Recommendations below.'}
          </p>

          {/* Progress Bar */}
          <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
            <div
              className={cn(
                'h-full transition-all duration-300',
                data.score <= 30 ? 'bg-green-500' :
                data.score <= 60 ? 'bg-yellow-500' :
                'bg-red-500'
              )}
              style={{ width: `${scorePercentage}%` }}
            />
          </div>
        </div>

        {/* Detection Summary */}
        <div className="text-sm text-gray-700">
          {activeFactors.length === 0 ? (
            <span className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-green-600" />
              No risk factors detected
            </span>
          ) : (
            <span>
              {activeFactors.length} risk factor{activeFactors.length !== 1 ? 's' : ''} detected
            </span>
          )}
        </div>
      </div>

      {/* Risk Factors List */}
      {activeFactors.length > 0 && (
        <div className="space-y-3">
          <h4 className="font-semibold text-gray-900">Detected Risk Factors</h4>
          {activeFactors.map((factor) => (
            <div
              key={factor.id}
              className={cn(
                'p-4 rounded-lg border',
                SEVERITY_COLORS[factor.severity],
                'border-opacity-30'
              )}
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-start gap-3 flex-1">
                  {factor.severity === 'high' && (
                    <AlertTriangle className="h-5 w-5 mt-0.5 flex-shrink-0" />
                  )}
                  {factor.severity === 'medium' && (
                    <AlertTriangle className="h-5 w-5 mt-0.5 flex-shrink-0" />
                  )}
                  {factor.severity === 'low' && (
                    <AlertTriangle className="h-5 w-5 mt-0.5 flex-shrink-0 opacity-70" />
                  )}
                  <div className="flex-1">
                    <h5 className="font-medium text-gray-900">{factor.name}</h5>
                    <p className="text-sm text-gray-700 mt-1">{factor.description}</p>
                  </div>
                </div>
                <span className={cn(
                  'px-2.5 py-1 rounded-full text-xs font-medium flex-shrink-0 ml-2',
                  SEVERITY_BADGE[factor.severity]
                )}>
                  {factor.severity.charAt(0).toUpperCase() + factor.severity.slice(1)}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Recommendations */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h4 className="font-semibold text-blue-900 mb-2">Recommendations</h4>
        <ul className="text-sm text-blue-800 space-y-1 list-disc list-inside">
          {data.score > 60 && (
            <>
              <li>Review and improve campaign description quality</li>
              <li>Add legitimate external links and references</li>
              <li>Verify all contact information is accurate</li>
            </>
          )}
          {data.score > 40 && data.score <= 60 && (
            <>
              <li>Address the flagged risk factors above</li>
              <li>Ensure campaign content is original and high-quality</li>
              <li>Avoid suspicious or aggressive promotional tactics</li>
            </>
          )}
          {data.score <= 40 && (
            <li>Your campaign appears to be in good standing</li>
          )}
        </ul>
      </div>

      {/* Factor Details Legend */}
      <div className="bg-gray-50 rounded-lg p-4 text-sm text-gray-600 space-y-2">
        <p className="font-medium text-gray-900">Risk Factors Monitored:</p>
        <ul className="space-y-1">
          <li>
            <strong>Spam Keywords:</strong> Presence of common spam trigger words
          </li>
          <li>
            <strong>Missing Info:</strong> Incomplete or vague campaign details
          </li>
          <li>
            <strong>Suspicious Links:</strong> Malformed or redirect URLs
          </li>
          <li>
            <strong>Low Engagement:</strong> Minimal supporter activity or interaction
          </li>
          <li>
            <strong>Rapid Growth:</strong> Unusual spikes in supporter acquisition
          </li>
        </ul>
      </div>
    </div>
  );
}
