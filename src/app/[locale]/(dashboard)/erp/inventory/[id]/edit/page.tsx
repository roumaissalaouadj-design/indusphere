// src/app/[locale]/(dashboard)/erp/inventory/[id]/edit/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations, useLocale } from 'next-intl';
import { ArrowRight, Package, Save } from 'lucide-react';
import styles from '@/styles/pages/inventory-edit.module.css';

interface InventoryItem {
  _id: string;
  itemCode: string;
  name: string;
  category: string;
  quantity: number;
  minStock: number;
  unit: string;
  location: string;
  description: string;
}

export default function EditInventoryPage({
  params,
}: {
  params: Promise<{ id: string; locale: string }>;
}) {
  const router = useRouter();
  const locale = useLocale();
  const t = useTranslations('Common');
  
  const getTitle = () => {
    if (locale === 'ar') return 'تعديل عنصر المخزون';
    if (locale === 'fr') return 'Modifier l\'article de stock';
    return 'Edit Inventory Item';
  };

  const getDescription = () => {
    if (locale === 'ar') return 'تعديل بيانات عنصر المخزون';
    if (locale === 'fr') return 'Modifier les données de l\'article de stock';
    return 'Edit inventory item data';
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

  const [form, setForm] = useState<Omit<InventoryItem, '_id'>>({
    itemCode: '',
    name: '',
    category: '',
    quantity: 0,
    minStock: 0,
    unit: 'قطعة',
    location: '',
    description: '',
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchItem();
  }, []);

  const fetchItem = async () => {
    try {
      const { id } = await params;
      const res = await fetch(`/api/inventory/${id}`);
      const data = await res.json();
      if (data.success) {
        setForm({
          itemCode: data.data.itemCode,
          name: data.data.name,
          category: data.data.category || '',
          quantity: data.data.quantity,
          minStock: data.data.minStock,
          unit: data.data.unit,
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

    try {
      const { id } = await params;
      const submitData = {
        itemCode: form.itemCode,
        name: form.name,
        category: form.category,
        quantity: form.quantity,
        minStock: form.minStock,
        unit: form.unit,
        location: form.location,
        description: form.description,
      };
      
      const res = await fetch(`/api/inventory/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(submitData),
      });

      const data = await res.json();

      if (data.success) {
        alert(t('editSuccess'));
        router.push(`/${locale}/erp/inventory`);
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
              {getTitle()}
            </h1>
            <p className={styles.subtitle}>
              {getDescription()}
            </p>
          </div>
          <button onClick={() => router.push(`/${locale}/erp/inventory`)} className={styles.cancelButton}>
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
                <label className={styles.formLabel}>رمز العنصر *</label>
                <input
                  type="text"
                  required
                  value={form.itemCode}
                  onChange={(e) => setForm({ ...form, itemCode: e.target.value })}
                  className={styles.formInput}
                />
              </div>

              <div className={styles.formGroup}>
                <label className={styles.formLabel}>الاسم *</label>
                <input
                  type="text"
                  required
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className={styles.formInput}
                />
              </div>

              <div className={styles.formGroup}>
                <label className={styles.formLabel}>الفئة *</label>
                <input
                  type="text"
                  required
                  value={form.category}
                  onChange={(e) => setForm({ ...form, category: e.target.value })}
                  className={styles.formInput}
                />
              </div>

              <div className={styles.formGroup}>
                <label className={styles.formLabel}>الكمية *</label>
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
                <label className={styles.formLabel}>الحد الأدنى *</label>
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
                <label className={styles.formLabel}>الوحدة *</label>
                <input
                  type="text"
                  required
                  value={form.unit}
                  onChange={(e) => setForm({ ...form, unit: e.target.value })}
                  className={styles.formInput}
                />
              </div>

              <div className={styles.formGroup}>
                <label className={styles.formLabel}>الموقع *</label>
                <input
                  type="text"
                  required
                  value={form.location}
                  onChange={(e) => setForm({ ...form, location: e.target.value })}
                  className={styles.formInput}
                />
              </div>

              <div className={styles.formGroup}>
                <label className={styles.formLabel}>الوصف</label>
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
                  {saving ? t('saving') : getSaveText()}
                </button>
                <button type="button" onClick={() => router.push(`/${locale}/erp/inventory`)} className={styles.cancelButton}>
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