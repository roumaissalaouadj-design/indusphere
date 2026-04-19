'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations, useLocale } from 'next-intl';
import TableActions from '@/components/TableActions';
import styles from '@/styles/pages/spare-parts.module.css';

interface SparePart {
  _id: string;
  partCode: string;
  name: string;
  category: string;
  quantity: number;
  minStock: number;      // ✅ تغيير من minQuantity إلى minStock
  unit: string;
  location: string;
}

export default function SparePartsPage() {
  const router = useRouter();
  const locale = useLocale();
  const t = useTranslations('Common');
  const tPart = useTranslations('SparePart');
  
  const [parts, setParts] = useState<SparePart[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    partCode: '',
    name: '',
    category: '',
    quantity: 0,
    minStock: 0,          // ✅ تغيير من minQuantity إلى minStock
    unit: 'قطعة',
    location: '',
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchParts();
  }, []);

  const fetchParts = async () => {
    try {
      const res = await fetch('/api/spare-parts');
      const data = await res.json();
      if (data.success) setParts(data.data);
    } catch {
      setError(t('fetchError'));
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm(t('deleteConfirm'))) return;
    
    const res = await fetch(`/api/spare-parts/${id}`, { method: 'DELETE' });
    const data = await res.json();
    if (data.success) {
      await fetchParts();
      alert(t('deleteSuccess'));
    } else {
      alert(data.message || t('deleteFailed'));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch('/api/spare-parts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (data.success) {
        await fetchParts();
        setShowForm(false);
        setForm({ partCode: '', name: '', category: '', quantity: 0, minStock: 0, unit: 'قطعة', location: '' });
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

  return (
    <div className={styles.page} dir="rtl">
      <div className={styles.container}>
        
        {/* Header */}
        <div className={styles.header}>
          <div>
            <h1 className={styles.title}>{tPart('title')}</h1>
            <p className={styles.subtitle}>{tPart('title')}</p>
          </div>
          <button onClick={() => setShowForm(!showForm)} className={styles.addButton}>
            + {tPart('new')}
          </button>
        </div>

        {/* Error Message */}
        {error && (
          <div className={styles.errorMessage}>
            <p className={styles.errorText}>{error}</p>
          </div>
        )}

        {/* Add Form */}
        {showForm && (
          <div className={styles.formContainer}>
            <h2 className={styles.formTitle}>{tPart('new')}</h2>
            <form onSubmit={handleSubmit} className={styles.formGrid}>
              <div>
                <label className={styles.formLabel}>{tPart('code')} *</label>
                <input required value={form.partCode} onChange={e => setForm({ ...form, partCode: e.target.value })}
                  className={styles.formInput} />
              </div>
              <div>
                <label className={styles.formLabel}>{tPart('name')} *</label>
                <input required value={form.name} onChange={e => setForm({ ...form, name: e.target.value })}
                  className={styles.formInput} />
              </div>
              <div>
                <label className={styles.formLabel}>{tPart('category')} *</label>
                <input required value={form.category} onChange={e => setForm({ ...form, category: e.target.value })}
                  className={styles.formInput} />
              </div>
              <div>
                <label className={styles.formLabel}>{tPart('quantity')} *</label>
                <input type="number" required value={form.quantity} onChange={e => setForm({ ...form, quantity: Number(e.target.value) })}
                  className={styles.formInputNumber} />
              </div>
              <div>
                <label className={styles.formLabel}>{tPart('minQuantity')} *</label>
                <input type="number" required value={form.minStock} onChange={e => setForm({ ...form, minStock: Number(e.target.value) })}
                  className={styles.formInputNumber} />
              </div>
              <div>
                <label className={styles.formLabel}>{tPart('unit')} *</label>
                <input required value={form.unit} onChange={e => setForm({ ...form, unit: e.target.value })}
                  className={styles.formInput} />
              </div>
              <div>
                <label className={styles.formLabel}>{tPart('location')} *</label>
                <input required value={form.location} onChange={e => setForm({ ...form, location: e.target.value })}
                  className={styles.formInput} />
              </div>
              <div className={styles.formActions}>
                <button type="submit" disabled={saving} className={styles.saveButton}>
                  {saving ? t('saving') : t('save')}
                </button>
                <button type="button" onClick={() => setShowForm(false)} className={styles.cancelButton}>
                  {t('cancel')}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Table */}
        <div className={styles.tableContainer}>
          <table className={styles.table}>
            <thead>
              <tr className={styles.tableHeader}>
                <th className={styles.tableHeaderCell}>{tPart('code')}</th>
                <th className={styles.tableHeaderCell}>{tPart('name')}</th>
                <th className={styles.tableHeaderCell}>{tPart('category')}</th>
                <th className={styles.tableHeaderCell}>{tPart('quantity')}</th>
                <th className={styles.tableHeaderCell}>{tPart('minQuantity')}</th>
                <th className={styles.tableHeaderCell}>{tPart('location')}</th>
                <th className={styles.tableHeaderCell}>{t('actions')}</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={7} className={styles.loadingState}>{t('loading')}</td>
                </tr>
              ) : parts.length === 0 ? (
                <tr>
                  <td colSpan={7} className={styles.emptyState}>{t('noData')}</td>
                </tr>
              ) : (
                parts.map(part => (
                  <tr key={part._id} className={styles.tableRow}>
                    <td className={`${styles.tableCell} ${styles.cellCode}`}>{part.partCode}</td>
                    <td className={`${styles.tableCell} ${styles.cellName}`}>{part.name}</td>
                    <td className={`${styles.tableCell} ${styles.cellText}`}>{part.category}</td>
                    <td className={`${styles.tableCell} ${part.quantity <= part.minStock ? styles.quantityLow : styles.quantityNormal}`}>
                      {part.quantity} {part.unit}
                    </td>
                    <td className={`${styles.tableCell} ${styles.cellText}`}>{part.minStock} {part.unit}</td>
                    <td className={`${styles.tableCell} ${styles.cellText}`}>{part.location}</td>
                    <td className={styles.actionsCell}>
                      <TableActions
                        id={part._id}
                        editUrl={`/${locale}/cmms/spare-parts/${part._id}/edit`}
                        onDelete={() => handleDelete(part._id)}
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