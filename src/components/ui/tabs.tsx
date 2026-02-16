'use client'

import React from 'react'
import * as TabsPrimitive from '@radix-ui/react-tabs'
import { cn } from '@/lib/utils'

export interface TabsProps
  extends React.ComponentPropsWithoutRef<typeof TabsPrimitive.Root> {}

export const Tabs = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.Root>,
  TabsProps
>(
  (
    {
      className,
      ...props
    },
    ref
  ) => {
    return (
      <TabsPrimitive.Root
        ref={ref}
        className={cn('w-full', className)}
        {...props}
      />
    )
  }
)

Tabs.displayName = TabsPrimitive.Root.displayName

export const TabsList = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.List>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.List>
>(
  (
    {
      className,
      ...props
    },
    ref
  ) => {
    return (
      <TabsPrimitive.List
        ref={ref}
        className={cn(
          'inline-flex items-center justify-center rounded-lg bg-gray-100 p-1 text-gray-600',
          className
        )}
        {...props}
      />
    )
  }
)

TabsList.displayName = TabsPrimitive.List.displayName

export const TabsTrigger = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.Trigger>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.Trigger>
>(
  (
    {
      className,
      ...props
    },
    ref
  ) => {
    return (
      <TabsPrimitive.Trigger
        ref={ref}
        className={cn(
          'inline-flex items-center justify-center whitespace-nowrap rounded-md px-3 py-1.5 text-sm font-medium ring-offset-white transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50',
          'data-[state=active]:bg-white data-[state=active]:text-foreground data-[state=active]:shadow-sm data-[state=inactive]:text-gray-600 hover:text-foreground',
          className
        )}
        {...props}
      />
    )
  }
)

TabsTrigger.displayName = TabsPrimitive.Trigger.displayName

export const TabsContent = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.Content>
>(
  (
    {
      className,
      ...props
    },
    ref
  ) => {
    return (
      <TabsPrimitive.Content
        ref={ref}
        className={cn(
          'mt-2 ring-offset-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500 focus-visible:ring-offset-2',
          className
        )}
        {...props}
      />
    )
  }
)

TabsContent.displayName = TabsPrimitive.Content.displayName
