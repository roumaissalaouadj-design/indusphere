// src/app/[locale]/(dashboard)/cmms/assets/[id]/edit/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations, useLocale } from 'next-intl';
import { ArrowRight, Package, Save } from 'lucide-react';
import styles from '@/styles/pages/assets-edit.module.css';

interface Asset {
  _id: string;
  code: string;
  name: string;
  type: string;
  location: string;
  status: 'active' | 'maintenance' | 'inactive';
  description: string;
}

export default function EditAssetPage({
  params,
}: {
  params: Promise<{ id: string; locale: string }>;
}) {
  const router = useRouter();
  const locale = useLocale();
  const t = useTranslations('Common');
  const tAsset = useTranslations('Asset');
  
  const [form, setForm] = useState<Omit<Asset, '_id'>>({
    code: '',
    name: '',
    type: '',
    location: '',
    status: 'active',
    description: '',
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchAsset();
  }, []);

  const fetchAsset = async () => {
    try {
      const { id } = await params;
      // ✅ التصحيح: إزالة /cmms من المسار
      const res = await fetch(`/api/assets/${id}`);
      const data = await res.json();
      if (data.success) {
        setForm({
          code: data.data.code,
          name: data.data.name,
          type: data.data.type,
          location: data.data.location,
          status: data.data.status,
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
      // ✅ التصحيح: استخدام PUT بدلاً من PATCH (حسب الـ API)
      const res = await fetch(`/api/assets/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });

      const data = await res.json();

      if (data.success) {
        alert(t('editSuccess'));
        router.push(`/${locale}/cmms/assets`);
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
              {tAsset('edit')}
            </h1>
            <p className={styles.subtitle}>
              {tAsset('edit')} - {form.code || ''}
            </p>
          </div>
          <button onClick={() => router.push(`/${locale}/cmms/assets`)} className={styles.cancelButton}>
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
                <label className={styles.formLabel}>{tAsset('code')} *</label>
                <input
                  type="text"
                  required
                  value={form.code}
                  onChange={(e) => setForm({ ...form, code: e.target.value })}
                  className={styles.formInput}
                />
              </div>

              <div className={styles.formGroup}>
                <label className={styles.formLabel}>{tAsset('name')} *</label>
                <input
                  type="text"
                  required
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className={styles.formInput}
                />
              </div>

              <div className={styles.formGroup}>
                <label className={styles.formLabel}>{tAsset('type')} *</label>
                <input
                  type="text"
                  required
                  value={form.type}
                  onChange={(e) => setForm({ ...form, type: e.target.value })}
                  className={styles.formInput}
                />
              </div>

              <div className={styles.formGroup}>
                <label className={styles.formLabel}>{tAsset('location')} *</label>
                <input
                  type="text"
                  required
                  value={form.location}
                  onChange={(e) => setForm({ ...form, location: e.target.value })}
                  className={styles.formInput}
                />
              </div>

              <div className={styles.formGroup}>
                <label className={styles.formLabel}>{tAsset('status')} *</label>
                <select
                  required
                  value={form.status}
                  onChange={(e) => setForm({ ...form, status: e.target.value as Asset['status'] })}
                  className={styles.formSelect}
                >
                  <option value="active">{tAsset('active')}</option>
                  <option value="maintenance">{tAsset('maintenance')}</option>
                  <option value="inactive">{tAsset('inactive')}</option>
                </select>
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
                <button type="button" onClick={() => router.push(`/${locale}/cmms/assets`)} className={styles.cancelButton}>
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