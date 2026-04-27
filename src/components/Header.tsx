'use client'

import { useSession } from 'next-auth/react'
import { useRouter, usePathname } from 'next/navigation'
import { useLocale } from 'next-intl'
import Link from 'next/link'
import NotificationBell from './NotificationBell'
import styles from '@/styles/components/Header.module.css'

const languages = [
  { code: 'ar', label: 'عربي' },
  { code: 'fr', label: 'FR' },
  { code: 'en', label: 'EN' },
]

export default function Header() {
  const { data: session } = useSession()
  const router = useRouter()
  const locale = useLocale()
  const pathname = usePathname()

  const switchLanguage = (newLocale: string) => {
    if (newLocale === locale) return
    const segments = pathname.split('/')
    segments[1] = newLocale
    router.push(segments.join('/'))
  }

  return (
    <header className={styles.header}>
      <div className={styles.container}>

        {/* Logo - مع إضافة صورة الشعار */}
        <div className={styles.logo}>
          <Link href={`/${locale}/dashboard`} className={styles.logoLink}>
          <img 
           src="/indusphere-logo.png" 
          alt="Indusphere Logo"
       style={{ width: '32px', height: '32px', marginRight: '8px' }}
/>
            <span className={styles.logoText}>INDU SPHERE</span>
          </Link>
        </div>

        <div className={styles.rightSection}>

          {/* زر الإشعارات */}
          <NotificationBell />

          {/* مبدّل اللغة */}
          <div className={styles.languageSwitcher}>
            {languages.map((lang, index) => (
              <div key={lang.code} className={styles.langItem}>
                <button
                  onClick={() => switchLanguage(lang.code)}
                  className={`${styles.langButton} ${locale === lang.code ? styles.langButtonActive : ''}`}
                >
                  {lang.label}
                </button>
                {index < languages.length - 1 && (
                  <span className={styles.langSeparator}>|</span>
                )}
              </div>
            ))}
          </div>

          {/* معلومات المستخدم */}
          {session?.user && (
            <div className={styles.userInfo}>
              <div className={styles.userDetails}>
                <p className={styles.userName}>
                  {session.user.name || session.user.email}
                </p>
                <p className={styles.userRole}>
                  {(session.user as { role?: string }).role || 'مستخدم'}
                </p>
              </div>
            </div>
          )}

        </div>
      </div>
    </header>
  )
}