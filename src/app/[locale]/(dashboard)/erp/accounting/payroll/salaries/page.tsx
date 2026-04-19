// src/app/[locale]/(dashboard)/erp/accounting/payroll/salaries/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { Plus, Eye, Trash2, DollarSign, Search, Calendar, Download } from 'lucide-react';
import styles from '@/styles/pages/accounting/payroll.module.css';

interface SalaryPayment {
  _id: string;
  paymentNumber: string;
  employeeId: {
    _id: string;
    employeeName: string;
    employeeCode: string;
    department: string;
  };
  period: string;
  paymentDate: string;
  grossSalary: number;
  totalDeductions: number;
  netSalary: number;
  paymentMethod: string;
}

export default function SalaryPaymentsPage() {
  const router = useRouter();
  const t = useTranslations('Common');
  const tAccounting = useTranslations('Accounting');
  
  const [payments, setPayments] = useState<SalaryPayment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState({
    period: '',
    startDate: '',
    endDate: '',
  });

  useEffect(() => {
    fetchPayments();
  }, [filters]);

  const fetchPayments = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (filters.period) params.append('period', filters.period);
      if (filters.startDate) params.append('startDate', filters.startDate);
      if (filters.endDate) params.append('endDate', filters.endDate);
      
      const res = await fetch(`/api/accounting/payroll/salaries?${params}`);
      const data = await res.json();
      if (data.success) {
        setPayments(data.data);
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
      const res = await fetch(`/api/accounting/payroll/salaries/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        await fetchPayments();
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
              <DollarSign className="inline-block w-6 h-6 ml-2 text-[#1ABC9C]" />
              {tAccounting('salaryPayments')}
            </h1>
            <p className={styles.subtitle}>
              {tAccounting('salaryPaymentsDescription')}
            </p>
          </div>
          <button
            onClick={() => router.push('/erp/accounting/payroll/salaries/new')}
            className={styles.addButton}
          >
            <Plus className="w-4 h-4" />
            {tAccounting('addSalaryPayment')}
          </button>
        </div>

        <div className={styles.filterBar}>
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

          <div className={styles.filterGroup}>
            <label className={styles.filterLabel}>{tAccounting('fromDate')}</label>
            <input
              type="date"
              value={filters.startDate}
              onChange={(e) => setFilters({ ...filters, startDate: e.target.value })}
              className={styles.filterInput}
            />
          </div>

          <div className={styles.filterGroup}>
            <label className={styles.filterLabel}>{tAccounting('toDate')}</label>
            <input
              type="date"
              value={filters.endDate}
              onChange={(e) => setFilters({ ...filters, endDate: e.target.value })}
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
                <th className={styles.tableHeaderCell}>{tAccounting('paymentNumber')}</th>
                <th className={styles.tableHeaderCell}>{tAccounting('employee')}</th>
                <th className={styles.tableHeaderCell}>{tAccounting('period')}</th>
                <th className={styles.tableHeaderCell}>{tAccounting('paymentDate')}</th>
                <th className={styles.tableHeaderCell}>{tAccounting('grossSalary')}</th>
                <th className={styles.tableHeaderCell}>{tAccounting('deductions')}</th>
                <th className={styles.tableHeaderCell}>{tAccounting('netSalary')}</th>
                <th className={styles.tableHeaderCell}>{t('actions')}</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={8} className={styles.loadingState}>
                    <div className="flex items-center justify-center gap-2">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-[#1ABC9C]"></div>
                      {t('loading')}
                    </div>
                  </td>
                </tr>
              ) : payments.length === 0 ? (
                <tr>
                  <td colSpan={8} className={styles.emptyState}>
                    <DollarSign className="w-12 h-12 mx-auto mb-2 text-gray-400" />
                    {t('noData')}
                  </td>
                </tr>
              ) : (
                payments.map((payment) => (
                  <tr key={payment._id} className={styles.tableRow}>
                    <td className={`${styles.tableCell} ${styles.cellCode}`}>
                      {payment.paymentNumber}
                    </td>
                    <td className={styles.tableCell}>
                      {payment.employeeId?.employeeName} ({payment.employeeId?.employeeCode})
                    </td>
                    <td className={styles.tableCell}>{payment.period}</td>
                    <td className={styles.tableCell}>{formatDate(payment.paymentDate)}</td>
                    <td className={`${styles.tableCell} ${styles.cellAmount}`}>
                      {formatAmount(payment.grossSalary)}
                    </td>
                    <td className={`${styles.tableCell} ${styles.cellAmount}`}>
                      {formatAmount(payment.totalDeductions)}
                    </td>
                    <td className={`${styles.tableCell} ${styles.cellAmount}`}>
                      {formatAmount(payment.netSalary)}
                    </td>
                    <td className={styles.actionsCell}>
                      <button
                        onClick={() => router.push(`/erp/accounting/payroll/salaries/${payment._id}`)}
                        className="text-blue-500 hover:text-blue-700 ml-3"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(payment._id)}
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