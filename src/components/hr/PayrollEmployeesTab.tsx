'use client';

import { use } from 'react';
import { useTranslations } from 'next-intl';

type Props = {
  params: Promise<{ locale: string }>;
};
// src/components/hr/PayrollEmployeesTab.tsx
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import TableActions from '@/components/TableActions';
import styles from '@/styles/pages/hr.module.css';

// ✅ واجهة الموظف العادي (من جدول الموظفين)
interface RegularEmployee {
  _id: string;
  employeeCode: string;
  fullName: string;
  position: string;
  department: string;
  salary: number;
  bankAccount?: string;
  socialSecurityNumber?: string;
  taxNumber?: string;
}

// ✅ واجهة موظف الرواتب (من جدول payroll)
interface PayrollEmployee {
  _id: string;
  employeeId: {
    _id: string;
    fullName: string;
    employeeCode: string;
    position: string;
    department: string;
  };
  employeeCode: string;
  employeeName: string;
  department: string;
  position: string;
  baseSalary: number;
  bankAccount: string;
  socialSecurityNumber: string;
  taxRegistrationNumber: string;
  isActive: boolean;
}

export default function PayrollEmployeesTab({ params }: Props) {
  const router = useRouter();
  const { locale } = use(params);
  const t = useTranslations('Common');
  const tAccounting = useTranslations('Accounting');
  
  const [regularEmployees, setRegularEmployees] = useState<RegularEmployee[]>([]);
  const [payrollEmployees, setPayrollEmployees] = useState<PayrollEmployee[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState<string>('');
  const [form, setForm] = useState({
    baseSalary: 0,
    bankAccount: '',
    socialSecurityNumber: '',
    taxRegistrationNumber: '',
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchRegularEmployees();
    fetchPayrollEmployees();
  }, []);

  const fetchRegularEmployees = async () => {
    try {
      const res = await fetch('/api/employees?status=active');
      const data = await res.json();
      if (data.success) {
        setRegularEmployees(data.data);
      }
    } catch {
      console.error('Error fetching employees');
    }
  };

  const fetchPayrollEmployees = async () => {
    try {
      const res = await fetch('/api/accounting/payroll/employees');
      const data = await res.json();
      if (data.success) {
        setPayrollEmployees(data.data);
      } else {
        setError(data.message);
      }
    } catch {
      setError(t('fetchError'));
    } finally {
      setLoading(false);
    }
  };

  const handleEmployeeChange = (employeeId: string) => {
    setSelectedEmployee(employeeId);
    const emp = regularEmployees.find(e => e._id === employeeId);
    if (emp) {
      setForm({
        baseSalary: emp.salary,
        bankAccount: emp.bankAccount || '',
        socialSecurityNumber: emp.socialSecurityNumber || '',
        taxRegistrationNumber: emp.taxNumber || '',
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedEmployee) {
      setError('الرجاء اختيار موظف');
      return;
    }

    const emp = regularEmployees.find(e => e._id === selectedEmployee);
    if (!emp) {
      setError('الموظف غير موجود');
      return;
    }

    setSaving(true);
    setError(null);

    try {
      const res = await fetch('/api/accounting/payroll/employees', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          employeeId: selectedEmployee,
          employeeCode: emp.employeeCode,
          employeeName: emp.fullName,
          department: emp.department,
          position: emp.position,
          hireDate: new Date().toISOString().split('T')[0],
          baseSalary: form.baseSalary,
          bankAccount: form.bankAccount,
          socialSecurityNumber: form.socialSecurityNumber,
          taxRegistrationNumber: form.taxRegistrationNumber,
          isActive: true,
        }),
      });
      const data = await res.json();
      if (data.success) {
        alert(t('addSuccess'));
        setShowForm(false);
        setSelectedEmployee('');
        setForm({
          baseSalary: 0,
          bankAccount: '',
          socialSecurityNumber: '',
          taxRegistrationNumber: '',
        });
        fetchPayrollEmployees();
      } else {
        setError(data.message);
      }
    } catch {
      setError(t('error'));
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm(t('deleteConfirm'))) return;
    
    const res = await fetch(`/api/accounting/payroll/employees/${id}`, { method: 'DELETE' });
    const data = await res.json();
    if (data.success) {
      await fetchPayrollEmployees();
      alert(t('deleteSuccess'));
    } else {
      alert(data.message || t('deleteFailed'));
    }
  };

  const formatAmount = (amount: number) => {
    return amount.toLocaleString('ar-DZ') + ' دج';
  };

  if (loading) return <div className={styles.loadingState}>{t('loading')}</div>;

  return (
    <div>
      <div className={styles.addButtonContainer}>
        <button onClick={() => setShowForm(!showForm)} className={styles.addButton}>
          + {tAccounting('addEmployee')}
        </button>
      </div>

      {error && (
        <div className={styles.errorMessage}>
          <p className={styles.errorText}>{error}</p>
        </div>
      )}

      {/* Add Payroll Employee Form */}
      {showForm && (
        <div className={styles.formContainer}>
          <h2 className={styles.formTitle}>{tAccounting('addEmployee')}</h2>
          <form onSubmit={handleSubmit} className={styles.formGrid}>
            <div className={styles.formFieldFull}>
              <label className={styles.formLabel}>اختر الموظف *</label>
              <select
                required
                value={selectedEmployee}
                onChange={(e) => handleEmployeeChange(e.target.value)}
                className={styles.formSelect}
              >
                <option value="">-- اختر موظفاً --</option>
                {regularEmployees.map((emp) => (
                  <option key={emp._id} value={emp._id}>
                    {emp.employeeCode} - {emp.fullName} ({emp.position})
                  </option>
                ))}
              </select>
            </div>

            <div className={styles.formFieldFull}>
              <label className={styles.formLabel}>الراتب الأساسي *</label>
              <input
                type="number"
                required
                value={form.baseSalary}
                onChange={(e) => setForm({ ...form, baseSalary: Number(e.target.value) })}
                className={styles.formInput}
                min="0"
              />
            </div>

            <div>
              <label className={styles.formLabel}>الحساب البنكي *</label>
              <input
                type="text"
                required
                value={form.bankAccount}
                onChange={(e) => setForm({ ...form, bankAccount: e.target.value })}
                className={styles.formInput}
                placeholder="1234 5678 9012 3456"
              />
            </div>

            <div>
              <label className={styles.formLabel}>رقم الضمان الاجتماعي *</label>
              <input
                type="text"
                required
                value={form.socialSecurityNumber}
                onChange={(e) => setForm({ ...form, socialSecurityNumber: e.target.value })}
                className={styles.formInput}
                placeholder="123456789"
              />
            </div>

            <div>
              <label className={styles.formLabel}>الرقم الضريبي *</label>
              <input
                type="text"
                required
                value={form.taxRegistrationNumber}
                onChange={(e) => setForm({ ...form, taxRegistrationNumber: e.target.value })}
                className={styles.formInput}
                placeholder="1234567890"
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

      {/* Payroll Employees Table */}
      <div className={styles.tableContainer}>
        <table className={styles.table}>
          <thead>
            <tr className={styles.tableHeader}>
              <th className={styles.tableHeaderCell}>{tAccounting('employeeCode')}</th>
              <th className={styles.tableHeaderCell}>{tAccounting('employeeName')}</th>
              <th className={styles.tableHeaderCell}>{t('department')}</th>
              <th className={styles.tableHeaderCell}>{t('position')}</th>
              <th className={styles.tableHeaderCell}>{tAccounting('baseSalary')}</th>
              <th className={styles.tableHeaderCell}>{t('status')}</th>
              <th className={styles.tableHeaderCell}>{t('actions')}</th>
            </tr>
          </thead>
          <tbody>
            {payrollEmployees.length === 0 ? (
              <tr>
                <td colSpan={7} className={styles.emptyState}>{t('noData')}</td>
              </tr>
            ) : (
              payrollEmployees.map((emp) => (
                <tr key={emp._id} className={styles.tableRow}>
                  <td className={`${styles.tableCell} ${styles.cellCode}`}>{emp.employeeCode}</td>
                  <td className={`${styles.tableCell} ${styles.cellName}`}>
                    {emp.employeeId?.fullName || emp.employeeName || '—'}
                  </td>
                  <td className={styles.tableCell}>{emp.department}</td>
                  <td className={styles.tableCell}>{emp.position}</td>
                  <td className={`${styles.tableCell} ${styles.cellAmount}`}>{formatAmount(emp.baseSalary)}</td>
                  <td className={styles.tableCell}>
                    <span className={emp.isActive ? styles.statusActive : styles.statusInactive}>
                      {emp.isActive ? t('active') : t('inactive')}
                    </span>
                  </td>
                  <td className={styles.tableCell}>
                    <TableActions
                      id={emp._id}
                      editUrl={`/${locale}/erp/accounting/payroll/employees/${emp._id}/edit`}
                      onDelete={() => handleDelete(emp._id)}
                    />
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}