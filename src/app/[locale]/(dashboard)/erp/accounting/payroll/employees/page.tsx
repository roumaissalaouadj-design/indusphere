// src/app/[locale]/(dashboard)/erp/accounting/payroll/employees/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { Plus, Pencil, Trash2, Users, Search, Building2, Briefcase, Calendar } from 'lucide-react';
import styles from '@/styles/pages/accounting/payroll.module.css';

interface PayrollEmployee {
  _id: string;
  employeeCode: string;
  employeeName: string;
  department: string;
  position: string;
  hireDate: string;
  baseSalary: number;
  isActive: boolean;
}

export default function PayrollEmployeesPage() {
  const router = useRouter();
  const t = useTranslations('Common');
  const tAccounting = useTranslations('Accounting');
  
  const [employees, setEmployees] = useState<PayrollEmployee[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState({
    department: 'all',
    isActive: 'all',
    search: '',
  });

  useEffect(() => {
    fetchEmployees();
  }, [filters]);

  const fetchEmployees = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (filters.department !== 'all') params.append('department', filters.department);
      if (filters.isActive !== 'all') params.append('isActive', filters.isActive);
      if (filters.search) params.append('search', filters.search);
      
      const res = await fetch(`/api/accounting/payroll/employees?${params}`);
      const data = await res.json();
      if (data.success) {
        setEmployees(data.data);
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
      const res = await fetch(`/api/accounting/payroll/employees/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        await fetchEmployees();
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
              <Users className="inline-block w-6 h-6 ml-2 text-[#1ABC9C]" />
              {tAccounting('payrollEmployees')}
            </h1>
            <p className={styles.subtitle}>
              {tAccounting('payrollEmployeesDescription')}
            </p>
          </div>
          <button
            onClick={() => router.push('/erp/accounting/payroll/employees/new')}
            className={styles.addButton}
          >
            <Plus className="w-4 h-4" />
            {tAccounting('addEmployee')}
          </button>
        </div>

        <div className={styles.filterBar}>
          <div className={styles.filterGroup}>
            <label className={styles.filterLabel}>{tAccounting('department')}</label>
            <select
              value={filters.department}
              onChange={(e) => setFilters({ ...filters, department: e.target.value })}
              className={styles.filterSelect}
            >
              <option value="all">الكل</option>
              <option value="إنتاج">إنتاج</option>
              <option value="صيانة">صيانة</option>
              <option value="مبيعات">مبيعات</option>
              <option value="مشتريات">مشتريات</option>
              <option value="مالية">مالية</option>
              <option value="موارد بشرية">موارد بشرية</option>
            </select>
          </div>

          <div className={styles.filterGroup}>
            <label className={styles.filterLabel}>{t('status')}</label>
            <select
              value={filters.isActive}
              onChange={(e) => setFilters({ ...filters, isActive: e.target.value })}
              className={styles.filterSelect}
            >
              <option value="all">الكل</option>
              <option value="true">نشط</option>
              <option value="false">غير نشط</option>
            </select>
          </div>

          <div className={styles.filterGroup}>
            <label className={styles.filterLabel}>{t('search')}</label>
            <input
              type="text"
              value={filters.search}
              onChange={(e) => setFilters({ ...filters, search: e.target.value })}
              placeholder={t('search')}
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
                <th className={styles.tableHeaderCell}>{tAccounting('employeeCode')}</th>
                <th className={styles.tableHeaderCell}>{tAccounting('employeeName')}</th>
                <th className={styles.tableHeaderCell}>{tAccounting('department')}</th>
                <th className={styles.tableHeaderCell}>{tAccounting('position')}</th>
                <th className={styles.tableHeaderCell}>{tAccounting('hireDate')}</th>
                <th className={styles.tableHeaderCell}>{tAccounting('baseSalary')}</th>
                <th className={styles.tableHeaderCell}>{t('status')}</th>
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
              ) : employees.length === 0 ? (
                <tr>
                  <td colSpan={8} className={styles.emptyState}>
                    <Users className="w-12 h-12 mx-auto mb-2 text-gray-400" />
                    {t('noData')}
                  </td>
                </tr>
              ) : (
                employees.map((employee) => (
                  <tr key={employee._id} className={styles.tableRow}>
                    <td className={`${styles.tableCell} ${styles.cellCode}`}>
                      {employee.employeeCode}
                    </td>
                    <td className={`${styles.tableCell} ${styles.cellName}`}>
                      {employee.employeeName}
                    </td>
                    <td className={styles.tableCell}>
                      <Building2 className="inline-block w-3 h-3 ml-1 text-gray-400" />
                      {employee.department}
                    </td>
                    <td className={styles.tableCell}>
                      <Briefcase className="inline-block w-3 h-3 ml-1 text-gray-400" />
                      {employee.position}
                    </td>
                    <td className={styles.tableCell}>
                      <Calendar className="inline-block w-3 h-3 ml-1 text-gray-400" />
                      {formatDate(employee.hireDate)}
                    </td>
                    <td className={`${styles.tableCell} ${styles.cellAmount}`}>
                      {formatAmount(employee.baseSalary)}
                    </td>
                    <td className={styles.tableCell}>
                      <span className={`${styles.badge} ${employee.isActive ? styles.badgeActive : styles.badgeInactive}`}>
                        {employee.isActive ? t('active') : t('inactive')}
                      </span>
                    </td>
                    <td className={styles.actionsCell}>
                      <button
                        onClick={() => router.push(`/erp/accounting/payroll/employees/${employee._id}`)}
                        className="text-blue-500 hover:text-blue-700 ml-3"
                      >
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(employee._id)}
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