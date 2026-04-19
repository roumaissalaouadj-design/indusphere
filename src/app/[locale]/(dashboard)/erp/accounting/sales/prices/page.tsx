// src/app/[locale]/(dashboard)/erp/accounting/sales/prices/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations, useLocale } from 'next-intl';
import { Plus, Tag } from 'lucide-react';
import TableActions from '@/components/TableActions';
import styles from '@/styles/pages/accounting/product-prices.module.css';

interface ProductPrice {
  _id: string;
  productType: string;
  cementType?: string;
  strengthClass?: string;
  minQuantity: number;
  maxQuantity: number;
  price: number;
  isActive: boolean;
  effectiveFrom: string;
  effectiveTo?: string;
}

interface Filters {
  productType: string;
  isActive: string;
}

const productLabels: Record<string, string> = {
  cement: 'أسمنت',
  clinker: 'كلنكر',
};

const cementTypeLabels: Record<string, string> = {
  CEM_I: 'CEM I',
  CEM_II: 'CEM II',
  CEM_III: 'CEM III',
  CEM_IV: 'CEM IV',
  CEM_V: 'CEM V',
};

const strengthLabels: Record<string, string> = {
  '32.5': '32.5 R',
  '42.5': '42.5 R',
  '52.5': '52.5 R',
};

export default function ProductPricesPage() {
  const router = useRouter();
  const locale = useLocale();  // ✅ أضف هذا السطر
  const t = useTranslations('Common');
  const tAccounting = useTranslations('Accounting');
  
  const [prices, setPrices] = useState<ProductPrice[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<Filters>({
    productType: 'all',
    isActive: 'all',
  });

  useEffect(() => {
    fetchPrices();
  }, [filters]);

  const fetchPrices = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (filters.productType !== 'all') params.append('productType', filters.productType);
      if (filters.isActive !== 'all') params.append('isActive', filters.isActive);
      
      const res = await fetch(`/api/accounting/product-prices?${params}`);
      const data = await res.json();
      if (data.success) {
        setPrices(data.data);
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
      const res = await fetch(`/api/accounting/product-prices/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        await fetchPrices();
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

  const getProductDisplay = (price: ProductPrice) => {
    if (price.productType === 'cement') {
      return `${productLabels.cement} - ${cementTypeLabels[price.cementType || 'CEM_I']} - ${strengthLabels[price.strengthClass || '42.5']}`;
    }
    return productLabels.clinker;
  };

  return (
    <div className={styles.page}>
      <div className={styles.container}>
        {/* Header */}
        <div className={styles.header}>
          <div>
            <h1 className={styles.title}>
              <Tag className="inline-block w-6 h-6 ml-2 text-[#1ABC9C]" />
              {tAccounting('productPrices')}
            </h1>
            <p className={styles.subtitle}>
              {tAccounting('productPricesDescription')}
            </p>
          </div>
          <button
            onClick={() => router.push(`/${locale}/erp/accounting/sales/prices/new`)}
            className={styles.addButton}
          >
            <Plus className="w-4 h-4" />
            {tAccounting('addPrice')}
          </button>
        </div>

        {/* Filter Bar */}
        <div className={styles.filterBar}>
          <div className={styles.filterGroup}>
            <label className={styles.filterLabel}>{tAccounting('productType')}</label>
            <select
              value={filters.productType}
              onChange={(e) => setFilters({ ...filters, productType: e.target.value })}
              className={styles.filterSelect}
            >
              <option value="all">الكل</option>
              <option value="cement">أسمنت</option>
              <option value="clinker">كلنكر</option>
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

        {/* Error Message */}
        {error && (
          <div className={styles.errorMessage}>
            <p className={styles.errorText}>{error}</p>
          </div>
        )}

        {/* Prices Table */}
        <div className={styles.tableContainer}>
          <table className={styles.table}>
            <thead>
              <tr className={styles.tableHeader}>
                <th className={styles.tableHeaderCell}>{tAccounting('product')}</th>
                <th className={styles.tableHeaderCell}>{tAccounting('minQuantity')} (طن)</th>
                <th className={styles.tableHeaderCell}>{tAccounting('maxQuantity')} (طن)</th>
                <th className={styles.tableHeaderCell}>{tAccounting('price')} (دج/طن)</th>
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
              ) : prices.length === 0 ? (
                <tr>
                  <td colSpan={7} className={styles.emptyState}>
                    <Tag className="w-12 h-12 mx-auto mb-2 text-gray-400" />
                    {t('noData')}
                  </td>
                </tr>
              ) : (
                prices.map((price) => (
                  <tr key={price._id} className={styles.tableRow}>
                    <td className={styles.tableCell}>{getProductDisplay(price)}</td>
                    <td className={styles.tableCell}>{price.minQuantity.toLocaleString()}</td>
                    <td className={styles.tableCell}>{price.maxQuantity.toLocaleString()}</td>
                    <td className={`${styles.tableCell} ${styles.cellPrice}`}>
                      {formatAmount(price.price)}
                    </td>
                    <td className={styles.tableCell}>{formatDate(price.effectiveFrom)}</td>
                    <td className={styles.tableCell}>
                      <span className={`${styles.badge} ${price.isActive ? styles.badgeActive : styles.badgeInactive}`}>
                        {price.isActive ? t('active') : t('inactive')}
                      </span>
                    </td>
                    <td className={styles.actionsCell}>
                      {/* ✅ استخدام TableActions بدلاً من الأزرار العادية */}
                      <TableActions
                        id={price._id}
                        editUrl={`/${locale}/erp/accounting/sales/prices/${price._id}/edit`}
                        onDelete={() => handleDelete(price._id)}
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