// src/app/[locale]/(dashboard)/erp/accounting/procurement/invoices/new/page.tsx
'use client';

import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { Package, Wrench, Truck, ArrowRight } from 'lucide-react';
import styles from '@/styles/pages/accounting/purchase-invoices.module.css';

const invoiceTypes = [
  {
    id: 'raw_materials',
    title: 'مواد خام',
    description: 'حجر جيري، طين، جبس، خام حديد، رماد متطاير',
    icon: Package,
    color: 'bg-blue-500',
    path: '/erp/accounting/procurement/invoices/new/raw-materials',
  },
  {
    id: 'services',
    title: 'خدمات',
    description: 'كهرباء، ماء، غاز، نقل، صيانة',
    icon: Wrench,
    color: 'bg-green-500',
    path: '/erp/accounting/procurement/invoices/new/services',
  },
  {
    id: 'equipment',
    title: 'تجهيزات',
    description: 'قطع غيار، معدات، آلات جديدة',
    icon: Truck,
    color: 'bg-purple-500',
    path: '/erp/accounting/procurement/invoices/new/equipment',
  },
];

export default function NewInvoiceTypePage() {
  const router = useRouter();
  const t = useTranslations('Common');
  const tAccounting = useTranslations('Accounting');

  return (
    <div className={styles.page}>
      <div className={styles.container}>
        {/* Header */}
        <div className={styles.header}>
          <div>
            <h1 className={styles.title}>
              {tAccounting('addInvoice')}
            </h1>
            <p className={styles.subtitle}>
              {tAccounting('selectInvoiceType')}
            </p>
          </div>
          <button
            onClick={() => router.back()}
            className={styles.cancelButton}
          >
            <ArrowRight className="w-4 h-4 ml-1" />
            {t('cancel')}
          </button>
        </div>

        {/* Type Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
          {invoiceTypes.map((type) => {
            const Icon = type.icon;
            return (
              <button
                key={type.id}
                onClick={() => router.push(type.path)}
                className="bg-white border border-gray-200 rounded-xl p-6 text-right hover:shadow-lg transition-all duration-300 hover:scale-105"
              >
                <div className={`${type.color} w-16 h-16 rounded-2xl flex items-center justify-center mb-4 mx-auto`}>
                  <Icon className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-lg font-bold text-gray-800 mb-2">
                  {type.title}
                </h3>
                <p className="text-gray-500 text-sm">
                  {type.description}
                </p>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}