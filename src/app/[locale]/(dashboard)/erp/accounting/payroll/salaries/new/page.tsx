// src/app/[locale]/(dashboard)/erp/accounting/payroll/salaries/new/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { ArrowRight, DollarSign, User, Calendar, Banknote } from 'lucide-react';
import styles from '@/styles/pages/accounting/payroll.module.css';

interface Employee {
  _id: string;
  employeeCode: string;
  employeeName: string;
  department: string;
  position: string;
  baseSalary: number;
}

interface FormData {
  paymentNumber: string;
  employeeId: string;
  period: string;
  paymentDate: string;
  paymentMethod: string;
  bankReference: string;
  notes: string;
}

export default function NewSalaryPaymentPage() {
  const router = useRouter();
  const t = useTranslations('Common');
  const tAccounting = useTranslations('Accounting');
  
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [form, setForm] = useState<FormData>({
    paymentNumber: `SAL-${Date.now()}`,
    employeeId: '',
    period: '',
    paymentDate: new Date().toISOString().split('T')[0],
    paymentMethod: 'bank_transfer',
    bankReference: '',
    notes: '',
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchEmployees();
  }, []);

  useEffect(() => {
    if (form.employeeId) {
      const emp = employees.find(e => e._id === form.employeeId);
      setSelectedEmployee(emp || null);
    } else {
      setSelectedEmployee(null);
    }
  }, [form.employeeId, employees]);

  const fetchEmployees = async () => {
    try {
      const res = await fetch('/api/accounting/payroll/employees?isActive=true');
      const data = await res.json();
      if (data.success) {
        setEmployees(data.data);
      }
    } catch {
      // Ignorer
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);

    if (!form.employeeId) {
      setError('الرجاء اختيار الموظف');
      setSaving(false);
      return;
    }

    try {
      const res = await fetch('/api/accounting/payroll/salaries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          baseSalary: selectedEmployee?.baseSalary || 0,
        }),
      });

      const data = await res.json();

      if (data.success) {
        alert(t('addSuccess'));
        router.push('/erp/accounting/payroll/salaries');
      } else {
        setError(data.message);
      }
    } catch {
      setError(t('error'));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className={styles.page}>
      <div className={styles.container}>
        <div className={styles.header}>
          <div>
            <h1 className={styles.title}>
              <DollarSign className="inline-block w-6 h-6 ml-2 text-[#1ABC9C]" />
              {tAccounting('addSalaryPayment')}
            </h1>
            <p className={styles.subtitle}>
              {tAccounting('addSalaryPaymentDescription')}
            </p>
          </div>
          <button onClick={() => router.back()} className={styles.cancelButton}>
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
                <label className={styles.formLabel}>{tAccounting('paymentNumber')} *</label>
                <input
                  type="text"
                  required
                  value={form.paymentNumber}
                  onChange={(e) => setForm({ ...form, paymentNumber: e.target.value })}
                  className={styles.formInput}
                />
              </div>

              <div className={styles.formGroup}>
                <label className={styles.formLabel}>{tAccounting('employee')} *</label>
                <select
                  required
                  value={form.employeeId}
                  onChange={(e) => setForm({ ...form, employeeId: e.target.value })}
                  className={styles.formSelect}
                >
                  <option value="">اختر الموظف</option>
                  {employees.map((emp) => (
                    <option key={emp._id} value={emp._id}>
                      {emp.employeeCode} - {emp.employeeName} ({emp.department})
                    </option>
                  ))}
                </select>
              </div>

              <div className={styles.formGroup}>
                <label className={styles.formLabel}>{tAccounting('period')} *</label>
                <input
                  type="text"
                  required
                  value={form.period}
                  onChange={(e) => setForm({ ...form, period: e.target.value })}
                  placeholder="مثال: 2024-01"
                  className={styles.formInput}
                />
              </div>

              <div className={styles.formGroup}>
                <label className={styles.formLabel}>{tAccounting('paymentDate')} *</label>
                <input
                  type="date"
                  required
                  value={form.paymentDate}
                  onChange={(e) => setForm({ ...form, paymentDate: e.target.value })}
                  className={styles.formInput}
                />
              </div>

              <div className={styles.formGroup}>
                <label className={styles.formLabel}>{tAccounting('paymentMethod')} *</label>
                <select
                  required
                  value={form.paymentMethod}
                  onChange={(e) => setForm({ ...form, paymentMethod: e.target.value })}
                  className={styles.formSelect}
                >
                  <option value="bank_transfer">تحويل بنكي</option>
                  <option value="cash">نقدي</option>
                  <option value="check">شيك</option>
                </select>
              </div>

              <div className={styles.formGroup}>
                <label className={styles.formLabel}>{tAccounting('bankReference')}</label>
                <input
                  type="text"
                  value={form.bankReference}
                  onChange={(e) => setForm({ ...form, bankReference: e.target.value })}
                  className={styles.formInput}
                  placeholder="رقم الإذن / رقم الشيك"
                />
              </div>

              <div className={styles.formGroup}>
                <label className={styles.formLabel}>{tAccounting('notes')}</label>
                <textarea
                  value={form.notes}
                  onChange={(e) => setForm({ ...form, notes: e.target.value })}
                  className={styles.formInput}
                  rows={3}
                />
              </div>

              {selectedEmployee && (
                <div className={styles.formGroup}>
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <h3 className="font-bold mb-2">{tAccounting('salaryDetails')}</h3>
                    <div className="space-y-1 text-sm">
                      <p><span className="text-gray-500">{tAccounting('baseSalary')}:</span> {selectedEmployee.baseSalary.toLocaleString()} دج</p>
                      <p><span className="text-gray-500">{tAccounting('department')}:</span> {selectedEmployee.department}</p>
                      <p><span className="text-gray-500">{tAccounting('position')}:</span> {selectedEmployee.position}</p>
                    </div>
                  </div>
                </div>
              )}

              <div className={styles.formActions}>
                <button type="submit" disabled={saving} className={styles.saveButton}>
                  {saving ? t('saving') : t('save')}
                </button>
                <button type="button" onClick={() => router.back()} className={styles.cancelButton}>
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