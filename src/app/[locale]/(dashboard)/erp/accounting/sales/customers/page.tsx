// src/app/[locale]/(dashboard)/erp/accounting/sales/customers/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { Plus, Pencil, Trash2, Users, Phone, Mail, MapPin, Search } from 'lucide-react';
import styles from '@/styles/pages/accounting/customers.module.css';

interface Customer {
  _id: string;
  code: string;
  name: string;
  taxNumber: string;
  phone: string;
  email: string;
  address: string;
  contactPerson: string;
  paymentTerms: number;
  creditLimit: number;
  balance: number;
  isActive: boolean;
}

interface Filters {
  isActive: string;
  search: string;
}

export default function CustomersPage() {
  const router = useRouter();
  const t = useTranslations('Common');
  const tAccounting = useTranslations('Accounting');
  
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<Filters>({
    isActive: 'all',
    search: '',
  });

  useEffect(() => {
    fetchCustomers();
  }, [filters]);

  const fetchCustomers = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (filters.isActive !== 'all') params.append('isActive', filters.isActive);
      if (filters.search) params.append('search', filters.search);
      
      const res = await fetch(`/api/accounting/customers?${params}`);
      const data = await res.json();
      if (data.success) {
        setCustomers(data.data);
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
      const res = await fetch(`/api/accounting/customers/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        await fetchCustomers();
        alert(t('deleteSuccess'));
      } else {
        alert(data.message);
      }
    } catch {
      alert(t('error'));
    }
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
              <Users className="inline-block w-6 h-6 ml-2 text-[#1ABC9C]" />
              {tAccounting('customers')}
            </h1>
            <p className={styles.subtitle}>
              {tAccounting('customersDescription')}
            </p>
          </div>
          <button
            onClick={() => router.push('/erp/accounting/sales/customers/new')}
            className={styles.addButton}
          >
            <Plus className="w-4 h-4" />
            {tAccounting('addCustomer')}
          </button>
        </div>

        {/* Filter Bar */}
        <div className={styles.filterBar}>
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

          <div className={styles.filterGroup}>
            <label className={styles.filterLabel}>{t('search')}</label>
            <div className="relative">
              <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                value={filters.search}
                onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                placeholder={t('search')}
                className={styles.searchInput}
                style={{ paddingRight: '2rem' }}
              />
            </div>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className={styles.errorMessage}>
            <p className={styles.errorText}>{error}</p>
          </div>
        )}

        {/* Customers Table */}
        <div className={styles.tableContainer}>
          <table className={styles.table}>
            <thead>
              <tr className={styles.tableHeader}>
                <th className={styles.tableHeaderCell}>{tAccounting('customerCode')}</th>
                <th className={styles.tableHeaderCell}>{tAccounting('customerName')}</th>
                <th className={styles.tableHeaderCell}>{t('phone')}</th>
                <th className={styles.tableHeaderCell}>{t('email')}</th>
                <th className={styles.tableHeaderCell}>{tAccounting('balance')}</th>
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
              ) : customers.length === 0 ? (
                <tr>
                  <td colSpan={7} className={styles.emptyState}>
                    <Users className="w-12 h-12 mx-auto mb-2 text-gray-400" />
                    {t('noData')}
                  </td>
                </tr>
              ) : (
                customers.map((customer) => (
                  <tr key={customer._id} className={styles.tableRow}>
                    <td className={`${styles.tableCell} ${styles.cellCode}`}>
                      {customer.code}
                    </td>
                    <td className={`${styles.tableCell} ${styles.cellName}`}>
                      {customer.name}
                    </td>
                    <td className={styles.tableCell}>
                      <Phone className="inline-block w-3 h-3 ml-1 text-gray-400" />
                      {customer.phone}
                    </td>
                    <td className={styles.tableCell}>
                      <Mail className="inline-block w-3 h-3 ml-1 text-gray-400" />
                      {customer.email}
                    </td>
                    <td className={`${styles.tableCell} ${styles.cellAmount}`}>
                      {formatAmount(customer.balance)}
                    </td>
                    <td className={styles.tableCell}>
                      <span className={`${styles.badge} ${customer.isActive ? styles.badgeActive : styles.badgeInactive}`}>
                        {customer.isActive ? t('active') : t('inactive')}
                      </span>
                    </td>
                    <td className={styles.actionsCell}>
                      <button
                        onClick={() => router.push(`/erp/accounting/sales/customers/${customer._id}`)}
                        className="text-blue-500 hover:text-blue-700 ml-3"
                      >
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(customer._id)}
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