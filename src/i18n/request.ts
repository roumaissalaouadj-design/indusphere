import { getRequestConfig } from 'next-intl/server'
import { routing } from './routing'

export default getRequestConfig(async ({ requestLocale }) => {
  const requestedLocale = await requestLocale
  
  // التحقق من صحة اللغة
  let validLocale: string = routing.defaultLocale
  
  if (requestedLocale && routing.locales.includes(requestedLocale as 'ar' | 'fr' | 'en')) {
    validLocale = requestedLocale
  }
  
  return {
    locale: validLocale,
    messages: (await import(`../messages/${validLocale}.json`)).default
  }
})