'use client';

import { cn } from '@/lib/utils';

interface NotificationBadgeProps {
  count: number;
  className?: string;
}

export function NotificationBadge({
  count,
  className,
}: NotificationBadgeProps) {
  const displayCount = count > 99 ? '99+' : count;
  const shouldShow = count > 0;

  return (
    <div className={cn('relative inline-block', className)}>
      {shouldShow && (
        <div
          className={cn(
            'absolute -top-2 -right-2',
            'flex items-center justify-center',
            'h-5 w-5 rounded-full',
            'bg-red-500 text-white text-xs font-bold',
            'animate-in fade-in zoom-in-75 duration-300',
            'shadow-md',
            'pulse'
          )}
          style={{
            animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
          }}
        >
          {displayCount}
        </div>
      )}
    </div>
  );
}
