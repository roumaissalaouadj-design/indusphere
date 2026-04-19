'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations, useLocale } from 'next-intl';
import { ArrowRight, Calendar, Save } from 'lucide-react';
import styles from '@/styles/pages/preventive-maintenance-edit.module.css';

interface PreventiveTask {
  _id: string;
  taskCode: string;
  title: string;
  assetId: string;
  assetName: string;
  frequency: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly';
  nextDueDate: string;
  description: string;
  estimatedDuration: number;
  assignedTo: string;
  status: 'planned' | 'inProgress' | 'completed' | 'overdue';
  notes: string;
}

export default function EditPreventiveMaintenancePage({
  params,
}: {
  params: Promise<{ id: string; locale: string }>;
}) {
  const router = useRouter();
  const locale = useLocale();
  const t = useTranslations('Common');
  const tPm = useTranslations('PreventiveMaintenance');
  
  // ✅ نصوص ثابتة حسب اللغة
  const getTitle = () => {
    if (locale === 'ar') return 'تعديل مهمة وقائية';
    if (locale === 'fr') return 'Modifier la tâche préventive';
    return 'Edit Preventive Task';
  };

  const getDescription = () => {
    if (locale === 'ar') return 'تعديل بيانات المهمة الوقائية';
    if (locale === 'fr') return 'Modifier les données de la tâche préventive';
    return 'Edit preventive task data';
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

  const getTaskCodeLabel = () => {
    if (locale === 'ar') return 'رمز المهمة';
    if (locale === 'fr') return 'Code tâche';
    return 'Task Code';
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

  const getFrequencyLabel = () => {
    if (locale === 'ar') return 'التكرار';
    if (locale === 'fr') return 'Fréquence';
    return 'Frequency';
  };

  const getNextDueDateLabel = () => {
    if (locale === 'ar') return 'تاريخ الاستحقاق القادم';
    if (locale === 'fr') return 'Prochaine date d\'échéance';
    return 'Next Due Date';
  };

  const getStatusLabel = () => {
    if (locale === 'ar') return 'الحالة';
    if (locale === 'fr') return 'Statut';
    return 'Status';
  };

  const getEstimatedDurationLabel = () => {
    if (locale === 'ar') return 'المدة المتوقعة (ساعة)';
    if (locale === 'fr') return 'Durée estimée (heure)';
    return 'Estimated Duration (hours)';
  };

  const getAssignedToLabel = () => {
    if (locale === 'ar') return 'مسؤول التنفيذ';
    if (locale === 'fr') return 'Responsable d\'exécution';
    return 'Assigned To';
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

  // ✅ نصوص التكرار حسب اللغة
  const getFrequencyLabels = () => {
    if (locale === 'ar') {
      return { daily: 'يومي', weekly: 'أسبوعي', monthly: 'شهري', quarterly: 'ربع سنوي', yearly: 'سنوي' };
    }
    if (locale === 'fr') {
      return { daily: 'Quotidien', weekly: 'Hebdomadaire', monthly: 'Mensuel', quarterly: 'Trimestriel', yearly: 'Annuel' };
    }
    return { daily: 'Daily', weekly: 'Weekly', monthly: 'Monthly', quarterly: 'Quarterly', yearly: 'Yearly' };
  };

  // ✅ نصوص الحالة حسب اللغة
  const getStatusLabels = () => {
    if (locale === 'ar') {
      return { planned: 'مخطط', inProgress: 'قيد التنفيذ', completed: 'مكتمل', overdue: 'متأخر' };
    }
    if (locale === 'fr') {
      return { planned: 'Planifié', inProgress: 'En cours', completed: 'Terminé', overdue: 'En retard' };
    }
    return { planned: 'Planned', inProgress: 'In Progress', completed: 'Completed', overdue: 'Overdue' };
  };

  const frequencyLabels = getFrequencyLabels();
  const statusLabels = getStatusLabels();

  const [form, setForm] = useState<Omit<PreventiveTask, '_id'>>({
    taskCode: '',
    title: '',
    assetId: '',
    assetName: '',
    frequency: 'monthly',
    nextDueDate: '',
    description: '',
    estimatedDuration: 0,
    assignedTo: '',
    status: 'planned',
    notes: '',
  });
  const [assets, setAssets] = useState<{ _id: string; name: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchTask();
    fetchAssets();
  }, []);

  const fetchTask = async () => {
    try {
      const { id } = await params;
      const res = await fetch(`/api/preventive-maintenance/${id}`);
      const data = await res.json();
      if (data.success) {
        setForm({
          taskCode: data.data.taskCode,
          title: data.data.title,
          assetId: data.data.assetId?._id || data.data.assetId,
          assetName: data.data.assetId?.name || '',
          frequency: data.data.frequency,
          nextDueDate: data.data.nextDueDate?.split('T')[0] || '',
          description: data.data.description || '',
          estimatedDuration: data.data.estimatedDuration || 0,
          assignedTo: data.data.assignedTo || '',
          status: data.data.status,
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
      
      const cleanData = {
        ...form,
        assignedTo: form.assignedTo && typeof form.assignedTo === 'string' && form.assignedTo.length === 24 
          ? form.assignedTo 
          : null,
        estimatedDuration: Number(form.estimatedDuration) || 0,
      };
      
      const res = await fetch(`/api/preventive-maintenance/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(cleanData),
      });

      const data = await res.json();

      if (data.success) {
        alert(t('editSuccess'));
        router.push(`/${locale}/cmms/preventive-maintenance`);
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
              <Calendar className={styles.titleIcon} />
              {getTitle()}
            </h1>
            <p className={styles.subtitle}>
              {getDescription()}
            </p>
          </div>
          <button onClick={() => router.push(`/${locale}/cmms/preventive-maintenance`)} className={styles.cancelButton}>
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
                <label className={styles.formLabel}>{getTaskCodeLabel()} *</label>
                <input
                  type="text"
                  required
                  value={form.taskCode}
                  onChange={(e) => setForm({ ...form, taskCode: e.target.value })}
                  className={styles.formInput}
                />
              </div>

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
                <label className={styles.formLabel}>{getFrequencyLabel()} *</label>
                <select
                  required
                  value={form.frequency}
                  onChange={(e) => setForm({ ...form, frequency: e.target.value as PreventiveTask['frequency'] })}
                  className={styles.formSelect}
                >
                  <option value="daily">{frequencyLabels.daily}</option>
                  <option value="weekly">{frequencyLabels.weekly}</option>
                  <option value="monthly">{frequencyLabels.monthly}</option>
                  <option value="quarterly">{frequencyLabels.quarterly}</option>
                  <option value="yearly">{frequencyLabels.yearly}</option>
                </select>
              </div>

              <div className={styles.formGroup}>
                <label className={styles.formLabel}>{getNextDueDateLabel()} *</label>
                <input
                  type="date"
                  required
                  value={form.nextDueDate}
                  onChange={(e) => setForm({ ...form, nextDueDate: e.target.value })}
                  className={styles.formInput}
                />
              </div>

              <div className={styles.formGroup}>
                <label className={styles.formLabel}>{getStatusLabel()} *</label>
                <select
                  required
                  value={form.status}
                  onChange={(e) => setForm({ ...form, status: e.target.value as PreventiveTask['status'] })}
                  className={styles.formSelect}
                >
                  <option value="planned">{statusLabels.planned}</option>
                  <option value="inProgress">{statusLabels.inProgress}</option>
                  <option value="completed">{statusLabels.completed}</option>
                  <option value="overdue">{statusLabels.overdue}</option>
                </select>
              </div>

              <div className={styles.formGroup}>
                <label className={styles.formLabel}>{getEstimatedDurationLabel()}</label>
                <input
                  type="number"
                  value={form.estimatedDuration}
                  onChange={(e) => setForm({ ...form, estimatedDuration: Number(e.target.value) })}
                  className={styles.formInput}
                  min="0"
                  step="0.5"
                />
              </div>

              <div className={styles.formGroup}>
                <label className={styles.formLabel}>{getAssignedToLabel()}</label>
                <input
                  type="text"
                  value={form.assignedTo}
                  onChange={(e) => setForm({ ...form, assignedTo: e.target.value })}
                  className={styles.formInput}
                  placeholder={getAssignedToLabel()}
                />
              </div>

              <div className={styles.formGroup}>
                <label className={styles.formLabel}>{getDescriptionLabel()}</label>
                <textarea
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

              <div className={styles.formActions}>
                <button type="submit" disabled={saving} className={styles.saveButton}>
                  <Save className="w-4 h-4" />
                  {saving ? t('saving') : getSaveText()}
                </button>
                <button type="button" onClick={() => router.push(`/${locale}/cmms/preventive-maintenance`)} className={styles.cancelButton}>
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