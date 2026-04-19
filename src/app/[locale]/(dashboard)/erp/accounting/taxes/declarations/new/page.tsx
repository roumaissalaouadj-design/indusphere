// src/app/[locale]/(dashboard)/erp/accounting/taxes/declarations/new/page.tsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { ArrowRight, FileText } from 'lucide-react';
import styles from '@/styles/pages/accounting/taxes.module.css';

interface FormData {
  declarationNumber: string;
  taxType: string;
  period: string;
  startDate: string;
  endDate: string;
  dueDate: string;
  notes: string;
}

const taxTypes = [
  { value: 'TVA', label: 'TVA (ضريبة القيمة المضافة)' },
  { value: 'IRG', label: 'IRG (ضريبة الدخل)' },
  { value: 'IBS', label: 'IBS (ضريبة الأرباح)' },
];

export default function NewTaxDeclarationPage() {
  const router = useRouter();
  const t = useTranslations('Common');
  const tAccounting = useTranslations('Accounting');
  
  const [form, setForm] = useState<FormData>({
    declarationNumber: `DEC-${Date.now()}`,
    taxType: 'TVA',
    period: '',
    startDate: '',
    endDate: '',
    dueDate: '',
    notes: '',
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);

    try {
      const res = await fetch('/api/accounting/taxes/declarations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });

      const data = await res.json();

      if (data.success) {
        alert(t('addSuccess'));
        router.push('/erp/accounting/taxes/declarations');
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
              <FileText className="inline-block w-6 h-6 ml-2 text-[#1ABC9C]" />
              {tAccounting('addDeclaration')}
            </h1>
            <p className={styles.subtitle}>
              {tAccounting('addDeclarationDescription')}
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
                <label className={styles.formLabel}>{tAccounting('declarationNumber')} *</label>
                <input
                  type="text"
                  required
                  value={form.declarationNumber}
                  onChange={(e) => setForm({ ...form, declarationNumber: e.target.value })}
                  className={styles.formInput}
                />
              </div>

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
                <label className={styles.formLabel}>{tAccounting('period')} *</label>
                <input
                  type="text"
                  required
                  value={form.period}
                  onChange={(e) => setForm({ ...form, period: e.target.value })}
                  placeholder="مثال: 2024-01"
                  className={styles.formInput}
                />
              </div>

              <div className={styles.formGroup}>
                <label className={styles.formLabel}>{tAccounting('startDate')} *</label>
                <input
                  type="date"
                  required
                  value={form.startDate}
                  onChange={(e) => setForm({ ...form, startDate: e.target.value })}
                  className={styles.formInput}
                />
              </div>

              <div className={styles.formGroup}>
                <label className={styles.formLabel}>{tAccounting('endDate')} *</label>
                <input
                  type="date"
                  required
                  value={form.endDate}
                  onChange={(e) => setForm({ ...form, endDate: e.target.value })}
                  className={styles.formInput}
                />
              </div>

              <div className={styles.formGroup}>
                <label className={styles.formLabel}>{tAccounting('dueDate')} *</label>
                <input
                  type="date"
                  required
                  value={form.dueDate}
                  onChange={(e) => setForm({ ...form, dueDate: e.target.value })}
                  className={styles.formInput}
                />
              </div>

              <div className={styles.formGroup}>
                <label className={styles.formLabel}>{tAccounting('notes')}</label>
                <textarea
                  value={form.notes}
                  onChange={(e) => setForm({ ...form, notes: e.target.value })}
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