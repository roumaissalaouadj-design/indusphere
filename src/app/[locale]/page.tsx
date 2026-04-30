// src/app/[locale]/page.tsx
'use client';

import { use } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { Factory, LogIn, Key, ArrowRight } from 'lucide-react';
import styles from '@/styles/pages/landing.module.css';

type Props = {
  params: Promise<{ locale: string }>;
};

export default function LandingPage({ params }: Props) {
  const { locale } = use(params);
  const router = useRouter();
  const pathname = usePathname();
  const t = useTranslations('Landing');
  const isRTL = locale === 'ar';

  const switchLanguage = (lang: string) => {
    const newPathname = pathname.replace(`/${locale}`, `/${lang}`);
    router.push(newPathname);
  };

  return (
    <div className={styles.page}>
      <div className={styles.container}>
        
        {/* Language Switcher */}
        <div className={styles.languageSwitcher}>
          <div className={styles.languageButtons}>
            <button
              onClick={() => switchLanguage('ar')}
              className={`${styles.langBtn} ${locale === 'ar' ? styles.langBtnActive : ''}`}
            >
              🇩🇿 عربي
            </button>
            <button
              onClick={() => switchLanguage('fr')}
              className={`${styles.langBtn} ${locale === 'fr' ? styles.langBtnActive : ''}`}
            >
              🇫🇷 Français
            </button>
            <button
              onClick={() => switchLanguage('en')}
              className={`${styles.langBtn} ${locale === 'en' ? styles.langBtnActive : ''}`}
            >
              🇺🇸 English
            </button>
          </div>
        </div>

        {/* Hero Section */}
        <div className={styles.hero}>
          <div className={styles.logoWrapper}>
            <div className={styles.logoIcon}>
              <Factory size={48} />
            </div>
            <h1 className={styles.logoText}>
              INDU<span className={styles.logoAccent}>SPHERE</span>
            </h1>
          </div>
          
          <h2 className={styles.title}>
            {t('welcome')}
          </h2>
          <p className={styles.subtitle}>
            {t('description')}
          </p>
        </div>

        {/* Buttons Section */}
        <div className={styles.buttonsSection}>
          <button
            onClick={() => router.push(`/${locale}/login`)}
            className={styles.loginButton}
          >
            <LogIn className={styles.buttonIcon} />
            {t('login')}
            <ArrowRight className={styles.buttonArrow} />
          </button>
          
          <button
            onClick={() => router.push(`/${locale}/activate`)}
            className={styles.activateButton}
          >
            <Key className={styles.buttonIcon} />
            {t('activateAccount')}
            <ArrowRight className={styles.buttonArrow} />
          </button>
        </div>

        {/* Features Section */}
        <div className={styles.features}>
          <div className={styles.featureCard}>
            <div className={styles.featureIcon}>🏭</div>
            <h3 className={styles.featureTitle}>{t('feature1Title')}</h3>
            <p className={styles.featureDesc}>{t('feature1Desc')}</p>
          </div>
          <div className={styles.featureCard}>
            <div className={styles.featureIcon}>📊</div>
            <h3 className={styles.featureTitle}>{t('feature2Title')}</h3>
            <p className={styles.featureDesc}>{t('feature2Desc')}</p>
          </div>
          <div className={styles.featureCard}>
            <div className={styles.featureIcon}>🤖</div>
            <h3 className={styles.featureTitle}>{t('feature3Title')}</h3>
            <p className={styles.featureDesc}>{t('feature3Desc')}</p>
          </div>
        </div>

        {/* Footer */}
        <footer className={styles.footer}>
          <p>© {new Date().getFullYear()} INDU<span className={styles.footerAccent}>SPHERE</span> — {t('rights')}</p>
        </footer>

      </div>
    </div>
  );
}