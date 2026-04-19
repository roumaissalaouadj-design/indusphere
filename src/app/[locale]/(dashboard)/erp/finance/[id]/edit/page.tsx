'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations, useLocale } from 'next-intl';
import { ArrowRight, Save, DollarSign } from 'lucide-react';
import styles from '@/styles/pages/finance-edit.module.css';

interface Transaction {
  _id: string;
  transactionCode: string;
  date: string;
  type: 'income' | 'expense';
  category: string;
  amount: number;
  description: string;
  status: 'pending' | 'completed' | 'cancelled';
}

export default function EditTransactionPage({
  params,
}: {
  params: Promise<{ id: string; locale: string }>;
}) {
  const router = useRouter();
  const locale = useLocale();
  const t = useTranslations('Common');
  const tFinance = useTranslations('Finance');
  
  // ✅ نصوص ثابتة حسب اللغة
  const getTitle = () => {
    if (locale === 'ar') return 'تعديل المعاملة';
    if (locale === 'fr') return 'Modifier la transaction';
    return 'Edit Transaction';
  };

  const getDescription = () => {
    if (locale === 'ar') return 'تعديل بيانات المعاملة المالية';
    if (locale === 'fr') return 'Modifier les données de la transaction financière';
    return 'Edit financial transaction data';
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

  const getTransactionCodeLabel = () => {
    if (locale === 'ar') return 'رمز المعاملة';
    if (locale === 'fr') return 'Code transaction';
    return 'Transaction Code';
  };

  const getDateLabel = () => {
    if (locale === 'ar') return 'التاريخ';
    if (locale === 'fr') return 'Date';
    return 'Date';
  };

  const getTypeLabel = () => {
    if (locale === 'ar') return 'النوع';
    if (locale === 'fr') return 'Type';
    return 'Type';
  };

  const getCategoryLabel = () => {
    if (locale === 'ar') return 'الفئة';
    if (locale === 'fr') return 'Catégorie';
    return 'Category';
  };

  const getAmountLabel = () => {
    if (locale === 'ar') return 'المبلغ (دج)';
    if (locale === 'fr') return 'Montant (DZD)';
    return 'Amount (DZD)';
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

  // ✅ نصوص الأنواع حسب اللغة
  const getTypeOptions = () => {
    if (locale === 'ar') {
      return { income: 'إيراد', expense: 'مصروف' };
    }
    if (locale === 'fr') {
      return { income: 'Revenu', expense: 'Dépense' };
    }
    return { income: 'Income', expense: 'Expense' };
  };

  // ✅ نصوص الحالات حسب اللغة
  const getStatusOptions = () => {
    if (locale === 'ar') {
      return { pending: 'قيد الانتظار', completed: 'مكتمل', cancelled: 'ملغي' };
    }
    if (locale === 'fr') {
      return { pending: 'En attente', completed: 'Terminé', cancelled: 'Annulé' };
    }
    return { pending: 'Pending', completed: 'Completed', cancelled: 'Cancelled' };
  };

  const typeOptions = getTypeOptions();
  const statusOptions = getStatusOptions();

  const [transaction, setTransaction] = useState<Transaction | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchTransaction();
  }, []);

  const fetchTransaction = async () => {
    try {
      const { id } = await params;
      const res = await fetch(`/api/transactions/${id}`);
      const data = await res.json();
      if (data.success) {
        setTransaction(data.data);
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
    if (!transaction) return;

    if (!transaction.transactionCode || !transaction.category || !transaction.amount) {
      setError(t('requiredFields'));
      return;
    }

    setSaving(true);
    setError(null);

    try {
      const { id } = await params;
      const res = await fetch(`/api/transactions/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(transaction),
      });
      const data = await res.json();
      if (data.success) {
        alert(t('editSuccess'));
        router.push(`/${locale}/erp/finance`);
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

  if (error || !transaction) {
    return (
      <div className={styles.page}>
        <div className={styles.container}>
          <div className={styles.emptyState}>{error || t('noData')}</div>
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
              <DollarSign className={styles.titleIcon} />
              {getTitle()}
            </h1>
            <p className={styles.subtitle}>
              {getDescription()}
            </p>
          </div>
          <button onClick={() => router.push(`/${locale}/erp/finance`)} className={styles.cancelButton}>
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
                <label className={styles.formLabel}>{getTransactionCodeLabel()} *</label>
                <input
                  type="text"
                  required
                  value={transaction.transactionCode}
                  onChange={(e) => setTransaction({ ...transaction, transactionCode: e.target.value })}
                  className={styles.formInput}
                />
              </div>

              <div className={styles.formGroup}>
                <label className={styles.formLabel}>{getDateLabel()} *</label>
                <input
                  type="date"
                  required
                  value={transaction.date ? transaction.date.split('T')[0] : ''}
                  onChange={(e) => setTransaction({ ...transaction, date: e.target.value })}
                  className={styles.formInput}
                />
              </div>

              <div className={styles.formGroup}>
                <label className={styles.formLabel}>{getTypeLabel()} *</label>
                <select
                  required
                  value={transaction.type}
                  onChange={(e) => setTransaction({ ...transaction, type: e.target.value as 'income' | 'expense' })}
                  className={styles.formSelect}
                >
                  <option value="income">{typeOptions.income}</option>
                  <option value="expense">{typeOptions.expense}</option>
                </select>
              </div>

              <div className={styles.formGroup}>
                <label className={styles.formLabel}>{getCategoryLabel()} *</label>
                <input
                  type="text"
                  required
                  value={transaction.category}
                  onChange={(e) => setTransaction({ ...transaction, category: e.target.value })}
                  className={styles.formInput}
                />
              </div>

              <div className={styles.formGroup}>
                <label className={styles.formLabel}>{getAmountLabel()} *</label>
                <input
                  type="number"
                  required
                  value={transaction.amount}
                  onChange={(e) => setTransaction({ ...transaction, amount: Number(e.target.value) })}
                  className={styles.formInput}
                  min="0"
                />
              </div>

              <div className={styles.formGroup}>
                <label className={styles.formLabel}>{getStatusLabel()} *</label>
                <select
                  required
                  value={transaction.status}
                  onChange={(e) => setTransaction({ ...transaction, status: e.target.value as 'pending' | 'completed' | 'cancelled' })}
                  className={styles.formSelect}
                >
                  <option value="pending">{statusOptions.pending}</option>
                  <option value="completed">{statusOptions.completed}</option>
                  <option value="cancelled">{statusOptions.cancelled}</option>
                </select>
              </div>

              <div className={styles.formGroup}>
                <label className={styles.formLabel}>{getDescriptionLabel()}</label>
                <textarea
                  value={transaction.description}
                  onChange={(e) => setTransaction({ ...transaction, description: e.target.value })}
                  rows={3}
                  className={styles.formTextarea}
                />
              </div>

              <div className={styles.formActions}>
                <button type="submit" disabled={saving} className={styles.saveButton}>
                  <Save className="w-4 h-4" />
                  {saving ? t('saving') : getSaveText()}
                </button>
                <button type="button" onClick={() => router.push(`/${locale}/erp/finance`)} className={styles.cancelButton}>
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