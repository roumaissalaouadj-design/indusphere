'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations, useLocale } from 'next-intl';
import styles from '@/styles/pages/production-edit.module.css';

interface ProductionPlan {
  _id: string;
  planCode: string;
  productName: string;
  quantity: number;
  startDate: string;
  endDate: string;
  status: 'planned' | 'in-progress' | 'completed' | 'cancelled';
  notes?: string;
}

export default function EditProductionPlanPage({
  params,
}: {
  params: Promise<{ id: string; locale: string }>;
}) {
  const router = useRouter();
  const locale = useLocale();
  const t = useTranslations('Common');
  const tProd = useTranslations('Production');
  
  const [plan, setPlan] = useState<ProductionPlan | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchPlan();
  }, []);

  const fetchPlan = async () => {
    try {
      const { id } = await params;
      const res = await fetch(`/api/production/${id}`);
      const data = await res.json();
      if (data.success) {
        setPlan(data.data);
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
    if (!plan) return;

    if (!plan.planCode || !plan.productName || !plan.quantity) {
      setError('جميع الحقول المطلوبة يجب تعبئتها');
      return;
    }

    setSaving(true);
    setError(null);

    try {
      const { id } = await params;
      const res = await fetch(`/api/production/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          planCode: plan.planCode,
          productName: plan.productName,
          quantity: plan.quantity,
          startDate: plan.startDate,
          endDate: plan.endDate,
          status: plan.status,
          notes: plan.notes || '',
        }),
      });
      const data = await res.json();
      if (data.success) {
        alert(t('editSuccess'));
        router.push(`/${locale}/erp/production`);
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
          <div className={styles.loadingState}>{t('loading')}</div>
        </div>
      </div>
    );
  }

  if (error || !plan) {
    return (
      <div className={styles.page}>
        <div className={styles.container}>
          <div className={styles.errorState}>{error || t('noData')}</div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <div className={styles.container}>
        <div className={styles.header}>
          <h1 className={styles.title}>تعديل خطة الإنتاج</h1>
          <button onClick={() => router.push(`/${locale}/erp/production`)} className={styles.cancelButton}>
            {t('cancel')}
          </button>
        </div>

        {error && (
          <div className={styles.errorMessage}>
            <p className={styles.errorText}>{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className={styles.formContainer}>
          <div className={styles.formGrid}>
            <div className={styles.formGroup}>
              <label className={styles.formLabel}>{tProd('planCode')} *</label>
              <input
                type="text"
                required
                value={plan.planCode}
                onChange={(e) => setPlan({ ...plan, planCode: e.target.value })}
                className={styles.formInput}
              />
            </div>

            <div className={styles.formGroup}>
              <label className={styles.formLabel}>{tProd('productName')} *</label>
              <input
                type="text"
                required
                value={plan.productName}
                onChange={(e) => setPlan({ ...plan, productName: e.target.value })}
                className={styles.formInput}
              />
            </div>

            <div className={styles.formGroup}>
              <label className={styles.formLabel}>{tProd('quantity')} *</label>
              <input
                type="number"
                required
                value={plan.quantity}
                onChange={(e) => setPlan({ ...plan, quantity: Number(e.target.value) })}
                className={styles.formInput}
              />
            </div>

            <div className={styles.formGroup}>
              <label className={styles.formLabel}>{tProd('startDate')} *</label>
              <input
                type="date"
                required
                value={plan.startDate ? plan.startDate.split('T')[0] : ''}
                onChange={(e) => setPlan({ ...plan, startDate: e.target.value })}
                className={styles.formInput}
              />
            </div>

            <div className={styles.formGroup}>
              <label className={styles.formLabel}>{tProd('endDate')} *</label>
              <input
                type="date"
                required
                value={plan.endDate ? plan.endDate.split('T')[0] : ''}
                onChange={(e) => setPlan({ ...plan, endDate: e.target.value })}
                className={styles.formInput}
              />
            </div>

            <div className={styles.formGroup}>
              <label className={styles.formLabel}>{t('status')} *</label>
              <select
                value={plan.status}
                onChange={(e) => setPlan({ ...plan, status: e.target.value as ProductionPlan['status'] })}
                className={styles.formSelect}
              >
                <option value="planned">{tProd('planned')}</option>
                <option value="in-progress">{tProd('inProgress')}</option>
                <option value="completed">{tProd('completed')}</option>
                <option value="cancelled">{tProd('cancelled')}</option>
              </select>
            </div>

            <div className={styles.formGroup}>
              <label className={styles.formLabel}>{t('notes')}</label>
              <textarea
                value={plan.notes || ''}
                onChange={(e) => setPlan({ ...plan, notes: e.target.value })}
                rows={3}
                className={styles.formTextarea}
              />
            </div>

            <div className={styles.formActions}>
              <button type="submit" disabled={saving} className={styles.saveButton}>
                {saving ? t('saving') : t('save')}
              </button>
              <button type="button" onClick={() => router.push(`/${locale}/erp/production`)} className={styles.cancelButton}>
                {t('cancel')}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}