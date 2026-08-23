// NEXUS Internal Event Bus
// Decouples business operations from automation rules and KDOS integration.
// All important business events should be published here.

export type NexusEventType =
  | "sale.completed"
  | "sale.refunded"
  | "sale.voided"
  | "inventory.adjusted"
  | "inventory.low"
  | "inventory.critical"
  | "inventory.stockout"
  | "inventory.overstock"
  | "inventory.received"
  | "purchase.order.created"
  | "purchase.order.approved"
  | "purchase.order.received"
  | "customer.created"
  | "customer.updated"
  | "lead.created"
  | "lead.stage.changed"
  | "lead.won"
  | "automation.triggered"
  | "automation.executed";

export interface NexusEvent<T = Record<string, unknown>> {
  id: string;
  type: NexusEventType;
  businessId: string;
  branchId?: string;
  userId?: string;
  timestamp: string;
  data: T;
}

type EventHandler<T = Record<string, unknown>> = (event: NexusEvent<T>) => void | Promise<void>;

class EventBus {
  private handlers = new Map<NexusEventType, EventHandler[]>();

  on<T = Record<string, unknown>>(type: NexusEventType, handler: EventHandler<T>): void {
    const existing = this.handlers.get(type) ?? [];
    this.handlers.set(type, [...existing, handler as EventHandler]);
  }

  off(type: NexusEventType, handler: EventHandler): void {
    const existing = this.handlers.get(type) ?? [];
    this.handlers.set(type, existing.filter(h => h !== handler));
  }

  async publish<T = Record<string, unknown>>(event: Omit<NexusEvent<T>, "id" | "timestamp">): Promise<void> {
    const fullEvent: NexusEvent<T> = {
      ...event,
      id: "evt-" + Date.now() + "-" + Math.random().toString(36).slice(2, 8),
      timestamp: new Date().toISOString(),
    };

    if (process.env.NEXT_PUBLIC_DEV_MODE === "true") {
      console.debug("[EventBus]", fullEvent.type, fullEvent.data);
    }

    const handlers = this.handlers.get(event.type) ?? [];
    await Promise.allSettled(handlers.map(h => h(fullEvent as NexusEvent)));
  }
}

// Singleton event bus instance
export const nexusEventBus = new EventBus();
