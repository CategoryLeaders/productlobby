'use client';

import { useState } from 'react';
import { FileEdit, Eye, Send, X, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface DraftIndicatorProps {
  isDraft: boolean;
  isCreator: boolean;
  onPublish?: () => void;
  onPreview?: () => void;
}

export function DraftIndicator({
  isDraft,
  isCreator,
  onPublish,
  onPreview,
}: DraftIndicatorProps) {
  const [dismissed, setDismissed] = useState(false);

  if (!isDraft || dismissed) {
    return null;
  }

  return (
    <div
      className={cn(
        'flex items-center justify-between gap-4 rounded-lg border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-900',
        'shadow-sm'
      )}
    >
      <div className="flex items-center gap-3">
        <AlertTriangle className="h-5 w-5 flex-shrink-0 text-amber-600" />
        <div className="flex flex-col gap-1">
          <p className="font-medium">
            {isCreator
              ? 'This campaign is in draft mode'
              : 'This campaign is not yet published'}
          </p>
          {isCreator && (
            <p className="text-xs text-amber-800">
              Publish when ready to make it visible to everyone
            </p>
          )}
        </div>
      </div>

      <div className="flex items-center gap-2">
        {isCreator && (
          <>
            <Button
              variant="ghost"
              size="sm"
              onClick={onPreview}
              className="text-amber-900 hover:bg-amber-100 hover:text-amber-900"
            >
              <Eye className="mr-2 h-4 w-4" />
              Preview
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={onPublish}
              className="text-amber-900 hover:bg-amber-100 hover:text-amber-900"
            >
              <Send className="mr-2 h-4 w-4" />
              Publish
            </Button>
          </>
        )}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setDismissed(true)}
          className="h-8 w-8 p-0 text-amber-900 hover:bg-amber-100 hover:text-amber-900"
        >
          <X className="h-4 w-4" />
          <span className="sr-only">Dismiss</span>
        </Button>
      </div>
    </div>
  );
}
