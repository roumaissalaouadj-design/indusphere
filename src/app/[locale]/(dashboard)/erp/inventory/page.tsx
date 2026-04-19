// src/app/[locale]/(dashboard)/erp/inventory/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations, useLocale } from 'next-intl';
import { Package, Plus } from 'lucide-react';
import TableActions from '@/components/TableActions';
import styles from '@/styles/pages/inventory.module.css';

interface InventoryItem {
  _id: string;
  itemCode: string;
  name: string;
  category: string;
  quantity: number;
  minStock: number;      // ✅ تغيير من minQuantity إلى minStock
  unit: string;
  location: string;
  description?: string;
}

export default function InventoryPage() {
  const router = useRouter();
  const locale = useLocale();
  const t = useTranslations('Common');
  const tInv = useTranslations('Inventory');
  
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    itemCode: '',
    name: '',
    category: '',
    quantity: 0,
    minStock: 0,         // ✅ تغيير من minQuantity إلى minStock
    unit: 'قطعة',
    location: '',
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchItems();
  }, []);

  const fetchItems = async () => {
    try {
      const res = await fetch('/api/inventory');
      const data = await res.json();
      if (data.success) setItems(data.data);
    } catch {
      setError(t('fetchError'));
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm(t('deleteConfirm'))) return;
    
    const res = await fetch(`/api/inventory/${id}`, { method: 'DELETE' });
    const data = await res.json();
    if (data.success) {
      await fetchItems();
      alert(t('deleteSuccess'));
    } else {
      alert(data.message || t('deleteFailed'));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      // ✅ تحويل البيانات للشكل الصحيح
      const submitData = {
        itemCode: form.itemCode,
        name: form.name,
        category: form.category,
        quantity: form.quantity,
        minStock: form.minStock,   // ✅ minStock
        unit: form.unit,
        location: form.location,
      };
      
      const res = await fetch('/api/inventory', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(submitData),
      });
      const data = await res.json();
      if (data.success) {
        await fetchItems();
        setShowForm(false);
        setForm({
          itemCode: '',
          name: '',
          category: '',
          quantity: 0,
          minStock: 0,
          unit: 'قطعة',
          location: '',
        });
        alert(t('addSuccess'));
      } else {
        alert(data.message);
      }
    } catch {
      alert(t('error'));
    } finally {
      setSaving(false);
    }
  };

  const isLowStock = (quantity: number, minStock: number) => {
    return quantity <= minStock;
  };

  return (
    <div className={styles.page}>
      <div className={styles.container}>
        {/* Header */}
        <div className={styles.header}>
          <div>
            <h1 className={styles.title}>
              <Package className={styles.titleIcon} />
              {tInv('title')}
            </h1>
            <p className={styles.subtitle}>
              {tInv('title')} - {t('management')}
            </p>
          </div>
          <button 
            onClick={() => setShowForm(!showForm)}
            className={styles.addButton}
          >
            <Plus className="w-4 h-4" />
            {tInv('new')}
          </button>
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
              <Plus className={styles.formTitleIcon} />
              {tInv('new')}
            </h2>
            <form onSubmit={handleSubmit}>
              <div className={styles.formGrid}>
                <div>
                  <label className={styles.formLabel}>
                    {tInv('itemCode')} <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={form.itemCode}
                    onChange={(e) => setForm({ ...form, itemCode: e.target.value })}
                    className={styles.formInput}
                    placeholder={t('code')}
                  />
                </div>
                <div>
                  <label className={styles.formLabel}>
                    {tInv('name')} <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    className={styles.formInput}
                    placeholder={t('name')}
                  />
                </div>
                <div>
                  <label className={styles.formLabel}>
                    {tInv('category')} <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={form.category}
                    onChange={(e) => setForm({ ...form, category: e.target.value })}
                    className={styles.formInput}
                    placeholder={t('category')}
                  />
                </div>
                <div>
                  <label className={styles.formLabel}>
                    {tInv('quantity')} <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    required
                    value={form.quantity}
                    onChange={(e) => setForm({ ...form, quantity: Number(e.target.value) })}
                    className={styles.formInputNumber}
                  />
                </div>
                <div>
                  <label className={styles.formLabel}>
                    {tInv('minQuantity')} <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    required
                    value={form.minStock}
                    onChange={(e) => setForm({ ...form, minStock: Number(e.target.value) })}
                    className={styles.formInputNumber}
                  />
                </div>
                <div>
                  <label className={styles.formLabel}>
                    {tInv('unit')} <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={form.unit}
                    onChange={(e) => setForm({ ...form, unit: e.target.value })}
                    className={styles.formInput}
                    placeholder={t('unit')}
                  />
                </div>
                <div>
                  <label className={styles.formLabel}>
                    {tInv('location')} <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={form.location}
                    onChange={(e) => setForm({ ...form, location: e.target.value })}
                    className={styles.formInput}
                    placeholder={t('location')}
                  />
                </div>
                <div className={styles.formActions}>
                  <button 
                    type="submit" 
                    disabled={saving}
                    className={styles.saveButton}
                  >
                    {saving ? t('saving') : t('save')}
                  </button>
                  <button 
                    type="button" 
                    onClick={() => setShowForm(false)}
                    className={styles.cancelButton}
                  >
                    {t('cancel')}
                  </button>
                </div>
              </div>
            </form>
          </div>
        )}

        {/* Inventory Table */}
        <div className={styles.tableContainer}>
          <table className={styles.table}>
            <thead>
              <tr className={styles.tableHeader}>
                <th className={styles.tableHeaderCell}>{tInv('itemCode')}</th>
                <th className={styles.tableHeaderCell}>{tInv('name')}</th>
                <th className={styles.tableHeaderCell}>{tInv('category')}</th>
                <th className={styles.tableHeaderCell}>{tInv('quantity')}</th>
                <th className={styles.tableHeaderCell}>{tInv('minQuantity')}</th>
                <th className={styles.tableHeaderCell}>{tInv('location')}</th>
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
              ) : items.length === 0 ? (
                <tr>
                  <td colSpan={7} className={styles.emptyState}>
                    <Package className="w-12 h-12 mx-auto mb-2 text-gray-400" />
                    {t('noData')}
                  </td>
                </tr>
              ) : (
                items.map((item) => (
                  <tr key={item._id} className={styles.tableRow}>
                    <td className={`${styles.tableCell} ${styles.cellCode}`}>
                      {item.itemCode}
                    </td>
                    <td className={`${styles.tableCell} ${styles.cellName}`}>
                      {item.name}
                    </td>
                    <td className={styles.tableCell}>
                      {item.category}
                    </td>
                    <td className={styles.tableCell}>
                      <span className={isLowStock(item.quantity, item.minStock) ? styles.quantityLow : styles.quantityNormal}>
                        {item.quantity} {item.unit}
                      </span>
                    </td>
                    <td className={styles.tableCell}>
                      {item.minStock} {item.unit}
                    </td>
                    <td className={styles.tableCell}>
                      {item.location}
                    </td>
                    <td className={styles.actionsCell}>
                      <TableActions
                        id={item._id}
                        editUrl={`/${locale}/erp/inventory/${item._id}/edit`}
                        onDelete={() => handleDelete(item._id)}
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