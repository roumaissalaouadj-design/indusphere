// src/app/[locale]/(dashboard)/erp/accounting/taxes/declarations/[id]/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { ArrowRight, FileText, Calendar, DollarSign, User, Printer, Download } from 'lucide-react';
import styles from '@/styles/pages/accounting/taxes.module.css';

interface TaxDeclaration {
  _id: string;
  declarationNumber: string;
  taxType: string;
  period: string;
  startDate: string;
  endDate: string;
  dueDate: string;
  taxableBase: number;
  taxRate: number;
  taxAmount: number;
  penalties: number;
  totalAmount: number;
  paidAmount: number;
  remainingAmount: number;
  status: string;
  paymentDate?: string;
  paymentReference?: string;
  notes: string;
  createdBy: { name: string; email: string };
  createdAt: string;
}

const taxTypeLabels: Record<string, string> = {
  TVA: 'TVA (ضريبة القيمة المضافة)',
  IRG: 'IRG (ضريبة الدخل)',
  IBS: 'IBS (ضريبة الأرباح)',
  other: 'أخرى',
};

const statusLabels: Record<string, string> = {
  draft: 'مسودة',
  submitted: 'مقدم',
  paid: 'مدفوع',
  overdue: 'متأخر',
  cancelled: 'ملغي',
};

const statusClass: Record<string, string> = {
  draft: styles.badgeDraft,
  submitted: styles.badgeSubmitted,
  paid: styles.badgePaid,
  overdue: styles.badgeOverdue,
  cancelled: styles.badgeInactive,
};

export default function TaxDeclarationDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const router = useRouter();
  const t = useTranslations('Common');
  const tAccounting = useTranslations('Accounting');
  
  const [declaration, setDeclaration] = useState<TaxDeclaration | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchDeclaration();
  }, []);

  const fetchDeclaration = async () => {
    try {
      const { id } = await params;
      const res = await fetch(`/api/accounting/taxes/declarations/${id}`);
      const data = await res.json();
      if (data.success) {
        setDeclaration(data.data);
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
    if (!declaration) return;
    
    const csvContent = `البيان,القيمة\n
رقم الإقرار,${declaration.declarationNumber}\n
نوع الضريبة,${taxTypeLabels[declaration.taxType]}\n
الفترة,${declaration.period}\n
تاريخ الاستحقاق,${formatDate(declaration.dueDate)}\n
الوعاء الضريبي,${formatAmount(declaration.taxableBase)}\n
نسبة الضريبة,${declaration.taxRate}%\n
مبلغ الضريبة,${formatAmount(declaration.taxAmount)}\n
الغرامات,${formatAmount(declaration.penalties)}\n
المبلغ الإجمالي,${formatAmount(declaration.totalAmount)}\n
المبلغ المدفوع,${formatAmount(declaration.paidAmount)}\n
المبلغ المتبقي,${formatAmount(declaration.remainingAmount)}\n
الحالة,${statusLabels[declaration.status]}\n`;

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.href = url;
    link.setAttribute('download', `tax_declaration_${declaration.declarationNumber}.csv`);
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

  if (!declaration) {
    return (
      <div className={styles.page}>
        <div className={styles.container}>
          <div className={styles.emptyState}>
            <FileText className="w-12 h-12 mx-auto mb-2 text-gray-400" />
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
              <FileText className="inline-block w-6 h-6 ml-2 text-[#1ABC9C]" />
              {tAccounting('taxDeclarationDetails')}
            </h1>
            <p className={styles.subtitle}>
              {tAccounting('declarationNumber')}: {declaration.declarationNumber}
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

        {/* Declaration Info */}
        <div className={styles.section}>
          <h2 className={styles.sectionTitle}>{tAccounting('declarationInfo')}</h2>
          <div className={styles.sectionGrid}>
            <div>
              <label className={styles.formLabel}>{tAccounting('declarationNumber')}</label>
              <div className="font-bold">{declaration.declarationNumber}</div>
            </div>
            <div>
              <label className={styles.formLabel}>{tAccounting('taxType')}</label>
              <div className="font-bold">{taxTypeLabels[declaration.taxType]}</div>
            </div>
            <div>
              <label className={styles.formLabel}>{tAccounting('period')}</label>
              <div className="font-bold">{declaration.period}</div>
            </div>
            <div>
              <label className={styles.formLabel}>{tAccounting('dueDate')}</label>
              <div className="font-bold">{formatDate(declaration.dueDate)}</div>
            </div>
            <div>
              <label className={styles.formLabel}>{tAccounting('status')}</label>
              <div>
                <span className={`${styles.badge} ${statusClass[declaration.status]}`}>
                  {statusLabels[declaration.status]}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Tax Calculation */}
        <div className={styles.section}>
          <h2 className={styles.sectionTitle}>{tAccounting('taxCalculation')}</h2>
          <div className={styles.sectionGrid}>
            <div>
              <label className={styles.formLabel}>{tAccounting('taxableBase')}</label>
              <div className="font-bold">{formatAmount(declaration.taxableBase)}</div>
            </div>
            <div>
              <label className={styles.formLabel}>{tAccounting('taxRate')}</label>
              <div className="font-bold">{declaration.taxRate}%</div>
            </div>
            <div>
              <label className={styles.formLabel}>{tAccounting('taxAmount')}</label>
              <div className="font-bold">{formatAmount(declaration.taxAmount)}</div>
            </div>
            <div>
              <label className={styles.formLabel}>{tAccounting('penalties')}</label>
              <div className="font-bold text-red-600">{formatAmount(declaration.penalties)}</div>
            </div>
          </div>
        </div>

        {/* Payment Summary */}
        <div className={styles.section}>
          <h2 className={styles.sectionTitle}>{tAccounting('paymentSummary')}</h2>
          <div className={styles.sectionGrid}>
            <div>
              <label className={styles.formLabel}>{tAccounting('totalAmount')}</label>
              <div className="text-xl font-bold text-[#1ABC9C]">{formatAmount(declaration.totalAmount)}</div>
            </div>
            <div>
              <label className={styles.formLabel}>{tAccounting('paidAmount')}</label>
              <div className="text-xl font-bold text-green-600">{formatAmount(declaration.paidAmount)}</div>
            </div>
            <div>
              <label className={styles.formLabel}>{tAccounting('remainingAmount')}</label>
              <div className="text-xl font-bold text-red-600">{formatAmount(declaration.remainingAmount)}</div>
            </div>
          </div>
          {declaration.paymentDate && (
            <div className="mt-4 pt-4 border-t">
              <div className="flex gap-4">
                <div>
                  <label className={styles.formLabel}>{tAccounting('paymentDate')}</label>
                  <div className="font-bold">{formatDate(declaration.paymentDate)}</div>
                </div>
                <div>
                  <label className={styles.formLabel}>{tAccounting('paymentReference')}</label>
                  <div className="font-bold">{declaration.paymentReference || '-'}</div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Payment Button */}
        {declaration.status !== 'paid' && declaration.status !== 'cancelled' && (
          <div className="flex justify-end mb-6">
            <button
              onClick={() => router.push(`/erp/accounting/taxes/declarations/${declaration._id}/pay`)}
              className={styles.addButton}
            >
              <DollarSign className="w-4 h-4" />
              {tAccounting('recordPayment')}
            </button>
          </div>
        )}

        {/* Notes */}
        {declaration.notes && (
          <div className={styles.section}>
            <h2 className={styles.sectionTitle}>{tAccounting('notes')}</h2>
            <p className="text-gray-600">{declaration.notes}</p>
          </div>
        )}

        {/* Created By */}
        <div className={styles.section}>
          <h2 className={styles.sectionTitle}>{tAccounting('createdBy')}</h2>
          <div>
            <div>{declaration.createdBy?.name || 'غير معروف'}</div>
            <div className="text-sm text-gray-500">{formatDate(declaration.createdAt)}</div>
          </div>
        </div>
      </div>
    </div>
  );
}