"use client";

import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Zap, CheckCircle, Clock, AlertTriangle, PlayCircle } from "lucide-react";
import { cn } from "@/lib/utils/cn";

type RuleStatus = "active" | "inactive" | "triggered";
type ActionType = "notify" | "recommend" | "require_approval";

interface AutomationRule {
  id: string;
  name: string;
  trigger: string;
  condition: string;
  action: string;
  actionType: ActionType;
  status: RuleStatus;
  lastTriggered?: string;
  triggerCount: number;
}

const DEMO_RULES: AutomationRule[] = [
  { id: "rule-001", name: "Low Stock Alert",          trigger: "inventory.level.changed",     condition: "currentStock <= reorderLevel",        action: "Notify manager and create restock recommendation",  actionType: "recommend",         status: "active",   lastTriggered: "2024-01-13 09:14", triggerCount: 7 },
  { id: "rule-002", name: "Critical Stock Warning",   trigger: "inventory.level.changed",     condition: "currentStock <= minStock",            action: "Urgent alert to owner",                             actionType: "notify",            status: "active",   lastTriggered: "2024-01-13 08:52", triggerCount: 2 },
  { id: "rule-003", name: "Overstock Detection",      trigger: "inventory.level.changed",     condition: "currentStock >= maxStock * 0.9",     action: "Flag product for review",                           actionType: "notify",            status: "active",   lastTriggered: "2024-01-12 14:30", triggerCount: 1 },
  { id: "rule-004", name: "PO Approval Required",     trigger: "purchase.order.created",      condition: "total > 10000",                      action: "Require owner approval before sending",             actionType: "require_approval",  status: "active",   lastTriggered: "2024-01-11 11:00", triggerCount: 3 },
  { id: "rule-005", name: "Inactive Customer Alert",  trigger: "customer.last_purchase",      condition: "daysSinceLastPurchase > 90",         action: "Create customer re-engagement recommendation",      actionType: "recommend",         status: "active",   lastTriggered: "2024-01-10 07:00", triggerCount: 4 },
  { id: "rule-006", name: "Sales Anomaly Detection",  trigger: "sales.daily.summary",         condition: "todaySales < avgDailySales * 0.5",  action: "Alert manager of unusual sales drop",               actionType: "notify",            status: "inactive", triggerCount: 0 },
];

const RECENT_EXECUTIONS = [
  { id: "exec-001", rule: "Low Stock Alert",         result: "Recommendation created for Plascon Exterior 5L",          time: "09:14",  status: "success" },
  { id: "exec-002", rule: "Critical Stock Warning",  result: "Owner notified: Rust-Oleum Primer 1L out of stock",        time: "08:52",  status: "success" },
  { id: "exec-003", rule: "Low Stock Alert",         result: "Recommendation created for Plascon Velvaglo 5L",           time: "08:21",  status: "success" },
  { id: "exec-004", rule: "PO Approval Required",    result: "Approval requested for PO-0004 (R6,500)",                  time: "Yesterday", status: "pending" },
  { id: "exec-005", rule: "Inactive Customer Alert", result: "Re-engagement recommendation for 4 inactive customers",    time: "Yesterday", status: "success" },
];

const ACTION_TYPE_CONFIG: Record<ActionType, { label: string; variant: "default"|"success"|"warning"|"danger"|"muted"|"info" }> = {
  notify:           { label: "Notify",           variant: "info"    },
  recommend:        { label: "Recommend",        variant: "warning" },
  require_approval: { label: "Needs Approval",   variant: "danger"  },
};

export default function AutomationPage() {
  const active = DEMO_RULES.filter(r => r.status === "active").length;
  const totalTriggers = DEMO_RULES.reduce((s, r) => s + r.triggerCount, 0);

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-primary">Automation</h1>
          <p className="text-sm text-secondary mt-0.5">Business rules and automated workflows</p>
        </div>
        <Button size="sm"><Zap size={14} />New Rule</Button>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card padding="sm"><p className="text-xs text-muted uppercase tracking-wider">Total Rules</p><p className="text-2xl font-bold text-primary mt-1">{DEMO_RULES.length}</p></Card>
        <Card padding="sm"><p className="text-xs text-muted uppercase tracking-wider">Active</p><p className="text-2xl font-bold text-green-600 mt-1">{active}</p></Card>
        <Card padding="sm"><p className="text-xs text-muted uppercase tracking-wider">Triggered Today</p><p className="text-2xl font-bold text-primary mt-1">3</p></Card>
        <Card padding="sm"><p className="text-xs text-muted uppercase tracking-wider">Total Executions</p><p className="text-2xl font-bold text-primary mt-1">{totalTriggers}</p></Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card>
          <CardHeader><CardTitle>Automation Rules</CardTitle><Badge variant="muted">{DEMO_RULES.length} rules</Badge></CardHeader>
          <div className="space-y-2">
            {DEMO_RULES.map((rule) => {
              const atCfg = ACTION_TYPE_CONFIG[rule.actionType];
              return (
                <div key={rule.id} className="p-3 rounded-lg border border-base hover:bg-page transition-colors">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className={cn("w-2 h-2 rounded-full mt-1 shrink-0", rule.status === "active" ? "bg-green-500" : "bg-gray-300")} />
                      <p className="text-sm font-medium text-primary">{rule.name}</p>
                    </div>
                    <Badge variant={atCfg.variant}>{atCfg.label}</Badge>
                  </div>
                  <p className="text-xs text-muted mt-1 ml-4">When: {rule.trigger}</p>
                  <p className="text-xs text-muted ml-4">If: {rule.condition}</p>
                  <div className="flex items-center justify-between mt-2 ml-4">
                    <span className="text-xs text-muted">{rule.triggerCount} executions {rule.lastTriggered ? "· Last: " + rule.lastTriggered : ""}</span>
                    <Button variant="ghost" size="sm">{rule.status === "active" ? "Disable" : "Enable"}</Button>
                  </div>
                </div>
              );
            })}
          </div>
        </Card>

        <Card>
          <CardHeader><CardTitle>Recent Executions</CardTitle><Badge variant="muted">last 24h</Badge></CardHeader>
          <div className="space-y-2">
            {RECENT_EXECUTIONS.map((e) => (
              <div key={e.id} className="flex items-start gap-3 p-3 rounded-lg hover:bg-page transition-colors">
                {e.status === "success" ? <CheckCircle size={14} className="text-green-500 shrink-0 mt-0.5" /> : <Clock size={14} className="text-amber-500 shrink-0 mt-0.5" />}
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-primary">{e.rule}</p>
                  <p className="text-xs text-muted mt-0.5 truncate">{e.result}</p>
                </div>
                <span className="text-xs text-muted shrink-0">{e.time}</span>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
