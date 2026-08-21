export type Permission =
  | 'pos.sell'
  | 'pos.refund'
  | 'pos.discount'
  | 'pos.void'
  | 'pos.session.open'
  | 'pos.session.close'
  | 'stock.view'
  | 'stock.create'
  | 'stock.edit'
  | 'stock.adjust'
  | 'stock.transfer'
  | 'stock.delete'
  | 'purchasing.view'
  | 'purchasing.create'
  | 'purchasing.approve'
  | 'purchasing.receive'
  | 'supplier.view'
  | 'supplier.manage'
  | 'customer.view'
  | 'customer.manage'
  | 'leads.view'
  | 'leads.manage'
  | 'finance.view'
  | 'finance.manage'
  | 'reports.view'
  | 'reports.export'
  | 'automation.view'
  | 'automation.execute'
  | 'automation.configure'
  | 'business.settings'
  | 'business.branches'
  | 'users.view'
  | 'users.manage'
  | 'audit.view'
  | 'website.view'
  | 'website.manage';

export type Role =
  | 'owner'
  | 'manager'
  | 'cashier'
  | 'stock_controller'
  | 'purchasing'
  | 'accountant'
  | 'marketing'
  | 'administrator';

export const ROLE_PERMISSIONS: Record<Role, Permission[]> = {
  owner: [
    'pos.sell','pos.refund','pos.discount','pos.void','pos.session.open','pos.session.close',
    'stock.view','stock.create','stock.edit','stock.adjust','stock.transfer','stock.delete',
    'purchasing.view','purchasing.create','purchasing.approve','purchasing.receive',
    'supplier.view','supplier.manage',
    'customer.view','customer.manage',
    'leads.view','leads.manage',
    'finance.view','finance.manage',
    'reports.view','reports.export',
    'automation.view','automation.execute','automation.configure',
    'business.settings','business.branches',
    'users.view','users.manage',
    'audit.view',
    'website.view','website.manage',
  ],
  administrator: [
    'pos.sell','pos.refund','pos.discount','pos.void','pos.session.open','pos.session.close',
    'stock.view','stock.create','stock.edit','stock.adjust','stock.transfer','stock.delete',
    'purchasing.view','purchasing.create','purchasing.approve','purchasing.receive',
    'supplier.view','supplier.manage',
    'customer.view','customer.manage',
    'leads.view','leads.manage',
    'finance.view','finance.manage',
    'reports.view','reports.export',
    'automation.view','automation.execute','automation.configure',
    'business.settings','business.branches',
    'users.view','users.manage',
    'audit.view',
    'website.view','website.manage',
  ],
  manager: [
    'pos.sell','pos.refund','pos.discount','pos.void','pos.session.open','pos.session.close',
    'stock.view','stock.create','stock.edit','stock.adjust','stock.transfer',
    'purchasing.view','purchasing.create','purchasing.receive',
    'supplier.view','supplier.manage',
    'customer.view','customer.manage',
    'leads.view','leads.manage',
    'finance.view',
    'reports.view','reports.export',
    'automation.view',
    'audit.view',
  ],
  cashier: [
    'pos.sell','pos.refund','pos.discount','pos.session.open','pos.session.close',
    'stock.view',
    'customer.view','customer.manage',
  ],
  stock_controller: [
    'stock.view','stock.create','stock.edit','stock.adjust','stock.transfer',
    'purchasing.view','purchasing.receive',
    'supplier.view',
    'reports.view',
  ],
  purchasing: [
    'stock.view',
    'purchasing.view','purchasing.create','purchasing.receive',
    'supplier.view','supplier.manage',
    'reports.view',
  ],
  accountant: [
    'finance.view','finance.manage',
    'reports.view','reports.export',
    'purchasing.view',
    'audit.view',
  ],
  marketing: [
    'customer.view','customer.manage',
    'leads.view','leads.manage',
    'reports.view',
    'website.view','website.manage',
  ],
};
