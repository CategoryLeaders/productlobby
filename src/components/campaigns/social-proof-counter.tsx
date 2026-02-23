'use client';

import { useEffect, useRef, useState } from 'react';
import { Users, TrendingUp, Eye } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SocialProofCounterProps {
  count24h?: number;
  countWeek?: number;
  countTotal?: number;
}

export function SocialProofCounter({
  count24h = 0,
  countWeek = 0,
  countTotal = 0,
}: SocialProofCounterProps) {
  const [displayCount24h, setDisplayCount24h] = useState(count24h);
  const [displayCountWeek, setDisplayCountWeek] = useState(countWeek);
  const [displayCountTotal, setDisplayCountTotal] = useState(countTotal);
  const [isAnimating, setIsAnimating] = useState(false);
  const animationTimeoutRef = useRef<NodeJS.Timeout>();
  const animationIntervalRef = useRef<NodeJS.Timeout>();

  // Determine message based on counts
  const getMessage = () => {
    if (count24h === 0 && countWeek === 0 && countTotal === 0) {
      return 'Be the first to lobby!';
    }
    if (count24h > 0) {
      return `${displayCount24h} ${displayCount24h === 1 ? 'person' : 'people'} lobbied this in the last 24 hours`;
    }
    if (countWeek > 0) {
      const displayValue = displayCountWeek >= 100 ? '100+' : displayCountWeek;
      return `${displayValue} ${displayCountWeek === 1 ? 'person' : 'people'} lobbied this week`;
    }
    return 'Join the movement!';
  };

  // Animate number changes smoothly
  useEffect(() => {
    if (count24h !== displayCount24h) {
      setIsAnimating(true);
      const difference = count24h - displayCount24h;
      const steps = Math.min(20, Math.abs(difference));
      const increment = difference / steps;
      let currentStep = 0;

      animationIntervalRef.current = setInterval(() => {
        currentStep++;
        const newValue = Math.round(displayCount24h + increment * currentStep);
        setDisplayCount24h(newValue);

        if (currentStep >= steps) {
          setDisplayCount24h(count24h);
          clearInterval(animationIntervalRef.current);
          setIsAnimating(false);
        }
      }, 50);

      animationTimeoutRef.current = setTimeout(() => {
        setIsAnimating(false);
      }, 1000);

      return () => {
        clearInterval(animationIntervalRef.current);
        clearTimeout(animationTimeoutRef.current);
      };
    }
  }, [count24h, displayCount24h]);

  useEffect(() => {
    if (countWeek !== displayCountWeek) {
      const difference = countWeek - displayCountWeek;
      const steps = Math.min(20, Math.abs(difference));
      const increment = difference / steps;
      let currentStep = 0;

      animationIntervalRef.current = setInterval(() => {
        currentStep++;
        const newValue = Math.round(displayCountWeek + increment * currentStep);
        setDisplayCountWeek(newValue);

        if (currentStep >= steps) {
          setDisplayCountWeek(countWeek);
          clearInterval(animationIntervalRef.current);
        }
      }, 50);

      return () => {
        clearInterval(animationIntervalRef.current);
      };
    }
  }, [countWeek, displayCountWeek]);

  useEffect(() => {
    if (countTotal !== displayCountTotal) {
      const difference = countTotal - displayCountTotal;
      const steps = Math.min(20, Math.abs(difference));
      const increment = difference / steps;
      let currentStep = 0;

      animationIntervalRef.current = setInterval(() => {
        currentStep++;
        const newValue = Math.round(displayCountTotal + increment * currentStep);
        setDisplayCountTotal(newValue);

        if (currentStep >= steps) {
          setDisplayCountTotal(countTotal);
          clearInterval(animationIntervalRef.current);
        }
      }, 50);

      return () => {
        clearInterval(animationIntervalRef.current);
      };
    }
  }, [countTotal, displayCountTotal]);

  const hasActivity = count24h > 0 || countWeek > 0 || countTotal > 0;

  return (
    <div
      className={cn(
        'relative overflow-hidden rounded-lg border transition-all duration-300',
        hasActivity
          ? 'border-emerald-200 bg-gradient-to-r from-emerald-50 via-blue-50 to-emerald-50 dark:border-emerald-900 dark:from-emerald-950 dark:via-blue-950 dark:to-emerald-950'
          : 'border-slate-200 bg-gradient-to-r from-slate-50 via-slate-50 to-slate-50 dark:border-slate-800 dark:from-slate-950 dark:via-slate-950 dark:to-slate-950'
      )}
    >
      {/* Animated background gradient effect */}
      <div
        className={cn(
          'absolute inset-0 opacity-0 transition-opacity duration-500',
          isAnimating && 'opacity-20 animate-pulse'
        )}
      />

      <div className="relative flex items-center gap-3 px-4 py-3 sm:gap-4 sm:px-5 sm:py-4">
        {/* Live indicator dot */}
        <div className="relative flex h-2 w-2 flex-shrink-0 sm:h-2.5 sm:w-2.5">
          <span
            className={cn(
              'absolute inline-flex h-full w-full rounded-full',
              hasActivity
                ? 'bg-emerald-500 animate-pulse'
                : 'bg-slate-300'
            )}
          />
          <span
            className={cn(
              'relative inline-flex rounded-full',
              hasActivity
                ? 'h-full w-full bg-emerald-400'
                : 'h-full w-full bg-slate-200'
            )}
          />
        </div>

        {/* Icon and message container */}
        <div className="flex flex-1 items-center gap-2 min-w-0">
          {count24h > 0 ? (
            <Eye className="h-4 w-4 flex-shrink-0 text-emerald-600 dark:text-emerald-400 sm:h-5 sm:w-5" />
          ) : countWeek > 0 ? (
            <TrendingUp className="h-4 w-4 flex-shrink-0 text-blue-600 dark:text-blue-400 sm:h-5 sm:w-5" />
          ) : (
            <Users className="h-4 w-4 flex-shrink-0 text-slate-500 dark:text-slate-400 sm:h-5 sm:w-5" />
          )}

          <span
            className={cn(
              'truncate text-sm font-medium transition-colors duration-300',
              hasActivity
                ? 'text-emerald-900 dark:text-emerald-100'
                : 'text-slate-700 dark:text-slate-300'
            )}
          >
            {getMessage()}
          </span>
        </div>

        {/* Activity indicator on the right */}
        {hasActivity && (
          <div className="flex flex-shrink-0 items-center gap-1.5">
            <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">
              Live
            </span>
            <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
          </div>
        )}
      </div>

      {/* Optional bottom accent line */}
      {hasActivity && (
        <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-emerald-400 via-blue-400 to-emerald-400 opacity-50" />
      )}
    </div>
  );
}
