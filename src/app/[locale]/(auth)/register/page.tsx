'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { Building2, MapPin, Mail, Lock, Eye, EyeOff, AlertCircle, ArrowRight, ArrowLeft, User, Key } from 'lucide-react';
import styles from '@/styles/pages/register.module.css';

type Props = {
  params: Promise<{ locale: string }>;
};

export default function RegisterPage({ params }: Props) {
  // استخدام React.use() لاستخراج params من Promise
  const { locale } = React.use(params);
  const router = useRouter();
  const t = useTranslations('Auth');
  const isRTL = locale === 'ar';

  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [form, setForm] = useState({
    name: '',
    factoryName: '',
    location: '',
    email: '',
    password: '',
    activationCode: '',
  });

  const handleNext = () => {
    if (step === 1) {
      if (!form.name || !form.factoryName || !form.location) {
        setError(isRTL ? 'يرجى ملء جميع الحقول' : 'Please fill all fields');
        return;
      }
      setError('');
      setStep(2);
    }
  };

  const handleBack = () => {
    setStep(1);
    setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (!form.email || !form.password || !form.activationCode) {
      setError(isRTL ? 'يرجى ملء جميع الحقول' : 'Please fill all fields');
      setLoading(false);
      return;
    }

    if (form.password.length < 6) {
      setError(isRTL ? 'كلمة المرور يجب أن تكون 6 أحرف على الأقل' : 'Password must be at least 6 characters');
      setLoading(false);
      return;
    }

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });

      const data = await res.json();

      if (!data.success) {
        setError(data.message || (isRTL ? 'حدث خطأ في التسجيل' : 'Registration failed'));
        return;
      }

      router.push(`/${locale}/login?registered=true`);

    } catch {
      setError(isRTL ? 'حدث خطأ غير متوقع' : 'An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  const getPasswordStrength = (password: string) => {
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
  };

  const strength = getPasswordStrength(form.password);
  const strengthConfig = {
    weak:   { color: '#ef4444', text: isRTL ? 'ضعيفة' : 'Weak',   width: '33%'  },
    fair:   { color: '#f59e0b', text: isRTL ? 'مقبولة' : 'Fair',   width: '66%'  },
    strong: { color: '#10b981', text: isRTL ? 'قوية' : 'Strong',   width: '100%' },
  };

  return (
    <div className="w-full max-w-md">

      {/* Logo Section */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-[#1ABC9C] to-[#16a085] rounded-2xl shadow-lg mb-4">
          <Building2 className="w-10 h-10 text-white" />
        </div>
        <h1 className="text-3xl font-bold text-white mb-2">
          {isRTL ? 'إنشاء حساب جديد' : 'Create New Account'}
        </h1>
        <p className="text-gray-300 text-sm">
          {isRTL ? 'قم بإنشاء حساب لمصنع الأسمنت الخاص بك' : 'Create an account for your cement factory'}
        </p>
      </div>

      {/* Card */}
      <div className={`bg-white rounded-xl shadow-2xl overflow-hidden ${styles.card}`}>
        <div className="p-8">

          {/* Step Indicator */}
          <div className={styles.stepIndicator}>
            <div className={`${styles.step} ${step >= 1 ? styles.stepActive : styles.stepInactive}`}>1</div>
            <div className={`${styles.stepLine} ${step >= 2 ? styles.stepLineActive : ''}`} />
            <div className={`${styles.step} ${step >= 2 ? styles.stepActive : styles.stepInactive}`}>2</div>
          </div>

          {/* Error Message */}
          {error && (
            <div className={`mb-6 p-4 bg-red-50 border-r-4 border-red-500 rounded-lg flex items-center gap-3 ${styles.alert}`}>
              <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
              <p className="text-red-700 text-sm">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit}>
            {step === 1 ? (
              <div className="space-y-6">

                {/* Admin Name */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    {isRTL ? 'اسمك الكامل' : 'Your Full Name'} <span className="text-red-500">*</span>
                  </label>
                  <div className={styles.inputWrapper}>
                    <User className={styles.inputIcon} />
                    <input
                      type="text"
                      required
                      value={form.name}
                      onChange={e => setForm({ ...form, name: e.target.value })}
                      placeholder={isRTL ? 'أحمد بن علي' : 'Ahmed Ben Ali'}
                      className={styles.inputField}
                    />
                  </div>
                </div>

                {/* Factory Name */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    {isRTL ? 'اسم المصنع' : 'Factory Name'} <span className="text-red-500">*</span>
                  </label>
                  <div className={styles.inputWrapper}>
                    <Building2 className={styles.inputIcon} />
                    <input
                      type="text"
                      required
                      value={form.factoryName}
                      onChange={e => setForm({ ...form, factoryName: e.target.value })}
                      placeholder={isRTL ? 'مصنع الأسمنت الشمالي' : 'Northern Cement Factory'}
                      className={styles.inputField}
                    />
                  </div>
                </div>

                {/* Location */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    {isRTL ? 'الموقع' : 'Location'} <span className="text-red-500">*</span>
                  </label>
                  <div className={styles.inputWrapper}>
                    <MapPin className={styles.inputIcon} />
                    <input
                      type="text"
                      required
                      value={form.location}
                      onChange={e => setForm({ ...form, location: e.target.value })}
                      placeholder={isRTL ? 'الجزائر' : 'Algeria'}
                      className={styles.inputField}
                    />
                  </div>
                </div>

                {/* Next Button */}
                <button
                  type="button"
                  onClick={handleNext}
                  className="w-full bg-gradient-to-r from-[#2C3E50] to-[#1ABC9C] hover:from-[#1ABC9C] hover:to-[#2C3E50] text-white font-bold py-3 rounded-lg transition-all duration-300 transform hover:scale-[1.02] shadow-lg flex items-center justify-center gap-2"
                >
                  {isRTL ? 'التالي' : 'Next'}
                  {isRTL ? <ArrowLeft className="w-5 h-5" /> : <ArrowRight className="w-5 h-5" />}
                </button>
              </div>

            ) : (
              <div className="space-y-6">

                {/* Email */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    {t('email')} <span className="text-red-500">*</span>
                  </label>
                  <div className={styles.inputWrapper}>
                    <Mail className={styles.inputIcon} />
                    <input
                      type="email"
                      required
                      value={form.email}
                      onChange={e => setForm({ ...form, email: e.target.value })}
                      placeholder="admin@factory.dz"
                      className={styles.inputField}
                      dir="ltr"
                    />
                  </div>
                </div>

                {/* Password */}
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
                      onChange={e => setForm({ ...form, password: e.target.value })}
                      placeholder="••••••••"
                      className={styles.passwordInput}
                      dir="ltr"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className={styles.passwordToggle}
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                    >
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>

                  {/* Password Strength */}
                  {strength && (
                    <div className="mt-2">
                      <div
                        className={styles.strengthBar}
                        style={{
                          width: strengthConfig[strength].width,
                          backgroundColor: strengthConfig[strength].color,
                        }}
                      />
                      <p className={styles.strengthText} style={{ color: strengthConfig[strength].color }}>
                        {strengthConfig[strength].text}
                      </p>
                    </div>
                  )}
                </div>

                {/* ✅ Activation Code Field */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    {isRTL ? 'رمز التفعيل' : 'Activation Code'} <span className="text-red-500">*</span>
                  </label>
                  <div className={styles.inputWrapper}>
                    <Key className={styles.inputIcon} />
                    <input
                      type="text"
                      required
                      value={form.activationCode}
                      onChange={e => setForm({ ...form, activationCode: e.target.value })}
                      placeholder={isRTL ? 'أدخل رمز التفعيل' : 'Enter activation code'}
                      className={styles.inputField}
                      dir="ltr"
                    />
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    {isRTL ? 'الرمز مطلوب لتفعيل حسابك' : 'Code is required to activate your account'}
                  </p>
                </div>

                {/* Buttons */}
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={handleBack}
                    className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-700 font-bold py-3 rounded-lg transition-all duration-200 flex items-center justify-center gap-2"
                  >
                    {isRTL ? <ArrowRight className="w-5 h-5" /> : <ArrowLeft className="w-5 h-5" />}
                    {isRTL ? 'السابق' : 'Back'}
                  </button>

                  <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 bg-gradient-to-r from-[#2C3E50] to-[#1ABC9C] hover:from-[#1ABC9C] hover:to-[#2C3E50] text-white font-bold py-3 rounded-lg transition-all duration-300 transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
                  >
                    {loading ? (
                      <span className="flex items-center justify-center gap-2">
                        <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                        </svg>
                        {isRTL ? 'جاري الإنشاء...' : 'Creating...'}
                      </span>
                    ) : (
                      isRTL ? 'إنشاء الحساب' : 'Create Account'
                    )}
                  </button>
                </div>

                {/* Login Link */}
                <div className="text-center pt-4 border-t border-gray-200">
                  <p className="text-gray-600 text-sm">
                    {isRTL ? 'لديك حساب بالفعل؟' : 'Already have an account?'}{' '}
                    <a href={`/${locale}/login`} className="text-[#1ABC9C] hover:text-[#16a085] font-semibold transition-colors">
                      {isRTL ? 'تسجيل الدخول' : 'Sign in'}
                    </a>
                  </p>
                </div>

              </div>
            )}
          </form>
        </div>
      </div>
    </div>
  );
}