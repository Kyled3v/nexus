"use client";

import { createContext, useContext, type ReactNode } from "react";
import type { ModuleEntitlement, ModuleId } from "@/config/modules";
import { isModuleEnabled, DEV_ENTITLEMENT } from "@/config/modules";

const ModuleContext = createContext<ModuleEntitlement>(DEV_ENTITLEMENT);

export function ModuleProvider({
  children,
  entitlement = DEV_ENTITLEMENT,
}: {
  children: ReactNode;
  entitlement?: ModuleEntitlement;
}) {
  return (
    <ModuleContext.Provider value={entitlement}>
      {children}
    </ModuleContext.Provider>
  );
}

export function useModules(): ModuleEntitlement {
  return useContext(ModuleContext);
}

export function useModule(moduleId: ModuleId): boolean {
  const entitlement = useContext(ModuleContext);
  return isModuleEnabled(entitlement, moduleId);
}
