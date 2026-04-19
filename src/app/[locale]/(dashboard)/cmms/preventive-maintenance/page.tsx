'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations, useLocale } from 'next-intl';
import TableActions from '@/components/TableActions';
import styles from '@/styles/pages/preventive-maintenance.module.css';

interface PreventiveTask {
  _id: string;
  taskCode: string;
  title: string;
  description?: string;
  frequency: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly';
  nextDueDate: string;
  status: 'active' | 'inactive' | 'overdue';
  assetId: { name: string; assetCode: string } | null;
}

const getFrequencyClass = (frequency: string): string => {
  switch (frequency) {
    case 'daily': return styles.frequencyDaily;
    case 'weekly': return styles.frequencyWeekly;
    case 'monthly': return styles.frequencyMonthly;
    case 'quarterly': return styles.frequencyQuarterly;
    case 'yearly': return styles.frequencyYearly;
    default: return '';
  }
};

const getFrequencyLabel = (frequency: string): string => {
  switch (frequency) {
    case 'daily': return 'يومي';
    case 'weekly': return 'أسبوعي';
    case 'monthly': return 'شهري';
    case 'quarterly': return 'ربع سنوي';
    case 'yearly': return 'سنوي';
    default: return frequency;
  }
};

const getStatusClass = (status: string): string => {
  switch (status) {
    case 'active': return styles.statusActive;
    case 'inactive': return styles.statusInactive;
    case 'overdue': return styles.statusOverdue;
    default: return '';
  }
};

const getStatusLabel = (status: string): string => {
  switch (status) {
    case 'active': return 'نشط';
    case 'inactive': return 'غير نشط';
    case 'overdue': return 'متأخر';
    default: return status;
  }
};

export default function PreventiveMaintenancePage() {
  const router = useRouter();
  const locale = useLocale();  // ✅ أضف هذا السطر
  const t = useTranslations('Common');
  const tPm = useTranslations('PreventiveMaintenance');
  
  const [tasks, setTasks] = useState<PreventiveTask[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [assets, setAssets] = useState<{ _id: string; name: string; assetCode: string }[]>([]);
  const [form, setForm] = useState({
    title: '',
    description: '',
    assetId: '',
    frequency: 'monthly',
    taskCode: '',
    nextDueDate: '',
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchTasks();
    fetchAssets();
  }, []);

  const fetchTasks = async () => {
    try {
      const res = await fetch('/api/preventive-maintenance');
      const data = await res.json();
      if (data.success) {
        setTasks(data.data);
      } else {
        setError(data.message);
      }
    } catch {
      setError(t('fetchError'));
    } finally {
      setLoading(false);
    }
  };

  const fetchAssets = async () => {
    try {
      const res = await fetch('/api/assets');
      const data = await res.json();
      if (data.success) {
        setAssets(data.data);
      }
    } catch {
      console.error('Fetch assets error:');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm(t('deleteConfirm'))) return;
    
    const res = await fetch(`/api/preventive-maintenance/${id}`, { method: 'DELETE' });
    const data = await res.json();
    if (data.success) {
      await fetchTasks();
      alert(t('deleteSuccess'));
    } else {
      alert(data.message || t('deleteFailed'));
    }
  };

  const calculateNextDueDate = (frequency: string): string => {
    const today = new Date();
    switch (frequency) {
      case 'daily': today.setDate(today.getDate() + 1); break;
      case 'weekly': today.setDate(today.getDate() + 7); break;
      case 'monthly': today.setMonth(today.getMonth() + 1); break;
      case 'quarterly': today.setMonth(today.getMonth() + 3); break;
      case 'yearly': today.setFullYear(today.getFullYear() + 1); break;
      default: today.setMonth(today.getMonth() + 1);
    }
    return today.toISOString().split('T')[0];
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const submitData = {
        ...form,
        taskCode: form.taskCode || `PM-${Date.now()}`,
        nextDueDate: form.nextDueDate || calculateNextDueDate(form.frequency),
      };
      const res = await fetch('/api/preventive-maintenance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(submitData),
      });
      const data = await res.json();
      if (data.success) {
        await fetchTasks();
        setShowForm(false);
        setForm({
          title: '',
          description: '',
          assetId: '',
          frequency: 'monthly',
          taskCode: '',
          nextDueDate: '',
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

  const isOverdue = (nextDueDate: string): boolean => {
    return new Date(nextDueDate) < new Date();
  };

  return (
    <div className={styles.page} dir="rtl">
      <div className={styles.container}>
        
        {/* Header */}
        <div className={styles.header}>
          <div>
            <h1 className={styles.title}>{tPm('title')}</h1>
            <p className={styles.subtitle}>{tPm('title')}</p>
          </div>
          <button onClick={() => setShowForm(!showForm)} className={styles.addButton}>
            + {tPm('new')}
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
            <h2 className={styles.formTitle}>{tPm('new')}</h2>
            <form onSubmit={handleSubmit} className={styles.formGrid}>
              <div className={styles.formFieldFull}>
                <label className={styles.formLabel}>{t('title')} *</label>
                <input
                  required
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  className={styles.formInput}
                />
              </div>
              <div>
                <label className={styles.formLabel}>{t('asset')} *</label>
                <select
                  required
                  value={form.assetId}
                  onChange={(e) => setForm({ ...form, assetId: e.target.value })}
                  className={styles.formSelect}
                >
                  <option value="">{t('selectAsset')}</option>
                  {assets.map((a) => (
                    <option key={a._id} value={a._id}>
                      {a.name} ({a.assetCode})
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className={styles.formLabel}>{tPm('frequency')}</label>
                <select
                  value={form.frequency}
                  onChange={(e) => setForm({ ...form, frequency: e.target.value })}
                  className={styles.formSelect}
                >
                  <option value="daily">{tPm('daily')}</option>
                  <option value="weekly">{tPm('weekly')}</option>
                  <option value="monthly">{tPm('monthly')}</option>
                  <option value="quarterly">{tPm('quarterly')}</option>
                  <option value="yearly">{tPm('yearly')}</option>
                </select>
              </div>
              <div>
                <label className={styles.formLabel}>{tPm('taskCode')}</label>
                <input
                  value={form.taskCode}
                  onChange={(e) => setForm({ ...form, taskCode: e.target.value })}
                  placeholder={t('autoGenerate')}
                  className={styles.formInput}
                />
              </div>
              <div>
                <label className={styles.formLabel}>{tPm('nextDueDate')}</label>
                <input
                  type="date"
                  value={form.nextDueDate}
                  onChange={(e) => setForm({ ...form, nextDueDate: e.target.value })}
                  className={styles.formInput}
                />
              </div>
              <div className={styles.formFieldFull}>
                <label className={styles.formLabel}>{t('description')}</label>
                <textarea
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  rows={3}
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
                <th className={styles.tableHeaderCell}>{tPm('taskCode')}</th>
                <th className={styles.tableHeaderCell}>{t('title')}</th>
                <th className={styles.tableHeaderCell}>{t('asset')}</th>
                <th className={styles.tableHeaderCell}>{tPm('frequency')}</th>
                <th className={styles.tableHeaderCell}>{tPm('nextDueDate')}</th>
                <th className={styles.tableHeaderCell}>{t('status')}</th>
                <th className={styles.tableHeaderCell}>{t('actions')}</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={7} className={styles.loadingState}>{t('loading')}</td>
                </tr>
              ) : tasks.length === 0 ? (
                <tr>
                  <td colSpan={7} className={styles.emptyState}>{t('noData')}</td>
                </tr>
              ) : (
                tasks.map((task) => {
                  const isTaskOverdue = isOverdue(task.nextDueDate);
                  const displayStatus = isTaskOverdue && task.status === 'active' ? 'overdue' : task.status;
                  return (
                    <tr key={task._id} className={styles.tableRow}>
                      <td className={`${styles.tableCell} ${styles.cellCode}`}>{task.taskCode}</td>
                      <td className={`${styles.tableCell} ${styles.cellTitle}`}>{task.title}</td>
                      <td className={styles.cellText}>{task.assetId?.name || '—'}</td>
                      <td className={styles.tableCell}>
                        <span className={`${styles.badge} ${getFrequencyClass(task.frequency)}`}>
                          {getFrequencyLabel(task.frequency)}
                        </span>
                      </td>
                      <td className={styles.cellText}>
                        {new Date(task.nextDueDate).toLocaleDateString('ar')}
                        {isTaskOverdue && task.status === 'active' && (
                          <span className={styles.overdueText}>({t('overdue')})</span>
                        )}
                      </td>
                      <td className={styles.tableCell}>
                        <span className={`${styles.badge} ${getStatusClass(displayStatus)}`}>
                          {getStatusLabel(displayStatus)}
                        </span>
                      </td>
                      <td className={styles.actionsCell}>
                        <TableActions
                          id={task._id}
                          editUrl={`/${locale}/cmms/preventive-maintenance/${task._id}/edit`}
                          onDelete={() => handleDelete(task._id)}
                        />
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

      </div>
    </div>
  );
}