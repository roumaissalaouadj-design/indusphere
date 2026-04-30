'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import EmployeesTab from '@/components/hr/EmployeesTab';
import SalaryStructureTab from '@/components/hr/SalaryStructureTab';
import SalaryPaymentsTab from '@/components/hr/SalaryPaymentsTab';
import EmployeeEvaluationsTab from '@/components/hr/EmployeeEvaluationsTab';
import styles from '@/styles/pages/hr.module.css';

type Props = {
  params: Promise<{ locale: string }>;
};

type TabType = 'employees' | 'structure' | 'payments' | 'evaluations';

export default function HRPage({ params }: Props) {
  const t = useTranslations('ERP');
  const [activeTab, setActiveTab] = useState<TabType>('employees');

  const tabs = [
    { id: 'employees', label: t('hrEmployees'), icon: '👥' },
    { id: 'structure', label: t('hrSalaryStructure'), icon: '💰' },
    { id: 'payments', label: t('hrSalaryPayments'), icon: '💵' },
    { id: 'evaluations', label: t('hrEmployeeEvaluations'), icon: '⭐' },
  ];

  return (
    <div className={styles.page}>
      <div className={styles.container}>
        
        {/* Header */}
        <div className={styles.header}>
          <div>
            <h1 className={styles.title}>{t('hr')}</h1>
            <p className={styles.subtitle}>{t('hrSubtitle')}</p>
          </div>
        </div>

        {/* Tabs */}
        <div className={styles.tabsContainer}>
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as TabType)}
              className={`${styles.tabButton} ${activeTab === tab.id ? styles.tabActive : ''}`}
            >
              <span className={styles.tabIcon}>{tab.icon}</span>
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className={styles.tabContent}>
          {activeTab === 'employees' && <EmployeesTab params={params} />}
          {activeTab === 'structure' && <SalaryStructureTab />}
          {activeTab === 'payments' && <SalaryPaymentsTab params={params} />}
          {activeTab === 'evaluations' && <EmployeeEvaluationsTab params={params} />}
        </div>

      </div>
    </div>
  );
}