// src/app/[locale]/(dashboard)/erp/accounting/taxes/settings/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations, useLocale } from 'next-intl';
import { Plus, Settings, Calendar } from 'lucide-react';
import TableActions from '@/components/TableActions';
import styles from '@/styles/pages/accounting/taxes.module.css';

interface TaxSetting {
  _id: string;
  taxType: string;
  code: string;
  name: string;
  rate: number;
  appliesTo: string[];
  isActive: boolean;
  effectiveFrom: string;
}

const taxTypeLabels: Record<string, string> = {
  TVA: 'TVA (ضريبة القيمة المضافة)',
  IRG: 'IRG (ضريبة الدخل)',
  IBS: 'IBS (ضريبة الأرباح)',
  other: 'أخرى',
};

export default function TaxSettingsPage() {
  const router = useRouter();
  const locale = useLocale();  // ✅ أضف هذا السطر
  const t = useTranslations('Common');
  const tAccounting = useTranslations('Accounting');
  
  const [settings, setSettings] = useState<TaxSetting[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState({
    taxType: 'all',
    isActive: 'all',
  });

  useEffect(() => {
    fetchSettings();
  }, [filters]);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (filters.taxType !== 'all') params.append('taxType', filters.taxType);
      if (filters.isActive !== 'all') params.append('isActive', filters.isActive);
      
      const res = await fetch(`/api/accounting/taxes/settings?${params}`);
      const data = await res.json();
      if (data.success) {
        setSettings(data.data);
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
      const res = await fetch(`/api/accounting/taxes/settings/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        await fetchSettings();
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

  return (
    <div className={styles.page}>
      <div className={styles.container}>
        <div className={styles.header}>
          <div>
            <h1 className={styles.title}>
              <Settings className="inline-block w-6 h-6 ml-2 text-[#1ABC9C]" />
              {tAccounting('taxSettings')}
            </h1>
            <p className={styles.subtitle}>
              {tAccounting('taxSettingsDescription')}
            </p>
          </div>
          <button
            onClick={() => router.push(`/${locale}/erp/accounting/taxes/settings/new`)}
            className={styles.addButton}
          >
            <Plus className="w-4 h-4" />
            {tAccounting('addTaxSetting')}
          </button>
        </div>

        <div className={styles.filterBar}>
          <div className={styles.filterGroup}>
            <label className={styles.filterLabel}>{tAccounting('taxType')}</label>
            <select
              value={filters.taxType}
              onChange={(e) => setFilters({ ...filters, taxType: e.target.value })}
              className={styles.filterSelect}
            >
              <option value="all">الكل</option>
              <option value="TVA">TVA</option>
              <option value="IRG">IRG</option>
              <option value="IBS">IBS</option>
              <option value="other">أخرى</option>
            </select>
          </div>

          <div className={styles.filterGroup}>
            <label className={styles.filterLabel}>{t('status')}</label>
            <select
              value={filters.isActive}
              onChange={(e) => setFilters({ ...filters, isActive: e.target.value })}
              className={styles.filterSelect}
            >
              <option value="all">الكل</option>
              <option value="true">نشط</option>
              <option value="false">غير نشط</option>
            </select>
          </div>
        </div>

        {error && (
          <div className={styles.errorMessage}>
            <p className={styles.errorText}>{error}</p>
          </div>
        )}

        <div className={styles.tableContainer}>
          <table className={styles.table}>
            <thead>
              <tr className={styles.tableHeader}>
                <th className={styles.tableHeaderCell}>{tAccounting('code')}</th>
                <th className={styles.tableHeaderCell}>{tAccounting('name')}</th>
                <th className={styles.tableHeaderCell}>{tAccounting('taxType')}</th>
                <th className={styles.tableHeaderCell}>{tAccounting('rate')} (%)</th>
                <th className={styles.tableHeaderCell}>{tAccounting('effectiveFrom')}</th>
                <th className={styles.tableHeaderCell}>{t('status')}</th>
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
              ) : settings.length === 0 ? (
                <tr>
                  <td colSpan={7} className={styles.emptyState}>
                    <Settings className="w-12 h-12 mx-auto mb-2 text-gray-400" />
                    {t('noData')}
                  </td>
                </tr>
              ) : (
                settings.map((setting) => (
                  <tr key={setting._id} className={styles.tableRow}>
                    <td className={`${styles.tableCell} ${styles.cellCode}`}>
                      {setting.code}
                    </td>
                    <td className={`${styles.tableCell} ${styles.cellName}`}>
                      {setting.name}
                    </td>
                    <td className={styles.tableCell}>{taxTypeLabels[setting.taxType]}</td>
                    <td className={`${styles.tableCell} ${styles.cellAmount}`}>
                      {setting.rate}%
                    </td>
                    <td className={styles.tableCell}>
                      <Calendar className="inline-block w-3 h-3 ml-1 text-gray-400" />
                      {formatDate(setting.effectiveFrom)}
                    </td>
                    <td className={styles.tableCell}>
                      <span className={`${styles.badge} ${setting.isActive ? styles.badgeActive : styles.badgeInactive}`}>
                        {setting.isActive ? t('active') : t('inactive')}
                      </span>
                    </td>
                    <td className={styles.actionsCell}>
                      {/* ✅ استخدام TableActions بدلاً من الأزرار العادية */}
                      <TableActions
                        id={setting._id}
                        editUrl={`/${locale}/erp/accounting/taxes/settings/${setting._id}/edit`}
                        onDelete={() => handleDelete(setting._id)}
                      />
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