# NEXUS — Module System

> Config file: `src/config/modules.ts`
> Gate component: `src/lib/modules/gate.tsx`

## Plans

| Plan | Module Limit | Target Customer |
|------|-------------|----------------|
| starter | 4 | Small businesses |
| business | 8 | Growing businesses |
| professional | unlimited | Established businesses |
| enterprise | unlimited + AI | Full platform |

## Modules

| ID | Name | Category | Plans |
|----|------|----------|-------|
| pos | Point of Sale | commerce | all |
| inventory | Inventory | operations | all |
| purchasing | Purchasing | operations | all |
| customers | Customers | crm | all |
| leads | Leads & CRM | crm | business+ |
| finance | Finance | finance | business+ |
| employees | Employees | hr | business+ |
| jobs | Jobs & Scheduling | operations | business+ |
| projects | Projects | operations | professional+ |
| documents | Documents | productivity | professional+ |
| website | Website | growth | professional+ |
| analytics | Analytics | intelligence | enterprise |
| ai_assistant | AI Assistant (KDOS) | intelligence | professional+ |

## Dev Mode

In development, `DEV_ENTITLEMENT` enables all modules for `demo-business-001`.

## Module Gate Usage

```tsx
import { ModuleGate } from '@/lib/modules/gate'

<ModuleGate module="leads">
  <LeadsPage />
</ModuleGate>
```

## Adding a New Module

1. Add entry to `NEXUS_MODULES` in `config/modules.ts`
2. Add to `ModuleId` union type
3. Add nav item to `NAV_ITEMS` in `config/app.ts`
4. Create page at `src/app/[module]/page.tsx`
5. Add to `PHASES.md` under relevant phase
6. Update `STATUS.md`
