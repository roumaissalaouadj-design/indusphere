// src/app/[locale]/(dashboard)/erp/accounting/procurement/invoices/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { Plus, Eye, Trash2, DollarSign, FileText, Package, Wrench, Truck, Building2 } from 'lucide-react';
import styles from '@/styles/pages/accounting/purchase-invoices.module.css';

interface Invoice {
  _id: string;
  invoiceNumber: string;
  supplierId: {
    _id: string;
    name: string;
    code: string;
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
}

interface Filters {
  status: string;
  invoiceType: string;
  supplierId: string;
  startDate: string;
  endDate: string;
}

const statusLabels: Record<string, string> = {
  pending: 'قيد الانتظار',
  partial: 'مدفوعة جزئياً',
  paid: 'مدفوعة',
  overdue: 'متأخرة',
};

const typeLabels: Record<string, string> = {
  raw_material: 'مواد خام',
  service: 'خدمات',
  equipment: 'تجهيزات',
};

const typeIcons: Record<string, React.ReactNode> = {
  raw_material: <Package className="w-4 h-4" />,
  service: <Wrench className="w-4 h-4" />,
  equipment: <Truck className="w-4 h-4" />,
};

export default function PurchaseInvoicesPage() {
  const router = useRouter();
  const t = useTranslations('Common');
  const tAccounting = useTranslations('Accounting');
  
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [suppliers, setSuppliers] = useState<{ _id: string; name: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<Filters>({
    status: 'all',
    invoiceType: 'all',
    supplierId: '',
    startDate: '',
    endDate: '',
  });

  useEffect(() => {
    fetchInvoices();
    fetchSuppliers();
  }, [filters]);

  const fetchInvoices = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (filters.status !== 'all') params.append('status', filters.status);
      if (filters.invoiceType !== 'all') params.append('invoiceType', filters.invoiceType);
      if (filters.supplierId) params.append('supplierId', filters.supplierId);
      if (filters.startDate) params.append('startDate', filters.startDate);
      if (filters.endDate) params.append('endDate', filters.endDate);
      
      const res = await fetch(`/api/accounting/purchase-invoices?${params}`);
      const data = await res.json();
      if (data.success) {
        setInvoices(data.data);
      } else {
        setError(data.message);
      }
    } catch {
      setError(t('fetchError'));
    } finally {
      setLoading(false);
    }
  };

  const fetchSuppliers = async () => {
    try {
      const res = await fetch('/api/accounting/suppliers?isActive=true');
      const data = await res.json();
      if (data.success) {
        setSuppliers(data.data);
      }
    } catch {
      // تجاهل الخطأ
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm(t('deleteConfirm'))) return;

    try {
      const res = await fetch(`/api/accounting/purchase-invoices/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        await fetchInvoices();
        alert(t('deleteSuccess'));
      } else {
        alert(data.message);
      }
    } catch {
      alert(t('error'));
    }
  };

  const getStatusClass = (status: string) => {
    switch (status) {
      case 'pending': return styles.statusPending;
      case 'partial': return styles.statusPartial;
      case 'paid': return styles.statusPaid;
      case 'overdue': return styles.statusOverdue;
      default: return '';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ar-DZ');
  };

  const formatAmount = (amount: number) => {
    return amount.toLocaleString('ar-DZ') + ' دج';
  };

  return (
    <div className={styles.page}>
      <div className={styles.container}>
        {/* Header */}
        <div className={styles.header}>
          <div>
            <h1 className={styles.title}>
              <FileText className="inline-block w-6 h-6 ml-2 text-[#1ABC9C]" />
              {tAccounting('purchaseInvoices')}
            </h1>
            <p className={styles.subtitle}>
              {tAccounting('purchaseInvoicesDescription')}
            </p>
          </div>
          <button
            onClick={() => router.push('/erp/accounting/procurement/invoices/new')}
            className={styles.addButton}
          >
            <Plus className="w-4 h-4" />
            {tAccounting('addInvoice')}
          </button>
        </div>

        {/* Filter Bar */}
        <div className={styles.filterBar}>
          <div className={styles.filterGroup}>
            <label className={styles.filterLabel}>{t('status')}</label>
            <select
              value={filters.status}
              onChange={(e) => setFilters({ ...filters, status: e.target.value })}
              className={styles.filterSelect}
            >
              <option value="all">الكل</option>
              <option value="pending">قيد الانتظار</option>
              <option value="partial">مدفوعة جزئياً</option>
              <option value="paid">مدفوعة</option>
              <option value="overdue">متأخرة</option>
            </select>
          </div>

          <div className={styles.filterGroup}>
            <label className={styles.filterLabel}>{tAccounting('invoiceType')}</label>
            <select
              value={filters.invoiceType}
              onChange={(e) => setFilters({ ...filters, invoiceType: e.target.value })}
              className={styles.filterSelect}
            >
              <option value="all">الكل</option>
              <option value="raw_material">مواد خام</option>
              <option value="service">خدمات</option>
              <option value="equipment">تجهيزات</option>
            </select>
          </div>

          <div className={styles.filterGroup}>
            <label className={styles.filterLabel}>{tAccounting('supplier')}</label>
            <select
              value={filters.supplierId}
              onChange={(e) => setFilters({ ...filters, supplierId: e.target.value })}
              className={styles.filterSelect}
            >
              <option value="">الكل</option>
              {suppliers.map((supplier) => (
                <option key={supplier._id} value={supplier._id}>{supplier.name}</option>
              ))}
            </select>
          </div>

          <div className={styles.filterGroup}>
            <label className={styles.filterLabel}>{tAccounting('fromDate')}</label>
            <input
              type="date"
              value={filters.startDate}
              onChange={(e) => setFilters({ ...filters, startDate: e.target.value })}
              className={styles.filterInput}
            />
          </div>

          <div className={styles.filterGroup}>
            <label className={styles.filterLabel}>{tAccounting('toDate')}</label>
            <input
              type="date"
              value={filters.endDate}
              onChange={(e) => setFilters({ ...filters, endDate: e.target.value })}
              className={styles.filterInput}
            />
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className={styles.errorMessage}>
            <p className={styles.errorText}>{error}</p>
          </div>
        )}

        {/* Invoices Table */}
        <div className={styles.tableContainer}>
          <table className={styles.table}>
            <thead>
              <tr className={styles.tableHeader}>
                <th className={styles.tableHeaderCell}>{tAccounting('invoiceNumber')}</th>
                <th className={styles.tableHeaderCell}>{tAccounting('supplier')}</th>
                <th className={styles.tableHeaderCell}>{tAccounting('invoiceDate')}</th>
                <th className={styles.tableHeaderCell}>{tAccounting('dueDate')}</th>
                <th className={styles.tableHeaderCell}>{tAccounting('type')}</th>
                <th className={styles.tableHeaderCell}>{tAccounting('totalAmount')}</th>
                <th className={styles.tableHeaderCell}>{tAccounting('remainingAmount')}</th>
                <th className={styles.tableHeaderCell}>{t('status')}</th>
                <th className={styles.tableHeaderCell}>{t('actions')}</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={9} className={styles.loadingState}>
                    <div className="flex items-center justify-center gap-2">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-[#1ABC9C]"></div>
                      {t('loading')}
                    </div>
                  </td>
                </tr>
              ) : invoices.length === 0 ? (
                <tr>
                  <td colSpan={9} className={styles.emptyState}>
                    <FileText className="w-12 h-12 mx-auto mb-2 text-gray-400" />
                    {t('noData')}
                  </td>
                </tr>
              ) : (
                invoices.map((invoice) => (
                  <tr key={invoice._id} className={styles.tableRow}>
                    <td className={`${styles.tableCell} ${styles.cellNumber}`}>
                      {invoice.invoiceNumber}
                    </td>
                    <td className={styles.tableCell}>
                      <Building2 className="inline-block w-3 h-3 ml-1 text-gray-400" />
                      {invoice.supplierId?.name || '-'}
                    </td>
                    <td className={styles.tableCell}>{formatDate(invoice.invoiceDate)}</td>
                    <td className={styles.tableCell}>{formatDate(invoice.dueDate)}</td>
                    <td className={styles.tableCell}>
                      <span className="inline-flex items-center gap-1">
                        {typeIcons[invoice.invoiceType]}
                        {typeLabels[invoice.invoiceType]}
                      </span>
                    </td>
                    <td className={`${styles.tableCell} ${styles.cellAmount}`}>
                      {formatAmount(invoice.totalAmount)}
                    </td>
                    <td className={`${styles.tableCell} ${styles.cellAmount}`}>
                      {formatAmount(invoice.remainingAmount)}
                    </td>
                    <td className={styles.tableCell}>
                      <span className={`${styles.statusBadge} ${getStatusClass(invoice.status)}`}>
                        {statusLabels[invoice.status]}
                      </span>
                    </td>
                    <td className={styles.actionsCell}>
                      <button
                        onClick={() => router.push(`/erp/accounting/procurement/invoices/${invoice._id}`)}
                        className="text-blue-500 hover:text-blue-700 ml-3"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      {invoice.status !== 'paid' && (
                        <button
                          onClick={() => router.push(`/erp/accounting/procurement/invoices/${invoice._id}/pay`)}
                          className="text-green-500 hover:text-green-700 ml-3"
                        >
                          <DollarSign className="w-4 h-4" />
                        </button>
                      )}
                      <button
                        onClick={() => handleDelete(invoice._id)}
                        className="text-red-500 hover:text-red-700"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}