'use client';

import React, { useMemo } from 'react';
import {
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Shield,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface ComplianceItem {
  id: string;
  name: string;
  description: string;
  status: 'complete' | 'incomplete' | 'warning';
  icon?: React.ReactNode;
}

interface Campaign {
  id?: string;
  title?: string;
  description?: string;
  category?: string;
  image?: string;
  imageUrl?: string;
  links?: string[];
  contactEmail?: string;
  contactPhone?: string;
  brandPermission?: boolean;
  [key: string]: any;
}

interface ComplianceChecklistProps {
  campaign: Campaign;
  onResolveItem?: (itemId: string) => void;
}

export function ComplianceChecklist({
  campaign,
  onResolveItem,
}: ComplianceChecklistProps) {
  const checklistItems = useMemo(() => {
    const items: ComplianceItem[] = [];

    // Description Length Check (150+ characters)
    const descriptionLength = campaign.description?.length || 0;
    items.push({
      id: 'description-length',
      name: 'Description Length',
      description: 'Campaign description should be at least 150 characters',
      status:
        descriptionLength >= 150
          ? 'complete'
          : descriptionLength >= 100
            ? 'warning'
            : 'incomplete',
    });

    // Category Set Check
    items.push({
      id: 'category-set',
      name: 'Category Set',
      description: 'Campaign must have a category selected',
      status: campaign.category && campaign.category.length > 0 ? 'complete' : 'incomplete',
    });

    // Image Uploaded Check
    const hasImage =
      campaign.image ||
      campaign.imageUrl ||
      (campaign.images && campaign.images.length > 0);
    items.push({
      id: 'image-uploaded',
      name: 'Image Uploaded',
      description: 'Campaign must have at least one image',
      status: hasImage ? 'complete' : 'incomplete',
    });

    // Links Valid Check
    const links = campaign.links || [];
    const validLinks = links.filter(
      (link: string) =>
        link &&
        link.trim().length > 0 &&
        (link.startsWith('http://') || link.startsWith('https://'))
    );
    items.push({
      id: 'links-valid',
      name: 'Links Valid',
      description: 'All campaign links must be valid URLs',
      status:
        links.length === 0
          ? 'warning'
          : validLinks.length === links.length
            ? 'complete'
            : 'incomplete',
    });

    // Contact Info Check
    const hasContactInfo = campaign.contactEmail || campaign.contactPhone;
    items.push({
      id: 'contact-info',
      name: 'Contact Information',
      description: 'Must provide email or phone contact',
      status: hasContactInfo ? 'complete' : 'incomplete',
    });

    // Brand Permission Check
    items.push({
      id: 'brand-permission',
      name: 'Brand Permission',
      description: 'Confirm you have permission to use brand materials',
      status:
        campaign.brandPermission === true
          ? 'complete'
          : campaign.brandPermission === false
            ? 'incomplete'
            : 'warning',
    });

    // Campaign Title Check
    const titleLength = campaign.title?.length || 0;
    items.push({
      id: 'campaign-title',
      name: 'Campaign Title',
      description: 'Campaign title should be clear and descriptive (10+ characters)',
      status:
        titleLength >= 10
          ? 'complete'
          : titleLength >= 5
            ? 'warning'
            : 'incomplete',
    });

    return items;
  }, [campaign]);

  const complianceScore = useMemo(() => {
    const completeCount = checklistItems.filter(
      (item) => item.status === 'complete'
    ).length;
    return Math.round((completeCount / checklistItems.length) * 100);
  }, [checklistItems]);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'complete':
        return <CheckCircle2 className="h-5 w-5 text-green-500" />;
      case 'warning':
        return <AlertTriangle className="h-5 w-5 text-yellow-500" />;
      case 'incomplete':
        return <XCircle className="h-5 w-5 text-red-500" />;
      default:
        return null;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'complete':
        return 'bg-green-50 border-green-200';
      case 'warning':
        return 'bg-yellow-50 border-yellow-200';
      case 'incomplete':
        return 'bg-red-50 border-red-200';
      default:
        return 'bg-gray-50 border-gray-200';
    }
  };

  const getProgressBarColor = () => {
    if (complianceScore >= 80) return 'bg-green-500';
    if (complianceScore >= 60) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  return (
    <div className="w-full space-y-6 rounded-lg border border-gray-200 bg-white p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Shield className="h-6 w-6 text-blue-600" />
          <div>
            <h2 className="text-lg font-semibold text-gray-900">
              Campaign Compliance
            </h2>
            <p className="text-sm text-gray-500">
              Ensure your campaign meets all compliance requirements
            </p>
          </div>
        </div>
      </div>

      {/* Compliance Score */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-gray-700">
            Compliance Score
          </span>
          <span className="text-2xl font-bold text-gray-900">
            {complianceScore}%
          </span>
        </div>

        {/* Progress Bar */}
        <div className="h-3 w-full overflow-hidden rounded-full bg-gray-200">
          <div
            className={cn(
              'h-full transition-all duration-300',
              getProgressBarColor()
            )}
            style={{ width: `${complianceScore}%` }}
          />
        </div>

        {/* Score Label */}
        <div className="text-xs text-gray-500">
          {checklistItems.filter((item) => item.status === 'complete').length} of{' '}
          {checklistItems.length} items completed
        </div>
      </div>

      {/* Divider */}
      <div className="h-px bg-gray-200" />

      {/* Checklist Items */}
      <div className="space-y-3">
        {checklistItems.map((item) => (
          <div
            key={item.id}
            className={cn(
              'flex items-start gap-4 rounded-lg border p-4 transition-colors',
              getStatusColor(item.status)
            )}
          >
            {/* Icon */}
            <div className="mt-0.5 flex-shrink-0">
              {getStatusIcon(item.status)}
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-2">
                <h3 className="text-sm font-medium text-gray-900">
                  {item.name}
                </h3>
                <span
                  className={cn(
                    'whitespace-nowrap rounded-full px-2 py-1 text-xs font-medium',
                    item.status === 'complete'
                      ? 'bg-green-100 text-green-700'
                      : item.status === 'warning'
                        ? 'bg-yellow-100 text-yellow-700'
                        : 'bg-red-100 text-red-700'
                  )}
                >
                  {item.status === 'complete'
                    ? 'Complete'
                    : item.status === 'warning'
                      ? 'Warning'
                      : 'Incomplete'}
                </span>
              </div>
              <p className="mt-1 text-xs text-gray-600">
                {item.description}
              </p>
            </div>

            {/* Action Button */}
            {item.status !== 'complete' && onResolveItem && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onResolveItem(item.id)}
                className="mt-0.5 flex-shrink-0 text-xs"
              >
                Fix
              </Button>
            )}
          </div>
        ))}
      </div>

      {/* Footer Message */}
      <div className="rounded-lg bg-blue-50 border border-blue-200 p-4">
        <p className="text-sm text-blue-900">
          {complianceScore === 100
            ? '✓ Your campaign is fully compliant and ready to launch!'
            : complianceScore >= 80
              ? '✓ Your campaign is nearly complete. Address the remaining items to launch.'
              : 'Complete the remaining items to ensure your campaign meets all compliance requirements.'}
        </p>
      </div>
    </div>
  );
}

export default ComplianceChecklist;
