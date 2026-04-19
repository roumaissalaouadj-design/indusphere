// src/app/[locale]/(dashboard)/erp/accounting/sales/reports/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { BarChart, TrendingUp, Users, Package, DollarSign, Download, Printer } from 'lucide-react';
import styles from '@/styles/pages/accounting/sales-invoices.module.css';

interface SummaryData {
  totalInvoices: number;
  totalQuantity: number;
  totalAmount: number;
  totalPaid: number;
  totalRemaining: number;
}

interface CustomerData {
  _id: string;
  customer: {
    name: string;
    code: string;
  };
  totalInvoices: number;
  totalQuantity: number;
  totalAmount: number;
  totalPaid: number;
  totalRemaining: number;
}

interface DailyData {
  _id: string;
  totalAmount: number;
  count: number;
}

type ReportType = 'summary' | 'by-customer' | 'daily';

export default function SalesReportsPage() {
  const t = useTranslations('Common');
  const tAccounting = useTranslations('Accounting');
  
  const [reportType, setReportType] = useState<ReportType>('summary');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [summary, setSummary] = useState<SummaryData | null>(null);
  const [customerData, setCustomerData] = useState<CustomerData[]>([]);
  const [dailyData, setDailyData] = useState<DailyData[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchReport();
  }, [reportType, startDate, endDate]);

  const fetchReport = async () => {
    setLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams();
      params.append('type', reportType);
      if (startDate) params.append('startDate', startDate);
      if (endDate) params.append('endDate', endDate);

      const res = await fetch(`/api/accounting/reports/sales?${params}`);
      const data = await res.json();

      if (data.success) {
        if (reportType === 'summary') {
          setSummary(data.data.summary);
        } else if (reportType === 'by-customer') {
          setCustomerData(data.data);
        } else if (reportType === 'daily') {
          setDailyData(data.data);
        }
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
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString('ar-DZ');
  };

  const formatAmount = (amount: number) => {
    return amount.toLocaleString('ar-DZ') + ' دج';
  };

  const handlePrint = () => {
    window.print();
  };

  const handleExport = () => {
    let csvContent = '';
    
    if (reportType === 'summary') {
      csvContent = 'البيان,القيمة\n';
      csvContent += `إجمالي الفواتير,${summary?.totalInvoices || 0}\n`;
      csvContent += `إجمالي الكمية (طن),${summary?.totalQuantity.toLocaleString() || 0}\n`;
      csvContent += `إجمالي المبلغ,${summary?.totalAmount.toLocaleString() || 0}\n`;
      csvContent += `المبلغ المدفوع,${summary?.totalPaid.toLocaleString() || 0}\n`;
      csvContent += `المبلغ المتبقي,${summary?.totalRemaining.toLocaleString() || 0}\n`;
    } else if (reportType === 'by-customer') {
      csvContent = 'العميل,عدد الفواتير,الكمية (طن),المبلغ الإجمالي,المدفوع,المتبقي\n';
      customerData.forEach(c => {
        csvContent += `${c.customer?.name || 'غير محدد'},${c.totalInvoices},${c.totalQuantity.toLocaleString()},${c.totalAmount.toLocaleString()},${c.totalPaid.toLocaleString()},${c.totalRemaining.toLocaleString()}\n`;
      });
    } else if (reportType === 'daily') {
      csvContent = 'التاريخ,عدد الفواتير,المبلغ الإجمالي\n';
      dailyData.forEach(d => {
        csvContent += `${d._id},${d.count},${d.totalAmount.toLocaleString()}\n`;
      });
    }

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.href = url;
    link.setAttribute('download', `sales_report_${reportType}_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleReportTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setReportType(e.target.value as ReportType);
  };

  return (
    <div className={styles.page}>
      <div className={styles.container}>
        {/* Header */}
        <div className={styles.header}>
          <div>
            <h1 className={styles.title}>
              <BarChart className="inline-block w-6 h-6 ml-2 text-[#1ABC9C]" />
              {tAccounting('salesReports')}
            </h1>
            <p className={styles.subtitle}>
              {tAccounting('salesReportsDescription')}
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
          </div>
        </div>

        {/* Filters */}
        <div className={styles.filterBar}>
          <div className={styles.filterGroup}>
            <label className={styles.filterLabel}>{tAccounting('reportType')}</label>
            <select
              value={reportType}
              onChange={handleReportTypeChange}
              className={styles.filterSelect}
            >
              <option value="summary">تقرير ملخص</option>
              <option value="by-customer">تقرير حسب العميل</option>
              <option value="daily">تقرير يومي</option>
            </select>
          </div>

          <div className={styles.filterGroup}>
            <label className={styles.filterLabel}>{tAccounting('fromDate')}</label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className={styles.filterInput}
            />
          </div>

          <div className={styles.filterGroup}>
            <label className={styles.filterLabel}>{tAccounting('toDate')}</label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
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

        {loading ? (
          <div className={styles.loadingState}>
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#1ABC9C] mx-auto"></div>
            <p className="mt-2">{t('loading')}</p>
          </div>
        ) : (
          <>
            {/* Summary Report */}
            {reportType === 'summary' && summary && (
              <div className={styles.summarySection}>
                <h3 className={styles.summaryTitle}>
                  <TrendingUp className="inline-block w-5 h-5 ml-2" />
                  {tAccounting('salesSummary')}
                </h3>
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
            )}

            {/* By Customer Report */}
            {reportType === 'by-customer' && customerData.length > 0 && (
              <div className={styles.tableContainer}>
                <table className={styles.table}>
                  <thead>
                    <tr className={styles.tableHeader}>
                      <th className={styles.tableHeaderCell}>{tAccounting('customer')}</th>
                      <th className={styles.tableHeaderCell}>{tAccounting('totalInvoices')}</th>
                      <th className={styles.tableHeaderCell}>{tAccounting('totalQuantity')} (طن)</th>
                      <th className={styles.tableHeaderCell}>{tAccounting('totalAmount')}</th>
                      <th className={styles.tableHeaderCell}>{tAccounting('totalPaid')}</th>
                      <th className={styles.tableHeaderCell}>{tAccounting('totalRemaining')}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {customerData.map((customer, index) => (
                      <tr key={customer._id || index} className={styles.tableRow}>
                        <td className={styles.tableCell}>{customer.customer?.name || 'غير محدد'}</td>
                        <td className={styles.tableCell}>{customer.totalInvoices}</td>
                        <td className={styles.tableCell}>{customer.totalQuantity.toLocaleString()}</td>
                        <td className={`${styles.tableCell} ${styles.cellAmount}`}>{formatAmount(customer.totalAmount)}</td>
                        <td className={`${styles.tableCell} ${styles.cellAmount}`}>{formatAmount(customer.totalPaid)}</td>
                        <td className={`${styles.tableCell} ${styles.cellAmount}`}>{formatAmount(customer.totalRemaining)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Daily Report */}
            {reportType === 'daily' && dailyData.length > 0 && (
              <div className={styles.tableContainer}>
                <table className={styles.table}>
                  <thead>
                    <tr className={styles.tableHeader}>
                      <th className={styles.tableHeaderCell}>{tAccounting('date')}</th>
                      <th className={styles.tableHeaderCell}>{tAccounting('totalInvoices')}</th>
                      <th className={styles.tableHeaderCell}>{tAccounting('totalAmount')}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {dailyData.map((day, index) => (
                      <tr key={day._id || index} className={styles.tableRow}>
                        <td className={styles.tableCell}>{formatDate(day._id)}</td>
                        <td className={styles.tableCell}>{day.count}</td>
                        <td className={`${styles.tableCell} ${styles.cellAmount}`}>{formatAmount(day.totalAmount)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* No Data */}
            {((reportType === 'by-customer' && customerData.length === 0) ||
              (reportType === 'daily' && dailyData.length === 0)) && !summary && (
              <div className={styles.emptyState}>
                <BarChart className="w-12 h-12 mx-auto mb-2 text-gray-400" />
                {t('noData')}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}