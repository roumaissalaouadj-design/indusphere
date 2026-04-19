'use client';

import { useTranslations, useLocale } from 'next-intl';
import { useSession } from 'next-auth/react';
import { useEffect, useState, useRef } from 'react';
import Link from 'next/link';
import { usePermissions } from '@/hooks/usePermissions';
import styles from '@/styles/pages/dashboard.module.css';

// ==================== Types ====================
interface WorkOrder  { _id: string; status: string; title: string; priority: string; createdAt: string }
interface Asset      { _id: string; status: string }
interface Employee   { _id: string; department?: string }
interface SparePart  { _id: string; quantity: number; minQuantity: number; name: string }
interface Transaction{ _id: string; type: 'income' | 'expense'; amount: number }
interface Production { _id: string; status: string }
interface PurchaseOrder { _id: string; status: string }
interface MaintenanceRequest { _id: string; status: string }
interface PreventiveMaintenance { _id: string; status: string; nextDueDate: string }

interface DashboardData {
  workOrders: WorkOrder[];
  assets: Asset[];
  employees: Employee[];
  spareParts: SparePart[];
  transactions: Transaction[];
  production: Production[];
  purchaseOrders: PurchaseOrder[];
  maintenanceRequests: MaintenanceRequest[];
  preventiveMaintenance: PreventiveMaintenance[];
}

// ==================== StatCard Component ====================
function StatCard({
  icon, label, value, sub, color, href, locale,
}: {
  icon: string;
  label: string;
  value: string | number;
  sub?: string;
  color: string;
  href?: string;
  locale: string;
}) {
  const colorMap: Record<string, string> = {
    amber:  'var(--color-secondary)',
    blue:   'var(--color-info)',
    green:  'var(--color-success)',
    red:    'var(--color-danger)',
    purple: '#a855f7',
    cyan:   '#06b6d4',
    orange: '#f97316',
    pink:   '#ec4899',
  };
  const c = colorMap[color] || colorMap.amber;

  const card = (
    <div className={styles.statCard} style={{ '--card-accent': c } as React.CSSProperties}>
      <div className={styles.statCardTop}>
        <span className={styles.statIcon}>{icon}</span>
        <span className={styles.statLabel}>{label}</span>
      </div>
      <div className={styles.statValue}>{value}</div>
      {sub && <div className={styles.statSub}>{sub}</div>}
      <div className={styles.statBar} style={{ background: `${c}22` }}>
        <div className={styles.statBarFill} style={{ background: c, width: '100%' }} />
      </div>
    </div>
  );

  if (href) return <Link href={`/${locale}${href}`} style={{ textDecoration: 'none' }}>{card}</Link>;
  return card;
}

// ==================== Main Page ====================
export default function DashboardPage() {
  const { data: session } = useSession();
  const locale = useLocale();
  const t  = useTranslations('Dashboard');
  const tC = useTranslations('Common');
  const { can, loading: permLoading } = usePermissions();

  const hasFetched = useRef(false);

  const [data, setData] = useState<DashboardData>({
    workOrders: [], assets: [], employees: [], spareParts: [],
    transactions: [], production: [], purchaseOrders: [],
    maintenanceRequests: [], preventiveMaintenance: [],
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (permLoading) return;
    if (hasFetched.current) return;
    hasFetched.current = true;

    const load = async (url: string, key: keyof DashboardData, acc: Partial<DashboardData>) => {
      try {
        const res  = await fetch(url);
        const json = await res.json();
        if (json.success) (acc as Record<string, unknown[]>)[key] = json.data || [];
      } catch { /* تجاهل الخطأ */ }
    };

    const run = async () => {
      const acc: Partial<DashboardData> = {};
      const fetches: Promise<void>[] = [];

      if (can('cmms.workorders.view'))  fetches.push(load('/api/work-orders',            'workOrders',            acc));
      if (can('cmms.assets.view'))      fetches.push(load('/api/assets',                 'assets',                acc));
      if (can('erp.hr.view'))           fetches.push(load('/api/employees',              'employees',             acc));
      if (can('cmms.spareparts.view'))  fetches.push(load('/api/spare-parts',            'spareParts',            acc));
      if (can('erp.finance.view'))      fetches.push(load('/api/transactions',           'transactions',          acc));
      if (can('erp.production.view'))   fetches.push(load('/api/production',             'production',            acc));
      if (can('erp.procurement.view'))  fetches.push(load('/api/purchase-orders',        'purchaseOrders',        acc));
      if (can('cmms.maintenance.view')) fetches.push(load('/api/maintenance-requests',   'maintenanceRequests',   acc));
      if (can('cmms.preventive.view'))  fetches.push(load('/api/preventive-maintenance', 'preventiveMaintenance', acc));

      await Promise.all(fetches);
      setData(prev => ({ ...prev, ...acc }));
      setLoading(false);
    };

    run();
  }, [permLoading, can]);

  // ==================== حساب الإحصائيات ====================
  const wo = data.workOrders;
  const woCompleted  = wo.filter(w => w.status === 'done').length;
  const woPending    = wo.filter(w => w.status === 'open').length;
  const woInProgress = wo.filter(w => w.status === 'in-progress' || w.status === 'assigned').length;

  const activeAssets    = data.assets.filter(a => a.status === 'active').length;
  const maintenAssets   = data.assets.filter(a => a.status === 'maintenance').length;
  const departments     = [...new Set(data.employees.map(e => e.department).filter(Boolean))].length;
  const lowStock        = data.spareParts.filter(s => s.quantity <= s.minQuantity);
  const totalIncome     = data.transactions.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0);
  const totalExpense    = data.transactions.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0);
  const activePlans     = data.production.filter(p => p.status === 'in-progress').length;
  const pendingOrders   = data.purchaseOrders.filter(p => p.status === 'draft' || p.status === 'sent').length;
  const approvedReqs    = data.maintenanceRequests.filter(r => r.status === 'approved').length;
  const today           = new Date();
  const overdueTasks    = data.preventiveMaintenance.filter(p => new Date(p.nextDueDate) < today && p.status !== 'completed').length;

  const val   = (n: number) => loading ? '—' : n;
  const money = (n: number) => loading ? '—' : `${n.toLocaleString()} ${tC('currency')}`;

  // ==================== بناء البطاقات حسب الصلاحيات ====================
  const cards: React.ReactNode[] = [];

  if (can('cmms.workorders.view')) {
    cards.push(
      <StatCard key="wo" icon="📋" color="amber"
        label={t('workOrders')}
        value={val(wo.length)}
        sub={`${t('completed')}: ${val(woCompleted)} | ${t('inProgress')}: ${val(woInProgress)}`}
        href="/cmms/work-orders" locale={locale}
      />
    );
  }

  if (can('cmms.assets.view')) {
    cards.push(
      <StatCard key="assets" icon="⚙️" color="blue"
        label={t('assets')}
        value={val(data.assets.length)}
        sub={`${t('activeAssets')}: ${val(activeAssets)} | ${t('underMaintenance')}: ${val(maintenAssets)}`}
        href="/cmms/assets" locale={locale}
      />
    );
  }

  if (can('cmms.spareparts.view')) {
    cards.push(
      <StatCard key="spare" icon="🔩" color="orange"
        label={t('spareParts')}
        value={val(data.spareParts.length)}
        sub={`${t('lowStockParts')}: ${val(lowStock.length)}`}
        href="/cmms/spare-parts" locale={locale}
      />
    );
  }

  if (can('cmms.maintenance.view')) {
    cards.push(
      <StatCard key="mreq" icon="📝" color="red"
        label={t('maintenanceRequests')}
        value={val(data.maintenanceRequests.length)}
        sub={`${t('pending')}: ${val(woPending)} | ${t('approved')}: ${val(approvedReqs)}`}
        href="/cmms/maintenance-requests" locale={locale}
      />
    );
  }

  if (can('cmms.preventive.view')) {
    cards.push(
      <StatCard key="prev" icon="🗓️" color="cyan"
        label={t('preventiveTasks')}
        value={val(data.preventiveMaintenance.length)}
        sub={`${t('overdueTasks')}: ${val(overdueTasks)}`}
        href="/cmms/preventive-maintenance" locale={locale}
      />
    );
  }

  if (can('erp.finance.view')) {
    cards.push(
      <StatCard key="fin" icon="💰" color="green"
        label={t('finance')}
        value={money(totalIncome - totalExpense)}
        sub={`↑ ${money(totalIncome)} | ↓ ${money(totalExpense)}`}
        href="/erp/finance" locale={locale}
      />
    );
  }

  if (can('erp.production.view')) {
    cards.push(
      <StatCard key="prod" icon="🏗️" color="purple"
        label={t('production')}
        value={val(data.production.length)}
        sub={`${t('activePlans')}: ${val(activePlans)}`}
        href="/erp/production" locale={locale}
      />
    );
  }

  if (can('erp.procurement.view')) {
    cards.push(
      <StatCard key="proc" icon="🛒" color="pink"
        label={t('procurement')}
        value={val(data.purchaseOrders.length)}
        sub={`${t('pendingOrders')}: ${val(pendingOrders)}`}
        href="/erp/procurement" locale={locale}
      />
    );
  }

  if (can('erp.hr.view')) {
    cards.push(
      <StatCard key="hr" icon="👥" color="green"
        label={t('employees')}
        value={val(data.employees.length)}
        sub={`${t('departments')}: ${val(departments)}`}
        href="/erp/hr" locale={locale}
      />
    );
  }

  // ==================== Render ====================
  return (
    <div className={styles.page}>
      <div className={styles.container}>

        {/* Header */}
        <div className={styles.header}>
          <div className={styles.headerLeft}>
            <h1 className={styles.title}>
              {t('welcome')}, <span className={styles.userName}>
                {session?.user?.name || session?.user?.email || ''}
              </span>
            </h1>
            <p className={styles.subtitle}>{t('description')}</p>
          </div>
          <div className={styles.headerRight}>
            <span className={styles.dateTag}>
              {new Date().toLocaleDateString(
                locale === 'ar' ? 'ar-DZ' : locale === 'fr' ? 'fr-FR' : 'en-US',
                { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }
              )}
            </span>
          </div>
        </div>

        {/* Stats Grid */}
        {permLoading || loading ? (
          <div className={styles.skeletonGrid}>
            {[1,2,3,4].map(i => <div key={i} className={styles.skeleton} />)}
          </div>
        ) : cards.length > 0 ? (
          <div className={styles.statsGrid}>
            {cards}
          </div>
        ) : (
          <div className={styles.emptyState}>
            <span>🔒</span>
            <p>{tC('noData')}</p>
          </div>
        )}

        {/* Bottom Section */}
        <div className={styles.bottomGrid}>

          {/* إجراءات سريعة */}
          <div className={styles.card}>
            <div className={styles.cardHeader}>
              <h2 className={styles.cardTitle}>⚡ {t('quickActions')}</h2>
            </div>
            <div className={styles.quickGrid}>
              {can('cmms.workorders.create') && (
                <Link href={`/${locale}/cmms/work-orders`} className={styles.quickBtn}>
                  <span>📋</span>
                  <span>{t('newWorkOrder')}</span>
                </Link>
              )}
              {can('cmms.assets.create') && (
                <Link href={`/${locale}/cmms/assets`} className={styles.quickBtn}>
                  <span>⚙️</span>
                  <span>{t('newAsset')}</span>
                </Link>
              )}
              {can('erp.procurement.create') && (
                <Link href={`/${locale}/erp/procurement`} className={styles.quickBtn}>
                  <span>🛒</span>
                  <span>{t('newPurchaseOrder')}</span>
                </Link>
              )}
              {can('erp.hr.create') && (
                <Link href={`/${locale}/erp/hr`} className={styles.quickBtn}>
                  <span>👥</span>
                  <span>{t('newEmployee')}</span>
                </Link>
              )}
              {can('cmms.maintenance.create') && (
                <Link href={`/${locale}/cmms/maintenance-requests`} className={styles.quickBtn}>
                  <span>📝</span>
                  <span>{t('maintenanceRequests')}</span>
                </Link>
              )}
              {can('erp.finance.create') && (
                <Link href={`/${locale}/erp/finance`} className={styles.quickBtn}>
                  <span>💰</span>
                  <span>{t('finance')}</span>
                </Link>
              )}
            </div>
          </div>

          {/* تنبيه المخزون المنخفض */}
          {can('cmms.spareparts.view') && lowStock.length > 0 && !loading && (
            <div className={styles.card}>
              <div className={styles.cardHeader}>
                <h2 className={styles.cardTitle}>
                  ⚠️ {t('lowStock')}
                  <span className={styles.badge}>{lowStock.length}</span>
                </h2>
                <Link href={`/${locale}/cmms/spare-parts`} className={styles.viewAll}>
                  {t('viewAll')} ←
                </Link>
              </div>
              <div className={styles.woList}>
                {lowStock.slice(0, 5).map(part => (
                  <div key={part._id} className={styles.woRow}>
                    <span className={styles.woTitle}>{part.name}</span>
                    <span className={styles.tag} style={{ background: 'var(--color-danger-light)', color: 'var(--color-danger)' }}>
                      {part.quantity} / {part.minQuantity}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}