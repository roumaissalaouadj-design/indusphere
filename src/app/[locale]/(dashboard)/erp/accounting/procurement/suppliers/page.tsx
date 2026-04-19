// src/app/[locale]/(dashboard)/erp/accounting/procurement/suppliers/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { Plus, Pencil, Trash2, Building2, Phone, Mail, MapPin, Search } from 'lucide-react';
import styles from '@/styles/pages/accounting/suppliers.module.css';

interface Supplier {
  _id: string;
  code: string;
  name: string;
  taxNumber: string;
  phone: string;
  email: string;
  address: string;
  bankAccount: string;
  category: 'raw_material' | 'service' | 'equipment';
  paymentTerms: number;
  balance: number;
  isActive: boolean;
}

interface FormData {
  code: string;
  name: string;
  taxNumber: string;
  phone: string;
  email: string;
  address: string;
  bankAccount: string;
  category: 'raw_material' | 'service' | 'equipment';
  paymentTerms: number;
}

interface Filters {
  category: string;
  isActive: string;
  search: string;
}

const categoryLabels: Record<string, string> = {
  raw_material: 'مواد خام',
  service: 'خدمات',
  equipment: 'تجهيزات',
};

export default function SuppliersPage() {
  const router = useRouter();
  const t = useTranslations('Common');
  const tAccounting = useTranslations('Accounting');
  
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<FormData>({
    code: '',
    name: '',
    taxNumber: '',
    phone: '',
    email: '',
    address: '',
    bankAccount: '',
    category: 'raw_material',
    paymentTerms: 30,
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<Filters>({
    category: 'all',
    isActive: 'all',
    search: '',
  });

  useEffect(() => {
    fetchSuppliers();
  }, [filters]);

  const fetchSuppliers = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (filters.category !== 'all') params.append('category', filters.category);
      if (filters.isActive !== 'all') params.append('isActive', filters.isActive);
      if (filters.search) params.append('search', filters.search);
      
      const res = await fetch(`/api/accounting/suppliers?${params}`);
      const data = await res.json();
      if (data.success) {
        setSuppliers(data.data);
      } else {
        setError(data.message);
      }
    } catch {
      setError(t('fetchError'));
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);

    try {
      const url = editingId 
        ? `/api/accounting/suppliers/${editingId}`
        : '/api/accounting/suppliers';
      const method = editingId ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });

      const data = await res.json();

      if (data.success) {
        await fetchSuppliers();
        resetForm();
        alert(editingId ? t('editSuccess') : t('addSuccess'));
      } else {
        setError(data.message);
      }
    } catch {
      setError(t('error'));
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm(t('deleteConfirm'))) return;

    try {
      const res = await fetch(`/api/accounting/suppliers/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        await fetchSuppliers();
        alert(t('deleteSuccess'));
      } else {
        alert(data.message);
      }
    } catch {
      alert(t('error'));
    }
  };

  const handleEdit = (supplier: Supplier) => {
    setForm({
      code: supplier.code,
      name: supplier.name,
      taxNumber: supplier.taxNumber,
      phone: supplier.phone,
      email: supplier.email,
      address: supplier.address,
      bankAccount: supplier.bankAccount || '',
      category: supplier.category,
      paymentTerms: supplier.paymentTerms || 30,
    });
    setEditingId(supplier._id);
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const resetForm = () => {
    setForm({
      code: '',
      name: '',
      taxNumber: '',
      phone: '',
      email: '',
      address: '',
      bankAccount: '',
      category: 'raw_material',
      paymentTerms: 30,
    });
    setEditingId(null);
    setShowForm(false);
  };

  return (
    <div className={styles.page}>
      <div className={styles.container}>
        {/* Header */}
        <div className={styles.header}>
          <div>
            <h1 className={styles.title}>
              <Building2 className="inline-block w-6 h-6 ml-2 text-[#1ABC9C]" />
              {tAccounting('suppliers')}
            </h1>
            <p className={styles.subtitle}>
              {tAccounting('suppliersDescription')}
            </p>
          </div>
          <button onClick={() => setShowForm(true)} className={styles.addButton}>
            <Plus className="w-4 h-4" />
            {tAccounting('addSupplier')}
          </button>
        </div>

        {/* Filter Bar */}
        <div className={styles.filterBar}>
          <div className={styles.filterGroup}>
            <label className={styles.filterLabel}>{t('category')}</label>
            <select
              value={filters.category}
              onChange={(e) => setFilters({ ...filters, category: e.target.value })}
              className={styles.filterSelect}
            >
              <option value="all">الكل</option>
              <option value="raw_material">مواد خام</option>
              <option value="service">خدمات</option>
              <option value="equipment">تجهيزات</option>
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

        {/* Add/Edit Form */}
        {showForm && (
          <div className={styles.formContainer}>
            <h2 className={styles.formTitle}>
              {editingId ? tAccounting('editSupplier') : tAccounting('addSupplier')}
            </h2>
            <form onSubmit={handleSubmit}>
              <div className={styles.formGrid}>
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>{tAccounting('supplierCode')} *</label>
                  <input
                    type="text"
                    required
                    value={form.code}
                    onChange={(e) => setForm({ ...form, code: e.target.value })}
                    className={styles.formInput}
                    placeholder="SP-001"
                  />
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>{tAccounting('supplierName')} *</label>
                  <input
                    type="text"
                    required
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    className={styles.formInput}
                    placeholder="اسم المورد"
                  />
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>{tAccounting('taxNumber')} *</label>
                  <input
                    type="text"
                    required
                    value={form.taxNumber}
                    onChange={(e) => setForm({ ...form, taxNumber: e.target.value })}
                    className={styles.formInput}
                    placeholder="12345678"
                  />
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>{tAccounting('category')} *</label>
                  <select
                    required
                    value={form.category}
                    onChange={(e) => setForm({ ...form, category: e.target.value as 'raw_material' | 'service' | 'equipment' })}
                    className={styles.formSelect}
                  >
                    <option value="raw_material">مواد خام</option>
                    <option value="service">خدمات</option>
                    <option value="equipment">تجهيزات</option>
                  </select>
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>{t('phone')} *</label>
                  <input
                    type="tel"
                    required
                    value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                    className={styles.formInput}
                    placeholder="05XXXXXXXX"
                  />
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>{t('email')} *</label>
                  <input
                    type="email"
                    required
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    className={styles.formInput}
                    placeholder="supplier@example.com"
                  />
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>{tAccounting('bankAccount')} *</label>
                  <input
                    type="text"
                    required
                    value={form.bankAccount}
                    onChange={(e) => setForm({ ...form, bankAccount: e.target.value })}
                    className={styles.formInput}
                    placeholder="1234 5678 9012 3456"
                  />
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>{tAccounting('paymentTerms')}</label>
                  <input
                    type="number"
                    value={form.paymentTerms}
                    onChange={(e) => setForm({ ...form, paymentTerms: Number(e.target.value) })}
                    className={styles.formInput}
                    placeholder="30"
                  />
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>{t('address')} *</label>
                  <input
                    type="text"
                    required
                    value={form.address}
                    onChange={(e) => setForm({ ...form, address: e.target.value })}
                    className={styles.formInput}
                    placeholder="العنوان الكامل"
                  />
                </div>

                <div className={styles.formActions}>
                  <button type="submit" disabled={saving} className={styles.saveButton}>
                    {saving ? t('saving') : t('save')}
                  </button>
                  <button type="button" onClick={resetForm} className={styles.cancelButton}>
                    {t('cancel')}
                  </button>
                </div>
              </div>
            </form>
          </div>
        )}

        {/* Suppliers Table */}
        <div className={styles.tableContainer}>
          <table className={styles.table}>
            <thead>
              <tr className={styles.tableHeader}>
                <th className={styles.tableHeaderCell}>{tAccounting('supplierCode')}</th>
                <th className={styles.tableHeaderCell}>{tAccounting('supplierName')}</th>
                <th className={styles.tableHeaderCell}>{t('phone')}</th>
                <th className={styles.tableHeaderCell}>{t('email')}</th>
                <th className={styles.tableHeaderCell}>{tAccounting('category')}</th>
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
              ) : suppliers.length === 0 ? (
                <tr>
                  <td colSpan={7} className={styles.emptyState}>
                    <Building2 className="w-12 h-12 mx-auto mb-2 text-gray-400" />
                    {t('noData')}
                  </td>
                </tr>
              ) : (
                suppliers.map((supplier) => (
                  <tr key={supplier._id} className={styles.tableRow}>
                    <td className={`${styles.tableCell} ${styles.cellCode}`}>
                      {supplier.code}
                    </td>
                    <td className={`${styles.tableCell} ${styles.cellName}`}>
                      {supplier.name}
                    </td>
                    <td className={styles.tableCell}>
                      <Phone className="inline-block w-3 h-3 ml-1 text-gray-400" />
                      {supplier.phone}
                    </td>
                    <td className={styles.tableCell}>
                      <Mail className="inline-block w-3 h-3 ml-1 text-gray-400" />
                      {supplier.email}
                    </td>
                    <td className={styles.tableCell}>
                      {categoryLabels[supplier.category]}
                    </td>
                    <td className={styles.tableCell}>
                      <span className={`${styles.badge} ${supplier.isActive ? styles.badgeActive : styles.badgeInactive}`}>
                        {supplier.isActive ? t('active') : t('inactive')}
                      </span>
                    </td>
                    <td className={styles.actionsCell}>
                      <button
                        onClick={() => handleEdit(supplier)}
                        className="text-blue-500 hover:text-blue-700 ml-3"
                      >
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(supplier._id)}
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