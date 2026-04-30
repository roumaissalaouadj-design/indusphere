'use client';

import { use } from 'react';
import { useTranslations } from 'next-intl';

type Props = {
  params: Promise<{ locale: string }>;
};
// src/components/hr/EmployeesTab.tsx
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import TableActions from '@/components/TableActions';
import styles from '@/styles/pages/hr.module.css';

interface Employee {
  _id: string;
  employeeCode: string;
  fullName: string;
  email: string;
  position: string;
  department: string;
  hireDate: string;
  status: 'active' | 'inactive';
  phone: string;
  // ✅ حقول جديدة
  bankAccount?: string;
  socialSecurityNumber?: string;
  taxNumber?: string;
}

export default function EmployeesTab({ params }: Props) {
  const router = useRouter();
  const { locale } = use(params);
  const t = useTranslations('Common');
  
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    employeeCode: '',
    fullName: '',
    email: '',
    position: '',
    department: '',
    phone: '',
    hireDate: new Date().toISOString().split('T')[0],
    status: 'active',
    // ✅ حقول جديدة
    bankAccount: '',
    socialSecurityNumber: '',
    taxNumber: '',
  });
  const [saving, setSaving] = useState(false);
  const [emailError, setEmailError] = useState('');

  useEffect(() => { fetchEmployees(); }, []);

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@([^\s@]+\.)+[^\s@]+$/;
    return emailRegex.test(email);
  };

  const fetchEmployees = async () => {
    try {
      const res = await fetch('/api/employees');
      const data = await res.json();
      if (data.success) setEmployees(data.data);
    } finally { setLoading(false); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm(t('deleteConfirm'))) return;
    
    const res = await fetch(`/api/employees/${id}`, { method: 'DELETE' });
    const data = await res.json();
    if (data.success) {
      await fetchEmployees();
      alert(t('deleteSuccess'));
    } else {
      alert(data.message || t('deleteFailed'));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (form.email && !validateEmail(form.email)) {
      setEmailError(t('invalidEmail'));
      return;
    }
    
    setSaving(true);
    try {
      const res = await fetch('/api/employees', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (data.success) {
        await fetchEmployees();
        setShowForm(false);
        setForm({ 
          employeeCode: '', fullName: '', email: '', position: '', 
          department: '', phone: '', 
          hireDate: new Date().toISOString().split('T')[0], 
          status: 'active',
          bankAccount: '',
          socialSecurityNumber: '',
          taxNumber: '',
        });
        setEmailError('');
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

  return (
    <div>
      {/* Add Button */}
      <div className={styles.addButtonContainer}>
        <button onClick={() => setShowForm(!showForm)} className={styles.addButton}>
          + {t('addEmployee')}
        </button>
      </div>

      {/* Add Employee Form */}
      {showForm && (
        <div className={styles.formContainer}>
          <h2 className={styles.formTitle}>{t('addEmployee')}</h2>
          <form onSubmit={handleSubmit} className={styles.formGrid}>
            <div>
              <label className={styles.formLabel}>{t('employeeCode')} *</label>
              <input required value={form.employeeCode} onChange={e => setForm({ ...form, employeeCode: e.target.value })}
                placeholder="EMP-001" dir="ltr" className={styles.formInput} />
            </div>
            <div>
              <label className={styles.formLabel}>{t('fullName')} *</label>
              <input required value={form.fullName} onChange={e => setForm({ ...form, fullName: e.target.value })}
                placeholder={t('fullNamePlaceholder')} className={styles.formInput} />
            </div>
            <div>
              <label className={styles.formLabel}>{t('email')}</label>
              <input type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })}
                placeholder="user@company.com" dir="ltr"
                className={`${styles.formInput} ${emailError ? styles.formInputError : ''}`} />
              {emailError && <p className={styles.errorText}>{emailError}</p>}
            </div>
            <div>
              <label className={styles.formLabel}>{t('position')} *</label>
              <input required value={form.position} onChange={e => setForm({ ...form, position: e.target.value })}
                placeholder={t('positionPlaceholder')} className={styles.formInput} />
            </div>
            <div>
              <label className={styles.formLabel}>{t('department')} *</label>
              <input required value={form.department} onChange={e => setForm({ ...form, department: e.target.value })}
                placeholder={t('departmentPlaceholder')} className={styles.formInput} />
            </div>
            <div>
              <label className={styles.formLabel}>{t('phone')}</label>
              <input value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })}
                placeholder="0555 000 000" dir="ltr" className={styles.formInput} />
            </div>
            <div>
              <label className={styles.formLabel}>{t('hireDate')} *</label>
              <input type="date" required value={form.hireDate} onChange={e => setForm({ ...form, hireDate: e.target.value })}
                dir="ltr" className={styles.formInput} />
            </div>
            <div>
              <label className={styles.formLabel}>{t('status')}</label>
              <select value={form.status} onChange={e => setForm({ ...form, status: e.target.value })} className={styles.formSelect}>
                <option value="active">{t('active')}</option>
                <option value="inactive">{t('inactive')}</option>
              </select>
            </div>

            {/* ✅ حقول جديدة للرواتب */}
            <div>
              <label className={styles.formLabel}>الحساب البنكي</label>
              <input value={form.bankAccount} onChange={e => setForm({ ...form, bankAccount: e.target.value })}
                placeholder="1234 5678 9012 3456" dir="ltr" className={styles.formInput} />
            </div>
            <div>
              <label className={styles.formLabel}>رقم الضمان الاجتماعي</label>
              <input value={form.socialSecurityNumber} onChange={e => setForm({ ...form, socialSecurityNumber: e.target.value })}
                placeholder="123456789" dir="ltr" className={styles.formInput} />
            </div>
            <div>
              <label className={styles.formLabel}>الرقم الضريبي</label>
              <input value={form.taxNumber} onChange={e => setForm({ ...form, taxNumber: e.target.value })}
                placeholder="1234567890" dir="ltr" className={styles.formInput} />
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

      {/* Employees Table */}
      <div className={styles.tableContainer}>
        <table className={styles.table}>
          <thead>
            <tr className={styles.tableHeader}>
              <th className={styles.tableHeaderCell}>{t('code')}</th>
              <th className={styles.tableHeaderCell}>{t('name')}</th>
              <th className={styles.tableHeaderCell}>{t('email')}</th>
              <th className={styles.tableHeaderCell}>{t('position')}</th>
              <th className={styles.tableHeaderCell}>{t('department')}</th>
              <th className={styles.tableHeaderCell}>{t('hireDate')}</th>
              <th className={styles.tableHeaderCell}>{t('status')}</th>
              <th className={styles.tableHeaderCell}>{t('actions')}</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={8} className={styles.loadingState}>{t('loading')}</td>
              </tr>
            ) : employees.length === 0 ? (
              <tr>
                <td colSpan={8} className={styles.emptyState}>{t('noData')}</td>
              </tr>
            ) : (
              employees.map((emp) => (
                <tr key={emp._id} className={styles.tableRow}>
                  <td className={`${styles.tableCell} ${styles.cellCode}`}>{emp.employeeCode}</td>
                  <td className={`${styles.tableCell} ${styles.cellName}`}>{emp.fullName}</td>
                  <td className={`${styles.tableCell} ${styles.cellText}`}>{emp.email || '—'}</td>
                  <td className={`${styles.tableCell} ${styles.cellText}`}>{emp.position}</td>
                  <td className={`${styles.tableCell} ${styles.cellText}`}>{emp.department}</td>
                  <td className={`${styles.tableCell} ${styles.cellText}`}>{new Date(emp.hireDate).toLocaleDateString('ar')}</td>
                  <td className={styles.tableCell}>
                    <span className={emp.status === 'active' ? styles.statusActive : styles.statusInactive}>
                      {emp.status === 'active' ? t('active') : t('inactive')}
                    </span>
                  </td>
                  <td className={styles.tableCell}>
                    <TableActions
                      id={emp._id}
                      editUrl={`/${locale}/erp/hr/${emp._id}/edit`}
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