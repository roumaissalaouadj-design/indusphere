// src/app/[locale]/(auth)/activate/page.tsx
'use client';

import { use } from 'react';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import Link from 'next/link';
import { User, Building2, Mail, Lock, Key, Eye, EyeOff, AlertCircle, CheckCircle, Shield, Award, Rocket, ArrowRight } from 'lucide-react';
import styles from '@/styles/pages/activate.module.css';

type Props = {
  params: Promise<{ locale: string }>;
};

type PasswordStrength = 'weak' | 'fair' | 'strong' | null;

function getPasswordStrength(password: string): PasswordStrength {
  if (!password) return null;
  if (password.length < 6) return 'weak';
  const hasUpper = /[A-Z]/.test(password);
  const hasLower = /[a-z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const hasSpecial = /[^A-Za-z0-9]/.test(password);
  const score = [hasUpper, hasLower, hasNumber, hasSpecial].filter(Boolean).length;
  if (score <= 2) return 'weak';
  if (score === 3) return 'fair';
  return 'strong';
}

export default function ActivatePage({ params }: Props) {
  const { locale } = use(params);
  const router = useRouter();
  const t = useTranslations('Activate');
  const tCommon = useTranslations('Common');
  const isRTL = locale === 'ar';

  const [form, setForm] = useState({
    name: '',
    factoryName: '',
    email: '',
    password: '',
    confirmPassword: '',
    code: '',
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const strength = getPasswordStrength(form.password);
  const strengthConfig = {
    weak: { text: t('passwordWeak'), color: '#ef4444', width: '33%' },
    fair: { text: t('passwordFair'), color: '#f59e0b', width: '66%' },
    strong: { text: t('passwordStrong'), color: '#10b981', width: '100%' },
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (form.password !== form.confirmPassword) {
      setError(t('passwordMismatch'));
      return;
    }
    if (strength === 'weak') {
      setError(t('passwordWeak'));
      return;
    }
    if (!form.code || form.code.length < 6) {
      setError(t('invalidCode'));
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/activate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (data.success) {
        setSuccess(true);
        setTimeout(() => router.push(`/${locale}/login`), 2000);
      } else {
        setError(data.message === 'Invalid or already used activation code'
          ? t('invalidCode')
          : data.message);
      }
    } catch {
      setError(tCommon('error'));
    } finally {
      setLoading(false);
    }
  };

  if (!showForm) {
    return (
      <div className="w-full max-w-2xl">
        <div className={`text-center ${styles.landingCard}`}>
          {/* ✅ الشعار داخل الإطار الأخضر */}
          <div className={`inline-flex items-center justify-center w-28 h-28 bg-gradient-to-br from-[#1ABC9C] to-[#16a085] rounded-3xl shadow-2xl mb-6 ${styles.iconPulse}`}>
            <img 
              src="/indusphere-logo.png" 
              alt="Indusphere Logo"
              className="w-16 h-16 object-contain"
            />
          </div>

          <h1 className="text-4xl font-bold text-white mb-4">
            {t('title')}
          </h1>
          <p className="text-gray-300 text-lg mb-8 max-w-md mx-auto">
            {t('subtitle')}
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 text-center hover:bg-white/15 transition-all duration-300">
              <div className="w-14 h-14 bg-[#1ABC9C]/20 rounded-xl flex items-center justify-center mx-auto mb-4">
                <Shield className="w-7 h-7 text-[#1ABC9C]" />
              </div>
              <h3 className="text-white font-semibold text-lg mb-2">{t('secureTitle')}</h3>
              <p className="text-gray-400 text-sm leading-relaxed">{t('secureDesc')}</p>
            </div>

            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 text-center hover:bg-white/15 transition-all duration-300">
              <div className="w-14 h-14 bg-[#1ABC9C]/20 rounded-xl flex items-center justify-center mx-auto mb-4">
                <Award className="w-7 h-7 text-[#1ABC9C]" />
              </div>
              <h3 className="text-white font-semibold text-lg mb-2">{t('supportTitle')}</h3>
              <p className="text-gray-400 text-sm leading-relaxed">{t('supportDesc')}</p>
            </div>

            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 text-center hover:bg-white/15 transition-all duration-300">
              <div className="w-14 h-14 bg-[#1ABC9C]/20 rounded-xl flex items-center justify-center mx-auto mb-4">
                <Rocket className="w-7 h-7 text-[#1ABC9C]" />
              </div>
              <h3 className="text-white font-semibold text-lg mb-2">{t('quickStartTitle')}</h3>
              <p className="text-gray-400 text-sm leading-relaxed">{t('quickStartDesc')}</p>
            </div>
          </div>

          <button
            onClick={() => setShowForm(true)}
            className="px-8 py-4 bg-gradient-to-r from-[#1ABC9C] to-[#16a085] hover:from-[#16a085] hover:to-[#1ABC9C] text-white font-bold rounded-xl transition-all duration-300 transform hover:scale-105 shadow-xl flex items-center justify-center gap-3 mx-auto"
          >
            <span className="text-lg">{t('startActivation')}</span>
            <ArrowRight className="w-5 h-5" />
          </button>

          <p className="text-gray-400 text-sm mt-8">
            {t('alreadyHaveAccount')}{' '}
            <Link href={`/${locale}/login`} className="text-[#1ABC9C] hover:text-[#16a085] font-semibold transition-colors">
              {t('login')}
            </Link>
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-md">
      <div className="text-center mb-8">
        {/* ✅ الشعار داخل الإطار الأخضر */}
        <div className="inline-flex items-center justify-center w-24 h-24 bg-gradient-to-br from-[#1ABC9C] to-[#16a085] rounded-2xl shadow-lg mb-4">
          <img 
            src="/indusphere-logo.png" 
            alt="Indusphere Logo"
            className="w-14 h-14 object-contain"
          />
        </div>
        <h1 className="text-3xl font-bold text-white mb-2">{t('title')}</h1>
        <p className="text-gray-300 text-sm">{t('subtitle')}</p>
      </div>

      <div className={`bg-white rounded-xl shadow-2xl overflow-hidden ${styles.card}`}>
        <div className="p-8">
          {success && (
            <div className={`mb-6 p-4 bg-green-50 border-r-4 border-green-500 rounded-lg flex items-center gap-3 ${styles.alert}`}>
              <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
              <p className="text-green-700 text-sm">{t('activationSuccess')}</p>
            </div>
          )}

          {error && (
            <div className={`mb-6 p-4 bg-red-50 border-r-4 border-red-500 rounded-lg flex items-center gap-3 ${styles.alert}`}>
              <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
              <p className="text-red-700 text-sm">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">{t('fullName')} *</label>
              <div className={styles.inputWrapper}>
                <User className={styles.inputIcon} />
                <input
                  type="text"
                  required
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder={t('fullNamePlaceholder')}
                  className={styles.inputField}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">{t('factoryName')} *</label>
              <div className={styles.inputWrapper}>
                <Building2 className={styles.inputIcon} />
                <input
                  type="text"
                  required
                  value={form.factoryName}
                  onChange={(e) => setForm({ ...form, factoryName: e.target.value })}
                  placeholder={t('factoryNamePlaceholder')}
                  className={styles.inputField}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">{t('email')} *</label>
              <div className={styles.inputWrapper}>
                <Mail className={styles.inputIcon} />
                <input
                  type="email"
                  required
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  placeholder={t('emailPlaceholder')}
                  className={styles.inputField}
                  dir="ltr"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">{t('password')} *</label>
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
              {strength && (
                <div className="mt-2">
                  <div className={styles.strengthBar} style={{ width: strengthConfig[strength].width, backgroundColor: strengthConfig[strength].color }} />
                  <p className={styles.strengthText} style={{ color: strengthConfig[strength].color }}>{strengthConfig[strength].text}</p>
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">{t('confirmPassword')} *</label>
              <div className={styles.passwordWrapper}>
                <Lock className={styles.passwordLockIcon} />
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  required
                  value={form.confirmPassword}
                  onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
                  placeholder="••••••••"
                  className={styles.passwordInput}
                  dir="ltr"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className={styles.passwordToggle}
                >
                  {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">{t('code')} *</label>
              <div className={styles.inputWrapper}>
                <Key className={styles.inputIcon} />
                <input
                  type="text"
                  required
                  value={form.code}
                  onChange={(e) => setForm({ ...form, code: e.target.value })}
                  placeholder={t('codePlaceholder')}
                  className={`${styles.inputField} ${styles.codeInput}`}
                  dir="ltr"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading || success}
              className={`${styles.activateButton} w-full bg-gradient-to-r from-[#2C3E50] to-[#1ABC9C] hover:from-[#1ABC9C] hover:to-[#2C3E50] text-white font-bold py-3 rounded-lg transition-all duration-300 transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed shadow-lg`}
            >
              {loading ? (isRTL ? 'جاري التفعيل...' : locale === 'fr' ? 'Activation en cours...' : 'Activating...') : t('activateButton')}
            </button>

            <div className="text-center pt-4 border-t border-gray-200">
              <p className="text-gray-600 text-sm">
                {t('alreadyHaveAccount')}{' '}
                <Link href={`/${locale}/login`} className="text-[#1ABC9C] hover:text-[#16a085] font-semibold transition-colors">
                  {t('login')}
                </Link>
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}