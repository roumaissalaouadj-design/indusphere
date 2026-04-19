'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { logout } from '@/app/actions/auth';
import { usePermissions } from '@/hooks/usePermissions';
import { useTranslations, useLocale } from 'next-intl';
import styles from '@/styles/components/Sidebar.module.css';

interface SidebarProps {
  mobileOpen?: boolean;
  onMobileClose?: () => void;
  onCollapsedChange?: (collapsed: boolean) => void;
}

export default function Sidebar({ mobileOpen = false, onMobileClose, onCollapsedChange }: SidebarProps) {
  const pathname = usePathname();
  const locale = useLocale();
  const t = useTranslations('Nav');
  const tAccounting = useTranslations('Accounting');
  const [collapsed, setCollapsed] = useState(false);
  const { can, loading } = usePermissions();

  const cleanPath = pathname.replace(/^\/(ar|fr|en)/, '') || '/';
  const isRTL = locale === 'ar';

  const handleCollapse = (val: boolean) => {
    setCollapsed(val);
    onCollapsedChange?.(val);
  };

  const menuItems = [
    {
      section: t('home'),
      items: [
        { href: '/dashboard', icon: '📊', label: t('dashboard'), permission: null },
        { href: '/settings',  icon: '⚙️', label: t('settings'),  permission: 'settings.users.view' },
      ]
    },
    {
      section: t('cmms'),
      permission: 'cmms.assets.view',
      items: [
        { href: '/cmms/assets',                 icon: '⚙️',  label: t('assets'),               permission: 'cmms.assets.view' },
        { href: '/cmms/work-orders',            icon: '📋',  label: t('workOrders'),            permission: 'cmms.workorders.view' },
        { href: '/cmms/spare-parts',            icon: '🔩',  label: t('spareParts'),            permission: 'cmms.spareparts.view' },
        { href: '/cmms/maintenance-requests',   icon: '📝',  label: t('maintenanceRequests'),   permission: 'cmms.maintenance.view' },
        { href: '/cmms/preventive-maintenance', icon: '🗓️', label: t('preventiveMaintenance'), permission: 'cmms.preventive.view' },
        { href: '/cmms/failure-prediction',     icon: '🤖',  label: t('failurePrediction'),     permission: 'cmms.assets.view' },
      ]
    },
    {
      section: t('erp'),
      permission: 'erp.finance.view',
      items: [
        { href: '/erp/finance',            icon: '💰',  label: t('finance'),           permission: 'erp.finance.view' },
        { href: '/erp/production',         icon: '🏗️', label: t('production'),        permission: 'erp.production.view' },
        { href: '/erp/inventory',          icon: '📦',  label: t('inventory'),         permission: 'erp.inventory.view' },
        { href: '/erp/inventory-forecast', icon: '🤖',  label: t('inventoryForecast'), permission: 'erp.inventory.view' },
        { href: '/erp/procurement',        icon: '🛒',  label: t('procurement'),       permission: 'erp.procurement.view' },
        { href: '/erp/hr',                 icon: '👥',  label: t('hr'),                permission: 'erp.hr.view' },
      ]
    },
    // ==================== قسم المحاسبة ====================
    {
      section: tAccounting('title'),
      permission: null,
      items: [
        // 1. المشتريات
        { href: '/erp/accounting/procurement/suppliers', icon: '🏭', label: tAccounting('suppliers'), permission: null },
        { href: '/erp/accounting/procurement/invoices', icon: '📄', label: tAccounting('purchaseInvoices'), permission: null },
        // 2. المبيعات
        { href: '/erp/accounting/sales/customers', icon: '👥', label: tAccounting('customers'), permission: null },
        { href: '/erp/accounting/sales/invoices', icon: '💰', label: tAccounting('salesInvoices'), permission: null },
        { href: '/erp/accounting/sales/prices', icon: '🏷️', label: tAccounting('prices'), permission: null },
        // 3. الإنتاج
        { href: '/erp/accounting/production/costs', icon: '🏗️', label: tAccounting('productionCosts'), permission: null },

        // 5. الضرائب
        { href: '/erp/accounting/taxes/settings', icon: '⚙️', label: tAccounting('taxSettings'), permission: null },
        { href: '/erp/accounting/taxes/declarations', icon: '📋', label: tAccounting('taxDeclarations'), permission: null },
        // ❌ تم حذف روابط التقارير من هنا (تم دمجها في صفحة /reports)
      ]
    },
    // ======================================================================
    {
      section: t('reports'),
      permission: null,
      items: [
        { href: '/reports', icon: '📈', label: t('reportsAnalytics'), permission: null },
      ]
    },
  ];

  return (
    <>
      {mobileOpen && (
        <div
          className={`${styles.overlay} ${styles.overlayVisible}`}
          onClick={onMobileClose}
        />
      )}

      <div className={`
        ${styles.sidebar}
        ${isRTL ? styles.sidebarRTL : styles.sidebarLTR}
        ${collapsed ? styles.sidebarCollapsed : styles.sidebarExpanded}
        ${mobileOpen ? styles.sidebarMobileOpen : ''}
      `}>

        <button
          className={`${styles.toggleBtn} ${isRTL ? styles.toggleBtnRTL : styles.toggleBtnLTR}`}
          onClick={() => handleCollapse(!collapsed)}
        >
          {collapsed ? (
            <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
              <rect x="1" y="3"    width="14" height="1.5" rx="1"/>
              <rect x="1" y="7.25" width="14" height="1.5" rx="1"/>
              <rect x="1" y="11.5" width="14" height="1.5" rx="1"/>
            </svg>
          ) : (
            <svg width="12" height="12" viewBox="0 0 12 12" fill="currentColor">
              <path
                d={isRTL ? 'M4 1L9 6L4 11' : 'M8 1L3 6L8 11'}
                stroke="currentColor"
                strokeWidth="1.5"
                fill="none"
                strokeLinecap="round"
              />
            </svg>
          )}
        </button>

        <div className={styles.logo}>
          {collapsed ? (
            <span className={styles.logoIcon}>🏭</span>
          ) : (
            <h1 className={styles.logoText}>
              INDU<span className={styles.logoAccent}>SPHERE</span>
            </h1>
          )}
        </div>

        <nav className={styles.nav}>
          {menuItems.map((section) => {
            const sectionVisible = !section.permission || can(section.permission);
            const visibleItems = section.items.filter(item => !item.permission || can(item.permission));
            if (!sectionVisible && visibleItems.length === 0) return null;

            return (
              <div key={section.section} className={styles.section}>
                <div className={`${styles.sectionTitle} ${collapsed ? styles.sectionTitleHidden : ''}`}>
                  {section.section}
                </div>
                {visibleItems.map((item) => {
                  const fullHref = `/${locale}${item.href}`;
                  const isActive = cleanPath === item.href || cleanPath.startsWith(item.href + '/');
                  return (
                    <Link
                      key={item.href}
                      href={fullHref}
                      onClick={onMobileClose}
                      data-tooltip={collapsed ? item.label : undefined}
                      className={`${styles.menuItem} ${isActive ? styles.menuItemActive : ''} ${isRTL ? styles.menuItemRTL : ''}`}
                    >
                      <span className={styles.menuIcon}>{item.icon}</span>
                      <span className={`${styles.menuLabel} ${collapsed ? styles.menuLabelHidden : ''}`}>
                        {item.label}
                      </span>
                    </Link>
                  );
                })}
              </div>
            );
          })}

          <div className={styles.section}>
            <div className={`${styles.sectionTitle} ${collapsed ? styles.sectionTitleHidden : ''}`}>
              {t('account')}
            </div>
            <Link
              href={`/${locale}/settings/change-password`}
              onClick={onMobileClose}
              data-tooltip={collapsed ? t('changePassword') : undefined}
              className={`${styles.menuItem} ${cleanPath === '/settings/change-password' ? styles.menuItemActive : ''} ${isRTL ? styles.menuItemRTL : ''}`}
            >
              <span className={styles.menuIcon}>🔑</span>
              <span className={`${styles.menuLabel} ${collapsed ? styles.menuLabelHidden : ''}`}>
                {t('changePassword')}
              </span>
            </Link>
          </div>

          {loading && (
            <div style={{ padding: '1rem', opacity: 0.3 }}>
              {[1, 2, 3].map(i => (
                <div key={i} style={{
                  height: '2rem',
                  backgroundColor: 'rgba(255,255,255,0.1)',
                  borderRadius: '0.5rem',
                  marginBottom: '0.5rem',
                }} />
              ))}
            </div>
          )}
        </nav>

        <div className={styles.bottom}>
          <form action={logout}>
            <button type="submit" className={styles.logoutBtn}>
              <span className={styles.menuIcon}>🚪</span>
              <span className={`${styles.menuLabel} ${collapsed ? styles.menuLabelHidden : ''}`}>
                {t('logout')}
              </span>
            </button>
          </form>
        </div>

      </div>
    </>
  );
}