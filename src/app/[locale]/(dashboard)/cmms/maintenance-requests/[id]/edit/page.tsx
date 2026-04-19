// src/app/[locale]/(dashboard)/cmms/maintenance-requests/[id]/edit/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations, useLocale } from 'next-intl';
import { ArrowRight, ClipboardList, Save } from 'lucide-react';
import styles from '@/styles/pages/maintenance-requests-edit.module.css';

interface MaintenanceRequest {
  _id: string;
  title: string;
  assetId: string;
  assetName: string;
  description: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  status: 'pending' | 'approved' | 'rejected' | 'inProgress' | 'completed';
  requestedBy: string | { name: string; email: string };
  notes: string;
}

export default function EditMaintenanceRequestPage({
  params,
}: {
  params: Promise<{ id: string; locale: string }>;
}) {
  const router = useRouter();
  const locale = useLocale();
  const t = useTranslations('Common');
  const tRequest = useTranslations('MaintenanceRequest');
  
  // ✅ نصوص ثابتة حسب اللغة
  const getTitle = () => {
    if (locale === 'ar') return 'تعديل طلب صيانة';
    if (locale === 'fr') return 'Modifier la demande de maintenance';
    return 'Edit Maintenance Request';
  };

  const getDescription = () => {
    if (locale === 'ar') return 'تعديل بيانات طلب الصيانة';
    if (locale === 'fr') return 'Modifier les données de la demande de maintenance';
    return 'Edit maintenance request data';
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

  const getTitleLabel = () => {
    if (locale === 'ar') return 'العنوان';
    if (locale === 'fr') return 'Titre';
    return 'Title';
  };

  const getAssetLabel = () => {
    if (locale === 'ar') return 'الأصل';
    if (locale === 'fr') return 'Actif';
    return 'Asset';
  };

  const getPriorityLabel = () => {
    if (locale === 'ar') return 'الأولوية';
    if (locale === 'fr') return 'Priorité';
    return 'Priority';
  };

  const getStatusLabel = () => {
    if (locale === 'ar') return 'الحالة';
    if (locale === 'fr') return 'Statut';
    return 'Status';
  };

  const getDescriptionLabel = () => {
    if (locale === 'ar') return 'الوصف';
    if (locale === 'fr') return 'Description';
    return 'Description';
  };

  const getNotesLabel = () => {
    if (locale === 'ar') return 'ملاحظات';
    if (locale === 'fr') return 'Notes';
    return 'Notes';
  };

  const getRequestedByLabel = () => {
    if (locale === 'ar') return 'مقدم الطلب';
    if (locale === 'fr') return 'Demandé par';
    return 'Requested By';
  };

  const [form, setForm] = useState<Omit<MaintenanceRequest, '_id'>>({
    title: '',
    assetId: '',
    assetName: '',
    description: '',
    priority: 'medium',
    status: 'pending',
    requestedBy: '',
    notes: '',
  });
  const [assets, setAssets] = useState<{ _id: string; name: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchRequest();
    fetchAssets();
  }, []);

  const fetchRequest = async () => {
    try {
      const { id } = await params;
      const res = await fetch(`/api/maintenance-requests/${id}`);
      const data = await res.json();
      if (data.success) {
        let requestedByName = '';
        if (data.data.requestedBy) {
          if (typeof data.data.requestedBy === 'object') {
            requestedByName = data.data.requestedBy.name || data.data.requestedBy.email || '';
          } else {
            requestedByName = data.data.requestedBy;
          }
        }

        setForm({
          title: data.data.title,
          assetId: data.data.assetId?._id || data.data.assetId,
          assetName: data.data.assetId?.name || '',
          description: data.data.description || '',
          priority: data.data.priority,
          status: data.data.status,
          requestedBy: requestedByName,
          notes: data.data.notes || '',
        });
      } else {
        setError(data.message);
      }
    } catch {
      setError(t('fetchError'));
    }
  };

  const fetchAssets = async () => {
    try {
      const res = await fetch('/api/assets?isActive=true');
      const data = await res.json();
      if (data.success) {
        setAssets(data.data);
      }
    } catch {
      // Ignore error for assets
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
      const res = await fetch(`/api/maintenance-requests/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });

      const data = await res.json();

      if (data.success) {
        alert(t('editSuccess'));
        router.push(`/${locale}/cmms/maintenance-requests`);
      } else {
        setError(data.message);
      }
    } catch {
      setError(t('error'));
    } finally {
      setSaving(false);
    }
  };

  const getRequestedByName = () => {
    if (typeof form.requestedBy === 'object') {
      return (form.requestedBy as { name: string }).name || '';
    }
    return form.requestedBy;
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
              <ClipboardList className={styles.titleIcon} />
              {getTitle()}
            </h1>
            <p className={styles.subtitle}>
              {getDescription()}
            </p>
          </div>
          <button onClick={() => router.push(`/${locale}/cmms/maintenance-requests`)} className={styles.cancelButton}>
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
                <label className={styles.formLabel}>{getTitleLabel()} *</label>
                <input
                  type="text"
                  required
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  className={styles.formInput}
                />
              </div>

              <div className={styles.formGroup}>
                <label className={styles.formLabel}>{getAssetLabel()} *</label>
                <select
                  required
                  value={form.assetId}
                  onChange={(e) => {
                    const asset = assets.find(a => a._id === e.target.value);
                    setForm({ 
                      ...form, 
                      assetId: e.target.value,
                      assetName: asset?.name || ''
                    });
                  }}
                  className={styles.formSelect}
                >
                  <option value="">{t('selectAsset') || 'اختر الأصل'}</option>
                  {assets.map((asset) => (
                    <option key={asset._id} value={asset._id}>
                      {asset.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className={styles.formGroup}>
                <label className={styles.formLabel}>{getPriorityLabel()} *</label>
                <select
                  required
                  value={form.priority}
                  onChange={(e) => setForm({ ...form, priority: e.target.value as MaintenanceRequest['priority'] })}
                  className={styles.formSelect}
                >
                  <option value="low">{t('low') || 'منخفض'}</option>
                  <option value="medium">{t('medium') || 'متوسط'}</option>
                  <option value="high">{t('high') || 'عالي'}</option>
                  <option value="critical">{t('critical') || 'حرج'}</option>
                </select>
              </div>

              <div className={styles.formGroup}>
                <label className={styles.formLabel}>{getStatusLabel()} *</label>
                <select
                  required
                  value={form.status}
                  onChange={(e) => setForm({ ...form, status: e.target.value as MaintenanceRequest['status'] })}
                  className={styles.formSelect}
                >
                  <option value="pending">{t('pending') || 'قيد الانتظار'}</option>
                  <option value="approved">{t('approved') || 'موافق'}</option>
                  <option value="rejected">{t('rejected') || 'مرفوض'}</option>
                  <option value="inProgress">{t('inProgress') || 'جاري'}</option>
                  <option value="completed">{t('completed') || 'مكتمل'}</option>
                </select>
              </div>

              <div className={styles.formGroup}>
                <label className={styles.formLabel}>{getDescriptionLabel()} *</label>
                <textarea
                  required
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  className={styles.formTextarea}
                  rows={3}
                />
              </div>

              <div className={styles.formGroup}>
                <label className={styles.formLabel}>{getNotesLabel()}</label>
                <textarea
                  value={form.notes}
                  onChange={(e) => setForm({ ...form, notes: e.target.value })}
                  className={styles.formTextarea}
                  rows={3}
                />
              </div>

              <div className={styles.formGroup}>
                <label className={styles.formLabel}>{getRequestedByLabel()}</label>
                <input
                  type="text"
                  value={getRequestedByName()}
                  onChange={(e) => setForm({ ...form, requestedBy: e.target.value })}
                  className={styles.formInput}
                  readOnly
                  disabled
                />
              </div>

              <div className={styles.formActions}>
                <button type="submit" disabled={saving} className={styles.saveButton}>
                  <Save className="w-4 h-4" />
                  {saving ? t('saving') : getSaveText()}
                </button>
                <button type="button" onClick={() => router.push(`/${locale}/cmms/maintenance-requests`)} className={styles.cancelButton}>
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