import React from 'react'

export const metadata = {
  title: 'Brand Dashboard - ProductLobby',
  description: 'Manage your qualified demand and product feedback',
}

interface BrandLayoutProps {
  children: React.ReactNode
}

const BrandLayout: React.FC<BrandLayoutProps> = ({ children }) => {
  return <>{children}</>
}

export default BrandLayout
