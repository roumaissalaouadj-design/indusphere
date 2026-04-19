// src/app/[locale]/(dashboard)/erp/accounting/sales/customers/new/page.tsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { ArrowRight, Users } from 'lucide-react';
import styles from '@/styles/pages/accounting/customers.module.css';

interface FormData {
  code: string;
  name: string;
  taxNumber: string;
  phone: string;
  email: string;
  address: string;
  contactPerson: string;
  paymentTerms: number;
  creditLimit: number;
}

export default function NewCustomerPage() {
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
    contactPerson: '',
    paymentTerms: 30,
    creditLimit: 0,
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);

    try {
      const res = await fetch('/api/accounting/customers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });

      const data = await res.json();

      if (data.success) {
        alert(t('addSuccess'));
        router.push('/erp/accounting/sales/customers');
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
              <Users className="inline-block w-6 h-6 ml-2 text-[#1ABC9C]" />
              {tAccounting('addCustomer')}
            </h1>
            <p className={styles.subtitle}>
              {tAccounting('addCustomerDescription')}
            </p>
          </div>
          <button onClick={() => router.back()} className={styles.cancelButton}>
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
                <label className={styles.formLabel}>{tAccounting('customerCode')} *</label>
                <input
                  type="text"
                  required
                  value={form.code}
                  onChange={(e) => setForm({ ...form, code: e.target.value })}
                  className={styles.formInput}
                  placeholder="CUST-001"
                />
              </div>

              <div className={styles.formGroup}>
                <label className={styles.formLabel}>{tAccounting('customerName')} *</label>
                <input
                  type="text"
                  required
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className={styles.formInput}
                  placeholder="اسم العميل"
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
                  placeholder="customer@example.com"
                />
              </div>

              <div className={styles.formGroup}>
                <label className={styles.formLabel}>{tAccounting('contactPerson')}</label>
                <input
                  type="text"
                  value={form.contactPerson}
                  onChange={(e) => setForm({ ...form, contactPerson: e.target.value })}
                  className={styles.formInput}
                  placeholder="اسم الشخص المسؤول"
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
                <label className={styles.formLabel}>{tAccounting('creditLimit')}</label>
                <input
                  type="number"
                  value={form.creditLimit}
                  onChange={(e) => setForm({ ...form, creditLimit: Number(e.target.value) })}
                  className={styles.formInput}
                  placeholder="0"
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