// src/app/[locale]/(dashboard)/erp/accounting/production/reports/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { BarChart, TrendingUp, Factory, DollarSign, Download, Printer } from 'lucide-react';
import styles from '@/styles/pages/accounting/production-costs.module.css';

interface SummaryData {
  totalProduction: number;
  totalRawMaterialsCost: number;
  totalEnergyCost: number;
  totalLaborCost: number;
  totalMaintenanceCost: number;
  totalOtherCosts: number;
  totalCost: number;
  avgCostPerTon: number;
}

interface MonthlyData {
  _id: string;
  totalProduction: number;
  totalCost: number;
  avgCostPerTon: number;
}

interface ComparisonData {
  current: {
    totalCost: number;
    totalProduction: number;
    costPerTon: number;
  };
  previous: {
    totalCost: number;
    totalProduction: number;
    costPerTon: number;
  };
}

type ReportType = 'summary' | 'cost-breakdown' | 'comparison';

export default function ProductionReportsPage() {
  const t = useTranslations('Common');
  const tAccounting = useTranslations('Accounting');
  
  const [reportType, setReportType] = useState<ReportType>('summary');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [summary, setSummary] = useState<SummaryData | null>(null);
  const [monthlyData, setMonthlyData] = useState<MonthlyData[]>([]);
  const [costBreakdown, setCostBreakdown] = useState<Record<string, number>>({});
  const [comparison, setComparison] = useState<ComparisonData | null>(null);
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

      const res = await fetch(`/api/accounting/reports/production?${params}`);
      const data = await res.json();

      if (data.success) {
        if (reportType === 'summary') {
          setSummary(data.data.summary);
          setMonthlyData(data.data.monthlyData);
        } else if (reportType === 'cost-breakdown') {
          setCostBreakdown(data.data);
        } else if (reportType === 'comparison') {
          setComparison(data.data);
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

  const formatNumber = (num: number) => {
    return num.toLocaleString('ar-DZ');
  };

  const handlePrint = () => {
    window.print();
  };

  const handleExport = () => {
    let csvContent = '';
    
    if (reportType === 'summary' && summary) {
      csvContent = 'البيان,القيمة\n';
      csvContent += `إجمالي الإنتاج (طن),${summary.totalProduction}\n`;
      csvContent += `تكاليف المواد الخام,${summary.totalRawMaterialsCost}\n`;
      csvContent += `تكاليف الطاقة,${summary.totalEnergyCost}\n`;
      csvContent += `تكاليف العمالة,${summary.totalLaborCost}\n`;
      csvContent += `تكاليف الصيانة,${summary.totalMaintenanceCost}\n`;
      csvContent += `تكاليف أخرى,${summary.totalOtherCosts}\n`;
      csvContent += `إجمالي التكاليف,${summary.totalCost}\n`;
      csvContent += `متوسط تكلفة الطن,${summary.avgCostPerTon}\n`;
    } else if (reportType === 'cost-breakdown') {
      csvContent = 'نوع التكلفة,القيمة\n';
      csvContent += `مواد خام,${costBreakdown.rawMaterialsCost || 0}\n`;
      csvContent += `طاقة,${costBreakdown.energyCost || 0}\n`;
      csvContent += `عمالة,${costBreakdown.laborCost || 0}\n`;
      csvContent += `صيانة,${costBreakdown.maintenanceCost || 0}\n`;
      csvContent += `أخرى,${costBreakdown.otherCosts || 0}\n`;
    } else if (reportType === 'comparison' && comparison) {
      csvContent = 'الفترة,إجمالي الإنتاج (طن),إجمالي التكاليف,تكلفة الطن\n';
      csvContent += `الحالية,${comparison.current.totalProduction},${comparison.current.totalCost},${comparison.current.costPerTon}\n`;
      csvContent += `السابقة,${comparison.previous.totalProduction},${comparison.previous.totalCost},${comparison.previous.costPerTon}\n`;
    }

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.href = url;
    link.setAttribute('download', `production_report_${reportType}_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleReportTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setReportType(e.target.value as ReportType);
  };

  const getPercentageChange = (current: number, previous: number) => {
    if (previous === 0) return 0;
    return ((current - previous) / previous) * 100;
  };

  return (
    <div className={styles.page}>
      <div className={styles.container}>
        {/* Header */}
        <div className={styles.header}>
          <div>
            <h1 className={styles.title}>
              <BarChart className="inline-block w-6 h-6 ml-2 text-[#1ABC9C]" />
              {tAccounting('productionReports')}
            </h1>
            <p className={styles.subtitle}>
              {tAccounting('productionReportsDescription')}
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
              <option value="summary">تقرير ملخص الإنتاج</option>
              <option value="cost-breakdown">تحليل التكاليف</option>
              <option value="comparison">مقارنة مع الفترة السابقة</option>
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
              <>
                <div className={styles.summarySection}>
                  <h3 className={styles.summaryTitle}>
                    <TrendingUp className="inline-block w-5 h-5 ml-2" />
                    {tAccounting('productionSummary')}
                  </h3>
                  <div className={styles.summaryGrid}>
                    <div className={styles.summaryCard}>
                      <div className={styles.summaryLabel}>{tAccounting('totalProduction')} (طن)</div>
                      <div className={styles.summaryValue}>{formatNumber(summary.totalProduction)}</div>
                    </div>
                    <div className={styles.summaryCard}>
                      <div className={styles.summaryLabel}>{tAccounting('totalRawMaterialsCost')}</div>
                      <div className={styles.summaryValue}>{formatAmount(summary.totalRawMaterialsCost)}</div>
                    </div>
                    <div className={styles.summaryCard}>
                      <div className={styles.summaryLabel}>{tAccounting('totalEnergyCost')}</div>
                      <div className={styles.summaryValue}>{formatAmount(summary.totalEnergyCost)}</div>
                    </div>
                    <div className={styles.summaryCard}>
                      <div className={styles.summaryLabel}>{tAccounting('totalLaborCost')}</div>
                      <div className={styles.summaryValue}>{formatAmount(summary.totalLaborCost)}</div>
                    </div>
                    <div className={styles.summaryCard}>
                      <div className={styles.summaryLabel}>{tAccounting('totalMaintenanceCost')}</div>
                      <div className={styles.summaryValue}>{formatAmount(summary.totalMaintenanceCost)}</div>
                    </div>
                    <div className={styles.summaryCard}>
                      <div className={styles.summaryLabel}>{tAccounting('totalCost')}</div>
                      <div className={styles.summaryValue}>{formatAmount(summary.totalCost)}</div>
                    </div>
                    <div className={styles.summaryCard}>
                      <div className={styles.summaryLabel}>{tAccounting('avgCostPerTon')}</div>
                      <div className={styles.summaryValue}>{formatAmount(summary.avgCostPerTon)}/طن</div>
                    </div>
                  </div>
                </div>

                {monthlyData.length > 0 && (
                  <div className={styles.tableContainer}>
                    <table className={styles.table}>
                      <thead>
                        <tr className={styles.tableHeader}>
                          <th className={styles.tableHeaderCell}>{tAccounting('month')}</th>
                          <th className={styles.tableHeaderCell}>{tAccounting('totalProduction')} (طن)</th>
                          <th className={styles.tableHeaderCell}>{tAccounting('totalCost')}</th>
                          <th className={styles.tableHeaderCell}>{tAccounting('costPerTon')}</th>
                        </tr>
                      </thead>
                      <tbody>
                        {monthlyData.map((month, index) => (
                          <tr key={month._id || index} className={styles.tableRow}>
                            <td className={styles.tableCell}>{month._id}</td>
                            <td className={styles.tableCell}>{formatNumber(month.totalProduction)}</td>
                            <td className={`${styles.tableCell} ${styles.cellAmount}`}>{formatAmount(month.totalCost)}</td>
                            <td className={`${styles.tableCell} ${styles.cellAmount}`}>{formatAmount(month.avgCostPerTon)}/طن</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </>
            )}

            {/* Cost Breakdown Report */}
            {reportType === 'cost-breakdown' && Object.keys(costBreakdown).length > 0 && (
              <div className={styles.summarySection}>
                <h3 className={styles.summaryTitle}>
                  <DollarSign className="inline-block w-5 h-5 ml-2" />
                  {tAccounting('costBreakdown')}
                </h3>
                <div className={styles.summaryGrid}>
                  <div className={styles.summaryCard}>
                    <div className={styles.summaryLabel}>{tAccounting('rawMaterialsCost')}</div>
                    <div className={styles.summaryValue}>{formatAmount(costBreakdown.rawMaterialsCost || 0)}</div>
                  </div>
                  <div className={styles.summaryCard}>
                    <div className={styles.summaryLabel}>{tAccounting('energyCost')}</div>
                    <div className={styles.summaryValue}>{formatAmount(costBreakdown.energyCost || 0)}</div>
                  </div>
                  <div className={styles.summaryCard}>
                    <div className={styles.summaryLabel}>{tAccounting('laborCost')}</div>
                    <div className={styles.summaryValue}>{formatAmount(costBreakdown.laborCost || 0)}</div>
                  </div>
                  <div className={styles.summaryCard}>
                    <div className={styles.summaryLabel}>{tAccounting('maintenanceCost')}</div>
                    <div className={styles.summaryValue}>{formatAmount(costBreakdown.maintenanceCost || 0)}</div>
                  </div>
                  <div className={styles.summaryCard}>
                    <div className={styles.summaryLabel}>{tAccounting('otherCosts')}</div>
                    <div className={styles.summaryValue}>{formatAmount(costBreakdown.otherCosts || 0)}</div>
                  </div>
                </div>
              </div>
            )}

            {/* Comparison Report */}
            {reportType === 'comparison' && comparison && (
              <div className={styles.summarySection}>
                <h3 className={styles.summaryTitle}>
                  <Factory className="inline-block w-5 h-5 ml-2" />
                  {tAccounting('periodComparison')}
                </h3>
                <div className={styles.summaryGrid}>
                  <div className={styles.summaryCard}>
                    <div className={styles.summaryLabel}>{tAccounting('totalProduction')}</div>
                    <div className={styles.summaryValue}>{formatNumber(comparison.current.totalProduction)}</div>
                    <div className="text-sm text-gray-500">
                      مقابل {formatNumber(comparison.previous.totalProduction)} في الفترة السابقة
                    </div>
                    <div className={`text-sm ${comparison.current.totalProduction >= comparison.previous.totalProduction ? 'text-green-600' : 'text-red-600'}`}>
                      {getPercentageChange(comparison.current.totalProduction, comparison.previous.totalProduction).toFixed(1)}%
                    </div>
                  </div>
                  <div className={styles.summaryCard}>
                    <div className={styles.summaryLabel}>{tAccounting('totalCost')}</div>
                    <div className={styles.summaryValue}>{formatAmount(comparison.current.totalCost)}</div>
                    <div className="text-sm text-gray-500">
                      مقابل {formatAmount(comparison.previous.totalCost)} في الفترة السابقة
                    </div>
                    <div className={`text-sm ${comparison.current.totalCost <= comparison.previous.totalCost ? 'text-green-600' : 'text-red-600'}`}>
                      {getPercentageChange(comparison.current.totalCost, comparison.previous.totalCost).toFixed(1)}%
                    </div>
                  </div>
                  <div className={styles.summaryCard}>
                    <div className={styles.summaryLabel}>{tAccounting('costPerTon')}</div>
                    <div className={styles.summaryValue}>{formatAmount(comparison.current.costPerTon)}/طن</div>
                    <div className="text-sm text-gray-500">
                      مقابل {formatAmount(comparison.previous.costPerTon)}/طن في الفترة السابقة
                    </div>
                    <div className={`text-sm ${comparison.current.costPerTon <= comparison.previous.costPerTon ? 'text-green-600' : 'text-red-600'}`}>
                      {getPercentageChange(comparison.current.costPerTon, comparison.previous.costPerTon).toFixed(1)}%
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* No Data */}
            {reportType === 'summary' && !summary && (
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