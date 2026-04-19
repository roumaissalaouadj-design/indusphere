// src/app/[locale]/(dashboard)/erp/accounting/procurement/invoices/[id]/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { ArrowRight, Building2, Calendar, DollarSign, FileText, Printer, Download } from 'lucide-react';
import styles from '@/styles/pages/accounting/purchase-invoices.module.css';

interface Invoice {
  _id: string;
  invoiceNumber: string;
  supplierId: {
    _id: string;
    name: string;
    code: string;
    phone: string;
    email: string;
    address: string;
    taxNumber: string;
  };
  invoiceDate: string;
  dueDate: string;
  invoiceType: 'raw_material' | 'service' | 'equipment';
  subTotal: number;
  taxRate: number;
  taxAmount: number;
  totalAmount: number;
  paidAmount: number;
  remainingAmount: number;
  status: 'pending' | 'partial' | 'paid' | 'overdue';
  notes: string;
  createdAt: string;
}

interface Detail {
  _id: string;
  materialType?: string;
  serviceType?: string;
  equipmentType?: string;
  name?: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

const typeLabels: Record<string, string> = {
  raw_material: 'مواد خام',
  service: 'خدمات',
  equipment: 'تجهيزات',
};

const statusLabels: Record<string, string> = {
  pending: 'قيد الانتظار',
  partial: 'مدفوعة جزئياً',
  paid: 'مدفوعة',
  overdue: 'متأخرة',
};

const statusClass: Record<string, string> = {
  pending: styles.statusPending,
  partial: styles.statusPartial,
  paid: styles.statusPaid,
  overdue: styles.statusOverdue,
};

export default function InvoiceDetailPage({
  params,
}: {
  params: Promise<{ id: string; locale: string }>;
}) {
  const router = useRouter();
  const t = useTranslations('Common');
  const tAccounting = useTranslations('Accounting');
  
  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [details, setDetails] = useState<Detail[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchInvoice();
  }, []);

  const fetchInvoice = async () => {
    try {
      const { id } = await params;
      const res = await fetch(`/api/accounting/purchase-invoices/${id}`);
      const data = await res.json();
      if (data.success) {
        setInvoice(data.data.invoice);
        setDetails(data.data.details || []);
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

  if (!invoice) {
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
        {/* Header */}
        <div className={styles.header}>
          <div>
            <h1 className={styles.title}>
              <FileText className="inline-block w-6 h-6 ml-2 text-[#1ABC9C]" />
              {tAccounting('invoiceDetails')}
            </h1>
            <p className={styles.subtitle}>
              {tAccounting('invoiceNumber')}: {invoice.invoiceNumber}
            </p>
          </div>
          <div className="flex gap-2">
            <button onClick={handlePrint} className={styles.addButton} style={{ backgroundColor: '#6c757d' }}>
              <Printer className="w-4 h-4" />
              {tAccounting('print')}
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

        {/* Invoice Info */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          {/* Supplier Info */}
          <div className="bg-white border border-gray-200 rounded-xl p-6">
            <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
              <Building2 className="w-5 h-5 text-[#1ABC9C]" />
              {tAccounting('supplierInfo')}
            </h3>
            <div className="space-y-2">
              <p><span className="text-gray-500">{tAccounting('supplierName')}:</span> {invoice.supplierId?.name}</p>
              <p><span className="text-gray-500">{tAccounting('supplierCode')}:</span> {invoice.supplierId?.code}</p>
              <p><span className="text-gray-500">{tAccounting('taxNumber')}:</span> {invoice.supplierId?.taxNumber}</p>
              <p><span className="text-gray-500">{t('phone')}:</span> {invoice.supplierId?.phone}</p>
              <p><span className="text-gray-500">{t('email')}:</span> {invoice.supplierId?.email}</p>
              <p><span className="text-gray-500">{t('address')}:</span> {invoice.supplierId?.address}</p>
            </div>
          </div>

          {/* Invoice Info */}
          <div className="bg-white border border-gray-200 rounded-xl p-6">
            <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
              <FileText className="w-5 h-5 text-[#1ABC9C]" />
              {tAccounting('invoiceInfo')}
            </h3>
            <div className="space-y-2">
              <p><span className="text-gray-500">{tAccounting('invoiceNumber')}:</span> {invoice.invoiceNumber}</p>
              <p><span className="text-gray-500">{tAccounting('invoiceType')}:</span> {typeLabels[invoice.invoiceType]}</p>
              <p><span className="text-gray-500">{tAccounting('invoiceDate')}:</span> {formatDate(invoice.invoiceDate)}</p>
              <p><span className="text-gray-500">{tAccounting('dueDate')}:</span> {formatDate(invoice.dueDate)}</p>
              <p><span className="text-gray-500">{t('status')}:</span> 
                <span className={`${styles.statusBadge} ${statusClass[invoice.status]} mr-2`}>
                  {statusLabels[invoice.status]}
                </span>
              </p>
            </div>
          </div>
        </div>

        {/* Details Table */}
        <div className={styles.tableContainer}>
          <table className={styles.table}>
            <thead>
              <tr className={styles.tableHeader}>
                <th className={styles.tableHeaderCell}>{tAccounting('item')}</th>
                <th className={styles.tableHeaderCell}>{tAccounting('quantity')}</th>
                <th className={styles.tableHeaderCell}>{tAccounting('unitPrice')}</th>
                <th className={styles.tableHeaderCell}>{tAccounting('total')}</th>
              </tr>
            </thead>
            <tbody>
              {details.map((detail, index) => (
                <tr key={detail._id || index} className={styles.tableRow}>
                  <td className={styles.tableCell}>
                    {detail.name || detail.materialType || detail.serviceType || '-'}
                  </td>
                  <td className={styles.tableCell}>{detail.quantity}</td>
                  <td className={styles.tableCell}>{formatAmount(detail.unitPrice)}</td>
                  <td className={`${styles.tableCell} ${styles.cellAmount}`}>{formatAmount(detail.total)}</td>
                </tr>
              ))}
            </tbody>
           </table>
        </div>

        {/* Summary */}
        <div className="mt-6 p-4 bg-gray-50 rounded-lg w-full md:w-96 mr-auto">
          <div className="flex justify-between mb-2">
            <span className="text-gray-600">{tAccounting('subTotal')}:</span>
            <span className="font-bold">{formatAmount(invoice.subTotal)}</span>
          </div>
          <div className="flex justify-between mb-2">
            <span className="text-gray-600">{tAccounting('taxAmount')} ({invoice.taxRate}%):</span>
            <span className="font-bold">{formatAmount(invoice.taxAmount)}</span>
          </div>
          <div className="flex justify-between pt-2 border-t border-gray-200">
            <span className="text-lg font-bold text-gray-800">{tAccounting('totalAmount')}:</span>
            <span className="text-lg font-bold text-[#1ABC9C]">{formatAmount(invoice.totalAmount)}</span>
          </div>
          <div className="flex justify-between mt-2 pt-2 border-t border-gray-200">
            <span className="text-gray-600">{tAccounting('paidAmount')}:</span>
            <span className="font-bold text-green-600">{formatAmount(invoice.paidAmount)}</span>
          </div>
          <div className="flex justify-between mt-2">
            <span className="text-gray-600">{tAccounting('remainingAmount')}:</span>
            <span className="font-bold text-red-600">{formatAmount(invoice.remainingAmount)}</span>
          </div>
        </div>

        {/* Notes */}
        {invoice.notes && (
          <div className="mt-6 p-4 bg-gray-50 rounded-lg">
            <h3 className="font-bold text-gray-800 mb-2">{tAccounting('notes')}:</h3>
            <p className="text-gray-600">{invoice.notes}</p>
          </div>
        )}
      </div>
    </div>
  );
}