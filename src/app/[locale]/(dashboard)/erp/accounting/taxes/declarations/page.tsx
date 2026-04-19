// src/app/[locale]/(dashboard)/erp/accounting/taxes/declarations/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { Plus, Eye, Trash2, FileText, DollarSign, Calendar, Download } from 'lucide-react';
import styles from '@/styles/pages/accounting/taxes.module.css';

interface TaxDeclaration {
  _id: string;
  declarationNumber: string;
  taxType: string;
  period: string;
  dueDate: string;
  taxableBase: number;
  taxAmount: number;
  penalties: number;
  totalAmount: number;
  paidAmount: number;
  remainingAmount: number;
  status: string;
}

const taxTypeLabels: Record<string, string> = {
  TVA: 'TVA',
  IRG: 'IRG',
  IBS: 'IBS',
  other: 'أخرى',
};

const statusLabels: Record<string, string> = {
  draft: 'مسودة',
  submitted: 'مقدم',
  paid: 'مدفوع',
  overdue: 'متأخر',
  cancelled: 'ملغي',
};

const statusClass: Record<string, string> = {
  draft: styles.badgeDraft,
  submitted: styles.badgeSubmitted,
  paid: styles.badgePaid,
  overdue: styles.badgeOverdue,
  cancelled: styles.badgeInactive,
};

export default function TaxDeclarationsPage() {
  const router = useRouter();
  const t = useTranslations('Common');
  const tAccounting = useTranslations('Accounting');
  
  const [declarations, setDeclarations] = useState<TaxDeclaration[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState({
    taxType: 'all',
    status: 'all',
    period: '',
  });

  useEffect(() => {
    fetchDeclarations();
  }, [filters]);

  const fetchDeclarations = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (filters.taxType !== 'all') params.append('taxType', filters.taxType);
      if (filters.status !== 'all') params.append('status', filters.status);
      if (filters.period) params.append('period', filters.period);
      
      const res = await fetch(`/api/accounting/taxes/declarations?${params}`);
      const data = await res.json();
      if (data.success) {
        setDeclarations(data.data);
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

    try {
      const res = await fetch(`/api/accounting/taxes/declarations/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        await fetchDeclarations();
        alert(t('deleteSuccess'));
      } else {
        alert(data.message);
      }
    } catch {
      alert(t('error'));
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ar-DZ');
  };

  const formatAmount = (amount: number) => {
    return amount.toLocaleString('ar-DZ') + ' دج';
  };

  return (
    <div className={styles.page}>
      <div className={styles.container}>
        <div className={styles.header}>
          <div>
            <h1 className={styles.title}>
              <FileText className="inline-block w-6 h-6 ml-2 text-[#1ABC9C]" />
              {tAccounting('taxDeclarations')}
            </h1>
            <p className={styles.subtitle}>
              {tAccounting('taxDeclarationsDescription')}
            </p>
          </div>
          <button
            onClick={() => router.push('/erp/accounting/taxes/declarations/new')}
            className={styles.addButton}
          >
            <Plus className="w-4 h-4" />
            {tAccounting('addDeclaration')}
          </button>
        </div>

        <div className={styles.filterBar}>
          <div className={styles.filterGroup}>
            <label className={styles.filterLabel}>{tAccounting('taxType')}</label>
            <select
              value={filters.taxType}
              onChange={(e) => setFilters({ ...filters, taxType: e.target.value })}
              className={styles.filterSelect}
            >
              <option value="all">الكل</option>
              <option value="TVA">TVA</option>
              <option value="IRG">IRG</option>
              <option value="IBS">IBS</option>
            </select>
          </div>

          <div className={styles.filterGroup}>
            <label className={styles.filterLabel}>{t('status')}</label>
            <select
              value={filters.status}
              onChange={(e) => setFilters({ ...filters, status: e.target.value })}
              className={styles.filterSelect}
            >
              <option value="all">الكل</option>
              <option value="draft">مسودة</option>
              <option value="submitted">مقدم</option>
              <option value="paid">مدفوع</option>
              <option value="overdue">متأخر</option>
            </select>
          </div>

          <div className={styles.filterGroup}>
            <label className={styles.filterLabel}>{tAccounting('period')}</label>
            <input
              type="text"
              value={filters.period}
              onChange={(e) => setFilters({ ...filters, period: e.target.value })}
              placeholder="مثال: 2024-01"
              className={styles.filterInput}
            />
          </div>
        </div>

        {error && (
          <div className={styles.errorMessage}>
            <p className={styles.errorText}>{error}</p>
          </div>
        )}

        <div className={styles.tableContainer}>
          <table className={styles.table}>
            <thead>
              <tr className={styles.tableHeader}>
                <th className={styles.tableHeaderCell}>{tAccounting('declarationNumber')}</th>
                <th className={styles.tableHeaderCell}>{tAccounting('taxType')}</th>
                <th className={styles.tableHeaderCell}>{tAccounting('period')}</th>
                <th className={styles.tableHeaderCell}>{tAccounting('dueDate')}</th>
                <th className={styles.tableHeaderCell}>{tAccounting('taxableBase')}</th>
                <th className={styles.tableHeaderCell}>{tAccounting('taxAmount')}</th>
                <th className={styles.tableHeaderCell}>{tAccounting('totalAmount')}</th>
                <th className={styles.tableHeaderCell}>{t('status')}</th>
                <th className={styles.tableHeaderCell}>{t('actions')}</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={9} className={styles.loadingState}>
                    <div className="flex items-center justify-center gap-2">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-[#1ABC9C]"></div>
                      {t('loading')}
                    </div>
                  </td>
                </tr>
              ) : declarations.length === 0 ? (
                <tr>
                  <td colSpan={9} className={styles.emptyState}>
                    <FileText className="w-12 h-12 mx-auto mb-2 text-gray-400" />
                    {t('noData')}
                  </td>
                </tr>
              ) : (
                declarations.map((decl) => (
                  <tr key={decl._id} className={styles.tableRow}>
                    <td className={`${styles.tableCell} ${styles.cellCode}`}>
                      {decl.declarationNumber}
                    </td>
                    <td className={styles.tableCell}>{taxTypeLabels[decl.taxType]}</td>
                    <td className={styles.tableCell}>{decl.period}</td>
                    <td className={styles.tableCell}>
                      <Calendar className="inline-block w-3 h-3 ml-1 text-gray-400" />
                      {formatDate(decl.dueDate)}
                    </td>
                    <td className={`${styles.tableCell} ${styles.cellAmount}`}>
                      {formatAmount(decl.taxableBase)}
                    </td>
                    <td className={`${styles.tableCell} ${styles.cellAmount}`}>
                      {formatAmount(decl.taxAmount)}
                    </td>
                    <td className={`${styles.tableCell} ${styles.cellAmount}`}>
                      {formatAmount(decl.totalAmount)}
                    </td>
                    <td className={styles.tableCell}>
                      <span className={`${styles.badge} ${statusClass[decl.status]}`}>
                        {statusLabels[decl.status]}
                      </span>
                    </td>
                    <td className={styles.actionsCell}>
                      <button
                        onClick={() => router.push(`/erp/accounting/taxes/declarations/${decl._id}`)}
                        className="text-blue-500 hover:text-blue-700 ml-3"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      {decl.status !== 'paid' && (
                        <button
                          onClick={() => router.push(`/erp/accounting/taxes/declarations/${decl._id}/pay`)}
                          className="text-green-500 hover:text-green-700 ml-3"
                        >
                          <DollarSign className="w-4 h-4" />
                        </button>
                      )}
                      <button
                        onClick={() => handleDelete(decl._id)}
                        className="text-red-500 hover:text-red-700"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
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