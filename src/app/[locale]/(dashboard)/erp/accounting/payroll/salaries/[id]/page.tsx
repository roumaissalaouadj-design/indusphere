// src/app/[locale]/(dashboard)/erp/accounting/payroll/salaries/[id]/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { ArrowRight, DollarSign, User, Calendar, Banknote, Printer, Download } from 'lucide-react';
import styles from '@/styles/pages/accounting/payroll.module.css';

interface SalaryPayment {
  _id: string;
  paymentNumber: string;
  employeeId: {
    _id: string;
    employeeName: string;
    employeeCode: string;
    department: string;
    position: string;
    bankAccount: string;
  };
  period: string;
  paymentDate: string;
  baseSalary: number;
  allowances: {
    housing: number;
    transport: number;
    food: number;
    seniority: number;
    responsibility: number;
    other: number;
  };
  bonuses: {
    performance: number;
    attendance: number;
    production: number;
    other: number;
  };
  deductions: {
    socialSecurity: number;
    tax: number;
    loan: number;
    insurance: number;
    other: number;
  };
  totalAllowances: number;
  totalBonuses: number;
  totalDeductions: number;
  grossSalary: number;
  netSalary: number;
  paymentMethod: string;
  bankReference: string;
  notes: string;
  createdBy: { name: string; email: string };
  createdAt: string;
}

export default function SalaryPaymentDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const router = useRouter();
  const t = useTranslations('Common');
  const tAccounting = useTranslations('Accounting');
  
  const [payment, setPayment] = useState<SalaryPayment | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchPayment();
  }, []);

  const fetchPayment = async () => {
    try {
      const { id } = await params;
      const res = await fetch(`/api/accounting/payroll/salaries/${id}`);
      const data = await res.json();
      if (data.success) {
        setPayment(data.data);
      } else {
        setError(data.message);
      }
    } catch {
      setError(t('fetchError'));
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ar-DZ');
  };

  const formatAmount = (amount: number) => {
    return amount.toLocaleString('ar-DZ') + ' دج';
  };

  const handlePrint = () => {
    window.print();
  };

  const handleExport = () => {
    if (!payment) return;
    
    const csvContent = `البيان,القيمة\n
رقم الدفعة,${payment.paymentNumber}\n
الموظف,${payment.employeeId?.employeeName}\n
الفترة,${payment.period}\n
تاريخ الدفع,${formatDate(payment.paymentDate)}\n
الراتب الأساسي,${formatAmount(payment.baseSalary)}\n
البدلات,${formatAmount(payment.totalAllowances)}\n
المكافآت,${formatAmount(payment.totalBonuses)}\n
إجمالي الراتب,${formatAmount(payment.grossSalary)}\n
الاستقطاعات,${formatAmount(payment.totalDeductions)}\n
صافي الراتب,${formatAmount(payment.netSalary)}\n
طريقة الدفع,${payment.paymentMethod}\n`;

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.href = url;
    link.setAttribute('download', `salary_${payment.paymentNumber}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
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

  if (!payment) {
    return (
      <div className={styles.page}>
        <div className={styles.container}>
          <div className={styles.emptyState}>
            <DollarSign className="w-12 h-12 mx-auto mb-2 text-gray-400" />
            {t('noData')}
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
              <DollarSign className="inline-block w-6 h-6 ml-2 text-[#1ABC9C]" />
              {tAccounting('salaryPaymentDetails')}
            </h1>
            <p className={styles.subtitle}>
              {tAccounting('paymentNumber')}: {payment.paymentNumber}
            </p>
          </div>
          <div className="flex gap-2">
            <button onClick={handlePrint} className={styles.addButton} style={{ backgroundColor: '#6c757d' }}>
              <Printer className="w-4 h-4" />
              {tAccounting('print')}
            </button>
            <button onClick={handleExport} className={styles.addButton} style={{ backgroundColor: '#28a745' }}>
              <Download className="w-4 h-4" />
              {tAccounting('export')}
            </button>
            <button onClick={() => router.back()} className={styles.cancelButton}>
              <ArrowRight className="w-4 h-4 ml-1" />
              {t('back')}
            </button>
          </div>
        </div>

        {error && (
          <div className={styles.errorMessage}>
            <p className={styles.errorText}>{error}</p>
          </div>
        )}

        {/* Employee Info */}
        <div className={styles.section}>
          <h2 className={styles.sectionTitle}>{tAccounting('employeeInfo')}</h2>
          <div className={styles.sectionGrid}>
            <div>
              <label className={styles.formLabel}>{tAccounting('employeeName')}</label>
              <div className="font-bold">{payment.employeeId?.employeeName}</div>
            </div>
            <div>
              <label className={styles.formLabel}>{tAccounting('employeeCode')}</label>
              <div className="font-bold">{payment.employeeId?.employeeCode}</div>
            </div>
            <div>
              <label className={styles.formLabel}>{tAccounting('department')}</label>
              <div className="font-bold">{payment.employeeId?.department}</div>
            </div>
            <div>
              <label className={styles.formLabel}>{tAccounting('position')}</label>
              <div className="font-bold">{payment.employeeId?.position}</div>
            </div>
            <div>
              <label className={styles.formLabel}>{tAccounting('bankAccount')}</label>
              <div className="font-bold">{payment.employeeId?.bankAccount}</div>
            </div>
          </div>
        </div>

        {/* Payment Info */}
        <div className={styles.section}>
          <h2 className={styles.sectionTitle}>{tAccounting('paymentInfo')}</h2>
          <div className={styles.sectionGrid}>
            <div>
              <label className={styles.formLabel}>{tAccounting('period')}</label>
              <div className="font-bold">{payment.period}</div>
            </div>
            <div>
              <label className={styles.formLabel}>{tAccounting('paymentDate')}</label>
              <div className="font-bold">{formatDate(payment.paymentDate)}</div>
            </div>
            <div>
              <label className={styles.formLabel}>{tAccounting('paymentMethod')}</label>
              <div className="font-bold">
                {payment.paymentMethod === 'bank_transfer' ? 'تحويل بنكي' : 
                 payment.paymentMethod === 'cash' ? 'نقدي' : 'شيك'}
              </div>
            </div>
            <div>
              <label className={styles.formLabel}>{tAccounting('bankReference')}</label>
              <div className="font-bold">{payment.bankReference || '-'}</div>
            </div>
          </div>
        </div>

        {/* Salary Breakdown */}
        <div className={styles.section}>
          <h2 className={styles.sectionTitle}>{tAccounting('salaryBreakdown')}</h2>
          <div className={styles.sectionGrid}>
            <div>
              <label className={styles.formLabel}>{tAccounting('baseSalary')}</label>
              <div className="font-bold">{formatAmount(payment.baseSalary)}</div>
            </div>
            <div>
              <label className={styles.formLabel}>{tAccounting('allowances')}</label>
              <div className="font-bold">{formatAmount(payment.totalAllowances)}</div>
              <div className="text-sm text-gray-500 mt-1">
                <div>• سكن: {formatAmount(payment.allowances?.housing || 0)}</div>
                <div>• مواصلات: {formatAmount(payment.allowances?.transport || 0)}</div>
                <div>• غذاء: {formatAmount(payment.allowances?.food || 0)}</div>
                <div>• أقدمية: {formatAmount(payment.allowances?.seniority || 0)}</div>
                <div>• مسؤولية: {formatAmount(payment.allowances?.responsibility || 0)}</div>
              </div>
            </div>
            <div>
              <label className={styles.formLabel}>{tAccounting('bonuses')}</label>
              <div className="font-bold">{formatAmount(payment.totalBonuses)}</div>
              <div className="text-sm text-gray-500 mt-1">
                <div>• أداء: {formatAmount(payment.bonuses?.performance || 0)}</div>
                <div>• حضور: {formatAmount(payment.bonuses?.attendance || 0)}</div>
                <div>• إنتاج: {formatAmount(payment.bonuses?.production || 0)}</div>
              </div>
            </div>
            <div>
              <label className={styles.formLabel}>{tAccounting('deductions')}</label>
              <div className="font-bold">{formatAmount(payment.totalDeductions)}</div>
              <div className="text-sm text-gray-500 mt-1">
                <div>• ضمان اجتماعي: {formatAmount(payment.deductions?.socialSecurity || 0)}</div>
                <div>• ضريبة: {formatAmount(payment.deductions?.tax || 0)}</div>
                <div>• سلفة: {formatAmount(payment.deductions?.loan || 0)}</div>
                <div>• تأمين: {formatAmount(payment.deductions?.insurance || 0)}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Summary */}
        <div className={styles.section}>
          <h2 className={styles.sectionTitle}>{tAccounting('salarySummary')}</h2>
          <div className={styles.sectionGrid}>
            <div>
              <label className={styles.formLabel}>{tAccounting('grossSalary')}</label>
              <div className="text-xl font-bold text-[#1ABC9C]">{formatAmount(payment.grossSalary)}</div>
            </div>
            <div>
              <label className={styles.formLabel}>{tAccounting('totalDeductions')}</label>
              <div className="text-xl font-bold text-red-600">{formatAmount(payment.totalDeductions)}</div>
            </div>
            <div>
              <label className={styles.formLabel}>{tAccounting('netSalary')}</label>
              <div className="text-xl font-bold text-[#1ABC9C]">{formatAmount(payment.netSalary)}</div>
            </div>
          </div>
        </div>

        {/* Notes */}
        {payment.notes && (
          <div className={styles.section}>
            <h2 className={styles.sectionTitle}>{tAccounting('notes')}</h2>
            <p className="text-gray-600">{payment.notes}</p>
          </div>
        )}

        {/* Created By */}
        <div className={styles.section}>
          <h2 className={styles.sectionTitle}>{tAccounting('createdBy')}</h2>
          <div>
            <div>{payment.createdBy?.name || 'غير معروف'}</div>
            <div className="text-sm text-gray-500">{formatDate(payment.createdAt)}</div>
          </div>
        </div>
      </div>
    </div>
  );
}