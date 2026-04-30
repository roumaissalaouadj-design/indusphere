'use client';

import React, { use } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import Image from 'next/image';

const languages = [
  { code: 'ar', label: 'ع', flag: '🇩🇿' },
  { code: 'fr', label: 'FR', flag: '🇫🇷' },
  { code: 'en', label: 'EN', flag: '🇺🇸' },
]

export default function AuthLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = use(params);
  const pathname = usePathname();
  const router = useRouter();

  const switchLanguage = (lang: string) => {
    const newPathname = pathname.replace(`/${locale}`, `/${lang}`);
    router.push(newPathname);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#2C3E50] to-[#34495E] flex flex-col">

      {/* Header */}
      <header style={{
        backgroundColor: 'rgba(44,62,80,0.85)',
        backdropFilter: 'blur(16px)',
        borderBottom: '1px solid rgba(255,255,255,0.1)',
        position: 'sticky',
        top: 0,
        zIndex: 50,
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0.625rem 1.5rem',
          maxWidth: '1200px',
          margin: '0 auto',
          width: '100%',
        }}>

          {/* Logo */}
          <Link href={`/${locale}`} style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.625rem',
            textDecoration: 'none',
          }}>
            <div style={{
              width: '42px',
              height: '42px',
              borderRadius: '10px',
              overflow: 'hidden',
              border: '2px solid rgba(26,188,156,0.4)',
              boxShadow: '0 4px 14px rgba(26,188,156,0.3)',
              flexShrink: 0,
              transition: 'all 0.25s ease',
            }}>
              <Image
                src="/indusphere-logo.png"
                alt="Indusphere Logo"
                width={42}
                height={42}
                style={{ objectFit: 'cover', width: '100%', height: '100%' }}
              />
            </div>
            <span style={{
              fontSize: '1.25rem',
              fontWeight: 800,
              color: '#ffffff',
              letterSpacing: '0.05em',
              whiteSpace: 'nowrap',
            }}>
              INDU<span style={{ color: '#1ABC9C' }}>SPHERE</span>
            </span>
          </Link>

          {/* Language Switcher */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '3px',
            backgroundColor: 'rgba(255,255,255,0.06)',
            border: '1px solid rgba(255,255,255,0.12)',
            borderRadius: '0.75rem',
            padding: '4px',
          }}>
            {languages.map((lang) => (
              <button
                key={lang.code}
                onClick={() => switchLanguage(lang.code)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '5px',
                  padding: '5px 10px',
                  borderRadius: '0.5rem',
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  border: 'none',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  backgroundColor: locale === lang.code ? 'rgba(26,188,156,0.2)' : 'transparent',
                  color: locale === lang.code ? '#1ABC9C' : 'rgba(255,255,255,0.6)',
                  boxShadow: locale === lang.code ? '0 0 0 1px rgba(26,188,156,0.4)' : 'none',
                }}
              >
                <span style={{ fontSize: '1rem', lineHeight: 1 }}>{lang.flag}</span>
                <span style={{ fontSize: '0.72rem', fontWeight: 700 }}>{lang.label}</span>
              </button>
            ))}
          </div>

        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center p-4">
        {children}
      </main>

      {/* Footer */}
      <footer style={{
        backgroundColor: 'rgba(44,62,80,0.8)',
        backdropFilter: 'blur(8px)',
        borderTop: '1px solid rgba(255,255,255,0.08)',
        padding: '1rem',
        textAlign: 'center',
      }}>
        <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.8rem' }}>
          © {new Date().getFullYear()} INDU<span style={{ color: '#1ABC9C' }}>SPHERE</span>
          <span style={{ margin: '0 0.5rem' }}>•</span>
          {locale === 'ar' && 'جميع الحقوق محفوظة'}
          {locale === 'fr' && 'Tous droits réservés'}
          {locale === 'en' && 'All rights reserved'}
        </p>
      </footer>

    </div>
  );
}