// src/app/[locale]/(dashboard)/erp/accounting/production/costs/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { Plus, Eye, Trash2, Factory, TrendingUp, Search } from 'lucide-react';
import styles from '@/styles/pages/accounting/production-costs.module.css';

interface ProductionCost {
  _id: string;
  period: string;
  startDate: string;
  endDate: string;
  totalProduction: number;
  totalCost: number;
  costPerTon: number;
}

export default function ProductionCostsPage() {
  const router = useRouter();
  const t = useTranslations('Common');
  const tAccounting = useTranslations('Accounting');
  
  const [costs, setCosts] = useState<ProductionCost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState({
    startDate: '',
    endDate: '',
  });

  useEffect(() => {
    fetchCosts();
  }, [filters]);

  const fetchCosts = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (filters.startDate) params.append('startDate', filters.startDate);
      if (filters.endDate) params.append('endDate', filters.endDate);
      
      const res = await fetch(`/api/accounting/production-costs?${params}`);
      const data = await res.json();
      if (data.success) {
        setCosts(data.data);
      } else {
        setError(data.message);
      }
    } catch {
      setError(t('fetchError'));
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm(t('deleteConfirm'))) return;

    try {
      const res = await fetch(`/api/accounting/production-costs/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        await fetchCosts();
        alert(t('deleteSuccess'));
      } else {
        alert(data.message);
      }
    } catch {
      alert(t('error'));
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ar-DZ');
  };

  const formatAmount = (amount: number) => {
    return amount.toLocaleString('ar-DZ') + ' دج';
  };

  const formatNumber = (num: number) => {
    return num.toLocaleString('ar-DZ');
  };

  return (
    <div className={styles.page}>
      <div className={styles.container}>
        {/* Header */}
        <div className={styles.header}>
          <div>
            <h1 className={styles.title}>
              <Factory className="inline-block w-6 h-6 ml-2 text-[#1ABC9C]" />
              {tAccounting('productionCosts')}
            </h1>
            <p className={styles.subtitle}>
              {tAccounting('productionCostsDescription')}
            </p>
          </div>
          <button
            onClick={() => router.push('/erp/accounting/production/costs/new')}
            className={styles.addButton}
          >
            <Plus className="w-4 h-4" />
            {tAccounting('addProductionCost')}
          </button>
        </div>

        {/* Filter Bar */}
        <div className={styles.filterBar}>
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

        {/* Production Costs Table */}
        <div className={styles.tableContainer}>
          <table className={styles.table}>
            <thead>
              <tr className={styles.tableHeader}>
                <th className={styles.tableHeaderCell}>{tAccounting('period')}</th>
                <th className={styles.tableHeaderCell}>{tAccounting('startDate')}</th>
                <th className={styles.tableHeaderCell}>{tAccounting('endDate')}</th>
                <th className={styles.tableHeaderCell}>{tAccounting('totalProduction')} (طن)</th>
                <th className={styles.tableHeaderCell}>{tAccounting('totalCost')}</th>
                <th className={styles.tableHeaderCell}>{tAccounting('costPerTon')}</th>
                <th className={styles.tableHeaderCell}>{t('actions')}</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={7} className={styles.loadingState}>
                    <div className="flex items-center justify-center gap-2">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-[#1ABC9C]"></div>
                      {t('loading')}
                    </div>
                  </td>
                </tr>
              ) : costs.length === 0 ? (
                <tr>
                  <td colSpan={7} className={styles.emptyState}>
                    <Factory className="w-12 h-12 mx-auto mb-2 text-gray-400" />
                    {t('noData')}
                  </td>
                </tr>
              ) : (
                costs.map((cost) => (
                  <tr key={cost._id} className={styles.tableRow}>
                    <td className={`${styles.tableCell} ${styles.cellPeriod}`}>
                      {cost.period}
                    </td>
                    <td className={styles.tableCell}>{formatDate(cost.startDate)}</td>
                    <td className={styles.tableCell}>{formatDate(cost.endDate)}</td>
                    <td className={styles.tableCell}>{formatNumber(cost.totalProduction)}</td>
                    <td className={`${styles.tableCell} ${styles.cellAmount}`}>
                      {formatAmount(cost.totalCost)}
                    </td>
                    <td className={`${styles.tableCell} ${styles.cellAmount}`}>
                      {formatAmount(cost.costPerTon)}/طن
                    </td>
                    <td className={styles.actionsCell}>
                      <button
                        onClick={() => router.push(`/erp/accounting/production/costs/${cost._id}`)}
                        className="text-blue-500 hover:text-blue-700 ml-3"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(cost._id)}
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