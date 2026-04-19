export const ALL_PERMISSIONS = [
  // CMMS
  'cmms.assets.view',      'cmms.assets.create',      'cmms.assets.edit',
  'cmms.workorders.view',  'cmms.workorders.create',  'cmms.workorders.edit',
  'cmms.spareparts.view',  'cmms.spareparts.create',  'cmms.spareparts.edit',
  'cmms.maintenance.view', 'cmms.maintenance.create', 'cmms.maintenance.edit',
  'cmms.preventive.view',  'cmms.preventive.create',  'cmms.preventive.edit',
  // ERP
  'erp.finance.view',      'erp.finance.create',      'erp.finance.edit',
  'erp.production.view',   'erp.production.create',   'erp.production.edit',
  'erp.inventory.view',    'erp.inventory.create',    'erp.inventory.edit',
  'erp.procurement.view',  'erp.procurement.create',  'erp.procurement.edit',
  'erp.hr.view',           'erp.hr.create',           'erp.hr.edit',
  // Settings
  'settings.users.view',   'settings.users.create',   'settings.users.edit',
  'settings.roles.view',   'settings.roles.create',   'settings.roles.edit',
] as const

export type Permission = typeof ALL_PERMISSIONS[number]

// الأدوار الافتراضية
export const DEFAULT_ROLES = [
  {
    name: 'Admin',
    permissions: ALL_PERMISSIONS,
    isDefault: false,
  },
  {
    name: 'CMMS Manager',
    permissions: ALL_PERMISSIONS.filter(p => p.startsWith('cmms')),
    isDefault: false,
  },
  {
    name: 'ERP Manager',
    permissions: ALL_PERMISSIONS.filter(p => p.startsWith('erp')),
    isDefault: false,
  },
  {
    name: 'Technician',
    permissions: [
      'cmms.assets.view',
      'cmms.workorders.view', 'cmms.workorders.edit',
      'cmms.maintenance.view', 'cmms.maintenance.create',
      'cmms.preventive.view',
    ],
    isDefault: false,
  },
  {
    name: 'Viewer',
    permissions: ALL_PERMISSIONS.filter(p => p.endsWith('.view')),
    isDefault: true,
  },
]