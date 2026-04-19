// src/app/[locale]/(dashboard)/erp/accounting/sales/invoices/new/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { ArrowRight, FileText, Building2 } from 'lucide-react';
import styles from '@/styles/pages/accounting/sales-invoices.module.css';

interface Customer {
  _id: string;
  name: string;
  code: string;
}

interface ProductPrice {
  _id: string;
  productType: string;
  cementType?: string;
  strengthClass?: string;
  minQuantity: number;
  maxQuantity: number;
  price: number;
}

const cementTypes = [
  { value: 'CEM_I', label: 'CEM I - أسمنت بورتلاند عادي' },
  { value: 'CEM_II', label: 'CEM II - أسمنت بورتلاند مركب' },
  { value: 'CEM_III', label: 'CEM III - أسمنت بورتلاند مع خبث الأفران' },
  { value: 'CEM_IV', label: 'CEM IV - أسمنت بوزولاني' },
  { value: 'CEM_V', label: 'CEM V - أسمنت مركب' },
];

const strengthClasses = [
  { value: '32.5', label: '32.5 R' },
  { value: '42.5', label: '42.5 R' },
  { value: '52.5', label: '52.5 R' },
];

export default function NewSalesInvoicePage() {
  const router = useRouter();
  const t = useTranslations('Common');
  const tAccounting = useTranslations('Accounting');
  
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [prices, setPrices] = useState<ProductPrice[]>([]);
  const [form, setForm] = useState({
    invoiceNumber: '',
    customerId: '',
    invoiceDate: new Date().toISOString().split('T')[0],
    dueDate: '',
    productType: 'cement',
    cementType: 'CEM_I',
    strengthClass: '42.5',
    quantity: 0,
    unitPrice: 0,
    taxRate: 19,
    notes: '',
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchCustomers();
    fetchPrices();
  }, []);

// استبدل دالة useEffect الخاصة بالأسعار بهذا:

useEffect(() => {
  // تحديث السعر تلقائياً عند تغيير المنتج والكمية
  const matchingPrice = prices.find(p => 
    p.productType === form.productType &&
    (p.cementType === form.cementType || !p.cementType) &&
    (p.strengthClass === form.strengthClass || !p.strengthClass) &&
    form.quantity >= p.minQuantity &&
    form.quantity <= p.maxQuantity
  );
  
  if (matchingPrice) {
    setForm(prev => ({ ...prev, unitPrice: matchingPrice.price }));
  }
}, [form.productType, form.cementType, form.strengthClass, form.quantity, prices]);

  const fetchCustomers = async () => {
    try {
      const res = await fetch('/api/accounting/customers?isActive=true');
      const data = await res.json();
      if (data.success) {
        setCustomers(data.data);
      }
    } catch {
      // Ignorer
    }
  };

  const fetchPrices = async () => {
    try {
      const res = await fetch('/api/accounting/product-prices?isActive=true');
      const data = await res.json();
      if (data.success) {
        setPrices(data.data);
      }
    } catch {
      // Ignorer
    }
  };

  const calculateSubTotal = () => {
    return form.quantity * form.unitPrice;
  };

  const calculateTaxAmount = () => {
    return (calculateSubTotal() * form.taxRate) / 100;
  };

  const calculateTotalAmount = () => {
    return calculateSubTotal() + calculateTaxAmount();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);

    if (!form.customerId) {
      setError('الرجاء اختيار العميل');
      setSaving(false);
      return;
    }

    if (form.quantity <= 0) {
      setError('الرجاء إدخال كمية صحيحة');
      setSaving(false);
      return;
    }

    try {
      const res = await fetch('/api/accounting/sales-invoices', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          subTotal: calculateSubTotal(),
          taxAmount: calculateTaxAmount(),
          totalAmount: calculateTotalAmount(),
        }),
      });

      const data = await res.json();

      if (data.success) {
        alert(t('addSuccess'));
        router.push('/erp/accounting/sales/invoices');
      } else {
        setError(data.message);
      }
    } catch {
      setError(t('error'));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className={styles.page}>
      <div className={styles.container}>
        {/* Header */}
        <div className={styles.header}>
          <div>
            <h1 className={styles.title}>
              <FileText className="inline-block w-6 h-6 ml-2 text-[#1ABC9C]" />
              {tAccounting('addSalesInvoice')}
            </h1>
            <p className={styles.subtitle}>
              {tAccounting('addSalesInvoiceDescription')}
            </p>
          </div>
          <button onClick={() => router.back()} className={styles.cancelButton}>
            <ArrowRight className="w-4 h-4 ml-1" />
            {t('cancel')}
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
                <label className={styles.formLabel}>{tAccounting('invoiceNumber')} *</label>
                <input
                  type="text"
                  required
                  value={form.invoiceNumber}
                  onChange={(e) => setForm({ ...form, invoiceNumber: e.target.value })}
                  className={styles.formInput}
                  placeholder="INV-001"
                />
              </div>

              <div className={styles.formGroup}>
                <label className={styles.formLabel}>{tAccounting('customer')} *</label>
                <select
                  required
                  value={form.customerId}
                  onChange={(e) => setForm({ ...form, customerId: e.target.value })}
                  className={styles.formSelect}
                >
                  <option value="">اختر العميل</option>
                  {customers.map((customer) => (
                    <option key={customer._id} value={customer._id}>
                      {customer.code} - {customer.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className={styles.formGroup}>
                <label className={styles.formLabel}>{tAccounting('invoiceDate')} *</label>
                <input
                  type="date"
                  required
                  value={form.invoiceDate}
                  onChange={(e) => setForm({ ...form, invoiceDate: e.target.value })}
                  className={styles.formInput}
                />
              </div>

              <div className={styles.formGroup}>
                <label className={styles.formLabel}>{tAccounting('dueDate')} *</label>
                <input
                  type="date"
                  required
                  value={form.dueDate}
                  onChange={(e) => setForm({ ...form, dueDate: e.target.value })}
                  className={styles.formInput}
                />
              </div>

              <div className={styles.formGroup}>
                <label className={styles.formLabel}>{tAccounting('productType')} *</label>
                <select
                  required
                  value={form.productType}
                  onChange={(e) => setForm({ ...form, productType: e.target.value })}
                  className={styles.formSelect}
                >
                  <option value="cement">أسمنت</option>
                  <option value="clinker">كلنكر</option>
                </select>
              </div>

              {form.productType === 'cement' && (
                <>
                  <div className={styles.formGroup}>
                    <label className={styles.formLabel}>{tAccounting('cementType')} *</label>
                    <select
                      required
                      value={form.cementType}
                      onChange={(e) => setForm({ ...form, cementType: e.target.value })}
                      className={styles.formSelect}
                    >
                      {cementTypes.map((type) => (
                        <option key={type.value} value={type.value}>{type.label}</option>
                      ))}
                    </select>
                  </div>

                  <div className={styles.formGroup}>
                    <label className={styles.formLabel}>{tAccounting('strengthClass')} *</label>
                    <select
                      required
                      value={form.strengthClass}
                      onChange={(e) => setForm({ ...form, strengthClass: e.target.value })}
                      className={styles.formSelect}
                    >
                      {strengthClasses.map((sc) => (
                        <option key={sc.value} value={sc.value}>{sc.label}</option>
                      ))}
                    </select>
                  </div>
                </>
              )}

              <div className={styles.formGroup}>
                <label className={styles.formLabel}>{tAccounting('quantity')} (طن) *</label>
                <input
                  type="number"
                  required
                  value={form.quantity || ''}
                  onChange={(e) => setForm({ ...form, quantity: Number(e.target.value) })}
                  className={styles.formInput}
                  step="0.1"
                />
              </div>

              <div className={styles.formGroup}>
                <label className={styles.formLabel}>{tAccounting('unitPrice')} (دج/طن) *</label>
                <input
                  type="number"
                  required
                  value={form.unitPrice || ''}
                  onChange={(e) => setForm({ ...form, unitPrice: Number(e.target.value) })}
                  className={styles.formInput}
                />
              </div>

              <div className={styles.formGroup}>
                <label className={styles.formLabel}>{tAccounting('taxRate')} (%)</label>
                <input
                  type="number"
                  value={form.taxRate}
                  onChange={(e) => setForm({ ...form, taxRate: Number(e.target.value) })}
                  className={styles.formInput}
                  step="0.1"
                />
              </div>

              <div className={styles.formGroup}>
                <label className={styles.formLabel}>{tAccounting('notes')}</label>
                <textarea
                  value={form.notes}
                  onChange={(e) => setForm({ ...form, notes: e.target.value })}
                  className={styles.formInput}
                  rows={3}
                />
              </div>
            </div>

            {/* Summary */}
            <div className="mt-6 p-4 bg-gray-50 rounded-lg">
              <div className="flex justify-between mb-2">
                <span className="text-gray-600">{tAccounting('subTotal')}:</span>
                <span className="font-bold">{calculateSubTotal().toLocaleString()} دج</span>
              </div>
              <div className="flex justify-between mb-2">
                <span className="text-gray-600">{tAccounting('taxAmount')} ({form.taxRate}%):</span>
                <span className="font-bold">{calculateTaxAmount().toLocaleString()} دج</span>
              </div>
              <div className="flex justify-between pt-2 border-t border-gray-200">
                <span className="text-lg font-bold text-gray-800">{tAccounting('totalAmount')}:</span>
                <span className="text-lg font-bold text-[#1ABC9C]">{calculateTotalAmount().toLocaleString()} دج</span>
              </div>
            </div>

            <div className={styles.formActions}>
              <button type="submit" disabled={saving} className={styles.saveButton}>
                {saving ? t('saving') : t('save')}
              </button>
              <button type="button" onClick={() => router.back()} className={styles.cancelButton}>
                {t('cancel')}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}