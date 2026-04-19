'use client';

import { useState, useEffect } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import styles from '@/styles/pages/hr.module.css';

interface Employee {
  _id: string;
  employeeCode: string;
  fullName: string;
  position: string;
  department: string;
}

interface SalaryPayment {
  _id: string;
  paymentNumber: string;
  employeeId: { _id: string; employeeName: string; employeeCode: string };
  period: string;
  paymentDate: string;
  netSalary: number;
  paymentMethod: string;
}

export default function SalaryPaymentsTab() {
  const locale = useLocale();
  const t = useTranslations('Common');
  const tAccounting = useTranslations('Accounting');
  
  const [payments, setPayments] = useState<SalaryPayment[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState<string>('');
  const [form, setForm] = useState({ 
    period: '', 
    paymentDate: new Date().toISOString().split('T')[0], 
    paymentMethod: 'bank_transfer', 
    bankReference: '', 
    notes: '' 
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => { 
    fetchEmployees(); 
    fetchPayments(); 
  }, []);

  const fetchEmployees = async () => {
    try { 
      const res = await fetch('/api/employees?status=active'); 
      const data = await res.json(); 
      if (data.success) setEmployees(data.data); 
    } catch { 
      console.error('Error fetching employees'); 
    }
  };

  const fetchPayments = async () => {
    try { 
      const res = await fetch('/api/accounting/payroll/salaries'); 
      const data = await res.json(); 
      if (data.success) setPayments(data.data); 
    } catch { 
      console.error('Error fetching payments'); 
    } finally { 
      setLoading(false); 
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedEmployee) { 
      setError(t('selectEmployee')); 
      return; 
    }
    setSaving(true);
    try {
      const res = await fetch('/api/accounting/payroll/salaries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          employeeId: selectedEmployee, 
          ...form, 
          baseSalary: 0, 
          allowances: {}, 
          bonuses: {}, 
          deductions: {} 
        }),
      });
      const data = await res.json();
      if (data.success) { 
        alert(tAccounting('salaryPaymentAdded') || 'تم التسجيل'); 
        setShowForm(false); 
        setSelectedEmployee(''); 
        setForm({ 
          period: '', 
          paymentDate: new Date().toISOString().split('T')[0], 
          paymentMethod: 'bank_transfer', 
          bankReference: '', 
          notes: '' 
        }); 
        fetchPayments(); 
      } else {
        setError(data.message);
      }
    } catch { 
      setError(t('error')); 
    } finally { 
      setSaving(false); 
    }
  };

  const formatDate = (d: string) => new Date(d).toLocaleDateString(locale === 'ar' ? 'ar-DZ' : 'en-US');
  const formatAmount = (a: number) => a.toLocaleString('ar-DZ') + ' ' + t('currency');

  const getPaymentMethodLabel = (method: string): string => {
    switch(method) {
      case 'bank_transfer': return tAccounting('bankTransfer');
      case 'cash': return tAccounting('cash');
      case 'check': return tAccounting('check');
      default: return method;
    }
  };

  return (
    <div>
      <div className={styles.addButtonContainer}>
        <button onClick={() => setShowForm(!showForm)} className={styles.addButton}>
          + {tAccounting('addSalaryPayment')}
        </button>
      </div>

      {error && (
        <div className={styles.errorMessage}>
          <p className={styles.errorText}>{error}</p>
        </div>
      )}

      {showForm && (
        <div className={styles.formContainer}>
          <h2 className={styles.formTitle}>{tAccounting('addSalaryPayment')}</h2>
          <form onSubmit={handleSubmit} className={styles.formGrid}>
            <div className={styles.formFieldFull}>
              <label className={styles.formLabel}>{t('employee')} *</label>
              <select 
                required 
                value={selectedEmployee} 
                onChange={(e) => setSelectedEmployee(e.target.value)} 
                className={styles.formSelect}
              >
                <option value="">{t('selectEmployee')}</option>
                {employees.map((emp) => (
                  <option key={emp._id} value={emp._id}>
                    {emp.employeeCode} - {emp.fullName}
                  </option>
                ))}
              </select>
            </div>

            <div className={styles.formFieldFull}>
              <label className={styles.formLabel}>{tAccounting('period')} *</label>
              <input 
                type="text" 
                required 
                value={form.period} 
                onChange={(e) => setForm({ ...form, period: e.target.value })} 
                placeholder="2024-01" 
                className={styles.formInput} 
              />
            </div>

            <div className={styles.formFieldFull}>
              <label className={styles.formLabel}>{tAccounting('paymentDate')} *</label>
              <input 
                type="date" 
                required 
                value={form.paymentDate} 
                onChange={(e) => setForm({ ...form, paymentDate: e.target.value })} 
                className={styles.formInput} 
              />
            </div>

            <div className={styles.formFieldFull}>
              <label className={styles.formLabel}>{tAccounting('paymentMethod')} *</label>
              <select 
                value={form.paymentMethod} 
                onChange={(e) => setForm({ ...form, paymentMethod: e.target.value })} 
                className={styles.formSelect}
              >
                <option value="bank_transfer">{tAccounting('bankTransfer')}</option>
                <option value="cash">{tAccounting('cash')}</option>
                <option value="check">{tAccounting('check')}</option>
              </select>
            </div>

            <div className={styles.formFieldFull}>
              <label className={styles.formLabel}>{tAccounting('paymentReference')}</label>
              <input 
                type="text" 
                value={form.bankReference} 
                onChange={(e) => setForm({ ...form, bankReference: e.target.value })} 
                className={styles.formInput} 
              />
            </div>

            <div className={styles.formFieldFull}>
              <label className={styles.formLabel}>{t('notes')}</label>
              <textarea 
                value={form.notes} 
                onChange={(e) => setForm({ ...form, notes: e.target.value })} 
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

      <div className={styles.tableContainer}>
        <table className={styles.table}>
          <thead>
            <tr className={styles.tableHeader}>
              <th className={styles.tableHeaderCell}>{tAccounting('paymentNumber')}</th>
              <th className={styles.tableHeaderCell}>{t('employee')}</th>
              <th className={styles.tableHeaderCell}>{tAccounting('period')}</th>
              <th className={styles.tableHeaderCell}>{tAccounting('paymentDate')}</th>
              <th className={styles.tableHeaderCell}>{tAccounting('netSalary')}</th>
              <th className={styles.tableHeaderCell}>{tAccounting('paymentMethod')}</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={6} className={styles.loadingState}>{t('loading')}</td>
              </tr>
            ) : payments.length === 0 ? (
              <tr>
                <td colSpan={6} className={styles.emptyState}>{t('noData')}</td>
              </tr>
            ) : (
              payments.map((p) => (
                <tr key={p._id} className={styles.tableRow}>
                  <td className={styles.tableCell}>{p.paymentNumber}</td>
                  <td className={`${styles.tableCell} ${styles.cellName}`}>{p.employeeId?.employeeName}</td>
                  <td className={styles.tableCell}>{p.period}</td>
                  <td className={styles.tableCell}>{formatDate(p.paymentDate)}</td>
                  <td className={`${styles.tableCell} ${styles.cellAmount}`}>{formatAmount(p.netSalary)}</td>
                  <td className={styles.tableCell}>{getPaymentMethodLabel(p.paymentMethod)}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}