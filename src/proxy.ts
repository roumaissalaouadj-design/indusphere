import { NextRequest, NextResponse } from 'next/server';
import createIntlMiddleware from 'next-intl/middleware';
import { routing } from './i18n/routing';

// قائمة المسارات المحمية (تتطلب مصادقة)
const protectedPaths = ['/dashboard', '/cmms', '/erp', '/reports', '/settings'];
// قائمة مسارات المصادقة (إذا كان المستخدم مسجلًا، يتم إعادة توجيهه)
const authPaths = ['/login', '/register', '/activate'];

// إنشاء middleware مخصص للترجمة
const intlMiddleware = createIntlMiddleware(routing);

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // إزالة اللغة من المسار (مثل /ar/dashboard -> /dashboard)
  const pathnameWithoutLocale = pathname.replace(/^\/(ar|fr|en)/, '') || '/';

  const isProtected = protectedPaths.some(p => pathnameWithoutLocale.startsWith(p));
  const isAuth = authPaths.some(p => pathnameWithoutLocale.startsWith(p));

  // التحقق من وجود توكن المصادقة في الكوكيز
  const token = request.cookies.get('authjs.session-token') ||
                request.cookies.get('__Secure-authjs.session-token');

  // إذا كان المسار محميًا ولا يوجد توكن -> إعادة توجيه إلى تسجيل الدخول
  if (isProtected && !token) {
    const locale = pathname.match(/^\/(ar|fr|en)/)?.[1] || 'ar';
    const loginUrl = new URL(`/${locale}/login`, request.url);
    loginUrl.searchParams.set('callbackUrl', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // إذا كان المسار خاصًا بالمصادقة ويوجد توكن -> إعادة توجيه إلى لوحة التحكم
  if (isAuth && token) {
    const locale = pathname.match(/^\/(ar|fr|en)/)?.[1] || 'ar';
    return NextResponse.redirect(new URL(`/${locale}/dashboard`, request.url));
  }

  // ✅ تطبيق middleware الترجمة على باقي المسارات
  const intlResponse = await intlMiddleware(request);
  if (intlResponse) {
    return intlResponse;
  }

  // إذا لم يكن هناك حاجة لإعادة توجيه، نسمح بمرور الطلب
  return NextResponse.next();
}

// تحديد الملفات التي سيتم تطبيق الـ Proxy عليها
export const config = {
  matcher: ['/((?!api|_next|.*\\..*).*)'],
};