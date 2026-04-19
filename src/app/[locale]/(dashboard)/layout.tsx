'use client'

import { useState } from 'react'
import { useLocale } from 'next-intl'
import Sidebar from '@/components/Sidebar'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import Providers from '@/components/Providers'
import MaintenanceAssistant from '@/components/MaintenanceAssistant'
import styles from '@/styles/pages/dashboard.module.css'

function DashboardContent({ children }: { children: React.ReactNode }) {
  const [mobileOpen, setMobileOpen] = useState(false)
  const [collapsed, setCollapsed] = useState(false)
  const locale = useLocale()
  const isRTL = locale === 'ar'

  const sidebarWidth = collapsed ? '72px' : '280px'

  return (
    <div className={`${styles.root} ${isRTL ? styles.rtl : styles.ltr}`}>
      
      {/* Header يتحرك مع الـ Sidebar */}
      <div
        className={styles.headerWrapper}
        style={{
          [isRTL ? 'marginRight' : 'marginLeft']: sidebarWidth,
        }}
      >
        <Header />
      </div>

      <div className={styles.body}>
        <Sidebar
          mobileOpen={mobileOpen}
          onMobileClose={() => setMobileOpen(false)}
          onCollapsedChange={setCollapsed}
        />
        <main
          className={styles.main}
          style={{
            [isRTL ? 'marginRight' : 'marginLeft']: sidebarWidth,
          }}
        >
          {children}
        </main>
      </div>

      {/* Footer يتحرك مع الـ Sidebar */}
      <div
        className={styles.footerWrapper}
        style={{
          [isRTL ? 'marginRight' : 'marginLeft']: sidebarWidth,
        }}
      >
        <Footer />
      </div>

      <MaintenanceAssistant />
    </div>
  )
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <Providers>
      <DashboardContent>{children}</DashboardContent>
    </Providers>
  )
}