import React from 'react'

export const metadata = {
  title: 'Brand Dashboard - ProductLobby',
  description: 'Premium analytics and engagement tools for brands',
}

interface BrandDashboardLayoutProps {
  children: React.ReactNode
}

const BrandDashboardLayout: React.FC<BrandDashboardLayoutProps> = ({ children }) => {
  return <>{children}</>
}

export default BrandDashboardLayout
