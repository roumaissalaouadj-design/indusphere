// src/app/[locale]/(dashboard)/erp/accounting/taxes/settings/[id]/edit/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations, useLocale } from 'next-intl';
import { ArrowRight, Save, Settings } from 'lucide-react';
import styles from '@/styles/pages/taxes-edit.module.css';

interface TaxSetting {
  _id: string;
  taxType: string;
  code: string;
  name: string;
  rate: number;
  description: string;
  appliesTo: string[];
  isActive: boolean;
  effectiveFrom: string;
  effectiveTo: string;
}

const taxTypes = [
  { value: 'TVA', label: 'TVA (ضريبة القيمة المضافة)' },
  { value: 'IRG', label: 'IRG (ضريبة الدخل)' },
  { value: 'IBS', label: 'IBS (ضريبة الأرباح)' },
  { value: 'other', label: 'أخرى' },
];

const appliesToOptions = [
  { value: 'purchase', label: 'المشتريات' },
  { value: 'sale', label: 'المبيعات' },
  { value: 'salary', label: 'الرواتب' },
  { value: 'service', label: 'الخدمات' },
];

export default function EditTaxSettingPage({
  params,
}: {
  params: Promise<{ id: string; locale: string }>;
}) {
  const router = useRouter();
  const locale = useLocale();
  const t = useTranslations('Common');
  const tAccounting = useTranslations('Accounting');
  
  // ✅ نصوص ثابتة حسب اللغة
  const getTitle = () => {
    if (locale === 'ar') return 'تعديل إعداد الضريبة';
    if (locale === 'fr') return 'Modifier le paramètre fiscal';
    return 'Edit Tax Setting';
  };

  const getDescription = () => {
    if (locale === 'ar') return 'تعديل بيانات إعداد الضريبة';
    if (locale === 'fr') return 'Modifier les données du paramètre fiscal';
    return 'Edit tax setting data';
  };

  const getCancelText = () => {
    if (locale === 'ar') return 'إلغاء';
    if (locale === 'fr') return 'Annuler';
    return 'Cancel';
  };

  const getSaveText = () => {
    if (locale === 'ar') return 'حفظ';
    if (locale === 'fr') return 'Enregistrer';
    return 'Save';
  };

  const getTaxTypeLabel = () => {
    if (locale === 'ar') return 'نوع الضريبة';
    if (locale === 'fr') return 'Type de taxe';
    return 'Tax Type';
  };

  const getCodeLabel = () => {
    if (locale === 'ar') return 'الرمز';
    if (locale === 'fr') return 'Code';
    return 'Code';
  };

  const getNameLabel = () => {
    if (locale === 'ar') return 'الاسم';
    if (locale === 'fr') return 'Nom';
    return 'Name';
  };

  const getRateLabel = () => {
    if (locale === 'ar') return 'النسبة (%)';
    if (locale === 'fr') return 'Taux (%)';
    return 'Rate (%)';
  };

  const getEffectiveFromLabel = () => {
    if (locale === 'ar') return 'ساري من';
    if (locale === 'fr') return 'Valable à partir du';
    return 'Effective From';
  };

  const getEffectiveToLabel = () => {
    if (locale === 'ar') return 'ساري إلى';
    if (locale === 'fr') return 'Valable jusqu\'au';
    return 'Effective To';
  };

  const getAppliesToLabel = () => {
    if (locale === 'ar') return 'يطبق على';
    if (locale === 'fr') return 'S\'applique à';
    return 'Applies To';
  };

  const getDescriptionLabel = () => {
    if (locale === 'ar') return 'الوصف';
    if (locale === 'fr') return 'Description';
    return 'Description';
  };

  const getStatusLabel = () => {
    if (locale === 'ar') return 'الحالة';
    if (locale === 'fr') return 'Statut';
    return 'Status';
  };

  const [form, setForm] = useState<TaxSetting>({
    _id: '',
    taxType: 'TVA',
    code: '',
    name: '',
    rate: 0,
    description: '',
    appliesTo: ['purchase', 'sale'],
    isActive: true,
    effectiveFrom: new Date().toISOString().split('T')[0],
    effectiveTo: '',
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchSetting();
  }, []);

  const fetchSetting = async () => {
    try {
      const { id } = await params;
      const res = await fetch(`/api/accounting/taxes/settings/${id}`);
      const data = await res.json();
      if (data.success) {
        setForm({
          _id: data.data._id,
          taxType: data.data.taxType,
          code: data.data.code,
          name: data.data.name,
          rate: data.data.rate,
          description: data.data.description || '',
          appliesTo: data.data.appliesTo || ['purchase', 'sale'],
          isActive: data.data.isActive,
          effectiveFrom: data.data.effectiveFrom.split('T')[0],
          effectiveTo: data.data.effectiveTo ? data.data.effectiveTo.split('T')[0] : '',
        });
      } else {
        setError(data.message);
      }
    } catch {
      setError(t('fetchError'));
    } finally {
      setLoading(false);
    }
  };

  const handleAppliesToChange = (value: string) => {
    const current = [...form.appliesTo];
    if (current.includes(value)) {
      setForm({ ...form, appliesTo: current.filter(v => v !== value) });
    } else {
      setForm({ ...form, appliesTo: [...current, value] });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);

    try {
      const { id } = await params;
      const res = await fetch(`/api/accounting/taxes/settings/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });

      const data = await res.json();

      if (data.success) {
        alert(t('editSuccess'));
        router.push(`/${locale}/erp/accounting/taxes/settings`);
      } else {
        setError(data.message);
      }
    } catch {
      setError(t('error'));
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className={styles.page}>
        <div className={styles.container}>
          <div className={styles.loadingState}>
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#1ABC9C] mx-auto"></div>
            <p className="mt-2">{t('loading')}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <div className={styles.container}>
        <div className={styles.header}>
          <div>
            <h1 className={styles.title}>
              <Settings className={styles.titleIcon} />
              {getTitle()}
            </h1>
            <p className={styles.subtitle}>
              {getDescription()}
            </p>
          </div>
          <button onClick={() => router.push(`/${locale}/erp/accounting/taxes/settings`)} className={styles.cancelButton}>
            <ArrowRight className="w-4 h-4 ml-1" />
            {getCancelText()}
          </button>
        </div>

        {error && (
          <div className={styles.errorMessage}>
            <p className={styles.errorText}>{error}</p>
          </div>
        )}

        <div className={styles.formContainer}>
          <form onSubmit={handleSubmit}>
            <div className={styles.formGrid}>
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>{getTaxTypeLabel()} *</label>
                <select
                  required
                  value={form.taxType}
                  onChange={(e) => setForm({ ...form, taxType: e.target.value })}
                  className={styles.formSelect}
                >
                  {taxTypes.map((type) => (
                    <option key={type.value} value={type.value}>{type.label}</option>
                  ))}
                </select>
              </div>

              <div className={styles.formGroup}>
                <label className={styles.formLabel}>{getCodeLabel()} *</label>
                <input
                  type="text"
                  required
                  value={form.code}
                  onChange={(e) => setForm({ ...form, code: e.target.value })}
                  className={styles.formInput}
                />
              </div>

              <div className={styles.formGroup}>
                <label className={styles.formLabel}>{getNameLabel()} *</label>
                <input
                  type="text"
                  required
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className={styles.formInput}
                />
              </div>

              <div className={styles.formGroup}>
                <label className={styles.formLabel}>{getRateLabel()} *</label>
                <input
                  type="number"
                  required
                  value={form.rate}
                  onChange={(e) => setForm({ ...form, rate: Number(e.target.value) })}
                  className={styles.formInput}
                  step="0.1"
                />
              </div>

              <div className={styles.formGroup}>
                <label className={styles.formLabel}>{getEffectiveFromLabel()} *</label>
                <input
                  type="date"
                  required
                  value={form.effectiveFrom}
                  onChange={(e) => setForm({ ...form, effectiveFrom: e.target.value })}
                  className={styles.formInput}
                />
              </div>

              <div className={styles.formGroup}>
                <label className={styles.formLabel}>{getEffectiveToLabel()}</label>
                <input
                  type="date"
                  value={form.effectiveTo}
                  onChange={(e) => setForm({ ...form, effectiveTo: e.target.value })}
                  className={styles.formInput}
                />
              </div>

              <div className={styles.formGroup}>
                <label className={styles.formLabel}>{getAppliesToLabel()}</label>
                <div className="flex flex-wrap gap-3 mt-1">
                  {appliesToOptions.map((option) => (
                    <label key={option.value} className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={form.appliesTo.includes(option.value)}
                        onChange={() => handleAppliesToChange(option.value)}
                        className="w-4 h-4 text-[#1ABC9C]"
                      />
                      <span className="text-sm">{option.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className={styles.formGroup}>
                <label className={styles.formLabel}>{getDescriptionLabel()}</label>
                <textarea
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  className={styles.formTextarea}
                  rows={3}
                />
              </div>

              <div className={styles.formGroup}>
                <label className={styles.formLabel}>{getStatusLabel()}</label>
                <select
                  value={form.isActive ? 'true' : 'false'}
                  onChange={(e) => setForm({ ...form, isActive: e.target.value === 'true' })}
                  className={styles.formSelect}
                >
                  <option value="true">{t('active')}</option>
                  <option value="false">{t('inactive')}</option>
                </select>
              </div>

              <div className={styles.formActions}>
                <button type="submit" disabled={saving} className={styles.saveButton}>
                  <Save className="w-4 h-4" />
                  {saving ? t('saving') : getSaveText()}
                </button>
                <button type="button" onClick={() => router.push(`/${locale}/erp/accounting/taxes/settings`)} className={styles.cancelButton}>
                  {getCancelText()}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}