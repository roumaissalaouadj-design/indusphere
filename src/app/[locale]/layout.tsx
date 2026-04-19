import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { routing, type Locale } from '@/i18n/routing';
import Providers from '@/components/Providers';
import '../../styles/globals.css';

type Props = {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
};

export default async function LocaleLayout({ children, params }: Props) {
  const { locale } = await params;
  
  // التحقق من صحة اللغة باستخدام النوع Locale بدلاً من any
  if (!routing.locales.includes(locale as Locale)) {
    notFound();
  }

  const messages = await getMessages();

  return (
    <html lang={locale} dir={locale === 'ar' ? 'rtl' : 'ltr'}>
<head>
  <link rel="manifest" href="/manifest.json" />
  <link rel="icon" type="image/svg+xml" href="/indusphere-logo.svg" />
  <link rel="shortcut icon" href="/indusphere-logo.svg" />
  <link rel="apple-touch-icon" href="/icon-192x192.png" />
  <meta name="theme-color" content="#1ABC9C" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
</head>
      <body>
        <NextIntlClientProvider messages={messages}>
          <Providers>
            {children}
          </Providers>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}