// src/app/[locale]/(dashboard)/erp/accounting/taxes/settings/new/page.tsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { ArrowRight, Settings } from 'lucide-react';
import styles from '@/styles/pages/accounting/taxes.module.css';

interface FormData {
  taxType: string;
  code: string;
  name: string;
  rate: number;
  description: string;
  appliesTo: string[];
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

export default function NewTaxSettingPage() {
  const router = useRouter();
  const t = useTranslations('Common');
  const tAccounting = useTranslations('Accounting');
  
  const [form, setForm] = useState<FormData>({
    taxType: 'TVA',
    code: '',
    name: '',
    rate: 0,
    description: '',
    appliesTo: ['purchase', 'sale'],
    effectiveFrom: new Date().toISOString().split('T')[0],
    effectiveTo: '',
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
      const res = await fetch('/api/accounting/taxes/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });

      const data = await res.json();

      if (data.success) {
        alert(t('addSuccess'));
        router.push('/erp/accounting/taxes/settings');
      } else {
        setError(data.message);
      }
    } catch {
      setError(t('error'));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className={styles.page}>
      <div className={styles.container}>
        <div className={styles.header}>
          <div>
            <h1 className={styles.title}>
              <Settings className="inline-block w-6 h-6 ml-2 text-[#1ABC9C]" />
              {tAccounting('addTaxSetting')}
            </h1>
            <p className={styles.subtitle}>
              {tAccounting('addTaxSettingDescription')}
            </p>
          </div>
          <button onClick={() => router.back()} className={styles.cancelButton}>
            <ArrowRight className="w-4 h-4 ml-1" />
            {t('cancel')}
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
                <label className={styles.formLabel}>{tAccounting('taxType')} *</label>
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
                <label className={styles.formLabel}>{tAccounting('code')} *</label>
                <input
                  type="text"
                  required
                  value={form.code}
                  onChange={(e) => setForm({ ...form, code: e.target.value })}
                  className={styles.formInput}
                  placeholder="TVA-001"
                />
              </div>

              <div className={styles.formGroup}>
                <label className={styles.formLabel}>{tAccounting('name')} *</label>
                <input
                  type="text"
                  required
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className={styles.formInput}
                  placeholder="اسم الضريبة"
                />
              </div>

              <div className={styles.formGroup}>
                <label className={styles.formLabel}>{tAccounting('rate')} (%) *</label>
                <input
                  type="number"
                  required
                  value={form.rate || ''}
                  onChange={(e) => setForm({ ...form, rate: Number(e.target.value) })}
                  className={styles.formInput}
                  step="0.1"
                />
              </div>

              <div className={styles.formGroup}>
                <label className={styles.formLabel}>{tAccounting('effectiveFrom')} *</label>
                <input
                  type="date"
                  required
                  value={form.effectiveFrom}
                  onChange={(e) => setForm({ ...form, effectiveFrom: e.target.value })}
                  className={styles.formInput}
                />
              </div>

              <div className={styles.formGroup}>
                <label className={styles.formLabel}>{tAccounting('effectiveTo')}</label>
                <input
                  type="date"
                  value={form.effectiveTo}
                  onChange={(e) => setForm({ ...form, effectiveTo: e.target.value })}
                  className={styles.formInput}
                />
              </div>

              <div className={styles.formGroup}>
                <label className={styles.formLabel}>{tAccounting('appliesTo')}</label>
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
                <label className={styles.formLabel}>{tAccounting('description')}</label>
                <textarea
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  className={styles.formInput}
                  rows={3}
                />
              </div>

              <div className={styles.formActions}>
                <button type="submit" disabled={saving} className={styles.saveButton}>
                  {saving ? t('saving') : t('save')}
                </button>
                <button type="button" onClick={() => router.back()} className={styles.cancelButton}>
                  {t('cancel')}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}