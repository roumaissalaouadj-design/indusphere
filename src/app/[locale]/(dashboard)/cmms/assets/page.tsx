'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations, useLocale } from 'next-intl';
import TableActions from '@/components/TableActions';
import styles from '@/styles/pages/assets.module.css';

interface Asset {
  _id: string;
  name: string;
  assetCode: string;
  type: string;
  location: string;
  status: 'active' | 'maintenance' | 'inactive';
}

export default function AssetsPage() {
  const router = useRouter();
  const locale = useLocale();
  const t = useTranslations('Common');
  const tAsset = useTranslations('Asset');
  
  const [assets, setAssets] = useState<Asset[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    name: '',
    assetCode: '',
    type: '',
    location: '',
    status: 'active',
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchAssets();
  }, []);

  const fetchAssets = async () => {
    try {
      const res = await fetch('/api/assets');
      const data = await res.json();
      if (data.success) setAssets(data.data);
    } catch {
      setError(t('fetchError'));
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm(t('deleteConfirm'))) return;
    
    const res = await fetch(`/api/assets/${id}`, { method: 'DELETE' });
    const data = await res.json();
    if (data.success) {
      await fetchAssets();
      alert(t('deleteSuccess'));
    } else {
      alert(data.message || t('deleteFailed'));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch('/api/assets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (data.success) {
        await fetchAssets();
        setShowForm(false);
        setForm({ name: '', assetCode: '', type: '', location: '', status: 'active' });
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

  const getStatusClass = (status: string): string => {
    switch (status) {
      case 'active': return styles.statusActive;
      case 'maintenance': return styles.statusMaintenance;
      default: return styles.statusInactive;
    }
  };

  const getStatusLabel = (status: string): string => {
    switch (status) {
      case 'active': return tAsset('active');
      case 'maintenance': return tAsset('maintenance');
      default: return tAsset('inactive');
    }
  };

  return (
    <div className={styles.page} dir="rtl">
      <div className={styles.container}>
        
        {/* Header */}
        <div className={styles.header}>
          <div>
            <h1 className={styles.title}>{tAsset('title')}</h1>
            <p className={styles.subtitle}>{tAsset('title')}</p>
          </div>
          <button onClick={() => setShowForm(!showForm)} className={styles.addButton}>
            + {tAsset('new')}
          </button>
        </div>

        {/* Error Message */}
        {error && (
          <div className={styles.errorMessage}>
            <p className={styles.errorText}>{error}</p>
          </div>
        )}

        {/* Add Asset Form */}
        {showForm && (
          <div className={styles.formContainer}>
            <h2 className={styles.formTitle}>{tAsset('new')}</h2>
            <form onSubmit={handleSubmit} className={styles.formGrid}>
              <div>
                <label className={styles.formLabel}>{tAsset('name')} *</label>
                <input required value={form.name} onChange={e => setForm({ ...form, name: e.target.value })}
                  className={styles.formInput} />
              </div>
              <div>
                <label className={styles.formLabel}>{tAsset('code')} *</label>
                <input required value={form.assetCode} onChange={e => setForm({ ...form, assetCode: e.target.value })}
                  className={styles.formInput} />
              </div>
              <div>
                <label className={styles.formLabel}>{tAsset('type')} *</label>
                <input required value={form.type} onChange={e => setForm({ ...form, type: e.target.value })}
                  className={styles.formInput} />
              </div>
              <div>
                <label className={styles.formLabel}>{tAsset('location')} *</label>
                <input required value={form.location} onChange={e => setForm({ ...form, location: e.target.value })}
                  className={styles.formInput} />
              </div>
              <div>
                <label className={styles.formLabel}>{t('status')}</label>
                <select value={form.status} onChange={e => setForm({ ...form, status: e.target.value })} className={styles.formSelect}>
                  <option value="active">{tAsset('active')}</option>
                  <option value="maintenance">{tAsset('maintenance')}</option>
                  <option value="inactive">{tAsset('inactive')}</option>
                </select>
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

        {/* Assets Table */}
        <div className={styles.tableContainer}>
          <table className={styles.table}>
            <thead>
              <tr className={styles.tableHeader}>
                <th className={styles.tableHeaderCell}>{tAsset('code')}</th>
                <th className={styles.tableHeaderCell}>{tAsset('name')}</th>
                <th className={styles.tableHeaderCell}>{tAsset('type')}</th>
                <th className={styles.tableHeaderCell}>{tAsset('location')}</th>
                <th className={styles.tableHeaderCell}>{t('status')}</th>
                <th className={styles.tableHeaderCell}>{t('actions')}</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={6} className={styles.loadingState}>{t('loading')}</td>
                </tr>
              ) : assets.length === 0 ? (
                <tr>
                  <td colSpan={6} className={styles.emptyState}>{t('noData')}</td>
                </tr>
              ) : (
                assets.map(asset => (
                  <tr key={asset._id} className={styles.tableRow}>
                    <td className={`${styles.tableCell} ${styles.cellCode}`}>{asset.assetCode}</td>
                    <td className={`${styles.tableCell} ${styles.cellName}`}>{asset.name}</td>
                    <td className={`${styles.tableCell} ${styles.cellText}`}>{asset.type}</td>
                    <td className={`${styles.tableCell} ${styles.cellText}`}>{asset.location}</td>
                    <td className={styles.tableCell}>
                      <span className={getStatusClass(asset.status)}>
                        {getStatusLabel(asset.status)}
                      </span>
                    </td>
                    <td className={styles.actionsCell}>
                      <TableActions
                        id={asset._id}
                        editUrl={`/${locale}/cmms/assets/${asset._id}/edit`}
                        onDelete={() => handleDelete(asset._id)}
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