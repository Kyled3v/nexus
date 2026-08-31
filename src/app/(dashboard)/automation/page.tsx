"use client";
import { useState } from "react";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { Plus, Play, CheckCircle2, Bot, Zap } from "lucide-react";

type RuleStatus = "active" | "inactive";
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

const INITIAL_RULES: AutomationRule[] = [
  { id: "r-001", name: "Low Stock Alert",         trigger: "inventory.level.changed", condition: "currentStock <= reorderLevel",       action: "Notify manager and create restock recommendation", actionType: "recommend",        status: "active",   lastTriggered: "2024-01-13 09:14", triggerCount: 7 },
  { id: "r-002", name: "Critical Stock Warning",  trigger: "inventory.level.changed", condition: "currentStock <= minStock",           action: "Urgent alert to owner",                           actionType: "notify",           status: "active",   lastTriggered: "2024-01-13 08:52", triggerCount: 2 },
  { id: "r-003", name: "Overstock Detection",     trigger: "inventory.level.changed", condition: "currentStock >= maxStock * 0.9",    action: "Flag product for review",                         actionType: "notify",           status: "active",   lastTriggered: "2024-01-12 14:30", triggerCount: 1 },
  { id: "r-004", name: "PO Approval Required",    trigger: "purchase.order.created",  condition: "total > 10000",                     action: "Require owner approval before sending",           actionType: "require_approval", status: "active",   lastTriggered: "2024-01-11 11:00", triggerCount: 3 },
  { id: "r-005", name: "Inactive Customer Alert", trigger: "customer.last_purchase",  condition: "daysSinceLastPurchase > 90",        action: "Create re-engagement recommendation",             actionType: "recommend",        status: "active",   lastTriggered: "2024-01-10 07:00", triggerCount: 4 },
  { id: "r-006", name: "Sales Anomaly Detection", trigger: "sales.daily.summary",     condition: "todaySales < avgDailySales * 0.5", action: "Alert manager of unusual sales drop",             actionType: "notify",           status: "inactive", triggerCount: 0 },
];

const INITIAL_EXECUTIONS = [
  { id: "e-001", rule: "Low Stock Alert",        result: "Recommendation created for Plascon Exterior 5L",       time: "09:14",     status: "success" },
  { id: "e-002", rule: "Critical Stock Warning", result: "Owner notified: Rust-Oleum Primer 1L out of stock",    time: "08:52",     status: "success" },
  { id: "e-003", rule: "Low Stock Alert",        result: "Recommendation created for Plascon Velvaglo 5L",       time: "08:21",     status: "success" },
  { id: "e-004", rule: "PO Approval Required",   result: "Approval requested for PO-0004 (R6,500)",             time: "Yesterday", status: "pending" },
  { id: "e-005", rule: "Inactive Customer Alert",result: "Re-engagement recommendation for 4 inactive customers",time: "Yesterday", status: "success" },
];

const ACTION_VARIANT: Record<ActionType, "default"|"success"|"warning"|"danger"|"muted"|"info"> = {
  notify: "info",
  recommend: "warning",
  require_approval: "danger",
};

export default function AutomationPage() {
  const [rules, setRules] = useState<AutomationRule[]>(INITIAL_RULES);
  const [executions, setExecutions] = useState(INITIAL_EXECUTIONS);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Form State
  const [formName, setFormName] = useState("");
  const [formTrigger, setFormTrigger] = useState("inventory.level.changed");
  const [formCondition, setFormCondition] = useState("currentStock < 10");
  const [formAction, setFormAction] = useState("Alert store manager and create restock order");
  const [formActionType, setFormActionType] = useState<ActionType>("recommend");

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleToggleRule = (id: string) => {
    setRules(prev => prev.map(r => {
      if (r.id === id) {
        const nextStatus: RuleStatus = r.status === "active" ? "inactive" : "active";
        showToast(`Rule "${r.name}" set to ${nextStatus.toUpperCase()}`);
        return { ...r, status: nextStatus };
      }
      return r;
    }));
  };

  const handleAddRule = (e: React.FormEvent) => {
    e.preventDefault();
    const newRule: AutomationRule = {
      id: "r-" + Date.now(),
      name: formName,
      trigger: formTrigger,
      condition: formCondition,
      action: formAction,
      actionType: formActionType,
      status: "active",
      triggerCount: 0,
    };
    setRules(prev => [newRule, ...prev]);
    setIsAddOpen(false);
    showToast(`Rule "${newRule.name}" created and activated`);
  };

  const handleTestRun = (rule: AutomationRule) => {
    const newExec = {
      id: `exec-${executions.length + 1}-${rule.id}`,
      rule: rule.name,
      result: `Test execution triggered: ${rule.action}`,
      time: "Just now",
      status: "success",
    };
    setExecutions(prev => [newExec, ...prev]);
    setRules(prev => prev.map(r => r.id === rule.id ? { ...r, triggerCount: r.triggerCount + 1, lastTriggered: "Just now" } : r));
    showToast(`Executed test run for "${rule.name}"`);
  };

  return (
    <div className="page">
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2 bg-[#1a2332] border border-emerald-500/30 text-emerald-400 px-4 py-3 rounded-lg shadow-xl animate-in slide-in-from-bottom-3 duration-200">
          <CheckCircle2 size={16} />
          <span className="text-sm font-medium">{toastMessage}</span>
        </div>
      )}

      <header className="page-header">
        <div className="page-header__text">
          <h1 className="page-header__title">KDOS Automation Engine</h1>
          <p className="page-header__sub">Business triggers, automated workflows, and event listeners</p>
        </div>
        <Button size="sm" onClick={() => setIsAddOpen(true)}>
          <Plus size={14} />New Rule
        </Button>
      </header>

      <dl className="summary-stats">
        <div className="summary-stats__item"><dt>Total Rules</dt><dd>{rules.length}</dd></div>
        <div className="summary-stats__item"><dt>Active Workflows</dt><dd className="text-emerald-400 font-bold">{rules.filter(r => r.status === "active").length}</dd></div>
        <div className="summary-stats__item"><dt>Triggered Today</dt><dd>3</dd></div>
        <div className="summary-stats__item"><dt>Total Executions</dt><dd>{rules.reduce((s, r) => s + r.triggerCount, 0)}</dd></div>
      </dl>

      <div className="automation-panels">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between w-full">
              <div className="flex items-center gap-2">
                <Bot size={16} className="text-cyan-400" />
                <CardTitle>Autonomous Rules</CardTitle>
              </div>
              <Badge variant="muted">{rules.length} configured</Badge>
            </div>
          </CardHeader>
          <ul className="rule-list">
            {rules.map((rule) => (
              <li key={rule.id} className="rule-list__item" data-status={rule.status}>
                <header className="rule-list__header">
                  <span className="rule-list__status-indicator" aria-label={rule.status} data-status={rule.status} />
                  <strong className="rule-list__name">{rule.name}</strong>
                  <Badge variant={ACTION_VARIANT[rule.actionType]}>{rule.actionType.replace("_", " ")}</Badge>
                </header>
                <dl className="rule-list__meta">
                  <div><dt>Trigger</dt><dd><code>{rule.trigger}</code></dd></div>
                  <div><dt>Condition</dt><dd><code>{rule.condition}</code></dd></div>
                  <div><dt>Action</dt><dd>{rule.action}</dd></div>
                  <div><dt>Telemetry</dt><dd>{rule.triggerCount} runs {rule.lastTriggered && " · Last: " + rule.lastTriggered}</dd></div>
                </dl>
                <div className="flex items-center gap-2">
                  <Button variant="ghost" size="sm" onClick={() => handleTestRun(rule)}>
                    <Play size={12} className="mr-1" />Test
                  </Button>
                  <Button
                    variant={rule.status === "active" ? "ghost" : "secondary"}
                    size="sm"
                    onClick={() => handleToggleRule(rule.id)}
                  >
                    {rule.status === "active" ? "Disable" : "Enable"}
                  </Button>
                </div>
              </li>
            ))}
          </ul>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between w-full">
              <div className="flex items-center gap-2">
                <Zap size={16} className="text-amber-400" />
                <CardTitle>Execution Log</CardTitle>
              </div>
              <Badge variant="muted">Live Stream</Badge>
            </div>
          </CardHeader>
          <ul className="execution-list">
            {executions.map((e) => (
              <li key={e.id} className="execution-list__item" data-status={e.status}>
                <div className="execution-list__body">
                  <strong className="text-white">{e.rule}</strong>
                  <p className="text-white/70">{e.result}</p>
                </div>
                <div className="flex items-center gap-2">
                  <time className="text-xs text-white/40">{e.time}</time>
                  <Badge variant={e.status === "success" ? "success" : "warning"}>{e.status}</Badge>
                </div>
              </li>
            ))}
          </ul>
        </Card>
      </div>

      {/* New Rule Modal */}
      <Modal
        isOpen={isAddOpen}
        onClose={() => setIsAddOpen(false)}
        title="Create Automation Rule"
        description="Configure an event-driven workflow for KDOS"
      >
        <form onSubmit={handleAddRule} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-white/70 mb-1">Rule Name *</label>
            <input
              required
              type="text"
              value={formName}
              onChange={e => setFormName(e.target.value)}
              placeholder="e.g. VIP Customer Purchase Notice"
              className="w-full bg-[#161c24] border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:border-cyan-500 focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-white/70 mb-1">Event Trigger</label>
              <select
                value={formTrigger}
                onChange={e => setFormTrigger(e.target.value)}
                className="w-full bg-[#161c24] border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:border-cyan-500 focus:outline-none"
              >
                <option value="inventory.level.changed">inventory.level.changed</option>
                <option value="sales.sale.completed">sales.sale.completed</option>
                <option value="purchase.order.created">purchase.order.created</option>
                <option value="customer.last_purchase">customer.last_purchase</option>
                <option value="lead.stage.changed">lead.stage.changed</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-white/70 mb-1">Action Type</label>
              <select
                value={formActionType}
                onChange={e => setFormActionType(e.target.value as ActionType)}
                className="w-full bg-[#161c24] border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:border-cyan-500 focus:outline-none"
              >
                <option value="notify">Notify (Push / Email)</option>
                <option value="recommend">KDOS Recommendation</option>
                <option value="require_approval">Require Manager Approval</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-white/70 mb-1">Evaluation Condition (Expression)</label>
            <input
              required
              type="text"
              value={formCondition}
              onChange={e => setFormCondition(e.target.value)}
              placeholder="e.g. sale.total > 5000"
              className="w-full bg-[#161c24] border border-white/10 rounded-lg px-3 py-2 text-sm text-white font-mono focus:border-cyan-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-white/70 mb-1">Executed Action</label>
            <input
              required
              type="text"
              value={formAction}
              onChange={e => setFormAction(e.target.value)}
              placeholder="e.g. Dispatch WhatsApp thank you message"
              className="w-full bg-[#161c24] border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:border-cyan-500 focus:outline-none"
            />
          </div>

          <div className="flex justify-end gap-2 pt-4 border-t border-white/10">
            <Button type="button" variant="ghost" onClick={() => setIsAddOpen(false)}>Cancel</Button>
            <Button type="submit">Activate Rule</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
