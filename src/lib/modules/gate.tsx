"use client";

import type { ReactNode } from "react";
import type { ModuleId } from "@/config/modules";
import { useModule } from "./context";

interface ModuleGateProps {
  module: ModuleId;
  children: ReactNode;
  fallback?: ReactNode;
}

// Renders children only when the module is enabled for the current organisation.
// Use this to wrap any feature that requires a specific module.
export function ModuleGate({ module, children, fallback = null }: ModuleGateProps) {
  const enabled = useModule(module);
  if (!enabled) return <>{fallback}</>;
  return <>{children}</>;
}

// Server-side module check — use in server components and route handlers
export function checkModule(entitlement: { enabledModules: string[] }, moduleId: ModuleId): boolean {
  return entitlement.enabledModules.includes(moduleId);
}
