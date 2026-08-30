import type { Role, Permission } from "@/types/permissions";
import { ROLE_PERMISSIONS } from "@/types/permissions";
import type { OrgContext } from "@/lib/org/context";

export function hasPermission(ctx: OrgContext, permission: Permission): boolean {
  const role = ctx.userRole as Role;
  const rolePerms = ROLE_PERMISSIONS[role] ?? [];
  return rolePerms.includes(permission);
}

export function requirePermission(ctx: OrgContext, permission: Permission): void {
  if (!hasPermission(ctx, permission)) {
    throw new Error(`Forbidden: missing permission "${permission}"`);
  }
}
