// src/app/[locale]/(dashboard)/erp/accounting/payroll/employees/[id]/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { ArrowRight, Users, Save } from 'lucide-react';
import styles from '@/styles/pages/accounting/payroll.module.css';

interface FormData {
  employeeCode: string;
  employeeName: string;
  department: string;
  position: string;
  hireDate: string;
  baseSalary: number;
  bankAccount: string;
  socialSecurityNumber: string;
  taxRegistrationNumber: string;
  isActive: boolean;
}

export default function EditPayrollEmployeePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const router = useRouter();
  const t = useTranslations('Common');
  const tAccounting = useTranslations('Accounting');
  
  const [form, setForm] = useState<FormData>({
    employeeCode: '',
    employeeName: '',
    department: '',
    position: '',
    hireDate: '',
    baseSalary: 0,
    bankAccount: '',
    socialSecurityNumber: '',
    taxRegistrationNumber: '',
    isActive: true,
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchEmployee();
  }, []);

  const fetchEmployee = async () => {
    try {
      const { id } = await params;
      const res = await fetch(`/api/accounting/payroll/employees/${id}`);
      const data = await res.json();
      if (data.success) {
        const emp = data.data.employee;
        setForm({
          employeeCode: emp.employeeCode,
          employeeName: emp.employeeName,
          department: emp.department,
          position: emp.position,
          hireDate: emp.hireDate.split('T')[0],
          baseSalary: emp.baseSalary,
          bankAccount: emp.bankAccount,
          socialSecurityNumber: emp.socialSecurityNumber,
          taxRegistrationNumber: emp.taxRegistrationNumber,
          isActive: emp.isActive,
        });
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
    setSaving(true);
    setError(null);

    try {
      const { id } = await params;
      const res = await fetch(`/api/accounting/payroll/employees/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });

      const data = await res.json();

      if (data.success) {
        alert(t('editSuccess'));
        router.push('/erp/accounting/payroll/employees');
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
              <Users className="inline-block w-6 h-6 ml-2 text-[#1ABC9C]" />
              {tAccounting('editEmployee')}
            </h1>
            <p className={styles.subtitle}>
              {tAccounting('editEmployeeDescription')}
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
                <label className={styles.formLabel}>{tAccounting('employeeCode')} *</label>
                <input
                  type="text"
                  required
                  value={form.employeeCode}
                  onChange={(e) => setForm({ ...form, employeeCode: e.target.value })}
                  className={styles.formInput}
                />
              </div>

              <div className={styles.formGroup}>
                <label className={styles.formLabel}>{tAccounting('employeeName')} *</label>
                <input
                  type="text"
                  required
                  value={form.employeeName}
                  onChange={(e) => setForm({ ...form, employeeName: e.target.value })}
                  className={styles.formInput}
                />
              </div>

              <div className={styles.formGroup}>
                <label className={styles.formLabel}>{tAccounting('department')} *</label>
                <select
                  required
                  value={form.department}
                  onChange={(e) => setForm({ ...form, department: e.target.value })}
                  className={styles.formSelect}
                >
                  <option value="إنتاج">إنتاج</option>
                  <option value="صيانة">صيانة</option>
                  <option value="مبيعات">مبيعات</option>
                  <option value="مشتريات">مشتريات</option>
                  <option value="مالية">مالية</option>
                  <option value="موارد بشرية">موارد بشرية</option>
                </select>
              </div>

              <div className={styles.formGroup}>
                <label className={styles.formLabel}>{tAccounting('position')} *</label>
                <input
                  type="text"
                  required
                  value={form.position}
                  onChange={(e) => setForm({ ...form, position: e.target.value })}
                  className={styles.formInput}
                />
              </div>

              <div className={styles.formGroup}>
                <label className={styles.formLabel}>{tAccounting('hireDate')} *</label>
                <input
                  type="date"
                  required
                  value={form.hireDate}
                  onChange={(e) => setForm({ ...form, hireDate: e.target.value })}
                  className={styles.formInput}
                />
              </div>

              <div className={styles.formGroup}>
                <label className={styles.formLabel}>{tAccounting('baseSalary')} *</label>
                <input
                  type="number"
                  required
                  value={form.baseSalary}
                  onChange={(e) => setForm({ ...form, baseSalary: Number(e.target.value) })}
                  className={styles.formInput}
                />
              </div>

              <div className={styles.formGroup}>
                <label className={styles.formLabel}>{tAccounting('bankAccount')} *</label>
                <input
                  type="text"
                  required
                  value={form.bankAccount}
                  onChange={(e) => setForm({ ...form, bankAccount: e.target.value })}
                  className={styles.formInput}
                />
              </div>

              <div className={styles.formGroup}>
                <label className={styles.formLabel}>{tAccounting('socialSecurityNumber')} *</label>
                <input
                  type="text"
                  required
                  value={form.socialSecurityNumber}
                  onChange={(e) => setForm({ ...form, socialSecurityNumber: e.target.value })}
                  className={styles.formInput}
                />
              </div>

              <div className={styles.formGroup}>
                <label className={styles.formLabel}>{tAccounting('taxRegistrationNumber')} *</label>
                <input
                  type="text"
                  required
                  value={form.taxRegistrationNumber}
                  onChange={(e) => setForm({ ...form, taxRegistrationNumber: e.target.value })}
                  className={styles.formInput}
                />
              </div>

              <div className={styles.formGroup}>
                <label className={styles.formLabel}>{t('status')}</label>
                <select
                  value={form.isActive ? 'true' : 'false'}
                  onChange={(e) => setForm({ ...form, isActive: e.target.value === 'true' })}
                  className={styles.formSelect}
                >
                  <option value="true">{t('active')}</option>
                  <option value="false">{t('inactive')}</option>
                </select>
              </div>

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