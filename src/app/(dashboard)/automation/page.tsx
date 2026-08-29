"use client";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

type RuleStatus = "active" | "inactive";
type ActionType = "notify" | "recommend" | "require_approval";

interface AutomationRule {
  id: string; name: string; trigger: string; condition: string;
  action: string; actionType: ActionType; status: RuleStatus;
  lastTriggered?: string; triggerCount: number;
}

const RULES: AutomationRule[] = [
  { id: "r-001", name: "Low Stock Alert",         trigger: "inventory.level.changed", condition: "currentStock <= reorderLevel",       action: "Notify manager and create restock recommendation", actionType: "recommend",        status: "active",   lastTriggered: "2024-01-13 09:14", triggerCount: 7 },
  { id: "r-002", name: "Critical Stock Warning",  trigger: "inventory.level.changed", condition: "currentStock <= minStock",           action: "Urgent alert to owner",                           actionType: "notify",           status: "active",   lastTriggered: "2024-01-13 08:52", triggerCount: 2 },
  { id: "r-003", name: "Overstock Detection",     trigger: "inventory.level.changed", condition: "currentStock >= maxStock * 0.9",    action: "Flag product for review",                         actionType: "notify",           status: "active",   lastTriggered: "2024-01-12 14:30", triggerCount: 1 },
  { id: "r-004", name: "PO Approval Required",    trigger: "purchase.order.created",  condition: "total > 10000",                     action: "Require owner approval before sending",           actionType: "require_approval", status: "active",   lastTriggered: "2024-01-11 11:00", triggerCount: 3 },
  { id: "r-005", name: "Inactive Customer Alert", trigger: "customer.last_purchase",  condition: "daysSinceLastPurchase > 90",        action: "Create re-engagement recommendation",             actionType: "recommend",        status: "active",   lastTriggered: "2024-01-10 07:00", triggerCount: 4 },
  { id: "r-006", name: "Sales Anomaly Detection", trigger: "sales.daily.summary",     condition: "todaySales < avgDailySales * 0.5", action: "Alert manager of unusual sales drop",             actionType: "notify",           status: "inactive", triggerCount: 0 },
];

const EXECUTIONS = [
  { id: "e-001", rule: "Low Stock Alert",        result: "Recommendation created for Plascon Exterior 5L",       time: "09:14",     status: "success" },
  { id: "e-002", rule: "Critical Stock Warning", result: "Owner notified: Rust-Oleum Primer 1L out of stock",    time: "08:52",     status: "success" },
  { id: "e-003", rule: "Low Stock Alert",        result: "Recommendation created for Plascon Velvaglo 5L",       time: "08:21",     status: "success" },
  { id: "e-004", rule: "PO Approval Required",   result: "Approval requested for PO-0004 (R6,500)",             time: "Yesterday", status: "pending" },
  { id: "e-005", rule: "Inactive Customer Alert",result: "Re-engagement recommendation for 4 inactive customers",time: "Yesterday", status: "success" },
];

const ACTION_VARIANT: Record<ActionType, "default"|"success"|"warning"|"danger"|"muted"|"info"> = {
  notify: "info", recommend: "warning", require_approval: "danger",
};

export default function AutomationPage() {
  return (
    <div className="page">
      <header className="page-header">
        <div className="page-header__text">
          <h1 className="page-header__title">Automation</h1>
          <p className="page-header__sub">Business rules and automated workflows</p>
        </div>
        <Button size="sm">New Rule</Button>
      </header>

      <dl className="summary-stats">
        <div className="summary-stats__item"><dt>Total Rules</dt><dd>{RULES.length}</dd></div>
        <div className="summary-stats__item"><dt>Active</dt><dd>{RULES.filter(r => r.status === "active").length}</dd></div>
        <div className="summary-stats__item"><dt>Triggered Today</dt><dd>3</dd></div>
        <div className="summary-stats__item"><dt>Total Executions</dt><dd>{RULES.reduce((s, r) => s + r.triggerCount, 0)}</dd></div>
      </dl>

      <div className="automation-panels">
        <Card>
          <CardHeader><CardTitle>Automation Rules</CardTitle><Badge variant="muted">{RULES.length} rules</Badge></CardHeader>
          <ul className="rule-list">
            {RULES.map((rule) => (
              <li key={rule.id} className="rule-list__item" data-status={rule.status}>
                <header className="rule-list__header">
                  <span className="rule-list__status-indicator" aria-label={rule.status} data-status={rule.status} />
                  <strong className="rule-list__name">{rule.name}</strong>
                  <Badge variant={ACTION_VARIANT[rule.actionType]}>{rule.actionType.replace("_", " ")}</Badge>
                </header>
                <dl className="rule-list__meta">
                  <div><dt>When</dt><dd><code>{rule.trigger}</code></dd></div>
                  <div><dt>If</dt><dd><code>{rule.condition}</code></dd></div>
                  <div><dt>Then</dt><dd>{rule.action}</dd></div>
                  <div><dt>Executions</dt><dd>{rule.triggerCount}{rule.lastTriggered && " · Last: " + rule.lastTriggered}</dd></div>
                </dl>
                <Button variant="ghost" size="sm">{rule.status === "active" ? "Disable" : "Enable"}</Button>
              </li>
            ))}
          </ul>
        </Card>

        <Card>
          <CardHeader><CardTitle>Recent Executions</CardTitle><Badge variant="muted">last 24h</Badge></CardHeader>
          <ul className="execution-list">
            {EXECUTIONS.map((e) => (
              <li key={e.id} className="execution-list__item" data-status={e.status}>
                <div className="execution-list__body">
                  <strong>{e.rule}</strong>
                  <p>{e.result}</p>
                </div>
                <time>{e.time}</time>
                <Badge variant={e.status === "success" ? "success" : "warning"}>{e.status}</Badge>
              </li>
            ))}
          </ul>
        </Card>
      </div>
    </div>
  );
}
