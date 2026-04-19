'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations, useLocale } from 'next-intl';
import TableActions from '@/components/TableActions';
import styles from '@/styles/pages/maintenance-requests.module.css';

interface MaintenanceRequest {
  _id: string;
  title: string;
  description?: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  status: 'pending' | 'approved' | 'rejected' | 'in-progress' | 'completed';
  assetId: { name: string; assetCode: string } | null;
  requestedBy: { name: string; email: string };
  createdAt: string;
}

const getPriorityClass = (priority: string): string => {
  switch (priority) {
    case 'low': return styles.priorityLow;
    case 'medium': return styles.priorityMedium;
    case 'high': return styles.priorityHigh;
    case 'critical': return styles.priorityCritical;
    default: return '';
  }
};

const getPriorityLabel = (priority: string): string => {
  switch (priority) {
    case 'low': return 'منخفض';
    case 'medium': return 'متوسط';
    case 'high': return 'عالي';
    case 'critical': return 'حرج';
    default: return priority;
  }
};

const getStatusClass = (status: string): string => {
  switch (status) {
    case 'pending': return styles.statusPending;
    case 'approved': return styles.statusApproved;
    case 'rejected': return styles.statusRejected;
    case 'in-progress': return styles.statusInProgress;
    case 'completed': return styles.statusCompleted;
    default: return '';
  }
};

const getStatusLabel = (status: string): string => {
  switch (status) {
    case 'pending': return 'قيد الانتظار';
    case 'approved': return 'موافق';
    case 'rejected': return 'مرفوض';
    case 'in-progress': return 'جاري';
    case 'completed': return 'مكتمل';
    default: return status;
  }
};

export default function MaintenanceRequestsPage() {
  const router = useRouter();
  const locale = useLocale();
  const t = useTranslations('Common');
  const tReq = useTranslations('MaintenanceRequest');
  
  const [requests, setRequests] = useState<MaintenanceRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [assets, setAssets] = useState<{_id: string, name: string, assetCode: string}[]>([]);
  const [form, setForm] = useState({
    title: '',
    description: '',
    assetId: '',
    priority: 'medium',
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchRequests();
    fetchAssets();
  }, []);

  const fetchRequests = async () => {
    try {
      const res = await fetch('/api/maintenance-requests');
      const data = await res.json();
      if (data.success) {
        setRequests(data.data);
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
    
    try {
      const res = await fetch(`/api/maintenance-requests/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        await fetchRequests();
        alert(t('deleteSuccess'));
      } else {
        alert(data.message || t('deleteFailed'));
      }
    } catch {
      alert(t('error'));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch('/api/maintenance-requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (data.success) {
        await fetchRequests();
        setShowForm(false);
        setForm({ title: '', description: '', assetId: '', priority: 'medium' });
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
            <h1 className={styles.title}>{tReq('title') || 'طلبات الصيانة'}</h1>
            <p className={styles.subtitle}>{tReq('title') || 'إدارة طلبات الصيانة'}</p>
          </div>
          <button onClick={() => setShowForm(!showForm)} className={styles.addButton}>
            + {tReq('new') || 'طلب صيانة جديد'}
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
            <h2 className={styles.formTitle}>{tReq('new') || 'طلب صيانة جديد'}</h2>
            <form onSubmit={handleSubmit} className={styles.formGrid}>
              <div className={styles.formFieldFull}>
                <label className={styles.formLabel}>{t('title') || 'العنوان'} *</label>
                <input
                  required
                  value={form.title}
                  onChange={e => setForm({ ...form, title: e.target.value })}
                  className={styles.formInput}
                />
              </div>
              <div>
                <label className={styles.formLabel}>{t('asset') || 'الأصل'} *</label>
                <select
                  required
                  value={form.assetId}
                  onChange={e => setForm({ ...form, assetId: e.target.value })}
                  className={styles.formSelect}
                >
                  <option value="">{t('selectAsset') || 'اختر أصلاً'}</option>
                  {assets.map((a) => (
                    <option key={a._id} value={a._id}>{a.name} ({a.assetCode})</option>
                  ))}
                </select>
              </div>
              <div>
                <label className={styles.formLabel}>{tReq('priority') || 'الأولوية'}</label>
                <select
                  value={form.priority}
                  onChange={e => setForm({ ...form, priority: e.target.value })}
                  className={styles.formSelect}
                >
                  <option value="low">{t('low') || 'منخفض'}</option>
                  <option value="medium">{t('medium') || 'متوسط'}</option>
                  <option value="high">{t('high') || 'عالي'}</option>
                  <option value="critical">{t('critical') || 'حرج'}</option>
                </select>
              </div>
              <div className={styles.formFieldFull}>
                <label className={styles.formLabel}>{t('description') || 'الوصف'}</label>
                <textarea
                  value={form.description}
                  onChange={e => setForm({ ...form, description: e.target.value })}
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
                <th className={styles.tableHeaderCell}>{t('title') || 'العنوان'}</th>
                <th className={styles.tableHeaderCell}>{t('asset') || 'الأصل'}</th>
                <th className={styles.tableHeaderCell}>{tReq('priority') || 'الأولوية'}</th>
                <th className={styles.tableHeaderCell}>{t('status') || 'الحالة'}</th>
                <th className={styles.tableHeaderCell}>{t('requestedBy') || 'مقدم الطلب'}</th>
                <th className={styles.tableHeaderCell}>{t('date') || 'التاريخ'}</th>
                <th className={styles.tableHeaderCell}>{t('actions') || 'الإجراءات'}</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={7} className={styles.loadingState}>{t('loading') || 'جاري التحميل...'}</td>
                </tr>
              ) : requests.length === 0 ? (
                <tr>
                  <td colSpan={7} className={styles.emptyState}>{t('noData') || 'لا توجد بيانات'}</td>
                </tr>
              ) : (
                requests.map((req) => (
                  <tr key={req._id} className={styles.tableRow}>
                    <td className={`${styles.tableCell} ${styles.cellTitle}`}>{req.title}</td>
                    <td className={styles.tableCell}>{req.assetId?.name || '—'}</td>
                    <td className={styles.tableCell}>
                      <span className={`${styles.badge} ${getPriorityClass(req.priority)}`}>
                        {getPriorityLabel(req.priority)}
                      </span>
                    </td>
                    <td className={styles.tableCell}>
                      <span className={`${styles.badge} ${getStatusClass(req.status)}`}>
                        {getStatusLabel(req.status)}
                      </span>
                    </td>
                    <td className={styles.cellText}>{req.requestedBy?.name || '—'}</td>
                    <td className={styles.cellText}>{new Date(req.createdAt).toLocaleDateString('ar')}</td>
                    <td className={styles.actionsCell}>
                      <TableActions
                        id={req._id}
                        editUrl={`/${locale}/cmms/maintenance-requests/${req._id}/edit`}
                        onDelete={() => handleDelete(req._id)}
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