'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations, useLocale } from 'next-intl';
import { ArrowRight, ShoppingCart, Save } from 'lucide-react';
import styles from '@/styles/pages/procurement-edit.module.css';

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

export default function EditPurchaseOrderPage({
  params,
}: {
  params: Promise<{ id: string; locale: string }>;
}) {
  const router = useRouter();
  const locale = useLocale();
  const t = useTranslations('Common');
  const tProc = useTranslations('Procurement');
  
  // ✅ نصوص ثابتة حسب اللغة
  const getTitle = () => {
    if (locale === 'ar') return 'تعديل أمر الشراء';
    if (locale === 'fr') return 'Modifier la commande d\'achat';
    return 'Edit Purchase Order';
  };

  const getDescription = () => {
    if (locale === 'ar') return 'تعديل بيانات أمر الشراء';
    if (locale === 'fr') return 'Modifier les données de la commande d\'achat';
    return 'Edit purchase order data';
  };

  const getCancelText = () => {
    if (locale === 'ar') return 'إلغاء';
    if (locale === 'fr') return 'Annuler';
    return 'Cancel';
  };

  const getSaveText = () => {
    if (locale === 'ar') return 'حفظ';
    if (locale === 'fr') return 'Enregistrer';
    return 'Save';
  };

  const getPONumberLabel = () => {
    if (locale === 'ar') return 'رقم الأمر';
    if (locale === 'fr') return 'Numéro de commande';
    return 'PO Number';
  };

  const getSupplierLabel = () => {
    if (locale === 'ar') return 'المورد';
    if (locale === 'fr') return 'Fournisseur';
    return 'Supplier';
  };

  const getOrderDateLabel = () => {
    if (locale === 'ar') return 'تاريخ الطلب';
    if (locale === 'fr') return 'Date de commande';
    return 'Order Date';
  };

  const getExpectedDateLabel = () => {
    if (locale === 'ar') return 'تاريخ التسليم المتوقع';
    if (locale === 'fr') return 'Date de livraison prévue';
    return 'Expected Date';
  };

  const getTotalAmountLabel = () => {
    if (locale === 'ar') return 'المبلغ الإجمالي (دج)';
    if (locale === 'fr') return 'Montant total (DZD)';
    return 'Total Amount (DZD)';
  };

  const getStatusLabel = () => {
    if (locale === 'ar') return 'الحالة';
    if (locale === 'fr') return 'Statut';
    return 'Status';
  };

  const getNotesLabel = () => {
    if (locale === 'ar') return 'ملاحظات';
    if (locale === 'fr') return 'Notes';
    return 'Notes';
  };

  // ✅ خيارات الحالة حسب اللغة
  const getStatusOptions = () => {
    if (locale === 'ar') {
      return { draft: 'مسودة', sent: 'مرسل', approved: 'موافق', delivered: 'تم التسليم', cancelled: 'ملغي' };
    }
    if (locale === 'fr') {
      return { draft: 'Brouillon', sent: 'Envoyé', approved: 'Approuvé', delivered: 'Livré', cancelled: 'Annulé' };
    }
    return { draft: 'Draft', sent: 'Sent', approved: 'Approved', delivered: 'Delivered', cancelled: 'Cancelled' };
  };

  const statusOptions = getStatusOptions();

  const [order, setOrder] = useState<PurchaseOrder | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchOrder();
  }, []);

  const fetchOrder = async () => {
    try {
      const { id } = await params;
      const res = await fetch(`/api/purchase-orders/${id}`);
      const data = await res.json();
      if (data.success) {
        setOrder(data.data);
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
    if (!order) return;

    if (!order.poNumber || !order.supplier || !order.totalAmount) {
      setError(t('requiredFields'));
      return;
    }

    setSaving(true);
    setError(null);

    try {
      const { id } = await params;
      const res = await fetch(`/api/purchase-orders/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(order),
      });
      const data = await res.json();
      if (data.success) {
        alert(t('editSuccess'));
        router.push(`/${locale}/erp/procurement`);
      } else {
        setError(data.message);
      }
    } catch {
      setError(t('error'));
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className={styles.page}>
        <div className={styles.container}>
          <div className={styles.loadingState}>
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#1ABC9C] mx-auto"></div>
            <p className="mt-2">{t('loading')}</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className={styles.page}>
        <div className={styles.container}>
          <div className={styles.emptyState}>{error || t('noData')}</div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <div className={styles.container}>
        <div className={styles.header}>
          <div>
            <h1 className={styles.title}>
              <ShoppingCart className={styles.titleIcon} />
              {getTitle()}
            </h1>
            <p className={styles.subtitle}>
              {getDescription()}
            </p>
          </div>
          <button onClick={() => router.push(`/${locale}/erp/procurement`)} className={styles.cancelButton}>
            <ArrowRight className="w-4 h-4 ml-1" />
            {getCancelText()}
          </button>
        </div>

        {error && (
          <div className={styles.errorMessage}>
            <p className={styles.errorText}>{error}</p>
          </div>
        )}

        <div className={styles.formContainer}>
          <form onSubmit={handleSubmit}>
            <div className={styles.formGrid}>
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>{getPONumberLabel()} *</label>
                <input
                  type="text"
                  required
                  value={order.poNumber}
                  onChange={(e) => setOrder({ ...order, poNumber: e.target.value })}
                  className={styles.formInput}
                />
              </div>

              <div className={styles.formGroup}>
                <label className={styles.formLabel}>{getSupplierLabel()} *</label>
                <input
                  type="text"
                  required
                  value={order.supplier}
                  onChange={(e) => setOrder({ ...order, supplier: e.target.value })}
                  className={styles.formInput}
                />
              </div>

              <div className={styles.formGroup}>
                <label className={styles.formLabel}>{getOrderDateLabel()} *</label>
                <input
                  type="date"
                  required
                  value={order.orderDate ? order.orderDate.split('T')[0] : ''}
                  onChange={(e) => setOrder({ ...order, orderDate: e.target.value })}
                  className={styles.formInput}
                />
              </div>

              <div className={styles.formGroup}>
                <label className={styles.formLabel}>{getExpectedDateLabel()} *</label>
                <input
                  type="date"
                  required
                  value={order.expectedDate ? order.expectedDate.split('T')[0] : ''}
                  onChange={(e) => setOrder({ ...order, expectedDate: e.target.value })}
                  className={styles.formInput}
                />
              </div>

              <div className={styles.formGroup}>
                <label className={styles.formLabel}>{getTotalAmountLabel()} *</label>
                <input
                  type="number"
                  required
                  value={order.totalAmount}
                  onChange={(e) => setOrder({ ...order, totalAmount: Number(e.target.value) })}
                  className={styles.formInput}
                  min="0"
                />
              </div>

              <div className={styles.formGroup}>
                <label className={styles.formLabel}>{getStatusLabel()} *</label>
                <select
                  required
                  value={order.status}
                  onChange={(e) => setOrder({ ...order, status: e.target.value as PurchaseOrder['status'] })}
                  className={styles.formSelect}
                >
                  <option value="draft">{statusOptions.draft}</option>
                  <option value="sent">{statusOptions.sent}</option>
                  <option value="approved">{statusOptions.approved}</option>
                  <option value="delivered">{statusOptions.delivered}</option>
                  <option value="cancelled">{statusOptions.cancelled}</option>
                </select>
              </div>

              <div className={styles.formGroup}>
                <label className={styles.formLabel}>{getNotesLabel()}</label>
                <textarea
                  value={order.notes || ''}
                  onChange={(e) => setOrder({ ...order, notes: e.target.value })}
                  rows={3}
                  className={styles.formTextarea}
                />
              </div>

              <div className={styles.formActions}>
                <button type="submit" disabled={saving} className={styles.saveButton}>
                  <Save className="w-4 h-4" />
                  {saving ? t('saving') : getSaveText()}
                </button>
                <button type="button" onClick={() => router.push(`/${locale}/erp/procurement`)} className={styles.cancelButton}>
                  {getCancelText()}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}