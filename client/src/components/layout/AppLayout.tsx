import React from 'react'
import Header from './Header'
import Sidebar from './Sidebar'
import { AIFloatingButton } from '@/components/AIChat'
import { Toaster } from '@/lib/toast'

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="pj-shell">
      <Header />
      <div className="pj-main">
        <Sidebar />
        <main className="pj-content" role="main">
          {children}
        </main>
      </div>
      <Toaster position="top-right" />
      <AIFloatingButton />
    </div>
  )
}
