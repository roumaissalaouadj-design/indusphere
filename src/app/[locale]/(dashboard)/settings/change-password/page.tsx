// src/app/[locale]/(dashboard)/settings/change-password/page.tsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations, useLocale } from 'next-intl';
import { Lock, Save, ArrowRight, Eye, EyeOff, CheckCircle, XCircle } from 'lucide-react';
import styles from '@/styles/pages/change-password.module.css';

export default function ChangePasswordPage() {
  const router = useRouter();
  const locale = useLocale();
  const t = useTranslations('Auth');
  const tCommon = useTranslations('Common');
  
  const [form, setForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  
  // ✅ حالة إظهار/إخفاء كلمة المرور
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // ✅ التحقق من قوة كلمة المرور
  const getPasswordStrength = (password: string): { score: number; message: string; color: string } => {
    let score = 0;
    let message = '';
    let color = '#ef4444'; // أحمر افتراضي
    
    if (!password) {
      return { score: 0, message: '', color: '#e2e8f0' };
    }
    
    if (password.length >= 8) score++;
    if (/[a-z]/.test(password)) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[^A-Za-z0-9]/.test(password)) score++;
    
    if (score <= 2) {
      message = 'ضعيفة';
      color = '#ef4444';
    } else if (score <= 4) {
      message = 'متوسطة';
      color = '#f59e0b';
    } else {
      message = 'قوية';
      color = '#10b981';
    }
    
    return { score, message, color };
  };

  // ✅ التحقق من صحة كلمة المرور (للإرسال)
  const isPasswordValid = (password: string): boolean => {
    if (password.length < 8) return false;
    if (!/[a-z]/.test(password)) return false;
    if (!/[A-Z]/.test(password)) return false;
    if (!/[0-9]/.test(password)) return false;
    if (!/[^A-Za-z0-9]/.test(password)) return false;
    return true;
  };

  const strength = getPasswordStrength(form.newPassword);
  const isValid = isPasswordValid(form.newPassword);
  const doPasswordsMatch = form.newPassword === form.confirmPassword;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isValid) {
      setError('كلمة المرور يجب أن تحتوي على الأقل على 8 أحرف، حرف كبير، حرف صغير، رقم، ورمز خاص');
      return;
    }
    
    if (form.newPassword !== form.confirmPassword) {
      setError(t('passwordMismatch'));
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/auth/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          currentPassword: form.currentPassword,
          newPassword: form.newPassword,
        }),
      });

      const data = await res.json();

      if (data.success) {
        alert(t('passwordChanged'));
        router.push(`/${locale}/dashboard`);
      } else {
        setError(data.message);
      }
    } catch {
      setError(tCommon('error'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.page}>
      <div className={styles.container}>
        <div className={styles.header}>
          <div>
            <h1 className={styles.title}>
              <Lock className={styles.titleIcon} />
              {t('changePassword')}
            </h1>
            <p className={styles.subtitle}>
              {t('changePasswordDescription')}
            </p>
          </div>
          <button onClick={() => router.back()} className={styles.cancelButton}>
            <ArrowRight className="w-4 h-4 ml-1" />
            {tCommon('cancel')}
          </button>
        </div>

        {error && (
          <div className={styles.errorMessage}>
            <p className={styles.errorText}>{error}</p>
          </div>
        )}

        <div className={styles.formContainer}>
          <form onSubmit={handleSubmit}>
            {/* كلمة المرور الحالية */}
            <div className={styles.formGroup}>
              <label className={styles.formLabel}>{t('currentPassword')} *</label>
              <div className={styles.passwordWrapper}>
                <input
                  type={showCurrentPassword ? 'text' : 'password'}
                  required
                  value={form.currentPassword}
                  onChange={(e) => setForm({ ...form, currentPassword: e.target.value })}
                  className={styles.formInput}
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                  className={styles.passwordToggle}
                >
                  {showCurrentPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {/* كلمة المرور الجديدة */}
            <div className={styles.formGroup}>
              <label className={styles.formLabel}>{t('newPassword')} *</label>
              <div className={styles.passwordWrapper}>
                <input
                  type={showNewPassword ? 'text' : 'password'}
                  required
                  value={form.newPassword}
                  onChange={(e) => setForm({ ...form, newPassword: e.target.value })}
                  className={styles.formInput}
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  className={styles.passwordToggle}
                >
                  {showNewPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              
              {/* مؤشر قوة كلمة المرور */}
              {form.newPassword && (
                <div className={styles.strengthContainer}>
                  <div className={styles.strengthBar}>
                    <div 
                      className={styles.strengthFill}
                      style={{ 
                        width: `${(strength.score / 5) * 100}%`,
                        backgroundColor: strength.color
                      }}
                    />
                  </div>
                  <p className={styles.strengthText} style={{ color: strength.color }}>
                    قوة كلمة المرور: {strength.message}
                  </p>
                  <ul className={styles.requirementsList}>
                    <li className={form.newPassword.length >= 8 ? styles.requirementMet : styles.requirementNotMet}>
                      {form.newPassword.length >= 8 ? <CheckCircle size={12} /> : <XCircle size={12} />}
                      <span>8 أحرف على الأقل</span>
                    </li>
                    <li className={/[a-z]/.test(form.newPassword) ? styles.requirementMet : styles.requirementNotMet}>
                      {/[a-z]/.test(form.newPassword) ? <CheckCircle size={12} /> : <XCircle size={12} />}
                      <span>حرف صغير (a-z)</span>
                    </li>
                    <li className={/[A-Z]/.test(form.newPassword) ? styles.requirementMet : styles.requirementNotMet}>
                      {/[A-Z]/.test(form.newPassword) ? <CheckCircle size={12} /> : <XCircle size={12} />}
                      <span>حرف كبير (A-Z)</span>
                    </li>
                    <li className={/[0-9]/.test(form.newPassword) ? styles.requirementMet : styles.requirementNotMet}>
                      {/[0-9]/.test(form.newPassword) ? <CheckCircle size={12} /> : <XCircle size={12} />}
                      <span>رقم (0-9)</span>
                    </li>
                    <li className={/[^A-Za-z0-9]/.test(form.newPassword) ? styles.requirementMet : styles.requirementNotMet}>
                      {/[^A-Za-z0-9]/.test(form.newPassword) ? <CheckCircle size={12} /> : <XCircle size={12} />}
                      <span>رمز خاص (!@#$%^&*)</span>
                    </li>
                  </ul>
                </div>
              )}
            </div>

            {/* تأكيد كلمة المرور */}
            <div className={styles.formGroup}>
              <label className={styles.formLabel}>{t('confirmPassword')} *</label>
              <div className={styles.passwordWrapper}>
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  required
                  value={form.confirmPassword}
                  onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
                  className={styles.formInput}
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className={styles.passwordToggle}
                >
                  {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {form.confirmPassword && (
                <p className={doPasswordsMatch ? styles.matchSuccess : styles.matchError}>
                  {doPasswordsMatch ? '✓ كلمة المرور متطابقة' : '✗ كلمة المرور غير متطابقة'}
                </p>
              )}
            </div>

            <div className={styles.formActions}>
              <button type="submit" disabled={loading || !isValid || !doPasswordsMatch} className={styles.saveButton}>
                <Save className="w-4 h-4" />
                {loading ? tCommon('saving') : tCommon('save')}
              </button>
              <button type="button" onClick={() => router.back()} className={styles.cancelButton}>
                {tCommon('cancel')}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}