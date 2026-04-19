'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations, useLocale } from 'next-intl';
import TableActions from '@/components/TableActions';
import styles from '@/styles/pages/finance.module.css';

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

export default function FinancePage() {
  const router = useRouter();
  const locale = useLocale();  // ✅ أضف هذا السطر
  const t = useTranslations('Common');
  const tFin = useTranslations('Finance');
  
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    transactionCode: '',
    date: new Date().toISOString().split('T')[0],
    type: 'expense' as 'income' | 'expense',
    category: '',
    amount: 0,
    description: '',
    status: 'pending' as 'pending' | 'completed' | 'cancelled',
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchTransactions();
  }, []);

const fetchTransactions = async () => {
  try {
    const res = await fetch('/api/transactions');
    const data = await res.json();
    console.log('📦 البيانات من API:', data);
    console.log('📦 أول معاملة:', data.data?.[0]);
    console.log('📦 transactionCode:', data.data?.[0]?.transactionCode);
    if (data.success) {
      setTransactions(data.data);
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
    
    const res = await fetch(`/api/transactions/${id}`, { method: 'DELETE' });
    const data = await res.json();
    if (data.success) {
      await fetchTransactions();
      alert(t('deleteSuccess'));
    } else {
      alert(data.message || t('deleteFailed'));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch('/api/transactions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (data.success) {
        await fetchTransactions();
        setShowForm(false);
        setForm({
          transactionCode: '',
          date: new Date().toISOString().split('T')[0],
          type: 'expense',
          category: '',
          amount: 0,
          description: '',
          status: 'pending',
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

  const totalIncome = transactions.filter(t => t.type === 'income' && t.status === 'completed').reduce((sum, t) => sum + t.amount, 0);
  const totalExpense = transactions.filter(t => t.type === 'expense' && t.status === 'completed').reduce((sum, t) => sum + t.amount, 0);
  const balance = totalIncome - totalExpense;

  return (
    <div className={styles.page} dir="rtl">
      <div className={styles.container}>
        
        {/* Header */}
        <div className={styles.header}>
          <div>
            <h1 className={styles.title}>{tFin('title')}</h1>
            <p className={styles.subtitle}>{tFin('title')}</p>
          </div>
          <button onClick={() => setShowForm(!showForm)} className={styles.addButton}>
            + {tFin('new')}
          </button>
        </div>

        {/* Error Message */}
        {error && (
          <div className={styles.errorMessage}>
            <p className={styles.errorText}>{error}</p>
          </div>
        )}

        {/* Stats Cards */}
        <div className={styles.statsGrid}>
          <div className={styles.statCard}>
            <div className={styles.statLabel}>{tFin('income')}</div>
            <div className={`${styles.statValue} ${styles.statValueGreen}`}>
              {totalIncome.toLocaleString()} {t('currency')}
            </div>
          </div>
          <div className={styles.statCard}>
            <div className={styles.statLabel}>{tFin('expense')}</div>
            <div className={`${styles.statValue} ${styles.statValueRed}`}>
              {totalExpense.toLocaleString()} {t('currency')}
            </div>
          </div>
          <div className={styles.statCard}>
            <div className={styles.statLabel}>{t('balance')}</div>
            <div className={`${styles.statValue} ${balance >= 0 ? styles.statValueAmber : styles.statValueRed}`}>
              {balance.toLocaleString()} {t('currency')}
            </div>
          </div>
        </div>

        {/* Add Form */}
        {showForm && (
          <div className={styles.formContainer}>
            <h2 className={styles.formTitle}>{tFin('new')}</h2>
            <form onSubmit={handleSubmit} className={styles.formGrid}>
              <div>
                <label className={styles.formLabel}>{tFin('transactionCode')} *</label>
                <input
                  required
                  value={form.transactionCode}
                  onChange={(e) => setForm({ ...form, transactionCode: e.target.value })}
                  className={styles.formInput}
                />
              </div>
              <div>
                <label className={styles.formLabel}>{tFin('date')} *</label>
                <input
                  type="date"
                  required
                  value={form.date}
                  onChange={(e) => setForm({ ...form, date: e.target.value })}
                  className={styles.formInput}
                />
              </div>
              <div>
                <label className={styles.formLabel}>{tFin('type')} *</label>
                <select
                  value={form.type}
                  onChange={(e) => setForm({ ...form, type: e.target.value as 'income' | 'expense' })}
                  className={styles.formSelect}
                >
                  <option value="income">{tFin('income')}</option>
                  <option value="expense">{tFin('expense')}</option>
                </select>
              </div>
              <div>
                <label className={styles.formLabel}>{tFin('category')} *</label>
                <input
                  required
                  value={form.category}
                  onChange={(e) => setForm({ ...form, category: e.target.value })}
                  className={styles.formInput}
                />
              </div>
              <div>
                <label className={styles.formLabel}>{tFin('amount')} *</label>
                <input
                  type="number"
                  required
                  value={form.amount}
                  onChange={(e) => setForm({ ...form, amount: Number(e.target.value) })}
                  className={styles.formInput}
                />
              </div>
              <div>
                <label className={styles.formLabel}>{t('status')} *</label>
                <select
                  value={form.status}
                  onChange={(e) => setForm({ ...form, status: e.target.value as 'pending' | 'completed' | 'cancelled' })}
                  className={styles.formSelect}
                >
                  <option value="pending">{t('pending')}</option>
                  <option value="completed">{t('completed')}</option>
                  <option value="cancelled">{t('cancelled')}</option>
                </select>
              </div>
              <div className={styles.formFieldFull}>
                <label className={styles.formLabel}>{t('description')}</label>
                <textarea
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
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
                <th className={styles.tableHeaderCell}>{tFin('transactionCode')}</th>
                <th className={styles.tableHeaderCell}>{tFin('date')}</th>
                <th className={styles.tableHeaderCell}>{tFin('type')}</th>
                <th className={styles.tableHeaderCell}>{tFin('category')}</th>
                <th className={styles.tableHeaderCell}>{tFin('amount')}</th>
                <th className={styles.tableHeaderCell}>{t('status')}</th>
                <th className={styles.tableHeaderCell}>{t('actions')}</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={7} className={styles.loadingState}>{t('loading')}</td>
                </tr>
              ) : transactions.length === 0 ? (
                <tr>
                  <td colSpan={7} className={styles.emptyState}>{t('noData')}</td>
                </tr>
              ) : (
                transactions.map((transaction) => (
                  <tr key={transaction._id} className={styles.tableRow}>
                    <td className={`${styles.tableCell} ${styles.cellCode}`}>{transaction.transactionCode}</td>
                    <td className={styles.tableCell}>{new Date(transaction.date).toLocaleDateString('ar')}</td>
                    <td className={styles.tableCell}>
                      <span className={transaction.type === 'income' ? styles.badgeIncome : styles.badgeExpense}>
                        {transaction.type === 'income' ? tFin('income') : tFin('expense')}
                      </span>
                    </td>
                    <td className={styles.tableCell}>{transaction.category}</td>
                    <td className={`${styles.tableCell} ${styles.cellAmount} ${transaction.type === 'income' ? styles.amountIncome : styles.amountExpense}`}>
                      {transaction.amount.toLocaleString()} {t('currency')}
                    </td>
                    <td className={styles.tableCell}>
                      <span className={
                        transaction.status === 'completed' ? styles.badgeCompleted :
                        transaction.status === 'pending' ? styles.badgePending :
                        styles.badgeCancelled
                      }>
                        {transaction.status === 'completed' ? t('completed') : transaction.status === 'pending' ? t('pending') : t('cancelled')}
                      </span>
                    </td>
                    <td className={styles.actionsCell}>
                      <TableActions
                        id={transaction._id}
                        // ✅ التصحيح: استخدام locale بدلاً من fr الثابت
                        editUrl={`/${locale}/erp/finance/${transaction._id}/edit`}
                        onDelete={() => handleDelete(transaction._id)}
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