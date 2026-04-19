// src/app/[locale]/(dashboard)/erp/accounting/sales/invoices/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { Plus, Eye, Trash2, DollarSign, FileText, Building2, Search } from 'lucide-react';
import styles from '@/styles/pages/accounting/sales-invoices.module.css';

interface Invoice {
  _id: string;
  invoiceNumber: string;
  customerId: {
    _id: string;
    name: string;
    code: string;
  };
  invoiceDate: string;
  dueDate: string;
  productType: string;
  cementType?: string;
  strengthClass?: string;
  quantity: number;
  unitPrice: number;
  totalAmount: number;
  paidAmount: number;
  remainingAmount: number;
  status: 'pending' | 'partial' | 'paid' | 'overdue';
}

interface Customer {
  _id: string;
  name: string;
  code: string;
}

interface Filters {
  status: string;
  customerId: string;
  startDate: string;
  endDate: string;
}

const statusLabels: Record<string, string> = {
  pending: 'قيد الانتظار',
  partial: 'مدفوعة جزئياً',
  paid: 'مدفوعة',
  overdue: 'متأخرة',
};

const productLabels: Record<string, string> = {
  cement: 'أسمنت',
  clinker: 'كلنكر',
};

export default function SalesInvoicesPage() {
  const router = useRouter();
  const t = useTranslations('Common');
  const tAccounting = useTranslations('Accounting');
  
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [summary, setSummary] = useState({
    totalInvoices: 0,
    totalQuantity: 0,
    totalAmount: 0,
    totalPaid: 0,
    totalRemaining: 0,
  });
  const [filters, setFilters] = useState<Filters>({
    status: 'all',
    customerId: '',
    startDate: '',
    endDate: '',
  });

  useEffect(() => {
    fetchInvoices();
    fetchCustomers();
    fetchSummary();
  }, [filters]);

  const fetchInvoices = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (filters.status !== 'all') params.append('status', filters.status);
      if (filters.customerId) params.append('customerId', filters.customerId);
      if (filters.startDate) params.append('startDate', filters.startDate);
      if (filters.endDate) params.append('endDate', filters.endDate);
      
      const res = await fetch(`/api/accounting/sales-invoices?${params}`);
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

  const fetchCustomers = async () => {
    try {
      const res = await fetch('/api/accounting/customers?isActive=true');
      const data = await res.json();
      if (data.success) {
        setCustomers(data.data);
      }
    } catch {
      // Ignorer
    }
  };

  const fetchSummary = async () => {
    try {
      const params = new URLSearchParams();
      params.append('type', 'summary');
      if (filters.startDate) params.append('startDate', filters.startDate);
      if (filters.endDate) params.append('endDate', filters.endDate);
      
      const res = await fetch(`/api/accounting/reports/sales?${params}`);
      const data = await res.json();
      if (data.success && data.data.summary) {
        setSummary(data.data.summary);
      }
    } catch {
      // Ignorer
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm(t('deleteConfirm'))) return;

    try {
      const res = await fetch(`/api/accounting/sales-invoices/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        await fetchInvoices();
        await fetchSummary();
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
              {tAccounting('salesInvoices')}
            </h1>
            <p className={styles.subtitle}>
              {tAccounting('salesInvoicesDescription')}
            </p>
          </div>
          <button
            onClick={() => router.push('/erp/accounting/sales/invoices/new')}
            className={styles.addButton}
          >
            <Plus className="w-4 h-4" />
            {tAccounting('addInvoice')}
          </button>
        </div>

        {/* Summary Cards */}
        <div className={styles.summarySection}>
          <h3 className={styles.summaryTitle}>{tAccounting('salesSummary')}</h3>
          <div className={styles.summaryGrid}>
            <div className={styles.summaryCard}>
              <div className={styles.summaryLabel}>{tAccounting('totalInvoices')}</div>
              <div className={styles.summaryValue}>{summary.totalInvoices}</div>
            </div>
            <div className={styles.summaryCard}>
              <div className={styles.summaryLabel}>{tAccounting('totalQuantity')} (طن)</div>
              <div className={styles.summaryValue}>{summary.totalQuantity.toLocaleString()}</div>
            </div>
            <div className={styles.summaryCard}>
              <div className={styles.summaryLabel}>{tAccounting('totalAmount')}</div>
              <div className={styles.summaryValue}>{formatAmount(summary.totalAmount)}</div>
            </div>
            <div className={styles.summaryCard}>
              <div className={styles.summaryLabel}>{tAccounting('totalPaid')}</div>
              <div className={styles.summaryValue}>{formatAmount(summary.totalPaid)}</div>
            </div>
            <div className={styles.summaryCard}>
              <div className={styles.summaryLabel}>{tAccounting('totalRemaining')}</div>
              <div className={styles.summaryValue}>{formatAmount(summary.totalRemaining)}</div>
            </div>
          </div>
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
            <label className={styles.filterLabel}>{tAccounting('customer')}</label>
            <select
              value={filters.customerId}
              onChange={(e) => setFilters({ ...filters, customerId: e.target.value })}
              className={styles.filterSelect}
            >
              <option value="">الكل</option>
              {customers.map((customer) => (
                <option key={customer._id} value={customer._id}>{customer.name}</option>
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
                <th className={styles.tableHeaderCell}>{tAccounting('customer')}</th>
                <th className={styles.tableHeaderCell}>{tAccounting('invoiceDate')}</th>
                <th className={styles.tableHeaderCell}>{tAccounting('dueDate')}</th>
                <th className={styles.tableHeaderCell}>{tAccounting('product')}</th>
                <th className={styles.tableHeaderCell}>{tAccounting('quantity')} (طن)</th>
                <th className={styles.tableHeaderCell}>{tAccounting('totalAmount')}</th>
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
                      {invoice.customerId?.name || '-'}
                    </td>
                    <td className={styles.tableCell}>{formatDate(invoice.invoiceDate)}</td>
                    <td className={styles.tableCell}>{formatDate(invoice.dueDate)}</td>
                    <td className={styles.tableCell}>{productLabels[invoice.productType]}</td>
                    <td className={styles.tableCell}>{invoice.quantity.toLocaleString()}</td>
                    <td className={`${styles.tableCell} ${styles.cellAmount}`}>
                      {formatAmount(invoice.totalAmount)}
                    </td>
                    <td className={styles.tableCell}>
                      <span className={`${styles.statusBadge} ${getStatusClass(invoice.status)}`}>
                        {statusLabels[invoice.status]}
                      </span>
                    </td>
                    <td className={styles.actionsCell}>
                      <button
                        onClick={() => router.push(`/erp/accounting/sales/invoices/${invoice._id}`)}
                        className="text-blue-500 hover:text-blue-700 ml-3"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      {invoice.status !== 'paid' && (
                        <button
                          onClick={() => router.push(`/erp/accounting/sales/invoices/${invoice._id}/pay`)}
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