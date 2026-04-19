// src/app/[locale]/(dashboard)/erp/accounting/taxes/reports/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { BarChart, TrendingUp, DollarSign, Download, Printer, PieChart } from 'lucide-react';
import styles from '@/styles/pages/accounting/taxes.module.css';

interface SummaryItem {
  _id: string;
  totalDeclarations: number;
  totalTaxableBase: number;
  totalTaxAmount: number;
  totalPaid: number;
  totalRemaining: number;
}

interface MonthlyData {
  _id: string;
  totalAmount: number;
  totalPaid: number;
}

interface TransactionItem {
  _id: {
    taxType: string;
    sourceType: string;
  };
  totalTaxableBase: number;
  totalTaxAmount: number;
  count: number;
}

type ReportType = 'summary' | 'transactions';

export default function TaxReportsPage() {
  const t = useTranslations('Common');
  const tAccounting = useTranslations('Accounting');
  
  const [reportType, setReportType] = useState<ReportType>('summary');
  const [taxType, setTaxType] = useState('');
  const [year, setYear] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [summaryData, setSummaryData] = useState<SummaryItem[]>([]);
  const [monthlyData, setMonthlyData] = useState<MonthlyData[]>([]);
  const [transactions, setTransactions] = useState<TransactionItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchReport();
  }, [reportType, taxType, year, startDate, endDate]);

  const fetchReport = async () => {
    setLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams();
      params.append('type', reportType);
      if (taxType) params.append('taxType', taxType);
      if (year) params.append('year', year);
      if (startDate) params.append('startDate', startDate);
      if (endDate) params.append('endDate', endDate);

      const res = await fetch(`/api/accounting/reports/taxes?${params}`);
      const data = await res.json();

      if (data.success) {
        if (reportType === 'summary') {
          setSummaryData(data.data.summary || []);
          setMonthlyData(data.data.monthlyData || []);
        } else if (reportType === 'transactions') {
          setTransactions(data.data || []);
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

  const formatAmount = (amount: number) => {
    return amount.toLocaleString('ar-DZ') + ' دج';
  };

  const handlePrint = () => {
    window.print();
  };

  const handleExport = () => {
    let csvContent = '';
    
    if (reportType === 'summary') {
      csvContent = 'نوع الضريبة,عدد الإقرارات,الوعاء الضريبي,مبلغ الضريبة,المدفوع,المتبقي\n';
      summaryData.forEach(item => {
        csvContent += `${item._id},${item.totalDeclarations},${item.totalTaxableBase},${item.totalTaxAmount},${item.totalPaid},${item.totalRemaining}\n`;
      });
    } else if (reportType === 'transactions') {
      csvContent = 'نوع الضريبة,نوع المصدر,العدد,الوعاء الضريبي,مبلغ الضريبة\n';
      transactions.forEach(item => {
        csvContent += `${item._id.taxType},${item._id.sourceType},${item.count},${item.totalTaxableBase},${item.totalTaxAmount}\n`;
      });
    }

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.href = url;
    link.setAttribute('download', `tax_report_${reportType}_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleReportTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setReportType(e.target.value as ReportType);
  };

  const taxTypeLabels: Record<string, string> = {
    TVA: 'TVA',
    IRG: 'IRG',
    IBS: 'IBS',
    other: 'أخرى',
  };

  const sourceTypeLabels: Record<string, string> = {
    purchase_invoice: 'فواتير المشتريات',
    sales_invoice: 'فواتير المبيعات',
    salary_payment: 'دفعات الرواتب',
    other: 'أخرى',
  };

  return (
    <div className={styles.page}>
      <div className={styles.container}>
        <div className={styles.header}>
          <div>
            <h1 className={styles.title}>
              <BarChart className="inline-block w-6 h-6 ml-2 text-[#1ABC9C]" />
              {tAccounting('taxReports')}
            </h1>
            <p className={styles.subtitle}>
              {tAccounting('taxReportsDescription')}
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

        <div className={styles.filterBar}>
          <div className={styles.filterGroup}>
            <label className={styles.filterLabel}>{tAccounting('reportType')}</label>
            <select
              value={reportType}
              onChange={handleReportTypeChange}
              className={styles.filterSelect}
            >
              <option value="summary">تقرير ملخص الضرائب</option>
              <option value="transactions">تقرير معاملات الضرائب</option>
            </select>
          </div>

          <div className={styles.filterGroup}>
            <label className={styles.filterLabel}>{tAccounting('taxType')}</label>
            <select
              value={taxType}
              onChange={(e) => setTaxType(e.target.value)}
              className={styles.filterSelect}
            >
              <option value="">الكل</option>
              <option value="TVA">TVA</option>
              <option value="IRG">IRG</option>
              <option value="IBS">IBS</option>
            </select>
          </div>

          <div className={styles.filterGroup}>
            <label className={styles.filterLabel}>{tAccounting('year')}</label>
            <input
              type="text"
              value={year}
              onChange={(e) => setYear(e.target.value)}
              placeholder="مثال: 2024"
              className={styles.filterInput}
            />
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
            {reportType === 'summary' && (
              <>
                {summaryData.length > 0 && (
                  <div className={styles.summarySection}>
                    <h3 className={styles.summaryTitle}>
                      <TrendingUp className="inline-block w-5 h-5 ml-2" />
                      {tAccounting('taxSummary')}
                    </h3>
                    <div className={styles.tableContainer}>
                      <table className={styles.table}>
                        <thead>
                          <tr className={styles.tableHeader}>
                            <th className={styles.tableHeaderCell}>{tAccounting('taxType')}</th>
                            <th className={styles.tableHeaderCell}>{tAccounting('totalDeclarations')}</th>
                            <th className={styles.tableHeaderCell}>{tAccounting('taxableBase')}</th>
                            <th className={styles.tableHeaderCell}>{tAccounting('taxAmount')}</th>
                            <th className={styles.tableHeaderCell}>{tAccounting('paidAmount')}</th>
                            <th className={styles.tableHeaderCell}>{tAccounting('remainingAmount')}</th>
                          </tr>
                        </thead>
                        <tbody>
                          {summaryData.map((item, index) => (
                            <tr key={item._id || index} className={styles.tableRow}>
                              <td className={styles.tableCell}>{taxTypeLabels[item._id] || item._id}</td>
                              <td className={styles.tableCell}>{item.totalDeclarations}</td>
                              <td className={`${styles.tableCell} ${styles.cellAmount}`}>{formatAmount(item.totalTaxableBase)}</td>
                              <td className={`${styles.tableCell} ${styles.cellAmount}`}>{formatAmount(item.totalTaxAmount)}</td>
                              <td className={`${styles.tableCell} ${styles.cellAmount}`}>{formatAmount(item.totalPaid)}</td>
                              <td className={`${styles.tableCell} ${styles.cellAmount}`}>{formatAmount(item.totalRemaining)}</td>
                            </tr>
                          ))}
                        </tbody>
                       </table>
                    </div>
                  </div>
                )}

                {monthlyData.length > 0 && (
                  <div className={styles.summarySection}>
                    <h3 className={styles.summaryTitle}>
                      <PieChart className="inline-block w-5 h-5 ml-2" />
                      {tAccounting('monthlyTaxSummary')}
                    </h3>
                    <div className={styles.tableContainer}>
                      <table className={styles.table}>
                        <thead>
                          <tr className={styles.tableHeader}>
                            <th className={styles.tableHeaderCell}>{tAccounting('month')}</th>
                            <th className={styles.tableHeaderCell}>{tAccounting('totalAmount')}</th>
                            <th className={styles.tableHeaderCell}>{tAccounting('paidAmount')}</th>
                           </tr>
                        </thead>
                        <tbody>
                          {monthlyData.map((month, index) => (
                            <tr key={month._id || index} className={styles.tableRow}>
                              <td className={styles.tableCell}>{month._id}</td>
                              <td className={`${styles.tableCell} ${styles.cellAmount}`}>{formatAmount(month.totalAmount)}</td>
                              <td className={`${styles.tableCell} ${styles.cellAmount}`}>{formatAmount(month.totalPaid)}</td>
                             </tr>
                          ))}
                        </tbody>
                       </table>
                    </div>
                  </div>
                )}

                {summaryData.length === 0 && monthlyData.length === 0 && (
                  <div className={styles.emptyState}>
                    <BarChart className="w-12 h-12 mx-auto mb-2 text-gray-400" />
                    {t('noData')}
                  </div>
                )}
              </>
            )}

            {/* Transactions Report */}
            {reportType === 'transactions' && (
              <>
                {transactions.length > 0 && (
                  <div className={styles.tableContainer}>
                    <table className={styles.table}>
                      <thead>
                        <tr className={styles.tableHeader}>
                          <th className={styles.tableHeaderCell}>{tAccounting('taxType')}</th>
                          <th className={styles.tableHeaderCell}>{tAccounting('sourceType')}</th>
                          <th className={styles.tableHeaderCell}>{tAccounting('count')}</th>
                          <th className={styles.tableHeaderCell}>{tAccounting('taxableBase')}</th>
                          <th className={styles.tableHeaderCell}>{tAccounting('taxAmount')}</th>
                         </tr>
                      </thead>
                      <tbody>
                        {transactions.map((item, index) => (
                          <tr key={index} className={styles.tableRow}>
                            <td className={styles.tableCell}>{taxTypeLabels[item._id.taxType] || item._id.taxType}</td>
                            <td className={styles.tableCell}>{sourceTypeLabels[item._id.sourceType] || item._id.sourceType}</td>
                            <td className={styles.tableCell}>{item.count}</td>
                            <td className={`${styles.tableCell} ${styles.cellAmount}`}>{formatAmount(item.totalTaxableBase)}</td>
                            <td className={`${styles.tableCell} ${styles.cellAmount}`}>{formatAmount(item.totalTaxAmount)}</td>
                           </tr>
                        ))}
                      </tbody>
                     </table>
                  </div>
                )}

                {transactions.length === 0 && (
                  <div className={styles.emptyState}>
                    <DollarSign className="w-12 h-12 mx-auto mb-2 text-gray-400" />
                    {t('noData')}
                  </div>
                )}
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
}