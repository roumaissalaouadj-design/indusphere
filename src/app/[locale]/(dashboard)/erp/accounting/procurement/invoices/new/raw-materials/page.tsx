// src/app/[locale]/(dashboard)/erp/accounting/procurement/invoices/new/raw-materials/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { Plus, Trash2, ArrowRight, Building2 } from 'lucide-react';
import styles from '@/styles/pages/accounting/purchase-invoices.module.css';

interface Supplier {
  _id: string;
  name: string;
  code: string;
}

interface Detail {
  materialType: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

const materialTypes = [
  { value: 'limestone', label: 'حجر جيري' },
  { value: 'clay', label: 'طين' },
  { value: 'gypsum', label: 'جبس' },
  { value: 'iron_ore', label: 'خام حديد' },
  { value: 'fly_ash', label: 'رماد متطاير' },
];

export default function NewRawMaterialInvoicePage() {
  const router = useRouter();
  const t = useTranslations('Common');
  const tAccounting = useTranslations('Accounting');
  
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [form, setForm] = useState({
    invoiceNumber: '',
    supplierId: '',
    invoiceDate: new Date().toISOString().split('T')[0],
    dueDate: '',
    taxRate: 19,
    notes: '',
  });
  const [details, setDetails] = useState<Detail[]>([
    { materialType: 'limestone', quantity: 0, unitPrice: 0, total: 0 }
  ]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchSuppliers();
  }, []);

  const fetchSuppliers = async () => {
    try {
      const res = await fetch('/api/accounting/suppliers?category=raw_material&isActive=true');
      const data = await res.json();
      if (data.success) {
        setSuppliers(data.data);
      }
    } catch {
      // Ignorer
    }
  };

  const addDetail = () => {
    setDetails([...details, { materialType: 'limestone', quantity: 0, unitPrice: 0, total: 0 }]);
  };

  const removeDetail = (index: number) => {
    setDetails(details.filter((_, i) => i !== index));
  };

  const updateDetail = (index: number, field: keyof Detail, value: string | number) => {
    const newDetails = [...details];
    newDetails[index][field] = value as never;
    
    // حساب المجموع
    if (field === 'quantity' || field === 'unitPrice') {
      newDetails[index].total = newDetails[index].quantity * newDetails[index].unitPrice;
    }
    
    setDetails(newDetails);
  };

  const calculateSubTotal = () => {
    return details.reduce((sum, detail) => sum + (detail.total || 0), 0);
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

    if (!form.supplierId) {
      setError('الرجاء اختيار المورد');
      setSaving(false);
      return;
    }

    if (details.some(d => d.quantity <= 0 || d.unitPrice <= 0)) {
      setError('الرجاء إدخال كميات وأسعار صحيحة');
      setSaving(false);
      return;
    }

    try {
      const res = await fetch('/api/accounting/purchase-invoices', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          invoiceType: 'raw_material',
          subTotal: calculateSubTotal(),
          taxAmount: calculateTaxAmount(),
          totalAmount: calculateTotalAmount(),
          details: details.map(d => ({
            materialType: d.materialType,
            quantity: d.quantity,
            unitPrice: d.unitPrice,
            total: d.total,
          })),
        }),
      });

      const data = await res.json();

      if (data.success) {
        alert(t('addSuccess'));
        router.push('/erp/accounting/procurement/invoices');
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
              {tAccounting('rawMaterialInvoice')}
            </h1>
            <p className={styles.subtitle}>
              {tAccounting('addRawMaterialInvoice')}
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
                <label className={styles.formLabel}>{tAccounting('supplier')} *</label>
                <select
                  required
                  value={form.supplierId}
                  onChange={(e) => setForm({ ...form, supplierId: e.target.value })}
                  className={styles.formSelect}
                >
                  <option value="">اختر المورد</option>
                  {suppliers.map((supplier) => (
                    <option key={supplier._id} value={supplier._id}>
                      {supplier.code} - {supplier.name}
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
                <label className={styles.formLabel}>{tAccounting('taxRate')} (%)</label>
                <input
                  type="number"
                  value={form.taxRate}
                  onChange={(e) => setForm({ ...form, taxRate: Number(e.target.value) })}
                  className={styles.formInput}
                  step="0.1"
                />
              </div>
            </div>

            {/* Details Section */}
            <div className={styles.detailsSection}>
              <div className="flex justify-between items-center mb-4">
                <h3 className={styles.detailsTitle}>{tAccounting('invoiceDetails')}</h3>
                <button type="button" onClick={addDetail} className={styles.addButton}>
                  <Plus className="w-4 h-4" />
                  {tAccounting('addItem')}
                </button>
              </div>

              {details.map((detail, index) => (
                <div key={index} className={styles.detailsRow}>
                  <select
                    value={detail.materialType}
                    onChange={(e) => updateDetail(index, 'materialType', e.target.value)}
                    className={styles.formSelect}
                    style={{ minWidth: '150px' }}
                  >
                    {materialTypes.map((type) => (
                      <option key={type.value} value={type.value}>{type.label}</option>
                    ))}
                  </select>

                  <input
                    type="number"
                    placeholder="الكمية (طن)"
                    value={detail.quantity || ''}
                    onChange={(e) => updateDetail(index, 'quantity', Number(e.target.value))}
                    className={styles.formInput}
                  />

                  <input
                    type="number"
                    placeholder="سعر الوحدة (دج)"
                    value={detail.unitPrice || ''}
                    onChange={(e) => updateDetail(index, 'unitPrice', Number(e.target.value))}
                    className={styles.formInput}
                  />

                  <input
                    type="text"
                    placeholder="المجموع"
                    value={detail.total.toLocaleString() + ' دج'}
                    className={styles.formInput}
                    readOnly
                  />

                  {details.length > 1 && (
                    <button type="button" onClick={() => removeDetail(index)} className="text-red-500">
                      <Trash2 className="w-5 h-5" />
                    </button>
                  )}
                </div>
              ))}
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