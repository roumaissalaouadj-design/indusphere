'use client';

import { useState, useEffect } from 'react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import styles from '@/styles/pages/reports.module.css';

// ==================== تعريف الأنواع ====================

interface SalesSummaryData {
  totalInvoices: number;
  totalQuantity: number;
  totalAmount: number;
  totalPaid: number;
  totalRemaining: number;
}

interface SalesReportResponse {
  summary: SalesSummaryData;
  byProduct: Array<{ _id: string; totalQuantity: number; totalAmount: number }>;
  byStatus: Array<{ _id: string; count: number; totalAmount: number }>;
}

interface ProductionSummaryData {
  totalProduction: number;
  totalRawMaterialsCost: number;
  totalEnergyCost: number;
  totalLaborCost: number;
  totalMaintenanceCost: number;
  totalOtherCosts: number;
  totalCost: number;
  avgCostPerTon: number;
}

interface ProductionReportResponse {
  summary: ProductionSummaryData;
  monthlyData: Array<{ _id: string; totalProduction: number; totalCost: number; avgCostPerTon: number }>;
}

interface PayrollSummaryData {
  totalEmployees: number;
  totalBaseSalary: number;
  totalAllowances: number;
  totalBonuses: number;
  totalDeductions: number;
  totalNetSalary: number;
}

interface PayrollReportResponse {
  summary: PayrollSummaryData;
  byDepartment: Array<{ _id: string; totalEmployees: number; totalNetSalary: number }>;
}

interface TaxSummaryItem {
  _id: string;
  totalDeclarations: number;
  totalTaxableBase: number;
  totalTaxAmount: number;
  totalPaid: number;
  totalRemaining: number;
}

interface TaxReportResponse {
  summary: TaxSummaryItem[];
  monthlyData: Array<{ _id: string; totalAmount: number; totalPaid: number }>;
}

interface AISection {
  title: string;
  icon: string;
  score: number;
  status: string;
  analysis: string;
  highlights: string[];
  issues: string[];
  recommendations: string[];
}

interface AIReportData {
  overallScore: number;
  overallStatus: string;
  executiveSummary: string;
  sections: AISection[];
  topPriorities: string[];
  forecast: string;
}

type TabType = 'ai' | 'sales' | 'production' | 'payroll' | 'taxes';

// ==================== دوال مساعدة للتصدير ====================

type ExportDataRow = (string | number)[];

const exportToCSV = (data: ExportDataRow[], headers: string[], filename: string): void => {
  const csvRows: string[] = [];
  csvRows.push(headers.join(','));
  for (const row of data) {
    csvRows.push(row.join(','));
  }
  const csvContent = csvRows.join('\n');
  const blob = new Blob([`\uFEFF${csvContent}`], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.setAttribute('download', `${filename}_${new Date().toISOString().split('T')[0]}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

const exportToPDF = async (title: string, headers: string[], data: ExportDataRow[], filename: string): Promise<void> => {
  const element = document.createElement('div');
  element.style.direction = 'rtl';
  element.style.fontFamily = 'Arial, sans-serif';
  element.style.padding = '20px';
  element.style.backgroundColor = 'white';
  element.style.width = '800px';
  
  const titleEl = document.createElement('h1');
  titleEl.textContent = title;
  titleEl.style.textAlign = 'center';
  titleEl.style.color = '#2C3E50';
  titleEl.style.marginBottom = '10px';
  titleEl.style.fontSize = '24px';
  element.appendChild(titleEl);
  
  const dateEl = document.createElement('p');
  dateEl.textContent = `تاريخ التقرير: ${new Date().toLocaleDateString('ar-DZ')}`;
  dateEl.style.textAlign = 'center';
  dateEl.style.color = '#666';
  dateEl.style.marginBottom = '20px';
  dateEl.style.fontSize = '12px';
  element.appendChild(dateEl);
  
  const table = document.createElement('table');
  table.style.width = '100%';
  table.style.borderCollapse = 'collapse';
  table.style.direction = 'rtl';
  
  const thead = document.createElement('thead');
  const headerRow = document.createElement('tr');
  headerRow.style.backgroundColor = '#1ABC9C';
  for (const header of headers) {
    const th = document.createElement('th');
    th.textContent = header;
    th.style.padding = '10px';
    th.style.border = '1px solid #ddd';
    th.style.color = 'white';
    th.style.textAlign = 'center';
    th.style.fontWeight = 'bold';
    headerRow.appendChild(th);
  }
  thead.appendChild(headerRow);
  table.appendChild(thead);
  
  const tbody = document.createElement('tbody');
  for (let i = 0; i < data.length; i++) {
    const row = document.createElement('tr');
    row.style.backgroundColor = i % 2 === 0 ? '#f9f9f9' : 'white';
    for (const cell of data[i]) {
      const td = document.createElement('td');
      td.textContent = cell.toString();
      td.style.padding = '8px';
      td.style.border = '1px solid #ddd';
      td.style.textAlign = 'center';
      row.appendChild(td);
    }
    tbody.appendChild(row);
  }
  table.appendChild(tbody);
  element.appendChild(table);
  
  document.body.appendChild(element);
  
  try {
    const canvas = await html2canvas(element, {
      scale: 2,
      backgroundColor: '#ffffff',
      logging: false,
    });
    
    const imgData = canvas.toDataURL('image/png');
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
    });
    
    const imgWidth = 210;
    const imgHeight = (canvas.height * imgWidth) / canvas.width;
    
    doc.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);
    doc.save(`${filename}_${new Date().toISOString().split('T')[0]}.pdf`);
  } catch (error) {
    console.error('Error generating PDF:', error);
    alert('حدث خطأ في إنشاء ملف PDF');
  } finally {
    document.body.removeChild(element);
  }
};

// ==================== مكونات التقارير المحاسبية ====================

function SalesReport({ startDate, endDate }: { startDate: string; endDate: string }) {
  const [data, setData] = useState<SalesReportResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchSalesReport = async (): Promise<void> => {
      setLoading(true);
      try {
        const res = await fetch(`/api/accounting/reports/sales?type=summary&startDate=${startDate}&endDate=${endDate}`);
        const json = await res.json();
        if (json.success) setData(json.data);
      } catch (error) {
        console.error('Error fetching sales report', error);
      } finally {
        setLoading(false);
      }
    };
    fetchSalesReport();
  }, [startDate, endDate]);

  const handleExportCSV = (): void => {
    if (!data) return;
    const headers: string[] = ['البيان', 'القيمة'];
    const rows: ExportDataRow[] = [
      ['إجمالي الفواتير', data.summary.totalInvoices],
      ['إجمالي الكمية (طن)', data.summary.totalQuantity],
      ['إجمالي المبيعات (دج)', data.summary.totalAmount],
      ['المبلغ المدفوع (دج)', data.summary.totalPaid],
      ['المبلغ المتبقي (دج)', data.summary.totalRemaining],
    ];
    exportToCSV(rows, headers, 'sales_report');
  };

  const handleExportPDF = async (): Promise<void> => {
    if (!data) return;
    const headers: string[] = ['البيان', 'القيمة'];
    const rows: ExportDataRow[] = [
      ['إجمالي الفواتير', data.summary.totalInvoices],
      ['إجمالي الكمية (طن)', data.summary.totalQuantity],
      ['إجمالي المبيعات (دج)', data.summary.totalAmount],
      ['المبلغ المدفوع (دج)', data.summary.totalPaid],
      ['المبلغ المتبقي (دج)', data.summary.totalRemaining],
    ];
    await exportToPDF('تقرير المبيعات', headers, rows, 'sales_report');
  };

  const handlePrint = (): void => {
    window.print();
  };

  if (loading) return <div className={styles.loadingSmall}>جاري التحميل...</div>;
  if (!data) return <div className={styles.emptySmall}>لا توجد بيانات</div>;

  const summary = data.summary;

  return (
    <div className={styles.reportContainer}>
      <div className={styles.reportHeaderButtons}>
        <button onClick={handlePrint} className={styles.printBtn}>🖨️ طباعة</button>
        <button onClick={handleExportCSV} className={styles.exportBtnCSV}>📥 CSV</button>
        <button onClick={handleExportPDF} className={styles.exportBtnPDF}>📄 PDF</button>
      </div>
      <div className={styles.statsGrid}>
        <div className={styles.statCard}>
          <div className={styles.statLabel}>إجمالي الفواتير</div>
          <div className={styles.statValue}>{summary.totalInvoices || 0}</div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statLabel}>إجمالي الكمية (طن)</div>
          <div className={styles.statValue}>{(summary.totalQuantity || 0).toLocaleString()}</div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statLabel}>إجمالي المبيعات</div>
          <div className={styles.statValue}>{(summary.totalAmount || 0).toLocaleString()} دج</div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statLabel}>المبلغ المدفوع</div>
          <div className={styles.statValueGreen}>{(summary.totalPaid || 0).toLocaleString()} دج</div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statLabel}>المبلغ المتبقي</div>
          <div className={styles.statValueRed}>{(summary.totalRemaining || 0).toLocaleString()} دج</div>
        </div>
      </div>
    </div>
  );
}

function ProductionReport({ startDate, endDate }: { startDate: string; endDate: string }) {
  const [data, setData] = useState<ProductionReportResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchProductionReport = async (): Promise<void> => {
      setLoading(true);
      try {
        const res = await fetch(`/api/accounting/reports/production?type=summary&startDate=${startDate}&endDate=${endDate}`);
        const json = await res.json();
        if (json.success) setData(json.data);
      } catch (error) {
        console.error('Error fetching production report', error);
      } finally {
        setLoading(false);
      }
    };
    fetchProductionReport();
  }, [startDate, endDate]);

  const handleExportCSV = (): void => {
    if (!data) return;
    const headers: string[] = ['البيان', 'القيمة'];
    const rows: ExportDataRow[] = [
      ['إجمالي الإنتاج (طن)', data.summary.totalProduction],
      ['تكاليف المواد الخام (دج)', data.summary.totalRawMaterialsCost],
      ['تكاليف الطاقة (دج)', data.summary.totalEnergyCost],
      ['تكاليف العمالة (دج)', data.summary.totalLaborCost],
      ['تكاليف الصيانة (دج)', data.summary.totalMaintenanceCost],
      ['إجمالي التكاليف (دج)', data.summary.totalCost],
      ['متوسط تكلفة الطن (دج)', data.summary.avgCostPerTon],
    ];
    exportToCSV(rows, headers, 'production_report');
  };

  const handleExportPDF = async (): Promise<void> => {
    if (!data) return;
    const headers: string[] = ['البيان', 'القيمة'];
    const rows: ExportDataRow[] = [
      ['إجمالي الإنتاج (طن)', data.summary.totalProduction],
      ['تكاليف المواد الخام (دج)', data.summary.totalRawMaterialsCost],
      ['تكاليف الطاقة (دج)', data.summary.totalEnergyCost],
      ['تكاليف العمالة (دج)', data.summary.totalLaborCost],
      ['تكاليف الصيانة (دج)', data.summary.totalMaintenanceCost],
      ['إجمالي التكاليف (دج)', data.summary.totalCost],
      ['متوسط تكلفة الطن (دج)', data.summary.avgCostPerTon],
    ];
    await exportToPDF('تقرير الإنتاج', headers, rows, 'production_report');
  };

  const handlePrint = (): void => {
    window.print();
  };

  if (loading) return <div className={styles.loadingSmall}>جاري التحميل...</div>;
  if (!data) return <div className={styles.emptySmall}>لا توجد بيانات</div>;

  const summary = data.summary;

  return (
    <div className={styles.reportContainer}>
      <div className={styles.reportHeaderButtons}>
        <button onClick={handlePrint} className={styles.printBtn}>🖨️ طباعة</button>
        <button onClick={handleExportCSV} className={styles.exportBtnCSV}>📥 CSV</button>
        <button onClick={handleExportPDF} className={styles.exportBtnPDF}>📄 PDF</button>
      </div>
      <div className={styles.statsGrid}>
        <div className={styles.statCard}>
          <div className={styles.statLabel}>إجمالي الإنتاج (طن)</div>
          <div className={styles.statValue}>{(summary.totalProduction || 0).toLocaleString()}</div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statLabel}>تكاليف المواد الخام</div>
          <div className={styles.statValue}>{(summary.totalRawMaterialsCost || 0).toLocaleString()} دج</div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statLabel}>تكاليف الطاقة</div>
          <div className={styles.statValue}>{(summary.totalEnergyCost || 0).toLocaleString()} دج</div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statLabel}>تكاليف العمالة</div>
          <div className={styles.statValue}>{(summary.totalLaborCost || 0).toLocaleString()} دج</div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statLabel}>تكاليف الصيانة</div>
          <div className={styles.statValue}>{(summary.totalMaintenanceCost || 0).toLocaleString()} دج</div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statLabel}>إجمالي التكاليف</div>
          <div className={styles.statValue}>{(summary.totalCost || 0).toLocaleString()} دج</div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statLabel}>متوسط تكلفة الطن</div>
          <div className={styles.statValueBlue}>{(summary.avgCostPerTon || 0).toLocaleString()} دج/طن</div>
        </div>
      </div>
    </div>
  );
}

function PayrollReport({ startDate, endDate }: { startDate: string; endDate: string }) {
  const [data, setData] = useState<PayrollReportResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchPayrollReport = async (): Promise<void> => {
      setLoading(true);
      try {
        const res = await fetch(`/api/accounting/reports/payroll?type=summary&startDate=${startDate}&endDate=${endDate}`);
        const json = await res.json();
        if (json.success) setData(json.data);
      } catch (error) {
        console.error('Error fetching payroll report', error);
      } finally {
        setLoading(false);
      }
    };
    fetchPayrollReport();
  }, [startDate, endDate]);

  const handleExportCSV = (): void => {
    if (!data) return;
    const headers: string[] = ['البيان', 'القيمة'];
    const rows: ExportDataRow[] = [
      ['عدد الموظفين', data.summary.totalEmployees],
      ['إجمالي الرواتب الأساسية (دج)', data.summary.totalBaseSalary],
      ['إجمالي البدلات (دج)', data.summary.totalAllowances],
      ['إجمالي المكافآت (دج)', data.summary.totalBonuses],
      ['إجمالي الاستقطاعات (دج)', data.summary.totalDeductions],
      ['صافي الرواتب (دج)', data.summary.totalNetSalary],
    ];
    exportToCSV(rows, headers, 'payroll_report');
  };

  const handleExportPDF = async (): Promise<void> => {
    if (!data) return;
    const headers: string[] = ['البيان', 'القيمة'];
    const rows: ExportDataRow[] = [
      ['عدد الموظفين', data.summary.totalEmployees],
      ['إجمالي الرواتب الأساسية (دج)', data.summary.totalBaseSalary],
      ['إجمالي البدلات (دج)', data.summary.totalAllowances],
      ['إجمالي المكافآت (دج)', data.summary.totalBonuses],
      ['إجمالي الاستقطاعات (دج)', data.summary.totalDeductions],
      ['صافي الرواتب (دج)', data.summary.totalNetSalary],
    ];
    await exportToPDF('تقرير الرواتب', headers, rows, 'payroll_report');
  };

  const handlePrint = (): void => {
    window.print();
  };

  if (loading) return <div className={styles.loadingSmall}>جاري التحميل...</div>;
  if (!data) return <div className={styles.emptySmall}>لا توجد بيانات</div>;

  const summary = data.summary;

  return (
    <div className={styles.reportContainer}>
      <div className={styles.reportHeaderButtons}>
        <button onClick={handlePrint} className={styles.printBtn}>🖨️ طباعة</button>
        <button onClick={handleExportCSV} className={styles.exportBtnCSV}>📥 CSV</button>
        <button onClick={handleExportPDF} className={styles.exportBtnPDF}>📄 PDF</button>
      </div>
      <div className={styles.statsGrid}>
        <div className={styles.statCard}>
          <div className={styles.statLabel}>عدد الموظفين</div>
          <div className={styles.statValue}>{summary.totalEmployees || 0}</div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statLabel}>إجمالي الرواتب الأساسية</div>
          <div className={styles.statValue}>{(summary.totalBaseSalary || 0).toLocaleString()} دج</div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statLabel}>إجمالي البدلات</div>
          <div className={styles.statValue}>{(summary.totalAllowances || 0).toLocaleString()} دج</div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statLabel}>إجمالي المكافآت</div>
          <div className={styles.statValue}>{(summary.totalBonuses || 0).toLocaleString()} دج</div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statLabel}>إجمالي الاستقطاعات</div>
          <div className={styles.statValueRed}>{(summary.totalDeductions || 0).toLocaleString()} دج</div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statLabel}>صافي الرواتب</div>
          <div className={styles.statValueGreen}>{(summary.totalNetSalary || 0).toLocaleString()} دج</div>
        </div>
      </div>
    </div>
  );
}

function TaxReport({ startDate, endDate }: { startDate: string; endDate: string }) {
  const [data, setData] = useState<TaxReportResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchTaxReport = async (): Promise<void> => {
      setLoading(true);
      try {
        const res = await fetch(`/api/accounting/reports/taxes?type=summary&startDate=${startDate}&endDate=${endDate}`);
        const json = await res.json();
        if (json.success) setData(json.data);
      } catch (error) {
        console.error('Error fetching tax report', error);
      } finally {
        setLoading(false);
      }
    };
    fetchTaxReport();
  }, [startDate, endDate]);

  const handleExportCSV = (): void => {
    if (!data) return;
    const headers: string[] = ['نوع الضريبة', 'مبلغ الضريبة (دج)', 'المدفوع (دج)', 'المتبقي (دج)'];
    const rows: ExportDataRow[] = data.summary.map(item => [
      item._id,
      item.totalTaxAmount,
      item.totalPaid,
      item.totalRemaining,
    ]);
    exportToCSV(rows, headers, 'tax_report');
  };

  const handleExportPDF = async (): Promise<void> => {
    if (!data) return;
    const headers: string[] = ['نوع الضريبة', 'مبلغ الضريبة (دج)', 'المدفوع (دج)', 'المتبقي (دج)'];
    const rows: ExportDataRow[] = data.summary.map(item => [
      item._id,
      item.totalTaxAmount,
      item.totalPaid,
      item.totalRemaining,
    ]);
    await exportToPDF('تقرير الضرائب', headers, rows, 'tax_report');
  };

  const handlePrint = (): void => {
    window.print();
  };

  if (loading) return <div className={styles.loadingSmall}>جاري التحميل...</div>;
  if (!data) return <div className={styles.emptySmall}>لا توجد بيانات</div>;

  const summary = data.summary;

  return (
    <div className={styles.reportContainer}>
      <div className={styles.reportHeaderButtons}>
        <button onClick={handlePrint} className={styles.printBtn}>🖨️ طباعة</button>
        <button onClick={handleExportCSV} className={styles.exportBtnCSV}>📥 CSV</button>
        <button onClick={handleExportPDF} className={styles.exportBtnPDF}>📄 PDF</button>
      </div>
      <div className={styles.statsGrid}>
        {summary.map((item, idx) => (
          <div key={idx} className={styles.statCard}>
            <div className={styles.statLabel}>{item._id}</div>
            <div className={styles.statValue}>{(item.totalTaxAmount || 0).toLocaleString()} دج</div>
            <div className={styles.statSmall}>مدفوع: {(item.totalPaid || 0).toLocaleString()} دج</div>
            <div className={styles.statSmallRed}>متبقي: {(item.totalRemaining || 0).toLocaleString()} دج</div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ==================== الصفحة الرئيسية ====================

const statusClass = (status: string): string => {
  switch (status) {
    case 'ممتاز': return styles.statusExcellent;
    case 'جيد':   return styles.statusGood;
    case 'متوسط': return styles.statusAverage;
    case 'ضعيف':  return styles.statusPoor;
    default:      return styles.statusDefault;
  }
};

const scoreClass = (score: number): string => {
  if (score >= 80) return styles.scoreExcellent;
  if (score >= 60) return styles.scoreGood;
  if (score >= 40) return styles.scoreAverage;
  return styles.scorePoor;
};

export default function ReportsPage() {
  const [activeTab, setActiveTab] = useState<TabType>('ai');
  const [aiData, setAiData] = useState<AIReportData | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');

  const fetchAIReport = async (): Promise<void> => {
    setLoading(true);
    try {
      const res = await fetch('/api/ai/report-analysis');
      const json = await res.json();
      if (json.success) {
        setAiData(json.data);
        setLastUpdated(new Date());
      }
    } catch (error) {
      console.error('Error fetching AI report', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAIReport();
  }, []);

  const tabs: { id: TabType; label: string; icon: string }[] = [
    { id: 'ai', label: 'التحليل الذكي', icon: '🤖' },
    { id: 'sales', label: 'المبيعات', icon: '💰' },
    { id: 'production', label: 'الإنتاج', icon: '🏭' },
    { id: 'payroll', label: 'الرواتب', icon: '👥' },
    { id: 'taxes', label: 'الضرائب', icon: '📑' },
  ];

  return (
    <div className={styles.page} dir="rtl">
      <div className={styles.container}>
        <div className={styles.header}>
          <div className={styles.headerRight}>
            <div className={styles.titleRow}>
              <span className={styles.titleIcon}>📊</span>
              <h1 className={styles.title}>التقارير والتحليلات</h1>
            </div>
            <p className={styles.subtitle}>تحليل شامل لأداء المصنع والتقارير المالية</p>
            {lastUpdated && activeTab === 'ai' && (
              <p className={styles.lastUpdated}>آخر تحديث للتحليل: {lastUpdated.toLocaleTimeString('ar-DZ')}</p>
            )}
          </div>
          <div className={styles.headerButtons}>
            {activeTab === 'ai' && (
              <button onClick={fetchAIReport} disabled={loading} className={styles.refreshButton}>
                {loading ? '⏳ جاري التحليل...' : '🔄 تحديث التقرير'}
              </button>
            )}
          </div>
        </div>

        {activeTab !== 'ai' && (
          <div className={styles.filterBar}>
            <div className={styles.filterGroup}>
              <label className={styles.filterLabel}>من تاريخ</label>
              <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className={styles.filterInput} />
            </div>
            <div className={styles.filterGroup}>
              <label className={styles.filterLabel}>إلى تاريخ</label>
              <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className={styles.filterInput} />
            </div>
          </div>
        )}

        <div className={styles.tabsContainer}>
          {tabs.map((tab) => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`${styles.tabButton} ${activeTab === tab.id ? styles.tabActive : ''}`}>
              <span className={styles.tabIcon}>{tab.icon}</span>
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        <div className={styles.tabContent}>
          {activeTab === 'ai' && (
            <>
              {loading && (
                <div className={styles.loadingCard}>
                  <div className={styles.loadingIcon}>🤖</div>
                  <p className={styles.loadingTitle}>جاري تحليل بيانات المصنع...</p>
                  <p className={styles.loadingSubtitle}>الذكاء الاصطناعي يفحص جميع وحدات المصنع</p>
                </div>
              )}
              {!loading && aiData && (
                <>
                  <div className={styles.overallCard}>
                    <div className={styles.scoreCircleWrapper}>
                      <div className={`${styles.scoreCircle} ${scoreClass(aiData.overallScore)}`}>
                        <span className={styles.scoreNumber}>{aiData.overallScore}</span>
                        <span className={styles.scoreMax}>/ 100</span>
                      </div>
                      <span className={`${styles.badge} ${statusClass(aiData.overallStatus)}`}>{aiData.overallStatus}</span>
                    </div>
                    <div className={styles.summaryBlock}>
                      <h2 className={styles.summaryTitle}>الملخص التنفيذي</h2>
                      <p className={styles.summaryText}>{aiData.executiveSummary}</p>
                    </div>
                  </div>
                  {aiData.topPriorities.length > 0 && (
                    <div className={styles.prioritiesCard}>
                      <h3 className={styles.prioritiesTitle}>🚨 أولويات العمل</h3>
                      <div className={styles.prioritiesList}>
                        {aiData.topPriorities.map((p, i) => (
                          <div key={i} className={styles.priorityItem}>
                            <span className={styles.priorityNumber}>{i + 1}</span>
                            <span className={styles.priorityText}>{p}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  <div className={styles.sectionsGrid}>
                    {aiData.sections.map((section, i) => (
                      <div key={i} className={`${styles.sectionCard} ${statusClass(section.status)}-border`}>
                        <div className={styles.sectionHeader}>
                          <div className={styles.sectionTitleRow}>
                            <span className={styles.sectionIcon}>{section.icon}</span>
                            <h3 className={styles.sectionTitle}>{section.title}</h3>
                          </div>
                          <div className={styles.sectionScore}>
                            <span className={`${styles.sectionScoreNum} ${scoreClass(section.score)}`}>{section.score}%</span>
                            <span className={`${styles.badge} ${statusClass(section.status)}`}>{section.status}</span>
                          </div>
                        </div>
                        <div className={styles.scoreBar}>
                          <div className={`${styles.scoreBarFill} ${scoreClass(section.score)}`} style={{ width: `${section.score}%` }} />
                        </div>
                        <p className={styles.sectionAnalysis}>{section.analysis}</p>
                        <div className={styles.sectionDetails}>
                          {section.highlights.length > 0 && (
                            <div>
                              <p className={styles.detailLabelSuccess}>✅ الإيجابيات</p>
                              {section.highlights.map((h, j) => <p key={j} className={styles.detailItem}>• {h}</p>)}
                            </div>
                          )}
                          {section.issues.length > 0 && (
                            <div>
                              <p className={styles.detailLabelDanger}>⚠️ المشاكل</p>
                              {section.issues.map((issue, j) => <p key={j} className={styles.detailItem}>• {issue}</p>)}
                            </div>
                          )}
                        </div>
                        {section.recommendations.length > 0 && (
                          <div className={styles.recommendations}>
                            <p className={styles.detailLabelWarning}>🔧 التوصيات</p>
                            {section.recommendations.map((r, j) => <p key={j} className={styles.detailItem}>• {r}</p>)}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                  {aiData.forecast && (
                    <div className={styles.forecastCard}>
                      <h3 className={styles.forecastTitle}>🔮 التوقعات المستقبلية</h3>
                      <p className={styles.forecastText}>{aiData.forecast}</p>
                    </div>
                  )}
                </>
              )}
              {!loading && !aiData && (
                <div className={styles.emptyState}>
                  <div className={styles.emptyIcon}>📊</div>
                  <p className={styles.emptyText}>اضغط "تحديث التقرير" لبدء التحليل</p>
                </div>
              )}
            </>
          )}
          {activeTab === 'sales' && <SalesReport startDate={startDate} endDate={endDate} />}
          {activeTab === 'production' && <ProductionReport startDate={startDate} endDate={endDate} />}
          {activeTab === 'payroll' && <PayrollReport startDate={startDate} endDate={endDate} />}
          {activeTab === 'taxes' && <TaxReport startDate={startDate} endDate={endDate} />}
        </div>
      </div>
    </div>
  );
}