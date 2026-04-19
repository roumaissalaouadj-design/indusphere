'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations, useLocale } from 'next-intl';
import styles from '@/styles/pages/hr-edit.module.css';

interface Employee {
  _id: string;
  employeeCode: string;
  fullName: string;
  email: string;
  position: string;
  department: string;
  salary: number;
  hireDate: string;
  status: 'active' | 'inactive';
  phone: string;
}

export default function EditEmployeePage({
  params,
}: {
  params: Promise<{ id: string; locale: string }>;
}) {
  const router = useRouter();
  const locale = useLocale();
  const t = useTranslations('Common');
  
  const [employee, setEmployee] = useState<Employee | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [emailError, setEmailError] = useState('');

  useEffect(() => {
    fetchEmployee();
  }, []);

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@([^\s@]+\.)+[^\s@]+$/;
    return emailRegex.test(email);
  };

  const fetchEmployee = async () => {
    try {
      const { id } = await params;
      const res = await fetch(`/api/employees/${id}`);
      const data = await res.json();
      if (data.success) {
        setEmployee(data.data);
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
    if (!employee) return;

    if (employee.email && !validateEmail(employee.email)) {
      setEmailError(t('invalidEmail'));
      return;
    }

    setSaving(true);
    setError(null);

    try {
      const { id } = await params;
      // ✅ استخدام PUT (الآن API يدعم PUT)
      const res = await fetch(`/api/employees/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(employee),
      });
      const data = await res.json();
      if (data.success) {
        alert(t('editSuccess'));
        router.push(`/${locale}/erp/hr`);
      } else {
        setError(data.message);
      }
    } catch {
      setError(t('error'));
    } finally {
      setSaving(false);
    }
  };

  // تنسيق التاريخ للعرض
  const formatDateForInput = (dateString: string) => {
    if (!dateString) return '';
    return dateString.split('T')[0];
  };

  if (loading) {
    return (
      <div className={styles.page}>
        <div className={styles.container}>
          <div className={styles.loadingState}>{t('loading')}</div>
        </div>
      </div>
    );
  }

  if (error || !employee) {
    return (
      <div className={styles.page}>
        <div className={styles.container}>
          <div className={styles.errorState}>{error || t('noData')}</div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <div className={styles.container}>
        <div className={styles.header}>
          <h1 className={styles.title}>تعديل بيانات الموظف</h1>
          <button onClick={() => router.push(`/${locale}/erp/hr`)} className={styles.cancelButton}>
            {t('cancel')}
          </button>
        </div>

        {error && (
          <div className={styles.errorMessage}>
            <p className={styles.errorText}>{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className={styles.formContainer}>
          <div className={styles.formGrid}>
            <div className={styles.formGroup}>
              <label className={styles.formLabel}>رمز الموظف *</label>
              <input
                type="text"
                required
                value={employee.employeeCode}
                onChange={(e) => setEmployee({ ...employee, employeeCode: e.target.value })}
                className={styles.formInput}
              />
            </div>

            <div className={styles.formGroup}>
              <label className={styles.formLabel}>الاسم الكامل *</label>
              <input
                type="text"
                required
                value={employee.fullName}
                onChange={(e) => setEmployee({ ...employee, fullName: e.target.value })}
                className={styles.formInput}
              />
            </div>

            <div className={styles.formGroup}>
              <label className={styles.formLabel}>البريد الإلكتروني</label>
              <input
                type="email"
                value={employee.email || ''}
                onChange={(e) => setEmployee({ ...employee, email: e.target.value })}
                className={`${styles.formInput} ${emailError ? styles.formInputError : ''}`}
              />
              {emailError && <p className={styles.errorText}>{emailError}</p>}
            </div>

            <div className={styles.formGroup}>
              <label className={styles.formLabel}>المنصب *</label>
              <input
                type="text"
                required
                value={employee.position}
                onChange={(e) => setEmployee({ ...employee, position: e.target.value })}
                className={styles.formInput}
              />
            </div>

            <div className={styles.formGroup}>
              <label className={styles.formLabel}>القسم *</label>
              <input
                type="text"
                required
                value={employee.department}
                onChange={(e) => setEmployee({ ...employee, department: e.target.value })}
                className={styles.formInput}
              />
            </div>

            <div className={styles.formGroup}>
              <label className={styles.formLabel}>الراتب (دج) *</label>
              <input
                type="number"
                required
                value={employee.salary}
                onChange={(e) => setEmployee({ ...employee, salary: Number(e.target.value) })}
                className={styles.formInput}
              />
            </div>

            <div className={styles.formGroup}>
              <label className={styles.formLabel}>الهاتف</label>
              <input
                type="text"
                value={employee.phone || ''}
                onChange={(e) => setEmployee({ ...employee, phone: e.target.value })}
                className={styles.formInput}
              />
            </div>

            <div className={styles.formGroup}>
              <label className={styles.formLabel}>تاريخ التوظيف *</label>
              <input
                type="date"
                required
                value={formatDateForInput(employee.hireDate)}
                onChange={(e) => setEmployee({ ...employee, hireDate: e.target.value })}
                className={styles.formInput}
              />
            </div>

            <div className={styles.formGroup}>
              <label className={styles.formLabel}>الحالة</label>
              <select
                value={employee.status}
                onChange={(e) => setEmployee({ ...employee, status: e.target.value as 'active' | 'inactive' })}
                className={styles.formSelect}
              >
                <option value="active">نشط</option>
                <option value="inactive">غير نشط</option>
              </select>
            </div>

            <div className={styles.formActions}>
              <button type="submit" disabled={saving} className={styles.saveButton}>
                {saving ? t('saving') : t('save')}
              </button>
              <button type="button" onClick={() => router.push(`/${locale}/erp/hr`)} className={styles.cancelButton}>
                {t('cancel')}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}