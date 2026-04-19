// src/app/[locale]/(dashboard)/erp/accounting/sales/prices/[id]/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { ArrowRight, Tag } from 'lucide-react';
import styles from '@/styles/pages/accounting/product-prices.module.css';

interface FormData {
  productType: string;
  cementType: string;
  strengthClass: string;
  minQuantity: number;
  maxQuantity: number;
  price: number;
  isActive: boolean;
  effectiveFrom: string;
  effectiveTo: string;
}

const cementTypes = [
  { value: 'CEM_I', label: 'CEM I - أسمنت بورتلاند عادي' },
  { value: 'CEM_II', label: 'CEM II - أسمنت بورتلاند مركب' },
  { value: 'CEM_III', label: 'CEM III - أسمنت بورتلاند مع خبث الأفران' },
  { value: 'CEM_IV', label: 'CEM IV - أسمنت بوزولاني' },
  { value: 'CEM_V', label: 'CEM V - أسمنت مركب' },
];

const strengthClasses = [
  { value: '32.5', label: '32.5 R' },
  { value: '42.5', label: '42.5 R' },
  { value: '52.5', label: '52.5 R' },
];

export default function EditProductPricePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const router = useRouter();
  const t = useTranslations('Common');
  const tAccounting = useTranslations('Accounting');
  
  const [form, setForm] = useState<FormData>({
    productType: 'cement',
    cementType: 'CEM_I',
    strengthClass: '42.5',
    minQuantity: 0,
    maxQuantity: 0,
    price: 0,
    isActive: true,
    effectiveFrom: '',
    effectiveTo: '',
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchPrice();
  }, []);

  const fetchPrice = async () => {
    try {
      const { id } = await params;
      const res = await fetch(`/api/accounting/product-prices/${id}`);
      const data = await res.json();
      if (data.success) {
        setForm({
          productType: data.data.productType,
          cementType: data.data.cementType || 'CEM_I',
          strengthClass: data.data.strengthClass || '42.5',
          minQuantity: data.data.minQuantity,
          maxQuantity: data.data.maxQuantity,
          price: data.data.price,
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);

    if (form.minQuantity >= form.maxQuantity) {
      setError('الحد الأدنى يجب أن يكون أقل من الحد الأقصى');
      setSaving(false);
      return;
    }

    try {
      const { id } = await params;
      const res = await fetch(`/api/accounting/product-prices/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });

      const data = await res.json();

      if (data.success) {
        alert(t('editSuccess'));
        router.push('/erp/accounting/sales/prices');
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
        {/* Header */}
        <div className={styles.header}>
          <div>
            <h1 className={styles.title}>
              <Tag className="inline-block w-6 h-6 ml-2 text-[#1ABC9C]" />
              {tAccounting('editPrice')}
            </h1>
            <p className={styles.subtitle}>
              {tAccounting('editPriceDescription')}
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
                <label className={styles.formLabel}>{tAccounting('productType')} *</label>
                <select
                  required
                  value={form.productType}
                  onChange={(e) => setForm({ ...form, productType: e.target.value })}
                  className={styles.formSelect}
                >
                  <option value="cement">أسمنت</option>
                  <option value="clinker">كلنكر</option>
                </select>
              </div>

              {form.productType === 'cement' && (
                <>
                  <div className={styles.formGroup}>
                    <label className={styles.formLabel}>{tAccounting('cementType')} *</label>
                    <select
                      required
                      value={form.cementType}
                      onChange={(e) => setForm({ ...form, cementType: e.target.value })}
                      className={styles.formSelect}
                    >
                      {cementTypes.map((type) => (
                        <option key={type.value} value={type.value}>{type.label}</option>
                      ))}
                    </select>
                  </div>

                  <div className={styles.formGroup}>
                    <label className={styles.formLabel}>{tAccounting('strengthClass')} *</label>
                    <select
                      required
                      value={form.strengthClass}
                      onChange={(e) => setForm({ ...form, strengthClass: e.target.value })}
                      className={styles.formSelect}
                    >
                      {strengthClasses.map((sc) => (
                        <option key={sc.value} value={sc.value}>{sc.label}</option>
                      ))}
                    </select>
                  </div>
                </>
              )}

              <div className={styles.formGroup}>
                <label className={styles.formLabel}>{tAccounting('minQuantity')} (طن) *</label>
                <input
                  type="number"
                  required
                  value={form.minQuantity}
                  onChange={(e) => setForm({ ...form, minQuantity: Number(e.target.value) })}
                  className={styles.formInput}
                  step="0.1"
                />
              </div>

              <div className={styles.formGroup}>
                <label className={styles.formLabel}>{tAccounting('maxQuantity')} (طن) *</label>
                <input
                  type="number"
                  required
                  value={form.maxQuantity}
                  onChange={(e) => setForm({ ...form, maxQuantity: Number(e.target.value) })}
                  className={styles.formInput}
                  step="0.1"
                />
              </div>

              <div className={styles.formGroup}>
                <label className={styles.formLabel}>{tAccounting('price')} (دج/طن) *</label>
                <input
                  type="number"
                  required
                  value={form.price}
                  onChange={(e) => setForm({ ...form, price: Number(e.target.value) })}
                  className={styles.formInput}
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