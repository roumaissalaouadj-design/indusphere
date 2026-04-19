'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations, useLocale } from 'next-intl';
import { ArrowRight, Save } from 'lucide-react';
import styles from '@/styles/pages/work-orders-edit.module.css';

interface WorkOrder {
  _id: string;
  title: string;
  description: string;
  type: 'corrective' | 'preventive';
  priority: 'low' | 'medium' | 'high' | 'critical';
  status: string;
  assetId: { _id: string; name: string; assetCode: string };
  assignedTo?: { _id: string; fullName: string };
  notes?: string;
}

interface Asset {
  _id: string;
  name: string;
  assetCode: string;
}

interface Employee {
  _id: string;
  fullName: string;
}

export default function EditWorkOrderPage({
  params,
}: {
  params: Promise<{ id: string; locale: string }>;
}) {
  const router = useRouter();
  const locale = useLocale();
  const t = useTranslations('Common');
  const tWo = useTranslations('WorkOrder');
  
  const [workOrder, setWorkOrder] = useState<WorkOrder | null>(null);
  const [assets, setAssets] = useState<Asset[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchWorkOrder();
    fetchAssets();
    fetchEmployees();
  }, []);

  const fetchWorkOrder = async () => {
    try {
      const { id } = await params;
      const res = await fetch(`/api/work-orders/${id}`);
      const data = await res.json();
      if (data.success) {
        setWorkOrder(data.data);
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
      if (data.success) setAssets(data.data);
    } catch {
      console.error('Fetch assets error:');
    }
  };

  const fetchEmployees = async () => {
    try {
      const res = await fetch('/api/employees');
      const data = await res.json();
      if (data.success) setEmployees(data.data);
    } catch {
      console.error('Fetch employees error:');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!workOrder) return;

    setSaving(true);
    setError(null);

    try {
      const { id } = await params;
      // ✅ استخدام PATCH بدلاً من PUT (لأن API يستخدم PATCH)
      const res = await fetch(`/api/work-orders/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(workOrder),
      });
      const data = await res.json();
      if (data.success) {
        alert(t('editSuccess'));
        router.push(`/${locale}/cmms/work-orders`);
      } else {
        setError(data.message);
      }
    } catch {
      setError(t('error'));
    } finally {
      setSaving(false);
    }
  };

  const handleAssetChange = (assetId: string) => {
    const asset = assets.find(a => a._id === assetId);
    if (asset && workOrder) {
      setWorkOrder({ ...workOrder, assetId: asset });
    }
  };

  const handleAssignedToChange = (employeeId: string) => {
    if (!workOrder) return;
    if (employeeId === '') {
      setWorkOrder({ ...workOrder, assignedTo: undefined });
    } else {
      const employee = employees.find(e => e._id === employeeId);
      if (employee) {
        setWorkOrder({ ...workOrder, assignedTo: employee });
      }
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

  if (!workOrder) {
    return (
      <div className={styles.page}>
        <div className={styles.container}>
          <div className={styles.emptyState}>{t('noData')}</div>
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
              {tWo('edit')}
            </h1>
            <p className={styles.subtitle}>
              {tWo('edit')} - {workOrder.title || ''}
            </p>
          </div>
          <button onClick={() => router.push(`/${locale}/cmms/work-orders`)} className={styles.cancelButton}>
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
                <label className={styles.formLabel}>{t('title')} *</label>
                <input
                  type="text"
                  required
                  value={workOrder.title}
                  onChange={(e) => setWorkOrder({ ...workOrder, title: e.target.value })}
                  className={styles.formInput}
                />
              </div>

              <div className={styles.formGroup}>
                <label className={styles.formLabel}>{t('asset')}</label>
                <select
                  value={workOrder.assetId?._id || ''}
                  onChange={(e) => handleAssetChange(e.target.value)}
                  className={styles.formSelect}
                >
                  {assets.map(asset => (
                    <option key={asset._id} value={asset._id}>
                      {asset.name} ({asset.assetCode})
                    </option>
                  ))}
                </select>
              </div>

              <div className={styles.formGroup}>
                <label className={styles.formLabel}>{tWo('type')}</label>
                <select
                  value={workOrder.type}
                  onChange={(e) => setWorkOrder({ ...workOrder, type: e.target.value as 'corrective' | 'preventive' })}
                  className={styles.formSelect}
                >
                  <option value="corrective">{tWo('corrective')}</option>
                  <option value="preventive">{tWo('preventive')}</option>
                </select>
              </div>

              <div className={styles.formGroup}>
                <label className={styles.formLabel}>{tWo('priority')}</label>
                <select
                  value={workOrder.priority}
                  onChange={(e) => setWorkOrder({ ...workOrder, priority: e.target.value as 'low' | 'medium' | 'high' | 'critical' })}
                  className={styles.formSelect}
                >
                  <option value="low">{tWo('low')}</option>
                  <option value="medium">{tWo('medium')}</option>
                  <option value="high">{tWo('high')}</option>
                  <option value="critical">{tWo('critical')}</option>
                </select>
              </div>

              <div className={styles.formGroup}>
                <label className={styles.formLabel}>{t('assignedTo')}</label>
                <select
                  value={workOrder.assignedTo?._id || ''}
                  onChange={(e) => handleAssignedToChange(e.target.value)}
                  className={styles.formSelect}
                >
                  <option value="">{t('selectEmployee')}</option>
                  {employees.map(emp => (
                    <option key={emp._id} value={emp._id}>{emp.fullName}</option>
                  ))}
                </select>
              </div>

              <div className={styles.formGroup}>
                <label className={styles.formLabel}>{t('description')}</label>
                <textarea
                  value={workOrder.description}
                  onChange={(e) => setWorkOrder({ ...workOrder, description: e.target.value })}
                  rows={4}
                  className={styles.formTextarea}
                />
              </div>

              <div className={styles.formActions}>
                <button type="submit" disabled={saving} className={styles.saveButton}>
                  <Save className="w-4 h-4" />
                  {saving ? t('saving') : t('save')}
                </button>
                <button type="button" onClick={() => router.push(`/${locale}/cmms/work-orders`)} className={styles.cancelButton}>
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