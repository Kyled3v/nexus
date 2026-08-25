-- NEXUS Initial Schema
-- Multi-tenant architecture with Row Level Security
-- All tables scoped to organisation_id

-- Enable UUID generation
create extension if not exists "pgcrypto";

-- ============================================================
-- ORGANISATIONS
-- ============================================================
create table organisations (
  id           uuid primary key default gen_random_uuid(),
  name         text not null,
  trading_name text,
  slug         text not null unique,
  plan         text not null default 'starter' check (plan in ('starter','business','professional','enterprise')),
  status       text not null default 'active' check (status in ('active','suspended','cancelled')),
  settings     jsonb not null default '{}',
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

-- ============================================================
-- BRANCHES
-- ============================================================
create table branches (
  id              uuid primary key default gen_random_uuid(),
  organisation_id uuid not null references organisations(id) on delete cascade,
  name            text not null,
  code            text not null,
  is_head_office  boolean not null default false,
  address         jsonb not null default '{}',
  contact         jsonb not null default '{}',
  status          text not null default 'active' check (status in ('active','inactive')),
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now(),
  unique(organisation_id, code)
);

-- ============================================================
-- MODULE ENTITLEMENTS
-- ============================================================
create table module_entitlements (
  id              uuid primary key default gen_random_uuid(),
  organisation_id uuid not null references organisations(id) on delete cascade unique,
  enabled_modules text[] not null default '{}',
  custom_limits   jsonb not null default '{}',
  licensed_until  timestamptz,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

-- ============================================================
-- USER PROFILES
-- ============================================================
create table user_profiles (
  id              uuid primary key references auth.users(id) on delete cascade,
  organisation_id uuid not null references organisations(id) on delete cascade,
  full_name       text not null,
  email           text not null,
  role            text not null default 'employee',
  branch_id       uuid references branches(id),
  permissions     text[] not null default '{}',
  status          text not null default 'active' check (status in ('active','inactive','suspended')),
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

-- ============================================================
-- CATEGORIES
-- ============================================================
create table categories (
  id              uuid primary key default gen_random_uuid(),
  organisation_id uuid not null references organisations(id) on delete cascade,
  name            text not null,
  code            text not null,
  parent_id       uuid references categories(id),
  description     text,
  status          text not null default 'active',
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now(),
  unique(organisation_id, code)
);

-- ============================================================
-- BRANDS
-- ============================================================
create table brands (
  id              uuid primary key default gen_random_uuid(),
  organisation_id uuid not null references organisations(id) on delete cascade,
  name            text not null,
  description     text,
  status          text not null default 'active',
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

-- ============================================================
-- SUPPLIERS
-- ============================================================
create table suppliers (
  id              uuid primary key default gen_random_uuid(),
  organisation_id uuid not null references organisations(id) on delete cascade,
  name            text not null,
  code            text not null,
  contact_name    text,
  email           text,
  phone           text,
  address         text,
  tax_number      text,
  payment_terms   text,
  lead_time_days  integer not null default 7,
  rating          numeric(3,2),
  status          text not null default 'active',
  notes           text,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now(),
  unique(organisation_id, code)
);

-- ============================================================
-- PRODUCTS
-- ============================================================
create table products (
  id              uuid primary key default gen_random_uuid(),
  organisation_id uuid not null references organisations(id) on delete cascade,
  sku             text not null,
  barcode         text,
  name            text not null,
  description     text,
  category_id     uuid references categories(id),
  brand_id        uuid references brands(id),
  unit            text not null default 'Each',
  cost_price      numeric(12,2) not null default 0,
  selling_price   numeric(12,2) not null default 0,
  tax_rate        numeric(5,2) not null default 15,
  tax_inclusive   boolean not null default true,
  supplier_id     uuid references suppliers(id),
  reorder_level   integer not null default 0,
  target_stock    integer not null default 0,
  min_stock       integer not null default 0,
  max_stock       integer not null default 0,
  status          text not null default 'active' check (status in ('active','inactive','archived')),
  image_url       text,
  attributes      jsonb not null default '{}',
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now(),
  unique(organisation_id, sku)
);

-- ============================================================
-- INVENTORY
-- ============================================================
create table inventory (
  id               uuid primary key default gen_random_uuid(),
  organisation_id  uuid not null references organisations(id) on delete cascade,
  branch_id        uuid not null references branches(id) on delete cascade,
  product_id       uuid not null references products(id) on delete cascade,
  current_stock    integer not null default 0,
  reserved_stock   integer not null default 0,
  available_stock  integer not null generated always as (current_stock - reserved_stock) stored,
  last_movement_at timestamptz not null default now(),
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now(),
  unique(organisation_id, branch_id, product_id)
);

-- ============================================================
-- INVENTORY MOVEMENTS
-- ============================================================
create table inventory_movements (
  id               uuid primary key default gen_random_uuid(),
  organisation_id  uuid not null references organisations(id) on delete cascade,
  branch_id        uuid not null references branches(id),
  product_id       uuid not null references products(id),
  type             text not null,
  quantity         integer not null,
  quantity_before  integer not null,
  quantity_after   integer not null,
  reference_type   text,
  reference_id     uuid,
  notes            text,
  created_by       uuid not null references auth.users(id),
  created_at       timestamptz not null default now()
);

-- ============================================================
-- CUSTOMERS
-- ============================================================
create table customers (
  id                 uuid primary key default gen_random_uuid(),
  organisation_id    uuid not null references organisations(id) on delete cascade,
  name               text not null,
  email              text,
  phone              text,
  address            text,
  tax_number         text,
  status             text not null default 'active' check (status in ('active','inactive','vip','blocked')),
  tags               text[] not null default '{}',
  notes              text,
  total_spend        numeric(12,2) not null default 0,
  transaction_count  integer not null default 0,
  last_purchase_at   timestamptz,
  credit_limit       numeric(12,2),
  outstanding_balance numeric(12,2) not null default 0,
  created_at         timestamptz not null default now(),
  updated_at         timestamptz not null default now()
);

-- ============================================================
-- LEADS
-- ============================================================
create table leads (
  id               uuid primary key default gen_random_uuid(),
  organisation_id  uuid not null references organisations(id) on delete cascade,
  name             text not null,
  company          text,
  email            text,
  phone            text,
  source           text not null,
  stage            text not null default 'new' check (stage in ('new','contacted','qualified','proposal','won','lost')),
  estimated_value  numeric(12,2) not null default 0,
  owner_id         uuid references auth.users(id),
  customer_id      uuid references customers(id),
  notes            text,
  follow_up_at     timestamptz,
  won_at           timestamptz,
  lost_at          timestamptz,
  lost_reason      text,
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now()
);

-- ============================================================
-- TILL SESSIONS
-- ============================================================
create table till_sessions (
  id                uuid primary key default gen_random_uuid(),
  organisation_id   uuid not null references organisations(id) on delete cascade,
  branch_id         uuid not null references branches(id),
  till_id           text not null,
  cashier_id        uuid not null references auth.users(id),
  opened_at         timestamptz not null default now(),
  closed_at         timestamptz,
  opening_float     numeric(12,2) not null default 0,
  closing_float     numeric(12,2),
  expected_float    numeric(12,2),
  variance          numeric(12,2),
  total_sales       numeric(12,2) not null default 0,
  total_refunds     numeric(12,2) not null default 0,
  transaction_count integer not null default 0,
  status            text not null default 'open' check (status in ('open','closed'))
);

-- ============================================================
-- SALES
-- ============================================================
create table sales (
  id               uuid primary key default gen_random_uuid(),
  organisation_id  uuid not null references organisations(id) on delete cascade,
  branch_id        uuid not null references branches(id),
  till_id          text not null,
  session_id       uuid references till_sessions(id),
  sale_number      text not null,
  customer_id      uuid references customers(id),
  cashier_id       uuid not null references auth.users(id),
  status           text not null default 'pending' check (status in ('pending','completed','voided','refunded','partial_refund')),
  subtotal         numeric(12,2) not null default 0,
  tax_amount       numeric(12,2) not null default 0,
  discount_amount  numeric(12,2) not null default 0,
  total            numeric(12,2) not null default 0,
  notes            text,
  completed_at     timestamptz,
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now(),
  unique(organisation_id, sale_number)
);

-- ============================================================
-- SALE ITEMS
-- ============================================================
create table sale_items (
  id               uuid primary key default gen_random_uuid(),
  sale_id          uuid not null references sales(id) on delete cascade,
  product_id       uuid not null references products(id),
  sku              text not null,
  name             text not null,
  quantity         integer not null,
  unit_price       numeric(12,2) not null,
  cost_price       numeric(12,2) not null,
  tax_rate         numeric(5,2) not null,
  tax_amount       numeric(12,2) not null,
  discount_percent numeric(5,2) not null default 0,
  discount_amount  numeric(12,2) not null default 0,
  line_total       numeric(12,2) not null
);

-- ============================================================
-- PURCHASE ORDERS
-- ============================================================
create table purchase_orders (
  id              uuid primary key default gen_random_uuid(),
  organisation_id uuid not null references organisations(id) on delete cascade,
  branch_id       uuid not null references branches(id),
  supplier_id     uuid not null references suppliers(id),
  supplier_name   text not null,
  po_number       text not null,
  status          text not null default 'draft' check (status in ('draft','pending','approved','sent','partial','received','cancelled')),
  subtotal        numeric(12,2) not null default 0,
  tax_amount      numeric(12,2) not null default 0,
  total           numeric(12,2) not null default 0,
  notes           text,
  expected_at     timestamptz,
  received_at     timestamptz,
  approved_by     uuid references auth.users(id),
  approved_at     timestamptz,
  sent_at         timestamptz,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now(),
  unique(organisation_id, po_number)
);

-- ============================================================
-- PURCHASE ORDER ITEMS
-- ============================================================
create table purchase_order_items (
  id                uuid primary key default gen_random_uuid(),
  purchase_order_id uuid not null references purchase_orders(id) on delete cascade,
  product_id        uuid not null references products(id),
  sku               text not null,
  name              text not null,
  quantity          integer not null,
  unit_cost         numeric(12,2) not null,
  tax_rate          numeric(5,2) not null default 15,
  line_total        numeric(12,2) not null,
  quantity_received integer not null default 0
);

-- ============================================================
-- AUTOMATION RULES
-- ============================================================
create table automation_rules (
  id               uuid primary key default gen_random_uuid(),
  organisation_id  uuid not null references organisations(id) on delete cascade,
  name             text not null,
  description      text,
  trigger_event    text not null,
  conditions       jsonb not null default '[]',
  actions          jsonb not null default '[]',
  status           text not null default 'active' check (status in ('active','inactive','paused')),
  requires_approval boolean not null default false,
  last_triggered_at timestamptz,
  trigger_count    integer not null default 0,
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now()
);

-- ============================================================
-- AUTOMATION EXECUTIONS
-- ============================================================
create table automation_executions (
  id              uuid primary key default gen_random_uuid(),
  organisation_id uuid not null references organisations(id) on delete cascade,
  rule_id         uuid not null references automation_rules(id),
  rule_name       text not null,
  trigger_event   text not null,
  trigger_data    jsonb not null default '{}',
  status          text not null default 'pending' check (status in ('pending','running','completed','failed','cancelled','awaiting_approval')),
  result          text,
  error           text,
  approved_by     uuid references auth.users(id),
  approved_at     timestamptz,
  completed_at    timestamptz,
  created_at      timestamptz not null default now()
);

-- ============================================================
-- AUDIT LOGS
-- ============================================================
create table audit_logs (
  id              uuid primary key default gen_random_uuid(),
  organisation_id uuid not null references organisations(id) on delete cascade,
  branch_id       uuid references branches(id),
  user_id         uuid not null references auth.users(id),
  user_role       text not null,
  action          text not null,
  entity_type     text not null,
  entity_id       uuid not null,
  description     text not null,
  before_state    jsonb,
  after_state     jsonb,
  source          text not null default 'user' check (source in ('user','automation','system')),
  automation_rule_id uuid references automation_rules(id),
  created_at      timestamptz not null default now()
);

-- ============================================================
-- NOTIFICATIONS
-- ============================================================
create table notifications (
  id              uuid primary key default gen_random_uuid(),
  organisation_id uuid not null references organisations(id) on delete cascade,
  user_id         uuid references auth.users(id),
  type            text not null check (type in ('info','warning','danger','success')),
  category        text not null,
  title           text not null,
  message         text not null,
  read            boolean not null default false,
  action_url      text,
  action_label    text,
  source_type     text check (source_type in ('automation','system','user')),
  source_id       uuid,
  expires_at      timestamptz,
  created_at      timestamptz not null default now()
);

-- ============================================================
-- UPDATED_AT TRIGGER
-- ============================================================
create or replace function update_updated_at()
returns trigger language plpgsql as _write.py
begin
  new.updated_at = now();
  return new;
end;
_write.py;

create trigger update_organisations_updated_at before update on organisations for each row execute function update_updated_at();
create trigger update_branches_updated_at before update on branches for each row execute function update_updated_at();
create trigger update_products_updated_at before update on products for each row execute function update_updated_at();
create trigger update_inventory_updated_at before update on inventory for each row execute function update_updated_at();
create trigger update_customers_updated_at before update on customers for each row execute function update_updated_at();
create trigger update_leads_updated_at before update on leads for each row execute function update_updated_at();
create trigger update_sales_updated_at before update on sales for each row execute function update_updated_at();
create trigger update_purchase_orders_updated_at before update on purchase_orders for each row execute function update_updated_at();
create trigger update_automation_rules_updated_at before update on automation_rules for each row execute function update_updated_at();
create trigger update_user_profiles_updated_at before update on user_profiles for each row execute function update_updated_at();
create trigger update_module_entitlements_updated_at before update on module_entitlements for each row execute function update_updated_at();
