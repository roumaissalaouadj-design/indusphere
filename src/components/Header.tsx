'use client';

import { useSession } from 'next-auth/react'
import { useRouter, usePathname } from 'next/navigation'
import { useLocale } from 'next-intl'
import Link from 'next/link'
import NotificationBell from './NotificationBell'
import styles from '@/styles/components/Header.module.css'

const languages = [
  { code: 'ar', label: 'ع', flag: '🇩🇿' },
  { code: 'fr', label: 'FR', flag: '🇫🇷' },
  { code: 'en', label: 'EN', flag: '🇺🇸' },
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

        {/* Logo */}
        <div className={styles.logo}>
          <Link href={`/${locale}/dashboard`} className={styles.logoLink}>
            <div className={styles.logoImgWrapper}>
              <img
                src="/indusphere-logo.png"
                alt="Indusphere Logo"
                className={styles.logoImg}
              />
            </div>
            <span className={styles.logoText}>
              INDU<span className={styles.logoAccent}>SPHERE</span>
            </span>
          </Link>
        </div>

        <div className={styles.rightSection}>

          {/* زر الإشعارات */}
          <NotificationBell />

          {/* مبدّل اللغة */}
          <div className={styles.languageSwitcher}>
            {languages.map((lang) => (
              <button
                key={lang.code}
                onClick={() => switchLanguage(lang.code)}
                className={`${styles.langButton} ${locale === lang.code ? styles.langButtonActive : ''}`}
                title={lang.label}
              >
                <span className={styles.langFlag}>{lang.flag}</span>
                <span className={styles.langLabel}>{lang.label}</span>
              </button>
            ))}
          </div>

          {/* معلومات المستخدم */}
          {session?.user && (
            <div className={styles.userInfo}>
              <div className={styles.userAvatar}>
                {(session.user.email || '?')[0].toUpperCase()}
              </div>
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