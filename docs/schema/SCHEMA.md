# NEXUS — Database Schema

> All tables live on Neon PostgreSQL.
> ORM: Drizzle. Schema file: `src/lib/db/schema.ts`

## Tables

### organisations
Core business entity. Every piece of business data is scoped to an org.

| Column | Type | Notes |
|--------|------|-------|
| id | uuid PK | |
| name | text | Legal name |
| tradingName | text | Display name |
| slug | text UNIQUE | URL slug |
| plan | text | starter / business / professional / enterprise |
| status | text | active / inactive / archived |
| logoUrl | text | PNG logo (mandatory on registration) |
| settings | jsonb | Arbitrary org config |

### branches
Physical locations / tills within an org.

| Column | Type | Notes |
|--------|------|-------|
| id | uuid PK | |
| organisationId | uuid FK → organisations | |
| name | text | |
| code | text | Short identifier |
| isHeadOffice | boolean | |
| address | jsonb | |
| contact | jsonb | |
| status | text | |

### user / session / account / verification
Better Auth managed tables. Do not modify directly.

### userProfiles
Links a Better Auth user to an organisation with a role.
One row per user per org — enables multi-business membership.

| Column | Type | Notes |
|--------|------|-------|
| id | uuid PK | |
| userId | text FK → user | |
| organisationId | uuid FK → organisations | |
| role | text | owner / manager / cashier / etc. |
| branchId | uuid FK → branches | Optional branch lock |
| permissions | text[] | Custom permission overrides |
| status | text | |

### moduleEntitlements
Which modules an org has access to.

| Column | Type | Notes |
|--------|------|-------|
| organisationId | uuid UNIQUE FK | One row per org |
| enabledModules | text[] | Array of module IDs |
| customLimits | jsonb | Per-module overrides |
| licensedUntil | timestamp | |

### products
Org-scoped product catalogue.

| Column | Type | Notes |
|--------|------|-------|
| organisationId | uuid FK | |
| sku | text | |
| barcode | text | |
| name | text | |
| costPrice | numeric(12,2) | |
| sellingPrice | numeric(12,2) | |
| taxRate | numeric(5,2) | Default 15% |
| taxInclusive | boolean | |
| reorderLevel / targetStock / minStock / maxStock | integer | |
| attributes | jsonb | Flexible product attributes |

### inventory
Stock levels per product per branch.

| Column | Type | Notes |
|--------|------|-------|
| organisationId | uuid FK | |
| branchId | uuid FK | |
| productId | uuid FK | |
| currentStock | integer | |
| reservedStock | integer | |

### customers
| Column | Type | Notes |
|--------|------|-------|
| organisationId | uuid FK | |
| name / email / phone / address | text | |
| taxNumber | text | VAT number |
| totalSpend | numeric | Running total |
| creditLimit / outstandingBalance | numeric | |

### leads
CRM pipeline entries.

| Column | Type | Notes |
|--------|------|-------|
| organisationId | uuid FK | |
| stage | text | new / contacted / qualified / proposal / won / lost |
| estimatedValue | numeric | |
| ownerId | text | userId of assigned rep |

### sales
POS transactions.

| Column | Type | Notes |
|--------|------|-------|
| organisationId + branchId | uuid FK | |
| tillId | text | |
| saleNumber | text | |
| cashierId | text | userId |
| subtotal / taxAmount / discountAmount / total | numeric | |

### auditLogs
Immutable event log. Never update or delete rows.

### notifications
Per-user, per-org notification inbox.

## Missing Tables (to be added)

- [ ] `sale_items` — line items for each sale
- [ ] `purchase_orders` — supplier orders
- [ ] `purchase_order_items`
- [ ] `suppliers`
- [ ] `categories`
- [ ] `stock_movements` — inventory audit trail
- [ ] `workflows` — automation rules
- [ ] `workflow_executions`
- [ ] `messages` — internal business messaging
- [ ] `onboarding_progress` — business setup wizard state
- [ ] `industry_templates` — configurable industry presets
