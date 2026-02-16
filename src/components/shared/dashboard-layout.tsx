'use client'

import React from 'react'
import { Navbar } from './navbar'
import { Sidebar } from './sidebar'

type DashboardRole = 'creator' | 'brand' | 'supporter'

export interface DashboardLayoutProps {
  children: React.ReactNode
  role: DashboardRole
}

export const DashboardLayout: React.FC<DashboardLayoutProps> = ({
  children,
  role,
}) => {
  return (
    <div className="flex flex-col h-screen">
      {/* Navbar */}
      <Navbar />

      {/* Main Content Area */}
      <div className="flex flex-1 pt-16 overflow-hidden">
        {/* Sidebar */}
        <Sidebar role={role} />

        {/* Content */}
        <main className="flex-1 overflow-y-auto bg-background">
          <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8 py-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}
