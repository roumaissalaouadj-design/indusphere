// src/app/[locale]/(auth)/layout.tsx
'use client';

import React, { use } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Factory } from 'lucide-react';

export default function AuthLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>; // ✅ Promise فقط بدون Union
}) {
  const { locale } = use(params); // ✅ use() مباشرة بدون instanceof
  
  const pathname = usePathname();
  const router = useRouter();

  const switchLanguage = (lang: string) => {
    const newPathname = pathname.replace(`/${locale}`, `/${lang}`);
    router.push(newPathname);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#2C3E50] to-[#34495E] flex flex-col">
      {/* Header */}
      <header className="bg-white/10 backdrop-blur-md border-b border-white/20">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <Link href={`/${locale}`} className="flex items-center gap-2 group">
              <Factory className="w-8 h-8 text-[#1ABC9C]" />
              <span className="text-xl font-bold text-white tracking-wider">
                INDU<span className="text-[#1ABC9C]">SPHERE</span>
              </span>
            </Link>

            {/* Language Switcher */}
            <div className="flex gap-1 bg-[#2C3E50]/50 rounded-lg p-1 backdrop-blur-sm">
              {['ar', 'fr', 'en'].map((lang) => (
                <button
                  key={lang}
                  onClick={() => switchLanguage(lang)}
                  className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all duration-200 ${
                    locale === lang
                      ? 'bg-[#1ABC9C] text-white shadow-lg'
                      : 'text-gray-300 hover:text-white hover:bg-white/10'
                  }`}
                >
                  {lang === 'ar' ? 'عربي' : lang === 'fr' ? 'Français' : 'English'}
                </button>
              ))}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center p-4">
        {children}
      </main>

      {/* Footer */}
      <footer className="bg-[#2C3E50]/80 backdrop-blur-sm border-t border-white/10 py-4">
        <div className="container mx-auto px-4 text-center">
          <p className="text-gray-400 text-sm">
            © {new Date().getFullYear()} INDU<span className="text-[#1ABC9C]">SPHERE</span> — 
            <span className="mx-2">•</span>
            {locale === 'ar' && 'جميع الحقوق محفوظة'}
            {locale === 'fr' && 'Tous droits réservés'}
            {locale === 'en' && 'All rights reserved'}
          </p>
        </div>
      </footer>
    </div>
  );
}