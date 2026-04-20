import { defineRouting } from 'next-intl/routing';

export const routing = defineRouting({
  locales: ['ar', 'fr', 'en'],
  defaultLocale: 'fr',
  localePrefix: 'always', // ✅ دائماً أظهر اللغة في الرابط
  localeDetection: true,
});

export type Locale = (typeof routing.locales)[number];