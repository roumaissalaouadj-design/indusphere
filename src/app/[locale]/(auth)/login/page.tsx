// src/app/[locale]/(auth)/login/page.tsx
'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { signIn } from 'next-auth/react';
import { useLocale, useTranslations } from 'next-intl';
import { Mail, Lock, Eye, EyeOff, AlertCircle, CheckCircle } from 'lucide-react';
import styles from '@/styles/pages/login.module.css';

export default function LoginPage() {
  const router = useRouter();
  const locale = useLocale();
  const searchParams = useSearchParams();
  const registered = searchParams.get('registered');
  const t = useTranslations('Auth');
  const isRTL = locale === 'ar';

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [form, setForm] = useState({
    email: '',
    password: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const result = await signIn('credentials', {
        email: form.email,
        password: form.password,
        redirect: false,
      });

      if (result?.error) {
        setError(t('loginError'));
        return;
      }

      router.push(`/${locale}/dashboard`);
      router.refresh();
    } catch {
      setError(t('unexpectedError'));
    } finally {
      setLoading(false);
    }
  };

  // نصوص ثابتة للعنوان حسب اللغة
  const getTitle = () => {
    if (locale === 'ar') return 'تسجيل الدخول';
    if (locale === 'fr') return 'Connexion';
    return 'Login';
  };

  const getSubtitle = () => {
    if (locale === 'ar') return 'سجل دخولك إلى حساب مصنعك';
    if (locale === 'fr') return 'Connectez-vous à votre compte d\'usine';
    return 'Sign in to your factory account';
  };

  const getNoAccountText = () => {
    if (locale === 'ar') return 'ليس لديك حساب؟';
    if (locale === 'fr') return 'Vous n\'avez pas de compte ?';
    return "Don't have an account?";
  };

  const getCreateAccountText = () => {
    if (locale === 'ar') return 'إنشاء حساب مصنع جديد';
    if (locale === 'fr') return 'Créer un compte d\'usine';
    return 'Create a factory account';
  };

  return (
    <div className="w-full max-w-md">
{/* Logo Section */}
<div className="text-center mb-8">
  <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl shadow-lg mb-4 overflow-hidden bg-white/10">
    <img 
      src="/indusphere-logo.png" 
      alt="Indusphere Logo"
      style={{ 
        width: '64px', 
        height: '64px', 
        objectFit: 'contain',
      }}
    />
  </div>
  <h1 className="text-3xl font-bold text-white mb-2">
    {getTitle()}
  </h1>
  <p className="text-gray-300 text-sm">
    {getSubtitle()}
  </p>
</div>
  <h1 className="text-3xl font-bold text-white mb-2">
    {getTitle()}
  </h1>
  <p className="text-gray-300 text-sm">
    {getSubtitle()}
  </p>
</div>

      {/* Card */}
      <div className={`bg-white rounded-xl shadow-2xl overflow-hidden ${styles.card}`}>
        <div className="p-8">
          {/* Success Message */}
          {registered && (
            <div className={`mb-6 p-4 bg-green-50 border-r-4 border-green-500 rounded-lg flex items-center gap-3 ${styles.alert}`}>
              <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
              <p className="text-green-700 text-sm">
                {locale === 'ar' ? 'تم إنشاء الحساب بنجاح! سجل دخولك الآن' : 
                 locale === 'fr' ? 'Compte créé avec succès ! Connectez-vous maintenant' : 
                 'Account created successfully! Please sign in'}
              </p>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className={`mb-6 p-4 bg-red-50 border-r-4 border-red-500 rounded-lg flex items-center gap-3 ${styles.alert}`}>
              <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
              <p className="text-red-700 text-sm">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email Field */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                {t('email')} <span className="text-red-500">*</span>
              </label>
              <div className={styles.inputWrapper}>
                <Mail className={`${styles.inputIcon} w-5 h-5`} />
                <input
                  type="email"
                  required
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  placeholder="admin@factory.dz"
                  className={`${styles.inputField} w-full pl-11 pr-4 py-3 border-2 border-gray-200 rounded-lg focus:border-[#1ABC9C] focus:outline-none transition-colors ${
                    isRTL ? 'text-right' : 'text-left'
                  }`}
                  dir="ltr"
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                {t('password')} <span className="text-red-500">*</span>
              </label>
              <div className={styles.passwordWrapper}>
                <Lock className={styles.passwordLockIcon} />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  placeholder="••••••••"
                  className={styles.passwordInput}
                  dir="ltr"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className={styles.passwordToggle}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-[#2C3E50] to-[#1ABC9C] hover:from-[#1ABC9C] hover:to-[#2C3E50] text-white font-bold py-3 rounded-lg transition-all duration-300 transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  {locale === 'ar' ? 'جاري الدخول...' : locale === 'fr' ? 'Connexion en cours...' : 'Signing in...'}
                </span>
              ) : (
                t('login')
              )}
            </button>

            {/* Register Link */}
            <div className="text-center pt-4 border-t border-gray-200">
              <p className="text-gray-600 text-sm">
                {getNoAccountText()}{' '}
                <a href={`/${locale}/register`} className="text-[#1ABC9C] hover:text-[#16a085] font-semibold transition-colors">
                  {getCreateAccountText()}
                </a>
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}