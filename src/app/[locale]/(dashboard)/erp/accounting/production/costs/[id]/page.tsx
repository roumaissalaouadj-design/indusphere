// src/app/[locale]/(dashboard)/erp/accounting/production/costs/[id]/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { ArrowRight, Factory, Edit, Trash2 } from 'lucide-react';
import styles from '@/styles/pages/accounting/production-costs.module.css';

interface ProductionCost {
  _id: string;
  period: string;
  startDate: string;
  endDate: string;
  totalProduction: number;
  
  limestoneCost: number;
  clayCost: number;
  gypsumCost: number;
  ironOreCost: number;
  flyAshCost: number;
  rawMaterialsCost: number;
  
  electricityCost: number;
  fuelCost: number;
  gasCost: number;
  energyCost: number;
  
  directLabor: number;
  indirectLabor: number;
  laborCost: number;
  
  preventiveMaintenance: number;
  correctiveMaintenance: number;
  maintenanceCost: number;
  
  transportCost: number;
  adminCost: number;
  otherCosts: number;
  
  totalCost: number;
  costPerTon: number;
  
  notes: string;
  createdBy: { name: string; email: string };
  createdAt: string;
}

export default function ProductionCostDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const router = useRouter();
  const t = useTranslations('Common');
  const tAccounting = useTranslations('Accounting');
  
  const [cost, setCost] = useState<ProductionCost | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchCost();
  }, []);

  const fetchCost = async () => {
    try {
      const { id } = await params;
      const res = await fetch(`/api/accounting/production-costs/${id}`);
      const data = await res.json();
      if (data.success) {
        setCost(data.data.cost);
      } else {
        setError(data.message);
      }
    } catch {
      setError(t('fetchError'));
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm(t('deleteConfirm'))) return;

    try {
      const { id } = await params;
      const res = await fetch(`/api/accounting/production-costs/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        alert(t('deleteSuccess'));
        router.push('/erp/accounting/production/costs');
      } else {
        alert(data.message);
      }
    } catch {
      alert(t('error'));
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ar-DZ');
  };

  const formatAmount = (amount: number) => {
    return amount.toLocaleString('ar-DZ') + ' دج';
  };

  const formatNumber = (num: number) => {
    return num.toLocaleString('ar-DZ');
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

  if (!cost) {
    return (
      <div className={styles.page}>
        <div className={styles.container}>
          <div className={styles.emptyState}>
            <Factory className="w-12 h-12 mx-auto mb-2 text-gray-400" />
            {t('noData')}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <div className={styles.container}>
        {/* Header */}
        <div className={styles.header}>
          <div>
            <h1 className={styles.title}>
              <Factory className="inline-block w-6 h-6 ml-2 text-[#1ABC9C]" />
              {tAccounting('productionCostDetails')}
            </h1>
            <p className={styles.subtitle}>
              {tAccounting('period')}: {cost.period}
            </p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => router.push(`/erp/accounting/production/costs/${cost._id}/edit`)}
              className={styles.addButton}
              style={{ backgroundColor: '#f59e0b' }}
            >
              <Edit className="w-4 h-4" />
              {t('edit')}
            </button>
            <button onClick={handleDelete} className={styles.addButton} style={{ backgroundColor: '#dc2626' }}>
              <Trash2 className="w-4 h-4" />
              {t('delete')}
            </button>
            <button onClick={() => router.back()} className={styles.cancelButton}>
              <ArrowRight className="w-4 h-4 ml-1" />
              {t('back')}
            </button>
          </div>
        </div>

        {error && (
          <div className={styles.errorMessage}>
            <p className={styles.errorText}>{error}</p>
          </div>
        )}

        {/* Basic Information */}
        <div className={styles.section}>
          <h2 className={styles.sectionTitle}>{tAccounting('basicInformation')}</h2>
          <div className={styles.sectionGrid}>
            <div>
              <label className={styles.formLabel}>{tAccounting('period')}</label>
              <div className="font-bold">{cost.period}</div>
            </div>
            <div>
              <label className={styles.formLabel}>{tAccounting('startDate')}</label>
              <div className="font-bold">{formatDate(cost.startDate)}</div>
            </div>
            <div>
              <label className={styles.formLabel}>{tAccounting('endDate')}</label>
              <div className="font-bold">{formatDate(cost.endDate)}</div>
            </div>
            <div>
              <label className={styles.formLabel}>{tAccounting('totalProduction')} (طن)</label>
              <div className="font-bold">{formatNumber(cost.totalProduction)}</div>
            </div>
          </div>
        </div>

        {/* Cost Breakdown */}
        <div className={styles.section}>
          <h2 className={styles.sectionTitle}>{tAccounting('costBreakdown')}</h2>
          <div className={styles.sectionGrid}>
            <div>
              <label className={styles.formLabel}>{tAccounting('rawMaterialsCost')}</label>
              <div className="font-bold">{formatAmount(cost.rawMaterialsCost)}</div>
              <div className="text-sm text-gray-500 mt-1">
                <div>• {tAccounting('limestone')}: {formatAmount(cost.limestoneCost)}</div>
                <div>• {tAccounting('clay')}: {formatAmount(cost.clayCost)}</div>
                <div>• {tAccounting('gypsum')}: {formatAmount(cost.gypsumCost)}</div>
                <div>• {tAccounting('ironOre')}: {formatAmount(cost.ironOreCost)}</div>
                <div>• {tAccounting('flyAsh')}: {formatAmount(cost.flyAshCost)}</div>
              </div>
            </div>

            <div>
              <label className={styles.formLabel}>{tAccounting('energyCost')}</label>
              <div className="font-bold">{formatAmount(cost.energyCost)}</div>
              <div className="text-sm text-gray-500 mt-1">
                <div>• {tAccounting('electricity')}: {formatAmount(cost.electricityCost)}</div>
                <div>• {tAccounting('fuel')}: {formatAmount(cost.fuelCost)}</div>
                <div>• {tAccounting('gas')}: {formatAmount(cost.gasCost)}</div>
              </div>
            </div>

            <div>
              <label className={styles.formLabel}>{tAccounting('laborCost')}</label>
              <div className="font-bold">{formatAmount(cost.laborCost)}</div>
              <div className="text-sm text-gray-500 mt-1">
                <div>• {tAccounting('directLabor')}: {formatAmount(cost.directLabor)}</div>
                <div>• {tAccounting('indirectLabor')}: {formatAmount(cost.indirectLabor)}</div>
              </div>
            </div>

            <div>
              <label className={styles.formLabel}>{tAccounting('maintenanceCost')}</label>
              <div className="font-bold">{formatAmount(cost.maintenanceCost)}</div>
              <div className="text-sm text-gray-500 mt-1">
                <div>• {tAccounting('preventive')}: {formatAmount(cost.preventiveMaintenance)}</div>
                <div>• {tAccounting('corrective')}: {formatAmount(cost.correctiveMaintenance)}</div>
              </div>
            </div>

            <div>
              <label className={styles.formLabel}>{tAccounting('otherCosts')}</label>
              <div className="font-bold">{formatAmount(cost.otherCosts)}</div>
              <div className="text-sm text-gray-500 mt-1">
                <div>• {tAccounting('transport')}: {formatAmount(cost.transportCost)}</div>
                <div>• {tAccounting('admin')}: {formatAmount(cost.adminCost)}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Summary */}
        <div className={styles.section}>
          <h2 className={styles.sectionTitle}>{tAccounting('costSummary')}</h2>
          <div className={styles.sectionGrid}>
            <div>
              <label className={styles.formLabel}>{tAccounting('totalCost')}</label>
              <div className="text-xl font-bold text-[#1ABC9C]">{formatAmount(cost.totalCost)}</div>
            </div>
            <div>
              <label className={styles.formLabel}>{tAccounting('costPerTon')}</label>
              <div className="text-xl font-bold text-[#1ABC9C]">{formatAmount(cost.costPerTon)}/طن</div>
            </div>
          </div>
        </div>

        {/* Notes */}
        {cost.notes && (
          <div className={styles.section}>
            <h2 className={styles.sectionTitle}>{tAccounting('notes')}</h2>
            <p className="text-gray-600">{cost.notes}</p>
          </div>
        )}

        {/* Created By */}
        <div className={styles.section}>
          <h2 className={styles.sectionTitle}>{tAccounting('createdBy')}</h2>
          <div>
            <div>{cost.createdBy?.name || 'غير معروف'}</div>
            <div className="text-sm text-gray-500">{formatDate(cost.createdAt)}</div>
          </div>
        </div>
      </div>
    </div>
  );
}