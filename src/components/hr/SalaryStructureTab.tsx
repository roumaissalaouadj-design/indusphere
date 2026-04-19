'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import styles from '@/styles/pages/hr.module.css';

interface Employee {
  _id: string;
  employeeCode: string;
  fullName: string;
  position: string;
  department: string;
}

interface Allowances {
  housing: number;
  transport: number;
  food: number;
  seniority: number;
  responsibility: number;
  other: number;
}

interface Bonuses {
  performance: number;
  attendance: number;
  production: number;
  other: number;
}

interface Deductions {
  socialSecurity: number;
  tax: number;
  loan: number;
  insurance: number;
  other: number;
}

interface SalaryStructure {
  _id: string;
  employeeId: Employee | string;
  baseSalary: number;
  allowances: Allowances;
  bonuses: Bonuses;
  deductions: Deductions;
  totalAllowances: number;
  totalBonuses: number;
  totalDeductions: number;
  netSalary: number;
  isActive: boolean;
}

export default function SalaryStructureTab() {
  const t = useTranslations('Common');
  const tAccounting = useTranslations('Accounting');
  
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [structures, setStructures] = useState<SalaryStructure[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedEmployee, setSelectedEmployee] = useState<string>('');
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    baseSalary: 0,
    allowances: {
      housing: 0,
      transport: 0,
      food: 0,
      seniority: 0,
      responsibility: 0,
      other: 0,
    },
    bonuses: {
      performance: 0,
      attendance: 0,
      production: 0,
      other: 0,
    },
    deductions: {
      socialSecurity: 0,
      tax: 0,
      loan: 0,
      insurance: 0,
      other: 0,
    },
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchEmployees();
    fetchStructures();
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

  const fetchStructures = async () => {
    try {
      const res = await fetch('/api/accounting/payroll/salary-structures');
      const data = await res.json();
      if (data.success) setStructures(data.data);
    } catch {
      console.error('Error fetching salary structures');
    } finally {
      setLoading(false);
    }
  };

  const calculateTotals = () => {
    const totalAllowances = Object.values(form.allowances).reduce((a, b) => a + b, 0);
    const totalBonuses = Object.values(form.bonuses).reduce((a, b) => a + b, 0);
    const totalDeductions = Object.values(form.deductions).reduce((a, b) => a + b, 0);
    const grossSalary = form.baseSalary + totalAllowances + totalBonuses;
    const netSalary = grossSalary - totalDeductions;
    return { totalAllowances, totalBonuses, totalDeductions, grossSalary, netSalary };
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedEmployee) {
      setError(t('selectEmployee'));
      return;
    }

    setSaving(true);
    setError(null);

    try {
      const totals = calculateTotals();
      const res = await fetch('/api/accounting/payroll/salary-structures', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          employeeId: selectedEmployee,
          ...form,
          ...totals,
          isActive: true,
          effectiveFrom: new Date().toISOString().split('T')[0],
        }),
      });
      const data = await res.json();
      if (data.success) {
        alert(tAccounting('salaryStructureAdded') || 'تم إضافة هيكل الراتب بنجاح');
        setShowForm(false);
        setSelectedEmployee('');
        setForm({
          baseSalary: 0,
          allowances: { housing: 0, transport: 0, food: 0, seniority: 0, responsibility: 0, other: 0 },
          bonuses: { performance: 0, attendance: 0, production: 0, other: 0 },
          deductions: { socialSecurity: 0, tax: 0, loan: 0, insurance: 0, other: 0 },
        });
        fetchStructures();
      } else {
        setError(data.message);
      }
    } catch {
      setError(t('error'));
    } finally {
      setSaving(false);
    }
  };

  const totals = calculateTotals();

  const getEmployeeName = (employeeId: Employee | string): string => {
    if (!employeeId) return '—';
    if (typeof employeeId === 'object') {
      return employeeId.fullName || '—';
    }
    const emp = employees.find(e => e._id === employeeId);
    return emp?.fullName || '—';
  };

  const formatAmount = (amount: number): string => {
    return amount.toLocaleString('ar-DZ') + ' ' + t('currency');
  };

  return (
    <div>
      <div className={styles.addButtonContainer}>
        <button onClick={() => setShowForm(!showForm)} className={styles.addButton}>
          + {tAccounting('addSalaryStructure') || 'إضافة هيكل راتب'}
        </button>
      </div>

      {error && (
        <div className={styles.errorMessage}>
          <p className={styles.errorText}>{error}</p>
        </div>
      )}

      {showForm && (
        <div className={styles.formContainer}>
          <h2 className={styles.formTitle}>{tAccounting('addSalaryStructure') || 'إضافة هيكل راتب'}</h2>
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
                    {emp.employeeCode} - {emp.fullName} ({emp.position})
                  </option>
                ))}
              </select>
            </div>

            <div className={styles.formFieldFull}>
              <label className={styles.formLabel}>{tAccounting('baseSalary') || 'الراتب الأساسي'} *</label>
              <input
                type="number"
                required
                value={form.baseSalary}
                onChange={(e) => setForm({ ...form, baseSalary: Number(e.target.value) })}
                className={styles.formInput}
                min="0"
              />
            </div>

            <div className={styles.formFieldFull}>
              <h3 className={styles.sectionTitle}>{tAccounting('allowances') || 'البدلات'}</h3>
              <div className={styles.subGrid}>
                <div><label>{tAccounting('housingAllowance') || 'بدل سكن'}</label><input type="number" value={form.allowances.housing} onChange={(e) => setForm({ ...form, allowances: { ...form.allowances, housing: Number(e.target.value) } })} className={styles.formInput} /></div>
                <div><label>{tAccounting('transportAllowance') || 'بدل مواصلات'}</label><input type="number" value={form.allowances.transport} onChange={(e) => setForm({ ...form, allowances: { ...form.allowances, transport: Number(e.target.value) } })} className={styles.formInput} /></div>
                <div><label>{tAccounting('foodAllowance') || 'بدل غذاء'}</label><input type="number" value={form.allowances.food} onChange={(e) => setForm({ ...form, allowances: { ...form.allowances, food: Number(e.target.value) } })} className={styles.formInput} /></div>
                <div><label>{tAccounting('seniorityAllowance') || 'بدل أقدمية'}</label><input type="number" value={form.allowances.seniority} onChange={(e) => setForm({ ...form, allowances: { ...form.allowances, seniority: Number(e.target.value) } })} className={styles.formInput} /></div>
                <div><label>{tAccounting('responsibilityAllowance') || 'بدل مسؤولية'}</label><input type="number" value={form.allowances.responsibility} onChange={(e) => setForm({ ...form, allowances: { ...form.allowances, responsibility: Number(e.target.value) } })} className={styles.formInput} /></div>
                <div><label>{tAccounting('otherAllowances') || 'بدلات أخرى'}</label><input type="number" value={form.allowances.other} onChange={(e) => setForm({ ...form, allowances: { ...form.allowances, other: Number(e.target.value) } })} className={styles.formInput} /></div>
              </div>
            </div>

            <div className={styles.formFieldFull}>
              <h3 className={styles.sectionTitle}>{tAccounting('bonuses') || 'المكافآت'}</h3>
              <div className={styles.subGrid}>
                <div><label>{tAccounting('performanceBonus') || 'مكافأة أداء'}</label><input type="number" value={form.bonuses.performance} onChange={(e) => setForm({ ...form, bonuses: { ...form.bonuses, performance: Number(e.target.value) } })} className={styles.formInput} /></div>
                <div><label>{tAccounting('attendanceBonus') || 'مكافأة حضور'}</label><input type="number" value={form.bonuses.attendance} onChange={(e) => setForm({ ...form, bonuses: { ...form.bonuses, attendance: Number(e.target.value) } })} className={styles.formInput} /></div>
                <div><label>{tAccounting('productionBonus') || 'مكافأة إنتاج'}</label><input type="number" value={form.bonuses.production} onChange={(e) => setForm({ ...form, bonuses: { ...form.bonuses, production: Number(e.target.value) } })} className={styles.formInput} /></div>
                <div><label>{tAccounting('otherBonuses') || 'مكافآت أخرى'}</label><input type="number" value={form.bonuses.other} onChange={(e) => setForm({ ...form, bonuses: { ...form.bonuses, other: Number(e.target.value) } })} className={styles.formInput} /></div>
              </div>
            </div>

            <div className={styles.formFieldFull}>
              <h3 className={styles.sectionTitle}>{tAccounting('deductions') || 'الاستقطاعات'}</h3>
              <div className={styles.subGrid}>
                <div><label>{tAccounting('socialSecurity') || 'ضمان اجتماعي'}</label><input type="number" value={form.deductions.socialSecurity} onChange={(e) => setForm({ ...form, deductions: { ...form.deductions, socialSecurity: Number(e.target.value) } })} className={styles.formInput} /></div>
                <div><label>{tAccounting('tax') || 'ضريبة'}</label><input type="number" value={form.deductions.tax} onChange={(e) => setForm({ ...form, deductions: { ...form.deductions, tax: Number(e.target.value) } })} className={styles.formInput} /></div>
                <div><label>{tAccounting('loan') || 'سلفة'}</label><input type="number" value={form.deductions.loan} onChange={(e) => setForm({ ...form, deductions: { ...form.deductions, loan: Number(e.target.value) } })} className={styles.formInput} /></div>
                <div><label>{tAccounting('insurance') || 'تأمين'}</label><input type="number" value={form.deductions.insurance} onChange={(e) => setForm({ ...form, deductions: { ...form.deductions, insurance: Number(e.target.value) } })} className={styles.formInput} /></div>
                <div><label>{tAccounting('otherDeductions') || 'استقطاعات أخرى'}</label><input type="number" value={form.deductions.other} onChange={(e) => setForm({ ...form, deductions: { ...form.deductions, other: Number(e.target.value) } })} className={styles.formInput} /></div>
              </div>
            </div>

            <div className={styles.formFieldFull}>
              <div className={styles.summaryBox}>
                <h4>{tAccounting('salarySummary') || 'ملخص الراتب'}</h4>
                <div className={styles.summaryRow}><span>{tAccounting('totalAllowances') || 'إجمالي البدلات'}:</span><span>{formatAmount(totals.totalAllowances)}</span></div>
                <div className={styles.summaryRow}><span>{tAccounting('totalBonuses') || 'إجمالي المكافآت'}:</span><span>{formatAmount(totals.totalBonuses)}</span></div>
                <div className={styles.summaryRow}><span>{tAccounting('grossSalary') || 'إجمالي الراتب'}:</span><span>{formatAmount(totals.grossSalary)}</span></div>
                <div className={styles.summaryRow}><span>{tAccounting('totalDeductions') || 'إجمالي الاستقطاعات'}:</span><span>{formatAmount(totals.totalDeductions)}</span></div>
                <div className={styles.summaryRowTotal}><span>{tAccounting('netSalary') || 'صافي الراتب'}:</span><span>{formatAmount(totals.netSalary)}</span></div>
              </div>
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

      {/* Salary Structures Table */}
      <div className={styles.tableContainer}>
        <table className={styles.table}>
          <thead>
            <tr className={styles.tableHeader}>
              <th className={styles.tableHeaderCell}>{t('employee')}</th>
              <th className={styles.tableHeaderCell}>{tAccounting('baseSalary') || 'الراتب الأساسي'}</th>
              <th className={styles.tableHeaderCell}>{tAccounting('totalAllowances') || 'إجمالي البدلات'}</th>
              <th className={styles.tableHeaderCell}>{tAccounting('totalBonuses') || 'إجمالي المكافآت'}</th>
              <th className={styles.tableHeaderCell}>{tAccounting('totalDeductions') || 'إجمالي الاستقطاعات'}</th>
              <th className={styles.tableHeaderCell}>{tAccounting('netSalary') || 'صافي الراتب'}</th>
              <th className={styles.tableHeaderCell}>{t('status')}</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={7} className={styles.loadingState}>{t('loading')}</td>
              </tr>
            ) : structures.length === 0 ? (
              <tr>
                <td colSpan={7} className={styles.emptyState}>{t('noData')}</td>
              </tr>
            ) : (
              structures.map((struct) => (
                <tr key={struct._id} className={styles.tableRow}>
                  <td className={`${styles.tableCell} ${styles.cellName}`}>
                    {getEmployeeName(struct.employeeId)}
                  </td>
                  <td className={`${styles.tableCell} ${styles.cellAmount}`}>
                    {formatAmount(struct.baseSalary)}
                  </td>
                  <td className={`${styles.tableCell} ${styles.cellAmount}`}>
                    {formatAmount(struct.totalAllowances)}
                  </td>
                  <td className={`${styles.tableCell} ${styles.cellAmount}`}>
                    {formatAmount(struct.totalBonuses)}
                  </td>
                  <td className={`${styles.tableCell} ${styles.cellAmount}`}>
                    {formatAmount(struct.totalDeductions)}
                  </td>
                  <td className={`${styles.tableCell} ${styles.cellAmount}`}>
                    {formatAmount(struct.netSalary)}
                  </td>
                  <td className={styles.tableCell}>
                    <span className={struct.isActive ? styles.statusActive : styles.statusInactive}>
                      {struct.isActive ? t('active') : t('inactive')}
                    </span>
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