// src/app/[locale]/(dashboard)/erp/accounting/payroll/reports/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { BarChart, TrendingUp, Users, DollarSign, Download, Printer, Building2 } from 'lucide-react';
import styles from '@/styles/pages/accounting/payroll.module.css';

interface SummaryData {
  totalEmployees: number;
  totalBaseSalary: number;
  totalAllowances: number;
  totalBonuses: number;
  totalDeductions: number;
  totalNetSalary: number;
}

interface DepartmentData {
  _id: string;
  totalEmployees: number;
  totalNetSalary: number;
}

interface EmployeeReport {
  _id: string;
  employee: {
    employeeName: string;
    employeeCode: string;
    department: string;
  };
  totalPayments: number;
  totalNetSalary: number;
  averageNetSalary: number;
}

type ReportType = 'summary' | 'employee';

export default function PayrollReportsPage() {
  const t = useTranslations('Common');
  const tAccounting = useTranslations('Accounting');
  
  const [reportType, setReportType] = useState<ReportType>('summary');
  const [period, setPeriod] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [department, setDepartment] = useState('');
  const [summary, setSummary] = useState<SummaryData | null>(null);
  const [departmentData, setDepartmentData] = useState<DepartmentData[]>([]);
  const [employeeReport, setEmployeeReport] = useState<EmployeeReport[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchReport();
  }, [reportType, period, startDate, endDate, department]);

  const fetchReport = async () => {
    setLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams();
      params.append('type', reportType);
      if (period) params.append('period', period);
      if (startDate) params.append('startDate', startDate);
      if (endDate) params.append('endDate', endDate);
      if (department) params.append('department', department);

      const res = await fetch(`/api/accounting/reports/payroll?${params}`);
      const data = await res.json();

      if (data.success) {
        if (reportType === 'summary') {
          setSummary(data.data.summary);
          setDepartmentData(data.data.byDepartment);
        } else if (reportType === 'employee') {
          setEmployeeReport(data.data);
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
    
    if (reportType === 'summary' && summary) {
      csvContent = 'البيان,القيمة\n';
      csvContent += `عدد الموظفين,${summary.totalEmployees}\n`;
      csvContent += `إجمالي الرواتب الأساسية,${summary.totalBaseSalary}\n`;
      csvContent += `إجمالي البدلات,${summary.totalAllowances}\n`;
      csvContent += `إجمالي المكافآت,${summary.totalBonuses}\n`;
      csvContent += `إجمالي الاستقطاعات,${summary.totalDeductions}\n`;
      csvContent += `إجمالي الرواتب الصافية,${summary.totalNetSalary}\n`;
    } else if (reportType === 'employee') {
      csvContent = 'الموظف,القسم,عدد الدفعات,إجمالي الراتب,متوسط الراتب\n';
      employeeReport.forEach(emp => {
        csvContent += `${emp.employee?.employeeName},${emp.employee?.department},${emp.totalPayments},${emp.totalNetSalary},${emp.averageNetSalary}\n`;
      });
    }

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.href = url;
    link.setAttribute('download', `payroll_report_${reportType}_${new Date().toISOString().split('T')[0]}.csv`);
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
        <div className={styles.header}>
          <div>
            <h1 className={styles.title}>
              <BarChart className="inline-block w-6 h-6 ml-2 text-[#1ABC9C]" />
              {tAccounting('payrollReports')}
            </h1>
            <p className={styles.subtitle}>
              {tAccounting('payrollReportsDescription')}
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
              <option value="summary">تقرير ملخص الرواتب</option>
              <option value="employee">تقرير حسب الموظف</option>
            </select>
          </div>

          <div className={styles.filterGroup}>
            <label className={styles.filterLabel}>{tAccounting('period')}</label>
            <input
              type="text"
              value={period}
              onChange={(e) => setPeriod(e.target.value)}
              placeholder="مثال: 2024-01"
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

          {reportType === 'employee' && (
            <div className={styles.filterGroup}>
              <label className={styles.filterLabel}>{tAccounting('department')}</label>
              <select
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                className={styles.filterSelect}
              >
                <option value="">الكل</option>
                <option value="إنتاج">إنتاج</option>
                <option value="صيانة">صيانة</option>
                <option value="مبيعات">مبيعات</option>
                <option value="مشتريات">مشتريات</option>
                <option value="مالية">مالية</option>
                <option value="موارد بشرية">موارد بشرية</option>
              </select>
            </div>
          )}
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
            {reportType === 'summary' && summary && (
              <>
                <div className={styles.summarySection}>
                  <h3 className={styles.summaryTitle}>
                    <TrendingUp className="inline-block w-5 h-5 ml-2" />
                    {tAccounting('payrollSummary')}
                  </h3>
                  <div className={styles.summaryGrid}>
                    <div className={styles.summaryCard}>
                      <div className={styles.summaryLabel}>{tAccounting('totalEmployees')}</div>
                      <div className={styles.summaryValue}>{summary.totalEmployees}</div>
                    </div>
                    <div className={styles.summaryCard}>
                      <div className={styles.summaryLabel}>{tAccounting('totalBaseSalary')}</div>
                      <div className={styles.summaryValue}>{formatAmount(summary.totalBaseSalary)}</div>
                    </div>
                    <div className={styles.summaryCard}>
                      <div className={styles.summaryLabel}>{tAccounting('totalAllowances')}</div>
                      <div className={styles.summaryValue}>{formatAmount(summary.totalAllowances)}</div>
                    </div>
                    <div className={styles.summaryCard}>
                      <div className={styles.summaryLabel}>{tAccounting('totalBonuses')}</div>
                      <div className={styles.summaryValue}>{formatAmount(summary.totalBonuses)}</div>
                    </div>
                    <div className={styles.summaryCard}>
                      <div className={styles.summaryLabel}>{tAccounting('totalDeductions')}</div>
                      <div className={styles.summaryValue}>{formatAmount(summary.totalDeductions)}</div>
                    </div>
                    <div className={styles.summaryCard}>
                      <div className={styles.summaryLabel}>{tAccounting('totalNetSalary')}</div>
                      <div className={styles.summaryValue}>{formatAmount(summary.totalNetSalary)}</div>
                    </div>
                  </div>
                </div>

                {departmentData.length > 0 && (
                  <div className={styles.tableContainer}>
                    <table className={styles.table}>
                      <thead>
                        <tr className={styles.tableHeader}>
                          <th className={styles.tableHeaderCell}>{tAccounting('department')}</th>
                          <th className={styles.tableHeaderCell}>{tAccounting('totalEmployees')}</th>
                          <th className={styles.tableHeaderCell}>{tAccounting('totalNetSalary')}</th>
                        </tr>
                      </thead>
                      <tbody>
                        {departmentData.map((dept, index) => (
                          <tr key={dept._id || index} className={styles.tableRow}>
                            <td className={styles.tableCell}>
                              <Building2 className="inline-block w-3 h-3 ml-1 text-gray-400" />
                              {dept._id}
                            </td>
                            <td className={styles.tableCell}>{dept.totalEmployees}</td>
                            <td className={`${styles.tableCell} ${styles.cellAmount}`}>
                              {formatAmount(dept.totalNetSalary)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </>
            )}

            {/* Employee Report */}
            {reportType === 'employee' && employeeReport.length > 0 && (
              <div className={styles.tableContainer}>
                <table className={styles.table}>
                  <thead>
                    <tr className={styles.tableHeader}>
                      <th className={styles.tableHeaderCell}>{tAccounting('employee')}</th>
                      <th className={styles.tableHeaderCell}>{tAccounting('department')}</th>
                      <th className={styles.tableHeaderCell}>{tAccounting('totalPayments')}</th>
                      <th className={styles.tableHeaderCell}>{tAccounting('totalNetSalary')}</th>
                      <th className={styles.tableHeaderCell}>{tAccounting('averageNetSalary')}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {employeeReport.map((emp, index) => (
                      <tr key={emp._id || index} className={styles.tableRow}>
                        <td className={`${styles.tableCell} ${styles.cellName}`}>
                          {emp.employee?.employeeName} ({emp.employee?.employeeCode})
                        </td>
                        <td className={styles.tableCell}>{emp.employee?.department}</td>
                        <td className={styles.tableCell}>{emp.totalPayments}</td>
                        <td className={`${styles.tableCell} ${styles.cellAmount}`}>
                          {formatAmount(emp.totalNetSalary)}
                        </td>
                        <td className={`${styles.tableCell} ${styles.cellAmount}`}>
                          {formatAmount(emp.averageNetSalary)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* No Data */}
            {reportType === 'summary' && !summary && (
              <div className={styles.emptyState}>
                <BarChart className="w-12 h-12 mx-auto mb-2 text-gray-400" />
                {t('noData')}
              </div>
            )}

            {reportType === 'employee' && employeeReport.length === 0 && (
              <div className={styles.emptyState}>
                <Users className="w-12 h-12 mx-auto mb-2 text-gray-400" />
                {t('noData')}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}