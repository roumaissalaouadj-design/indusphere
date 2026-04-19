// src/app/[locale]/(dashboard)/erp/accounting/sales/customers/[id]/edit/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations, useLocale } from 'next-intl';
import { ArrowRight, Users, Save } from 'lucide-react';
import styles from '@/styles/pages/accounting/customers.module.css';

interface Customer {
  _id: string;
  code: string;
  name: string;
  taxNumber: string;
  phone: string;
  email: string;
  address: string;
  contactPerson: string;
  paymentTerms: number;
  creditLimit: number;
  isActive: boolean;
  notes: string;
}

export default function EditCustomerPage({
  params,
}: {
  params: Promise<{ id: string; locale: string }>;
}) {
  const router = useRouter();
  const locale = useLocale();
  const t = useTranslations('Common');
  const tAccounting = useTranslations('Accounting');
  
  const [form, setForm] = useState<Omit<Customer, '_id'>>({
    code: '',
    name: '',
    taxNumber: '',
    phone: '',
    email: '',
    address: '',
    contactPerson: '',
    paymentTerms: 30,
    creditLimit: 0,
    isActive: true,
    notes: '',
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchCustomer();
  }, []);

  const fetchCustomer = async () => {
    try {
      const { id } = await params;
      const res = await fetch(`/api/accounting/customers/${id}`);
      const data = await res.json();
      if (data.success) {
        setForm({
          code: data.data.code,
          name: data.data.name,
          taxNumber: data.data.taxNumber,
          phone: data.data.phone,
          email: data.data.email,
          address: data.data.address,
          contactPerson: data.data.contactPerson || '',
          paymentTerms: data.data.paymentTerms,
          creditLimit: data.data.creditLimit,
          isActive: data.data.isActive,
          notes: data.data.notes || '',
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);

    try {
      const { id } = await params;
      const res = await fetch(`/api/accounting/customers/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });

      const data = await res.json();

      if (data.success) {
        alert(t('editSuccess'));
        router.push(`/${locale}/erp/accounting/sales/customers`);
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
              <Users className="inline-block w-6 h-6 ml-2 text-[#1ABC9C]" />
              {tAccounting('editCustomer')}
            </h1>
            <p className={styles.subtitle}>
              {tAccounting('editCustomerDescription')}
            </p>
          </div>
          <button onClick={() => router.push(`/${locale}/erp/accounting/sales/customers`)} className={styles.cancelButton}>
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
                <label className={styles.formLabel}>{tAccounting('customerCode')} *</label>
                <input
                  type="text"
                  required
                  value={form.code}
                  onChange={(e) => setForm({ ...form, code: e.target.value })}
                  className={styles.formInput}
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
                />
              </div>

              <div className={styles.formGroup}>
                <label className={styles.formLabel}>{tAccounting('contactPerson')}</label>
                <input
                  type="text"
                  value={form.contactPerson}
                  onChange={(e) => setForm({ ...form, contactPerson: e.target.value })}
                  className={styles.formInput}
                />
              </div>

              <div className={styles.formGroup}>
                <label className={styles.formLabel}>{tAccounting('paymentTerms')}</label>
                <input
                  type="number"
                  value={form.paymentTerms}
                  onChange={(e) => setForm({ ...form, paymentTerms: Number(e.target.value) })}
                  className={styles.formInput}
                />
              </div>

              <div className={styles.formGroup}>
                <label className={styles.formLabel}>{tAccounting('creditLimit')}</label>
                <input
                  type="number"
                  value={form.creditLimit}
                  onChange={(e) => setForm({ ...form, creditLimit: Number(e.target.value) })}
                  className={styles.formInput}
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
                />
              </div>

              <div className={styles.formGroup}>
                <label className={styles.formLabel}>{t('status')}</label>
                <select
                  value={form.isActive ? 'true' : 'false'}
                  onChange={(e) => setForm({ ...form, isActive: e.target.value === 'true' })}
                  className={styles.formSelect}
                >
                  <option value="true">{t('active')}</option>
                  <option value="false">{t('inactive')}</option>
                </select>
              </div>

              <div className={styles.formGroup}>
                <label className={styles.formLabel}>{t('notes')}</label>
                <textarea
                  value={form.notes}
                  onChange={(e) => setForm({ ...form, notes: e.target.value })}
                  className={styles.formTextarea}
                  rows={3}
                />
              </div>

              <div className={styles.formActions}>
                <button type="submit" disabled={saving} className={styles.saveButton}>
                  <Save className="w-4 h-4" />
                  {saving ? t('saving') : t('save')}
                </button>
                <button type="button" onClick={() => router.push(`/${locale}/erp/accounting/sales/customers`)} className={styles.cancelButton}>
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