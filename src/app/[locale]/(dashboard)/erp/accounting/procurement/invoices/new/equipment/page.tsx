// src/app/[locale]/(dashboard)/erp/accounting/procurement/invoices/new/equipment/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { Plus, Trash2, ArrowRight } from 'lucide-react';
import styles from '@/styles/pages/accounting/purchase-invoices.module.css';

interface Supplier {
  _id: string;
  name: string;
  code: string;
}

interface Detail {
  equipmentType: string;
  name: string;
  quantity: number;
  unitPrice: number;
  total: number;
  warrantyEnd?: string;
}

const equipmentTypes = [
  { value: 'spare_part', label: 'قطع غيار', hasWarranty: false },
  { value: 'equipment', label: 'معدات', hasWarranty: true },
  { value: 'machine', label: 'آلات جديدة', hasWarranty: true },
];

export default function NewEquipmentInvoicePage() {
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
    { equipmentType: 'spare_part', name: '', quantity: 1, unitPrice: 0, total: 0 }
  ]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchSuppliers();
  }, []);

  const fetchSuppliers = async () => {
    try {
      const res = await fetch('/api/accounting/suppliers?category=equipment&isActive=true');
      const data = await res.json();
      if (data.success) {
        setSuppliers(data.data);
      }
    } catch {
      // Ignorer
    }
  };

  const addDetail = () => {
    setDetails([...details, { equipmentType: 'spare_part', name: '', quantity: 1, unitPrice: 0, total: 0 }]);
  };

  const removeDetail = (index: number) => {
    setDetails(details.filter((_, i) => i !== index));
  };

  const updateDetail = (index: number, field: keyof Detail, value: string | number) => {
    const newDetails = [...details];
    newDetails[index][field] = value as never;
    
    if (field === 'quantity' || field === 'unitPrice') {
      newDetails[index].total = newDetails[index].quantity * newDetails[index].unitPrice;
    }
    
    setDetails(newDetails);
  };

  const getEquipmentType = (index: number) => {
    return equipmentTypes.find(e => e.value === details[index].equipmentType);
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

    if (details.some(d => !d.name || d.quantity <= 0 || d.unitPrice <= 0)) {
      setError('الرجاء إدخال جميع بيانات التجهيزات');
      setSaving(false);
      return;
    }

    try {
      const res = await fetch('/api/accounting/purchase-invoices', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          invoiceType: 'equipment',
          subTotal: calculateSubTotal(),
          taxAmount: calculateTaxAmount(),
          totalAmount: calculateTotalAmount(),
          details: details.map(d => ({
            equipmentType: d.equipmentType,
            name: d.name,
            quantity: d.quantity,
            unitPrice: d.unitPrice,
            total: d.total,
            warrantyEnd: d.warrantyEnd,
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
        <div className={styles.header}>
          <div>
            <h1 className={styles.title}>{tAccounting('equipmentInvoice')}</h1>
            <p className={styles.subtitle}>{tAccounting('addEquipmentInvoice')}</p>
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

            <div className={styles.detailsSection}>
              <div className="flex justify-between items-center mb-4">
                <h3 className={styles.detailsTitle}>{tAccounting('invoiceDetails')}</h3>
                <button type="button" onClick={addDetail} className={styles.addButton}>
                  <Plus className="w-4 h-4" />
                  {tAccounting('addItem')}
                </button>
              </div>

              {details.map((detail, index) => {
                const equipmentType = getEquipmentType(index);
                const hasWarranty = equipmentType?.hasWarranty || false;
                
                return (
                  <div key={index} className={styles.detailsRow}>
                    <select
                      value={detail.equipmentType}
                      onChange={(e) => updateDetail(index, 'equipmentType', e.target.value)}
                      className={styles.formSelect}
                      style={{ minWidth: '130px' }}
                    >
                      {equipmentTypes.map((type) => (
                        <option key={type.value} value={type.value}>{type.label}</option>
                      ))}
                    </select>

                    <input
                      type="text"
                      placeholder="الاسم"
                      value={detail.name}
                      onChange={(e) => updateDetail(index, 'name', e.target.value)}
                      className={styles.formInput}
                      style={{ minWidth: '200px' }}
                    />

                    <input
                      type="number"
                      placeholder="الكمية"
                      value={detail.quantity || ''}
                      onChange={(e) => updateDetail(index, 'quantity', Number(e.target.value))}
                      className={styles.formInput}
                      style={{ width: '100px' }}
                    />

                    <input
                      type="number"
                      placeholder="سعر الوحدة (دج)"
                      value={detail.unitPrice || ''}
                      onChange={(e) => updateDetail(index, 'unitPrice', Number(e.target.value))}
                      className={styles.formInput}
                      style={{ width: '150px' }}
                    />

                    <input
                      type="text"
                      placeholder="المجموع"
                      value={detail.total.toLocaleString() + ' دج'}
                      className={styles.formInput}
                      readOnly
                      style={{ width: '150px' }}
                    />

                    {hasWarranty && (
                      <input
                        type="date"
                        placeholder="نهاية الضمان"
                        value={detail.warrantyEnd || ''}
                        onChange={(e) => updateDetail(index, 'warrantyEnd', e.target.value)}
                        className={styles.formInput}
                        style={{ width: '150px' }}
                      />
                    )}

                    {details.length > 1 && (
                      <button type="button" onClick={() => removeDetail(index)} className="text-red-500">
                        <Trash2 className="w-5 h-5" />
                      </button>
                    )}
                  </div>
                );
              })}
            </div>

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