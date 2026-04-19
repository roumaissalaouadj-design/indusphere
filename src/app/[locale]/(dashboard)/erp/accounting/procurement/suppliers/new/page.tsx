// src/app/[locale]/(dashboard)/erp/accounting/procurement/suppliers/new/page.tsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { ArrowRight, Building2 } from 'lucide-react';
import styles from '@/styles/pages/accounting/suppliers.module.css';

interface FormData {
  code: string;
  name: string;
  taxNumber: string;
  phone: string;
  email: string;
  address: string;
  bankAccount: string;
  category: 'raw_material' | 'service' | 'equipment';
  paymentTerms: number;
}

export default function NewSupplierPage() {
  const router = useRouter();
  const t = useTranslations('Common');
  const tAccounting = useTranslations('Accounting');
  
  const [form, setForm] = useState<FormData>({
    code: '',
    name: '',
    taxNumber: '',
    phone: '',
    email: '',
    address: '',
    bankAccount: '',
    category: 'raw_material',
    paymentTerms: 30,
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);

    try {
      const res = await fetch('/api/accounting/suppliers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });

      const data = await res.json();

      if (data.success) {
        alert(t('addSuccess'));
        router.push('/erp/accounting/procurement/suppliers');
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
        {/* Header */}
        <div className={styles.header}>
          <div>
            <h1 className={styles.title}>
              <Building2 className="inline-block w-6 h-6 ml-2 text-[#1ABC9C]" />
              {tAccounting('addSupplier')}
            </h1>
            <p className={styles.subtitle}>
              {tAccounting('addSupplierDescription')}
            </p>
          </div>
          <button
            onClick={() => router.back()}
            className={styles.cancelButton}
          >
            <ArrowRight className="w-4 h-4 ml-1" />
            {t('cancel')}
          </button>
        </div>

        {/* Error Message */}
        {error && (
          <div className={styles.errorMessage}>
            <p className={styles.errorText}>{error}</p>
          </div>
        )}

        {/* Form */}
        <div className={styles.formContainer}>
          <form onSubmit={handleSubmit}>
            <div className={styles.formGrid}>
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>{tAccounting('supplierCode')} *</label>
                <input
                  type="text"
                  required
                  value={form.code}
                  onChange={(e) => setForm({ ...form, code: e.target.value })}
                  className={styles.formInput}
                  placeholder="SP-001"
                />
              </div>

              <div className={styles.formGroup}>
                <label className={styles.formLabel}>{tAccounting('supplierName')} *</label>
                <input
                  type="text"
                  required
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className={styles.formInput}
                  placeholder="اسم المورد"
                />
              </div>

              <div className={styles.formGroup}>
                <label className={styles.formLabel}>{tAccounting('taxNumber')} *</label>
                <input
                  type="text"
                  required
                  value={form.taxNumber}
                  onChange={(e) => setForm({ ...form, taxNumber: e.target.value })}
                  className={styles.formInput}
                  placeholder="12345678"
                />
              </div>

              <div className={styles.formGroup}>
                <label className={styles.formLabel}>{tAccounting('category')} *</label>
                <select
                  required
                  value={form.category}
                  onChange={(e) => setForm({ ...form, category: e.target.value as 'raw_material' | 'service' | 'equipment' })}
                  className={styles.formSelect}
                >
                  <option value="raw_material">مواد خام</option>
                  <option value="service">خدمات</option>
                  <option value="equipment">تجهيزات</option>
                </select>
              </div>

              <div className={styles.formGroup}>
                <label className={styles.formLabel}>{t('phone')} *</label>
                <input
                  type="tel"
                  required
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  className={styles.formInput}
                  placeholder="05XXXXXXXX"
                />
              </div>

              <div className={styles.formGroup}>
                <label className={styles.formLabel}>{t('email')} *</label>
                <input
                  type="email"
                  required
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className={styles.formInput}
                  placeholder="supplier@example.com"
                />
              </div>

              <div className={styles.formGroup}>
                <label className={styles.formLabel}>{tAccounting('bankAccount')} *</label>
                <input
                  type="text"
                  required
                  value={form.bankAccount}
                  onChange={(e) => setForm({ ...form, bankAccount: e.target.value })}
                  className={styles.formInput}
                  placeholder="1234 5678 9012 3456"
                />
              </div>

              <div className={styles.formGroup}>
                <label className={styles.formLabel}>{tAccounting('paymentTerms')}</label>
                <input
                  type="number"
                  value={form.paymentTerms}
                  onChange={(e) => setForm({ ...form, paymentTerms: Number(e.target.value) })}
                  className={styles.formInput}
                  placeholder="30"
                />
              </div>

              <div className={styles.formGroup}>
                <label className={styles.formLabel}>{t('address')} *</label>
                <input
                  type="text"
                  required
                  value={form.address}
                  onChange={(e) => setForm({ ...form, address: e.target.value })}
                  className={styles.formInput}
                  placeholder="العنوان الكامل"
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