'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations, useLocale } from 'next-intl';
import TableActions from '@/components/TableActions';
import styles from '@/styles/pages/procurement.module.css';

interface PurchaseOrder {
  _id: string;
  poNumber: string;
  supplier: string;
  orderDate: string;
  expectedDate: string;
  totalAmount: number;
  status: 'draft' | 'sent' | 'approved' | 'delivered' | 'cancelled';
  notes?: string;
}

const getStatusClass = (status: string): string => {
  switch (status) {
    case 'draft': return styles.statusDraft;
    case 'sent': return styles.statusSent;
    case 'approved': return styles.statusApproved;
    case 'delivered': return styles.statusDelivered;
    case 'cancelled': return styles.statusCancelled;
    default: return '';
  }
};

const getStatusLabel = (status: string): string => {
  switch (status) {
    case 'draft': return 'مسودة';
    case 'sent': return 'مرسل';
    case 'approved': return 'موافق';
    case 'delivered': return 'تم التسليم';
    case 'cancelled': return 'ملغي';
    default: return status;
  }
};

export default function ProcurementPage() {
  const router = useRouter();
  const locale = useLocale();  // ✅ أضف هذا السطر
  const t = useTranslations('Common');
  const tProc = useTranslations('Procurement');
  
  const [orders, setOrders] = useState<PurchaseOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    poNumber: '',
    supplier: '',
    orderDate: new Date().toISOString().split('T')[0],
    expectedDate: new Date().toISOString().split('T')[0],
    totalAmount: 0,
    status: 'draft' as 'draft' | 'sent' | 'approved' | 'delivered' | 'cancelled',
    notes: '',
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const res = await fetch('/api/purchase-orders');
      const data = await res.json();
      if (data.success) {
        setOrders(data.data);
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
    
    const res = await fetch(`/api/purchase-orders/${id}`, { method: 'DELETE' });
    const data = await res.json();
    if (data.success) {
      await fetchOrders();
      alert(t('deleteSuccess'));
    } else {
      alert(data.message || t('deleteFailed'));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch('/api/purchase-orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (data.success) {
        await fetchOrders();
        setShowForm(false);
        setForm({
          poNumber: '',
          supplier: '',
          orderDate: new Date().toISOString().split('T')[0],
          expectedDate: new Date().toISOString().split('T')[0],
          totalAmount: 0,
          status: 'draft',
          notes: '',
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

  return (
    <div className={styles.page} dir="rtl">
      <div className={styles.container}>
        
        {/* Header */}
        <div className={styles.header}>
          <div>
            <h1 className={styles.title}>{tProc('title')}</h1>
            <p className={styles.subtitle}>{tProc('title')}</p>
          </div>
          <button onClick={() => setShowForm(!showForm)} className={styles.addButton}>
            + {tProc('new')}
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
            <h2 className={styles.formTitle}>{tProc('new')}</h2>
            <form onSubmit={handleSubmit} className={styles.formGrid}>
              <div>
                <label className={styles.formLabel}>{tProc('poNumber')} *</label>
                <input
                  required
                  value={form.poNumber}
                  onChange={(e) => setForm({ ...form, poNumber: e.target.value })}
                  placeholder="PO-001"
                  className={styles.formInput}
                />
              </div>
              <div>
                <label className={styles.formLabel}>{tProc('supplier')} *</label>
                <input
                  required
                  value={form.supplier}
                  onChange={(e) => setForm({ ...form, supplier: e.target.value })}
                  className={styles.formInput}
                />
              </div>
              <div>
                <label className={styles.formLabel}>{tProc('orderDate')} *</label>
                <input
                  type="date"
                  required
                  value={form.orderDate}
                  onChange={(e) => setForm({ ...form, orderDate: e.target.value })}
                  className={styles.formInput}
                />
              </div>
              <div>
                <label className={styles.formLabel}>{tProc('expectedDate')} *</label>
                <input
                  type="date"
                  required
                  value={form.expectedDate}
                  onChange={(e) => setForm({ ...form, expectedDate: e.target.value })}
                  className={styles.formInput}
                />
              </div>
              <div>
                <label className={styles.formLabel}>{tProc('totalAmount')} *</label>
                <input
                  type="number"
                  required
                  value={form.totalAmount}
                  onChange={(e) => setForm({ ...form, totalAmount: Number(e.target.value) })}
                  className={styles.formInput}
                />
              </div>
              <div>
                <label className={styles.formLabel}>{t('status')} *</label>
                <select
                  value={form.status}
                  onChange={(e) => setForm({ ...form, status: e.target.value as 'draft' | 'sent' | 'approved' | 'delivered' | 'cancelled' })}
                  className={styles.formSelect}
                >
                  <option value="draft">{tProc('draft')}</option>
                  <option value="sent">{tProc('sent')}</option>
                  <option value="approved">{tProc('approved')}</option>
                  <option value="delivered">{tProc('delivered')}</option>
                  <option value="cancelled">{tProc('cancelled')}</option>
                </select>
              </div>
              <div className={styles.formFieldFull}>
                <label className={styles.formLabel}>{t('notes')}</label>
                <textarea
                  value={form.notes}
                  onChange={(e) => setForm({ ...form, notes: e.target.value })}
                  rows={2}
                  className={styles.formTextarea}
                />
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
                <th className={styles.tableHeaderCell}>{tProc('poNumber')}</th>
                <th className={styles.tableHeaderCell}>{tProc('supplier')}</th>
                <th className={styles.tableHeaderCell}>{tProc('orderDate')}</th>
                <th className={styles.tableHeaderCell}>{tProc('expectedDate')}</th>
                <th className={styles.tableHeaderCell}>{tProc('totalAmount')}</th>
                <th className={styles.tableHeaderCell}>{t('status')}</th>
                <th className={styles.tableHeaderCell}>{t('actions')}</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={7} className={styles.loadingState}>{t('loading')}</td>
                </tr>
              ) : orders.length === 0 ? (
                <tr>
                  <td colSpan={7} className={styles.emptyState}>{t('noData')}</td>
                </tr>
              ) : (
                orders.map((order) => (
                  <tr key={order._id} className={styles.tableRow}>
                    <td className={`${styles.tableCell} ${styles.cellCode}`}>{order.poNumber}</td>
                    <td className={`${styles.tableCell} ${styles.cellName}`}>{order.supplier}</td>
                    <td className={styles.cellText}>{new Date(order.orderDate).toLocaleDateString('ar')}</td>
                    <td className={styles.cellText}>{new Date(order.expectedDate).toLocaleDateString('ar')}</td>
                    <td className={`${styles.tableCell} ${styles.cellAmount}`}>
                      {order.totalAmount.toLocaleString()} {t('currency')}
                    </td>
                    <td className={styles.tableCell}>
                      <span className={`${styles.badge} ${getStatusClass(order.status)}`}>
                        {getStatusLabel(order.status)}
                      </span>
                    </td>
                    <td className={styles.actionsCell}>
                      <TableActions
                        id={order._id}
                        editUrl={`/${locale}/erp/procurement/${order._id}/edit`}
                        onDelete={() => handleDelete(order._id)}
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