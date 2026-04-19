// src/app/[locale]/(dashboard)/cmms/spare-parts/[id]/edit/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations, useLocale } from 'next-intl';
import { ArrowRight, Package, Save } from 'lucide-react';
import styles from '@/styles/pages/spare-parts-edit.module.css';

interface SparePart {
  _id: string;
  partCode: string;
  name: string;
  category: string;
  quantity: number;
  minStock: number;      // ✅ تغيير من minQuantity إلى minStock
  unit: string;
  location: string;
  description: string;
}

export default function EditSparePartPage({
  params,
}: {
  params: Promise<{ id: string; locale: string }>;
}) {
  const router = useRouter();
  const locale = useLocale();
  const t = useTranslations('Common');
  const tSpare = useTranslations('SparePart');
  
  const [form, setForm] = useState<Omit<SparePart, '_id'>>({
    partCode: '',
    name: '',
    category: '',
    quantity: 0,
    minStock: 0,          // ✅ تغيير من minQuantity إلى minStock
    unit: 'قطعة',
    location: '',
    description: '',
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchSparePart();
  }, []);

  const fetchSparePart = async () => {
    try {
      const { id } = await params;
      const res = await fetch(`/api/spare-parts/${id}`);
      const data = await res.json();
      if (data.success) {
        setForm({
          partCode: data.data.partCode,
          name: data.data.name,
          category: data.data.category || '',
          quantity: data.data.quantity,
          minStock: data.data.minStock,      // ✅ minStock
          unit: data.data.unit || 'قطعة',
          location: data.data.location || '',
          description: data.data.description || '',
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

    const submitData = {
      partCode: form.partCode,
      name: form.name,
      category: form.category,
      quantity: form.quantity,
      minStock: form.minStock,      // ✅ minStock
      unit: form.unit,
      location: form.location,
      description: form.description,
    };

    try {
      const { id } = await params;
      const res = await fetch(`/api/spare-parts/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(submitData),
      });

      const data = await res.json();

      if (data.success) {
        alert(t('editSuccess'));
        router.push(`/${locale}/cmms/spare-parts`);
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
              <Package className={styles.titleIcon} />
              {tSpare('edit')}
            </h1>
            <p className={styles.subtitle}>
              {tSpare('edit')} - {form.partCode || ''}
            </p>
          </div>
          <button onClick={() => router.push(`/${locale}/cmms/spare-parts`)} className={styles.cancelButton}>
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
                <label className={styles.formLabel}>{tSpare('code')} *</label>
                <input
                  type="text"
                  required
                  value={form.partCode}
                  onChange={(e) => setForm({ ...form, partCode: e.target.value })}
                  className={styles.formInput}
                />
              </div>

              <div className={styles.formGroup}>
                <label className={styles.formLabel}>{tSpare('name')} *</label>
                <input
                  type="text"
                  required
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className={styles.formInput}
                />
              </div>

              <div className={styles.formGroup}>
                <label className={styles.formLabel}>{tSpare('category')} *</label>
                <input
                  type="text"
                  required
                  value={form.category}
                  onChange={(e) => setForm({ ...form, category: e.target.value })}
                  className={styles.formInput}
                />
              </div>

              <div className={styles.formGroup}>
                <label className={styles.formLabel}>{tSpare('quantity')} *</label>
                <input
                  type="number"
                  required
                  value={form.quantity}
                  onChange={(e) => setForm({ ...form, quantity: Number(e.target.value) })}
                  className={styles.formInput}
                  min="0"
                />
              </div>

              <div className={styles.formGroup}>
                <label className={styles.formLabel}>{tSpare('minQuantity')} *</label>
                <input
                  type="number"
                  required
                  value={form.minStock}
                  onChange={(e) => setForm({ ...form, minStock: Number(e.target.value) })}
                  className={styles.formInput}
                  min="0"
                />
              </div>

              <div className={styles.formGroup}>
                <label className={styles.formLabel}>{tSpare('unit')} *</label>
                <input
                  type="text"
                  required
                  value={form.unit}
                  onChange={(e) => setForm({ ...form, unit: e.target.value })}
                  className={styles.formInput}
                />
              </div>

              <div className={styles.formGroup}>
                <label className={styles.formLabel}>{tSpare('location')} *</label>
                <input
                  type="text"
                  required
                  value={form.location}
                  onChange={(e) => setForm({ ...form, location: e.target.value })}
                  className={styles.formInput}
                />
              </div>

              <div className={styles.formGroup}>
                <label className={styles.formLabel}>{t('description')}</label>
                <textarea
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  className={styles.formTextarea}
                  rows={3}
                />
              </div>

              <div className={styles.formActions}>
                <button type="submit" disabled={saving} className={styles.saveButton}>
                  <Save className="w-4 h-4" />
                  {saving ? t('saving') : t('save')}
                </button>
                <button type="button" onClick={() => router.push(`/${locale}/cmms/spare-parts`)} className={styles.cancelButton}>
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