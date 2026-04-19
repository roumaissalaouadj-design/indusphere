'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations, useLocale } from 'next-intl';
import TableActions from '@/components/TableActions';
import styles from '@/styles/pages/production.module.css';

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

const getStatusClass = (status: string): string => {
  switch (status) {
    case 'planned': return styles.statusPlanned;
    case 'in-progress': return styles.statusInProgress;
    case 'completed': return styles.statusCompleted;
    case 'cancelled': return styles.statusCancelled;
    default: return '';
  }
};

const getStatusLabel = (status: string): string => {
  switch (status) {
    case 'planned': return 'مخطط';
    case 'in-progress': return 'قيد التنفيذ';
    case 'completed': return 'مكتمل';
    case 'cancelled': return 'ملغي';
    default: return status;
  }
};

export default function ProductionPage() {
  const router = useRouter();
  const locale = useLocale();
  const t = useTranslations('Common');
  const tProd = useTranslations('Production');
  
  const [plans, setPlans] = useState<ProductionPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    planCode: '',
    productName: '',
    quantity: 0,
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0],
    status: 'planned' as 'planned' | 'in-progress' | 'completed' | 'cancelled',
    notes: '',
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchPlans();
  }, []);

  const fetchPlans = async () => {
    try {
      const res = await fetch('/api/production');
      const data = await res.json();
      if (data.success) {
        setPlans(data.data);
      } else {
        setError(data.message);
      }
    } catch {
      setError(t('fetchError'));
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm(t('deleteConfirm'))) return;
    
    const res = await fetch(`/api/production/${id}`, { method: 'DELETE' });
    const data = await res.json();
    if (data.success) {
      await fetchPlans();
      alert(t('deleteSuccess'));
    } else {
      alert(data.message || t('deleteFailed'));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch('/api/production', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (data.success) {
        await fetchPlans();
        setShowForm(false);
        setForm({
          planCode: '',
          productName: '',
          quantity: 0,
          startDate: new Date().toISOString().split('T')[0],
          endDate: new Date().toISOString().split('T')[0],
          status: 'planned',
          notes: '',
        });
        alert(t('addSuccess'));
      } else {
        alert(data.message);
      }
    } catch {
      alert(t('error'));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className={styles.page} dir="rtl">
      <div className={styles.container}>
        
        {/* Header */}
        <div className={styles.header}>
          <div>
            <h1 className={styles.title}>{tProd('title')}</h1>
            <p className={styles.subtitle}>{tProd('title')}</p>
          </div>
          <button onClick={() => setShowForm(!showForm)} className={styles.addButton}>
            + {tProd('new')}
          </button>
        </div>

        {/* Error Message */}
        {error && (
          <div className={styles.errorMessage}>
            <p className={styles.errorText}>{error}</p>
          </div>
        )}

        {/* Add Form */}
        {showForm && (
          <div className={styles.formContainer}>
            <h2 className={styles.formTitle}>{tProd('new')}</h2>
            <form onSubmit={handleSubmit} className={styles.formGrid}>
              <div>
                <label className={styles.formLabel}>{tProd('planCode')} *</label>
                <input
                  required
                  value={form.planCode}
                  onChange={(e) => setForm({ ...form, planCode: e.target.value })}
                  className={styles.formInput}
                />
              </div>
              <div>
                <label className={styles.formLabel}>{tProd('productName')} *</label>
                <input
                  required
                  value={form.productName}
                  onChange={(e) => setForm({ ...form, productName: e.target.value })}
                  className={styles.formInput}
                />
              </div>
              <div>
                <label className={styles.formLabel}>{tProd('quantity')} *</label>
                <input
                  type="number"
                  required
                  value={form.quantity}
                  onChange={(e) => setForm({ ...form, quantity: Number(e.target.value) })}
                  className={styles.formInput}
                />
              </div>
              <div>
                <label className={styles.formLabel}>{tProd('startDate')} *</label>
                <input
                  type="date"
                  required
                  value={form.startDate}
                  onChange={(e) => setForm({ ...form, startDate: e.target.value })}
                  className={styles.formInput}
                />
              </div>
              <div>
                <label className={styles.formLabel}>{tProd('endDate')} *</label>
                <input
                  type="date"
                  required
                  value={form.endDate}
                  onChange={(e) => setForm({ ...form, endDate: e.target.value })}
                  className={styles.formInput}
                />
              </div>
              <div>
                <label className={styles.formLabel}>{t('status')} *</label>
                <select
                  value={form.status}
                  onChange={(e) => setForm({ ...form, status: e.target.value as 'planned' | 'in-progress' | 'completed' | 'cancelled' })}
                  className={styles.formSelect}
                >
                  <option value="planned">{tProd('planned')}</option>
                  <option value="in-progress">{tProd('inProgress')}</option>
                  <option value="completed">{tProd('completed')}</option>
                  <option value="cancelled">{tProd('cancelled')}</option>
                </select>
              </div>
              <div className={styles.formFieldFull}>
                <label className={styles.formLabel}>{t('notes')}</label>
                <textarea
                  value={form.notes}
                  onChange={(e) => setForm({ ...form, notes: e.target.value })}
                  rows={2}
                  className={styles.formTextarea}
                />
              </div>
              <div className={styles.formActions}>
                <button type="submit" disabled={saving} className={styles.saveButton}>
                  {saving ? t('saving') : t('save')}
                </button>
                <button type="button" onClick={() => setShowForm(false)} className={styles.cancelButton}>
                  {t('cancel')}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Table */}
        <div className={styles.tableContainer}>
          <table className={styles.table}>
            <thead>
              <tr className={styles.tableHeader}>
                <th className={styles.tableHeaderCell}>{tProd('planCode')}</th>
                <th className={styles.tableHeaderCell}>{tProd('productName')}</th>
                <th className={styles.tableHeaderCell}>{tProd('quantity')}</th>
                <th className={styles.tableHeaderCell}>{tProd('startDate')}</th>
                <th className={styles.tableHeaderCell}>{tProd('endDate')}</th>
                <th className={styles.tableHeaderCell}>{t('status')}</th>
                <th className={styles.tableHeaderCell}>{t('actions')}</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={7} className={styles.loadingState}>{t('loading')}</td>
                </tr>
              ) : plans.length === 0 ? (
                <tr>
                  <td colSpan={7} className={styles.emptyState}>{t('noData')}</td>
                </tr>
              ) : (
                plans.map((plan) => (
                  <tr key={plan._id} className={styles.tableRow}>
                    <td className={`${styles.tableCell} ${styles.cellCode}`}>{plan.planCode}</td>
                    <td className={`${styles.tableCell} ${styles.cellName}`}>{plan.productName}</td>
                    <td className={styles.cellText}>{plan.quantity}</td>
                    <td className={styles.cellText}>{new Date(plan.startDate).toLocaleDateString('ar')}</td>
                    <td className={styles.cellText}>{new Date(plan.endDate).toLocaleDateString('ar')}</td>
                    <td className={styles.tableCell}>
                      <span className={`${styles.badge} ${getStatusClass(plan.status)}`}>
                        {getStatusLabel(plan.status)}
                      </span>
                    </td>
                    <td className={styles.actionsCell}>
                      <TableActions
                        id={plan._id}
                        editUrl={`/${locale}/erp/production/${plan._id}/edit`}
                        onDelete={() => handleDelete(plan._id)}
                      />
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

      </div>
    </div>
  );
}