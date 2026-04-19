// src/app/[locale]/(dashboard)/erp/accounting/production/costs/new/page.tsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { ArrowRight, Factory } from 'lucide-react';
import styles from '@/styles/pages/accounting/production-costs.module.css';

interface FormData {
  period: string;
  startDate: string;
  endDate: string;
  totalProduction: number;
  
  // مواد خام
  limestoneCost: number;
  clayCost: number;
  gypsumCost: number;
  ironOreCost: number;
  flyAshCost: number;
  
  // طاقة
  electricityCost: number;
  fuelCost: number;
  gasCost: number;
  
  // عمالة
  directLabor: number;
  indirectLabor: number;
  
  // صيانة
  preventiveMaintenance: number;
  correctiveMaintenance: number;
  
  // أخرى
  transportCost: number;
  adminCost: number;
  otherCosts: number;
  
  notes: string;
}

export default function NewProductionCostPage() {
  const router = useRouter();
  const t = useTranslations('Common');
  const tAccounting = useTranslations('Accounting');
  
  const [form, setForm] = useState<FormData>({
    period: '',
    startDate: '',
    endDate: '',
    totalProduction: 0,
    
    limestoneCost: 0,
    clayCost: 0,
    gypsumCost: 0,
    ironOreCost: 0,
    flyAshCost: 0,
    
    electricityCost: 0,
    fuelCost: 0,
    gasCost: 0,
    
    directLabor: 0,
    indirectLabor: 0,
    
    preventiveMaintenance: 0,
    correctiveMaintenance: 0,
    
    transportCost: 0,
    adminCost: 0,
    otherCosts: 0,
    
    notes: '',
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const calculateTotals = () => {
    const rawMaterials = form.limestoneCost + form.clayCost + form.gypsumCost + 
                         form.ironOreCost + form.flyAshCost;
    const energy = form.electricityCost + form.fuelCost + form.gasCost;
    const labor = form.directLabor + form.indirectLabor;
    const maintenance = form.preventiveMaintenance + form.correctiveMaintenance;
    const other = form.transportCost + form.adminCost + form.otherCosts;
    
    return { rawMaterials, energy, labor, maintenance, other };
  };

  const calculateTotalCost = () => {
    const { rawMaterials, energy, labor, maintenance, other } = calculateTotals();
    return rawMaterials + energy + labor + maintenance + other;
  };

  const calculateCostPerTon = () => {
    if (form.totalProduction > 0) {
      return calculateTotalCost() / form.totalProduction;
    }
    return 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);

    if (form.totalProduction <= 0) {
      setError('الرجاء إدخال كمية إنتاج صحيحة');
      setSaving(false);
      return;
    }

    try {
      const res = await fetch('/api/accounting/production-costs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });

      const data = await res.json();

      if (data.success) {
        alert(t('addSuccess'));
        router.push('/erp/accounting/production/costs');
      } else {
        setError(data.message);
      }
    } catch {
      setError(t('error'));
    } finally {
      setSaving(false);
    }
  };

  const totals = calculateTotals();
  const totalCost = calculateTotalCost();
  const costPerTon = calculateCostPerTon();

  return (
    <div className={styles.page}>
      <div className={styles.container}>
        {/* Header */}
        <div className={styles.header}>
          <div>
            <h1 className={styles.title}>
              <Factory className="inline-block w-6 h-6 ml-2 text-[#1ABC9C]" />
              {tAccounting('addProductionCost')}
            </h1>
            <p className={styles.subtitle}>
              {tAccounting('addProductionCostDescription')}
            </p>
          </div>
          <button onClick={() => router.back()} className={styles.cancelButton}>
            <ArrowRight className="w-4 h-4 ml-1" />
            {t('cancel')}
          </button>
        </div>

        {/* Error Message */}
        {error && (
          <div className={styles.errorMessage}>
            <p className={styles.errorText}>{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {/* Basic Information */}
          <div className={styles.section}>
            <h2 className={styles.sectionTitle}>{tAccounting('basicInformation')}</h2>
            <div className={styles.sectionGrid}>
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>{tAccounting('period')} *</label>
                <input
                  type="text"
                  required
                  value={form.period}
                  onChange={(e) => setForm({ ...form, period: e.target.value })}
                  className={styles.formInput}
                  placeholder="مثال: 2024-01"
                />
              </div>

              <div className={styles.formGroup}>
                <label className={styles.formLabel}>{tAccounting('startDate')} *</label>
                <input
                  type="date"
                  required
                  value={form.startDate}
                  onChange={(e) => setForm({ ...form, startDate: e.target.value })}
                  className={styles.formInput}
                />
              </div>

              <div className={styles.formGroup}>
                <label className={styles.formLabel}>{tAccounting('endDate')} *</label>
                <input
                  type="date"
                  required
                  value={form.endDate}
                  onChange={(e) => setForm({ ...form, endDate: e.target.value })}
                  className={styles.formInput}
                />
              </div>

              <div className={styles.formGroup}>
                <label className={styles.formLabel}>{tAccounting('totalProduction')} (طن) *</label>
                <input
                  type="number"
                  required
                  value={form.totalProduction || ''}
                  onChange={(e) => setForm({ ...form, totalProduction: Number(e.target.value) })}
                  className={styles.formInput}
                  step="0.1"
                />
              </div>
            </div>
          </div>

          {/* Raw Materials */}
          <div className={styles.section}>
            <h2 className={styles.sectionTitle}>{tAccounting('rawMaterialsCosts')}</h2>
            <div className={styles.sectionGrid}>
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>{tAccounting('limestone')} (دج)</label>
                <input
                  type="number"
                  value={form.limestoneCost || ''}
                  onChange={(e) => setForm({ ...form, limestoneCost: Number(e.target.value) })}
                  className={styles.formInput}
                />
              </div>

              <div className={styles.formGroup}>
                <label className={styles.formLabel}>{tAccounting('clay')} (دج)</label>
                <input
                  type="number"
                  value={form.clayCost || ''}
                  onChange={(e) => setForm({ ...form, clayCost: Number(e.target.value) })}
                  className={styles.formInput}
                />
              </div>

              <div className={styles.formGroup}>
                <label className={styles.formLabel}>{tAccounting('gypsum')} (دج)</label>
                <input
                  type="number"
                  value={form.gypsumCost || ''}
                  onChange={(e) => setForm({ ...form, gypsumCost: Number(e.target.value) })}
                  className={styles.formInput}
                />
              </div>

              <div className={styles.formGroup}>
                <label className={styles.formLabel}>{tAccounting('ironOre')} (دج)</label>
                <input
                  type="number"
                  value={form.ironOreCost || ''}
                  onChange={(e) => setForm({ ...form, ironOreCost: Number(e.target.value) })}
                  className={styles.formInput}
                />
              </div>

              <div className={styles.formGroup}>
                <label className={styles.formLabel}>{tAccounting('flyAsh')} (دج)</label>
                <input
                  type="number"
                  value={form.flyAshCost || ''}
                  onChange={(e) => setForm({ ...form, flyAshCost: Number(e.target.value) })}
                  className={styles.formInput}
                />
              </div>

              <div className={styles.formGroup}>
                <label className={`${styles.formLabel} font-bold text-[#1ABC9C]`}>
                  {tAccounting('totalRawMaterials')}: {totals.rawMaterials.toLocaleString()} دج
                </label>
              </div>
            </div>
          </div>

          {/* Energy Costs */}
          <div className={styles.section}>
            <h2 className={styles.sectionTitle}>{tAccounting('energyCosts')}</h2>
            <div className={styles.sectionGrid}>
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>{tAccounting('electricity')} (دج)</label>
                <input
                  type="number"
                  value={form.electricityCost || ''}
                  onChange={(e) => setForm({ ...form, electricityCost: Number(e.target.value) })}
                  className={styles.formInput}
                />
              </div>

              <div className={styles.formGroup}>
                <label className={styles.formLabel}>{tAccounting('fuel')} (دج)</label>
                <input
                  type="number"
                  value={form.fuelCost || ''}
                  onChange={(e) => setForm({ ...form, fuelCost: Number(e.target.value) })}
                  className={styles.formInput}
                />
              </div>

              <div className={styles.formGroup}>
                <label className={styles.formLabel}>{tAccounting('gas')} (دج)</label>
                <input
                  type="number"
                  value={form.gasCost || ''}
                  onChange={(e) => setForm({ ...form, gasCost: Number(e.target.value) })}
                  className={styles.formInput}
                />
              </div>

              <div className={styles.formGroup}>
                <label className={`${styles.formLabel} font-bold text-[#1ABC9C]`}>
                  {tAccounting('totalEnergy')}: {totals.energy.toLocaleString()} دج
                </label>
              </div>
            </div>
          </div>

          {/* Labor Costs */}
          <div className={styles.section}>
            <h2 className={styles.sectionTitle}>{tAccounting('laborCosts')}</h2>
            <div className={styles.sectionGrid}>
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>{tAccounting('directLabor')} (دج)</label>
                <input
                  type="number"
                  value={form.directLabor || ''}
                  onChange={(e) => setForm({ ...form, directLabor: Number(e.target.value) })}
                  className={styles.formInput}
                />
              </div>

              <div className={styles.formGroup}>
                <label className={styles.formLabel}>{tAccounting('indirectLabor')} (دج)</label>
                <input
                  type="number"
                  value={form.indirectLabor || ''}
                  onChange={(e) => setForm({ ...form, indirectLabor: Number(e.target.value) })}
                  className={styles.formInput}
                />
              </div>

              <div className={styles.formGroup}>
                <label className={`${styles.formLabel} font-bold text-[#1ABC9C]`}>
                  {tAccounting('totalLabor')}: {totals.labor.toLocaleString()} دج
                </label>
              </div>
            </div>
          </div>

          {/* Maintenance Costs */}
          <div className={styles.section}>
            <h2 className={styles.sectionTitle}>{tAccounting('maintenanceCosts')}</h2>
            <div className={styles.sectionGrid}>
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>{tAccounting('preventiveMaintenance')} (دج)</label>
                <input
                  type="number"
                  value={form.preventiveMaintenance || ''}
                  onChange={(e) => setForm({ ...form, preventiveMaintenance: Number(e.target.value) })}
                  className={styles.formInput}
                />
              </div>

              <div className={styles.formGroup}>
                <label className={styles.formLabel}>{tAccounting('correctiveMaintenance')} (دج)</label>
                <input
                  type="number"
                  value={form.correctiveMaintenance || ''}
                  onChange={(e) => setForm({ ...form, correctiveMaintenance: Number(e.target.value) })}
                  className={styles.formInput}
                />
              </div>

              <div className={styles.formGroup}>
                <label className={`${styles.formLabel} font-bold text-[#1ABC9C]`}>
                  {tAccounting('totalMaintenance')}: {totals.maintenance.toLocaleString()} دج
                </label>
              </div>
            </div>
          </div>

          {/* Other Costs */}
          <div className={styles.section}>
            <h2 className={styles.sectionTitle}>{tAccounting('otherCosts')}</h2>
            <div className={styles.sectionGrid}>
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>{tAccounting('transportCost')} (دج)</label>
                <input
                  type="number"
                  value={form.transportCost || ''}
                  onChange={(e) => setForm({ ...form, transportCost: Number(e.target.value) })}
                  className={styles.formInput}
                />
              </div>

              <div className={styles.formGroup}>
                <label className={styles.formLabel}>{tAccounting('adminCost')} (دج)</label>
                <input
                  type="number"
                  value={form.adminCost || ''}
                  onChange={(e) => setForm({ ...form, adminCost: Number(e.target.value) })}
                  className={styles.formInput}
                />
              </div>

              <div className={styles.formGroup}>
                <label className={styles.formLabel}>{tAccounting('otherCosts')} (دج)</label>
                <input
                  type="number"
                  value={form.otherCosts || ''}
                  onChange={(e) => setForm({ ...form, otherCosts: Number(e.target.value) })}
                  className={styles.formInput}
                />
              </div>

              <div className={styles.formGroup}>
                <label className={`${styles.formLabel} font-bold text-[#1ABC9C]`}>
                  {tAccounting('totalOther')}: {totals.other.toLocaleString()} دج
                </label>
              </div>
            </div>
          </div>

          {/* Summary */}
          <div className={styles.section}>
            <h2 className={styles.sectionTitle}>{tAccounting('costSummary')}</h2>
            <div className={styles.sectionGrid}>
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>{tAccounting('totalRawMaterials')}:</label>
                <div className="font-bold">{totals.rawMaterials.toLocaleString()} دج</div>
              </div>
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>{tAccounting('totalEnergy')}:</label>
                <div className="font-bold">{totals.energy.toLocaleString()} دج</div>
              </div>
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>{tAccounting('totalLabor')}:</label>
                <div className="font-bold">{totals.labor.toLocaleString()} دج</div>
              </div>
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>{tAccounting('totalMaintenance')}:</label>
                <div className="font-bold">{totals.maintenance.toLocaleString()} دج</div>
              </div>
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>{tAccounting('totalOther')}:</label>
                <div className="font-bold">{totals.other.toLocaleString()} دج</div>
              </div>
              <div className={styles.formGroup}>
                <label className={`${styles.formLabel} text-lg font-bold text-[#1ABC9C]`}>
                  {tAccounting('totalCost')}:
                </label>
                <div className="text-lg font-bold text-[#1ABC9C]">{totalCost.toLocaleString()} دج</div>
              </div>
              <div className={styles.formGroup}>
                <label className={`${styles.formLabel} text-lg font-bold text-[#1ABC9C]`}>
                  {tAccounting('costPerTon')}:
                </label>
                <div className="text-lg font-bold text-[#1ABC9C]">{costPerTon.toLocaleString()} دج/طن</div>
              </div>
            </div>
          </div>

          {/* Notes */}
          <div className={styles.section}>
            <h2 className={styles.sectionTitle}>{tAccounting('notes')}</h2>
            <textarea
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
              className={styles.formInput}
              rows={3}
            />
          </div>

          {/* Actions */}
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
  );
}