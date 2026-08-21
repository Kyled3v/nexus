import { ROLE_PERMISSIONS } from '@/types/permissions';
import type { Role, Permission } from '@/types/permissions';
import type { ID } from '@/types/core';

export interface DevUser {
  id: ID;
  name: string;
  email: string;
  role: Role;
  businessId: ID;
  branchId: ID;
}

export const DEV_USERS: Record<Role, DevUser> = {
  owner: {
    id: 'dev-user-owner',
    name: 'Kyle (Owner)',
    email: 'owner@kyledev.co.za',
    role: 'owner',
    businessId: 'demo-business-001',
    branchId: 'demo-branch-main',
  },
  manager: {
    id: 'dev-user-manager',
    name: 'Alex (Manager)',
    email: 'manager@kyledev.co.za',
    role: 'manager',
    businessId: 'demo-business-001',
    branchId: 'demo-branch-main',
  },
  cashier: {
    id: 'dev-user-cashier',
    name: 'Sam (Cashier)',
    email: 'cashier@kyledev.co.za',
    role: 'cashier',
    businessId: 'demo-business-001',
    branchId: 'demo-branch-main',
  },
  stock_controller: {
    id: 'dev-user-stock',
    name: 'Jordan (Stock)',
    email: 'stock@kyledev.co.za',
    role: 'stock_controller',
    businessId: 'demo-business-001',
    branchId: 'demo-branch-main',
  },
  purchasing: {
    id: 'dev-user-purchasing',
    name: 'Morgan (Purchasing)',
    email: 'purchasing@kyledev.co.za',
    role: 'purchasing',
    businessId: 'demo-business-001',
    branchId: 'demo-branch-main',
  },
  accountant: {
    id: 'dev-user-accountant',
    name: 'Riley (Accountant)',
    email: 'accountant@kyledev.co.za',
    role: 'accountant',
    businessId: 'demo-business-001',
    branchId: 'demo-branch-main',
  },
  marketing: {
    id: 'dev-user-marketing',
    name: 'Casey (Marketing)',
    email: 'marketing@kyledev.co.za',
    role: 'marketing',
    businessId: 'demo-business-001',
    branchId: 'demo-branch-main',
  },
  administrator: {
    id: 'dev-user-admin',
    name: 'Admin',
    email: 'admin@kyledev.co.za',
    role: 'administrator',
    businessId: 'demo-business-001',
    branchId: 'demo-branch-main',
  },
};

let _currentRole: Role = 'owner';

export function currentUser(): DevUser {
  return DEV_USERS[_currentRole];
}

export function currentBusiness(): { id: ID; name: string } {
  return { id: 'demo-business-001', name: 'KyleDev Commerce Demo' };
}

export function currentBranch(): { id: ID; name: string } {
  return { id: 'demo-branch-main', name: 'Main Branch' };
}

export function hasPermission(permission: Permission): boolean {
  const user = currentUser();
  const perms = ROLE_PERMISSIONS[user.role] as Permission[];
  return perms.includes(permission);
}

export function requirePermission(permission: Permission): void {
  if (!hasPermission(permission)) {
    throw new Error(
      'Permission denied: ' + permission + '. Current role: ' + currentUser().role
    );
  }
}

export function _devSwitchRole(role: Role): void {
  if (process.env.NEXT_PUBLIC_DEV_MODE !== 'true') {
    throw new Error('Role switching is only available in development mode.');
  }
  _currentRole = role;
}
